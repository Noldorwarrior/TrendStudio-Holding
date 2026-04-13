"""
test_06_pnl.py — бухгалтерские тождества P&L (6 тестов).
"""
YEARS = (2026, 2027, 2028)
TOL = 1e-6


def test_gross_profit_equals_revenue_minus_cogs(base_model):
    for y in YEARS:
        expected = base_model.pnl.revenue_total[y] - base_model.pnl.cogs[y]
        assert abs(base_model.pnl.gross_profit[y] - expected) < TOL


def test_ebitda_equals_gross_minus_opex_pa_contingency(base_model):
    """EBITDA = GP − P&A − OPEX − Contingency."""
    for y in YEARS:
        expected = (
            base_model.pnl.gross_profit[y]
            - base_model.pnl.pa[y]
            - base_model.pnl.opex[y]
            - base_model.pnl.contingency[y]
        )
        assert abs(base_model.pnl.ebitda[y] - expected) < TOL, \
            f"year={y}: ebitda={base_model.pnl.ebitda[y]} expected={expected}"


def test_ebit_equals_ebitda_minus_depreciation(base_model):
    for y in YEARS:
        expected = base_model.pnl.ebitda[y] - base_model.pnl.depreciation[y]
        assert abs(base_model.pnl.ebit[y] - expected) < TOL


def test_taxes_are_nonnegative(base_model):
    """Налоги могут быть 0 при EBIT ≤ 0, но не отрицательные."""
    for y in YEARS:
        assert base_model.pnl.taxes[y] >= 0 - TOL


def test_net_income_equals_ebit_minus_taxes(base_model):
    for y in YEARS:
        expected = base_model.pnl.ebit[y] - base_model.pnl.taxes[y]
        assert abs(base_model.pnl.net_income[y] - expected) < TOL


def test_revenue_costs_ebitda_consistency(base_model):
    """Σ EBITDA = Σ Revenue − Σ (COGS+P&A+OPEX+Contingency)."""
    rev = sum(base_model.pnl.revenue_total.values())
    cogs = sum(base_model.pnl.cogs.values())
    pa = sum(base_model.pnl.pa.values())
    opex = sum(base_model.pnl.opex.values())
    cont = sum(base_model.pnl.contingency.values())
    ebitda = sum(base_model.pnl.ebitda.values())
    assert abs(ebitda - (rev - cogs - pa - opex - cont)) < 1e-3
