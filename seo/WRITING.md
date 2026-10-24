# Writing guide for sketchai.space tutorials and guides

Read this before writing or editing any file in `content/`. Each page targets one search query and must
deserve to rank: the most useful lesson on the web for that query, the kind of page a good drawing teacher
would publish on their own site. The page teaches first; SketchAI comes in once, as the way to keep
practicing. `content/tutorials/how-to-draw-anime-eyes.json` and `content/guides/how-to-learn-to-draw-anime.json`
are good references for format and tone.

## Product facts (use these and nothing beyond them)

SketchAI is an Android app (Google Play, Android 7.0 or newer, 16 languages) to learn to draw anime and
manga with a pencil, on real paper.

- **Sketches**: hundreds of guided sketches of anime and manga characters: shonen heroes, shojo characters,
  villains and chibis. Browse by style (Shonen, Shojo, Chibi, Isekai) or filter by favorite series; every
  sketch has a level (easy, mid or hard), and the feed suggests sketches from the manga the user likes. New
  characters arrive regularly: a daily poll lets users vote for the next character to draw.
- **Lessons** (Learn tab): guided sketches for each part of a character: Eyes, Hair, Mouth, Pose, Clothes
  and Pets.
- **Drawing on paper**: the user draws with their own pencil in their own sketchbook; no stylus or tablet.
  The sketch stays on screen as the model. In **AR mode**, the phone sits on a stand (a mug, a stack of
  books) above the sheet: the camera shows the paper with the sketch on top, and the user traces while
  looking at the screen. Tools: size, rotation, opacity, mirror, grid and screen brightness. The camera
  image is processed on the phone; it is neither recorded nor sent.
- **Progress**: take a photo of the finished drawing and compare it with the model (hold a button to see
  the difference), rate each drawing's difficulty, keep every finished drawing in a gallery next to its
  model, and see stats (drawings finished, time spent drawing, favorite categories).
- **Daily habit**: a streak with gentle reminders, a leaderboard of the day and of the week, and the daily
  poll.
- **The 9-week program** (Exercises tab): 5 sessions a week of 10 to 20 minutes, with a timer: warm-up
  (1 min), volumes (4 min), the technical exercise of the day (11 min) and a reference study (4 min).
  Three phases: Construction (weeks 1-3: lines and shapes, the box method and perspective, from shapes to
  the mannequin), Heads and faces (weeks 4-6: the head as a volume, facial features, difficult angles) and
  Body and movement (weeks 7-9: torso and pelvis, arms, legs, hands and feet, gesture and dynamic poses).
  Each week explains its methods step by step, like a drawing book. `npm run seo:brief -- --program`
  prints every week, exercise and method: quote them accurately.
- **Free and PRO**: free to download. The basic sketches, lessons and the program are free; a new week of
  the program opens every 7 days. SketchAI PRO, an optional subscription with a free trial, unlocks every
  sketch and lesson, opens every week of the program right away (you can start at your level) and removes
  the ads. Subscriptions are cancelled in Google Play.
- **Privacy**: no account, email or password. Photos of drawings stay on the phone.

SketchAI does **not** give AI feedback or grade drawings, generate images, offer video lessons, work as a
digital drawing app (no brushes, layers or stylus drawing), or run on iPhone, iPad or the web. Never suggest
otherwise, never quote prices, and never mention AI features. The build rejects sentences that pair
SketchAI with these.

## Writing rules

- **Teach first.** Someone who never installs the app must be able to follow the page and draw better
  today. Give concrete instructions: which shape to start with, where lines go, proportions, angles, how
  many to draw, what to erase. Explain why a step matters.
- **Voice**: a patient manga drawing teacher. American English, second person, short paragraphs (2-4
  sentences), active verbs. No emojis, no hype, no filler or clichés ("in today's world", "unleash",
  "elevate", "game-changer", "dive in", "whether you're... or...").
- **Honest about learning**: drawing takes practice. No promises like "draw like a pro in 5 minutes";
  encourage and never shame.
- **Pencil and paper**: readers draw on paper. Mention digital drawing only when the query needs it, without
  naming apps.
- **No invented facts**: no statistics, studies, quotes, anecdotes about artists, prices or dates. Do not
  name or describe other apps, YouTube channels, courses, books or brands; describe kinds of tools and
  resources instead.
- **No franchises**: never name anime or manga series, their characters or their artists (the pages show no
  official art and must not look affiliated). Describe styles instead: "shonen heroes", "shojo heroines".
- **SketchAI in moderation**: at most two mentions in the body (usually one sentence where practicing in
  the app fits naturally, plus the final section of a guide), and in the FAQ only when someone would really
  ask. The build adds the app card after the steps from `cta` and `programWeek`: do not repeat it in the text.
- Text strings may use inline markdown only: `**bold**`, `*italic*` and internal links
  `[text](/tutorials/slug)`. No headings, lists or HTML inside strings.
- **Internal links**: 2 to 5 in the body, to the pages listed by `seo:brief` (or `/tutorials`, `/guides`).
  A link to a planned page that does not exist yet renders as plain text and becomes a link once that page
  is built.
- **Off-topic briefs** (not about drawing: a video game, an AI generator, a digital app, a drawing base or
  template to copy, a named franchise or character, explicit searches): do not write them, mark them skipped.

## Illustrations

- Use only the images listed by `npm run seo:brief -- --images`: the line drawings of the app's program
  (`assets/img/coach/`) and the extra images of `seo/images.json`. **Look at every image you use** (open
  `assets/img/coach/<id>-640.webp` with the Read tool) and write captions and steps that match what it
  really shows.
- A step gets the illustration that shows it, when one exists. Never use an image that shows something else
  to fill a step; a step without an image is fine. Do not use the same image twice on a page.
- Captions: one sentence about what to notice ("The eye line wraps around the head as it turns."). They
  double as alt text.
- If no illustration fits a tutorial's steps, write it only if the steps can be followed from the text
  alone; otherwise skip the brief and say it needs illustrations. To add one: save it under
  `assets/img/tutorials/` as `.webp` (white background, about 1376 px wide, plus a 640 px copy) and add an
  entry to `seo/images.json`.

## Page types

- **tutorial** (`content/tutorials/`): "how to draw X". Lead with the method (`summary`). Then what makes X
  look anime, the step-by-step section (5-9 steps: a short title, 2-4 sentences and an illustration when one
  fits; the build numbers them), variations (angles, male and female, styles), common mistakes, a practice
  exercise with counts and a time (`exercise`), and the FAQ. 1200-2000 words.
- **guide** (`content/guides/`): learning, practice, tools and manga-making questions. Lead with the
  answer, then go deeper with practical steps, examples and a plan the reader can start today. Close with a
  section on practicing with SketchAI when it fits. 1200-2200 words.

## Brief actions

- **new**: create `content/<dir>/<slug>.json` with the slug from the brief.
- **improve**: the page ranks on page 2-3 for the listed searches. Expand it so it fully answers them (new
  sections, sharper headings, FAQ entries), keep what is good, and bump `updatedAt`.
- **ctr**: the page ranks on page 1 but few people click. Rewrite only `title`, `metaDescription` and `h1`
  to be more compelling for the listed searches, and bump `updatedAt`.

## JSON format

Every field is required (use `[]`, `""` or `0` when empty); in sections, the optional keys can be left out.
Dates are `YYYY-MM-DD`.

| Field | Content |
| --- | --- |
| `type`, `slug` | Page type (`tutorial` or `guide`) and slug from the brief. |
| `topic` | Hub group. Tutorials: `basics`, `heads`, `eyes`, `hair`, `expressions`, `bodies`, `limbs`, `poses`, `clothes`, `styles`. Guides: `start`, `practice`, `tools`, `manga`. |
| `keyword` | Main search query. |
| `secondaryKeywords` | 3-8 related searches the page covers. |
| `title` | `<title>`, at most 60 characters, main keyword near the start. |
| `metaDescription` | 130-155 characters. |
| `h1` | Natural, specific headline; also the title of the page's card on hubs. |
| `navLabel` | 1-4 words, used in breadcrumbs and in the footer. |
| `cardText` | One sentence under 110 characters, used on cards. |
| `summary` | 2-3 sentences that directly answer the query (the featured-snippet answer, shown under the H1). |
| `level` | Tutorials: `beginner`, `intermediate` or `advanced`. Guides: `""`. |
| `minutes` | Tutorials: practice time in minutes (e.g. `30`). Guides: `0`. |
| `materials` | Tutorials: 2-5 short items ("HB pencil", "Eraser", "Printer paper"). Guides: `[]`. |
| `heroImage`, `heroCaption` | Illustration id shown under the title, and its caption (`""` without one). |
| `keyTakeaways` | 3-5 short bullets. |
| `sections` | 5-9 `{ "heading", "body": [paragraphs], "image", "caption", "list": [items], "listStyle": "bullets" \| "steps" \| "avoid", "steps": [{ "title", "text", "image", "caption" }], "tip", "mistake", "exercise" }`. Headings as questions when they match searches. `listStyle` `steps` numbers the items, `avoid` crosses them out (a list of mistakes). A tutorial has one section with 3-9 `steps`; `tip`, `mistake` and `exercise` are one-paragraph callouts. |
| `faq` | 4-6 `{ "q", "a" }`: real searched questions (use the secondary keywords), 1-3 sentence answers. |
| `related` | 0-3 page ids from the brief's list, e.g. `"tutorials/how-to-draw-an-anime-face"`. |
| `programWeek` | The week of the SketchAI program that teaches the topic (1-9), shown on the app card; `0` if none. |
| `cta` | `{ "headline" (<= 8 words), "text" (1-2 sentences: what to practice in SketchAI for this topic), "visual" }`. `visual` is the app screenshot shown: `lessons`, `heads`, `program`, `session`, `progress`, `paper`, `characters` or `daily`. |
| `createdAt`, `updatedAt` | Creation date and last real update. |
| `source` | `"claude-code"`. |
