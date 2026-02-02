const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('🟧 Lancement de la connexion LeBonCoin...');

    // Launch browser with head (visible)
    const browser = await chromium.launch({
        headless: false,
        channel: 'chrome' // Use real Chrome for better stealth
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('👉 Navigation vers la page de connexion...');
    await page.goto('https://www.leboncoin.fr/connexion', { waitUntil: 'networkidle' });

    console.log('⏳ Veuillez vous connecter manuellement dans la fenêtre du navigateur.');
    console.log('   Si un Captcha apparaît, résolvez-le.');
    console.log('👉 Une fois connecté (retour sur la page d\'accueil), ce script se fermera automatiquement.');

    // Wait until we see an element indicating we are logged in
    // Usually, the "Se connecter" button disappears or "Mon compte" appears.
    // We'll wait for URL to change to homepage or account page
    try {
        await page.waitForURL('https://www.leboncoin.fr/', { timeout: 300000 }); // 5 min max
        console.log('✅ Connexion détectée !');
    } catch (e) {
        console.log('⚠️ Délai dépassé ou détection automatique difficile.');
        console.log('Sauvegarde forcée des cookies maintenant...');
    }

    // Save storage state (cookies, local storage)
    const storageStatePath = path.join(__dirname, '..', 'leboncoin-session.json');
    await context.storageState({ path: storageStatePath });

    console.log(`💾 Session sauvegardée dans : ${storageStatePath}`);
    console.log('🎉 Vous pouvez fermer cette fenêtre.');

    await browser.close();
})();
