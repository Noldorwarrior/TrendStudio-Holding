#!/usr/bin/env python3
"""
scripts/mutation_test.py — Manual mutation testing for core financial modules.

Creates mutations (operator swaps, constant changes, boundary shifts)
in finance_core.py and verifies test suite catches them.

Target: ≥ 80% kill rate on finance_core.py mutants.

Usage: python scripts/mutation_test.py
"""
from __future__ import annotations

import importlib
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path

PIPELINE = Path(__file__).resolve().parent.parent
CORE_FILE = PIPELINE / "generators" / "finance_core.py"
TESTS = [
    "tests/test_31_phase1_math.py",
    "tests/test_32_phase2_valuation.py",
    "tests/test_35_phase5_stress.py",
    "tests/test_33_phase3_mc.py",
    "tests/test_34_phase4_formulas.py",
    "tests/test_37_mutation_guard.py",
]


# Each mutation: (description, original_text, mutated_text)
MUTATIONS = [
    # IRR mutations
    ("IRR: return 0.0 → return 1.0 for NaN",
     "return 0.0\n",
     "return 1.0\n"),
    ("IRR: np.isnan check removed",
     "if np.isnan(result):\n        return 0.0",
     "if False:\n        return 0.0"),

    # MOIC mutations
    ("MOIC: np.maximum → np.minimum",
     "np.sum(np.maximum(arr[1:], 0))",
     "np.sum(np.minimum(arr[1:], 0))"),
    ("MOIC: returned/invested → invested/returned",
     "return returned / invested if invested > 0 else 0.0",
     "return invested / returned if invested > 0 else 0.0"),

    # Blend mutations
    ("Blend: 0.79 → 0.85 (revert bias)",
     "MC_BLEND_INTERCEPT = 0.79",
     "MC_BLEND_INTERCEPT = 0.85"),
    ("Blend: slope 0.30 → 0.50",
     "MC_BLEND_SLOPE = 0.30",
     "MC_BLEND_SLOPE = 0.50"),

    # PROB_VECTOR mutations
    ("PROB_VECTOR: swap base with pessimistic",
     "PROB_VECTOR_BASE: List[float] = [0.05, 0.15, 0.50, 0.20, 0.10]",
     "PROB_VECTOR_BASE: List[float] = [0.05, 0.50, 0.15, 0.20, 0.10]"),

    # Anchor mutations
    ("NDP_ANCHOR: 3000 → 2000",
     "NDP_ANCHOR = 3000.0",
     "NDP_ANCHOR = 2000.0"),
    ("HURDLE_RATE: 0.18 → 0.25",
     "HURDLE_RATE = 0.18",
     "HURDLE_RATE = 0.25"),
    ("WACC_BASE: 0.1905 → 0.25",
     "WACC_BASE = 0.1905",
     "WACC_BASE = 0.25"),

    # Risk scoring mutations
    ("Risk: score threshold 15 → 20",
     "if score >= 15:",
     "if score >= 20:"),
    ("Risk: score threshold 10 → 15",
     "elif score >= 10:",
     "elif score >= 15:"),

    # CAPM mutations
    ("CAPM: ke = rf + ... → ke = rf - ...",
     "ke = rf + beta_erp + country_premium + size_premium",
     "ke = rf - beta_erp + country_premium + size_premium"),

    # Stress test mutations
    ("Stress WACC: multiply by 3 → divide by 3",
     "ndp_impact = ndp_base * wacc_shock * 3",
     "ndp_impact = ndp_base * wacc_shock / 3"),
    ("Stress: negative impact → positive",
     "return round(-ndp_impact, 1)",
     "return round(ndp_impact, 1)"),

    # D&A smoothing mutations
    ("D&A smooth: n_steps check inverted",
     "if n_steps <= 0:",
     "if n_steps >= 0:"),

    # Reverse stress mutations
    ("Reverse stress: hurdle/slope → slope/hurdle",
     "    hit_rate_breakeven = hurdle / slope\n",
     "    hit_rate_breakeven = slope / hurdle\n"),

    # Floor/Fair/Ceiling mutations
    ("Valuation: floor > fair swap removed",
     "if floor > fair:",
     "if False:"),

    # Payback mutations
    ("Payback: cumulative += cf → cumulative -= cf",
     "cumulative += cf",
     "cumulative -= cf"),

    # WACC function mutation
    ("WACC: equity_weight → debt_weight",
     "return equity_weight * ke + debt_weight * kd_after",
     "return debt_weight * ke + equity_weight * kd_after"),
]


def run_tests() -> bool:
    """Run test suite, return True if ALL pass."""
    result = subprocess.run(
        [sys.executable, "-m", "pytest"] + TESTS + ["-x", "--tb=no", "-q", "--no-header"],
        cwd=str(PIPELINE),
        capture_output=True,
        timeout=120,
    )
    return result.returncode == 0


def main() -> int:
    original = CORE_FILE.read_text(encoding="utf-8")

    # Verify baseline passes
    print("Baseline test run...")
    if not run_tests():
        print("ERROR: Baseline tests fail! Cannot run mutation testing.")
        return 1
    print("Baseline: PASS\n")

    killed = 0
    survived = 0
    errors = 0
    results = []

    for i, (desc, orig_text, mut_text) in enumerate(MUTATIONS, 1):
        if orig_text not in original:
            print(f"  [{i:2d}] SKIP  — pattern not found: {desc}")
            errors += 1
            results.append(("SKIP", desc))
            continue

        # Apply mutation
        mutated = original.replace(orig_text, mut_text, 1)
        CORE_FILE.write_text(mutated, encoding="utf-8")

        try:
            tests_pass = run_tests()
        except subprocess.TimeoutExpired:
            tests_pass = False
        finally:
            # Always restore original
            CORE_FILE.write_text(original, encoding="utf-8")

        if tests_pass:
            # Mutant survived — tests didn't catch it
            print(f"  [{i:2d}] SURVIVED — {desc}")
            survived += 1
            results.append(("SURVIVED", desc))
        else:
            # Mutant killed — tests caught it
            print(f"  [{i:2d}] KILLED   — {desc}")
            killed += 1
            results.append(("KILLED", desc))

    total = killed + survived
    kill_rate = killed / total * 100 if total > 0 else 0

    print(f"\n{'═' * 60}")
    print(f"MUTATION TESTING RESULTS — finance_core.py")
    print(f"{'═' * 60}")
    print(f"  Total mutants:  {len(MUTATIONS)}")
    print(f"  Applicable:     {total}")
    print(f"  Killed:         {killed}")
    print(f"  Survived:       {survived}")
    print(f"  Skipped:        {errors}")
    print(f"  Kill rate:      {kill_rate:.1f}%")
    print(f"  Target:         ≥ 80%")
    print(f"  Verdict:        {'PASS' if kill_rate >= 80 else 'FAIL'}")
    print(f"{'═' * 60}")

    if survived > 0:
        print(f"\nSurvived mutants:")
        for status, desc in results:
            if status == "SURVIVED":
                print(f"  - {desc}")

    return 0 if kill_rate >= 80 else 1


if __name__ == "__main__":
    sys.exit(main())
