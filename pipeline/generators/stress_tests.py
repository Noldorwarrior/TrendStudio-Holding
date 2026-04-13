"""
generators/stress_tests.py — стресс-тесты и breakeven-анализ.

SCOPE (Ж7 v1.3.3): этот модуль тестирует ОБОБЩЁННЫЕ шоки выручки и затрат
────────────────────────────────────────────────────────────────────────────
  • Revenue × фактор (−10/−20/−30%) — все сегменты одновременно
  • Cost × фактор (+10/+20%) — COGS+P&A+OPEX+Contingency
  • Combined: rev −15% + cost +10%
  • Breakeven: бинарный поиск multi revenue, зануляющего cumulative EBITDA

НЕ ДУБЛИРУЕТ модуль generators/combined_stress_tests.py (v1.3.2):
  ─ combined_stress_tests работает с СПЕЦИФИЧЕСКИМИ механиками:
     FX pass-through × инфляция OPEX × release delay (3×3×3 матрица),
     Monte Carlo с Cholesky-корреляциями.
  ─ этот модуль работает с АБСТРАКТНЫМИ «что если выручка/затраты пойдут
     не так» — без привязки к конкретному драйверу.
Оба подхода дополняют друг друга: этот даёт простую границу чувствительности,
combined — сценарии макро-шоков с коррелированными драйверами.

Вход: ModelResult (Base-сценарий) ИЛИ RunAllResult — в этом случае
      автоматически извлекается models["base"]. Это позволяет вызывать
      generate_stress_tests(run, ...) без предварительного .get("base").

Выход: StressResults с 6 шоками + breakeven:
  1. Revenue shock: −10% / −20% / −30% на все сегменты
  2. Cost shock: +10% / +20% на COGS+P&A+OPEX+Contingency
  3. Combined: rev −15% + cost +10%
  4. Breakeven: какой % падения выручки зануляет cumulative EBITDA

Все тесты применяются к Base модели «на лету» без пересборки всего pipeline.
Они быстрые, потому что работают на готовых словарях.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Union

from schemas.model_output import ModelResult

from .base import YEARS, cumulative, scale_year_dict, sub_year_dicts


def _coerce_to_base_model(model_or_run: object) -> ModelResult:
    """
    Принимает ModelResult или RunAllResult. В случае RunAllResult
    извлекает Base-сценарий. Если передан неподходящий объект —
    бросает TypeError с понятным сообщением вместо немого AttributeError.
    """
    # ModelResult — у него есть cumulative_ebitda и cashflow
    if hasattr(model_or_run, "cumulative_ebitda") and hasattr(model_or_run, "cashflow"):
        return model_or_run  # type: ignore[return-value]
    # RunAllResult — у него есть метод get(scenario) и поле models
    if hasattr(model_or_run, "get") and hasattr(model_or_run, "models"):
        try:
            return model_or_run.get("base")  # type: ignore[attr-defined]
        except Exception as exc:
            raise TypeError(
                f"generate_stress_tests: RunAllResult.get('base') упал: {exc}"
            ) from exc
    raise TypeError(
        "generate_stress_tests ожидает ModelResult или RunAllResult, "
        f"получено {type(model_or_run).__name__}"
    )


@dataclass
class StressScenarioResult:
    name: str
    description: str
    delta_ebitda_pct: float
    delta_fcf_pct: float
    new_cumulative_ebitda: float
    passes_anchor: bool


@dataclass
class StressResults:
    scenarios: List[StressScenarioResult] = field(default_factory=list)
    breakeven_revenue_shock_pct: float = 0.0
    breakeven_rationale: str = ""


def _cum_ebitda_under_shock(
    model: ModelResult,
    revenue_factor: float = 1.0,
    cost_factor: float = 1.0,
) -> Tuple[float, float]:
    """
    Пересчитывает cumulative EBITDA и FCF при шоках:
    - revenue × revenue_factor
    - cogs/pa/opex/contingency × cost_factor
    D&A и ΔNWC остаются прежними (упрощение).
    """
    rev_total = {y: model.revenue.total_by_year(y) * revenue_factor for y in YEARS}
    cogs = scale_year_dict(model.costs.cogs, cost_factor)
    pa = scale_year_dict(model.costs.pa, cost_factor)
    opex = scale_year_dict(model.costs.opex, cost_factor)
    cont = scale_year_dict(model.costs.contingency, cost_factor)

    ebitda = {
        y: rev_total[y] - cogs[y] - pa[y] - opex[y] - cont[y] for y in YEARS
    }
    ebit = {y: ebitda[y] - model.costs.depreciation[y] for y in YEARS}
    taxes = {y: max(0.0, ebit[y]) * 0.25 for y in YEARS}
    ni = {y: ebit[y] - taxes[y] for y in YEARS}
    # FCF = NI + D&A − ΔNWC − (cogs как прокси CapEx)
    fcf = {
        y: ni[y]
        + model.costs.depreciation[y]
        - model.costs.nwc_change[y]
        - cogs[y]
        for y in YEARS
    }
    return cumulative(ebitda), cumulative(fcf)


def _run_shock(
    model: ModelResult,
    name: str,
    description: str,
    revenue_factor: float,
    cost_factor: float,
    anchor_value: float,
    tolerance_pct: float,
) -> StressScenarioResult:
    base_ebitda = model.cumulative_ebitda
    base_fcf = cumulative(model.cashflow.free_cash_flow)
    new_ebitda, new_fcf = _cum_ebitda_under_shock(
        model, revenue_factor=revenue_factor, cost_factor=cost_factor
    )
    de = (new_ebitda - base_ebitda) / base_ebitda * 100.0 if base_ebitda else 0.0
    df = (new_fcf - base_fcf) / abs(base_fcf) * 100.0 if base_fcf else 0.0
    dev = (new_ebitda - anchor_value) / anchor_value * 100.0
    return StressScenarioResult(
        name=name,
        description=description,
        delta_ebitda_pct=round(de, 2),
        delta_fcf_pct=round(df, 2),
        new_cumulative_ebitda=round(new_ebitda, 1),
        passes_anchor=abs(dev) <= tolerance_pct,
    )


def _breakeven_revenue_shock(
    model: ModelResult, tolerance_pp: float = 0.001
) -> Tuple[float, str]:
    """
    Бинарный поиск: какой множитель выручки (revenue_factor < 1)
    обнуляет cumulative EBITDA.
    """
    lo, hi = 0.0, 1.0
    base_cum, _ = _cum_ebitda_under_shock(model, 1.0, 1.0)
    if base_cum <= 0:
        return 0.0, "Base EBITDA уже ≤ 0, breakeven не применим"
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        cum, _ = _cum_ebitda_under_shock(model, mid, 1.0)
        if abs(cum) < tolerance_pp:
            break
        if cum > 0:
            hi = mid
        else:
            lo = mid
    shock_pct = (1.0 - mid) * 100.0
    rationale = (
        f"Падение выручки на {shock_pct:.1f}% зануляет cumulative EBITDA. "
        f"Запас прочности от Base (при фикс. D&A, ΔNWC)."
    )
    return round(shock_pct, 1), rationale


def generate_stress_tests(
    model: Union[ModelResult, object],
    anchor_value: float,
    tolerance_pct: float,
) -> StressResults:
    """
    Прогнать 6 стресс-шоков + breakeven на Base модели.

    Принимает ModelResult (Base-сценарий напрямую) или RunAllResult —
    во втором случае Base-сценарий извлекается автоматически через
    _coerce_to_base_model, что делает вызов устойчивым к частой ошибке
    «забыл .get('base')».
    """
    model = _coerce_to_base_model(model)
    results = StressResults()

    shocks = [
        ("rev_-10", "Revenue −10% на все сегменты", 0.90, 1.00),
        ("rev_-20", "Revenue −20% на все сегменты", 0.80, 1.00),
        ("rev_-30", "Revenue −30% на все сегменты", 0.70, 1.00),
        ("cost_+10", "Cost +10% на COGS+P&A+OPEX+Contingency", 1.00, 1.10),
        ("cost_+20", "Cost +20% на COGS+P&A+OPEX+Contingency", 1.00, 1.20),
        ("combined_bad", "Комбинированный: rev −15% + cost +10%", 0.85, 1.10),
    ]

    for name, desc, rf, cf in shocks:
        results.scenarios.append(
            _run_shock(model, name, desc, rf, cf, anchor_value, tolerance_pct)
        )

    be_pct, be_rationale = _breakeven_revenue_shock(model)
    results.breakeven_revenue_shock_pct = be_pct
    results.breakeven_rationale = be_rationale

    return results
