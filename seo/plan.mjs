// Turns seeds + Autocomplete suggestions + Search Console data into a prioritized backlog of briefs
// (seo/data/backlog.json + backlog.md), handed out by brief.mjs. Usage: npm run seo:plan
//
// Brief actions:
//   new      a page we don't have yet (seed topic, Autocomplete long tail, or a GSC query that only ranks
//            through the home page / a weak page)
//   improve  a page that ranks on page 2-3 for queries it could win: expand it around those queries
//   ctr      a page on page 1 with a low click-through rate: rewrite its title and description
import fs from 'fs';
import path from 'path';
import { DATA_DIR, SEO_DIR, SITE_URL, TYPES } from './config.mjs';
import { loadContent } from './lib/content.mjs';
import { similarity, slugify, tokens } from './lib/text.mjs';

const MIN_IMPRESSIONS = 10;
const MAX_SECONDARY = 8;
const MAX_MERGE_BONUS = 10;
// Autocomplete long tails count only when they are about drawing, and not about games, AI generators,
// digital apps, templates or pictures to copy, crafts, cartoons, explicit searches or a named franchise
// (pages never show official character art, so they could not compete).
const RELEVANT = /\b(draw\w*|sketch\w*|manga|anime|chibi|line ?art|ink\w*|shad(e|ing)|anatomy|proportions?|perspective|foreshortening|poses?|gesture|trac(e|ing)|art ?style|comic|panels?)\b/i;
// A new page also needs a search about drawing something, not just anything anime.
const DRAWING = /\b(draw\w*|sketch\w*|line ?art|ink(ing)?|shad(e|ing)|anatomy|proportions?|perspective|foreshortening|gesture|trac(e|ing)|art ?style|panels?)\b/i;
const JUNK = /\b(roblox|minecraft|fortnite|gacha|among us|tomodachi|pokemon|genshin|sonic|mario|naruto|sasuke|kakashi|itachi|goku|vegeta|dragon ball|dbz|luffy|zoro|one piece|demon slayer|tanjiro|nezuko|jujutsu|gojo|sukuna|hero academia|deku|bakugo|attack on titan|eren|levi|death note|bleach|chainsaw man|spy x family|tokyo ghoul|hunter x hunter|jojo|sailor moon|totoro|ghibli|disney|pixar|ai|chatgpt|generator|midjourney|procreate|ibis|ibispaint|clip studio|photoshop|krita|medibang|digital|digitally|ipad|tablet|apk|mod|tiktok|instagram|pinterest|reddit|youtube|wallpaper|pfp|meme|png|svg|clipart|vector|template|base|bases|ideas|examples|pictures|images|photos|pics|coloring|books?|cartoon|realistic|cosplay|costume|wig|makeup|haircut|irl|real life|at home|cardboard|blood|pdf|vol|history|ap|quiz|worksheets?|adobe|acrobat|excel|blox|tattoo|nails?|cake|kids?|children|toddler|preschool|nsfw|hentai|lewd|nude|naked|sexy|hot|boobs|thicc|fetish|hindi|urdu|tamil|telugu|bengali|meaning|definition|synonyms?|font|logo|games?)\b/i;
const relevant = (query) => RELEVANT.test(query) && !JUNK.test(query) && tokens(query).length >= 1;
const usableAsNew = (query) => relevant(query) && DRAWING.test(query) && query.split(/\s+/).length >= 3 && tokens(query).length >= 2;
// Rough organic CTR by position, used to spot titles that underperform.
const EXPECTED_CTR = [0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018];

const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
const seeds = readJson(path.join(SEO_DIR, 'keywords', 'seeds.json'));
const suggestions = readJson(path.join(DATA_DIR, 'suggestions.json'));
const gsc = readJson(path.join(DATA_DIR, 'gsc.json'));
const previous = readJson(path.join(DATA_DIR, 'backlog.json'))?.briefs || [];
const content = loadContent();

const candidates = [];
function addCandidate(c) {
    const brief = { action: 'new', secondary: [], images: [], week: 0, reasons: [], score: 0, ...c };
    brief.slug = brief.slug || slugify(brief.keyword).slice(0, 70).replace(/-+$/, '');
    candidates.push(brief);
    return brief;
}
function addSecondary(brief, query) {
    const q = query.toLowerCase();
    if (q !== brief.keyword && !brief.secondary.includes(q) && brief.secondary.length < MAX_SECONDARY) brief.secondary.push(q);
}

// Topics too broad to take the searches that refine them: "how to draw anime girls" is not "how to draw anime".
const GENERIC = new Set(['anime']);

/**
 * The candidate a query belongs to: the closest one when they share at least half of their words. A
 * generic topic only takes the queries that are about it alone.
 */
function closest(query, pool, min = 0.5) {
    let found = null;
    let bestSim = 0;
    for (const c of pool) {
        const sim = similarity(query, c.keyword);
        if (tokens(c.keyword).every((t) => GENERIC.has(t)) && sim < 1) continue;
        if (sim > bestSim) [found, bestSim] = [c, sim];
    }
    return bestSim >= min ? found : null;
}

// 1. Seed topics.
for (const cluster of seeds.clusters) {
    for (const topic of cluster.topics) {
        addCandidate({
            type: cluster.type, cluster: cluster.id, keyword: topic.keyword, slug: topic.slug, topic: topic.topic,
            secondary: [...(topic.secondary || [])], images: topic.images || [], week: topic.week || 0,
            score: cluster.priority * 30, reasons: [`seed topic (${cluster.id}, priority ${cluster.priority})`],
        });
    }
}

// 2. Autocomplete: attach long tails to the closest topic, or propose them as new pages.
if (suggestions) {
    // Each related search found adds a little weight, up to MAX_MERGE_BONUS per page.
    const merge = (brief, query) => {
        addSecondary(brief, query);
        brief.merges = (brief.merges || 0) + 1;
        if (brief.merges <= MAX_MERGE_BONUS) brief.score += 1;
    };
    for (const cluster of suggestions.clusters) {
        const seed = seeds.clusters.find((c) => c.id === cluster.id);
        for (const query of cluster.queries) {
            if (!relevant(query)) continue;
            const match = closest(query, candidates.filter((c) => c.reasons[0] !== 'autocomplete long tail'));
            if (match) {
                merge(match, query);
            } else if (seed?.allowNew && usableAsNew(query)) {
                const near = closest(query, candidates.filter((c) => c.reasons[0] === 'autocomplete long tail'));
                if (near) merge(near, query);
                else addCandidate({ type: cluster.type, cluster: cluster.id, keyword: query.toLowerCase(), score: seed.priority * 8, reasons: ['autocomplete long tail'] });
            }
        }
    }
}

// 3. Search Console: what we already rank for, and how badly.
const pageIdFromUrl = (url) => url.replace(SITE_URL, '').replace(/^\/|\/$/g, '').replace(/\/index\.html$|\.html$/, '');
const contentById = new Map(content.map((p) => [p.id, p]));
const improve = new Map();
let gscQueries = 0;
if (gsc) {
    const byQuery = new Map();
    for (const r of gsc.rows) {
        const q = byQuery.get(r.query) || { query: r.query, impressions: 0, clicks: 0, posWeighted: 0, pages: [] };
        q.impressions += r.impressions;
        q.clicks += r.clicks;
        q.posWeighted += r.position * r.impressions;
        q.pages.push(r);
        byQuery.set(r.query, q);
    }
    for (const q of byQuery.values()) {
        if (q.impressions < MIN_IMPRESSIONS) continue;
        gscQueries += 1;
        q.position = q.posWeighted / q.impressions;
        q.ctr = q.clicks / q.impressions;
        const top = q.pages.sort((a, b) => b.impressions - a.impressions)[0];
        const page = contentById.get(pageIdFromUrl(top.page));
        const stat = `${q.impressions} impressions, avg position ${q.position.toFixed(1)}`;

        if (page && q.position > 3 && q.position <= 30) {
            const brief = improve.get(page.id) || { action: 'improve', type: page.type, slug: page.slug, topic: page.topic, target: page.id, keyword: page.keyword, secondary: [], images: [], week: page.programWeek || 0, reasons: [], score: 0 };
            addSecondary(brief, q.query);
            brief.score += Math.log10(1 + q.impressions) * 15 + (q.position > 10 ? 10 : 5);
            brief.reasons.push(`"${q.query}": ${stat}`);
            improve.set(page.id, brief);
            continue;
        }
        if (page && q.position <= 10 && q.impressions >= 50 && q.ctr < EXPECTED_CTR[Math.max(0, Math.round(q.position) - 1)] * 0.6) {
            candidates.push({ action: 'ctr', type: page.type, slug: page.slug, topic: page.topic, target: page.id, keyword: page.keyword, secondary: [q.query], images: [], week: 0, score: Math.log10(1 + q.impressions) * 20, reasons: [`"${q.query}": ${stat}, CTR ${(q.ctr * 100).toFixed(1)}%`] });
            continue;
        }
        if (page || !relevant(q.query)) continue; // ranks well enough already, or not about drawing

        // Ranking only through the home page or a hub: give the query its own page.
        const match = closest(q.query, candidates.filter((c) => c.action === 'new'));
        const boost = Math.log10(1 + q.impressions) * 20 + (q.position > 10 ? 10 : 0);
        const where = pageIdFromUrl(top.page) || 'home';
        if (match) {
            addSecondary(match, q.query);
            match.score += boost;
            match.reasons.push(`GSC "${q.query}": ${stat} on ${where}`);
        } else {
            const type = /how to draw|step by step/i.test(q.query) ? 'tutorial' : 'guide';
            addCandidate({ type, cluster: 'gsc', keyword: q.query.toLowerCase(), score: boost, reasons: [`GSC "${q.query}": ${stat} on ${where}`] });
        }
    }
}
candidates.push(...improve.values());

// 4. Drop new pages we already cover, merge duplicate slugs, keep previous statuses.
const covered = (c) => content.some((p) => p.type === c.type && (p.slug === c.slug || similarity(p.keyword, c.keyword) >= 0.6));
const bySlug = new Map();
for (const c of candidates) {
    if (c.action === 'new' && covered(c)) continue;
    const id = `${c.action}:${c.type}:${c.slug}`;
    const prev = bySlug.get(id);
    if (prev) {
        prev.score += c.score;
        c.secondary.forEach((q) => addSecondary(prev, q));
        prev.reasons.push(...c.reasons);
    } else {
        bySlug.set(id, { id, ...c });
    }
}
const status = new Map(previous.map((b) => [b.id, b.status]));
const briefs = [...bySlug.values()]
    .map(({ merges, ...b }) => ({ ...b, score: Math.round(b.score), status: status.get(b.id) === 'done' && b.action === 'new' ? 'done' : status.get(b.id) || 'todo' }))
    .sort((a, b) => b.score - a.score);

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'backlog.json'), JSON.stringify({ generatedAt: new Date().toISOString(), sources: { suggestions: !!suggestions, gsc: gsc ? `${gsc.startDate} → ${gsc.endDate}` : false }, briefs }, null, 2));

const todo = briefs.filter((b) => b.status === 'todo');
const md = [
    '# SEO backlog',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} from seeds${suggestions ? ' + Google Autocomplete' : ''}${gsc ? ` + Search Console (${gsc.startDate} → ${gsc.endDate})` : ''}. ${todo.length} briefs to write, ${briefs.length - todo.length} done or skipped.`,
    '',
    '| Score | Action | Page | Target keyword | Why |',
    '| ---: | --- | --- | --- | --- |',
    ...todo.slice(0, 80).map((b) => `| ${b.score} | ${b.action} | ${TYPES[b.type].dir}/${b.slug} | ${b.keyword} | ${b.reasons.slice(0, 2).join('; ').replace(/\|/g, '/')} |`),
    '',
];
fs.writeFileSync(path.join(DATA_DIR, 'backlog.md'), md.join('\n'));

const count = (a) => todo.filter((b) => b.action === a).length;
console.log(`✅ Backlog: ${todo.length} to do (${count('new')} new, ${count('improve')} improve, ${count('ctr')} ctr)${gsc ? `, from ${gscQueries} Search Console queries` : ', no Search Console data yet'}. See seo/data/backlog.md`);
