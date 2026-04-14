"""
generators/finance_core.py — Unified financial computations (IRR, MOIC, NDP).

Single source of truth for IRR calculation: numpy_financial.irr.
All other IRR methods (bisect, Newton, MOIC^(1/n)) are DEPRECATED.

R-008: Standardize on numpy_financial.irr across all scripts.
"""
from __future__ import annotations

import warnings
from typing import List, Sequence, Union

import numpy as np

try:
    import numpy_financial as npf

    _HAS_NPF = True
except ImportError:
    _HAS_NPF = False


# ─── Scenario probability vector (SSOT) ─────────────────────────────────
# R-007: Single reconciled probability set for 5 scenarios.
# Order: very_pessimistic, pessimistic, base, optimistic, very_optimistic
PROB_VECTOR_BASE: List[float] = [0.05, 0.15, 0.50, 0.20, 0.10]

# For 3-scenario models (cons/base/opt) mapped from YAML
PROB_VECTOR_3S: List[float] = [0.25, 0.50, 0.25]

# ─── Key anchors ─────────────────────────────────────────────────────────
NDP_ANCHOR = 3000.0  # млн ₽
HURDLE_RATE = 0.18
WACC_BASE = 0.1905


# ─── IRR ─────────────────────────────────────────────────────────────────


def compute_irr(
    cash_flows: Union[List[float], "np.ndarray"],
    guess: float = 0.1,
) -> float:
    """Compute IRR using numpy_financial.irr (SSOT method).

    Args:
        cash_flows: List of cash flows. cash_flows[0] is typically negative
            (initial investment), subsequent values are returns.
        guess: Initial guess for the IRR solver.

    Returns:
        IRR as a decimal (e.g. 0.20 for 20%). Returns 0.0 if IRR
        cannot be computed (NaN or convergence failure).
    """
    if not _HAS_NPF:
        raise ImportError(
            "numpy_financial is required for IRR computation. "
            "Install with: pip install numpy-financial"
        )
    arr = np.asarray(cash_flows, dtype=float)
    if len(arr) < 2:
        return 0.0
    result = npf.irr(arr)
    if np.isnan(result):
        return 0.0
    return float(result)


# ─── MOIC ────────────────────────────────────────────────────────────────


def compute_moic(
    cash_flows: Union[List[float], "np.ndarray"],
) -> float:
    """Compute Multiple on Invested Capital.

    MOIC = sum(positive inflows) / abs(initial outflow).

    Args:
        cash_flows: cash_flows[0] is the initial investment (negative).

    Returns:
        MOIC as a multiple (e.g. 2.0 for 2×).
    """
    arr = np.asarray(cash_flows, dtype=float)
    if len(arr) < 2 or arr[0] >= 0:
        return 0.0
    invested = -arr[0]
    returned = float(np.sum(np.maximum(arr[1:], 0)))
    return returned / invested if invested > 0 else 0.0


# ─── Payback ─────────────────────────────────────────────────────────────


def compute_payback(cash_flows: Union[List[float], "np.ndarray"]) -> float:
    """Payback period with linear interpolation within the crossover year.

    Returns:
        Years until cumulative cash flow >= 0.
    """
    arr = np.asarray(cash_flows, dtype=float)
    if len(arr) < 2 or arr[0] >= 0:
        return 0.0
    cumulative = arr[0]
    for t, cf in enumerate(arr[1:], start=1):
        prev = cumulative
        cumulative += cf
        if cumulative >= 0:
            if cf <= 0:
                return float(t)
            return (t - 1) + (-prev) / cf
    return float(len(arr) - 1)


# ─── Revenue blend (MC) — corrected for zero bias ───────────────────────
# R-009 / F-016: Original formula 0.85 + 0.30*hit_rate has E[blend]=1.06
# at E[hit_rate]=0.70 (binomial(12, 0.70)/12). Corrected to center at 1.0.

MC_BLEND_INTERCEPT = 0.79  # 1.0 - 0.30 * 0.70
MC_BLEND_SLOPE = 0.30


def mc_revenue_blend(hit_rate: float) -> float:
    """Revenue blend factor, centered at 1.0 for E[hit_rate]=0.70.

    Old (biased):  0.85 + 0.30 * hit_rate → E = 1.06
    New (unbiased): 0.79 + 0.30 * hit_rate → E = 1.00
    """
    return MC_BLEND_INTERCEPT + MC_BLEND_SLOPE * hit_rate


# ─── D&A transition smoothing ───────────────────────────────────────────
# R-012 / F-012: D&A jumps 167× from 3M (2028) to 500M (2029).
# Smoothed via linear ramp 2028→2030 based on asset base schedule.


def smooth_da_transition(
    da_dict: dict[int, float],
    ramp_start: int = 2028,
    ramp_end: int = 2030,
) -> dict[int, float]:
    """Smooth D&A transition from build phase to steady state.

    Instead of a step function (3→500), applies a linear ramp
    from the build-phase value to the steady-state value.
    This reflects the gradual commissioning of content assets.

    Args:
        da_dict: {year: D&A value} with the original step function.
        ramp_start: First year of transition.
        ramp_end: Year when steady state is reached.

    Returns:
        New D&A dict with smoothed transition.
    """
    result = dict(da_dict)
    if ramp_start not in result or ramp_end not in result:
        return result

    start_val = result[ramp_start]
    end_val = result[ramp_end]
    n_steps = ramp_end - ramp_start

    if n_steps <= 0:
        return result

    for i in range(n_steps + 1):
        year = ramp_start + i
        if year in result:
            result[year] = start_val + (end_val - start_val) * (i / n_steps)

    return result


# ─── Deprecated aliases ──────────────────────────────────────────────────


def irr_bisect(cash_flows: List[float]) -> float:
    """DEPRECATED: Use compute_irr() instead."""
    warnings.warn(
        "irr_bisect() is deprecated. Use compute_irr() from finance_core.",
        DeprecationWarning,
        stacklevel=2,
    )
    return compute_irr(cash_flows)


def irr_moic_approx(moic: float, years: float = 6.5) -> float:
    """DEPRECATED: Use compute_irr() with proper cash flows instead."""
    warnings.warn(
        "irr_moic_approx() is deprecated. Use compute_irr() from finance_core.",
        DeprecationWarning,
        stacklevel=2,
    )
    if moic <= 0:
        return -1.0
    return moic ** (1.0 / years) - 1.0
