const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SESSIONS_DIR = path.join(__dirname, '../sessions');

async function run() {
    console.log("=== GHOST SESSION RECORDER ===");
    console.log("Ce script va ouvrir un navigateur réel.");
    console.log("1. Connectez-vous manuellement au site.");
    console.log("2. Acceptez les cookies, passez le 2FA si besoin.");
    console.log("3. Une fois sur la page d'accueil (connecté), revenez ici et appuyez sur ENTER.");

    rl.question('Quel service voulez-vous connecter ? (facebook / leboncoin / seloger) : ', async (service) => {
        service = service.trim().toLowerCase();

        let url = '';
        if (service === 'facebook') url = 'https://www.facebook.com/';
        else if (service === 'leboncoin') url = 'https://www.leboncoin.fr/';
        else if (service === 'seloger') url = 'https://pro.seloger.com/';
        else {
            console.error("Service inconnu. Essayez: facebook, leboncoin, seloger");
            process.exit(1);
        }

        console.log(`Lancement du navigateur pour ${service}...`);

        const browser = await chromium.launch({
            headless: false, // Visible for manual login
            channel: 'chrome' // Use installed Chrome if available for better realism
        });

        const context = await browser.newContext({
            viewport: null // Let window resize naturally
        });

        const page = await context.newPage();
        await page.goto(url);

        console.log(">> VEUILLEZ VOUS CONNECTER DANS LA FENÊTRE DU NAVIGATEUR <<");

        rl.question('Appuyez sur ENTER une fois que vous êtes bien connecté...', async () => {
            console.log("Sauvegarde de la session...");

            // Save storage state (cookies, local storage)
            const sessionPath = path.join(SESSIONS_DIR, `${service}-session.json`);
            await context.storageState({ path: sessionPath });

            console.log(`✅ Session sauvegardée avec succès dans : ${sessionPath}`);
            console.log("Vous pouvez maintenant fermer le navigateur.");

            await browser.close();
            rl.close();
        });
    });
}

run();
