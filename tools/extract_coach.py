"""Builds the tutorials' illustration library from the app's drawing coach (CoachProgram.kt + strings_coach.xml).

Downloads every illustration of the 9-week program (weeks, daily exercises, session steps, methods) to
assets/img/coach/<id>.webp and <id>-640.webp, and writes seo/data/coach.json: the program in English
with the id, size and caption of each image, read by the SEO pipeline (seo/lib/coach.mjs).
Re-run it when the program changes: `python tools/extract_coach.py` (--force downloads everything again).
"""
import html
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

APP = Path(r"C:/Users/romai/AndroidStudioProjects/SketchAI/app/src/main")
SITE = Path(__file__).resolve().parent.parent
OUT_IMG = SITE / "assets/img/coach"
OUT_JSON = SITE / "seo/data/coach.json"
FORCE = "--force" in sys.argv

kt = (APP / "java/com/orion/mangasketchar/CoachProgram.kt").read_text(encoding="utf-8")
strings = {}
for m in re.finditer(r'<string name="([^"]+)">(.*?)</string>', (APP / "res/values/strings_coach.xml").read_text(encoding="utf-8"), re.S):
    strings[m.group(1)] = html.unescape(m.group(2)).replace("\\'", "'")

S = r"R\.string\.(\w+)"
URL = r'"(https://res\.cloudinary\.com/[^"]+)"'
images = {}


def text(name):
    return strings[name] if name else None


def string_list(chunk, field):
    m = re.search(field + r"\s*=\s*listOf\(([^)]*)\)", chunk)
    return [strings[n] for n in re.findall(S, m.group(1))] if m else []


def image(image_id, url, title, caption=None):
    """Registers an illustration (downloaded later) and returns its id."""
    images[image_id] = {"url": url, "title": title, "text": caption}
    return image_id


def split(chunk, marker):
    parts = chunk.split(marker)
    return parts[1:]


# --- Phases, session, routines ---
phases = [
    {"number": int(n), "title": text(t), "summary": text(s), "intro": text(i)}
    for n, t, s, i in re.findall(r"CoachPhase\((\d+), " + S + ", " + S + ", " + S + r"\)", kt)
]
session = []
for title, instructions, minutes, url in re.findall(r"CoachSessionStep\(" + S + ", " + S + r", (\d+),\s*" + URL, kt):
    step_id = "block-" + re.match(r"coach_block_(\w+)_title", title).group(1)
    session.append({"title": text(title), "instructions": text(instructions), "minutes": int(minutes),
                    "image": image(step_id, url, text(title), text(instructions))})
routines = [
    {"exercise": text(e), "count": [int(lo), int(hi)], "skill": text(s)}
    for e, lo, hi, s in re.findall(r"CoachRoutine\(" + S + r", (\d+), (\d+), " + S + r"\)", kt)
]

# --- Weeks, with their days and lessons ---
weeks = []
for chunk in split(kt[kt.index("val coachWeeks"):kt.index("val coachRoutines")], "CoachWeek("):
    number, phase = map(int, re.search(r"number = (\d+), phase = (\d+)", chunk).groups())
    title, goal = re.search(r"title = " + S + r", goal = " + S, chunk).groups()
    week_url = re.search(r"imageUrl = " + URL, chunk).group(1)
    days = [
        {"id": f"w{w}d{d}", "title": text(t), "exercise": text(e), "image": image(f"w{w}d{d}", url, text(t), text(e))}
        for w, d, t, e, url in re.findall(r"CoachDay\((\d+), (\d+), " + S + ", " + S + r", " + URL + r"\)", chunk)
    ]
    lessons = []
    lesson_part = chunk[chunk.index("lessons = "):] if "lessons = " in chunk else ""
    for lesson in split(lesson_part, "CoachLesson("):
        lesson_title = re.search(r"title = " + S, lesson).group(1)
        intro = re.search(r"intro = " + S, lesson)
        callout = re.search(r"callout = " + S, lesson)
        lesson_url = re.search(r"imageUrl = " + URL, lesson)
        base = re.match(r"coach_(\w+)_title", lesson_title).group(1).replace("_", "-")
        steps = []
        for st, sx, url in re.findall(r"CoachLessonStep\(" + S + ", " + S + r", " + URL + r"\)", lesson):
            n = re.match(r"coach_\w+_s(\d+)_title", st).group(1)
            steps.append({"title": text(st), "text": text(sx), "image": image(f"{base}-{n}", url, text(st), text(sx))})
        lessons.append({
            "title": text(lesson_title),
            "intro": text(intro.group(1)) if intro else None,
            "image": image(base, lesson_url.group(1), text(lesson_title), text(intro.group(1)) if intro else None) if lesson_url else None,
            "steps": steps,
            "bullets": string_list(lesson, "bullets"),
            "callout": text(callout.group(1)) if callout else None,
        })
    weeks.append({
        "number": number, "phase": phase, "title": text(title), "goal": text(goal),
        "image": image(f"w{number}", week_url, text(title), text(goal)),
        "days": days, "tips": string_list(chunk, "tips"), "lessons": lessons,
    })

# --- Download and convert the illustrations (1376x768 line art on white) ---
OUT_IMG.mkdir(parents=True, exist_ok=True)
library = {}
for image_id, info in images.items():
    full, small = OUT_IMG / f"{image_id}.webp", OUT_IMG / f"{image_id}-640.webp"
    if FORCE or not (full.exists() and small.exists()):
        original = info["url"].replace("/upload/f_auto,q_auto/", "/upload/")
        with urllib.request.urlopen(original, timeout=60) as res:
            im = Image.open(io.BytesIO(res.read())).convert("RGBA")
        flat = Image.new("RGB", im.size, "white")
        flat.paste(im, mask=im.getchannel("A"))
        flat.save(full, "WEBP", quality=86, method=6)
        flat.resize((640, round(flat.height * 640 / flat.width)), Image.LANCZOS).save(small, "WEBP", quality=84, method=6)
        print(f"⬇️  {image_id}")
    width, height = Image.open(full).size
    library[image_id] = {"src": f"/assets/img/coach/{image_id}.webp", "small": f"/assets/img/coach/{image_id}-640.webp",
                         "width": width, "height": height, "title": info["title"], "text": info["text"]}

OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
OUT_JSON.write_text(json.dumps({
    "_doc": "Generated by tools/extract_coach.py from the app's CoachProgram.kt and strings_coach.xml. Do not edit by hand.",
    "phases": phases, "session": session, "routines": routines, "weeks": weeks, "images": library,
}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
size = sum(p.stat().st_size for p in OUT_IMG.glob("*.webp")) // 1024
print(f"✅ {len(weeks)} weeks, {sum(len(w['days']) for w in weeks)} sessions, {len(library)} illustrations ({size} KB) → {OUT_JSON.relative_to(SITE)}")
