"""
schemas/segments.py — 5 segment-схем (cinema, advertising, festivals, education, license_library).

Сделано в одном файле, потому что все 5 наследуют паттерн «segment_share_pct + targets_mln_rub».
Различия в подструктурах (distribution_params, revenue_streams, events, programs) — локальные.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, SourceRef


VALID_YEARS = {2026, 2027, 2028}


class YearTargetMln(StrictModel):
    """
    Целевое значение на год с cons/base/opt.

    Без встроенного ordering-check: логика «что больше — cons или opt»
    зависит от природы метрики (revenue → opt ≥ base ≥ cons;
    расходы → cons ≥ base ≥ opt; нейтрально → без проверки).

    Ordering накладывается специализированными подклассами или
    локальными валидаторами в моделях-контейнерах.
    """
    year: int
    cons: float = Field(..., ge=0)
    base: float = Field(..., ge=0)
    opt: float = Field(..., ge=0)

    @field_validator("year")
    @classmethod
    def check_year(cls, v: int) -> int:
        if v not in VALID_YEARS:
            raise ValueError(f"year={v} not in {VALID_YEARS}")
        return v

    def get(self, scenario: str) -> float:
        return getattr(self, scenario)


class YearRevenueTarget(YearTargetMln):
    """YearTargetMln для доходных метрик: cons ≤ base ≤ opt."""
    @model_validator(mode="after")
    def check_revenue_order(self) -> "YearRevenueTarget":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError(
                f"Revenue ordering violated year={self.year}: "
                f"cons={self.cons} base={self.base} opt={self.opt} "
                f"(для дохода требуется cons ≤ base ≤ opt)"
            )
        return self


class YearExpenseTarget(YearTargetMln):
    """YearTargetMln для расходных метрик: cons ≥ base ≥ opt."""
    @model_validator(mode="after")
    def check_expense_order(self) -> "YearExpenseTarget":
        if not (self.cons >= self.base >= self.opt):
            raise ValueError(
                f"Expense ordering violated year={self.year}: "
                f"cons={self.cons} base={self.base} opt={self.opt} "
                f"(для расхода требуется cons ≥ base ≥ opt)"
            )
        return self


class BaseSegment(StrictModel):
    """Общая часть сегментных файлов: доля + 3 целевых года + meta."""
    segment_share_pct: float = Field(..., gt=0, lt=1)
    targets_mln_rub: List[YearRevenueTarget]
    meta: SourceRef

    @model_validator(mode="after")
    def check_three_years(self) -> "BaseSegment":
        years = {t.year for t in self.targets_mln_rub}
        if years != VALID_YEARS:
            raise ValueError(f"targets years {years} != {VALID_YEARS}")
        return self


# ─────────────── CINEMA ───────────────

class DistributionParams(StrictModel):
    theatrical_window_days: int = Field(..., ge=30, le=180)
    vpf_per_copy_rub: float = Field(..., ge=0)
    avg_copies_per_release: int = Field(..., ge=1)
    p_and_a_budget_ratio: float = Field(..., ge=0, le=1)
    min_distribution_fee_pct: float = Field(..., ge=0, le=1)


class RevenueRecognition(StrictModel):
    method: str
    timing: str
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")


class CinemaSegment(BaseSegment):
    distribution_params: DistributionParams
    revenue_recognition: RevenueRecognition


# ─────────────── ADVERTISING ───────────────

class AdvStreamBase(StrictModel):
    stream_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    share_in_segment_pct: float = Field(..., ge=0, le=1)


class AdvStreamGeneric(AdvStreamBase):
    # open-schema для разнородных streams (pp / pre-roll / sponsored / library)
    model_config = {"extra": "allow"}


class GrowthDrivers(StrictModel):
    model_config = {"extra": "allow"}
    year_on_year_pct: dict
    rationale: str


class AdvertisingSegment(BaseSegment):
    revenue_streams: List[AdvStreamGeneric]
    growth_drivers: GrowthDrivers

    @model_validator(mode="after")
    def check_shares_sum_to_one(self) -> "AdvertisingSegment":
        s = sum(x.share_in_segment_pct for x in self.revenue_streams)
        if abs(s - 1.0) > 1e-3:
            raise ValueError(f"advertising revenue_streams shares sum={s} != 1.0")
        return self


# ─────────────── FESTIVALS ───────────────

class FestivalEvent(StrictModel):
    model_config = {"extra": "allow"}
    event_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    type: str


class FestivalsSegment(BaseSegment):
    events: List[FestivalEvent]

    @field_validator("events")
    @classmethod
    def at_least_one(cls, v):
        if not v:
            raise ValueError("festivals: events list empty")
        return v


# ─────────────── EDUCATION ───────────────

class EducationProgram(StrictModel):
    model_config = {"extra": "allow"}
    program_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    format: str


class EducationSegment(BaseSegment):
    programs: List[EducationProgram]

    @field_validator("programs")
    @classmethod
    def at_least_one(cls, v):
        if not v:
            raise ValueError("education: programs list empty")
        return v


# ─────────────── LICENSE LIBRARY ───────────────

class LicenseStream(StrictModel):
    model_config = {"extra": "allow"}
    stream_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    title: str
    share_in_segment_pct: float = Field(..., ge=0, le=1)


class LibraryDepth(StrictModel):
    titles_at_start_2026: int = Field(..., ge=0)
    new_titles_per_year: int = Field(..., ge=0)
    library_monetization_curve: dict


class LicenseLibrarySegment(BaseSegment):
    revenue_streams: List[LicenseStream]
    library_depth: LibraryDepth

    @model_validator(mode="after")
    def check_shares_sum_to_one(self) -> "LicenseLibrarySegment":
        s = sum(x.share_in_segment_pct for x in self.revenue_streams)
        if abs(s - 1.0) > 1e-3:
            raise ValueError(f"license_library streams shares sum={s} != 1.0")
        return self
