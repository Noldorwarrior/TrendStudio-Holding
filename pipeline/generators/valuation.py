"""
generators/valuation.py — DCF + NPV/IRR/MOIC + Terminal Value.

Вход: CashFlow, PnL, ValuationFile, InvestmentFile
Выход: ValuationMetrics (3 WACC × NPV + Gordon/Exit TV)

Упрощения (для v1):
- Горизонт DCF = 3 года (2026-2028), далее terminal value.
- NPV = Σ FCFt / (1+WACC)^t + TV / (1+WACC)^3
- Terminal Gordon = FCF_2028 × (1+g) / (WACC − g)
- Terminal Exit = EBITDA_2028 × exit_multiple
- IRR — численно (простой bisect на горизонте 5 лет с одним оттоком).
- MOIC = суммарный возврат / вложенный капитал
  (equity ask — выступает оттоком в t=0).
- Payback — год, когда cumulative FCF превысил initial equity.
"""
from __future__ import annotations

from typing import Dict, List

from schemas.base import ScenarioName
from schemas.investment import InvestmentFile
from schemas.model_output import CashFlow, PnL, ValuationMetrics
from schemas.valuation import ValuationFile

from .base import YEARS


def _wacc_by_method(valuation: ValuationFile, scenario: ScenarioName) -> Dict[str, float]:
    """{method_id: wacc_value} для заданного сценария."""
    out: Dict[str, float] = {}
    for m in valuation.wacc_methodologies:
        out[m.method_id] = float(getattr(m.wacc, scenario))
    return out


def _discounted_fcf(fcf: List[float], wacc: float) -> float:
    """Σ FCFt / (1+WACC)^t, t=1..len(fcf)."""
    if wacc <= -1.0:
        raise ValueError(f"wacc={wacc} invalid (≤ −1)")
    total = 0.0
    for t, cf in enumerate(fcf, start=1):
        total += cf / ((1.0 + wacc) ** t)
    return total


def _tv_gordon(fcf_last: float, wacc: float, growth: float) -> float:
    if wacc <= growth:
        raise ValueError(
            f"Gordon: wacc={wacc} must be > growth={growth}"
        )
    return fcf_last * (1.0 + growth) / (wacc - growth)


def _discounted_tv(tv: float, wacc: float, horizon_years: int = 3) -> float:
    return tv / ((1.0 + wacc) ** horizon_years)


def _irr(fcf: List[float]) -> float:
    """Compute IRR using unified numpy_financial.irr (R-008).

    Delegates to finance_core.compute_irr — single method across all scripts.
    """
    from .finance_core import compute_irr
    return compute_irr(fcf)


def _moic(fcf: List[float]) -> float:
    """Compute MOIC using unified finance_core.compute_moic (R-008)."""
    from .finance_core import compute_moic
    return compute_moic(fcf)


def _payback_years(fcf: List[float]) -> float:
    """Год (с дробной частью), когда cumulative ≥ 0."""
    if not fcf or fcf[0] >= 0:
        return 0.0
    cumulative = fcf[0]
    for t, cf in enumerate(fcf[1:], start=1):
        prev_cumulative = cumulative
        cumulative += cf
        if cumulative >= 0:
            if cf <= 0:
                return float(t)
            # линейная интерполяция внутри года
            return (t - 1) + (-prev_cumulative) / cf
    return float(len(fcf) - 1)  # не окупилось — возвращаем горизонт


def generate_valuation(
    scenario: ScenarioName,
    pnl: PnL,
    cashflow: CashFlow,
    valuation_file: ValuationFile,
    investment_file: InvestmentFile,
) -> ValuationMetrics:
    # ── FCF за 3 года ─────────────────────────
    fcf_list = [cashflow.free_cash_flow[y] for y in YEARS]
    fcf_last = fcf_list[-1]

    # ── 3 WACC ─────────────────────────────────
    wacc_map = _wacc_by_method(valuation_file, scenario)

    # ── Terminal Value ─────────────────────────
    # Gordon: берём growth для base-метода capm_classic (все методы тут
    # дают одно и то же g); читаем g из terminal_value_methodologies.
    g = 0.02  # дефолт
    exit_multiple = 6.0
    for tv in valuation_file.terminal_value_methodologies:
        if tv.get("method_id") == "gordon_growth":
            gr = tv.get("perpetual_growth_rate", {})
            if isinstance(gr, dict):
                g = float(gr.get(scenario, gr.get("base", 0.02)))
        elif tv.get("method_id") == "exit_multiple":
            em = tv.get("ev_ebitda_multiple", {})
            if isinstance(em, dict):
                exit_multiple = float(em.get(scenario, em.get("base", 6.0)))

    ebitda_last = pnl.ebitda[YEARS[-1]]
    tv_gordon_raw = _tv_gordon(fcf_last, wacc_map.get("capm_classic", 0.22), g)
    tv_exit_raw = ebitda_last * exit_multiple

    # ── NPV по трём WACC ───────────────────────
    def _npv_total(wacc: float) -> float:
        pv_fcf = _discounted_fcf(fcf_list, wacc)
        # терминал — Gordon (можно было и exit, но для v1 фиксируем Gordon)
        tv_g = _tv_gordon(fcf_last, wacc, g)
        pv_tv = _discounted_tv(tv_g, wacc, horizon_years=len(YEARS))
        return pv_fcf + pv_tv

    npv_capm = _npv_total(wacc_map.get("capm_classic", 0.22))
    npv_buildup = _npv_total(wacc_map.get("build_up_country_risk", 0.22))
    npv_switcher = _npv_total(wacc_map.get("comparable_emerging_markets", 0.22))

    # ── IRR / MOIC / Payback ───────────────────
    # Для инвест-метрик используем equity tranche как отток в t=0
    equity_amount = 0.0
    for tr in investment_file.tranche_structure:
        if tr.tranche_id.startswith("equity"):
            equity_amount = float(tr.amount_mln_rub)
            break
    # если equity-транш не найден — fallback на headline ask
    if equity_amount <= 0:
        equity_amount = float(investment_file.headline_ask_mln_rub)

    invest_flows = [-equity_amount] + fcf_list
    irr = _irr(invest_flows)
    moic = _moic(invest_flows)
    payback = _payback_years(invest_flows)

    return ValuationMetrics(
        scenario=scenario,
        wacc_capm=wacc_map.get("capm_classic", 0.22),
        wacc_switcher=wacc_map.get("comparable_emerging_markets", 0.22),
        wacc_buildup=wacc_map.get("build_up_country_risk", 0.22),
        npv_capm=round(npv_capm, 2),
        npv_switcher=round(npv_switcher, 2),
        npv_buildup=round(npv_buildup, 2),
        irr=round(irr, 4),
        moic=round(moic, 4),
        payback_years=round(payback, 2),
        terminal_value_multiple=round(tv_exit_raw, 2),
        terminal_value_gordon=round(tv_gordon_raw, 2),
    )
