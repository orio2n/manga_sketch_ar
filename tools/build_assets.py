"""Copies and optimizes the app's art into the website's assets folder."""
import math
import random
import shutil
from pathlib import Path

from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont

RES = Path(r"C:/Users/romai/AndroidStudioProjects/SketchAI/app/src/main/res")
GEN = Path(r"C:/Users/romai/Documents/SCRIPTS/sketchai/generate_playstore")
SITE = Path(r"C:/Users/romai/Documents/PROJETS/sketchai")
IMG = SITE / "assets/img"
FONTS = SITE / "assets/fonts"

for d in (IMG / "onboarding", IMG / "program", IMG / "screens", IMG / "store", FONTS):
    d.mkdir(parents=True, exist_ok=True)


def webp(src, dst, width=None, quality=82, crop=None):
    im = Image.open(src)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    if crop:
        im = im.crop(crop)
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)


# Logo and icons
logo = Image.open(RES / "drawable/ic_logo.png").convert("RGBA")
webp(RES / "drawable/ic_logo.png", IMG / "logo.webp", width=256, quality=88)
logo.resize((180, 180), Image.LANCZOS).convert("RGB").save(SITE / "apple-touch-icon.png", optimize=True)
logo.resize((64, 64), Image.LANCZOS).save(IMG / "favicon.png", optimize=True)
logo.save(SITE / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# Onboarding art, already sized for phones by generate_onboarding.py
nodpi = RES / "drawable-nodpi"
for f in nodpi.glob("onboarding_*.webp"):
    shutil.copy(f, IMG / "onboarding" / f.name.replace("onboarding_", "").replace("_", "-"))
for f in nodpi.glob("coach_upsell_*.webp"):
    shutil.copy(f, IMG / "program" / f.name.replace("coach_upsell_", ""))
shutil.copy(nodpi / "premium_hero.webp", IMG / "premium-hero.webp")
webp(RES / "drawable/tutorial.png", IMG / "tutorial.webp", width=760)

# Store screenshots: full for the gallery, without their caption for the feature rows
coach = {
    "program": "screenshot_1_coach_program.png",
    "session": "screenshot_2_daily_session.png",
    "heads": "screenshot_3_heads_and_bodies.png",
    "lessons": "screenshot_4_drawing_lessons.png",
    "characters": "screenshot_5_characters.png",
    "progress": "screenshot_6_see_your_progress.png",
    "daily": "screenshot_7_draw_every_day.png",
}
for lang in ("fr", "en"):
    out = IMG / "screens" / lang
    out.mkdir(exist_ok=True)
    shots = {k: GEN / "output_coach" / lang / v for k, v in coach.items()}
    shots["paper"] = GEN / "output" / lang / "screenshot_3_draw_on_paper.png"
    for name, src in shots.items():
        webp(src, IMG / "store" / f"{name}-{lang}.webp", width=540, quality=80)
        webp(src, out / f"{name}.webp", width=720, quality=82, crop=(0, 372, 1080, 1920))
    Image.open(GEN / "output_coach" / lang / "feature_graphic_1024x500.png").convert("RGB").save(
        IMG / f"og-{lang}.jpg", quality=86, optimize=True, progressive=True
    )

# Manga speed lines of the store background (PremiumArt.kt's speedLines, same seed)
rng = random.Random(11)
center, inner, reach = 500, 150, 760
rays = []
for _ in range(120):
    a = rng.uniform(0, 2 * math.pi)
    half = rng.uniform(0.004, 0.016)
    r0 = inner * (1 + rng.random() * 0.35)
    points = [
        (center + math.cos(a) * r0, center + math.sin(a) * r0),
        (center + math.cos(a - half) * reach, center + math.sin(a - half) * reach),
        (center + math.cos(a + half) * reach, center + math.sin(a + half) * reach),
    ]
    rays.append("M%.1f %.1fL%.1f %.1fL%.1f %.1fZ" % (points[0] + points[1] + points[2]))
(IMG / "speedlines.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path fill="#fff" d="%s"/></svg>' % "".join(rays)
)

# Poppins, subset to Latin (French and English) and saved as WOFF
unicodes = "U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2122,U+2192,U+2726"
for weight in ("SemiBold", "Bold", "ExtraBold", "Black"):
    font = TTFont(GEN / "assets/fonts" / f"Poppins-{weight}.ttf")
    opts = subset.Options()
    opts.flavor = "woff"
    opts.layout_features = ["kern", "liga", "calt"]
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(unicodes))
    sub.subset(font)
    font.flavor = "woff"
    font.save(FONTS / f"poppins-{weight.lower()}.woff")

for p in sorted(SITE.rglob("*")):
    if p.is_file() and ".git" not in p.parts:
        print(f"{p.stat().st_size // 1024:>6} KB  {p.relative_to(SITE)}")
