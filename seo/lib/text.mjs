// Small text helpers shared by the SEO scripts.

export function slugify(text) {
    return text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Words that carry no topic: "how to draw anime eyes step by step for beginners" is about anime eyes.
const STOPWORDS = new Set([
    'a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'and', 'or', 'with', 'how', 'what', 'is', 'are', 'my', 'your', 'i',
    'do', 'does', 'can', 'best', 'ideas', 'idea', 'draw', 'drawing', 'drawings', 'step', 'steps', 'by', 'easy', 'simple',
    'beginner', 'beginners', 'tutorial', 'tutorials', 'guide', 'way', 'ways', 'from', 'any', 'different', 'at', 'it',
    'you', 'that', 'this',
]);
// Same topic, other word: manga eyes and anime eyes are one page.
const SYNONYMS = { manga: 'anime' };

/** Meaningful words of a query, singularized crudely, for overlap scoring. */
export function tokens(text) {
    return slugify(text)
        .split('-')
        .filter((w) => w && !STOPWORDS.has(w))
        .map((w) => SYNONYMS[w] || w)
        .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

/** Jaccard overlap of two queries' meaningful words (0..1). */
export function similarity(a, b) {
    const ta = new Set(tokens(a));
    const tb = new Set(tokens(b));
    if (!ta.size || !tb.size) return 0;
    let shared = 0;
    for (const t of ta) if (tb.has(t)) shared += 1;
    return shared / (ta.size + tb.size - shared);
}

/**
 * Inline markdown used in content JSON: **bold**, *italic* and [text](/internal/link).
 * Text is escaped first; links must resolve through `resolveLink` (unknown targets are rendered as plain text).
 */
export function inline(text, resolveLink) {
    let html = escapeHtml(text);
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
        const url = resolveLink(href);
        return url ? `<a href="${url}">${label}</a>` : label;
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return html;
}

/** Text of inline markdown without its markup (for JSON-LD and alt texts). */
export function plain(text) {
    return String(text).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '');
}

export function today() {
    return new Date().toISOString().slice(0, 10);
}
