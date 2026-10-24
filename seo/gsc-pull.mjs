// Pulls Search Console performance (query x page) for the last 90 days into seo/data/gsc.json.
// Needs a Google Cloud service account added as a user of the Search Console property (see seo/README.md).
// No dependency: the service account signs its own token request (OAuth 2.0 JWT bearer flow).
// Usage: npm run seo:gsc [-- --days 90]   Env: GSC_KEY_FILE, GSC_SITE_URL
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DATA_DIR, GSC_KEY_FILE, GSC_SITE_URL } from './config.mjs';

const daysArg = process.argv.indexOf('--days');
const DAYS = daysArg > -1 ? Number(process.argv[daysArg + 1]) : 90;
const OUT_FILE = path.join(DATA_DIR, 'gsc.json');

if (!fs.existsSync(GSC_KEY_FILE)) {
    console.log(`⏭️  No Search Console key at ${path.relative(process.cwd(), GSC_KEY_FILE)}: skipping (plan.mjs will use seeds + Autocomplete only).`);
    process.exit(0);
}

async function accessToken() {
    const key = JSON.parse(fs.readFileSync(GSC_KEY_FILE, 'utf8'));
    const now = Math.floor(Date.now() / 1000);
    const encode = (json) => Buffer.from(JSON.stringify(json)).toString('base64url');
    const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
        iss: key.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    })}`;
    const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), key.private_key).toString('base64url');
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`token request failed (${res.status}): ${json.error_description || json.error}`);
    return json.access_token;
}

// Search Console data lags ~3 days.
const end = new Date(Date.now() - 3 * 864e5);
const start = new Date(end.getTime() - DAYS * 864e5);
const iso = (d) => d.toISOString().slice(0, 10);

const token = await accessToken();
const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`;
const rows = [];
for (let startRow = 0; ; startRow += 25000) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ['query', 'page'], rowLimit: 25000, startRow, dataState: 'final' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Search Console query failed (${res.status}): ${json.error?.message}. Is the service account a user of ${GSC_SITE_URL}?`);
    const batch = json.rows || [];
    rows.push(...batch.map((r) => ({ query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })));
    if (batch.length < 25000) break;
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ site: GSC_SITE_URL, startDate: iso(start), endDate: iso(end), rows }, null, 1));
const impressions = rows.reduce((n, r) => n + r.impressions, 0);
console.log(`✅ ${rows.length} query/page rows (${impressions} impressions, ${iso(start)} → ${iso(end)}) saved to ${path.relative(process.cwd(), OUT_FILE)}`);
