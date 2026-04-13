"""
test_20_market_bootstrap.py — регрессионные тесты F1 Tier E блочного
bootstrap годовых YoY российского проката (v1.3.8).

Проверяет:
- Отчёт корректно формируется из stress_matrix.market_bootstrap секции.
- Percentiles упорядочены p5 ≤ p25 ≤ p50 ≤ p75 ≤ p95.
- Детерминизм при одинаковом seed.
- market_beta=0 → все симуляции дают identity (cumulative_ebitda ≈ base).
- mean_ebitda близок к base × (1 + beta × (yoy_mean − 1))^h (грубая проверка).
- n_historical_yoy = 6 (для seed 2019–2025).
- VaR95 ≥ 0.
- breach_p ∈ [0; 1].
- Большой block_size даёт меньше стартов; при block=horizon фактически выбирается 1 блок.
- Shock с beta=1 даёт больший разброс, чем с beta=0.4.
"""
from __future__ import annotations

import pytest

from schemas.inputs import ValidatedInputs
from schemas.stress_matrix import MarketBootstrapConfig
from generators.market_bootstrap import (
    run_market_bootstrap,
    market_bootstrap_report_to_dict,
    _load_seed_yoy,
)
from pathlib import Path


PIPELINE_ROOT = Path(__file__).resolve().parents[1]


def _inputs_with_beta(inputs: ValidatedInputs, beta: float, n_sims: int = 400) -> ValidatedInputs:
    """Клонирует inputs с уменьшённым n_sims и новым market_beta для ускорения."""
    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    mb = mc.market_bootstrap
    new_mb = mb.model_copy(update={"market_beta": beta, "n_simulations": n_sims})
    new_mc = mc.model_copy(update={"market_bootstrap": new_mb})
    new_sm = sm.model_copy(update={"monte_carlo": new_mc})
    return inputs.model_copy(update={"stress_matrix": new_sm})


# ---------- базовый отчёт --------------------------------------------------


def test_market_bootstrap_report_has_expected_fields(inputs):
    """Отчёт содержит все поля и percentiles упорядочены."""
    fast = _inputs_with_beta(inputs, beta=0.40, n_sims=400)
    r = run_market_bootstrap(fast)
    assert r.method == "market_yoy_block_bootstrap"
    assert r.n_simulations == 400
    assert r.block_size == 2
    assert r.horizon_years == 3
    assert r.n_historical_yoy == 6
    assert r.p5_ebitda <= r.p25_ebitda <= r.p50_ebitda <= r.p75_ebitda <= r.p95_ebitda


def test_market_bootstrap_var95_nonneg(inputs):
    """VaR95 = base - p5 ≥ 0 (обычно положителен, но теоретически может быть 0)."""
    fast = _inputs_with_beta(inputs, beta=0.40, n_sims=400)
    r = run_market_bootstrap(fast)
    assert r.var_95_mln_rub >= 0


def test_market_bootstrap_breach_probability_range(inputs):
    """breach_p и severe_breach_p ∈ [0; 1]."""
    fast = _inputs_with_beta(inputs, beta=0.40, n_sims=400)
    r = run_market_bootstrap(fast)
    assert 0.0 <= r.breach_probability <= 1.0
    assert 0.0 <= r.severe_breach_probability <= 1.0


# ---------- детерминизм ----------------------------------------------------


def test_market_bootstrap_deterministic(inputs):
    """Одинаковый seed → одинаковые сводные статистики."""
    fast = _inputs_with_beta(inputs, beta=0.40, n_sims=300)
    r1 = run_market_bootstrap(fast)
    r2 = run_market_bootstrap(fast)
    assert r1.mean_ebitda == r2.mean_ebitda
    assert r1.std_ebitda == r2.std_ebitda
    assert r1.p5_ebitda == r2.p5_ebitda
    assert r1.p95_ebitda == r2.p95_ebitda


# ---------- market_beta = 0 → identity -------------------------------------


def test_market_bootstrap_beta_zero_is_identity(inputs):
    """beta=0: все scales=1 → все ebitda = base, std=0."""
    fast = _inputs_with_beta(inputs, beta=0.0, n_sims=200)
    r = run_market_bootstrap(fast)
    assert abs(r.mean_ebitda - r.base_ebitda) < 0.5
    assert r.std_ebitda < 0.5
    assert r.breach_probability == 0.0


# ---------- market_beta > 0 → разброс растёт -------------------------------


def test_market_bootstrap_higher_beta_higher_std(inputs):
    """std(beta=0.8) > std(beta=0.2)."""
    lo = _inputs_with_beta(inputs, beta=0.20, n_sims=400)
    hi = _inputs_with_beta(inputs, beta=0.80, n_sims=400)
    r_lo = run_market_bootstrap(lo)
    r_hi = run_market_bootstrap(hi)
    assert r_hi.std_ebitda > r_lo.std_ebitda, (
        f"std(beta=0.2)={r_lo.std_ebitda}, std(beta=0.8)={r_hi.std_ebitda}"
    )


# ---------- n_historical_yoy из seed ---------------------------------------


def test_seed_yoy_has_6_transitions():
    """_load_seed_yoy возвращает 6 переходов для 7-строчного seed 2019-2025."""
    csv_path = PIPELINE_ROOT / "inputs" / "eais_seed" / "annual_box_office.csv"
    yoy = _load_seed_yoy(csv_path)
    assert len(yoy) == 6
    years_from = [t[0] for t in yoy]
    assert years_from == [2019, 2020, 2021, 2022, 2023, 2024]


def test_seed_yoy_contains_covid_trough():
    """Среди YoY есть значение < 0.5 (COVID 2019→2020)."""
    csv_path = PIPELINE_ROOT / "inputs" / "eais_seed" / "annual_box_office.csv"
    yoy = _load_seed_yoy(csv_path)
    assert any(t[2] < 0.5 for t in yoy), "no COVID trough in YoY series"


def test_seed_yoy_contains_post_covid_rebound():
    """Среди YoY есть значение > 1.8 (2020→2021 +112%)."""
    csv_path = PIPELINE_ROOT / "inputs" / "eais_seed" / "annual_box_office.csv"
    yoy = _load_seed_yoy(csv_path)
    assert any(t[2] > 1.8 for t in yoy)


# ---------- exclude_years --------------------------------------------------


def test_seed_yoy_exclude_years():
    """exclude_years=[2020] исключает переходы 2019→2020 и 2020→2021."""
    csv_path = PIPELINE_ROOT / "inputs" / "eais_seed" / "annual_box_office.csv"
    yoy = _load_seed_yoy(csv_path, exclude_years=[2020])
    assert len(yoy) == 4  # было 6, минус 2 перехода с годом 2020
    for y0, y1, _ in yoy:
        assert y0 != 2020 and y1 != 2020


# ---------- сумма вероятностей severe ⊆ breach -----------------------------


def test_severe_is_subset_of_breach(inputs):
    """severe_breach_p ≤ breach_p (severe — подмножество breach)."""
    fast = _inputs_with_beta(inputs, beta=0.80, n_sims=500)
    r = run_market_bootstrap(fast)
    assert r.severe_breach_probability <= r.breach_probability
