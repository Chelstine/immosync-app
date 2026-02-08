const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');
const path = require('path');

// 1. Get Listing Data
const listingFile = process.argv[2];
if (!listingFile) {
    console.error("Usage: node publish-facebook.js <path-to-json-data>");
    process.exit(1);
}

const listing = JSON.parse(fs.readFileSync(listingFile, 'utf8'));
const SESSIONS_DIR = path.join(__dirname, '../sessions');
const sessionPath = path.join(SESSIONS_DIR, 'facebook-session.json');

async function run() {
    console.log("=== GHOST PUBLISHER (Facebook Immobilier) ===");

    if (!fs.existsSync(sessionPath)) {
        console.error("❌ Erreur : Aucune session Facebook trouvée. Lancez 'npm run bot:login' d'abord.");
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: false,
        channel: 'chrome'
    });

    const context = await browser.newContext({
        storageState: sessionPath
    });

    const page = await context.newPage();

    try {
        // Navigate to RENTAL/REAL ESTATE form (correct URL)
        console.log("Navigating to Marketplace Immobilier...");
        await page.goto('https://www.facebook.com/marketplace/create/rental?locale=fr_FR');
        await page.waitForTimeout(3000);

        console.log("Filling real estate form...");

        // 1. 📷 PHOTOS
        console.log(`Uploading ${listing.photos.length} photos...`);
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.waitFor({ state: 'attached', timeout: 15000 });
        await fileInput.setInputFiles(listing.photos);
        await page.waitForTimeout(3000);

        // 2. 🏠 TYPE DE BIEN (Property Type)
        console.log("Setting Property Type...");
        const typeInput = page.getByLabel('Type de propriété', { exact: false })
            .or(page.getByLabel('Type de bien'))
            .or(page.getByLabel('Property type'));

        if (await typeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await typeInput.click();
            await page.waitForTimeout(1500); // Wait for dropdown animation

            // Map our types to Facebook options
            const typeMap = {
                'Appartement': 'Appartement',
                'Maison': 'Maison',
                'Studio': 'Appartement', // Studio often falls under Appartement
                'Immeuble': 'Maison', // Fallback
                'Terrain': 'Terrain', // If available
                'Commerce': 'Local commercial'
            };
            const fbType = typeMap[listing.type] || 'Appartement';
            console.log(`Selecting type: ${fbType}`);

            // Try direct typing which is often more reliable than coordinate clicking
            await page.keyboard.type(fbType);
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        // 3. 🛏️ CHAMBRES (Bedrooms)
        console.log("Setting Bedrooms...");
        const bedroomsInput = page.getByLabel('Nombre de chambres', { exact: false })
            .or(page.getByLabel('Chambres'))
            .or(page.getByLabel('Bedrooms'));

        if (await bedroomsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bedroomsInput.click();
            await page.waitForTimeout(500);
            const bedrooms = Math.max(1, (listing.pieces || 2) - 1);
            await page.keyboard.type(bedrooms.toString());
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
        }

        // 4. 🚿 SALLES DE BAIN (Bathrooms)
        console.log("Setting Bathrooms...");
        const bathInput = page.getByLabel('Nombre de salles de bain', { exact: false })
            .or(page.getByLabel('Salles de bain'))
            .or(page.getByLabel('Bathrooms'));

        if (await bathInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bathInput.click();
            await page.waitForTimeout(500);
            await page.keyboard.type('1'); // Default to 1 if unknown
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
        }

        // 5. 💶 PRIX (Price/Rent)
        console.log("Setting Price...");
        const priceInput = page.getByLabel('Prix par mois', { exact: false })
            .or(page.getByLabel('Loyer'))
            .or(page.getByLabel('Prix'));

        if (await priceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await priceInput.fill(listing.price.toString());
        }

        // 6. 📍 ADRESSE / LIEU (Location)
        console.log("Setting Location...");
        const locInput = page.getByLabel('Lieu', { exact: false })
            .or(page.getByLabel('Adresse de la propriété'))
            .or(page.getByLabel('Location'))
            .or(page.getByLabel('Adresse')); // General fallback

        if (await locInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await locInput.click();
            await page.waitForTimeout(500);

            // Clear potential default value
            await page.keyboard.press('Control+A');
            await page.keyboard.press('Backspace');

            await page.keyboard.type(listing.city);
            await page.waitForTimeout(2000); // Wait for dropdown
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        // 7. 📝 DESCRIPTION
        console.log("Setting Description...");
        const descInput = page.getByLabel('Description du bien à louer', { exact: false })
            .or(page.getByLabel('Description'));

        if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await descInput.fill(listing.description);
        }

        // 8. 📏 SURFACE (Square feet/meters) - "Informations avancées"
        console.log("Setting Surface...");
        const surfaceInput = page.getByLabel('Pieds carrés de la propriété', { exact: false })
            .or(page.getByLabel('Surface'))
            .or(page.getByLabel('m²'));

        if (await surfaceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await surfaceInput.fill((listing.surface || '50').toString());
        }

        // 9. 📅 DATE DE DISPONIBILITÉ (Availability Date)
        console.log("Setting Availability Date...");
        const dateInput = page.getByLabel('Date de disponibilité', { exact: false });
        if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const dateStr = `${day}/${month}/${year}`;

            await dateInput.click();
            await page.waitForTimeout(500);
            await page.keyboard.type(dateStr);
            await page.keyboard.press('Enter');
        }

        // 10. 📋 TITRE (Title)
        console.log("Setting Title...");
        const titleInput = page.getByLabel('Titre', { exact: false }).or(page.getByLabel('Title'));
        if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleInput.fill(listing.title);
        }

        // 10. 🚀 PUBLISH
        console.log("Looking for Next/Publish buttons...");
        const nextBtn = page.getByRole('button', { name: 'Suivant' });

        // Loop to handle multiple "Next" steps if any
        let attempts = 0;
        while (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false) && attempts < 3) {
            console.log("Clicking Next...");
            await nextBtn.click();
            await page.waitForTimeout(2000);
            attempts++;
        }

        const publishBtn = page.getByRole('button', { name: 'Publier' });
        if (await publishBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log("Clicking Publish...");
            await publishBtn.click();
            console.log("✅ Annonce publiée avec succès !");
            await page.waitForTimeout(5000);
        } else {
            throw new Error("Bouton 'Publier' introuvable ! Le formulaire n'est peut-être pas complet.");
        }

        // Close browser after success
        await browser.close();

    } catch (e) {
        console.error("❌ Error during ghost publishing:", e.message);
        try {
            await page.screenshot({ path: path.join(__dirname, 'error-screenshot.png') });
            console.log("📸 Screenshot d'erreur sauvegardé.");
        } catch (screenshotErr) {
            // Ignore screenshot errors
        }
        console.log("⚠️ Browser fermé après erreur.");
        await browser.close();
        process.exit(1);
    }
}

run();
