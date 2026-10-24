---
name: seo-content
description: Write or improve the SEO drawing tutorials and guides of sketchai.space (how to draw anime and manga) from the keyword backlog, then build and check them. Use when asked to write SEO content, tutorials, guides, new articles or pages, to work through the SEO backlog, to improve pages that rank badly, or to refresh the SEO data.
---

# Write SEO pages for sketchai.space

The pipeline is described in `seo/README.md`; the rules every page must follow are in `seo/WRITING.md`.
Read `seo/WRITING.md` before writing the first page of the session.

## 1. Refresh the data (when asked, or when the backlog is more than a week old)

`npm run seo:refresh` pulls Search Console (skipped without a key), expands the seeds with Google
Autocomplete and re-scores `seo/data/backlog.json`. The first line of `seo:brief`'s output shows when the
backlog was generated.

## 2. Get the briefs

`npm run seo:brief -- --limit N` (5 if the user gave no number). Filters: `--type tutorial|guide`,
`--action new|improve|ctr`, `--id <brief id>`. The output gives, for each brief, the file to create or edit,
the main keyword, the real searches to cover, the illustrations to look at, the week of the app's program
that teaches the topic, and the pages you may link to.

## 3. Write each page

- Off-topic brief (not about drawing: a game, an AI generator, a digital app, a base or template to copy, a
  named franchise or character, explicit): do not write it, run `npm run seo:brief -- --skip <id>`.
- A long-tail brief that an existing page already answers (say "how fast can you learn to draw" once the
  "how long does it take" guide exists): add its searches to that page (an `improve`) instead of writing a
  near-duplicate, then skip the brief.
- Look at the illustrations before choosing them: open `assets/img/coach/<id>-640.webp` with the Read tool.
  Every step, caption and alt text must match what the drawing shows. `npm run seo:brief -- --images` lists
  them all.
- For the app card and any mention of the program, check the week with `npm run seo:brief -- --program`.
- Optionally search the web for the main keyword to see what the top results and popular video tutorials
  cover and what people ask. Use it to make the page more complete and to pick the struggles worth
  explaining; never copy, never name channels or franchises, and take facts about SketchAI only from
  `seo/WRITING.md`.
- `new`: create the JSON file at the path the brief gives, in the format of `seo/WRITING.md`, with today's
  date in `createdAt` and `updatedAt` and `"source": "claude-code"`.
- `improve`: read the existing file, expand it to fully answer the listed searches, keep what is good,
  bump `updatedAt`.
- `ctr`: rewrite only `title`, `metaDescription` and `h1`, bump `updatedAt`.
- Link only to pages from the brief's list (a planned page is fine: it renders as text until it exists).
  When writing several pages, link them to each other where it helps the reader.

## 4. Build and fix

Run `npm run seo:build`. Fix every ❌ error and ⚠️ warning it prints for the pages you wrote, then build
again until it is clean. ℹ️ lines list links to pages not written yet: fine when those pages are in the
backlog, as they become links once written. Then preview a page (`python -m http.server 8417`, or the
`site` launch configuration) and check that the steps, illustrations and captions read well, on a phone
width too.

## 5. Mark the briefs done

`npm run seo:brief -- --done <id> [<id>...]` for each page written or updated.

## 6. Report

List the pages written or updated with their URLs (`/tutorials/.../`, `/guides/.../`) and target keywords,
and any brief you skipped and why. Remind the user to review `git diff content/`, then commit and push to
deploy. Do not commit or push unless the user asks.
