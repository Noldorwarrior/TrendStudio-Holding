# CLAUDE.md — Phase 2B Branch Memory Map

**Ветка:** `claude/deck-v1.2.0-phase2b` (base: `af54bc1`)
**Фаза:** 2B — Interactive Charts + Live Controls + Drill-Down
**Срок:** 19–24 апреля 2026
**LP-встреча:** 29 апреля 2026

---

## 0. ЯЗЫК И СТИЛЬ ОБЩЕНИЯ

- Отвечать пользователю на **русском языке**
- Вопросы задавать через **AskUserQuestion** (интерактивная панель), не plain-text
- Работать **этапами с паузами**, ждать подтверждения между фазами
- Перед объёмной задачей — оценить длину и предложить разбивку

## 1. АРТЕФАКТЫ (что где лежит)

```
TrendStudio-Holding/
├── CLAUDE.md                                    ← этот файл (branch memory)
├── scripts/
│   └── build_html.py                            ← BUDGET=650000, S40
├── src/
│   ├── i18n.js, a11y.js, orchestrator.js,      ← Phase 2A (НЕ ТРОГАТЬ API)
│   │   components.js, components.test.js
│   ├── charts.js                                ← S41, TS.Charts core
│   ├── charts/                                  ← S42-S48
│   │   ├── revenue.js        revenue.test.js
│   │   ├── ebitda.js         ebitda.test.js
│   │   ├── irr_sensitivity.js irr_sensitivity.test.js
│   │   ├── pipeline_gantt.js  pipeline_gantt.test.js
│   │   ├── cashflow.js       cashflow.test.js
│   │   ├── mc_distribution.js mc_distribution.test.js
│   │   └── peers.js          peers.test.js
│   ├── controls.js           controls.test.js  ← S49
│   └── drilldown.js          drilldown.test.js ← S50
├── i18n/
│   ├── ru.json                                  ← 280 + ~60 новых ключей
│   └── en.json                                  ← symmetric с ru.json
├── data_extract/
│   └── deck_data_v1.2.0.json                    ← обогатить (S41 audit, S47/S48 additions)
├── Deck_v1.2.0/
│   └── TrendStudio_LP_Deck_v1.2.0_Interactive.html ← ≤ 650 000 байт
└── .git-ssh/
    └── id_ed25519                               ← для push origin
```

## 2. ОБЯЗАТЕЛЬНЫЕ КОНТРАКТЫ

### TS.Charts (public, defined in S41, src/charts.js)

```javascript
TS.Charts = {
  // Низкоуровневые helpers
  createCanvas(container, width, height),
  createSVG(container, width, height),
  axisX(ctx, domain, opts),
  axisY(ctx, domain, opts),
  tooltip(el, content),
  legend(container, items),

  // Форматтеры (используют I18N.formatCurrency/formatNumber из Phase 2A)
  formatValue(v, type),

  // Палитра
  palette: {
    base: '#0070C0',    bull: '#2E7D32',  bear: '#C62828',
    positive: '#4CAF50', negative: '#F44336', neutral: '#757575',
    stage: { pre: '#9E9E9E', prod: '#1976D2', post: '#7B1FA2', release: '#388E3C' }
  },

  // Регистрация чарта
  register(chartId, renderFn),
  render(chartId, container, payload),
  destroy(chartId)
};
```

### События (TS.emit / TS.on из Phase 2A)

```javascript
TS.emit('scenario:changed', 'base' | 'bull' | 'bear');
TS.emit('param:changed', { rate: 15, horizon: 5, stress: 0 });
TS.emit('drilldown:open', { chart: 'revenue', payload: {...} });
TS.emit('chart:rendered', { chartId, durationMs });
```

### URL-State (orchestrator из Phase 2A)

```
#scenario=base&rate=15&horizon=5&stress=0&slide=7
↑ каскад: query > hash > sessionStorage (no localStorage!)
```

### I18N ключи (naming convention)

- `ui.chart.<chart_id>.<field>` — заголовки/оси/легенды (например `ui.chart.revenue.title`)
- `ui.control.<control_id>.<field>` — scenario switcher, sliders
- `ui.drilldown.<chart_id>.<field>` — содержимое Modal
- `a11y.chart.<chart_id>.<field>` — aria-labels

Каждый новый ключ — **одновременно в ru.json и en.json**. Нарушение симметрии ломает build (см. S51).

## 3. WORKFLOW (git, sandbox, FUSE)

### Git bundle через /tmp (обход FUSE)

```bash
# Локальный git в sandbox не работает напрямую — FUSE issue.
# Рабочий воркфлоу: сборка bundle в /tmp, push через GIT_SSH_COMMAND.

cd /tmp && rm -rf tsh && mkdir tsh && cd tsh
git clone /sessions/bold-magical-gauss/mnt/TrendStudio-Holding .
git checkout claude/deck-v1.2.0-phase2b

# ... работаем ...

git add . && git commit -m "S42: ..."
GIT_SSH_COMMAND="ssh -i ~/.git-ssh/id_ed25519 -o IdentitiesOnly=yes" \
  git push origin claude/deck-v1.2.0-phase2b
```

### Pytest.skip паттерн (для gitignored JSON)

Если тест читает данные из deck_data_v1.2.0.json, которого нет в проверочной среде:

```python
import pytest
from pathlib import Path
DATA = Path(__file__).parent.parent / "data_extract" / "deck_data_v1.2.0.json"
if not DATA.exists():
    pytest.skip("deck_data missing", allow_module_level=True)
```

## 4. БЮДЖЕТ ПО МОДУЛЯМ (бюджет 650 KB)

| Модуль | План | Факт | Δ |
|--------|-----:|-----:|--:|
| Phase 2A baseline | 244 651 | — | — |
| TS.Charts core (S41) | +15 000 |   |   |
| 7 charts (S42-S48) | +70 000 |   |   |
| Controls (S49) | +10 000 |   |   |
| Drilldown (S50) | +8 000 |   |   |
| deck_data enrichment | +50 000 |   |   |
| i18n ~60 keys | +4 000 |   |   |
| CSS for charts/controls | +8 000 |   |   |
| HTML markup + tests buffer | +25 000 |   |   |
| **Итого цель** | **434 651** | | |
| **Лимит** | **650 000** | | |
| **Подушка 2C/2D** | **215 349** | | |

S51 обновляет «Факт» после финальной сборки.

## 5. ЖЁЛТЫЕ ИЗ PHASE 2A (контекст)

- **№30 стресс-тест бюджета** → адресуется в Phase 2B (лимит 450→650 KB)
- **№26 дрейф смысла (261 EN-стаб)** → НЕ предмет Phase 2B, закрывается в Phase 2D

## 6. ПРЕДПОЧТЕНИЯ ПОЛЬЗОВАТЕЛЯ (кратко)

- DOCX: A4 книжная, поля 2/2/3/1.5 см, TNR 14pt, межстрочный 1.15, красная строка 1.5 см, H1 22pt bold #0070C0
- Верификация: П5 «Максимум» 32/32 обязательна после фазы (задана пользователем)
- Вопросы — только через AskUserQuestion
- Язык — русский

## 7. ЧЕК-ЛИСТ ГОТОВНОСТИ PHASE 2B

- [ ] S40: BUDGET=650000 в build_html.py
- [ ] S41: TS.Charts core + тесты
- [ ] S42-S48: 7 чартов × (реализация + 5 тестов + i18n + aria)
- [ ] S49: scenario switcher + 3 sliders + URL/session state
- [ ] S50: Drill-Down Modal (расширение TS.Components.Modal)
- [ ] i18n: RU и EN symmetric (count-check в S51)
- [ ] Тесты: 35 Phase 2A passing + 35 новых unit + 5 integration = 75 total
- [ ] HTML ≤ 650 000 байт
- [ ] Нет eval / new Function / localStorage (regex-check)
- [ ] P5 32/32 отчёт: ≥ 30 зелёных, 0 красных
- [ ] Git tag v1.2.0-phase2b
