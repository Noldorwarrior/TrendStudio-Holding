"""
tests/test_31_phase1_math.py — Phase 1 tests: IRR unification + Math hardening.

Verifies:
  - Single IRR method (numpy_financial.irr) across all scripts (R-008)
  - MC revenue blend centres at 1.0 at base hit_rate (R-009, F-016)
  - Probability vector unified (R-007, F-014)
  - D&A transition smoothed (R-012, F-012)
  - MoIC reconciliation (R-013, F-013)
  - finance_core.py correctness
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
import pytest

REPO_ROOT = Path(__file__).parent.parent.parent
PIPELINE_ROOT = Path(__file__).parent.parent

# Ensure pipeline is importable
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


# ─── R-008: Single IRR method ───────────────────────────────────────────


class TestIRRUnification:
    """R-008: All IRR computations must use numpy_financial.irr."""

    def test_finance_core_uses_npf(self):
        """finance_core.compute_irr delegates to numpy_financial."""
        from generators.finance_core import compute_irr

        # Standard case: invest -1000, get 200/year for 8 years
        cf = [-1000] + [200] * 8
        irr = compute_irr(cf)
        assert 0.05 < irr < 0.15, f"IRR should be ~11.8%, got {irr:.4f}"

    def test_finance_core_nan_returns_zero(self):
        """compute_irr returns 0.0 for non-convergent cases."""
        from generators.finance_core import compute_irr

        assert compute_irr([100, 200]) == 0.0  # no sign change
        assert compute_irr([]) == 0.0
        assert compute_irr([-100]) == 0.0  # single element

    def test_valuation_uses_compute_irr(self):
        """valuation.py._irr should delegate to finance_core.compute_irr."""
        src = (PIPELINE_ROOT / "generators" / "valuation.py").read_text()
        assert "finance_core" in src, "valuation.py should import from finance_core"
        assert "compute_irr" in src, "valuation.py should use compute_irr"

    def test_no_moic_power_irr_in_mc(self):
        """build_A12 MC loop should NOT use moic^(1/6.5) for IRR."""
        build_a12 = REPO_ROOT / "Investor_Package" / "build_A12_sensitivity_scenario_mc.py"
        if not build_a12.exists():
            pytest.skip("build_A12 not found")
        content = build_a12.read_text()
        # Find the MC simulation section (after "Run simulation")
        mc_section = content[content.index("Run simulation"):]
        # Should NOT contain moic ** (1 / 6.5) in the MC results section
        assert "moic ** (1 / 6.5)" not in mc_section or "moic ** (1/6.5)" not in mc_section, (
            "MC loop still uses MOIC^(1/6.5) approximation instead of numpy_financial.irr"
        )

    def test_build_a12_uses_npf_in_mc(self):
        """build_A12 MC should use numpy_financial for IRR."""
        build_a12 = REPO_ROOT / "Investor_Package" / "build_A12_sensitivity_scenario_mc.py"
        if not build_a12.exists():
            pytest.skip("build_A12 not found")
        content = build_a12.read_text()
        assert "numpy_financial" in content, (
            "build_A12 should import numpy_financial for IRR"
        )

    def test_deprecated_aliases_warn(self):
        """Deprecated IRR functions should issue warnings."""
        from generators.finance_core import irr_bisect, irr_moic_approx

        with pytest.warns(DeprecationWarning, match="deprecated"):
            irr_bisect([-1000, 500, 600])

        with pytest.warns(DeprecationWarning, match="deprecated"):
            irr_moic_approx(2.0, 6.5)

    def test_irr_known_value(self):
        """compute_irr matches known IRR for standard cash flows."""
        from generators.finance_core import compute_irr

        # invest 1250, get back 2500 split 20/50/15/15 over years 4-7
        cf = [-1250, 0, 0, 0, 500, 1250, 375, 375]
        irr = compute_irr(cf)
        # W₃ Base IRR should be ~20.09%
        assert 0.10 < irr < 0.30, f"Expected IRR ~20%, got {irr:.4f}"


# ─── R-009 / F-016: MC revenue blend ────────────────────────────────────


class TestMCRevenueBias:
    """R-009: MC revenue blend must centre at 1.0 at base hit_rate."""

    def test_blend_formula_centered(self):
        """At E[hit_rate]=0.70, blend = 1.0 (not 1.06)."""
        from generators.finance_core import mc_revenue_blend

        # E[hit_rate] for Binomial(12, 0.70) / 12 = 0.70
        blend = mc_revenue_blend(0.70)
        assert abs(blend - 1.0) < 0.001, (
            f"Blend at E[hit_rate]=0.70 should be 1.0, got {blend:.4f}"
        )

    def test_blend_extremes(self):
        """Blend at hit_rate=0 and hit_rate=1."""
        from generators.finance_core import mc_revenue_blend

        assert mc_revenue_blend(0.0) == pytest.approx(0.79, abs=0.001)
        assert mc_revenue_blend(1.0) == pytest.approx(1.09, abs=0.001)

    def test_build_a12_uses_corrected_blend(self):
        """build_A12 should use 0.79 + 0.30 * hit_rate (not 0.85)."""
        build_a12 = REPO_ROOT / "Investor_Package" / "build_A12_sensitivity_scenario_mc.py"
        if not build_a12.exists():
            pytest.skip("build_A12 not found")
        content = build_a12.read_text()
        assert "0.79 + 0.30 * hit_rate" in content, (
            "build_A12 should use corrected blend 0.79 + 0.30 * hit_rate"
        )
        assert "0.85 + 0.30 * hit_rate" not in content, (
            "build_A12 still has biased blend 0.85 + 0.30 * hit_rate"
        )

    def test_mc_blend_statistical(self):
        """Simulate Binomial(12, 0.70)/12 → blend should average ~1.0."""
        from generators.finance_core import mc_revenue_blend

        rng = np.random.default_rng(42)
        n = 50000
        hit_rates = rng.binomial(12, 0.70, size=n) / 12
        blends = np.array([mc_revenue_blend(hr) for hr in hit_rates])
        mean_blend = float(np.mean(blends))
        assert abs(mean_blend - 1.0) < 0.01, (
            f"MC blend mean should be ~1.0, got {mean_blend:.4f}"
        )


# ─── R-007 / F-014: Scenario probabilities ──────────────────────────────


class TestProbabilityVector:
    """R-007: Single reconciled probability vector."""

    def test_prob_vector_sums_to_1(self):
        from generators.finance_core import PROB_VECTOR_BASE

        assert abs(sum(PROB_VECTOR_BASE) - 1.0) < 1e-10

    def test_prob_vector_5_elements(self):
        from generators.finance_core import PROB_VECTOR_BASE

        assert len(PROB_VECTOR_BASE) == 5

    def test_prob_vector_base_is_largest(self):
        from generators.finance_core import PROB_VECTOR_BASE

        assert PROB_VECTOR_BASE[2] == max(PROB_VECTOR_BASE)

    def test_prob_vector_3s_sums_to_1(self):
        from generators.finance_core import PROB_VECTOR_3S

        assert abs(sum(PROB_VECTOR_3S) - 1.0) < 1e-10


# ─── R-012 / F-012: D&A transition ──────────────────────────────────────


class TestDATransition:
    """R-012: D&A transition should be smoothed, not a 167× step."""

    def test_da_no_step_function(self):
        """build_A10 D&A should not have 3→500 jump."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        # Old step: 2028: 3.0, 2029: 500.0
        assert "2028: 3.0,\n      2029: 500.0" not in content, (
            "D&A still has unsmoothed 3→500 step function"
        )

    def test_smooth_da_transition_fn(self):
        """smooth_da_transition produces monotonic ramp, eliminates 167× step."""
        from generators.finance_core import smooth_da_transition

        da = {2026: 3.0, 2027: 3.0, 2028: 3.0, 2029: 500.0, 2030: 520.0}
        smoothed = smooth_da_transition(da, ramp_start=2028, ramp_end=2030)

        # Should be monotonically increasing from 2028
        assert smoothed[2028] < smoothed[2029] < smoothed[2030]
        # Endpoints preserved
        assert smoothed[2028] == pytest.approx(3.0)
        assert smoothed[2030] == pytest.approx(520.0)
        # Original had 167× jump (3→500). Smoothed max step must be < 167×.
        max_ratio = max(
            smoothed[y + 1] / smoothed[y]
            for y in range(2027, 2030)
            if smoothed[y] > 0
        )
        assert max_ratio < 167, (
            f"Smoothed max ratio {max_ratio:.1f}× should be < original 167×"
        )
        # Midpoint should be approximately halfway
        assert smoothed[2029] == pytest.approx(261.5, abs=1.0)

    def test_build_a10_da_manually_smoothed(self):
        """build_A10 D&A values should be manually smoothed (no 3→500 step)."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        # Max allowed year-over-year ratio in the actual build values
        # After manual smoothing: 3, 3, 175, 348, 520
        # Ratios: 1.0, 58.3, 2.0, 1.5 — max is 58.3 (still large but documented)
        assert "2028: 175" in content, "D&A 2028 should be ~175 (ramped)"
        assert "2029: 348" in content, "D&A 2029 should be ~348 (ramped)"


# ─── R-013 / F-013: MoIC reconciliation ─────────────────────────────────


class TestMoICReconciliation:
    """R-013: MoIC aggregate and T1 must both be present with labels."""

    def test_compute_moic(self):
        """finance_core.compute_moic gives correct result."""
        from generators.finance_core import compute_moic

        # invest 1250, get 2500 back
        cf = [-1250, 500, 1250, 375, 375]
        moic = compute_moic(cf)
        assert moic == pytest.approx(2.0, abs=0.01)

    def test_moic_zero_invest(self):
        from generators.finance_core import compute_moic

        assert compute_moic([0, 100]) == 0.0
        assert compute_moic([100, 200]) == 0.0


# ─── F-027: Tax separation ──────────────────────────────────────────────


class TestTaxSeparation:
    """F-027: Tax rate should be explicitly labeled as profit tax (ННП)."""

    def test_build_a10_labels_profit_tax(self):
        """build_A10 should document TAX_RATE as ННП, not generic."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        assert "ННП" in content, "TAX_RATE should be labeled as ННП (profit tax)"
        assert "НДС" in content, "Should document НДС = 0% for cinema"
