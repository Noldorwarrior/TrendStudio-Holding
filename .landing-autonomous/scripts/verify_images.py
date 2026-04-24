#!/usr/bin/env python3
"""verify_images.py — sha256-проверка 20 изображений. v1.2."""
import json, hashlib, sys, os
from pathlib import Path

REPO_ROOT = os.environ.get('REPO_ROOT')
if not REPO_ROOT:
    print('❌ REPO_ROOT env variable not set', file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(REPO_ROOT).resolve()
META = REPO_ROOT / '.landing-autonomous/canon/landing_img_meta_v1.0.json'
IMG_DIR = REPO_ROOT / 'data_extract'

if not META.exists():
    print(f'❌ META missing: {META}', file=sys.stderr)
    sys.exit(2)

meta = json.loads(META.read_text(encoding='utf-8'))
failures, ok_count = [], 0

for item in meta['items']:
    src = IMG_DIR / item['file']
    if not src.exists():
        failures.append(f"missing: {src}")
        continue
    actual = hashlib.sha256(src.read_bytes()).hexdigest()
    if actual != item['sha256']:
        failures.append(f"sha256 mismatch: {src.name} (expected {item['sha256'][:16]}, got {actual[:16]})")
        continue
    ok_count += 1

if failures:
    print(f'❌ {len(failures)} failures:')
    for f in failures: print(f'   {f}')
    sys.exit(1)

print(f'✅ All {ok_count}/20 images verified (sha256 OK)')
sys.exit(0)
