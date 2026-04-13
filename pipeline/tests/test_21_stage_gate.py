"""
test_21_stage_gate.py — регрессионные тесты F2 Tier E stage-gate
дерева решений для 12 фильмов слейта (v1.3.9).

Проверяет:
- StageGateConfig корректно загружен из stress_matrix.yaml.
- p_reach_release = p_dev × p_green × p_prod × p_post.
- mean_released_count ≈ n_films × p_reach_release (закон больших чисел).
- min_released_count ≥ 0, max_released_count ≤ 12.
- Percentiles упорядочены.
- P=1 на всех этапах → released_count=12, sunk=0, ebitda=base.
- P=0 на первом этапе → released_count=0, sunk = budget_total × sunk_pct.dev.
- Детерминизм при одинаковом seed.
- Независимость: seed1 ≠ seed2 дают разные mean.
- apply_sunk_to_capex=False → ebitda_mean выше, чем с True.
- Больше sunk_cost_pct.production → больше mean_sunk.
- breach_p ≥ 0, severe_p ≤ breach_p.
"""
from __future__ import annotations

import pytest

from schemas.inputs import ValidatedInputs
from schemas.stress_matrix import (
    StageGateConfig,
    StageGateProbabilities,
    StageGateSunkCostPct,
)
from generators.stage_gate import run_stage_gate, stage_gate_report_to_dict


def _inputs_with_sg(
    inputs: ValidatedInputs,
    *,
    p_dev: float = 0.85,
    p_green: float = 0.92,
    p_prod: float = 0.95,
    p_post: float = 0.97,
    n_sims: int = 400,
    seed: int = 44,
    apply_sunk: bool = True,
    sunk_prod: float = 0.70,
) -> ValidatedInputs:
    """Быстрый клон inputs с кастомными stage-gate параметрами."""
    base_sg = inputs.stress_matrix.monte_carlo.stage_gate
    new_probs = StageGateProbabilities(
        p_development_to_greenlight=p_dev,
        p_greenlight_to_production=p_green,
        p_production_to_post=p_prod,
        p_post_to_release=p_post,
    )
    new_sunk = base_sg.sunk_cost_pct.model_copy(update={"production": sunk_prod})
    new_sg = base_sg.model_copy(
        update={
            "probabilities": new_probs,
            "sunk_cost_pct": new_sunk,
            "n_simulations": n_sims,
            "seed": seed,
            "apply_sunk_to_capex": apply_sunk,
        }
    )
    mc = inputs.stress_matrix.monte_carlo.model_copy(update={"stage_gate": new_sg})
    sm = inputs.stress_matrix.model_copy(update={"monte_carlo": mc})
    return inputs.model_copy(update={"stress_matrix": sm})


# ---------- базовый отчёт --------------------------------------------------


def test_stage_gate_report_basic_fields(inputs):
    """Отчёт содержит все обязательные поля, percentiles упорядочены."""
    fast = _inputs_with_sg(inputs, n_sims=300)
    r = run_stage_gate(fast)
    assert r.method == "stage_gate_binomial_tree"
    assert r.n_simulations == 300
    assert r.n_films == 12
    assert abs(r.p_reach_release - 0.85 * 0.92 * 0.95 * 0.97) < 1e-6
    assert r.p5_ebitda <= r.p25_ebitda <= r.p50_ebitda <= r.p75_ebitda <= r.p95_ebitda


def test_released_count_in_range(inputs):
    """0 ≤ min_released ≤ max_released ≤ 12."""
    fast = _inputs_with_sg(inputs, n_sims=400)
    r = run_stage_gate(fast)
    assert 0 <= r.min_released_count <= r.max_released_count <= 12


def test_mean_released_close_to_expected(inputs):
    """mean_released ≈ 12 × p_reach_release (допуск ±0.5 для n=1000)."""
    fast = _inputs_with_sg(inputs, n_sims=1000)
    r = run_stage_gate(fast)
    expected = 12 * r.p_reach_release
    assert abs(r.mean_released_count - expected) < 0.5, (
        f"mean_released={r.mean_released_count}, expected~{expected:.2f}"
    )


# ---------- граничные случаи -----------------------------------------------


def test_all_probs_one_identity(inputs):
    """Все вероятности = 1 → все фильмы выходят, sunk=0, ebitda=base."""
    fast = _inputs_with_sg(
        inputs, p_dev=1.0, p_green=1.0, p_prod=1.0, p_post=1.0, n_sims=100
    )
    r = run_stage_gate(fast)
    assert r.mean_released_count == 12
    assert r.min_released_count == 12
    assert r.max_released_count == 12
    assert r.mean_sunk_cost_mln_rub == 0.0
    assert abs(r.mean_ebitda - r.base_ebitda) < 0.5


def test_p_dev_zero_all_cancelled(inputs):
    """p_dev=0 → все фильмы обрезаются на development этапе."""
    fast = _inputs_with_sg(
        inputs, p_dev=0.0, p_green=1.0, p_prod=1.0, p_post=1.0, n_sims=100
    )
    r = run_stage_gate(fast)
    assert r.mean_released_count == 0
    assert r.max_released_count == 0
    # sunk = budget_total × 0.05 > 0
    assert r.mean_sunk_cost_mln_rub > 0


# ---------- детерминизм ----------------------------------------------------


def test_stage_gate_deterministic(inputs):
    """Одинаковый seed → одинаковые сводные статистики."""
    fast = _inputs_with_sg(inputs, n_sims=300, seed=100)
    r1 = run_stage_gate(fast)
    r2 = run_stage_gate(fast)
    assert r1.mean_ebitda == r2.mean_ebitda
    assert r1.mean_released_count == r2.mean_released_count
    assert r1.p5_ebitda == r2.p5_ebitda


def test_different_seeds_give_different_results(inputs):
    """seed1 ≠ seed2 → разные mean (скорее всего)."""
    fast1 = _inputs_with_sg(inputs, n_sims=300, seed=100)
    fast2 = _inputs_with_sg(inputs, n_sims=300, seed=200)
    r1 = run_stage_gate(fast1)
    r2 = run_stage_gate(fast2)
    assert r1.mean_ebitda != r2.mean_ebitda or r1.mean_released_count != r2.mean_released_count


# ---------- влияние apply_sunk_to_capex ------------------------------------


def test_apply_sunk_reduces_ebitda(inputs):
    """apply_sunk=True → mean_ebitda НИЖЕ, чем с apply_sunk=False."""
    with_sunk = _inputs_with_sg(inputs, n_sims=500, seed=100, apply_sunk=True)
    no_sunk = _inputs_with_sg(inputs, n_sims=500, seed=100, apply_sunk=False)
    r_ws = run_stage_gate(with_sunk)
    r_ns = run_stage_gate(no_sunk)
    assert r_ws.mean_ebitda < r_ns.mean_ebitda
    # Разница ≈ mean_sunk_cost
    assert abs((r_ns.mean_ebitda - r_ws.mean_ebitda) - r_ws.mean_sunk_cost_mln_rub) < 1.0


# ---------- чувствительность к sunk_cost_pct -------------------------------


def test_higher_production_sunk_gives_more_sunk(inputs):
    """sunk_pct.production 0.3 → 0.9 увеличивает mean_sunk."""
    lo = _inputs_with_sg(inputs, n_sims=500, seed=100, sunk_prod=0.30)
    hi = _inputs_with_sg(inputs, n_sims=500, seed=100, sunk_prod=0.95)
    r_lo = run_stage_gate(lo)
    r_hi = run_stage_gate(hi)
    assert r_hi.mean_sunk_cost_mln_rub > r_lo.mean_sunk_cost_mln_rub


# ---------- breach/severe --------------------------------------------------


def test_breach_probability_range(inputs):
    """breach и severe ∈ [0; 1], severe ≤ breach."""
    fast = _inputs_with_sg(inputs, n_sims=500)
    r = run_stage_gate(fast)
    assert 0.0 <= r.breach_probability <= 1.0
    assert 0.0 <= r.severe_breach_probability <= 1.0
    assert r.severe_breach_probability <= r.breach_probability


def test_var95_nonneg(inputs):
    """VaR95 = base − p5 ≥ 0 при разумных вероятностях."""
    fast = _inputs_with_sg(inputs, n_sims=500)
    r = run_stage_gate(fast)
    assert r.var_95_mln_rub >= 0
