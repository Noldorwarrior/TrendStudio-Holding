# ADR-008: Детерминированность через seed-based RNG

**Status:** Accepted
**Date:** 2026-02-26 (v1.3.1)
**Deciders:** ведущий разработчик, аудитор, CFO

## Context

ADR-007 постулирует content-addressable integrity через SHA-256 артефактов. Для того чтобы `combined_hash` был стабилен между прогонами, необходима полная детерминированность расчётов:

- Все Monte-Carlo симуляции должны давать один и тот же результат при одинаковом seed.
- Все bootstrap выборки — тоже.
- Все stage-gate Bernoulli trials — тоже.
- Никаких скрытых источников non-determinism (hash randomization, thread scheduling, numpy global state).

Источники недетерминированности в Python (диагностировано в v1.2):
1. `random.Random()` без seed → разный результат каждый прогон.
2. `hashlib.md5()` без контроля порядка — корректен, но `dict` iteration order до Python 3.7 был недетерминирован.
3. `set` iteration — до сих пор недетерминирован при использовании user-defined `__hash__`.
4. `os.listdir()` — порядок зависит от ОС.
5. `PYTHONHASHSEED` — если не 0, string hashing рандомизирован.
6. numpy global RandomState — общий для всех вызовов, подвержен race conditions.

### Силы

- **Reproducibility**: `python scripts/run_pipeline.py` дважды должен дать идентичные артефакты.
- **Auditability**: аудитор должен иметь возможность воспроизвести результат через 2 года.
- **Test stability**: pytest не должен быть flaky из-за non-determinism.
- **No hidden state**: весь random state должен быть явно передан через parameters.

## Decision

Ввести **строгий seed-based RNG контракт** для всех стохастических компонент пайплайна.

### Правила

1. **Явные seed в YAML**: каждый стохастический конфиг (MC, bootstrap, stage-gate, LHS+copula) имеет отдельное поле `seed: int` в соответствующей секции `inputs/stress_matrix.yaml`. Seeds назначены так, чтобы избежать корреляций:
   - parametric MC: seed=42
   - market_bootstrap: seed=43
   - stage_gate: seed=44
   - lhs_copula: seed=45

2. **Локальные `random.Random(seed)` instances**: ни один генератор не использует global `random.*` функции. Каждый создаёт `rng = random.Random(cfg.seed)` и передаёт в все подчинённые функции.

3. **Запрет на `numpy.random.*` globals**: если когда-нибудь понадобится numpy, использовать `numpy.random.default_rng(seed)` и передавать rng как параметр.

4. **`PYTHONHASHSEED=0`**: устанавливается в `scripts/run_pipeline.py` при старте через `os.environ`, гарантирует детерминированный string hashing.

5. **Сортировка при выводе**: любая итерация по `dict`/`set` при сериализации — через `sorted()`:
   ```python
   json.dumps(data, sort_keys=True)
   ```

6. **Детерминированный порядок файлов**: `os.listdir` заменяется на `sorted(os.listdir(...))`, Pathlib `.glob()` обёртывается в `sorted()`.

7. **Фиксированный timestamp для metadata**: xlsx/docx `core_properties.created` устанавливается в `datetime(2026, 1, 1, 0, 0, 0)` для воспроизводимого SHA.

### Тесты

- `tests/test_12_monte_carlo.py::test_mc_deterministic` — одинаковый seed → одинаковый mean.
- `tests/test_20_market_bootstrap.py::test_bootstrap_deterministic` — то же для bootstrap.
- `tests/test_21_stage_gate.py::test_stage_gate_deterministic` — для stage-gate.
- `tests/test_22_lhs_copula.py::test_lhs_copula_deterministic` — для LHS+copula.

## Options Considered

### Option A: Global seed один раз в run_pipeline

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Zero |
| Determinism | Med |
| Team familiarity | High |

**Pros:** простота, ровно одна строка `random.seed(42)`.
**Cons:** хрупко. Любое изменение порядка вызовов меняет последовательность random bits. Тестирование одного генератора изолированно невозможно.

### Option B: Явные seed на каждый конфиг (выбрано)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Low |
| Determinism | High |
| Team familiarity | Med |

**Pros:** изоляция генераторов — каждый тестируется отдельно со своим seed. Независимость от порядка вызовов. Возможность менять seed одного генератора без влияния на другие.
**Cons:** в YAML нужно держать несколько seeds; риск коллизий если не следить.

### Option C: Sequential seed generation (seed_master → seed_1, seed_2, …)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Low |
| Determinism | High |
| Team familiarity | Low |

**Pros:** один master seed, всё остальное выводится детерминированно.
**Cons:** при добавлении нового генератора все последующие seeds сдвигаются → breaks reproducibility старых артефактов. Это критично при долгосрочном аудите.

### Option D: Deterministic PRNG с counter-based derivation (Philox, ThreeFry)

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | High (нужна внешняя библиотека) |
| Determinism | Very High |
| Team familiarity | Low |

**Pros:** мат. идеальная независимость между генераторами, parallelizable.
**Cons:** overkill для non-parallel Python пайплайна. Добавляет зависимость (random123, randomgen).

## Trade-off Analysis

Option B выбран как компромисс между изоляцией (C, D) и простотой (A). Явные seeds в YAML делают контракт видимым: любой разработчик может посмотреть `inputs/stress_matrix.yaml::monte_carlo.seed` и понять, что это — magic number. А при добавлении нового генератора достаточно ввести новое поле `seed: NN` без пересчёта старых.

Option A отвергнут из-за хрупкости порядка. Option C отвергнут из-за ломкости при добавлении генераторов. Option D — over-engineering.

Компромисс: мы жертвуем некоторой «чистотой» (не один master seed) в пользу надёжности при эволюции пайплайна.

### Эмпирическая проверка

После введения правил в v1.3.1, за 15 релизов ни одного случая flaky pytest. `combined_hash` стабилен: два одинаковых git commit дают одинаковый хеш (проверено на bundle v1.3.6 → v1.4.0).

## Consequences

**Становится проще:**
- Любой bug в расчётах воспроизводится: просто запустить с тем же seed.
- Аудитор через 2 года сможет воспроизвести артефакт байт-в-байт.
- pytest стабилен: 159/159 PASS без flakiness.

**Становится сложнее:**
- При добавлении нового стохастического генератора нужно назначить уникальный seed и добавить в YAML.
- При рефакторинге генератора нельзя менять порядок вызовов `rng.random()` — это сдвинет последовательность и сломает регрессионные тесты.
- Интеграция с внешними библиотеками (pandas, sklearn) требует явного seed проброса.

**Надо пересматривать:**
- При переходе на параллельное выполнение (threading, multiprocessing) — нужна counter-based PRNG или явное разделение seed space.
- При использовании численных методов из numpy/scipy — передавать `numpy.random.default_rng(seed)` явно.

## Action Items

- [x] Все генераторы переведены на локальные `random.Random(seed)` instances.
- [x] Удалены все `random.*` global-calls.
- [x] Установлен `PYTHONHASHSEED=0` в `run_pipeline.py`.
- [x] Добавлены seed-поля в YAML для всех стохастических конфигов.
- [x] Написаны deterministic-тесты для всех 4 MC-подходов.
- [x] Настроены fixed timestamps в xlsx/docx metadata.
- [x] Задокументировано в этом ADR.
