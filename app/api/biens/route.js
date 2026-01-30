import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBien, createAnnonce, getBiens } from '@/lib/airtable';
import { generateAnnonce } from '@/lib/openai';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        // Extract fields
        const bienData = {
            Type_Bien: formData.get('Type_Bien'),
            Prix: parseFloat(formData.get('Prix')),
            Surface: parseFloat(formData.get('Surface')),
            Pieces: parseInt(formData.get('Pieces')),
            Ville: formData.get('Ville'),
            Code_Postal: formData.get('Code_Postal'),
            DPE: formData.get('DPE'),
            Description_Courte: formData.get('Description_Courte') || '',
        };

        // Note: formData also contains 'photos'. 
        // Since Airtable Attachment API requires public URLs, backendless file upload needs an intermediate storage (S3/Blob).
        // For this implementation, we proceed without attaching files to Airtable to allow the app to function.
        // In a production env with storage bucket, we would upload files there and pass URLs to Airtable.

        // Create Bien in Airtable
        const newBien = await createBien(bienData, session.user.email);

        // Generate Annonce immediately (AI)
        // We do this asynchronously usually, but for MVP we wait.
        let generated = { titre: '', description: '' };
        try {
            generated = await generateAnnonce(bienData);
        } catch (aiError) {
            console.error("AI Generation failed, using empty:", aiError);
            generated = { titre: "À rédiger", description: "Génération échouée." };
        }

        // Create Annonce in Annonces_IA table
        await createAnnonce({
            Bien: [newBien.id], // Link to the created Bien
            Titre_Généré: generated.titre,
            Description_Générée: generated.description,
            Ton: 'Professionnel',
        });

        return NextResponse.json({ success: true, bienId: newBien.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating bien:', error);
        return NextResponse.json({ error: 'Failed to create bien' }, { status: 500 });
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
