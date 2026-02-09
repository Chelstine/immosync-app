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
        channel: 'chrome' // Use installed Chrome
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

        // 2. 📍 ADRESSE / LIEU (Location) - MOVED FIRST
        console.log("Setting Location (Targeting via Price + Shift-Tab)...");

        let usedFallback = false;

        // Strategy: "Just below Price" (Tab)
        // User confirmed Location is BELOW Price
        const priceInputForRef = page.getByLabel('Prix par mois', { exact: false })
            .or(page.getByLabel('Loyer'))
            .or(page.getByLabel('Prix'))
            .first();

        if (await priceInputForRef.isVisible()) {
            console.log("Found Price input. Using it to find Location (Tab)...");
            await priceInputForRef.click();
            await page.waitForTimeout(500);
            await page.keyboard.press('Tab'); // Move to field BELOW (Location)
            await page.waitForTimeout(500);
            usedFallback = true;
        } else {
            console.warn("⚠️ Price input not found for reference! Trying generic Location search...");
            // Fallback to standard search if Price is missing (unlikely)
            const locInput = page.getByPlaceholder('Code postal ou ville')
                .or(page.getByRole('textbox', { name: 'Lieu' }))
                .first();
            if (await locInput.isVisible()) await locInput.click();
        }

        // Now type in the focused field (Location)
        // Clear any existing text
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(500);

        // Type "Ville France" slowly
        const locationSearch = `${listing.city} France`;
        console.log(`Typing location target: "${locationSearch}"`);

        await page.keyboard.type(locationSearch, { delay: 100 });
        await page.waitForTimeout(5000); // Wait longer for results

        // CLICK the first result (User requirement)
        console.log("Waiting for results dropdown...");

        try {
            // Wait for any listbox or option to appear
            // 'listbox', 'option', or specific Facebook roles
            const options = page.locator('[role="listbox"] [role="option"], [role="listbox"] li, ul[role="listbox"] li, div[role="listbox"] div[role="option"]');

            if (await options.first().isVisible({ timeout: 5000 })) {
                console.log("Found location suggestion. Clicking...");
                // Click the first specific suggestion
                await options.first().click();
                console.log("Clicked first option.");
            } else {
                // Fallback: look for ANY text matching the city in a dropdown-like container
                const textMatch = page.getByText(listing.city).last();
                if (await textMatch.isVisible({ timeout: 2000 })) {
                    console.log("Clicking text match...");
                    await textMatch.click();
                } else {
                    throw new Error("No suggestion list found");
                }
            }
        } catch (err) {
            console.warn("⚠️ Suggestion list issue:", err.message);
    
            console.log("Fallback: Keyboard selection...");
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
        }

        // CRITICAL: Force the update by blurring the field
        console.log("Blurring field to force Currency update...");
        await page.locator('body').click({ position: { x: 10, y: 10 } }); // Click empty space
        await page.waitForTimeout(5000); // Wait for the currency to change to €

        console.log("Location set via keyboard focus/click.");

        // 3. 🏠 TYPE DE BIEN
        console.log("Setting Property Type...");
        const typeInput = page.getByLabel('Type de propriété', { exact: false })
            .or(page.getByLabel('Type de bien'))
            .or(page.getByLabel('Property type'))
            .first();

        if (await typeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await typeInput.click();
            await page.waitForTimeout(1000);

            const map = {
                'Appartement': 'Appartement',
                'Maison': 'Maison',
                'Studio': 'Appartement',
                'Terrain': 'Terrain',
                'Commerce': 'Local commercial'
            };
            const val = map[listing.type] || 'Maison';

            await page.keyboard.type(val, { delay: 100 });
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        // 4. 🛏️ CHAMBRES
        console.log("Setting Bedrooms...");
        const bedInput = page.getByLabel('Nombre de chambres', { exact: false })
            .or(page.getByLabel('Chambres'))
            .first();

        if (await bedInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bedInput.click();
            await page.waitForTimeout(500);
            const beds = (listing.pieces || 3) - 1; // Approx logic
            await page.keyboard.type(String(Math.max(1, beds)));
            await page.waitForTimeout(500);
        }

        // 5. 🚿 SALLES DE BAIN
        console.log("Setting Bathrooms...");
        const bathInput = page.getByLabel('Nombre de salles de bain', { exact: false })
            .or(page.getByLabel('Salles de bain'))
            .first();

        if (await bathInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bathInput.click();
            await page.waitForTimeout(500);
            await page.keyboard.type('1');
            await page.waitForTimeout(500);
        }

        // 6. 💶 PRIX
        console.log("Setting Price...");
        const priceInput = page.getByLabel('Prix par mois', { exact: false })
            .or(page.getByLabel('Loyer'))
            .or(page.getByLabel('Prix'))
            .first();

        if (await priceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            // CHECK CURRENCY
            console.log("Checking currency...");
            const isFCFA = await page.getByText('FCFA').isVisible()
                || await page.getByText('XOF').isVisible()
                || await page.locator('body').textContent().then(t => t.includes('FCFA') || t.includes('XOF'));

            let finalPrice = listing.price;
            if (isFCFA) {
                console.log("⚠️ Currency detected as FCFA/XOF! Converting price...");
                finalPrice = Math.round(listing.price * 655.957);
                console.log(`💶 ${listing.price} €  ➜  💰 ${finalPrice} FCFA`);
            } else {
                console.log("Currency assumed to be Euro (or not detected). Keeping original price.");
            }

            await priceInput.click(); // Focus first
            await page.waitForTimeout(500);
            await priceInput.fill(String(finalPrice));
            await page.waitForTimeout(500);
        }

        // 7. 📝 DESCRIPTION
        console.log("Setting Description...");
        const descInput = page.getByLabel('Description du bien à louer', { exact: false })
            .or(page.getByLabel('Description'))
            .first();

        if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await descInput.click();
            await page.waitForTimeout(500);
            // Limit length if needed, or fill directly
            await descInput.fill(listing.description.substring(0, 5000));
            await page.waitForTimeout(500);
        }

        // 8. 📏 SURFACE
        console.log("Setting Surface...");
        const surfInput = page.getByLabel('Pieds carrés de la propriété', { exact: false })
            .or(page.getByLabel('Surface'))
            .or(page.getByLabel('m²'))
            .first();

        if (await surfInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await surfInput.click();
            await page.waitForTimeout(500);
            await surfInput.fill(String(listing.surface || 50));
            await page.waitForTimeout(500);
        }

        // 9. 📅 DATE
        console.log("Setting Date...");
        const dateInput = page.getByLabel('Date de disponibilité', { exact: false }).first();
        if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await dateInput.click();
            await page.waitForTimeout(500);
            const now = new Date();
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const y = now.getFullYear();
            await page.keyboard.type(`${d}/${m}/${y}`, { delay: 50 });
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        // --- NEW FIELDS (Laundry, Parking, Heating, AC) ---
        // Helper for dropdowns to select "Aucun"
        const selectAucun = async (label) => {
            console.log(`Setting ${label}...`);
            const input = page.getByLabel(label, { exact: false }).first();
            if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
                await input.click();
                await page.waitForTimeout(1000); // Wait for menu
                // Try to find "Aucun" or "None" in the list
                // Often it's at the bottom or top. 
                // Strategy: Type "Aucun" to filter or select
                await page.keyboard.type("Aucun", { delay: 100 });
                await page.waitForTimeout(500);
                await page.keyboard.press('Enter');
                await page.waitForTimeout(500);
            }
        };

        await selectAucun('Type de laverie');
        await selectAucun('Type de parking');
        await selectAucun('Type de chauffage');
        await selectAucun('Type de climatisation');

        // 10. 📋 TITRE
        console.log("Setting Title...");
        const titleInput = page.getByLabel('Titre', { exact: false }).or(page.getByLabel('Title')).first();
        if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await titleInput.click();
            await page.waitForTimeout(500);
            await titleInput.fill(listing.title);
            await page.waitForTimeout(500);
        }

        console.log("Waiting for form validation...");
        await page.waitForTimeout(3000);

        // 11. 🚀 NAVIGATION & PUBLISH
        console.log("Looking for Next/Publish...");

        // Loop to click 'Suivant' until 'Publier' appears
        // Sometimes there are multiple steps (Next -> Next -> Publish)
        for (let i = 0; i < 5; i++) {
            // Check for Publish first
            const publishBtn = page.getByRole('button', { name: 'Publier' }).first();
            if (await publishBtn.isVisible({ timeout: 2000 })) {
                console.log("Clicking Publish...");
                await publishBtn.click();
                console.log("✅ PUBLISHED!");
                await page.waitForTimeout(5000);
                await browser.close();
                process.exit(0); // SUCCESS
            }

            // Try to find Next button
            // It might be named "Suivant", "Next", or have an aria-label
            const nextBtn = page.getByRole('button', { name: 'Suivant', exact: false })
                .or(page.getByRole('button', { name: 'Next', exact: false }))
                .or(page.getByLabel('Suivant'))
                .or(page.getByLabel('Next'))
                .first();

            if (await nextBtn.isVisible({ timeout: 3000 })) {
                // Scroll into view just in case
                await nextBtn.scrollIntoViewIfNeeded();

                if (await nextBtn.isEnabled()) {
                    console.log(`Clicking Next (${i + 1})...`);
                    try {
                        await nextBtn.click({ timeout: 2000 });
                    } catch (clickErr) {
                        console.warn("Standard click failed, trying force click...", clickErr.message);
                        await nextBtn.click({ force: true });
                    }
                    await page.waitForTimeout(3000); // Wait for next screen animation
                } else {
                    console.log("⚠️ Next button found but DISABLED - Form incomplete/invalid.");
                    // Check for validation errors
                    const errors = await page.locator('[aria-invalid="true"]').count();
                    if (errors > 0) {
                        console.warn(`Found ${errors} invalid fields!`);
                    }
                    await page.waitForTimeout(2000);
                }
            } else {
                console.log("No Next button found... (checking if we are done)");
                // If no Next and no Publish, maybe we are stuck?
                // Break to let the final check decide
                break;
            }
        }

        // Final check for Publish if loop exited
        const finalPublishBtn = page.getByRole('button', { name: 'Publier' });
        if (await finalPublishBtn.isVisible({ timeout: 5000 })) {
            await finalPublishBtn.click();
            console.log("✅ PUBLISHED (Final attempt)!");
            await page.waitForTimeout(5000);
            await browser.close();
            process.exit(0);
        } else {
            throw new Error("Publish button missing after navigation.");
        }

    } catch (e) {
        console.error("❌ Error during ghost publishing:", e.message);
        try {
            await page.screenshot({ path: path.join(__dirname, 'error-screenshot.png') });
            console.log("📸 Screenshot d'erreur sauvegardé (scripts/error-screenshot.png).");
        } catch (screenshotErr) {
            console.error("Erreur screenshot:", screenshotErr.message);
        }

        console.log("\n⚠️ ATTENTION: Une erreur est survenue !");
        console.log("🛑 Le navigateur va rester ouvert 5 minutes pour que vous puissiez voir le problème.");
        console.log("🛑 Regardez l'écran et dites-moi ce qui manque ou ce qui bloque.");

        await page.waitForTimeout(300000); // Wait 5 minutes

        console.log("⚠️ Fermeture du navigateur...");
        await browser.close();
        process.exit(1);
    }
}

run();
