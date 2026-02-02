const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// CAPTCHA HANDLER 🛡️
async function checkForCaptcha(page) {
    const captchaSelector = 'iframe[src*="datadome"], #datadome-captcha, .geetest_holder';

    // Check if captcha is present immediately
    // Note: We use a short timeout check to avoid slowing down too much if no captcha
    try {
        if (await page.waitForSelector(captchaSelector, { timeout: 2000 })) {
            console.log("⚠️ CAPTCHA DÉTECTÉ ! Demande d'aide humaine...");

            // 1. Alert Sound + Notification via PowerShell
            const notifScript = `
                Add-Type -AssemblyName System.Windows.Forms;
                Add-Type -AssemblyName System.Drawing;
                $notify = New-Object System.Windows.Forms.NotifyIcon;
                $notify.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon((Get-Process -Id $pid).Path);
                $notify.BalloonTipIcon = "Warning";
                $notify.BalloonTipTitle = "Action Requise - ImmoSync";
                $notify.BalloonTipText = "Un Captcha bloque la publication LBC. Veuillez le résoudre svp.";
                $notify.Visible = $True;
                $notify.ShowBalloonTip(5000);
                [console]::beep(1000, 500); 
            `;
            exec(`powershell -Command "& {${notifScript.replace(/\n/g, ' ')}}"`);

            console.log("⏳ En attente de la résolution manuelle...");

            // Wait until captcha disappears (User solves it)
            // High timeout (5 minutes) to give user time to react
            await page.waitForSelector(captchaSelector, { state: 'hidden', timeout: 300000 });

            console.log("✅ Captcha résolu ! Reprise du script.");
        }
    } catch (e) {
        // No captcha found within 2s, continue
    }
}

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
        await checkForCaptcha(page);

        // Handle "C'est parti" or cookie banners if any
        try { await page.getByRole('button', { name: 'Continuer sans accepter' }).click({ timeout: 2000 }); } catch (e) { }

        // --- STEP 2: TITLE ---
        console.log("✍️ Titre...");
        await page.getByLabel('Titre de l’annonce').fill(payload.title);
        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 3: CATEGORY ---
        console.log("📂 Catégorie...");
        try {
            await page.getByLabel('Rechercher une catégorie').fill('Ventes immobilières');
            await page.getByText('Ventes immobilières', { exact: true }).first().click();
        } catch (e) {
            await page.getByText('Immobilier').click();
            await page.getByText('Ventes immobilières').click();
        }
        await checkForCaptcha(page);

        // --- STEP 4: TYPE DE BIEN & DETAILS ---
        console.log("Details Immobilier...");
        await page.waitForTimeout(1000);

        const type = payload.type ? payload.type.toLowerCase() : '';
        if (type.includes('maison')) await page.getByText('Maison', { exact: true }).click();
        else if (type.includes('appart')) await page.getByText('Appartement', { exact: true }).click();
        else if (type.includes('terrain')) await page.getByText('Terrain', { exact: true }).click();
        else await page.getByText('Autre', { exact: true }).click();

        if (payload.surface) await page.getByLabel('Surface habitable').fill(payload.surface.toString());
        if (payload.pieces) await page.getByLabel('Nombre de pièces').fill(payload.pieces.toString());

        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 5: DPE / GES ---
        console.log("⚡ DPE / GES...");
        try {
            await page.getByText('Non soumis').click({ timeout: 2000 });
        } catch (e) { }

        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);


        // --- STEP 6: DESCRIPTION ---
        console.log("📝 Description...");
        await page.getByLabel('Description de l’annonce').fill(payload.description);
        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 7: PRIX ---
        console.log("💰 Prix...");
        await page.getByLabel('Prix').fill(payload.price.toString());
        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 8: PHOTOS ---
        console.log(`📸 Upload de ${payload.photos.length} photos...`);
        const fileInput = await page.locator('input[type="file"]');
        await fileInput.setInputFiles(payload.photos);

        await page.waitForTimeout(5000 + (payload.photos.length * 2000));
        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 9: LOCATION ---
        console.log("📍 Localisation...");
        await page.getByLabel('Ville ou code postal').fill(payload.city);
        await page.getByText(payload.city).first().click();
        await page.getByRole('button', { name: 'Continuer' }).click();
        await checkForCaptcha(page);

        // --- STEP 10: CONTACT ---
        console.log("📞 Contact...");
        await page.getByRole('button', { name: 'Continuer' }).click();

        // --- STEP 11: FINAL REVIEW ---
        console.log("👀 Revue finale...");
        // await page.getByRole('button', { name: 'Valider et publier' }).click();

        console.log("🚧 MODE TEST: Fin du script (pas de validation finale).");
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error("❌ Erreur durant la publication LBC:", error);
    } finally {
        await browser.close();
    }
})();
