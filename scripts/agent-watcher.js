require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT; // Personal Access Token
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("❌ ERREUR: Variables d'environnement manquantes (.env.local)");
    console.error("Assurez-vous d'avoir AIRTABLE_PAT et AIRTABLE_BASE_ID.");
    process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const POLL_INTERVAL_MS = 10000; // Check every 10 seconds

console.log("=== IMMOSYNC DESKTOP AGENT (WATCHER) ===");
console.log("🟢 En attente de commandes de publication...");
console.log(`📡 Connecté à la base: ${AIRTABLE_BASE_ID}`);

async function checkQueue() {
    try {
        // 1. Find Annonces marked as "À Publier" (We will add a status field logic or check checkboxes)
        // Logic: Checkbox "Publier_Facebook_Requested" is TRUE AND "Publié_Facebook" is FALSE/Empty.
        // For simplicity in this MVP, let's look for records where we manually triggered a "Request" flag.
        // Or assume the API toggles a "Status_Publication" field to "Pending".

        // Let's use a filter: Find annonces where 'Statut_Publication' = 'En attente'
        // We need to add this field to Airtable or use existing ones.
        // Let's use the explicit checkboxes concept from before but driven by a "Command".

        // Simpler: We'll create a view or filter in code.
        const records = await base('Annonces_IA').select({
            filterByFormula: "AND({Facebook_Request} = 1, {Publié_Facebook} != 1)",
            maxRecords: 1 // Process one by one
        }).firstPage();

        if (records.length > 0) {
            const annonce = records[0];
            console.log(`⚡ Commande reçue pour l'annonce: ${annonce.fields.Titre_Généré}`);

            await processPublication(annonce);
        }

    } catch (error) {
        console.error("Erreur de surveillance:", error);
    }
}

async function processPublication(annonceRecord) {
    const annonceId = annonceRecord.id;
    const annonce = annonceRecord.fields;

    console.log(`🔒 Verrouillage de la commande ${annonceId} pour éviter les doublons...`);
    try {
        // SAFETY FIRST: We uncheck the request flag IMMEDIATELY so other loops don't pick it up
        // We also set a temporary status if you like, but unchecking is enough to stop the loop.
        await base('Annonces_IA').update(annonceId, {
            'Facebook_Request': false
            // 'Statut_Publication': 'En cours...' // REMOVED: Field does not exist in user's Airtable
        });
    } catch (lockError) {
        console.error("❌ Impossible de verrouiller la commande Airtable. Abandon.", lockError);
        return;
    }

    // 1. Get Linked Bien details
    if (!annonce.Bien || annonce.Bien.length === 0) {
        console.error("❌ Annonce sans Bien lié.");
        return;
    }
    const bienId = annonce.Bien[0];
    const bienRecord = await base('Biens_Immo').find(bienId);
    const bien = bienRecord.fields;

    console.log(`📦 Préparation des données pour le Bien: ${bien.Type_Bien} à ${bien.Ville}`);

    // 2. Locate Photos Locally
    // The Agent assumes photos are synchronised or available in public/uploads
    // In a real Desktop App, we would download them from URL if they are not local.
    // For this Hybrid MVP (Local Server + Local Agent), they are in the same folder.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const photos = [];
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        files.forEach(file => {
            // Look for bien-{ID}-...
            if (file.startsWith(`bien-${bienId}-`)) {
                photos.push(path.join(uploadDir, file));
            }
        });
    }

    if (photos.length === 0) {
        console.warn("⚠️ Aucune photo locale trouvée (bien-" + bienId + "). Publication sans photo ?");
    }

    // 3. Create Payload File
    const payload = {
        title: annonce.Titre_Généré,
        description: annonce.Description_Générée,
        price: bien.Prix,
        city: bien.Ville,
        type: bien.Type_Bien,
        photos: photos
    };

    const payloadPath = path.join(process.cwd(), 'temp', `task-${annonceId}.json`);
    if (!fs.existsSync(path.dirname(payloadPath))) fs.mkdirSync(path.dirname(payloadPath), { recursive: true });
    fs.writeFileSync(payloadPath, JSON.stringify(payload));

    // 4. Execute Publisher Script
    console.log("🚀 Lancement du Robot Facebook...");

    // Mark as "Processing" to avoid double pickup?
    // In a loop, we just wait for exec to finish.

    const scriptPath = path.join(__dirname, 'publish-facebook.js');

    await new Promise((resolve) => {
        exec(`node "${scriptPath}" "${payloadPath}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Échec Publication: ${error.message}`);
                // Optional: Write error to Airtable
            } else {
                console.log(`✅ Succès ! Retour du robot:\n${stdout}`);

                // 5. Update Airtable: Mark as DONE
                try {
                    await base('Annonces_IA').update(annonceId, {
                        'Publié_Facebook': true,
                        'Facebook_Request': false // Unflag request
                    });
                    console.log("💾 Statut mis à jour dans Airtable.");
                } catch (updErr) {
                    console.error("Erreur mise à jour Airtable:", updErr);
                }
            }
            resolve();
        });
    });
}

// Start Polling Loop
setInterval(checkQueue, POLL_INTERVAL_MS);
checkQueue(); // First run immediately
