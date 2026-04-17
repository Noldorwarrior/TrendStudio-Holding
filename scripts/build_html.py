#!/usr/bin/env python3
"""Build compiler: assembles src/ fragments into a single self-contained HTML file.
Usage: python scripts/build_html.py [--verify]
"""
import argparse, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SLIDES_DIR = SRC / "slides"
LAYOUTS_DIR = SRC / "layouts"
I18N_DIR = ROOT / "i18n"
DATA_FILE = ROOT / "data_extract" / "deck_data_v1.2.0.json"
OUT = ROOT / "Deck_v1.2.0" / "TrendStudio_LP_Deck_v1.2.0_Interactive.html"
BUDGET = 650000  # bytes (Phase 2B: raised from 450K for 7 interactive charts + controls + drilldown)

CDN_WHITELIST = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/",
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/",
    "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/",
]


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def collect_slides():
    slides_html = []
    slides_js = []
    for n in range(1, 26):
        nn = f"{n:02d}"
        html_path = SLIDES_DIR / f"s{nn}.html"
        js_path = SLIDES_DIR / f"s{nn}.js"
        if html_path.exists():
            slides_html.append((n, read_file(html_path)))
        if js_path.exists():
            slides_js.append((n, read_file(js_path)))
    return slides_html, slides_js


def collect_layouts():
    layouts = {}
    if LAYOUTS_DIR.exists():
        for f in sorted(LAYOUTS_DIR.glob("*.html")):
            layouts[f.stem] = read_file(f)
    return layouts


def collect_charts():
    """Phase 2B: collect src/charts.js (core) + src/charts/*.js (7 chart implementations)."""
    core = read_file(SRC / "charts.js") if (SRC / "charts.js").exists() else ""
    charts_dir = SRC / "charts"
    impls = []
    if charts_dir.exists():
        for f in sorted(charts_dir.glob("*.js")):
            if f.name.endswith(".test.js"):
                continue
            impls.append((f.stem, read_file(f)))
    return core, impls


def build_html():
    # Read all fragments
    theme_css = read_file(SRC / "theme.css") if (SRC / "theme.css").exists() else ""
    macros_js = read_file(SRC / "macros.js") if (SRC / "macros.js").exists() else ""
    components_js = read_file(SRC / "components.js") if (SRC / "components.js").exists() else ""
    a11y_js = read_file(SRC / "a11y.js") if (SRC / "a11y.js").exists() else ""
    orchestrator_js = read_file(SRC / "orchestrator.js") if (SRC / "orchestrator.js").exists() else ""
    # Phase 2B additions (S41 core + S42-S48 chart impls + S49 controls + S50 drilldown)
    charts_core_js, charts_impls = collect_charts()
    controls_js = read_file(SRC / "controls.js") if (SRC / "controls.js").exists() else ""
    drilldown_js = read_file(SRC / "drilldown.js") if (SRC / "drilldown.js").exists() else ""

    # i18n data
    i18n_ru = read_file(I18N_DIR / "ru.json") if (I18N_DIR / "ru.json").exists() else "{}"
    i18n_en = read_file(I18N_DIR / "en.json") if (I18N_DIR / "en.json").exists() else "{}"

    # Deck data (SSOT)
    deck_data = read_file(DATA_FILE) if DATA_FILE.exists() else "{}"

    # Slides
    slides_html, slides_js = collect_slides()

    # Assemble
    html_parts = []
    html_parts.append("""<!DOCTYPE html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, initial-scale=1, user-scalable=no">
  <title>TrendStudio LP Deck v1.2.0</title>
  <meta name="description" content="TrendStudio Holding LP Deck v1.2.0 Confidential">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">

  <!-- CDN: GSAP -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- CDN: Chart.js 4.4 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <!-- CDN: D3 v7 (for waterfall/sankey) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
""")

    # Theme CSS
    html_parts.append("  <style>\n")
    html_parts.append(theme_css)
    html_parts.append("\n  </style>\n")

    html_parts.append("</head>\n<body>\n")

    # Skip link for a11y
    html_parts.append('  <a href="#main-content" class="sr-only sr-only-focusable" id="skip-link">Skip to content</a>\n')

    # Live region for a11y announcements
    html_parts.append('  <div id="a11y-live" aria-live="polite" aria-atomic="true" class="sr-only"></div>\n')

    # Navigation bar
    html_parts.append("""  <nav id="deck-nav" role="navigation" aria-label="Slide navigation">
    <button id="nav-prev" aria-label="Previous slide" disabled>&larr;</button>
    <span id="nav-indicator" aria-live="polite">1 / 25</span>
    <button id="nav-next" aria-label="Next slide">&rarr;</button>
  </nav>
""")

    # Main content area
    html_parts.append('  <main id="main-content" role="main">\n')

    # Slide containers — each src/slides/sNN.html already contains its own
    # <section id="slide-N" class="slide" hidden ...>. We only inject the fragment
    # as-is. Previously we wrapped it in an outer <section id="slide-N" ...>, which
    # produced duplicate IDs: getElementById returned the empty outer wrapper, and
    # NAV.go() would reveal it while the real inner <section> stayed hidden.
    for n, slide_html in slides_html:
        html_parts.append(f"    <!-- slide {n} -->\n")
        html_parts.append(f"    {slide_html}\n")

    html_parts.append("  </main>\n\n")

    # Embedded data
    html_parts.append('  <script id="i18n-data" type="application/json">\n')
    html_parts.append(f'    {{"ru": {i18n_ru}, "en": {i18n_en}}}\n')
    html_parts.append('  </script>\n\n')

    html_parts.append('  <script id="deck-data" type="application/json">\n')
    html_parts.append(f"    {deck_data}\n")
    html_parts.append('  </script>\n\n')

    # JS modules in order: a11y -> macros -> components -> orchestrator -> slides
    html_parts.append("  <script>\n")
    html_parts.append("  // === A11Y ===\n")
    html_parts.append(a11y_js)
    html_parts.append("\n\n  // === MACROS (TS, NAV, ANIM, CHARTS) ===\n")
    html_parts.append(macros_js)
    html_parts.append("\n\n  // === COMPONENTS ===\n")
    html_parts.append(components_js)
    html_parts.append("\n\n  // === ORCHESTRATOR ===\n")
    html_parts.append(orchestrator_js)
    # Phase 2B: TS.Charts core → 7 chart impls → Live-Controls → Drill-Down
    if charts_core_js:
        html_parts.append("\n\n  // === TS.CHARTS CORE (S41) ===\n")
        html_parts.append(charts_core_js)
    if charts_impls:
        html_parts.append("\n\n  // === TS.CHARTS IMPLEMENTATIONS (S42-S48) ===\n")
        for name, js in charts_impls:
            html_parts.append(f"  // --- chart: {name} ---\n")
            html_parts.append(js)
            html_parts.append("\n")
    if controls_js:
        html_parts.append("\n\n  // === LIVE-CONTROLS (S49) ===\n")
        html_parts.append(controls_js)
    if drilldown_js:
        html_parts.append("\n\n  // === DRILL-DOWN (S50) ===\n")
        html_parts.append(drilldown_js)
    html_parts.append("\n\n  // === SLIDES ===\n")
    for n, js in slides_js:
        html_parts.append(f"  // --- Slide {n:02d} ---\n")
        html_parts.append(js)
        html_parts.append("\n")
    html_parts.append("\n  </script>\n")

    html_parts.append("</body>\n</html>\n")

    return "".join(html_parts)


def verify(html):
    errors = []
    size = len(html.encode("utf-8"))
    if size > BUDGET:
        errors.append(f"SIZE: {size:,} bytes > budget {BUDGET:,}")

    # Check all 25 slides present
    for n in range(1, 26):
        if f'id="slide-{n}"' not in html:
            errors.append(f"MISSING: slide-{n} not found in output")

    # Check no eval/new Function
    if "eval(" in html:
        errors.append("SECURITY: eval() found")
    if "new Function(" in html:
        errors.append("SECURITY: new Function() found")

    # Check canvas a11y
    canvas_count = html.count("<canvas")
    labeled = len(re.findall(r'<canvas[^>]+(aria-label|aria-labelledby)', html))
    # Canvases inside <figure role="img" aria-labelledby> are ok
    figure_wrapped = len(re.findall(r'<figure[^>]+role="img"[^>]+aria-labelledby[^>]*>\s*(?:<figcaption[^>]*>.*?</figcaption>\s*)?<canvas', html, re.DOTALL))
    unlabeled = canvas_count - labeled - figure_wrapped
    if unlabeled > 0:
        errors.append(f"A11Y: {unlabeled} canvas elements without aria-label/aria-labelledby")

    return errors, size


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true", help="Verify only, don't write")
    args = parser.parse_args()

    html = build_html()
    errors, size = verify(html)

    if args.verify:
        if errors:
            for e in errors:
                print(f"ERROR: {e}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"VERIFY OK: {size:,} bytes ({size*100//BUDGET}% of budget)")
            sys.exit(0)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Built: {OUT} ({size:,} bytes, {size*100//BUDGET}% of {BUDGET:,} budget)")

    if errors:
        print("WARNINGS:")
        for e in errors:
            print(f"  {e}")


if __name__ == "__main__":
    main()
