import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBien, createAnnonce } from '@/lib/airtable';
import { generateAnnonce } from '@/lib/openai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
    console.log("POST /api/biens hit");
    const session = await getServerSession(authOptions);
    if (!session) {
        console.log("Unauthorized attempt");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        console.log("FormData received, keys:", Array.from(formData.keys()));

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
                    const filename = `photo-${uniqueSuffix}${ext}`;
                    const filepath = path.join(uploadDir, filename);

                    await writeFile(filepath, buffer);

                    photoRecords.push({ url: `/uploads/${filename}` });
                }
            }
            console.log(`Successfully uploaded ${photoRecords.length} photos locally.`);
        }

        // Separate "Ton" from the data sent to "Biens_Immo" table
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
        };

        // Create Bien in Airtable
        const newBien = await createBien(bienData, session.user.email);
        console.log("Bien created in Airtable:", newBien.id);

        // RENAME PHOTOS TO MATCH BIEN ID for persistence
        // We do this so the Publisher Bot can find them later without Airtable storage
        if (photoRecords.length > 0) {
            try {
                const fs = require('fs'); // standard fs for rename
                const { rename } = require('fs/promises');

                // We need to map the old paths (from photoRecords) to new paths
                // photoRecords contains [{ url: '/uploads/photo-123.jpg' }]
                const publicDir = path.join(process.cwd(), 'public');

                for (let i = 0; i < photoRecords.length; i++) {
                    const oldRelPath = photoRecords[i].url; // /uploads/photo...
                    const oldFullPath = path.join(publicDir, oldRelPath); // c:\...\public\uploads\photo...

                    const ext = path.extname(oldRelPath);
                    const newFilename = `bien-${newBien.id}-${i}${ext}`;
                    const newFullPath = path.join(publicDir, 'uploads', newFilename);

                    if (fs.existsSync(oldFullPath)) {
                        await rename(oldFullPath, newFullPath);
                        console.log(`Renamed photo to: ${newFilename}`);
                    }
                }
            } catch (err) {
                console.error("Error renaming photos:", err);
                // Continue execution, don't block
            }
        }

        // Generate Annonce immediately (AI)
        let generated = { titre: '', description: '' };
        try {
            console.log("Starting AI Generation...");
            generated = await generateAnnonce({ ...bienData, Ton: ton });
            console.log("AI Generation Successful. Titre:", generated.titre);
        } catch (aiError) {
            console.error("AI Generation failed:", aiError);
            generated = { titre: "À rédiger (Erreur IA)", description: "La génération automatique a échoué. Veuillez rédiger l'annonce manuellement." };
        }

        // Create Annonce in Annonces_IA table
        await createAnnonce({
            Bien: [newBien.id], // Link to the created Bien
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
        const biens = await getBiens(session.user.email);
        return NextResponse.json(biens);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch biens' }, { status: 500 });
    }
}
