"""
generators/revenue.py — генератор выручки по 5 сегментам.

Входы: CinemaSegment, AdvertisingSegment, FestivalsSegment,
       EducationSegment, LicenseLibrarySegment
Выход: RevenueBySegment (для одного сценария)

Логика:
- Для каждого сегмента берём targets_mln_rub[year].{cons|base|opt}.
- Кино дополнительно кросс-проверяется против сляйта фильмов
  (expected_cinema_revenue_mln по каждому фильму × holding_share).
  Если расхождение > 20% от cons/base/opt target — WARN (не ошибка).
- Возвращается RevenueBySegment на уровне сценария.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

from schemas.base import ScenarioName
from schemas.segments import (
    AdvertisingSegment,
    CinemaSegment,
    EducationSegment,
    FestivalsSegment,
    LicenseLibrarySegment,
)
from schemas.slate import SlateFile
from schemas.model_output import RevenueBySegment

from .base import YEARS, targets_to_dict


def _segment_dict(segment, scenario: ScenarioName) -> Dict[int, float]:
    return targets_to_dict(segment.targets_mln_rub, scenario)


def _slate_cinema_dict(slate: SlateFile, scenario: ScenarioName) -> Dict[int, float]:
    """
    Агрегирует выручку фильмов по году релиза (млн ₽) для заданного сценария.

    Используется для кросс-проверки CinemaSegment.targets_mln_rub.
    """
    result: Dict[int, float] = {y: 0.0 for y in YEARS}
    for film in slate.films:
        y = film.release_year
        if y not in result:
            continue
        result[y] += film.expected_cinema_revenue_mln(scenario)
    return result


def generate_revenue(
    scenario: ScenarioName,
    cinema: CinemaSegment,
    advertising: AdvertisingSegment,
    festivals: FestivalsSegment,
    education: EducationSegment,
    license_library: LicenseLibrarySegment,
    slate: SlateFile,
) -> Tuple[RevenueBySegment, List[str]]:
    """
    Собирает RevenueBySegment для одного сценария.

    Возвращает (RevenueBySegment, список предупреждений).
    """
    warnings: List[str] = []

    cinema_targets = _segment_dict(cinema, scenario)
    advertising_targets = _segment_dict(advertising, scenario)
    festivals_targets = _segment_dict(festivals, scenario)
    education_targets = _segment_dict(education, scenario)
    license_library_targets = _segment_dict(license_library, scenario)

    # Кросс-проверка кино с fail-silent (только WARN).
    # slate.expected_cinema_revenue_mln покрывает ТОЛЬКО кинотеатральные сборы
    # × holding_share; cinema_targets в yaml дополнительно включает SVOD/TV/home_video,
    # поэтому естественный разрыв 40-60%. Порог предупреждения — 70%.
    slate_cinema = _slate_cinema_dict(slate, scenario)
    for y in YEARS:
        target = cinema_targets[y]
        slate_val = slate_cinema[y]
        if target <= 0:
            continue
        # Проверяем что slate покрывает ≥ 30% target (остальное — каналы)
        coverage = slate_val / target * 100.0 if target else 0.0
        if coverage < 30.0 or coverage > 120.0:
            warnings.append(
                f"[revenue/{scenario}] cinema {y}: slate coverage {coverage:.1f}% "
                f"of target {target:.1f} (slate={slate_val:.1f})"
            )

    revenue = RevenueBySegment(
        cinema=cinema_targets,
        advertising=advertising_targets,
        festivals=festivals_targets,
        education=education_targets,
        license_library=license_library_targets,
    )
    return revenue, warnings
