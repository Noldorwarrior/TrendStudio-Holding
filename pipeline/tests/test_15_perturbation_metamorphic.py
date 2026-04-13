"""
tests/test_15_perturbation_metamorphic.py — метаморфические инварианты для
perturbation_analysis (v1.3, зона 1 закрытия жёлтых зон self-reflection).

Идея: если возмущение FX на cogs / production_capex / infrastructure_capex
действительно подчиняется локально-линейной модели

    ΔEBITDA(pt) ≈ -Σ (pt_i × fx_shock × base_i × ε_i)

то при пропорциональном масштабировании коэффициентов pass-through в α раз
|ΔEBITDA| должна расти монотонно и (локально) линейно:

    |ΔEBITDA(α × pt)| ≈ α × |ΔEBITDA(pt)| ± 5%.

Проверяем для α ∈ {0.5, 1.0, 2.0}. Также проверяем знак — при девальвации
ΔEBITDA должна быть отрицательной (растут импортные COGS).

Инварианты:
  I1. Монотонность: |ΔEBITDA(α=0.5)| < |ΔEBITDA(α=1.0)| < |ΔEBITDA(α=2.0)|.
  I2. Линейность: α × |ΔEBITDA(α=1.0)| ≈ |ΔEBITDA(α)| с точностью 5%.
  I3. Знак: все ΔEBITDA < 0 (ослабление рубля → рост затрат).
"""
from __future__ import annotations

import pytest

from generators.perturbation_analysis import _perturb_84b_fx_on_capex
from schemas.fx_pass_through import (
    FxPassThroughCoefficient,
    FxPassThroughCoefficients,
    FxPassThroughFile,
)


def _scale_pass_through(inputs, alpha: float):
    """Возвращает копию inputs с pt коэффициентами × alpha (clamp ≤ 1.0)."""
    current = inputs.fx_pass_through.coefficients

    def _scaled(c: FxPassThroughCoefficient) -> FxPassThroughCoefficient:
        return FxPassThroughCoefficient(
            value=min(1.0, round(c.value * alpha, 6)),
            rationale=c.rationale,
        )

    new_coeffs = FxPassThroughCoefficients(
        p_and_a=_scaled(current.p_and_a),
        cogs=_scaled(current.cogs),
        production_capex=_scaled(current.production_capex),
        infrastructure_capex=_scaled(current.infrastructure_capex),
        valuation=_scaled(current.valuation),
    )
    new_file = FxPassThroughFile(
        coefficients=new_coeffs,
        meta=inputs.fx_pass_through.meta,
    )
    return inputs.model_copy(update={"fx_pass_through": new_file})


@pytest.fixture(scope="module")
def base_ebitda(inputs):
    from generators.core import run_all
    return run_all(inputs).models["base"].cumulative_ebitda


@pytest.fixture(scope="module")
def delta_by_alpha(inputs, base_ebitda):
    """Счётчик ΔEBITDA для α ∈ {0.5, 1.0, 2.0}."""
    result = {}
    for alpha in (0.5, 1.0, 2.0):
        scaled = _scale_pass_through(inputs, alpha)
        pr = _perturb_84b_fx_on_capex(scaled, base_ebitda)
        result[alpha] = pr.delta_ebitda
    return result


def test_sign_negative(delta_by_alpha):
    """I3. При FX+10% все ΔEBITDA должны быть < 0."""
    for alpha, d in delta_by_alpha.items():
        assert d < 0, (
            f"α={alpha}: ΔEBITDA={d} должна быть отрицательной "
            f"(ослабление рубля → рост импортных затрат)"
        )


def test_monotonicity(delta_by_alpha):
    """I1. |ΔEBITDA(α)| должна монотонно расти по α."""
    d05 = abs(delta_by_alpha[0.5])
    d10 = abs(delta_by_alpha[1.0])
    d20 = abs(delta_by_alpha[2.0])
    assert d05 < d10 < d20, (
        f"Монотонность нарушена: |Δ(0.5)|={d05} |Δ(1.0)|={d10} |Δ(2.0)|={d20}"
    )


def test_local_linearity(delta_by_alpha):
    """
    I2. α × |ΔEBITDA(1.0)| ≈ |ΔEBITDA(α)| с точностью 5%.
    """
    d10 = abs(delta_by_alpha[1.0])

    expected_05 = 0.5 * d10
    actual_05 = abs(delta_by_alpha[0.5])
    err_05 = abs(actual_05 - expected_05) / expected_05
    assert err_05 < 0.05, (
        f"Линейность при α=0.5 нарушена: ожидалось ≈{expected_05:.2f}, "
        f"получено {actual_05:.2f} (err={err_05*100:.2f}% > 5%)"
    )

    expected_20 = 2.0 * d10
    actual_20 = abs(delta_by_alpha[2.0])
    err_20 = abs(actual_20 - expected_20) / expected_20
    assert err_20 < 0.05, (
        f"Линейность при α=2.0 нарушена: ожидалось ≈{expected_20:.2f}, "
        f"получено {actual_20:.2f} (err={err_20*100:.2f}% > 5%)"
    )


def test_zero_pass_through_gives_zero_delta(inputs, base_ebitda):
    """
    I4 (дополнительно). При pt=0 по всем статьям ΔEBITDA должна быть ≈ 0
    (в пределах численной ошибки). Это sanity-check — если даже при полном
    отсутствии pass-through модель показывает ненулевой эффект, значит
    в расчёте есть посторонний источник изменений.
    """
    scaled = _scale_pass_through(inputs, 0.0)
    pr = _perturb_84b_fx_on_capex(scaled, base_ebitda)
    assert abs(pr.delta_ebitda) < 0.5, (
        f"При pt=0 ожидали ΔEBITDA≈0, получено {pr.delta_ebitda}"
    )
