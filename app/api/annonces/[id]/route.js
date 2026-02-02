import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteAnnonce, updateAnnonce, getAnnonceById, getBienById, updateBien } from '@/lib/airtable';

export async function GET(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const annonce = await getAnnonceById(id);
        if (!annonce) return NextResponse.json({ error: 'Annonce not found' }, { status: 404 });

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

        // Update Annonce Text
        const annonceUpdatePromise = updateAnnonce(id, {
            Titre_Généré: body.titre,
            Description_Générée: body.description
        });

        // Update Linked Bien Data (if provided)
        let bienUpdatePromise = Promise.resolve();
        if (body.bienId && (body.prix || body.surface || body.pieces || body.ville)) {
            bienUpdatePromise = updateBien(body.bienId, {
                Prix: body.prix ? parseFloat(body.prix) : undefined,
                Surface: body.surface ? parseFloat(body.surface) : undefined,
                Pieces: body.pieces ? parseInt(body.pieces) : undefined,
                Ville: body.ville,
                Code_Postal: body.codePostal,
                DPE: body.dpe
            });
        }

        await Promise.all([annonceUpdatePromise, bienUpdatePromise]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
