"""
generators/hash_manifest.py — манифест SHA-256 для воспроизводимости.

Обходит:
  - все YAML-файлы в inputs/
  - все .py-файлы в schemas/ и generators/
  - sys.version
Пишет logs/manifest.json.

Цель: любое изменение входов или кода меняет хэш-манифеста → тесты ловят дрейф.
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def build_manifest(
    pipeline_root: Path,
    run_context: Dict[str, float | int | str] | None = None,
) -> Dict:
    """
    Возвращает dict {
      'generated_at', 'python_version',
      'inputs_hashes': {filename: sha256},
      'schemas_hashes': {...},
      'generators_hashes': {...},
      'combined_hash': sha256 от всех трёх,
      'run_context': {...}  # произвольные метрики прогона
    }
    """
    pipeline_root = Path(pipeline_root)

    def _collect(subdir: str, pattern: str) -> Dict[str, str]:
        result: Dict[str, str] = {}
        base = pipeline_root / subdir
        if not base.exists():
            return result
        for p in sorted(base.rglob(pattern)):
            if "__pycache__" in p.parts:
                continue
            rel = p.relative_to(pipeline_root).as_posix()
            result[rel] = _sha256_file(p)
        return result

    inputs_h = _collect("inputs", "*.yaml")
    schemas_h = _collect("schemas", "*.py")
    generators_h = _collect("generators", "*.py")

    combined = hashlib.sha256()
    for h in (inputs_h, schemas_h, generators_h):
        for k in sorted(h.keys()):
            combined.update(k.encode("utf-8"))
            combined.update(h[k].encode("utf-8"))

    manifest = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "python_version": sys.version.split()[0],
        "pipeline_root": str(pipeline_root),
        "inputs_hashes": inputs_h,
        "schemas_hashes": schemas_h,
        "generators_hashes": generators_h,
        "combined_hash": combined.hexdigest(),
        "run_context": run_context or {},
    }
    return manifest


def write_manifest(manifest: Dict, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=False)


if __name__ == "__main__":
    import argparse, sys as _sys
    parser = argparse.ArgumentParser()
    parser.add_argument("--update", action="store_true", help="обновить logs/manifest.json")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    m = build_manifest(root, run_context={})
    write_manifest(m, root / "logs" / "manifest.json")
    print(f">>> manifest updated: combined_hash={m['combined_hash'][:16]}…")
    _sys.exit(0)
