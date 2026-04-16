# 30_DOCUMENT_MAP.md — Карта файлов репозитория

**Ветка:** `claude/deck-v1.2.0-phase2b` (base: `af54bc1`)
**Правило:** субагент меняет только файлы из колонки «Owner». Всё остальное — **read-only**.

---

## Легенда

- 🟢 **CREATE** — файла ещё нет, субагент создаёт
- 🟡 **MODIFY** — файл существует, редактируется (осторожно, контракт стабилен)
- 🔴 **READ-ONLY** — только чтение, запрещено модифицировать
- 🔵 **APPEND** — добавлять новые записи, существующие не трогать

---

## Раздел A. Инфраструктура (S40)

| Файл | Статус | Owner | Комментарий |
|------|--------|-------|-------------|
| `scripts/build_html.py` | 🟡 MODIFY | **S40** | Поднять `BUDGET = 650_000`, обновить комментарий |
| `CLAUDE.md` | 🔴 READ-ONLY | — | Уже положен в корень (S40 не меняет) |
| `.gitignore` | 🔴 READ-ONLY | — | Не трогать без согласования |

---

## Раздел B. TS.Charts core (S41)

| Файл | Статус | Owner | Комментарий |
|------|--------|-------|-------------|
| `src/charts.js` | 🟢 CREATE | **S41** | TS.Charts namespace, canvas/svg/tooltip/axis/legend/palette |
| `src/charts.test.js` | 🟢 CREATE | **S41** | ≥ 8 unit-тестов на helpers |

---

## Раздел C. 7 чартов (S42–S48) — параллельная фаза

| Файл (source) | Файл (test) | Owner | Ключи i18n | Data-dep |
|---------------|-------------|-------|------------|----------|
| `src/charts/revenue.js` 🟢 | `src/charts/revenue.test.js` 🟢 | **S42** | `ui.chart.revenue.*`, `a11y.chart.revenue.*`, `ui.drilldown.revenue.*` | `pipeline.revenue_by_year[]` |
| `src/charts/ebitda.js` 🟢 | `src/charts/ebitda.test.js` 🟢 | **S43** | `ui.chart.ebitda.*`, `a11y.chart.ebitda.*`, `ui.drilldown.ebitda.*` | `pnl.ebitda_breakdown[]` |
| `src/charts/irr_sensitivity.js` 🟢 | `src/charts/irr_sensitivity.test.js` 🟢 | **S44** | `ui.chart.irr.*`, `a11y.chart.irr.*`, `ui.drilldown.irr.*` | `sensitivity.irr_matrix[][]` |
| `src/charts/pipeline_gantt.js` 🟢 | `src/charts/pipeline_gantt.test.js` 🟢 | **S45** | `ui.chart.pipeline.*`, `ui.project.p1-p7.*`, `a11y.chart.pipeline.*` | `pipeline.projects[]` |
| `src/charts/cashflow.js` 🟢 | `src/charts/cashflow.test.js` 🟢 | **S46** | `ui.chart.cashflow.*`, `a11y.chart.cashflow.*`, `ui.drilldown.cashflow.*` | `cashflow.yearly[]` |
| `src/charts/mc_distribution.js` 🟢 | `src/charts/mc_distribution.test.js` 🟢 | **S47** | `ui.chart.mc.*`, `a11y.chart.mc.*`, `ui.drilldown.mc.*` | `mc.irr_distribution[]` |
| `src/charts/peers.js` 🟢 | `src/charts/peers.test.js` 🟢 | **S48** | `ui.chart.peers.*`, `ui.peers.<code>.*`, `a11y.chart.peers.*` | `peers.comparables[]` |

**Правило параллелизации:** каждый субагент работает **только** в своей папке. Если кажется, что нужно поменять `charts.js`, `components.js` или чужой чарт — **стоп, создать `DEFER_S4X.md`** и передать оператору.

---

## Раздел D. Live-Controls + Drill-Down (S49, S50)

| Файл | Статус | Owner | Комментарий |
|------|--------|-------|-------------|
| `src/controls.js` 🟢 | CREATE | **S49** | Scenario switcher + 3 sliders (rate/horizon/stress), URL-state sync |
| `src/controls.test.js` 🟢 | CREATE | **S49** | ≥ 6 unit-тестов (каскад state, event emit, URL/session) |
| `src/drilldown.js` 🟢 | CREATE | **S50** | Расширение TS.Components.Modal для chart-контекста |
| `src/drilldown.test.js` 🟢 | CREATE | **S50** | ≥ 5 unit-тестов (open/close, payload rendering) |

---

## Раздел E. Данные и i18n (добавляют S41, S45, S47, S48)

| Файл | Статус | Owner | Что добавляется |
|------|--------|-------|-----------------|
| `data_extract/deck_data_v1.2.0.json` | 🔵 APPEND | **S41** (audit schema), **S45** (projects enrich), **S47** (MC distribution), **S48** (peers data) | Новые секции: `sensitivity`, `mc`, `peers`, `cashflow.yearly` |
| `i18n/ru.json` | 🔵 APPEND | каждый чарт-субагент + S49/S50 | Новые ключи по convention `ui.chart.*`, `ui.control.*`, `ui.drilldown.*`, `a11y.chart.*` |
| `i18n/en.json` | 🔵 APPEND | каждый чарт-субагент + S49/S50 | Symmetric с ru.json. Значения либо EN-перевод, либо stub `[EN:key]` |

**⚠️ Критически важно:** не менять существующие ~280 ключей Phase 2A — только добавлять. S51 проверит `len(ru.json) == len(en.json)` и зафейлит билд при дисбалансе.

---

## Раздел F. Phase 2A — НЕ ТРОГАТЬ API

| Файл | Статус | Кто читает | Комментарий |
|------|--------|------------|-------------|
| `src/i18n.js` | 🔴 READ-ONLY | все чарт-субагенты | `I18N.t(key)`, `I18N.formatCurrency/formatNumber` — стабильно |
| `src/a11y.js` | 🔴 READ-ONLY | все чарт-субагенты | `A11Y.announce`, `A11Y.focusTrap` |
| `src/orchestrator.js` | 🔴 READ-ONLY | S49 | URL/hash/session cascade |
| `src/components.js` | 🔴 READ-ONLY | S50 (расширяет Modal через композицию, не правит исходник) | TS.Components.Modal/Tabs/Carousel |
| `src/components.test.js` | 🔴 READ-ONLY | — | 35 passing тестов — не менять |

**Если нужна правка Phase 2A API:** остановить работу, согласовать с оператором через `DEFER_API_CHANGE.md`.

---

## Раздел G. HTML артефакт и слайды (S51 собирает)

| Файл | Статус | Owner | Комментарий |
|------|--------|-------|-------------|
| `Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html` | 🟡 MODIFY | **S51** (финальная сборка) | Результат build_html.py; размер ≤ 650 000 байт |
| `Deck_v1.2.0/slides/*.html` | 🟡 MODIFY | каждый чарт-субагент в своём слайде | Добавить `<div data-chart="revenue">` и аналогичные контейнеры, **не трогать** структуру слайда |

Точечное правило: если чарту нужен свой контейнер в `slide_NN.html`, субагент может добавить **только** элемент `<div class="ts-chart" data-chart-id="..." data-i18n-label="..."></div>` — никаких других изменений разметки.

---

## Раздел H. Верификация и отчёты (S51)

| Файл | Статус | Owner | Комментарий |
|------|--------|-------|-------------|
| `tests/e2e_phase2b.py` или `.js` | 🟢 CREATE | **S51** | 5 integration-тестов: scenario switch, sliders, drilldown, URL persistence, budget |
| `P5_Phase2B_Verification_Report_v1.0.docx` | 🟢 CREATE | **S51** | Финальный отчёт П5 32/32 (через docx-js) — сохранить в `/sessions/bold-magical-gauss/mnt/Холдинг/` |
| `CHANGELOG_v1.2.0-phase2b.md` | 🟢 CREATE | **S51** | Что добавлено в Phase 2B (subset для release notes) |

---

## Раздел I. Конфликт-резолюция

Если два субагента параллельно редактируют один файл (кроме `i18n/*.json` с APPEND-only):

1. **В большинстве случаев этого не должно происходить** — см. колонку Owner.
2. Если конфликт в `data_extract/deck_data_v1.2.0.json` (S41 audit vs S47/S48 enrich) — S41 мёржится первым, остальные ребейзятся.
3. Если конфликт в `i18n/*.json` — ключи по пространству имён не пересекаются (префиксы `ui.chart.<id>.*`), проблема отсутствует. Если возникнет — алфавитная сортировка + merge.
4. HTML-слайды: каждый чарт — в своём слайде (см. 90_Phase2B_Handoff.docx §3), пересечений нет.

---

## Раздел J. Чек-лист перед коммитом (для каждого субагента)

- [ ] Только файлы из колонки Owner изменены (см. `git diff --name-only`)
- [ ] Новые ключи i18n симметричны (ru + en)
- [ ] Тесты пишутся одновременно с реализацией (min 5 на чарт-субагента)
- [ ] Нет `eval`, `new Function`, `localStorage` (использовать `sessionStorage`)
- [ ] Commit-msg в формате `S<code>: <описание>`
- [ ] После коммита — проверка `python scripts/build_html.py --check-budget` (если S51 или финальный тест)
