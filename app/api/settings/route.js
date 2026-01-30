import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import base from '@/lib/airtable';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { facebook, lbc, seloger, bienici } = await req.json();

        // Find User Record
        const records = await base('Users').select({
            filterByFormula: `{Email} = '${session.user.email}'`,
            maxRecords: 1
        }).firstPage();

        if (records.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const userId = records[0].id;

        // Update Airtable
        await base('Users').update(userId, {
            "Facebook_Page_ID": facebook?.pageId || '',
            "Facebook_Access_Token": facebook?.token || '',
            "LBC_Login": lbc?.login || '',
            "LBC_Password": lbc?.password || '',
            "SeLoger_Login": seloger?.login || '',
            "SeLoger_Password": seloger?.password || '',
            "BienIci_Login": bienici?.login || '',
            "BienIci_Password": bienici?.password || ''
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
