// Renders content/ into static pages: /tutorials/<slug>/ and /guides/<slug>/ (index.html files), the two
// hubs, sitemap.xml and robots.txt. Run after writing pages: `npm run seo:build`.
import fs from 'fs';
import path from 'path';
import { ROOT, SITE_URL, TOPICS, TYPES } from './config.mjs';
import { loadContent, validate } from './lib/content.mjs';
import { renderArticle, renderHub } from './lib/render.mjs';
import { today } from './lib/text.mjs';

// --- Load and check content ---
const written = loadContent();
const knownIds = new Set(written.map((p) => p.id));
let failed = 0;
const pages = written.filter((page) => {
    const { errors, warnings, pending } = validate(page, knownIds);
    for (const w of warnings) console.warn(`⚠️  ${page.id}: ${w}`);
    if (pending.length) console.log(`ℹ️  ${page.id}: links to pages not written yet (plain text until they are): ${pending.join(', ')}`);
    if (errors.length) {
        failed += 1;
        for (const e of errors) console.error(`❌ ${page.id}: ${e} (page skipped)`);
        knownIds.delete(page.id);
        return false;
    }
    return true;
});

// Pages of a type in hub order: by topic (the order of TOPICS), then oldest first.
const topicRank = (p) => Object.keys(TOPICS[p.type]).indexOf(p.topic);
const ofType = (type) => pages.filter((p) => p.type === type).sort((a, b) => topicRank(a) - topicRank(b) || a.createdAt.localeCompare(b.createdAt));
const byId = new Map(pages.map((p) => [p.id, p]));

const ctx = {
    knownIds,
    byId,
    footerLinks: Object.fromEntries(Object.keys(TYPES).map((type) => [type, ofType(type).slice(0, 6)])),
    // Same topic first, then same type, then the other type.
    suggestRelated(page) {
        const others = pages.filter((p) => p.id !== page.id);
        return [
            ...others.filter((p) => p.type === page.type && p.topic === page.topic),
            ...others.filter((p) => p.type === page.type),
            ...others,
        ].filter((p, i, list) => list.indexOf(p) === i);
    },
};

// --- Write pages (the build owns these folders) ---
for (const { dir } of Object.values(TYPES)) fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true });

function write(relPath, html) {
    const file = path.join(ROOT, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
}

for (const page of pages) write(`${page.id}/index.html`, renderArticle(page, ctx));
for (const [type, { dir }] of Object.entries(TYPES)) {
    const groups = Object.entries(TOPICS[type]).map(([topic, heading]) => ({ topic, heading, pages: ofType(type).filter((p) => p.topic === topic) }));
    write(`${dir}/index.html`, renderHub(type, groups, ctx));
}

// --- Sitemap + robots ---
const fileDate = (rel) => fs.statSync(path.join(ROOT, rel)).mtime.toISOString().slice(0, 10);
const latest = (list) => list.map((p) => p.updatedAt).sort().pop() || today();
const urls = [
    { loc: '/', lastmod: fileDate('index.html'), priority: '1.0' },
    // An empty hub is a thin page: it is built for the navigation, but not submitted until it has pages.
    ...Object.entries(TYPES).filter(([type]) => ofType(type).length).map(([type, { dir }]) => ({ loc: `/${dir}/`, lastmod: latest(ofType(type)), priority: '0.8' })),
    ...pages.map((p) => ({ loc: `/${p.id}/`, lastmod: p.updatedAt, priority: '0.7' })),
    { loc: '/privacy.html', lastmod: fileDate('privacy.html'), priority: '0.2' },
    { loc: '/tos.html', lastmod: fileDate('tos.html'), priority: '0.2' },
];
fs.writeFileSync(
    path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`)
        .join('\n')}\n</urlset>\n`,
);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

const counts = Object.entries(TYPES).map(([type, { dir }]) => `${ofType(type).length} ${dir}`).join(', ');
console.log(`✅ Built ${pages.length} pages (${counts}) + ${Object.keys(TYPES).length} hubs; sitemap has ${urls.length} URLs.`);
if (failed) {
    console.error(`❌ ${failed} page(s) skipped because of errors.`);
    process.exitCode = 1;
}
