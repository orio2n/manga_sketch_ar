# SEO content pipeline

Brings search traffic to the site with drawing lessons that answer real searches and lead to Google Play:
`/tutorials/*` (how to draw eyes, faces, hair, hands, bodies, poses...) and `/guides/*` (how to learn to
draw anime, daily practice, tracing, tools, making manga). The pages look like a drawing-tutorial site, not
like an app's landing page: the lesson comes first, illustrated with the line drawings of the app's 9-week
program, and the app comes in once, after the steps.

```
gsc-pull ──┐
discover ──┼─> plan ─> backlog.json ─> Claude Code (/seo-content) ─> content/*.json ─> build ─> /tutorials, /guides, sitemap
seeds ─────┘
```

Pages are written by Claude Code in this repo, following `seo/WRITING.md`. In a Claude Code session, ask
for it in plain words ("write the next 5 SEO pages") or run `/seo-content`: the project skill in
`.claude/skills/seo-content/` gets the briefs, writes the JSON, builds and marks the briefs done.

No dependency to install: the scripts only need Node 20 or newer.

| Command | What it does |
| --- | --- |
| `npm run seo:refresh` | `seo:gsc` + `seo:discover` + `seo:plan`: fresh data and a re-scored backlog. |
| `npm run seo:gsc` | Pulls 90 days of Search Console queries x pages into `seo/data/gsc.json` (skips if no key). |
| `npm run seo:discover` | Expands the seed topics with Google Autocomplete into `seo/data/suggestions.json`. |
| `npm run seo:plan` | Scores everything into `seo/data/backlog.json` / `backlog.md`: new pages, pages to `improve` (ranking 4-30), titles to rewrite (`ctr`). |
| `npm run seo:brief -- --limit 5` | Prints the next briefs (keyword, searches to cover, illustrations, program week, pages to link). `--type tutorial`, `--action improve` or `--id <brief id>` to pick; `--images` lists every illustration, `--program` the app's program. |
| `npm run seo:brief -- --done <id>` | Marks briefs as written (`--skip <id>` to drop one). |
| `npm run seo:build` | Renders `content/` into `tutorials/` and `guides/` (one `index.html` per page), the two hubs, `sitemap.xml` and `robots.txt`, and reports content errors. |

## Setup

1. **Search Console**: add the `sketchai.space` property (a Domain property, verified with a DNS record),
   then submit `https://sketchai.space/sitemap.xml` in *Sitemaps*.
2. **Search Console data for the plan** (recommended, so the plan targets the queries where the site ranks
   badly):
   - In Google Cloud, enable the *Google Search Console API*, create a service account and download a JSON
     key to `seo/.secrets/gsc-service-account.json` (git-ignored). The service account of the CosplayAI
     pipeline can be reused: copy its key there.
   - In Search Console > Settings > Users and permissions, add the service account's email as a
     *Restricted* user of the sketchai.space property.
   - A Domain property is assumed (`sc-domain:sketchai.space`). For a URL-prefix property, set
     `GSC_SITE_URL=https://sketchai.space/`.

## Weekly routine

1. `npm run seo:refresh`.
2. In Claude Code: "write the next 5 SEO pages" (or `/seo-content`).
3. Preview the pages (`python -m http.server 8417`, then http://localhost:8417/tutorials/), read the new
   and changed files in `content/` (`git diff content/`), then commit and push: Vercel deploys the site.

## Notes

- `content/*.json` is the source of truth; the build wipes and regenerates `tutorials/` and `guides/`, so
  never edit the HTML there. It also rewrites `sitemap.xml` and `robots.txt`.
- The illustrations come from the app: `python tools/extract_coach.py` reads the program
  (`CoachProgram.kt` + `strings_coach.xml`), downloads its drawings to `assets/img/coach/` and writes
  `seo/data/coach.json`. Re-run it when the program changes, then rebuild. Other images can be added in
  `seo/images.json` (see `seo/WRITING.md`).
- `plan` keeps brief statuses between runs and drops new-page briefs a written page already covers.
  Autocomplete searches about games, AI generators, digital apps, drawing bases, kids' crafts, explicit
  content or a named franchise are ignored (`JUNK` in `seo/plan.mjs`): the pages never show official
  character art, so they could not compete there.
- Seed topics live in `seo/keywords/seeds.json`, with the illustrations and the program week picked for
  each one. They follow what the most-watched manga drawing tutorials teach and what the app's program
  covers.
- Pages are served as `/tutorials/<slug>/`; `vercel.json` redirects `/tutorials/<slug>` to it, so each page
  has one URL.
- Every Google Play link carries `utm_campaign=<page>` and `utm_content=<spot>` (header, card, sidebar,
  footer) in its install referrer, so Play Console > Acquisition shows which pages bring installs.
- `seo/`, `content/` and `package.json` are not deployed (`.vercelignore`).
