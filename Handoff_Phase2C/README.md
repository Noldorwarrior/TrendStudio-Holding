# Handoff Phase 2C — TrendStudio LP Deck v1.3.0 Cinematic

**Дата создания:** 17 апреля 2026
**Отправитель:** Cowork (Opus) — режиссёр/продюсер
**Получатель:** Claude Code (CC) — реализация
**Срок готовности:** 23 апреля 2026 (режим SPRINT) / 26 апреля (режим STANDARD)
**LP-встреча:** 29 апреля 2026

---

## ТОЧКА ВХОДА ДЛЯ CC

Вы читаете этот README в новой сессии CC. Ваша задача — реализовать Phase 2C Cinematic Premium Visual Overhaul поверх уже существующей Phase 2B (ветка `claude/deck-v1.2.0-phase2b`, tag `v1.2.0-phase2b`).

**Что вы НЕ делаете:**
- Не изменяете Phase 2A API (orchestrator.js, i18n.js, a11y.js, components.js)
- Не изменяете Phase 2B чарты (charts.js, charts/*.js) без явного разрешения в промте
- Не принимаете решения по дизайну — всё уже определено в master-файле (см. раздел «Источник правды» ниже)
- Не мержите PR сами — только push в origin, merge делает Cowork после ревью

**Что вы делаете:**
- Читаете промт-пакет в папках `00_infra/`, `10_modules/`, `20_slides/`, `30_qa/`
- Реализуете в feature-ветках (имена ветвей в `99_meta/branch_strategy.md`)
- Коммитите с префиксами из `99_meta/commit_convention.md`
- Пушите в origin и открываете PR
- Ждёте ревью/merge от Cowork

---

## ПОРЯДОК РАБОТЫ (Dependency-Driven)

См. `99_meta/CC_CHECKLIST.md` для пошагового плана. Кратко:

```
Волна 1 (5 параллельно):  INFRA — скелет src/cinematic/, CSS, test harness, i18n ключи, whatif_formulas.json
Волна 2 (2 параллельно):  G13 Keyboard + G17 ScrollTrigger (первые блокирующие)
Волна 3 (3 параллельно):  G8 Ambient + G9 Sound + G12 Parallax
Волна 4 (послед.):        G14 Context Menu → G15 Drag
Волна 5 (3 параллельно):  G11 Easter + G16 What-If + G10 Cinema Mode
Волна 6 (слайды, 3 пачки): 25 слайдов (LP CRITICAL первыми)
Волна 7 (QA):             a11y / perf / budget / П5 32/32
```

Итого: 5 infra + 10 modules + 25 slides + 4 QA = **44 PR**.

---

## СТРУКТУРА ПАПКИ

```
Handoff_Phase2C/
├── README.md                              ← этот файл
├── 00_infra/
│   ├── INFRA_PROMPT.md                    ← главный промт для Волны 1
│   ├── api_contracts/                     ← TypeScript-декларации API каждого модуля
│   └── test_templates/                    ← шаблоны тестов
├── 10_modules/                            ← 10 папок по модулям
│   ├── g08_ambient/MODULE_PROMPT.md
│   ├── g09_sound/MODULE_PROMPT.md
│   ├── g10_cinema/MODULE_PROMPT.md
│   ├── g11_easter/MODULE_PROMPT.md
│   ├── g12_parallax/MODULE_PROMPT.md
│   ├── g13_keyboard/MODULE_PROMPT.md      ← ПЕРВЫЙ в DAG
│   ├── g14_context_menu/MODULE_PROMPT.md
│   ├── g15_drag/MODULE_PROMPT.md
│   ├── g16_whatif/MODULE_PROMPT.md
│   └── g17_scroll_trigger/MODULE_PROMPT.md ← ПЕРВЫЙ после G13
├── 20_slides/                             ← 25 папок по слайдам (наполняются по мере готовности карт)
│   ├── slide_01_cover/
│   ├── slide_02_exec_summary/
│   └── ...
├── 30_qa/
│   ├── QA_BUDGET.md
│   ├── QA_A11Y.md
│   ├── QA_REGEX.md
│   └── QA_P5_32.md
└── 99_meta/
    ├── branch_strategy.md
    ├── commit_convention.md
    ├── CC_CHECKLIST.md                    ← пошаговый план
    └── dependency_graph.mmd
```

---

## ИСТОЧНИК ПРАВДЫ

**Master-файл (единственный авторитетный источник):**
`/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/CC_PHASE2C_SPEC_v2.md`

Если какой-либо промт противоречит master-файлу — master-файл прав. Открывайте issue, не действуйте по промту.

**Рабочие файлы пользователя:**
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/WORKFLOW_COWORK_CC.md` — роли и этапы
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/PROMPT_ARCHITECTURE.md` — типы промтов
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/DEPENDENCY_GRAPH.md` — DAG, матрица, даты

Read-only для CC. Не редактируйте эти файлы.

---

## РЕПО И ВЕТКИ

**Кодовая база:** `TrendStudio-Holding/` (этот репозиторий).
**Базовая ветка Phase 2C:** `claude/deck-v1.2.0-phase2c` (создаётся от tag `v1.2.0-phase2b`).
**Feature-ветки:** `phase2c/<module-or-slide>` — см. `99_meta/branch_strategy.md`.
**Handoff:** эта папка лежит в ветке `claude/phase2c-handoff` (параллельно рабочей). Обновляется Cowork'ом по мере готовности промтов.

---

## ПЕРВЫЙ ШАГ ДЛЯ CC

1. Прочтите `99_meta/CC_CHECKLIST.md` — там пошаговый план.
2. Прочтите `99_meta/commit_convention.md` и `99_meta/branch_strategy.md`.
3. Прочтите `00_infra/INFRA_PROMPT.md` — создайте скелет `src/cinematic/`.
4. Только после подтверждения Волны 1 переходите к `10_modules/g13_keyboard/MODULE_PROMPT.md`.

Не пропускайте шаги. Порядок имеет значение (DAG).

---

## КОНТАКТ

- Cowork: этот чат (rakhman + Opus), все вопросы и ревью здесь
- PR в origin: https://github.com/&lt;repo-url&gt; (определяется конфигом `git remote -v`)

_Версия README: 1.0 (17 апр 2026)_
