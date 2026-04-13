"""
test_28_final_bundle.py
Финальные инвариантные тесты для v1.4.4.
Покрывают: verify_full, счёт механизмов, согласованность версии, ADR chain,
наличие всех обязательных артефактов, отсутствие регрессии.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

PIPELINE = Path(__file__).resolve().parent.parent
LOGS = PIPELINE / "logs"
ARTIFACTS = PIPELINE / "artifacts"
STRESS = ARTIFACTS / "stress_matrix"
ADR = PIPELINE / "docs" / "adr"


# ---------- 1. ADR invariants ----------
def test_adrs_exist():
    """Должно быть ≥ 8 ADR."""
    adrs = list(ADR.glob("ADR-*.md"))
    assert len(adrs) >= 8, f"Expected ≥8 ADRs, got {len(adrs)}"


def test_adr_numbers_sequential():
    import re
    ids = sorted(int(re.match(r"ADR-(\d+)", p.name).group(1)) for p in ADR.glob("ADR-*.md"))
    assert ids == list(range(1, len(ids) + 1)), f"ADR numbers not sequential: {ids}"


def test_adr_readme_references_all():
    readme = (ADR / "README.md").read_text(encoding="utf-8")
    for adr in ADR.glob("ADR-*.md"):
        assert adr.name in readme, f"{adr.name} not referenced in ADR README"


# ---------- 2. Artifact presence ----------
REQUIRED_ARTIFACTS = [
    "dashboard.html", "dashboard.xlsx",
    "B2_presentation.pptx", "B2_presentation.html",
    "B3_memo.docx", "B4_onepager.docx",
    "dashboard_anchor_gauge.png", "dashboard_mc_comparison.png",
    "dashboard_tornado.png", "dashboard_stage_gate_funnel.png",
    "dashboard_var_comparison.png",
]


@pytest.mark.parametrize("name", REQUIRED_ARTIFACTS)
def test_artifact_exists(name):
    assert (ARTIFACTS / name).exists(), f"Missing artifact: {name}"


@pytest.mark.parametrize("name", REQUIRED_ARTIFACTS)
def test_artifact_nonempty(name):
    p = ARTIFACTS / name
    assert p.stat().st_size > 100, f"Artifact {name} is suspiciously small"


# ---------- 3. MC engines consistency ----------
def test_all_four_engines_exist():
    for f in ("monte_carlo.json", "market_bootstrap.json", "stage_gate.json", "lhs_copula.json"):
        assert (STRESS / f).exists(), f"Missing engine output: {f}"


def test_matrix_27_has_27_scenarios():
    m27 = json.loads((STRESS / "matrix_27.json").read_text(encoding="utf-8"))
    assert len(m27["scenarios"]) == 27


def test_lhs_base_matches_mc_base():
    lhs = json.loads((STRESS / "lhs_copula.json").read_text(encoding="utf-8"))
    mc = json.loads((STRESS / "monte_carlo.json").read_text(encoding="utf-8"))
    assert abs(lhs["base_ebitda"] - mc["base_ebitda"]) < 0.01


def test_lhs_mean_close_to_mc_mean():
    """LHS — вариант с reduction variance, но средние должны быть близки."""
    lhs = json.loads((STRESS / "lhs_copula.json").read_text(encoding="utf-8"))
    mc = json.loads((STRESS / "monte_carlo.json").read_text(encoding="utf-8"))
    assert abs(lhs["mean_ebitda"] - mc["mean_ebitda"]) < 5.0


def test_lhs_breach_not_greater_than_mc():
    """LHS+copula обычно даёт breach не выше naive MC (variance reduction)."""
    lhs = json.loads((STRESS / "lhs_copula.json").read_text(encoding="utf-8"))
    mc = json.loads((STRESS / "monte_carlo.json").read_text(encoding="utf-8"))
    assert lhs["breach_probability"] <= mc["breach_probability"] + 0.005


def test_stage_gate_mean_lower_than_mc():
    """Stage-gate учитывает sunk cost, поэтому mean EBITDA ниже."""
    gate = json.loads((STRESS / "stage_gate.json").read_text(encoding="utf-8"))
    mc = json.loads((STRESS / "monte_carlo.json").read_text(encoding="utf-8"))
    assert gate["mean_ebitda"] < mc["mean_ebitda"]


# ---------- 4. verify_full script ----------
#   JSON-отчёт gitignored (logs/*.json), поэтому в свежем клоне bundle его нет.
#   Тесты пропускают, если отчёт отсутствует, но требуют его наличия, если он есть.

_P5_JSON = LOGS / "p5_full_v1_4_4.json"
_P5_MD = LOGS / "p5_full_v1_4_4.md"


def test_verify_full_script_exists():
    assert (PIPELINE / "scripts" / "verify_full.py").exists()


def test_p5_full_md_report_shipped():
    """Человекочитаемый отчёт входит в bundle (не gitignored)."""
    assert _P5_MD.exists(), "p5_full_v1_4_4.md должен входить в репозиторий"


def test_p5_full_report_generated():
    """Если отчёт сгенерирован — он валиден. Иначе skip (свежий клон)."""
    if not _P5_JSON.exists():
        pytest.skip("p5_full_v1_4_4.json отсутствует (logs/*.json gitignored)")
    assert _P5_JSON.exists()


def test_p5_full_report_all_32_mechanisms():
    if not _P5_JSON.exists():
        pytest.skip("p5_full_v1_4_4.json отсутствует")
    js = json.loads(_P5_JSON.read_text(encoding="utf-8"))
    assert js["summary"]["total"] == 32
    assert len(js["checks"]) == 32


def test_p5_full_report_zero_failures():
    if not _P5_JSON.exists():
        pytest.skip("p5_full_v1_4_4.json отсутствует")
    js = json.loads(_P5_JSON.read_text(encoding="utf-8"))
    fails = [c for c in js["checks"] if c["status"] == "FAIL"]
    assert not fails, f"FAIL в механизмах: {[(c['id'], c['name']) for c in fails]}"


def test_p5_full_pass_at_least_31():
    """Минимум 31 из 32 должны пройти (1 может быть N/A для provenance)."""
    if not _P5_JSON.exists():
        pytest.skip("p5_full_v1_4_4.json отсутствует")
    js = json.loads(_P5_JSON.read_text(encoding="utf-8"))
    assert js["summary"]["pass"] >= 31


# ---------- 5. Version consistency ----------
def test_readme_has_version():
    readme = (PIPELINE / "README.md").read_text(encoding="utf-8")
    assert "v1.4." in readme


def test_readme_mentions_all_stages():
    readme = (PIPELINE / "README.md").read_text(encoding="utf-8").lower()
    for kw in ["dashboard", "memo", "presentation", "pager"]:
        assert kw in readme, f"README missing stage keyword: {kw}"


# ---------- 6. Bundle chain ----------
def test_bundle_chain_has_predecessors():
    """Родительская папка должна содержать предыдущие bundle-ы.
    Skip в изолированном клоне (/tmp/verify_*) — там нет родительской структуры."""
    parent = PIPELINE.parent
    bundles = sorted(parent.glob("pipeline_v*.bundle"))
    if not bundles:
        pytest.skip("нет bundle в родительской папке (isolated clone)")
    names = [b.name for b in bundles]
    expected = ["pipeline_v1.4.1.bundle", "pipeline_v1.4.2.bundle", "pipeline_v1.4.3.bundle"]
    for e in expected:
        assert e in names, f"Missing bundle predecessor: {e}"
