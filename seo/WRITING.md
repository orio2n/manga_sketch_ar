# Writing guide for sketchai.space tutorials and guides

Read this before writing or editing any file in `content/`. Each page targets one search query and must
deserve to rank: the most useful lesson on the web for that query, the kind of page a good drawing teacher
would publish on their own site. The page teaches first; SketchAI comes in once, as the way to keep
practicing. `content/tutorials/how-to-draw-anime-eyes.json` and `content/guides/how-to-learn-to-draw-anime.json`
are good references for format and tone.

## Product facts (use these and nothing beyond them)

SketchAI is an Android app (Google Play, Android 7.0 or newer, 16 languages) to learn to draw anime and
manga. What sells it, in this order: **a catalog of hundreds of characters to draw**, **drawings to learn
each detail** (the Learn tab), **a 5-week exercise program** to learn the manga style, **lessons**, and
**seeing your progress while competing with the community** by drawing every day (the daily leaderboard).
Never pitch it as "draw on real paper", "no tablet needed" or "your own pencil": it is not a selling point.

- **The catalog**: hundreds of guided sketches of anime and manga characters: shonen heroes, shojo characters,
  villains and chibis. Browse by style (Shonen, Shojo, Chibi, Isekai) or filter by favorite series; every
  sketch has a level (easy, mid or hard), and the feed suggests sketches from the manga the user likes. New
  characters arrive regularly: a daily poll lets users vote for the next character to draw.
- **Learn tab**: guided sketches for each part of a character: Eyes, Hair, Mouth, Pose, Clothes and Pets
  (not to be confused with the lessons of the Exercises tab, below).
- **How the user draws** (a fact to state when a page needs it, never an argument): with a pencil, the
  sketch on screen as the model, or traced in **AR mode** with the phone above the sheet. Tools: size,
  rotation, opacity, mirror, grid and screen brightness. The camera image is processed on the phone; it is
  neither recorded nor sent.
- **Progress**: take a photo of the finished drawing and compare it with the model (hold a button to see
  the difference), rate each drawing's difficulty, keep every finished drawing in a gallery next to its
  model, and see stats (drawings finished, time spent drawing, favorite categories).
- **Community and daily habit**: a leaderboard of the day and of the week (the number of different drawings
  each user finished and photographed; a drawing done in a few minutes does not count), a streak with
  gentle reminders, and the daily poll.
- **The 5-week program** (Exercises tab), a beginner manga coaching program with a short session every day
  (3 to 14 minutes, with timers): a warm-up of 30 seconds, a method to read step by step, a drawing to
  follow, "your turn" and a challenge. Two phases. *The face*: week 1, the head from every angle (the head
  as a volume, the eyes, the nose, the mouth, the hair); week 2, expressions (joy, sadness, anger, surprise
  and fear, manga codes). *The body*: week 3, the body and its proportions (proportions, the torso, the
  arms, legs and feet, the full body); week 4, poses (the line of action, foreshortening, action poses);
  week 5, hands and clothes (the hand in blocks, folds, hanging fabric, the outfit). Each week ends with a
  drawing of the user's own character: their head from three angles, an expression sheet, the full body,
  three poses that tell a story, then the complete character dressed in their signature pose.
- **Practice** (Exercises tab, optional): "Build a character", 6 sessions to do whenever you like: volumes,
  the box in perspective, the jointed mannequin, measuring in heads, shapes that tell the character, from
  sketch to clean drawing.
- **Lessons** (Exercises tab): 17 lessons on one theme each, to read in any order, each with chapters,
  the coach's tips and an exercise: drawing basics, manga eyes, expressions, hands, clothes, poses, hair,
  chibi, perspective, light and shadow, inking, feet, the manga page, composition, screentones, character
  design and action effects. `npm run seo:brief -- --program` prints every session, method and lesson:
  quote them accurately, and name a lesson in `appLesson`.
- **Free and PRO**: free to download. The basic sketches, the program, the practice track and four
  lessons (drawing basics, manga eyes, expressions, hands) are free; without PRO, the program opens one
  session a day, and each week takes 7 days. SketchAI PRO, an optional subscription with a free trial,
  unlocks every sketch and lesson, opens the whole program right away (you can start at your level) and
  removes the ads. Subscriptions are cancelled in Google Play.
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

- Use only the images listed by `npm run seo:brief -- --images`: the line drawings of the app's program,
  practice track and lessons, and the extra images of `seo/images.json`. **Look at every image you use**
  (open `seo/.cache/coach/<id>-640.webp` with the Read tool) and write captions and steps that match what
  it really shows. Ids: `w1` is a week's cover, `w1d2` a session's main drawing, `w1d2-3` (and `-3b`,
  `-3c`) the pictures of its step 3; `head-1`, `limbs-2`... the methods at the bottom of a week's page;
  `topic-eyes` a lesson's cover and `topic-eyes-build` one of its chapters.
- The tutorials teach the methods of the app, which have been checked: when a page and the app disagree
  on a construction, a proportion or a landmark, follow the app.
- After writing, run `python tools/extract_coach.py`: it copies the illustrations the pages use to
  `assets/img/coach/` (and removes the unused ones). The build fails on a missing one.
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
| `programWeek` | The week of the SketchAI program that teaches the topic (1-5), shown on the app card; `0` if none. |
| `appLesson` | Optional: the id of the lesson of the Exercises tab on the topic (`eyes`, `hands`...), shown on the app card. |
| `cta` | `{ "headline" (<= 8 words), "text" (1-2 sentences: what to practice in SketchAI for this topic), "visual" }`. `visual` is the app screenshot shown: `program`, `session`, `methods`, `expressions`, `body`, `coach-lessons` (the lessons of the Exercises tab), `lessons` (the Learn tab), `characters`, `progress` or `daily`. |
| `createdAt`, `updatedAt` | Creation date and last real update. |
| `source` | `"claude-code"`. |
