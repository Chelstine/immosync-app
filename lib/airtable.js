import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);

export default base;

// --- USERS ---

export async function getUserByEmail(email) {
    try {
        const records = await base('Users').select({
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1,
        }).firstPage();

        if (records.length === 0) return null;

        return {
            id: records[0].id,
            ...records[0].fields
        };
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
}

export async function createUser({ email, password, name }) {
    try {
        const records = await base('Users').create([
            {
                fields: {
                    Email: email,
                    Password: password, // Hashed
                    Name: name,
                },
            },
        ]);
        return {
            id: records[0].id,
            ...records[0].fields
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// --- BIENS ---

export async function getBiens(email) {
    try {
        const records = await base('Biens_Immo').select({
            filterByFormula: `{Email_Agent} = '${email}'`,
            // sort: [{ field: 'Created', direction: 'desc' }] // Removed as field might not exist
        }).all();

        return records.map(record => ({
            id: record.id,
            ...record.fields
        }));
    } catch (error) {
        console.error('Error fetching biens:', error);
        return [];
    }
}

export async function createBien(data, email) {
    try {
        const fields = {
            ...data,
            Email_Agent: email,
            Statut: 'Nouveau'
        };

        const records = await base('Biens_Immo').create([{ fields }], { typecast: true });
        return {
            id: records[0].id,
            ...records[0].fields
        };
    } catch (error) {
        console.error('Error creating bien:', error);
        throw error;
    }
}

export async function getBienById(id) {
    try {
        const record = await base('Biens_Immo').find(id);
        return {
            id: record.id,
            ...record.fields
        };
    } catch (error) {
        console.error('Error fetching bien by id:', error);
        return null;
    }
}

// --- ANNONCES ---

export async function getAnnonces(email) {
    try {
        // 1. Get user's properties first
        const biens = await getBiens(email);
        const bienIds = new Set(biens.map(b => b.id));

        if (bienIds.size === 0) return [];

        // 2. Fetch all annonces and filter in memory
        // This avoids needing a specific Lookup field in Airtable Schema
        const records = await base('Annonces_IA').select().all();

        const filtered = records
            .map(record => ({
                id: record.id,
                ...record.fields
            }))
            .filter(annonce => annonce.Bien && annonce.Bien.some(id => bienIds.has(id)));

        return filtered;
    } catch (error) {
        console.error('Error fetching annonces:', error);
        return [];
    }
}

export async function createAnnonce(data) {
    try {
        console.log("Creating Annonce in Airtable with data:", JSON.stringify(data));
        const records = await base('Annonces_IA').create([{ fields: data }], { typecast: true });
        console.log("Annonce created successfully:", records[0].id);
        return {
            id: records[0].id,
            ...records[0].fields
        };
    } catch (error) {
        console.error('Error creating annonce:', error);
        throw error;
    }
}

export async function getAnnonceById(id) {
    try {
        const record = await base('Annonces_IA').find(id);
        return {
            id: record.id,
            ...record.fields
        };
    } catch (error) {
        console.error('Error fetching annonce by id:', error);
        return null;
    }
}

export async function deleteAnnonce(id) {
    try {
        await base('Annonces_IA').destroy(id);
        return true;
    } catch (error) {
        console.error('Error deleting annonce:', error);
        throw error;
    }
}

export async function updateAnnonce(id, data) {
    try {
        const records = await base('Annonces_IA').update([{ id, fields: data }], { typecast: true });
        return {
            id: records[0].id,
            ...records[0].fields
        };
    } catch (error) {
        console.error('Error updating annonce:', error);
        throw error;
    }
}
