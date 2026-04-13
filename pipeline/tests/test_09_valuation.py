"""
test_09_valuation.py — оценка DCF/IRR/MOIC (6 тестов).
"""


def test_wacc_capm_in_reasonable_range(base_model):
    """WACC CAPM ∈ (10%; 40%) — операционный диапазон для РФ кино."""
    w = base_model.valuation.wacc_capm
    assert 0.10 < w < 0.40


def test_three_wacc_methodologies_present(base_model):
    """Три методологии WACC: CAPM, Build-up, Switcher."""
    assert base_model.valuation.wacc_capm > 0
    assert base_model.valuation.wacc_buildup > 0
    assert base_model.valuation.wacc_switcher > 0


def test_npv_three_wacc_variants_all_finite(base_model):
    """NPV по всем 3 методологиям — конечные числа."""
    import math
    for key in ("npv_capm", "npv_switcher", "npv_buildup"):
        v = getattr(base_model.valuation, key)
        assert math.isfinite(v), f"{key}={v}"


def test_irr_in_reasonable_range_base(base_model):
    """IRR base либо None (нет решения), либо ∈ (−50%; 100%)."""
    irr = base_model.valuation.irr
    if irr is not None:
        assert -0.5 < irr < 1.0


def test_moic_nonnegative_base(base_model):
    """MOIC ≥ 0."""
    assert base_model.valuation.moic >= 0


def test_terminal_values_both_variants_finite(base_model):
    """TV Gordon и TV Exit Multiple — оба конечные числа (Gordon может быть
    отрицательным при WACC < g при стрессе; Exit Multiple — всегда > 0)."""
    import math
    assert math.isfinite(base_model.valuation.terminal_value_gordon)
    assert base_model.valuation.terminal_value_multiple > 0
