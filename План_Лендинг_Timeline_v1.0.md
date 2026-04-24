# План-график создания HTML-лендинга ТрендСтудио Холдинг

**Версия:** 1.1
**Дата создания:** 2026-04-19
**Последнее обновление:** 2026-04-19 (v1.1: зафиксированы решения по старту и режиму B)
**Автор:** Cowork (Claude) + rakhman
**Статус:** APPROVED FOR EXECUTION — ожидает raw-изображения из Nano Banana

## §-1. Зафиксированные решения пользователя (v1.1)

| Решение | Выбор | Дата |
|---------|-------|------|
| Старт работы | Ждать raw-изображения → потом A1-A4 единым проходом | 2026-04-19 |
| Режим этапа B | Wave-паттерн (5-7 параллельных субагентов в CC) | 2026-04-19 |
| Чекпоинты | Все 8 сохраняются (A1-done, A3-gate, A-final, B1-done, B3-done, B-final, C3-done, C-final) | 2026-04-19 |
**Базовые документы:**
- `Промт_HTML_лендинг_Холдинг_v1.2.md` (SSOT спецификации лендинга)
- `Gemini_TZ_images_v1.0.md` (SSOT для 20 изображений)
- `Верификация_GeminiTZ_v1.0_П5.md` (П5 32/32 + М4 7/7 — PASS)

---

## §0. Сводка

**Цель:** Собрать премиальный HTML-лендинг ТрендСтудио Холдинг (25 секций, 13 симуляторов, 20 изображений, scroll-сторителлинг) согласно промту v1.2.

**Горизонт:** 3–5 календарных дней (25–38 ч чистого машинного времени) при hybrid-режиме Cowork ↔ Claude Code.

**Режим работы:**
- Cowork (Claude в Cowork-сессии) — canon JSON, planning, memory, оценки, блоки спек, чек-ин ответы пользователю
- Claude Code (локальный CC в `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/`) — HTML-сборка, wave-паттерн субагентов, git push
- Пользователь (rakhman) — генерация raw-изображений в Gemini Nano Banana, аппрувалы на чекпоинтах

**Шкала прогресса:** 100% = полностью завершённый и верифицированный HTML-лендинг, закоммиченный в git с тегом `v1.0-landing-released` и размещённый в обеих папках.

**Формат отчётности:** После завершения каждого подэтапа — короткий апдейт в чат вида:
> ✅ `[A1]` Canon base JSON готов. **Прогресс: 3% / 100%.** Следующий: `[A2]` Canon extended каркас.

---

## §1. Общая структура этапов

| Этап | Название | Вес | Владелец | Зависимости |
|:----:|----------|:---:|----------|-------------|
| A | Canon JSON | 10% | Cowork | raw-изображения (для A4) |
| B | HTML генерация | 70% | Claude Code | Canon JSON готов |
| C | QA + Верификация + Релиз | 20% | CC + Cowork | HTML готов |

Итого: **100%** (10 + 70 + 20 = 100 ✓)

### 1.1 Зависимости (dependency graph)

```
[Nano Banana у пользователя] ──────┐
                                    ↓
[A1 base] → [A2 ext-каркас] → [A3 AskUser] → [A4 img-meta]
                                                    ↓
                                        [Чекпоинт A → передача в CC]
                                                    ↓
[B1] → [B2] → [B3] → [B4] → [B5] → [B6] → [B7]
                                                    ↓
                                        [Чекпоинт B → передача на QA]
                                                    ↓
[C1] → [C2] → [C3] → [C4] → [C5]
                                                    ↓
                                        [Чекпоинт C → RELEASED]
```

### 1.2 Календарный roadmap (при оптимистичном темпе)

| День | Этап | Подэтапы | Прогресс (целевой) |
|:----:|------|----------|:-------------------:|
| 0 (сегодня, 19 апр) | A | A1, A2, A3 | 8% |
| + генерация Nano Banana у пользователя | — | — | — |
| 1 | A | A4 | 10% |
| 1–2 | B | B1, B2 | 27% |
| 2–3 | B | B3 | 47% |
| 3 | B | B4, B5 | 67% |
| 4 | B | B6, B7 | 80% |
| 4–5 | C | C1, C2, C3, C4 | 98% |
| 5 | C | C5 (релиз) | **100%** |

Между этапами **паузы для аппрувалов пользователя** (чекпоинты A, B, C). При плотном hybrid-режиме с параллельными субагентами в CC — можно сжать до 2–3 дней.

---

## §2. Этап A — Canon JSON (10%)

**Цель:** Собрать два JSON-файла (canon_holding_base.json + canon_holding_extended.json), которые будут SSOT для всех текстов, данных, изображений HTML-лендинга.

**Артефакты на выходе:**
- `data_extract/canon_holding_base.json` (18 блоков согласно §8.1 v1.2)
- `data_extract/canon_holding_extended.json` (23 блока согласно §8.2 v1.2)

### A1. Canon base JSON (3%)

**Содержание:**
- 18 блоков: hero, value_proposition, market_size, problem, solution, team, pipeline, revenue_split, profitability, irr, risk_mitigation, scenarios, cashflow, exit_strategy, governance, cta, footer, meta
- Тексты — из промта v1.2 §4 + финмодели Investor Public v3.0 (IRR, P&L, MC)
- Числовые якоря: 3 000 млн ₽ выручка, IRR 20.09%, MC 11.44%
- ID-формат: `b_<snake_case>`, `section_<slug>`
- Формат: UTF-8, строгий JSON (без комментариев)

**Критерии приёмки:**
- 18/18 блоков заполнены
- `JSON.parse()` без ошибок
- Все числовые якоря совпадают с источником (Investor Public v3.0)
- Все текстовые якоря — на русском, без placeholder-ов типа "TODO"

**Вес:** 3% / 100%

### A2. Canon extended JSON каркас (4%)

**Содержание:**
- 23 расширенных блока согласно §8.2 v1.2: simulators (13), images (20), timeline, team_bios, investor_faq, press_kit, ...
- Блок `simulators` — 13 объектов с `id`, `type` (marquee/hero/standard), `data_source`, `controls`, `events`
- Блок `images` — 20 объектов со стабом: `slot_id`, `seed`, `style_signature` (для 9 портретов), `filename_planned` (но БЕЗ `sha256`/`size_bytes` — заполнится в A4)
- Блок `timeline` — ключевые даты 2025–2030 с M&A/release milestones
- Плейсхолдеры коднеймов: PROJECT_01…PROJECT_07 (до A3)

**Критерии приёмки:**
- 23/23 расширенных блока заполнены каркасом
- `simulators[]` содержит 13 элементов
- `images[]` содержит 20 элементов со стабами
- Кросс-ссылки между base и extended валидны (id-совпадения)

**Вес:** 4% / 100%

### A3. AskUserQuestion: коднеймы + team-роли (1%)

**Цель:** Разрешить два открытых вопроса до генерации HTML.

**Вопрос 1 — Коднеймы проектов:**
- Вариант 1: Оставить PROJECT_01…PROJECT_07 (anonymized)
- Вариант 2: Использовать placeholder-коднеймы стиля «Проект Аврора», «Проект Обсидиан», … (7 атмосферных кодовых имён)
- Вариант 3: Реальные рабочие названия фильмов (если у пользователя есть)

**Вопрос 2 — Team (9 портретов):**
- Вариант 1: Placeholder-роли («CEO», «CFO», «Creative Director», …) — самая безопасная опция
- Вариант 2: Вымышленные ФИО в стиле индустрии
- Вариант 3: Реальные ФИО (если пользователь хочет публичный состав)

**Критерии приёмки:**
- Оба вопроса заданы через AskUserQuestion
- Ответы записаны в canon_holding_extended.json (блоки `pipeline.projects` и `team.members`)

**Вес:** 1% / 100%

### A4. Image metadata integration (2%) — ПОСЛЕ генерации Nano Banana

**Предусловие:** Пользователь завершил генерацию 20 изображений (+ A/B варианты) и прошёл post-processing согласно §6.1 Gemini TZ.

**Содержание:**
- Для каждого из 20 `images[]` добавить: `sha256`, `size_bytes`, `dimensions` (width × height), финальный `filename`, `alt` (a11y), `loading_priority` (eager для hero, lazy для остальных)
- Валидация style_signature: все 9 портретов имеют `style_signature: "shadows_of_sunset_v1"` (критерий №74)
- Суммарный размер изображений ≤ 5 000 KB raw (бюджет §3.5.4 v1.2)

**Критерии приёмки:**
- 20/20 изображений с полной метадатой
- 9/9 портретов с правильной style_signature
- Суммарный размер ≤ 5 000 KB
- JSON-schema валидация (скрипт из §6.3.2 Gemini TZ)

**Вес:** 2% / 100%

### 🛑 Чекпоинт A (после A4)

**Критерий прохождения:**
- Оба canon JSON'а валидны, закоммичены в `/TrendStudio-Holding/data_extract/`
- Пользователь подтверждает коднеймы и роли
- CC готов стартовать этап B

**Прогресс к моменту чекпоинта:** **10% / 100%**

---

## §3. Этап B — HTML генерация (70%)

**Цель:** Собрать полный интерактивный HTML-лендинг в Claude Code в 7 фаз согласно §9 промта v1.2.

**Артефакты на выходе:**
- `Landing_v1.0/TrendStudio_Holding_Landing_v1.0.html` (финальный, с embedded images)
- `src/landing/` (исходники: JS-модули, CSS, HTML-фрагменты)

### B1. Phase 1 — Skeleton + библиотеки (7%)

**Содержание:**
- Базовый HTML5-каркас: `<html lang="ru">`, `<meta viewport>`, OG-метадата, Twitter Card
- Подключение библиотек (CDN или inline):
  - GSAP 3.12.x + ScrollTrigger + TextPlugin + MotionPathPlugin
  - D3 v7 (для 13 симуляторов)
  - Three.js r128 (для 3D-блоков в hero + portraits parallax)
  - Lenis ~1.0.x (smooth scroll)
- Палитра v1.1 Nolan/Dune Dark Cinematic в CSS custom properties: `--bg-deep: #050508`, `--bg-base: #0D1117`, `--bg-card: #1A1F2E`, `--accent-gold: #D4AF37`, `--ember: #C77B3A`, `--sand: #B8A888`, `--bronze: #8B7355`
- Сетка: 12-column desktop ≥1280px, 8-column tablet 768–1279px, 4-column mobile <768px
- Шрифты: Inter (body) + Playfair Display (headings) через @font-face base64
- Стартовый loader с логотипом

**Критерии приёмки:**
- Файл валиден по W3C validator
- Все библиотеки загружаются без 404
- CSS-переменные применяются на `:root`
- Loader показывается до полной загрузки canon

**Вес:** 7% / 100%

### B2. Phase 2 — 25 секций-скелеты (10%)

**Содержание:**
- Создать каркасы для 25 секций согласно §5 v1.2:
  s01 hero, s02 value_prop, s03 problem, s04 solution, s05 market, s06 team, s07 pipeline, s08 revenue_model, s09 profitability, s10 IRR, s11 risks, s12 scenarios, s13 cashflow, s14 exit_strategy, s15 governance, s16 technology, s17 partnerships, s18 competitive, s19 traction, s20 use_of_funds, s21 timeline, s22 press, s23 advisors, s24 cta, s25 footer
- Каждая секция — `<section id="s<nn>" class="section" data-bg="<palette-token>">`
- Загрузка текстов из canon_base через `fetch()` или inline `<script type="application/json" id="canon">`
- Typography classes: h1/h2/h3 per палитра
- Фоны чередуются: #050508 → #0D1117 → #1A1F2E с плавными градиентами

**Критерии приёмки:**
- 25/25 секций присутствуют в DOM (проверка `document.querySelectorAll('section').length === 25`)
- Тексты всех секций подставлены из canon
- Нет пустых блоков без текста
- Responsive стили применены

**Вес:** 10% / 100%

### B3. Phase 3 — 13 симуляторов (20%)

**Самая тяжёлая фаза.** Разбивается на 3 под-подэтапа.

**B3.1 — 3 Marquee simulators (4%)**

- `marquee_01` — бегущая строка M&A-сделок индустрии (D3 + GSAP)
- `marquee_02` — scroll-triggered киноплёнка постеров (GSAP + SVG)
- `marquee_03` — lottie-like SVG анимация логотипов партнёров

Критерии: 60fps desktop / 30fps mobile, pause on hover, reversible direction.

**B3.2 — 4 Hero simulators (8%)**

- `hero_01` — IRR waterfall калькулятор с input-slider (ставка WACC, горизонт лет, stress-factor)
- `hero_02` — Revenue timeline с хронологией релизов 2025–2030 (D3 timeline + GSAP reveal)
- `hero_03` — Monte Carlo 13.95%/11.44% распределение (D3 histogram + threshold lines)
- `hero_04` — Portfolio pie / donut с drill-down по 7 проектам (D3 arc tween)

Критерии: drill-down по клику, клавиатурная доступность, aria-labels.

**B3.3 — 6 Standard simulators (8%)**

- `sim_01` — Market size bubble (D3 pack layout)
- `sim_02` — Break-even calculator (простая D3 scatter)
- `sim_03` — Team radar chart (D3 radial)
- `sim_04` — Pipeline stages funnel (SVG + GSAP stagger)
- `sim_05` — Risk matrix heatmap (D3 grid)
- `sim_06` — Sensitivity tornado (D3 horizontal bar)

Критерии: все читаемы через клавиатуру, колонки адаптивны на mobile (stack vertical).

**Общий вес B3:** 20% / 100%

### B4. Phase 4 — Scroll storytelling + GSAP (12%)

**Содержание:**
- ScrollTrigger для 25 секций: pin hero до 100vh, параллакс изображений в 2х скоростях
- MotionPath: иконки движутся по SVG-кривым между секциями
- TextPlugin: разброс букв в h1 hero с staggered reveal
- Lenis smooth scroll с easing [0.77, 0, 0.175, 1]
- Three.js r128 в s01 hero: 3D-камера с ember particles (#C77B3A) + postprocessing bloom (без eval, без new Function)
- Portrait parallax: 9 портретов в s06/s23 с tilt-эффектом по курсору (±15°)

**Критерии приёмки:**
- 60fps на desktop (Chrome, 2560×1440, 16-гиг RAM baseline)
- 30fps на iOS Safari 15 (iPhone 12 baseline)
- Нет jank при scroll (DevTools Performance profile: нет long tasks >50ms)
- `prefers-reduced-motion: reduce` отключает все анимации

**Вес:** 12% / 100%

### B5. Phase 5 — Mobile + Responsive (8%)

**Содержание:**
- iOS Safari ≥15: fix для 100vh (использовать `-webkit-fill-available`), фикс для sticky+overflow
- Android Chrome ≥110: тестирование touch-events для симуляторов
- Breakpoint tests: 320px (iPhone SE), 375px (iPhone 12), 390px (iPhone 14 Pro), 414px, 768px (iPad portrait), 1024px (iPad landscape), 1280px, 1920px
- Touch-friendly targets ≥44×44px
- Симуляторы: D3-интерактивные блоки переключаются в touch-режим (swipe вместо hover)
- Portraits: parallax отключён на mobile (экономия батареи)

**Критерии приёмки:**
- Все 8 breakpoint'ов: нет горизонтального скролла
- Lighthouse Mobile Score ≥85
- Touch-events работают на iOS/Android
- Нет overlap'ов между секциями

**Вес:** 8% / 100%

### B6. Phase 6 — A11y + SEO + OG (6%)

**Содержание:**
- A11y AA:
  - Все интерактивные элементы имеют aria-labels из canon
  - Focus trap для modal drill-down
  - Keyboard navigation: Tab/Shift+Tab/Enter/Space/Esc работают везде
  - Color contrast ≥4.5:1 для текста (проверка через axe)
  - Skip-to-content link в начале
  - Semantic HTML5: nav/main/article/section/footer
- SEO:
  - `<title>`, `<meta description>`, `<meta keywords>`
  - Structured data JSON-LD (Organization schema)
  - Canonical URL
  - robots.txt + sitemap.xml (если применимо)
- OG / Twitter Card:
  - og:title, og:description, og:image (1200×630), og:url, og:type
  - twitter:card, twitter:image

**Критерии приёмки:**
- axe-core отчёт: 0 violations (WCAG 2.1 AA)
- Lighthouse SEO Score ≥95
- Lighthouse A11y Score ≥95
- OG preview валиден (Facebook Sharing Debugger green)

**Вес:** 6% / 100%

### B7. Phase 7 — Build + minify + embed (7%)

**Содержание:**
- Склейка всех src/landing/ в единый HTML-файл
- Inline всех CSS (single `<style>` блок)
- Inline всех JS (модули объединены, wrap в IIFE)
- Embed всех 20 изображений в base64 внутри `<img src="data:image/jpeg;base64,...">`
- Embed шрифтов Inter + Playfair через base64 в @font-face
- Minify JS (terser) + CSS (cssnano) + HTML (html-minifier)
- Валидация финального файла: нет `eval`, `new Function`, `localStorage`, `sessionStorage` (regex-check)
- Размер: <12 MB (с учётом base64 изображений ~7–8 MB)

**Критерии приёмки:**
- Финальный HTML открывается в Chrome/Safari/Firefox локально (file://) без ошибок
- Нет внешних зависимостей (работает offline)
- Regex-check чистый
- Размер ≤ 12 MB

**Вес:** 7% / 100%

### 🛑 Чекпоинт B (после B7)

**Критерий прохождения:**
- HTML-файл валиден, offline-работоспособен, minified
- Пользователь открыл и визуально одобрил
- Готов к QA

**Прогресс к моменту чекпоинта:** **80% / 100%**

---

## §4. Этап C — QA + Верификация + Релиз (20%)

**Цель:** Убедиться, что HTML соответствует спецификации v1.2 и 74 acceptance criteria; закрыть П5 32/32 + М4 7/7; выпустить релиз.

### C1. Playwright matrix — 3 браузера (4%)

**Содержание:**
- Запуск Playwright matrix: Chromium + Firefox + WebKit (через `npm run e2e:matrix`)
- Smoke test: загрузка, scroll to bottom, все секции видны
- FPS test: ≥55fps desktop / ≥28fps mobile
- Memory test: ≤300 MB heap после 10 мин idle
- Axe test: 0 violations AA
- Тест drill-down Modal (открытие/закрытие/keyboard)
- Тест всех 13 симуляторов: clickable + keyboard accessible

**Критерии приёмки:**
- 3/3 браузера green
- Все 5 gate'ов (smoke + fps + memory + axe + modal) PASS

**Вес:** 4% / 100%

### C2. Lighthouse + axe-core (3%)

**Содержание:**
- Lighthouse CI: Performance / A11y / Best Practices / SEO
- Desktop target: P ≥80, A11y ≥95, BP ≥90, SEO ≥95
- Mobile target: P ≥70, A11y ≥95, BP ≥90, SEO ≥95
- axe-core CLI: 0 violations (WCAG 2.1 AA + Section 508)
- Отчёты сохраняются в `qa_reports/landing_v1.0/`

**Критерии приёмки:**
- Все Lighthouse таргеты достигнуты
- axe: 0 violations

**Вес:** 3% / 100%

### C3. П5 «Максимум» 32/32 + М4 7/7 (5%)

**Содержание:**
- Полная верификация по 32 механизмам (фактологические, числовые, документные, логические, источниковые, аудиторные)
- 74 acceptance criteria (60 base + 14 Holding):
  - №1–30: Contents (25 секций заполнены)
  - №31–45: Simulators (13 работают)
  - №46–60: Images (20 присутствуют, style_signature для 9 портретов)
  - №61–74: Holding-специфичные (бюджет, брендинг, tone-of-voice)
- Отчёт сохраняется в `Верификация_Лендинг_v1.0_П5.md` в обе папки
- М4 Презентационная 7/7: формат, согласованность, границы и т.д.

**Критерии приёмки:**
- 32/32 механизма оценены
- ≥30 green, 0 red (N/A допустимы при обосновании)
- 74/74 критерия проверены
- Отчёт подписан verdict: APPROVED

**Вес:** 5% / 100%

### C4. Багфиксы (6%)

**Содержание:**
- Устранение findings из C1–C3
- Обычно 2–3 итерации:
  - Итерация 1: критические баги (crash, non-working simulator)
  - Итерация 2: UI/UX polish (spacing, типографика)
  - Итерация 3: edge cases (старые браузеры, reduced-motion)
- Каждая итерация завершается повторным запуском C1/C2/C3

**Критерии приёмки:**
- 0 critical bugs
- 0 regressions
- Повторный прогон C1–C3 PASS

**Вес:** 6% / 100%

### C5. Релиз + git tag + обе папки (2%)

**Содержание:**
- `git add . && git commit -m "release: Landing v1.0"` на ветке `claude/landing-v1.0`
- PR в main с 4 green checks (Jest + Legacy + E2E + Matrix)
- Squash merge → main
- `git tag v1.0-landing-released` + `git push origin v1.0-landing-released`
- Финальный HTML копируется в обе папки: `/Холдинг/TrendStudio_Holding_Landing_v1.0.html` + `/TrendStudio-Holding/Landing_v1.0/TrendStudio_Holding_Landing_v1.0.html`
- Обновление MEMORY.md → новая запись `project_trendstudio_landing_v100_released.md`
- Обновление CLAUDE.md → запись о релизе в §8 (если есть)

**Критерии приёмки:**
- PR merged в main
- Tag создан и push'нут
- Обе папки содержат финальный HTML
- Memory-файл создан

**Вес:** 2% / 100%

### 🛑 Чекпоинт C (после C5) — RELEASED

**Критерий прохождения:**
- Все 5 подэтапов C выполнены
- Финальный HTML в обеих папках, работоспособен offline
- П5 отчёт APPROVED
- Tag создан

**Прогресс к моменту чекпоинта:** **100% / 100%** 🎉

---

## §5. Зависимости, риски и возможности

### 5.1 Критические зависимости (блокеры)

| Зависимость | От кого | Влияние при опоздании |
|-------------|---------|-----------------------|
| 20 raw-изображений из Nano Banana | Пользователь | Блокирует A4 (и весь этап B не стартует без canon) |
| Ответы на AskUserQuestion (коднеймы, роли) | Пользователь | Блокирует A3 (без ответа — placeholder) |
| Аппрувал чекпоинта A | Пользователь | Блокирует B1 |
| Аппрувал чекпоинта B | Пользователь | Блокирует C1 |

### 5.2 Риски (могут увеличить срок на 30–50%)

| Риск | Вероятность | Митигация |
|------|:-----------:|-----------|
| iOS Safari регрессии на Three.js bloom | Средняя | Fallback на CSS-анимацию |
| D3-interactivity + touch конфликты | Средняя | Раздельные handlers touch/mouse |
| Превышение бюджета изображений (>5 MB) | Низкая | mozjpeg Q70 второй проход |
| Axe violations на drill-down modal | Средняя | focus-trap библиотека |
| Nano Banana не воспроизводит style_signature стабильно | Средняя | Регенерация с меньшей temperature |
| Несовместимость GSAP plugins с CDN | Низкая | Inline fallback |

### 5.3 Возможности ускорения (−20–30%)

| Возможность | Потенциал |
|-------------|:---------:|
| Wave-паттерн в CC (5–7 параллельных субагентов на фазу) | −20% |
| MVP-режим (отказ от Three.js в s01 → только GSAP) | −15% |
| Упрощение симуляторов (6 Standard → 4 Standard) | −10% |
| Отказ от 3-browser matrix (только Chromium + WebKit) | −5% |
| Использование готовых D3-recipes из v1.2-deck Phase 2B | −10% |

Рекомендую **не экономить на П5 32/32 и a11y** — это ключевые критерии LP-презентации.

---

## §6. Формат отчётности о прогрессе

**После каждого подэтапа:**
1. Короткое сообщение в чат по шаблону:
   ```
   ✅ [A1] Canon base JSON готов.
      Прогресс: 3% / 100%.
      Следующий: [A2] Canon extended каркас.
   ```
2. Ссылки computer:// на новые/изменённые файлы
3. Если были нюансы/отклонения — краткая заметка (1–2 строки)
4. Если требуется решение пользователя — AskUserQuestion

**После каждого этапа (чекпоинт):**
- Развёрнутый summary этапа
- Прогресс: 10% / 80% / 100%
- Ссылки на все артефакты этапа
- AskUserQuestion с явным гейтом «go / no-go» на следующий этап

**При изменениях плана:**
- Все правки идут в этот файл (версия повышается до v1.1, v1.2 …)
- История изменений — §9

---

## §7. Точки аппрувала пользователя (checkpoints)

| Чекпоинт | Где | Что согласуется |
|----------|-----|-----------------|
| **A1-done** | После A1 | Тексты canon base — всё ли корректно по финмодели |
| **A3-gate** | Перед A3 | Выбор коднеймов и team-ролей (AskUserQuestion) |
| **A-final** | После A4 | Запуск этапа B в CC |
| **B1-done** | После B1 | Подтверждение каркаса HTML + палитры |
| **B3-done** | После B3 | Демо 13 симуляторов (скриншоты или live) |
| **B-final** | После B7 | Визуальное одобрение HTML |
| **C3-done** | После C3 | Подтверждение отчёта верификации |
| **C-final** | После C5 | Финальный релиз |

---

## §8. Артефакты (deliverables checklist)

После 100% готовности в обеих папках должны быть:

- [ ] `data_extract/canon_holding_base.json` (этап A)
- [ ] `data_extract/canon_holding_extended.json` (этап A)
- [ ] `src/landing/*` (исходники, этап B)
- [ ] `TrendStudio_Holding_Landing_v1.0.html` (финальный, этап C)
- [ ] `qa_reports/landing_v1.0/` (Lighthouse, axe, Playwright — этап C)
- [ ] `Верификация_Лендинг_v1.0_П5.md` (этап C)
- [ ] Git tag `v1.0-landing-released` (этап C)
- [ ] Memory-запись `project_trendstudio_landing_v100_released.md` (этап C)
- [ ] Обновление `MEMORY.md` индекса (этап C)

---

## §9. История изменений

| Версия | Дата | Изменения |
|:------:|------|-----------|
| 1.0 | 2026-04-19 | Первая версия плана. Утверждена пользователем как SSOT для работы над лендингом. |
| 1.1 | 2026-04-19 | Добавлен §-1 с зафиксированными решениями: старт после raw-изображений, этап B в wave-режиме. |

---

## §10. Приложение — Progress Tracker (живая таблица)

Статус обновляется по мере прохождения подэтапов.

| ID | Подэтап | Вес | Статус | Прогресс (cumulative) | Дата |
|:---:|---------|:---:|:------:|:----:|------|
| A1 | Canon base JSON | 3% | ⏳ pending | 0% | — |
| A2 | Canon extended каркас | 4% | ⏳ pending | 0% | — |
| A3 | AskUserQuestion: коднеймы + роли | 1% | ⏳ pending | 0% | — |
| A4 | Image metadata integration | 2% | ⏳ pending | 0% | — |
| **Чекпоинт A** | | | ⏳ | **10%** | — |
| B1 | Skeleton + libs | 7% | ⏳ pending | 0% | — |
| B2 | 25 секций скелеты | 10% | ⏳ pending | 0% | — |
| B3 | 13 симуляторов | 20% | ⏳ pending | 0% | — |
| B4 | Scroll storytelling | 12% | ⏳ pending | 0% | — |
| B5 | Mobile + Responsive | 8% | ⏳ pending | 0% | — |
| B6 | A11y + SEO + OG | 6% | ⏳ pending | 0% | — |
| B7 | Build final | 7% | ⏳ pending | 0% | — |
| **Чекпоинт B** | | | ⏳ | **80%** | — |
| C1 | Playwright 3 браузера | 4% | ⏳ pending | 0% | — |
| C2 | Lighthouse + axe | 3% | ⏳ pending | 0% | — |
| C3 | П5 32/32 + М4 7/7 | 5% | ⏳ pending | 0% | — |
| C4 | Багфиксы | 6% | ⏳ pending | 0% | — |
| C5 | Релиз + tag + папки | 2% | ⏳ pending | 0% | — |
| **Чекпоинт C (RELEASED)** | | | ⏳ | **100%** | — |

**Легенда статусов:**
- ⏳ pending — ожидает старта
- 🔄 in-progress — в работе
- ✅ done — завершено
- ⚠ blocked — заблокировано (зависимость)
- ❌ failed — не прошло критерий (требует итерации)
