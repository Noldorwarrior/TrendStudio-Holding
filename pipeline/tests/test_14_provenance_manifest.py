"""
test_14_provenance_manifest.py — provenance registry + hash manifest (5 тестов).
"""
from pathlib import Path

import pytest

from generators.provenance import build_provenance
from generators.hash_manifest import build_manifest


PIPELINE_ROOT = Path(__file__).parent.parent


def test_provenance_entries_nonempty(inputs):
    """Реестр source_id не пустой (dict)."""
    prov = build_provenance(inputs)
    assert isinstance(prov.entries, dict)
    assert len(prov.entries) > 0


def test_provenance_covers_many_files(inputs):
    """Entries ссылаются на ≥ 10 разных файлов через used_in_files."""
    prov = build_provenance(inputs)
    files_seen = set()
    for entry in prov.entries.values():
        for f in getattr(entry, "used_in_files", []):
            files_seen.add(f)
    assert len(files_seen) >= 10, f"only {len(files_seen)} files referenced"


def test_manifest_has_combined_hash():
    """build_manifest содержит combined_hash (SHA-256 hex, ≥ 60 символов)."""
    manifest = build_manifest(PIPELINE_ROOT, run_context={"anchor_actual": 3000.0})
    assert "combined_hash" in manifest
    assert len(manifest["combined_hash"]) >= 60  # SHA-256 hex / truncated


def test_manifest_includes_all_15_yaml_inputs():
    """Все 18 YAML-файлов присутствуют в inputs_hashes манифеста (v1.3.7: +eais_sources)."""
    manifest = build_manifest(PIPELINE_ROOT, run_context={})
    inputs_hashes = manifest.get("inputs_hashes", {})
    yaml_files = [f for f in inputs_hashes if f.endswith(".yaml")]
    assert len(yaml_files) == 18, f"expected 18, got {len(yaml_files)}"
    assert any("fx_pass_through" in f for f in yaml_files), "fx_pass_through.yaml not in manifest"
    assert any("stress_matrix" in f for f in yaml_files), "stress_matrix.yaml not in manifest"
    assert any("hedge" in f for f in yaml_files), "hedge.yaml not in manifest"
    assert any("eais_sources" in f for f in yaml_files), "eais_sources.yaml not in manifest"


def test_manifest_deterministic_same_sources():
    """Повторная сборка манифеста даёт тот же combined_hash при тех же файлах."""
    m1 = build_manifest(PIPELINE_ROOT, run_context={"x": 1})
    m2 = build_manifest(PIPELINE_ROOT, run_context={"x": 1})
    assert m1["combined_hash"] == m2["combined_hash"]
