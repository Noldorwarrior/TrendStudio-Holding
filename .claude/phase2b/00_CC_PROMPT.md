# Phase 2B — ТрендСтудио LP Investor Deck v1.2.0
## Главный промт для Claude Code

> Скопируйте этот промт целиком в Claude Code в корне репозитория TrendStudio-Holding.

---

## 0. ЧТО СДЕЛАТЬ

Реализовать Phase 2B LP Investor Deck v1.2.0: **7 интерактивных графиков + scenario switcher + 3 sliders + drill-down Modal**. Базируется на закрытой Phase 2A (commit `af54bc1`).

Бюджет: **650 KB** (поднять с 450 KB). Срок: **19–24 апреля 2026**. Верификация: **П5 «Максимум» 32/32** в конце. Целевая ветка: **`claude/deck-v1.2.0-phase2b`**.

---

## 1. ПЕРВЫЕ ШАГИ — ЧТО ЧИТАТЬ ПЕРЕД РАБОТОЙ

```bash
# 1. Создать ветку
git checkout -b claude/deck-v1.2.0-phase2b af54bc1

# 2. Положить карту памяти в корень ветки
cp /sessions/bold-magical-gauss/mnt/Холдинг/Phase2B_CC_Package/10_CLAUDE.md ./CLAUDE.md
git add CLAUDE.md && git commit -m "phase2b: add branch memory map"

# 3. Прочитать всю /sessions/bold-magical-gauss/mnt/Холдинг/Phase2B_CC_Package/ папку по порядку:
#    00_CC_PROMPT.md          — этот файл
#    10_CLAUDE.md             — память ветки (правила, артефакты, workflow)
#    20_SUBAGENT_GRAPH.md     — граф субагентов S40-S51 (зависимости, контракты)
#    30_DOCUMENT_MAP.md       — карта файлов в репо (что трогать, что не трогать)
#    40_CONTRACTS.md          — API-контракты между модулями
#    50_VERIFICATION.md       — план П5 32/32 и критерии приёмки
#    90_Phase2B_Handoff_v1.0.docx — полная спецификация (разделы 1-10)
```

## 2. БЮДЖЕТ И ГРАНИЦЫ

- HTML-артефакт ≤ **650 000 байт** (поднят с 450 000)
- Текущий baseline Phase 2A: 244 651 байт (38% от нового лимита)
- Ожидаемый прирост Phase 2B: **+190 000 байт** (чарты 85K + controls 10K + drilldown 8K + data 50K + CSS 8K + i18n 4K + тесты/разметка 25K)
- Целевой размер: **434 651 байт** (67% лимита, подушка 33% на Phase 2C/2D)

## 3. КОМАНДА СУБАГЕНТОВ (12 штук, граф в 20_SUBAGENT_GRAPH.md)

```
ФАЗА 1 (последовательно, ~3 часа):
  S40 Budget & Build  → S41 TS.Charts Core
                           ↓ (контракт публикуется)
ФАЗА 2 (параллельно, 7 окон, ~2 дня):
  S42 Revenue    S43 EBITDA    S44 IRR Heat
  S45 Pipeline   S46 CashFlow  S47 MC Dist   S48 Peers
                           ↓ (все чарты собраны)
ФАЗА 3 (параллельно, ~1 день):
  S49 Live-Controls ←→ S50 Drill-Down
                           ↓ (controls + drill)
ФАЗА 4 (~0.5 дня):
  S51 QA & Build (тесты, финальная сборка, budget-check)
```

## 4. ПРАВИЛА КОММИТОВ

Каждый субагент делает **один именной коммит** с префиксом:
```
S40: raise bundle budget to 650KB
S41: add TS.Charts core (canvas/svg helpers)
S42: implement Chart-1 Revenue waterfall
...
S51: phase2b final bundle + QA pass + P5 report
```

Финальный tag: **`v1.2.0-phase2b`** на коммите S51.

## 5. КОНТРАКТЫ (детали в 40_CONTRACTS.md)

- **TS.Charts.*** — API для всех 7 чартов (defined by S41)
- **TS.emit('scenario:changed', v)** / **TS.emit('param:changed', {rate, horizon, stress})** — события контролов (S49)
- **TS.emit('drilldown:open', {chart, payload})** — drill-down (S50 → TS.Components.Modal из Phase 2A)
- **URL state**: `#scenario=base&rate=15&horizon=5&stress=0` + sessionStorage fallback

## 6. ЧТО НЕ ТРОГАТЬ

- i18n ключи Phase 2A (280 RU / 280 EN) — только **добавлять** новые
- src/i18n.js, src/a11y.js, src/orchestrator.js, src/components.js — API стабильно, изменения только additive
- Существующие 25 слайдов-секций в HTML — только **расширение** разметки графиков внутри целевых слайдов
- 35 тестов Phase 2A — должны продолжать проходить

## 7. ВЕРИФИКАЦИЯ (детали в 50_VERIFICATION.md)

После S51 — **П5 «Максимум» 32/32**. Основная нагрузка: №3/4/20/23 (числовые — сверка цифр с deck_data), №25/26 (регрессия Phase 2A), №29 (кросс-модальность visual↔aria), №30 (стресс-тест производительности 7 чартов).

Артефакт верификации: `P5_Phase2B_Verification_Report_v1.0.docx` в `/sessions/bold-magical-gauss/mnt/Холдинг/`.

## 8. SSH PUSH

```bash
GIT_SSH_COMMAND="ssh -i ~/.git-ssh/id_ed25519 -o IdentitiesOnly=yes" \
  git push -u origin claude/deck-v1.2.0-phase2b
GIT_SSH_COMMAND="ssh -i ~/.git-ssh/id_ed25519 -o IdentitiesOnly=yes" \
  git push origin v1.2.0-phase2b
```

## 9. DELIVERABLES (11 шт.)

1. `scripts/build_html.py` с BUDGET=650000 — S40
2. `src/charts.js` (TS.Charts core) — S41
3. `src/charts/{revenue,ebitda,irr_sensitivity,pipeline_gantt,cashflow,mc_distribution,peers}.js` — S42-S48
4. `src/controls.js` — S49
5. `src/drilldown.js` — S50
6. `i18n/ru.json`, `i18n/en.json` расширены на ~60 ключей (symmetric RU/EN)
7. `deck_data_v1.2.0.json` обогащён MC/peers/sensitivity данными
8. `Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html` ≤ 650 000 байт
9. +35 unit + 5 integration tests
10. `P5_Phase2B_Verification_Report_v1.0.docx`
11. Git tag `v1.2.0-phase2b`

## 10. ESCALATION

Если при работе:
- **Бюджет 650 KB превышен** → отчёт S51 о весе по модулям → применить lazy-load Pipeline Gantt и MC Distribution
- **Контракт S41 блокирует S42-S48** → приостановить параллелизацию, дождаться S41
- **Data-gap в deck_data.json** (peers/MC отсутствуют) → использовать synthetic fallback + флаг в commit-msg
- **Срок 23 апреля под угрозой** → cut Chart-7 (Peers) в Phase 2C, сохраняя 6 чартов

---

**Начинай с S40 → S41. После S41 — параллель S42-S48. Удачи.**
