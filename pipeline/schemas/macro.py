"""
schemas/macro.py — Макроэкономические допущения.
Проверяет горизонт, inflation, USD/RUB, key rate, налоги.
"""
from __future__ import annotations

from typing import List, Literal

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, ScenarioValues, SourceRef


VALID_YEARS = {2026, 2027, 2028}


class Horizon(StrictModel):
    start_year: int = Field(..., ge=2026, le=2026)
    end_year: int = Field(..., ge=2028, le=2028)
    total_years: int = Field(..., ge=3, le=3)

    @model_validator(mode="after")
    def check_span(self) -> "Horizon":
        if self.end_year - self.start_year + 1 != self.total_years:
            raise ValueError(
                f"Horizon: end - start + 1 ({self.end_year - self.start_year + 1}) "
                f"!= total_years ({self.total_years})"
            )
        return self


class YearlyRate(StrictModel):
    """Годовая ставка/курс/инфляция с cons/base/opt."""
    year: int
    cons: float
    base: float
    opt: float

    @field_validator("year")
    @classmethod
    def check_year(cls, v: int) -> int:
        if v not in VALID_YEARS:
            raise ValueError(f"year={v} not in {VALID_YEARS}")
        return v


class InflationRate(YearlyRate):
    @model_validator(mode="after")
    def check_order(self) -> "InflationRate":
        # Для инфляции: cons (высокая) ≥ base ≥ opt (низкая)
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(
                f"Inflation ordering violated year={self.year}: "
                f"cons={self.cons} base={self.base} opt={self.opt}"
            )
        # Санити: инфляция в [0; 30%]
        for name, v in (("cons", self.cons), ("base", self.base), ("opt", self.opt)):
            if not (0 <= v <= 0.30):
                raise ValueError(f"Inflation {name}={v} out of [0; 0.30]")
        return self


class UsdRubRate(YearlyRate):
    @model_validator(mode="after")
    def check_order(self) -> "UsdRubRate":
        # cons (слабее рубль — выше) ≥ base ≥ opt
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(f"USD/RUB ordering violated year={self.year}")
        if not (50 <= self.opt <= 200 and 50 <= self.cons <= 200):
            raise ValueError(f"USD/RUB out of sane range year={self.year}")
        return self


class KeyRate(YearlyRate):
    @model_validator(mode="after")
    def check_order(self) -> "KeyRate":
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(f"Key rate ordering violated year={self.year}")
        for v in (self.cons, self.base, self.opt):
            if not (0 <= v <= 0.30):
                raise ValueError(f"Key rate {v} out of [0; 0.30]")
        return self


class TaxRate(StrictModel):
    rate: float = Field(..., ge=0.0, le=1.0)
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")


class VatRate(StrictModel):
    rate: float = Field(..., ge=0.0, le=1.0)
    cinema_exempt: bool
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")


class MacroFile(StrictModel):
    horizon: Horizon
    inflation_cpi: List[InflationRate]
    usd_rub: List[UsdRubRate]
    key_rate_cbr: List[KeyRate]
    profit_tax_rate: TaxRate
    vat_rate: VatRate
    meta: SourceRef

    @model_validator(mode="after")
    def check_three_years(self) -> "MacroFile":
        for name, lst in (
            ("inflation_cpi", self.inflation_cpi),
            ("usd_rub", self.usd_rub),
            ("key_rate_cbr", self.key_rate_cbr),
        ):
            years = {r.year for r in lst}
            if years != VALID_YEARS:
                raise ValueError(
                    f"{name}: years {years} != expected {VALID_YEARS}"
                )
        return self
