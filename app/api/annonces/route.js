import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnnonces } from '@/lib/airtable';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const annonces = await getAnnonces(session.user.email);
        return NextResponse.json(annonces);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch annonces' }, { status: 500 });
    }
}
