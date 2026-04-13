"""
generators/costs_gen.py — генератор расходов.

Входы: OpexFile, PaCostsFile, CapexFile, NwcFile, MacroFile, RevenueBySegment
Выход: CostsByCategory (7 категорий × 3 года)

Категории (см. schemas/model_output.py::CostsByCategory):
- cogs         — Cost of Goods Sold (из CapexFile.cogs_targets_mln_rub)
- pa           — Print & Advertising (из PaCostsFile.targets_mln_rub)
- opex         — SG&A (из OpexFile.targets_mln_rub)
- taxes        — налог на прибыль (считается в pnl.py, но плейсхолдер здесь)
- contingency  — 5% от (COGS + P&A + OPEX), т.к. contingency_rate_pct в opex.yaml
- depreciation — амортизация по curve из capex.depreciation_policy
- nwc_change   — Δ NWC из NwcFile.nwc_change_mln_rub

Правило: сгенерированные значения сверяются с anchor через pnl.py + check_anchor.
Здесь задача — просто вытащить все расходы по сценарию.
"""
from __future__ import annotations

from typing import Dict, Tuple

from schemas.base import ScenarioName
from schemas.costs import CapexFile, NwcFile, OpexFile, PaCostsFile
from schemas.macro import MacroFile
from schemas.model_output import CostsByCategory, RevenueBySegment

from .base import (
    YEARS,
    empty_year_dict,
    scale_year_dict,
    sum_year_dicts,
    targets_to_dict,
)


def _production_capex_dict(
    capex: CapexFile, scenario: ScenarioName
) -> Dict[int, float]:
    """Production CapEx по году (на основе custom-класса ProductionCapexYear)."""
    result = empty_year_dict()
    for row in capex.production_capex_mln_rub:
        result[row.year] = float(getattr(row, scenario))
    return result


def _infrastructure_capex_dict(capex: CapexFile) -> Dict[int, float]:
    """Infrastructure CapEx (только base, т.к. сценариев нет)."""
    result = empty_year_dict()
    for row in capex.infrastructure_capex_mln_rub:
        result[row.year] = float(row.base)
    return result


def _depreciation_dict(
    capex: CapexFile, scenario: ScenarioName
) -> Dict[int, float]:
    """
    Амортизация по году с учётом production_amortization_curve
    и линейной амортизации инфраструктуры.

    Production CapEx в Y0 → распределяется по curve на Y0, Y+1, Y+2, Y+3.
    Infrastructure CapEx в Y0 → линейно по useful_life_years.
    """
    curve = capex.depreciation_policy.production_amortization_curve
    # ключи вида "year_0", "year_1", ... или просто "0", "1", ... — берём по значениям.
    curve_items = []
    for k, v in curve.items():
        # извлекаем цифру из ключа
        digits = "".join(ch for ch in str(k) if ch.isdigit())
        idx = int(digits) if digits else 0
        curve_items.append((idx, float(v)))
    curve_items.sort()

    prod = _production_capex_dict(capex, scenario)
    infra = _infrastructure_capex_dict(capex)
    useful_life = capex.depreciation_policy.infrastructure_useful_life_years

    result = empty_year_dict()
    # Production: на каждый год производства распределяем CapEx по curve
    for y0 in YEARS:
        base_amount = prod[y0]
        for idx, share in curve_items:
            target_year = y0 + idx
            if target_year in result:
                result[target_year] += base_amount * share
    # Infrastructure: линейная амортизация
    for y0 in YEARS:
        amount = infra[y0]
        annual = amount / useful_life if useful_life > 0 else 0.0
        for y in YEARS:
            if y >= y0:
                result[y] += annual
    return result


def generate_costs(
    scenario: ScenarioName,
    revenue: RevenueBySegment,
    opex_file: OpexFile,
    pa_file: PaCostsFile,
    capex_file: CapexFile,
    nwc_file: NwcFile,
    macro: MacroFile,
) -> Tuple[CostsByCategory, Dict[int, float]]:
    """
    Возвращает (CostsByCategory, контингенси-словарь).

    taxes оставляем нулями здесь — они рассчитываются в pnl.py
    после EBIT.
    """
    # 1. Прямые targets
    cogs = targets_to_dict(capex_file.cogs_targets_mln_rub, scenario)
    pa = targets_to_dict(pa_file.targets_mln_rub, scenario)
    opex = targets_to_dict(opex_file.targets_mln_rub, scenario)

    # 2. Contingency = 5% от (COGS + P&A + OPEX)
    operating_sum = sum_year_dicts(cogs, pa, opex)
    contingency = scale_year_dict(
        operating_sum, opex_file.contingency.contingency_rate_pct
    )

    # 3. Depreciation (из curve + infra)
    depreciation = _depreciation_dict(capex_file, scenario)

    # 4. Δ NWC из отдельного файла
    nwc_change = targets_to_dict(nwc_file.nwc_change_mln_rub, scenario)

    # 5. Taxes — заполним в pnl.py, здесь нули
    taxes = empty_year_dict()

    return (
        CostsByCategory(
            cogs=cogs,
            pa=pa,
            opex=opex,
            taxes=taxes,
            contingency=contingency,
            depreciation=depreciation,
            nwc_change=nwc_change,
        ),
        contingency,  # удобный доступ для тестов
    )
