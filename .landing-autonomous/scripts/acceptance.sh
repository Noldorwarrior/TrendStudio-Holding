#!/usr/bin/env bash
# acceptance.sh v2.2 — grep-contract enforcement. Волна фейлится если MUST не пройден.
set -euo pipefail
WAVE="${1:---wave=0}"
IMAGE_CHECK="${2:-}"
MODE="${WAVE#--wave=}"
HTML="${REPO_ROOT:-$(pwd)}/landing_v2.2.html"
[[ ! -f "$HTML" ]] && HTML="${REPO_ROOT:-$(pwd)}/landing_v2.1.html"

echo "=== Acceptance v2.2 gate $WAVE ==="

if [[ "$MODE" == "dry-run" || "$WAVE" == "--dry-run" ]]; then
  command -v python3 >/dev/null && command -v node >/dev/null && echo "✅ Tools OK" && exit 0 || exit 1
fi
[[ "$MODE" != "0" && ! -f "$HTML" ]] && { echo "❌ HTML missing"; exit 1; }

FAILS=0
check_must_contain() {
  local PATTERN="$1"
  local LABEL="${2:-$PATTERN}"
  if grep -qE "$PATTERN" "$HTML" 2>/dev/null; then
    echo "  ✅ $LABEL"
  else
    echo "  ❌ MUST_CONTAIN missing: $LABEL"
    FAILS=$((FAILS+1))
  fi
}
check_must_not_contain() {
  local PATTERN="$1"
  local LABEL="${2:-$PATTERN}"
  if grep -qE "$PATTERN" "$HTML" 2>/dev/null; then
    echo "  ❌ MUST_NOT_CONTAIN found: $LABEL"
    FAILS=$((FAILS+1))
  else
    echo "  ✅ (absent) $LABEL"
  fi
}
count_at_least() {
  local PATTERN="$1" MIN="$2" LABEL="${3:-$PATTERN}"
  local N=$(grep -cE "$PATTERN" "$HTML" 2>/dev/null || echo 0)
  if [[ "$N" -ge "$MIN" ]]; then
    echo "  ✅ $LABEL: $N ≥ $MIN"
  else
    echo "  ❌ $LABEL: $N < $MIN"
    FAILS=$((FAILS+1))
  fi
}

if [[ ! -f "$HTML" ]]; then
  echo "skip gate (no HTML yet, MODE=$MODE)"
  exit 0
fi

# ========== §3 Systemic (всегда проверяем начиная с W2) ==========
if [[ "$MODE" -ge "2" ]]; then
  echo "--- §3.1 Premium polish markers ---"
  check_must_contain 'feTurbulence' 'SVG film-grain filter'
  check_must_contain 'mask-image' 'CSS mask (color-seam fix)'
  check_must_contain 'backdrop-filter' 'glass-morphism'
  check_must_contain 'cubic-bezier\(0\.22' 'premium easing'
  check_must_contain '<canvas' 'Canvas element'
  count_at_least '<Reveal' 20 'Reveal instances'
  count_at_least 'Tooltip' 10 'Tooltip instances'
  count_at_least 'cubic-bezier' 8 'cubic-bezier uses'
  count_at_least '@keyframes' 5 '@keyframes count'
fi

# ========== §3.2 Content shift (W1+) ==========
if [[ "$MODE" -ge "1" ]]; then
  echo "--- §3.2 Content shift ---"
  check_must_not_contain 'LP-фонд российского кино' 'old LP tagline'
  check_must_not_contain 'Запросить LP-пакет' 'old CTA'
  check_must_not_contain 'Почему ТрендСтудио' 'old Thesis title'
  check_must_not_contain 'Скачать memo' 'old secondary CTA'
  check_must_contain 'холдинг' 'lowercase холдинг'
  check_must_contain 'партнёрств' 'партнёрство root'
  check_must_contain 'Обсудить партнёрство' 'new primary CTA'
  check_must_contain 'investment pack' 'new secondary CTA'
  check_must_contain 'ваш фонд' 'address audience'
  count_at_least 'холдинг' 6 'холдинг mentions'
  count_at_least 'партнёрств' 4 'партнёрство root count'
  count_at_least 'ваш фонд' 3 'ваш фонд addressing'
fi

# ========== §3.3 Structural ==========
if [[ "$MODE" -ge "3" ]]; then
  echo "--- §3.3 Structural ---"
  check_must_not_contain 'function StagesSection' 'Kanban removed'
  check_must_not_contain 'pravatar' 'no pravatar placeholders'
  check_must_not_contain 'unsplash' 'no unsplash placeholders'
  check_must_not_contain 'localStorage' 'no localStorage'
  check_must_not_contain 'sessionStorage' 'no sessionStorage'
fi

# ========== §4 Section-specific per wave ==========
if [[ "$MODE" == "1" || "$MODE" == "6" ]]; then
  echo "--- §4.1 s01 Hero ---"
  check_must_contain 'mask-image.*linear-gradient.*transparent.*black.*85%.*transparent' 'Hero mask-gradient'
  check_must_contain '@keyframes.*kenburns|@keyframes.*ken-burns' 'ken-burns anim'
  check_must_contain 'feTurbulence' 'Hero film-grain filter'
  check_must_contain 'radial-gradient.*transparent.*40%' 'vignette overlay'
  check_must_contain 'Обсудить партнёрство' 'Hero primary CTA text'
  count_at_least 'animationDelay' 3 'entrance sequence delays'

  echo "--- §4.2 s02 Thesis ---"
  check_must_contain 'Почему партнёрство|Почему сотрудничеств|Что мы приносим' 'new Thesis title'
  check_must_contain 'backdrop-filter.*blur' 'Thesis glass-morphism'
fi

if [[ "$MODE" == "2" || "$MODE" == "6" ]]; then
  echo "--- §4.4 s04 Fund Structure ---"
  check_must_contain 'background.*#15181C' 'Fund tooltip bg dark'
  echo "--- §4.5 s05 Economics KPI ---"
  check_must_contain 'rotateY.*180|perspective.*backface-visibility' 'flip-cards'
  echo "--- §4.7 s06 M1 Monte-Carlo ---"
  check_must_contain 'cursor.*rgba\(244,162,97' 'M1 cursor warm (not white)'
fi

if [[ "$MODE" == "3" || "$MODE" == "6" ]]; then
  echo "--- §4.8 s07 Pipeline cards ---"
  check_must_contain 'transform-origin' 'pipe cards pivot'
  check_must_contain 'perspective:' '3D perspective'
  check_must_contain 'will-change.*transform' 'GPU hint'
  echo "--- §4.9 Team/Advisory ---"
  count_at_least 'aria-expanded' 9 'Team/Advisory expandable cards'
fi

if [[ "$MODE" == "4" || "$MODE" == "6" ]]; then
  echo "--- §4.11 s13 Roadmap ---"
  check_must_not_contain 'animation:.*pulse.*infinite' 'no infinite pulse (broken)'
  check_must_contain 'swimlane|swimLane|lane-' 'swimlanes'
  check_must_contain 'scrubber|playhead|yearSelector' 'scrubber-playhead'

  echo "--- §4.12 s16 Tax Credits ---"
  check_must_contain 'Math.min.*budget.*0\.85|totalSubsidy.*0\.85|cap.*85' 'Tax cap 85%'
  check_must_not_contain 'Эффективная ставка.*10[0-9]%' 'no 100%+ effective rate'

  echo "--- §4.17 M2 Pipeline Builder ---"
  check_must_contain 'Portfolio size|Бюджет портфеля' 'M2 KPI budget'
  check_must_contain 'Weighted IRR|weightedIRR' 'M2 KPI IRR'
  check_must_contain '"Вернуть к исходному"|Вернуть к исходному' 'M2 button renamed'
  check_must_not_contain '"Reset to Canon"' 'old button name'

  echo "--- §4.18 M3 Commitment Calc ---"
  check_must_contain 'Partner|Lead Investor|Anchor Partner' 'M3 new tier badges'
  check_must_not_contain '"Supporter"' 'old tier LP name'
fi

if [[ "$MODE" == "5" || "$MODE" == "6" ]]; then
  echo "--- §4.13 s19 Distribution ---"
  check_must_contain 'PieChart' 'Distribution donut'
  check_must_contain 'activeChannel|hoverChannel' 'distribution 2-way sync'

  echo "--- §4.14 s20 Waterfall ---"
  check_must_contain '<canvas|<svg.*filter.*drop-shadow|<svg.*particle' 'Waterfall visual (not just text)'
  count_at_least 'Tooltip' 15 'more tooltips after W5'
fi

if [[ "$MODE" == "6" ]]; then
  echo "--- §4.15 s21 Legal ---"
  check_must_contain 'rotateY.*180|transform-style.*preserve-3d' 'Legal flip cards'
  count_at_least 'aria-expanded' 15 'Legal/TermSheet/Team expand states combined'

  echo "--- §4.16 s23 Term Sheet ---"
  check_must_contain 'expandedRow|activeRow|setOpenRow' 'Term Sheet accordion'

  # FAQ order
  echo "--- §3.4 FAQ order ---"
  FAQ_LINE=$(grep -n 'function FAQSection' "$HTML" | head -1 | cut -d: -f1)
  PRESS_LINE=$(grep -n 'function PressQuotesSection' "$HTML" | head -1 | cut -d: -f1)
  LEGAL_LINE=$(grep -n 'function LegalSection' "$HTML" | head -1 | cut -d: -f1)
  if [[ -n "$FAQ_LINE" && -n "$PRESS_LINE" && -n "$LEGAL_LINE" ]]; then
    if [[ "$FAQ_LINE" -gt "$PRESS_LINE" && "$FAQ_LINE" -lt "$LEGAL_LINE" ]]; then
      echo "  ✅ FAQ between Press and Legal ($FAQ_LINE)"
    else
      echo "  ❌ FAQ order wrong: FAQ=$FAQ_LINE Press=$PRESS_LINE Legal=$LEGAL_LINE"
      FAILS=$((FAILS+1))
    fi
  fi
fi

# ========== Image check ==========
if [[ "$IMAGE_CHECK" == "--image-check" ]]; then
  case "$MODE" in
    1) EXP="img17 img19 img20" ;;
    3) EXP="img01 img02 img03 img04 img05 img06 img07 img08 img09 img10 img11 img12 img13 img14 img15 img16" ;;
    5) EXP="img18" ;;
    *) EXP="" ;;
  esac
  for ID in $EXP; do
    grep -q "__IMG_PLACEHOLDER_${ID}__\|data:image/jpeg;base64," "$HTML" || { echo "❌ $ID missing"; FAILS=$((FAILS+1)); }
  done
  if [[ "$MODE" == "6" ]]; then
    if grep -q "__IMG_PLACEHOLDER_" "$HTML"; then
      echo "❌ unreplaced placeholders"
      FAILS=$((FAILS+1))
    fi
  fi
fi

echo ""
if [[ "$FAILS" -gt 0 ]]; then
  echo "❌ Acceptance $WAVE FAILED ($FAILS issues) — subagent must retry with fixes"
  exit 1
fi
echo "✅ Acceptance $WAVE v2.2 passed (all grep-contracts OK)"
exit 0
