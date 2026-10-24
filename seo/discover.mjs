// Finds real long-tail searches around the seed topics with Google Autocomplete (no account needed).
// Writes seo/data/suggestions.json, read by plan.mjs. Usage: npm run seo:discover [-- --lang en --country us]
import fs from 'fs';
import path from 'path';
import { DATA_DIR, SEO_DIR } from './config.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]] : null)).filter(Boolean));
const LANG = args.lang || 'en';
const COUNTRY = args.country || 'us';
const DELAY_MS = 350;
const CACHE_FILE = path.join(DATA_DIR, 'autocomplete-cache.json');
const OUT_FILE = path.join(DATA_DIR, 'suggestions.json');

const seeds = JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'keywords', 'seeds.json'), 'utf8'));
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function suggest(query) {
    const key = `${LANG}-${COUNTRY}:${query}`;
    if (cache[key]) return cache[key];
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${LANG}&gl=${COUNTRY}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (sketchai.space keyword research)' } });
    if (!res.ok) throw new Error(`autocomplete ${res.status} for "${query}"`);
    const [, list] = await res.json();
    cache[key] = list;
    await sleep(DELAY_MS);
    return list;
}

/** The prefix itself plus "prefix a", "prefix b"... to surface longer tails (kept short to stay polite). */
async function expand(prefix, letters = args.letters || 'abcfhimosw') {
    const found = new Set(await suggest(prefix));
    for (const letter of letters) for (const s of await suggest(`${prefix} ${letter}`)) found.add(s);
    return [...found];
}

const clusters = [];
for (const cluster of seeds.clusters) {
    const queries = new Set();
    for (const prefix of cluster.expand || []) {
        process.stdout.write(`🔎 ${cluster.id}: "${prefix}"...`);
        const found = await expand(prefix);
        found.forEach((q) => queries.add(q));
        console.log(` ${found.length}`);
    }
    clusters.push({ id: cluster.id, type: cluster.type, queries: [...queries].sort() });
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));
fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), lang: LANG, country: COUNTRY, clusters }, null, 2));
const total = clusters.reduce((n, c) => n + c.queries.length, 0);
console.log(`✅ ${total} suggestions saved to ${path.relative(process.cwd(), OUT_FILE)}`);
