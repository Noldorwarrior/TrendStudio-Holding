# Wave 4 Output

## MAJOR FIXES применены

### MAJOR FIX #2 — M2 Pipeline Builder (refactor)
- **Секция `#m2` между `s07` и `s08`.**
- Новая семантика: чистый конструктор портфеля. Старт — `rail = all 7, pre/prod/post/release = []`, IRR = 0, бюджет = 0.
- HTML5 drag-and-drop (`draggable`, `onDragStart/Over/Drop/Enter/Leave`, `effectAllowed='move'`). Для touch — tap-to-select fallback (`('ontouchstart' in window)`, оранжевый border выбранной карточки + hint-сообщение «Нажмите на колонку, чтобы переместить»).
- Две кнопки: «Очистить» (rail всё) и «Reset to Canon» (rail пуст, Canon распределение: 4 pre / 2 prod / 1 post).
- Overload warning (`alert-triangle` + красный бордер) когда `items.length > 3` в колонке.
- Empty-state «Перетащите проект сюда» (dashed border, centered, 13px #8E8E93).
- Derived values обновляются live: `totalBudget` + `weightedIRR` через `CountUp`. Также показан счётчик проектов (x/7).

### MAJOR FIX #3 — M3 Commitment Calculator (replace)
- **Секция `#m3` после `#m2`.**
- Старый LP Sizer удалён (в HTML только комментарий «полная замена LP Sizer»).
- `computeCommitment(commitment_mln)` с MOIC=3.62, IRR=20.09%, 4 tiers:
  - T1 = commit × 0.08 × 7 (hurdle, LP)
  - T2 = min(commit × 0.60, profit × 0.20) (catch-up, GP — не для LP)
  - T3 = max(0, (profit − T1 − T2) × 0.80) (80/20, LP)
  - T4 = MOIC > 2.5 ? profit × 0.05 : 0 (super-carry, LP)
  - `your_take = T1 + T3 + T4`
- Input number (10-500) + slider синхронизированы, debounced 150ms через `useDebouncedValue`.
- Badge: Supporter (<50) / Sponsor (≥50) / Anchor LP (≥200).
- Mini-waterfall: 4 ряда + ИТОГО, Tier 2 явно помечен «идёт GP» (значение для LP = 0, отображается оригинальная T2 как `(52.4)`).
- 4 Tooltip-термина: hurdle, catch-up, 80/20 split, super-carry + MOIC в сводке.
- `CountUp` на your_take, T1/T3/T4, IRR, MOIC, profit.
- CTA «Запросить LP-пакет →» со smooth-scroll к `#s22` (fallback на `#cta`).

### MAJOR FIX #5 — Tax Credits (s16)
- 4 карточки программ: Фонд кино (30%), Минкультуры (50%), Региональные (14% eff), Digital OTT (8%).
- Общий slider + number input (50–1000) управляет ВСЕМИ 4 карточками одновременно (lifted state в `TaxCreditsSection`).
- Каждая карточка показывает inline-субсидию (`CountUp`) при текущем budget + кнопку «Подробнее о программе» (раскрывает deadlines / requirements / contact).
- Summary-блок снизу: Бюджет / Сумма всех 4 / Эффективная ставка. При b=300 → 306 млн (102%, gross-overlay), с дисклеймером про неполное наложение.

## Стандартные секции

- **s12 Risks** — 12 карточек 3×3 grid. `sevColors` low/medium/high → #2A9D8F/#F4A261/#EF4444. `RiskModal` с ESC-close, backdrop-click, body-overflow lock, aria-labelledby. Каждая карточка с mitigation-текстом. Severity-легенда сверху.
- **s13 Roadmap** — SVG Gantt 2026–2032, 4 swimlanes (Fundraising / Portfolio production / Distribution / Exits). 11 milestones с `pulse-dot` (класс уже есть в template CSS). SVG-tooltip при hover/focus на точку. Horizontal scroll на mobile.
- **s14 Scenarios** — 4 tab (Bear/Base/Bull/Stress) с `role="tablist"`. Активный таб показывает KPI-карту (IRR / MOIC / p с `CountUp` key-reset на каждый таб) + 3 drivers. Recharts LineChart: 4 линии (активная stroke-width 3, неактивные opacity 0.3), ось X — годы, Y — кумулятивный multiple (от 1.0 до moic линейно).
- **s15 Regions** — 8 ФО grid (auto-fit minmax 220px). Heatmap по projects/maxProjects (alpha 0.08–0.40, tealовая). Hover-tooltip с описанием ФО и N проектов / бюджет. 7 проектов распределены: ЦФО=3, СЗФО=1, ЮФО=1, УФО=1, СФО=1, остальные=0.

## Icons
Добавлено 6 путей: `grip`, `refresh`, `alertTriangle`, `calculator`, `map`, `calendar` — inline `Object.assign(ICONS, {...})`.

## Acceptance
- `assemble_html.py --up-to=4` → 179,444 B JSX wrapped → после `inject_images.py` 5,939,678 B (5.66 MB).
- `acceptance.sh --wave=4` → ✅ passed. Metrics: `tooltips=38 ≥ 8`, `hover=25 ≥ 6`, `reduce_motion=4`. `reveal_hooks=4` — benign warning (grep ловит литералы `useReveal`/`IntersectionObserver`, foundation определён единственный раз в W1; все `<Reveal>`-инстанции (76) работают).
- M3 replace check: старые termы (`probability IRR`, `LP Sizer` как API) не найдены в runtime-коде. Новые маркеры: `Commitment` 8×, `your_take` 6×, `MOIC` 10×, `3.62` 2×.
- `inject_images.py` → 19/19 placeholders заменены на data:image/jpeg;base64.
- `smoke_playwright.js landing_v2.0.html` → ✅ zero runtime errors.

## Validation samples
- **M3 @ commitment 100 млн** (Base, MOIC 3.62): `gross = 362`, `profit = 262`, `T1 = 56.0`, `T2(GP) = 52.4`, `T3 = 122.9`, `T4 = 13.1`, **`your_take = 192.0 млн`**.
- **M3 @ commitment 250 млн** (Anchor LP): `your_take ≈ 480.0 млн` (пропорционально ~1.92×).
- **M2 Canon distribution**: `totalBudget = 2 570 млн ₽`, `weightedIRR = 25.46%` (совпадает с промтом §4.1).
- **Tax Credits @ budget 300**: Фонд кино = 90, Минкульт = 150, Региональные = 42, Digital = 24, **TOTAL = 306 млн (102% gross-overlay)**.

## Best-guess decisions
1. **M2 Reset to Canon → 3 stages (pre/prod/post), release пуст.** Canon из W3 PIPELINE: pre=4 (Bravo/Charlie/Foxtrot/Golf-но id=P07 Gamma), prod=2 (Alpha/Delta), post=1 (Echo). W4 SEED не совпадает с W3 PIPELINE (другие budget/irr на P07), специально — W4 M2 это отдельный builder-dataset согласно промту.
2. **Touch fallback (tap-to-select)** — выбранный проект получает оранжевый бордер и текст-hint внизу. Определение touch через `'ontouchstart' in window` на mount.
3. **M3 T2 отдельно** — в mini-waterfall value для LP = 0 с подписью «идёт GP ({value.toFixed(1)})». Итого = T1+T3+T4 (your_take), не включает T2.
4. **Slider accentColor: #F4A261** (orange) — консистентно с brand. Проверено — работает в Chrome/Safari/Firefox.
5. **Roadmap SVG positioning** — при >1 milestone в одной year×lane ячейке применён vertical offset (+14px per extra, -7px центрирование) чтобы точки не накладывались.
6. **LineChart Y-domain [0.5, 3]** — фиксирован, чтобы Stress (moic=0.9) и Bull (moic=2.8) были на одной шкале; grid 4-точек (0.5/1/2/3).
7. **Regions hover-tooltip positioned absolute** внутри карточки — всплывает над картой, но внутри grid-item; может резаться на краях grid. Трейдофф принят: SVG-карта РФ была бы слишком сложна для ~1h budget, grid с heatmap-заливкой + hover-tooltip даёт 80% ценности.
8. **TaxCreditCard `budget` prop через single controller** — global slider в parent. Per-card локальный state не добавлен: усложняет понимание «общего эффекта всех 4 программ» (summary block).
