#!/usr/bin/env python3
"""i18n_check.py — проверка RU/EN симметрии inline в HTML."""
import re, sys, os, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--strict', action='store_true')
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
HTML = REPO_ROOT / 'landing_v2.2.html'

if not HTML.exists():
    print("❌ HTML missing"); sys.exit(1)

html = HTML.read_text(encoding='utf-8')

# Ищем объект I18N = { ru: {...}, en: {...} }
m_ru = re.search(r'ru\s*:\s*\{([^}]*)\}', html, re.DOTALL)
m_en = re.search(r'en\s*:\s*\{([^}]*)\}', html, re.DOTALL)

if not m_ru or not m_en:
    print("⚠️  i18n objects not found (may be OK pre-W6)")
    sys.exit(0 if not args.strict else 1)

ru_keys = set(re.findall(r'["\']([\w.]+)["\']\s*:', m_ru.group(1)))
en_keys = set(re.findall(r'["\']([\w.]+)["\']\s*:', m_en.group(1)))

only_ru = ru_keys - en_keys
only_en = en_keys - ru_keys

# Допускаем [EN TBD] placeholders
tbd_count = html.count('[EN TBD]')

if only_ru or only_en:
    print(f"⚠️  Asymmetry: only-ru={len(only_ru)}, only-en={len(only_en)}, [EN TBD]={tbd_count}")
    if args.strict and (len(only_ru) + len(only_en)) > tbd_count * 2:
        sys.exit(1)

print(f"✅ i18n: ru={len(ru_keys)}, en={len(en_keys)}, [EN TBD]={tbd_count}")
sys.exit(0)
