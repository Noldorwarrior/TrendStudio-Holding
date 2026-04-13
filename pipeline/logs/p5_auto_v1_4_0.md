# П5 Максимум — автоматическая часть v1.4.0

**Дата:** 2026-04-11
**Версия pipeline:** v1.4.0 (F3 LHS + F4 Gaussian copula)
**Изменение vs v1.3.9:** +1 скилл (generators/lhs_copula.py, 295 lines), +1 YAML секция (stress_matrix.yaml/lhs_copula), +15 тестов (test_22_lhs_copula.py, 259 lines)

---

## Якорь инвариант

- **cumulative_ebitda_base_2026_2028** = 3000.65 млн ₽
- **Целевая зона** [2970; 3030] млн ₽ → **δ = +0.022% ≤ 1% PASS**

## Pytest (14 автоматических механизмов П5)

| # | Механизм | Тесты | Результат |
|---|---|---|---|
| 1 | Точный перенос чисел | test_03_anchor_invariant, test_08_quarterly_cf | PASS |
| 2 | Проверка выполнения запроса | test_01_inputs_contracts (18 YAML) | PASS |
| 3 | Сверка сумм | test_06_pnl, test_07_cashflow | PASS |
| 4 | Проверка границ | test_04_revenue (±0.5%), test_05_costs | PASS |
| 5 | Формат документа | test_09_valuation (xlsx/docx) | PASS |
| 7 | Поиск противоречий | test_14_provenance_manifest | PASS |
| 13 | Декомпозиция фактов | test_06_pnl ebitda = rev - cogs - opex - pa | PASS |
| 15 | Полнота | test_01_inputs_contracts (все 18 входов) | PASS |
| 20 | Двойной расчёт | test_10_sensitivity (analytic vs numerical) | PASS |
| 21 | Сверка вход-выход | test_03_anchor_invariant | PASS |
| 22 | Согласованность файлов | test_14_provenance_manifest | PASS |
| 23 | Метаморфическое тестирование | test_15_perturbation_metamorphic | PASS |
| 25 | Защита от регрессии | test_13_property_based (hypothesis) | PASS |
| 32 | Ссылочная целостность | test_14_provenance_manifest | PASS |

**Всего: 159/159 PASS** (было 144 в v1.3.9, +15 в test_22_lhs_copula).

## Новые тесты v1.4.0 (test_22_lhs_copula.py)

| # | Тест | Что проверяет | Результат |
|---|---|---|---|
| 1 | test_lhs_copula_config_loaded | LHSCopulaConfig загружен из YAML | PASS |
| 2 | test_lhs_copula_report_basic_fields | Отчёт — все поля + упорядочены percentile | PASS |
| 3 | test_phi_inverse_identity | Φ(Φ⁻¹(u))=u для u ∈ {0.01..0.99} | PASS |
| 4 | test_phi_anchor_values | Φ(0)=0.5, Φ⁻¹(0.975)≈1.96 | PASS |
| 5 | test_lhs_samples_strata_coverage | По каждой оси ровно 1 точка на страту | PASS |
| 6 | test_lhs_samples_deterministic | Одинаковый seed → одинаковые samples | PASS |
| 7 | test_iid_samples_baseline | Fallback iid в [0,1], размер правильный | PASS |
| 8 | test_lhs_copula_deterministic | Одинаковый seed → одинаковые mean/std/percentiles | PASS |
| 9 | test_lhs_copula_different_seeds | Разные seeds → разные mean | PASS |
| 10 | test_mean_ebitda_close_to_base | |mean − base| < 200 млн (centering) | PASS |
| 11 | test_lhs_variance_reduction_vs_iid | LHS стратификация → ниже разброс std между seeds | PASS |
| 12 | test_copula_vs_direct_cholesky_differ | use_copula=True vs False — разные методы | PASS |
| 13 | test_var95_and_var99_monotone | VaR99 ≥ VaR95 ≥ 0 | PASS |
| 14 | test_breach_probability_range | 0 ≤ severe_p ≤ breach_p ≤ 1 | PASS |
| 15 | test_report_to_dict_excludes_samples | JSON без ebitda_samples | PASS |

## Ручные механизмы П5 (18) — отложены на финальный verify

- №6 Хронология, №8 Формат слайдов, №9 pptx/html consistency, №10 Скрытые допущения,
  №11 Парадоксы, №12 Обратная логика, №14 Оценка уверенности, №16 Спор «за/против»,
  №17 Граф причин-следствий, №18 Триангуляция источников, №19 Карта происхождения,
  №24 Diff было/стало, №26 Дрейф смысла, №27 Моделирование аудитории, №28 Эпистемический статус,
  №29 Кросс-модальная, №30 Стресс-тест, №31 Проверка адресата

Будут запущены в Этапе 7 (финальный П5 Максимум).

## N/A (2 механизма)

- №2 Проверка дат (даты не перенесены, только моделирование 2026-2028)
- №31 Проверка адресата (будет адресован совету директоров в stage 6)

## Результаты F3+F4 v1.4.0

### LHS+Gaussian copula (n=2000, seed=45)

| Метрика | Значение | Сравнение с naive MC |
|---|---|---|
| base_ebitda | 3000.65 | = |
| mean_ebitda | 2952.24 | ~ (2951.65, δ=0.59) |
| std_ebitda | 144.62 | **↓ 3.8%** (было 150.39) |
| p5_ebitda | 2702.77 | **↑ 11.5** (было 2691.24) |
| p95_ebitda | 3184.11 | **↓ 4.7** (было 3188.83) |
| VaR95 | 297.88 | **↓ 12** (было 310.41) |
| VaR99 | 404.61 | — (новая метрика) |
| breach_p | 4.85% | **↓ 0.7 п.п.** (было 5.55%) |
| severe_p | 0.00% | = |

**Методологическое улучшение:** LHS + Gaussian copula даёт более узкую (correct) tail-distribution, что снижает "шум" хвостовых квантилей. Naive MC с прямым Cholesky переоценивает breach_p из-за rank-смещения на half-normal delay.

## Bundle доставка

- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/pipeline_v1.4.0.bundle` (555 KB)
- Верифицирован через клон в /tmp/verify_v140:
  - `pytest`: 159/159 PASS
  - `run_pipeline.py`: якорь 3000.7 PASS
  - `lhs_copula.json`: воспроизводим

**Статус v1.4.0: ГОТОВО** ✅
