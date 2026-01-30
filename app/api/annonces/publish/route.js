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

        if (!annonce.Bien || annonce.Bien.length === 0) return NextResponse.json({ error: 'Bien linked not found' }, { status: 404 });
        const bien = await getBienById(annonce.Bien[0]);

        if (bien.Email_Agent !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Publication Logic
        // We fetch user credentials once.
        const userRecords = await base('Users').select({
            filterByFormula: `{Email} = '${session.user.email}'`,
            maxRecords: 1
        }).firstPage();

        if (userRecords.length === 0) return NextResponse.json({ error: 'User settings not found' }, { status: 404 });
        const user = userRecords[0].fields;

        // Facebook
        if (platforms.facebook) {
            const pageId = user.Facebook_Page_ID;
            const accessToken = user.Facebook_Access_Token;

            if (pageId && accessToken) {
                await publishToFacebook(annonce, pageId, accessToken);
                await base('Annonces_IA').update(annonceId, { 'Publié_Facebook': true });
            }
        }

        // Le Bon Coin (Logic Placeholder for Worker)
        if (platforms.lbc) {
            if (user.LBC_Login && user.LBC_Password) {
                // Trigger Worker here. For now, mark as published to simulate success.
                await base('Annonces_IA').update(annonceId, { 'Publié_LBC': true });
            }
        }

        // SeLoger
        if (platforms.seloger) {
            if (user.SeLoger_Login) {
                await base('Annonces_IA').update(annonceId, { 'Publié_SeLoger': true });
            }
        }

        // Bien'ici
        if (platforms.bienici) {
            if (user.BienIci_Login) {
                await base('Annonces_IA').update(annonceId, { 'Publié_BienIci': true });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Publication error:', error);
        return NextResponse.json({ error: error.message || 'Publication failed' }, { status: 500 });
    }
}
