"""
tests/test_35_phase5_stress.py — Phase 5 tests: Stress Tests + Risk Calibration.

Verifies:
  - Risk rubric 1-5 × 1-5 calibrated (R-020, F-028)
  - 5 stress scenarios computed
  - Reverse stress: breakeven hit_rate calculated
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

PIPELINE_ROOT = Path(__file__).parent.parent
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


class TestRiskRubric:
    """R-020: Risk scoring rubric 1-5 × 1-5."""

    def test_scales_defined(self):
        from generators.finance_core import RISK_PROBABILITY_SCALE, RISK_IMPACT_SCALE
        assert len(RISK_PROBABILITY_SCALE) == 5
        assert len(RISK_IMPACT_SCALE) == 5

    def test_risk_score_critical(self):
        from generators.finance_core import risk_score
        result = risk_score(5, 5)
        assert result["score"] == 25
        assert result["severity"] == "CRITICAL"

    def test_risk_score_low(self):
        from generators.finance_core import risk_score
        result = risk_score(1, 1)
        assert result["score"] == 1
        assert result["severity"] == "LOW"

    def test_risk_score_medium(self):
        from generators.finance_core import risk_score
        result = risk_score(2, 3)
        assert result["score"] == 6
        assert result["severity"] == "MEDIUM"

    def test_risk_score_invalid(self):
        from generators.finance_core import risk_score
        with pytest.raises(ValueError):
            risk_score(0, 3)
        with pytest.raises(ValueError):
            risk_score(3, 6)

    def test_all_25_combinations(self):
        """All 25 combinations produce valid results."""
        from generators.finance_core import risk_score
        for p in range(1, 6):
            for i in range(1, 6):
                result = risk_score(p, i)
                assert result["severity"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


class TestStressScenarios:
    """5 stress scenarios must compute."""

    def test_stress_wacc(self):
        from generators.finance_core import stress_wacc
        result = stress_wacc(ndp_base=3000, irr_base=0.2009, wacc_delta_bps=500)
        assert result["ndp_stressed"] < 3000
        assert "WACC" in result["scenario"]

    def test_stress_cost_overrun(self):
        from generators.finance_core import stress_cost_overrun
        result = stress_cost_overrun(ndp_base=3000, overrun_pct=0.30, n_films=2)
        assert result["ndp_stressed"] < 3000
        assert result["ndp_impact"] < 0

    def test_stress_timing_shift(self):
        from generators.finance_core import stress_timing_shift
        result = stress_timing_shift(ndp_base=3000, delay_months=12)
        assert result["ndp_stressed"] < 3000

    def test_stress_tax_reform(self):
        from generators.finance_core import stress_tax_reform
        result = stress_tax_reform(ndp_base=3000, vat_increase_pct=0.02)
        assert result["ndp_stressed"] < 3000

    def test_combined_stress(self):
        """Combined: 3 of 4 simultaneous stresses."""
        from generators.finance_core import (
            stress_wacc, stress_cost_overrun, stress_timing_shift
        )
        s1 = stress_wacc(3000, 0.2009)
        s2 = stress_cost_overrun(3000)
        s3 = stress_timing_shift(3000)
        combined_impact = s1["ndp_impact"] + s2["ndp_impact"] + s3["ndp_impact"]
        assert combined_impact < -200, "Combined stress should have material impact"


class TestReverseStress:
    """Reverse stress: breakeven hit_rate."""

    def test_breakeven_exists(self):
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        assert 0 < result["breakeven_hit_rate"] < 1

    def test_breakeven_below_base(self):
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        assert result["breakeven_hit_rate"] < result["base_hit_rate"]

    def test_positive_margin(self):
        from generators.finance_core import reverse_stress_hit_rate
        result = reverse_stress_hit_rate()
        assert result["margin"] > 0, "Should have positive margin to hurdle"
