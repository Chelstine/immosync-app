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

        // Initialize update fields
        const updateFields = {};

        // Facebook
        if (platforms.facebook) {
            console.log("Queueing Facebook publication...");
            updateFields['Facebook_Request'] = true;
            updateFields['Publié_Facebook'] = false; // Reset status
        }

        // Le Bon Coin
        if (platforms.lbc) {
            console.log("Queueing LeBonCoin publication...");
            updateFields['LBC_Request'] = true;
            updateFields['Publié_LBC'] = false;
        }

        // SeLoger
        if (platforms.seloger) {
            console.log("Queueing SeLoger publication...");
            updateFields['SeLoger_Request'] = true;
            updateFields['Publié_SeLoger'] = false;
        }

        // Bien'ici
        if (platforms.bienici) {
            console.log("Queueing BienIci publication...");
            updateFields['BienIci_Request'] = true;
            updateFields['Publié_BienIci'] = false;
        }

        // Update Airtable to trigger the Watcher Agent
        if (Object.keys(updateFields).length > 0) {
            await base('Annonces_IA').update(annonceId, updateFields);
            return NextResponse.json({ success: true, message: 'Publication mise en file d\'attente. L\'agent va traiter la demande.' });
        } else {
            return NextResponse.json({ success: false, message: 'Aucune plateforme sélectionnée.' });
        }

    } catch (error) {
        console.error('Publication error:', error);
        return NextResponse.json({ error: error.message || 'Publication failed' }, { status: 500 });
    }
}
