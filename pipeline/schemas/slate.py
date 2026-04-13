"""
schemas/slate.py — Портфель фильмов (slate) с валидацией квартала релиза,
бюджета, box office, доли холдинга и hit rate.
"""
from __future__ import annotations

from typing import List

from pydantic import Field, field_validator, model_validator

from .base import StrictModel, ScenarioValues, SourceRef


VALID_YEARS = {2026, 2027, 2028}
VALID_QUARTERS = {1, 2, 3, 4}


class FilmRevenueScenario(StrictModel):
    """Box office и hit rate в 3 сценариях."""
    cons: float = Field(..., ge=0)
    base: float = Field(..., ge=0)
    opt: float = Field(..., ge=0)

    @model_validator(mode="after")
    def check_order(self) -> "FilmRevenueScenario":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError(
                f"cons/base/opt ordering violated: {self.cons}/{self.base}/{self.opt}"
            )
        return self


class Film(StrictModel):
    id: str = Field(..., pattern=r"^film_\d{2}_\d{4}_q[1-4]$")
    title: str = Field(..., min_length=1, max_length=200)
    release_year: int
    release_quarter: int
    genre: str = Field(..., min_length=1)
    budget_mln_rub: float = Field(..., gt=0, le=2000)
    box_office_mln_rub: FilmRevenueScenario
    holding_share_pct: float = Field(..., gt=0, le=1)
    hit_rate: FilmRevenueScenario
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")

    @field_validator("release_year")
    @classmethod
    def year_in_range(cls, v: int) -> int:
        if v not in VALID_YEARS:
            raise ValueError(f"release_year={v} not in {VALID_YEARS}")
        return v

    @field_validator("release_quarter")
    @classmethod
    def q_in_range(cls, v: int) -> int:
        if v not in VALID_QUARTERS:
            raise ValueError(f"release_quarter={v} not in {VALID_QUARTERS}")
        return v

    @model_validator(mode="after")
    def check_id_matches(self) -> "Film":
        # id должен быть вида film_NN_YYYY_qK и совпадать с year/quarter
        parts = self.id.split("_")
        if int(parts[2]) != self.release_year:
            raise ValueError(f"film id year {parts[2]} != release_year {self.release_year}")
        if int(parts[3][1]) != self.release_quarter:
            raise ValueError(f"film id quarter {parts[3]} != release_quarter {self.release_quarter}")
        return self

    @model_validator(mode="after")
    def check_hit_rate_bounds(self) -> "Film":
        for name, v in (("cons", self.hit_rate.cons),
                        ("base", self.hit_rate.base),
                        ("opt", self.hit_rate.opt)):
            if not (0.0 <= v <= 1.0):
                raise ValueError(f"hit_rate.{name}={v} out of [0;1]")
        return self

    def expected_cinema_revenue_mln(self, scenario: str = "base") -> float:
        """Выручка холдинга от кинотеатрального проката в выбранном сценарии."""
        box = getattr(self.box_office_mln_rub, scenario)
        hit = getattr(self.hit_rate, scenario)
        return box * self.holding_share_pct * hit


class SlateFile(StrictModel):
    films: List[Film]
    meta: SourceRef

    @model_validator(mode="after")
    def check_12_films(self) -> "SlateFile":
        if len(self.films) != 12:
            raise ValueError(f"slate must contain exactly 12 films, got {len(self.films)}")
        return self

    @model_validator(mode="after")
    def check_4_per_year(self) -> "SlateFile":
        by_year: dict = {}
        for f in self.films:
            by_year.setdefault(f.release_year, []).append(f)
        for y in VALID_YEARS:
            if len(by_year.get(y, [])) != 4:
                raise ValueError(
                    f"slate must contain 4 films per year; year {y} has "
                    f"{len(by_year.get(y, []))}"
                )
        return self

    @model_validator(mode="after")
    def check_unique_ids(self) -> "SlateFile":
        ids = [f.id for f in self.films]
        if len(ids) != len(set(ids)):
            raise ValueError("slate contains duplicate film ids")
        return self

    def total_cinema_revenue(self, scenario: str = "base") -> float:
        return sum(f.expected_cinema_revenue_mln(scenario) for f in self.films)
