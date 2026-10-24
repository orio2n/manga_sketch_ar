// HTML templates of the generated pages: a clean, editorial tutorial site (assets/css/tutorial.css) with the
// brand's fonts and colors, but none of the landing page's effects. The app appears in the header, in one
// card after the steps, in the sidebar and in the footer; the rest of the page is the tutorial.
import { LEVELS, SCREENS, SITE_NAME, SITE_URL, TOPICS, TYPES, playLink } from '../config.mjs';
import { escapeHtml as esc, inline, plain, slugify } from './text.mjs';
import { image, week } from './images.mjs';

const OG_IMAGE = `${SITE_URL}/assets/img/og-en.jpg`;
const LOGO = `${SITE_URL}/apple-touch-icon.png`;
const STATIC_LINKS = new Set(['/', '/privacy.html', '/tos.html']);
// Figures fill the article column (720px), and the whole width of a phone minus its gutters.
const FIGURE_SIZES = '(max-width: 760px) calc(100vw - 32px), 720px';

/** Resolver for [text](/link) in content: only pages that exist (or static routes) become links. */
export function linkResolver(knownIds) {
    return (href) => {
        const [route, hash] = href.split('#');
        const anchor = hash ? `#${hash}` : '';
        if (STATIC_LINKS.has(route)) return href;
        const id = route.replace(/^\/|\/$/g, '');
        if (!id) return `/${anchor}`;
        if (knownIds.has(id) || Object.values(TYPES).some((t) => t.dir === id)) return `/${id}/${anchor}`;
        return null;
    };
}

const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-cross" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M7 7l10 10M17 7L7 17"/></symbol>
  <symbol id="i-pencil" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></symbol>
  <symbol id="i-timer" viewBox="0 0 24 24"><path fill="currentColor" d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.96 8.96 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></symbol>
  <symbol id="i-level" viewBox="0 0 24 24"><path fill="currentColor" d="M17 4h3v16h-3V4zM5 14h3v6H5v-6zm6-5h3v11h-3V9z"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path fill="currentColor" d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10z"/></symbol>
  <symbol id="i-bulb" viewBox="0 0 24 24"><path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></symbol>
  <symbol id="i-list" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 26">
    <path fill="#00b7ff" d="M1.5.8L13.5 13 1.5 25.2z"/>
    <path fill="#00d26a" d="M1.5.8l13.33 7.56L13.5 13z"/>
    <path fill="#ffd400" d="M14.83 8.36L23 13l-8.17 4.64L13.5 13z"/>
    <path fill="#ff3a44" d="M13.5 13l1.33 4.64L1.5 25.2z"/>
  </symbol>
</svg>`;

function playBadge(page, spot) {
    return `<a class="badge-play" href="${playLink(page, spot)}" target="_blank" rel="noopener">${icon('play', 'badge-icon')}<span><small>Get it on</small><strong>Google Play</strong></span></a>`;
}

function header(page, current) {
    const nav = Object.values(TYPES)
        .map((t) => `<a href="/${t.dir}/"${current === t.dir ? ' aria-current="page"' : ''}>${esc(t.label)}</a>`)
        .join('');
    return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/"><img src="/assets/img/logo.webp" alt="" width="34" height="34"><span>${SITE_NAME}</span></a>
    <nav class="nav" aria-label="Main">${nav}<a class="nav-app" href="/">The app</a></nav>
    <a class="get-app" href="${playLink(page, 'header')}" target="_blank" rel="noopener"><span>Get the app</span>${icon('arrow')}</a>
  </div>
</header>`;
}

function footer(page, ctx) {
    const column = (type) => {
        const t = TYPES[type];
        const items = ctx.footerLinks[type].map((p) => `<li><a href="/${p.id}/">${esc(p.navLabel)}</a></li>`).join('');
        return `<div class="footer-col"><h2><a href="/${t.dir}/">${esc(t.label)}</a></h2><ul>${items}</ul></div>`;
    };
    return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/"><img src="/assets/img/logo.webp" alt="" width="34" height="34" loading="lazy"><span>${SITE_NAME}</span></a>
      <p>Learn to draw anime and manga, one sketch at a time.</p>
      ${playBadge(page, 'footer')}
    </div>
    ${column('tutorial')}
    ${column('guide')}
    <div class="footer-col"><h2>${SITE_NAME}</h2><ul><li><a href="/">The app</a></li><li><a href="/privacy.html">Privacy</a></li><li><a href="/tos.html">Terms of use</a></li><li><a href="mailto:orion.extensions@gmail.com">Contact</a></li></ul></div>
  </div>
  <div class="wrap footer-bottom"><span>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</span><span>Google Play and the Google Play logo are trademarks of Google LLC.</span></div>
</footer>`;
}

/** Full HTML document around a page body. */
function htmlDocument({ id, current, title, description, canonical, jsonLd, body, ctx, preload }) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="max-image-preview:large">
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/img/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="/assets/fonts/poppins-extrabold.woff" as="font" type="font/woff" crossorigin>
${preload ? `  <link rel="preload" as="image" href="${preload.src}"${preload.small ? ` imagesrcset="${preload.small} 640w, ${preload.src} ${preload.width}w" imagesizes="${FIGURE_SIZES}"` : ''}>\n` : ''}  <link rel="stylesheet" href="/assets/css/tutorial.css">
${jsonLd.map((data) => `  <script type="application/ld+json">${JSON.stringify(data)}</script>`).join('\n')}
</head>
<body>
${SPRITE}
<a class="skip-link" href="#main">Skip to content</a>
${header(id, current)}
<main id="main">
${body}
</main>
${footer(id, ctx)}
</body>
</html>
`;
}

function breadcrumbs(items) {
    return {
        html: `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
            .map((c, i) => (i < items.length - 1 ? `<li><a href="${c.url}">${esc(c.name)}</a></li>` : `<li aria-current="page">${esc(c.name)}</li>`))
            .join('')}</ol></nav>`,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE_URL + c.url })),
        },
    };
}

function img(id, { alt, eager = false, capped = false } = {}) {
    const im = image(id);
    const srcset = im.small ? ` srcset="${im.small} 640w, ${im.src} ${im.width}w" sizes="${FIGURE_SIZES}"` : '';
    const loading = eager ? ' fetchpriority="high"' : ' loading="lazy"';
    const style = capped ? ` style="max-width:${im.width}px"` : '';
    return `<img src="${im.src}"${srcset} alt="${esc(alt || im.title)}" width="${im.width}" height="${im.height}"${style}${loading} decoding="async">`;
}

/** An illustration with its caption. Images narrower than the column keep their width instead of stretching. */
function figure(id, caption, md, eager = false) {
    if (!id) return '';
    const narrow = image(id).width < 720;
    return `<figure class="figure${narrow ? ' narrow' : ''}">${img(id, { alt: caption && plain(caption), eager, capped: narrow })}${caption ? `<figcaption>${md(caption)}</figcaption>` : ''}</figure>`;
}

function callout(kind, label, iconId, text, md) {
    if (!text) return '';
    return `<div class="callout callout-${kind}" role="note">${icon(iconId)}<div><strong>${label}</strong><p>${md(text)}</p></div></div>`;
}

/** Card linking to a page, with its hero illustration as thumbnail and its level on it. */
export function card(p) {
    const im = p.heroImage && image(p.heroImage);
    const thumb = im
        ? `<img src="${im.small || im.src}" alt="" width="${im.small ? 640 : im.width}" height="${im.small ? Math.round((im.height * 640) / im.width) : im.height}" loading="lazy" decoding="async">`
        : icon('pencil', 'card-mark');
    return `<a class="card" href="/${p.id}/">
      <div class="card-thumb">${thumb}${LEVELS[p.level] ? `<span class="card-level">${LEVELS[p.level]}</span>` : ''}</div>
      <div class="card-body"><p class="card-meta">${esc(TOPICS[p.type][p.topic])}</p><h3>${esc(p.h1)}</h3><p>${esc(p.cardText)}</p></div>
    </a>`;
}

// A hub lists its pages by topic once it has more than this many; below, one grid reads better.
const GROUP_FROM = 12;

/** The app, once in the article: what to practice in SketchAI for this tutorial. */
function appCard(page, md) {
    const visual = page.cta.visual || 'lessons';
    const w = page.programWeek ? week(page.programWeek) : null;
    return `<aside class="app-card" aria-label="Practice with ${SITE_NAME}">
      <div class="app-card-copy">
        <p class="app-card-kicker"><img src="/assets/img/logo.webp" alt="" width="26" height="26" loading="lazy">Practice with ${SITE_NAME}</p>
        <p class="app-card-title">${esc(page.cta.headline)}</p>
        <p>${md(page.cta.text)}</p>
        ${w ? `<p class="app-card-week"><span>Week ${w.number} of the program</span> ${esc(w.title)}: ${esc(w.goal.charAt(0).toLowerCase() + w.goal.slice(1))}</p>` : ''}
        ${playBadge(page.id, 'card')}
        <p class="fine">Free to download on Android · No account needed</p>
      </div>
      <div class="app-card-visual"><img src="/assets/img/screens/en/${visual}.webp" alt="${esc(SCREENS[visual])}" width="720" height="1032" loading="lazy" decoding="async"></div>
    </aside>`;
}

function sideApp(page) {
    return `<div class="side-app">
      <img src="/assets/img/logo.webp" alt="" width="44" height="44" loading="lazy">
      <p class="side-app-title">Learn to draw with ${SITE_NAME}</p>
      <p>Hundreds of guided anime sketches and a 9-week program, with your own pencil on real paper.</p>
      <a class="btn" href="${playLink(page.id, 'sidebar')}" target="_blank" rel="noopener">Get the app${icon('arrow')}</a>
    </div>`;
}

function readMinutes(page) {
    const words = JSON.stringify([page.summary, page.keyTakeaways, page.sections, page.faq]).split(/\s+/).length;
    return Math.max(2, Math.round(words / 230));
}

function formatDate(iso) {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Article page of a tutorial or a guide. */
export function renderArticle(page, ctx) {
    const md = (t) => inline(t, linkResolver(ctx.knownIds));
    const type = TYPES[page.type];
    const url = `/${page.id}/`;
    const crumbs = breadcrumbs([
        { name: 'Home', url: '/' },
        { name: type.label, url: `/${type.dir}/` },
        { name: page.navLabel, url },
    ]);
    const sections = page.sections.map((s) => ({ ...s, anchor: slugify(s.heading).slice(0, 60) }));
    // The app card goes right after the steps, when the reader is ready to practice.
    const stepsAt = sections.findIndex((s) => s.steps?.length);
    const cardAfter = stepsAt > -1 ? stepsAt : Math.min(2, sections.length - 1);

    const sectionHtml = sections.map((s, i) => {
        // Numbered for an order, crossed out for mistakes to avoid, plain bullets otherwise.
        const items = (s.list || []).map((li) => md(li));
        const list = !items.length ? ''
            : s.listStyle === 'steps' ? `<ol class="num-list">${items.map((li) => `<li><span>${li}</span></li>`).join('')}</ol>`
            : s.listStyle === 'avoid' ? `<ul class="avoid-list">${items.map((li) => `<li>${icon('cross')}<span>${li}</span></li>`).join('')}</ul>`
            : `<ul class="dot-list">${items.map((li) => `<li>${li}</li>`).join('')}</ul>`;
        const steps = s.steps?.length
            ? `<ol class="steps">${s.steps.map((st, n) => `<li class="step">
            <h3><span class="step-num">Step ${n + 1}</span>${esc(st.title)}</h3>
            <p>${md(st.text)}</p>
            ${figure(st.image, st.caption, md)}
          </li>`).join('')}</ol>`
            : '';
        return `<section id="${s.anchor}">
          <h2>${esc(s.heading)}</h2>
          ${(s.body || []).map((p) => `<p>${md(p)}</p>`).join('\n          ')}
          ${figure(s.image, s.caption, md)}
          ${list}
          ${steps}
          ${callout('tip', 'Tip', 'bulb', s.tip, md)}
          ${callout('mistake', 'Common mistake', 'alert', s.mistake, md)}
          ${callout('exercise', 'Practice exercise', 'target', s.exercise, md)}
        </section>${i === cardAfter ? appCard(page, md) : ''}`;
    }).join('\n');

    const toc = [...sections.map((s) => [s.anchor, s.heading]), ...(page.faq?.length ? [['faq', 'FAQ']] : [])];
    const tocList = `<ol>${toc.map(([a, h]) => `<li><a href="#${a}">${esc(h)}</a></li>`).join('')}</ol>`;
    const hero = page.heroImage ? image(page.heroImage) : null;

    const facts = [
        page.level && `<li>${icon('level')}${LEVELS[page.level]}</li>`,
        page.minutes && `<li>${icon('timer')}${page.minutes} min practice</li>`,
        `<li>${icon('book')}${readMinutes(page)} min read</li>`,
        `<li>${icon('calendar')}Updated <time datetime="${page.updatedAt}">${formatDate(page.updatedAt)}</time></li>`,
    ].filter(Boolean).join('');

    const needs = page.materials?.length
        ? `<div class="needs"><p>${icon('pencil')}You'll need</p><ul>${page.materials.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>`
        : '';
    const takeaways = page.keyTakeaways?.length
        ? `<div class="takeaways"><h2>Key takeaways</h2><ul>${page.keyTakeaways.map((t) => `<li>${icon('check')}<span>${md(t)}</span></li>`).join('')}</ul></div>`
        : '';
    const faq = page.faq?.length
        ? `<section class="faq" id="faq"><h2>Frequently asked questions</h2>${page.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${md(f.a)}</p></details>`).join('')}</section>`
        : '';

    const related = (page.related || []).map((id) => ctx.byId.get(id)).filter(Boolean);
    for (const p of ctx.suggestRelated(page)) if (related.length < 3 && !related.includes(p)) related.push(p);

    const body = `<article class="article">
  <div class="wrap article-grid">
    <div class="article-main">
      <header class="article-head">
        ${crumbs.html}
        <p class="kicker">${esc(type.eyebrow)} · ${esc(TOPICS[page.type][page.topic])}</p>
        <h1>${esc(page.h1)}</h1>
        <p class="lead">${md(page.summary)}</p>
        <ul class="facts">${facts}</ul>
      </header>
      ${figure(page.heroImage, page.heroCaption, md, true)}
      ${needs}
      ${takeaways}
      <details class="toc-mobile"><summary>${icon('list')}On this page</summary>${tocList}</details>
      <div class="prose">
        ${sectionHtml}
        ${faq}
      </div>
    </div>
    <aside class="article-side">
      <nav class="toc" aria-label="On this page"><p>On this page</p>${tocList}</nav>
      ${sideApp(page)}
    </aside>
  </div>
  ${related.length ? `<section class="related"><div class="wrap"><h2>Keep learning</h2><div class="card-grid">${related.map(card).join('')}</div></div></section>` : ''}
</article>`;

    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: page.h1,
            description: page.metaDescription,
            image: hero ? [SITE_URL + hero.src] : [OG_IMAGE],
            datePublished: page.createdAt,
            dateModified: page.updatedAt,
            inLanguage: 'en',
            author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: LOGO } },
            mainEntityOfPage: SITE_URL + url,
            keywords: [page.keyword, ...(page.secondaryKeywords || [])].join(', '),
        },
        crumbs.jsonLd,
    ];
    const stepSection = sections.find((s) => s.steps?.length >= 3);
    if (stepSection) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: page.h1,
            description: plain(page.summary),
            ...(hero && { image: SITE_URL + hero.src }),
            ...(page.minutes && { totalTime: `PT${page.minutes}M` }),
            ...(page.materials?.length && { supply: page.materials.map((m) => ({ '@type': 'HowToSupply', name: m })) }),
            step: stepSection.steps.map((st, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                name: st.title,
                text: plain(st.text),
                url: `${SITE_URL}${url}#${stepSection.anchor}`,
                ...(st.image && { image: SITE_URL + image(st.image).src }),
            })),
        });
    }
    if (page.faq?.length) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
        });
    }

    return htmlDocument({ id: page.id, current: type.dir, title: page.title, description: page.metaDescription, canonical: SITE_URL + url, jsonLd, body, ctx, preload: hero });
}

/** Index page of a section: its pages grouped by topic. `groups` = [{ topic, heading, pages }]. */
export function renderHub(type, groups, ctx) {
    const t = TYPES[type];
    const url = `/${t.dir}/`;
    const crumbs = breadcrumbs([
        { name: 'Home', url: '/' },
        { name: t.label, url },
    ]);
    const withPages = groups.filter((g) => g.pages.length);
    const all = withPages.flatMap((g) => g.pages);
    const shown = all.length > GROUP_FROM ? withPages : all.length ? [{ topic: 'all', heading: '', pages: all }] : [];
    const other = Object.entries(TYPES).find(([key]) => key !== type)[1];
    const hubCard = {
        id: t.dir,
        programWeek: 0,
        cta: {
            headline: 'Practice every lesson on paper',
            text: `${SITE_NAME} gives you hundreds of guided anime sketches and a 9-week program of 10 to 20 minute sessions. Draw with your own pencil, then compare your drawing with the model.`,
            visual: type === 'tutorial' ? 'lessons' : 'program',
        },
    };
    const body = `<section class="hub-head">
  <div class="wrap">
    ${crumbs.html}
    <p class="kicker">${esc(t.label)}</p>
    <h1>${esc(t.hubTitle)}</h1>
    <p class="lead">${esc(t.hubIntro)}</p>
    ${shown.length > 1 ? `<nav class="topic-nav" aria-label="Topics">${shown.map((g) => `<a href="#${g.topic}">${esc(g.heading)}</a>`).join('')}</nav>` : ''}
  </div>
</section>
<div class="wrap hub-body">
  ${shown.length
      ? shown.map((g) => `<section class="hub-group" id="${g.topic}">${g.heading ? `<h2>${esc(g.heading)}</h2>` : ''}<div class="card-grid">${g.pages.map(card).join('')}</div></section>`).join('\n  ')
      : `<p class="hub-empty">New ${esc(t.label.toLowerCase())} are on their way. In the meantime, see the <a href="/${other.dir}/">${esc(other.label.toLowerCase())}</a>.</p>`}
  ${appCard(hubCard, esc)}
</div>`;
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t.hubTitle,
            description: t.hubIntro,
            url: SITE_URL + url,
            inLanguage: 'en',
            mainEntity: { '@type': 'ItemList', itemListElement: all.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${p.id}/`, name: p.h1 })) },
        },
        crumbs.jsonLd,
    ];
    return htmlDocument({ id: t.dir, current: t.dir, title: `${t.hubTitle} | ${SITE_NAME}`, description: t.hubIntro, canonical: SITE_URL + url, jsonLd, body, ctx });
}
