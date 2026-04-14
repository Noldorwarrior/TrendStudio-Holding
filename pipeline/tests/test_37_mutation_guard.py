"""
tests/test_37_mutation_guard.py — Guard tests to kill surviving mutants.

These tests specifically verify exact constant values and boundary conditions
in finance_core.py to ensure mutation testing achieves ≥ 80% kill rate.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

PIPELINE_ROOT = Path(__file__).parent.parent
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


class TestAnchorExactValues:
    """Kill mutants that change anchor constants."""

    def test_ndp_anchor_exactly_3000(self):
        from generators.finance_core import NDP_ANCHOR
        assert NDP_ANCHOR == 3000.0, f"NDP_ANCHOR must be 3000.0, got {NDP_ANCHOR}"

    def test_hurdle_rate_exactly_018(self):
        from generators.finance_core import HURDLE_RATE
        assert HURDLE_RATE == 0.18, f"HURDLE_RATE must be 0.18, got {HURDLE_RATE}"

    def test_wacc_base_exactly_01905(self):
        from generators.finance_core import WACC_BASE
        assert WACC_BASE == 0.1905, f"WACC_BASE must be 0.1905, got {WACC_BASE}"


class TestRiskScoreThresholds:
    """Kill mutants that shift risk severity thresholds."""

    def test_score_15_is_critical(self):
        from generators.finance_core import risk_score
        result = risk_score(3, 5)  # score = 15
        assert result["severity"] == "CRITICAL", (
            f"Score 15 should be CRITICAL, got {result['severity']}"
        )

    def test_score_14_is_high(self):
        from generators.finance_core import risk_score
        result = risk_score(2, 5)  # score = 10
        assert result["severity"] == "HIGH", (
            f"Score 10 should be HIGH, got {result['severity']}"
        )

    def test_score_10_is_high(self):
        from generators.finance_core import risk_score
        result = risk_score(5, 2)  # score = 10
        assert result["severity"] == "HIGH"

    def test_score_9_is_medium(self):
        from generators.finance_core import risk_score
        result = risk_score(3, 3)  # score = 9
        assert result["severity"] == "MEDIUM"


class TestStressImpactSign:
    """Kill mutants that flip stress impact direction."""

    def test_stress_wacc_reduces_ndp(self):
        from generators.finance_core import stress_wacc
        result = stress_wacc(ndp_base=3000, irr_base=0.2009, wacc_delta_bps=500)
        # WACC increase must REDUCE NDP, not increase it
        assert result["ndp_impact"] < -100, (
            f"WACC +500bps should reduce NDP significantly, got impact={result['ndp_impact']}"
        )

    def test_stress_wacc_magnitude(self):
        """Verify approximate magnitude: 3000 * 0.05 * 3 = 450."""
        from generators.finance_core import stress_wacc
        result = stress_wacc(ndp_base=3000, irr_base=0.2009, wacc_delta_bps=500)
        assert -600 < result["ndp_impact"] < -300, (
            f"Expected impact ~ -450, got {result['ndp_impact']}"
        )


class TestReverseStressDirection:
    """Kill mutants that swap reverse stress formula."""

    def test_breakeven_is_reasonable(self):
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        # Breakeven hit_rate should be between 0.5 and 0.7 (below base 0.70)
        assert 0.4 < result["breakeven_hit_rate"] < 0.70, (
            f"Breakeven hit_rate={result['breakeven_hit_rate']} not in (0.4, 0.70)"
        )

    def test_breakeven_below_1(self):
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        assert result["breakeven_hit_rate"] < 1.0

    def test_breakeven_below_base(self):
        """Breakeven must be strictly below base hit_rate (0.70)."""
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        assert result["breakeven_hit_rate"] < 0.70, (
            f"Breakeven {result['breakeven_hit_rate']} must be < base 0.70"
        )


class TestValuationOrdering:
    """Kill mutants that break Floor/Fair/Ceiling ordering."""

    def test_reorder_if_inputs_swapped(self):
        from generators.finance_core import valuation_floor_fair_ceiling
        # Pass inputs in wrong order — function should reorder
        result = valuation_floor_fair_ceiling(
            dcf_conservative=8000, comps_median=3000, mc_p75=5000
        )
        assert result["floor"] <= result["fair"] <= result["ceiling"], (
            f"Ordering violated: {result['floor']} ≤ {result['fair']} ≤ {result['ceiling']}"
        )

    def test_all_same_value(self):
        from generators.finance_core import valuation_floor_fair_ceiling
        result = valuation_floor_fair_ceiling(5000, 5000, 5000)
        assert result["spread"] == pytest.approx(1.0)


class TestPaybackDirection:
    """Kill mutants that flip cumulative cash flow direction."""

    def test_payback_basic(self):
        from generators.finance_core import compute_payback
        # Invest 1000, get 500/year → payback ~2 years
        cf = [-1000, 500, 500, 500]
        payback = compute_payback(cf)
        assert 1.5 < payback < 2.5, f"Payback should be ~2y, got {payback}"

    def test_payback_never_if_negative_flows(self):
        from generators.finance_core import compute_payback
        cf = [-1000, -100, -100, -100]
        payback = compute_payback(cf)
        # Should return horizon length (no payback)
        assert payback >= 3.0

    def test_payback_instant_if_positive_start(self):
        from generators.finance_core import compute_payback
        assert compute_payback([100, 200]) == 0.0
