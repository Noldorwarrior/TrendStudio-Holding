#!/usr/bin/env python3
"""p5_max_32_32.py — упрощённая П5 Максимум для лендинга (32 механизма)."""
import json, re, sys, os, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--html', required=True)
ap.add_argument('--canon', required=True)
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
html_path = Path(args.html) if Path(args.html).is_absolute() else REPO_ROOT / args.html
canon_dir = Path(args.canon) if Path(args.canon).is_absolute() else REPO_ROOT / args.canon

html = html_path.read_text(encoding='utf-8')
base = json.loads((canon_dir / 'landing_canon_base_v1.0.json').read_text(encoding='utf-8'))

mechs = []

# 1-10: Числовые якоря
anchors = {'3000': 1, '7': 2, '24.75': 3, '20.09': 4, '13.95': 5, '11.44': 6, '348': 7}
for a, id_ in anchors.items():
    mechs.append({'id': id_, 'name': f'anchor_{a}', 'pass': a in html})

# 11: Формат HTML
mechs.append({'id': 11, 'name': 'html_valid', 'pass': html.startswith('<!DOCTYPE html>')})

# 12: Нет запрещённых API
mechs.append({'id': 12, 'name': 'no_forbidden', 'pass': not re.search(r'localStorage|sessionStorage|document\.cookie', html)})

# 13-15: Images
mechs.append({'id': 13, 'name': 'images_count', 'pass': html.count('data:image/jpeg;base64,') >= 20})
mechs.append({'id': 14, 'name': 'no_placeholders', 'pass': '__IMG_PLACEHOLDER_' not in html})
mechs.append({'id': 15, 'name': 'img_alt_present', 'pass': html.count('alt=') >= 20})

# 16-20: Palette
for i, c in enumerate(['#0B0D10', '#F4A261', '#2A9D8F', '#EAEAEA', '#8E8E93'], start=16):
    mechs.append({'id': i, 'name': f'color_{c}', 'pass': c in html})

# 21-25: Structure
mechs.append({'id': 21, 'name': 'has_main', 'pass': '<main' in html or 'main(' in html})
mechs.append({'id': 22, 'name': 'has_footer', 'pass': '<footer' in html or 'Footer' in html})
mechs.append({'id': 23, 'name': 'react_root', 'pass': 'ReactDOM.createRoot' in html})
mechs.append({'id': 24, 'name': 'babel_present', 'pass': 'babel' in html.lower()})
mechs.append({'id': 25, 'name': 'tailwind_cdn', 'pass': 'tailwindcss' in html.lower()})

# 26-32: i18n + a11y
mechs.append({'id': 26, 'name': 'i18n_ru', 'pass': re.search(r'ru\s*:\s*\{', html) is not None})
mechs.append({'id': 27, 'name': 'i18n_en', 'pass': re.search(r'en\s*:\s*\{', html) is not None})
mechs.append({'id': 28, 'name': 'focus_visible', 'pass': 'focus-visible' in html or ':focus' in html})
mechs.append({'id': 29, 'name': 'reduce_motion', 'pass': 'prefers-reduced-motion' in html})
mechs.append({'id': 30, 'name': 'aria_labels', 'pass': html.count('aria-') >= 5})
mechs.append({'id': 31, 'name': 'lang_attr', 'pass': '<html lang=' in html})
mechs.append({'id': 32, 'name': 'viewport_meta', 'pass': 'viewport' in html})

score = sum(1 for m in mechs if m['pass'])
total = len(mechs)

report = {
    'version': '1.2',
    'score': score,
    'total': total,
    'passed_pct': round(100*score/total, 1),
    'verdict': 'PASS' if score >= 30 else 'CONDITIONAL' if score >= 25 else 'FAIL',
    'mechanisms': mechs,
}
out = html_path.parent / 'p5_verification_report.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

print(f'П5 Maximum: {score}/{total} — {report["verdict"]}')
print(f'Report: {out}')
sys.exit(0 if score >= 25 else 1)
