"""
test_11_stress_tests.py — стресс-тесты и breakeven (5 тестов).
"""
import pytest

from generators.stress_tests import generate_stress_tests


@pytest.fixture(scope="module")
def stress(base_model, run, inputs):
    return generate_stress_tests(
        base_model, run.anchor_value, inputs.scenarios.anchor.tolerance_pct
    )


def test_stress_has_6_scenarios(stress):
    """6 базовых шоков (rev−10/−20/−30, cost+10/+20, combined_bad)."""
    assert len(stress.scenarios) == 6


def test_breakeven_in_reasonable_range(stress):
    """Breakeven revenue shock ∈ (5%; 50%)."""
    assert 5.0 < stress.breakeven_revenue_shock_pct < 50.0


def test_each_scenario_has_required_fields(stress):
    """У каждой стресс-сценарной записи есть ключевые поля."""
    for sc in stress.scenarios:
        assert hasattr(sc, "name")
        assert hasattr(sc, "new_cumulative_ebitda")
        assert hasattr(sc, "delta_ebitda_pct")
        assert hasattr(sc, "passes_anchor")


def test_revenue_shocks_reduce_ebitda(stress):
    """Все шоки c «rev» в имени уменьшают EBITDA относительно якоря 3000."""
    for sc in stress.scenarios:
        if "rev" in sc.name.lower():
            assert sc.new_cumulative_ebitda <= 3000.0 + 1e-3


def test_combined_bad_scenario_is_worst_or_near(stress):
    """Combined bad — один из худших: EBITDA ≤ медианы среди всех сценариев."""
    ebitdas = [sc.new_cumulative_ebitda for sc in stress.scenarios]
    median = sorted(ebitdas)[len(ebitdas) // 2]
    combined = next(
        (sc.new_cumulative_ebitda for sc in stress.scenarios if "combined" in sc.name.lower()),
        None,
    )
    assert combined is not None
    assert combined <= median + 1e-3
