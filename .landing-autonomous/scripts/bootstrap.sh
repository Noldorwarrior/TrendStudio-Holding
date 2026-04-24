#!/usr/bin/env bash
# bootstrap.sh v1.2 — подготовка репо для автономной сборки лендинга
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO="/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding"

export REPO_ROOT="$REPO"

echo "━━━ bootstrap.sh v1.2 ━━━"
echo "PKG:  $PKG"
echo "REPO: $REPO"
echo ""

cd "$REPO"

echo "→ 1. Git setup"
git fetch origin
git checkout main
git pull --ff-only origin main
if git show-ref --quiet refs/heads/claude/landing-v1.0-autonomous; then
  echo "  (ветка существует — чекаут)"
  git checkout claude/landing-v1.0-autonomous
else
  echo "  (создание новой ветки)"
  git checkout -b claude/landing-v1.0-autonomous
fi

echo ""
echo "→ 2. Создание .landing-autonomous/"
mkdir -p .landing-autonomous/{canon,docs,scripts,WAVE_PROMPTS}

echo ""
echo "→ 3. Копирование файлов пакета"
cp "$PKG"/canon/*.json          .landing-autonomous/canon/
cp "$PKG"/docs/*.md             .landing-autonomous/docs/
cp "$PKG"/scripts/*.{sh,py,js}  .landing-autonomous/scripts/
cp "$PKG"/WAVE_PROMPTS/*.md     .landing-autonomous/WAVE_PROMPTS/
cp "$PKG"/SHARED_STATE.md       .landing-autonomous/
cp "$PKG"/README.md             .landing-autonomous/
cp "$PKG"/PROMPT_*.md           .landing-autonomous/
cp "$PKG"/images_manifest.json  .landing-autonomous/
chmod +x .landing-autonomous/scripts/*.sh

echo ""
echo "→ 4. Копирование 20 JPEG в data_extract/images_processed/"
mkdir -p "$REPO/data_extract/images_processed"
cp "$PKG"/images/*.jpg          "$REPO/data_extract/images_processed/"
cp "$PKG"/images_manifest.json  "$REPO/data_extract/images_processed/manifest.json"
JPG_COUNT=$(ls "$REPO"/data_extract/images_processed/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "  ✓ $JPG_COUNT JPEG скопированы"

echo ""
echo "→ 5. Python deps"
pip install --break-system-packages jsonschema 2>/dev/null || pip3 install --break-system-packages jsonschema 2>/dev/null || true

echo ""
echo "→ 6. Node deps (Playwright)"
if [ ! -f "$REPO/package.json" ]; then
  (cd "$REPO" && npm init -y >/dev/null 2>&1 || true)
fi
if ! (cd "$REPO" && node -e "require('playwright')" 2>/dev/null); then
  (cd "$REPO" && npm install --save-dev playwright >/dev/null 2>&1)
  (cd "$REPO" && npx playwright install chromium >/dev/null 2>&1)
fi

echo ""
echo "→ 7. SHA256-проверка изображений"
REPO_ROOT="$REPO" python3 .landing-autonomous/scripts/verify_images.py || {
  echo ""
  echo "❌ SHA256-проверка провалилась"
  exit 1
}

echo ""
echo "━━━ bootstrap.sh завершён ━━━"
echo "✅ REPO_ROOT=$REPO"
echo "✅ Ветка: $(git branch --show-current)"
echo "✅ Изображения: 20/20 OK"
echo ""
echo "Следующий шаг:"
echo "  claude code"
echo "  → промт: прочитай .landing-autonomous/PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md"
echo "  → действуй как orchestrator (см. §1)"
