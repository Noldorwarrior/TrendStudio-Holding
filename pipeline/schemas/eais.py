"""
schemas/eais.py — Pydantic контракт для inputs/eais_sources.yaml (v1.3.7 D1).

Описывает реестр источников исторических данных российского кинопроката,
которые используются для калибровки F1 block bootstrap в Tier E.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import ConfigDict, Field

from .base import ConfidenceLevel, StrictModel


class EaisPrimarySource(StrictModel):
    """Автоматически загружаемый источник (есть fetcher + кэш)."""
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    title: str = Field(..., min_length=5)
    url: str = Field(..., pattern=r"^https?://")
    format: str = Field(..., min_length=3)
    version: Optional[str] = None
    last_updated: Optional[str] = None
    scope: str = Field(..., min_length=5)
    provides: List[str] = Field(..., min_length=1)
    not_provides: Optional[List[str]] = None
    license: str = Field(..., min_length=5)
    fetcher: str = Field(..., min_length=5)
    cache_path: Optional[str] = None
    status: str = Field(..., pattern=r"^(available|locked|deprecated|pending)$")


class EaisReferenceSource(StrictModel):
    """Reference-источник: вручную сведён в seed, не парсится."""
    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    title: str = Field(..., min_length=5)
    url: str = Field(..., pattern=r"^https?://")
    format: str = Field(..., min_length=3)
    scope: str = Field(..., min_length=5)
    citation_template: Optional[str] = None
    status: str = Field(..., min_length=3)


class EaisSources(StrictModel):
    primary: List[EaisPrimarySource] = Field(..., min_length=1)
    reference: List[EaisReferenceSource] = Field(..., min_length=1)


class EaisMeta(StrictModel):
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    source_id: str = Field(..., pattern=r"^[a-z0-9_]+$", min_length=3, max_length=80)
    version: str = Field(..., min_length=3)
    purpose: str = Field(..., min_length=20)
    confidence: ConfidenceLevel
    last_updated: str = Field(..., min_length=8)
    comment: Optional[str] = None


class EaisSourcesFile(StrictModel):
    """Контракт для inputs/eais_sources.yaml."""
    sources: EaisSources
    meta: EaisMeta
