# Brief v2: ТрендСтудио LP Deck v1.1.1 — Ultra-Premium Interactive HTML (30 субагентов)

**Дата:** 2026-04-15
**Замена для:** `Brief.md` (v1). Brief.md оставлен для истории — при расхождении побеждает Brief_v2.md.
**Цель:** собрать HTML-дек **выше премиум-уровня** (25 слайдов, 16:9) с **максимумом анимаций и максимумом интерактива**, разбив работу на **ровно 30 субагентов** чтобы избежать таймаута CC-сессии.

---

## 0. Почему 30 субагентов

CC крашится от таймаута на больших одноагентных задачах. Разбиваем на узкие, самодостаточные единицы:
- **25 слайд-агентов S01…S25** — каждый отвечает за ОДИН слайд: HTML-разметка + CSS-scoped + JS-модуль + анимации + интерактив данного слайда.
- **5 инфра-агентов S26…S30** — общая инфраструктура: shell, навигация, движок анимаций, движок графиков, QA.

Каждый агент работает в **своей именованной секции** внутри одного `index.html`:

```html
<!-- === S01: COVER ================================================== -->
<section id="slide-01" class="slide" data-slide="1">...</section>
<style>/* === S01: styles === */ ...</style>
<script>/* === S01: logic === */ ...</script>
<!-- === /S01 ======================================================== -->
```

Граница `/* === Sxx: === */ ... /* === /Sxx === */` неприкосновенна. Агент правит **только свою** секцию + вызывает общие API из инфры.

---

## 1. Входные файлы (без изменений с v1)

| Файл | Назначение |
|---|---|
| `deck_content.json` | SSOT, 25 слайдов: title/subtitle/body/tables/bullets/metrics |
| `viz_data.json` | MC 50 bins (N=50 000, mean 7.24, σ 7.76, P(>0)=82.5%), heatmap 5×5, pipeline 7×12 кв, waterfall W₃ bear/base/bull |
| `TrendStudio_LP_Deck_v1.1.1.pptx` | Референс-рендер |
| `TrendStudio_LP_Deck_v1.1.1.pdf` | Референс-рендер в PDF |

**Правило:** SSOT = `deck_content.json`. Любые тексты/числа читаются из JSON, дублирования в HTML нет (кроме скелета). Расхождение → JSON побеждает.

---

## 2. Выход

**Файл:** `TrendStudio_LP_Deck_v1.1.1_Interactive.html` (single-file, ~1-2 MB с inline-JSON).
- Открывается двойным кликом (CDN кешируется, offline после первой загрузки).
- 16:9 aspect, fullscreen-ready, responsive до 1280×720.
- Ultra-premium dark cinematic.

---

## 3. Tech Stack (Macro bundle, ~800KB CDN)

| Библиотека | Назначение | CDN |
|---|---|---|
| **GSAP 3.12** + ScrollTrigger + Flip | Главный анимационный движок, scroll-анимации, FLIP-транзишны | unpkg.com/gsap@3.12 |
| **Anime.js 3.2** | Микроанимации (count-up цифр, hover-ripple, path morph) | cdnjs anime.min.js |
| **D3.js v7** | Monte Carlo гистограмма, heatmap, waterfall, pipeline Gantt, force-directed граф | d3js.org/d3.v7.min.js |
| **Chart.js 4.4** | Fallback/простые столбики | cdn.jsdelivr.net/npm/chart.js |
| **Three.js r160** | 3D-обложка (parallax камеры, объёмный логотип, partikle field) | unpkg.com/three@0.160 |
| **Lenis 1.0** | Smooth scroll | unpkg.com/@studio-freight/lenis |
| **Matter.js 0.19** | Физика падающих монет в waterfall (slide 22), интерактивные пружинки | cdn.jsdelivr.net/npm/matter-js |
| **Particles.js / tsParticles** | Звёздное небо на обложке и переходах | cdn.jsdelivr.net/npm/tsparticles |

Все импорты — через `<script src="...">` в `<head>`, preload, async где возможно. CDN + `integrity` хеш.

---

## 4. Design System v2 (ultra-premium dark cinematic)

### 4.1 Цветовая палитра (из SSOT meta.palette + расширение)

```css
:root {
  /* Core */
  --bg-primary:     #0A0E1A;   /* ночное небо */
  --bg-secondary:   #141A2A;   /* surface cards */
  --bg-tertiary:    #1E2640;   /* hover/active surfaces */
  --bg-glass:       rgba(20,26,42,0.65);   /* glass-morphism */

  /* Accent */
  --gold:           #C9A961;
  --gold-light:     #E5C98A;
  --gold-dark:      #8B7538;
  --gold-glow:      rgba(201,169,97,0.45);

  /* Text */
  --text-primary:   #F5F5F5;
  --text-secondary: #9CA3AF;
  --text-muted:     #6B7280;

  /* Semantic */
  --success:        #10B981;
  --warning:        #F59E0B;
  --danger:         #EF4444;
  --info:           #60A5FA;

  /* Gradient tokens */
  --grad-cinema:    linear-gradient(135deg, #0A0E1A 0%, #141A2A 50%, #1E2640 100%);
  --grad-gold:      linear-gradient(135deg, #8B7538 0%, #C9A961 50%, #E5C98A 100%);
  --grad-risk:      linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%);

  /* Shadows */
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.30);
  --shadow-md:      0 8px 24px rgba(0,0,0,0.45);
  --shadow-lg:      0 20px 60px rgba(0,0,0,0.60);
  --shadow-gold:    0 0 40px rgba(201,169,97,0.35);

  /* Borders */
  --border-subtle:  1px solid rgba(255,255,255,0.06);
  --border-gold:    1px solid rgba(201,169,97,0.25);

  /* Radii */
  --r-sm: 6px;  --r-md: 12px;  --r-lg: 20px;  --r-xl: 32px;

  /* Easings */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-q:  cubic-bezier(0.76, 0, 0.24, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Timings */
  --t-fast: 160ms;  --t-base: 320ms;  --t-slow: 720ms;  --t-epic: 1600ms;
}
```

### 4.2 Шрифты

- **Заголовки:** `Georgia`, serif, cinematic — 48-72px (H1 slide title 64px, H2 subtitle 32px).
- **Тело:** `Inter` (Google Fonts, 400/500/600/700), 16-20px, line-height 1.5.
- **Моно/формулы/числа:** `JetBrains Mono`, 14-18px.
- **Дисплей-числа** (IRR, revenue и т.п.): `Georgia` 84-120px, gradient text (`--grad-gold`), count-up анимация.

### 4.3 Layout сетка

- Slide = 100vw × 56.25vw (aspect 16/9), max 1920×1080.
- Safe area: 6% padding по бокам, 8% сверху/снизу.
- Gold 3px accent line сверху каждого слайда (анимируется при заходе).
- Footer: `ТрендСтудио Холдинг · LP Deck v1.1.1 · Confidential` слева, `N / 25` справа. 9pt `--text-secondary`.

### 4.4 Glass-morphism cards

- `background: var(--bg-glass)`
- `backdrop-filter: blur(20px) saturate(140%)`
- `border: var(--border-subtle)`
- `box-shadow: var(--shadow-md)`

### 4.5 Gold shimmer эффект

На ключевых цифрах и CTA — moving gradient highlight:
```css
.shimmer {
  background: linear-gradient(90deg, var(--gold-dark) 0%, var(--gold-light) 50%, var(--gold-dark) 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { 0% {background-position: 200% 0} 100% {background-position: -200% 0} }
```

---

## 5. АНИМАЦИОННЫЙ БЮДЖЕТ — всё анимировано

Каждый слайд обязан иметь **минимум** следующие анимации:

| Категория | Обязательно |
|---|---|
| **Slide enter** | GSAP timeline: fade+slide-up для заголовка (0.8s), stagger 0.1s для bullets, scale+glow для метрик |
| **Slide exit** | Reverse timeline: blur+fade-down (0.4s) |
| **Transition между слайдами** | FLIP transition: общие элементы анимируются между позициями (name-tag технология) |
| **Background** | Живой gradient mesh (WebGL или CSS animated gradient), двигается медленно (30-60s loop) |
| **Gold accent line** | Draw-in от центра при заходе (0.6s) |
| **Numbers (IRR, Rev, MoIC)** | Count-up от 0 до значения (1.2-1.6s, ease-out-expo) |
| **Tables** | Stagger fade-in строк сверху вниз, hover row = gold glow |
| **Bullets** | Stagger slide-in слева с ease-spring |
| **Icons / dots** | Rotate+scale при hover, pulse на критичных |
| **Charts** | Draw animation (D3 transition), axis разворачивается, bars растут |
| **Idle micro** | Каждые 4-8s случайная ячейка подсвечивается (attention beacon) |
| **Hover all** | Любой interactive элемент → transform+glow в 160ms |
| **Parallax** | Всё на слайде имеет data-depth (0…1), двигается на mousemove |

**Global animations** (делает S27 Animation Engine):
- **Particle field** на обложке (200+ частиц, connection lines)
- **Scroll-triggered camera pan** между слайдами (Three.js scene)
- **Cursor trail** gold glow
- **Page transition** wipe с matte paper noise texture

---

## 6. ИНТЕРАКТИВНЫЙ БЮДЖЕТ — всё интерактивно

Базовые **10 обязательных интеракций** (присутствуют на большинстве слайдов):

1. **Hover reveal** — каждый bullet/card раскрывает дополнительный слой info.
2. **Click to zoom** — любая таблица/график разворачивается на fullscreen overlay.
3. **Tooltip** — над каждым числом/термином при hover 400ms.
4. **Copy-to-clipboard** — клик по метрике копирует её значение + источник.
5. **Drag to compare** — двигаемые marker'ы на графиках для измерения дельты.
6. **Filter chips** — переключатели сценариев (Det/Base/Stress, Bear/Base/Bull).
7. **Keyboard shortcuts** — все hotkeys (см. §7).
8. **Swipe/touch** — навигация и drag-graphs на tablet.
9. **Long-press** — контекстное меню «copy/share/explain».
10. **Right-click** — кастомный menu «экспорт slide в PNG/PDF/link».

**Слайд-специфичные интеракции** (см. §10 поимённо):
- Калькулятор IRR (slide 17/25a): 5 слайдеров + live recalc + спаркалайн.
- Monte Carlo replay (slide 17): ▶ запуск симуляции в реальном времени, 3s построения 50 bins.
- Risk heatmap drill-down (slide 19): клик по ячейке → боковая панель со списком рисков этого cell + их P/I/Score.
- Waterfall physics (slide 22): Matter.js — монеты падают в tier'ы, пользователь двигает слайдер scenario, коэффициенты пересчитываются.
- Pipeline Gantt (slide 11): zoom/pan по timeline, hover по проекту = card с budget/stage/release, drag-reorder.
- Pipeline force-graph (slide 10): D3 force-directed, drag ноды, показывает связи между проектами.
- Thesis detail (slides 4-7): flip-card с обратной стороной (evidence + reference).
- MC methodology (slide 16): раскрываемая формула, hover на переменную = definition.
- WACC calc (slide 15): live формула WACC с полями для ставок.
- Terms & Exit (slide 23): интерактивный timeline exit scenarios.

---

## 7. Навигация (S27)

| Hotkey | Действие |
|---|---|
| `←` / `→` | Prev / Next slide |
| `↑` / `↓` | Prev / Next slide (альт.) |
| `Home` / `End` | Первый / последний слайд |
| `Space` | Next slide |
| `Shift+Space` | Prev slide |
| `F` | Fullscreen toggle |
| `Esc` | Exit fullscreen / close overlay |
| `P` | Presenter mode (заметки + timer) |
| `T` | Dark ↔ Light theme |
| `?` / `/` | Modal со списком всех shortcuts |
| `G` | Grid overlay для дизайн-проверки |
| `S` | Share link на текущий slide (copy to clipboard) |
| `E` | Export slide as PNG |
| `1`…`9`, `0` | Jump to slide 1-10 |
| `Shift+N` | Ввести номер слайда (goto) |
| `M` | Toggle MC replay (на slide 17) |
| `R` | Reset calculator (на slide 17/25a) |

Touch: swipe L/R = nav, swipe U/D = nav, long-press = menu, pinch = zoom chart.

**Progress bar** (gold #C9A961, glow): top 3px, заполняется по навигации. Клик по bar = jump.

**Slide dots** в правом нижнем углу: 25 точек, текущая = gold, остальные = muted. Hover = tooltip с title слайда.

**Share link** `#slide-N` — deep-link при открытии автоматически прыгает на слайд N.

---

## 8. Роли 30 субагентов

### 8.1 Инфра-агенты (S26-S30)

| Agent | Owns | Output artifacts |
|---|---|---|
| **S26 Shell** | Base HTML skeleton, CSS variables/tokens, fonts loader, theme toggle, footer, layout grid, reset styles, CDN imports | `<head>` + `<body>` root + global CSS + `window.THEME` |
| **S27 Navigation** | Hotkeys, swipe, progress bar, slide dots, fullscreen, presenter mode, share link, shortcuts modal, goto | `window.NAV` API |
| **S28 Animation Engine** | GSAP master timeline, ScrollTrigger init, Lenis smooth scroll, IntersectionObserver pool, cursor trail, particle field, page transitions, FLIP helpers, reduced-motion guard | `window.ANIM` API |
| **S29 Chart Engine** | D3 wrappers (MC histogram, heatmap, waterfall, pipeline Gantt, force graph), Chart.js fallback, Three.js scene manager, Matter.js physics init, reusable axis/tooltip/legend | `window.CHARTS` API |
| **S30 QA** | Screenshot каждого слайда через headless, diff-check texts vs SSOT, все 25 слайдов рендерятся без console errors, П5 32/32 mapping, accessibility basic (aria-labels), performance (FPS ≥ 55) | `qa_report.md` + `qa_screenshots/` |

### 8.2 Слайд-агенты (S01-S25)

| # | Slide type | Agent focus | Key interactions |
|---|---|---|---|
| S01 | cover | Three.js 3D logo + particle field + cinematic title reveal | Mouse parallax, enter → auto advance hint |
| S02 | exec_summary | Большие KPI-карты с count-up, gold shimmer | Hover card = expand with source ref |
| S03 | thesis_overview | 4 quadrants grid с flip-card | Click quadrant → slide detail |
| S04 | thesis_detail 1 | Flip-card front: claim; back: evidence | Flip on click; hover dots |
| S05 | thesis_detail 2 | (см. v1 QA: fix right padding) | Flip + drill-down refs |
| S06 | thesis_detail 3 | | Flip + drill-down refs |
| S07 | thesis_detail 4 | | Flip + drill-down refs |
| S08 | market | Animated tree-map или radial chart рынка | Hover segment = stat; drag to rotate |
| S09 | market_drivers | 5 драйверов с иконками + pulse | Click driver = modal with data points |
| S10 | pipeline_overview | D3 force-directed граф 7 проектов | Drag nodes, hover = project card |
| S11 | pipeline_timeline | D3 Gantt 7×12 кв | Zoom/pan, hover = budget/stage, filter by stage |
| S12 | unit_econ | Breakdown bars с percentage + delta | Slider для изменения margin → live recalc |
| S13 | fin_summary | Revenue/EBITDA/NI bar+line combo | Toggle scenarios, hover year = details |
| S14 | valuation | DCF waterfall (EV → Equity) | Hover bar = bridge component |
| S15 | wacc | Live formula editor: risk-free + β + ERP + debt | Change inputs → WACC recalc → highlight formula parts |
| S16 | mc_methodology | Раскрываемая формула, переменные с tooltips | Hover variable = definition |
| S17 | mc_percentiles | D3 MC histogram 50 bins + lines (Det/WACC/Mean) + IRR calculator | ▶ replay button, 5 sliders, tooltip per bin |
| S18 | det_vs_stoch | Split-view comparison с sliding divider | Drag divider, highlight deltas |
| S19 | risk_heatmap | D3 5×5 heatmap с gradient + drill-down panel | Click cell = risks list with P/I, filter by category |
| S20 | top_risks | Card list с impact scores, sort/filter | Sort by P/I/Score, expand card, mark |
| S21 | governance | Org-chart style с animated connections | Hover role = responsibilities modal |
| S22 | waterfall | Matter.js физика: падающие монеты в tier'ы | Scenario slider (bear/base/bull), live LP/GP distribution |
| S23 | terms_exit | (fix 2-col align) interactive timeline exit | Hover milestone, scenario toggle |
| S24 | appendices | Indexed list with preview on hover | Click = open appendix modal with PDF viewer iframe |
| S25 | cta | Contact card + QR + calendar CTA + logo reveal | Hover QR, click CTA = mailto, logo Three.js |

Каждый слайд-агент обязан:
1. Читать `deck_content.json → slides[N-1]` для своих текстов.
2. Читать `viz_data.json` если слайду нужны данные визуализации.
3. Использовать только API из S26-S29 (не переизобретать).
4. Регистрировать свой `enter()` / `exit()` / `teardown()` в `window.NAV.registerSlide(N, {enter, exit, teardown})`.
5. Не трогать чужие секции.

---

## 9. Контракты между агентами

Полный API — в `CONTRACTS.md`. Краткая сводка:

```js
// S26 Shell
window.THEME            // { current: 'dark'|'light', toggle(), apply(name) }

// S27 Navigation
window.NAV.registerSlide(n, { enter, exit, teardown })
window.NAV.goto(n)      // navigate to slide
window.NAV.current      // current index
window.NAV.total        // 25
window.NAV.on(event, cb) // 'enter', 'exit', 'fullscreen', 'presenter'

// S28 Animation Engine
window.ANIM.timeline(opts)          // GSAP timeline helper
window.ANIM.observe(el, cb)         // IntersectionObserver once
window.ANIM.countUp(el, from, to, opts)
window.ANIM.reveal(el, preset)      // preset: 'fadeUp', 'slideLeft', ...
window.ANIM.cursor.enable()
window.ANIM.particles.spawn(container, opts)
window.ANIM.reduced                 // bool: prefers-reduced-motion

// S29 Chart Engine
window.CHARTS.mcHistogram(container, vizData.mc, opts)
window.CHARTS.heatmap(container, vizData.heatmap, opts)
window.CHARTS.waterfall(container, vizData.waterfall, opts) // Matter.js
window.CHARTS.pipelineGantt(container, vizData.pipeline, opts)
window.CHARTS.forceGraph(container, nodes, edges, opts)
window.CHARTS.three.scene(container, sceneName)  // 'cover', 'cta'
```

Всё API exposed on `window` чтобы слайд-агенты видели их без импортов.

---

## 10. Приёмочные критерии

### 10.1 Must-pass (блокирующие)

1. Все 25 слайдов рендерятся без ошибок в консоли Chrome + Firefox.
2. Диф текстов vs `deck_content.json` = 0 различий (S30 проверяет автоматом).
3. Навигация (keys, swipe, progress, goto) работает на всех 25.
4. 4 интерактивных графика (MC, Heatmap, Waterfall, Pipeline) рендерят данные из `viz_data.json` 1:1.
5. Калькулятор IRR: default → 20.09%; 5 слайдеров меняют output.
6. Matter.js waterfall (slide 22): монеты падают, tier'ы заполняются, LP/GP сумма = 100%.
7. 3D обложка (slide 1) работает в WebGL; без WebGL → fallback на CSS 3D.
8. Performance: ≥55 FPS на среднем ноуте (S30 через Performance API).
9. FOUC = 0: shell рендерится моментально, контент после.
10. Accessibility: `aria-label` на всех interactive, `tabindex`, `prefers-reduced-motion` отключает GSAP.

### 10.2 П5 «Максимум» 32/32 на финальный HTML

Все 32 механизма П5, фокус на:
- **И1-3** — закрыты в xlsx appendix (верификация уже в v1.1.1).
- **Д1-10** — document format + diff HTML vs SSOT + regression protection.
- **Ф1-7** — точные цифры перенесены, даты, имена; противоречия = 0.
- **Н1-4** — двойной расчёт IRR/WACC в калькуляторе; границы MC percentiles.
- **Л1-9** — скрытые допущения (реклама MC baseline), парадоксы, граф причин.
- **А1-2** — моделирование аудитории (LP-инвестор), проверка адресата.

Скрипт верификации: `qa/verify_html.py` → headless Chrome (Playwright) → screenshot каждого слайда + DOM-diff текстов + console-error-scan.

### 10.3 Косметика из QA pptx (исправить в HTML)

- **Slide 5 (Тезис 2):** увеличить правый padding.
- **Slide 18 (Det vs Stoch):** разнести заголовок и подзаголовок (+20px).
- **Slide 23 (Terms & Exit):** выровнять 2 колонки по верхней границе.

---

## 11. Процесс в CC

### 11.1 Порядок запуска агентов

**Фаза A — фундамент (последовательно, блокирует всё):**
1. S26 Shell → skeleton.html готов, CSS vars, CDN imports, fonts.
2. S27 Navigation → `window.NAV` API, progress, hotkeys.
3. S28 Animation Engine → `window.ANIM`, GSAP/Lenis/IO pool, cursor trail, particles core.
4. S29 Chart Engine → `window.CHARTS`, D3/Chart.js/Three.js/Matter.js wrappers.

**Фаза B — слайды (можно в параллель, каждый 10-20 мин):**
5-29. S01-S25 в произвольном порядке (идеально — пачками по 3-5 агентов).

**Фаза C — приёмка:**
30. S30 QA → headless screenshots + diff + П5 32/32.

### 11.2 Рестарт агента

Если CC крашится на S-агенте — перезапуск только этого агента, остальные 29 не трогаются. Agent читает свою секцию в HTML и догоняет.

### 11.3 Коммит и тег

```bash
cd /tmp/tsh
git add Deck_v1.1.1/TrendStudio_LP_Deck_v1.1.1_Interactive.html
git add Deck_v1.1.1/cc_handoff/qa_report.md
git commit -m "feat(deck): v1.1.2 ultra-premium interactive HTML (30 subagents)"
git tag v1.1.2-deck
git push origin main --tags
```

---

## 12. Ссылки

- `CONTRACTS.md` — полный API между агентами.
- `agent_prompts.md` — 30 готовых промтов для копипаста в CC.
- `skeleton/index.html` — стартовый каркас с 30 именованными секциями.
- `deck_content.json` / `viz_data.json` — SSOT.
- Memory: `project_trendstudio_deck_v111.md`, `reference_sandbox_ssh_github.md`.

**Приоритет: качество > скорость. LP-grade, ultra-premium, выше премиум.**
