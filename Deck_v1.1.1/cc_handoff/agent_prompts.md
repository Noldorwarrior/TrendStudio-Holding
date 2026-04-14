# 30 промтов для субагентов Claude Code

**Применение:** каждый промт — отдельный запуск в CC.
**Перед Фазой B (S01-S25):** убедись, что Фаза A (S26→S27→S28→S29) завершена успешно.
**Общие входы для всех агентов:** `Brief_v2.md`, `CONTRACTS.md`, `deck_content.json`, `viz_data.json`, `skeleton/index.html`.
**Выход:** все правки — в `TrendStudio_LP_Deck_v1.1.1_Interactive.html` в своей именованной секции.

---

## Стандартный преамбула (копируется в КАЖДЫЙ промт)

```
Контекст: ТрендСтудио LP Deck v1.1.1, ultra-premium interactive HTML, 30-субагентная архитектура.
Читай: Brief_v2.md, CONTRACTS.md, deck_content.json, viz_data.json.
Файл вывода: TrendStudio_LP_Deck_v1.1.1_Interactive.html (single-file).
Правь ТОЛЬКО свою именованную секцию /* === Sxx: ... === */ ... /* === /Sxx === */.
Никаких fetch — данные inline в <script type="application/json" id="deck-content"> и id="viz-data">.
После работы — вызови python qa/verify_html.py (если S30 готов) и убедись что slide рендерится.
Design System v2: цвета, шрифты, токены — в Brief_v2.md §4.
Anti-patterns: не трогать чужие секции, не hardcode-ить тексты (только из SSOT), не ломать API из CONTRACTS.md.
```

---

# Фаза A — Инфраструктура (последовательно)

## S26 Shell

```
[Преамбула]

Задача: построй фундамент HTML.

Контракт (CONTRACTS.md §2): экспортировать window.THEME + window.TS.data.

Выход в index.html:
1. <head>:
   - <meta>, <title>TrendStudio LP Deck v1.1.1</title>
   - Google Fonts: Inter 400/500/600/700, Georgia (system), JetBrains Mono 400/500
   - CDN preload для всех библиотек Macro stack (GSAP + ScrollTrigger + Flip, D3 v7, Chart.js 4.4, Anime.js 3.2, Three.js r160, Lenis 1.0, Matter.js 0.19, tsParticles)
   - <style> блок с CSS variables из Brief_v2.md §4.1 (dark + light темы через [data-theme])
   - Базовый CSS reset + body overflow-hidden + .slide 100vw×56.25vw layout
   - .slide { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0; pointer-events: none; }
   - .slide.active { opacity: 1; pointer-events: auto; }
   - Safe area 6% horizontal, 8% vertical
   - Gold accent line 3px сверху каждого .slide (::before с gradient)
   - Glass-morphism утилиты: .glass { background: var(--bg-glass); backdrop-filter: blur(20px) saturate(140%); }
   - Shimmer keyframes
   - Footer styles
   
2. <body>:
   - <div id="app-root">
     - <div id="progress-bar"></div>
     - <main id="deck">
       - <section id="slide-01" class="slide" data-slide="1"></section>
       - ... 25 пустых контейнеров ...
     - </main>
     - <footer id="deck-footer">
       - <div class="footer-left">ТрендСтудио Холдинг · LP Deck v1.1.1 · Confidential</div>
       - <div class="footer-right"><span id="current-slide">1</span> / 25</div>
     - </footer>
   - <script type="application/json" id="deck-content">{{INLINE deck_content.json}}</script>
   - <script type="application/json" id="viz-data">{{INLINE viz_data.json}}</script>

3. <script> инициализации:
   - window.TS = { data: { deck: JSON.parse(...), viz: JSON.parse(...) }, slide: (n) => this.data.deck.slides[n-1] };
   - window.THEME с toggle/apply/on/off (data-theme attribute on <html>)
   - Font readiness: document.fonts.ready → body.classList.add('fonts-loaded')

Приёмка: HTML открывается, шрифты грузятся без FOUC, 25 пустых слайдов в DOM, window.TS.data.deck.slides.length === 25, window.THEME работает.
```

---

## S27 Navigation

```
[Преамбула]

Задача: реализовать window.NAV (CONTRACTS.md §3).

Секция: /* === S27: NAVIGATION === */ ... /* === /S27 === */ в конце <body>.

Реализуй:
1. window.NAV с полями current=1, total=25, массивом handlers[].
2. registerSlide(n, {enter, exit, teardown}).
3. goto(n, {animate}) — вызывает exit старого, добавляет .active на новый, вызывает enter нового. Animate через window.ANIM.transition если есть.
4. next(), prev() — с boundary check.
5. Hotkeys (см. Brief_v2.md §7): все 17 комбинаций. Used keydown listener, e.preventDefault() для наших клавиш, игнор если input:focus.
6. Touch: Hammer.js не тянем — нативный touch (touchstart/touchend), threshold 50px.
7. Progress bar: width = (current/total*100)% с GSAP transition 300ms.
8. Slide dots: 25 кнопок в правом нижнем углу, активная gold.
9. Fullscreen: document.documentElement.requestFullscreen/exit.
10. Presenter mode: modal с заметками slide (slide.notes из SSOT) + timer с начала презентации + prev/next controls + список всех slide с go-to.
11. Shortcuts modal (? or /): красивая карточка со списком всех hotkeys.
12. Share link: копирует window.location.href.split('#')[0] + '#slide-N' в clipboard + toast.
13. Deep-link: читать window.location.hash при load → NAV.goto(n).
14. Event system: on/off для 'enter', 'exit', 'fullscreen', 'presenter', 'overlay'.
15. Overlay manager: NAV.overlay.open/close с backdrop (click = close, Esc = close).

Стили: progress-bar gold 3px с glow. Dots: 8px circles. Presenter sidebar правый, 320px. Shortcuts modal центрированный, glass-morphism.

Приёмка: все 17 hotkeys работают, swipe на тач, progress анимируется, deep-link работает, presenter открывается, ? показывает modal, Esc закрывает.
```

---

## S28 Animation Engine

```
[Преамбула]

Задача: реализовать window.ANIM (CONTRACTS.md §4).

Секция: /* === S28: ANIMATION_ENGINE === */.

Реализуй:
1. Проверка prefers-reduced-motion → window.ANIM.reduced.
2. gsap.registerPlugin(ScrollTrigger, Flip).
3. timeline(), to(), from(), fromTo() — тонкие обёртки вокруг gsap.*.
4. Единый IntersectionObserver pool: один observer с threshold [0, 0.1, 0.5, 1.0], maps el → callbacks. ANIM.observe(el, cb, {once, threshold}).
5. reveal(el, preset, opts): pre-sets:
   - 'fadeUp': from {y:30, opacity:0} to {y:0, opacity:1, duration:0.8, ease:'expo.out'}
   - 'fadeIn': opacity 0→1
   - 'slideLeft': from {x:-50, opacity:0} to {x:0, opacity:1}
   - 'slideRight': {x:50, opacity:0} → ...
   - 'scaleIn': {scale:0.8, opacity:0} → {scale:1, opacity:1, ease:'back.out(1.7)'}
   - 'gold': добавляет golden glow pulse на окончании
   - 'stagger': auto-wraps в stagger по children
6. countUp(el, to, opts): анимация числа от 0 (или from) до to за duration ease-out-expo. format callback опционально (для миллионов, процентов, валют).
7. flip.capture/animate — обёртки GSAP Flip plugin для shared layout transitions.
8. cursor: gold dot 12px follows mouse с lag 0.15s через quickTo. Disable на тач-устройствах.
9. particles.spawn(container, opts): tsParticles конфиг dark cinematic, connect lines, density по opts. Возвращает instance с destroy().
10. transition.out/in: GSAP timeline на выход (blur 0→10px, opacity 1→0, y 0→-30, duration 0.4) и вход (reverse, duration 0.6).
11. shimmer(el): добавляет класс .shimmer + keyframe animation.
12. glow(el, opts): box-shadow pulse.
13. parallax(container, opts): mousemove listener → translate children по data-depth.

Если ANIM.reduced === true:
- countUp → сразу ставит конечное значение.
- reveal → gsap.set конечных values без анимации.
- cursor/particles/parallax → no-op.

Импорт Lenis: создаёт smooth scroll instance на window, rAF loop.

Приёмка: ANIM.reveal анимирует, ANIM.countUp работает с форматом, IO-pool handles 100+ элементов, cursor trail на desktop, reduced-motion выключает всё.
```

---

## S29 Chart Engine

```
[Преамбула]

Задача: реализовать window.CHARTS (CONTRACTS.md §5).

Секция: /* === S29: CHART_ENGINE === */.

Все графики используют цвета из CSS vars (getComputedStyle).

Реализуй:

1. mcHistogram(container, mcData, opts):
   - SVG 960×480, margin {top:40, right:40, bottom:60, left:60}.
   - D3 scales: x linear по x_mid, y linear по prob.
   - Bars с gradient fill --grad-gold. On enter: stagger transition delay (i*20)ms, scale-y 0→1.
   - Lines Det (dashed red), WACC (solid blue), Mean (solid gold) — с labels.
   - Axis: bottom форматирует %, left форматирует probability.
   - Tooltip на hover bar: {x_low}-{x_high}%, probability, cumulative.
   - Replay button: если opts.replay, показать ▶ кнопку, клик = rerun animation.
   - Export method: update(newData), destroy().

2. heatmap(container, hmData, opts):
   - SVG 600×600 grid 5×5. Cells rect с color scale 'green-yellow-red'.
   - Labels снаружи (probability вниз, impact влево).
   - On enter: stagger grow cells, diagonal sweep.
   - On cellClick: callback + показать боковую панель (ANIM.to slide panel).
   - Tooltip: cell score + number of risks.

3. waterfall (классический D3): SVG bars с connecting lines между столбцами, color по type (start=gray, positive=green, negative=red, total=gold).

4. physicsWaterfall(container, wfData, opts):
   - Matter.js canvas 960×600.
   - 5 tier боксов внизу (walls + floors), gold outlined, labels (LP ROC, LP Pref 8%, Catch-up, Carried 80/20, Residual LP).
   - Монеты (circles, 8px, gold gradient) спавнятся сверху каждые 50ms пока не исчерпается scenario.total.
   - Сценарий меняет количество монет и distribution.
   - onCoinLanded callback обновляет счётчики LP% / GP% / total value.
   - Scenario slider (bear/base/bull) как часть UI под canvas.
   - reset/pause/resume методы.

5. pipelineGantt(container, pData, opts):
   - SVG 1440×560.
   - X: quarters (12), Y: projects (7).
   - Стадия = rect с цветом по stage, label name + budget + IRR.
   - Zoom/pan через d3.zoom.
   - Hover project = tooltip с details + highlight row.

6. forceGraph(container, nodes, edges, opts):
   - D3 force simulation. Nodes = projects, edges = dependencies/similarities.
   - Drag enabled. Collision detection.
   - Nodes как circles с labels, size по budget_mln.
   - Color по type (film=gold, series=cyan).

7. three.scene(container, sceneName):
   - 'cover': Three.js scene с 3D текст логотипа (TextGeometry), partikle field 500 частиц, ambient camera rotation.
   - 'cta': Centered gold sphere + конфетти частицы при hover.
   - 'logo3d': 3D кинолента или проектор вращающийся.
   - Renderer: antialias, alpha, pixelRatio window.devicePixelRatio.
   - resize handler.

8. bar/line (Chart.js wrappers): простые data+options → new Chart(ctx).

9. tooltip.create(container): возвращает {show(x,y,html), hide()}. Div абсолютно позиционированный, fade 160ms.

10. irrCalculator(container, opts) — специальный contract §9.

Приёмка: все 5+ графиков рендерят корректные данные из viz_data.json, tooltips работают, Matter.js физика запускается, Three.js scene грузится.
```

---

# Фаза B — Слайд-агенты (25 промтов, можно в параллель)

## S01 — Cover

```
[Преамбула]

Slide 1 (type=cover). Ultra-premium кинематографическая обложка.

SSOT: window.TS.slide(1).

Layout:
- Three.js scene (window.CHARTS.three.scene(bg, 'cover')): partikle field + parallax 3D logo "ТРЕНДСТУДИО" в gold metallic.
- Большой title по центру (Georgia 72px gradient gold shimmer).
- Subtitle 24px inter, letter-spacing 0.3em, uppercase gold.
- Дата, версия, confidential footer row (bottom, 12px).
- Hint "Нажмите → или пробел" fade-in через 2s.

Анимации enter:
1. Три.js сцена уже активна (фон).
2. Big title: clip-path reveal справа налево + gold shimmer.
3. Subtitle: letter-by-letter opacity stagger (0.04s stagger, 1.0s total).
4. Footer row: fadeUp stagger.
5. Hint: pulse opacity после 2s.

Интерактив:
- Mouse parallax на camera (Three.js).
- Click/scroll → NAV.next().
- Hover на title = intensify shimmer.

Приёмка: сцена рендерится, 3D-текст виден, анимация плавная, parallax работает.
```

---

## S02 — Exec Summary

```
[Преамбула]

Slide 2 (type=exec_summary). 4-6 больших KPI-карт.

SSOT: slide.metrics[] (IRR, MoIC, Revenue 3Y, P(>0), payback, ...).

Layout:
- H1 title сверху.
- Grid 2x3 (или 3x2) glass-cards.
- Каждая карта: big value (Georgia 84px, gold gradient shimmer), label (Inter 14px uppercase muted), delta vs target (small badge green/red).

Анимации:
- Title fadeUp 0.8s.
- Cards stagger scaleIn 0.1s delay.
- Values: ANIM.countUp с format (% / млн ₽ / x).
- Gold accent line draw-in под каждой картой.

Интерактив:
- Hover card: scale 1.02 + gold glow + раскрывает источник (источник из slide.metrics[i].source).
- Click card: NAV.overlay.open с подробной таблицей расчёта.
- Copy-to-clipboard на клик по значению.

Приёмка: countUp видно, все метрики читаются из SSOT, hover раскрывает источник, click открывает overlay.
```

---

## S03 — Thesis Overview

```
[Преамбула]

Slide 3 (type=thesis_overview). 4 тезиса в grid 2x2 flip-cards.

Layout:
- H1 "Инвестиционный тезис".
- 4 quadrant cards. Front: icon + short claim. Back: expanded claim + "Drill-down →" link.

Анимации:
- Enter: quadrants scaleIn с diagonal stagger (TL, TR, BL, BR).
- 3D-flip на hover/click (rotateY 180deg 0.6s).

Интерактив:
- Hover card = flip.
- Click "Drill-down" → NAV.goto(3+i) для thesis_detail N.
- Tooltip на icon = extended definition.

Приёмка: 4 карты, flip плавный, клики навигируют.
```

---

## S04 — Thesis Detail 1

```
[Преамбула]

Slide 4 (type=thesis_detail, i=1).

Layout:
- H1 thesis title + номер "01 / 04" справа.
- 2 колонки: левая = expanded claim + references; правая = evidence chart/image placeholder + stat.
- Back button "← ко всем тезисам" → NAV.goto(3).

Анимации:
- Claim split into paragraphs, stagger fadeUp.
- Number "01" большой gold (count-up от 0 до 1).
- Evidence chart draw-in если есть.
- Gold accent line под каждой ссылкой.

Интерактив:
- Hover reference = tooltip с полной цитатой.
- Click reference = opens NAV.overlay со source document (PDF iframe или image).

Приёмка: тексты из slide.body, 4 references, обратная навигация работает.
```

---

## S05 — Thesis Detail 2

```
[Преамбула]

Slide 5 (type=thesis_detail, i=2). ВАЖНО: исправить правый padding (QA v1 finding) — +32px right padding.

Layout как S04, но для тезиса 2.

Приёмка: правая часть не прижата к краю.
```

---

## S06 — Thesis Detail 3

```
[Преамбула]

Slide 6 (type=thesis_detail, i=3). Как S04.

Приёмка: контент из SSOT.
```

---

## S07 — Thesis Detail 4

```
[Преамбула]

Slide 7 (type=thesis_detail, i=4). Как S04.

Приёмка: контент из SSOT.
```

---

## S08 — Market

```
[Преамбула]

Slide 8 (type=market). Размер рынка + сегментация.

Layout:
- H1 "Рынок кино РФ 2026-2028".
- Big central circle (donut chart) или radial tree-map сегментов.
- 3-4 side stats (CAGR, TAM, SAM, SOM).

Анимации:
- Donut: arc transition 1.2s с stagger сегментов.
- Stats: countUp.

Интерактив:
- Hover segment = pull out + tooltip с деталями.
- Drag to rotate donut.
- Click center = NAV.overlay с полной table разбивки.

Приёмка: donut анимируется, cегменты hover-reactive.
```

---

## S09 — Market Drivers

```
[Преамбула]

Slide 9 (type=market_drivers). 5 драйверов роста.

Layout:
- H1 + 5 icon cards horizontally.
- Каждый card: icon (SVG), name, impact metric.

Анимации:
- Icons stagger slideUp + pulse glow.
- Impact countUp.
- Idle beacon: каждые 6s random driver подсвечивается gold.

Интерактив:
- Click driver = overlay с pros/cons/evidence.
- Hover icon = animate SVG (rotate/scale).

Приёмка: 5 драйверов из SSOT, idle beacon работает.
```

---

## S10 — Pipeline Overview

```
[Преамбула]

Slide 10 (type=pipeline_overview). Force-directed граф 7 проектов.

Данные: window.TS.data.viz.pipeline.projects (7 проектов).
Edges: синтезируй по genre/team совпадению (например, одинаковый жанр = edge).

Layout:
- H1 "Pipeline: 7 проектов — 5 фильмов + 2 сериала".
- Большой canvas в центре с force-graph.
- Легенда справа (film=gold, series=cyan, size=budget).

CHARTS API: window.CHARTS.forceGraph(container, nodes, edges, opts).

Анимации:
- Nodes spawn stagger centered → распределяются по simulation.
- Edges draw-in после settle.

Интерактив:
- Drag nodes — физика пересчитывается.
- Hover node = card с project info (name, budget, IRR, stage).
- Click node = NAV.goto(11) и highlight этот проект на Gantt.

Приёмка: все 7 проектов видны, drag работает, tooltip показывает info.
```

---

## S11 — Pipeline Timeline

```
[Преамбула]

Slide 11 (type=pipeline_timeline). Gantt 7 проектов × 12 кварталов.

Данные: window.TS.data.viz.pipeline.

CHARTS API: window.CHARTS.pipelineGantt(container, pData, opts).

Layout:
- H1 "Timeline 2026-2028".
- SVG Gantt: rows = projects, columns = quarters.
- Stage colors: Разработка=muted, Препродакшн=yellow, Съёмки=gold, Постпродакшн=cyan, Релиз=green.
- Filter chips сверху: all / films / series / by stage.

Анимации:
- Rows enter stagger, stages draw-in слева направо.
- Quarter headers stagger fadeIn.

Интерактив:
- Zoom/pan (scroll + drag).
- Hover project row = highlight + card с total budget + combined IRR.
- Click stage bar = tooltip с датами.
- Filter chips: изменяют visibility строк с GSAP.
- Keyboard: ← → для навигации между кварталами внутри slide.

Приёмка: Gantt рендерится из viz_data, zoom работает, фильтры переключают.
```

---

## S12 — Unit Economics

```
[Преамбула]

Slide 12 (type=unit_econ). Раскладка unit economics типового проекта.

Layout:
- H1 "Unit economics: средний фильм".
- Horizontal bar breakdown: Revenue 100% → Distribution cut, Production cost, Marketing, Producer fee, Net profit.
- Слайдер "Margin scenario" под breakdown: base / optimistic / pessimistic.

Анимации:
- Bar segments draw-in stagger.
- Percentage labels countUp.

Интерактив:
- Slider изменяет margin → все сегменты пересчитываются live + GSAP transition ширины.
- Hover segment = tooltip с абсолютной суммой в млн ₽.
- Copy-to-clipboard на любой процент.

Приёмка: slider live пересчитывает, сумма всегда = 100%.
```

---

## S13 — Financial Summary

```
[Преамбула]

Slide 13 (type=fin_summary). Revenue / EBITDA / Net Income по годам.

Данные: slide.tables.financial_projection (если нет — синтезируй из viz_data или meta).

Layout:
- H1 "Финансовый прогноз 2026-2028".
- Chart.js bar (Revenue) + line (EBITDA, NI) combo.
- Scenario toggle: Base / Bull / Bear (сверху).
- Data table справа с YoY deltas.

Анимации:
- Bars stagger grow.
- Lines draw в конце.
- Cell values countUp.

Интерактив:
- Scenario toggle переключает данные (animate transition 600ms).
- Hover year bar = detailed tooltip.
- Click cell = copy.

Приёмка: 3 серии × 3 года рендерятся, toggle работает.
```

---

## S14 — Valuation

```
[Преамбула]

Slide 14 (type=valuation). DCF waterfall EV → Equity.

Данные: slide.tables.valuation_bridge (если нет — синтезируй из meta: EV, net debt, minority, equity).

Layout:
- H1 "Оценка (DCF)".
- Waterfall classic: EV → (-) Net Debt → (-) Minority → Equity.
- Каждый столбик с меткой и value.
- Result (Equity value) в gold frame.

Анимации:
- Bars stagger draw-in с connecting lines.
- Result glow.

Интерактив:
- Hover step = bridge explanation.
- Click step = overlay с компонентами (например, Net Debt разложение).

Приёмка: waterfall корректный, result = EV - NetDebt - Minority.
```

---

## S15 — WACC

```
[Преамбула]

Slide 15 (type=wacc). Live formula editor.

Layout:
- H1 "WACC: декомпозиция".
- Formula latex-like: WACC = E/V × Re + D/V × Rd × (1-t).
- 5 input sliders: Rf (risk-free), β (beta), ERP (equity risk premium), Rd (cost of debt), D/V (leverage).
- Output: WACC% (gold big 84px countUp при изменении).
- Explanatory side notes: "Rf из ОФЗ 10-летних (13.5%)", etc.

Анимации:
- Formula elements stagger fadeIn.
- Output pulse glow при пересчёте.
- Sliders: handle bounce on drag end.

Интерактив:
- Slider drag → live WACC recalc (debounced 50ms) + highlight в формуле части, зависящие от изменённого входа.
- Reset button → defaults.
- Hover formula variable = tooltip с definition + текущим значением.
- Copy final WACC.

Расчёт: Re = Rf + β × ERP; WACC = (E/V) × Re + (D/V) × Rd × (1 - 0.2).  // tax 20%

Приёмка: все 5 слайдеров работают, WACC пересчитывается, defaults дают slide.metrics.wacc.
```

---

## S16 — MC Methodology

```
[Преамбула]

Slide 16 (type=mc_methodology). Методология Monte Carlo.

Layout:
- H1 "Monte Carlo: методология".
- 3-4 numbered steps с иконками.
- Раскрываемая формула NPV / IRR simulation.
- Список переменных с распределениями (Revenue ~ LogNormal(μ, σ), ...).

Анимации:
- Steps stagger slideLeft.
- Formula reveal on hover "Показать формулу".

Интерактив:
- Hover variable = tooltip с distribution + μ/σ.
- Click "Показать симуляцию" → NAV.goto(17).

Приёмка: методология читается, tooltips работают.
```

---

## S17 — MC Percentiles + IRR Calculator

```
[Преамбула]

Slide 17 (type=mc_percentiles). ГЛАВНЫЙ слайд: MC histogram + калькулятор.

Данные: window.TS.data.viz.mc.

Layout:
- H1 "Monte Carlo: 50 000 симуляций".
- Слева (60%): mcHistogram (CHARTS.mcHistogram). 50 bins, gold bars, lines Det/WACC/Mean.
- Справа (40%): IRR calculator панель с 5 sliders и output card.
- Внизу: key stats row — Mean, σ, p5, p95, P(>0).

Анимации:
- Histogram: stagger bars grow.
- Lines draw-in после.
- Stats countUp.

Интерактив:
- ▶ Replay button — прогоняет анимацию заново.
- Слайдеры IRR калькулятора (см. CONTRACTS.md §9): WACC, Capex scale, Revenue scale, Margin shift, Exit multiple. Live recalc IRR, MoIC, payback, NPV.
- Reset button → defaults (IRR 20.09%).
- Hover bin = tooltip percentile.
- Hover line = name/value.

Приёмка: histogram точно из viz_data, калькулятор изменяет output, default IRR = 20.09%, replay работает.
```

---

## S18 — Det vs Stoch

```
[Преамбула]

Slide 18 (type=det_vs_stoch). Сравнение детерминистического и стохастического подходов.

ВАЖНО: fix заголовок vs подзаголовок distance (+20px, QA finding v1).

Layout:
- H1 + H2 (с увеличенным gap).
- Split-screen: слева Deterministic (single IRR), справа Stochastic (distribution). Sliding divider по центру.
- Delta labels (gold, red).

Анимации:
- Divider slide-in из центра.
- Halves fade с разных сторон.
- Numbers countUp.

Интерактив:
- Drag divider = меняет preview какая сторона "выигрывает".
- Hover metric = detailed comparison.

Приёмка: divider работает, delta корректный (Stoch 20.09% vs Det Xx.xx%).
```

---

## S19 — Risk Heatmap

```
[Преамбула]

Slide 19 (type=risk_heatmap). 5×5 heatmap + drill-down.

Данные: window.TS.data.viz.heatmap.

Layout:
- H1 "Risk heatmap".
- SVG 5×5 heatmap (CHARTS.heatmap).
- Axes: Probability (1-5) vs Impact (1-5).
- Side panel справа (изначально закрыта): drill-down risks по выбранной cell.

Анимации:
- Cells diagonal sweep enter.
- Side panel slide-in справа при click.

Интерактив:
- Click cell = side panel открывается со списком рисков с их P/I/Score/mitigations.
- Filter chips "По категории": strategic/operational/financial/legal.
- Hover cell = tooltip со счётчиком.
- Risk row in panel: hover = highlight, click = modal с mitigation plan.

Приёмка: 25 клеток, drill-down показывает правильные риски.
```

---

## S20 — Top Risks

```
[Преамбула]

Slide 20 (type=top_risks). Список топ-10 рисков.

Данные: slide.tables.top_risks.

Layout:
- H1 "Топ-10 рисков".
- Sortable table / card list.
- Columns: № / Name / P / I / Score / Category / Mitigation status.
- Score = P*I. Color gradient.

Анимации:
- Row stagger fadeUp.
- Scores countUp.

Интерактив:
- Click column header = sort.
- Filter chips по category + by status (pending/mitigating/monitored).
- Click row = expand inline с mitigation plan.
- Checkbox "mark as reviewed" (localStorage NE — используем window.TS.state runtime).

Приёмка: сортировки работают, filter переключается, expand раскрывает детали.
```

---

## S21 — Governance

```
[Преамбула]

Slide 21 (type=governance). Org-chart style.

Layout:
- H1 "Корпоративное управление".
- Org tree: Investment Committee → GP → Management Team.
- Связи animated (gold lines с flow).

Анимации:
- Nodes stagger по уровням (сверху вниз).
- Lines draw с gradient flow loop.

Интерактив:
- Hover node = tooltip с responsibilities.
- Click node = modal с bio (если есть в SSOT).

Приёмка: структура читается, 3 уровня.
```

---

## S22 — Waterfall

```
[Преамбула]

Slide 22 (type=waterfall). Matter.js физика distribution LP/GP.

Данные: window.TS.data.viz.waterfall (bear/base/bull).

CHARTS API: window.CHARTS.physicsWaterfall(container, wfData, {scenario: 'base', ...}).

Layout:
- H1 "LP/GP Waterfall".
- Большой canvas (960×560) физики по центру.
- Scenario slider под canvas: Bear / Base / Bull.
- Side stats справа: LP %, GP %, Total distributed, MoIC LP, MoIC GP.

Анимации:
- Монеты падают, физика работает.
- Scenario change = plash reset + rerun.

Интерактив:
- Scenario slider = смена сценария, физика пересчитывается.
- Pause/resume button.
- Reset button.
- Hover tier box = показать формулу (например, "LP Pref 8% cumulative").
- Click coin = tooltip с value.

Приёмка: физика запускается, 3 сценария работают, LP+GP = 100%, MoIC корректный.
```

---

## S23 — Terms & Exit

```
[Преамбула]

Slide 23 (type=terms_exit). ВАЖНО: fix 2-col align (QA finding).

Layout:
- H1 "Условия и exit-сценарии".
- 2 columns: левая = Terms (commitment, management fee, carry, catch-up, hurdle). Правая = Exit scenarios timeline.
- Оба col выровнены top.

Анимации:
- Cols slideLeft/slideRight.
- Timeline milestones stagger.

Интерактив:
- Hover term = tooltip с industry benchmark.
- Click milestone = expand с scenario details.
- Scenario toggle Bear/Base/Bull меняет timeline.

Приёмка: 2 колонки выровнены, timeline интерактивный.
```

---

## S24 — Appendices

```
[Преамбула]

Slide 24 (type=appendices). Index всех приложений.

Layout:
- H1 "Приложения".
- Сетка cards (Appendix A-F): title + short desc + "Открыть →".

Анимации:
- Cards stagger scaleIn.

Интерактив:
- Hover card = preview на обратной стороне (flip).
- Click = NAV.overlay.open с iframe PDF viewer (если есть файл) или с markdown content.

Приёмка: все appendices из SSOT, click открывает overlay.
```

---

## S25 — CTA

```
[Преамбула]

Slide 25 (type=cta). Финальный слайд.

Layout:
- Three.js 3D сцена фон (CHARTS.three.scene('cta'): gold sphere + конфетти на hover).
- Center: "Инвестируйте в будущее российского кино" (Georgia 56px).
- CTA-кнопка: "Запланировать встречу с фондом" (large gold, mailto).
- QR код (генерируется на лету) ведёт на landing или contact.
- Contact info: email, phone (из SSOT).
- Logo reveal в конце.

Анимации:
- Text clip-path reveal.
- CTA pulse glow idle.
- QR fade-in после 1s.
- Logo final shimmer.

Интерактив:
- Hover CTA = intensify glow + scale 1.03.
- Click CTA = mailto: open.
- Hover QR = zoom 1.4x.
- Click "Назад к началу" → NAV.goto(1).

Приёмка: CTA кликается, QR корректный, сцена работает.
```

---

# Фаза C — QA

## S30 QA

```
[Преамбула]

Задача: headless верификация HTML + отчёт П5 32/32.

Создай:
1. qa/verify_html.py — Playwright (python -m pip install playwright + playwright install chromium).
2. Скрипт:
   - Запускает chromium headless.
   - Открывает HTML.
   - Вытаскивает window.TS.data.deck.slides (через page.evaluate).
   - Проходит все 25 слайдов через NAV.goto(n).
   - Ждёт 'enter' event (через window postMessage или promise).
   - Screenshot → qa_screenshots/slide-NN.png.
   - Собирает textContent .slide.active и diff vs deck.slides[n-1] (title/body/bullets).
   - Собирает console errors (page.on('console')) — должно быть 0.
   - Измеряет FPS через Performance API + perfMarks — average ≥ 55.
   - Тестирует reduce-motion emulation (page.emulateMedia).
   - Проверяет все aria-labels на interactive.
3. qa/verification_mechanisms.py — маппинг П5 32/32 для финального HTML (см. verification skill).
4. qa_report.md — markdown отчёт со структурой из CONTRACTS.md §7.2.
5. Запуск: `python qa/verify_html.py --html TrendStudio_LP_Deck_v1.1.1_Interactive.html --out qa_report.md`.

Exit=0 только если: 25/25 slides PASS, console errors 0, diff 0, FPS ≥ 55, all 32 П5 ✅.

Приёмка: qa_report.md создан, все checks зелёные, screenshots на диске.
```

---

## Checklist перед запуском CC

- [ ] Brief_v2.md прочитан.
- [ ] CONTRACTS.md прочитан.
- [ ] skeleton/index.html скопирован как TrendStudio_LP_Deck_v1.1.1_Interactive.html в /Deck_v1.1.1/.
- [ ] deck_content.json и viz_data.json inline-встроены в HTML (делает S26).
- [ ] Фаза A S26→S27→S28→S29 выполнена последовательно.
- [ ] Фаза B S01…S25 запущена (можно параллельно).
- [ ] Фаза C S30 выполнена, qa_report.md зелёный.
- [ ] Commit + tag v1.1.2-deck.
