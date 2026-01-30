import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBien, createAnnonce } from '@/lib/airtable';
import { generateAnnonce } from '@/lib/openai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();

        // Handle photo uploads locally
        const photos = formData.getAll('photos');
        let photoRecords = [];

        if (photos.length > 0) {
            console.log(`Processing ${photos.length} photos locally...`);
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            for (const photo of photos) {
                if (photo instanceof File) {
                    const buffer = Buffer.from(await photo.arrayBuffer());
                    // Clean filename and make unique
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = path.extname(photo.name) || '.jpg';
                    const filename = `photo - ${uniqueSuffix}${ext} `;
                    const filepath = path.join(uploadDir, filename);

                    await writeFile(filepath, buffer);

                    // The URL accessible by the browser (local)
                    // Note: This URL is ONLY valid for the local browser.
                    photoRecords.push({ url: `/ uploads / ${filename} ` });
                }
            }
            console.log(`Successfully uploaded ${photoRecords.length} photos locally.`);
        }

        const bienData = {
            Type_Bien: formData.get('Type_Bien'),
            Prix: formData.get('Prix'),
            Surface: formData.get('Surface'),
            Pieces: formData.get('Pieces'),
            Ville: formData.get('Ville'),
            Code_Postal: formData.get('Code_Postal'),
            DPE: formData.get('DPE'),
            Ton: formData.get('Ton') || 'Professionnel',
            Description_Courte: formData.get('Description_Courte') || '',
            // Pass local photos (won't sync to Airtable attachments but might be stored as text if field allows)
            Photos: photoRecords
        };

        // Create Bien in Airtable
        const newBien = await createBien(bienData, session.user.email);

        // Generate Annonce immediately (AI)
        let generated = { titre: '', description: '' };
        try {
            console.log("Starting AI Generation...");
            generated = await generateAnnonce(bienData);
            console.log("AI Generation Successful");
        } catch (aiError) {
            console.error("AI Generation failed:", aiError);
            generated = { titre: "À rédiger (Erreur IA)", description: "La génération automatique a échoué. Veuillez rédiger l'annonce manuellement." };
        }

        // Create Annonce in Annonces_IA table
        await createAnnonce({
            Bien: [newBien.id], // Link to the created Bien
            Titre_Généré: generated.titre,
            Description_Générée: generated.description,
            Ton: bienData.Ton,
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
        const biens = await getBiens(session.user.email);
        return NextResponse.json(biens);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch biens' }, { status: 500 });
    }
}
