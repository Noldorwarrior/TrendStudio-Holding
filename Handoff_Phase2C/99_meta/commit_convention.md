# Commit Convention — Phase 2C

## Формат коммита

```
<PREFIX>: <short description>

<optional body explaining WHY, not WHAT>

<optional footer: refs, co-authors>
```

**Правила:**
- Первая строка — до 72 символов
- Prefix + двоеточие + пробел + описание
- Описание в прошедшем или повелительном наклонении, английский
- Тело (если нужно) — после пустой строки

## Префиксы

| Prefix | Когда | Пример |
|---|---|---|
| `Infra:` | Волна 1 (скелет, build, i18n, e2e) | `Infra: skeleton src/cinematic/ and CSS baseline` |
| `G8:` .. `G17:` | Модули G8-G17 | `G13: TS.Keyboard global shortcut registry` |
| `Slide N:` | Слайд N (1-25) | `Slide 14: Valuation with WACC what-if slider` |
| `QA:` | QA PRs и отчёты | `QA: a11y sweep — 0 axe-core violations` |
| `Fix:` | Баг-фикс после ревью (в ту же ветку) | `Fix: G13 handles meta+key combinations` |
| `Docs:` | Обновление docs/* | `Docs: CC_CHECKLIST Wave 3 complete` |
| `Test:` | Только тесты, без прод-кода | `Test: G8 ambient memory leak integration test` |
| `Refactor:` | Рефакторинг без смены поведения | `Refactor: G13 extract key normalizer` |
| `Chore:` | Лицензии, gitignore, зависимости | `Chore: add puppeteer dev-dependency` |

## Примеры хороших коммитов

```
G13: TS.Keyboard global shortcut registry

Registry allows modules to register/unregister shortcuts with context.
Handles meta/ctrl/shift/alt combinations, normalizes across OS.
Reduced-motion and accessibility hooks added per INFRA_PROMPT §4.2.
```

```
Slide 14: Valuation with WACC what-if slider

Registered enter/exit via NAV.registerSlide(14).
Uses G16 TS.WhatIf for inline WACC adjustment (6-12%).
Chart updates reactively via TS.Charts.render.
```

## Примеры плохих (НЕ делать)

```
❌ fix stuff              — неконкретно, нет prefix
❌ g13 keyboard           — нет двоеточия, нет заглавной
❌ feat: added keyboard   — не используем conventional commits (мы на своём формате)
❌ WIP                    — не коммитим WIP в main-ветку
```

## Merge commits

Cowork мержит feature → base ветку с `--no-ff` (сохраняем историю веток):
```bash
git checkout claude/deck-v1.2.0-phase2c
git merge --no-ff phase2c/g13-keyboard -m "Merge G13: TS.Keyboard"
```

## Tag convention

- `v1.3.0-phase2c` — финальный tag после мержа в main
- Промежуточные tag'и: `v1.3.0-phase2c-wave1`, `v1.3.0-phase2c-wave2` (опционально)

_Версия: 1.0 (17 апр 2026)_
