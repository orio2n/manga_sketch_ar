// The app's drawing coach (its 5-week program, its practice track and its lessons) and the illustrations
// pages may use: the coach's (seo/data/coach.json, generated from the Android app by tools/extract_coach.py)
// plus the extra ones listed in seo/images.json.
import fs from 'fs';
import path from 'path';
import { DATA_DIR, SEO_DIR } from '../config.mjs';
import { similarity } from './text.mjs';

let data;

function load() {
    if (data) return data;
    const coach = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'coach.json'), 'utf8'));
    const extra = JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'images.json'), 'utf8'));
    data = { ...coach, images: { ...coach.images, ...extra.images } };
    return data;
}

/** Image by id: { src, small?, width, height, title, text? }. */
export function image(id) {
    return load().images[id];
}

export function images() {
    return load().images;
}

/** Whether an image comes from the app's coach (copied to assets/img/coach/ by tools/extract_coach.py). */
export function isCoachImage(id) {
    return Boolean(load().images[id]?.preview);
}

/** Week of the program: { number, phase, title, goal, summary, deliverable, image, days, tips, lessons }. */
export function week(number) {
    return load().weeks.find((w) => w.number === number);
}

export function weeks() {
    return load().weeks;
}

/** The practice track (build a character), a week of no phase: { title, goal, days, lessons }. */
export function practice() {
    return load().practice;
}

/** Lesson of the Exercises tab by id: { id, free, title, summary, intro, chapters, tips, practice }. */
export function topic(id) {
    return load().topics.find((t) => t.id === id);
}

export function topics() {
    return load().topics;
}

/** Images whose title or text are closest to a query, best first (suggestions for briefs). */
export function imagesFor(query, limit = 8) {
    return Object.entries(images())
        .map(([id, img]) => ({ id, ...img, score: Math.max(similarity(query, img.title), similarity(query, `${img.title} ${img.text || ''}`)) }))
        .filter((img) => img.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/** Program weeks closest to a query. */
export function weeksFor(query, limit = 2) {
    return weeks()
        .map((w) => ({ ...w, score: Math.max(similarity(query, w.title), similarity(query, `${w.title} ${w.goal} ${w.days.map((d) => d.title).join(' ')}`)) }))
        .filter((w) => w.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/** Lessons of the Exercises tab closest to a query. */
export function topicsFor(query, limit = 2) {
    return topics()
        .map((t) => ({ ...t, score: Math.max(similarity(query, t.title), similarity(query, `${t.title} ${t.summary} ${t.chapters.map((c) => c.title).join(' ')}`)) }))
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
