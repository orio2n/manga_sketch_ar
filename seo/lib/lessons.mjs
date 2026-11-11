// The lessons of the app's Exercises tab, published as pages of the site (/lessons/<slug>/). They are not
// written in content/: each one is built from seo/data/coach.json (tools/extract_coach.py), so the site
// follows the app's lessons as they are, and seo/lessons.json says how (slug, hub group, level, related
// pages, and whether the PRO lessons get a page or only a card on the hub).
import fs from 'fs';
import path from 'path';
import { DATA_DIR, SEO_DIR } from '../config.mjs';
import { topics } from './images.mjs';

const CONF = JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'lessons.json'), 'utf8'));

/** The day coach.json was last extracted: the date the lessons were last updated from the app. */
const UPDATED = fs.statSync(path.join(DATA_DIR, 'coach.json')).mtime.toISOString().slice(0, 10);

const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const upperFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// Sentences of the app that do not hold on the site (seo/lessons.json "skip"), dropped from the pages.
const kept = (text) => text && !(CONF.skip || []).some((s) => text.includes(s));
const noDot = (t) => t.replace(/[.!]\s*$/, '');

/** Cuts a text at a word, under `max` characters. */
function clip(text, max) {
    if (text.length <= max) return text;
    return text.slice(0, max - 1).replace(/[\s,;:]+\S*$/, '') + '…';
}

/** A lesson as a page of the site, in the format of content/ (see seo/WRITING.md). */
function toPage(t, conf, count) {
    const chapters = t.chapters.map((c) => ({ ...c, callout: kept(c.callout) ? c.callout : null, bullets: c.bullets.filter(kept) }));
    const tips = t.tips.filter(kept);
    const callouts = chapters.map((c) => c.callout).filter(Boolean);
    const sections = chapters.map((c) => ({
        heading: c.title,
        body: c.intro ? [c.intro] : [],
        image: c.image || undefined,
        // The chapter's intro says what its picture shows; without one, the heading above already does.
        caption: c.image && c.intro ? noDot(c.intro.split(/(?<=[.!?])\s/)[0]) + '.' : undefined,
        steps: c.steps.length ? c.steps.map((s) => ({ title: s.title, text: s.text, image: s.image || undefined })) : undefined,
        list: c.bullets.length ? c.bullets : undefined,
        listStyle: c.bullets.length ? 'bullets' : undefined,
        tip: c.callout || undefined,
    }));
    sections.push({ heading: "The coach's tips", list: tips, listStyle: 'bullets' });
    sections.push({
        heading: 'Practice right now',
        body: [`Once the lesson is read, draw this exercise: it takes about ${t.practiceMinutes} minutes.`],
        exercise: t.practice,
    });
    const h1 = `${t.title}: ${lowerFirst(noDot(t.summary))}`;
    return {
        type: 'lesson',
        slug: conf.slug,
        id: `lessons/${conf.slug}`,
        topic: conf.topic,
        keyword: conf.keyword,
        secondaryKeywords: [],
        title: clip(`${upperFirst(conf.keyword)}: a free drawing lesson`, 60),
        metaDescription: clip(`${h1}. ${chapters.length} illustrated chapters, the coach's tips and a ${t.practiceMinutes}-minute exercise, from the SketchAI drawing coach.`, 155),
        h1,
        navLabel: t.title,
        cardText: t.summary,
        summary: t.intro,
        level: conf.level,
        minutes: t.practiceMinutes,
        materials: [],
        heroImage: t.image,
        heroCaption: t.summary,
        keyTakeaways: (callouts.length >= 3 ? callouts : [...callouts, ...tips]).slice(0, 4),
        sections,
        faq: [],
        related: conf.related || [],
        programWeek: 0,
        appLesson: t.id,
        cta: {
            headline: 'Keep practicing in SketchAI',
            text: `This lesson is one of the ${count} lessons of SketchAI's Exercises tab${t.free ? ', free to read' : ''}, next to a 5-week program of short daily sessions and hundreds of characters to draw.`,
            visual: 'coach-lessons',
        },
        createdAt: UPDATED,
        updatedAt: UPDATED,
        source: 'app',
    };
}

/**
 * The lessons of the app: `pages` are the lessons published as pages; `inApp` are the PRO lessons left
 * to the app (when fullPro is false), shown on the hub as cards to Google Play.
 */
export function loadLessons() {
    const all = topics();
    const pages = [];
    const inApp = [];
    for (const t of all) {
        const conf = CONF.lessons[t.id];
        if (!conf) throw new Error(`seo/lessons.json has no entry for the app's lesson "${t.id}"`);
        if (t.free || CONF.fullPro) pages.push(toPage(t, conf, all.length));
        else inApp.push({ id: t.id, title: t.title, summary: t.summary, image: t.image, topic: conf.topic });
    }
    return { pages, inApp };
}
