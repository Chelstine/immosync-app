const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// C:\Users\Chelstine\Desktop\NOVEK\ImmoSync\immosync-app
const APP_DIR = __dirname;
// C:\Users\Chelstine\Desktop\NOVEK\ImmoSync-Client-Release
const DIST_DIR = path.join(APP_DIR, '..', '..', 'ImmoSync-Client-Release');

console.log(`📂 Source: ${APP_DIR}`);
console.log(`📂 Destination: ${DIST_DIR}`);

// Configuration Obfuscation
const OBFUSCATION_OPTIONS = {
    compact: true,
    controlFlowFlattening: true,
    target: 'node'
};

const SCRIPTS_TO_PROCESS = [
    'agent-watcher.js',
    'publish-facebook.js',
    'publish-leboncoin.js',
    'login-leboncoin.js',
    'login-session.js'
];

function build() {
    // 1. Clean & Create
    try {
        if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true, force: true });
        fs.mkdirSync(DIST_DIR, { recursive: true });
        fs.mkdirSync(path.join(DIST_DIR, 'immosync-app'));
        fs.mkdirSync(path.join(DIST_DIR, 'immosync-app', 'scripts'));
    } catch (e) {
        console.error("Erreur création dossier:", e);
    }

    // 2. Process Scripts
    SCRIPTS_TO_PROCESS.forEach(filename => {
        const sourcePath = path.join(APP_DIR, 'scripts', filename);
        const destPath = path.join(DIST_DIR, 'immosync-app', 'scripts', filename);

        if (fs.existsSync(sourcePath)) {
            console.log(`🔒 Traitement de ${filename}...`);
            const code = fs.readFileSync(sourcePath, "utf8");
            const obfuscated = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS).getObfuscatedCode();
            fs.writeFileSync(destPath, obfuscated);
        } else {
            console.error(`❌ INTROUVABLE: ${sourcePath}`);
        }
    });

    // 3. Copy Configs (package.json, .env.local)
    ['package.json', '.env.local'].forEach(file => {
        const src = path.join(APP_DIR, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(DIST_DIR, 'immosync-app', file));
            console.log(`📄 Copié: ${file}`);
        }
    });

    // 4. Copy Installers (from Parent folder ImmoSync)
    const PARENT_DIR = path.join(APP_DIR, '..');
    ['INSTALL_AGENT.bat', 'Start-ImmoSync.bat', 'GÉRER_COMPTES.bat', 'launcher.vbs'].forEach(file => {
        const src = path.join(PARENT_DIR, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(DIST_DIR, file));
            console.log(`📦 Copié: ${file}`);
        } else {
            console.error(`❌ Installer manquant: ${src}`);
        }
    });

    console.log("\n✅ BUILD TERMINÉ !");
}

build();
