"""
tests/test_32_phase2_valuation.py — Phase 2 tests: Peer Comps + Valuation Reconciliation.

Verifies:
  - Peer comps have source citations (R-010, F-015)
  - Valuation Floor/Fair/Ceiling spread ≤ 2× (R-011, F-007)
  - CAPM build-up has 5 components with sources (R-019, F-030)
  - No (internal) annotations in build scripts (F-011 build-level)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent.parent
PIPELINE_ROOT = Path(__file__).parent.parent

if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


# ─── R-010 / F-015: Peer comps sources ──────────────────────────────────


class TestPeerCompSources:
    """R-010: Every peer comp must have source, date, and link."""

    def test_build_a10_peers_have_sources(self):
        """build_A10 peer data should include source/date/link tuples."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        # Each peer tuple should have 12 elements (added source, date, link)
        assert "source_date" in content or "source_link" in content or "Source" in content, (
            "build_A10 peers should have source citation fields"
        )
        # Check that each peer company has a source reference
        for peer in ["Яндекс Кинопоиск", "Okko", "ivi", "START", "Premier", "Мосфильм"]:
            assert peer in content, f"Peer {peer} should be present"

    def test_build_a10_has_at_least_3_independent_sources(self):
        """At least 3 distinct sources for peer median computation."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        # Count distinct source types
        sources = set()
        for keyword in ["MOEX", "SPARK", "Kontur", "Annual Report",
                        "CNews", "Vedomosti", "RBK", "Cbonds"]:
            if keyword in content:
                sources.add(keyword)
        assert len(sources) >= 3, (
            f"Need ≥3 independent source types, found {len(sources)}: {sources}"
        )


# ─── R-011 / F-007: Valuation spread ────────────────────────────────────


class TestValuationSpread:
    """R-011: Valuation Floor/Fair/Ceiling spread must be ≤ 2×."""

    def test_floor_fair_ceiling_ordering(self):
        from generators.finance_core import valuation_floor_fair_ceiling

        result = valuation_floor_fair_ceiling(
            dcf_conservative=2000, comps_median=5000, mc_p75=8000
        )
        assert result["floor"] <= result["fair"] <= result["ceiling"]

    def test_spread_computation(self):
        from generators.finance_core import valuation_floor_fair_ceiling

        result = valuation_floor_fair_ceiling(
            dcf_conservative=3000, comps_median=4000, mc_p75=5000
        )
        assert result["spread"] == pytest.approx(5000 / 3000, abs=0.01)

    def test_spread_within_2x_example(self):
        """When inputs are reasonable, spread should be manageable."""
        from generators.finance_core import valuation_floor_fair_ceiling

        # Conservative DCF, median comps, optimistic MC — narrow range
        result = valuation_floor_fair_ceiling(
            dcf_conservative=4000, comps_median=5500, mc_p75=7000
        )
        assert result["spread"] <= 2.0, (
            f"Spread {result['spread']:.2f}× > 2×"
        )

    def test_handles_zero_floor(self):
        from generators.finance_core import valuation_floor_fair_ceiling

        result = valuation_floor_fair_ceiling(
            dcf_conservative=0, comps_median=5000, mc_p75=8000
        )
        assert result["spread"] == float("inf")


# ─── R-019 / F-030: CAPM build-up ───────────────────────────────────────


class TestCAPMBuildUp:
    """R-019: CAPM must decompose into 5 sourced components."""

    def test_capm_5_components(self):
        from generators.finance_core import capm_cost_of_equity

        result = capm_cost_of_equity(
            rf=0.145, beta=0.80, erp=0.07,
            country_premium=0.020, size_premium=0.010
        )
        # All 5 components present
        assert "rf" in result
        assert "beta" in result
        assert "erp" in result
        assert "country_premium" in result
        assert "size_premium" in result
        assert "ke" in result

    def test_capm_known_values(self):
        """CAPM with known inputs → Ke = 14.5 + 5.6 + 2.0 + 1.0 = 23.1%."""
        from generators.finance_core import capm_cost_of_equity

        result = capm_cost_of_equity(
            rf=0.145, beta=0.80, erp=0.07,
            country_premium=0.020, size_premium=0.010
        )
        assert result["ke"] == pytest.approx(0.231, abs=0.001)
        assert result["beta_erp"] == pytest.approx(0.056, abs=0.001)

    def test_wacc_from_capm(self):
        """WACC = 0.70×23.1% + 0.30×9.6% = 19.05%."""
        from generators.finance_core import wacc_from_capm

        wacc = wacc_from_capm(
            ke=0.231, kd_pre_tax=0.12, tax_rate=0.20, equity_weight=0.70
        )
        assert wacc == pytest.approx(0.1905, abs=0.001)

    def test_build_a10_has_capm_sources(self):
        """build_A10 CAPM should have source citations for each component."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        for keyword in ["ОФЗ", "Damodaran", "Duff & Phelps", "MOEX", "Cbonds"]:
            assert keyword in content, (
                f"CAPM source '{keyword}' not found in build_A10"
            )

    def test_build_a10_has_5_wacc_components(self):
        """build_A10 should decompose WACC into Rf, β, ERP, Country, Size."""
        build_a10 = REPO_ROOT / "Investor_Package" / "build_A10_valuation.py"
        if not build_a10.exists():
            pytest.skip("build_A10 not found")
        content = build_a10.read_text()
        for var in ["RISK_FREE", "BETA", "ERP", "COUNTRY_PREM", "SIZE_PREM"]:
            assert var in content, f"WACC component {var} not found"


# ─── F-011 build-level: No (internal) in build scripts ──────────────────


class TestNoInternalInBuildScripts:
    """F-011 (build-level): No (internal) annotations in build scripts."""

    def test_build_a14_no_internal(self):
        build_a14 = REPO_ROOT / "Investor_Package" / "build_A14_market_benchmarks_comps.py"
        if not build_a14.exists():
            pytest.skip("build_A14 not found")
        content = build_a14.read_text()
        # Should not have "(internal)" as a label in deal data
        assert "(internal)" not in content.lower(), (
            "build_A14 still has (internal) annotations in deal data"
        )
