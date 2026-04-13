"""
schemas/model_output.py — контракты для результата построения модели.

Все generators/*.py возвращают объекты этих типов.
xlsx_builder.py и docx_builder.py принимают ModelResult на вход.

Годы жёстко зафиксированы: 2026, 2027, 2028 (горизонт модели
из раздела 4 промта).
"""

from typing import Dict, List, Literal, Optional

from pydantic import Field, model_validator

from schemas.base import ScenarioName, StrictModel


# ============================================================
# ВЫРУЧКА
# ============================================================


class FilmRevenue(StrictModel):
    """Выручка одного фильма в разрезе каналов (млн ₽, одна строка = один год)."""

    film_id: str
    year: int = Field(..., ge=2026, le=2035)
    theatrical: float = Field(default=0.0, ge=0.0)
    svod: float = Field(default=0.0, ge=0.0)
    tv: float = Field(default=0.0, ge=0.0)
    home_video: float = Field(default=0.0, ge=0.0)

    @property
    def total(self) -> float:
        return self.theatrical + self.svod + self.tv + self.home_video


class RevenueBySegment(StrictModel):
    """
    Выручка холдинга в разрезе 5 сегментов × 3 года (млн ₽).

    Сегменты:
    - cinema (40% ориентир) — фильмы + сериалы
    - advertising (30% ориентир) — Full Cycle Agency
    - festivals (18% ориентир) — МФСК + Street Cinema
    - education (12% ориентир) — Mobile University
    - license_library — библиотека прав как отдельный бизнес-юнит
    """

    cinema: Dict[int, float]           # {2026: ..., 2027: ..., 2028: ...}
    advertising: Dict[int, float]
    festivals: Dict[int, float]
    education: Dict[int, float]
    license_library: Dict[int, float]

    @model_validator(mode="after")
    def years_consistent(self) -> "RevenueBySegment":
        required_years = {2026, 2027, 2028}
        for seg_name in ["cinema", "advertising", "festivals", "education", "license_library"]:
            seg = getattr(self, seg_name)
            if set(seg.keys()) != required_years:
                raise ValueError(
                    f"RevenueBySegment.{seg_name}: требуются годы {required_years}, "
                    f"получены {set(seg.keys())}"
                )
            for year, val in seg.items():
                if val < 0:
                    raise ValueError(
                        f"RevenueBySegment.{seg_name}[{year}] = {val} < 0"
                    )
        return self

    def total_by_year(self, year: int) -> float:
        return (
            self.cinema[year]
            + self.advertising[year]
            + self.festivals[year]
            + self.education[year]
            + self.license_library[year]
        )

    def total_3y(self) -> float:
        return sum(self.total_by_year(y) for y in [2026, 2027, 2028])


# ============================================================
# РАСХОДЫ
# ============================================================


class CostsByCategory(StrictModel):
    """Расходы холдинга в разрезе 7 категорий × 3 года (млн ₽)."""

    cogs: Dict[int, float]              # прямые
    pa: Dict[int, float]                # Print & Advertising (критическое закрытие аудит-разрыва #1)
    opex: Dict[int, float]              # SG&A
    taxes: Dict[int, float]             # закрытие аудит-разрыва #2
    contingency: Dict[int, float]       # закрытие #3
    depreciation: Dict[int, float]      # D&A, закрытие #4
    nwc_change: Dict[int, float]        # изменение NWC, закрытие #5

    def total_operating_by_year(self, year: int) -> float:
        """COGS + P&A + OPEX + Contingency (без D&A, без налогов)."""
        return (
            self.cogs[year]
            + self.pa[year]
            + self.opex[year]
            + self.contingency[year]
        )


# ============================================================
# P&L
# ============================================================


class PnLRow(StrictModel):
    """Одна строка P&L для одного сценария."""

    label: str
    year_2026: float
    year_2027: float
    year_2028: float

    def total_3y(self) -> float:
        return self.year_2026 + self.year_2027 + self.year_2028


class PnL(StrictModel):
    """
    Полный P&L для одного сценария (3 года).
    Структура соответствует разделу 7 промта (PnL_v2 template).
    """

    scenario: ScenarioName
    revenue_total: Dict[int, float]
    cogs: Dict[int, float]
    gross_profit: Dict[int, float]
    pa: Dict[int, float]
    opex: Dict[int, float]
    contingency: Dict[int, float]
    ebitda: Dict[int, float]
    depreciation: Dict[int, float]
    ebit: Dict[int, float]
    taxes: Dict[int, float]
    net_income: Dict[int, float]

    @model_validator(mode="after")
    def years_present(self) -> "PnL":
        required = {2026, 2027, 2028}
        fields = [
            "revenue_total", "cogs", "gross_profit", "pa", "opex",
            "contingency", "ebitda", "depreciation", "ebit", "taxes", "net_income"
        ]
        for f in fields:
            if set(getattr(self, f).keys()) != required:
                raise ValueError(f"PnL.{f} должен содержать годы {required}")
        return self

    def cumulative_ebitda_3y(self) -> float:
        """Сумма EBITDA за 2026+2027+2028 (ключевая метрика для anchor_check)."""
        return sum(self.ebitda[y] for y in [2026, 2027, 2028])


# ============================================================
# CASH FLOW
# ============================================================


class CashFlow(StrictModel):
    """Cash Flow Statement (косвенный метод) для одного сценария."""

    scenario: ScenarioName
    net_income: Dict[int, float]
    depreciation_add: Dict[int, float]
    nwc_change: Dict[int, float]
    capex: Dict[int, float]
    operating_cf: Dict[int, float]
    investing_cf: Dict[int, float]
    financing_cf: Dict[int, float]
    free_cash_flow: Dict[int, float]


# ============================================================
# ВАЛЮАЦИЯ
# ============================================================


class ValuationMetrics(StrictModel):
    """Метрики валюации — все 3 подхода WACC + 2 методологии Exit."""

    scenario: ScenarioName

    # Три WACC (9.1 промта)
    wacc_capm: float
    wacc_switcher: float
    wacc_buildup: float

    # DCF + NPV + IRR (по каждому WACC)
    npv_capm: float
    npv_switcher: float
    npv_buildup: float
    irr: float
    moic: float
    payback_years: float

    # Exit через Multiple Matrix + Gordon Growth (9.2 промта)
    terminal_value_multiple: float
    terminal_value_gordon: float


# ============================================================
# ИТОГОВЫЙ РЕЗУЛЬТАТ
# ============================================================


class ModelResult(StrictModel):
    """
    Итоговый результат построения модели для одного сценария.
    Все generators возвращают этот объект, xlsx_builder его потребляет.
    """

    scenario: ScenarioName
    revenue: RevenueBySegment
    costs: CostsByCategory
    pnl: PnL
    cashflow: CashFlow
    valuation: Optional[ValuationMetrics] = None

    @property
    def cumulative_ebitda(self) -> float:
        """Главная метрика — cumulative EBITDA 2026-2028."""
        return self.pnl.cumulative_ebitda_3y()
