// Hands the next backlog briefs to whoever writes the pages (Claude Code, see seo/WRITING.md),
// and records which ones are done.
// Usage:
//   npm run seo:brief [-- --limit 5] [--type tutorial] [--action improve] [--id new:tutorial:some-slug]
//   npm run seo:brief -- --done <brief id> [<brief id>...]
//   npm run seo:brief -- --skip <brief id> [<brief id>...]
//   npm run seo:brief -- --images     (every illustration a page may use)
//   npm run seo:brief -- --program    (the app's 9-week program, week by week)
import fs from 'fs';
import path from 'path';
import { DATA_DIR, SCREENS, TOPICS, TYPES } from './config.mjs';
import { contentPath, loadContent, pageId } from './lib/content.mjs';
import { image, images, imagesFor, weeks, weeksFor } from './lib/images.mjs';
import { today } from './lib/text.mjs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i > -1 ? argv[i + 1] : fallback;
};
const listAfter = (flag) => {
    const i = argv.indexOf(flag);
    return i > -1 ? argv.slice(i + 1).filter((a) => !a.startsWith('--')) : null;
};
const BACKLOG_FILE = path.join(DATA_DIR, 'backlog.json');
const rel = (file) => path.relative(process.cwd(), file).replace(/\\/g, '/');
const imageLine = (id, img) => `${id}: ${img.title}${img.text ? ` (${img.text})` : ''} [${img.src}]`;

if (argv.includes('--images')) {
    for (const [id, img] of Object.entries(images())) console.log(`- ${imageLine(id, img)}`);
    process.exit(0);
}
if (argv.includes('--program')) {
    for (const w of weeks()) {
        console.log(`## Week ${w.number} (phase ${w.phase}): ${w.title}. Goal: ${w.goal}`);
        for (const d of w.days) console.log(`- ${d.id} ${d.title}: ${d.exercise}`);
        for (const tip of w.tips) console.log(`- Tip: ${tip}`);
        for (const l of w.lessons) console.log(`- Method "${l.title}": ${[l.intro, ...l.steps.map((s) => `${s.title}: ${s.text}`), ...l.bullets, l.callout].filter(Boolean).join(' / ')}`);
        console.log('');
    }
    process.exit(0);
}

if (!fs.existsSync(BACKLOG_FILE)) {
    console.error('No backlog yet: run `npm run seo:plan` first.');
    process.exit(1);
}
const backlog = JSON.parse(fs.readFileSync(BACKLOG_FILE, 'utf8'));

// --- Mark briefs done / skipped -----------------------------------------------------------------
for (const [flag, status] of [['--done', 'done'], ['--skip', 'skipped']]) {
    const ids = listAfter(flag);
    if (!ids) continue;
    for (const id of ids) {
        const brief = backlog.briefs.find((b) => b.id === id);
        if (!brief) {
            console.error(`❌ No brief "${id}"`);
            process.exitCode = 1;
            continue;
        }
        if (status === 'done' && !fs.existsSync(contentPath(brief.type, brief.slug))) {
            console.error(`❌ ${id}: ${rel(contentPath(brief.type, brief.slug))} does not exist yet`);
            process.exitCode = 1;
            continue;
        }
        brief.status = status;
        brief[`${status}At`] = today();
        console.log(`✅ ${id} → ${status}`);
    }
    fs.writeFileSync(BACKLOG_FILE, JSON.stringify(backlog, null, 2));
    process.exit();
}

// --- Print the next briefs ----------------------------------------------------------------------
const picked = backlog.briefs
    .filter((b) => b.status === 'todo')
    .filter((b) => !arg('id') || b.id === arg('id'))
    .filter((b) => !arg('type') || b.type === arg('type'))
    .filter((b) => !arg('action') || b.action === arg('action'))
    .slice(0, Number(arg('limit', 5)));

if (!picked.length) {
    console.log('Nothing to write: no matching brief with status "todo". Run `npm run seo:refresh` for new data.');
    process.exit(0);
}

const existing = loadContent();
const todo = backlog.briefs.filter((b) => b.status === 'todo').length;
console.log(`# ${picked.length} of ${todo} briefs to write (backlog generated ${backlog.generatedAt.slice(0, 10)})`);
console.log('Follow seo/WRITING.md. Run `npm run seo:build` after writing, then mark each brief with `npm run seo:brief -- --done <id>`.\n');

for (const brief of picked) {
    const file = contentPath(brief.type, brief.slug);
    const query = [brief.keyword, ...brief.secondary].join(' ');
    console.log(`## ${brief.id}  (score ${brief.score})`);
    console.log(`- Action: ${brief.action}${brief.action === 'new' ? ` → create ${rel(file)}` : ` → edit ${rel(file)}`}`);
    console.log(`- URL: /${pageId(brief.type, brief.slug)}/  (type: ${brief.type}, folder content/${TYPES[brief.type].dir}/)`);
    console.log(`- Topic: ${brief.topic || `choose one of ${Object.keys(TOPICS[brief.type]).join(', ')}`}`);
    console.log(`- Main keyword: ${brief.keyword}`);
    if (brief.secondary.length) console.log(`- Searches to cover: ${brief.secondary.join('; ')}`);
    console.log(`- Why: ${brief.reasons.join('; ')}`);
    const chosen = brief.images.filter(image);
    const suggested = imagesFor(query).filter((img) => !chosen.includes(img.id)).slice(0, Math.max(3, 8 - chosen.length));
    console.log('- Illustrations (look at them before using them):');
    chosen.forEach((id) => console.log(`  - ${imageLine(id, image(id))}  ← picked for this topic`));
    suggested.forEach((img) => console.log(`  - ${imageLine(img.id, img)}`));
    const programWeeks = brief.week ? weeks().filter((w) => w.number === brief.week) : weeksFor(query);
    programWeeks.forEach((w) => console.log(`- Program week ${w.number}: ${w.title} (${w.goal}) → "programWeek": ${w.number}`));
    console.log('');
}

console.log('## Pages you can link to');
for (const p of existing) console.log(`- ${p.id}: ${p.title}`);
console.log(`\nApp screenshots for cta.visual: ${Object.keys(SCREENS).join(', ')}`);
console.log('Every illustration: npm run seo:brief -- --images. The app program, week by week: npm run seo:brief -- --program');
