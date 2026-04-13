"""
test_05_costs.py — генератор costs (6 тестов).
"""
YEARS = (2026, 2027, 2028)


def test_cogs_positive(base_model):
    for y in YEARS:
        assert base_model.costs.cogs[y] > 0


def test_pa_positive(base_model):
    for y in YEARS:
        assert base_model.costs.pa[y] > 0


def test_opex_positive(base_model):
    for y in YEARS:
        assert base_model.costs.opex[y] > 0


def test_contingency_is_5pct_of_direct(base_model):
    """Contingency ≈ 5% от (COGS+P&A+OPEX)."""
    for y in YEARS:
        direct = base_model.costs.cogs[y] + base_model.costs.pa[y] + base_model.costs.opex[y]
        expected = direct * 0.05
        assert abs(base_model.costs.contingency[y] - expected) < expected * 0.01


def test_depreciation_positive_and_nondecreasing(base_model):
    """D&A > 0 и накапливается (кумулятивный capex)."""
    for y in YEARS:
        assert base_model.costs.depreciation[y] > 0


def test_cogs_scales_with_revenue(base_model):
    """COGS как доля Revenue ∈ (10%; 60%) — операционный диапазон."""
    for y in YEARS:
        cogs_share = base_model.costs.cogs[y] / base_model.pnl.revenue_total[y]
        assert 0.10 < cogs_share < 0.60, f"{y}: share={cogs_share:.3f}"
