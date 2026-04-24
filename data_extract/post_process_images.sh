#!/bin/bash
# ============================================================================
# post_process_images.sh — Landing v1.0 Image Pipeline (§6.1 Gemini TZ)
# ============================================================================
# Обрабатывает 20 raw-изображений Nano Banana из images_raw/ → images_processed/
#   9 портретов (team+advisory) → 800×1000 JPEG Q75
#   7 постеров (projects)       → 1200×1800 JPEG Q80
#   2 баннера                   → 2400×900 JPEG Q80
#   2 hero                      → 2560×1440 / 2400×1350 JPEG Q80
# Бюджет суммарно: ≤ 5000 KB
# Инструменты: sips (встроен в macOS), shasum (встроен), jq (опционально)
# ============================================================================

set -e  # fail on any error

# --- Пути ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW="${SCRIPT_DIR}/images_raw"
OUT="${SCRIPT_DIR}/images_processed"
TMP="${SCRIPT_DIR}/.tmp_proc"
MANIFEST="${OUT}/manifest.json"
LOG="${OUT}/process.log"
BUDGET_BYTES=5120000   # 5000 KB

# --- Утилиты ---
err() { echo -e "\033[31m[ERROR]\033[0m $*" >&2; exit 1; }
ok()  { echo -e "\033[32m[OK]\033[0m $*"; }
info(){ echo -e "\033[36m[..]\033[0m $*"; }
step(){ echo -e "\n\033[1;33m━━━ $* ━━━\033[0m"; }

# --- 0. Проверка окружения ---
step "0. Проверка окружения"
command -v sips   >/dev/null || err "sips не найден (должен быть встроен в macOS)"
command -v shasum >/dev/null || err "shasum не найден"
[ -d "$RAW" ] || err "Нет папки $RAW"
RAW_COUNT=$(ls "$RAW"/*.png 2>/dev/null | wc -l | tr -d ' ')
[ "$RAW_COUNT" -eq 20 ] || err "Ожидалось 20 PNG в raw, найдено $RAW_COUNT"
ok "sips + shasum OK, 20 raw PNG найдены"

# --- 0b. Нормализация имён (strip leading/trailing whitespace, NBSP, etc.) ---
step "0b. Нормализация имён raw (strip пробелов/NBSP)"
RENAMED=0
find "$RAW" -maxdepth 1 -name '*.png' -print0 | while IFS= read -r -d '' f; do
  dir=$(dirname "$f")
  base=$(basename "$f")
  # убираем ведущие/хвостовые: space, tab, NBSP (\xc2\xa0), em-space (\xe2\x80\x83)
  new=$(printf '%s' "$base" | sed -E $'s/^[[:space:]\xc2\xa0\xe2\x80\x83]+//; s/[[:space:]\xc2\xa0\xe2\x80\x83]+$//')
  if [ "$base" != "$new" ]; then
    if [ ! -f "$dir/$new" ]; then
      mv "$f" "$dir/$new"
      info "normalized: '$base' → '$new'"
    else
      info "skipped (target exists): '$base'"
    fi
  fi
done
ok "Имена raw нормализованы"

# --- 1. Подготовка выходной папки ---
step "1. Подготовка images_processed/ и временной tmp"
rm -rf "$OUT" "$TMP"
mkdir -p "$OUT" "$TMP"
: > "$LOG"
ok "Папки созданы"

# --- 2. Функция обработки ---
# process <src_basename> <out_name> <op> <arg1> <arg2> <quality>
#   op = "resize"  → -z H W (keep aspect)
#   op = "crop"    → --cropToHeightWidth H W (center crop)
#   op = "fit"     → resize width W, затем crop height H (rect target)
process() {
  local src="$1" out="$2" op="$3" a1="$4" a2="$5" q="$6"
  local src_path="$RAW/$src"
  local tmp_png="$TMP/tmp_$$.png"
  local out_path="$OUT/$out"

  [ -f "$src_path" ] || err "Нет исходника: $src_path"

  cp "$src_path" "$tmp_png"

  case "$op" in
    resize)
      # -z HEIGHT WIDTH (уменьшает так, чтобы обе стороны влезли, keep aspect)
      sips -z "$a1" "$a2" "$tmp_png" --out "$tmp_png" >/dev/null
      ;;
    crop)
      sips --cropToHeightWidth "$a1" "$a2" "$tmp_png" --out "$tmp_png" >/dev/null
      ;;
    fit)
      # fit по ширине, затем crop высоты (для banner/hero где aspect отличается)
      # -Z W    — fit max dimension by width (sips -Z = max dimension)
      # но нам нужно по ширине: используем resampleWidth
      sips --resampleWidth "$a2" "$tmp_png" --out "$tmp_png" >/dev/null
      sips --cropToHeightWidth "$a1" "$a2" "$tmp_png" --out "$tmp_png" >/dev/null
      ;;
    crop_then_fit)
      # сначала crop до нужного aspect, потом resize
      # a1 = target_H, a2 = target_W, первые два доп.аргумента — intermediate
      # Для квадратов 2048×2048 → сначала crop к 4:5 (H=2048, W=1638), потом resize до 1000×800
      local interm_h="$a1"
      local interm_w=$(echo "scale=0; $a1 * $7 / $8" | bc)
      sips --cropToHeightWidth "$interm_h" "$interm_w" "$tmp_png" --out "$tmp_png" >/dev/null
      sips -z "$a1" "$a2" "$tmp_png" --out "$tmp_png" >/dev/null
      ;;
  esac

  # Конвертация в JPEG с качеством
  sips -s format jpeg -s formatOptions "$q" "$tmp_png" --out "$out_path" >/dev/null

  local size=$(stat -f%z "$out_path")
  local sha=$(shasum -a 256 "$out_path" | awk '{print $1}')
  printf "%-42s %4d×%-4d Q%-2d  %8d B  %s\n" "$out" \
    "$(sips -g pixelWidth "$out_path" 2>/dev/null | tail -1 | awk '{print $2}')" \
    "$(sips -g pixelHeight "$out_path" 2>/dev/null | tail -1 | awk '{print $2}')" \
    "$q" "$size" "${sha:0:12}" | tee -a "$LOG"

  # В manifest (простой csv, потом соберём в json)
  echo "$out,$size,$sha" >> "$TMP/manifest.csv"

  rm -f "$tmp_png"
}

# portrait() — для квадратов 2048×2048 → 800×1000 (4:5)
#   1) crop до 2048×1638 (вырезаем 4:5 из центра)
#   2) resize до 1000×800
portrait() {
  local src="$1" out="$2"
  local tmp_png="$TMP/tmp_$$.png"
  cp "$RAW/$src" "$tmp_png"
  # crop центра к 2048(h)×1638(w) — это 4:5
  sips --cropToHeightWidth 2048 1638 "$tmp_png" --out "$tmp_png" >/dev/null
  # resize до 1000×800
  sips -z 1000 800 "$tmp_png" --out "$tmp_png" >/dev/null
  sips -s format jpeg -s formatOptions 75 "$tmp_png" --out "$OUT/$out" >/dev/null
  local size=$(stat -f%z "$OUT/$out")
  local sha=$(shasum -a 256 "$OUT/$out" | awk '{print $1}')
  printf "%-42s %4s×%-4s Q75  %8d B  %s\n" "$out" "800" "1000" "$size" "${sha:0:12}" | tee -a "$LOG"
  echo "$out,$size,$sha" >> "$TMP/manifest.csv"
  rm -f "$tmp_png"
}

# --- 3. Обработка 9 портретов (team + advisory) ---
step "3. Портреты (9 шт, 800×1000 Q75)"
portrait "team:01_ceo.jpg.png"                          "team_01_ceo.jpg"
portrait "team:02_producer_lead.jpg.png"                "team_02_producer_lead.jpg"
portrait "team:03_cfo.jpg.png"                          "team_03_cfo.jpg"
portrait "team:04_head_distribution.jpg.png"            "team_04_head_distribution.jpg"
portrait "team:05_creative_director.jpg.png"            "team_05_creative_director.jpg"
portrait "advisory:01_industry_veteran.jpg.png"         "advisory_01_industry_veteran.jpg"
portrait "advisory:02_finance_advisor.jpg.png"          "advisory_02_finance_advisor.jpg"
portrait "advisory:03_distribution_advisor.jpg.png"     "advisory_03_distribution_advisor.jpg"
portrait "advisory:04_international_advisor.jpg.png"    "advisory_04_international_advisor.jpg"

# --- 4. 7 постеров проектов (2:3 уже совпадает, только resize + Q80) ---
step "4. Постеры проектов (7 шт, 1200×1800 Q80)"
for i in 01 02 03 04 05 06 07; do
  process "projects:${i}_PROJECT_${i}_poster.jpg.png" "project_${i}_poster.jpg" \
    "resize" 1800 1200 80
done

# --- 5. 2 банера (→ 2400×900) ---
step "5. Баннеры (2 шт, 2400×900 Q80)"
# market_context: 3168×1344 → resize к width 2400 (height 1019) → crop height 900
process "banners:market_context.jpg.png" "banner_market_context.jpg" "fit" 900 2400 80
# press:          2752×1536 → resize к width 2400 (height 1340) → crop height 900
process "banners:press.jpg.png"          "banner_press.jpg"          "fit" 900 2400 80

# --- 6. 2 hero ---
step "6. Hero (2 шт, Q80)"
# hero_bg: 2752×1536 → 2560×1440 (aspect уже 16:9, fit+crop)
process "hero_bg.jpg.png"         "hero_bg.jpg"         "fit" 1440 2560 80
# hero_film_reel: 2400×1792 → целевой 2400×1350 (не апскейлим), 16:9
process "hero_film_reel.jpg.png"  "hero_film_reel.jpg"  "fit" 1350 2400 80

# --- 7. Сборка manifest.json ---
step "7. Сборка manifest.json"
{
  echo "{"
  echo "  \"version\": \"1.0\","
  echo "  \"generated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"style_signature\": \"shadows_of_sunset_v1\","
  echo "  \"total_files\": $(wc -l < "$TMP/manifest.csv" | tr -d ' '),"
  echo "  \"files\": ["
  awk -F, 'NR>0{printf "    {\"name\":\"%s\",\"size\":%d,\"sha256\":\"%s\"}%s\n", $1,$2,$3, (NR==20?"":",")}' "$TMP/manifest.csv"
  echo "  ]"
  echo "}"
} > "$MANIFEST"
ok "manifest.json → $MANIFEST"

# --- 8. Проверка бюджета ---
step "8. Проверка бюджета"
TOTAL=$(awk -F, '{s+=$2} END{print s}' "$TMP/manifest.csv")
TOTAL_KB=$(( TOTAL / 1024 ))
BUDGET_KB=$(( BUDGET_BYTES / 1024 ))
PCT=$(( TOTAL * 100 / BUDGET_BYTES ))

echo ""
printf "Суммарный вес processed: %d байт (%d KB)\n" "$TOTAL" "$TOTAL_KB"
printf "Бюджет:                   %d байт (%d KB)\n" "$BUDGET_BYTES" "$BUDGET_KB"
printf "Использовано бюджета:     %d%%\n" "$PCT"
echo ""

if [ "$TOTAL" -le "$BUDGET_BYTES" ]; then
  ok "✅ Бюджет уложен: $TOTAL_KB KB / $BUDGET_KB KB ($PCT%)"
else
  OVER=$(( TOTAL - BUDGET_BYTES ))
  OVER_KB=$(( OVER / 1024 ))
  err "❌ Превышение бюджета на $OVER_KB KB. Рекомендация: снизить Q80→Q75 для постеров или уменьшить размеры баннеров."
fi

# --- 9. Очистка tmp ---
rm -rf "$TMP"

step "ГОТОВО"
echo "Выход: $OUT"
echo "Manifest: $MANIFEST"
echo "Log: $LOG"
echo ""
ls -la "$OUT"/*.jpg 2>/dev/null
