"""
schemas/investment.py — Параметры инвестиционного раунда.
"""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, SourceRef


RoundType = Literal[
    "equity", "debt", "mezzanine", "convertible", "equity_with_debt_tranche"
]


class AskScenario(StrictModel):
    """Запрос денег у инвестора: cons (плохо → просим больше) ≥ base ≥ opt."""
    cons: float = Field(..., gt=0)
    base: float = Field(..., gt=0)
    opt: float = Field(..., gt=0)

    @model_validator(mode="after")
    def check_order(self) -> "AskScenario":
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(
                f"ask ordering violated: cons={self.cons} base={self.base} opt={self.opt}"
            )
        return self


class ReturnScenario(StrictModel):
    """Возврат инвестору (MOIC / IRR): cons ≤ base ≤ opt."""
    cons: float = Field(..., ge=0)
    base: float = Field(..., ge=0)
    opt: float = Field(..., ge=0)

    @model_validator(mode="after")
    def check_order(self) -> "ReturnScenario":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError(
                f"return ordering violated: cons={self.cons} base={self.base} opt={self.opt} "
                f"(для возврата инвестора требуется cons ≤ base ≤ opt)"
            )
        return self


class Tranche(StrictModel):
    model_config = {"extra": "allow"}
    tranche_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    amount_mln_rub: float = Field(..., gt=0)
    instrument: str


class UseOfFundsPct(StrictModel):
    production_slate_2026_2027: float = Field(..., ge=0, le=1)
    opening_working_capital: float = Field(..., ge=0, le=1)
    infrastructure_capex: float = Field(..., ge=0, le=1)
    pa_marketing_reserve: float = Field(..., ge=0, le=1)
    general_contingency: float = Field(..., ge=0, le=1)

    @model_validator(mode="after")
    def sum_to_one(self) -> "UseOfFundsPct":
        s = (
            self.production_slate_2026_2027
            + self.opening_working_capital
            + self.infrastructure_capex
            + self.pa_marketing_reserve
            + self.general_contingency
        )
        if abs(s - 1.0) > 1e-3:
            raise ValueError(f"use_of_funds_pct sum={s:.4f} != 1.0")
        return self


class UseOfFundsMln(StrictModel):
    production_slate_2026_2027: float = Field(..., ge=0)
    opening_working_capital: float = Field(..., ge=0)
    infrastructure_capex: float = Field(..., ge=0)
    pa_marketing_reserve: float = Field(..., ge=0)
    general_contingency: float = Field(..., ge=0)

    def total(self) -> float:
        return (
            self.production_slate_2026_2027
            + self.opening_working_capital
            + self.infrastructure_capex
            + self.pa_marketing_reserve
            + self.general_contingency
        )


class InvestorReturns(StrictModel):
    model_config = {"extra": "allow"}
    expected_exit_year: int = Field(..., ge=2027, le=2032)
    expected_exit_multiple_moic: ReturnScenario
    expected_irr_pct: ReturnScenario
    exit_strategy: str


class InvestmentFile(StrictModel):
    model_config = {"extra": "allow"}
    round_type: RoundType
    round_stage: str
    ask_mln_rub: AskScenario
    headline_ask_mln_rub: float = Field(..., gt=0)
    tranche_structure: List[Tranche]
    use_of_funds_pct: UseOfFundsPct
    use_of_funds_mln_rub: UseOfFundsMln
    investor_returns: InvestorReturns
    meta: SourceRef

    @model_validator(mode="after")
    def tranches_sum_matches_headline(self) -> "InvestmentFile":
        tranche_sum = sum(t.amount_mln_rub for t in self.tranche_structure)
        if abs(tranche_sum - self.headline_ask_mln_rub) > 0.01:
            raise ValueError(
                f"tranches sum {tranche_sum} != headline_ask {self.headline_ask_mln_rub}"
            )
        return self

    @model_validator(mode="after")
    def use_of_funds_mln_matches_headline(self) -> "InvestmentFile":
        total = self.use_of_funds_mln_rub.total()
        if abs(total - self.headline_ask_mln_rub) > 0.01:
            raise ValueError(
                f"use_of_funds total {total} != headline_ask {self.headline_ask_mln_rub}"
            )
        return self

    @model_validator(mode="after")
    def headline_near_base(self) -> "InvestmentFile":
        # Headline должен быть не меньше base (мы не просим МЕНЬШЕ, чем нужно)
        # и не больше cons * 1.05 (не перебираем выше худшего сценария)
        if self.headline_ask_mln_rub < self.ask_mln_rub.base * 0.95:
            raise ValueError(
                f"headline_ask {self.headline_ask_mln_rub} < 95% of base {self.ask_mln_rub.base}"
            )
        return self
