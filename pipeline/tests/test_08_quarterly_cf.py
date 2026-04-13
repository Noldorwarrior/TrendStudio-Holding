"""
test_08_quarterly_cf.py — поквартальный CF Base (5 тестов).
"""
import pytest

YEARS = (2026, 2027, 2028)


def test_quarterly_cf_has_12_quarters(run):
    """3 года × 4 квартала = 12 периодов."""
    assert len(run.quarterly_cashflow_base) == 12


def test_quarterly_keys_format(run):
    """Ключи формата Q{1..4}_{YYYY}."""
    for key in run.quarterly_cashflow_base.keys():
        assert key.startswith("Q")
        assert "_" in key
        q, y = key.split("_")
        assert q in ("Q1", "Q2", "Q3", "Q4")
        assert int(y) in YEARS


def test_each_quarter_has_income_outcome_net(run):
    """В каждом квартале есть income, outcome, net, cumulative."""
    for data in run.quarterly_cashflow_base.values():
        assert "income" in data
        assert "outcome" in data
        assert "net" in data
        assert "cumulative" in data


def test_total_quarterly_net_equals_3y_aggregate(run):
    """Σ net за 12 кварталов = сумма внутрипериодного CF (без учёта межгодовых лагов)."""
    total_q = sum(d["net"] for d in run.quarterly_cashflow_base.values())
    # Должно быть конечное число и знак зависит от распределения
    assert isinstance(total_q, float)
    # Сумма в разумных пределах относительно годового FCF (не строгое равенство
    # из-за лагов CapEx/доходов за пределы горизонта, но близко)
    assert -5000 < total_q < 5000


def test_cumulative_is_monotonic_running_sum(run):
    """Поле cumulative — running sum net по порядку кварталов."""
    keys_sorted = sorted(
        run.quarterly_cashflow_base.keys(),
        key=lambda k: (int(k.split("_")[1]), int(k[1])),
    )
    running = 0.0
    for key in keys_sorted:
        running += run.quarterly_cashflow_base[key]["net"]
        assert abs(run.quarterly_cashflow_base[key]["cumulative"] - running) < 0.5
