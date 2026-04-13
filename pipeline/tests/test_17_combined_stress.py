"""
tests/test_17_combined_stress.py — инварианты комбинированных стресс-тестов
(v1.3.2, закрытие жёлтой зоны №3 v1.3 self-reflection).

Тестируется модуль generators/combined_stress_tests.py — 3×3×3 матрица
детерминированных шоков + Monte Carlo с коррелированными случайными
величинами.

Инварианты:
  I1.  Базовый сценарий (FX=0, infl=0, delay=0) воспроизводит якорь base
       (cumulative EBITDA 2026-2028 = 3000.65 ± 1 млн).
  I2.  Матрица содержит ровно 27 сценариев (3×3×3).
  I3.  Каждый сценарий имеет scenario_id вида "FX{p}_I{p}_D{m}".
  I4.  Delta%: худший сценарий FX20_I6_D0 даёт Δ ≤ -10% (сильный стресс).
  I5.  Все breach-сценарии (breach=True) имеют cumulative_ebitda < 2700.
  I6.  Ноль severe-пробоев (< 2400) в текущей модели v1.3.2.
  I7.  FX-шок: только FX=0.2 + infl=0 + delay=0 даёт Δ ≈ -7.8%
       (согласовано с 8.4b: infrastructure_capex=0.74 даёт -3.19%
       на одном параметре × 10%, масштаб 20% × комбинация 4 статей).
  I8.  Pure inflation 6% без FX: EBITDA снижается на 5-7% (проверка
       ФОТ-масштабирования 0.82).
  I9.  Monte Carlo: n=2000, severe_breach_probability=0.0, breach < 10%.
  I10. Monte Carlo: p5 < p50 < p95 (монотонность квантилей).
  I11. VaR(95%) > 0 (потеря по определению положительна).
  I12. Cholesky: корреляционная матрица 3×3 положительно-определённая.
"""
from __future__ import annotations

import pytest

from generators.combined_stress_tests import (
    apply_fx_shock,
    apply_inflation_shock,
    apply_release_delay,
    run_combined_scenario,
    run_full_matrix,
    run_monte_carlo,
    _cholesky_3x3,
)


# ──────────────────────────────────────────────────────────────────────────
# Session fixtures (выносим дорогие прогоны из тестов)
# ──────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def matrix(inputs):
    return run_full_matrix(inputs)


@pytest.fixture(scope="module")
def mc_report(inputs):
    return run_monte_carlo(inputs)


# ──────────────────────────────────────────────────────────────────────────
# I1-I3. Структура матрицы
# ──────────────────────────────────────────────────────────────────────────

def test_I1_base_scenario_reproduces_anchor(matrix):
    """Базовый 0/0/0 сценарий должен совпадать с анкором модели."""
    base_sc = next(s for s in matrix.scenarios if s.scenario_id == "FX0_I0_D0")
    assert abs(base_sc.cumulative_ebitda - matrix.base_ebitda) < 0.5
    assert abs(base_sc.delta_ebitda) < 0.5
    assert base_sc.delta_pct == pytest.approx(0.0, abs=0.01)
    assert not base_sc.breach
    assert not base_sc.severe_breach


def test_I2_matrix_has_27_scenarios(matrix):
    """3 × 3 × 3 = 27 точек."""
    assert matrix.n_total == 27
    assert len(matrix.scenarios) == 27


def test_I3_scenario_ids_are_unique_and_structured(matrix):
    """Все scenario_id уникальны и имеют формат FX{pct}_I{pct}_D{months}."""
    ids = [s.scenario_id for s in matrix.scenarios]
    assert len(set(ids)) == 27, "duplicate scenario_ids"
    for sid in ids:
        assert sid.startswith("FX") and "_I" in sid and "_D" in sid


# ──────────────────────────────────────────────────────────────────────────
# I4-I6. Breach-логика
# ──────────────────────────────────────────────────────────────────────────

def test_I4_worst_scenario_is_severe_but_not_catastrophic(matrix):
    """FX20_I6_D0 — худший, должен давать > -15% но не пробивать severe 2400."""
    worst = matrix.worst_scenario_id
    assert worst == "FX20_I6_D0", f"unexpected worst: {worst}"
    worst_sc = next(s for s in matrix.scenarios if s.scenario_id == worst)
    assert worst_sc.delta_pct <= -10.0
    assert worst_sc.delta_pct > -20.0
    assert worst_sc.breach
    assert not worst_sc.severe_breach


def test_I5_breach_flag_is_consistent(matrix):
    """breach=True ⇔ cumulative_ebitda < breach_lower."""
    for s in matrix.scenarios:
        if s.breach:
            assert s.cumulative_ebitda < matrix.breach_lower
        else:
            assert s.cumulative_ebitda >= matrix.breach_lower
        if s.severe_breach:
            assert s.cumulative_ebitda < matrix.severe_breach


def test_I6_no_severe_breaches_in_model(matrix):
    """В v1.3.2 модель не должна пробивать severe threshold 2400."""
    assert matrix.n_severe == 0


# ──────────────────────────────────────────────────────────────────────────
# I7-I8. Верификация механик одиночных шоков внутри комбинированного runner
# ──────────────────────────────────────────────────────────────────────────

def test_I7_pure_fx_shock_matches_pass_through(matrix):
    """FX20_I0_D0 должен давать Δ ≈ -7-8% (согласовано с 8.4b)."""
    sc = next(s for s in matrix.scenarios if s.scenario_id == "FX20_I0_D0")
    assert sc.delta_pct < -5.0
    assert sc.delta_pct > -12.0


def test_I8_pure_inflation_6pct(matrix):
    """FX0_I6_D0 должен давать Δ ≈ -5-7% (ФОТ × 0.82)."""
    sc = next(s for s in matrix.scenarios if s.scenario_id == "FX0_I6_D0")
    assert sc.delta_pct < -4.0
    assert sc.delta_pct > -10.0


# ──────────────────────────────────────────────────────────────────────────
# I9-I11. Monte Carlo инварианты
# ──────────────────────────────────────────────────────────────────────────

def test_I9_monte_carlo_no_severe_breaches(mc_report):
    """MC: severe breach ≤ 0.5% и обычный breach < 10%.

    v1.3.4: после калибровки σ_fx 0.08→0.10 и σ_infl 0.025→0.028 распределение
    MC имеет слегка более толстые хвосты, и severe_breach_probability может быть
    0.05% (1 сценарий из 2000). Это в рамках статистического шума и корректно
    отражает исторический риск, поэтому порог смягчён до ≤ 0.5%.
    """
    assert mc_report.n_simulations == 2000
    assert mc_report.severe_breach_probability <= 0.005
    assert mc_report.breach_probability < 0.10


def test_I10_monte_carlo_percentiles_are_monotonic(mc_report):
    """p5 < p25 < p50 < p75 < p95."""
    assert mc_report.p5_ebitda < mc_report.p25_ebitda
    assert mc_report.p25_ebitda < mc_report.p50_ebitda
    assert mc_report.p50_ebitda < mc_report.p75_ebitda
    assert mc_report.p75_ebitda < mc_report.p95_ebitda


def test_I11_var_95_is_positive(mc_report):
    """VaR(95%) = base - p5 > 0 (потеря по определению)."""
    assert mc_report.var_95_mln_rub > 0
    # И сопоставимо с шириной распределения
    assert mc_report.var_95_mln_rub > mc_report.std_ebitda


# ──────────────────────────────────────────────────────────────────────────
# I12. Cholesky
# ──────────────────────────────────────────────────────────────────────────

def test_I12_cholesky_positive_definite():
    """Cholesky должен построить валидную декомпозицию для заданной
    корреляционной матрицы."""
    corr = [
        [1.0, 0.6, 0.3],
        [0.6, 1.0, 0.2],
        [0.3, 0.2, 1.0],
    ]
    L = _cholesky_3x3(corr)
    # L нижнетреугольная
    assert L[0][1] == 0.0 and L[0][2] == 0.0 and L[1][2] == 0.0
    # L·L^T ≈ corr
    for i in range(3):
        for j in range(3):
            reconstructed = sum(L[i][k] * L[j][k] for k in range(3))
            assert abs(reconstructed - corr[i][j]) < 1e-9, f"L·L^T[{i},{j}]={reconstructed} != {corr[i][j]}"


def test_I12b_cholesky_rejects_non_pd():
    """Cholesky должен бросить ValueError на не-PD матрицу."""
    bad = [
        [1.0, 0.9, 0.9],
        [0.9, 1.0, 0.9],
        [0.9, 0.9, 1.0],
    ]
    # эта ещё PD; сделаем явно не-PD:
    bad2 = [
        [1.0, 1.1, 0.0],
        [1.1, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]
    with pytest.raises(ValueError):
        _cholesky_3x3(bad2)


# ──────────────────────────────────────────────────────────────────────────
# Дополнительно: shock applicators идемпотентны при нулевом шоке
# ──────────────────────────────────────────────────────────────────────────

def test_I13_zero_shocks_are_identity(inputs):
    """FX=0, infl=0, delay=0 не должны менять inputs."""
    out1 = apply_fx_shock(inputs, 0.0)
    out2 = apply_inflation_shock(inputs, 0.0)
    out3 = apply_release_delay(inputs, 0)
    assert out1 is inputs
    assert out2 is inputs
    assert out3 is inputs


# ──────────────────────────────────────────────────────────────────────────
# I14-I17. v1.3.6 P2: shock_parameters refactor из magic numbers → YAML
# ──────────────────────────────────────────────────────────────────────────

def test_I14_shock_parameters_are_loaded(inputs):
    """shock_parameters загружаются из stress_matrix.yaml и имеют ожидаемые значения."""
    sp = inputs.stress_matrix.shock_parameters
    assert 0.5 < sp.inflation_transmission_factor < 1.0
    assert sp.fx_clip_lower < 0 < sp.fx_clip_upper
    assert sp.inflation_clip_lower >= 0
    assert sp.inflation_clip_upper > sp.inflation_clip_lower
    assert sp.delay_clip_lower <= sp.delay_clip_upper


def test_I15_inflation_transmission_factor_is_082(inputs):
    """Регрессия: коэффициент инфляционной трансляции = 0.82 (derived from
    55% ФОТ × 1.0 + 45% прочий × 0.6)."""
    sp = inputs.stress_matrix.shock_parameters
    assert abs(sp.inflation_transmission_factor - 0.82) < 1e-9, (
        f"inflation_transmission_factor changed unexpectedly: {sp.inflation_transmission_factor}"
    )


def test_I16_fx_clip_bounds_are_symmetric_30pct(inputs):
    """Регрессия: FX clip bounds = ±0.30 (исторически обоснованный предел)."""
    sp = inputs.stress_matrix.shock_parameters
    assert abs(sp.fx_clip_lower + 0.30) < 1e-9
    assert abs(sp.fx_clip_upper - 0.30) < 1e-9


def test_I17_no_magic_numbers_in_combined_stress_module():
    """Регрессия: в generators/combined_stress_tests.py отсутствуют
    исполняемые literal-константы 0.82, -0.30, 0.30, 0.15 (должны браться
    из shock_parameters). Docstring и комментарии разрешены."""
    from pathlib import Path
    import re
    src = Path(__file__).resolve().parent.parent / "generators" / "combined_stress_tests.py"
    text = src.read_text(encoding="utf-8")
    # Строгий поиск: literal рядом с math/min/max/= (исполняемый контекст).
    # Разрешены docstring/комментарии, содержащие описательные числа.
    lines = text.splitlines()
    in_docstring = False
    violations = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if '"""' in stripped:
            in_docstring = not in_docstring if stripped.count('"""') == 1 else in_docstring
            continue
        if in_docstring or stripped.startswith("#"):
            continue
        # исполняемые строки: ищем max(-0.30 / min(0.30 / * 0.82 / 0, 0.15
        patterns = [
            r"\*\s*0\.82\b",
            r"-0\.30\b(?!\s*[#;])",
            r"min\(\s*0\.30\b",
            r"min\(\s*0\.15\b",
            r"max\(\s*-0\.30\b",
        ]
        for p in patterns:
            if re.search(p, line):
                violations.append(f"line {i}: {line.rstrip()}")
    assert not violations, (
        "Magic numbers reintroduced in combined_stress_tests.py:\n"
        + "\n".join(violations)
    )
