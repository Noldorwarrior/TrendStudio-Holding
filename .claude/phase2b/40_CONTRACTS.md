# 40_CONTRACTS.md — API-контракты Phase 2B

**Версия:** 1.0
**Фаза:** Phase 2B (v1.2.0)
**Изменять без согласования:** запрещено. Любое изменение — через `DEFER_CONTRACT.md` и оператора.

---

## 1. TS.Charts core (S41 → всем чартам)

### 1.1 Namespace

```javascript
window.TS = window.TS || {};
TS.Charts = {
  // ... методы ниже
};
```

### 1.2 Helpers (низкоуровневые)

```typescript
/** Создаёт <canvas> внутри контейнера с учётом DPR */
createCanvas(container: HTMLElement, width: number, height: number): CanvasRenderingContext2D;

/** Создаёт <svg> с viewBox */
createSVG(container: HTMLElement, width: number, height: number): SVGSVGElement;

/** Горизонтальная ось (time/category/linear) */
axisX(ctxOrSvg, domain: number[] | string[], opts: {
  type: 'linear' | 'category' | 'time',
  ticks?: number,
  label?: string,
  format?: (v) => string
}): void;

/** Вертикальная ось */
axisY(ctxOrSvg, domain: number[], opts: {
  type: 'linear' | 'log',
  ticks?: number,
  label?: string,
  format?: (v) => string
}): void;

/** Показать tooltip у DOM-элемента с произвольным HTML-контентом */
tooltip(anchor: HTMLElement, contentHTML: string, opts?: { position?: 'top'|'bottom'|'auto' }): void;

/** Легенда (палитра → подпись) */
legend(container: HTMLElement, items: Array<{color: string, label: string}>): void;
```

### 1.3 Форматтеры

```typescript
/** Делегирует в I18N.formatCurrency / formatNumber / formatPercent */
formatValue(v: number, type: 'currency' | 'number' | 'percent' | 'year'): string;
```

### 1.4 Палитра (read-only)

```javascript
TS.Charts.palette = {
  base:     '#0070C0',  // ТрендСтудио синий
  bull:     '#2E7D32',  // зелёный (bull-сценарий)
  bear:     '#C62828',  // красный (bear-сценарий)
  positive: '#4CAF50',  // позитивная дельта
  negative: '#F44336',  // негативная дельта
  neutral:  '#757575',  // нейтраль
  stage: {              // стадии пайплайна
    pre:     '#9E9E9E',
    prod:    '#1976D2',
    post:    '#7B1FA2',
    release: '#388E3C'
  }
};
```

### 1.5 Регистрация и жизненный цикл чарта

```typescript
/** Регистрирует рендерер чарта в реестре. Вызывается один раз при загрузке модуля. */
register(chartId: string, renderFn: (container: HTMLElement, payload: object) => Controller): void;

/** Рендерит (или ре-рендерит) чарт в контейнер */
render(chartId: string, container: HTMLElement, payload: object): Controller;

/** Уничтожает чарт (отписывает события, очищает DOM) */
destroy(chartId: string, container: HTMLElement): void;

interface Controller {
  update(payload: object): void;   // частичное обновление (для sliders)
  destroy(): void;
}
```

### 1.6 Пример использования (для S42–S48)

```javascript
// src/charts/revenue.js
TS.Charts.register('revenue', (container, payload) => {
  const ctx = TS.Charts.createCanvas(container, 800, 400);
  // payload: { data: pipeline.revenue_by_year, scenario: 'base', stress: 0 }
  drawWaterfall(ctx, payload);

  // Подписка на live-updates от S49
  const onParam = (e) => { drawWaterfall(ctx, { ...payload, ...e.detail }); };
  TS.on('param:changed', onParam);

  return {
    update: (newPayload) => drawWaterfall(ctx, newPayload),
    destroy: () => { TS.off('param:changed', onParam); container.innerHTML = ''; }
  };
});
```

---

## 2. События (TS.emit / TS.on из Phase 2A)

### 2.1 Scenario changed (S49 → all charts)

```javascript
TS.emit('scenario:changed', 'base' | 'bull' | 'bear');
// Subscribers: все чарты через TS.on('scenario:changed', handler)
```

**Поведение:** каждый чарт перерендеривается с новой серией из `data.scenarios[newValue]`.

### 2.2 Param changed (S49 → sensitivity/MC charts)

```javascript
TS.emit('param:changed', {
  rate: number,     // 10..25, discount rate %
  horizon: number,  // 3..10 years
  stress: number    // 0..100, MC stress in %
});
```

**Subscribers:** S44 (IRR heat) читает `rate` и `horizon`, S47 (MC distribution) читает `stress`.
Остальные чарты **игнорируют** это событие.

### 2.3 Drill-down open (charts → S50)

```javascript
TS.emit('drilldown:open', {
  chart: 'revenue' | 'ebitda' | 'irr' | 'pipeline' | 'cashflow' | 'mc' | 'peers',
  payload: { /* chart-specific: dataPoint, year, projectId, etc. */ }
});
```

**Subscriber:** S50 открывает `TS.Components.Modal` с контентом из `ui.drilldown.<chart>.*` + данные из payload.

### 2.4 Chart rendered (для телеметрии/a11y)

```javascript
TS.emit('chart:rendered', {
  chartId: string,
  durationMs: number,
  payloadSize: number   // для perf-анализа
});
```

---

## 3. URL-State (orchestrator из Phase 2A)

### 3.1 Формат hash

```
#scenario=base&rate=15&horizon=5&stress=0&slide=7
```

### 3.2 Каскад приоритетов (НЕ МЕНЯТЬ)

```
1. query-params (?scenario=bull — для шаринга ссылок)
     ↓ fallback
2. hash (#scenario=base — основной)
     ↓ fallback
3. sessionStorage ('ts.state')
     ↓ fallback
4. defaults ({scenario:'base', rate:15, horizon:5, stress:0, slide:1})
```

### 3.3 localStorage — ЗАПРЕЩЕНО

Регрессия ловится через regex-check в S51:
```bash
grep -rn "localStorage" src/ && exit 1
```

### 3.4 API orchestrator (Phase 2A, read-only для Phase 2B)

```typescript
TS.State.get(key: string): any;
TS.State.set(key: string, value: any, opts?: { persist: boolean }): void;
TS.State.subscribe(key: string, handler: (newValue, oldValue) => void): () => void;
```

S49 использует это API для пробрасывания scenario/rate/horizon/stress в URL и sessionStorage.

---

## 4. I18N ключи (naming convention)

### 4.1 Пространства имён

| Префикс | Назначение | Пример |
|---------|------------|--------|
| `ui.chart.<id>.*` | Заголовки, оси, легенды | `ui.chart.revenue.title` = "Выручка по годам" |
| `ui.control.<id>.*` | Scenario switcher, sliders | `ui.control.scenario.label` = "Сценарий" |
| `ui.drilldown.<id>.*` | Контент Modal drilldown | `ui.drilldown.revenue.explanation` = "..." |
| `ui.project.<code>.*` | Карточки проектов в Pipeline | `ui.project.p1.name`, `ui.project.p1.genre` |
| `ui.peers.<code>.*` | Peer companies | `ui.peers.netflix.name`, `ui.peers.netflix.country` |
| `a11y.chart.<id>.*` | Aria-labels | `a11y.chart.revenue.label` = "Диаграмма выручки ..." |
| `a11y.control.<id>.*` | Aria для контролов | `a11y.control.scenario.group` |

### 4.2 Правило симметрии

Для каждого ключа в `ru.json` **обязан** быть ключ в `en.json`. Нарушение = build fail в S51.

```bash
# S51 check
python -c "
import json
ru = json.load(open('i18n/ru.json'))
en = json.load(open('i18n/en.json'))
diff = set(ru) ^ set(en)
assert not diff, f'I18N asymmetry: {diff}'
"
```

### 4.3 EN-stub для отложенного перевода

Если EN-перевод пока недоступен, ключ добавляется со значением `[EN:<ru_value>]` — S51 подсчитает их и отразит в отчёте как «дрейф смысла», но **билд пройдёт**.

---

## 5. Data schema (deck_data_v1.2.0.json)

### 5.1 Новые секции (добавляют S41/S45/S47/S48)

```jsonc
{
  "pipeline": {
    "projects": [                          // S45 enrich (добавить 2 сериала)
      { "id":"p1", "type":"film", "stage":"post", "start":"2025-Q3", "end":"2026-Q4", "budget_mrub":340, "revenue_mrub":680 },
      // ... 7 штук (5 фильмов + 2 сериала)
    ],
    "revenue_by_year": [                   // существующий, валидируется S41
      { "year":2026, "base":850, "bull":1100, "bear":620 },
      // ...
    ]
  },
  "sensitivity": {                         // S41 audit + возможно обогащение S44
    "irr_matrix": {
      "rates": [10,12,15,18,20,22,25],
      "horizons": [3,5,7,10],
      "values": [[18.4,19.1,19.8,20.2], ...]  // irr_matrix[rate_idx][horizon_idx]
    }
  },
  "mc": {                                  // S47 добавляет если нет
    "irr_distribution": [
      { "bin_low":10, "bin_high":11, "prob":0.02 },
      // ~30 bins
    ],
    "percentiles": { "p5":12.3, "p50":20.1, "p95":27.8 }
  },
  "peers": {                               // S48 добавляет если нет
    "comparables": [
      { "code":"netflix", "country":"US", "ev_revenue":6.8, "ev_ebitda":38.2, "irr_historic":24.1 },
      { "code":"warner",  "country":"US", "ev_revenue":1.9, "ev_ebitda":9.4,  "irr_historic":11.2 },
      // ...
    ]
  },
  "cashflow": {                            // S46 проверяет наличие
    "yearly": [
      { "year":2026, "operating":-120, "investing":-800, "financing":900, "net":-20 },
      // ...
    ]
  }
}
```

### 5.2 Synthetic fallback (escalation)

Если data-gap: создать значения с `"synthetic": true` флагом в payload и зафиксировать в commit-msg: `S48: peers (synthetic fallback, real data pending v1.2.1)`.

---

## 6. Контракт S49 Live-Controls ↔ чарты

### 6.1 Scenario switcher

```html
<div class="ts-scenario-switch" role="radiogroup"
     aria-label="{{a11y.control.scenario.group}}">
  <button role="radio" data-value="base" aria-checked="true">{{ui.control.scenario.base}}</button>
  <button role="radio" data-value="bull" aria-checked="false">{{ui.control.scenario.bull}}</button>
  <button role="radio" data-value="bear" aria-checked="false">{{ui.control.scenario.bear}}</button>
</div>
```

При клике:
1. `TS.State.set('scenario', newValue, {persist:true})`
2. `TS.emit('scenario:changed', newValue)`

### 6.2 Sliders (rate / horizon / stress)

```html
<input type="range" class="ts-slider" data-param="rate"
       min="10" max="25" step="1" value="15"
       aria-label="{{a11y.control.rate.label}}">
```

При `input` (debounced 150 ms):
1. `TS.State.set('rate', val, {persist:true})`
2. `TS.emit('param:changed', {rate:val, horizon:cur, stress:cur})`

---

## 7. Контракт S50 Drill-Down

### 7.1 Trigger

Чарт слушает click по data-point и emit'ит:

```javascript
container.addEventListener('click', (e) => {
  const point = e.target.closest('[data-point]');
  if (!point) return;
  TS.emit('drilldown:open', {
    chart: 'revenue',
    payload: { year: point.dataset.year, value: point.dataset.value }
  });
});
```

### 7.2 Handler (S50)

```javascript
TS.on('drilldown:open', ({ chart, payload }) => {
  const title = I18N.t(`ui.drilldown.${chart}.title`);
  const body  = renderDrilldownBody(chart, payload); // i18n + numbers
  TS.Components.Modal.open({ title, body, ariaLabel: I18N.t(`a11y.drilldown.${chart}.label`) });
});
```

### 7.3 Контент Modal

Каждый чарт-субагент обязан добавить ключи:
- `ui.drilldown.<chart>.title` — заголовок модала
- `ui.drilldown.<chart>.explanation` — 1 абзац объяснения
- `ui.drilldown.<chart>.methodology` — 1-2 абзаца методологии
- `a11y.drilldown.<chart>.label` — полный aria-label

---

## 8. Стабильность и версионирование

- Любой контракт из этого документа **заморожен** на время Phase 2B.
- Если в процессе обнаружена несовместимость (например, `TS.emit` Phase 2A не умеет payload-формы) — субагент создаёт `DEFER_API_<S>.md` с описанием и **останавливается**.
- Breaking change разрешается только в Phase 2C/2D с bump версии API.

---

## 9. Регрессионные инварианты (S51 проверяет)

| Инвариант | Метод | Порог |
|-----------|-------|-------|
| Phase 2A 35 тестов passing | `pytest src/components.test.js` | 35/35 |
| TS.Charts.register для всех 7 чартов | grep в bundled HTML | 7 матчей |
| Нет eval/new Function | regex | 0 |
| Нет localStorage | regex | 0 |
| I18N симметрия | py-скрипт | diff == empty |
| Budget | `os.path.getsize(...)` | ≤ 650_000 |
| Aria-coverage чартов | DOM-check | ≥ 7 чартов с aria-label |
