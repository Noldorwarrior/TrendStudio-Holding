"""
schemas/inputs.py — Orchestrator: load_inputs() читает все 16 YAML-файлов,
валидирует их через Pydantic и возвращает единый ValidatedInputs.
"""
from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

import yaml
from pydantic import Field

from .base import StrictModel
from .scenarios import ScenariosFile
from .macro import MacroFile
from .slate import SlateFile
from .segments import (
    CinemaSegment,
    AdvertisingSegment,
    FestivalsSegment,
    EducationSegment,
    LicenseLibrarySegment,
)
from .costs import OpexFile, PaCostsFile, CapexFile, NwcFile
from .valuation import ValuationFile
from .investment import InvestmentFile
from .fx_pass_through import FxPassThroughFile
from .stress_matrix import StressMatrixFile
from .hedge import HedgeFile
from .eais import EaisSourcesFile


INPUT_FILES = {
    "scenarios": ScenariosFile,
    "macro": MacroFile,
    "slate": SlateFile,
    "cinema": CinemaSegment,
    "advertising": AdvertisingSegment,
    "festivals": FestivalsSegment,
    "education": EducationSegment,
    "license_library": LicenseLibrarySegment,
    "opex": OpexFile,
    "pa_costs": PaCostsFile,
    "capex": CapexFile,
    "nwc": NwcFile,
    "valuation": ValuationFile,
    "investment": InvestmentFile,
    "fx_pass_through": FxPassThroughFile,
    "stress_matrix": StressMatrixFile,
    "hedge": HedgeFile,
    "eais_sources": EaisSourcesFile,
}


class ValidatedInputs(StrictModel):
    """Единый контейнер всех 18 валидированных входов."""
    scenarios: ScenariosFile
    macro: MacroFile
    slate: SlateFile
    cinema: CinemaSegment
    advertising: AdvertisingSegment
    festivals: FestivalsSegment
    education: EducationSegment
    license_library: LicenseLibrarySegment
    opex: OpexFile
    pa_costs: PaCostsFile
    capex: CapexFile
    nwc: NwcFile
    valuation: ValuationFile
    investment: InvestmentFile
    fx_pass_through: FxPassThroughFile
    stress_matrix: StressMatrixFile
    hedge: HedgeFile
    eais_sources: EaisSourcesFile


def _load_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def load_inputs(inputs_dir: str | Path) -> ValidatedInputs:
    """
    Читает и валидирует все 14 YAML-файлов из inputs_dir.

    Raises:
        ValueError — если любой файл не прошёл Pydantic-валидацию.
        FileNotFoundError — если хотя бы один YAML отсутствует.
    """
    inputs_dir = Path(inputs_dir)
    if not inputs_dir.is_dir():
        raise FileNotFoundError(f"inputs_dir {inputs_dir} не существует")

    loaded: dict = {}
    errors: list[str] = []

    for key, schema_cls in INPUT_FILES.items():
        yaml_path = inputs_dir / f"{key}.yaml"
        if not yaml_path.exists():
            errors.append(f"missing: {yaml_path.name}")
            continue
        try:
            raw = _load_yaml(yaml_path)
            loaded[key] = schema_cls.model_validate(raw)
        except Exception as e:
            errors.append(f"{yaml_path.name}: {e}")

    if errors:
        raise ValueError(
            "Input validation failed:\n  - " + "\n  - ".join(errors)
        )

    return ValidatedInputs(**loaded)
