"""
test_07_cashflow.py — сверка CashFlow с P&L (5 тестов).
"""
YEARS = (2026, 2027, 2028)
TOL = 1e-6


def test_cf_net_income_matches_pnl(base_model):
    for y in YEARS:
        assert abs(base_model.cashflow.net_income[y] - base_model.pnl.net_income[y]) < TOL


def test_cf_depreciation_add_matches_costs(base_model):
    for y in YEARS:
        assert abs(
            base_model.cashflow.depreciation_add[y] - base_model.costs.depreciation[y]
        ) < TOL


def test_operating_cf_equals_ni_plus_da_minus_nwc(base_model):
    for y in YEARS:
        expected = (
            base_model.cashflow.net_income[y]
            + base_model.cashflow.depreciation_add[y]
            - base_model.cashflow.nwc_change[y]
        )
        assert abs(base_model.cashflow.operating_cf[y] - expected) < TOL


def test_investing_cf_equals_negative_capex(base_model):
    for y in YEARS:
        assert abs(base_model.cashflow.investing_cf[y] + base_model.cashflow.capex[y]) < TOL


def test_fcf_equals_operating_plus_investing(base_model):
    """FCF = Operating CF + Investing CF (+ финансовая деятельность = 0 в Base)."""
    for y in YEARS:
        expected = base_model.cashflow.operating_cf[y] + base_model.cashflow.investing_cf[y]
        assert abs(base_model.cashflow.free_cash_flow[y] - expected) < TOL
