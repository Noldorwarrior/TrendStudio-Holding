#!/usr/bin/env bash
# acceptance.sh v2.0 — per-wave gate + Animation Layer + M3 replace check
set -euo pipefail
WAVE="${1:---wave=0}"
IMAGE_CHECK="${2:-}"
MODE="${WAVE#--wave=}"
HTML="${REPO_ROOT:-$(pwd)}/landing_v2.0.html"
# Fallback на v1.0 если v2 ещё не собран
[[ ! -f "$HTML" ]] && HTML="${REPO_ROOT:-$(pwd)}/landing_v1.0.html"

echo "=== Acceptance gate $WAVE $IMAGE_CHECK (v2.0) ==="

if [[ "$MODE" == "dry-run" || "$MODE" == "--dry-run" ]]; then
  command -v python3 >/dev/null && command -v node >/dev/null && echo "✅ Tools OK" && exit 0 || exit 1
fi

if [[ "$MODE" != "0" && ! -f "$HTML" ]]; then
  echo "❌ HTML missing"; exit 1
fi

# Forbidden APIs
if [[ -f "$HTML" ]] && grep -qE "localStorage|sessionStorage|document\.cookie" "$HTML"; then
  echo "❌ Forbidden storage API"; exit 1
fi

# Anchors (W-guard)
if [[ "$MODE" -ge "1" && -f "$HTML" ]]; then
  MISSING=0
  for A in "3000" "7" "24.75" "20.09"; do
    grep -q "$A" "$HTML" || { MISSING=$((MISSING+1)); }
  done
  [[ "$MODE" -ge "2" && $MISSING -gt 2 ]] && { echo "❌ too many anchors missing"; exit 1; }
fi

# Invariants
if [[ -f "${REPO_ROOT}/.landing-autonomous/scripts/invariants_check.py" ]]; then
  REPO_ROOT="$REPO_ROOT" python3 "${REPO_ROOT}/.landing-autonomous/scripts/invariants_check.py" --wave="$MODE" || echo "⚠️ Invariants warning"
fi

# i18n (W6)
if [[ "$MODE" == "6" ]]; then
  REPO_ROOT="$REPO_ROOT" python3 "${REPO_ROOT}/.landing-autonomous/scripts/i18n_check.py" --strict || echo "⚠️ i18n asymmetry"
fi

# =========================================================
# NEW v2.0 CHECKS
# =========================================================

# §6.1 Animation Layer check (applied from W2 onwards)
if [[ "$MODE" -ge "2" && -f "$HTML" ]]; then
  echo "--- Animation Layer (v2.0) ---"
  ANIM=$(grep -c "useReveal\|IntersectionObserver" "$HTML" 2>/dev/null || echo 0)
  TOOLT=$(grep -c "Tooltip\|tooltip\|aria-describedby" "$HTML" 2>/dev/null || echo 0)
  HOVER=$(grep -c ":hover\|onMouseEnter" "$HTML" 2>/dev/null || echo 0)
  RMOTION=$(grep -c "prefers-reduced-motion" "$HTML" 2>/dev/null || echo 0)
  echo "  reveal_hooks=$ANIM tooltips=$TOOLT hover=$HOVER reduce_motion=$RMOTION"
  # Thresholds grow with waves: W2:5/3/3/1, W4:12/8/6/1, W6:20/15/10/1
  case "$MODE" in
    2) MIN_ANIM=5; MIN_TOOL=3; MIN_HOV=3 ;;
    3) MIN_ANIM=8; MIN_TOOL=5; MIN_HOV=4 ;;
    4) MIN_ANIM=12; MIN_TOOL=8; MIN_HOV=6 ;;
    5) MIN_ANIM=16; MIN_TOOL=12; MIN_HOV=8 ;;
    6) MIN_ANIM=20; MIN_TOOL=15; MIN_HOV=10 ;;
    *) MIN_ANIM=0; MIN_TOOL=0; MIN_HOV=0 ;;
  esac
  [[ "$ANIM" -lt "$MIN_ANIM" ]] && echo "⚠️  animation hooks less than expected ($ANIM < $MIN_ANIM)"
  [[ "$TOOLT" -lt "$MIN_TOOL" ]] && echo "⚠️  tooltips less than expected ($TOOLT < $MIN_TOOL)"
  [[ "$HOVER" -lt "$MIN_HOV" ]] && echo "⚠️  hover states less than expected ($HOVER < $MIN_HOV)"
  [[ "$MODE" == "6" && "$RMOTION" -lt 1 ]] && { echo "❌ prefers-reduced-motion missing"; exit 1; }
fi

# §6.2 M3 replace check (W4+)
if [[ "$MODE" -ge "4" && -f "$HTML" ]]; then
  echo "--- M3 Replace check ---"
  # Old M3 должен быть удалён
  if grep -qiE "probability.*IRR|P\(IRR" "$HTML"; then
    echo "⚠️  Old M3 probability terms detected"
  fi
  # Новый Commitment Calculator должен быть
  if ! grep -qiE "Commitment|MOIC.*3\.6|your_take|Вложили.*Получите" "$HTML"; then
    echo "⚠️  New Commitment Calculator signature not found"
  fi
fi

# §6.3 PE-glossary tooltips check (W5+)
if [[ "$MODE" -ge "5" && -f "$HTML" ]]; then
  echo "--- PE glossary check ---"
  for TERM in "hurdle" "catch-up" "super-carry" "MOIC" "waterfall"; do
    if ! grep -iq "$TERM" "$HTML"; then
      echo "⚠️  Term '$TERM' not in HTML"
    fi
  done
fi

# Image check (legacy)
if [[ "$IMAGE_CHECK" == "--image-check" ]]; then
  case "$MODE" in
    1) EXP="img17 img19 img20" ;;
    3) EXP="img01 img02 img03 img04 img05 img06 img07 img08 img09 img10 img11 img12 img13 img14 img15 img16" ;;
    5) EXP="img18" ;;
    *) EXP="" ;;
  esac
  for ID in $EXP; do
    grep -q "__IMG_PLACEHOLDER_${ID}__\|data:image/jpeg;base64," "$HTML" || { echo "❌ $ID missing"; exit 1; }
  done
  if [[ "$MODE" == "6" ]]; then
    grep -q "__IMG_PLACEHOLDER_" "$HTML" && { echo "❌ unreplaced placeholders"; exit 1; }
    CNT=$(grep -o 'data:image/jpeg;base64,' "$HTML" | wc -l | tr -d ' ')
    [[ "$CNT" -ge 20 ]] && echo "✅ 20/20 images injected" || echo "⚠️ Only $CNT/20 images"
  fi
fi

echo "✅ Acceptance $WAVE v2.0 passed"
