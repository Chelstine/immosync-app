const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const Airtable = require('airtable');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

// Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);

// Constants
const POLL_INTERVAL_MS = 10000; // Check every 10 seconds

console.log("🕵️  Agent de Surveillance Démarré...");
console.log("En attente de demandes de publication (Statut: 'Pending')...");

// Track processed records to prevent infinite loops
const processedRecords = new Set();

async function checkQueue() {
    try {
        // Find records where (Facebook_Request=TRUE AND Publié_Facebook!=TRUE) OR (LBC_Request=TRUE AND Copié_LBC!=TRUE)
        // Airtable formula: OR(AND({Facebook_Request}, NOT({Publié_Facebook})), AND({LBC_Request}, NOT({Copié_LBC})))
        const filterFormula = "OR(AND({Facebook_Request}, NOT({Publié_Facebook})), AND({LBC_Request}, NOT({Copié_LBC})))";

        const records = await base('Annonces_IA').select({
            filterByFormula: filterFormula,
            maxRecords: 5 // Get a few to find one not already processed
        }).firstPage();

        // Find first record not already being processed
        const record = records.find(r => !processedRecords.has(r.id));

        if (record) {
            processedRecords.add(record.id);
            console.log(`📝 Ajout de ${record.id} à la liste de traitement...`);
            await processAnnonce(record);
        }
    } catch (error) {
        console.error("Erreur polling:", error);
    }
}

async function processAnnonce(record) {
    const annonce = record.fields;
    const annonceId = record.id;
    console.log(`\n🔔 Nouvelle demande détectée: ${annonce.Titre_Généré}`);

    // 1. Fetch Related Bien Data
    if (!annonce.Bien || annonce.Bien.length === 0) {
        console.error("❌ Erreur: Pas de bien lié à cette annonce.");
        return;
    }
    const bienId = annonce.Bien[0];
    const userEmail = annonce.Email_User ? annonce.Email_User[0] : null;

    // Fetch Bien details from 'Biens_Immo' table
    let bien;
    try {
        const bienRecord = await base('Biens_Immo').find(bienId);
        bien = bienRecord.fields;
    } catch (err) {
        console.error("❌ Erreur récupération Bien:", err);
        return;
    }

    console.log(`📦 Préparation des données pour le Bien: ${bien.Type_Bien} à ${bien.Ville}`);

    // 2. DOWNLOAD PHOTOS (Cloud Compatibility Upgrade) ☁️ -> 💻
    const photos = [];

    // Check if Annonce has photos in Airtable (Photo_Bien is in Annonces_IA, not Biens_Immo)
    if (annonce.Photo_Bien && annonce.Photo_Bien.length > 0) {
        const downloadDir = path.join(process.cwd(), 'temp', `downloads`, `bien-${bienId}`);
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

        console.log(`⬇️ Téléchargement de ${annonce.Photo_Bien.length} photos depuis le Cloud...`);

        // Helper to download a single file
        const downloadFile = (url, dest) => {
            return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(dest);
                https.get(url, (response) => {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close(resolve);
                    });
                }).on('error', (err) => {
                    fs.unlink(dest, () => { }); // Delete failed file
                    reject(err);
                });
            });
        };

        // Download all photos sequentially
        for (let i = 0; i < annonce.Photo_Bien.length; i++) {
            const photoData = annonce.Photo_Bien[i];
            const ext = path.extname(photoData.filename) || '.jpg';
            const destPath = path.join(downloadDir, `photo-${i}${ext}`);

            try {
                await downloadFile(photoData.url, destPath);
                photos.push(destPath);
            } catch (err) {
                console.error(`❌ Erreur téléchargement photo ${i}:`, err.message);
            }
        }
        console.log(`\n✅ ${photos.length} photos téléchargées localement.`);
    } else {
        console.warn("⚠️ Aucune photo trouvée dans la fiche Airtable de l'Annonce.");
    }

    // 3. Create Payload File
    const payload = {
        title: annonce.Titre_Généré,
        description: annonce.Description_Générée,
        price: bien.Prix,
        city: bien.Ville,
        type: bien.Type_Bien,
        surface: bien.Surface,   // Added for LBC
        pieces: bien.Pieces,     // Added for LBC
        photos: photos
    };

    const payloadPath = path.join(process.cwd(), 'temp', `task-${annonceId}.json`);
    if (!fs.existsSync(path.dirname(payloadPath))) fs.mkdirSync(path.dirname(payloadPath), { recursive: true });
    fs.writeFileSync(payloadPath, JSON.stringify(payload));

    // 4. PUBLICATION SEQUENCE (MULTI-PLATFORM) 🚀

    // --- FACEBOOK ---
    if (annonce.Facebook_Request && !annonce.Publié_Facebook) {
        console.log("🔵 Lancement du Robot Facebook...");
        const fbScript = path.join(__dirname, 'publish-facebook.js');

        await new Promise(resolve => {
            exec(`node "${fbScript}" "${payloadPath}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Échec FB (Voir logs)`);
                    console.error(stderr);
                    // ALWAYS clear request to prevent infinite loop
                    try {
                        await base('Annonces_IA').update(annonceId, { 'Facebook_Request': false });
                        console.log("⚠️ Facebook_Request désactivé pour éviter boucle infinie.");
                    } catch (e) { console.error("Err clearing FB request", e); }
                } else {
                    console.log(`✅ Succès FB !`);
                    try {
                        await base('Annonces_IA').update(annonceId, { 'Publié_Facebook': true, 'Facebook_Request': false });
                    } catch (e) { console.error("Err Update Airtable FB", e); }
                }
                resolve();
            });
        });
    }

    // --- LEBONCOIN ---
    if (annonce.LBC_Request && !annonce.Copié_LBC) {
        console.log("🟧 Lancement du Robot LeBonCoin...");
        const lbcScript = path.join(__dirname, 'publish-leboncoin.js');

        await new Promise(resolve => {
            exec(`node "${lbcScript}" "${payloadPath}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Échec LBC (Voir logs)`);
                    console.error(stderr);
                    // ALWAYS clear request to prevent infinite loop
                    try {
                        await base('Annonces_IA').update(annonceId, { 'LBC_Request': false });
                        console.log("⚠️ LBC_Request désactivé pour éviter boucle infinie.");
                    } catch (e) { console.error("Err clearing LBC request", e); }
                } else {
                    console.log(`✅ Succès LBC !`);
                    try {
                        await base('Annonces_IA').update(annonceId, { 'Copié_LBC': true, 'LBC_Request': false });
                    } catch (e) { console.error("Err Update Airtable LBC", e); }
                }
                resolve();
            });
        });
    }

    console.log(`🏁 Fin du traitement pour l'annonce ${annonceId}. En attente de nouvelles tâches...`);

    // Cleanup photos (Optional: keep them if needed for debug)
    // try { fs.rmSync(path.dirname(payloadPath), { recursive: true, force: true }); } catch(e) {}
}

// Start Polling Loop
setInterval(checkQueue, POLL_INTERVAL_MS);
checkQueue(); // First run immediately
