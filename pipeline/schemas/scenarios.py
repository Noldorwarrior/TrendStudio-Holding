"""
schemas/scenarios.py — якорь и сценарии.

Главный инвариант системы:
    cumulative_ebitda_2026_2028 Base ∈ [2 970; 3 030] млн ₽

Нарушение этого инварианта падает в anchor_check(), который
вызывается из generators/core.py после построения базового сценария.

Веса сценариев: 25 / 50 / 25 (cons / base / opt).
"""

from typing import List, Literal

from pydantic import Field, field_validator, model_validator

from schemas.base import StrictModel, SourceRef


class Anchor(StrictModel):
    """
    Незыблемый якорь модели.

    Любое изменение входов, которое выводит cumulative EBITDA Base
    за пределы [value * (1 - tol); value * (1 + tol)], падает на
    make validate через вызов anchor_check().
    """

    metric: Literal["cumulative_ebitda_2026_2028"]
    scenario: Literal["base"] = "base"
    value_mln_rub: float = Field(..., gt=0, description="Целевое значение, млн ₽")
    tolerance_pct: float = Field(..., ge=0.0, le=10.0, description="± X% допуска")
    unit: str = "млн ₽"
    rationale: str = ""

    @property
    def lower_bound(self) -> float:
        """Нижняя граница якоря (2 970 при value=3000, tol=1)."""
        return self.value_mln_rub * (1.0 - self.tolerance_pct / 100.0)

    @property
    def upper_bound(self) -> float:
        """Верхняя граница якоря (3 030 при value=3000, tol=1)."""
        return self.value_mln_rub * (1.0 + self.tolerance_pct / 100.0)


class Scenario(StrictModel):
    """Один сценарий с весом и мультипликаторами."""

    name: Literal["conservative", "base", "optimistic"]
    short: Literal["cons", "base", "opt"]
    weight: float = Field(..., ge=0.0, le=1.0)
    ebitda_multiplier: float = Field(..., gt=0.0, lt=3.0)
    hit_rate_multiplier: float = Field(..., gt=0.0, lt=3.0)
    description: str = ""


class ScenariosFile(StrictModel):
    """
    Содержимое inputs/scenarios.yaml.

    Инварианты:
    - Ровно 3 сценария: conservative, base, optimistic.
    - Сумма весов = 1.0 (с точностью 1e-6).
    - ebitda_multiplier: cons < base < opt.
    """

    anchor: Anchor
    scenarios: List[Scenario]
    meta: SourceRef

    @field_validator("scenarios")
    @classmethod
    def three_scenarios_required(cls, v: List[Scenario]) -> List[Scenario]:
        shorts = {s.short for s in v}
        expected = {"cons", "base", "opt"}
        if shorts != expected:
            raise ValueError(
                f"scenarios must have exactly 3 items with shorts {expected}, "
                f"got {shorts}"
            )
        return v

    @model_validator(mode="after")
    def weights_sum_to_one(self) -> "ScenariosFile":
        total = sum(s.weight for s in self.scenarios)
        if abs(total - 1.0) > 1e-6:
            raise ValueError(
                f"Сумма весов сценариев = {total:.6f}, должна быть 1.0"
            )
        return self

    @model_validator(mode="after")
    def multipliers_ordered(self) -> "ScenariosFile":
        by_short = {s.short: s for s in self.scenarios}
        cons = by_short["cons"].ebitda_multiplier
        base = by_short["base"].ebitda_multiplier
        opt = by_short["opt"].ebitda_multiplier
        if not (cons < base < opt):
            raise ValueError(
                f"ebitda_multiplier должен расти: cons={cons}, base={base}, opt={opt}"
            )
        return self

    def get_by_short(self, short: str) -> Scenario:
        for s in self.scenarios:
            if s.short == short:
                return s
        raise KeyError(f"scenario short={short} not found")


def anchor_check(cumulative_ebitda_base: float, anchor: Anchor) -> None:
    """
    Главная проверка якоря. Падает с ValueError при нарушении.

    Parameters
    ----------
    cumulative_ebitda_base : float
        Сумма EBITDA за 2026, 2027, 2028 годы в Base сценарии (млн ₽).
    anchor : Anchor
        Объект якоря, загруженный из inputs/scenarios.yaml.

    Raises
    ------
    ValueError
        Если cumulative_ebitda_base вне [anchor.lower_bound; anchor.upper_bound].
    """
    lo = anchor.lower_bound
    hi = anchor.upper_bound
    if not (lo <= cumulative_ebitda_base <= hi):
        raise ValueError(
            f"ANCHOR VIOLATED: cumulative EBITDA Base 2026-2028 = "
            f"{cumulative_ebitda_base:.2f} млн ₽ вне диапазона "
            f"[{lo:.2f}; {hi:.2f}] (target = {anchor.value_mln_rub}, "
            f"tolerance = ±{anchor.tolerance_pct}%). "
            f"Это критический инвариант системы. Либо откатите "
            f"изменения входов, либо пересогласуйте якорь с CFO "
            f"(и обновите changelog.md)."
        )
