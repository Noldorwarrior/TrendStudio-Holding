"""
generators/combined_stress_tests.py — Комбинированные стресс-тесты (v1.3.2)

SCOPE (Ж7 v1.3.3): этот модуль моделирует СПЕЦИФИЧЕСКИЕ макро-драйверы
────────────────────────────────────────────────────────────────────────────
  • FX pass-through × инфляция OPEX × release delay (3×3×3 детерм. матрица)
  • Monte Carlo (n=2000) с КОРРЕЛИРОВАННЫМИ выборками через Cholesky 3×3
     (fx↔infl=+0.6, fx↔delay=+0.3, infl↔delay=+0.2)
  • Артефакты: artifacts/stress_matrix/{matrix_27.json, monte_carlo.json,
     mc_samples.json, heatmaps.png, mc_histogram.png}

НЕ ДУБЛИРУЕТ:
  ─ generators/stress_tests.py — обобщённые revenue/cost шоки + breakeven
  ─ generators/monte_carlo.py — независимые треугольные шоки revenue/cost
Оба старых модуля остаются в pipeline (шаги [4/9] и [5/9]) и работают
на абстрактных факторах; этот модуль — шаг [4+5/9], работает на
специфических макро-драйверах с реалистичными корреляциями.

Закрытие жёлтой зоны №3 из v1.3 self-reflection: единичные шоки 8.4a/8.4b
тестируют только один параметр за раз, в то время как реальные кризисы
приходят комбинациями. Этот модуль реализует:

1. apply_fx_shock()        — FX → pt × статьи затрат (как в 8.4a+8.4b)
2. apply_inflation_shock() — инфляция → opex × (1 + infl × 0.82)
3. apply_release_delay()   — сдвиг cinema + pa + cogs на N мес
4. run_combined_scenario() — 3 шока одновременно → cumulative EBITDA
5. run_full_matrix()       — полная 3×3×3 = 27 сценариев
6. run_monte_carlo()       — 2000 прогонов с корреляцией (FX↔infl)=+0.6

Все шоки применяются к базовому сценарию; якорь cumulative EBITDA 2026-2028
должен оставаться в [2700; 3300] млн ₽ (±10% от 3000).

Параметры берутся из inputs/stress_matrix.yaml.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from schemas.inputs import ValidatedInputs
from schemas.segments import YearRevenueTarget, YearExpenseTarget


# ============================================================================
# Shock applicators (pure functions on ValidatedInputs → ValidatedInputs)
# ============================================================================

def apply_fx_shock(
    inputs: ValidatedInputs,
    fx_shock_pct: float,
    hedge_ratios: Optional[Dict[str, float]] = None,
) -> ValidatedInputs:
    """Применяет FX-шок к pa_costs, cogs, production_capex, infrastructure_capex.

    Использует коэффициенты pass-through из inputs.fx_pass_through
    (v1.3.1: infrastructure_capex=0.74 после триангуляции).

    v1.3.6 Ж4: если передан hedge_ratios={"p_and_a": r1, "cogs": r2, ...},
    эффективный pass-through снижается: effective_pt = pt × (1 - hedge_ratio).
    При hedge_ratios=None используется full pass-through (поведение v1.3.5).
    """
    if fx_shock_pct == 0.0:
        return inputs

    pt = inputs.fx_pass_through.coefficients
    pt_pa = pt.p_and_a.value
    pt_cogs = pt.cogs.value
    pt_prod = pt.production_capex.value
    pt_infra = pt.infrastructure_capex.value

    # v1.3.6 Ж4: применение hedge_ratios снижает эффективный pt.
    if hedge_ratios is not None:
        pt_pa = pt_pa * (1.0 - hedge_ratios.get("p_and_a", 0.0))
        pt_cogs = pt_cogs * (1.0 - hedge_ratios.get("cogs", 0.0))
        pt_prod = pt_prod * (1.0 - hedge_ratios.get("production_capex", 0.0))
        pt_infra = pt_infra * (1.0 - hedge_ratios.get("infrastructure_capex", 0.0))

    pa_factor = 1.0 + pt_pa * fx_shock_pct
    cogs_factor = 1.0 + pt_cogs * fx_shock_pct
    prod_factor = 1.0 + pt_prod * fx_shock_pct
    infra_factor = 1.0 + pt_infra * fx_shock_pct

    # pa_costs.targets_mln_rub
    new_pa_targets = [
        YearRevenueTarget(
            year=t.year,
            cons=round(t.cons * pa_factor, 4),
            base=round(t.base * pa_factor, 4),
            opt=round(t.opt * pa_factor, 4),
        )
        for t in inputs.pa_costs.targets_mln_rub
    ]
    new_pa = inputs.pa_costs.model_copy(update={"targets_mln_rub": new_pa_targets})

    # capex.cogs_targets_mln_rub
    new_cogs = [
        YearRevenueTarget(
            year=t.year,
            cons=round(t.cons * cogs_factor, 4),
            base=round(t.base * cogs_factor, 4),
            opt=round(t.opt * cogs_factor, 4),
        )
        for t in inputs.capex.cogs_targets_mln_rub
    ]
    new_prod_rows = [
        row.model_copy(update={
            "cons": round(row.cons * prod_factor, 4),
            "base": round(row.base * prod_factor, 4),
            "opt": round(row.opt * prod_factor, 4),
        })
        for row in inputs.capex.production_capex_mln_rub
    ]
    new_infra_rows = [
        row.model_copy(update={"base": round(row.base * infra_factor, 4)})
        for row in inputs.capex.infrastructure_capex_mln_rub
    ]
    new_capex = inputs.capex.model_copy(update={
        "cogs_targets_mln_rub": new_cogs,
        "production_capex_mln_rub": new_prod_rows,
        "infrastructure_capex_mln_rub": new_infra_rows,
    })

    return inputs.model_copy(update={"pa_costs": new_pa, "capex": new_capex})


def apply_inflation_shock(inputs: ValidatedInputs, inflation_pct: float) -> ValidatedInputs:
    """Применяет инфляционный шок к opex.

    Механика: ФОТ (55% от OPEX) прямо масштабируется на (1 + infl),
    остальной OPEX (rent, IT, marketing, legal, overhead, other = 45%) —
    на (1 + infl × 0.6) (частичное пропускание).
    Эффективный множитель: 0.55 × (1+infl) + 0.45 × (1+infl × 0.6)
                         = 1 + infl × (0.55 + 0.45 × 0.6) = 1 + infl × 0.82

    v1.3.6 P2: коэффициент 0.82 вынесен в inputs/stress_matrix.yaml
    (shock_parameters.inflation_transmission_factor).
    """
    if inflation_pct == 0.0:
        return inputs

    transmission = inputs.stress_matrix.shock_parameters.inflation_transmission_factor
    effective_factor = 1.0 + inflation_pct * transmission

    new_opex_targets = [
        YearExpenseTarget(
            year=t.year,
            cons=round(t.cons * effective_factor, 4),
            base=round(t.base * effective_factor, 4),
            opt=round(t.opt * effective_factor, 4),
        )
        for t in inputs.opex.targets_mln_rub
    ]
    new_opex = inputs.opex.model_copy(update={"targets_mln_rub": new_opex_targets})
    return inputs.model_copy(update={"opex": new_opex})


def apply_release_delay(inputs: ValidatedInputs, delay_months: int) -> ValidatedInputs:
    """Применяет задержку релизов на N месяцев к cinema, pa_costs, cogs.

    Механика (упрощённая модель сдвига дохода вправо):
      f = delay / 12
      year_t_new = year_t × (1-f) + year_(t-1) × f
      Для первого года (2026): теряется f × year_2026 (ушло в прошлое, которого нет)
      Для последнего года (2028): 25% собственного уходит в 2029 (за горизонт)

    Cumulative loss = f × year_2028_original (утечка в 2029).

    Сдвигаются: cinema.targets (revenue), pa_costs.targets (затраты на релизы),
    capex.cogs_targets (амортизация по графику релизов).
    НЕ сдвигаются: opex (фикс), production_capex (cash-out уже произошёл),
    infrastructure_capex (фикс).
    """
    if delay_months == 0:
        return inputs

    f = delay_months / 12.0

    def _shift_list(items: list, ctor, cons_attr: str = "cons") -> list:
        """Сдвигает годовой ряд на f × предыдущий год."""
        sorted_items = sorted(items, key=lambda x: x.year)
        new_items = []
        prev = None
        for item in sorted_items:
            # year_t_new = year_t × (1-f) + year_(t-1) × f (если есть prev)
            if prev is None:
                # первый год: теряет f × самого себя (ушло в прошлое)
                new_cons = item.cons * (1 - f)
                new_base = item.base * (1 - f)
                new_opt = item.opt * (1 - f)
            else:
                new_cons = item.cons * (1 - f) + prev.cons * f
                new_base = item.base * (1 - f) + prev.base * f
                new_opt = item.opt * (1 - f) + prev.opt * f
            new_items.append(ctor(
                year=item.year,
                cons=round(new_cons, 4),
                base=round(new_base, 4),
                opt=round(new_opt, 4),
            ))
            prev = item
        return new_items

    new_cinema_targets = _shift_list(
        list(inputs.cinema.targets_mln_rub), YearRevenueTarget
    )
    new_cinema = inputs.cinema.model_copy(update={"targets_mln_rub": new_cinema_targets})

    new_pa_targets = _shift_list(
        list(inputs.pa_costs.targets_mln_rub), YearRevenueTarget
    )
    new_pa = inputs.pa_costs.model_copy(update={"targets_mln_rub": new_pa_targets})

    new_cogs = _shift_list(
        list(inputs.capex.cogs_targets_mln_rub), YearRevenueTarget
    )
    new_capex = inputs.capex.model_copy(update={"cogs_targets_mln_rub": new_cogs})

    return inputs.model_copy(update={
        "cinema": new_cinema,
        "pa_costs": new_pa,
        "capex": new_capex,
    })


# ============================================================================
# Scenario runners
# ============================================================================

@dataclass
class CombinedScenarioResult:
    scenario_id: str                # напр. "FX0_I0_D0" или "FX20_I6_D6"
    fx_shock_pct: float
    inflation_pct: float
    delay_months: int
    cumulative_ebitda: float
    delta_ebitda: float
    delta_pct: float
    breach: bool                    # anchor < 2700
    severe_breach: bool             # anchor < 2400


def run_combined_scenario(
    inputs: ValidatedInputs,
    fx_shock_pct: float,
    inflation_pct: float,
    delay_months: int,
    base_ebitda: float,
    breach_lower: float,
    severe_breach: float,
) -> CombinedScenarioResult:
    """Применяет 3 шока последовательно и считает EBITDA."""
    from .core import run_all

    mod = inputs
    mod = apply_fx_shock(mod, fx_shock_pct)
    mod = apply_inflation_shock(mod, inflation_pct)
    mod = apply_release_delay(mod, delay_months)

    run = run_all(mod)
    eb = run.models["base"].cumulative_ebitda
    delta = eb - base_ebitda

    fx_tag = f"FX{int(fx_shock_pct*100)}"
    i_tag = f"I{int(inflation_pct*100)}"
    d_tag = f"D{delay_months}"

    return CombinedScenarioResult(
        scenario_id=f"{fx_tag}_{i_tag}_{d_tag}",
        fx_shock_pct=fx_shock_pct,
        inflation_pct=inflation_pct,
        delay_months=delay_months,
        cumulative_ebitda=round(eb, 2),
        delta_ebitda=round(delta, 2),
        delta_pct=round(delta / base_ebitda * 100.0, 2),
        breach=(eb < breach_lower),
        severe_breach=(eb < severe_breach),
    )


@dataclass
class FullMatrixReport:
    base_ebitda: float
    breach_lower: float
    severe_breach: float
    scenarios: List[CombinedScenarioResult] = field(default_factory=list)
    n_total: int = 0
    n_breach: int = 0
    n_severe: int = 0
    worst_scenario_id: str = ""
    worst_ebitda: float = 0.0


def run_full_matrix(inputs: ValidatedInputs) -> FullMatrixReport:
    """Запускает полную 3×3×3 = 27 сценариев детерминированной матрицы.

    Уровни берутся из inputs.stress_matrix.dimensions.
    """
    from .core import run_all
    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    sm = inputs.stress_matrix
    fx_levels = [
        sm.dimensions.fx_shock_pct.levels.base,
        sm.dimensions.fx_shock_pct.levels.shock,
        sm.dimensions.fx_shock_pct.levels.extreme,
    ]
    infl_levels = [
        sm.dimensions.inflation_fot_opex_pct.levels.base,
        sm.dimensions.inflation_fot_opex_pct.levels.shock,
        sm.dimensions.inflation_fot_opex_pct.levels.extreme,
    ]
    delay_levels = [
        sm.dimensions.release_delay_months.levels.base,
        sm.dimensions.release_delay_months.levels.shock,
        sm.dimensions.release_delay_months.levels.extreme,
    ]
    breach_lower = sm.breach_thresholds.anchor_lower_bound_mln_rub
    severe = sm.breach_thresholds.severe_breach_threshold_mln_rub

    report = FullMatrixReport(
        base_ebitda=round(base_ebitda, 2),
        breach_lower=breach_lower,
        severe_breach=severe,
    )

    worst_eb = float("inf")
    worst_id = ""

    for fx in fx_levels:
        for infl in infl_levels:
            for d in delay_levels:
                res = run_combined_scenario(
                    inputs, fx, infl, d, base_ebitda, breach_lower, severe
                )
                report.scenarios.append(res)
                if res.breach:
                    report.n_breach += 1
                if res.severe_breach:
                    report.n_severe += 1
                if res.cumulative_ebitda < worst_eb:
                    worst_eb = res.cumulative_ebitda
                    worst_id = res.scenario_id

    report.n_total = len(report.scenarios)
    report.worst_scenario_id = worst_id
    report.worst_ebitda = round(worst_eb, 2)
    return report


# ============================================================================
# Monte Carlo with correlated shocks
# ============================================================================

@dataclass
class MonteCarloReport:
    n_simulations: int
    base_ebitda: float
    mean_ebitda: float
    std_ebitda: float
    p5_ebitda: float
    p25_ebitda: float
    p50_ebitda: float
    p75_ebitda: float
    p95_ebitda: float
    var_95_mln_rub: float          # VaR(95%) = base − p5
    breach_probability: float       # доля сценариев с EBITDA < 2700
    severe_breach_probability: float
    correlations_applied: Dict[str, float]
    ebitda_samples: List[float] = field(default_factory=list)  # для гистограммы


def _cholesky_3x3(corr: List[List[float]]) -> List[List[float]]:
    """Cholesky decomposition для симметричной положительно-определённой матрицы 3×3.

    Возвращает нижнетреугольную матрицу L такую, что L·L^T = corr.
    """
    L = [[0.0] * 3 for _ in range(3)]
    for i in range(3):
        for j in range(i + 1):
            s = sum(L[i][k] * L[j][k] for k in range(j))
            if i == j:
                val = corr[i][i] - s
                if val <= 0:
                    raise ValueError(
                        f"Correlation matrix not positive-definite at ({i},{j}): {val}"
                    )
                L[i][j] = math.sqrt(val)
            else:
                L[i][j] = (corr[i][j] - s) / L[j][j]
    return L


def _correlated_normals(
    L: List[List[float]],
    rng: random.Random,
) -> Tuple[float, float, float]:
    """Генерирует 3 коррелированных N(0,1) через Cholesky × iid N(0,1)."""
    z1, z2, z3 = rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1)
    # y = L @ z (L нижнетреугольная)
    y1 = L[0][0] * z1
    y2 = L[1][0] * z1 + L[1][1] * z2
    y3 = L[2][0] * z1 + L[2][1] * z2 + L[2][2] * z3
    return y1, y2, y3


def run_monte_carlo(inputs: ValidatedInputs) -> MonteCarloReport:
    """Monte Carlo с корреляциями: n=2000 прогонов коррелированных шоков.

    Распределения и корреляции из inputs.stress_matrix.monte_carlo.
    """
    from .core import run_all

    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    rng = random.Random(mc.seed)

    # Базовый EBITDA
    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    # Построение корреляционной матрицы
    c = mc.correlations
    corr_mat = [
        [1.0,               c.fx_vs_inflation, c.fx_vs_delay],
        [c.fx_vs_inflation, 1.0,               c.inflation_vs_delay],
        [c.fx_vs_delay,     c.inflation_vs_delay, 1.0],
    ]
    L = _cholesky_3x3(corr_mat)

    # Параметры распределений
    fx_mean = mc.distributions.fx_shock_pct.mean or 0.0
    fx_std = mc.distributions.fx_shock_pct.std or 0.0
    infl_mean = mc.distributions.inflation_pct.mean or 0.0
    infl_std = mc.distributions.inflation_pct.std or 0.0
    delay_scale = mc.distributions.release_delay_months.scale or 3.0

    # v1.3.6 P2: clip bounds вынесены в stress_matrix.shock_parameters.
    sp = sm.shock_parameters
    fx_lo, fx_hi = sp.fx_clip_lower, sp.fx_clip_upper
    infl_lo, infl_hi = sp.inflation_clip_lower, sp.inflation_clip_upper
    delay_lo, delay_hi = sp.delay_clip_lower, sp.delay_clip_upper

    ebitdas: List[float] = []

    for _ in range(mc.n_simulations):
        y_fx, y_infl, y_delay = _correlated_normals(L, rng)

        # FX: N(mean, std)
        fx = fx_mean + fx_std * y_fx
        # Inflation: N(mean, std), clamp to [infl_lo; infl_hi]
        infl = max(infl_lo, min(infl_hi, infl_mean + infl_std * y_infl))
        # Delay: half-normal от |y_delay| × scale, clamp [delay_lo; delay_hi]
        delay_raw = abs(y_delay) * delay_scale
        delay = int(round(max(delay_lo, min(delay_hi, delay_raw))))

        # Clamp FX to [fx_lo; fx_hi] (разумные границы)
        fx = max(fx_lo, min(fx_hi, fx))

        mod = inputs
        if fx != 0.0:
            mod = apply_fx_shock(mod, fx)
        if infl > 0.0:
            mod = apply_inflation_shock(mod, infl)
        if delay > 0:
            mod = apply_release_delay(mod, delay)

        run = run_all(mod)
        eb = run.models["base"].cumulative_ebitda
        ebitdas.append(eb)

    # Статистика
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

    return MonteCarloReport(
        n_simulations=mc.n_simulations,
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
        correlations_applied={
            "fx_vs_inflation": c.fx_vs_inflation,
            "fx_vs_delay": c.fx_vs_delay,
            "inflation_vs_delay": c.inflation_vs_delay,
        },
        ebitda_samples=[round(x, 2) for x in sorted_eb],
    )


def run_monte_carlo_hedged(
    inputs: ValidatedInputs,
    scenario_name: str = "no_hedge",
    n_simulations: Optional[int] = None,
) -> MonteCarloReport:
    """v1.3.6 Ж4: Monte Carlo с учётом hedge-сценария.

    Аналогичен run_monte_carlo(), но при применении FX-шока использует
    hedge_ratios из inputs.hedge.hedge_scenarios[scenario_name].

    Поддерживаемые сценарии: no_hedge, conservative, aggressive.
    При scenario_name='no_hedge' результат должен совпадать с run_monte_carlo()
    (метаморфический инвариант).

    Args:
        inputs: валидированные входы (должны содержать inputs.hedge).
        scenario_name: имя hedge-сценария из hedge.yaml.
        n_simulations: override n (если None — берётся из stress_matrix.yaml).

    Returns:
        MonteCarloReport с дополнительно зашитым scenario_name в meta.
    """
    from .core import run_all

    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    rng = random.Random(mc.seed)

    # Извлекаем hedge_ratios для указанного сценария.
    scenarios = inputs.hedge.hedge_scenarios
    if scenario_name == "no_hedge":
        scenario = scenarios.no_hedge
    elif scenario_name == "conservative":
        scenario = scenarios.conservative
    elif scenario_name == "aggressive":
        scenario = scenarios.aggressive
    else:
        raise ValueError(
            f"Unknown hedge scenario: {scenario_name!r}. "
            f"Expected one of: no_hedge, conservative, aggressive."
        )

    hedge_ratios = {
        "p_and_a": scenario.ratios.p_and_a,
        "cogs": scenario.ratios.cogs,
        "production_capex": scenario.ratios.production_capex,
        "infrastructure_capex": scenario.ratios.infrastructure_capex,
    }

    # Базовый EBITDA (без шоков — не зависит от хеджа)
    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    # Cholesky корреляций
    c = mc.correlations
    corr_mat = [
        [1.0,               c.fx_vs_inflation, c.fx_vs_delay],
        [c.fx_vs_inflation, 1.0,               c.inflation_vs_delay],
        [c.fx_vs_delay,     c.inflation_vs_delay, 1.0],
    ]
    L = _cholesky_3x3(corr_mat)

    fx_mean = mc.distributions.fx_shock_pct.mean or 0.0
    fx_std = mc.distributions.fx_shock_pct.std or 0.0
    infl_mean = mc.distributions.inflation_pct.mean or 0.0
    infl_std = mc.distributions.inflation_pct.std or 0.0
    delay_scale = mc.distributions.release_delay_months.scale or 3.0

    sp = sm.shock_parameters
    fx_lo, fx_hi = sp.fx_clip_lower, sp.fx_clip_upper
    infl_lo, infl_hi = sp.inflation_clip_lower, sp.inflation_clip_upper
    delay_lo, delay_hi = sp.delay_clip_lower, sp.delay_clip_upper

    n_sim = n_simulations if n_simulations is not None else mc.n_simulations

    ebitdas: List[float] = []
    for _ in range(n_sim):
        y_fx, y_infl, y_delay = _correlated_normals(L, rng)
        fx = max(fx_lo, min(fx_hi, fx_mean + fx_std * y_fx))
        infl = max(infl_lo, min(infl_hi, infl_mean + infl_std * y_infl))
        delay_raw = abs(y_delay) * delay_scale
        delay = int(round(max(delay_lo, min(delay_hi, delay_raw))))

        mod = inputs
        if fx != 0.0:
            mod = apply_fx_shock(mod, fx, hedge_ratios=hedge_ratios)
        if infl > 0.0:
            mod = apply_inflation_shock(mod, infl)
        if delay > 0:
            mod = apply_release_delay(mod, delay)

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

    return MonteCarloReport(
        n_simulations=n_sim,
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
        correlations_applied={
            "fx_vs_inflation": c.fx_vs_inflation,
            "fx_vs_delay": c.fx_vs_delay,
            "inflation_vs_delay": c.inflation_vs_delay,
        },
        ebitda_samples=[round(x, 2) for x in sorted_eb],
    )


@dataclass
class BootstrapMonteCarloReport:
    """v1.3.4: отчёт historical block bootstrap MC.

    Отличается от MonteCarloReport тем, что не предполагает нормальности:
    выборки берутся напрямую из исторических пар (r_fx, d_infl).
    """
    method: str
    n_simulations: int
    block_length: int
    n_historical_obs: int
    historical_source: str
    base_ebitda: float
    mean_ebitda: float
    std_ebitda: float
    p5_ebitda: float
    p25_ebitda: float
    p50_ebitda: float
    p75_ebitda: float
    p95_ebitda: float
    var_95_mln_rub: float
    breach_probability: float
    severe_breach_probability: float
    # Расхождение с параметрическим MC (diagnostics)
    parametric_p5_diff: Optional[float] = None
    ebitda_samples: List[float] = field(default_factory=list)


def _load_historical_pairs(csv_path: "Path") -> List[Tuple[float, float]]:
    """v1.3.4: читает historical CSV, возвращает список пар (r_fx_month, d_infl_month).

    Первая строка CSV — header: year,month,fx_rub_usd,inflation_yoy_pct,key_rate_pct
    Возвращает n-1 пар (теряется одна строка из-за первых разностей).
    """
    import csv as _csv
    from pathlib import Path as _Path

    rows: List[dict] = []
    with _Path(csv_path).open(encoding="utf-8") as fh:
        for r in _csv.DictReader(fh):
            rows.append({
                "year": int(r["year"]),
                "month": int(r["month"]),
                "fx": float(r["fx_rub_usd"]),
                "infl": float(r["inflation_yoy_pct"]),
            })
    rows.sort(key=lambda r: (r["year"], r["month"]))

    pairs: List[Tuple[float, float]] = []
    for i in range(1, len(rows)):
        r_fx = math.log(rows[i]["fx"] / rows[i - 1]["fx"])
        d_infl = rows[i]["infl"] - rows[i - 1]["infl"]
        pairs.append((r_fx, d_infl))
    return pairs


def run_monte_carlo_bootstrap(inputs: ValidatedInputs) -> "BootstrapMonteCarloReport":
    """v1.3.4: Historical block bootstrap MC.

    Алгоритм (см. stress_matrix_calibration.md §4):
      1. Загрузить пары (r_fx_month, d_infl_month) из CSV.
      2. Для каждой симуляции:
         a. Случайный стартовый индекс t ∈ [0, n-block_length]
         b. Блок длиной block_length (сохраняет autocorr внутри блока)
         c. Суммировать: fx_sample = Σ r_fx, infl_sample = Σ d_infl × (1/100)
            (Δinfl в pp, shock_pct — в долях, поэтому делим на 100)
         d. Delay — independent half-normal (как в parametric MC)
      3. Применить шоки к модели, посчитать cumulative EBITDA.

    Параметры из inputs.stress_matrix.monte_carlo.bootstrap.
    """
    from pathlib import Path as _Path
    from .core import run_all

    sm = inputs.stress_matrix
    mc = sm.monte_carlo
    if mc.bootstrap is None or not mc.bootstrap.enabled:
        raise ValueError("bootstrap config disabled or missing in stress_matrix.yaml")

    bs = mc.bootstrap
    # CSV путь: относительный к pipeline root. stress_matrix.yaml живёт в inputs/,
    # а CSV — в inputs/historical/. YAML указывает `inputs/historical/...csv`,
    # относительно pipeline root.
    pipeline_root = _Path(__file__).resolve().parent.parent
    csv_path = pipeline_root / bs.historical_csv
    if not csv_path.exists():
        raise FileNotFoundError(f"historical CSV not found: {csv_path}")

    pairs = _load_historical_pairs(csv_path)
    n_hist = len(pairs)
    block_len = bs.block_length
    if n_hist < block_len:
        raise ValueError(f"historical series too short: {n_hist} < block_len={block_len}")

    rng = random.Random(mc.seed + 1)  # seed+1 чтобы отличаться от parametric MC
    base_ebitda = run_all(inputs).models["base"].cumulative_ebitda

    delay_scale = mc.distributions.release_delay_months.scale or 3.0

    # v1.3.6 P2: clip bounds из shock_parameters (ранее hardcoded).
    sp = sm.shock_parameters
    fx_lo, fx_hi = sp.fx_clip_lower, sp.fx_clip_upper
    infl_lo, infl_hi = sp.inflation_clip_lower, sp.inflation_clip_upper
    delay_lo, delay_hi = sp.delay_clip_lower, sp.delay_clip_upper

    ebitdas: List[float] = []

    max_start = n_hist - block_len
    for _ in range(bs.n_simulations):
        # Выбор блока
        start = rng.randint(0, max_start)
        block = pairs[start:start + block_len]

        # Агрегирование блока: сумма log-returns и сумма delta_infl
        fx_sum_log = sum(p[0] for p in block)          # log-return шок за block_len мес
        infl_sum_pp = sum(p[1] for p in block)         # Δ YoY в пп за block_len мес

        # Перевод в shock_pct
        # FX: exp(log-return sum) - 1 → фактический % шок
        fx_shock = math.exp(fx_sum_log) - 1.0
        # Инфляция: Δ YoY в пп / 100 → долевой шок (отклонение от таргета)
        infl_shock = max(0.0, infl_sum_pp / 100.0)

        # Clamp (v1.3.6 из shock_parameters)
        fx_shock = max(fx_lo, min(fx_hi, fx_shock))
        infl_shock = max(infl_lo, min(infl_hi, infl_shock))

        # Delay — independent half-normal (не калибруется)
        delay_raw = abs(rng.gauss(0, 1)) * delay_scale
        delay = int(round(max(delay_lo, min(delay_hi, delay_raw))))

        mod = inputs
        if fx_shock != 0.0:
            mod = apply_fx_shock(mod, fx_shock)
        if infl_shock > 0.0:
            mod = apply_inflation_shock(mod, infl_shock)
        if delay > 0:
            mod = apply_release_delay(mod, delay)

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

    source_str = "ЦБ РФ 2014-2023"
    if mc.historical_calibration:
        source_str = mc.historical_calibration.source_fx.split(",")[0]

    return BootstrapMonteCarloReport(
        method="historical_block_bootstrap",
        n_simulations=bs.n_simulations,
        block_length=block_len,
        n_historical_obs=n_hist,
        historical_source=source_str,
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
        ebitda_samples=[round(x, 2) for x in sorted_eb],
    )


def bootstrap_mc_report_to_dict(report: "BootstrapMonteCarloReport") -> dict:
    d = asdict(report)
    d.pop("ebitda_samples", None)
    return d


def report_to_dict(report: FullMatrixReport) -> dict:
    return {
        "base_ebitda": report.base_ebitda,
        "breach_lower": report.breach_lower,
        "severe_breach": report.severe_breach,
        "n_total": report.n_total,
        "n_breach": report.n_breach,
        "n_severe": report.n_severe,
        "worst_scenario_id": report.worst_scenario_id,
        "worst_ebitda": report.worst_ebitda,
        "scenarios": [asdict(s) for s in report.scenarios],
    }


def mc_report_to_dict(report: MonteCarloReport) -> dict:
    d = asdict(report)
    # Для JSON манифеста не сохраняем 2000 сэмплов — только статистику
    d.pop("ebitda_samples", None)
    return d
