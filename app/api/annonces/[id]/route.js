import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnnonceById, getBienById } from '@/lib/airtable';

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    try {
        const annonce = await getAnnonceById(id);
        if (!annonce) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Check ownership via linked Bien
        if (!annonce.Bien || annonce.Bien.length === 0) {
            return NextResponse.json({ error: 'Bien lié introuvable' }, { status: 500 });
        }

        const bienId = annonce.Bien[0];
        const bien = await getBienById(bienId);

        if (!bien || bien.Email_Agent !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Return combined data
        return NextResponse.json({ ...annonce, bienDetails: bien });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
    }
}
