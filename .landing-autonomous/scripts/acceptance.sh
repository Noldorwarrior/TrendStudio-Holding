#!/usr/bin/env bash
# acceptance.sh v2.1 — per-wave + content shift + P1-P4 + premium polish
set -euo pipefail
WAVE="${1:---wave=0}"
IMAGE_CHECK="${2:-}"
MODE="${WAVE#--wave=}"
HTML="${REPO_ROOT:-$(pwd)}/landing_v2.1.html"
[[ ! -f "$HTML" ]] && HTML="${REPO_ROOT:-$(pwd)}/landing_v2.0.html"  # fallback
[[ ! -f "$HTML" ]] && HTML="${REPO_ROOT:-$(pwd)}/landing_v1.0.html"  # fallback

echo "=== Acceptance v2.1 gate $WAVE $IMAGE_CHECK ==="

if [[ "$MODE" == "dry-run" || "$WAVE" == "--dry-run" ]]; then
  command -v python3 >/dev/null && command -v node >/dev/null && echo "✅ Tools OK" && exit 0 || exit 1
fi

[[ "$MODE" != "0" && ! -f "$HTML" ]] && { echo "❌ HTML missing"; exit 1; }

if [[ -f "$HTML" ]]; then
  # Legacy forbidden
  grep -qE "localStorage|sessionStorage|document\.cookie" "$HTML" && { echo "❌ Forbidden storage API"; exit 1; }

  # v2.1 forbidden: no pravatar/unsplash
  if [[ "$MODE" -ge "3" ]]; then
    grep -qi "pravatar\|unsplash" "$HTML" && echo "⚠️ pravatar/unsplash detected — должны быть images из pack"
  fi

  # v2.1 content shift (W1+)
  if [[ "$MODE" -ge "1" ]]; then
    # Должен быть холдинг-context
    grep -iq "холдинг\|партнёрств\|обсудить партнёр\|фонд-инвестор\|для вашего фонда" "$HTML" || \
      echo "⚠️ content shift v2.1 (холдинг→фонд) not fully applied"
  fi

  # Anchors (W2+)
  if [[ "$MODE" -ge "2" ]]; then
    for A in "3000" "7" "24.75" "20.09"; do
      grep -q "$A" "$HTML" || echo "⚠️ anchor $A missing"
    done
  fi

  # P3 Animation Layer (W2+)
  if [[ "$MODE" -ge "2" ]]; then
    ANIM=$(grep -c "useReveal\|IntersectionObserver\|<Reveal" "$HTML" 2>/dev/null || echo 0)
    TOOLT=$(grep -c "Tooltip\|aria-describedby" "$HTML" 2>/dev/null || echo 0)
    echo "  Reveal/Observer=$ANIM Tooltips=$TOOLT"
    case "$MODE" in
      2) [[ "$ANIM" -lt 8 ]] && echo "⚠️ Reveal instances less than expected" ;;
      6) [[ "$ANIM" -lt 30 ]] && echo "⚠️ Reveal instances W6 < 30" ;;
    esac
  fi

  # P2 wow-anim markers (W3+)
  if [[ "$MODE" -ge "3" ]]; then
    WOW_EASING=$(grep -c "cubic-bezier" "$HTML" 2>/dev/null || echo 0)
    KEYFRAMES=$(grep -c "@keyframes" "$HTML" 2>/dev/null || echo 0)
    echo "  cubic-bezier=$WOW_EASING @keyframes=$KEYFRAMES"
    [[ "$WOW_EASING" -lt 3 ]] && echo "⚠️ Не хватает premium easing"
  fi

  # P4 load-anim sequence (W1)
  if [[ "$MODE" -ge "1" ]]; then
    grep -q "animationDelay\|transitionDelay" "$HTML" || echo "⚠️ load-anim sequence не обнаружена"
  fi

  # v2.1: Kanban удалён (W3+)
  if [[ "$MODE" -ge "3" ]]; then
    grep -qi "StagesSection\|kanban" "$HTML" && echo "⚠️ Kanban s08 должен быть удалён (v2.1 §2)"
  fi

  # v2.1: FAQ в конце (W5/W6)
  if [[ "$MODE" -ge "5" ]]; then
    LEGAL_POS=$(grep -n "function LegalSection\|id=\"s21\"" "$HTML" | head -1 | cut -d: -f1 || true)
    FAQ_POS=$(grep -n "function FAQSection\|id=\"s18\"" "$HTML" | head -1 | cut -d: -f1 || true)
    if [[ -n "$LEGAL_POS" && -n "$FAQ_POS" && "$FAQ_POS" -lt "$LEGAL_POS" ]]; then
      : # FAQ раньше Legal — старая структура v2.0
      echo "⚠️ FAQ должен быть ПОСЛЕ Press, перед Legal (v2.1 §5.18)"
    fi
  fi

  # v2.1: premium markers (W6)
  if [[ "$MODE" -ge "6" ]]; then
    GLASS=$(grep -c "backdrop-filter\|backdrop-blur" "$HTML" 2>/dev/null || echo 0)
    [[ "$GLASS" -lt 3 ]] && echo "⚠️ glass-morphism применён мало раз ($GLASS)"
    GRAIN=$(grep -c "feTurbulence\|filter: url(#grain)\|grainy" "$HTML" 2>/dev/null || echo 0)
    [[ "$GRAIN" -lt 1 ]] && echo "⚠️ film-grain не обнаружен"
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
fi

echo "✅ Acceptance $WAVE v2.1 passed"
