#!/usr/bin/env python3
"""inject_images.py — base64-инлайн 20 изображений в landing_v1.0.html. v1.2."""
import json, base64, re, sys, hashlib, os
from pathlib import Path

REPO_ROOT = os.environ.get('REPO_ROOT')
if not REPO_ROOT:
    print('❌ REPO_ROOT env variable not set', file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(REPO_ROOT).resolve()
META = REPO_ROOT / '.landing-autonomous/canon/landing_img_meta_v1.0.json'
IMG_DIR = REPO_ROOT / 'data_extract'
HTML = REPO_ROOT / 'landing_v1.0.html'

def sha256_file(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    if not HTML.exists():
        print(f'❌ {HTML} not found'); sys.exit(1)
    meta = json.loads(META.read_text(encoding='utf-8'))
    html = HTML.read_text(encoding='utf-8')
    replaced, errors = 0, []
    for item in meta['items']:
        img_id = item['id']
        src = IMG_DIR / item['file']
        if not src.exists():
            errors.append(f"{img_id}: file missing"); continue
        if sha256_file(src) != item['sha256']:
            errors.append(f"{img_id}: sha256 mismatch"); continue
        b64 = base64.b64encode(src.read_bytes()).decode('ascii')
        data_uri = f"data:image/jpeg;base64,{b64}"
        new_html, n = re.subn(rf'__IMG_PLACEHOLDER_{img_id}__', data_uri, html)
        if n > 0:
            html, replaced = new_html, replaced + n
    HTML.write_text(html, encoding='utf-8')
    size = HTML.stat().st_size
    print(f'✅ Replaced {replaced} placeholders | HTML size: {size:,} B ({size/1024/1024:.2f} MB)')
    if errors:
        print(f'⚠️  Errors: {len(errors)}')
        for e in errors: print(f'   {e}')
        return 1 if len(errors) > 2 else 0
    return 0

if __name__ == '__main__':
    sys.exit(main())
