"""
schemas/fx_pass_through.py — Pydantic контракт для fx_pass_through.yaml.

Содержит 5 коэффициентов pass-through (p_and_a, cogs, production_capex,
infrastructure_capex, valuation), используемых в perturbation_analysis.py
для оценки чувствительности EBITDA/FCF к курсу USD/RUB.

Все коэффициенты — ратио в диапазоне [0, 1]; при расчётах применяются как
множитель: new_value = old_value × (1 + coefficient × ΔFX_share).

Введено в v1.3 для устранения магических чисел и обеспечения прозрачности
допущений FX-риска. См. inputs/fx_pass_through.yaml для обоснований.
"""
from __future__ import annotations

from typing import Optional

from pydantic import ConfigDict, Field

from .base import ConfidenceLevel, StrictModel


class FxPassThroughCoefficient(StrictModel):
    """Один pass-through коэффициент со своим rationale."""

    value: float = Field(..., ge=0.0, le=1.0)
    rationale: str = Field(..., min_length=10)


class FxPassThroughCoefficients(StrictModel):
    """Блок всех 5 коэффициентов."""

    p_and_a: FxPassThroughCoefficient
    cogs: FxPassThroughCoefficient
    production_capex: FxPassThroughCoefficient
    infrastructure_capex: FxPassThroughCoefficient
    valuation: FxPassThroughCoefficient


class FxPassThroughMeta(StrictModel):
    """Метаданные блока."""

    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    source_title: Optional[str] = None
    confidence: Optional[ConfidenceLevel] = None
    last_updated: Optional[str] = None
    comment: Optional[str] = None


class FxPassThroughFile(StrictModel):
    """Контракт для inputs/fx_pass_through.yaml."""

    coefficients: FxPassThroughCoefficients
    meta: FxPassThroughMeta
