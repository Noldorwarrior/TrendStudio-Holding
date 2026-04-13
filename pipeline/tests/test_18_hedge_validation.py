"""
tests/test_18_hedge_validation.py — Ж4 валидация эффективности FX-хеджа
(v1.3.6 Tier D P4).

Закрытие жёлтой зоны №4 в audit v1.3.5: в предыдущих версиях хедж
упоминался только как текстовая рекомендация. Здесь вводится явная
hedge-логика + метаморфический тест (механизм верификации №23):
при включении хедж-сценария разброс cumulative EBITDA в Monte Carlo
должен монотонно снижаться.

Инварианты:
  H1. no_hedge должен давать ТОТ ЖЕ результат, что run_monte_carlo()
      без hedge_ratios (идентичный std, mean, квантили).
  H2. conservative должен снизить std EBITDA минимум на 5% относительно
      no_hedge (уменьшение волатильности за счёт хеджа CAPEX).
  H3. aggressive должен снизить std EBITDA минимум на 15% относительно
      no_hedge (максимальное покрытие).
  H4. Монотонность: std(no_hedge) > std(conservative) > std(aggressive).
  H5. Base EBITDA (без шоков) не зависит от hedge-сценария.
  H6. Все три сценария валидно загружены из hedge.yaml.
  H7. hedge_ratio для valuation всегда = 0 (нефизическая статья).

Используется уменьшенное n_simulations=300 для скорости, но random seed
зафиксирован → результаты детерминированы.
"""
from __future__ import annotations

import pytest

from generators.combined_stress_tests import (
    apply_fx_shock,
    run_monte_carlo,
    run_monte_carlo_hedged,
)


N_SIM_FAST = 300  # для ускорения теста; seed фиксирован в stress_matrix.yaml


# ──────────────────────────────────────────────────────────────────────────
# Session fixtures
# ──────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def mc_no_hedge(inputs):
    """MC с hedge-сценарием no_hedge (должен совпасть с run_monte_carlo)."""
    return run_monte_carlo_hedged(inputs, "no_hedge", n_simulations=N_SIM_FAST)


@pytest.fixture(scope="module")
def mc_conservative(inputs):
    return run_monte_carlo_hedged(inputs, "conservative", n_simulations=N_SIM_FAST)


@pytest.fixture(scope="module")
def mc_aggressive(inputs):
    return run_monte_carlo_hedged(inputs, "aggressive", n_simulations=N_SIM_FAST)


# ──────────────────────────────────────────────────────────────────────────
# H1. no_hedge ≈ базовый MC
# ──────────────────────────────────────────────────────────────────────────

def test_H1_no_hedge_matches_unhedged_mc(inputs):
    """no_hedge hedge scenario должен давать такой же std/mean, как
    run_monte_carlo() без hedge_ratios (метаморфический инвариант)."""
    mc_unhedged = run_monte_carlo(inputs)
    mc_nh = run_monte_carlo_hedged(inputs, "no_hedge", n_simulations=mc_unhedged.n_simulations)
    # Random seed одинаковый → результаты идентичны
    assert abs(mc_nh.mean_ebitda - mc_unhedged.mean_ebitda) < 0.01, (
        f"no_hedge mean differs: {mc_nh.mean_ebitda} vs {mc_unhedged.mean_ebitda}"
    )
    assert abs(mc_nh.std_ebitda - mc_unhedged.std_ebitda) < 0.01, (
        f"no_hedge std differs: {mc_nh.std_ebitda} vs {mc_unhedged.std_ebitda}"
    )


# ──────────────────────────────────────────────────────────────────────────
# H2-H3. Hedge снижает дисперсию
# ──────────────────────────────────────────────────────────────────────────

def test_H2_conservative_reduces_std_by_5pct(mc_no_hedge, mc_conservative):
    """Consecutive сценарий: std снижается минимум на 5%."""
    std_nh = mc_no_hedge.std_ebitda
    std_c = mc_conservative.std_ebitda
    reduction_pct = (std_nh - std_c) / std_nh * 100
    assert reduction_pct >= 5.0, (
        f"conservative std reduction {reduction_pct:.1f}% < 5% "
        f"(std_no_hedge={std_nh}, std_conservative={std_c})"
    )


def test_H3_aggressive_reduces_std_by_15pct(mc_no_hedge, mc_aggressive):
    """Aggressive сценарий: std снижается минимум на 15%."""
    std_nh = mc_no_hedge.std_ebitda
    std_a = mc_aggressive.std_ebitda
    reduction_pct = (std_nh - std_a) / std_nh * 100
    assert reduction_pct >= 15.0, (
        f"aggressive std reduction {reduction_pct:.1f}% < 15% "
        f"(std_no_hedge={std_nh}, std_aggressive={std_a})"
    )


# ──────────────────────────────────────────────────────────────────────────
# H4. Монотонность
# ──────────────────────────────────────────────────────────────────────────

def test_H4_monotone_std_no_hedge_gt_conservative_gt_aggressive(
    mc_no_hedge, mc_conservative, mc_aggressive
):
    """Монотонное снижение std: no_hedge > conservative > aggressive."""
    assert mc_no_hedge.std_ebitda > mc_conservative.std_ebitda, (
        f"std(no_hedge)={mc_no_hedge.std_ebitda} !> std(conservative)={mc_conservative.std_ebitda}"
    )
    assert mc_conservative.std_ebitda > mc_aggressive.std_ebitda, (
        f"std(conservative)={mc_conservative.std_ebitda} !> std(aggressive)={mc_aggressive.std_ebitda}"
    )


# ──────────────────────────────────────────────────────────────────────────
# H5. Базовый EBITDA не зависит от хеджа
# ──────────────────────────────────────────────────────────────────────────

def test_H5_base_ebitda_invariant_to_hedge_scenario(
    mc_no_hedge, mc_conservative, mc_aggressive
):
    """Базовый EBITDA (без шоков FX) не должен зависеть от хеджа:
    все три сценария должны показывать идентичный base_ebitda."""
    assert abs(mc_no_hedge.base_ebitda - mc_conservative.base_ebitda) < 0.01
    assert abs(mc_no_hedge.base_ebitda - mc_aggressive.base_ebitda) < 0.01
    # И в пределах anchor-инварианта
    assert 2970 <= mc_no_hedge.base_ebitda <= 3030, (
        f"anchor breach: {mc_no_hedge.base_ebitda}"
    )


# ──────────────────────────────────────────────────────────────────────────
# H6. hedge.yaml загружается и содержит 3 сценария
# ──────────────────────────────────────────────────────────────────────────

def test_H6_hedge_scenarios_loaded_from_yaml(inputs):
    """Inputs.hedge.hedge_scenarios содержит все 3 предопределённых сценария."""
    scenarios = inputs.hedge.hedge_scenarios
    assert scenarios.no_hedge.ratios.production_capex == 0.0
    assert scenarios.conservative.ratios.production_capex == 0.5
    assert scenarios.aggressive.ratios.production_capex == 0.7
    # Valuation hedge всегда 0
    assert scenarios.no_hedge.ratios.valuation == 0.0
    assert scenarios.conservative.ratios.valuation == 0.0
    assert scenarios.aggressive.ratios.valuation == 0.0


# ──────────────────────────────────────────────────────────────────────────
# H7. hedge_ratio для valuation = 0
# ──────────────────────────────────────────────────────────────────────────

def test_H7_valuation_hedge_ratio_always_zero(inputs):
    """Valuation — нефизический параметр, хедж всегда 0."""
    assert inputs.hedge.coefficients.valuation.hedge_ratio == 0.0


# ──────────────────────────────────────────────────────────────────────────
# H8. apply_fx_shock с hedge_ratios уменьшает эффективный шок
# ──────────────────────────────────────────────────────────────────────────

def test_H8_apply_fx_shock_with_hedge_reduces_impact(inputs):
    """Прямая проверка apply_fx_shock(fx=+20%, hedge_ratios={...}):
    при 100% хедже CAPEX шок на infrastructure_capex должен быть нулевым."""
    full_hedge = {
        "p_and_a": 1.0,
        "cogs": 1.0,
        "production_capex": 1.0,
        "infrastructure_capex": 1.0,
    }
    shocked_nohedge = apply_fx_shock(inputs, 0.20)  # +20% FX без хеджа
    shocked_fullhedge = apply_fx_shock(inputs, 0.20, hedge_ratios=full_hedge)

    # Infrastructure CAPEX: без хеджа должен вырасти, с 100% хеджем — остаться
    infra_orig = sum(r.base for r in inputs.capex.infrastructure_capex_mln_rub)
    infra_nh = sum(r.base for r in shocked_nohedge.capex.infrastructure_capex_mln_rub)
    infra_fh = sum(r.base for r in shocked_fullhedge.capex.infrastructure_capex_mln_rub)

    assert infra_nh > infra_orig * 1.05, (
        f"infrastructure_capex без хеджа не выросло: {infra_orig} → {infra_nh}"
    )
    assert abs(infra_fh - infra_orig) < 0.01, (
        f"infrastructure_capex при 100% хедже должно остаться прежним: "
        f"{infra_orig} → {infra_fh}"
    )


# ──────────────────────────────────────────────────────────────────────────
# H9. Unknown hedge scenario → ValueError
# ──────────────────────────────────────────────────────────────────────────

def test_H9_unknown_hedge_scenario_raises(inputs):
    """Передача несуществующего имени сценария → ValueError."""
    with pytest.raises(ValueError, match="Unknown hedge scenario"):
        run_monte_carlo_hedged(inputs, "magic_scenario", n_simulations=50)
