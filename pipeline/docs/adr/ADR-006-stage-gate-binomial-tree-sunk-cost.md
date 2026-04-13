# ADR-006: Stage-gate биномиальное дерево + sunk cost accounting для 12 фильмов слейта

**Status:** Accepted
**Date:** 2026-04-11 (v1.3.9)
**Deciders:** CFO, продюсерский блок, риск-менеджер

## Context

До v1.3.9 модель считала, что все 12 фильмов слейта 2026-2028 будут произведены и выйдут в прокат в запланированные даты. Это не соответствует реальной индустрии:

- Часть фильмов не проходят development committee (сценарий отклонён, рынок изменился).
- Часть не получают greenlight на финансирование (pre-production).
- Часть ломается на съёмках (кастинг, бюджет overrun, форсмажор).
- Часть задерживается на post-production > 1 года (приравнено к cancel).

По экспертным оценкам российской индустрии 2024-2026:
- development → greenlight: ~85% (15% сценариев не проходят комитет);
- greenlight → production start: ~92% (8% зависают на финансировании);
- production → post completion: ~95% (5% — форсмажор, кастинг, бюджет);
- post → release: ~97% (3% — задержки релиза >1 года, эквивалентны cancel).

**Overall P(reach release) = 0.85 × 0.92 × 0.95 × 0.97 ≈ 0.721**.

При 12 фильмах это означает ожидание **8.65 вышедших** и **3.35 cancelled** в среднем за трёхлетку. Для cancelled фильмов сохраняются **sunk costs** — затраты на этапах, пройденных до отмены.

### Силы

- **Честное моделирование**: модель должна отражать реалистичный «conversion funnel» слейта.
- **Учёт sunk cost**: cancelled фильмы оказывают негативное влияние на EBITDA через списание development/pre-production затрат.
- **Независимость от других стресс-тестов**: stage-gate не должен дублировать shock-тесты FX/инфляция/delay.
- **Детерминированность**: результаты воспроизводимы при одинаковом seed.

## Decision

Внедрить **stage-gate binomial decision tree** в `generators/stage_gate.py` как самостоятельный стресс-тест.

### Алгоритм (для каждой из n=2000 симуляций)

Для каждого из 12 фильмов слейта:
1. Bernoulli trial 1: `rng.random() < p_dev_to_green` (default 0.85). Если fail → stage=dev, sunk=budget × 0.05.
2. Bernoulli trial 2: `rng.random() < p_green_to_prod` (0.92). Если fail → stage=green, sunk=budget × 0.15.
3. Bernoulli trial 3: `rng.random() < p_prod_to_post` (0.95). Если fail → stage=prod, sunk=budget × 0.70.
4. Bernoulli trial 4: `rng.random() < p_post_to_release` (0.97). Если fail → stage=post, sunk=budget × 0.95.
5. Если все 4 trials passed → released=True, sunk=0.

### Пересчёт cinema.targets

Для released подмножества фильмов пересчитывается `cinema.targets_mln_rub` через `slate_weight`:

```
delta_slate_share = (n_cancelled / 12) · cinema.slate_dependent_share  # ≈ 40%
target_t_rescaled = target_t · (1 − delta_slate_share)
```

`slate_dependent_share = 0.40` — доля cinema.targets, прямо зависящая от слейта (остальные 60% — долгосрочные контракты, SVOD, кинотеатральная аренда).

### Учёт sunk cost

Если `apply_sunk_to_capex=True` (default), `sunk_cost_total` вычитается из `cumulative_ebitda`:

```
ebitda_adjusted = run_all(inputs_rescaled).cumulative_ebitda − sunk_cost_total
```

Это моделирует sunk cost как дополнительный operational expense.

## Options Considered

### Option A: Не моделировать cancel (status quo v1.3.8)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Zero |
| Cost | Zero |
| Realism | Low |
| Team familiarity | High |

**Pros:** простота.
**Cons:** систематическая переоценка cumulative EBITDA на ~30% (модель уверена, что 12/12 фильмов выйдут). Якорь 3000 млн ₽ не отражает реальный slate risk.

### Option B: Stage-gate binomial tree (выбрано)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Med (новый генератор + калибровка p_*) |
| Realism | High |
| Team familiarity | Med |

**Pros:** отражает реальный funnel. Учитывает sunk costs. Детерминированно. Легко тестируется.
**Cons:** экспертные вероятности требуют обоснования и периодической рекалибровки.

### Option C: Markov chain с вероятностями перехода между стадиями

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | High (нужна state machine) |
| Realism | High (учёт времени перехода) |
| Team familiarity | Low |

**Pros:** учёт длительности каждой стадии, возможность моделирования «hang» в pre-production.
**Cons:** overkill для 12 фильмов на 3 года. Нужна историческая статистика длительностей, которой нет.

### Option D: Deterministic scenario analysis (base / cons / opt)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Low |
| Realism | Med |
| Team familiarity | High |

**Pros:** три сценария с разным числом released (10/12, 8/12, 6/12).
**Cons:** теряет распределение; sunk costs не учитываются; непонятно, как комбинировать с parametric MC.

## Trade-off Analysis

Option B выбран за баланс realism и complexity. Экспертные вероятности в диапазоне 85-97% — надёжны (±5 п.п. uncertainty), так как наблюдаются на индустрии десятилетиями. Sunk cost проценты (5/15/70/95%) — стандартные для киноиндустрии (MPAA reports, CNC France, Российский фонд кино).

Option A отвергнут как систематически неправильный. Option C — излишняя сложность без данных для калибровки. Option D — теряет распределение, что критично для VaR.

### Результаты (n=2000, seed=44)

- **P(reach release)** = 0.721 (теоретически), 0.718 (эмпирически, ±0.01);
- **mean_released_count** = 8.61 / 12;
- **mean_sunk_cost** = 303 млн ₽ (p95 = 830 млн ₽);
- **mean_ebitda** = 2037 млн ₽ (base = 3001);
- **p5 / p95 ebitda** = 1091 / 2847 млн ₽;
- **VaR95** = 1910 млн ₽;
- **breach_p** (EBITDA < 2700) = 90.7%;
- **severe_p** (EBITDA < 2400) = 73.8%.

**Интерпретация:** Stage-gate обнажает фундаментальный slate risk — если учитывать только «воронку» производства без других шоков, мы с 90% вероятностью не достигаем якоря. Это означает необходимость диверсификации доходов (SVOD, фестивали, образование, мерч) или страховых механизмов.

## Consequences

**Становится проще:**
- CFO получает честную оценку slate risk: «ожидайте 8-9 релизов из 12, не 12».
- Продюсерский блок видит количественное влияние development committee: +5% p_dev → +0.4 фильма в среднем → +150 млн ₽ EBITDA.
- Обоснованное планирование резерва на sunk cost (303 млн ₽ в ожидании, 830 млн ₽ в p95).

**Становится сложнее:**
- Stage-gate результаты **плохо интегрируются** с другими MC (FX, инфляция, delay): отдельный JSON, отдельный анализ.
- При обсуждении на совете нужно объяснять, почему stage-gate mean (2037) сильно ниже anchor base (3000) — это не ошибка, а реалистичный slate risk.
- Калибровка p_* — экспертные оценки, требуют валидации от продюсерского блока раз в квартал.

**Надо пересматривать:**
- При накоплении 3+ лет реальной статистики слейта (какие фильмы отменены и на каком этапе) — пересчитать p_* эмпирически.
- Если индустрия изменится (например, платформы начнут commissioning content на стадии greenlight с предварительной оплатой) — снизить stage 2 sunk cost pct.
- При появлении «force production» механизма (гарантия финансирования от госфонда) — учесть в p_green_to_prod.

## Action Items

- [x] Реализовать `generators/stage_gate.py::run_stage_gate`.
- [x] Добавить `StageGateConfig`, `StageGateProbabilities`, `StageGateSunkCostPct` в `schemas/stress_matrix.py`.
- [x] Добавить секцию `stage_gate:` в `inputs/stress_matrix.yaml`.
- [x] Написать `tests/test_21_stage_gate.py` (11 тестов).
- [x] Интегрировать в `run_pipeline.py` как stage [4+5c/9].
- [x] Задокументировать в этом ADR.
- [ ] Квартальная валидация p_* с продюсерским блоком (цикл Q1 2026).
