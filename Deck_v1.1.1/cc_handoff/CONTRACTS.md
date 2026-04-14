# CONTRACTS.md — API между 30 субагентами

**Версия:** 1.0 (для Brief_v2.md)
**Принцип:** всё общее API висит на `window.*` (без модулей/импортов), чтобы любой слайд-агент видел их без дополнительной работы.

---

## 0. Общие правила

1. **Один файл `index.html`**, всё inline. Любой код — внутри `<script>` тега, любой стиль — внутри `<style>`.
2. **Именованные границы секций** — нельзя править чужие:
   ```
   /* === Sxx: NAME ====================================== */
   ... код секции ...
   /* === /Sxx =========================================== */
   ```
3. **Порядок в HTML:**
   - `<head>`: S26 (shell+css+fonts+cdn)
   - `<body>`: S26 root (app shell + 25 пустых slide контейнеров с id="slide-01"…"slide-25") → S27 (nav UI) → S01-S25 наполняют свои секции → S28, S29 инициализируются → S30 QA hook
4. **Загрузка порядок:** DOMContentLoaded → S26 theme apply → S28 init (Lenis, GSAP config, IO pool) → S29 init (charts libraries loaded) → S27 init (slides registered by this moment) → S01-S25 register themselves → `window.NAV.goto(1)`.
5. **Глобальный namespace:** `window.TS` (опционально, защита от конфликтов):
   ```js
   window.TS = window.TS || {};
   window.TS.data = {/* deck_content.json + viz_data.json inline */};
   ```
6. **Никаких внешних fetch.** Данные встраиваются inline через `<script type="application/json" id="deck-content">...</script>` и читаются как `JSON.parse(document.getElementById('deck-content').textContent)`.

---

## 1. window.TS.data (S26 загружает, все читают)

```js
window.TS.data = {
  deck:   { meta, slides: [...] },  // из deck_content.json
  viz:    { mc, heatmap, waterfall, pipeline },  // из viz_data.json
};

// Helper
window.TS.slide = (n) => window.TS.data.deck.slides[n - 1];
```

---

## 2. window.THEME (S26)

```js
window.THEME = {
  current: 'dark',                 // 'dark' | 'light'
  toggle(): void,                  // переключает, dispatches 'theme:change'
  apply(name: 'dark'|'light'): void,
  on(event: 'theme:change', cb: (newName) => void): void,
  off(event, cb): void,
};
```

Реализация: добавляет `data-theme="dark"|"light"` на `<html>`. CSS vars переключаются в `[data-theme="light"] { --bg-primary: #F8F7F2; ... }`.

---

## 3. window.NAV (S27)

```js
window.NAV = {
  total: 25,
  current: 1,                      // 1-based

  registerSlide(n: number, handlers: {
    enter?:    () => void | Promise<void>,  // slide становится активным
    exit?:     () => void,                  // slide уходит
    teardown?: () => void,                  // cleanup (редко)
  }): void,

  goto(n: number, opts?: { animate?: boolean }): void,
  next(): void,
  prev(): void,

  fullscreen: {
    toggle(): void,
    enter(): void,
    exit(): void,
    active: boolean,
  },

  presenter: {
    toggle(): void,
    active: boolean,
    notes: string,                 // current slide notes
  },

  overlay: {
    open(content: HTMLElement | string, opts?: { size?: 'md'|'lg'|'xl' }): void,
    close(): void,
    active: boolean,
  },

  share(slideN?: number): string,  // copies #slide-N url to clipboard, returns url

  on(event: 'enter'|'exit'|'fullscreen'|'presenter'|'overlay', cb: (payload)=>void): void,
  off(event, cb): void,
};
```

**События:**
- `'enter'` payload: `{ n, slide }`. Fires AFTER slide shown.
- `'exit'` payload: `{ n, slide, nextN }`. Fires BEFORE next shown.
- `'fullscreen'` payload: `{ active: bool }`.
- `'overlay'` payload: `{ active: bool, el }`.

**Progress bar:** DOM element `#progress-bar` (gold, 3px top). S27 sets `style.width = (n/25*100) + '%'`.

**Slide dots:** DOM `#slide-dots` (25 `<button>`s). Click → `NAV.goto(n)`. Hover → tooltip с `slide.title`.

**Hotkeys modal:** `?`/`/` открывает `NAV.overlay.open(shortcutsHTML)`.

---

## 4. window.ANIM (S28)

```js
window.ANIM = {
  reduced: false,                  // prefers-reduced-motion

  // GSAP wrappers
  timeline(opts?: gsap.TimelineVars): gsap.core.Timeline,
  to(target, vars): gsap.core.Tween,
  from(target, vars): gsap.core.Tween,
  fromTo(target, fromVars, toVars): gsap.core.Tween,

  // IntersectionObserver pool (single global observer)
  observe(el: HTMLElement, cb: (entry) => void, opts?: { once?: boolean, threshold?: number }): () => void, // returns unobserve fn

  // Prebuilt presets
  reveal(el: HTMLElement | NodeList, preset: 'fadeUp'|'fadeIn'|'slideLeft'|'slideRight'|'scaleIn'|'gold'|'stagger', opts?: { stagger?: number, delay?: number, duration?: number }): gsap.core.Timeline,

  // Count-up numbers
  countUp(el: HTMLElement, to: number, opts?: { from?: number, duration?: number, format?: (v)=>string, decimals?: number }): gsap.core.Tween,

  // FLIP transitions (shared layout between slides)
  flip: {
    capture(selector: string): Flip.FlipState,
    animate(state: Flip.FlipState, opts?: Flip.FlipVars): void,
  },

  // Cursor trail (gold glow)
  cursor: {
    enable(): void,
    disable(): void,
    active: boolean,
  },

  // Particle systems
  particles: {
    spawn(container: HTMLElement, opts?: { count?: number, color?: string, connect?: boolean, density?: number }): ParticleInstance,
    destroy(instance): void,
  },

  // Page transitions
  transition: {
    out(slideEl: HTMLElement): Promise<void>,
    in(slideEl: HTMLElement): Promise<void>,
  },

  // Utility
  shimmer(el: HTMLElement, opts?: { color?: string, speed?: number }): void,
  glow(el: HTMLElement, opts?: { color?: string, intensity?: number }): void,
  parallax(container: HTMLElement, opts?: { depth?: number }): void, // attaches mousemove listener
};
```

**Reduced motion:** if `ANIM.reduced === true`, все `reveal/countUp/shimmer/glow/parallax` становятся no-op (добавляют конечное состояние без анимации).

---

## 5. window.CHARTS (S29)

```js
window.CHARTS = {
  // D3 charts
  mcHistogram(container: HTMLElement, mcData: MCData, opts?: MCOpts): MCInstance,
  heatmap(container: HTMLElement, hmData: HeatmapData, opts?: HeatmapOpts): HeatmapInstance,
  waterfall(container: HTMLElement, wfData: WaterfallData, opts?: WaterfallOpts): WaterfallInstance,
  pipelineGantt(container: HTMLElement, pData: PipelineData, opts?: GanttOpts): GanttInstance,
  forceGraph(container: HTMLElement, nodes, edges, opts?: ForceOpts): ForceInstance,

  // Chart.js wrappers
  bar(container, data, opts): Chart,
  line(container, data, opts): Chart,

  // Three.js scenes
  three: {
    scene(container: HTMLElement, sceneName: 'cover' | 'cta' | 'logo3d'): ThreeSceneInstance,
  },

  // Matter.js physics waterfall
  physicsWaterfall(container: HTMLElement, wfData: WaterfallData, opts?: PhysicsWfOpts): PhysicsInstance,

  // Shared helpers
  tooltip: {
    create(container: HTMLElement): TooltipAPI,    // .show(x,y,html), .hide()
  },
  legend: {
    create(container, items): LegendAPI,
  },
  axis: {
    bottom(scale, opts), left(scale, opts),
  },
};
```

### 5.1 Типы данных

```ts
// MC histogram
type MCData = {
  bins: Array<{ x_low: number, x_high: number, x_mid: number, count: number, prob: number }>,
  lines: Array<{ name: string, value: number, color: string }>,  // Det/WACC/Mean
  stats: { mean, std, p5, p10, p50, p90, p95, prob_positive },
};

type MCOpts = {
  width?, height?, animate?: boolean,
  onHover?: (bin) => void,
  replay?: boolean,              // если true - показывает кнопку ▶ replay
};

type MCInstance = {
  replay(): void,                // rerun animation
  update(data: MCData): void,
  destroy(): void,
};

// Heatmap
type HeatmapData = {
  rows: string[],                // probability labels
  cols: string[],                // impact labels
  cells: Array<{ r: number, c: number, score: number, risks: Risk[] }>,
};

type Risk = { id: string, name: string, p: number, i: number, score: number, category: string, mitigations: string[] };

type HeatmapOpts = {
  onCellClick?: (cell) => void,
  colorScale?: 'green-yellow-red' | 'diverging',
};

// Waterfall
type WaterfallData = {
  scenarios: {
    bear: WaterfallScenario,
    base: WaterfallScenario,
    bull: WaterfallScenario,
  },
};
type WaterfallScenario = {
  total: number,
  steps: Array<{ label: string, value: number, type: 'start'|'positive'|'negative'|'total' }>,
};

// Pipeline
type PipelineData = {
  projects: Array<{
    id, name, type: 'film'|'series', budget_mln, irr_pct,
    stages: Array<{ stage: 'Разработка'|'Препродакшн'|'Съёмки'|'Постпродакшн'|'Релиз', start_q, end_q }>,
  }>,
  quarters: string[],            // ['2026Q1', ..., '2028Q4']
};
```

**Tooltip API:**
```js
const tip = CHARTS.tooltip.create(container);
tip.show(x, y, '<b>Title</b><br>Value: 123');
tip.hide();
```

---

## 6. Slide agent template (S01-S25)

Каждый слайд-агент должен следовать этой форме внутри своей секции:

```html
<!-- === S07: THESIS_DETAIL_3 ============================== -->
<section id="slide-07" class="slide" data-slide="7" data-agent="S07">
  <div class="slide-inner">
    <!-- контент -->
  </div>
</section>
<style>
/* === S07: styles === */
#slide-07 .some-class { /* scoped by #slide-07 prefix */ }
/* === /S07 styles === */
</style>
<script>
/* === S07: logic === */
(function() {
  const N = 7;
  const slide = window.TS.slide(N);         // данные из deck_content.json
  const root  = document.getElementById('slide-07');

  // 1. Populate content from SSOT (no hardcoded texts)
  root.querySelector('.s7-title').textContent = slide.title;
  // ... и т.д.

  // 2. Register lifecycle
  window.NAV.registerSlide(N, {
    enter() {
      // GSAP timeline на открытии
      window.ANIM.reveal(root.querySelectorAll('.s7-bullet'), 'stagger', { stagger: 0.08 });
      // ... любая интерактивность активируется
    },
    exit() {
      // cleanup timers, если нужно
    },
  });
})();
/* === /S07 logic === */
</script>
<!-- === /S07 ============================================== -->
```

**Правила:**
- Все селекторы классов — с префиксом `.s7-*` (для слайда 7). Избегаем коллизий.
- Ни один слайд-агент не должен писать в `window.*` API (только читать/вызывать).
- Если нужна общая утилита, которой нет в ANIM/CHARTS — добавлять в соответствующий инфра-агент, а не хардкодить у себя.

---

## 7. S30 QA contracts

### 7.1 Headless тест

```bash
# В CC:
python qa/verify_html.py --html TrendStudio_LP_Deck_v1.1.1_Interactive.html
```

Скрипт Playwright:
1. Открыть HTML в Chromium headless.
2. Navigate к каждому слайду (через `NAV.goto(n)`).
3. Wait for `enter` complete.
4. Screenshot `qa_screenshots/slide-NN.png`.
5. Dump DOM `.slide.active` текст и diff vs `deck_content.json.slides[n-1]`.
6. Считать console errors (должно быть 0).
7. Измерить FPS через Performance API (≥ 55).

### 7.2 qa_report.md структура

```markdown
# QA Report — TrendStudio LP Deck v1.1.1 Interactive HTML

## Summary
- Slides rendered: 25/25
- Console errors: 0
- Average FPS: 58.3
- П5 verification: 32/32

## Diff vs SSOT
- Slide 01: 0 diffs
- ...

## Screenshots
- qa_screenshots/slide-01.png
- ...

## П5 32/32
- Ф1: ✅ ...
```

### 7.3 Acceptance gate

S30 возвращает exit=0 только если:
- Все 25 слайдов PASS (DOM diff = 0, no console errors).
- FPS ≥ 55 average.
- Accessibility basic (все interactive имеют aria-label ИЛИ text content).
- `prefers-reduced-motion` отключает GSAP (проверяется через emulation).

---

## 8. Matter.js waterfall (S29 + S22)

Специальный контракт, т.к. физика — тонкая:

```js
CHARTS.physicsWaterfall(container, wfData, {
  scenario: 'base',              // 'bear'|'base'|'bull'
  onScenarioChange: (newScenario) => void,
  onCoinLanded: (tier, value) => void,
});

// Returns
{
  setScenario(s),                // пересыпает монеты согласно новому сценарию
  pause(), resume(),
  reset(),                       // все монеты вверху, заново
  getTotals(): { lp_pct, gp_pct, total_value },
  destroy(),
}
```

Физика: монеты (круги ~8px) падают сверху, отражаются от walls, попадают в 5 tier'ов (LP return of capital → LP pref → Catch-up → Carried 20/80 → Final). Scenario slider меняет количество и размер монет. Totals обновляются live в DOM-счётчиках рядом.

---

## 9. Slide 17 IRR calculator (S29 + S17)

```js
// В S17:
const calc = CHARTS.irrCalculator(container, {
  inputs: {
    wacc_pct:       { min: 5, max: 25, step: 0.1, default: 12.0 },
    capex_scale:    { min: 0.7, max: 1.3, step: 0.01, default: 1.0 },
    revenue_scale:  { min: 0.7, max: 1.3, step: 0.01, default: 1.0 },
    margin_shift:   { min: -5, max: 5, step: 0.1, default: 0.0 },     // pp
    exit_multiple:  { min: 3, max: 15, step: 0.1, default: 8.0 },
  },
  onChange: (inputs, outputs) => {
    // outputs = { irr_pct, moic, payback_years, npv_mln }
  },
});

calc.reset();                    // вернуть defaults
calc.setInputs({ wacc_pct: 15 });
```

Формулы IRR — двойной расчёт (метод NPV→0 bisection И метод XIRR polyfill), сравнение должно совпадать до 0.05pp. Если расходятся — console.warn.

---

## 10. Reduced-motion fallback

Обязательно для accessibility:

```js
// S28 Animation Engine
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
window.ANIM.reduced = mq.matches;
mq.addEventListener('change', (e) => { window.ANIM.reduced = e.matches; });

// Внутри reveal/countUp/... check:
if (window.ANIM.reduced) {
  // Просто применить конечное состояние без анимации.
  gsap.set(target, finalVars);
  return Promise.resolve();
}
```

---

## 11. Debug API (S30 включает через `?debug=1`)

```js
window.TS.debug = {
  showGrid(): void,              // overlay grid для выравнивания
  showSafeArea(): void,
  fpsCounter: { show(), hide() },
  slideJumper: { show() },       // UI с dropdown и goto
  stateDump(): object,           // current state всего deck'а
};
```

Hotkey `G` вызывает `showGrid()`.
