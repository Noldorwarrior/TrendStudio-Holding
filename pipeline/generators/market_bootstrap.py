"""
generators/market_bootstrap.py — F1 Tier E: блочный bootstrap годовых
YoY-множителей российского проката (2019–2025) и их применение к
cinema.targets_mln_rub через market_beta.

Алгоритм:
  1. Загрузить annual_box_office.csv → список (year, total_bo).
  2. Построить YoY-множители yoy[i] = total_bo[i+1] / total_bo[i] (N-1 штук).
  3. Для каждой симуляции:
       a. Выбрать случайный блок длины block_size.
       b. Если block_size < horizon_years — дополнить независимым(и) YoY.
       c. Получить трассу из horizon_years YoY-множителей.
       d. Преобразовать в cinema-мультипликатор года t:
            scale_t = 1.0 + market_beta × (yoy_t − 1.0)
       e. Применить каскадно к cinema.targets_mln_rub: T_t ×= scale_t.
          (каждый год независимо — shock применяется к УРОВНЮ, не к дельте)
       f. Клонировать inputs, запустить run_all, собрать cumulative_ebitda.
  4. Отчёт: mean, std, percentiles (5/25/50/75/95), VaR95, breach_p.

Отличия от parametric MC:
  • Нет допущения о нормальности рыночных шоков.
  • Tail-aware: сохраняет исторические экстремумы (COVID −65%, post-COVID +112%).
  • Block_size=2 сохраняет autocorr пар (кризис → восстановление).

Ограничения v1.3.8:
  • Seed очень короткий (6 YoY точек) — допустимо 5 стартов для block=2.
  • Market_beta=0.4 экспертная оценка; требует калибровки по data холдинга.
  • Горизонт 3 года: при block_size=2 первые 2 года коррелированы блоком,
    третий год — независимый YoY.
"""
from __future__ import annotations

import csv
import math
import random
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import List, Tuple, Optional

from schemas.inputs import ValidatedInputs
from schemas.segments import YearRevenueTarget, CinemaSegment


# ----------------------------------------------------------------------
# Отчёт
# ----------------------------------------------------------------------


@dataclass
class MarketBootstrapReport:
    """v1.3.8: отчёт F1 блочного bootstrap рыночных YoY."""
    method: str = "market_yoy_block_bootstrap"
    n_simulations: int = 0
    block_size: int = 0
    horizon_years: int = 0
    n_historical_yoy: int = 0
    yoy_min: float = 0.0
    yoy_max: float = 0.0
    yoy_mean: float = 0.0
    market_beta: float = 0.0
    seed_source: str = ""
    base_ebitda: float = 0.0
    mean_ebitda: float = 0.0
    std_ebitda: float = 0.0
    p5_ebitda: float = 0.0
    p25_ebitda: float = 0.0
    p50_ebitda: float = 0.0
    p75_ebitda: float = 0.0
    p95_ebitda: float = 0.0
    var_95_mln_rub: float = 0.0
    breach_probability: float = 0.0   # доля симуляций < anchor_lower_bound
    severe_breach_probability: float = 0.0  # доля < severe_breach_threshold
    ebitda_samples: List[float] = field(default_factory=list)


# ----------------------------------------------------------------------
# Загрузка seed
# ----------------------------------------------------------------------


def _load_seed_yoy(
    csv_path: Path,
    exclude_years: Optional[List[int]] = None,
) -> List[Tuple[int, int, float]]:
    """Вернёт список (from_year, to_year, yoy_multiplier).

    exclude_years исключает сами годы (если from_year или to_year в списке —
    пара пропускается).
    """
    exclude = set(exclude_years or [])
    rows: List[Tuple[int, float]] = []
    with csv_path.open(encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            rows.append((int(r["year"]), float(r["total_bo_mln_rub"])))
    rows.sort(key=lambda x: x[0])

    yoy: List[Tuple[int, int, float]] = []
    for (y0, bo0), (y1, bo1) in zip(rows, rows[1:]):
        if bo0 <= 0:
            continue
        if y0 in exclude or y1 in exclude:
            continue
        yoy.append((y0, y1, bo1 / bo0))
    return yoy


# ----------------------------------------------------------------------
# Применение рыночного шока к cinema.targets_mln_rub
# ----------------------------------------------------------------------


def _apply_market_trajectory(
    cinema: CinemaSegment,
    scales_by_idx: List[float],
) -> CinemaSegment:
    """Применяет список мультипликаторов (длиной ≥ числу targets) к cinema.targets.

    targets[i] ×= scales_by_idx[i]. Сохраняет ordering cons≤base≤opt.
    """
    new_targets: List[YearRevenueTarget] = []
    for i, t in enumerate(cinema.targets_mln_rub):
        scale = scales_by_idx[i] if i < len(scales_by_idx) else 1.0
        scale = max(0.0, scale)
        new_cons = round(t.cons * scale, 4)
        new_base = round(t.base * scale, 4)
        new_opt = round(t.opt * scale, 4)
        if new_base < new_cons:
            new_base = new_cons
        if new_opt < new_base:
            new_opt = new_base
        new_targets.append(
            YearRevenueTarget(year=t.year, cons=new_cons, base=new_base, opt=new_opt)
        )
    return cinema.model_copy(update={"targets_mln_rub": new_targets})


# ----------------------------------------------------------------------
# Основной раннер
# ----------------------------------------------------------------------


def run_market_bootstrap(inputs: ValidatedInputs) -> MarketBootstrapReport:
    """F1: блочный bootstrap годовых YoY рынка проката → cumulative EBITDA."""
    from .core import run_all  # локальный импорт — избегаем цикла

    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    mb = mc.market_bootstrap
    if mb is None or not mb.enabled:
        raise ValueError("market_bootstrap disabled or missing in stress_matrix.yaml")

    pipeline_root = Path(__file__).resolve().parent.parent
    csv_path = pipeline_root / mb.seed_csv
    if not csv_path.exists():
        raise FileNotFoundError(f"market seed CSV not found: {csv_path}")

    yoy_triples = _load_seed_yoy(csv_path, exclude_years=mb.exclude_years)
    n_yoy = len(yoy_triples)
    if n_yoy < 1:
        raise ValueError(f"not enough YoY obs after excludes: {n_yoy}")
    if n_yoy < mb.block_size:
        raise ValueError(
            f"historical yoy series too short: {n_yoy} < block_size={mb.block_size}"
        )

    yoy_only = [t[2] for t in yoy_triples]
    yoy_min = min(yoy_only)
    yoy_max = max(yoy_only)
    yoy_mean = sum(yoy_only) / n_yoy

    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    rng = random.Random(mb.seed)
    horizon = mb.horizon_years
    block_size = mb.block_size
    beta = mb.market_beta
    ebitdas: List[float] = []

    max_start = n_yoy - block_size
    for _ in range(mb.n_simulations):
        # Трасса horizon лет
        traj: List[float] = []
        # Заполняем блоками
        while len(traj) < horizon:
            start = rng.randint(0, max_start)
            block = yoy_only[start:start + block_size]
            for v in block:
                if len(traj) >= horizon:
                    break
                traj.append(v)

        # scales_by_idx: scale_t = 1 + beta × (yoy_t − 1)
        scales = [1.0 + beta * (v - 1.0) for v in traj]
        scales = [max(0.0, s) for s in scales]

        new_cinema = _apply_market_trajectory(inputs.cinema, scales)
        mod = inputs.model_copy(update={"cinema": new_cinema})

        run = run_all(mod)
        eb = run.models["base"].cumulative_ebitda
        ebitdas.append(eb)

    sorted_eb = sorted(ebitdas)
    n = len(sorted_eb)
    mean = sum(sorted_eb) / n
    variance = sum((x - mean) ** 2 for x in sorted_eb) / n
    std = math.sqrt(variance)

    def _pct(p: float) -> float:
        idx = max(0, min(n - 1, int(round(p * (n - 1)))))
        return sorted_eb[idx]

    breach_lower = sm.breach_thresholds.anchor_lower_bound_mln_rub
    severe = sm.breach_thresholds.severe_breach_threshold_mln_rub
    n_breach = sum(1 for x in sorted_eb if x < breach_lower)
    n_severe = sum(1 for x in sorted_eb if x < severe)

    return MarketBootstrapReport(
        method="market_yoy_block_bootstrap",
        n_simulations=mb.n_simulations,
        block_size=block_size,
        horizon_years=horizon,
        n_historical_yoy=n_yoy,
        yoy_min=round(yoy_min, 4),
        yoy_max=round(yoy_max, 4),
        yoy_mean=round(yoy_mean, 4),
        market_beta=beta,
        seed_source=mb.seed_csv,
        base_ebitda=round(base_ebitda, 2),
        mean_ebitda=round(mean, 2),
        std_ebitda=round(std, 2),
        p5_ebitda=round(_pct(0.05), 2),
        p25_ebitda=round(_pct(0.25), 2),
        p50_ebitda=round(_pct(0.50), 2),
        p75_ebitda=round(_pct(0.75), 2),
        p95_ebitda=round(_pct(0.95), 2),
        var_95_mln_rub=round(base_ebitda - _pct(0.05), 2),
        breach_probability=round(n_breach / n, 4),
        severe_breach_probability=round(n_severe / n, 4),
        ebitda_samples=[round(x, 2) for x in ebitdas],
    )


def market_bootstrap_report_to_dict(report: MarketBootstrapReport) -> dict:
    d = asdict(report)
    d.pop("ebitda_samples", None)
    return d
