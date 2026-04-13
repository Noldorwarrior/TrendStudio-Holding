"""
schemas/costs.py — OPEX, P&A, CapEx, NWC схемы.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, SourceRef
from .segments import YearTargetMln, YearRevenueTarget, YearExpenseTarget, VALID_YEARS


# P&A и COGS растут вместе с объёмом (больше релизов → больше расходов),
# поэтому ordering у них как у revenue: cons ≤ base ≤ opt.
# Используем YearRevenueTarget, чтобы не плодить новых классов.
YearVolumeScalingCost = YearRevenueTarget


# ─────────────── OPEX ───────────────

class OpexCategory(StrictModel):
    model_config = {"extra": "allow"}
    category_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    share_in_opex_pct: float = Field(..., ge=0, le=1)


class OpexContingency(StrictModel):
    included: bool
    contingency_rate_pct: float = Field(..., ge=0, le=0.20)
    rationale: str


class OpexFile(StrictModel):
    targets_mln_rub: List[YearExpenseTarget]
    cost_categories: List[OpexCategory]
    contingency: OpexContingency
    meta: SourceRef

    @model_validator(mode="after")
    def categories_sum_to_one(self) -> "OpexFile":
        s = sum(c.share_in_opex_pct for c in self.cost_categories)
        if abs(s - 1.0) > 1e-3:
            raise ValueError(f"OPEX cost_categories shares sum={s:.4f} != 1.0")
        return self

    @model_validator(mode="after")
    def has_three_years(self) -> "OpexFile":
        years = {t.year for t in self.targets_mln_rub}
        if years != VALID_YEARS:
            raise ValueError(f"opex targets years {years} != {VALID_YEARS}")
        return self


# ─────────────── P&A ───────────────

class PaRatioToRevenue(StrictModel):
    cons: float = Field(..., ge=0, le=1)
    base: float = Field(..., ge=0, le=1)
    opt: float = Field(..., ge=0, le=1)
    industry_benchmark: float = Field(..., ge=0, le=1)
    rationale: str


class PerReleasePlan(StrictModel):
    flagship_release_mln_rub: float = Field(..., gt=0)
    medium_release_mln_rub: float = Field(..., gt=0)
    small_release_mln_rub: float = Field(..., gt=0)

    @model_validator(mode="after")
    def check_order(self) -> "PerReleasePlan":
        if not (self.small_release_mln_rub < self.medium_release_mln_rub < self.flagship_release_mln_rub):
            raise ValueError("P&A per release: small < medium < flagship required")
        return self


class PaCostsFile(StrictModel):
    targets_mln_rub: List[YearVolumeScalingCost]
    pa_ratio_to_cinema_revenue: PaRatioToRevenue
    cost_breakdown_pct: dict
    per_release_plan: PerReleasePlan
    meta: SourceRef

    @model_validator(mode="after")
    def breakdown_sum_to_one(self) -> "PaCostsFile":
        s = sum(self.cost_breakdown_pct.values())
        if abs(s - 1.0) > 1e-3:
            raise ValueError(f"P&A cost_breakdown_pct sum={s:.4f} != 1.0")
        return self


# ─────────────── CAPEX ───────────────

class ProductionCapexYear(StrictModel):
    year: int
    cons: float = Field(..., ge=0)
    base: float = Field(..., ge=0)
    opt: float = Field(..., ge=0)
    releases_count: int = Field(..., ge=1, le=10)
    comment: str

    @field_validator("year")
    @classmethod
    def year_ok(cls, v: int) -> int:
        if v not in VALID_YEARS:
            raise ValueError(f"year {v} not in {VALID_YEARS}")
        return v


class InfrastructureCapexYear(StrictModel):
    year: int
    base: float = Field(..., ge=0)
    items: List[str]

    @field_validator("year")
    @classmethod
    def year_ok(cls, v: int) -> int:
        if v not in VALID_YEARS:
            raise ValueError(f"year {v} not in {VALID_YEARS}")
        return v


class DepreciationPolicy(StrictModel):
    production_amortization_curve: dict
    infrastructure_useful_life_years: int = Field(..., ge=1, le=50)

    @model_validator(mode="after")
    def curve_sum_to_one(self) -> "DepreciationPolicy":
        s = sum(self.production_amortization_curve.values())
        if abs(s - 1.0) > 1e-3:
            raise ValueError(
                f"production_amortization_curve sum={s:.4f} != 1.0"
            )
        return self


class CapexFile(StrictModel):
    production_capex_mln_rub: List[ProductionCapexYear]
    cogs_targets_mln_rub: List[YearVolumeScalingCost]
    infrastructure_capex_mln_rub: List[InfrastructureCapexYear]
    depreciation_policy: DepreciationPolicy
    meta: SourceRef

    @model_validator(mode="after")
    def check_cogs_years(self) -> "CapexFile":
        years = {t.year for t in self.cogs_targets_mln_rub}
        if years != VALID_YEARS:
            raise ValueError(f"cogs targets years {years} != {VALID_YEARS}")
        return self


# ─────────────── NWC ───────────────

class TurnoverDays(StrictModel):
    """Оборачиваемость в днях. Разрешены доп. поля (rationale, comment)."""
    model_config = {"extra": "allow"}
    cons: int = Field(..., ge=0)
    base: int = Field(..., ge=0)
    opt: int = Field(..., ge=0)


class NwcTurnover(StrictModel):
    accounts_receivable: TurnoverDays
    accounts_payable: TurnoverDays
    inventory_wip: TurnoverDays
    advances_received: TurnoverDays


class NwcOpeningBalance(StrictModel):
    ar_mln_rub: float = Field(..., ge=0)
    ap_mln_rub: float = Field(..., ge=0)
    inventory_mln_rub: float = Field(..., ge=0)
    advances_mln_rub: float = Field(..., ge=0)
    net_nwc_mln_rub: float

    @model_validator(mode="after")
    def check_formula(self) -> "NwcOpeningBalance":
        calc = (
            self.ar_mln_rub + self.inventory_mln_rub
            - self.ap_mln_rub - self.advances_mln_rub
        )
        if abs(calc - self.net_nwc_mln_rub) > 0.01:
            raise ValueError(
                f"net_nwc formula: {calc:.2f} != {self.net_nwc_mln_rub:.2f}"
            )
        return self


class NwcFile(StrictModel):
    turnover_days: NwcTurnover
    # Δ NWC — «расходная» метрика (больше в худшем сценарии: cons ≥ base ≥ opt)
    nwc_change_mln_rub: List[YearExpenseTarget]
    opening_balance_2026: NwcOpeningBalance
    meta: SourceRef
