"""
schemas/valuation.py — WACC (3 методики), terminal value (2 методики),
target DCF output, sensitivity grid.
"""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, SourceRef


WaccMethodId = Literal["capm_classic", "build_up_country_risk", "comparable_emerging_markets"]
TvMethodId = Literal["gordon_growth", "exit_multiple"]


class WaccScenario(StrictModel):
    cons: float = Field(..., gt=0, lt=1)
    base: float = Field(..., gt=0, lt=1)
    opt: float = Field(..., gt=0, lt=1)

    @model_validator(mode="after")
    def check_order(self) -> "WaccScenario":
        # WACC: cons выше (больше риск), opt ниже
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(
                f"WACC ordering violated: cons={self.cons} base={self.base} opt={self.opt}"
            )
        return self


class WaccMethodology(StrictModel):
    model_config = {"extra": "allow"}
    method_id: WaccMethodId
    title: str
    wacc: WaccScenario
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")


class GrowthRate(StrictModel):
    cons: float = Field(..., ge=0, le=0.15)
    base: float = Field(..., ge=0, le=0.15)
    opt: float = Field(..., ge=0, le=0.15)

    @model_validator(mode="after")
    def check_order(self) -> "GrowthRate":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError(
                f"growth ordering violated: cons={self.cons} base={self.base} opt={self.opt}"
            )
        return self


class ExitMultiple(StrictModel):
    cons: float = Field(..., gt=0, lt=30)
    base: float = Field(..., gt=0, lt=30)
    opt: float = Field(..., gt=0, lt=30)

    @model_validator(mode="after")
    def check_order(self) -> "ExitMultiple":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError("exit_multiple ordering violated")
        return self


class TvMethodology(StrictModel):
    model_config = {"extra": "allow"}
    method_id: TvMethodId
    title: str
    rationale: str


class TvGordonGrowth(TvMethodology):
    perpetual_growth_rate: GrowthRate


class TvExitMultiple(TvMethodology):
    ev_ebitda_multiple: ExitMultiple


class ValuationScenario(StrictModel):
    cons: float = Field(..., ge=0)
    base: float = Field(..., ge=0)
    opt: float = Field(..., ge=0)

    @model_validator(mode="after")
    def check_order(self) -> "ValuationScenario":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError("valuation ordering violated")
        return self


class TargetDcfOutput(StrictModel):
    enterprise_value_mln_rub: ValuationScenario
    equity_value_mln_rub: ValuationScenario

    @model_validator(mode="after")
    def ev_gte_equity(self) -> "TargetDcfOutput":
        # EV должен быть >= Equity (разница = net debt)
        for s in ("cons", "base", "opt"):
            ev = getattr(self.enterprise_value_mln_rub, s)
            eqv = getattr(self.equity_value_mln_rub, s)
            if ev < eqv:
                raise ValueError(
                    f"EV ({ev}) < Equity ({eqv}) in scenario {s}: must be EV >= Equity"
                )
        return self


class SensitivityGrid(StrictModel):
    wacc_range: List[float]
    terminal_growth_range: List[float]

    @field_validator("wacc_range", "terminal_growth_range")
    @classmethod
    def non_empty_sorted(cls, v: List[float]) -> List[float]:
        if not v or len(v) < 2:
            raise ValueError("sensitivity range must have >= 2 values")
        if sorted(v) != v:
            raise ValueError("sensitivity range must be ascending")
        return v


class ValuationFile(StrictModel):
    model_config = {"extra": "allow"}
    wacc_methodologies: List[WaccMethodology]
    terminal_value_methodologies: list
    target_dcf_output: TargetDcfOutput
    sensitivity_grid: SensitivityGrid
    meta: SourceRef

    @model_validator(mode="after")
    def check_three_wacc(self) -> "ValuationFile":
        ids = {m.method_id for m in self.wacc_methodologies}
        expected = {"capm_classic", "build_up_country_risk", "comparable_emerging_markets"}
        if ids != expected:
            raise ValueError(f"wacc_methodologies ids {ids} != {expected}")
        return self

    @model_validator(mode="after")
    def check_two_tv_methods(self) -> "ValuationFile":
        if len(self.terminal_value_methodologies) != 2:
            raise ValueError("terminal_value_methodologies must have exactly 2 entries")
        ids = {m.get("method_id") for m in self.terminal_value_methodologies}
        if ids != {"gordon_growth", "exit_multiple"}:
            raise ValueError(f"tv method_ids {ids} != expected")
        return self
