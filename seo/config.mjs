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
};

export const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

// App screenshots an app card can show: assets/img/screens/en/<name>.webp (cropped Play Store screenshots).
export const SCREENS = {
    lessons: 'The Learn tab of SketchAI: lessons for poses, hair, mouths and eyes.',
    heads: 'A method of the SketchAI program: building the head in five steps.',
    program: 'The 9-week drawing program in SketchAI, from lines and boxes to dynamic poses.',
    session: 'A daily session of the SketchAI program, with its timer.',
    progress: 'SketchAI compares the photo of your drawing with the model.',
    paper: 'SketchAI in AR mode: the sketch over your sheet of paper, with opacity and brightness controls.',
    characters: 'The sketch collection of SketchAI: shonen, shojo, chibi and isekai characters.',
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
