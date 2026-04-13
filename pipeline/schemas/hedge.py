"""
schemas/hedge.py — Pydantic контракт для inputs/hedge.yaml (v1.3.6 Ж4).

Описывает FX-хедж как долю покрытия экспозиции на уровне отдельных
статей (p_and_a, cogs, production_capex, infrastructure_capex, valuation)
плюс предопределённые сценарии no_hedge / conservative / aggressive.
"""
from __future__ import annotations

from typing import Dict, Optional

from pydantic import ConfigDict, Field

from .base import ConfidenceLevel, StrictModel


class HedgeCoefficient(StrictModel):
    """Доля покрытия FX-экспозиции хеджем для одной статьи.

    hedge_ratio ∈ [0.0; 1.0]:
      0.0 — нет хеджа (вся экспозиция открыта),
      1.0 — полный хедж (экспозиция нейтрализована).
    Применяется как мультипликатор к pass-through коэффициенту:
      effective_pt = pt × (1 - hedge_ratio).
    """
    hedge_ratio: float = Field(..., ge=0.0, le=1.0)
    rationale: str = Field(..., min_length=10)


class HedgeCoefficients(StrictModel):
    """Коэффициенты хеджирования по статьям (симметрично fx_pass_through)."""
    p_and_a: HedgeCoefficient
    cogs: HedgeCoefficient
    production_capex: HedgeCoefficient
    infrastructure_capex: HedgeCoefficient
    valuation: HedgeCoefficient


class HedgeScenarioRatios(StrictModel):
    """Ставки хеджа внутри предопределённого сценария."""
    p_and_a: float = Field(..., ge=0.0, le=1.0)
    cogs: float = Field(..., ge=0.0, le=1.0)
    production_capex: float = Field(..., ge=0.0, le=1.0)
    infrastructure_capex: float = Field(..., ge=0.0, le=1.0)
    valuation: float = Field(..., ge=0.0, le=1.0)


class HedgeScenario(StrictModel):
    description: str = Field(..., min_length=5)
    ratios: HedgeScenarioRatios


class HedgeScenarios(StrictModel):
    no_hedge: HedgeScenario
    conservative: HedgeScenario
    aggressive: HedgeScenario


class HedgeMeta(StrictModel):
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    source_title: Optional[str] = None
    confidence: Optional[ConfidenceLevel] = None
    last_updated: Optional[str] = None
    comment: Optional[str] = None


class HedgeFile(StrictModel):
    """Контракт для inputs/hedge.yaml."""
    coefficients: HedgeCoefficients
    hedge_scenarios: HedgeScenarios
    meta: HedgeMeta
