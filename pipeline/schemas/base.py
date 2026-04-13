"""
schemas/base.py — базовые типы для всех остальных схем.

Содержит:
- ConfidenceLevel — enum уровней уверенности
- SourceRef — ссылка на провенанс
- MoneyMln — сумма в млн руб. (≥0)
- Ratio — доля в [0, 1]
- ScenarioName — literal cons/base/opt
- ScenarioValues — тройка значений по сценариям с инвариантом cons ≤ base ≤ opt

Все значимые поля в inputs/*.yaml обязаны иметь source_id,
связанный с записью в inputs/sources.yaml.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


ConfidenceLevel = Literal["high", "medium", "low"]
ScenarioName = Literal["cons", "base", "opt"]


class StrictModel(BaseModel):
    """Базовый класс: строгая конфигурация, запрет лишних полей."""

    model_config = ConfigDict(
        extra="forbid",         # падаем на неизвестных полях
        validate_assignment=True,
        str_strip_whitespace=True,
        frozen=False,
    )


class SourceRef(BaseModel):
    """
    Ссылка на запись в inputs/sources.yaml.

    Расширяемая: YAML-файлы могут добавлять source_title / confidence /
    last_updated / comment / notes / и пр. без изменения схемы. Жёстко
    обязательное поле — только source_id.
    """

    model_config = ConfigDict(
        extra="allow",              # meta-блок открытый
        validate_assignment=True,
        str_strip_whitespace=True,
    )

    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    source_title: str | None = None
    confidence: ConfidenceLevel | None = None
    last_updated: str | None = None


class MoneyMln(StrictModel):
    """Сумма в млн руб. ≥ 0."""

    value: float = Field(..., ge=0.0)
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    confidence: ConfidenceLevel = "high"

    @field_validator("value")
    @classmethod
    def value_finite(cls, v: float) -> float:
        if v != v:  # NaN check
            raise ValueError("MoneyMln.value не может быть NaN")
        if v == float("inf") or v == float("-inf"):
            raise ValueError("MoneyMln.value должно быть конечным числом")
        return v


class Ratio(StrictModel):
    """Доля / процент в диапазоне [0, 1]."""

    value: float = Field(..., ge=0.0, le=1.0)
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    confidence: ConfidenceLevel = "high"


class ScenarioValues(StrictModel):
    """
    Тройка значений по сценариям (cons/base/opt).
    Инвариант: cons ≤ base ≤ opt.
    """

    cons: float
    base: float
    opt: float
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    confidence: ConfidenceLevel = "high"

    @model_validator(mode="after")
    def check_ordering(self) -> "ScenarioValues":
        if not (self.cons <= self.base <= self.opt):
            raise ValueError(
                f"ScenarioValues ordering violated: "
                f"cons={self.cons}, base={self.base}, opt={self.opt} "
                f"(требуется cons ≤ base ≤ opt)"
            )
        return self

    def get(self, scenario: ScenarioName) -> float:
        """Удобный доступ по имени сценария."""
        return getattr(self, scenario)
