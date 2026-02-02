require('dotenv').config({ path: '../.env.local' });
const Airtable = require('airtable');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

// Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);

// Constants
const POLL_INTERVAL_MS = 10000; // Check every 10 seconds

console.log("🕵️  Agent de Surveillance Démarré...");
console.log("En attente de demandes de publication (Statut: 'Pending')...");

async function checkQueue() {
    try {
        // Find records where (Facebook_Request=TRUE AND Publié_Facebook!=TRUE) OR (LBC_Request=TRUE AND Publié_LBC!=TRUE)
        // Airtable formula: OR(AND({Facebook_Request}, NOT({Publié_Facebook})), AND({LBC_Request}, NOT({Publié_LBC})))
        const filterFormula = "OR(AND({Facebook_Request}, NOT({Publié_Facebook})), AND({LBC_Request}, NOT({Publié_LBC})))";

        const records = await base('Annonces_IA').select({
            filterByFormula: filterFormula,
            maxRecords: 1 // Process one by one
        }).firstPage();

        if (records.length > 0) {
            const record = records[0];
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

    // Check if Bien has photos in Airtable
    if (bien.Photo_Bien && bien.Photo_Bien.length > 0) {
        const downloadDir = path.join(process.cwd(), 'temp', `downloads`, `bien-${bienId}`);
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

        console.log(`⬇️ Téléchargement de ${bien.Photo_Bien.length} photos depuis le Cloud...`);

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
        for (let i = 0; i < bien.Photo_Bien.length; i++) {
            const photoData = bien.Photo_Bien[i];
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
        console.warn("⚠️ Aucune photo trouvée dans la fiche Airtable du Bien.");
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
    if (annonce.LBC_Request && !annonce.Publié_LBC) {
        console.log("🟧 Lancement du Robot LeBonCoin...");
        const lbcScript = path.join(__dirname, 'publish-leboncoin.js');

        await new Promise(resolve => {
            exec(`node "${lbcScript}" "${payloadPath}"`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Échec LBC (Voir logs)`);
                    console.error(stderr);
                } else {
                    console.log(`✅ Succès LBC !`);
                    try {
                        await base('Annonces_IA').update(annonceId, { 'Publié_LBC': true, 'LBC_Request': false });
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
