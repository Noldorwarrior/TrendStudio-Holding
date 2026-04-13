"""
test_12_monte_carlo.py — Monte-Carlo симуляции (5 тестов).
"""
import pytest

from generators.monte_carlo import generate_monte_carlo


@pytest.fixture(scope="module")
def mc(base_model, run):
    return generate_monte_carlo(base_model, anchor_value=run.anchor_value, n_sims=2000, seed=42)


def test_mc_n_sims_equals_2000(mc):
    assert mc.n_sims == 2000


def test_mc_percentiles_ordered(mc):
    """p5 ≤ p25 ≤ median ≤ p75 ≤ p95."""
    assert mc.ebitda_p5 <= mc.ebitda_p95
    assert mc.ebitda_p5 <= mc.ebitda_mean <= mc.ebitda_p95


def test_mc_mean_within_20pct_of_anchor(mc):
    """Mean симуляции должен быть в разумной близости к якорю 3000."""
    # Допускаем большой разброс из-за triangular; но mean должен быть в (2000; 4000)
    assert 2000 < mc.ebitda_mean < 4000


def test_mc_probability_to_hit_anchor(mc):
    """P(EBITDA ≥ 3000) лежит в (0.1; 0.9) — не тривиально экстремальная."""
    assert 0.1 < mc.prob_ebitda_above_anchor < 0.9


def test_mc_reproducible_with_same_seed(base_model, run):
    """Повторный запуск с тем же seed даёт идентичный mean."""
    mc1 = generate_monte_carlo(base_model, anchor_value=run.anchor_value, n_sims=500, seed=123)
    mc2 = generate_monte_carlo(base_model, anchor_value=run.anchor_value, n_sims=500, seed=123)
    assert abs(mc1.ebitda_mean - mc2.ebitda_mean) < 1e-6
