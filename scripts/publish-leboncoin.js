const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 1. Load Payload
const payloadPath = process.argv[2];
if (!payloadPath) {
    console.error("❌ Usage: node publish-leboncoin.js <path-to-payload.json>");
    process.exit(1);
}
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

(async () => {
    console.log(`🚀 [LeBonCoin] Démarrage publication: "${payload.title}"`);

    const sessionPath = path.join(__dirname, '..', 'leboncoin-session.json');
    if (!fs.existsSync(sessionPath)) {
        console.error("❌ Session LeBonCoin introuvable. Lancez d'abord le script de connexion.");
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: false, channel: 'chrome', args: ['--start-maximized'] });
    const context = await browser.newContext({ storageState: sessionPath, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        // --- STEP 1: START ---
        console.log("👉 Accès page de dépôt...");
        await page.goto('https://www.leboncoin.fr/deposer-une-annonce', { waitUntil: 'domcontentloaded' });

        // Handle "C'est parti" or cookie banners if any
        try { await page.getByRole('button', { name: 'Continuer sans accepter' }).click({ timeout: 2000 }); } catch (e) { }

        // --- STEP 2: TITLE ---
        console.log("✍️ Titre...");
        await page.getByLabel('Titre de l’annonce').fill(payload.title);
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 3: CATEGORY ---
        console.log("📂 Catégorie...");
        // Search "Ventes immobilières"
        // Sometimes it asks "Quel est l'objet ?" search box
        try {
            await page.getByLabel('Rechercher une catégorie').fill('Ventes immobilières');
            await page.getByText('Ventes immobilières', { exact: true }).first().click();
        } catch (e) {
            // Fallback manual click navigation if search fails
            await page.getByText('Immobilier').click();
            await page.getByText('Ventes immobilières').click();
        }

        // --- STEP 4: TYPE DE BIEN & DETAILS ---
        console.log("Details Immobilier...");
        await page.waitForTimeout(1000);

        // Type de bien (Maison / Appartement)
        const type = payload.type ? payload.type.toLowerCase() : '';
        if (type.includes('maison')) await page.getByText('Maison', { exact: true }).click();
        else if (type.includes('appart')) await page.getByText('Appartement', { exact: true }).click();
        else if (type.includes('terrain')) await page.getByText('Terrain', { exact: true }).click();
        else await page.getByText('Autre', { exact: true }).click();

        // Surface (Mandatory)
        if (payload.surface) await page.getByLabel('Surface habitable').fill(payload.surface.toString());

        // Pieces (Mandatory)
        if (payload.pieces) await page.getByLabel('Nombre de pièces').fill(payload.pieces.toString());

        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 5: DPE / GES (Tricky part) ---
        console.log("⚡ DPE / GES...");
        // DPE (A to G or Vierge)
        // If we don't know, put 'Vierge' or 'Non soumis'
        try {
            // Try to select 'Non soumis' or a default like 'D' if failing
            await page.getByText('Non soumis').click({ timeout: 2000 });
        } catch (e) {
            // If 'Non soumis' not found, pick 'D' safe bet? Or try to map payload.DPE
            // For now, let's try to pass without blocking
        }
        await page.getByRole('button', { name: 'Continuer' }).click();


        // --- STEP 6: DESCRIPTION ---
        console.log("📝 Description...");
        await page.getByLabel('Description de l’annonce').fill(payload.description);
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 7: PRIX ---
        console.log("💰 Prix...");
        await page.getByLabel('Prix').fill(payload.price.toString());
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 8: PHOTOS ---
        console.log(`📸 Upload de ${payload.photos.length} photos...`);
        // LBC has a hidden file input usually
        const fileInput = await page.locator('input[type="file"]');
        await fileInput.setInputFiles(payload.photos);

        // Wait for upload (spinners to disappear)
        await page.waitForTimeout(5000 + (payload.photos.length * 2000));
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 9: LOCATION ---
        console.log("📍 Localisation...");
        await page.getByLabel('Ville ou code postal').fill(payload.city);
        await page.getByText(payload.city).first().click(); // Select first suggestion
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 10: CONTACT ---
        console.log("📞 Contact...");
        // Usually pre-filled from account. Just validate.
        // Or uncheck "Masquer le numéro"
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 11: FINAL REVIEW ---
        console.log("👀 Revue finale...");

        // Uncomment to actually submit!
        // await page.getByRole('button', { name: 'Valider et publier' }).click();
        // console.log("✅ PUBLIÉ !");

        console.log("🚧 MODE TEST: Je m'arrête juste avant le clic final 'Valider'.");
        console.log("Vous pouvez vérifier la fenêtre et cliquer vous-même.");

        // Wait 2 mins for user to check/finish
        await page.waitForTimeout(120000);

    } catch (error) {
        console.error("❌ Erreur durant la publication LBC:", error);
        // Keep window open for debugging
        await page.waitForTimeout(60000);
    } finally {
        await browser.close();
    }
})();
