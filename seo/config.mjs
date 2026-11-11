// Shared settings for the SEO pipeline (discover -> gsc -> plan -> write -> build).
import path from 'path';
import { fileURLToPath } from 'url';

export const SEO_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(SEO_DIR, '..');
export const CONTENT_DIR = path.join(ROOT, 'content');
export const DATA_DIR = path.join(SEO_DIR, 'data');

export const SITE_URL = 'https://sketchai.space';
export const SITE_NAME = 'SketchAI';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.orion.mangasketchar';

// Content types: JSON in content/<dir>/<slug>.json, pages at /<dir>/<slug>/ (an index.html, so any static
// server serves them; vercel.json adds the trailing slash). The build owns /<dir>/ and rewrites it on every run.
export const TYPES = {
    tutorial: {
        dir: 'tutorials', label: 'Tutorials', eyebrow: 'Tutorial', hubTitle: 'Anime & manga drawing tutorials',
        hubIntro: 'Step-by-step lessons to draw anime and manga with a pencil: heads, eyes, hair, bodies, hands and poses. Each one breaks the drawing into simple shapes you can practice today.',
    },
    guide: {
        dir: 'guides', label: 'Guides', eyebrow: 'Guide', hubTitle: 'Learn to draw anime & manga',
        hubIntro: 'Where to start, what to practice every day, which tools you need and how to keep improving. Practical guides for anyone learning to draw anime and manga.',
    },
    // Not written in content/: generated from the lessons of the app (seo/lib/lessons.mjs, seo/lessons.json).
    lesson: {
        dir: 'lessons', label: 'Lessons', eyebrow: 'Lesson', hubTitle: 'Manga drawing lessons',
        hubIntro: "The lessons of the SketchAI coach: one topic each, from manga eyes to hands and expressions, with illustrated chapters, the coach's tips and an exercise to do right after reading.",
    },
};

// Topics group the pages of each type on its hub, in this order (the `topic` field of a page).
export const TOPICS = {
    tutorial: {
        basics: 'Shapes, boxes & perspective',
        heads: 'Heads & faces',
        eyes: 'Eyes',
        hair: 'Hair',
        expressions: 'Mouths, noses & expressions',
        bodies: 'Bodies & anatomy',
        limbs: 'Arms, legs, hands & feet',
        poses: 'Poses & movement',
        clothes: 'Clothes & folds',
        styles: 'Characters & styles',
    },
    guide: {
        start: 'Getting started',
        practice: 'Practice & exercises',
        tools: 'Tools & materials',
        manga: 'Making manga',
    },
    lesson: {
        basics: 'Basics',
        faces: 'Faces & expressions',
        bodies: 'Bodies, hands & poses',
        manga: 'Making manga',
    },
};

export const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

// App screenshots an app card can show: assets/img/screens/en/<name>.webp (cropped Play Store screenshots,
// made by tools/build_assets.py).
export const SCREENS = {
    program: 'The 5-week program of SketchAI: the head, expressions, the body, poses, hands and clothes.',
    session: 'A daily session of the SketchAI program, step by step with its timer.',
    methods: 'A method of the SketchAI program: the manga eye built in four stages.',
    expressions: 'Week 2 of the SketchAI program: expressions, one emotion a day.',
    body: 'A session of the SketchAI program on action poses.',
    'coach-lessons': 'The lessons of SketchAI: manga eyes, expressions, hands, clothes and poses.',
    lessons: 'The Learn tab of SketchAI: drawings for poses, hair, mouths and eyes.',
    characters: 'The catalog of SketchAI: shonen, shojo, chibi and isekai characters to draw.',
    progress: 'SketchAI compares the photo of your drawing with the model.',
    daily: 'Your gallery, stats, streak and the daily leaderboard in SketchAI.',
};

// Search Console: a service account key with read access to the property (see seo/README.md).
export const GSC_SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:sketchai.space';
export const GSC_KEY_FILE = process.env.GSC_KEY_FILE || path.join(SEO_DIR, '.secrets', 'gsc-service-account.json');

/**
 * Google Play link that carries an install referrer, so Play Console's acquisition reports
 * show which page and which button brought each install (utm_campaign = page, utm_content = spot).
 */
export function playLink(page, spot) {
    const referrer = `utm_source=sketchai.space&utm_medium=seo&utm_campaign=${page}&utm_content=${spot}`;
    return `${PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}
