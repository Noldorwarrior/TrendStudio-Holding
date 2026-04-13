"""
generators/cashflow.py — годовой Cash Flow Statement (косвенный метод).

Вход: PnL, CostsByCategory, CapexFile
Выход: CashFlow

Структура (косвенный):
    Net Income
    + D&A
    - Δ NWC
    = Operating Cash Flow

    - Production CapEx
    - Infrastructure CapEx
    = Investing Cash Flow

    Financing CF = 0 на этом этапе (инвестиционный раунд отражается
    отдельно в provenance/инвестиционном tracker-е).

    FCF = OCF + ICF
"""
from __future__ import annotations

from typing import Dict

from schemas.base import ScenarioName
from schemas.costs import CapexFile
from schemas.model_output import CashFlow, CostsByCategory, PnL

from .base import (
    YEARS,
    empty_year_dict,
    scale_year_dict,
    sub_year_dicts,
    sum_year_dicts,
)


def _production_capex_dict(
    capex: CapexFile, scenario: ScenarioName
) -> Dict[int, float]:
    result = empty_year_dict()
    for row in capex.production_capex_mln_rub:
        result[row.year] = float(getattr(row, scenario))
    return result


def _infrastructure_capex_dict(capex: CapexFile) -> Dict[int, float]:
    result = empty_year_dict()
    for row in capex.infrastructure_capex_mln_rub:
        result[row.year] = float(row.base)
    return result


def generate_cashflow(
    scenario: ScenarioName,
    pnl: PnL,
    costs: CostsByCategory,
    capex_file: CapexFile,
) -> CashFlow:
    net_income = dict(pnl.net_income)
    depreciation_add = dict(costs.depreciation)
    nwc_change = dict(costs.nwc_change)

    # OCF = NI + D&A − ΔNWC
    ocf = sub_year_dicts(
        sum_year_dicts(net_income, depreciation_add),
        nwc_change,
    )

    # CapEx
    prod = _production_capex_dict(capex_file, scenario)
    infra = _infrastructure_capex_dict(capex_file)
    total_capex = sum_year_dicts(prod, infra)

    # ICF отрицательный (отток)
    icf = scale_year_dict(total_capex, -1.0)

    # FCF = OCF + ICF
    fcf = sum_year_dicts(ocf, icf)

    # Financing CF = 0 (на этом этапе pipeline)
    financing = empty_year_dict()

    return CashFlow(
        scenario=scenario,
        net_income=net_income,
        depreciation_add=depreciation_add,
        nwc_change=nwc_change,
        capex=total_capex,
        operating_cf=ocf,
        investing_cf=icf,
        financing_cf=financing,
        free_cash_flow=fcf,
    )
