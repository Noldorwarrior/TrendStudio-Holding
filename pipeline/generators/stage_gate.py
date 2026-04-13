"""
generators/stage_gate.py — F2 Tier E: дерево решений stage-gate для 12 фильмов
слейта (v1.3.9).

Алгоритм на одну симуляцию:
  1. Для каждого из 12 фильмов биномиально проходим 4 этапа:
     development → greenlight → production → post → release
  2. Если фильм прервали на этапе s: sunk_cost += budget × sunk_cost_pct[s]
     expected_cinema_revenue(film) = 0
  3. slate_cinema_year = Σ revenue только у «дошедших» фильмов
  4. Новый slate_weight_year = slate_cinema_year_new / cinema_target_year_base
  5. cinema.targets_year ×= (1 − old_weight + new_weight)
     (эквивалентно: вычитание revenue срезанных фильмов из cinema.target)
  6. run_all → cumulative_ebitda
  7. Если apply_sunk_to_capex=True: cumulative_ebitda −= sunk_cost_total

Отчёт собирает статистики по 2000 симуляциям:
  • released_count (в среднем ≈ 12 × 0.7206 ≈ 8.65)
  • mean/std/percentiles cumulative_ebitda
  • expected_sunk_cost_total_mln_rub
  • breach_probability < anchor_lower_bound
"""
from __future__ import annotations

import random
import math
from dataclasses import dataclass, asdict, field
from typing import List, Dict

from schemas.inputs import ValidatedInputs
from schemas.segments import CinemaSegment, YearRevenueTarget


# ----------------------------------------------------------------------
# Dataclass отчёта
# ----------------------------------------------------------------------


@dataclass
class StageGateReport:
    """v1.3.9 F2: результат stage-gate симуляций."""
    method: str = "stage_gate_binomial_tree"
    n_simulations: int = 0
    n_films: int = 0
    p_dev_to_green: float = 0.0
    p_green_to_prod: float = 0.0
    p_prod_to_post: float = 0.0
    p_post_to_release: float = 0.0
    p_reach_release: float = 0.0           # произведение вероятностей
    mean_released_count: float = 0.0
    std_released_count: float = 0.0
    min_released_count: int = 0
    max_released_count: int = 0
    mean_sunk_cost_mln_rub: float = 0.0
    std_sunk_cost_mln_rub: float = 0.0
    p95_sunk_cost_mln_rub: float = 0.0
    base_ebitda: float = 0.0
    mean_ebitda: float = 0.0
    std_ebitda: float = 0.0
    p5_ebitda: float = 0.0
    p25_ebitda: float = 0.0
    p50_ebitda: float = 0.0
    p75_ebitda: float = 0.0
    p95_ebitda: float = 0.0
    var_95_mln_rub: float = 0.0
    breach_probability: float = 0.0
    severe_breach_probability: float = 0.0
    apply_sunk_to_capex: bool = True
    ebitda_samples: List[float] = field(default_factory=list)


# ----------------------------------------------------------------------
# Симуляция одного фильма
# ----------------------------------------------------------------------


def _simulate_one_film(
    rng: random.Random,
    budget: float,
    probs: Dict[str, float],
    sunk_pct: Dict[str, float],
) -> tuple[bool, float]:
    """Одна симуляция прохождения фильма через 4 этапа.

    Возвращает (released, sunk_cost).
    """
    # development → greenlight
    if rng.random() >= probs["dev"]:
        return False, budget * sunk_pct["dev"]
    # greenlight → production
    if rng.random() >= probs["green"]:
        return False, budget * sunk_pct["green"]
    # production → post
    if rng.random() >= probs["prod"]:
        return False, budget * sunk_pct["prod"]
    # post → release
    if rng.random() >= probs["post"]:
        return False, budget * sunk_pct["post"]
    # успешно дошёл
    return True, 0.0


# ----------------------------------------------------------------------
# Масштабирование cinema.targets пропорционально «уцелевшим» фильмам
# ----------------------------------------------------------------------


def _rescale_cinema_by_released(
    cinema: CinemaSegment,
    slate_cinema_by_year_full: Dict[int, float],   # базовая slate-выручка
    slate_cinema_by_year_released: Dict[int, float],
) -> CinemaSegment:
    """Вычитает из cinema.targets выручку cancelled фильмов.

    Для каждого года: delta = slate_full − slate_released (млн ₽)
    new_target = old_target − delta
    """
    new_targets: List[YearRevenueTarget] = []
    for t in cinema.targets_mln_rub:
        y = t.year
        full = slate_cinema_by_year_full.get(y, 0.0)
        released = slate_cinema_by_year_released.get(y, 0.0)
        delta = full - released
        # Вычитаем delta из всех трёх сценариев пропорционально (используем base как ориентир)
        if t.base > 0:
            scale = max(0.0, 1.0 - delta / t.base)
        else:
            scale = 1.0
        new_cons = round(t.cons * scale, 4)
        new_base = round(t.base * scale, 4)
        new_opt = round(t.opt * scale, 4)
        if new_base < new_cons:
            new_base = new_cons
        if new_opt < new_base:
            new_opt = new_base
        new_targets.append(
            YearRevenueTarget(year=y, cons=new_cons, base=new_base, opt=new_opt)
        )
    return cinema.model_copy(update={"targets_mln_rub": new_targets})


# ----------------------------------------------------------------------
# Главный раннер
# ----------------------------------------------------------------------


def run_stage_gate(inputs: ValidatedInputs) -> StageGateReport:
    """F2: 2000 симуляций биномиального дерева прохождения 12 фильмов."""
    from .core import run_all

    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    sg = mc.stage_gate
    if sg is None or not sg.enabled:
        raise ValueError("stage_gate disabled or missing in stress_matrix.yaml")

    probs = {
        "dev": sg.probabilities.p_development_to_greenlight,
        "green": sg.probabilities.p_greenlight_to_production,
        "prod": sg.probabilities.p_production_to_post,
        "post": sg.probabilities.p_post_to_release,
    }
    sunk = {
        "dev": sg.sunk_cost_pct.development,
        "green": sg.sunk_cost_pct.greenlight,
        "prod": sg.sunk_cost_pct.production,
        "post": sg.sunk_cost_pct.post,
    }
    p_reach = probs["dev"] * probs["green"] * probs["prod"] * probs["post"]

    films = inputs.slate.films
    n_films = len(films)

    # Базовая slate-выручка по годам (full slate)
    slate_full: Dict[int, float] = {}
    for f in films:
        y = f.release_year
        slate_full[y] = slate_full.get(y, 0.0) + f.expected_cinema_revenue_mln("base")

    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    rng = random.Random(sg.seed)
    ebitdas: List[float] = []
    released_counts: List[int] = []
    sunk_costs: List[float] = []

    for _ in range(sg.n_simulations):
        released_by_year: Dict[int, float] = {y: 0.0 for y in slate_full}
        sunk_total = 0.0
        released_n = 0

        for film in films:
            rel, sunk_cost = _simulate_one_film(
                rng, film.budget_mln_rub, probs, sunk
            )
            if rel:
                released_n += 1
                released_by_year[film.release_year] += film.expected_cinema_revenue_mln("base")
            else:
                sunk_total += sunk_cost

        new_cinema = _rescale_cinema_by_released(
            inputs.cinema, slate_full, released_by_year
        )
        mod = inputs.model_copy(update={"cinema": new_cinema})
        run = run_all(mod)
        eb = run.models["base"].cumulative_ebitda

        # Дополнительно вычесть sunk_cost из cumulative EBITDA (если включено)
        if sg.apply_sunk_to_capex:
            eb = eb - sunk_total

        ebitdas.append(eb)
        released_counts.append(released_n)
        sunk_costs.append(sunk_total)

    sorted_eb = sorted(ebitdas)
    n = len(sorted_eb)
    mean_eb = sum(sorted_eb) / n
    var_eb = sum((x - mean_eb) ** 2 for x in sorted_eb) / n
    std_eb = math.sqrt(var_eb)

    def _pct(p: float) -> float:
        idx = max(0, min(n - 1, int(round(p * (n - 1)))))
        return sorted_eb[idx]

    breach_lower = sm.breach_thresholds.anchor_lower_bound_mln_rub
    severe = sm.breach_thresholds.severe_breach_threshold_mln_rub
    n_breach = sum(1 for x in sorted_eb if x < breach_lower)
    n_severe = sum(1 for x in sorted_eb if x < severe)

    mean_rel = sum(released_counts) / n
    var_rel = sum((x - mean_rel) ** 2 for x in released_counts) / n
    std_rel = math.sqrt(var_rel)

    mean_sunk = sum(sunk_costs) / n
    var_sunk = sum((x - mean_sunk) ** 2 for x in sunk_costs) / n
    std_sunk = math.sqrt(var_sunk)
    sorted_sunk = sorted(sunk_costs)
    p95_sunk = sorted_sunk[int(round(0.95 * (n - 1)))]

    return StageGateReport(
        method="stage_gate_binomial_tree",
        n_simulations=sg.n_simulations,
        n_films=n_films,
        p_dev_to_green=probs["dev"],
        p_green_to_prod=probs["green"],
        p_prod_to_post=probs["prod"],
        p_post_to_release=probs["post"],
        p_reach_release=round(p_reach, 6),
        mean_released_count=round(mean_rel, 3),
        std_released_count=round(std_rel, 3),
        min_released_count=min(released_counts),
        max_released_count=max(released_counts),
        mean_sunk_cost_mln_rub=round(mean_sunk, 2),
        std_sunk_cost_mln_rub=round(std_sunk, 2),
        p95_sunk_cost_mln_rub=round(p95_sunk, 2),
        base_ebitda=round(base_ebitda, 2),
        mean_ebitda=round(mean_eb, 2),
        std_ebitda=round(std_eb, 2),
        p5_ebitda=round(_pct(0.05), 2),
        p25_ebitda=round(_pct(0.25), 2),
        p50_ebitda=round(_pct(0.50), 2),
        p75_ebitda=round(_pct(0.75), 2),
        p95_ebitda=round(_pct(0.95), 2),
        var_95_mln_rub=round(base_ebitda - _pct(0.05), 2),
        breach_probability=round(n_breach / n, 4),
        severe_breach_probability=round(n_severe / n, 4),
        apply_sunk_to_capex=sg.apply_sunk_to_capex,
        ebitda_samples=[round(x, 2) for x in ebitdas],
    )


def stage_gate_report_to_dict(report: StageGateReport) -> dict:
    d = asdict(report)
    d.pop("ebitda_samples", None)
    return d
