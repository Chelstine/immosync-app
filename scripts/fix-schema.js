const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const BASE_ID = env.AIRTABLE_BASE_ID;
const API_KEY = env.AIRTABLE_PAT;

function request(method, endpoint, body = null) {
    const options = {
        hostname: 'api.airtable.com',
        path: `/v0/meta/bases/${BASE_ID}${endpoint}`,
        method: method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log("🔍 Analyzing and Fixing Schema...");

    let tables;
    try {
        const schema = await request('GET', '/tables');
        tables = schema.tables;
    } catch (e) {
        console.error("❌ Fatal: Cannot read schema. Ensure token has 'schema.bases:read'.");
        console.error(e);
        return;
    }

    const definitions = [
        {
            name: 'Users',
            columns: [
                { name: 'Email', type: 'email' },
                { name: 'Password', type: 'singleLineText' },
                { name: 'Name', type: 'singleLineText' },
                { name: 'Facebook_Page_ID', type: 'singleLineText' },
                { name: 'Facebook_Access_Token', type: 'multilineText' },
                { name: 'LBC_Login', type: 'singleLineText' },
                { name: 'LBC_Password', type: 'singleLineText' },
                { name: 'SeLoger_Login', type: 'singleLineText' },
                { name: 'SeLoger_Password', type: 'singleLineText' },
                { name: 'BienIci_Login', type: 'singleLineText' },
                { name: 'BienIci_Password', type: 'singleLineText' }
            ]
        },
        {
            name: 'Annonces_IA',
            columns: [
                { name: 'Publié_Facebook', type: 'checkbox' },
                { name: 'Publié_LBC', type: 'checkbox' },
                { name: 'Publié_SeLoger', type: 'checkbox' },
                { name: 'Publié_BienIci', type: 'checkbox' }
            ]
        },
        {
            name: 'Biens_Immo',
            columns: [
                { name: 'Code_Postal', type: 'singleLineText' }
            ]
        }
    ];

    for (const def of definitions) {
        const table = tables.find(t => t.name === def.name);
        if (!table) {
            console.error(`❌ Table '${def.name}' not found. Please create it manually first.`);
            continue;
        }

        const existingFields = table.fields.map(f => f.name);

        for (const col of def.columns) {
            if (!existingFields.includes(col.name)) {
                console.log(`⚙️ Creating field '${col.name}' in table '${def.name}'...`);
                try {
                    await request('POST', `/tables/${table.id}/fields`, {
                        name: col.name,
                        type: col.type
                    });
                    console.log(`   ✅ Created.`);
                } catch (err) {
                    console.error(`   ❌ Failed to create '${col.name}'. Error: ${err.status}`);
                    // console.error(err.body);
                }
            } else {
                console.log(`   ✓ Field '${col.name}' exists.`);
            }
        }
    }
    console.log("Done.");
}

run();
