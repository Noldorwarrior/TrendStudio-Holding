"""
generators/base.py — общие утилиты для всех генераторов.

Никакого I/O. Только:
- константы (YEARS, SCENARIOS)
- хелперы выбора сценария из YearTargetMln
- генерация пустых словарей {2026: 0.0, 2027: 0.0, 2028: 0.0}
- проверка anchor (cumulative EBITDA Base 2026-2028)
"""
from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

from schemas.base import ScenarioName
from schemas.segments import YearTargetMln


YEARS: Tuple[int, int, int] = (2026, 2027, 2028)
SCENARIOS: Tuple[ScenarioName, ScenarioName, ScenarioName] = ("cons", "base", "opt")


def empty_year_dict(default: float = 0.0) -> Dict[int, float]:
    """Пустой словарь {2026: default, 2027: default, 2028: default}."""
    return {y: default for y in YEARS}


def targets_to_dict(
    targets: List[YearTargetMln],
    scenario: ScenarioName,
) -> Dict[int, float]:
    """
    Извлекает словарь {год: значение} из списка YearTargetMln по сценарию.

    Пример:
        targets = [YearRevenueTarget(year=2026, cons=100, base=120, opt=140), ...]
        targets_to_dict(targets, "base") → {2026: 120.0, 2027: ..., 2028: ...}
    """
    result = empty_year_dict()
    for t in targets:
        result[t.year] = float(getattr(t, scenario))
    missing = [y for y in YEARS if y not in {t.year for t in targets}]
    if missing:
        raise ValueError(f"targets_to_dict: missing years {missing}")
    return result


def sum_year_dicts(*dicts: Dict[int, float]) -> Dict[int, float]:
    """Поэлементное суммирование словарей {год: значение}."""
    result = empty_year_dict()
    for d in dicts:
        for y in YEARS:
            result[y] += float(d.get(y, 0.0))
    return result


def scale_year_dict(d: Dict[int, float], factor: float) -> Dict[int, float]:
    """Умножение всех значений словаря на скаляр."""
    return {y: float(d[y]) * factor for y in YEARS}


def sub_year_dicts(a: Dict[int, float], b: Dict[int, float]) -> Dict[int, float]:
    """Поэлементное вычитание a - b."""
    return {y: float(a[y]) - float(b[y]) for y in YEARS}


def cumulative(d: Dict[int, float]) -> float:
    """Сумма значений по всем годам."""
    return sum(float(d[y]) for y in YEARS)


def check_anchor(
    cumulative_ebitda: float,
    anchor_value: float,
    tolerance_pct: float,
) -> Tuple[bool, float]:
    """
    Проверка якорного инварианта.

    Возвращает (passed, deviation_pct).
    """
    if anchor_value <= 0:
        raise ValueError(f"anchor_value={anchor_value} must be > 0")
    deviation = (cumulative_ebitda - anchor_value) / anchor_value * 100.0
    passed = abs(deviation) <= tolerance_pct
    return passed, deviation
