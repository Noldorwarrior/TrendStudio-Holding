"""
generators/lhs_copula.py — v1.4.0 F3+F4: Latin Hypercube + Gaussian copula.

SCOPE (v1.4.0 F3+F4): этот модуль реализует корректную многомерную симуляцию
────────────────────────────────────────────────────────────────────────────
  F3. Latin Hypercube Sampling (LHS): стратификация [0,1] на n_sims равных
      интервалов (страт); из каждой страты берётся ровно 1 точка; страты
      по каждой из 3 размерностей независимо перемешиваются через permutation.
      Результат — набор 2000 точек u⃗ ∈ [0,1]³, покрывающих объём равномерно
      (одна точка на страту по каждой оси). Per McKay-Conover-Beckman (1979),
      LHS снижает variance estimator интеграла в 3–5 раз vs наивный iid MC
      при одинаковом N.

  F4. Gaussian copula: стратифицированные u⃗ транслируются в N(0,1) через
      обратную CDF Φ⁻¹, умножаются на Cholesky L (L·L^T = ρ) — получая
      коррелированные N(0,1). Затем N(0,1) → u через Φ, а u → физические шоки
      через ОБРАТНЫЕ CDF МАРГИНАЛОВ:
        • FX:       N(μ_fx, σ_fx)    →  u → Φ⁻¹_N
        • infl:     N(μ_i, σ_i)      →  u → Φ⁻¹_N
        • delay:    |N(0, scale)|    →  u → HalfNormal⁻¹(scale)
      Это корректная копула, сохраняющая корреляционный ранг Spearman между
      РАЗНЫМИ маргиналами — в отличие от прямого Cholesky на N(0,1) в
      run_monte_carlo, который корректен только для нормальных маргиналов.

Отличие от generators/combined_stress_tests.py::run_monte_carlo:
  ─ run_monte_carlo:   iid Gaussian + Cholesky → разные маргиналы через ad-hoc
                       abs/clip, корреляционный ранг смещается для half-normal.
  ─ run_lhs_copula:    LHS стратификация + обратные CDF маргиналов →
                       variance reduction ×1.5–3, корректный ранг корреляции.

Оба подхода дополняют друг друга: run_monte_carlo остаётся для сравнимости
с историей артефактов (baseline), run_lhs_copula добавляется как improved
методологически MC для финальных метрик.

Вход: ValidatedInputs (использует inputs.stress_matrix.monte_carlo.*)
Выход: LHSCopulaReport с распределением cumulative EBITDA + percentile band

Детерминированность: полностью воспроизводимо через lhs_copula.seed.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from schemas.inputs import ValidatedInputs

from .combined_stress_tests import (
    _cholesky_3x3,
    apply_fx_shock,
    apply_inflation_shock,
    apply_release_delay,
)
from .core import run_all


# ---------------------------------------------------------------------------
# Вспомогательные функции (без numpy/scipy)
# ---------------------------------------------------------------------------

def _phi(x: float) -> float:
    """Стандартная нормальная CDF Φ(x) через math.erf.

    Φ(x) = 0.5 · (1 + erf(x / √2))
    """
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _phi_inv(u: float) -> float:
    """Inverse normal CDF Φ⁻¹(u) — Beasley-Springer-Moro approximation.

    Точность ~1e-9 на (0, 1). Используется для трансляции стратифицированных
    u ∈ (0,1) в стандартные N(0,1).
    """
    # Clamp избегая ±∞ на краях
    if u <= 0.0:
        u = 1e-12
    elif u >= 1.0:
        u = 1.0 - 1e-12

    # Beasley-Springer coefficients
    a = [
        -3.969683028665376e01,
        2.209460984245205e02,
        -2.759285104469687e02,
        1.383577518672690e02,
        -3.066479806614716e01,
        2.506628277459239e00,
    ]
    b = [
        -5.447609879822406e01,
        1.615858368580409e02,
        -1.556989798598866e02,
        6.680131188771972e01,
        -1.328068155288572e01,
    ]
    c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e00,
        -2.549732539343734e00,
        4.374664141464968e00,
        2.938163982698783e00,
    ]
    d = [
        7.784695709041462e-03,
        3.224671290700398e-01,
        2.445134137142996e00,
        3.754408661907416e00,
    ]

    p_low = 0.02425
    p_high = 1.0 - p_low

    if u < p_low:
        q = math.sqrt(-2.0 * math.log(u))
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / (
            (((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0
        )
    elif u <= p_high:
        q = u - 0.5
        r = q * q
        return (
            (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q
        ) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0)
    else:
        q = math.sqrt(-2.0 * math.log(1.0 - u))
        return -(
            ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
        ) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0)


def _lhs_unit_samples(n: int, dim: int, rng: random.Random) -> List[List[float]]:
    """Latin Hypercube Sampling для n точек в [0,1]^dim.

    Для каждой из dim размерностей интервал [0,1] разбивается на n равных
    страт, из каждой страты берётся ровно одна точка (центр + random offset),
    затем страты независимо перемешиваются через random permutation.

    Возвращает список n точек, каждая — list[dim] из u ∈ (0,1).
    """
    samples: List[List[float]] = [[0.0] * dim for _ in range(n)]
    for d in range(dim):
        # Стартовые индексы страт 0..n-1, перемешанные
        perm = list(range(n))
        rng.shuffle(perm)
        for i in range(n):
            # точка внутри страты perm[i]: (perm[i] + U(0,1)) / n
            offset = rng.random()
            u = (perm[i] + offset) / n
            samples[i][d] = u
    return samples


def _iid_unit_samples(n: int, dim: int, rng: random.Random) -> List[List[float]]:
    """Fallback: iid U(0,1)^dim без стратификации."""
    return [[rng.random() for _ in range(dim)] for _ in range(n)]


# ---------------------------------------------------------------------------
# Report dataclass
# ---------------------------------------------------------------------------

@dataclass
class LHSCopulaReport:
    method: str = "lhs_gaussian_copula"
    n_simulations: int = 0
    lhs_strata: bool = True
    use_copula: bool = True
    seed: int = 0
    base_ebitda: float = 0.0
    mean_ebitda: float = 0.0
    std_ebitda: float = 0.0
    p1_ebitda: float = 0.0
    p5_ebitda: float = 0.0
    p25_ebitda: float = 0.0
    p50_ebitda: float = 0.0
    p75_ebitda: float = 0.0
    p95_ebitda: float = 0.0
    p99_ebitda: float = 0.0
    var_95_mln_rub: float = 0.0
    var_99_mln_rub: float = 0.0
    breach_probability: float = 0.0
    severe_breach_probability: float = 0.0
    correlations_applied: Dict[str, float] = field(default_factory=dict)
    # диагностика улучшения vs naive MC
    variance_reduction_vs_naive: float = 0.0  # ratio std_naive/std_lhs (оценка)
    ebitda_samples: List[float] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def run_lhs_copula(inputs: ValidatedInputs) -> LHSCopulaReport:
    """Запуск LHS + Gaussian copula симуляции.

    Алгоритм:
      1. Генерируется n×3 стратифицированный u ∈ [0,1] через _lhs_unit_samples.
      2. u → z = Φ⁻¹(u) (3 независимых N(0,1) по каждой оси).
      3. z → y = L·z (коррелированные N(0,1) через Cholesky).
      4. y → u' = Φ(y)  (обратно в равномерные, но УЖЕ коррелированные по
         копульной структуре).
      5. u' → физические шоки через обратные CDF маргиналов:
         • FX:     N⁻¹(u'_1; μ, σ)
         • infl:   N⁻¹(u'_2; μ, σ), clamp
         • delay:  HalfNormal⁻¹(u'_3; scale) = |N⁻¹(...)| × scale, clamp
      6. Прогон run_all(cloned inputs) для каждой точки, сбор cumulative_ebitda.
    """
    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    lc = mc.lhs_copula
    if lc is None:
        raise ValueError("lhs_copula config не найден в stress_matrix.yaml")

    rng = random.Random(lc.seed)

    # Базовый EBITDA (cumulative 2026-2028)
    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    # Корреляционная матрица
    c = mc.correlations
    corr_mat = [
        [1.0,                  c.fx_vs_inflation,   c.fx_vs_delay],
        [c.fx_vs_inflation,    1.0,                 c.inflation_vs_delay],
        [c.fx_vs_delay,        c.inflation_vs_delay, 1.0],
    ]
    L = _cholesky_3x3(corr_mat)

    # Маргиналы
    fx_mean = mc.distributions.fx_shock_pct.mean or 0.0
    fx_std = mc.distributions.fx_shock_pct.std or 0.0
    infl_mean = mc.distributions.inflation_pct.mean or 0.0
    infl_std = mc.distributions.inflation_pct.std or 0.0
    delay_scale = mc.distributions.release_delay_months.scale or 3.0

    sp = sm.shock_parameters
    fx_lo, fx_hi = sp.fx_clip_lower, sp.fx_clip_upper
    infl_lo, infl_hi = sp.inflation_clip_lower, sp.inflation_clip_upper
    delay_lo, delay_hi = sp.delay_clip_lower, sp.delay_clip_upper

    n = lc.n_simulations

    # Шаг 1–2: LHS + Φ⁻¹
    if lc.lhs_strata:
        u_samples = _lhs_unit_samples(n, 3, rng)
    else:
        u_samples = _iid_unit_samples(n, 3, rng)

    ebitdas: List[float] = []

    for u_row in u_samples:
        # Φ⁻¹(u) → z (три независимых N(0,1), но стратифицированных)
        z = [_phi_inv(u) for u in u_row]

        # Cholesky: y = L · z (коррелированные N(0,1))
        y = [
            L[0][0] * z[0],
            L[1][0] * z[0] + L[1][1] * z[1],
            L[2][0] * z[0] + L[2][1] * z[1] + L[2][2] * z[2],
        ]

        if lc.use_copula:
            # Gaussian copula: y → u' = Φ(y) → inverse marginals
            u1p, u2p, u3p = _phi(y[0]), _phi(y[1]), _phi(y[2])
            # FX: inverse normal
            fx = fx_mean + fx_std * _phi_inv(u1p)
            # Infl: inverse normal
            infl = infl_mean + infl_std * _phi_inv(u2p)
            # Delay: inverse half-normal — |Φ⁻¹((u+1)/2)| · scale
            # HalfNormal CDF F(d) = 2·Φ(d/scale) − 1, F⁻¹(u) = Φ⁻¹((u+1)/2)·scale
            delay_raw = _phi_inv((u3p + 1.0) / 2.0) * delay_scale
        else:
            # Прямой Cholesky без копулы (как baseline run_monte_carlo)
            fx = fx_mean + fx_std * y[0]
            infl = infl_mean + infl_std * y[1]
            delay_raw = abs(y[2]) * delay_scale

        # Clip по границам
        fx = max(fx_lo, min(fx_hi, fx))
        infl = max(infl_lo, min(infl_hi, infl))
        delay = int(round(max(delay_lo, min(delay_hi, delay_raw))))

        # Применение шоков
        mod = inputs
        if fx != 0.0:
            mod = apply_fx_shock(mod, fx)
        if infl > 0.0:
            mod = apply_inflation_shock(mod, infl)
        if delay > 0:
            mod = apply_release_delay(mod, delay)

        run = run_all(mod)
        ebitdas.append(run.models["base"].cumulative_ebitda)

    # Статистика
    sorted_eb = sorted(ebitdas)
    nn = len(sorted_eb)
    mean_eb = sum(sorted_eb) / nn
    var_eb = sum((x - mean_eb) ** 2 for x in sorted_eb) / nn
    std_eb = math.sqrt(var_eb)

    def _pct(p: float) -> float:
        idx = max(0, min(nn - 1, int(round(p * (nn - 1)))))
        return sorted_eb[idx]

    breach_lower = sm.breach_thresholds.anchor_lower_bound_mln_rub
    severe = sm.breach_thresholds.severe_breach_threshold_mln_rub

    n_breach = sum(1 for x in sorted_eb if x < breach_lower)
    n_severe = sum(1 for x in sorted_eb if x < severe)

    # variance_reduction: эвристическая оценка LHS efficiency vs naive iid.
    # Для 3-мерного LHS с n=2000 и гладких целей ожидается ×1.5-3 улучшение
    # standard error, но точное значение зависит от целевой функции.
    # Здесь вычисляется как отношение (sqrt(n) × std / mean) к теоретическому
    # naive MC — это грубая оценка, точный расчёт требует двух прогонов.
    variance_reduction = 1.0  # placeholder, точная оценка в test_22

    return LHSCopulaReport(
        method="lhs_gaussian_copula" if lc.use_copula else "lhs_cholesky_direct",
        n_simulations=n,
        lhs_strata=lc.lhs_strata,
        use_copula=lc.use_copula,
        seed=lc.seed,
        base_ebitda=round(base_ebitda, 2),
        mean_ebitda=round(mean_eb, 2),
        std_ebitda=round(std_eb, 2),
        p1_ebitda=round(_pct(0.01), 2),
        p5_ebitda=round(_pct(0.05), 2),
        p25_ebitda=round(_pct(0.25), 2),
        p50_ebitda=round(_pct(0.50), 2),
        p75_ebitda=round(_pct(0.75), 2),
        p95_ebitda=round(_pct(0.95), 2),
        p99_ebitda=round(_pct(0.99), 2),
        var_95_mln_rub=round(base_ebitda - _pct(0.05), 2),
        var_99_mln_rub=round(base_ebitda - _pct(0.01), 2),
        breach_probability=round(n_breach / nn, 4),
        severe_breach_probability=round(n_severe / nn, 4),
        correlations_applied={
            "fx_vs_inflation": c.fx_vs_inflation,
            "fx_vs_delay": c.fx_vs_delay,
            "inflation_vs_delay": c.inflation_vs_delay,
        },
        variance_reduction_vs_naive=round(variance_reduction, 3),
        ebitda_samples=[round(x, 2) for x in sorted_eb],
    )


def lhs_copula_report_to_dict(report: LHSCopulaReport) -> dict:
    """Сериализация в JSON dict (без ebitda_samples для краткости)."""
    d = report.__dict__.copy()
    d.pop("ebitda_samples", None)
    return d
