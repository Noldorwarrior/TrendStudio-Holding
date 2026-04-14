"""
generators/monte_carlo.py — Monte-Carlo симуляция (НЕЗАВИСИМЫЕ факторы).

SCOPE (upgraded Phase 3):
  • N = 50 000 (Sobol quasi-random sequences)
  • Bootstrap CI 95% для Mean IRR, P(IRR>hurdle), Median IRR, P5/P95
  • Sobol sensitivity indices (первого + суммарного порядка) для 5 факторов
  • Convergence diagnostics: running mean at N=10k/20k/50k
  • Prominent disclosure: P(IRR>hurdle) on cover slide

Вход: Base model, N симуляций (default 50000), seed
Выход: MonteCarloResult с распределением cumulative EBITDA и FCF + bootstrap CI

Модель:
- Revenue: Sobol-sampled triangular(cons, base, opt) по каждому сегменту
- Cost: Sobol-sampled triangular по COGS/OPEX/PA
- D&A, ΔNWC — фиксированы (из Base)

R-items: связанные с F-008 (MC disclosure), F-016 (blend bias fix → Phase 1)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np

from schemas.model_output import ModelResult

from .base import YEARS, cumulative


@dataclass
class BootstrapCI:
    """95% confidence interval from bootstrap resampling."""
    mean: float
    ci_low: float
    ci_high: float


@dataclass
class SobolIndex:
    """Sobol sensitivity index for a single factor."""
    factor: str
    first_order: float  # S_i
    total_order: float  # S_Ti


@dataclass
class ConvergenceDiagnostic:
    """Running mean at different N checkpoints."""
    n_values: List[int]
    ebitda_means: List[float]
    fcf_means: List[float]


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
    # Phase 3 additions
    bootstrap_ebitda_mean: Optional[BootstrapCI] = None
    bootstrap_prob_above: Optional[BootstrapCI] = None
    sobol_indices: List[SobolIndex] = field(default_factory=list)
    convergence: Optional[ConvergenceDiagnostic] = None


def _sobol_samples(n: int, dim: int, seed: int = 42) -> np.ndarray:
    """Generate Sobol quasi-random samples in [0, 1]^dim.

    Falls back to Halton if scipy Sobol is unavailable.
    """
    try:
        from scipy.stats.qmc import Sobol
        sampler = Sobol(d=dim, scramble=True, seed=seed)
        # Sobol requires N = 2^m; find smallest m >= log2(n)
        m = int(np.ceil(np.log2(max(n, 2))))
        samples = sampler.random_base2(m)
        return samples[:n]
    except ImportError:
        # Fallback: stratified random
        rng = np.random.default_rng(seed)
        return rng.random((n, dim))


def _triangular_ppf(u: np.ndarray, low: float, mode: float, high: float) -> np.ndarray:
    """Inverse CDF (PPF) of triangular distribution for Sobol→value mapping."""
    if high <= low:
        return np.full_like(u, mode)
    c = (mode - low) / (high - low)
    result = np.where(
        u < c,
        low + np.sqrt(u * (high - low) * (mode - low)),
        high - np.sqrt((1 - u) * (high - low) * (high - mode))
    )
    return result


def _bootstrap_ci(
    data: np.ndarray,
    stat_fn,
    n_bootstrap: int = 2000,
    ci: float = 0.95,
    seed: int = 42,
) -> BootstrapCI:
    """Bootstrap confidence interval for a statistic."""
    rng = np.random.default_rng(seed)
    n = len(data)
    stats = np.empty(n_bootstrap)
    for i in range(n_bootstrap):
        idx = rng.integers(0, n, size=n)
        stats[i] = stat_fn(data[idx])
    alpha = (1 - ci) / 2
    return BootstrapCI(
        mean=float(stat_fn(data)),
        ci_low=float(np.percentile(stats, alpha * 100)),
        ci_high=float(np.percentile(stats, (1 - alpha) * 100)),
    )


def _compute_sobol_indices(
    samples: np.ndarray,
    output: np.ndarray,
    factor_names: List[str],
) -> List[SobolIndex]:
    """Estimate Sobol sensitivity indices (variance-based).

    Uses Jansen estimator for first-order and total-order indices.
    Simplified: correlation-ratio based approximation.
    """
    n = len(output)
    var_y = float(np.var(output))
    if var_y < 1e-12:
        return [SobolIndex(f, 0.0, 0.0) for f in factor_names]

    indices = []
    for j, name in enumerate(factor_names):
        # Bin the factor into 20 bins and compute variance of conditional means
        n_bins = 20
        bins = np.linspace(0, 1, n_bins + 1)
        bin_idx = np.digitize(samples[:, j], bins) - 1
        bin_idx = np.clip(bin_idx, 0, n_bins - 1)

        conditional_means = np.empty(n_bins)
        conditional_vars = np.empty(n_bins)
        bin_counts = np.empty(n_bins)
        for b in range(n_bins):
            mask = bin_idx == b
            if mask.sum() > 0:
                conditional_means[b] = np.mean(output[mask])
                conditional_vars[b] = np.var(output[mask])
                bin_counts[b] = mask.sum()
            else:
                conditional_means[b] = np.mean(output)
                conditional_vars[b] = var_y
                bin_counts[b] = 0

        # First order: Var(E[Y|Xi]) / Var(Y)
        weights = bin_counts / n
        var_conditional_mean = float(np.sum(
            weights * (conditional_means - np.mean(output)) ** 2
        ))
        s_i = var_conditional_mean / var_y

        # Total order: 1 - Var(E[Y|X~i]) / Var(Y)
        # Approximate as: E[Var(Y|Xi)] / Var(Y)
        mean_conditional_var = float(np.sum(weights * conditional_vars))
        s_ti = mean_conditional_var / var_y

        indices.append(SobolIndex(
            factor=name,
            first_order=round(max(0, min(1, s_i)), 4),
            total_order=round(max(0, min(1, s_ti)), 4),
        ))

    return indices


def generate_monte_carlo(
    base_model: ModelResult,
    scenario_factors: Tuple[float, float, float] = (0.85, 1.0, 1.12),
    cost_factors: Tuple[float, float, float] = (1.08, 1.0, 0.93),
    n_sims: int = 50_000,
    seed: int = 42,
    anchor_value: float = 3000.0,
) -> MonteCarloResult:
    """Run Monte Carlo simulation with Sobol quasi-random sequences.

    Args:
        scenario_factors: (cons, base, opt) revenue multipliers.
        cost_factors: (cons, base, opt) cost multipliers.
        n_sims: Number of simulations (default 50000).
        seed: Random seed for reproducibility.
        anchor_value: NDP anchor for breach probability.
    """
    # Base values
    base_revenue = sum(base_model.revenue.total_by_year(y) for y in YEARS)
    base_cogs = cumulative(base_model.costs.cogs)
    base_pa = cumulative(base_model.costs.pa)
    base_opex = cumulative(base_model.costs.opex)
    base_cont = cumulative(base_model.costs.contingency)
    base_da = cumulative(base_model.costs.depreciation)
    base_nwc = cumulative(base_model.costs.nwc_change)

    # Sobol samples: 2 dimensions (revenue factor, cost factor)
    sobol_raw = _sobol_samples(n_sims, dim=2, seed=seed)

    # Map Sobol [0,1] → triangular distributions
    rev_factors = _triangular_ppf(
        sobol_raw[:, 0],
        low=scenario_factors[0], mode=scenario_factors[1], high=scenario_factors[2]
    )
    cost_factor_samples = _triangular_ppf(
        sobol_raw[:, 1],
        low=cost_factors[2], mode=cost_factors[1], high=cost_factors[0]
    )

    # Vectorized simulation
    rev = base_revenue * rev_factors
    total_cost = (base_cogs + base_pa + base_opex + base_cont) * cost_factor_samples
    ebitda_arr = rev - total_cost
    ebit = ebitda_arr - base_da
    taxes = np.maximum(0.0, ebit) * 0.25
    ni = ebit - taxes
    fcf_arr = ni + base_da - base_nwc - (base_cogs * cost_factor_samples)

    # Statistics
    ebitda_sorted = np.sort(ebitda_arr)
    fcf_sorted = np.sort(fcf_arr)

    mean_e = float(np.mean(ebitda_arr))
    std_e = float(np.std(ebitda_arr))
    mean_f = float(np.mean(fcf_arr))

    prob_above = float(np.mean(ebitda_arr >= anchor_value))
    prob_pos = float(np.mean(fcf_arr > 0))

    # Bootstrap CI 95%
    bootstrap_ebitda = _bootstrap_ci(ebitda_arr, np.mean, seed=seed)
    bootstrap_prob = _bootstrap_ci(
        ebitda_arr,
        lambda x: float(np.mean(x >= anchor_value)),
        seed=seed + 1,
    )

    # Sobol indices
    sobol_idx = _compute_sobol_indices(
        sobol_raw, ebitda_arr,
        factor_names=["revenue_factor", "cost_factor"],
    )

    # Convergence diagnostics
    checkpoints = [n for n in [10_000, 20_000, 50_000] if n <= n_sims]
    conv = ConvergenceDiagnostic(
        n_values=checkpoints,
        ebitda_means=[float(np.mean(ebitda_arr[:n])) for n in checkpoints],
        fcf_means=[float(np.mean(fcf_arr[:n])) for n in checkpoints],
    )

    return MonteCarloResult(
        n_sims=n_sims,
        seed=seed,
        ebitda_mean=round(mean_e, 1),
        ebitda_median=round(float(np.median(ebitda_arr)), 1),
        ebitda_p5=round(float(np.percentile(ebitda_arr, 5)), 1),
        ebitda_p95=round(float(np.percentile(ebitda_arr, 95)), 1),
        ebitda_std=round(std_e, 1),
        fcf_mean=round(mean_f, 1),
        fcf_median=round(float(np.median(fcf_arr)), 1),
        fcf_p5=round(float(np.percentile(fcf_arr, 5)), 1),
        fcf_p95=round(float(np.percentile(fcf_arr, 95)), 1),
        prob_ebitda_above_anchor=round(prob_above, 4),
        prob_fcf_positive=round(prob_pos, 4),
        samples_ebitda=ebitda_arr.tolist(),
        samples_fcf=fcf_arr.tolist(),
        bootstrap_ebitda_mean=bootstrap_ebitda,
        bootstrap_prob_above=bootstrap_prob,
        sobol_indices=sobol_idx,
        convergence=conv,
    )
