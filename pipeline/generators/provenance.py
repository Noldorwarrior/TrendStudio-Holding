"""
generators/provenance.py — реестр source_id + цепочка происхождения данных.

Собирает все source_id из ValidatedInputs и строит таблицу:
  source_id | used_in_files | confidence | last_updated

I/O: пишет logs/provenance.json (если dst передан).
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from schemas.inputs import INPUT_FILES, ValidatedInputs


@dataclass
class ProvenanceEntry:
    source_id: str
    used_in_files: List[str] = field(default_factory=list)
    confidence: Optional[str] = None
    last_updated: Optional[str] = None
    title: Optional[str] = None


@dataclass
class ProvenanceRegistry:
    entries: Dict[str, ProvenanceEntry] = field(default_factory=dict)

    def add(
        self,
        source_id: str,
        used_in: str,
        confidence: Optional[str] = None,
        last_updated: Optional[str] = None,
        title: Optional[str] = None,
    ) -> None:
        if source_id not in self.entries:
            self.entries[source_id] = ProvenanceEntry(source_id=source_id)
        entry = self.entries[source_id]
        if used_in not in entry.used_in_files:
            entry.used_in_files.append(used_in)
        if confidence and not entry.confidence:
            entry.confidence = confidence
        if last_updated and not entry.last_updated:
            entry.last_updated = last_updated
        if title and not entry.title:
            entry.title = title

    def to_dict(self) -> Dict:
        return {
            "count": len(self.entries),
            "entries": [asdict(e) for e in self.entries.values()],
        }

    def write(self, dst: Path) -> None:
        dst.parent.mkdir(parents=True, exist_ok=True)
        with open(dst, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)


def _collect_from_meta(obj, registry: ProvenanceRegistry, filename: str) -> None:
    """Извлечь source_id/confidence/last_updated из объекта с полем .meta."""
    meta = getattr(obj, "meta", None)
    if meta is None:
        return
    sid = getattr(meta, "source_id", None)
    if not sid:
        return
    registry.add(
        source_id=sid,
        used_in=filename,
        confidence=getattr(meta, "confidence", None),
        last_updated=getattr(meta, "last_updated", None),
        title=getattr(meta, "source_title", None),
    )


def build_provenance(inputs: ValidatedInputs) -> ProvenanceRegistry:
    """Обходит все 14 загруженных YAML и собирает реестр source_id."""
    registry = ProvenanceRegistry()

    # INPUT_FILES: {alias: schema_class}. Файл на диске — {alias}.yaml.
    for alias in INPUT_FILES.keys():
        filename = f"{alias}.yaml"
        obj = getattr(inputs, alias, None)
        if obj is None:
            continue
        _collect_from_meta(obj, registry, filename)

    # Дополнительно собираем source_id из вложенных структур
    # (WACC methodologies, revenue recognition и пр.)
    if hasattr(inputs, "valuation") and inputs.valuation:
        for m in inputs.valuation.wacc_methodologies:
            registry.add(
                source_id=m.source_id,
                used_in="valuation.yaml",
                title=f"WACC method: {m.method_id}",
            )

    if hasattr(inputs, "cinema") and inputs.cinema:
        rr = inputs.cinema.revenue_recognition
        registry.add(
            source_id=rr.source_id,
            used_in="cinema.yaml",
            title="Revenue recognition policy (cinema)",
        )

    return registry
