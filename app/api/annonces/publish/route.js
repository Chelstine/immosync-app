import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnnonceById, getAnnonces, getBienById } from '@/lib/airtable';
import { publishToFacebook } from '@/lib/facebook';
import base from '@/lib/airtable';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { annonceId, platforms } = await req.json();

        // 1. Fetch Annonce & Check Ownership
        const annonce = await getAnnonceById(annonceId);
        if (!annonce) return NextResponse.json({ error: 'Annonce not found' }, { status: 404 });

        // Check ownership via Bien
        // Need to fetch Bien to check email
        if (!annonce.Bien || annonce.Bien.length === 0) return NextResponse.json({ error: 'Bien linked not found' }, { status: 404 });
        const bien = await getBienById(annonce.Bien[0]);

        if (bien.Email_Agent !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Publish to Facebook
        if (platforms.facebook) {
            // Fetch credentials from User record
            // We need to fetch the User record from Airtable to get tokens
            const userRecords = await base('Users').select({
                filterByFormula: `{Email} = '${session.user.email}'`,
                maxRecords: 1
            }).firstPage();

            if (userRecords.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const user = userRecords[0].fields;
            const pageId = user.Facebook_Page_ID;
            const accessToken = user.Facebook_Access_Token;

            if (!pageId || !accessToken) {
                return NextResponse.json({ error: 'Facebook not configured. Please add Page ID and Token in Settings.' }, { status: 400 });
            }

            await publishToFacebook(annonce, pageId, accessToken);

            // Update Airtable status
            await base('Annonces_IA').update(annonceId, {
                'Publié_Facebook': true
            });
        }

        // Other platforms (mocked)
        if (platforms.seloger) {
            // Mock success
            await base('Annonces_IA').update(annonceId, {
                'Publié_SeLoger': true
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Publication error:', error);
        return NextResponse.json({ error: error.message || 'Publication failed' }, { status: 500 });
    }
}
