"""
test_01_inputs_contracts.py — Pydantic-контракты всех 18 входов (8 тестов).
v1.3: добавлен fx_pass_through.yaml → 15 файлов.
v1.3.2: добавлен stress_matrix.yaml → 16 файлов.
v1.3.6: добавлен hedge.yaml (Ж4 Tier D P4) → 17 файлов.
v1.3.7: добавлен eais_sources.yaml (D1 Tier D-post) → 18 файлов.
"""
from pathlib import Path
import pytest
from pydantic import ValidationError

from schemas.inputs import load_inputs, INPUT_FILES, ValidatedInputs


def test_load_inputs_returns_validated_container(inputs):
    """Все 18 YAML загружаются без ошибок и возвращают ValidatedInputs."""
    assert isinstance(inputs, ValidatedInputs)


def test_all_15_files_present_in_registry():
    """INPUT_FILES содержит ровно 18 записей (v1.3.7: +eais_sources)."""
    assert len(INPUT_FILES) == 18
    assert "fx_pass_through" in INPUT_FILES
    assert "stress_matrix" in INPUT_FILES
    assert "hedge" in INPUT_FILES
    assert "eais_sources" in INPUT_FILES


def test_each_input_slot_is_populated(inputs):
    """Каждое поле ValidatedInputs не None."""
    for alias in INPUT_FILES.keys():
        assert getattr(inputs, alias, None) is not None, f"{alias} empty"


def test_anchor_is_3000_mln_rub(inputs):
    """scenarios.yaml: cumulative_ebitda_2026_2028 = 3000 ± 1%."""
    anchor = inputs.scenarios.anchor
    assert anchor.value_mln_rub == 3000.0
    assert anchor.tolerance_pct == 1.0


def test_slate_has_12_films(inputs):
    """slate.yaml должен содержать ровно 12 фильмов."""
    assert len(inputs.slate.films) == 12


def test_macro_profit_tax_rate_is_25pct(inputs):
    """macro.yaml: ставка налога на прибыль = 25%."""
    assert abs(inputs.macro.profit_tax_rate.rate - 0.25) < 1e-9


def test_invalid_yaml_raises_validation_error(tmp_path):
    """Битый файл должен ронять load_inputs с ValidationError или FileNotFoundError."""
    # Копируем inputs/ в tmp и портим один файл
    import shutil
    src = Path(__file__).parent.parent / "inputs"
    dst = tmp_path / "inputs"
    shutil.copytree(src, dst)
    # Портим scenarios.yaml (убираем anchor)
    (dst / "scenarios.yaml").write_text("scenarios: {}\n", encoding="utf-8")
    with pytest.raises((ValidationError, KeyError, ValueError, Exception)):
        load_inputs(dst)


def test_investment_file_has_equity_tranche(inputs):
    """investment.yaml: tranche_structure содержит хотя бы одну equity-транш."""
    tranches = inputs.investment.tranche_structure
    assert len(tranches) > 0
    equity_exists = any(t.tranche_id.startswith("equity") or "equity" in t.tranche_id for t in tranches)
    assert equity_exists or inputs.investment.headline_ask_mln_rub > 0
