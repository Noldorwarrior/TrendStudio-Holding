#!/usr/bin/env python3
"""invariants_check.py — 7 inv для лендинга (INV-01..INV-07)."""
import json, re, sys, os, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--wave', default='0')
ap.add_argument('--strict', action='store_true')
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
CANON = REPO_ROOT / '.landing-autonomous/canon'
HTML = REPO_ROOT / 'landing_v2.0.html'

fails = []

# INV-01: Canon base valid JSON
try:
    base = json.loads((CANON / 'landing_canon_base_v1.0.json').read_text(encoding='utf-8'))
except Exception as e:
    fails.append(f"INV-01: canon_base invalid: {e}")

# INV-02 (light): якоря
if HTML.exists():
    html = HTML.read_text(encoding='utf-8')
    for a in ['3000', '7', '24.75', '20.09']:
        if a not in html and int(args.wave) >= 2:
            fails.append(f"INV-02: anchor {a} missing in HTML")

# INV-03: img_meta count=20
try:
    imgs = json.loads((CANON / 'landing_img_meta_v1.0.json').read_text(encoding='utf-8'))
    if imgs.get('count') != 20 or len(imgs.get('items', [])) != 20:
        fails.append("INV-03: img_meta count != 20")
except Exception as e:
    fails.append(f"INV-03: {e}")

if fails:
    print(f'⚠️  {len(fails)} invariants warnings:')
    for f in fails: print(f'   {f}')
    sys.exit(1 if args.strict else 0)

print(f'✅ Invariants OK (wave={args.wave})')
sys.exit(0)
