# Landing v1.0 — Stage B Handoff (CORE)

**Версия:** B1a · **Дата:** 2026-04-19 · **Статус:** OPEN (Stage B start-gate)
**Прогресс:** 10% / 100% → цель B1a завершения: 11% / 100%
**Паспорт:** paired-duplicate, sha256-match required
**Следующий артефакт:** B1b DETAIL (viz/sim specs + i18n blueprint + wave-plan.json)

---

## 0. Назначение документа

Этот файл — **контракт передачи** из супервизорского режима Cowork в исполнительный режим Claude Code (CC) для Stage B (70% работы: 10% → 80%).

Он фиксирует:
1. **Что закрыто в Stage A** — на какие артефакты CC опирается (без расшифровки)
2. **Что доступно** — 5 JSON-канонов + 20 реальных изображений
3. **Контракты** — пути, sha256-match, атомарность, запреты
4. **Карта 25 секций** — s01–s25 с предварительными лейблами
5. **Wave-план** — 6 волн по ~11–12% каждая с checkpoints
6. **Go/No-Go критерии** — 7 инвариантов, проверяемых между волнами
7. **CC instructions** — Do / Don't / Troubleshooting

Детализация viz/sim-спецификаций, i18n-blueprint и JSON wave-плана переносится в **B1b**.

---

## 1. Контекст: что закрыто в Stage A (10%)

| # | Подэтап | % | Что закрыто | Артефакт |
|---|---------|--:|-------------|----------|
| A1 | Canon Base | 3 | 10 const-значений фонда (LP 3000 млн ₽, hurdle 8%, carry 20%, catchup 100%, hurdle IRR 15%, target MOIC 2.2, DPI@5=0.45, DPI@7=1.85, horizon 7y, investment period 4y) + 7 проектов pipeline + waterfall spec + 4 stage таксономия + 8 milestones roadmap | `landing_canon_base_v1.0.json` (55 326 B, sha256 `7cc163afabbe0925…`) + schema (25 642 B, `c739b3bde4782a3c…`) |
| A2 | Canon Extended | 4 | 23 UI-блока (viz-22, sim-13, navigation, i18n-skeleton, audio, animations, palette, typography, modals, forms, cta, hero, footer, legal_disclaimers, social_proof, timeline_roadmap, waterfall_diagram, tax_credits_ui, scenario_switcher, regions_map, benchmark_chart, kpi_dashboard) | `landing_canon_extended_v1.0.json` + schema (63 206 B + 53 113 B) |
| A3 | AskUser Gate | 1 | 4 решения: brand_tone=**High-Concept Marquee**, language=**RU-first EN available**, primary_cta=**scroll-to-pipeline (s07)**, ux_defaults=**audio muted + mobile downgrade** | `landing_a3_decisions_v1.0.json` (4 323 B, `a168c76c1b119636…`) |
| A4 | img-meta embed | 2 | 20 реальных изображений с JPEG-dims, sha256, alt ru/en, role/placement/loading | `canon_extended` rehash → `c271322e37145426…` |

**Checkpoint A:** PASSED. Все 5 артефактов — paired match в 2 локациях.

---

## 2. Доступные артефакты

### 2.1 Data JSON (парный sha256-match, 5 файлов)

| # | Файл | Size (B) | SHA-256 (первые 16) |
|---|------|---------:|---------------------|
| 1 | `landing_canon_schema_v1.0.json` | 25 642 | `c739b3bde4782a3c…` |
| 2 | `landing_canon_base_v1.0.json` | 55 326 | `7cc163afabbe0925…` |
| 3 | `landing_canon_extended_schema_v1.0.json` | 53 113 | `006d3984bf23f7d9…` |
| 4 | `landing_canon_extended_v1.0.json` | 63 206 | **`c271322e37145426…`** |
| 5 | `landing_a3_decisions_v1.0.json` | 4 323 | `a168c76c1b119636…` |

**Обе локации обязаны содержать идентичные файлы (побайтно), sha256 должен совпадать:**
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/`
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/`

### 2.2 Изображения (20 файлов)

| # | Файл | Role | Section | Loading | Dims | Size |
|---|------|------|---------|---------|-----:|-----:|
| 01 | team_01_ceo.jpg | portrait | s03 | lazy | 800×1000 | 66 355 |
| 02 | team_02_producer_lead.jpg | portrait | s03 | lazy | 800×1000 | 101 708 |
| 03 | team_03_cfo.jpg | portrait | s03 | lazy | 800×1000 | 89 127 |
| 04 | team_04_head_distribution.jpg | portrait | s03 | lazy | 800×1000 | 77 919 |
| 05 | team_05_creative_director.jpg | portrait | s03 | lazy | 800×1000 | 77 836 |
| 06 | advisory_01_industry_veteran.jpg | portrait | s04 | lazy | 800×1000 | 92 861 |
| 07 | advisory_02_finance_advisor.jpg | portrait | s04 | lazy | 800×1000 | — |
| 08 | advisory_03_distribution_advisor.jpg | portrait | s04 | lazy | 800×1000 | — |
| 09 | advisory_04_international_advisor.jpg | portrait | s04 | lazy | 800×1000 | — |
| 10–16 | project_01..07_poster.jpg | project_still | s07 | lazy | varied | — |
| 17 | banner_market_context.jpg | section_bg | s05 | lazy | wide | — |
| 18 | banner_press.jpg | section_bg | s22 | lazy | wide | — |
| 19 | hero_bg.jpg | hero_bg | s01 | eager | 2560×1440 | — |
| 20 | hero_film_reel.jpg | still_sequence | s01 | eager | wide | — |

**Физические файлы в `TrendStudio-Holding/data_extract/images_processed/`** (с `manifest.json`).

### 2.3 Ключевые константы из canon.base (не менять, только читать)

```
fund.lp_size_mln_rub         = 3000
fund.gp_commitment_pct       = 2
fund.management_fee_pct      = 2
fund.carried_interest_pct    = 20
fund.hurdle_rate_pct         = 8
fund.catchup_pct             = 100
fund.investment_period_years = 4
fund.fund_life_years         = 7
horizon.years                = 7 (2026–2033)
returns.irr_internal_w5vd    = 24.75
returns.irr_public_w3        = 20.09
returns.mc_p50_internal      = 13.95
returns.mc_p50_public        = 11.44
returns.target_moic          = 2.2
returns.dpi_year_5           = 0.45
returns.dpi_year_7           = 1.85
pipeline.projects.length     = 7
```

---

## 3. Контракты для CC

### 3.1 Paths — dual-location rule

Любой **новый** артефакт Stage B (кроме временных сборочных файлов) должен быть записан **в обе локации с идентичным содержимым и sha256-match**:

| Тип артефакта | /Холдинг/ | /TrendStudio-Holding/ |
|---------------|-----------|------------------------|
| data JSON | `data/` | `data_extract/` |
| handoff / spec md | root | `docs/` |
| wave-plan JSON | `data/` | `data_extract/` |
| финальный HTML | `Landing_v1.0/` | `Landing_v1.0/` |
| тестовые отчёты | `Landing_v1.0/reports/` | `Landing_v1.0/reports/` |

Исходные коды (src/, tests/) — **только** в `/TrendStudio-Holding/`.

### 3.2 Atomicity

- Запись JSON — atomic: сначала в `.tmp` → `os.replace()` → ручная проверка sha256
- При записи парных артефактов — сначала обе, **затем** sha256-check, если mismatch → обе откатываются до предыдущей версии
- Schema validation (Draft-07 strict) **обязательна** перед каждой записью extended canon
- Любое изменение canon.base или canon.extended — **rehash обеих локаций и обновление памяти** (файл `project_trendstudio_landing_*.md`)

### 3.3 ID patterns (enforced)

| Префикс | Паттерн | Диапазон |
|---------|---------|----------|
| Секции | `^s\d{2}$` | s01–s25 |
| Изображения | `^img\d{2}$` | img01–img20 |
| Визуализации | `^viz\d{2}$` | viz01–viz22 |
| Симуляторы | `^sim\d{2}$` | sim01–sim13 |
| CTA | `^cta\d{2}$` | cta01+ |
| Modals / forms | из canon.modals.items, canon.forms.items |

### 3.4 Запреты (hard constraints)

| # | Запрет | Причина |
|---|--------|---------|
| 1 | `eval()`, `new Function()` | CSP, безопасность |
| 2 | `localStorage`, `sessionStorage` | Приватность, LP-аудитория |
| 3 | Inline `onclick=` и прочие handlers | CSP, a11y |
| 4 | External CDN-зависимости для production | Self-contained требование |
| 5 | Сторонние fonts без fallback | Надёжность |
| 6 | Images без alt.ru/alt.en | WCAG AA |
| 7 | Sim-генерация без фиксированного seed | Детерминизм |
| 8 | Изменение canon.base / canon.extended БЕЗ schema-validation + rehash | Ссылочная целостность |
| 9 | i18n ключ в ru.json без симметричного ключа в en.json | Правило симметрии |
| 10 | HTML-файл больше 1 200 KB (soft) / 2 000 KB (hard) | Производительность |

### 3.5 Brand tone (из A3)

- **High-Concept Marquee** — агрессивный wow-эффект
- Hero: crescendo image-sequence + strong parallax + aggressive GSAP reveal
- Прочие секции: сдержанные reveals, быстрые переходы (≤400 мс)
- Palette: `shadows_of_sunset_v1` (dark cinematic) + accent gold `#E3B13A` усилен для marquee-highlights
- Mobile: tier-downgrade (3D→static, particles→single-frame, aggressive reveals→simple fade)
- Audio: 3 tracks, muted by default, toggle-control visible
- A11y: `prefers-reduced-motion: reduce` → auto-disable parallax/reveals (CSS-only, без UI-флага)
- Primary CTA: `ui.cta.hero_primary` → smooth scroll to `#s07` (pipeline)

---

## 4. Карта 25 секций (s01–s25)

Лейблы — **предварительные**, итоговые определяются в W1 через `i18n.ui.toc.sXX`. Фиксация — в B1b i18n-blueprint.

| ID | Предв. лейбл | Tier | Изображения | Viz | Sim | Примечание |
|----|--------------|------|-------------|-----|-----|-----------|
| s01 | Hero / Intro | Marquee | img19 (hero_bg), img20 (film_reel) | viz01, viz17 | — | Crescendo + parallax + film_reel_3d |
| s02 | IRR Explorer | Marquee | — | — | sim01 | Хедлайн-симулятор (first-touch wow) |
| s03 | Team | Standard | img01–img05 (5 portraits) | — | — | Grid портретов, role+bio |
| s04 | Advisory Board | Standard | img06–img09 (4 portraits) | viz18, viz19 | — | Grid + competency-graphs |
| s05 | Market Context | Hero | img17 (banner) | — | — | Macro narrative |
| s06 | Investment Thesis | Hero | — | — | — | Текстово-графический манифест |
| s07 | Pipeline & Projects | Hero | img10–img16 (7 posters) | viz08, viz20 | — | Gantt + stage-matrix, primary CTA target |
| s08 | Finance Core | Standard | — | viz06, viz07 | sim04 | Waterfall visualization |
| s09 | Scenarios | Standard | — | viz04 | sim05 | Bear/Base/Bull switcher |
| s10 | Monte Carlo | Marquee | — | viz05 | sim02 | Distribution + sim-paths |
| s11 | Sensitivity | Standard | — | viz14 | sim12 | Tornado + what-if |
| s12 | IRR Deep-Dive | Standard | — | viz09 | sim07 | IRR-by-project + waterfall-trace |
| s13 | Benchmark | Standard | — | viz16 | sim06 | CAPM build-up + peer IRR |
| s14 | Peer Comparison | Hero | — | viz02, viz15 | sim03 | Peers matrix + bubbles |
| s15 | Cash Flow / J-curve | Standard | — | viz10, viz13 | sim08 | Cash waterfall + DPI curve |
| s16 | Regions / Distribution | Standard | — | viz11, viz21 | sim09 | Map + region-share |
| s17 | Tax Credits / Waterfall | Hero | — | viz03, viz22 | sim10 | Full LP/GP waterfall animation |
| s18 | Term Sheet | Standard | — | — | — | Таблица условий LP |
| s19 | Roadmap / Timeline | Standard | — | viz12 | sim13 | 7-year milestones visualization |
| s20 | KPI Dashboard | Standard | — | — | sim11 | Summary metrics |
| s21 | FAQ | Standard | — | — | — | Аккордеон Q&A |
| s22 | Press & Media | Standard | img18 (banner) | — | — | Эмбеды цитат, logos |
| s23 | Legal Disclaimers | Standard | — | — | — | Юридические оговорки |
| s24 | LP Intake (Contact) | Standard | — | — | — | Форма для квалифицированных инвесторов |
| s25 | Footer | Standard | — | — | — | Навигация + юр. данные + версия |

**Итого:** 20 imgs, 22 viz, 13 sim распределены по 25 секциям.

---

## 5. Wave-план: 6 волн + checkpoints

Stage B: 70% работы (10% → 80%). Волны рассчитаны на паритетную загрузку (~11–12% каждая).

### 5.1 Сводная таблица волн

| Wave | % | End% | Секции | Viz | Sim | Основной фокус |
|------|--:|-----:|--------|----:|----:|----------------|
| W1 | 11 | 21 | 25 пустых каркасов | 0 | 0 | Infrastructure: HTML skeleton + nav + i18n router + theme + a11y baseline |
| W2 | 12 | 33 | s01–s06 | 3 | 1 | Hero crescendo + team + advisory + market context + thesis |
| W3 | 12 | 45 | s07–s11 | 7 | 4 | Finance core: pipeline + waterfall + scenarios + MC + sensitivity |
| W4 | 12 | 57 | s12–s15 | 5 | 4 | Analytics: IRR deep + benchmark + peer + cashflow/J-curve |
| W5 | 12 | 69 | s16–s21 | 7 | 4 | LP-ready: regions + waterfall + term sheet + roadmap + KPI + FAQ |
| W6 | 11 | 80 | s22–s25 + integration | 0 | 0 | Assembly: press + disclaimers + LP-intake + footer + audio + animations + smoke E2E |

### 5.2 Детализация каждой волны

#### W1 — Infrastructure (+11%, 10→21%)

**Артефакты:**
- `src/index.html` — skeleton с 25 `<section id="sXX">` блоками
- `src/styles/base.css` — CSS-tokens из `canon.palette` + `canon.typography`
- `src/js/i18n/router.js` — ru/en переключатель через URL hash (`#lang=ru|en`)
- `src/js/nav/toc.js` — TOC + scroll-spy + prev/next + breadcrumbs
- `src/js/a11y/baseline.js` — focus-trap, aria-landmarks, prefers-reduced-motion detector
- `src/js/theme/palette.js` — runtime palette-tokens + dark cinematic фон
- `i18n/ru.json`, `i18n/en.json` — skeleton (9 namespaces, пустые values ready)

**DoD (Definition of Done):**
- Все 25 секций существуют (даже пустые)
- TOC → scroll-spy работает для всех 25
- RU/EN переключатель работает (hash + sessionStorage fallback)
- Axe-core scan показывает 0 critical
- prefers-reduced-motion detected и применён (CSS-вариативность)
- Browser console: 0 errors

**Checkpoint W1:** M4 verification (формат + a11y baseline + i18n keys count)

---

#### W2 — Hero + Intro block (+12%, 21→33%)

**Секции:** s01 Hero, s02 IRR Explorer, s03 Team, s04 Advisory, s05 Market, s06 Thesis

**Viz/Sim:** viz01 (Three.js hero_film_reel_3d), viz17 (D3 hero-metric), viz18+viz19 (advisory competency-graphs), sim01 (IRR explorer marquee)

**Артефакты:**
- `src/js/hero/reel.js` — Three.js 3D film reel + crescendo-reveal
- `src/js/hero/parallax.js` — 3-layer parallax (shadows_of_sunset)
- `src/js/sim/irr_explorer.js` — sim01 (Marquee tier, mc_light engine)
- `src/js/sections/team.js` — grid 5 портретов + hover-reveal
- `src/js/sections/advisory.js` — grid 4 портретов + viz18+viz19
- Наполнение ru.json/en.json для s01–s06

**DoD:**
- Hero рендерится на desktop с ≥45 FPS
- Mobile: 3D→static image fallback, parallax→disabled
- sim01 отвечает на slider в <16ms
- Все 9 портретов отображаются с alt-ru/alt-en
- Market banner img17 грузится lazy + displays

**Checkpoint W2:** smoke E2E hero + sim01 + portraits rendering

---

#### W3 — Finance Core (+12%, 33→45%)

**Секции:** s07 Pipeline, s08 Finance, s09 Scenarios, s10 MC, s11 Sensitivity

**Viz/Sim:** viz08+viz20 (pipeline Gantt+matrix), viz06+viz07 (waterfall), viz04 (scenarios switcher), viz05 (MC distribution), viz14 (sensitivity tornado), sim02 (MC-light), sim04 (finance-what-if), sim05 (scenario slider), sim12 (sensitivity what-if)

**Артефакты:**
- `src/js/charts/pipeline_gantt.js` — D3 Gantt + stage color-matrix + 7 project posters
- `src/js/charts/waterfall.js` — D3 finance waterfall
- `src/js/sim/mc_light.js` — общий MC-движок (seed-deterministic) для sim02/sim04
- `src/js/charts/mc_distribution.js` — D3 histogram P25/P50/P75
- `src/js/charts/sensitivity.js` — D3 tornado

**DoD:**
- Pipeline Gantt отображает все 7 проектов + 4 stages с real progress_pct из canon
- Scenario switcher меняет 3 viz синхронно (bear/base/bull)
- MC-sim генерирует 1000 траекторий, P50 совпадает с `canon.returns.mc_p50_internal` ±0.5pp
- Sensitivity tornado показывает ≥5 факторов с правильным ранжированием

**Checkpoint W3:** numerical-verify (sim outputs vs canon.returns) + budget-check

---

#### W4 — Analytics Deep (+12%, 45→57%)

**Секции:** s12 IRR Deep, s13 Benchmark, s14 Peer, s15 Cash Flow

**Viz/Sim:** viz09 (IRR-by-project), viz16 (benchmark CAPM), viz02+viz15 (peers matrix+bubbles), viz10+viz13 (cashflow+J-curve), sim03 (peer-what-if), sim06 (benchmark adjust), sim07 (IRR drill), sim08 (J-curve simulator)

**Артефакты:**
- `src/js/charts/irr_deep.js` — D3 IRR по проектам + waterfall-trace
- `src/js/charts/benchmark_capm.js` — D3 CAPM build-up
- `src/js/charts/peers_matrix.js` — D3 sortable matrix + bubble chart
- `src/js/charts/cashflow_jcurve.js` — D3 J-curve + cash waterfall

**DoD:**
- IRR-by-project = `irr_internal_w5vd` weighted sum (sanity-check)
- Peer bubble chart: ≥5 peers + color-coded
- J-curve DPI@5=0.45, DPI@7=1.85 (из canon)
- Benchmark CAPM явно показывает build-up компоненты

**Checkpoint W4:** cross-chart coherence (same base-scenario = same numbers everywhere)

---

#### W5 — LP-ready (+12%, 57→69%)

**Секции:** s16 Regions, s17 Tax Credits/Waterfall, s18 Term Sheet, s19 Roadmap, s20 KPI Dashboard, s21 FAQ

**Viz/Sim:** viz11+viz21 (regions map+share), viz03+viz22 (tax credits+waterfall anim), viz12 (roadmap timeline), sim09 (region-adjust), sim10 (waterfall tier-switch), sim11 (KPI-explorer), sim13 (roadmap-year-slider)

**Артефакты:**
- `src/js/charts/regions_map.js` — SVG map + regional distribution share
- `src/js/charts/tax_credits_waterfall.js` — GSAP-animated waterfall с hurdle/catchup/carry
- `src/js/charts/roadmap_timeline.js` — D3 timeline 2026→2033 с milestones
- `src/js/sections/term_sheet.js` — таблица LP terms из canon.fund
- `src/js/sim/kpi_dashboard.js` — summary KPI с live-update
- `src/js/sections/faq.js` — accordion из canon.faq

**DoD:**
- Waterfall animation показывает все 4 уровня (return-of-capital → preferred → catchup → carry)
- Term sheet таблица совпадает с canon.fund 1:1 (auto-sync)
- Roadmap 8 milestones из canon.horizon.milestones
- FAQ раскрывается с плавной анимацией

**Checkpoint W5:** numerical-parity term-sheet vs canon.fund

---

#### W6 — Assembly + Integration (+11%, 69→80%)

**Секции:** s22 Press, s23 Disclaimers, s24 LP Intake, s25 Footer + cross-section integration

**Артефакты:**
- `src/js/sections/press.js` — press banner img18 + press_quotes grid
- `src/js/sections/disclaimers.js` — legal_disclaimers из canon
- `src/js/sections/lp_intake.js` — форма с валидацией (без прямой отправки: мейлто + локальный JSON draft)
- `src/js/sections/footer.js` — контакты, версии, навигация
- `src/js/audio/tracks.js` — 3 tracks, muted default, toggle
- `src/js/animations/ambient.js` — GSAP ambient reveals между секциями
- `src/js/integration/orchestrator.js` — единый event-bus (`TS.emit`/`TS.on`)
- `tests/smoke_e2e.spec.js` — Playwright smoke (load + nav + 3 sims + audio-toggle)

**DoD:**
- LP-intake валидирует email/phone, не шлёт на внешний endpoint
- Audio 3 tracks, все muted, toggle работает
- Cross-section state-sync: scenario=bear в s09 → тот же в s12/s13/s15
- Smoke E2E: 6/6 тестов green
- HTML ≤ 1 200 KB (soft limit)
- Console: 0 errors

**Checkpoint W6 / Checkpoint B:** Stage B CLOSED, переход к Stage C (verification + E2E + release)

---

## 6. Go/No-Go критерии между волнами

Перед merge/commit каждой волны CC проверяет **7 инвариантов**. При провале ≥1 → wave re-opened.

| # | Инвариант | Метод проверки | Tolerance |
|---|-----------|----------------|-----------|
| 1 | Budget respected | `stat -c %s index.html` ≤ 1 200 000 B | hard 2 000 000 |
| 2 | Canon sha256 match | `sha256sum data/*.json == data_extract/*.json` | exact |
| 3 | Schema validation | `jsonschema validate` для extended + base | exact |
| 4 | i18n symmetry | `len(ru.json keys) == len(en.json keys)` | exact |
| 5 | No forbidden APIs | regex `eval\|new Function\|localStorage\|sessionStorage` → 0 hits | exact |
| 6 | Axe-core a11y | 0 critical + 0 serious | exact |
| 7 | Numerical parity (с W3+) | sim outputs vs canon.returns | ±0.5 pp |

**Процедура:**
1. После волны CC запускает `scripts/invariants_check.py` (создаётся в W1)
2. Выводит report: `[OK] / [FAIL] × invariant`
3. Если все OK → commit; иначе → fix + re-run

---

## 7. CC instructions (Do / Don't / Troubleshooting)

### 7.1 DO

- ✅ Работай **последовательно** по волнам, не начинай Wᵢ₊₁ пока Wᵢ checkpoint не PASSED
- ✅ **Коммить** после каждой волны отдельной веткой: `claude/landing-v1.0-wave-N`
- ✅ Обновляй `landing_progress_v1.0.json` (создаётся в W1) после каждой волны: `{"wave": N, "pct": X, "sha256": "..."}`
- ✅ Читай canon через `jsonschema validate` → `canon_obj`, а не raw JSON-парсинг
- ✅ Используй `seed_deterministic: true` для всех sim-engines → фиксированный seed = "landing_v1.0_<sim_id>"
- ✅ Сверяй числа с `canon.returns` **в каждой** связанной visualization
- ✅ Вноси **paired update** для обоих локаций одновременно
- ✅ Обновляй память (`project_trendstudio_landing_*.md`) после каждой волны

### 7.2 DON'T

- ❌ **НЕ изменяй** canon.base или canon.extended без явного разрешения в handoff или от Cowork-супервизора
- ❌ **НЕ вводи** новые viz-id или sim-id без согласования (22+13 — финальный набор Stage B)
- ❌ **НЕ используй** external CDN в production — всё inline или локально
- ❌ **НЕ добавляй** новые секции сверх s01–s25 без апдейта canon.navigation
- ❌ **НЕ нарушай** i18n symmetry (ru.json.keys == en.json.keys)
- ❌ **НЕ пропускай** schema validation перед записью в extended
- ❌ **НЕ merge'и** волну если хотя бы 1 из 7 инвариантов FAIL

### 7.3 Troubleshooting

| Симптом | Причина | Fix |
|---------|---------|-----|
| Schema validation fails после изменения canon | `additionalProperties: false` поймал лишний ключ | Проверь diff + удали лишний ключ ИЛИ обнови schema с rehash |
| sha256 mismatch между локациями | Запись не atomic или порядок ключей разный | `json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=False)` + atomic rename |
| MC-sim выдаёт разные результаты при одинаковом seed | Глобальное Math.random() вместо seeded RNG | Используй `mulberry32(seed)` или аналог |
| Palette-tokens не применяются | Runtime CSS-vars не инициализированы | Проверь `src/js/theme/palette.js` — init before first paint |
| Axe-core жалуется на contrast | Palette tokens не соответствуют WCAG AA | Уточни контраст на фоне `shadows_of_sunset_v1.background` |
| i18n asymmetry | Добавили ключ только в ru.json | Скрипт `scripts/i18n_sync.py` (создаётся в W1) подскажет missing |
| HTML растёт быстро | Inline-duplication assets | Проверь дубли background-image + переходи на `<img>` с lazy |

---

## 8. Что дополнит B1b (DETAIL)

B1a завершается на 11%. B1b добавит **+1% (→ 12%)**:

1. **22 viz-спецификации** — для каждого: inputs-schema, outputs-schema, CSS-tokens, size-constraints, a11y-label, fallback
2. **13 sim-спецификаций** — для каждого: формулы (closed_form) или параметры (mc_light), seed, диапазоны входов, ожидаемые диапазоны выходов, унит-тесты
3. **i18n blueprint** — полная структура 9 namespaces × ~420 keys skeleton (пустые values, готовые keys)
4. **wave-plan JSON** — `landing_b1_wave_plan_v1.0.json` в обе локации с sha256-match, парсабельный CC для автомата go/no-go
5. **invariants_check.py spec** — псевдокод скрипта (сам скрипт создаётся CC в W1)

---

## 9. Прогресс

**11% / 100%** · Stage A: 4/4 ✓ · B1a: **COMPLETED** · Next: **B1b DETAIL** (+1%)

---

## 10. История и якоря

- **B1a версия:** 1.0 · 2026-04-19
- **Stage A origin:** см. memory `project_trendstudio_landing_v100_a4_done.md`
- **Проект:** TrendStudio Holding LP Landing v1.0
- **Language:** RU-first (с EN переключателем)
- **Target audience:** Qualified LP investors
- **Timeline:** Stage B — wave-mode CC; Stage C — Playwright+Lighthouse+П5
