import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBien, createAnnonce } from '@/lib/airtable';
import { generateAnnonce } from '@/lib/openai';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
    console.log("POST /api/biens hit");
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();

        // Handle photo uploads (Cloudinary)
        const photos = formData.getAll('photos');
        let photoRecords = []; // Will contain { url: 'https://res.cloudinary.com/...' }

        if (photos.length > 0) {
            console.log(`Uploading ${photos.length} photos to Cloudinary...`);

            for (const photo of photos) {
                if (photo instanceof File) {
                    const buffer = Buffer.from(await photo.arrayBuffer());

                    // Upload to Cloudinary using stream
                    const uploadResult = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "immosync_biens" },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(buffer);
                    });

                    console.log("Uploaded:", uploadResult.secure_url);
                    photoRecords.push({ url: uploadResult.secure_url });
                }
            }
        }

        const ton = formData.get('Ton') || 'Professionnel';
        const bienData = {
            Type_Bien: formData.get('Type_Bien'),
            Prix: formData.get('Prix'),
            Surface: formData.get('Surface'),
            Pieces: formData.get('Pieces'),
            Ville: formData.get('Ville'),
            Code_Postal: formData.get('Code_Postal'),
            DPE: formData.get('DPE'),
            Description_Courte: formData.get('Description_Courte') || '',
            // Photos (Airtable expects array of objects with url)
            Photos: photoRecords
        };

        // Create Bien in Airtable
        const newBien = await createBien(bienData, session.user.email);
        console.log("Bien created in Airtable:", newBien.id);

        // Generate Annonce immediately (AI)
        let generated = { titre: '', description: '' };
        try {
            console.log("Starting AI Generation...");
            generated = await generateAnnonce({ ...bienData, Ton: ton });
        } catch (aiError) {
            console.error("AI Generation failed, switching to Smart Fallback:", aiError);

            const titreFallback = `${bienData.Type_Bien} ${bienData.Pieces} p. - ${bienData.Ville}`;
            const descFallback = `À VENDRE - ${bienData.Ville} (${bienData.Code_Postal})\n\n` +
                `Type : ${bienData.Type_Bien}\nSurface : ${bienData.Surface} m²\nPièces : ${bienData.Pieces}\n` +
                `Prix : ${bienData.Prix} €\nDPE : ${bienData.DPE}\n\n` +
                `${bienData.Description_Courte ? bienData.Description_Courte + '\n\n' : ''}` +
                `Contactez-nous pour plus d'infos.`;

            generated = { titre: titreFallback, description: descFallback };
        }

        // Create Annonce in Annonces_IA table
        await createAnnonce({
            Bien: [newBien.id],
            Titre_Généré: generated.titre,
            Description_Générée: generated.description,
            Ton: ton,
        });

        return NextResponse.json({ success: true, bienId: newBien.id }, { status: 201 });
    } catch (error) {
        console.error('CRITICAL Error creating bien:', error);
        return NextResponse.json({ error: 'Failed to create bien: ' + error.message }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { getBiens } = require('@/lib/airtable'); // Lazy import
        const biens = await getBiens(session.user.email);
        return NextResponse.json(biens);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch biens' }, { status: 500 });
    }
}
