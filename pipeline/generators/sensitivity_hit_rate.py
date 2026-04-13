"""
generators/sensitivity_hit_rate.py — честная чувствительность cumulative EBITDA
к множителю hit_rate слейта, через полный пересчёт run_all.

ВАЖНО — структурная особенность модели:
В текущей реализации generate_revenue берёт кинотеатральную выручку из
cinema.targets_mln_rub (фиксированных yaml-таргетов), а slate.hit_rate
используется ТОЛЬКО для кросс-проверки покрытия. Поэтому прямая подмена
hit_rate в фильмах НЕ меняет EBITDA — это структурный инвариант модели.

Честная чувствительность «что если hit_rate всего слейта ±X%» требует
сдвига cinema.targets_mln_rub пропорционально доле slate в кинотеатральной
выручке. Только часть кинотеатральной выручки (~40% по yaml) зависит от
успеха фильмов слейта — остальные 60% это каналы (SVOD, TV, home video),
которые не зависят от box office.

Формула для года y:
    slate_weight_y    = slate_cinema_y / cinema_target_y   # доля зависимая от slate
    new_target_y      = cinema_target_y × (1 + slate_weight_y × (m − 1))
где m — множитель hit_rate.

При m=1.0 new_target_y = cinema_target_y (identity).
При m=1.10 и slate_weight=0.40 → прирост 4% к cinema_target, что равнозначно
            10% прироста только по slate-зависимой части.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from schemas.inputs import ValidatedInputs
from schemas.slate import Film, SlateFile, FilmRevenueScenario
from schemas.segments import CinemaSegment, YearRevenueTarget


YEARS: Tuple[int, ...] = (2026, 2027, 2028)


@dataclass
class HitRatePoint:
    multiplier: float                    # m hit_rate
    slate_weight_mean: float             # средняя доля slate в cinema_target по 3 годам
    effective_cinema_delta_pct: float    # средний прирост cinema_target (%)
    cumulative_ebitda: float             # Σ EBITDA 2026-2028, млн ₽
    delta_ebitda_vs_base: float          # ΔEBITDA относительно m=1.0
    delta_pct: float                     # Δ в %


@dataclass
class HitRateSensitivity:
    points: List[HitRatePoint] = field(default_factory=list)
    base_ebitda: float = 0.0
    slate_weight_by_year: Dict[int, float] = field(default_factory=dict)
    elasticity_average: float = 0.0      # Δ%EBITDA / Δ%hit_rate


def _compute_slate_cinema_by_year(slate: SlateFile, scenario: str = "base") -> Dict[int, float]:
    """Σ expected_cinema_revenue_mln по фильмам, сгруппированным по году релиза."""
    result: Dict[int, float] = {y: 0.0 for y in YEARS}
    for film in slate.films:
        if film.release_year in result:
            result[film.release_year] += film.expected_cinema_revenue_mln(scenario)
    return result


def _clone_cinema_with_hit_multiplier(
    cinema: CinemaSegment,
    slate: SlateFile,
    multiplier: float,
) -> Tuple[CinemaSegment, Dict[int, float], float]:
    """
    Масштабирует cinema.targets_mln_rub пропорционально доле slate.

    Возвращает:
      - новый CinemaSegment,
      - slate_weight по годам (для отчётности),
      - средний прирост cinema_target base в процентах.
    """
    slate_cinema = _compute_slate_cinema_by_year(slate, scenario="base")
    weights: Dict[int, float] = {}
    delta_pcts: List[float] = []

    orig_targets: List[YearRevenueTarget] = list(cinema.targets_mln_rub)
    new_targets: List[YearRevenueTarget] = []

    for t in orig_targets:
        y = t.year
        weight = (slate_cinema.get(y, 0.0) / t.base) if t.base > 0 else 0.0
        weights[y] = round(weight, 4)

        scale = 1.0 + weight * (multiplier - 1.0)
        scale = max(0.0, scale)

        new_cons = round(t.cons * scale, 4)
        new_base = round(t.base * scale, 4)
        new_opt  = round(t.opt  * scale, 4)

        # Страховка: после округления ordering может слегка нарушиться — поджимаем
        if new_base < new_cons:
            new_base = new_cons
        if new_opt < new_base:
            new_opt = new_base

        new_targets.append(
            YearRevenueTarget(year=y, cons=new_cons, base=new_base, opt=new_opt)
        )
        delta_pcts.append((scale - 1.0) * 100.0)

    new_cinema = cinema.model_copy(update={"targets_mln_rub": new_targets})
    avg_delta_pct = sum(delta_pcts) / len(delta_pcts)
    return new_cinema, weights, avg_delta_pct


def _clone_inputs_with_cinema(
    inputs: ValidatedInputs,
    new_cinema: CinemaSegment,
) -> ValidatedInputs:
    """Клонирует inputs с подменённым cinema-сегментом (inputs.cinema — плоское поле)."""
    return inputs.model_copy(update={"cinema": new_cinema})


def run_hit_rate_sensitivity(
    inputs: ValidatedInputs,
    multipliers: Tuple[float, ...] = (0.75, 0.85, 1.00, 1.10, 1.15),
) -> HitRateSensitivity:
    """
    Для каждого множителя m из multipliers клонирует inputs, масштабирует
    cinema.targets_mln_rub пропорционально slate_weight × (m−1) и вызывает
    run_all. Возвращает HitRateSensitivity с точками и средней эластичностью.

    Базовый прогон (m=1.0) — reference. Если в multipliers нет 1.0, добавляется.
    """
    from .core import run_all  # локальный импорт — избежать цикла

    mults = tuple(sorted(set(multipliers) | {1.0}))
    points: List[HitRatePoint] = []
    base_ebitda = 0.0
    slate_weights: Dict[int, float] = {}

    for m in mults:
        new_cinema, weights, avg_cin_delta = _clone_cinema_with_hit_multiplier(
            inputs.cinema, inputs.slate, multiplier=m
        )
        if abs(m - 1.0) < 1e-9:
            slate_weights = weights

        mod_inputs = _clone_inputs_with_cinema(inputs, new_cinema)
        run = run_all(mod_inputs)
        ebitda = run.models["base"].cumulative_ebitda

        if abs(m - 1.0) < 1e-9:
            base_ebitda = ebitda

        weight_mean = sum(weights.values()) / len(weights)
        points.append(
            HitRatePoint(
                multiplier=round(m, 4),
                slate_weight_mean=round(weight_mean, 4),
                effective_cinema_delta_pct=round(avg_cin_delta, 2),
                cumulative_ebitda=round(ebitda, 2),
                delta_ebitda_vs_base=0.0,
                delta_pct=0.0,
            )
        )

    # Второй проход — вычислить Δ относительно base_ebitda и эластичность
    elasticities: List[float] = []
    for p in points:
        p.delta_ebitda_vs_base = round(p.cumulative_ebitda - base_ebitda, 2)
        p.delta_pct = round(
            (p.cumulative_ebitda - base_ebitda) / base_ebitda * 100.0
            if base_ebitda else 0.0,
            2,
        )
        if abs(p.multiplier - 1.0) > 1e-6:
            dx_pct = (p.multiplier - 1.0) * 100.0
            elasticities.append(p.delta_pct / dx_pct if dx_pct else 0.0)

    elasticity_avg = sum(elasticities) / len(elasticities) if elasticities else 0.0

    return HitRateSensitivity(
        points=points,
        base_ebitda=round(base_ebitda, 2),
        slate_weight_by_year=slate_weights,
        elasticity_average=round(elasticity_avg, 4),
    )
