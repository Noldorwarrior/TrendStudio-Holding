"""
Test ADR completeness and consistency.

Проверяет, что все ADR в `docs/adr/`:
1. Имеют все обязательные секции формата Michael Nygard.
2. Имеют корректный статус (Accepted/Proposed/Deprecated/Superseded).
3. Перечислены в `docs/adr/README.md`.
4. Формат имени файла соответствует `ADR-NNN-kebab-case-title.md`.
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

ADR_DIR = Path(__file__).resolve().parents[1] / "docs" / "adr"

REQUIRED_SECTIONS = [
    "## Context",
    "## Decision",
    "## Options Considered",
    "## Trade-off Analysis",
    "## Consequences",
    "## Action Items",
]

REQUIRED_HEADER_FIELDS = [
    "**Status:**",
    "**Date:**",
    "**Deciders:**",
]

VALID_STATUSES = {"Proposed", "Accepted", "Deprecated", "Superseded"}

ADR_FILENAME_RE = re.compile(r"^ADR-(\d{3})-[a-z0-9\-]+\.md$")


def _adr_files() -> list[Path]:
    """Возвращает список всех ADR-файлов (без README)."""
    return sorted(
        p for p in ADR_DIR.glob("ADR-*.md")
        if p.is_file() and p.name != "README.md"
    )


def test_adr_directory_exists():
    assert ADR_DIR.is_dir(), f"ADR directory not found: {ADR_DIR}"


def test_adr_readme_exists():
    readme = ADR_DIR / "README.md"
    assert readme.is_file(), "docs/adr/README.md not found"


def test_at_least_eight_adrs():
    files = _adr_files()
    assert len(files) >= 8, f"Expected at least 8 ADRs, found {len(files)}"


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_filename_format(adr_path: Path):
    """Имя файла должно быть ADR-NNN-kebab-case-title.md."""
    m = ADR_FILENAME_RE.match(adr_path.name)
    assert m is not None, f"Bad ADR filename: {adr_path.name}"


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_has_required_sections(adr_path: Path):
    """Каждый ADR должен содержать все 6 обязательных секций."""
    content = adr_path.read_text(encoding="utf-8")
    missing = [s for s in REQUIRED_SECTIONS if s not in content]
    assert not missing, f"{adr_path.name} missing sections: {missing}"


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_has_header_fields(adr_path: Path):
    """Каждый ADR должен содержать поля Status / Date / Deciders."""
    content = adr_path.read_text(encoding="utf-8")
    missing = [f for f in REQUIRED_HEADER_FIELDS if f not in content]
    assert not missing, f"{adr_path.name} missing header fields: {missing}"


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_has_valid_status(adr_path: Path):
    """Статус должен быть одним из VALID_STATUSES."""
    content = adr_path.read_text(encoding="utf-8")
    m = re.search(r"\*\*Status:\*\*\s*(\w+)", content)
    assert m is not None, f"{adr_path.name}: cannot parse Status"
    status = m.group(1)
    assert status in VALID_STATUSES, (
        f"{adr_path.name}: invalid status '{status}'. "
        f"Must be one of {VALID_STATUSES}"
    )


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_has_title_heading(adr_path: Path):
    """Первая строка должна быть # ADR-NNN: Title."""
    content = adr_path.read_text(encoding="utf-8")
    first_line = content.splitlines()[0] if content else ""
    assert first_line.startswith("# ADR-"), (
        f"{adr_path.name}: first line should start with '# ADR-', got: {first_line[:50]}"
    )


@pytest.mark.parametrize("adr_path", _adr_files(), ids=lambda p: p.name)
def test_adr_options_has_table(adr_path: Path):
    """Секция Options Considered должна содержать markdown-таблицу сравнения."""
    content = adr_path.read_text(encoding="utf-8")
    # Найти секцию Options Considered
    start = content.find("## Options Considered")
    end = content.find("## Trade-off Analysis", start)
    assert start != -1 and end != -1, f"{adr_path.name}: sections not found"
    section = content[start:end]
    # Хотя бы одна markdown-таблица (строки с |)
    assert "|" in section and "---" in section, (
        f"{adr_path.name}: Options Considered must contain comparison table"
    )


def test_adr_numbers_unique_and_sequential():
    """Номера ADR должны быть уникальны и последовательны от 001."""
    files = _adr_files()
    numbers = []
    for p in files:
        m = ADR_FILENAME_RE.match(p.name)
        assert m is not None
        numbers.append(int(m.group(1)))
    assert len(numbers) == len(set(numbers)), "Duplicate ADR numbers"
    # Последовательность: 1, 2, 3, ... без пропусков
    assert numbers == list(range(1, len(numbers) + 1)), (
        f"ADR numbers not sequential: {numbers}"
    )


def test_all_adrs_listed_in_readme():
    """Каждый ADR-файл должен быть упомянут в docs/adr/README.md."""
    readme = (ADR_DIR / "README.md").read_text(encoding="utf-8")
    for adr_path in _adr_files():
        assert adr_path.name in readme, (
            f"{adr_path.name} not referenced in docs/adr/README.md"
        )


def test_readme_has_dependency_graph():
    """README должен содержать граф зависимостей ADR."""
    readme = (ADR_DIR / "README.md").read_text(encoding="utf-8")
    assert "Граф зависимостей" in readme or "dependency" in readme.lower(), (
        "README.md must contain dependency graph section"
    )


def test_adr_001_is_anchor_invariant():
    """ADR-001 должен быть про якорный инвариант 3000 млн ₽."""
    path = ADR_DIR / "ADR-001-anchor-invariant-3000-mln-rub.md"
    assert path.is_file(), "ADR-001 must exist at expected path"
    content = path.read_text(encoding="utf-8")
    assert "3000" in content and "млн" in content, (
        "ADR-001 must reference 3000 млн ₽ anchor"
    )


def test_adr_006_has_stage_gate_results():
    """ADR-006 должен содержать эмпирические результаты stage-gate."""
    path = ADR_DIR / "ADR-006-stage-gate-binomial-tree-sunk-cost.md"
    assert path.is_file()
    content = path.read_text(encoding="utf-8")
    # P(reach release) = 0.721
    assert "0.721" in content or "0.72" in content, (
        "ADR-006 must document P(reach release) ≈ 0.721"
    )


def test_adr_004_references_lhs_and_copula():
    """ADR-004 про эволюцию MC должен упоминать LHS и copula."""
    path = ADR_DIR / "ADR-004-monte-carlo-cholesky-to-lhs-copula.md"
    assert path.is_file()
    content = path.read_text(encoding="utf-8").lower()
    assert "lhs" in content and "copula" in content, (
        "ADR-004 must reference LHS and copula"
    )
