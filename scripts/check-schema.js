const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env manully since we are running a script
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const BASE_ID = env.AIRTABLE_BASE_ID;
const API_KEY = env.AIRTABLE_PAT;

if (!BASE_ID || !API_KEY) {
    console.error("Missing configuration in .env.local");
    process.exit(1);
}

function fetchSchema() {
    const options = {
        hostname: 'api.airtable.com',
        path: `/v0/meta/bases/${BASE_ID}/tables`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// Fallback: Check standard API if Metadata fails (Metadata needs specific scope)
// We just verify if we can read the tables called 'Users', 'Biens_Immo', 'Annonces_IA'
async function checkTableAccess(tableName) {
    const options = {
        hostname: 'api.airtable.com',
        path: `/v0/${BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=1`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            resolve({ name: tableName, status: res.statusCode });
        });
        req.on('error', () => resolve({ name: tableName, status: 'error' }));
        req.end();
    });
}

async function run() {
    console.log("Checking Airtable Schema...");

    try {
        const schema = await fetchSchema();
        console.log("✅ Metadata API Access OK. Analyzing Tables...");
        analyzeSchema(schema.tables);
    } catch (error) {
        console.warn("⚠️ Metadata API failed (likely missing 'schema.bases:read' scope).");
        console.warn("   Error:", error.status, error.body);
        console.log("   Switching to basic connectivity check...");

        const tables = ['Users', 'Biens_Immo', 'Annonces_IA'];
        for (const t of tables) {
            const result = await checkTableAccess(t);
            if (result.status === 200) {
                console.log(`✅ Table '${t}' exists and is accessible.`);
            } else if (result.status === 404) {
                console.error(`❌ Table '${t}' NOT FOUND (404). Check spelling exactly.`);
            } else {
                console.error(`❌ Error accessing '${t}': Status ${result.status}`);
            }
        }
        console.log("\nNote: Without Metadata access, I cannot verify specific columns, only table existence.");
    }
}

function analyzeSchema(tables) {
    const expected = {
        'Users': ['Email', 'Password', 'Name', /*'Facebook_Page_ID', 'Facebook_Access_Token'*/],
        'Biens_Immo': ['Type_Bien', 'Prix', 'Surface', 'Pieces', 'Ville', 'Code_Postal', 'DPE', 'Description_Courte', 'Email_Agent', 'Statut', 'Photos'],
        'Annonces_IA': ['Bien', 'Titre_Généré', 'Description_Générée', 'Ton', 'Publié_Facebook', 'Publié_SeLoger']
    };

    const foundTables = {};
    tables.forEach(t => foundTables[t.name] = t);

    for (const [name, fields] of Object.entries(expected)) {
        if (!foundTables[name]) {
            console.error(`❌ MISSING TABLE: ${name}`);
            continue;
        }
        console.log(`\n🔍 Checking Table: ${name}`);
        const actualFields = foundTables[name].fields.map(f => f.name);

        fields.forEach(field => {
            if (actualFields.includes(field)) {
                console.log(`   ✅ Column '${field}' found.`);
            } else {
                console.error(`   ❌ MISSING Column: '${field}'`);
            }
        });

        // Warn about unexpected important ones if missing (the optional ones)
        if (name === 'Users') {
            if (!actualFields.includes('Facebook_Page_ID')) console.warn("   ⚠️ Missing 'Facebook_Page_ID' (Required for FB Publish)");
            if (!actualFields.includes('Facebook_Access_Token')) console.warn("   ⚠️ Missing 'Facebook_Access_Token' (Required for FB Publish)");
        }
    }
}

run();
