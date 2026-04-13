"""
scripts/diff_runs.py — сравнение текущего прогона с предыдущим снимком.

Сравнивает:
  - combined_hash inputs/schemas/generators
  - якорное значение EBITDA Base
  - число предупреждений

Хранит предыдущий манифест в logs/previous_manifest.json.
При первом запуске фиксирует текущий как baseline.
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).parent.parent


def main() -> int:
    current_path = PIPELINE_ROOT / "logs" / "manifest.json"
    previous_path = PIPELINE_ROOT / "logs" / "previous_manifest.json"

    if not current_path.exists():
        print("!!! Нет logs/manifest.json — сначала запустите `make build`")
        return 1

    current = json.loads(current_path.read_text(encoding="utf-8"))

    if not previous_path.exists():
        shutil.copy(current_path, previous_path)
        print(">>> baseline зафиксирован как logs/previous_manifest.json")
        return 0

    previous = json.loads(previous_path.read_text(encoding="utf-8"))

    print(">>> Сравнение текущего прогона с предыдущим")
    print("─" * 70)

    def compare_hashes(section: str) -> None:
        cur = current.get(f"{section}_hashes", {})
        prv = previous.get(f"{section}_hashes", {})
        all_keys = set(cur) | set(prv)
        changed = [k for k in all_keys if cur.get(k) != prv.get(k)]
        added = [k for k in all_keys if k in cur and k not in prv]
        removed = [k for k in all_keys if k in prv and k not in cur]
        print(f"  {section}:")
        print(f"    изменено: {len(changed)}")
        for f in changed[:5]:
            if f in added:
                print(f"      + {f}")
            elif f in removed:
                print(f"      - {f}")
            else:
                print(f"      ~ {f}")

    compare_hashes("inputs")
    compare_hashes("schemas")
    compare_hashes("generators")

    def fmt(v, default="—"):
        return v if v is not None else default

    cur_ctx = current.get("run_context", {})
    prv_ctx = previous.get("run_context", {})
    print("─" * 70)
    print(f"  combined_hash: {current.get('combined_hash', '')[:16]}… vs {previous.get('combined_hash', '')[:16]}…")
    print(f"  anchor_actual: {fmt(cur_ctx.get('anchor_actual'))} vs {fmt(prv_ctx.get('anchor_actual'))}")
    print(f"  deviation_pct: {fmt(cur_ctx.get('anchor_deviation_pct'))} vs {fmt(prv_ctx.get('anchor_deviation_pct'))}")
    print("─" * 70)

    # Обновляем baseline
    shutil.copy(current_path, previous_path)
    print(">>> baseline обновлён")
    return 0


if __name__ == "__main__":
    sys.exit(main())
