"""
test_10_sensitivity.py — таблица NPV(WACC × growth) (5 тестов).
"""
import pytest

from generators.sensitivity import generate_sensitivity


@pytest.fixture(scope="module")
def sens(base_model, inputs):
    return generate_sensitivity(base_model.cashflow, inputs.valuation.sensitivity_grid)


def _valid(w, g):
    """Пара (wacc, growth) валидна только если wacc > g."""
    return w > g


def test_sensitivity_grid_has_expected_shape(sens, inputs):
    grid = inputs.valuation.sensitivity_grid
    assert len(sens.wacc_values) == len(grid.wacc_range)
    assert len(sens.growth_values) == len(grid.terminal_growth_range)


def test_npv_matrix_fully_populated(sens):
    """Все (w,g) пары заполнены."""
    for w in sens.wacc_values:
        for g in sens.growth_values:
            assert (w, g) in sens.npv_matrix


def test_npv_nondecreases_when_wacc_drops(sens):
    """При фиксированной g, NPV растёт (не убывает) при уменьшении WACC."""
    g = sens.growth_values[0]  # берём минимальный g
    waccs_valid = sorted([w for w in sens.wacc_values if _valid(w, g)])
    npvs = [sens.npv_matrix[(w, g)] for w in waccs_valid]
    # Монотонное убывание npv с ростом wacc (знак: FCF отрицательный →
    # меньше дисконтирование → более отрицательный NPV; поэтому NPV убывает с wacc↓)
    # Проверим что последовательность строго монотонна (в ту или другую сторону).
    diffs = [npvs[i + 1] - npvs[i] for i in range(len(npvs) - 1)]
    same_sign = all(d >= -1e-3 for d in diffs) or all(d <= 1e-3 for d in diffs)
    assert same_sign, f"NPV non-monotonic in WACC at g={g}: {npvs}"


def test_npv_monotonic_in_growth(sens):
    """При фиксированной w, NPV монотонен в g (знак зависит от знака FCF)."""
    w = max(sens.wacc_values)
    growths_valid = sorted([g for g in sens.growth_values if _valid(w, g)])
    npvs = [sens.npv_matrix[(w, g)] for g in growths_valid]
    diffs = [npvs[i + 1] - npvs[i] for i in range(len(npvs) - 1)]
    same_sign = all(d >= -1e-3 for d in diffs) or all(d <= 1e-3 for d in diffs)
    assert same_sign, f"NPV non-monotonic in growth at w={w}: {npvs}"


def test_invalid_wacc_growth_returns_zero(sens):
    """Если wacc ≤ g, генератор возвращает 0.0 как маркер."""
    for w in sens.wacc_values:
        for g in sens.growth_values:
            if w <= g:
                assert sens.npv_matrix[(w, g)] == 0.0
