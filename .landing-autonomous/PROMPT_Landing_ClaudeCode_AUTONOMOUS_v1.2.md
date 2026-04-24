# PROMPT — Landing v1.0 AUTONOMOUS (Claude Code, Multi-Agent) — **v1.2**

**Версия:** v1.2 (фикс 3 path/gitignore-проблем)
**Дата:** 2026-04-24
**Базовая:** v1.1 (см. PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.1.md)

---

## 📋 CHANGELOG v1.1 → v1.2

| # | Проблема v1.1 | Фикс в v1.2 |
|---|---|---|
| 1 | `data_extract/images_processed/` в `.gitignore` — CC не получит JPEG из git | **Упаковать 20 JPEG в `cc_autonomous_package/images/`, bootstrap копирует их в репо перед verify** |
| 2 | `verify_images.py`: `IMG_DIR = Path('data_extract/images_processed')` — относительный путь, зависит от cwd | **Все скрипты получают `REPO_ROOT` как env-переменную + `os.chdir(REPO_ROOT)` в начале** |
| 3 | `inject_images.py`: `Path(file).name` — отсечение префикса неявно | **`IMG_DIR = REPO_ROOT / 'data_extract'`, `src = IMG_DIR / file` — прямой join** |

**Не меняется:** multi-agent архитектура, 6 волн, auto-merge, П5 32/32, все 12 решений из v1.0/v1.1.

---

## 📦 ПАКЕТ v1.2 (разница со v1.1)

### Новая папка: `cc_autonomous_package/images/`

Содержит 20 JPEG из `TrendStudio-Holding/data_extract/images_processed/`:

| Файл | Размер | SHA256 (16) |
|---|---:|---|
| team_01_ceo.jpg | 66 355 | `0bc0ee6fab3b4691` |
| team_02_producer_lead.jpg | 101 708 | `4d641b6b4993290d` |
| team_03_cfo.jpg | 89 127 | `8085a0316feed39f` |
| team_04_head_distribution.jpg | 77 919 | `a5f0ea0b59de2705` |
| team_05_creative_director.jpg | 77 836 | `cc62cdfc9b3af757` |
| advisory_01_industry_veteran.jpg | 92 861 | `95f0e043a0105ccc` |
| advisory_02_finance_advisor.jpg | 80 379 | `84e1a8dd2b16afb2` |
| advisory_03_distribution_advisor.jpg | 92 178 | `cd560eced53aac3b` |
| advisory_04_international_advisor.jpg | 74 978 | `a9ff126741a77f70` |
| project_01_poster.jpg | 411 044 | `c0f730394ab322d1` |
| project_02_poster.jpg | 302 517 | `a6361bed847a6a7f` |
| project_03_poster.jpg | 164 062 | `f018b282b96fe85b` |
| project_04_poster.jpg | 407 365 | `1e6572e278a5a9a0` |
| project_05_poster.jpg | 224 706 | `bfa128ccb9861c2d` |
| project_06_poster.jpg | 341 740 | `c3002d1f8d80e899` |
| project_07_poster.jpg | 348 128 | `ebf080de820d7156` |
| banner_market_context.jpg | 318 279 | `2b2ce0f5db6e2d83` |
| banner_press.jpg | 391 221 | `8a758a86e1589b8f` |
| hero_bg.jpg | 608 624 | `c106036858c7c98f` |
| hero_film_reel.jpg | 440 382 | `5c75631be90ce4d8` |

**Итого:** 4 611 409 B (4.4 MB) + manifest.json.

### Новый файл: `cc_autonomous_package/images_manifest.json`

Копия из `TrendStudio-Holding/data_extract/images_processed/manifest.json` — для bootstrap-проверки **до** копирования в репо.

### Итоговая структура пакета v1.2:

```
cc_autonomous_package/                   (было ~500 KB, стало ~5 MB)
├── PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md
├── SHARED_STATE.md
├── README.md
├── WAVE_PROMPTS/ (6 файлов)
├── canon/ (6 JSON)
├── docs/ (3 md)
├── images/                              ← НОВОЕ v1.2
│   ├── team_01_ceo.jpg                   (20 файлов)
│   └── ...
├── images_manifest.json                 ← НОВОЕ v1.2
└── scripts/
    ├── bootstrap.sh                     ← ОБНОВЛЁН (копирует images/)
    ├── verify_images.py                 ← ОБНОВЛЁН (REPO_ROOT env)
    ├── inject_images.py                 ← ОБНОВЛЁН (прямой path join)
    ├── acceptance.sh
    ├── invariants_check.py
    ├── i18n_check.py
    ├── smoke_playwright.js
    ├── assemble_html.py
    ├── p5_max_32_32.py
    └── notify_progress.sh
```

---

## §1 bootstrap.sh (ИСПРАВЛЕН)

```bash
#!/usr/bin/env bash
set -euo pipefail

# Абсолютные пути через BASH_SOURCE — не зависят от cwd
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG="$(cd "$SCRIPT_DIR/.." && pwd)"    # cc_autonomous_package/
REPO="/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding"

export REPO_ROOT="$REPO"               # ← передаётся в Python-скрипты
cd "$REPO"

# Git setup
git checkout main
git pull --ff-only origin main
git checkout -b claude/landing-v1.0-autonomous 2>/dev/null || git checkout claude/landing-v1.0-autonomous

# Создать .landing-autonomous/
mkdir -p .landing-autonomous/{canon,docs,scripts,WAVE_PROMPTS}

# Копировать файлы пакета
cp "$PKG"/canon/*.json          .landing-autonomous/canon/
cp "$PKG"/docs/*.md             .landing-autonomous/docs/
cp "$PKG"/scripts/*.{sh,py,js}  .landing-autonomous/scripts/
cp "$PKG"/WAVE_PROMPTS/*.md     .landing-autonomous/WAVE_PROMPTS/
cp "$PKG"/SHARED_STATE.md       .landing-autonomous/
cp "$PKG"/README.md             .landing-autonomous/
cp "$PKG"/PROMPT_*.md           .landing-autonomous/
cp "$PKG"/images_manifest.json  .landing-autonomous/

chmod +x .landing-autonomous/scripts/*.sh

# ★★ КРИТИЧНОЕ (v1.2): копирование 20 JPEG из пакета в data_extract/images_processed/ ★★
# data_extract/images_processed/ в .gitignore — не в git, но используется локально скриптом
echo "→ Копирую 20 JPEG из пакета..."
mkdir -p "$REPO/data_extract/images_processed"
cp "$PKG"/images/*.jpg          "$REPO/data_extract/images_processed/"
cp "$PKG"/images_manifest.json  "$REPO/data_extract/images_processed/manifest.json"
echo "✓ Копия завершена: $(ls $REPO/data_extract/images_processed/*.jpg | wc -l) JPEG"

# Python deps
pip install --break-system-packages jsonschema 2>/dev/null || true

# Node deps (если не установлены)
cd "$REPO"
if [ ! -d "node_modules" ]; then
  npm init -y 2>/dev/null || true
fi
if ! node -e "require('playwright')" 2>/dev/null; then
  npm install --save-dev playwright
  npx playwright install chromium
fi

# Финальная проверка изображений (sha256)
echo "→ Проверка целостности изображений..."
REPO_ROOT="$REPO" python3 .landing-autonomous/scripts/verify_images.py || {
  echo "❌ Проверка изображений провалилась. Смотри логи выше."
  exit 1
}

echo ""
echo "✅ Bootstrap завершён."
echo "✅ REPO_ROOT=$REPO"
echo "✅ Ветка: $(git branch --show-current)"
echo "✅ Изображения: 20/20 OK"
echo ""
echo "→ Следующий шаг: запустить Claude Code и дать ему промт из .landing-autonomous/PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md"
```

---

## §2 verify_images.py (ИСПРАВЛЕН)

```python
#!/usr/bin/env python3
"""
verify_images.py — sha256-проверка 20 изображений перед использованием.
Использует REPO_ROOT env variable для абсолютных путей.
"""
import json, hashlib, sys, os
from pathlib import Path

# ★★ v1.2: REPO_ROOT из env, абсолютные пути ★★
REPO_ROOT = os.environ.get('REPO_ROOT')
if not REPO_ROOT:
    print('❌ REPO_ROOT env variable not set', file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(REPO_ROOT).resolve()
META = REPO_ROOT / '.landing-autonomous/canon/landing_img_meta_v1.0.json'
IMG_DIR = REPO_ROOT / 'data_extract'    # ★ было 'data_extract/images_processed', стал 'data_extract'

if not META.exists():
    print(f'❌ META missing: {META}', file=sys.stderr)
    sys.exit(2)

meta = json.loads(META.read_text(encoding='utf-8'))
failures, ok_count = [], 0

for item in meta['items']:
    # item['file'] = "images_processed/team_01_ceo.jpg" ← префикс УЖЕ включён
    src = IMG_DIR / item['file']       # ★ прямой join, без .name-отсечения

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
```

---

## §3 inject_images.py (ИСПРАВЛЕН)

```python
#!/usr/bin/env python3
"""
inject_images.py — base64-инлайн 20 изображений в landing_v1.0.html.
v1.2: REPO_ROOT env, прямой path join.
"""
import json, base64, re, sys, hashlib, os
from pathlib import Path

REPO_ROOT = os.environ.get('REPO_ROOT')
if not REPO_ROOT:
    print('❌ REPO_ROOT env variable not set', file=sys.stderr)
    sys.exit(2)

REPO_ROOT = Path(REPO_ROOT).resolve()
META = REPO_ROOT / '.landing-autonomous/canon/landing_img_meta_v1.0.json'
IMG_DIR = REPO_ROOT / 'data_extract'       # ★ v1.2: корень data_extract
HTML = REPO_ROOT / 'landing_v1.0.html'     # ★ абсолютный

def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    if not HTML.exists():
        print(f'❌ {HTML} not found'); sys.exit(1)

    meta = json.loads(META.read_text(encoding='utf-8'))
    html = HTML.read_text(encoding='utf-8')
    replaced, errors = 0, []

    for item in meta['items']:
        img_id = item['id']             # "img01"
        file_rel = item['file']         # "images_processed/team_01_ceo.jpg"
        expected_sha = item['sha256']
        src = IMG_DIR / file_rel        # ★ прямой join, работает

        if not src.exists():
            errors.append(f"{img_id}: file missing {src}")
            continue

        actual_sha = sha256_file(src)
        if actual_sha != expected_sha:
            errors.append(f"{img_id}: sha256 mismatch")
            continue

        b64 = base64.b64encode(src.read_bytes()).decode('ascii')
        data_uri = f"data:image/jpeg;base64,{b64}"

        pattern = re.compile(rf'__IMG_PLACEHOLDER_{img_id}__')
        new_html, n = pattern.subn(data_uri, html)
        if n > 0:
            html = new_html
            replaced += n
        # silently ok if no placeholder (не все image присутствуют на ранних волнах)

    HTML.write_text(html, encoding='utf-8')
    html_size = HTML.stat().st_size

    print(f'✅ Injected: {replaced} placeholder replacements')
    print(f'   HTML size after: {html_size:,} B ({html_size/1024/1024:.2f} MB)')
    if errors:
        print(f'⚠️  Errors: {len(errors)}')
        for e in errors: print(f'   {e}')
        return 1 if len(errors) > 2 else 0
    return 0

if __name__ == '__main__':
    sys.exit(main())
```

---

## §4 Orchestrator flow (обновлено в v1.2)

Единственное изменение в orchestrator prompt — **env-переменная `REPO_ROOT`** передаётся во все Python-запуски:

```bash
# Было (v1.1):
python .landing-autonomous/scripts/verify_images.py

# Стало (v1.2):
REPO_ROOT="$REPO" python3 .landing-autonomous/scripts/verify_images.py
```

В промте orchestrator'а в §1 (v1.2) — добавляется правило:

> **Перед каждым запуском Python-скрипта из `.landing-autonomous/scripts/` — экспортируй `REPO_ROOT=$(pwd)` если ты в корне TrendStudio-Holding/.**

---

## §5 WAVE_PROMPTS (без изменений v1.1)

Секции W1, W3, W5 уже корректны в v1.1. Placeholder-конвенция работает. Изменений в промтах субагентов НЕТ.

---

## §6 Как собрать пакет физически (инструкции)

Когда вы скажете «собирай пакет», я выполню:

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/Холдинг
mkdir -p cc_autonomous_package/{canon,docs,scripts,WAVE_PROMPTS,images}

# 1. Canon JSONs (6 штук)
cp data/landing_*.json cc_autonomous_package/canon/

# 2. Docs (3 штуки)
cp HANDOFF_Landing_v1.0_A1_to_A2.md cc_autonomous_package/docs/
cp Landing_v1.0_HANDOFF_Stage_B.md cc_autonomous_package/docs/
cp Landing_v1.0_HANDOFF_Stage_B_I18N.md cc_autonomous_package/docs/
cp Gemini_TZ_images_v1.0.md cc_autonomous_package/docs/

# 3. ★ v1.2 ★ 20 JPEG из TrendStudio-Holding
cp ../TrendStudio-Holding/data_extract/images_processed/*.jpg cc_autonomous_package/images/
cp ../TrendStudio-Holding/data_extract/images_processed/manifest.json cc_autonomous_package/images_manifest.json

# 4. Promt + SHARED_STATE + README
cp PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md cc_autonomous_package/

# 5. Scripts — записываю 10 файлов (bootstrap, verify, inject, acceptance, invariants, i18n, smoke, assemble, p5, notify)
# (все из промта выше + те что из v1.0)

# 6. Generate WAVE_PROMPTS/W1.md ... W6.md из v1.2 промта

# 7. README.md (навигация)
# 8. SHARED_STATE.md (шаблон)
```

**Ожидаемый размер пакета:** ~5 MB
**Ожидаемое время сборки:** ~10 минут

---

## §7 ФИНАЛЬНАЯ ПРОВЕРКА v1.2 (что изменилось)

| Файл | v1.1 | v1.2 |
|---|---|---|
| `cc_autonomous_package/images/` | не было | **20 JPEG (4.4 MB)** |
| `images_manifest.json` | не было | **в корне пакета** |
| `bootstrap.sh` | без копии JPEG | **`cp images/*.jpg → data_extract/images_processed/`** |
| `verify_images.py` | относ. путь | **REPO_ROOT env, absolute** |
| `inject_images.py` | `.name` отсечение | **прямой join `IMG_DIR / file`** |
| orchestrator prompt | `python ...` | **`REPO_ROOT=$(pwd) python3 ...`** |
| Размер пакета | ~500 KB | **~5 MB** |
| Ответ на вопрос "отсутствие git" | сломан | **self-contained** |

---

## §8 Риски (обновлено)

| Риск | Вероятность | v1.1 митигация | v1.2 митигация |
|---|---|---|---|
| JPEG отсутствуют в git clone | **high** | ❌ не адресован | ✅ упаковка в cc_package |
| Скрипты падают из-за cwd | mid | ❌ | ✅ REPO_ROOT env |
| sha256 подмена | low | ✅ verify_images | ✅ verify_images (улучшен) |
| Пакет слишком большой для распростр. | low | ~500 KB OK | **~5 MB — нормально для локального workflow** |
| bootstrap.sh не находит PKG dir | low | не было проблемы | ✅ `dirname BASH_SOURCE`-trick |

---

**Версия документа:** v1.2 FINAL
**Статус:** готов к физической сборке пакета
**Команда запуска:** не меняется относительно v1.0/v1.1

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package/scripts/bootstrap.sh
claude code
# В CC: "Прочитай .landing-autonomous/PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md и следуй как orchestrator. Для всех python-запусков export REPO_ROOT=$(pwd) из корня TrendStudio-Holding/."
```

**Следующий шаг:** скажите «собирай пакет» — соберу cc_autonomous_package/ (5 MB) физически за ~10 минут.
