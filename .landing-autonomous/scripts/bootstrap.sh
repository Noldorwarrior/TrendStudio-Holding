#!/usr/bin/env bash
# bootstrap.sh v2.2 — ветка claude/landing-v2.2-autonomous от main
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO="/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding"

export REPO_ROOT="$REPO"
echo "━━━ bootstrap.sh v2.2 (grep-contracts enforced) ━━━"
cd "$REPO"

git fetch origin
git checkout main
git pull --ff-only origin main
if git show-ref --quiet refs/heads/claude/landing-v2.2-autonomous; then
  git checkout claude/landing-v2.2-autonomous
else
  git checkout -b claude/landing-v2.2-autonomous
fi

rm -rf .landing-autonomous
mkdir -p .landing-autonomous/{canon,docs,scripts,WAVE_PROMPTS}

cp "$PKG"/canon/*.json          .landing-autonomous/canon/
cp "$PKG"/docs/*.md             .landing-autonomous/docs/
cp "$PKG"/scripts/*.{sh,py,js}  .landing-autonomous/scripts/
cp "$PKG"/WAVE_PROMPTS/*.md     .landing-autonomous/WAVE_PROMPTS/
cp "$PKG"/SHARED_STATE.md       .landing-autonomous/
cp "$PKG"/README.md             .landing-autonomous/
cp "$PKG"/PROMPT_*.md           .landing-autonomous/
cp "$PKG"/images_manifest.json  .landing-autonomous/
chmod +x .landing-autonomous/scripts/*.sh

mkdir -p "$REPO/data_extract/images_processed"
cp "$PKG"/images/*.jpg          "$REPO/data_extract/images_processed/"
cp "$PKG"/images_manifest.json  "$REPO/data_extract/images_processed/manifest.json"

pip install --break-system-packages jsonschema 2>/dev/null || pip3 install --break-system-packages jsonschema 2>/dev/null || true
[ -f "$REPO/package.json" ] || (cd "$REPO" && npm init -y >/dev/null 2>&1 || true)
if ! (cd "$REPO" && node -e "require('playwright')" 2>/dev/null); then
  (cd "$REPO" && npm install --save-dev playwright >/dev/null 2>&1)
  (cd "$REPO" && npx playwright install chromium >/dev/null 2>&1)
fi

REPO_ROOT="$REPO" python3 .landing-autonomous/scripts/verify_images.py || { echo "❌ sha256 fail"; exit 1; }

echo "✅ Bootstrap v2.2 готов"
echo "✅ Ветка: $(git branch --show-current)"
echo ""
echo "Следующий: claude code --dangerously-skip-permissions"
echo "Промт: 'Прочитай .landing-autonomous/PROMPT_Landing_v2.2_AUTONOMOUS.md, следуй §6. Grep-contracts §3+§4 — жёсткий gate.'"
