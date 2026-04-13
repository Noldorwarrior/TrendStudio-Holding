"""
generators/monte_carlo.py — Monte-Carlo симуляция (НЕЗАВИСИМЫЕ факторы).

SCOPE (Ж7 v1.3.3): этот модуль моделирует ОБОБЩЁННЫЕ независимые шоки
────────────────────────────────────────────────────────────────────────────
  • Треугольные распределения revenue-factor и cost-factor
  • БЕЗ корреляций (независимые выборки)
  • Даёт распределение cumulative EBITDA и FCF как p5/p50/p95

НЕ ДУБЛИРУЕТ generators/combined_stress_tests.py::run_monte_carlo (v1.3.2):
  ─ combined MC моделирует СПЕЦИФИЧЕСКИЕ драйверы (FX, инфляция, delay)
     с КОРРЕЛЯЦИЯМИ через Cholesky-декомпозицию 3×3 матрицы
     (fx↔infl=+0.6, fx↔delay=+0.3, infl↔delay=+0.2).
  ─ этот модуль моделирует АБСТРАКТНЫЕ revenue/cost шоки без корреляций —
     быстрая оценка chance-of-hit-anchor и P(FCF>0).
Оба подхода дополняют друг друга: этот даёт широкий хвост распределения
агрегированных шоков, combined — узкий хвост реалистичных макро-сценариев.

Вход: Base model, N симуляций (default 2000), seed
Выход: MonteCarloResult с распределением cumulative EBITDA и FCF

Модель:
- Revenue: треугольное распределение(cons, base, opt) по каждому сегменту независимо
- Cost: треугольное распределение по COGS/OPEX/PA
- D&A, ΔNWC — фиксированы (из Base)

Упрощённый метод: вместо полного пересчёта каждой выборки, мы
сэмплируем коэффициенты на revenue/cost и применяем их к Base.
Это даёт реалистичное распределение при O(N) вместо O(N×pipeline).
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import List, Tuple

from schemas.model_output import ModelResult

from .base import YEARS, cumulative


@dataclass
class MonteCarloResult:
    n_sims: int
    seed: int
    ebitda_mean: float
    ebitda_median: float
    ebitda_p5: float
    ebitda_p95: float
    ebitda_std: float
    fcf_mean: float
    fcf_median: float
    fcf_p5: float
    fcf_p95: float
    prob_ebitda_above_anchor: float
    prob_fcf_positive: float
    samples_ebitda: List[float] = field(default_factory=list)
    samples_fcf: List[float] = field(default_factory=list)


def _percentile(sorted_data: List[float], pct: float) -> float:
    """Простой percentile без numpy."""
    if not sorted_data:
        return 0.0
    k = (len(sorted_data) - 1) * pct
    f = int(k)
    c = min(f + 1, len(sorted_data) - 1)
    if f == c:
        return sorted_data[f]
    return sorted_data[f] + (sorted_data[c] - sorted_data[f]) * (k - f)


def _triangular_sample(
    rng: random.Random, cons: float, base: float, opt: float
) -> float:
    """
    Треугольное распределение.

    Для revenue cons ≤ base ≤ opt (нормальный порядок).
    Для expenses — cons ≥ base ≥ opt, поэтому переставляем.
    """
    low = min(cons, opt)
    high = max(cons, opt)
    mode = base
    if not (low <= mode <= high):
        mode = (low + high) / 2.0
    return rng.triangular(low, high, mode)


def generate_monte_carlo(
    base_model: ModelResult,
    scenario_factors: Tuple[float, float, float] = (0.85, 1.0, 1.12),
    cost_factors: Tuple[float, float, float] = (1.08, 1.0, 0.93),
    n_sims: int = 2000,
    seed: int = 42,
    anchor_value: float = 3000.0,
) -> MonteCarloResult:
    """
    scenario_factors: (cons, base, opt) множители для Revenue (cons<base<opt)
    cost_factors:     (cons, base, opt) множители для Cost (cons>base>opt)
    """
    rng = random.Random(seed)

    base_revenue = sum(base_model.revenue.total_by_year(y) for y in YEARS)
    base_cogs = cumulative(base_model.costs.cogs)
    base_pa = cumulative(base_model.costs.pa)
    base_opex = cumulative(base_model.costs.opex)
    base_cont = cumulative(base_model.costs.contingency)
    base_da = cumulative(base_model.costs.depreciation)
    base_nwc = cumulative(base_model.costs.nwc_change)

    ebitda_samples: List[float] = []
    fcf_samples: List[float] = []

    for _ in range(n_sims):
        rev_factor = _triangular_sample(rng, *scenario_factors)
        cost_factor = _triangular_sample(rng, cost_factors[0], cost_factors[1], cost_factors[2])

        rev = base_revenue * rev_factor
        total_cost = (base_cogs + base_pa + base_opex + base_cont) * cost_factor
        ebitda = rev - total_cost
        ebit = ebitda - base_da
        taxes = max(0.0, ebit) * 0.25
        ni = ebit - taxes
        fcf = ni + base_da - base_nwc - (base_cogs * cost_factor)

        ebitda_samples.append(ebitda)
        fcf_samples.append(fcf)

    ebitda_samples.sort()
    fcf_samples.sort()

    mean_e = sum(ebitda_samples) / n_sims
    mean_f = sum(fcf_samples) / n_sims
    var_e = sum((x - mean_e) ** 2 for x in ebitda_samples) / n_sims
    std_e = var_e ** 0.5

    prob_above = sum(1 for x in ebitda_samples if x >= anchor_value) / n_sims
    prob_pos = sum(1 for x in fcf_samples if x > 0) / n_sims

    return MonteCarloResult(
        n_sims=n_sims,
        seed=seed,
        ebitda_mean=round(mean_e, 1),
        ebitda_median=round(_percentile(ebitda_samples, 0.5), 1),
        ebitda_p5=round(_percentile(ebitda_samples, 0.05), 1),
        ebitda_p95=round(_percentile(ebitda_samples, 0.95), 1),
        ebitda_std=round(std_e, 1),
        fcf_mean=round(mean_f, 1),
        fcf_median=round(_percentile(fcf_samples, 0.5), 1),
        fcf_p5=round(_percentile(fcf_samples, 0.05), 1),
        fcf_p95=round(_percentile(fcf_samples, 0.95), 1),
        prob_ebitda_above_anchor=round(prob_above, 4),
        prob_fcf_positive=round(prob_pos, 4),
        samples_ebitda=ebitda_samples,
        samples_fcf=fcf_samples,
    )
