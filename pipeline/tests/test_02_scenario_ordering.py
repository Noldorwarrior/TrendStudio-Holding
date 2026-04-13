"""
test_02_scenario_ordering.py — порядок сценариев cons ≤ base ≤ opt (6 тестов).
"""
import pytest

YEARS = (2026, 2027, 2028)


def _sum(d):
    return sum(d.values())


def test_revenue_total_cons_le_base_le_opt(all_models):
    """Revenue: cons ≤ base ≤ opt по каждому году."""
    for y in YEARS:
        cons = all_models["cons"].pnl.revenue_total[y]
        base = all_models["base"].pnl.revenue_total[y]
        opt = all_models["opt"].pnl.revenue_total[y]
        assert cons <= base <= opt, f"year={y}: cons={cons}, base={base}, opt={opt}"


def test_ebitda_cons_le_base_le_opt(all_models):
    """EBITDA: cons ≤ base ≤ opt."""
    for y in YEARS:
        cons = all_models["cons"].pnl.ebitda[y]
        base = all_models["base"].pnl.ebitda[y]
        opt = all_models["opt"].pnl.ebitda[y]
        assert cons <= base <= opt


def test_net_income_cons_le_base_le_opt(all_models):
    """Net income: cons ≤ base ≤ opt."""
    for y in YEARS:
        cons = all_models["cons"].pnl.net_income[y]
        base = all_models["base"].pnl.net_income[y]
        opt = all_models["opt"].pnl.net_income[y]
        assert cons <= base <= opt


def test_fcf_cumulative_cons_le_base_le_opt(all_models):
    """Кумулятивный FCF: cons ≤ base ≤ opt."""
    cf_cons = _sum(all_models["cons"].cashflow.free_cash_flow)
    cf_base = _sum(all_models["base"].cashflow.free_cash_flow)
    cf_opt = _sum(all_models["opt"].cashflow.free_cash_flow)
    assert cf_cons <= cf_base <= cf_opt


def test_wacc_ordering_cons_ge_base_ge_opt(all_models):
    """WACC: в пессимистичном сценарии выше, в оптимистичном — ниже."""
    w_cons = all_models["cons"].valuation.wacc_switcher
    w_base = all_models["base"].valuation.wacc_switcher
    w_opt = all_models["opt"].valuation.wacc_switcher
    assert w_cons >= w_base >= w_opt


def test_npv_ordering_cons_le_base_le_opt(all_models):
    """NPV: cons ≤ base ≤ opt."""
    n_cons = all_models["cons"].valuation.npv_switcher
    n_base = all_models["base"].valuation.npv_switcher
    n_opt = all_models["opt"].valuation.npv_switcher
    assert n_cons <= n_base <= n_opt
