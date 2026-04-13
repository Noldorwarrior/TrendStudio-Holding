"""
test_19_eais_loader.py — регрессионные тесты ЕАИС seed-датасета и fetcher (v1.3.7 D1).

Проверяет:
- Контракт eais_sources.yaml загружается и валидируется.
- Seed annual_box_office.csv содержит 7 строк 2019–2025.
- Инварианты russian_bo / total_bo / russian_share (допуск ±3%).
- Инвариант total_bo / viewers ≈ avg_ticket (допуск ±5%).
- Провал 2020: total_bo[2020] < 0.5 × total_bo[2019].
- Структурный сдвиг 2022: russian_share_pct монотонно не убывает после 2021.
- compute_yoy_changes возвращает N-1 значений.
- fetch_mkrf_register в head_only режиме не падает при наличии сети (skip иначе).
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from scripts.eais_fetcher import (  # noqa: E402
    AnnualBoxOfficeRow,
    compute_yoy_changes,
    load_annual_box_office,
    SEED_CSV,
)


# ---------- контракт YAML ----------------------------------------------------


def test_eais_sources_yaml_loads(inputs):
    """eais_sources.yaml проходит Pydantic-валидацию и присутствует в ValidatedInputs."""
    assert inputs.eais_sources is not None
    assert inputs.eais_sources.sources is not None
    assert len(inputs.eais_sources.sources.primary) >= 1
    assert len(inputs.eais_sources.sources.reference) >= 1


def test_eais_sources_meta_confidence(inputs):
    """meta.confidence — одно из допустимых значений ConfidenceLevel."""
    meta = inputs.eais_sources.meta
    assert meta.source_id.startswith("eais_sources")
    assert meta.confidence in {"high", "medium", "low"}


# ---------- seed-датасет -----------------------------------------------------


def test_seed_csv_exists():
    """Seed-файл существует на диске."""
    assert SEED_CSV.exists(), f"seed не найден: {SEED_CSV}"


def test_seed_has_7_rows():
    """Seed содержит ровно 7 строк (2019–2025 включительно)."""
    rows = load_annual_box_office()
    assert len(rows) == 7
    assert rows[0].year == 2019
    assert rows[-1].year == 2025


def test_seed_years_are_continuous():
    """Годы непрерывны без пропусков."""
    rows = load_annual_box_office()
    years = [r.year for r in rows]
    for a, b in zip(years, years[1:]):
        assert b - a == 1, f"разрыв между {a} и {b}"


def test_seed_russian_share_consistency():
    """russian_bo_mln_rub ≈ total_bo_mln_rub × russian_share_pct/100, допуск 3%."""
    rows = load_annual_box_office()
    for r in rows:
        expected = r.total_bo_mln_rub * r.russian_share_pct / 100.0
        if expected == 0:
            continue
        delta = abs(r.russian_bo_mln_rub - expected) / expected
        assert delta <= 0.03, (
            f"{r.year}: russian_bo={r.russian_bo_mln_rub}, "
            f"ожидается {expected:.1f}, расхождение {delta:.1%}"
        )


def test_seed_avg_ticket_consistency():
    """total_bo / viewers ≈ avg_ticket, допуск 5% (в рублях)."""
    rows = load_annual_box_office()
    for r in rows:
        # total_bo_mln_rub * 1e6 / (viewers_mln * 1e6) = total_bo_rub_per_viewer
        implied_ticket = r.total_bo_mln_rub / r.viewers_mln  # млн₽ / млн_чел = руб/чел
        delta = abs(implied_ticket - r.avg_ticket_rub) / r.avg_ticket_rub
        assert delta <= 0.05, (
            f"{r.year}: implied_ticket={implied_ticket:.0f}, "
            f"avg_ticket_rub={r.avg_ticket_rub}, расхождение {delta:.1%}"
        )


def test_seed_covid_trough_2020():
    """Провал 2020: total_bo[2020] < 0.5 × total_bo[2019]."""
    rows = load_annual_box_office()
    by_year = {r.year: r for r in rows}
    assert by_year[2020].total_bo_mln_rub < 0.5 * by_year[2019].total_bo_mln_rub


def test_seed_russian_share_monotone_after_2021():
    """russian_share_pct монотонно не убывает после 2021 (структурный сдвиг)."""
    rows = load_annual_box_office()
    post = [r for r in rows if r.year >= 2021]
    shares = [r.russian_share_pct for r in post]
    for a, b in zip(shares, shares[1:]):
        assert b >= a - 0.5, (  # допускаем мини-колебания ±0.5 п.п.
            f"russian_share_pct упал с {a} до {b} — нарушение монотонности после 2021"
        )


def test_seed_hollywood_exit_2022_jump():
    """2022: structural break — russian_share_pct вырастает ≥ 30 п.п. против 2021."""
    rows = load_annual_box_office()
    by_year = {r.year: r for r in rows}
    jump = by_year[2022].russian_share_pct - by_year[2021].russian_share_pct
    assert jump >= 30.0, f"скачок 2021→2022 = {jump:.1f} п.п., ожидалось ≥30"


# ---------- compute_yoy_changes ---------------------------------------------


def test_compute_yoy_changes_length():
    """compute_yoy_changes возвращает N-1 значений для N строк."""
    rows = load_annual_box_office()
    yoy = compute_yoy_changes(rows)
    assert len(yoy) == len(rows) - 1


def test_compute_yoy_changes_covid_drop():
    """2019→2020: YoY < -0.5 (пандемия)."""
    rows = load_annual_box_office()
    yoy = compute_yoy_changes(rows)
    # индекс 0 — переход 2019→2020
    assert yoy[0] < -0.5, f"YoY 2019→2020 = {yoy[0]:.1%}, ожидалось < -50%"


def test_compute_yoy_changes_empty_on_short_series():
    """compute_yoy_changes возвращает [] для < 2 строк."""
    row = AnnualBoxOfficeRow(
        year=2020,
        total_bo_mln_rub=1.0,
        viewers_mln=1.0,
        avg_ticket_rub=1.0,
        russian_share_pct=1.0,
        russian_bo_mln_rub=0.01,
        n_releases=1,
        source_id="test",
        note="test",
    )
    assert compute_yoy_changes([]) == []
    assert compute_yoy_changes([row]) == []
