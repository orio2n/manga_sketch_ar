"""Draws the step diagrams of the anime eye tutorial: assets/img/tutorials/eye-step-<n>.svg and eye-final.svg.

Each step adds one part of the eye in violet over the parts already drawn, in ink, like the coach's
illustrations. The eye is built from the same shapes in every file. Run: `python tools/eye_steps.py`.
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets/img/tutorials"
W, H = 960, 540
INK, GUIDE, NEW = "#23202b", "#cbc6da", "#5c34ec"

# The opening of the eye, between the bottom edge of the upper lid and the lower lid: the iris is clipped to it.
OPENING = ("M300 306 C352 232 440 198 540 204 C596 206 640 222 672 246 C668 300 662 328 648 344 "
           "C596 392 480 404 412 388 C360 376 326 346 300 306 Z")


def guides(color, dash="10 9"):
    return (f'<g fill="none" stroke="{color}" stroke-width="3" stroke-dasharray="{dash}" stroke-linecap="round">'
            f'<path d="M170 300 H790"/><path d="M488 130 V440"/></g>')


def upper_lid(c):
    return (f'<path fill="{c}" d="M292 300 C330 215 430 175 540 182 C600 186 645 205 668 228 C682 234 696 238 708 246 '
            f'C694 248 682 248 672 246 C640 222 596 206 540 204 C440 198 352 232 300 306 Z"/>')


def lower_lid(c):
    return f'<path fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round" d="M412 388 C480 404 596 392 648 344"/>'


def iris(c):
    return (f'<g clip-path="url(#opening)"><ellipse cx="486" cy="304" rx="96" ry="116" fill="#fff" stroke="{c}" stroke-width="5"/>'
            f'<ellipse cx="487" cy="310" rx="72" ry="92" fill="none" stroke="{c}" stroke-width="2" opacity=".55"/></g>')


def shading(c):
    return (f'<g clip-path="url(#opening)"><path clip-path="url(#iris)" fill="{c}" opacity=".78" '
            f'd="M380 186 H592 V262 C552 298 420 298 380 262 Z"/></g>')


def pupil(c):
    return f'<g clip-path="url(#opening)"><ellipse cx="488" cy="310" rx="38" ry="56" fill="{c}"/></g>'


def highlights(c):
    return (f'<ellipse cx="446" cy="258" rx="28" ry="32" fill="#fff" stroke="{c}" stroke-width="3.5"/>'
            f'<circle cx="534" cy="362" r="12" fill="#fff" stroke="{c}" stroke-width="3"/>')


def details(c):
    return (f'<path fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round" d="M384 194 C438 162 528 150 612 164"/>'
            f'<path fill="{c}" d="M640 212 Q682 194 720 190 Q688 208 658 228 Z"/>'
            f'<path fill="{c}" d="M664 230 Q700 220 734 226 Q702 234 670 244 Z"/>'
            f'<path fill="{c}" d="M296 168 C380 118 522 102 652 118 C560 118 402 134 296 168 Z"/>')


# The parts in drawing order: (name, drawn when new, drawn once done).
PARTS = [
    ("guides", lambda: guides(NEW), lambda: guides(GUIDE)),
    ("upper lid", lambda: upper_lid(NEW), lambda: upper_lid(INK)),
    ("lower lid", lambda: lower_lid(NEW), lambda: lower_lid(INK)),
    ("iris", lambda: iris(NEW), lambda: iris(INK)),
    ("pupil and highlights", lambda: pupil(NEW), lambda: pupil(INK)),
    ("shading", lambda: shading(NEW), lambda: shading(INK)),
    ("lashes, crease and brow", lambda: details(NEW), lambda: details(INK)),
]
# Layers from back to front, so later parts never hide the highlights or the lid.
LAYERS = ["guides", "iris", "shading", "pupil and highlights", "lower lid", "upper lid", "lashes, crease and brow"]


def svg(drawn, new=None, show_guides=True):
    defs = (f'<defs><clipPath id="opening"><path d="{OPENING}"/></clipPath>'
            f'<clipPath id="iris"><ellipse cx="486" cy="304" rx="94" ry="114"/></clipPath></defs>')
    body = []
    for name in LAYERS:
        if name not in drawn or (name == "guides" and not show_guides):
            continue
        part = next(p for p in PARTS if p[0] == name)
        body.append(part[1]() if name == new else part[2]())
    # The highlights sit on top of everything, lid included.
    if "pupil and highlights" in drawn:
        body.append(highlights(NEW if new == "pupil and highlights" else INK))
    # Drawn around the iris line, then scaled up to fill the frame.
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<rect width="{W}" height="{H}" fill="#fff"/>{defs}'
            f'<g transform="translate(480 290) scale(1.3) translate(-488 -282)">{"".join(body)}</g></svg>\n')


OUT.mkdir(parents=True, exist_ok=True)
names = [p[0] for p in PARTS]
for n, name in enumerate(names, 1):
    (OUT / f"eye-step-{n}.svg").write_text(svg(names[:n], new=name), encoding="utf-8")
(OUT / "eye-final.svg").write_text(svg(names, show_guides=False), encoding="utf-8")
print(f"✅ {len(names)} steps + the finished eye in {OUT}")
