"""
test_03_anchor_invariant.py — якорь cumulative EBITDA Base = 3000 ±1% (5 тестов).
"""
YEARS = (2026, 2027, 2028)
ANCHOR = 3000.0
TOL_PCT = 1.0
TOL_ABS = ANCHOR * TOL_PCT / 100.0  # 30 млн ₽


def test_anchor_actual_within_tolerance(run):
    """Факт ∈ [2970; 3030]."""
    assert ANCHOR - TOL_ABS <= run.anchor_actual <= ANCHOR + TOL_ABS


def test_anchor_passed_flag(run):
    """run.anchor_passed == True."""
    assert run.anchor_passed is True


def test_anchor_deviation_under_1pct(run):
    """|δ| < 1%."""
    assert abs(run.anchor_deviation_pct) < TOL_PCT


def test_cumulative_ebitda_matches_sum_of_years(run):
    """anchor_actual совпадает с суммой EBITDA Base по 3 годам."""
    m = run.get("base")
    total = sum(m.pnl.ebitda[y] for y in YEARS)
    assert abs(run.anchor_actual - total) < 1e-6


def test_anchor_value_is_3000(run):
    """run.anchor_value == 3000.0 по конфигу."""
    assert run.anchor_value == ANCHOR
