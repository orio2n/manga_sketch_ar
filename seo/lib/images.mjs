// The app's 9-week drawing program and the illustrations pages may use: the coach's (seo/data/coach.json,
// generated from the Android app by tools/extract_coach.py) plus the extra ones listed in seo/images.json.
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

/** Week of the program: { number, phase, title, goal, image, days, tips, lessons }. */
export function week(number) {
    return load().weeks.find((w) => w.number === number);
}

export function weeks() {
    return load().weeks;
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
