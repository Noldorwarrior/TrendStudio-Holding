"""
generators/quarterly_cashflow.py — поквартальный Cash Flow Q1'26 – Q4'28.

Выход: dict {"Q1_2026": {income: ..., outcome: ..., net: ..., cumulative: ...}, ...}

Задача: показать пиковый кассовый разрыв для обоснования инвест-раунда.

Лаги:
- Production CapEx — тратится за 1–2 квартала ДО релиза фильма
  (50% за 2 квартала до, 50% за 1 квартал до).
- Cinema revenue — 70% в квартал релиза, 25% в следующий квартал,
  5% во второй квартал после (лаг признания выручки).
- Advertising — распределение 10%/20%/30%/40% по кварталам года
  (сезонность: Q4 всегда самый высокий).
- Festivals — 5%/25%/45%/25% (пик в Q3 из-за МКФ).
- Education — 15%/30%/30%/25% (осенний набор).
- License library — линейно 25%/25%/25%/25%.
- OPEX — линейно 25%/25%/25%/25% (фикс).
- P&A — в квартал релиза фильма (100%).
- Contingency — линейно.
- Δ NWC — линейно по кварталам года.
- Taxes — в Q4 каждого года (упрощение).
"""
from __future__ import annotations

from typing import Dict, List, Tuple

from schemas.base import ScenarioName
from schemas.costs import CapexFile
from schemas.model_output import CostsByCategory, PnL, RevenueBySegment
from schemas.slate import SlateFile

from .base import YEARS


QUARTERS: List[str] = [f"Q{q}_{y}" for y in YEARS for q in (1, 2, 3, 4)]


def _qkey(y: int, q: int) -> str:
    return f"Q{q}_{y}"


def _q_offset(y: int, q: int, offset_q: int) -> Tuple[int, int]:
    """Смещение квартала на ±offset."""
    total = (y - 2026) * 4 + (q - 1) + offset_q
    new_y = 2026 + total // 4
    new_q = (total % 4) + 1
    return new_y, new_q


def _init_q_dict() -> Dict[str, float]:
    return {qk: 0.0 for qk in QUARTERS}


def _distribute_annual_linear(
    annual: Dict[int, float], weights: Tuple[float, float, float, float]
) -> Dict[str, float]:
    """Распределить годовые суммы по кварталам по фиксированным весам."""
    result = _init_q_dict()
    for y in YEARS:
        for qi, w in enumerate(weights, start=1):
            result[_qkey(y, qi)] += annual[y] * w
    return result


def _distribute_cinema_with_lag(
    cinema_annual: Dict[int, float],
    slate: SlateFile,
    scenario: ScenarioName,
) -> Dict[str, float]:
    """
    Распределяем киновыручку по кварталам релиза с признанием:
    Q0: 70%, Q0+1: 25%, Q0+2: 5%.

    Если сляйт даёт 0 для фильма — проваливаемся на линейное распределение
    в пределах года (25% на квартал).
    """
    result = _init_q_dict()

    # 1. Шаг «по фильмам»
    slate_year_total: Dict[int, float] = {y: 0.0 for y in YEARS}
    for film in slate.films:
        expected = film.expected_cinema_revenue_mln(scenario)
        if expected <= 0:
            continue
        y0, q0 = film.release_year, film.release_quarter
        if y0 not in YEARS:
            continue
        slate_year_total[y0] += expected
        # 70/25/5 с лагом
        for offset, share in ((0, 0.70), (1, 0.25), (2, 0.05)):
            ny, nq = _q_offset(y0, q0, offset)
            key = _qkey(ny, nq)
            if key in result:
                result[key] += expected * share

    # 2. Нормализация: если сляйт-сумма по году != cinema_annual,
    #    масштабируем весь год пропорционально (чтобы сохранить P&L).
    for y in YEARS:
        slate_sum = slate_year_total[y]
        target = cinema_annual[y]
        if slate_sum <= 0:
            # fallback: линейно 25/25/25/25
            for q in (1, 2, 3, 4):
                result[_qkey(y, q)] += target * 0.25
            continue
        factor = target / slate_sum if slate_sum > 0 else 1.0
        # нормировка только текущего года (чтобы лаги Q+1/Q+2 в следующий год
        # не ломали его сумму — их мы не трогаем)
        for q in (1, 2, 3, 4):
            key = _qkey(y, q)
            result[key] *= factor
    return result


def _distribute_pa_by_releases(
    pa_annual: Dict[int, float],
    slate: SlateFile,
) -> Dict[str, float]:
    """
    P&A — в квартал релиза фильма пропорционально ожидаемой выручке.
    Если фильмов нет — линейно.
    """
    result = _init_q_dict()
    for y in YEARS:
        # найти фильмы года
        films_y = [f for f in slate.films if f.release_year == y]
        if not films_y:
            for q in (1, 2, 3, 4):
                result[_qkey(y, q)] += pa_annual[y] * 0.25
            continue
        # равномерно между фильмами года
        per_film = pa_annual[y] / len(films_y)
        for f in films_y:
            result[_qkey(y, f.release_quarter)] += per_film
    return result


def _distribute_capex_with_frontload(
    capex_by_year: Dict[int, float],
    slate: SlateFile,
) -> Dict[str, float]:
    """
    Production CapEx — тратится ДО релиза: 50% Q−2, 50% Q−1.
    Часть раньше 2026 обрезается (первый квартал модели).
    """
    result = _init_q_dict()
    for y in YEARS:
        films_y = [f for f in slate.films if f.release_year == y]
        if not films_y:
            # линейно
            for q in (1, 2, 3, 4):
                result[_qkey(y, q)] += capex_by_year[y] * 0.25
            continue
        per_film = capex_by_year[y] / len(films_y)
        for f in films_y:
            for offset, share in ((-2, 0.5), (-1, 0.5)):
                ny, nq = _q_offset(f.release_year, f.release_quarter, offset)
                key = _qkey(ny, nq)
                if key in result:
                    result[key] += per_film * share
                # иначе — выпадает за горизонт модели (то есть до 2026 Q1)
    return result


def generate_quarterly_cashflow(
    scenario: ScenarioName,
    revenue: RevenueBySegment,
    pnl: PnL,
    costs: CostsByCategory,
    capex_file: CapexFile,
    slate: SlateFile,
) -> Dict[str, Dict[str, float]]:
    """
    Возвращает {quarter_key: {income, outcome, net, cumulative}}.

    income  — все inflow-потоки квартала
    outcome — все outflow-потоки квартала (положительное число)
    net     — income − outcome
    cumulative — накопительная сумма net-ов с Q1 2026
    """
    # ─── INCOME ──────────────────────────────
    cinema_q = _distribute_cinema_with_lag(revenue.cinema, slate, scenario)
    advertising_q = _distribute_annual_linear(
        revenue.advertising, (0.10, 0.20, 0.30, 0.40)
    )
    festivals_q = _distribute_annual_linear(
        revenue.festivals, (0.05, 0.25, 0.45, 0.25)
    )
    education_q = _distribute_annual_linear(
        revenue.education, (0.15, 0.30, 0.30, 0.25)
    )
    library_q = _distribute_annual_linear(
        revenue.license_library, (0.25, 0.25, 0.25, 0.25)
    )

    income: Dict[str, float] = _init_q_dict()
    for qk in QUARTERS:
        income[qk] = (
            cinema_q[qk]
            + advertising_q[qk]
            + festivals_q[qk]
            + education_q[qk]
            + library_q[qk]
        )

    # ─── OUTCOME ─────────────────────────────
    opex_q = _distribute_annual_linear(costs.opex, (0.25, 0.25, 0.25, 0.25))
    contingency_q = _distribute_annual_linear(
        costs.contingency, (0.25, 0.25, 0.25, 0.25)
    )
    nwc_q = _distribute_annual_linear(
        costs.nwc_change, (0.25, 0.25, 0.25, 0.25)
    )
    pa_q = _distribute_pa_by_releases(costs.pa, slate)

    # Production CapEx строится по фильмам, COGS покрывается CapEx-ом в
    # год производства, поэтому берём cogs как прокси кассового оттока.
    capex_q = _distribute_capex_with_frontload(costs.cogs, slate)

    # Infrastructure CapEx — линейно по кварталам (упрощение)
    infra_annual: Dict[int, float] = {y: 0.0 for y in YEARS}
    for row in capex_file.infrastructure_capex_mln_rub:
        infra_annual[row.year] = float(row.base)
    infra_q = _distribute_annual_linear(infra_annual, (0.25, 0.25, 0.25, 0.25))

    # Taxes — в Q4 каждого года полностью
    taxes_q = _init_q_dict()
    for y in YEARS:
        taxes_q[_qkey(y, 4)] = pnl.taxes[y]

    outcome: Dict[str, float] = _init_q_dict()
    for qk in QUARTERS:
        outcome[qk] = (
            opex_q[qk]
            + contingency_q[qk]
            + nwc_q[qk]
            + pa_q[qk]
            + capex_q[qk]
            + infra_q[qk]
            + taxes_q[qk]
        )

    # ─── NET + CUMULATIVE ────────────────────
    result: Dict[str, Dict[str, float]] = {}
    cumulative = 0.0
    for qk in QUARTERS:
        net = income[qk] - outcome[qk]
        cumulative += net
        result[qk] = {
            "income": round(income[qk], 2),
            "outcome": round(outcome[qk], 2),
            "net": round(net, 2),
            "cumulative": round(cumulative, 2),
        }
    return result
