"""
generators/pnl.py — построение P&L для одного сценария.

Вход: scenario, RevenueBySegment, CostsByCategory, MacroFile (для ставки налога)
Выход: PnL

Структура:
    Revenue (Total)
    - COGS
    = Gross Profit
    - P&A
    - OPEX
    - Contingency
    = EBITDA
    - Depreciation
    = EBIT
    - Taxes (если EBIT > 0, иначе 0)
    = Net Income
"""
from __future__ import annotations

from typing import Dict

from schemas.base import ScenarioName
from schemas.macro import MacroFile
from schemas.model_output import CostsByCategory, PnL, RevenueBySegment

from .base import (
    YEARS,
    empty_year_dict,
    sub_year_dicts,
    sum_year_dicts,
)


def _revenue_total_dict(revenue: RevenueBySegment) -> Dict[int, float]:
    return {y: revenue.total_by_year(y) for y in YEARS}


def generate_pnl(
    scenario: ScenarioName,
    revenue: RevenueBySegment,
    costs: CostsByCategory,
    macro: MacroFile,
) -> PnL:
    """
    Возвращает PnL c пересчитанным полем costs.taxes
    (записывать в costs нельзя — он immutable; значение хранится только в PnL).
    """
    revenue_total = _revenue_total_dict(revenue)

    # Gross Profit = Revenue − COGS
    gross_profit = sub_year_dicts(revenue_total, costs.cogs)

    # EBITDA = Gross Profit − P&A − OPEX − Contingency
    below_ebitda = sum_year_dicts(costs.pa, costs.opex, costs.contingency)
    ebitda = sub_year_dicts(gross_profit, below_ebitda)

    # EBIT = EBITDA − Depreciation
    ebit = sub_year_dicts(ebitda, costs.depreciation)

    # Taxes: max(0, EBIT) × tax_rate (упрощение: без NOL carry-forward на этом этапе)
    tax_rate = float(macro.profit_tax_rate.rate)
    taxes = {
        y: max(0.0, ebit[y]) * tax_rate for y in YEARS
    }

    # Net Income = EBIT − Taxes
    net_income = sub_year_dicts(ebit, taxes)

    return PnL(
        scenario=scenario,
        revenue_total=revenue_total,
        cogs=costs.cogs,
        gross_profit=gross_profit,
        pa=costs.pa,
        opex=costs.opex,
        contingency=costs.contingency,
        ebitda=ebitda,
        depreciation=costs.depreciation,
        ebit=ebit,
        taxes=taxes,
        net_income=net_income,
    )
