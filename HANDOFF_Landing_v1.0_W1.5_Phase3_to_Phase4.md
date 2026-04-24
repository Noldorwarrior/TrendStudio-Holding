# HANDOFF — TrendStudio Landing v1.0 / W1.5 Фаза 3 → Фаза 4 (новое диалоговое окно)

**Дата создания:** 2026-04-20
**Актуализировано:** 2026-04-24 (подтверждён dual-location MATCH, статус не изменился)
**Откуда:** W1.5 Фаза 3 ЗАКРЫТА (П5 «Максимум» 32/32 написан)
**Куда:** W1.5 Фаза 4 (финальная) — memory + MEMORY.md + TaskList + рапорт пользователю
**Общий прогресс Landing v1.0:** 20.00 % → будет 26.66 % по закрытии W1.5
**Dual-location MATCH:** подтверждён 2026-04-24 (`sha256sum` двух копий handoff-файла равны; актуальный хеш сообщается пользователю в рапорте — в теле файла не указываем, чтобы избежать self-reference при любом последующем редактировании).

Этот файл — **единственный** источник правды для старта новой сессии. Он содержит: quick-start, карты файлов/решений/памяти, пошаговый план Фазы 4 и следующих этапов, правила пользователя, open decisions, быстрые bash-команды для восстановления состояния.

---

## 0. QUICK START — что сделать в первом сообщении новой сессии

**Вариант A — копипаст первого сообщения пользователя в новом окне:**

> Продолжаем TrendStudio Landing v1.0. Контекст — в `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/HANDOFF_Landing_v1.0_W1.5_Phase3_to_Phase4.md`. Прочитай его целиком, подтверди контекст одной фразой и запусти W1.5 Фазу 4.

**Вариант B — первые действия Claude в новой сессии:**

1. **Прочитать** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/HANDOFF_Landing_v1.0_W1.5_Phase3_to_Phase4.md` (этот файл).
2. **Прочитать** `MEMORY.md` в памяти: `/Users/noldorwarrior/Library/Application Support/Claude/local-agent-mode-sessions/74270d03-efce-4f98-ba79-81c7d724ebc9/2c845b9d-bb1e-40a6-8372-5c14f2abf1d6/spaces/b863cdb6-362e-498e-9c90-a4da6f48db66/memory/MEMORY.md` (40 строк на 2026-04-20).
3. **Проверить sha256 ключевых артефактов** одним bash-запуском (команда в §9.1 ниже). Должно сойтись с §2 этого файла.
4. **Прогнать тесты W1.5** одним bash: `cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг" && node --test src/landing/__tests__/index.test.js` ⇒ ожидаем 22/22 PASS exit 0.
5. **Запустить Фазу 4** (шаги в §5).

**Язык общения:** только русский.
**Стиль:** этапный, с паузами; вопросы — через `AskUserQuestion`; длинные спеки — в md-файл, не в чат.

---

## 1. КОНТЕКСТ — где мы сейчас

### 1.1. Позиция в плане

```
TrendStudio Landing v1.0 (full plan):
  Stage A (Canon & Data)          10.00 %  ✅ CLOSED (checkpoint A passed)
  Stage B (Handoff & Planning)    12.00 %  ✅ CLOSED (B1b.4 HOTFIX → UNCONDITIONAL GO)
  Wave 1 Foundation              +70.00 %  ⬅ В ПРОЦЕССЕ
    W1.1 i18n scaffold            13.33 %  ✅ DONE
    W1.2 validators               16.66 %  ✅ DONE (task #31 hotfix pending)
    W1.3 TS-core (4 ядра)         18.33 %  ✅ DONE (М1 44/44)
    W1.4 CSS tokens               20.00 %  ✅ DONE (М2 56/56, WCAG AAA/AA)
    W1.5 HTML skeleton            ≈26.66 %  🟡 75% (Фаза 3 закрыта, Фаза 4 pending)
    W1.6 axe-core baseline         ?        ⏳ pending (task #19)
    W1 Verify (П5 на закрытие W1)  ?        ⏳ pending (task #20, блокер W2)
  Stage C (Release)               20.00 %  🔒 locked до закрытия W1
```

### 1.2. W1.5 — фазовая разбивка и текущее положение

| Фаза | Деливер | Статус | Артефакт |
|:----:|---------|:------:|----------|
| 1 | HTML skeleton + dual-location | ✅ DONE | `src/landing/index.html` (sha256 7d9d5251…) |
| 2 | index.test.js + прогон node:test × 2 локации | ✅ DONE | `src/landing/__tests__/index.test.js` (sha256 d4d8d312…), 44/44 PASS |
| 3 | П5 «Максимум» 32 механизма + отчёт md | ✅ DONE | `docs/landing/W1.5_HTML-skeleton_P5_verification.md` (sha256 d9675eba…) |
| **4** | **memory + MEMORY.md + TaskList update + рапорт** | **⏳ PENDING** | новый файл `project_trendstudio_landing_v100_w1_5_done.md` |

### 1.3. Конфигурация W1.5 (из AskUser, утверждённая пользователем)

Зафиксирована в **Фазе 0** текущей сессии:

| Параметр | Выбор |
|----------|-------|
| Скоуп | Полный (22 viz + 13 sim + 25 sections s01-s25 + hero + nav + footer) |
| Шрифты | Google Fonts CDN (Cormorant Garamond + Inter) |
| Тесты | 3 группы: №0 DOMParser/structure (10) + №Б canon-sync (7) + №В INV-06 security (5) = 22 |
| Верификация | П5 «Максимум» 32/32 |
| Работа | Этапами с паузами; вопросы через AskUserQuestion |
| Dual-location | Холдинг + TrendStudio-Holding; sha256 MATCH обязателен |
| Язык | Русский |

---

## 2. КАРТА ФАЙЛОВ — что где лежит на 2026-04-20

### 2.1. Dual-location — две рабочих копии репо

| Локация | Путь | Роль |
|---------|------|------|
| Холдинг (primary) | `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/` | Основная рабочая копия (Cowork) |
| TrendStudio-Holding (mirror) | `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/` | Зеркало для CC/git-операций |
| Канон | `Холдинг/data/` vs `TrendStudio-Holding/data_extract/` | Одно и то же содержимое, разные папки (исторически) |

### 2.2. Landing v1.0 артефакты (актуальные sha256 на 2026-04-20)

**W1.5 (фокус):**

| Файл | Путь (относительно корня) | Байт | Строк | SHA-256 (16) |
|------|---------------------------|-----:|------:|--------------|
| HTML skeleton | `src/landing/index.html` | 21 248 | 282 | `7d9d5251ddbc0bc1` |
| Test suite | `src/landing/__tests__/index.test.js` | 12 639 | 258 | `d4d8d3123f76cbef` |
| П5 verification report | `docs/landing/W1.5_HTML-skeleton_P5_verification.md` | 37 071 | 655 | `d9675eba6c72beea` |

**W1.4 CSS tokens:**

| Файл | Путь | Байт | SHA-256 (16) |
|------|------|-----:|--------------|
| tokens.json (SSOT) | `src/landing/styles/tokens.json` | 2 698 | `12f62a6213aca454` |
| tokens.css | `src/landing/styles/tokens.css` | 4 017 | `468c91e58b2cb18d` |
| tokens.test.js | `src/landing/styles/__tests__/tokens.test.js` | 12 789 | `4f748a7e2fe13984` |
| М2 verification | `docs/landing/W1.4_CSS-tokens_M2_verification.md` | ~10 500 | `8c5ce3397a15fafa` |

**W1.3 TS-core (4 ядра, barrel + 63 теста):**

| Файл | Путь |
|------|------|
| EventBus | `src/landing/core/event-bus.js` |
| I18N | `src/landing/core/i18n.js` |
| A11y | `src/landing/core/a11y.js` |
| Orchestrator | `src/landing/core/orchestrator.js` |
| Barrel | `src/landing/core/index.js` |
| Tests (5) | `src/landing/core/__tests__/*.test.js` |
| М1 отчёт | `docs/landing/W1.3_TS-core_M1_verification.md` (7 514 B) |

**W1.2 validators:**

| Файл | Путь |
|------|------|
| i18n-check | `scripts/i18n_check.py` (~13.8 KB, sha256 `fd9f49c6…`) |
| invariants-check | `scripts/invariants_check.py` (~14.8 KB, sha256 `1d244786…`) |
| INVARIANTS.md | Корень проекта (825 строк / 34 730 B / sha256 `c16d04be`) |

**W1.1 i18n scaffold:**

| Файл | Путь | Ключи |
|------|------|------:|
| landing_ru.json | `i18n/landing_ru.json` | 424 (9 namespaces) |
| landing_en.json | `i18n/landing_en.json` | 424 (symmetric) |

**Stage B (контрактные спеки):**

| Файл | Путь | Назначение |
|------|------|-----------|
| Canon Extended | `data/landing_canon_extended_v1.0.json` (Холдинг) / `data_extract/...` (TSH) | SSOT: 22 viz + 13 sim + 25 TOC + images/modals/forms/legal/hero/footer |
| Canon Base | `data/landing_canon_v1.0.json` | Родительская спецификация |
| img_meta | `data/landing_img_meta_v1.0.json` | 20 изображений с sha256/dims/alt ru/en |
| wave_plan | `docs/landing/wave_plan.json` | 6 волн 10→80% + 7 инвариантов |
| HANDOFF Stage B | `docs/landing/HANDOFF_Landing_v1.0_StageB_to_W1.md` | Core-хендофф (442 строки) |
| DETAIL B1b.1 | `docs/landing/B1b.1_DETAIL_viz-sim-specs.md` | 1391 строка, 22 viz-specs + 13 sim-specs |
| I18N blueprint B1b.2 | `docs/landing/B1b.2_I18N_blueprint.md` | 862 строки, 9 namespaces |

### 2.3. Что **изменилось** в текущей сессии

```
+ src/landing/index.html                                    (NEW, 21 248 B, sha256 7d9d5251…)
+ src/landing/__tests__/index.test.js                       (NEW, 12 639 B, sha256 d4d8d312…)
+ docs/landing/W1.5_HTML-skeleton_P5_verification.md        (NEW, 37 071 B, sha256 d9675eba…)
+ HANDOFF_Landing_v1.0_W1.5_Phase3_to_Phase4.md             (НЫНЕ СОЗДАЁТСЯ)

= Всё остальное БЕЗ изменений (W1.1…W1.4 артефакты байт-в-байт те же)
```

### 2.4. Команда для быстрой проверки всех sha256

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг"
sha256sum \
  src/landing/index.html \
  src/landing/__tests__/index.test.js \
  docs/landing/W1.5_HTML-skeleton_P5_verification.md \
  src/landing/styles/tokens.json \
  src/landing/styles/tokens.css
```

Ожидаемый вывод (первые 16 символов):
```
7d9d5251…  src/landing/index.html
d4d8d312…  src/landing/__tests__/index.test.js
d9675eba…  docs/landing/W1.5_HTML-skeleton_P5_verification.md
12f62a62…  src/landing/styles/tokens.json
468c91e5…  src/landing/styles/tokens.css
```

---

## 3. КАРТА РЕШЕНИЙ — что выбрали и почему

### 3.1. W1.5 архитектурные решения

| # | Решение | Альтернатива | Почему выбрано |
|--:|---------|--------------|----------------|
| 1 | `data-viz-id`/`data-sim-id` как контракт W2 | id-атрибут HTML | data-* семантически корректно для custom-атрибутов, не конфликтует с id на section |
| 2 | `aria-labelledby="sNN-title"` на `<section>` | `aria-label` | labelledby ссылается на видимый `<h2>`, более устойчиво к i18n |
| 3 | Google Fonts через `<link>` в `<head>` | `@import url()` в `<style>` | INV-06 запрещает @import url(; link быстрее (не блокирует CSSOM) |
| 4 | `<link rel="preconnect">` к `fonts.googleapis.com` + `fonts.gstatic.com` | только stylesheet link | preconnect экономит ~200ms на DNS/TLS-handshake |
| 5 | Тесты: native `node:test` + regex, без jsdom | jsdom для полного DOM | -14 MB зависимостей, +стабильность, +speed (67 ms) |
| 6 | Canon-path autodetect (data/ vs data_extract/) | захардкодить один путь | dual-location работает в обеих папках без изменения кода |
| 7 | `<a class="skip-link" href="#main">` первым в `<body>` | aria-landmarks без skip | WCAG AA требует explicit skip-link для клавиатурной навигации |
| 8 | `<h1>` в hero, `<h2>` в остальных секциях | все `<h2>` + aria-label на `<h1>` в header | Корректная a11y-иерархия: 1 h1 = 1 main topic = LP pitch |
| 9 | Modals/forms/legal — placeholder ссылки, реализация в W2 | сразу положить модали в skeleton | wave_plan разделяет W1 (структура) и W2 (runtime), W1.5 не должен содержать JS-логику |
| 10 | `data-scroll-spy="true"` атрибут вместо JS-привязки | JS addEventListener в inline-скрипте | INV-06 запрещает inline JS; атрибут-контракт W2 безопаснее |

### 3.2. Отказы (спор «за/против» из П5 №16)

| Отказались от | Обоснование |
|---------------|-------------|
| Inline CSS | Нарушает разделение слоёв; блокирует cache; ломает W2 hot-reload |
| `@import url()` в `<style>` | INV-06 ban + блокирует rendering |
| jsdom в тестах | +14 MB, медленнее, излишне для regex-based проверок |
| Все 13 modals в W1.5 | За скоупом wave_plan (W2 deliverable) |
| localStorage для preferences | INV-06 ban — только URL-state + sessionStorage (в W1.3 orchestrator) |
| Без skip-link | Нарушает WCAG AA |

### 3.3. WARN / Open decisions на момент W1.5

| # | Элемент | Класс | Handoff |
|--:|---------|:-----:|---------|
| 1 | `href="#m13"` (footer disclaimer) | WARN | W2 modals wave (добавит id="m13") |
| 2 | `/privacy`, `/terms` placeholder-роуты | INFO | W2 legal wave |
| 3 | viz/sim placeholders пусты (нет runtime) | BY-DESIGN | W2 runtime hookup |
| 4 | Формы s03/s18 отсутствуют | BY-DESIGN | W2 forms wave |
| 5 | INV-06 false-positive в invariants_check.py | Known (task #31) | hotfix до П5 на закрытие W1 |

---

## 4. КАРТА ПАМЯТИ — memory-файлы и MEMORY.md

### 4.1. Расположение memory-директории

`/Users/noldorwarrior/Library/Application Support/Claude/local-agent-mode-sessions/74270d03-efce-4f98-ba79-81c7d724ebc9/2c845b9d-bb1e-40a6-8372-5c14f2abf1d6/spaces/b863cdb6-362e-498e-9c90-a4da6f48db66/memory/`

Это persistent-директория уровня Cowork space — она сохраняется между сессиями.

### 4.2. MEMORY.md — текущий index (40 строк, на 2026-04-20)

Последняя запись (строка 40):
```
- [ТрендСтудио Landing v1.0 W1.4 CSS tokens DONE + М2](project_trendstudio_landing_v100_w1_4_done.md) — tokens.json/css/test (40/40 PASS×2 локации, 8/8 sha256 MATCH); М2 56/56 PASS; WCAG ratios 17.52/8.40/5.47/4.66/3.85; task #31 hotfix invariants_check (false-positive); 20%/100%; next W1.5 HTML skeleton
```

### 4.3. Memory-файлы по Landing v1.0 (14 шт)

| # | Файл | Кратко |
|--:|------|--------|
| 1 | `project_trendstudio_landing_v100_plan.md` | План v1.1 (3 этапа 10/70/20 %, 16 подэтапов) |
| 2 | `project_trendstudio_landing_v100_a1_done.md` | Canon Base JSON |
| 3 | `project_trendstudio_landing_v100_a2_done.md` | Canon Extended (23 UI-блока) |
| 4 | `project_trendstudio_landing_v100_a3_done.md` | AskUser gate (marquee tone, ru-first, CTA scroll-to-pipeline) |
| 5 | `project_trendstudio_landing_v100_a4_done.md` | img-meta + Checkpoint A |
| 6 | `project_trendstudio_landing_v100_b1a_done.md` | Handoff Stage B Core |
| 7 | `project_trendstudio_landing_v100_b1b1_done.md` | DETAIL viz/sim specs |
| 8 | `project_trendstudio_landing_v100_b1b2_done.md` | I18N blueprint |
| 9 | `project_trendstudio_landing_v100_b1b3_done.md` | wave_plan.json + INVARIANTS.md |
| 10 | `project_trendstudio_landing_v100_p5_verification_b.md` | П5 Stage B (CONDITIONAL GO) |
| 11 | `project_trendstudio_landing_v100_b1b4_done.md` | HOTFIX (F-01..F-04 → UNCONDITIONAL GO) |
| 12 | `project_trendstudio_landing_v100_w1_1_done.md` | i18n scaffold |
| 13 | `project_trendstudio_landing_v100_w1_2_done.md` | validators |
| 14 | `project_trendstudio_landing_v100_w1_3_done.md` | TS-core |
| 15 | `project_trendstudio_landing_v100_w1_4_done.md` | CSS tokens |

**Нужно создать в Фазе 4:** `project_trendstudio_landing_v100_w1_5_done.md` (16-й по Landing v1.0).

### 4.4. Memory-файлы feedback/reference (критичные для стиля работы)

| Файл | Кратко |
|------|--------|
| `feedback_staged_work_mode.md` | Этапный режим с паузами |
| `feedback_questions_interactive_panel.md` | Вопросы только через AskUserQuestion |
| `feedback_bundle_workflow.md` | Git bundle + pytest.skip паттерн |
| `feedback_md_output_no_chat_dump.md` | Объёмные спеки в md-файл, не в чат |
| `reference_rakhman_docs.md` | rakhman_docs.py утилита |
| `reference_sandbox_ssh_github.md` | SSH ключ для push из sandbox |
| `user_role.md` | Профиль пользователя |

### 4.5. Шаблон записи W1.5 (для Фазы 4)

```markdown
---
name: ТрендСтудио Landing v1.0 W1.5 HTML skeleton DONE + П5
description: W1.5 — index.html (21 248 B, 25 sections + 22 viz + 13 sim placeholders) + index.test.js (22/22 PASS×2 локации = 44/44) + П5 «Максимум» 30/30 PASS (2 N/A); 26.66%/100%; next W1.6 axe-core
type: project
---
# Landing v1.0 — W1.5 HTML skeleton CLOSED

**Дата:** 2026-04-20  **Режим:** Cowork (Sonnet 4.6)
**Общий прогресс:** 26.66% / 100% (+6.66 pp к W1.4 20.00%)

## Артефакты (3 файла = HTML + test + отчёт)

Dual-location — обе идентичны (sha256 MATCH × 2):
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/src/landing/`
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/src/landing/`

| Файл | Байт | Строк | SHA-256 (16) |
|---|---:|---:|---|
| index.html | 21 248 | 282 | 7d9d5251ddbc0bc1 |
| __tests__/index.test.js | 12 639 | 258 | d4d8d3123f76cbef |
| docs/landing/W1.5_HTML-skeleton_P5_verification.md | 37 071 | 655 | d9675eba6c72beea |

## Состав HTML skeleton

- DOCTYPE HTML5, `<html lang="ru">`
- meta: charset+viewport+theme-color+description+title
- 3× Google Fonts `<link>` (preconnect × 2 + stylesheet)
- `<link href="styles/tokens.css">` (из W1.4)
- `<body>` → skip-link → header+nav(TOC 25) → main#main (25 sections s01-s25) → footer
- 22 viz-placeholder (`data-viz-id` + `data-chart-type`)
- 13 sim-placeholder (`data-sim-id` + `data-engine`)
- Hero (s01): parallax layers + film reel (5 стиллов) + cta01 + dsc01
- Form s25: subscribe (f01 из canon)
- Footer: контакты + лицензия + /privacy /terms + #m13 disclaimer

## Тесты (22 = 10 + 7 + 5)

- Framework: native node:test + node:assert/strict + regex (zero-deps)
- Группы: №0 DOMParser structure (10), №Б canon sync (7), №В INV-06 security (5)
- Результат: 22/22 PASS × 2 локации = **44/44 PASS**, exit 0
- Canon-path autodetect: data/ (Холдинг) vs data_extract/ (TSH)

## Верификация П5 «Максимум»

**32 механизма:** 30 PASS + 0 FAIL + 1 WARN + 2 N/A (№8/№9 — pptx-специфика).
**Релевантные:** 30/30 PASS = 100 %.
**WARN:** `href="#m13"` (footer disclaimer) — плановый W2 TODO, не блокер.

Отчёт: `docs/landing/W1.5_HTML-skeleton_P5_verification.md` (sha256 d9675eba6c72beea, dual-location MATCH).

## Ключевые решения

- data-* атрибуты для контракта W2 runtime (не id)
- Google Fonts через `<link>`, не `@import url(` (INV-06)
- Zero-deps тестирование через regex (без jsdom)
- Canon-path autodetect для dual-location
- skip-link первым в body (WCAG AA)

## Осталось по W1 (до волны 2)

- **W1.6** — axe-core baseline (zero-violations gate) — Cowork (task #19)
- **W1.2-hotfix #31** — INV-06 comment/string-strip в invariants_check.py — до П5 закрытия W1
- **W1 Verify** — П5 «Максимум» 32/32 на закрытие W1 — Cowork (task #20, блокер W2)
```

### 4.6. Шаблон строки в MEMORY.md (строка 41, добавить в конец)

```
- [ТрендСтудио Landing v1.0 W1.5 HTML skeleton DONE + П5](project_trendstudio_landing_v100_w1_5_done.md) — index.html (21 248 B, 25 sections + 22 viz + 13 sim) + test 22/22 PASS×2 = 44/44 + П5 30/30 (2 N/A); 26.66%/100%; next W1.6 axe-core
```

---

## 5. W1.5 ФАЗА 4 — пошаговый план

**Требования пользователя:** этапы с паузами, вопросы через AskUserQuestion, отчёты не дампить в чат.

### 5.1. Шаг 1 — создать memory-файл W1.5

**Файл:** `project_trendstudio_landing_v100_w1_5_done.md` в memory-директории (путь §4.1).
**Содержание:** шаблон из §4.5.
**Инструмент:** `Write` (не Edit — новый файл).

### 5.2. Шаг 2 — обновить MEMORY.md

**Файл:** `MEMORY.md` в memory-директории.
**Действие:** добавить строку 41 (см. §4.6).
**Инструмент:** `Read` → `Edit` (добавить после строки 40).
**⚠️ CommonMark:** перед списком должна быть пустая строка — проверить, нужно ли.

### 5.3. Шаг 3 — обновить TaskList

**Операции:**

| Task | Старый статус | Новый статус |
|------|:-------------:|:-------------:|
| #18 «W1.5 HTML skeleton + section placeholders» | in_progress | **completed** |
| #19 «W1.6 axe-core baseline» | pending | — (не трогаем, следующий) |
| #20 «W1/Verify: П5 «Максимум» 32/32 на закрытии W1» | pending | — (не трогаем) |
| #31 «W1.2-hotfix: INV-06 comment/string-strip» | pending | — (не трогаем, до П5 W1) |

**Инструмент:** `TaskUpdate` через ToolSearch (`select:TaskUpdate`).

### 5.4. Шаг 4 — короткий рапорт пользователю

Короткое сообщение в чате с:
- Подтверждением закрытия Фазы 4
- Ссылкой `computer://` на memory-файл (опционально) + отчёт П5
- Блоком «Результаты верификации» (по правилу #10)
- Предложением перейти к W1.6 (axe-core baseline)

**Правило #10 (Результаты верификации):** после завершения П5 — блок вида:

```
**Результаты верификации П5 «Максимум»:**
- Проверено: 30 применимых механизмов из 32
- Найдено: 30 PASS / 0 FAIL / 1 WARN (#m13 плановый W2)
- Уверенность: 28/32 HIGH, 4/32 MEDIUM, 0 LOW
- dual-location sha256 MATCH подтверждён
```

**НЕ дампить** полный текст П5 в чат — только ссылка (правило `feedback_md_output_no_chat_dump`).

### 5.5. Шаг 5 — AskUser для следующего этапа

Через `AskUserQuestion` предложить варианты перехода:

```
Следующий шаг?
  A) W1.6 axe-core baseline (zero-violations gate)
  B) W1.2-hotfix #31 (INV-06 comment/string-strip) — прежде чем W1-Verify
  C) W1-Verify сразу (П5 «Максимум» 32/32 на закрытие W1) — блокер W2
  D) Пауза, обсудим что-то ещё
```

**Рекомендация в multipleChoice:** A → B → C (axe-core → hotfix → закрытие W1).

---

## 6. ЧТО ДАЛЬШЕ ПОСЛЕ W1.5 — карта следующих этапов

### 6.1. W1.6 axe-core baseline (task #19)

**Цель:** прогнать axe-core по `src/landing/index.html` → zero-violations gate (0 critical, 0 serious).
**Инструменты:** `@axe-core/cli` или `axe-core` через `puppeteer`/`playwright`.
**Деливер:**
- `scripts/axe_check.js` (zero-deps или npm-installed)
- `docs/landing/W1.6_axe-baseline_report.md` с выводом
- 0 violations → PASS gate
**Оценка:** ~30-60 минут (установка + прогон + отчёт + dual-location).

### 6.2. W1.2-hotfix #31 (INV-06 comment/string-strip)

**Проблема:** `scripts/invariants_check.py --wave W1` даёт 6 false-positive INV-06:
- 3 в `orchestrator.js` — JSDoc-комментарии
- 1 в `orchestrator.test.js` — имя теста
- 2 в `tokens.test.js` — JSDoc + assert на отсутствие

**Исправление:** regex в валидаторе должен strip'ить комментарии и строковые литералы до применения INV-06-фильтра.

**Деливер:** обновлённый `scripts/invariants_check.py` (sha256 изменится), прогон → 0 false-positives, dual-location MATCH.

### 6.3. W1 Verify — П5 «Максимум» 32/32 на закрытие W1 (task #20)

**Блокер волны 2.** Скоуп: весь W1 (W1.1…W1.6) как пакет.

**Деливер:**
- `docs/landing/W1_Verification_P5_Maximum.md` — сводный отчёт по всему W1 Foundation
- Регрессионный прогон всех тестов (W1.3 63/63 + W1.4 40/40 + W1.5 44/44 = 147 тестов × 2 локации = 294 прогонов)
- Регрессионный прогон `i18n_check.py` + `invariants_check.py` (после hotfix)
- Сводная таблица 32 механизмов с вердиктами
- Финальный вердикт: GO на Wave 2 (или GO с conditions)

### 6.4. Wave 2 (после W1-Verify — ≈70 %)

Wave 2 подключает runtime-слой:
- Реализация 22 визуализаций (recharts/d3/canvas по wave_plan)
- Реализация 13 симуляторов (mc_light, closed_form, lookup_table)
- Модали 13 шт (вкл. #m13 disclaimer)
- Формы 3 (f01 subscribe + f02/f03)
- i18n runtime loader + `data-i18n-key` → text
- Hero parallax + film reel animation

---

## 7. ПРАВИЛА И ПРЕДПОЧТЕНИЯ ПОЛЬЗОВАТЕЛЯ — ключевое

### 7.1. Общие

| № | Правило | Применимо к Фазе 4? |
|:-:|---------|:-------------------:|
| 1 | Триггер «ПРОМТ -» для workflow промтов | Нет |
| 2 | Ответы только на **русском** | **ДА** |
| 3 | Оценка длины ответа (токены) перед объёмными задачами | ДА (для рапорта — короткий) |
| 4 | Оценка объёма документа перед созданием | ДА (для memory — короткий, OK) |
| 5 | Госполитика РФ → ТАСС/РИА/Кремлин | Нет (не госдокумент) |
| 6 | DOCX defaults (A4, TNR 14pt, 2/2/3/1.5 см) | Нет (не docx) |
| 7 | Презентации: pptx → AskUser → HTML 16:9 | Нет |
| 8 | Для аналитики — методология в чате перед стартом | Нет (verification уже done) |
| 9 | Для аналитических записок — посыл + методология + вопросы | Нет |
| 10 | **Верификация: Нет/Малая/Полная + AskUser** | Уже done (П5) |

### 7.2. Этапный режим работы

(`feedback_staged_work_mode.md`)
- Работать **этапами с паузами**
- Ждать **подтверждения** пользователя между стадиями
- Не забегать вперёд

### 7.3. AskUserQuestion

(`feedback_questions_interactive_panel.md`)
- Все вопросы — **только** через интерактивную панель
- Никакого plain-text с вопросом в конце

### 7.4. Md-output

(`feedback_md_output_no_chat_dump.md`)
- Объёмные спеки (>2-3 KB) пишутся **в md-файл**
- В чате — короткое уведомление + ссылка
- Не «пересказывать» содержимое в чат

### 7.5. Dual-location

- Каждый артефакт дублируется: Холдинг + TrendStudio-Holding
- sha256 MATCH обязательно проверять
- Канон: `data/` (Холдинг) vs `data_extract/` (TSH)

### 7.6. Путь выходов

- Финальные деливеры → `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/` (+ mirror)
- Временные черновики → outputs (sandbox-специфичное, не показывать пользователю)
- Ссылки на файлы в чате — через `computer://` протокол

---

## 8. OPEN DECISIONS / BACKLOG

| # | Пункт | Где зафиксирован | Когда решать |
|:-:|-------|------------------|--------------|
| 1 | W1.6: каким инструментом прогонять axe (CLI vs puppeteer vs playwright) | Task #19 | При старте W1.6 |
| 2 | W1.2-hotfix #31: regex-стрип или polyglot-парсер (espree) | Task #31 | Перед W1-Verify |
| 3 | W1-Verify: объединённый отчёт vs 6 отдельных W1.x отчётов | Task #20 | При старте W1-Verify |
| 4 | Wave 2 split: monorepo commit-per-viz vs batch-per-wave | wave_plan.json | После закрытия W1 |
| 5 | Порядок W1.6 vs #31 vs W1-Verify | (см. §5.5) | AskUser пользователя после Фазы 4 |

---

## 9. БЫСТРЫЕ КОМАНДЫ для восстановления состояния в новой сессии

### 9.1. Проверить sha256 ключевых артефактов W1.5

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг"
sha256sum \
  src/landing/index.html \
  src/landing/__tests__/index.test.js \
  docs/landing/W1.5_HTML-skeleton_P5_verification.md
```

**Ожидаемо:**
```
7d9d5251ddbc0bc1b728708b1ee5339a5539d0cbfed48149e4bf57c749ed5e4c  src/landing/index.html
d4d8d3123f76cbef4ef9035b02f0eaaa0db151d927278098095044c9efa7a71b  src/landing/__tests__/index.test.js
d9675eba6c72beea8d5bb0fa4b3a77f1b74f58e81b22d87cc7c46e61d4feeddc  docs/landing/W1.5_HTML-skeleton_P5_verification.md
```

### 9.2. Проверить MATCH в TrendStudio-Holding

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding"
sha256sum \
  src/landing/index.html \
  src/landing/__tests__/index.test.js \
  docs/landing/W1.5_HTML-skeleton_P5_verification.md
```

(должно совпасть байт-в-байт с §9.1)

### 9.3. Прогон W1.5 тестов

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг"
node --test src/landing/__tests__/index.test.js 2>&1 | tail -10
```

**Ожидаемо:**
```
# tests 22
# suites 0
# pass 22
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms ≈ 60-100
```

### 9.4. Прогон всех тестов W1 (регрессия)

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг"
# W1.3 TS-core (5 тестов ядер)
node --test src/landing/core/__tests__/ 2>&1 | tail -5
# W1.4 tokens
node --test src/landing/styles/__tests__/tokens.test.js 2>&1 | tail -5
# W1.5 skeleton
node --test src/landing/__tests__/index.test.js 2>&1 | tail -5
```

### 9.5. Проверить i18n symmetry + invariants

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/Холдинг"
python3 scripts/i18n_check.py
python3 scripts/invariants_check.py --wave W1
```

(i18n_check → exit 0; invariants_check → 6 false-positives по известной проблеме task #31)

### 9.6. Состояние git (если нужно)

```bash
cd "/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding"
git status -sb
git log --oneline -5
```

### 9.7. MEMORY.md текущее состояние

```bash
wc -l "/Users/noldorwarrior/Library/Application Support/Claude/local-agent-mode-sessions/74270d03-efce-4f98-ba79-81c7d724ebc9/2c845b9d-bb1e-40a6-8372-5c14f2abf1d6/spaces/b863cdb6-362e-498e-9c90-a4da6f48db66/memory/MEMORY.md"
tail -3 "/Users/noldorwarrior/Library/Application Support/Claude/local-agent-mode-sessions/74270d03-efce-4f98-ba79-81c7d724ebc9/2c845b9d-bb1e-40a6-8372-5c14f2abf1d6/spaces/b863cdb6-362e-498e-9c90-a4da6f48db66/memory/MEMORY.md"
```

(40 строк, последние 3 строки — W1.2/W1.3/W1.4)

---

## 10. ГЛОССАРИЙ — для быстрого разбора терминов

| Термин | Значение |
|--------|----------|
| **SSOT** | Single Source Of Truth (например, `tokens.json` для CSS, `landing_canon_extended_v1.0.json` для структуры) |
| **INV-XX** | Инварианты из `INVARIANTS.md`: INV-01…INV-07 (a11y, i18n symmetry, reduced motion, dep isolation, NO storage/eval) |
| **INV-06** | Конкретно: запрет `localStorage`/`sessionStorage`/`eval(`/`new Function(`/`@import url()` в `<style>`/inline JS |
| **П5 «Максимум»** | Пресет верификации из 32 механизмов (govdoc-analytics:verification) |
| **М1/М2/М3** | Малая верификация: Базовая (М1), Расширенная (М2), Максимальная малая (М3) |
| **dual-location** | Две копии всех артефактов: Холдинг + TrendStudio-Holding, sha256 MATCH обязателен |
| **canon / canon extended** | `landing_canon_v1.0.json` / `landing_canon_extended_v1.0.json` — контракты структуры лендинга |
| **viz / sim** | Визуализации (22, chart-типы) / Симуляторы (13, интерактивные калькуляторы) |
| **wave_plan** | `docs/landing/wave_plan.json` — план волн W1-W6 с инвариантами |
| **W1 Foundation** | Волна 1 (подэтапы W1.1-W1.6 + W1-Verify), 10→80 % |
| **hybrid mode Cowork↔CC** | Cowork как supervisor (планирование/memory), Claude Code как executor (bash/git); актуально для Phase 2C deck, **НЕ** текущий landing |
| **AskUser / AskUserQuestion** | Интерактивная панель с multipleChoice для уточняющих вопросов (правило #10) |

---

## 11. КОНТАКТНЫЕ ТОЧКИ — куда смотреть при неясности

| Вопрос | Где искать ответ |
|--------|------------------|
| Структура лендинга (что где) | `data/landing_canon_extended_v1.0.json` |
| Инварианты безопасности и a11y | `INVARIANTS.md` |
| План волн W1-W6 | `docs/landing/wave_plan.json` |
| Детальные спеки viz/sim | `docs/landing/B1b.1_DETAIL_viz-sim-specs.md` |
| I18N ключи (9 namespaces) | `i18n/landing_ru.json` + `i18n/landing_en.json` |
| CSS токены | `src/landing/styles/tokens.json` + `tokens.css` |
| История W1 подэтапов | memory-файлы `project_trendstudio_landing_v100_w1_*_done.md` |
| Стиль работы пользователя | memory-файлы `feedback_*.md` + `user_role.md` |
| Предыдущие решения/альтернативы | П5-отчёты `docs/landing/*_P5_verification.md` |

---

## 12. ПОДПИСЬ HANDOFF

**Подготовил:** Claude (агент rakhman), Cowork mode, Sonnet 4.6.
**Дата:** 2026-04-20
**Цель:** передача полного контекста W1.5 Фаза 3 → Фаза 4 в новое диалоговое окно без потерь.
**Формат:** один md-файл, dual-location, sha256 MATCH.

**Первое сообщение в новой сессии:** см. §0 Quick Start.

---

**Конец handoff.**
