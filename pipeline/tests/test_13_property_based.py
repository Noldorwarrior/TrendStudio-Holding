"""
test_13_property_based.py — property-based тесты (Hypothesis, 5 тестов).

Генерируют случайные входы и проверяют инварианты генераторов в изоляции.
"""
import pytest
from hypothesis import given, settings, strategies as st, HealthCheck

from generators.base import (
    sum_year_dicts, sub_year_dicts, scale_year_dict, cumulative, YEARS, check_anchor
)


year_dict_strat = st.dictionaries(
    keys=st.sampled_from(YEARS),
    values=st.floats(min_value=-10_000, max_value=10_000, allow_nan=False, allow_infinity=False),
    min_size=3, max_size=3,
).filter(lambda d: set(d.keys()) == set(YEARS))


@given(a=year_dict_strat, b=year_dict_strat)
@settings(max_examples=80, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_sum_then_subtract_is_identity(a, b):
    """(a + b) − b == a поэлементно."""
    s = sum_year_dicts(a, b)
    diff = sub_year_dicts(s, b)
    for y in YEARS:
        assert abs(diff[y] - a[y]) < 1e-6


@given(d=year_dict_strat, k=st.floats(min_value=0.1, max_value=5.0, allow_nan=False))
@settings(max_examples=80, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_scale_commutes(d, k):
    """scale(scale(d, k), 1/k) ≈ d."""
    scaled = scale_year_dict(d, k)
    back = scale_year_dict(scaled, 1.0 / k)
    for y in YEARS:
        assert abs(back[y] - d[y]) < 1e-3


@given(d=year_dict_strat)
@settings(max_examples=80, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_cumulative_equals_sum(d):
    """cumulative(d) возвращает сумму всех значений."""
    total = cumulative(d)
    assert abs(total - sum(d.values())) < 1e-6


@given(
    val=st.floats(min_value=2900, max_value=3100, allow_nan=False),
    tol=st.floats(min_value=0.5, max_value=5.0, allow_nan=False),
)
@settings(max_examples=80, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_anchor_check_within_tolerance(val, tol):
    """check_anchor корректно классифицирует значения внутри и вне толерантности."""
    passed, dev = check_anchor(val, 3000.0, tol)
    abs_dev_pct = abs(val - 3000.0) / 3000.0 * 100.0
    if abs_dev_pct <= tol:
        assert passed is True
    else:
        assert passed is False


@given(a=year_dict_strat, b=year_dict_strat, c=year_dict_strat)
@settings(max_examples=40, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_sum_associative(a, b, c):
    """Сложение годовых словарей ассоциативно."""
    left = sum_year_dicts(sum_year_dicts(a, b), c)
    right = sum_year_dicts(a, sum_year_dicts(b, c))
    for y in YEARS:
        assert abs(left[y] - right[y]) < 1e-6
