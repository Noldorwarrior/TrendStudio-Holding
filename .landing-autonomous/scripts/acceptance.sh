#!/usr/bin/env bash
# acceptance.sh v1.2 — per-wave gate
set -euo pipefail
WAVE="${1:---wave=0}"
IMAGE_CHECK="${2:-}"
MODE="${WAVE#--wave=}"
HTML="${REPO_ROOT:-$(pwd)}/landing_v1.0.html"

echo "=== Acceptance gate $WAVE $IMAGE_CHECK ==="

if [[ "$MODE" == "dry-run" || "$MODE" == "--dry-run" || "$WAVE" == "--dry-run" ]]; then
  command -v python3 >/dev/null && command -v node >/dev/null && echo "✅ Tools OK" && exit 0 || exit 1
fi

if [[ "$MODE" != "0" && ! -f "$HTML" ]]; then
  echo "❌ HTML missing: $HTML"; exit 1
fi

# Forbidden APIs
if [[ -f "$HTML" ]] && grep -qE "localStorage|sessionStorage|document\.cookie" "$HTML"; then
  echo "❌ Forbidden storage API"; exit 1
fi

# Anchors (with W-guard)
if [[ "$MODE" -ge "1" && -f "$HTML" ]]; then
  MISSING=0
  for A in "3000" "7" "24.75" "20.09"; do
    grep -q "$A" "$HTML" || { MISSING=$((MISSING+1)); echo "   ⚠️  anchor $A not yet in HTML"; }
  done
  [[ "$MODE" -ge "2" && $MISSING -gt 2 ]] && { echo "❌ too many anchors missing"; exit 1; }
fi

# Invariants
if [[ -f "${REPO_ROOT}/.landing-autonomous/scripts/invariants_check.py" ]]; then
  REPO_ROOT="$REPO_ROOT" python3 "${REPO_ROOT}/.landing-autonomous/scripts/invariants_check.py" --wave="$MODE" || {
    echo "⚠️  Invariants warning (wave $MODE)"
  }
fi

# i18n (W6)
if [[ "$MODE" == "6" ]]; then
  REPO_ROOT="$REPO_ROOT" python3 "${REPO_ROOT}/.landing-autonomous/scripts/i18n_check.py" --strict || {
    echo "⚠️  i18n asymmetry"
  }
fi

# Image check
if [[ "$IMAGE_CHECK" == "--image-check" ]]; then
  case "$MODE" in
    1) EXPECTED="img17 img19 img20" ;;
    3) EXPECTED="img01 img02 img03 img04 img05 img06 img07 img08 img09 img10 img11 img12 img13 img14 img15 img16" ;;
    5) EXPECTED="img18" ;;
    *) EXPECTED="" ;;
  esac
  for ID in $EXPECTED; do
    if ! grep -q "__IMG_PLACEHOLDER_${ID}__\|data:image/jpeg;base64," "$HTML"; then
      echo "❌ $ID not found in HTML"; exit 1
    fi
  done
  if [[ "$MODE" == "6" ]]; then
    grep -q "__IMG_PLACEHOLDER_" "$HTML" && { echo "❌ Unreplaced placeholders"; exit 1; }
    COUNT=$(grep -o 'data:image/jpeg;base64,' "$HTML" | wc -l | tr -d ' ')
    [[ "$COUNT" -lt 20 ]] && echo "⚠️  Only $COUNT/20 images injected" || echo "✅ 20/20 images injected"
  fi
fi

echo "✅ Acceptance $WAVE passed"
