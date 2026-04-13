"""
test_04_revenue.py — генератор revenue (6 тестов).
"""
YEARS = (2026, 2027, 2028)
SEGMENTS = ("cinema", "advertising", "festivals", "education", "license_library")


def test_revenue_has_all_5_segments(base_model):
    for seg in SEGMENTS:
        assert hasattr(base_model.revenue, seg)


def test_revenue_is_positive_base(base_model):
    """Все сегменты > 0 в Base."""
    for seg in SEGMENTS:
        d = getattr(base_model.revenue, seg)
        for y in YEARS:
            assert d[y] > 0, f"{seg}[{y}] = {d[y]}"


def test_revenue_total_equals_sum_of_segments(base_model):
    """revenue_total = Σ сегментов."""
    for y in YEARS:
        segsum = sum(getattr(base_model.revenue, seg)[y] for seg in SEGMENTS)
        assert abs(base_model.pnl.revenue_total[y] - segsum) < 1e-6


def test_cinema_is_largest_segment_in_base(base_model):
    """Cinema — крупнейший сегмент (доминирует в структуре)."""
    for y in YEARS:
        cinema = base_model.revenue.cinema[y]
        for seg in ("advertising", "festivals", "education", "license_library"):
            assert cinema > getattr(base_model.revenue, seg)[y], \
                f"{y}: cinema={cinema} не больше {seg}"


def test_revenue_growth_2026_to_2028(base_model):
    """Total 2028 > 2027 > 2026 (выход на плановую мощность)."""
    r = base_model.pnl.revenue_total
    assert r[2026] < r[2027] < r[2028]


def test_revenue_total_base_3y_matches_expected_range(base_model):
    """Σ Revenue Base 3 года ∈ [11 000; 14 000] млн ₽ — плановый диапазон."""
    total = sum(base_model.pnl.revenue_total.values())
    assert 11_000 <= total <= 14_000, f"total={total}"
