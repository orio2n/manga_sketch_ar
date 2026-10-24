// Content JSON files (content/<type dir>/<slug>.json): loading and validation.
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR, LEVELS, SCREENS, TOPICS, TYPES } from '../config.mjs';
import { image, weeks } from './images.mjs';

export function pageId(type, slug) {
    return `${TYPES[type].dir}/${slug}`;
}

export function contentPath(type, slug) {
    return path.join(CONTENT_DIR, TYPES[type].dir, `${slug}.json`);
}

/** Every content file, as { ...json, id, file }. */
export function loadContent() {
    const pages = [];
    for (const [type, { dir }] of Object.entries(TYPES)) {
        const folder = path.join(CONTENT_DIR, dir);
        if (!fs.existsSync(folder)) continue;
        for (const file of fs.readdirSync(folder).filter((f) => f.endsWith('.json')).sort()) {
            const json = JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'));
            const slug = file.replace(/\.json$/, '');
            pages.push({ ...json, type, slug, id: pageId(type, slug), file: path.join(folder, file) });
        }
    }
    return pages;
}

/** Every image id a page uses: hero, section images and step images. */
export function imageIds(page) {
    return [
        page.heroImage,
        ...(page.sections || []).flatMap((s) => [s.image, ...(s.steps || []).map((st) => st.image)]),
    ].filter(Boolean);
}

/** Every [text](/link) target of a page's text. */
function links(page) {
    return [...JSON.stringify(page).matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
}

function wordCount(page) {
    const text = [page.summary, ...(page.keyTakeaways || []), ...(page.sections || []).flatMap((s) => [
        ...(s.body || []), ...(s.list || []), ...(s.steps || []).flatMap((st) => [st.title, st.text]), s.tip, s.mistake, s.exercise,
    ]), ...(page.faq || []).flatMap((f) => [f.q, f.a])].filter(Boolean).join(' ');
    return text.split(/\s+/).length;
}

// What SketchAI does not do: a sentence naming the app next to one of these is a false promise, unless
// it says so ("SketchAI is not on iPhone"). See seo/WRITING.md, "Product facts".
const FALSE_CLAIMS = /\b(iphone|ipad|ios|app store|web app|web version|in your browser|video (lessons?|tutorials?|courses?)|ai (feedback|critique|corrections?|analysis)|critiques? your|corrects? your|grades? your|scores? your|brush(es)?|layers?|procreate)\b/i;
const NEGATION = /\b(not|no|never|only|without|isn't|doesn't|don't|can't|cannot)\b/i;

/**
 * Problems that would make a page wrong or weak: errors block publishing, warnings are printed. `pending` are
 * links to pages not written yet, which render as plain text until those pages exist.
 */
export function validate(page, knownIds) {
    const errors = [];
    const warnings = [];
    const pending = new Set();
    for (const field of ['title', 'metaDescription', 'h1', 'summary', 'keyword', 'navLabel', 'cardText']) {
        if (!page[field] || typeof page[field] !== 'string') errors.push(`missing ${field}`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug || '')) errors.push(`bad slug "${page.slug}"`);
    if (!TOPICS[page.type][page.topic]) errors.push(`unknown topic "${page.topic}" (one of: ${Object.keys(TOPICS[page.type]).join(', ')})`);
    if (!Array.isArray(page.sections) || page.sections.length < 3) errors.push('needs at least 3 sections');
    if (page.type === 'tutorial' && !(page.sections || []).some((s) => s.steps?.length >= 3)) errors.push('a tutorial needs a section with at least 3 steps');
    if (page.level && !LEVELS[page.level]) errors.push(`unknown level "${page.level}" (one of: ${Object.keys(LEVELS).join(', ')})`);
    if (page.programWeek && !weeks().some((w) => w.number === page.programWeek)) errors.push(`no week ${page.programWeek} in the program`);
    if (!page.cta?.headline || !page.cta?.text) errors.push('missing cta.headline or cta.text');
    if (page.cta?.visual && !SCREENS[page.cta.visual]) errors.push(`unknown cta.visual "${page.cta.visual}" (one of: ${Object.keys(SCREENS).join(', ')})`);
    const used = imageIds(page);
    for (const id of used) {
        if (!image(id)) errors.push(`unknown image "${id}" (npm run seo:brief -- --images lists them)`);
    }
    for (const id of new Set(used.filter((id, i) => used.indexOf(id) !== i))) warnings.push(`image "${id}" is used twice`);
    if (page.type === 'tutorial' && !page.heroImage) warnings.push('no heroImage: tutorials look much better with one');
    if (page.title?.length > 65) warnings.push(`title is ${page.title.length} chars (aim for <= 60)`);
    if (page.metaDescription?.length > 160) warnings.push(`meta description is ${page.metaDescription.length} chars (aim for <= 155)`);
    if (page.metaDescription?.length < 110) warnings.push(`meta description is only ${page.metaDescription.length} chars (aim for 130-155)`);
    if (page.cardText?.length > 120) warnings.push(`cardText is ${page.cardText.length} chars (aim for < 110)`);
    const words = wordCount(page);
    if (words < 700) warnings.push(`only ${words} words: thin pages rarely rank (aim for 1200+)`);
    for (const id of page.related || []) {
        if (!knownIds.has(id)) pending.add(id);
    }
    for (const href of links(page)) {
        const id = href.split('#')[0].replace(/^\/|\/$/g, '');
        if (id && !knownIds.has(id) && !Object.values(TYPES).some((t) => t.dir === id)) pending.add(id);
    }
    for (const text of JSON.stringify(page).split(/(?<=[.!?])\s+|","/)) {
        if (/sketchai/i.test(text) && FALSE_CLAIMS.test(text) && !NEGATION.test(text)) errors.push(`check this claim about SketchAI: "${text.slice(0, 140)}"`);
    }
    return { errors, warnings, pending: [...pending] };
}
