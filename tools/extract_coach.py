"""Builds the tutorials' illustration library from the app's drawing coach.

Reads the 5-week program and its practice track (CoachProgram.kt), the lessons of the Exercises tab
(CoachTopics.kt) and their English texts (strings_coach.xml), then:
- writes seo/data/coach.json: the program, the practice track and the lessons in English, with the id
  and caption of every illustration, read by the SEO pipeline (seo/lib/images.mjs);
- keeps a copy of every illustration in seo/.cache/coach/ (git-ignored): <id>.webp and a 640 px
  <id>-640.webp to look at while writing;
- copies to assets/img/coach/ only the illustrations that content/*.json uses, and removes the others,
  so the site ships only the pictures it shows.

Run it when the program changes, and again after writing pages that use new illustrations:
`python tools/extract_coach.py` (--force downloads everything again).
Pictures marked `// TEMP` in CoachProgram.kt stand in for drawings not made yet: they are left out.
"""
import html
import io
import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

from PIL import Image

APP = Path(r"C:/Users/romai/AndroidStudioProjects/SketchAI/app/src/main")
SITE = Path(__file__).resolve().parent.parent
CACHE = SITE / "seo/.cache/coach"
OUT_IMG = SITE / "assets/img/coach"
OUT_JSON = SITE / "seo/data/coach.json"
CONTENT = SITE / "content"
FORCE = "--force" in sys.argv
sys.stdout.reconfigure(encoding="utf-8")

# --- Texts -------------------------------------------------------------------------------------
strings = {}
for m in re.finditer(r'<string name="([^"]+)"[^>]*>(.*?)</string>',
                     (APP / "res/values/strings_coach.xml").read_text(encoding="utf-8"), re.S):
    value = html.unescape(m.group(2)).replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
    strings[m.group(1)] = value.strip()


def text(ref):
    """`R.string.x` → its English text, None for a missing argument."""
    if not ref:
        return None
    name = re.fullmatch(r"R\.string\.(\w+)", ref.strip())
    if not name:
        raise ValueError(f"not a string resource: {ref}")
    return strings[name.group(1)]


def string_name(ref):
    return re.fullmatch(r"R\.string\.(\w+)", ref.strip()).group(1)


# --- A small reader for the Kotlin calls of CoachProgram.kt and CoachTopics.kt ------------------
def closing(src, start):
    """Index of the parenthesis that closes the one at src[start]."""
    depth, i, quoted = 0, start, False
    while i < len(src):
        c = src[i]
        if quoted:
            if c == "\\":
                i += 1
            elif c == '"':
                quoted = False
        elif c == '"':
            quoted = True
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("unbalanced parentheses")


def split_args(body):
    """Top-level arguments of a call: positional ones in order, named ones in a dict."""
    args, depth, quoted, current = [], 0, False, ""
    for i, c in enumerate(body):
        if quoted:
            current += c
            if c == '"' and body[i - 1] != "\\":
                quoted = False
            continue
        if c == '"':
            quoted = True
        elif c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        if c == "," and depth == 0:
            args.append(current)
            current = ""
        else:
            current += c
    args.append(current)
    positional, named = [], {}
    for arg in args:
        arg = re.sub(r"(?m)^\s*//[^\n]*", "", arg).strip()  # whole-line comments only: URLs hold "//"
        if not arg:
            continue
        m = re.match(r"^(\w+)\s*=\s*(.*)$", arg, re.S)
        if m and not arg.startswith('"'):
            named[m.group(1)] = m.group(2).strip()
        else:
            positional.append(arg)
    return positional, named


def calls(src, names):
    """Top-level calls to any of `names` in src, in order: (name, body, start offset)."""
    found, i = [], 0
    pattern = re.compile(r"\b(" + "|".join(names) + r")\(")
    while True:
        m = pattern.search(src, i)
        if not m:
            return found
        end = closing(src, m.end() - 1)
        found.append((m.group(1), src[m.end():end], m.start()))
        i = end + 1


def list_items(value):
    """`listOf(a, b)` → [a, b]."""
    if not value:
        return []
    m = re.match(r"listOf\((.*)\)\s*$", value.strip(), re.S)
    return split_args(m.group(1))[0] if m else []


def url(value):
    """The Cloudinary URL of a string argument; None for a `// TEMP` stand-in (see mark_temp)."""
    m = re.fullmatch(r'"(https://res\.cloudinary\.com/[^"]+)"', (value or "").strip())
    return m.group(1) if m else None


def mark_temp(src):
    """A `// TEMP <name>` comment marks the picture right after it as a stand-in for a drawing not made
    yet: that use of it is left out, while the same picture used elsewhere for its own subject is kept."""
    return re.sub(r'(?m)(^[ \t]*// TEMP [^\n]*\n(?:(?!"https://).)*?)"https://', r'\1"TEMP:https://', src, flags=re.S)


# --- Illustrations -----------------------------------------------------------------------------
images = {}       # id → {url | drawable, title, text}
by_source = {}    # url or drawable → id: a picture used twice keeps its first id


def image(image_id, source, title, caption=None, drawable=False):
    """Registers an illustration and returns its id (None without a picture)."""
    if not source:
        return None
    if source in by_source:
        return by_source[source]
    images[image_id] = {"drawable" if drawable else "url": source, "title": title, "text": caption}
    by_source[source] = image_id
    return image_id


def drawable(ref):
    m = re.fullmatch(r"R\.drawable\.(\w+)", (ref or "").strip())
    return m.group(1) if m else None


def lesson(body, base_prefix=""):
    """A CoachLesson: a method explained step by step (a week's chapter, or a lesson's chapter)."""
    _, a = split_args(body)
    title_ref = a["title"]
    base = base_prefix + re.match(r"coach_(?:topic_)?(\w+)_title", string_name(title_ref)).group(1).replace("_", "-")
    title, intro = text(title_ref), text(a.get("intro"))
    picture = image(base, url(a.get("imageUrl")), title, intro) or (
        image(base, drawable(a.get("art")), title, intro, drawable=True) if a.get("art") else None)
    steps = []
    for n, (_, step, _) in enumerate(calls(a.get("steps", ""), ["CoachLessonStep"]), 1):
        p, _ = split_args(step)
        st, sx = text(p[0]), text(p[1])
        steps.append({"title": st, "text": sx,
                      "image": image(f"{base}-{n}", url(p[2]) if len(p) > 2 else None, f"{title}: {st}", sx)})
    return {
        "title": title, "intro": intro, "image": picture, "steps": steps,
        "bullets": [text(b) for b in list_items(a.get("bullets"))],
        "callout": text(a.get("callout")),
    }


def session_step(name, body, day_id, day_title, n):
    """One step of a session: a warm-up, a method to read, a drawing to follow, a challenge."""
    p, a = split_args(body)
    if name == "coachWarmup":
        title, instructions, seconds, pictures, extra = "Warm-up", text(p[0]), 30, [url(p[1])], {}
    else:
        title, instructions = text(p[0]), text(p[1])
        seconds = int(a["seconds"]) if "seconds" in a else int(p[2]) * 60
        pictures = [url(p[3])] + [url(u) for u in list_items(a.get("moreImageUrls"))]
        extra = a
    method = []
    for _, m, _ in calls(extra.get("method", ""), ["CoachLessonStep"]):
        mp, _ = split_args(m)
        method.append({"title": text(mp[0]), "text": text(mp[1])})
    caption = instructions + ("" if not method else " " + " ".join(f"{m['title']}: {m['text']}" for m in method))
    ids = []
    for k, picture in enumerate(pictures):
        suffix = "" if k == 0 else "abcdefgh"[k]
        image_id = image(f"{day_id}-{n}{suffix}", picture, f"{day_title}, {title.lower() if title.isupper() else title}", caption)
        if image_id and image_id not in ids:
            ids.append(image_id)
    return {
        "title": title, "instructions": instructions, "seconds": seconds, "images": ids,
        "dayExercise": extra.get("isDayExercise") == "true", "method": method, "tip": text(extra.get("tip")),
    }


def week(body):
    _, a = split_args(body)
    number = int(a["number"])
    title, goal = text(a["title"]), text(a["goal"])
    cover = image(f"w{number}" if number else "practice", url(a["imageUrl"]), title, goal)
    days = []
    for _, day, _ in calls(a["days"], ["CoachDay"]):
        p, d = split_args(day)
        day_id = f"w{p[0]}d{p[1]}"
        day_title, summary = text(p[2]), text(p[3])
        picture = image(day_id, url(p[4]), day_title, summary)
        steps = [session_step(name, step, day_id, day_title, n)
                 for n, (name, step, _) in enumerate(calls(d["steps"], ["coachWarmup", "CoachSessionStep"]), 1)]
        days.append({"id": day_id, "title": day_title, "summary": summary, "image": picture,
                     "minutes": (sum(s["seconds"] for s in steps) + 59) // 60, "steps": steps})
    return {
        "number": number, "phase": int(a["phase"]), "title": title, "goal": goal,
        "summary": text(a.get("summary")), "deliverable": text(a.get("deliverable")), "image": cover,
        "days": days, "tips": [text(t) for t in list_items(a.get("tips"))],
        "lessons": [lesson(body) for _, body, _ in calls(a.get("lessons", ""), ["CoachLesson"])],
    }


program_kt = mark_temp((APP / "java/com/orion/mangasketchar/CoachProgram.kt").read_text(encoding="utf-8"))
topics_kt = mark_temp((APP / "java/com/orion/mangasketchar/CoachTopics.kt").read_text(encoding="utf-8"))

phases = []
for _, body, _ in calls(program_kt[program_kt.index("val coachPhases"):], ["CoachPhase"]):
    p, _ = split_args(body)
    phases.append({"number": int(p[0]), "title": text(p[1]), "summary": text(p[2]), "intro": text(p[3])})
weeks_src = program_kt[program_kt.index("val coachWeeks"):program_kt.index("val coachPractice")]
weeks = [week(body) for _, body, _ in calls(weeks_src, ["CoachWeek"])]
practice = week(calls(program_kt[program_kt.index("val coachPractice"):], ["CoachWeek"])[0][1])
routines = []
for _, body, _ in calls(program_kt[program_kt.index("val coachRoutines"):], ["CoachRoutine"]):
    p, _ = split_args(body)
    routines.append({"exercise": text(p[0]), "count": [int(p[1]), int(p[2])], "skill": text(p[3])})

topics = []
for _, body, _ in calls(topics_kt[topics_kt.index("val coachTopics"):], ["CoachTopic"]):
    _, a = split_args(body)
    topic_id = a["id"].strip('"')
    title = text(a["title"])
    cover = image(f"topic-{topic_id}", url(a.get("coverUrl")), title, text(a["summary"])) or image(
        f"topic-{topic_id}", drawable(a.get("cover")), title, text(a["summary"]), drawable=True)
    topics.append({
        "id": topic_id, "free": a.get("free") == "true", "title": title, "summary": text(a["summary"]),
        "intro": text(a["intro"]), "image": cover, "minutes": int(a["minutes"]),
        "chapters": [lesson(c, "topic-") for _, c, _ in calls(a["chapters"], ["CoachLesson"])],
        "tips": [text(t) for t in list_items(a.get("tips"))],
        "practice": text(a["practice"]), "practiceMinutes": int(a["practiceMinutes"]),
    })

# --- Download the illustrations to the cache (line art, flattened on white) ---------------------
CACHE.mkdir(parents=True, exist_ok=True)


def fetch(info):
    if "drawable" in info:
        return Image.open(APP / "res/drawable-nodpi" / f"{info['drawable']}.webp")
    original = re.sub(r"/upload/f_auto,q_auto/", "/upload/", info["url"])
    original = re.sub(r"/f_auto,q_auto/", "/", original)
    with urllib.request.urlopen(original, timeout=60) as res:
        return Image.open(io.BytesIO(res.read()))


SOURCES = CACHE / "sources.json"  # id → picture, so an id that changes picture is downloaded again
cached = json.loads(SOURCES.read_text(encoding="utf-8")) if SOURCES.exists() else {}
library = {}
for image_id, info in images.items():
    full, small = CACHE / f"{image_id}.webp", CACHE / f"{image_id}-640.webp"
    source = info.get("url") or info.get("drawable")
    if FORCE or not (full.exists() and small.exists()) or cached.get(image_id) != source:
        im = fetch(info).convert("RGBA")
        flat = Image.new("RGB", im.size, "white")
        flat.paste(im, mask=im.getchannel("A"))
        flat.save(full, "WEBP", quality=86, method=6)
        flat.resize((640, round(flat.height * 640 / flat.width)), Image.LANCZOS).save(small, "WEBP", quality=84, method=6)
        print(f"⬇️  {image_id}", flush=True)
        cached[image_id] = source
        SOURCES.write_text(json.dumps(cached, indent=0), encoding="utf-8")
    width, height = Image.open(full).size
    library[image_id] = {
        "src": f"/assets/img/coach/{image_id}.webp", "small": f"/assets/img/coach/{image_id}-640.webp",
        "preview": f"seo/.cache/coach/{image_id}-640.webp",
        "width": width, "height": height, "title": info["title"], "text": info["text"],
    }

OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
OUT_JSON.write_text(json.dumps({
    "_doc": "Generated by tools/extract_coach.py from the app's CoachProgram.kt, CoachTopics.kt and strings_coach.xml. Do not edit by hand.",
    "phases": phases, "weeks": weeks, "practice": practice, "topics": topics, "routines": routines, "images": library,
}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# --- The covers of the weeks, for the program on the home page ------------------------------------
WEEKS = SITE / "assets/img/weeks"
WEEKS.mkdir(parents=True, exist_ok=True)
for w in weeks:
    if w["image"]:
        cover = CACHE / f"{w['image']}-640.webp"
        if FORCE or not (WEEKS / f"w{w['number']}.webp").exists() or (WEEKS / f"w{w['number']}.webp").read_bytes() != cover.read_bytes():
            shutil.copyfile(cover, WEEKS / f"w{w['number']}.webp")

# --- "What you'll draw" on the home page: drawings of the program, one or two a week ---------------
DRAW = SITE / "assets/img/draw"
STRIP = ["w1d2", "w1d5-4", "w2d1-2c", "w2d5", "w3d5-4", "w4", "w4d4-4", "w4d5-4", "w5d1", "w5d5-4"]
DRAW.mkdir(parents=True, exist_ok=True)
for file in DRAW.glob("*.webp"):
    if file.stem not in STRIP:
        file.unlink()
for image_id in STRIP:
    src, dst = CACHE / f"{image_id}-640.webp", DRAW / f"{image_id}.webp"
    if FORCE or not dst.exists() or dst.read_bytes() != src.read_bytes():
        shutil.copyfile(src, dst)

# --- Ship only the illustrations the pages use ---------------------------------------------------
# The lessons are pages of their own (seo/lib/lessons.mjs): every picture of a published lesson, and
# the cover of the others, shown on the hub.
lessons_conf = json.loads((SITE / "seo/lessons.json").read_text(encoding="utf-8"))
used = set()
for t in topics:
    used.add(t["image"])
    if t["free"] or lessons_conf["fullPro"]:
        for chapter in t["chapters"]:
            used.add(chapter["image"])
            used.update(step["image"] for step in chapter["steps"])
for page in CONTENT.rglob("*.json"):
    data = json.loads(page.read_text(encoding="utf-8"))
    used.add(data.get("heroImage"))
    for section in data.get("sections", []):
        used.add(section.get("image"))
        used.update(step.get("image") for step in section.get("steps", []))
used = {i for i in used if i in library}
OUT_IMG.mkdir(parents=True, exist_ok=True)
for image_id in sorted(used):
    for name in (f"{image_id}.webp", f"{image_id}-640.webp"):
        if FORCE or not (OUT_IMG / name).exists() or (OUT_IMG / name).read_bytes() != (CACHE / name).read_bytes():
            shutil.copyfile(CACHE / name, OUT_IMG / name)
removed = 0
for file in OUT_IMG.glob("*.webp"):
    if re.sub(r"-640$", "", file.stem) not in used:
        file.unlink()
        removed += 1

days = sum(len(w["days"]) for w in weeks)
size = sum(p.stat().st_size for p in OUT_IMG.glob("*.webp")) // 1024
print(f"✅ {len(weeks)} weeks ({days} sessions), {len(topics)} lessons, {len(library)} illustrations → {OUT_JSON.relative_to(SITE)}")
print(f"   {len(used)} used by the pages in {OUT_IMG.relative_to(SITE)} ({size} KB){f', {removed} files removed' if removed else ''}")
