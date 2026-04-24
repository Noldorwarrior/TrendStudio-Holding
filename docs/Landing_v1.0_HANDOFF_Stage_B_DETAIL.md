# Landing v1.0 — Stage B Handoff DETAIL (B1b.1)

**Версия:** 1.0 · **Дата:** 2026-04-19 · **Парный файл:** `Landing_v1.0_HANDOFF_Stage_B.md` (CORE)

---

## 0. Назначение

Документ завершает контракт Cowork → CC для Stage B (wave-mode HTML implementation).
DETAIL = спецификации 22 виз­уа­ли­за­ций (viz01–viz22) и 13 симу­ля­то­ров (sim01–sim13),
плюс общие контракты палитры, типографики, a11y, fallback и numerical parity.

B1b.2 добавит i18n-blueprint (9 namespaces × ~420 keys skeleton).
B1b.3 добавит `landing_b1_wave_plan_v1.0.json` и `invariants_check.py` spec.

---

## 1. Зависимости

Все spec обязаны ссылаться только на уже зафиксированные артефакты:

| Артефакт | Роль |
|---|---|
| `landing_canon_base_v1.0.json` (sha256 `7cc163afabbe0925…`) | Числа, структура фонда, pipeline 7 проектов |
| `landing_canon_extended_v1.0.json` (sha256 `c271322e37145426…`) | 23 UI-блока (viz/sim/nav/i18n/palette/…) |
| `landing_canon_schema_v1.0.json` (sha256 `c739b3bde4782a3c…`) | Draft-07 strict для base |
| `landing_canon_extended_schema_v1.0.json` (sha256 `006d3984bf23f7d9…`) | Draft-07 strict для extended |
| `landing_a3_decisions_v1.0.json` (sha256 `a168c76c1b119636…`) | tone=high_concept_marquee, lang=ru_first_with_en, audio_default=muted |

CC при реализации **ОБЯЗАН** читать payload только из этих JSON.
Запрещено хардкодить числа/даты/имена — только `canon.*.path` references.

---

## 2. Общие контракты

### 2.1 CSS design tokens (`:root`)

Источник — `canon.palette.colors` + `canon.palette.tokens` + `canon.typography`:

```css
:root {
  /* Palette (shadows_of_sunset_v1, dark) */
  --color-bg: #0A0A0F;
  --color-bg-elevated: #141420;
  --color-surface: #1E1E2E;
  --color-text: #F5F1E8;
  --color-text-muted: #8B8680;
  --color-primary: #D4A04C;     /* aggressive gold */
  --color-accent: #C85A2E;      /* warm copper */
  --color-bull: #2E7D32;
  --color-bear: #C62828;
  --color-neutral: #757575;
  --color-border: #2A2A3E;

  /* Shadows + radii */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.6);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Typography */
  --font-display: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-body: "Inter", -apple-system, system-ui, sans-serif;
  --fs-h1: clamp(2.5rem, 5vw, 4.5rem);
  --fs-h2: clamp(2rem, 4vw, 3.25rem);
  --fs-h3: clamp(1.5rem, 3vw, 2.25rem);
  --fs-h4: 1.25rem;
  --fs-body: 1rem;
  --fs-caption: 0.875rem;
  --lh-tight: 1.1;
  --lh-normal: 1.5;
  --lh-relaxed: 1.75;
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-bold: 700;
}
```

### 2.2 Size presets (CSS container queries)

| Preset | Min width | Viz target | Notes |
|---|---|---|---|
| `xs` | 0–479 px | 280×200 | mobile: упрощённая визуализация, без drag |
| `sm` | 480–767 px | 360×240 | |
| `md` | 768–1023 px | 560×340 | tablet |
| `lg` | 1024–1439 px | 720×440 | desktop |
| `xl` | ≥ 1440 px | 960×600 | large desktop / 4K |

Каждая viz обязана корректно ре­ри­сав­ать­ся на `ResizeObserver` внутри своего контейнера (debounce ≥ 120 ms).

### 2.3 a11y baseline

| Правило | Реализация |
|---|---|
| Text contrast | ≥ WCAG 2.1 AA (4.5:1 для body, 3:1 для large text) |
| Focus visible | `*:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` |
| Tab order | Линейный по секциям sXX; viz/sim — skip-link «Skip to next section» |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` отключает GSAP tweens, три D‑автоповороты, particle animations |
| ARIA live regions | `role="status"` для sim outputs; `aria-live="polite"` |
| Keyboard nav | Все viz/sim управляются клавиатурой: Tab/Shift+Tab, стрелки, Enter/Space |
| Screen reader | Каждая viz имеет `aria-labelledby` → key из canon.visualizations.items[i].a11y_label_key |
| Fallback | Каждая viz имеет `<table role="table">` или `<dl>` fallback при `prefers-reduced-motion`, `noscript`, или `no-webgl` |

### 2.4 Interaction patterns (обязательные для всех viz)

```javascript
// Каждая viz регистрируется в TS.Viz (аналог TS.Charts из Deck v1.2.0)
TS.Viz.register('vizNN', {
  render(container, payload) { /* ... */ },
  destroy(container) { /* cleanup */ },
  onResize(container) { /* re-draw */ },
  onReducedMotion(enabled) { /* toggle static fallback */ },
  onThemeChange(theme) { /* reapply CSS vars */ }
});

// События (EventBus от B1a)
TS.emit('viz:rendered', { vizId: 'viz01', durationMs, size });
TS.emit('drilldown:open', { vizId: 'viz01', payload: {...} });
TS.emit('a11y:announce', { key: 'a11y.chart.xxx.update' });
```

### 2.5 Fallback strategy

| Сценарий | Поведение |
|---|---|
| `prefers-reduced-motion: reduce` | Static snapshot, без анимаций. Drag отключён. |
| `noscript` | Весь interactive блок заменён на `<table>` с canon-данными или `<img>` postcard. |
| `no-webgl` (viz01) | Three.js → статичный `<img src="img20 (film_reel)">` |
| `offline` / `fetch-error` | В payload только inline data из canon (никаких `fetch`). |
| Canvas2D / SVG недоступны | N/A в современных браузерах — skip fallback. |

### 2.6 Numerical parity protocol

Каждый sim с `engine ≠ "state_machine"` обязан пройти numerical parity vs canon:

| Sim | Canon reference | Tolerance |
|---|---|---|
| sim01 irr_explorer (mc_light) | `canon.returns.mc_p50_internal = 13.95` | ±0.5 pp |
| sim02 mc_stress (mc_light) | `canon.returns.mc_p50_public = 11.44` | ±0.5 pp |
| sim03 waterfall_flow (closed_form) | `canon.waterfall` tiers (ROC/pref/catchup/carry) | exact |
| sim04 revenue_what_if (closed_form) | `canon.pipeline.total_revenue` | ±1% |
| sim05 irr_scenario (lookup_table) | `canon.returns.scenarios[*]` | exact |
| sim06 scenario_switcher (state_machine) | N/A — lookup only | — |
| sim07 cashflow_stepper (closed_form) | `canon.cashflow.annual[*]` | ±0.01 |
| sim08 peers_compare (lookup_table) | `canon.benchmark_chart.studios[*]` | exact |
| sim09 regions_picker (lookup_table) | `canon.regions_map.items[*]` | exact |
| sim10 horizon_adjuster (closed_form) | `canon.horizon.years = 7` | exact |
| sim11 waterfall_calc (closed_form) | `canon.fund.carry = 20, hurdle = 8, catchup = 100` | exact |
| sim12 risk_toggler (state_machine) | N/A | — |
| sim13 kpi_role_picker (lookup_table) | `canon.kpi_dashboard.roles[*]` | exact |

CC реализует `tests/numerical_parity.test.js` (unit-уровень) — отдельный файл, runs under jest.

---

## 3. Visualization specs (22)

Формат каждой spec:
- **Контракт**: id / lib / tier / placement_section / payload_schema
- **Inputs**: поля payload (с типами и canon-ссылками)
- **Outputs**: DOM element + emitted events
- **CSS**: специфичные tokens
- **Size**: xs/sm/md/lg/xl presets
- **Interaction**: список (из canon.interactivity)
- **a11y**: role / aria-label / keyboard / fallback
- **Budget**: ориентировочно в KB (JS code, без payload)
- **DoD**: acceptance criteria

### 3.1 Marquee tier (3)

#### viz01 — hero_film_reel_3d (Three.js · s01)

**Контракт:** id=`viz01` · lib=Three.js r157 · tier=Marquee · section=s01 · payload_schema=`inline_hero_reel_payload_v1`

**Inputs (из `canon.hero`):**
```json
{
  "still_ids": ["img04","img05","img06","img07","img08"],  // canon.hero.film_reel.still_ids
  "duration_ms": 4000,
  "auto_rotate": true,
  "reel_radius_px": 220
}
```

**Outputs:** `<canvas id="viz01-canvas" role="img">` · events: `viz:rendered`, `drilldown:open` (on still click)

**CSS:**
```css
.viz01-reel { background: var(--color-bg-elevated); box-shadow: var(--shadow-lg); }
.viz01-still { filter: brightness(0.9) contrast(1.1); }
.viz01-glow  { box-shadow: 0 0 32px rgba(200,90,46,0.4); }
```

**Size:** xs 320×320 · md 480×480 · xl 720×720 (1:1 aspect).

**Interaction:** hover (highlight still), click (open modal m04+still id), drag (manual rotate).

**a11y:** `role="img"`, `aria-labelledby="a11y.chart.hero_reel.label"`, keyboard: Tab+Enter зацикленно перелетает между still_ids; reduced-motion → static grid из 5 thumbnails.

**Budget:** ~8 KB JS · 0 KB payload (stills уже в canon.images).

**DoD:**
- Three.js r157 via CDN (`cdnjs.cloudflare.com/.../three.min.js`) — проверить integrity hash перед production
- 60 fps при auto_rotate (desktop); gracefully downgrade до 30 fps на mobile
- 100% покрытие `aria_table` fallback (no-webgl)
- Canvas respects `devicePixelRatio` (retina-ready)

---

#### viz02 — waterfall_3d (D3v7 · s14)

**Контракт:** id=`viz02` · lib=D3 v7.9 · tier=Marquee · section=s14 · payload_schema=`inline_waterfall_payload_v1`

**Inputs (из `canon.waterfall_diagram`):**
```json
{
  "tiers": [
    { "order": 1, "name_key": "waterfall.roc", "threshold": "100% ROC", "split_lp_gp": "100/0" },
    { "order": 2, "name_key": "waterfall.pref", "threshold": "8% pref", "split_lp_gp": "100/0" },
    { "order": 3, "name_key": "waterfall.catchup", "threshold": "100% catch-up", "split_lp_gp": "0/100" },
    { "order": 4, "name_key": "waterfall.carry", "threshold": "after catch-up", "split_lp_gp": "80/20" }
  ],
  "hurdle_pct": 8,       // canon.fund.hurdle
  "carry_pct": 20        // canon.fund.carry
}
```

**Outputs:** `<svg id="viz02-svg" viewBox="...">` · events: `viz:rendered`, `drilldown:open` (on tier click → modal m10).

**CSS:**
```css
.viz02-tier-1 { fill: var(--color-primary); }  /* ROC — gold */
.viz02-tier-2 { fill: var(--color-bull); }     /* pref — green */
.viz02-tier-3 { fill: var(--color-accent); }   /* catchup — copper */
.viz02-tier-4 { fill: var(--color-bear); }     /* carry — red */
.viz02-label  { fill: var(--color-text); font-family: var(--font-body); }
```

**Size:** xs 280×220 · md 560×380 · xl 960×540.

**Interaction:** hover (tier highlight + tooltip с threshold), click (open m10 waterfall_explain modal).

**a11y:** `role="img"`, `aria-labelledby="a11y.chart.waterfall.label"`, keyboard: стрелки ↑↓ переключают активный tier; reduced-motion → static SVG без animated paths.

**Budget:** ~6 KB JS.

**DoD:**
- Waterfall визуально показывает 4 tier последовательно (не накопительно)
- Sankey-style связи между tiers с animated paths (GSAP, respect reduce-motion)
- Tooltip i18n-compatible (читает `canon.waterfall_diagram.tiers[i].name_key`)

---

#### viz03 — timeline_cinematic (GSAP · s17)

**Контракт:** id=`viz03` · lib=GSAP 3.12 + ScrollTrigger · tier=Marquee · section=s17 · payload_schema=`inline_timeline_payload_v1`

**Inputs (из `canon.timeline_roadmap`):**
```json
{
  "years": 7,
  "layout": "scroll_horizontal",
  "items": [
    { "year_offset": 0, "label_key": "timeline.y0", "milestones": ["timeline.y0.m1","timeline.y0.m2"] },
    // … y1..y6
  ]
}
```

**Outputs:** `<div id="viz03-timeline" class="scroll-horizontal">` · events: `viz:rendered`, `drilldown:open` (on milestone click).

**CSS:**
```css
.viz03-timeline { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.viz03-year { scroll-snap-align: start; min-width: 320px; padding: 2rem; border-right: 1px solid var(--color-border); }
.viz03-milestone { color: var(--color-primary); font-family: var(--font-display); }
```

**Size:** xs 280×400 (vertical timeline) · md 560×320 · xl 960×420 (horizontal).

**Interaction:** hover (highlight milestone), click (open modal с подробностью milestone), drag (scroll horizontally, inertial via GSAP Draggable).

**a11y:** `role="list"`, каждая `y*` — `role="listitem"`; keyboard: Tab по milestones, стрелки ←→ scroll; reduced-motion → static ordered list (`<ol>`).

**Budget:** ~7 KB JS (без GSAP core, кот. shared).

**DoD:**
- ScrollTrigger пинит секцию на время прохождения timeline (s17 в `canon.animations.scroll_trigger.sections_with_pinning`)
- Каждый milestone clickable и имеет modal-ссылку
- Fallback: `<ol>` с `<li>` на каждый year и nested `<ul>` с milestones

---

### 3.2 Hero tier (4)

#### viz04 — irr_sensitivity (D3v7 · s09)

**Контракт:** id=`viz04` · lib=D3 v7.9 · tier=Hero · section=s09 · payload_schema=`inline_irr_payload_v1`

**Inputs (из `canon.returns` + cross-section):**
```json
{
  "x_var": "hurdle_pct",        // 0..15
  "y_var": "carry_pct",         // 10..30
  "z_metric": "irr_lp",         // 2D heatmap cell = IRR_LP
  "anchor": { "hurdle": 8, "carry": 20, "irr": 24.75 }   // canon.returns.irr_internal_w5vd
}
```

**Outputs:** `<svg id="viz04-heatmap">` + tooltip · events: `viz:rendered`, hover tooltip.

**CSS:** linear interpolation `var(--color-bear)` (low IRR) → `var(--color-neutral)` → `var(--color-bull)` (high IRR).

**Size:** xs 280×280 · md 480×420 · xl 640×560.

**Interaction:** hover (cell tooltip: x=Xpp, y=Ypp, IRR=Z%), click (pin value in compare tray).

**a11y:** `role="table"` с `<tr>/<td>` для каждой клетки (SR-friendly); keyboard: стрелки для навигации по клеткам; fallback `aria_table`.

**Budget:** ~5 KB JS.

**DoD:**
- Anchor-клетка (hurdle=8, carry=20) подсвечена: `stroke: var(--color-primary); stroke-width: 2px`
- Tooltip показывает значение с 2 знаками: «IRR_LP = 24.75%» (формат из canon.returns.*)
- Numerical parity: anchor cell value === `canon.returns.irr_internal_w5vd = 24.75` (exact)

---

#### viz05 — mc_distribution (D3v7 · s10)

**Контракт:** id=`viz05` · lib=D3 v7.9 · tier=Hero · section=s10 · payload_schema=`inline_mc_dist_payload_v1`

**Inputs (из `canon.returns.mc_*`):**
```json
{
  "mc_samples": 10000,
  "p50_internal": 13.95,                 // canon.returns.mc_p50_internal
  "p50_public": 11.44,                   // canon.returns.mc_p50_public
  "p10_internal": 8.2, "p90_internal": 21.8,   // inferred from canon
  "hist_bins": 50
}
```

**Outputs:** `<svg id="viz05-hist">` с histogram + CDF overlay · events: `viz:rendered`.

**CSS:** bar=`var(--color-primary)` opacity 0.7 · CDF curve=`var(--color-accent)` · p50 line=`var(--color-bull)` dashed.

**Size:** xs 320×240 · md 560×380 · xl 720×480.

**Interaction:** hover (bin tooltip с percentile), click (drag brush для выделения range), переключатель internal/public (toggle button).

**a11y:** `role="img"` + `<table>` fallback с bin-центрами и counts; keyboard: Tab+стрелки по bins.

**Budget:** ~7 KB JS.

**DoD:**
- p50 vertical line строго на значении из canon (±0.01 tolerance)
- Brush interaction даёт output в `aria-live="polite"` region
- Two toggle buttons: «Внутренний сценарий» / «Публичный сценарий»

---

#### viz06 — revenue_forecast (D3v7 · s08)

**Контракт:** id=`viz06` · lib=D3 v7.9 · tier=Hero · section=s08 · payload_schema=`inline_revenue_payload_v1`

**Inputs:**
```json
{
  "years": [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],   // canon.horizon
  "series": {
    "base":  [100, 250, 480, 720, 850, 920, 950, 980],         // revenue, mln rub (from canon.pipeline)
    "bull":  [120, 290, 560, 850, 980, 1080, 1120, 1160],
    "bear":  [80,  200, 390, 580, 680, 740, 760, 780]
  }
}
```

**Outputs:** `<svg id="viz06-area">` stacked area · events: `viz:rendered`, `scenario:changed`.

**CSS:** base=`var(--color-primary)` · bull=`var(--color-bull)` · bear=`var(--color-bear)` · stack opacity 0.6.

**Size:** xs 320×220 · md 560×340 · xl 720×440.

**Interaction:** hover (year tooltip с revenue per scenario), click (scenario toggle), синхр с viz07 через `scenario:changed`.

**a11y:** `role="img"` + `<table>` fallback; scenario toggle buttons имеют `aria-pressed`.

**Budget:** ~5 KB JS.

**DoD:**
- Ось Y в млн ₽ с разделителем тысяч (i18n-aware, ru использует пробел)
- Slider scenario меняет подсвеченную серию без re-render (transition 300ms)
- Bull/bear значения → ±20% от base (hardcoded в `canon.scenarios` или рассчёт)

---

#### viz07 — ebitda_waterfall (D3v7 · s08)

**Контракт:** id=`viz07` · lib=D3 v7.9 · tier=Hero · section=s08 · payload_schema=`inline_ebitda_payload_v1`

**Inputs:**
```json
{
  "components": [
    { "key": "revenue", "value": 980,  "type": "start" },
    { "key": "cogs",    "value": -380, "type": "expense" },
    { "key": "gross",   "value": 600,  "type": "subtotal" },
    { "key": "opex",    "value": -180, "type": "expense" },
    { "key": "da",      "value": -50,  "type": "expense" },
    { "key": "ebitda",  "value": 370,  "type": "end" }
  ]
}
```

**Outputs:** `<svg id="viz07-waterfall">` classic waterfall · events: `viz:rendered`.

**CSS:** start=`var(--color-primary)` · expense=`var(--color-bear)` · subtotal=`var(--color-neutral)` · end=`var(--color-bull)`.

**Size:** xs 320×240 · md 560×380 · xl 720×480.

**Interaction:** hover (component tooltip), click (drill into компонент structure).

**a11y:** `role="img"` + `<table>` fallback с колонками [label, delta, cumulative]; keyboard по bars.

**Budget:** ~5 KB JS.

**DoD:**
- Sum(components) === `canon.pnl.ebitda_y7` (exact)
- Bar labels i18n-aware (key из canon)
- Positive/negative bars стремятся к нулю (baseline axis)

---

### 3.3 Standard tier (15)

#### viz08 — pipeline_gantt (D3v7 · s07)

**Контракт:** id=`viz08` · lib=D3 v7.9 · tier=Standard · section=s07 · payload_schema=`inline_gantt_payload_v1`

**Inputs (из `canon.pipeline`):** 7 проектов × 4 стадии (pre/prod/post/release) с датами start/end.

**Outputs:** `<svg id="viz08-gantt">` horizontal bars · events: `viz:rendered`, `drilldown:open` (on project click → m07-m09).

**CSS:** stage.pre=`#9E9E9E` · stage.prod=`#1976D2` · stage.post=`#7B1FA2` · stage.release=`#388E3C`.

**Size:** xs 320×280 · md 640×420 · xl 960×560.

**Interaction:** hover (stage tooltip), click (project detail modal).

**a11y:** `role="img"` + `<table>` fallback (project × stage × dates); keyboard по bars (стрелки для переключения проекта).

**Budget:** ~6 KB JS.

**DoD:**
- 7 проектов × 4 стадии = 28 bars, все 215×215 проверено в canon.pipeline (см. project_investor_model_v3)
- Today-line (vertical) в `var(--color-primary)` dashed

---

#### viz09 — cashflow_area (D3v7 · s12)

**Контракт:** id=`viz09` · lib=D3 v7.9 · tier=Standard · section=s12 · payload_schema=`inline_cashflow_payload_v1`

**Inputs:** годовые cash inflows / outflows / cumulative (из canon.cashflow).

**Outputs:** `<svg id="viz09-area">` stacked area + cumulative line · events: `viz:rendered`, `scenario:changed`.

**CSS:** inflow=`var(--color-bull)` · outflow=`var(--color-bear)` · cumulative=`var(--color-primary)`.

**Size:** xs 320×220 · md 560×340 · xl 720×440.

**Interaction:** hover (year breakdown), click (open m-cashflow modal).

**a11y:** `role="img"` + `<table>` fallback; J-curve явно подсвечена в легенде.

**Budget:** ~5 KB JS.

**DoD:**
- Cumulative пересекает ноль в правильный год (DPI breakeven)
- Numerical parity vs sim07 cashflow_stepper (±0.01)

---

#### viz10 — peers_radar (D3v7 · s15)

**Контракт:** id=`viz10` · lib=D3 v7.9 · tier=Standard · section=s15 · payload_schema=`inline_peers_radar_payload_v1`

**Inputs (из `canon.benchmark_chart`):**
```json
{
  "studios": [ "bm01", "bm02", "bm03", "bm04", "bm05" ],
  "metrics": ["IRR", "TVPI", "DPI", "horizon_years", "projects_count"],
  "own_id": "trendstudio_holding",   // virtual entry для сравнения
  "own_values": [24.75, 2.2, 1.85, 7, 7]
}
```

**Outputs:** `<svg id="viz10-radar">` · events: `viz:rendered`, `peer:toggle`.

**CSS:** own polygon=`var(--color-primary)` 0.4 fill · peers=`var(--color-neutral)` 0.2 fill · axes=`var(--color-border)`.

**Size:** xs 280×280 · md 420×420 · xl 560×560.

**Interaction:** hover (peer tooltip с metrics), click (toggle peer visibility via legend), compare-with-own checkbox.

**a11y:** `role="img"` + `<table>` fallback peer × metric; keyboard: стрелки переключают active peer.

**Budget:** ~5 KB JS.

**DoD:**
- Own polygon всегда visible, на переднем плане
- 5 metrics × 5 peers (+ own) = 30 data points, все из canon.benchmark_chart

---

#### viz11 — regions_choropleth (D3v7 · s16)

**Контракт:** id=`viz11` · lib=D3 v7.9 (+topojson-client 3.1) · tier=Standard · section=s16 · payload_schema=`inline_regions_payload_v1`

**Inputs (из `canon.regions_map`):** 9 regions × coordinates × project_refs × tax_refs.

**Outputs:** `<svg id="viz11-map">` projection Mercator · events: `viz:rendered`, `region:select`.

**CSS:** region.default=`var(--color-surface)` · region.hover=`var(--color-accent)` · region.active=`var(--color-primary)` · stroke=`var(--color-border)`.

**Size:** xs 320×240 · md 560×400 · xl 800×560.

**Interaction:** hover (region tooltip с project + tax info), click (open m12 region_detail modal), keyboard (Tab по regions).

**a11y:** `role="img"` + `<table>` fallback region × projects × taxes; aria-label с region name_key.

**Budget:** ~7 KB JS (без topojson CDN).

**DoD:**
- 9 regions кликабельны и имеют correct project/tax refs
- SVG-подход (без canvas) для SEO / a11y
- RU карта из публичного topo (GADM L2)

---

#### viz12 — kpi_sparklines (D3v7 · s19)

**Контракт:** id=`viz12` · lib=D3 v7.9 · tier=Standard · section=s19 · payload_schema=`inline_kpi_payload_v1`

**Inputs (из `canon.kpi_dashboard`):** 5 roles (LP/GP/CFO/producer/analyst), each with 1-2 KPIs × 12 history points.

**Outputs:** `<div id="viz12-kpi-grid">` с sparklines per KPI · events: `viz:rendered`, `role:change`.

**CSS:** target-met=`var(--color-bull)` · below-target=`var(--color-bear)` · sparkline=`var(--color-primary)`.

**Size:** xs 280×360 · md 560×240 · xl 720×180 (responsive grid).

**Interaction:** role selector (sim13 bound), hover на sparkline (tooltip с month+value).

**a11y:** `role="list"` для grid, каждая KPI — `role="listitem"` с aria-label; fallback `<dl>` с KPI/value/target.

**Budget:** ~5 KB JS.

**DoD:**
- Role switcher меняет видимый набор KPI (без page reload)
- Target achievement indicator: ≥target → bull, <target → bear
- 12 history points per KPI (monthly), из canon.kpi_dashboard.sparklines.history_points

---

#### viz13 — benchmark_bar (D3v7 · s15)

**Контракт:** id=`viz13` · lib=D3 v7.9 · tier=Standard · section=s15 · payload_schema=`inline_bench_bar_payload_v1`

**Inputs:** 5 peers × AUM (из canon.benchmark_chart.studios) + own entry.

**Outputs:** `<svg id="viz13-bar">` horizontal bar chart · events: `viz:rendered`.

**CSS:** own bar=`var(--color-primary)` · peers=`var(--color-neutral)` · country code chip.

**Size:** xs 320×280 · md 560×320 · xl 720×400.

**Interaction:** hover (AUM tooltip + country), click (toggle sort by AUM desc/asc).

**a11y:** `role="img"` + `<table>` fallback; keyboard: Tab через bars.

**Budget:** ~3 KB JS.

**DoD:**
- AUM values точно из canon.benchmark_chart.studios[*].aum_mln_rub_equiv
- Sort toggle сохраняет state через `TS.emit('ui:preference')`

---

#### viz14 — risk_heatmap (D3v7 · s11)

**Контракт:** id=`viz14` · lib=D3 v7.9 · tier=Standard · section=s11 · payload_schema=`inline_risk_payload_v1`

**Inputs:** матрица Probability × Impact × Risk (N рисков каталога).

**Outputs:** `<svg id="viz14-heatmap">` · events: `viz:rendered`, `risk:select`.

**CSS:** low=`var(--color-bull)` 0.3 · medium=`var(--color-primary)` 0.4 · high=`var(--color-bear)` 0.5 · active=stroke `var(--color-primary)` 2px.

**Size:** xs 280×280 · md 420×420 · xl 560×560.

**Interaction:** hover (risk tooltip), click (open m-risk modal), sim12 risk_toggler bound.

**a11y:** `role="table"` grid 5×5 (Prob × Impact); keyboard по клеткам.

**Budget:** ~4 KB JS.

**DoD:**
- 5×5 матрица (низкая/средняя/высокая P×I)
- Каждая клетка clickable с текстом рисков
- Sim12 toggle показывает/скрывает mitigated risks

---

#### viz15 — fund_flow_sankey (D3v7 · s14)

**Контракт:** id=`viz15` · lib=D3 v7.9 (+d3-sankey 0.12) · tier=Standard · section=s14 · payload_schema=`inline_sankey_payload_v1`

**Inputs:** узлы [LP, GP, Fund, Projects, Waterfall tiers] + потоки (rub).

**Outputs:** `<svg id="viz15-sankey">` · events: `viz:rendered`, `flow:hover`.

**CSS:** node.LP=`var(--color-primary)` · node.fund=`var(--color-accent)` · node.tier-1..4 из viz02 · link opacity 0.4.

**Size:** xs 320×280 · md 560×380 · xl 800×500.

**Interaction:** hover (flow tooltip с rub amount), click (drill по ветке).

**a11y:** `role="img"` + `<table>` fallback с source→target→value; keyboard Tab по links.

**Budget:** ~6 KB JS (+d3-sankey).

**DoD:**
- Sum всех links из Fund == sum inflows (conservation of flow)
- Цветовая согласованность с viz02 waterfall_3d (tier colors)

---

#### viz16 — scenario_lines (D3v7 · s13)

**Контракт:** id=`viz16` · lib=D3 v7.9 · tier=Standard · section=s13 · payload_schema=`inline_scenario_payload_v1`

**Inputs:** 4 сценария (base/bull/bear/stress) × N years × IRR.

**Outputs:** `<svg id="viz16-lines">` · events: `viz:rendered`, `scenario:changed`.

**CSS:** base=`var(--color-primary)` · bull=`var(--color-bull)` · bear=`var(--color-bear)` · stress=`var(--color-neutral)` dashed.

**Size:** xs 320×220 · md 560×340 · xl 720×440.

**Interaction:** hover (year tooltip, all 4 scenarios), click на легенду (toggle visibility), sim06 scenario_switcher bound.

**a11y:** `role="img"` + `<table>` fallback; keyboard Tab на scenario toggles.

**Budget:** ~4 KB JS.

**DoD:**
- 4 scenarios одновременно видимы по умолчанию
- Toggle отдельного scenario меняет opacity (vs full hide)
- Anchor year (Y5 или Y7) подсвечен vertical dashed line

---

#### viz17 — particles_ambient (Canvas2D · s01)

**Контракт:** id=`viz17` · lib=Canvas2D (vanilla) · tier=Standard · section=s01 · payload_schema=`inline_particles_payload_v1`

**Inputs:** `{ count: 60, speed: 0.3, color: "var(--color-primary)", size_range: [1, 3] }`

**Outputs:** `<canvas id="viz17-particles" style="position:absolute;inset:0;pointer-events:none;">` · events: `viz:rendered`.

**CSS:** `opacity: 0.5; mix-blend-mode: screen;`

**Size:** full hero viewport (position:absolute behind hero content).

**Interaction:** none (ambient only); respects reduced-motion.

**a11y:** `aria-hidden="true"` (decorative).

**Budget:** ~3 KB JS.

**DoD:**
- 60 fps desktop, 30 fps mobile
- `prefers-reduced-motion: reduce` → canvas cleared, particles static
- `requestAnimationFrame` cleanup on unmount

---

#### viz18 — org_chart (SVG · s04)

**Контракт:** id=`viz18` · lib=vanilla SVG · tier=Standard · section=s04 · payload_schema=`inline_org_payload_v1`

**Inputs:** иерархия 5 team + 4 advisory (из canon.team + canon.advisory).

**Outputs:** `<svg id="viz18-org">` tree layout · events: `viz:rendered`, `drilldown:open` (on person → m04-m06).

**CSS:** node=`var(--color-surface)` border `var(--color-primary)` · edge=`var(--color-border)` 1px · hover transform scale(1.05).

**Size:** xs 280×360 · md 560×420 · xl 800×560.

**Interaction:** hover (person tooltip), click (open team_bio modal m04-m06).

**a11y:** `role="tree"` с `role="treeitem"` для каждой ноды; keyboard: стрелки для навигации.

**Budget:** ~3 KB JS.

**DoD:**
- 5 team portraits (img01-img05) + 4 advisory (img06-img09) отрисованы
- Edge connections явно показывают reporting line (CEO → CFO/producer/creative/distribution)

---

#### viz19 — team_network (D3v7 · s04)

**Контракт:** id=`viz19` · lib=D3 v7.9 force-simulation · tier=Standard · section=s04 · payload_schema=`inline_team_net_payload_v1`

**Inputs:** nodes (team + advisory) + links (collaboration edges).

**Outputs:** `<svg id="viz19-net">` force-directed · events: `viz:rendered`, `person:select`.

**CSS:** node.team=`var(--color-primary)` · node.advisory=`var(--color-accent)` · link=`var(--color-border)`.

**Size:** xs 280×280 · md 480×420 · xl 640×560.

**Interaction:** hover (tooltip), click (bio modal), drag (reposition nodes).

**a11y:** `role="img"` + `<table>` fallback nodes × connections; keyboard Tab по nodes.

**Budget:** ~5 KB JS.

**DoD:**
- Force simulation стабилизируется за ≤ 3s
- `prefers-reduced-motion` → static layout (pre-computed positions)
- Виз комплементарна viz18 (org_chart) — одна иерархическая, вторая сетевая

---

#### viz20 — project_tiles (D3v7 · s07)

**Контракт:** id=`viz20` · lib=D3 v7.9 · tier=Standard · section=s07 · payload_schema=`inline_tiles_payload_v1`

**Inputs:** 7 проектов × poster (img10-img16) × metadata (budget, genre, stage).

**Outputs:** `<div id="viz20-tiles">` grid 3×3 (с 2 пустыми) · events: `viz:rendered`, `drilldown:open` (on tile → m07-m09).

**CSS:** tile=`var(--color-surface)` border `var(--color-border)` · hover=transform scale(1.03) + shadow-lg · active=border `var(--color-primary)`.

**Size:** xs 280×640 (vertical stack) · md 560×400 (3-col) · xl 960×480 (3-col).

**Interaction:** hover (poster reveal + meta), click (project detail modal m07-m09).

**a11y:** `role="list"`, каждый tile — `role="listitem"` + `aria-label` из canon.pipeline.projects[i].name; keyboard Tab.

**Budget:** ~3 KB JS.

**DoD:**
- Все 7 posters (img10-img16) с alt.ru/alt.en из canon.images
- Stage badge (pre/prod/post/release) с цветом из viz08
- Lazy loading `<img loading="lazy">`

---

#### viz21 — tax_credits_map (D3v7 · s16)

**Контракт:** id=`viz21` · lib=D3 v7.9 (reuses viz11 map base) · tier=Standard · section=s16 · payload_schema=`inline_tax_map_payload_v1`

**Inputs (из `canon.tax_credits_ui`):** 4 programs (30% rebate / 20% grant / 15% credit / 10% deduction) × region_refs.

**Outputs:** `<svg id="viz21-tax-map">` overlay на viz11 · events: `viz:rendered`, `program:select`.

**CSS:** program.rebate=`var(--color-bull)` · program.grant=`var(--color-primary)` · program.credit=`var(--color-accent)` · program.deduction=`var(--color-neutral)`.

**Size:** shares viewport с viz11 (overlay mode).

**Interaction:** click программу в легенде → highlight regions; click region → m11 tax_detail modal.

**a11y:** `role="img"` + `<table>` program × regions × rate fallback.

**Budget:** ~3 KB JS (reuses viz11 topo).

**DoD:**
- 4 programs × 9 regions correctly mapped из canon.tax_credits_ui.programs[*].region_refs
- Rate_text отображается при hover ("30% rebate")

---

#### viz22 — horizon_stepper (D3v7 · s17)

**Контракт:** id=`viz22` · lib=D3 v7.9 · tier=Standard · section=s17 · payload_schema=`inline_horizon_payload_v1`

**Inputs:** 7 years × milestones × status (past/current/future).

**Outputs:** `<svg id="viz22-stepper">` horizontal stepper · events: `viz:rendered`, `year:select`.

**CSS:** past=`var(--color-neutral)` · current=`var(--color-primary)` · future=`var(--color-surface)` · connector=`var(--color-border)`.

**Size:** xs 280×200 · md 560×140 · xl 800×120 (horizontal).

**Interaction:** hover (year tooltip с milestones), click (sim10 horizon_adjuster bound).

**a11y:** `role="list"` `<ol>` с year steps; aria-current="step" на current year.

**Budget:** ~3 KB JS.

**DoD:**
- 7 years точно из canon.horizon.years
- Current year computed runtime (new Date().getFullYear() — 2026)
- Sim10 adjuster position → highlights future years

---

## 4. Simulator specs (13)

Формат каждой spec:
- **Контракт**: id / tier / section / engine / seed_deterministic / audio_cue_key
- **Inputs**: канонические ranges и defaults (из canon.simulators.items[i].inputs)
- **Outputs**: формат + мерные единицы + bound viz
- **Formula / Algorithm**: расчётный pseudocode
- **Seed / Iterations**: для mc_light
- **Ranges validation**: assertions для входов
- **Unit tests**: минимум 3 кейса
- **Numerical parity**: canon-reference + tolerance
- **a11y announce**: aria-live pattern
- **Fallback**: no-js static value
- **Budget**: ~KB JS
- **DoD**: acceptance criteria

### 4.1 Marquee tier (3)

#### sim01 — irr_explorer (mc_light · s02)

**Контракт:** id=`sim01` · tier=Marquee · section=s02 · engine=`mc_light` · seed_deterministic=true · audio_cue_key=`a11y.sim.irr_explorer.cue` · bound_viz=`viz04 irr_sensitivity`.

**Inputs:**
- `lp_share`: slider, range [0, 100], step 1, default 0 → интерпретируется как `hurdle_deviation_pp` (−5..+10 pp от canon.fund.hurdle=8)

**Outputs:**
- `result`: currency (distributed to LP, mln rub)
- `irr_shown`: percent (computed)

**Algorithm:**
```
function run(lp_share) {
  const rng = mulberry32(0xDEADBEEF);
  const hurdle_mod = map(lp_share, [0, 100], [3, 18]);  // 3%–18%
  let sum_irr = 0;
  for (let i = 0; i < 5000; i++) {
    const revenue_mult = normal(rng, 1.0, 0.2);
    const cost_mult    = normal(rng, 1.0, 0.15);
    const gross = canon.pipeline.total_revenue * revenue_mult;
    const cost  = canon.pipeline.total_cost * cost_mult;
    const ebitda = gross - cost;
    const lp_dist = waterfall(ebitda, canon.fund, hurdle_mod);
    const irr = solveIRR(lp_dist, canon.horizon.years);
    sum_irr += irr;
  }
  return {
    result: canon.fund.lp_size_mln_rub * (sum_irr / 5000),
    irr_shown: (sum_irr / 5000) * 100
  };
}
```

**Seed:** `0xDEADBEEF` (mulberry32, deterministic)
**Iterations:** 5000 (light MC)

**Ranges validation:**
- `lp_share ∈ [0, 100]` int
- hurdle_mod ∈ [3, 18] pp

**Unit tests:**
1. `run(50) → irr_shown ≈ 13.95` (anchor match canon.returns.mc_p50_internal ±0.5)
2. `run(0)  → irr_shown < run(50)` (низкий hurdle_mod → ниже IRR)
3. `run(100) → irr_shown > run(50)` (monotonic)

**Numerical parity:** `run(50).irr_shown === canon.returns.mc_p50_internal ± 0.5 pp`

**a11y announce:** `aria-live="polite"`: «Симуляция завершена. IRR = {irr_shown}%, распределение LP = {result} млн ₽.»

**Fallback:** no-js → static card с canon.returns.mc_p50_internal=13.95%.

**Budget:** ~4 KB JS.

**DoD:**
- Тест parity зелёный при seed `0xDEADBEEF`
- Audio cue проигрывается (если audio не muted) на завершение: короткий rim-shot, ≤ 300 ms
- Sim runs non-blocking в `requestIdleCallback` (no main-thread jank)

---

#### sim02 — mc_stress (mc_light · s10)

**Контракт:** id=`sim02` · tier=Marquee · section=s10 · engine=`mc_light` · seed_deterministic=true · audio_cue_key=`a11y.sim.mc_stress.cue` · bound_viz=`viz05 mc_distribution`.

**Inputs:**
- `stress_pct`: slider, [0, 100], step 1, default 0 → `stress_magnitude_pp` (0 = no stress; 100 = −30% revenue).

**Outputs:**
- `result`: percent (stressed IRR P50)
- `irr_range`: `[p10, p90]`

**Algorithm:**
```
function run(stress_pct) {
  const rng = mulberry32(0xBAADF00D);
  const stress = map(stress_pct, [0,100], [0, 0.30]);
  const irrs = [];
  for (let i = 0; i < 5000; i++) {
    const rev = canon.pipeline.total_revenue * (1 - stress) * normal(rng, 1.0, 0.18);
    const cost = canon.pipeline.total_cost * normal(rng, 1.0, 0.12);
    const irr = computeIRR(rev - cost, canon.horizon.years, canon.fund);
    irrs.push(irr);
  }
  irrs.sort((a,b) => a-b);
  return {
    result: irrs[Math.floor(irrs.length * 0.5)] * 100,
    irr_range: [irrs[Math.floor(irrs.length * 0.1)] * 100, irrs[Math.floor(irrs.length * 0.9)] * 100]
  };
}
```

**Seed:** `0xBAADF00D`.
**Iterations:** 5000.

**Unit tests:**
1. `run(0).result ≈ canon.returns.mc_p50_public = 11.44` (baseline)
2. `run(50).result < run(0).result` (монотонное падение при stress)
3. `run(100).result < 5` (severe stress → очень низкий IRR)

**Numerical parity:** `run(0).result === canon.returns.mc_p50_public ± 0.5 pp`

**a11y announce:** aria-live = «Стресс-тест: медиана IRR = {result}%, диапазон {p10}–{p90}%.»

**Fallback:** static card с canon.returns.mc_p50_public=11.44%.

**Budget:** ~4 KB JS.

**DoD:** parity-test зелёный; график viz05 re-draws при изменении stress_pct.

---

#### sim03 — waterfall_flow (closed_form · s14)

**Контракт:** id=`sim03` · tier=Marquee · section=s14 · engine=`closed_form` · seed_deterministic=true (no randomness) · audio_cue_key=`a11y.sim.waterfall_flow.cue` · bound_viz=`viz02 waterfall_3d + viz15 sankey`.

**Inputs:**
- `fund_size`: slider, [0, 100], step 1, default 0 → interpreted as `lp_capital_mln_rub` (mapped 1000..5000).

**Outputs:**
- `result`: currency (LP distribution mln rub)
- `gp_carry`: currency
- `lp_irr`: percent

**Formula (closed form waterfall):**
```
function run(fund_size) {
  const lp_cap = map(fund_size, [0,100], [1000, 5000]);   // mln rub
  const gp_cap = lp_cap * (canon.fund.gp_commitment / 100);
  const total_cap = lp_cap + gp_cap;
  const exit_mult = 2.2;   // canon.returns.target_moic
  const total_exit = total_cap * exit_mult;

  // Tier 1: ROC (100% to LP)
  let lp_dist = lp_cap;
  let gp_dist = gp_cap;
  let remaining = total_exit - (lp_cap + gp_cap);

  // Tier 2: Pref (8% IRR cumulative to LP, canon.fund.hurdle)
  const pref_amount = lp_cap * Math.pow(1 + canon.fund.hurdle / 100, canon.horizon.years) - lp_cap;
  const pref_paid = Math.min(remaining, pref_amount);
  lp_dist += pref_paid;
  remaining -= pref_paid;

  // Tier 3: Catch-up (100% to GP until GP has 20% of pref)
  const catchup_target = pref_paid * (canon.fund.carry / (100 - canon.fund.carry));
  const catchup_paid = Math.min(remaining, catchup_target);
  gp_dist += catchup_paid;
  remaining -= catchup_paid;

  // Tier 4: Carry split (80/20)
  const lp_share = remaining * (1 - canon.fund.carry / 100);
  const gp_share = remaining * (canon.fund.carry / 100);
  lp_dist += lp_share;
  gp_dist += gp_share;

  const lp_irr = (Math.pow(lp_dist / lp_cap, 1 / canon.horizon.years) - 1) * 100;

  return { result: lp_dist, gp_carry: gp_dist - gp_cap, lp_irr };
}
```

**Unit tests:**
1. `run(50)` (lp_cap=3000=canon.fund.lp_size_mln_rub) → `lp_irr` ≈ 20.09% (canon.returns.irr_public_w3) ± 0.5
2. `run(0)`  → `lp_irr` sub-linear
3. `run(100)` → `lp_irr` meeting parity with exit_mult=2.2

**Numerical parity:** waterfall tiers match canon.waterfall_diagram exactly (100/0, 100/0, 0/100, 80/20).

**a11y announce:** «Waterfall: LP получает {result} млн ₽ ({lp_irr}%), GP carry = {gp_carry} млн ₽.»

**Fallback:** static waterfall table с canon anchor values.

**Budget:** ~3 KB JS.

**DoD:** 4-tier split точно соответствует canon.waterfall_diagram; все значения financial-ready.

---

### 4.2 Hero tier (4)

#### sim04 — revenue_what_if (closed_form · s08)

**Контракт:** id=`sim04` · tier=Hero · section=s08 · engine=`closed_form` · seed_deterministic=true · audio_cue_key=`a11y.sim.revenue_what_if.cue` · bound_viz=`viz06 revenue_forecast`.

**Inputs:**
- `box_office`: slider, [0, 100], step 1, default 0 → `box_office_mln_rub` (0–2000)
- `theatrical_share`: slider, [0, 100], step 1, default 0 → `theatrical_share_pct` (0–100)

**Outputs:**
- `result`: currency (total revenue mln rub across 7 years)
- `revenue_series`: array of 7 values (for viz06 redraw)

**Formula:**
```
function run(box_office, theatrical_share) {
  const bo_amount = map(box_office, [0,100], [0, 2000]);
  const share = theatrical_share / 100;
  const svod_share = 1 - share;
  const series = [];
  for (let y = 0; y < canon.horizon.years; y++) {
    const ramp = (y + 1) / canon.horizon.years;
    const theatrical = bo_amount * share * ramp * 0.85;     // 85% yield
    const svod = bo_amount * svod_share * ramp * 0.95;
    series.push(theatrical + svod);
  }
  return { result: series.reduce((a,b) => a+b, 0), revenue_series: series };
}
```

**Unit tests:**
1. `run(50, 50)` → `result` > 0 и `revenue_series` monotonically increasing
2. `run(100, 100)` → max theatrical revenue
3. `run(0, 0)`  → `result === 0`

**Numerical parity:** `run(50, 50).result === canon.pipeline.total_revenue` ± 1%

**a11y announce:** «Сценарий: box-office {box_office} млн ₽, кинотеатры {theatrical_share}%. Total revenue = {result} млн ₽.»

**Fallback:** canon.pipeline.total_revenue static.

**Budget:** ~3 KB JS.

**DoD:** viz06 меняет series без re-mount; result formatter i18n-aware.

---

#### sim05 — irr_scenario (lookup_table · s09)

**Контракт:** id=`sim05` · tier=Hero · section=s09 · engine=`lookup_table` · seed_deterministic=true · audio_cue_key=`a11y.sim.irr_scenario.cue` · bound_viz=`viz04 irr_sensitivity`.

**Inputs:**
- `scenario`: select ["base", "bull", "bear", "stress"] (maps through canon.scenario_switcher.scenarios)

**Outputs:**
- `result`: percent (IRR value)

**Lookup table (from canon.returns):**
```
const TABLE = {
  base:   canon.returns.irr_internal_w5vd,    // 24.75
  bull:   canon.returns.irr_internal_w5vd * 1.12,  // 27.7
  bear:   canon.returns.irr_internal_w5vd * 0.85,  // 21.0
  stress: canon.returns.mc_p50_public - 2.0   // 9.44
};
```

**Unit tests:**
1. `run("base")  === canon.returns.irr_internal_w5vd` (24.75, exact)
2. `run("bull")  > run("base") > run("bear") > run("stress")`
3. Unknown scenario → throws `TypeError`

**Numerical parity:** base exact, bull/bear/stress ±1%.

**a11y announce:** «Сценарий {scenario}: IRR = {result}%».

**Fallback:** static table (4 rows × scenario+IRR).

**Budget:** ~1 KB JS.

**DoD:** transition между scenarios плавный (viz04 heatmap сдвигает anchor).

---

#### sim06 — scenario_switcher_sim (state_machine · s13)

**Контракт:** id=`sim06` · tier=Hero · section=s13 · engine=`state_machine` · seed_deterministic=true · audio_cue_key=`a11y.sim.scenario_switcher_sim.cue` · bound_viz=`viz16 scenario_lines`.

**Inputs:**
- `scenario`: toggle ["base", "bull", "bear", "stress"] (radio group)

**Outputs:**
- `result`: percent (current scenario IRR, same as sim05 lookup)

**State machine:**
```
states: { base, bull, bear, stress }
transitions: any → any (user switch)
side_effects:
  - TS.emit('scenario:changed', newState)
  - Update URL hash: #scenario=base|bull|bear|stress
  - Persist in sessionStorage (no localStorage!)
```

**Unit tests:**
1. Default state = `base` (canon.scenario_switcher.default)
2. `switch("bull") → state="bull"` + event emitted
3. URL hash sync (round-trip через reload)
4. Invalid scenario → state unchanged

**a11y announce:** «Активный сценарий: {scenario}».

**Fallback:** default to `base`.

**Budget:** ~2 KB JS.

**DoD:** State synchronized с URL hash, sessionStorage, всеми подключёнными viz (viz04, viz05, viz06, viz07, viz09, viz16).

---

#### sim07 — cashflow_stepper (closed_form · s12)

**Контракт:** id=`sim07` · tier=Hero · section=s12 · engine=`closed_form` · seed_deterministic=true · audio_cue_key=`a11y.sim.cashflow_stepper.cue` · bound_viz=`viz09 cashflow_area`.

**Inputs:**
- `year`: slider [0, 100], step 1, default 0 → interpreted as `year_index` (0–6)

**Outputs:**
- `result`: number (cumulative cash by year_index, mln rub)
- `dpi`: ratio

**Formula:**
```
function run(year) {
  const y = Math.floor(map(year, [0, 100], [0, canon.horizon.years - 1]));
  let cum = -canon.fund.lp_size_mln_rub;   // initial outflow
  for (let i = 0; i <= y; i++) {
    cum += annualCashflow(i);   // deterministic series from canon
  }
  const dpi = (cum + canon.fund.lp_size_mln_rub) / canon.fund.lp_size_mln_rub;
  return { result: cum, dpi };
}
```

**Unit tests:**
1. `run(0).result === -canon.fund.lp_size_mln_rub` (first year: pure outflow)
2. `run(100).dpi ≈ canon.returns.dpi_y7 = 1.85` (±0.01)
3. `run(50).dpi ≈ canon.returns.dpi_y5 = 0.45` (±0.01)

**Numerical parity:** canon.cashflow.annual[year] match ±0.01.

**a11y announce:** «Год {year_abs} ({year_idx}-й): накопленный cash = {result} млн ₽, DPI = {dpi}.»

**Fallback:** static table с canon.cashflow.annual[*].

**Budget:** ~3 KB JS.

**DoD:** viz09 stepping animation, J-curve визуально корректна.

---

### 4.3 Standard tier (6)

#### sim08 — peers_compare (lookup_table · s15)

**Контракт:** id=`sim08` · tier=Standard · section=s15 · engine=`lookup_table` · bound_viz=`viz10 peers_radar + viz13 benchmark_bar`.

**Inputs:** `metric`: select ["IRR","TVPI","DPI","horizon_years","projects_count"].

**Outputs:** `result`: number (own value for metric) + peer rankings.

**Lookup from canon.benchmark_chart:**
```
OWN = { IRR: 24.75, TVPI: 2.2, DPI: 1.85, horizon_years: 7, projects_count: 7 };
PEERS = canon.benchmark_chart.studios.map(s => ({ id: s.id, name: s.name, value: s[metric] || 0 }));
function run(metric) {
  const own_val = OWN[metric];
  const sorted = [...PEERS, { id: 'own', name: 'ТрендСтудио', value: own_val }].sort((a,b) => b.value - a.value);
  const rank = sorted.findIndex(x => x.id === 'own') + 1;
  return { result: own_val, rank, total: sorted.length };
}
```

**Unit tests:**
1. `run("IRR").result === 24.75` (own IRR exact)
2. `run("AUM").rank` valid (1–6)
3. Unknown metric → `{ result: 0, rank: null }`

**Numerical parity:** canon.benchmark_chart.studios[*] exact.

**a11y announce:** «По метрике {metric}: ваш ранк {rank} из {total}.»

**Fallback:** static comparison table.

**Budget:** ~2 KB JS.

**DoD:** viz10 (radar) + viz13 (bar) синхронно реагируют.

---

#### sim09 — regions_picker (lookup_table · s16)

**Контракт:** id=`sim09` · tier=Standard · section=s16 · engine=`lookup_table` · bound_viz=`viz11 regions_choropleth + viz21 tax_credits_map`.

**Inputs:** `region`: select id из canon.regions_map.items[*].id (rg01–rg09).

**Outputs:** `result`: number (projects count in region) + tax_programs refs.

**Lookup:**
```
function run(region_id) {
  const r = canon.regions_map.items.find(x => x.id === region_id);
  if (!r) return { result: 0, projects: [], tax_programs: [] };
  const tax_programs = canon.tax_credits_ui.programs
    .filter(p => p.region_refs.includes(region_id))
    .map(p => ({ id: p.id, rate_text: p.rate_text }));
  return { result: r.project_refs.length, projects: r.project_refs, tax_programs };
}
```

**Unit tests:**
1. `run("rg01")` returns p01 + tax01 (30% rebate)
2. `run("rg09")` returns p02 (из canon.regions_map.items[8])
3. Unknown region → empty result

**a11y announce:** «Регион {region_name}: {result} проектов, {tax_programs.length} налоговых программ.»

**Fallback:** static region table.

**Budget:** ~1.5 KB JS.

**DoD:** viz11 region highlight + viz21 tax-programs overlay синхронно.

---

#### sim10 — horizon_adjuster (closed_form · s17)

**Контракт:** id=`sim10` · tier=Standard · section=s17 · engine=`closed_form` · bound_viz=`viz22 horizon_stepper`.

**Inputs:** `years`: slider [0, 100], step 1, default 0 → `horizon_years` (5–10).

**Outputs:** `result`: years (current horizon) + computed `irr_adjusted`.

**Formula:**
```
function run(years) {
  const h = Math.round(map(years, [0,100], [5, 10]));
  const base_irr = canon.returns.irr_internal_w5vd;   // 24.75 @ 7 years
  const irr_adj = base_irr * (7 / h);   // naive rescale
  return { result: h, irr_adjusted: irr_adj };
}
```

**Unit tests:**
1. `run(40).result === 7` (canon anchor)
2. `run(40).irr_adjusted === canon.returns.irr_internal_w5vd` (exact)
3. `run(100).result === 10`, `irr_adjusted` proportionally lower

**Numerical parity:** `run(40)` === canon.horizon.years=7 exact.

**a11y announce:** «Горизонт {result} лет. IRR = {irr_adjusted}%.»

**Fallback:** static 7 лет.

**Budget:** ~1 KB JS.

**DoD:** viz22 highlight current year_count; disclaimer «наивный rescale, без реинвестиций» видим.

---

#### sim11 — waterfall_calc (closed_form · s20)

**Контракт:** id=`sim11` · tier=Standard · section=s20 · engine=`closed_form` · bound_viz=`viz02 waterfall_3d`.

**Inputs:** `exit_mult`: slider [0, 100], step 1, default 0 → `exit_multiple` (1.0–4.0).

**Outputs:** `result`: number (LP total distribution) + carry + hurdle-pass boolean.

**Formula:** (аналогична sim03 но с вариируемым exit_mult)
```
function run(exit_mult) {
  const em = map(exit_mult, [0,100], [1.0, 4.0]);
  // ... waterfall с em вместо 2.2 из sim03 ...
  return { result, gp_carry, hurdle_passed, lp_irr };
}
```

**Unit tests:**
1. `run(30).exit_mult ≈ 2.2` (canon.returns.target_moic)
2. `run(0).hurdle_passed === false` (exit=1.0 → no pref)
3. `run(100).gp_carry > run(30).gp_carry` (monotonic in exit)

**Numerical parity:** `run(30)` === canon anchor target exit.

**a11y announce:** «Exit multiple {em}: LP получает {result}, GP carry {gp_carry}.»

**Fallback:** static canon.waterfall_diagram + canon.returns.target_moic=2.2.

**Budget:** ~2 KB JS.

**DoD:** связан с sim03 (shared formula); изменение вариации видно на viz02.

---

#### sim12 — risk_toggler (state_machine · s11)

**Контракт:** id=`sim12` · tier=Standard · section=s11 · engine=`state_machine` · bound_viz=`viz14 risk_heatmap`.

**Inputs:** `risks_enabled`: toggle [true, false].

**Outputs:** `result`: number (count of visible risks).

**State machine:**
```
states: { showing_all: true, showing_mitigated_only: false }
transitions: toggle between states
side_effects:
  - TS.emit('risk:toggle', state)
  - viz14 re-renders subset
```

**Unit tests:**
1. Default state `showing_all = true`
2. Toggle → `showing_mitigated_only = true` + event
3. Filter correctly hides mitigated risks

**a11y announce:** «Показано {result} рисков.»

**Fallback:** all risks visible.

**Budget:** ~1 KB JS.

**DoD:** viz14 heatmap соответственно re-paints.

---

#### sim13 — kpi_role_picker (lookup_table · s19)

**Контракт:** id=`sim13` · tier=Standard · section=s19 · engine=`lookup_table` · bound_viz=`viz12 kpi_sparklines`.

**Inputs:** `role`: select ["LP", "GP", "CFO", "producer", "analyst"].

**Outputs:** `result`: number (count of KPIs for role) + array of KPI keys.

**Lookup from canon.kpi_dashboard:**
```
function run(role) {
  const r = canon.kpi_dashboard.roles.find(x => x.role === role);
  if (!r) return { result: 0, kpis: [] };
  return { result: r.kpis.length, kpis: r.kpis.map(k => k.key) };
}
```

**Unit tests:**
1. `run("LP").result === 2` (lp_irr + lp_tvpi)
2. `run("GP").result === 1` (gp_carry)
3. `run("unknown").result === 0`

**a11y announce:** «Роль {role}: {result} KPI.»

**Fallback:** default role = LP.

**Budget:** ~1 KB JS.

**DoD:** viz12 показывает только KPI выбранной роли; переключение смена через `TS.emit('role:change')`.

---

## 5. Прогресс

**B1b.1 COMPLETED** · Spec 22 viz + 13 sim + общие контракты.

**Next:** B1b.2 — i18n blueprint (9 namespaces × ~420 keys skeleton, RU+EN symmetric).
**Затем:** B1b.3 — `landing_b1_wave_plan_v1.0.json` + `invariants_check.py` spec.

**После B1b.3:** верификация П5 «Максимум» (32/32) на пакете B1a+B1b, потом Stage B execution (wave-mode CC).

Суммарный прогресс: 11% + 0.33% ≈ **11.33% / 100%**.
