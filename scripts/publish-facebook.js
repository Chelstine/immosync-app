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
    console.log("=== GHOST PUBLISHER (Facebook) ===");

    if (!fs.existsSync(sessionPath)) {
        console.error("❌ Erreur : Aucune session Facebook trouvée. Lancez 'npm run bot:login' d'abord.");
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: false, // Keep visible to monitor (can be headless=true later)
        channel: 'chrome'
    });

    const context = await browser.newContext({
        storageState: sessionPath // Inject cookies
    });

    const page = await context.newPage();

    try {
        console.log("Navigating to Marketplace...");
        await page.goto('https://www.facebook.com/marketplace/create/item');

        // Check if we need to select "Item for Sale" (Sometimes it asks directly)
        // Try to find the generic "Item for Sale" button if we are on the selection screen
        const itemForSaleBtn = page.getByText('Item for Sale', { exact: false }).or(page.getByText('Article à vendre'));
        if (await itemForSaleBtn.isVisible({ timeout: 5000 })) {
            await itemForSaleBtn.click();
        }

        console.log("Filling form...");

        // 1. 📷 PHOTOS
        console.log(`Uploading ${listing.photos.length} photos...`);

        // Try to force the file input to appear if hidden
        // Sometimes clicking the big box helps trigger the DOM elements
        const addPhotoBtn = page.getByText('Ajouter des photos').first();
        if (await addPhotoBtn.isVisible()) {
            // We don't necessarily click it because it opens system dialog, 
            // but we wait for the input to be present in DOM.
        }

        const fileInput = page.locator('input[type="file"]').first();
        // Give it more time and try to locate it even if hidden
        await fileInput.waitFor({ state: 'attached', timeout: 15000 });
        await fileInput.setInputFiles(listing.photos);
        await page.waitForTimeout(3000);

        // 2. 🌍 LOCATION (MOVED FIRST to force Currency to €)
        console.log("Setting Location first (to fix Currency)...");
        const locInput = page.getByLabel('Lieu', { exact: false }).or(page.getByLabel('Location'));
        if (await locInput.isVisible()) {
            await locInput.click();
            await page.waitForTimeout(500);

            // Clear existing location
            await page.keyboard.press('Control+A');
            await page.keyboard.press('Backspace');
            await page.waitForTimeout(500);

            await page.keyboard.type(listing.city);
            await page.waitForTimeout(2000); // Wait for suggestions (e.g. "Nantes, France")
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000); // Allow FB to update currency
        }

        // 3. 📝 TEXT FIELDS
        console.log("Setting Title...");
        await page.getByLabel('Titre').fill(listing.title);

        console.log("Setting Price...");
        await page.getByLabel('Prix').fill(listing.price.toString());

        // 4. 📂 CATEGORY (FIXED)
        console.log("Setting Category (Maison et jardin)...");
        const catInput = page.getByLabel('Catégorie');
        if (await catInput.isVisible()) {
            await catInput.click();
            await page.waitForTimeout(1500);

            // "Ventes immobilières" does not exist in 'Item' flow.
            // "Maison et jardin" is the safest bet seen in screenshots.
            await page.keyboard.type('Maison');
            await page.waitForTimeout(2000); // Wait for filter
            await page.keyboard.press('Enter'); // Select first result ("Maison et jardin")
            await page.waitForTimeout(1000);
        }

        // 5. 🛠️ HANDLING "CONDITION" & "BRAND" (If Category failed or FP requires it)
        // Check for "État" (Condition)
        const conditionInput = page.getByLabel('État', { exact: false }).or(page.getByLabel('Condition'));
        if (await conditionInput.isVisible()) {
            console.log("Filling Condition (État)...");
            await conditionInput.click();
            await page.waitForTimeout(500);
            // Select "Neuf" or "Excellent état" - usually the first or second option
            // Let's rely on text search inside the dropdown
            await page.getByRole('option', { name: /Neuf|New|Excellent/i }).first().click().catch(() => {
                // Fallback: just use arrows if text fails
                page.keyboard.press('ArrowDown');
                page.keyboard.press('Enter');
            });
        }

        // Check for "Marque" (Brand) - visible in screenshot
        const brandInput = page.getByLabel('Marque', { exact: false }).or(page.getByLabel('Brand'));
        if (await brandInput.isVisible()) {
            console.log("Filling Brand...");
            await brandInput.fill('ImmoSync / Agence');
        }

        // 6. 📝 DESCRIPTION
        console.log("Setting Description...");
        await page.getByLabel('Description').fill(listing.description);

        // Location was already set.

        console.log("Waiting for form validation...");
        await page.waitForTimeout(2000);

        // 7. 🚀 PUBLISH / NEXT
        // Try to find "Suivant" button
        const nextBtn = page.getByRole('button', { name: 'Suivant' });

        if (await nextBtn.isVisible()) {
            console.log("Clicking Next...");
            await nextBtn.click();
            await page.waitForTimeout(2000);
        } else {
            // Fallback selector
            await page.click('div[aria-label="Suivant"]');
        }

        // Final Publish Button
        const publishBtn = page.getByRole('button', { name: 'Publier' });
        if (await publishBtn.isVisible()) {
            console.log("Clicking Publish...");
            await publishBtn.click();
            console.log("✅ Clicked Publish!");
            await page.waitForTimeout(5000); // Wait for success confirmation
        }

    } catch (e) {
        console.error("❌ Error during ghost publishing:", e);
        await page.screenshot({ path: path.join(__dirname, 'error-screenshot.png') });

        console.log("⚠️ ERROR: Browser left open for inspection.");
        // Keep open for 60s
        await page.waitForTimeout(60000);
        process.exit(1);

    } finally {
        console.log("Process finished.");
        // await browser.close(); // Keep open for now
    }
}

run();
