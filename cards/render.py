import sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

JOBS = [
    ("card-wb-watch.html",   900, 1200),
    ("card-ozon-mug.html",   900, 1200),
    ("card-amz-vacuum.html", 1000, 1000),
    ("card-ozon-humid.html", 900, 1200),
]

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "out")
os.makedirs(out, exist_ok=True)

only = sys.argv[1:] or None

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h in JOBS:
        src = os.path.join(here, name)
        if not os.path.exists(src):
            continue
        if only and name not in only:
            continue
        page = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=2)
        page.goto("file://" + src)
        page.wait_for_timeout(700)
        raw = os.path.join(out, name.replace(".html", "@2x.png"))
        page.screenshot(path=raw)
        page.close()
        im = Image.open(raw).convert("RGB")
        im = im.resize((w, h), Image.LANCZOS)
        final = os.path.join(out, name.replace(".html", ".png"))
        im.save(final, quality=95)
        os.remove(raw)
        print("ok", final, im.size)
    b.close()
