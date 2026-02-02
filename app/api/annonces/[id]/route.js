import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteAnnonce, updateAnnonce, getAnnonceById, getBienById } from '@/lib/airtable';

export async function GET(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const annonce = await getAnnonceById(id);

        if (!annonce) {
            return NextResponse.json({ error: 'Annonce not found' }, { status: 404 });
        }

        // Fetch visible details of the linked Bien (if any)
        // Airtable returns array of IDs for linked records
        let bienDetails = {};
        if (annonce.Bien && annonce.Bien.length > 0) {
            bienDetails = await getBienById(annonce.Bien[0]);
        }

        return NextResponse.json({ ...annonce, bienDetails });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await deleteAnnonce(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const updated = await updateAnnonce(id, {
            Titre_Généré: body.titre,
            Description_Générée: body.description
        });
        return NextResponse.json({ success: true, annonce: updated });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
