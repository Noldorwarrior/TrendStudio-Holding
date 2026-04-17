# CC_CHECKLIST.md — Пошаговый план для Claude Code

**Назначение:** единственный чек-лист, по которому CC работает. Читается целиком перед началом. Проверяется перед каждым переходом к следующей волне.

---

## ПРЕДВАРИТЕЛЬНО (один раз, Волна 0)

- [ ] Прочитать `Handoff_Phase2C/README.md`
- [ ] Прочитать `99_meta/branch_strategy.md`
- [ ] Прочитать `99_meta/commit_convention.md`
- [ ] Убедиться, что tag `v1.2.0-phase2b` существует в origin: `git fetch --tags && git tag | grep phase2b`
- [ ] Создать ветку `claude/deck-v1.2.0-phase2c` от tag `v1.2.0-phase2b`:
      ```bash
      git checkout v1.2.0-phase2b
      git checkout -b claude/deck-v1.2.0-phase2c
      git push -u origin claude/deck-v1.2.0-phase2c
      ```
- [ ] Убедиться, что тесты Phase 2A+2B зелёные: 350+ passing
      **Mixed runner mode approved by Cowork 2026-04-17:** Phase 2A/2B тесты
      запускаются через `node src/**/*.test.js` (исторический раннер), новые
      Phase 2C тесты — через jest. После Волны 6 — отдельный Chore-PR мигрирует
      2A/2B на jest. Команда: `node scripts/run-legacy-tests.js && jest`.

---

## ВОЛНА 1 — ИНФРА (5 PR параллельно)

**Промт:** `00_infra/INFRA_PROMPT.md`

### PR #101 — Skeleton
- [ ] Создать папку `src/cinematic/` с пустыми js-файлами (keyboard.js, scroll_trigger.js, ambient.js, sound.js, parallax.js, context_menu.js, drag.js, easter.js, whatif.js, cinema_mode.js)
- [ ] Создать папку `src/cinematic/__tests__/` с empty test файлами
- [ ] Создать `src/slides/` и `src/slides/__tests__/`
- [ ] Создать `src/css/cinematic.css` (базовые variables, keyframes)
- [ ] Создать `src/css/slides_phase2c.css` (пустой)
- [ ] Branch: `phase2c/infra-skeleton`
- [ ] Commit: `Infra: skeleton src/cinematic/ and src/slides/`
- [ ] PR title: `Phase 2C Infra: skeleton directories and CSS baseline`

### PR #102 — Build + Budget
- [ ] Обновить `scripts/build_html.py` для включения `src/cinematic/*.js` и `src/slides/*.js`
- [ ] Создать `scripts/check_budget.js` — проверяет HTML ≤ 650 KB
- [ ] Branch: `phase2c/infra-build`
- [ ] Commit: `Infra: build_html.py includes cinematic + budget check script`

### PR #103 — I18N Keys
- [ ] Добавить ~80 новых ключей в `i18n/ru.json` и `i18n/en.json` (ui.gN.*, a11y.sNN.*, ui.sNN.* для слайдов 1-25 — по списку в INFRA_PROMPT разделе 6)
- [ ] Убедиться симметрии: каждый ключ в ru ↔ en
- [ ] Тест симметрии (если нет — создать): `src/__tests__/i18n_symmetry.test.js`
- [ ] Branch: `phase2c/infra-i18n`
- [ ] Commit: `Infra: i18n keys for Phase 2C (~80 keys, RU/EN symmetric)`

### PR #104 — What-If Data
- [ ] Создать `data_extract/whatif_formulas.json` с 3-5 формулами для слайдов 12, 14, 17
- [ ] Формулы: `{ "slide14_wacc": { "formula": "...", "inputs": [...], "output": "..." } }` (см. INFRA_PROMPT раздел 5.3)
- [ ] Branch: `phase2c/infra-whatif-data`
- [ ] Commit: `Infra: whatif_formulas.json for G16 module`

### PR #105 — E2E Setup
- [ ] Установить puppeteer / playwright для e2e (lightweight)
- [ ] Создать `scripts/e2e_runner.js` — запускает headless Chromium, делает скриншот слайда, проверяет FPS
- [ ] Добавить `package.json` скрипт `"e2e": "node scripts/e2e_runner.js"`
- [ ] Branch: `phase2c/infra-e2e`
- [ ] Commit: `Infra: e2e runner with puppeteer/playwright`

**ПЕРЕД ВОЛНОЙ 2:** убедиться, что PR #101-#105 смержены в `claude/deck-v1.2.0-phase2c`. Запустить `npm test` — должно быть зелено.

---

## ВОЛНА 2 — G13 + G17 (2 PR параллельно)

**Промты:** `10_modules/g13_keyboard/MODULE_PROMPT.md`, `10_modules/g17_scroll_trigger/MODULE_PROMPT.md`

### PR #110 — G13 Keyboard
- [ ] Следовать `10_modules/g13_keyboard/MODULE_PROMPT.md`
- [ ] Self-check перед коммитом
- [ ] Branch: `phase2c/g13-keyboard`
- [ ] Commit: `G13: TS.Keyboard global shortcut registry`

### PR #111 — G17 ScrollTrigger
- [ ] Следовать `10_modules/g17_scroll_trigger/MODULE_PROMPT.md`
- [ ] Self-check перед коммитом
- [ ] Branch: `phase2c/g17-scroll-trigger`
- [ ] Commit: `G17: TS.ScrollTrigger IntersectionObserver + slide lifecycle`

---

## ВОЛНА 3 — G8 + G9 + G12 (3 PR параллельно)

**Промты:** `10_modules/g08_ambient/`, `g09_sound/`, `g12_parallax/`

### PR #112 — G8 Ambient
- [ ] Реализация по промту (Canvas, 5 пресетов, FPS auto-degrade)
- [ ] Branch: `phase2c/g08-ambient`
- [ ] Commit: `G8: TS.Ambient particles engine (5 presets)`

### PR #113 — G9 Sound
- [ ] Реализация по промту (WebAudio, default OFF, UI toggle)
- [ ] Branch: `phase2c/g09-sound`
- [ ] Commit: `G9: TS.Sound WebAudio procedural generator`

### PR #114 — G12 Parallax
- [ ] Реализация по промту (mousemove, 6 depth layers, lerp 0.08)
- [ ] Branch: `phase2c/g12-parallax`
- [ ] Commit: `G12: TS.Parallax mouse-based depth layers`

---

## ВОЛНА 4 — G14 → G15 (последовательно)

### PR #115 — G14 Context Menu
- [ ] Реализация по промту (glass morphism, 240px, right-click)
- [ ] Branch: `phase2c/g14-context-menu`
- [ ] Commit: `G14: TS.ContextMenu custom right-click menu`

### PR #116 — G15 Drag (только после мержа G14)
- [ ] Реализация по промту (PointerEvent, keyboard alternative)
- [ ] Branch: `phase2c/g15-drag`
- [ ] Commit: `G15: TS.Drag framework with keyboard fallback`

---

## ВОЛНА 5 — G11 + G16 + G10 (3 PR параллельно)

### PR #117 — G11 Easter Eggs
- [ ] Реализация по промту (EE-1..EE-7 registration framework)
- [ ] Branch: `phase2c/g11-easter`
- [ ] Commit: `G11: TS.Easter eggs framework (7 eggs registered)`

### PR #118 — G16 What-If
- [ ] Реализация по промту (dblclick numbers, formulas from JSON)
- [ ] Branch: `phase2c/g16-whatif`
- [ ] Commit: `G16: TS.WhatIf inline parameter editor`

### PR #119 — G10 Cinema Mode
- [ ] Реализация по промту (fullscreen + letterbox + grain boost, key `C`)
- [ ] Branch: `phase2c/g10-cinema`
- [ ] Commit: `G10: TS.Cinema fullscreen cinematic mode`

**ПЕРЕД ВОЛНОЙ 6:** все 10 модулей протестированы, `npm test src/cinematic/` зелёно. Бюджет HTML — пока опционально, т.к. слайды ещё не добавлены.

---

## ВОЛНА 6 — СЛАЙДЫ (25 PR в 3 пачках)

**Промты:** `20_slides/slide_NN_*/SLIDE_PROMPT.md` — появляются по мере готовности карт в Cowork.

### Пачка 1 — LP CRITICAL (первый релиз слайдов)
PR #201-#208: слайды 2, 5, 12, 14, 17, 18, 20, 22

### Пачка 2 — Базовые + рынок
PR #209-#216: слайды 1, 3, 4, 25, 7, 8, 9, 10

### Пачка 3 — Методология + детали
PR #217-#225: слайды 6, 11, 13, 15, 16, 19, 21, 23, 24

Каждый слайд:
- [ ] Branch: `phase2c/slide-NN`
- [ ] Commit: `Slide N: <title> with <key-feature>`
- [ ] Следовать SLIDE_PROMPT.md в соответствующей папке
- [ ] Тесты: unit + a11y + перейти-вернуться (enter/exit idempotence)

---

## ВОЛНА 7 — QA (4 отчёта)

**Промты:** `30_qa/*.md`

### QA #1 — A11Y
- [ ] Следовать `30_qa/QA_A11Y.md`
- [ ] axe-core на каждом слайде, 0 violations
- [ ] Отчёт: `docs/qa/phase2c_a11y_report.md`

### QA #2 — PERF
- [ ] Следовать `30_qa/QA_PERF.md`
- [ ] FPS ≥ 45 на каждом слайде (headless Chromium)
- [ ] Memory leak test: 10 раз нав по всем слайдам, heap не растёт
- [ ] Отчёт: `docs/qa/phase2c_perf_report.md`

### QA #3 — BUDGET + REGEX
- [ ] Следовать `30_qa/QA_BUDGET.md` и `QA_REGEX.md`
- [ ] `node scripts/check_budget.js` — HTML ≤ 650 KB
- [ ] `grep -rn 'eval\|localStorage\|new Function' src/` — 0 results
- [ ] Отчёт: `docs/qa/phase2c_budget_regex_report.md`

### QA #4 — П5 32/32 (финальный)
- [ ] Следовать `30_qa/QA_P5_32.md`
- [ ] Полная верификация 32 механизмов, цель ≥30 зелёных, 0 красных
- [ ] Отчёт: `docs/qa/phase2c_p5_report.md`

---

## ФИНАЛ (Cowork делает)

- [ ] Cowork ревьюит QA-отчёты
- [ ] Cowork сливает `claude/deck-v1.2.0-phase2c` → `main`
- [ ] Cowork создаёт tag `v1.3.0-phase2c`
- [ ] Cowork собирает финальный HTML в `Deck_v1.3.0/TrendStudio_LP_Deck_v1.3.0_Interactive.html`

---

## ПРАВИЛА РАБОТЫ CC

1. **Один PR = один модуль/слайд/QA.** Не смешивать.
2. **Перед коммитом — self-check.** Команды в конце каждого промта.
3. **Не мержить PR самостоятельно.** Только push + описание.
4. **Если промт противоречит master-файлу** (`Холдинг/CC_PHASE2C_SPEC_v2.md`) — master-файл прав. Открыть issue, остановиться.
5. **Если тест падает** — разобраться, а не отключать. Если не получается — открыть issue.
6. **Не изменять Phase 2A/2B файлы** без явного разрешения в промте.
7. **Комментарии в коде на английском** (код универсальный); в чате PR — на русском, Cowork ревьюит на русском.

_Версия: 1.0 (17 апр 2026)_
