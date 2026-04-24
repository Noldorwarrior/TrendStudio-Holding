# ПРОМТ: HTML-лендинг ТрендСтудио Холдинг (v1.0)

**Статус:** v1.0 — первая стабильная версия промта для production-готового лендинга ТрендСтудио Холдинг (киноиндустриальный холдинг, якорь 3 000 млн ₽, 7 проектов, 4 стадии pipeline).
**Базируется на:** архитектуре `Промт_HTML_лендинг_ЦПИКП_v5.2.md` (адаптация под киноиндустрию + LP-инвестирование).
**Дата:** 2026-04-19.
**Формат артефакта:** HTML-лендинг (одностраничный сайт, scroll-storytelling), **без жёсткого лимита объёма** (пользователь явно снял ограничение: «хоть 100 ГБ»), сдаётся как Claude Web Artifact типа `text/html` или как offline-файл (`.html` + inline-ассеты).
**Формат доставки промта:** **3 файла** — этот `.md` + `canon_holding_base.json` + `canon_holding_extended.json` в том же каталоге.
**Обязательное требование:** лендинг открывается и корректно работает на **мобильных устройствах** (iOS Safari ≥ 15, Android Chrome ≥ 110) — см. §11 «Mobile-паритет».

---

## §0. Карта родословной и отличий от ЦПИКП v5.2

| Раздел | ЦПИКП v5.2 (образец) | Холдинг v1.0 (этот промт) |
|--------|-----------------------|----------------------------|
| Предметная область | Центр прикладных исследований (образование + наука + бизнес) | **Киноиндустриальный холдинг** (production + distribution + IP + LP-фонд) |
| Источник данных | `canon_v5.1.json` (12 блоков) + `canon_v5.2.json` (18 блоков) | `canon_holding_base.json` (18 блоков) + `canon_holding_extended.json` (22 блока) = **40 блоков** |
| Аудитории | leadership / partners / public | **LP-инвесторы / Стратегические партнёры / Госорганы и институты развития** |
| Секций | 21 | **25** (21 базовая + 4 Holding-специфичных: Pipeline Gallery, Team+Advisory Board, LP-onboarding/Term Sheet, Press carousel) |
| Типов визуализаций | 15+ | **20+** (добавлены: Box-office waterfall, Release-window timeline, Genre mix radar, Tax-credit flow, OTT-vs-Theatrical switch) |
| Time-series | 27 точек (M1-M12 + Y2Q1-Y3Q4 + Y4-Y10) | **Наследуется** + добавлен **weekly box-office run** (до 16 недель проката по проектам) |
| Симуляторов | 4 (KPI, Scenario, Break-even, ROI) | **13 симуляторов**: IRR/MOIC + Scenario Switcher + Monte Carlo + Break-even + LP Commitment Sizer + Box-Office Sensitivity + Pipeline Builder + Stress Test Matrix + Distribution Mix + Term Sheet Simulator + IP Value Estimator + Release Window Optimizer + Theatrical vs OTT + Genre/Tax-Credit Optimizer |
| Лимит объёма | ≤ 10 MB | **Без лимита** (пользователь снял: «хоть 100 ГБ»). Рекомендуемый практический таргет: ≤ 30 MB на всё, чтобы сохранить LCP ≤ 3000 ms на 4G mobile |
| Стиль | MEPhI corporate (синий #003DA5 + золото #FFB81C + dark #0A1628) | **Dark cinematic** (наследует Deck v1.1.2): фон `#0A0A0F`, акценты gold `#D4AF37` / electric blue `#4FC3F7`, granular фильмовый гран |
| Платформы | Desktop-first (mobile — опционально) | **Desktop + Mobile паритет** (обязательное требование пользователя) |
| Доставка | Claude.ai Web Artifact | **Offline single HTML** + SEO/OG-теги + Print-friendly (3 формата, без password-защиты) |
| Верификация | П5 + М4 (7 механизмов) | **П5 «Максимум» 32/32 + М4 Презентационная 7/7** (подтверждено пользователем) |

---

## §1. Архитектура и контекст Холдинга

### §1.1. Что такое ТрендСтудио Холдинг (data baseline)

ТрендСтудио Холдинг — российский киноиндустриальный холдинг, формируемый под LP-фонд размером **3 000 млн ₽** (якорь), с pipeline из **7 проектов** (5 полнометражных фильмов + 2 сериала), распределённых по **4 стадиям** (pre-production / production / post-production / release). Горизонт — 7 лет, TVPI target ≥ 2.0×, IRR target ≥ 20% (Public) / ≥ 24% (Internal).

Baseline-данные для лендинга собираются из **4 источников** (см. §2 ниже):

1. **LP Memo v1.1.0** + **5 Appendices** — текстовая часть (повествование, тезисы, ответы на FAQ инвестора).
2. **Deck v1.1.2** — структурная часть (25 слайдов Interactive HTML, готовая навигация и макеты).
3. **Investor Model v3.0** (Internal + Public) — числовая часть (IRR, MOIC, TVPI, NPV, MC-распределения, pipeline-таблицы, cash-flow).
4. **Finmodel v1.4.4** — якоря (3 000 млн ₽ анкорный tap, 348 тестов, 32/32 П5 «Максимум», MC-движки).

### §1.2. Ключевые якорные цифры (anchor values)

Эти значения канонически фиксированы и **не должны расходиться** между всеми файлами / графиками / симуляторами (М4.7 cross-file integrity):

| Якорь | Значение | Источник |
|-------|----------|----------|
| LP Fund Size | **3 000 млн ₽** | Finmodel v1.4.4 |
| Pipeline count | **7 проектов** (5 фильмов + 2 сериала) | Investor Model v3.0 |
| Stages × projects | **4 × 7 = 28 проект-стадий** (validated 215/215 datapoints) | Investor Model v3.0 |
| IRR Internal (W₅ V-D) | **24.75%** | Investor Model v1.0.1 |
| IRR Public (W₃) | **20.09%** | Investor Model v1.0.1 |
| Monte Carlo p50 IRR Internal | **≈ 13.95%** | Investor Model v1.0.1 |
| Monte Carlo p50 IRR Public | **≈ 11.44%** | Investor Model v1.0.1 |
| Target TVPI / MOIC | ≥ **2.0×** | LP Memo v1.1.0 |
| Horizon | **7 лет** (Y1-Y7) | Finmodel |
| Тесты финмодели | **348/348 PASS** | Finmodel v1.4.4 |

Эти 10 якорей обязаны проходить автоматический ассерт-тест в Фазе 0 (см. §8).

### §1.3. Палитра Dark Cinematic (наследуется из Deck v1.1.2)

Подтверждённый пользователем стиль:

```
--bg-primary: #0A0A0F;       /* основной фон, почти чёрный */
--bg-secondary: #131319;     /* панели, карточки */
--bg-tertiary: #1C1C24;      /* модалки, overlays */
--accent-gold: #D4AF37;      /* главный акцент (цифры, CTA, заголовки) */
--accent-blue: #4FC3F7;      /* вторичный акцент (графики, линки) */
--accent-rose: #E91E63;      /* третичный (alerts, bear-сценарий) */
--text-primary: #F5F5F7;     /* основной текст */
--text-secondary: #A0A0A8;   /* второстепенный */
--text-muted: #6B6B75;       /* подписи, легенды */
--border-subtle: #2A2A32;    /* тонкие рамки */
--grid-line: #1F1F28;        /* grid графиков */
--gradient-hero: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
--glow-gold: 0 0 40px rgba(212, 175, 55, 0.4);
--film-grain: url("data:image/svg+xml;base64,..."); /* inline SVG noise */
```

### §1.4. Шрифты

- **Display (заголовки):** Manrope 700 / 800 — современный sans, хорошо ложится на dark
- **Body (текст):** Inter 400 / 500 / 600 — универсальный, отлично читается на экранах
- **Mono (числа):** JetBrains Mono 500 — для цифр, табличных данных, code-snippets
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`
- Подключение: **inline через @font-face + base64 WOFF2** (для offline-работы)

### §1.5. Технологический стек (tech stack v1.0)

| Слой | Библиотека | Версия | Назначение | Загрузка |
|------|------------|--------|------------|----------|
| Animations | GSAP | 3.12.x | tweens, scroll-driven, text, morphing | **inline** (критическая) |
| Scroll orchestration | ScrollTrigger | 3.12.x | пиннинг, scrub, batch | **inline** (плагин GSAP) |
| Text effects | TextPlugin | 3.12.x | typewriter, text-reveal | **inline** (плагин GSAP) |
| Motion paths | MotionPathPlugin | 3.12.x | SVG-траектории, particle-flow | **inline** (плагин GSAP) |
| Smooth scroll | Lenis | 1.0.x | инерционный скролл desktop+mobile | inline |
| Charts | D3 | v7 | все графики (Sankey, force, chord, radar, choropleth, waterfall, heatmap, funnel, scatter) | **lazy** (первый viewport) |
| 3D | Three.js | r128 | Pipeline 3D-граф, Org 3D-структура | **lazy** (при скролле к §) |
| Intersection | native IntersectionObserver | — | lazy-load, scroll-tracking | inline |

**Обязательная регистрация GSAP:**
```javascript
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);
```

---

## §2. Источники данных: роль и разделение (Data Sourcing)

### §2.1. Принцип разделения ролей

Каждый источник играет одну роль — нельзя смешивать:

| Источник | Роль | Что брать | Что НЕ брать |
|----------|------|-----------|--------------|
| **LP Memo v1.1.0 + 5 Appendices** | Текстовый канон | повествование, thesis, FAQ, цитаты, bios | цифры (приоритет Investor Model v3.0) |
| **Deck v1.1.2 Interactive HTML** | Структурный канон | 25 слайдов → маппинг в секции, порядок блоков, визуальные референсы | вёрстку 1-в-1 (лендинг не slide-deck) |
| **Investor Model v3.0** | Числовой канон | IRR, MOIC, TVPI, NPV, MC-распределения, cash-flow, pipeline-таблицы, сценарии | текстовые описания (приоритет LP Memo) |
| **Finmodel v1.4.4** | Якорный канон | 3 000 млн ₽ tap, 7-летний горизонт, 348 тестов, MC-параметры | всё остальное (это источник sanity-якорей) |

### §2.2. Двухфайловая canon-архитектура

По аналогии с ЦПИКП v5.2 — **две JSON-файла** вместо одного (качество выше за счёт cross-file integrity checks):

| Файл | Блоков | Назначение | Примеры ключей |
|------|--------|------------|-----------------|
| `canon_holding_base.json` | **18** | Текст + структура + базовые цифры | `narrative` (25×3 audience), `pipeline` (7 проектов × 4 стадии), `benchmark` (5 аналогов: Netflix/Disney/Paramount/AMC/Lionsgate), `thesis` (10 тезисов × 3), `team` (5 keys), `advisory_board` (4 members), `risks` (12 + mitigations), `roadmap` (7 лет × milestones), `scenarios` (4: base/bull/bear/stress), `kpi` (5 ролей), `regions` (9 регионов РФ + кинозалы), `faq` (15×3), `press_quotes` (8), `distribution` (5 каналов), `deal_structure` (LP/GP/waterfall), `tax_credits` (РФ + регионы), `term_sheet` (MFN/LP rights), `jurisdiction_notes` |
| `canon_holding_extended.json` | **22** | Визуализации + интерактив + формулы + MC | `time_series` (7 лет × 15 метрик × 27 точек), `weekly_box_office` (16 недель × 5 фильмов + 2 сериала × сценарий), `segmentations` (5: by_genre / by_stage / by_distribution / by_region / by_LP_tier), `networks` (Sankey cash-flow, Force-graph partners, Chord genre-distribution), `radar_benchmark` (8 осей × 5 аналогов), `bubble_deals` (7 проектов: budget × revenue × IRR), `pipeline_3d_structure` (7 проектов × XYZ + стадии), `monte_carlo` (1000 прогонов × 5 драйверов → IRR/NPV/MOIC/break-even/recovery), `heatmaps` (3: NPV-sensitivity 9×9, box-office × release-window 5×8, risk 5×5), `waterfall` (3: costs_y1, costs_y7, LP-waterfall GP/LP split), `funnel` (dealflow 6 stages), `choropleth_rf` (15 регионов × box-office potential), `ip_portfolio` (7 IP × 5 revenue streams: theatrical / streaming / merch / licensing / sequel), `box_office_runs` (week-by-week декомпозиция × сценарий × фильм), `distribution_mix` (5 каналов × цены × доли), `tax_credit_flows` (7 проектов × РФ+регион × схемы), `release_windows` (4 окна × 5 фильмов × доходность), `animation_catalog` (35 паттернов: 12 scroll + 12 chart + 11 interaction), `interaction_rules` (38 элементов × 100% покрытия), `simulators` (13 формул), `ott_vs_theatrical` (break-even matrix), `genre_tax_mix` (жанр × субсидия × ROI) |

### §2.3. Правило встраивания в HTML

**Агент обязан:**

1. Прочитать оба файла canon в Фазе 0 (проверить парсинг каждого).
2. Встроить оба в HTML отдельными тегами:
   ```html
   <script id="canon-base" type="application/json">
     {{полное содержимое canon_holding_base.json}}
   </script>
   <script id="canon-extended" type="application/json">
     {{полное содержимое canon_holding_extended.json}}
   </script>
   ```
3. В JS объединить в единый namespace:
   ```javascript
   const canonBase = JSON.parse(document.getElementById('canon-base').textContent);
   const canonExt = JSON.parse(document.getElementById('canon-extended').textContent);
   const canon = { ...canonBase, ...canonExt, _meta: { ...canonBase._meta, ...canonExt._meta } };
   // При коллизиях _meta — приоритет у extended.
   ```
4. **Не копировать** содержимое ни одного файла в разметку — только через `bindCanon()` или прямое чтение `canon.*`.

### §2.4. Проверка коллизий и sanity-check

```javascript
// Коллизии верхнего уровня (кроме _meta)
const baseKeys = new Set(Object.keys(canonBase).filter(k => k !== '_meta'));
const extKeys = new Set(Object.keys(canonExt).filter(k => k !== '_meta'));
const collisions = [...baseKeys].filter(k => extKeys.has(k));
console.assert(collisions.length === 0, 'Canon key collisions: ' + collisions.join(','));

// Якоря Holding (§1.2)
console.assert(canon.fund.lp_size_mln_rub === 3000, 'Anchor: fund 3000 mln ₽');
console.assert(canon.pipeline.projects.length === 7, 'Anchor: 7 проектов');
console.assert(canon.pipeline.stages.length === 4, 'Anchor: 4 стадии');
console.assert(canon.returns.irr_internal_w5vd === 24.75, 'Anchor: IRR Internal 24.75%');
console.assert(canon.returns.irr_public_w3 === 20.09, 'Anchor: IRR Public 20.09%');
console.assert(canon.monte_carlo.total_runs === 1000, 'Anchor: MC 1000 runs');
console.assert(canon.monte_carlo.p50_irr_internal >= 13.5 && canon.monte_carlo.p50_irr_internal <= 14.5, 'Anchor: MC p50 IRR Internal ~13.95');
console.assert(canon.finmodel.tests_passed === 348, 'Anchor: 348 тестов PASS');
console.assert(canon.horizon.years === 7, 'Anchor: 7-летний горизонт');

// Покрытие
console.assert(canon.interaction_rules.rule_coverage_pct === 100, 'Coverage must be 100%');
console.assert(canon.interaction_rules.element_requirements.length >= 38, 'Min 38 element types');
console.assert(canon.animation_catalog.scroll_animations.length === 12, '12 scroll animations');
console.assert(canon.animation_catalog.chart_animations.length === 12, '12 chart animations');
console.assert(canon.animation_catalog.interaction_patterns.length === 11, '11 interaction patterns');

// Pipeline integrity (4 стадии × 7 проектов = 28 datapoints)
const dp = canon.pipeline.stage_project_matrix.flat().length;
console.assert(dp === 28, `Pipeline matrix: ${dp}/28 datapoints`);
```

Если любой assert падает — в hero показать `«Ошибка canon: sanity-check failed ({детали})»`, инициализацию остановить.

---

## §3. 25 секций лендинга (структура + audience-switcher)

### §3.1. Базовые 21 секция (наследуется из ЦПИКП-архитектуры, адаптация под Holding)

| # | Секция | Основная цель | Источник текста | Главная визуализация |
|---|--------|---------------|-----------------|----------------------|
| 1 | **Hero** | Якорь 3 000 млн ₽ + ключевые KPI | `narrative.hero` | Animated counter-up + 3D holographic film-reel |
| 2 | **Thesis** | 3-5 главных тезисов | `narrative.thesis` | Stagger fade-in cards + hover-reveal |
| 3 | **Market Context** | Почему сейчас (РФ кинорынок) | `narrative.market` | Choropleth РФ (box-office potential по 15 регионам) |
| 4 | **Benchmark** | Сравнение с аналогами | `benchmark` | Radar 8 осей × 5 студий (Netflix / Disney / Paramount / AMC / Lionsgate) |
| 5 | **Our Model** | Business model holding | `narrative.model` | Force-graph (холдинг-структура: studios / distribution / IP / fund) |
| 6 | **Org Structure** | Команда + Advisory | `team` + `advisory_board` | 3D org-tree (Three.js) |
| 7 | **Financial Core** | IRR / MOIC / TVPI | `returns` | Time-series 27 точек × 4 сценария + scrub |
| 8 | **Capital Structure** | LP / GP / waterfall | `deal_structure` | Sankey cash-flow (LP → GP → distributions) |
| 9 | **Monte Carlo** | Risk-adjusted returns | `monte_carlo` | Histogram p10/p25/p50/p75/p90 + parallel-coords |
| 10 | **Cash Flow Timeline** | Capital calls / distributions | `time_series.cashflow` | Waterfall + кумулятивная кривая |
| 11 | **Scenarios** | Base / Bull / Bear / Stress | `scenarios` | Scenario-switcher (морфинг графиков) |
| 12 | **KPI Cascade** | KPI команды → фонда | `kpi` | Chord diagram + CRM funnel |
| 13 | **Geography** | Региональные налог. льготы | `regions` + `tax_credits` | Choropleth + bubble overlay |
| 14 | **Roadmap** | 7-летний план | `roadmap` | Horizontal timeline + milestones reveal |
| 15 | **Unit Economics** | Cost / revenue per project | `pipeline.unit_econ` | Stacked bars + bubble |
| 16 | **Distribution** | Каналы (theatrical/OTT/TV/licensing/merch) | `distribution` | Donut + stacked по каналам |
| 17 | **Risks** | 12 рисков + mitigations | `risks` | Heatmap 5×5 probability × impact |
| 18 | **Synergy** | Инфраструктурный эффект | `narrative.synergy` | Sankey value-chain + parallel-coords |
| 19 | **ESG + Impact** | Индустрия, рабочие места | `narrative.esg` | Bubble + choropleth overlay |
| 20 | **FAQ** | 15 вопросов × 3 audience | `faq` | Accordion + search |
| 21 | **CTA / Contact** | Contact + NDA + next steps | `narrative.cta` | Form + calendar embed (static) |

### §3.2. 4 Holding-специфичных секции (добавлены пользователем)

| # | Секция | Назначение | Источник | Главная визуализация |
|---|--------|-----------|----------|----------------------|
| 22 | **Pipeline Gallery** | 7 проектов с полными карточками | `pipeline.projects` + `ip_portfolio` | 7 film-poster cards + modal drilldown + box-office run animation |
| 23 | **Team + Advisory Board** | Расширенные bio + фото + track-record | `team` + `advisory_board` | Grid cards + Three.js 3D org-tree (опционально, см. §6) |
| 24 | **LP Onboarding + Term Sheet** | Процесс + MFN + commitment sizing | `deal_structure` + `term_sheet` + sim | Interactive stepper + Term Sheet Simulator |
| 25 | **Press Carousel** | Упоминания в прессе + цитаты | `press_quotes` | GSAP carousel с auto-scroll + click-to-expand |

### §3.3. Audience-switcher (3 аудитории)

Пользователь переключает режим через `<select>` или кнопки в sticky header:

| Режим | Аудитория | Что меняется | Источник |
|-------|-----------|--------------|----------|
| **LP** (default) | LP-инвесторы | Financial-first: IRR, MOIC, TVPI, MC, waterfall, Term Sheet | `narrative.*.lp` |
| **Partners** | Стратегические партнёры (Yandex, VK, Kion, Okko, театральные сети) | Synergy-first: distribution, IP, co-production, co-investment | `narrative.*.partners` |
| **Government** | Госорганы и институты развития (Фонд кино, Минкульт, ИРИ, РФПИ) | Impact-first: рабочие места, регионы, налог. поступления, ESG | `narrative.*.government` |

Переключение не перезагружает страницу — только текст через `bindCanon()` и цветовой акцент (LP=gold, Partners=blue, Gov=emerald).

---

## §4. Каталог 20+ типов визуализаций

| # | Тип | Ключ canon | Секция | Библиотека |
|---|-----|------------|--------|------------|
| 1 | **Sankey** (cash-flow LP→GP) | `networks.sankey_cash_flow` | §8 Capital | D3 v7 + d3-sankey |
| 2 | **Force-graph** (holding structure) | `networks.force_graph_partners` | §5 Model | D3 v7 force |
| 3 | **Chord** (genre × distribution) | `networks.chord_genre_distro` | §12 KPI Cascade | D3 v7 chord |
| 4 | **Radar 8 осей** (benchmark) | `radar_benchmark` | §4 Benchmark | D3 v7 polar |
| 5 | **Bubble + scatter** (budget × IRR × stage) | `bubble_deals` | §15 Unit Econ | D3 v7 |
| 6 | **3D Pipeline Graph** (7 проектов × stage) | `pipeline_3d_structure` | §22 Pipeline | Three.js r128 |
| 7 | **3D Org Tree** (опционально) | `org_3d_structure` | §6 Org / §23 Team | Three.js r128 |
| 8 | **Monte Carlo histogram** | `monte_carlo.histograms.irr` | §9 MC | D3 v7 histogram |
| 9 | **Parallel coordinates** (MC drivers) | `monte_carlo.parallel_coords_samples` | §9 MC | D3 v7 |
| 10 | **Choropleth РФ** (box-office by region) | `choropleth_rf` | §3 Market / §13 Geo | D3 v7 + GeoJSON |
| 11 | **Waterfall × 3** (costs_y1, costs_y7, LP-waterfall) | `waterfall.*` | §10 Cash Flow / §8 Capital | D3 v7 |
| 12 | **CRM funnel** (dealflow) | `funnel.dealflow` | §12 KPI | D3 v7 |
| 13 | **Heatmap NPV 9×9** | `heatmaps.npv_sensitivity` | §7 Financial | D3 v7 grid |
| 14 | **Heatmap box-office × release-window 5×8** | `heatmaps.box_office_release` | §22 Pipeline | D3 v7 grid |
| 15 | **Heatmap рисков 5×5** | из `risks` | §17 Risks | D3 v7 grid |
| 16 | **Time-series 27 точек × 4 сценария** | `time_series.scenarios.*` | §7 Financial | D3 v7 + ScrollTrigger scrub |
| 17 | **Weekly box-office run** (16 недель × 7 проектов) | `weekly_box_office` | §22 Pipeline | D3 v7 + GSAP |
| 18 | **Donut / stacked** (segmentations) | `segmentations` | §3, §15, §16 | D3 v7 arc/stack |
| 19 | **Horizontal timeline** (roadmap + milestones) | `roadmap` | §14 Roadmap | SVG + GSAP MotionPath |
| 20 | **Genre Mix Radar + Tax-Credit Flow** | `genre_tax_mix` + `tax_credit_flows` | §13 Geography | D3 v7 polar + Sankey |
| 21 | **Release-window Gantt** | `release_windows` | §22 Pipeline | D3 v7 timeline |
| 22 | **Film-poster cards + modal drilldown** | `pipeline.projects` | §22 Pipeline | HTML/CSS + GSAP Flip |

Минимум **20 типов** из этого списка обязательны. 2 опциональных (3D Org Tree, Release-window Gantt).

---

## §5. 13 симуляторов (интерактивные калькуляторы)

В `canon.simulators` — 13 формул. Агент реализует **все 13**. Это главное требование пользователя — симуляторы дают LP «живую модель».

| # | Симулятор | Входы | Формула (ядро) | Визуализация результата |
|---|-----------|-------|----------------|--------------------------|
| 1 | **IRR / MOIC Calculator** | horizon (5-10 yr), discount rate (8-18%), commitment size (50-500 млн ₽) | NPV/IRR loop по cash-flow | Time-series + kumulative curve + KPI-цифры |
| 2 | **Scenario Switcher** | 1 из 4 (base/bull/bear/stress) | lookup в `canon.scenarios` | Морфинг всех графиков §7 через GSAP tween |
| 3 | **Monte Carlo Simulator** | N_runs (100/500/1000), 5 драйверов (sliders) | Распределения из `canon.monte_carlo.driver_distributions` | Histogram + parallel-coords live-update |
| 4 | **Break-even Slider** | cost inflation (0-20%), pipeline delay (0-18 мес) | `be = base + cost*k1 + delay*k2` | Анимированный break-even marker на timeline |
| 5 | **LP Commitment Sizer** | Tier (Micro 50 / Small 100 / Medium 250 / Large 500 / Mega 1000 млн ₽) | fee_tier × size × years | Table: fees, distributions, net IRR |
| 6 | **Box-Office Sensitivity** | Opening weekend ±50%, drop-rate ±30%, screens (500-4000) | weekly run = opening × drop^week × screens | Weekly chart + total revenue |
| 7 | **Pipeline Builder** | drag-and-drop 7 проектов в 4 стадии | pipeline impact на cash-flow | Live обновление §22 Pipeline + §10 Cash Flow |
| 8 | **Stress Test Matrix** | 3 стресса × 3 уровня = 9 сценариев | MC subset | Heatmap 3×3 IRR outcomes |
| 9 | **Distribution Mix** | Slider-доли theatrical/OTT/TV/licensing/merch (sum=100%) | revenue = Σ(share × price × reach) | Stacked bar + donut live-update |
| 10 | **Term Sheet Simulator** | waterfall tier (pref=8%), carry (20%), catch-up (100%) | LP vs GP split по waterfall | Waterfall chart + breakdown table |
| 11 | **IP Value Estimator** | Project × 5 revenue streams (theatrical/streaming/merch/licensing/sequel) + multiples | Σ(stream_revenue × multiple) | Stacked bars × IP + total valuation |
| 12 | **Release Window Optimizer** | Choose window (Jan-Feb / May-Jun / Oct-Nov / Dec) × screens × competition-index | window_boost × opening × competition_penalty | Heatmap 5 фильмов × 4 окна + recommended window |
| 13 | **Theatrical vs OTT Switch + Genre/Tax Optimizer** | Per-project: theatrical-only / OTT-direct / hybrid + выбор жанра + регион tax credit | revenue_diff = (theatrical_net − OTT_net) + tax_credit(region, genre) | Break-even matrix + recommended path + ROI delta |

**Каждый симулятор обязан:**
1. Иметь свою секцию в UI (в рамках соответствующей § из §3) с `<fieldset>` входов и `<div>` результата.
2. Пересчитывать результат **live** (debounced 100 ms) при любом input change.
3. Сохранять состояние в URL hash (без localStorage — см. запреты §7) для sharing.
4. Работать на mobile (touch-friendly sliders, larger tap-targets ≥ 44 px).

---

## §6. Правило 100% интерактивности и анимации

### §6.1. Базовое требование

**Каждый визуальный элемент на каждой секции обязан иметь:**
1. **Анимацию появления** при попадании в viewport (scroll-driven, минимум 1 паттерн из `canon.animation_catalog.scroll_animations`).
2. **Интерактивный отклик** на действие пользователя (hover / click / drag / scroll / focus — минимум 1 паттерн из `canon.animation_catalog.interaction_patterns`).

Источник: `canon.interaction_rules.rule_coverage_pct === 100`.

### §6.2. 38 типов элементов (element_requirements)

Примеры пар «анимация + интерактив»:

| Элемент | Обязательная анимация | Обязательный интерактив |
|---------|-----------------------|--------------------------|
| KPI-число | counterUp (0 → target за 1.5с) | hover → tooltip с методикой |
| Film-poster card (Pipeline) | staggerFadeIn + GSAP Flip | click → modal drilldown |
| Time-series график | drawPath за 2с | scroll-scrub + hover crosshair |
| 3D pipeline graph | orbitSpin при входе | drag → ручное вращение + click узла → pin |
| Sankey cash-flow | flowParticles | hover на поток → подсветка цепочки |
| Monte Carlo histogram | barGrow | slider N_runs → live re-draw |
| Weekly box-office run | barsCascade | hover week → tooltip + пересчёт total |
| Radar benchmark | polarSpin | click ось → drilldown с объяснением |
| Term Sheet steps | stepperReveal | click шаг → expand с формулой |
| Press carousel | autoScroll | hover → pause + click → modal quote |

Полный каталог — 38 типов в `canon.interaction_rules.element_requirements`.

### §6.3. Self-check покрытия (Фаза 7)

- **N_elements** = `document.querySelectorAll('.viz-element').length`
- **N_with_animation** = `document.querySelectorAll('[data-animated="true"]').length`
- **N_with_interaction** = `document.querySelectorAll('[data-interactive="true"]').length`

Критерий: `N_with_animation === N_elements` И `N_with_interaction === N_elements`.

### §6.4. Исключения — только `prefers-reduced-motion`

При `prefers-reduced-motion: reduce` анимации приглушаются (длительности → 150 ms, эффекты → fade-only), интерактив сохраняется 100%.

---

## §7. Критерии приёмки (60+) и запреты (22)

### §7.1. Критерии приёмки (60 критериев + 10 Holding-специфичных = 70)

Базовые 60 наследуются из архитектуры ЦПИКП v5.2 (§5 оригинала). Ниже 10 Holding-специфичных:

**61. Anchor integrity.** 10 якорей §1.2 (3000 млн, 7 проектов, 4 стадии, 28 datapoints, 24.75%, 20.09%, 13.95%, 348 тестов, 7 лет, 2.0× MOIC) проходят automated assert на старте (§2.4).

**62. 13 simulators implemented.** Все 13 симуляторов из §5 работают, принимают ввод, обновляют результат live, сохраняют state в URL.

**63. 25 sections rendered.** 21 базовая + 4 Holding-специфичных. Каждая — со своим `<section id="sec-N">` и пунктом в side-dots navigation.

**64. Audience-switcher (3 модa).** Переключение LP / Partners / Gov меняет минимум 80% текста (через `bindCanon()`) и акцентный цвет header.

**65. Mobile parity.** Все секции и симуляторы работают на iOS Safari ≥ 15 и Android Chrome ≥ 110. Touch-targets ≥ 44×44 px. См. §11 ниже.

**66. Offline-ready.** Лендинг открывается без интернета из local file. Все ассеты inline (WOFF2 через base64 + inline SVG + inline GeoJSON для Choropleth).

**67. SEO + OG-tags.** `<title>`, `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:image`), Twitter Card. JSON-LD schema для Organization + Investment Fund.

**68. Print-friendly.** `@media print` — корректно печатается на A4 (25 страниц, 1 секция = 1+ страниц), все тёмные фоны → белые, графики → outline-SVG.

**69. Dark cinematic style.** Палитра §1.3 соблюдается. Film-grain noise применён. Gold accents на KPI и CTA.

**70. Performance on 4G mobile.** LCP ≤ 3000 ms, TTI ≤ 4500 ms, total blocking time ≤ 400 ms. Lazy-load: D3 (первый viewport §3), Three.js (при скролле к §6 или §22), Monte Carlo (при клике на §9).

### §7.2. 22 запрета (наследуются 1-в-1 из ЦПИКП v5.2 §6)

1. Нет `eval()`, `new Function()`, `setTimeout(string)`.
2. Нет `localStorage` / `sessionStorage` (нарушение Artifacts restriction).
3. Нет внешних скриптов / CDN (всё inline для offline).
4. Нет хардкода цифр вне `canon.*`.
5. Нет хардкода текста вне `canon.narrative.*`.
6. Нет хардкода интерактивов / анимаций вне `canon.animation_catalog` и `canon.interaction_rules` (запрет №22 ЦПИКП v5.2).
7. Нет inline-стилей (только через `<style>` или классы; исключение — dynamic computed).
8. Нет дубликатов ключей в canon (коллизии — остановка).
9. Нет смешивания источников данных (§2.1: LP Memo = текст, Investor Model = числа; перекрёстные записи запрещены).
10. Нет использования `document.write`.
11-22: остальные 12 — стандартные security/quality правила (см. ЦПИКП v5.2 §6 в образце).

---

## §8. Верификация П5 «Максимум» 32/32 + М4 Презентационная 7/7

### §8.1. М4 Презентационная (7 механизмов)

| # | Механизм | Применение к Holding |
|---|----------|----------------------|
| М4.1 | Точный перенос цифр | Все 10 якорей §1.2 + все числа из Investor Model v3.0 сохранены ±0% (исключение — MC, где допустимо ±2% на округление) |
| М4.2 | Критерии приёмки | 70/70 выполнены (60 базовых + 10 Holding) |
| М4.3 | Секция = слот | 25 секций = 25 slot в narrative = соответствие Deck v1.1.2 (25 слайдов) 1-в-1 |
| М4.4 | Audience-switcher + Lite-mode | 3 audience-режима работают, якоря §1.2 неизменны между режимами |
| М4.5 | Responsive breakpoints | Desktop ≥ 1440 / Tablet 768-1439 / Mobile 320-767 проверены через DevTools + реальный iOS Safari + Android Chrome |
| М4.6 | Cross-file integrity v1.0 | canon_holding_base.json загружен, sanity-check §2.4 пройден |
| М4.7 | Cross-file integrity Holding | canon_holding_base ↔ canon_holding_extended согласованы; 10 якорей §1.2 совпадают между 4 источниками (§2.1: LP Memo, Deck, Investor Model, Finmodel) |

### §8.2. П5 «Максимум» (32 механизма)

Пользователь подтвердил — выполнить **все 32** механизма. Группы:

1. **Фактологические (№1-4):** точный перенос цифр/дат/имён + выполнение запроса + сверка сумм + границы.
2. **Формат (№5, 8, 9):** формат документа (HTML валиден W3C), формат секций, согласованность HTML ↔ canon.
3. **Хронология и противоречия (№6-7):** roadmap-хронология consistent, нет противоречий между секциями.
4. **Логические (№10-17, 30):** скрытые допущения, парадоксы, обратная логика, декомпозиция, уверенность, полнота, спор за/против, граф причин-следствий, стресс-тест.
5. **Источники (№18-19, 28):** триангуляция (4 источника §2.1), цепочка происхождения, эпистемический статус.
6. **Числовые (№20, 23):** двойной расчёт ключевых метрик (IRR по DCF и по MC), метаморфическое тестирование.
7. **Документ (№21, 22, 24, 25, 26, 29, 32):** сверка вход-выход, согласованность файлов, diff было/стало, защита от регрессии, дрейф смысла, кросс-модальная проверка, ссылочная целостность.
8. **Аудитория (№27, 31):** моделирование аудитории (LP/Partners/Gov), проверка адресата.

Отчёт — в конце HTML как `<!-- VERIFICATION REPORT -->` блок.

### §8.3. VERIFICATION REPORT шаблон

```html
<!-- ================================================================
VERIFICATION REPORT — Промт v1.0 Лендинг ТрендСтудио Холдинг
Pass: П5 Максимум (32/32) + М4 Презентационная (7/7)
Date: {{DATE}}
Canon sources:
  - canon_holding_base.json v{{base._meta.version}} ({{base._meta.date}}) — 18 блоков
  - canon_holding_extended.json v{{ext._meta.version}} ({{ext._meta.date}}) — 22 блока
Total canon blocks: 40/40 loaded

М4.1 ✓ Anchor integrity: 10/10 якорей из §1.2 проходят assert
М4.2 ✓ Критерии приёмки: 70/70 выполнены
М4.3 ✓ 25 секций = 25 slot в narrative = 25 слайдов Deck v1.1.2 (1-в-1)
М4.4 ✓ Audience-switcher (LP/Partners/Gov) + якоря неизменны
М4.5 ✓ Responsive: desktop/tablet/mobile iOS+Android проверены
М4.6 ✓ canon_holding_base sanity-check: OK
М4.7 ✓ Cross-file integrity (base ↔ extended ↔ 4 source canons): 15/15 OK

Coverage:
  - N_elements = {{N_elements}}
  - N_with_animation = {{N_with_animation}}/{{N_elements}} = 100%
  - N_with_interaction = {{N_with_interaction}}/{{N_elements}} = 100%
  - N_viz_types = {{N_viz_types}}/22
  - N_simulators = 13/13

Performance:
  - LCP desktop: {{}} ms (лимит 2500)
  - LCP 4G mobile: {{}} ms (лимит 3000)
  - TTI: {{}} ms (лимит 4500)
  - FPS 60: {{ok/fail}}
  - Total assets: {{}} MB

Accessibility AA:
  - Контраст ≥ 4.5:1 (текст), ≥ 3:1 (графики): {{ok/fail}}
  - Keyboard nav (Tab/Enter/Arrows): {{ok/fail}}
  - aria-label на всех интерактивных зонах: {{ok/fail}}
  - prefers-reduced-motion: {{ok/fail}}

Mobile parity:
  - iOS Safari 15+: {{ok/fail}}
  - Android Chrome 110+: {{ok/fail}}
  - Touch targets ≥ 44 px: {{ok/fail}}
  - Landscape+portrait: {{ok/fail}}

П5.1-32: [подробный чек-лист]

Найденные проблемы: ...
Уровень уверенности: {{%}}
================================================================ -->
```

---

## §9. Порядок выполнения (Фазы 0-7)

### Фаза 0 — Чтение и sanity (9 шагов)

1. Прочитать `canon_holding_base.json` полностью (18 блоков, `_meta.version === "v1.0"`).
2. Прочитать `canon_holding_extended.json` полностью (22 блока, `_meta.extends === "base v1.0"`).
3. Проверить коллизии ключей (§2.3). При коллизии — остановка.
4. Проверить 10 якорей §1.2 (assert). При провале — остановка.
5. Проверить cross-file integrity базовый (§2.4). При провале — остановка.
6. Прочитать `Промт_HTML_лендинг_Холдинг_v1.0.md` (этот файл).
7. Выписать 35 паттернов из `canon.animation_catalog` (12+12+11).
8. Спроектировать архитектуру:
   - `<head>`: inline CSS + inline @font-face (WOFF2 base64) + 2 `<script type="application/json">` (canon-base, canon-extended) + SEO/OG-теги + JSON-LD.
   - `<body>`: `<header>` (audience-switcher + side-dots nav) + **25** `<section>` + `<footer>` + `<div id="modals-root">` + `<div id="simulators-root">`.
   - Критические библиотеки (GSAP + 3 plugins + Lenis) — inline.
   - D3 v7 + Three.js r128 — **lazy** (IntersectionObserver → загрузка inline Blob URL при первом попадании в соотв. section).
   - `<style>` для Dark cinematic (§1.3 палитра + film-grain SVG noise inline).
9. **Self-check Ф0:** ☑ оба canon + коллизий нет + 10 якорей OK + 4-source cross-check OK + архитектура + lazy-loading.

### Фаза 1 — Скелет HTML + header + sections

1. Построить 25 `<section>` с уникальными `id`.
2. Side-dots nav справа (desktop) / hamburger (mobile).
3. Sticky header с audience-switcher (3 кнопки / `<select>` на mobile).
4. Cmd+K / Ctrl+K — поиск по всем секциям и FAQ.

### Фаза 2 — Заполнение контентом из canon + 100% coverage animation/interaction

1. `bindCanon()` — для каждой секции из `canon.narrative.section_N_*`.
2. Для **каждого** визуального элемента:
   - Найти в `canon.interaction_rules.element_requirements` (38 типов).
   - Применить анимацию из `canon.animation_catalog.scroll_animations` (12) или `chart_animations` (12).
   - Применить интерактив из `canon.animation_catalog.interaction_patterns` (11).
3. Добавить `data-animated="true"` и `data-interactive="true"` на каждый элемент.

### Фаза 3 — Реализация 22 визуализаций

| Порядок | Визуализация | Данные | Библиотека |
|---------|--------------|--------|------------|
| 1 | Time-series 4 сценария × 15 метрик × 27 точек | `time_series.scenarios` | D3 v7 + GSAP scrub |
| 2 | Donut / stacked по 5 сегментациям | `segmentations` | D3 v7 |
| 3 | Sankey cash-flow LP→GP | `networks.sankey_cash_flow` | D3 v7 + d3-sankey |
| 4 | Force-graph holding structure | `networks.force_graph_partners` | D3 v7 force |
| 5 | Chord genre×distribution | `networks.chord_genre_distro` | D3 v7 chord |
| 6 | Radar benchmark 8 осей × 5 аналогов | `radar_benchmark` | D3 v7 polar |
| 7 | Bubble deals (7 проектов) | `bubble_deals` | D3 v7 |
| 8 | 3D Pipeline graph (7×4) | `pipeline_3d_structure` | Three.js r128 |
| 9 | Monte Carlo histogram + parallel-coords | `monte_carlo` | D3 v7 |
| 10 | Choropleth РФ 15 регионов | `choropleth_rf` | D3 v7 + inline GeoJSON |
| 11 | Waterfall × 3 (costs_y1, costs_y7, LP-waterfall) | `waterfall.*` | D3 v7 |
| 12 | CRM funnel dealflow | `funnel.dealflow` | D3 v7 |
| 13-15 | Heatmaps (NPV 9×9, box-office×window 5×8, risks 5×5) | `heatmaps.*` + `risks` | D3 v7 grid |
| 16 | Weekly box-office run (16 нед × 7 проектов) | `weekly_box_office` | D3 v7 + GSAP |
| 17 | Horizontal timeline roadmap | `roadmap` | SVG + GSAP MotionPath |
| 18 | Genre-mix radar + Tax-credit Sankey | `genre_tax_mix` + `tax_credit_flows` | D3 v7 |
| 19 | Release-window Gantt | `release_windows` | D3 v7 timeline |
| 20 | Film-poster cards + modal drilldown | `pipeline.projects` | HTML/CSS + GSAP Flip |
| 21 | 3D Org Tree (опционально) | `org_3d_structure` | Three.js r128 |
| 22 | Press carousel | `press_quotes` | GSAP |

### Фаза 4 — 13 симуляторов

Реализация по списку §5. Каждый — с live-update, URL-state, mobile-touch.

### Фаза 5 — Audience-switcher + Modals + Lite-mode

1. Переключение LP/Partners/Gov через `bindCanon(audience)` + акцентный цвет.
2. Модалки для drilldown (project cards, risk details, FAQ answers, press quotes).
3. Lite-mode (прячет 3D и parallel-coords для слабых устройств), кнопка в footer.

### Фаза 6 — Mobile parity + Offline + SEO + Print

1. **Mobile**: breakpoints 320/768/1024/1440, touch-targets 44px, single-column для mobile, simplified 3D (2D fallback через CSS transforms), swipe navigation.
2. **Offline**: inline всё (WOFF2 base64, SVG, GeoJSON, GSAP/D3/Three.js как inline scripts).
3. **SEO**: `<title>`, meta description, Open Graph, Twitter Card, JSON-LD schema (Organization + InvestmentFund).
4. **Print**: `@media print` — 25 страниц A4, dark → light, графики → outline SVG.

### Фаза 7 — Self-check + Verification Report

1. Посчитать покрытие (§6.3). Если < 100% — вернуться в Ф2-3.
2. Прогнать М4.1-М4.7 (§8.1).
3. Прогнать П5.1-32 (§8.2).
4. Проверить performance (LCP/TTI на 4G mobile через DevTools Throttling).
5. Проверить a11y (aria, keyboard, contrast через axe DevTools или manual).
6. Записать `<!-- VERIFICATION REPORT -->` (§8.3).

---

## §10. Mobile-паритет (обязательное требование)

Пользователь явно указал: **лендинг обязан открываться на мобильных устройствах (iOS + Android)**. Стратегия:

### §10.1. Breakpoints

| Breakpoint | Ширина | Стратегия |
|------------|--------|-----------|
| Mobile S | 320-479 px | Single column, simplified 3D → 2D fallback, swipe navigation |
| Mobile L | 480-767 px | Single column, touch-friendly sliders, side-dots → bottom bar |
| Tablet | 768-1023 px | 2-col для некоторых секций, 3D работает на A-graded iPad |
| Desktop S | 1024-1439 px | Full desktop layout |
| Desktop L | 1440+ px | Full desktop + max-width 1600 |

### §10.2. Graceful degradation для 3D

На mobile с низкой GPU-производительностью (detection через `navigator.deviceMemory < 4` или `WebGL renderer detection`):
- **Three.js scenes (§6, §22)** → 2D fallback (SVG static с hover state).
- **Monte Carlo parallel-coords** → упрощённая версия (10 сэмплов вместо 1000 визуально).
- Все симуляторы — работают полностью (live-compute), но результат в упрощённой визуализации.

### §10.3. Touch-оптимизация

- Все tap-targets ≥ 44×44 px (Apple HIG).
- Sliders — native `<input type="range">` с CSS-стилизацией (лучше touch-UX чем кастомные).
- Swipe-left/right для carousel (GSAP Draggable + Inertia или native touch-events).
- Drag-and-drop в Pipeline Builder (№7) — работает через Pointer Events API (унифицирует mouse + touch).

### §10.4. Lenis smooth-scroll на mobile

Lenis поддерживает mobile, но на iOS Safari могут быть подёргивания. Решение: `lenis.options.smoothTouch = false` — на touch-устройствах используется native scroll (без инерции Lenis), смотрится органичнее.

### §10.5. Тестирование

Обязательно:
- iOS Safari 15+ (iPhone 11+, iPad Air)
- Android Chrome 110+ (Pixel 5+, Samsung Galaxy S21+)
- Landscape + Portrait orientations
- Low-end mode (Chrome DevTools Performance throttling 4× CPU)

---

## §11. Доставка: Offline HTML + SEO + Print-friendly

Пользователь выбрал **3 формата из 4** (без password-защиты):

### §11.1. Offline single HTML

- Один файл `ТрендСтудио_Холдинг_Лендинг_v1.0.html`.
- Все ассеты inline (шрифты base64, SVG, GeoJSON, JS-библиотеки).
- Работает без интернета (открыть в браузере двойным кликом).
- Рекомендуемый таргет размера: **≤ 30 MB** (для комфортной загрузки).

### §11.2. SEO + OG-tags

В `<head>`:
```html
<title>ТрендСтудио Холдинг — LP Fund 3 000 млн ₽ | 7 проектов, IRR 24.75%</title>
<meta name="description" content="Российский киноиндустриальный холдинг. Fund 3 млрд ₽, IRR 24.75% (Internal) / 20.09% (Public), 7 проектов, 4 стадии pipeline, 7-летний горизонт.">
<meta property="og:title" content="ТрендСтудио Холдинг — Инвестиционный меморандум">
<meta property="og:description" content="LP Fund 3 000 млн ₽. 7 проектов, IRR 24.75%, TVPI ≥ 2.0×.">
<meta property="og:image" content="data:image/png;base64,...">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ТрендСтудио Холдинг",
  "description": "Киноиндустриальный холдинг РФ с LP-фондом 3 000 млн ₽",
  "foundingDate": "2026",
  "industry": "Film Production"
}
</script>
```

### §11.3. Print-friendly

`@media print` правила:
- Тёмный фон → белый, gold → чёрный на белом.
- Все графики переходят в outline SVG (без fill, только stroke).
- Pagebreak перед каждой секцией (`page-break-before: always`).
- Скрыть: audience-switcher, симуляторы inputs, side-dots nav, footer CTA-кнопки.
- Показать: все цифры, все таблицы, все outline-графики.
- Target: 25 печатных страниц A4 (1 секция = 1-2 страниц).

---

## §12. Формат сдачи пользователю

### §12.1. Что Claude получает на вход

3 файла в одном каталоге:
- `Промт_HTML_лендинг_Холдинг_v1.0.md` (этот промт)
- `canon_holding_base.json` (18 блоков)
- `canon_holding_extended.json` (22 блока)

Плюс 4 источника (§2.1): LP Memo v1.1.0 + 5 Appendices, Deck v1.1.2 HTML, Investor Model v3.0 (Internal + Public), Finmodel v1.4.4.

### §12.2. Что Claude сдаёт на выход

1. **Короткий summary** (5-7 строк):
   > Готов лендинг ТрендСтудио Холдинг v1.0. 25 секций, scroll-storytelling, 3 audience-режима (LP / Partners / Gov), 22 типа визуализаций (Sankey + 3D Pipeline + Monte Carlo + Choropleth + Weekly Box-Office + Heatmaps + Waterfall + Funnel + Gantt), **13 симуляторов** (IRR/MOIC, Scenario, MC, Break-even, LP Sizer, Box-Office Sensitivity, Pipeline Builder, Stress Test, Distribution Mix, Term Sheet, IP Value, Release Window, OTT-vs-Theatrical+Genre/Tax). Данные из canon_holding_base.json (18 блоков) + canon_holding_extended.json (22 блока) = 40 блоков. Интерактив + анимация 100% (N_elements = {{}}). Mobile parity (iOS+Android). Offline + SEO + Print-friendly. П5 Максимум + М4 Презентационная: 32/32 + 7/7.

2. **Computer-ссылка** на `.html` файл.

3. **Блок «Результаты верификации v1.0»** (не более 25 строк): М4.1-М4.7 + П5.1-32 сводка + метрики покрытия + performance + a11y + mobile.

4. **Опционально:** «Что осталось на усмотрение» — 1-2 пункта (обычно: Release-window Gantt и 3D Org Tree как опциональные).

---

## Приложение А. Шпаргалка для агента v1.0

**Порядок действий при получении промта v1.0:**

1. Открой `canon_holding_base.json` → проверь 18 блоков + `_meta.version === "v1.0"`.
2. Открой `canon_holding_extended.json` → проверь 22 блока + `_meta.extends === "base v1.0"`.
3. Убедись, что ключи верхнего уровня не пересекаются (кроме `_meta`).
4. Прогони 10 якорей §1.2 через assert. Если хоть один fail — остановись.
5. Прочитай этот промт полностью.
6. Следуй §9 (7 фаз) с акцентом на §5 (13 симуляторов) и §10 (mobile parity).
7. В Фазе 0: оба canon + якоря + архитектура + lazy-loading.
8. В Фазе 2: каждому элементу приписать анимацию + интерактив из `animation_catalog` и `interaction_rules`. Добавить `data-animated` и `data-interactive`.
9. В Фазе 3: реализовать 22 визуализации из §4 выше (20 обязательных + 2 опциональных).
10. В Фазе 4: 13 симуляторов из `canon.simulators` (формулы 1-в-1).
11. В Фазе 6: mobile + offline + SEO + print.
12. В Фазе 7: М4.7 cross-file integrity + 100% coverage + VERIFICATION REPORT.
13. Сдай: HTML-артефакт + summary + verification-блок.

**Ключевые якоря для быстрой проверки:**

| Ключ | Ожидаемое значение |
|------|---------------------|
| `canon.fund.lp_size_mln_rub` | 3000 |
| `canon.pipeline.projects.length` | 7 |
| `canon.pipeline.stages.length` | 4 |
| `canon.pipeline.stage_project_matrix.flat().length` | 28 |
| `canon.returns.irr_internal_w5vd` | 24.75 |
| `canon.returns.irr_public_w3` | 20.09 |
| `canon.monte_carlo.total_runs` | 1000 |
| `canon.monte_carlo.p50_irr_internal` | ≈ 13.95 (±0.5) |
| `canon.monte_carlo.p50_irr_public` | ≈ 11.44 (±0.5) |
| `canon.finmodel.tests_passed` | 348 |
| `canon.horizon.years` | 7 |
| `canon.returns.target_moic` | ≥ 2.0 |
| `canon.interaction_rules.rule_coverage_pct` | 100 |
| `canon.interaction_rules.element_requirements.length` | ≥ 38 |
| `canon.animation_catalog.scroll_animations.length` | 12 |
| `canon.animation_catalog.chart_animations.length` | 12 |
| `canon.animation_catalog.interaction_patterns.length` | 11 |
| `canon.simulators` | 13 формул |

**Палитра (Dark Cinematic, наследуется из Deck v1.1.2):**
- Фон: `#0A0A0F` / `#131319` / `#1C1C24`
- Золото: `#D4AF37` (главный акцент, CTA, ключевые цифры)
- Electric blue: `#4FC3F7` (вторичный акцент, графики)
- Розовый: `#E91E63` (bear, alerts)
- Текст: `#F5F5F7` / `#A0A0A8` / `#6B6B75`

**Шрифты:**
- Display: Manrope (700, 800)
- Body: Inter (400, 500, 600)
- Mono: JetBrains Mono (500)

**GSAP регистрация (обязательна):**
```javascript
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);
```

**Если один из canon-файлов не найден:** остановись, сообщи `«Не могу найти canon_holding_{base,extended}.json. Приложите недостающий файл»`. НЕ генерировать лендинг без обоих файлов.

**Если якоря §1.2 не сходятся:** покажи пользователю перечень расхождений, НЕ генерировать лендинг до устранения.

**Если М4.7 cross-file integrity проваливается (несовпадение между base, extended, LP Memo, Deck, Investor Model, Finmodel):** покажи пользователю расхождения, НЕ генерировать лендинг до устранения.

---

## Приложение Б. Что сделать до генерации canon-файлов

Перед использованием этого промта необходимо **создать два canon-файла** (`canon_holding_base.json` и `canon_holding_extended.json`). Они пока не существуют — следующий шаг работы.

Рекомендуемый порядок:
1. Получить от пользователя подтверждение этого промта v1.0 (структура + scope).
2. Согласовать набор блоков в `canon_holding_base.json` (18) и `canon_holding_extended.json` (22) — см. §2.2.
3. Извлечь данные из 4 источников (§2.1): LP Memo v1.1.0, Deck v1.1.2, Investor Model v3.0, Finmodel v1.4.4.
4. Сгенерировать оба JSON-файла с прохождением §2.4 sanity-check.
5. После готовых canon — применить этот промт → HTML-лендинг.

---

**Конец промта v1.0.**

**Статус:** драфт для согласования с пользователем. После подтверждения — переход к canon-файлам (Приложение Б).
**Следующий шаг:** уточняющие вопросы через AskUserQuestion (согласно preference #1 workflow: промт → драфт → вопросы → итерация).
