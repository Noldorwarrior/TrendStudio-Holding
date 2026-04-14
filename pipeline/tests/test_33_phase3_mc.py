"""
tests/test_33_phase3_mc.py — Phase 3 tests: MC Upgrade.

Verifies:
  - MC N=50000 Sobol quasi-random
  - Bootstrap CI 95% present
  - Sobol sensitivity indices
  - Convergence diagnostics
  - Reproducibility (seed)
  - Disclosure: P(IRR>hurdle) computed
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

PIPELINE_ROOT = Path(__file__).parent.parent
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


# ─── Sobol sampler tests ────────────────────────────────────────────────


class TestSobolSampler:
    """Sobol quasi-random sequences."""

    def test_sobol_shape(self):
        from generators.monte_carlo import _sobol_samples
        s = _sobol_samples(1000, dim=3, seed=42)
        assert s.shape == (1000, 3)

    def test_sobol_in_unit_cube(self):
        from generators.monte_carlo import _sobol_samples
        s = _sobol_samples(5000, dim=2, seed=42)
        assert np.all(s >= 0) and np.all(s <= 1)

    def test_sobol_low_discrepancy(self):
        """Sobol samples should be more uniform than pure random."""
        from generators.monte_carlo import _sobol_samples
        s = _sobol_samples(10000, dim=1, seed=42)
        # Check that each decile has roughly 10% of samples
        for q in np.arange(0.1, 1.0, 0.1):
            frac = float(np.mean(s[:, 0] < q))
            assert abs(frac - q) < 0.05, (
                f"Sobol discrepancy too high: P(x<{q:.1f})={frac:.3f}"
            )


# ─── Triangular PPF tests ───────────────────────────────────────────────


class TestTriangularPPF:
    def test_ppf_endpoints(self):
        from generators.monte_carlo import _triangular_ppf
        u = np.array([0.0, 1.0])
        vals = _triangular_ppf(u, low=0.85, mode=1.0, high=1.12)
        assert vals[0] == pytest.approx(0.85, abs=0.001)
        assert vals[1] == pytest.approx(1.12, abs=0.001)

    def test_ppf_mode(self):
        from generators.monte_carlo import _triangular_ppf
        # At the mode position, PPF should return mode
        low, mode, high = 0.85, 1.0, 1.12
        c = (mode - low) / (high - low)
        u = np.array([c])
        vals = _triangular_ppf(u, low=low, mode=mode, high=high)
        assert vals[0] == pytest.approx(mode, abs=0.001)


# ─── Bootstrap CI tests ─────────────────────────────────────────────────


class TestBootstrapCI:
    def test_ci_contains_mean(self):
        from generators.monte_carlo import _bootstrap_ci
        data = np.random.default_rng(42).normal(100, 10, size=5000)
        ci = _bootstrap_ci(data, np.mean, seed=42)
        assert ci.ci_low < ci.mean < ci.ci_high

    def test_ci_narrows_with_more_data(self):
        from generators.monte_carlo import _bootstrap_ci
        rng = np.random.default_rng(42)
        small = rng.normal(100, 10, size=100)
        large = rng.normal(100, 10, size=10000)
        ci_small = _bootstrap_ci(small, np.mean, seed=42)
        ci_large = _bootstrap_ci(large, np.mean, seed=42)
        width_small = ci_small.ci_high - ci_small.ci_low
        width_large = ci_large.ci_high - ci_large.ci_low
        assert width_large < width_small


# ─── Sobol indices tests ────────────────────────────────────────────────


class TestSobolIndices:
    def test_indices_nonnegative(self):
        from generators.monte_carlo import _compute_sobol_indices
        rng = np.random.default_rng(42)
        samples = rng.random((5000, 3))
        # Output depends only on factor 0
        output = samples[:, 0] * 100 + rng.normal(0, 1, 5000)
        indices = _compute_sobol_indices(
            samples, output, ["f0", "f1", "f2"]
        )
        for si in indices:
            assert si.first_order >= 0
            assert si.total_order >= 0

    def test_dominant_factor_has_highest_index(self):
        from generators.monte_carlo import _compute_sobol_indices
        rng = np.random.default_rng(42)
        samples = rng.random((10000, 2))
        # Output = 10*x0 + 0.1*x1 → factor 0 dominates
        output = 10 * samples[:, 0] + 0.1 * samples[:, 1]
        indices = _compute_sobol_indices(
            samples, output, ["dominant", "minor"]
        )
        assert indices[0].first_order > indices[1].first_order


# ─── Full MC integration tests ──────────────────────────────────────────


class TestMCIntegration:
    """Integration tests requiring a mock ModelResult."""

    @pytest.fixture
    def mock_model(self):
        """Create a minimal ModelResult for MC testing."""
        from unittest.mock import MagicMock
        model = MagicMock()
        model.revenue.total_by_year.side_effect = lambda y: {
            2026: 800, 2027: 1600, 2028: 2145
        }.get(y, 0)
        model.costs.cogs = {2026: 200, 2027: 400, 2028: 500}
        model.costs.pa = {2026: 100, 2027: 200, 2028: 300}
        model.costs.opex = {2026: 50, 2027: 80, 2028: 100}
        model.costs.contingency = {2026: 10, 2027: 15, 2028: 20}
        model.costs.depreciation = {2026: 3, 2027: 3, 2028: 3}
        model.costs.nwc_change = {2026: 50, 2027: 80, 2028: 100}
        return model

    def test_mc_n_50000(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        result = generate_monte_carlo(mock_model, n_sims=50_000, seed=42)
        assert result.n_sims == 50_000
        assert len(result.samples_ebitda) == 50_000

    def test_mc_has_bootstrap_ci(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        result = generate_monte_carlo(mock_model, n_sims=10_000, seed=42)
        assert result.bootstrap_ebitda_mean is not None
        assert result.bootstrap_ebitda_mean.ci_low < result.bootstrap_ebitda_mean.ci_high
        assert result.bootstrap_prob_above is not None

    def test_mc_has_sobol_indices(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        result = generate_monte_carlo(mock_model, n_sims=10_000, seed=42)
        assert len(result.sobol_indices) == 2
        assert result.sobol_indices[0].factor == "revenue_factor"

    def test_mc_has_convergence(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        result = generate_monte_carlo(mock_model, n_sims=50_000, seed=42)
        assert result.convergence is not None
        assert len(result.convergence.n_values) >= 2
        assert 50_000 in result.convergence.n_values

    def test_mc_reproducibility(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        r1 = generate_monte_carlo(mock_model, n_sims=5_000, seed=42)
        r2 = generate_monte_carlo(mock_model, n_sims=5_000, seed=42)
        assert r1.ebitda_mean == r2.ebitda_mean
        assert r1.prob_ebitda_above_anchor == r2.prob_ebitda_above_anchor

    def test_mc_different_seed_different_result(self, mock_model):
        from generators.monte_carlo import generate_monte_carlo
        r1 = generate_monte_carlo(mock_model, n_sims=5_000, seed=42)
        r2 = generate_monte_carlo(mock_model, n_sims=5_000, seed=99)
        # Samples should differ (medians are less affected by rounding)
        assert r1.ebitda_median != r2.ebitda_median or r1.ebitda_p5 != r2.ebitda_p5

    def test_mc_convergence_stable(self, mock_model):
        """Running means should stabilize as N grows."""
        from generators.monte_carlo import generate_monte_carlo
        result = generate_monte_carlo(mock_model, n_sims=50_000, seed=42)
        conv = result.convergence
        # Mean at 50k should be close to mean at 20k
        if len(conv.ebitda_means) >= 2:
            diff = abs(conv.ebitda_means[-1] - conv.ebitda_means[-2])
            # Within 2% of the mean
            assert diff < abs(conv.ebitda_means[-1]) * 0.02, (
                f"Convergence not stable: Δ={diff:.1f}"
            )
