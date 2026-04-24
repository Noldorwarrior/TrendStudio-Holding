#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
i18n_check.py — TrendStudio Landing v1.0 W1 i18n validator.

Проверяет landing_ru.json + landing_en.json на:
  (1) структурную симметрию ключей (INV-02)
  (2) формат ключей: ^[a-z][a-z0-9_.]*[a-z0-9]$, depth ≤ 5, 9 разрешённых namespace
  (3) непустые листья (warn-only — stub [TODO:W2 …] допустим)
  (4) total ∈ [400, 435]
  (5) cross-reference с canon_extended.visualizations[].id и .simulators[].id (warn-only)

Exit codes:
  0 — all checks passed
  1 — i18n asymmetry (set(ru) ≠ set(en))
  2 — unknown namespace (root ≠ one of 9 whitelisted)
  3 — invalid key format (pattern или depth)
  4 — range out of [400, 435]

--strict      — WARN трактуется как FAIL (любой warning → exit ≠ 0; код = 10 + первый класс warning'а)
--quiet       — тишина если всё OK, печатать только WARN/FAIL
--wave        — контекст волны (W1..W6); смягчает определённые WARN-классы для ранних волн:
                W1: WARN 4 (sim_id не в i18n) → INFO (ожидаемо, наполнение в W2)

Zero external deps (stdlib only). Python 3.8+.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

# ------------------------------ constants ------------------------------

ALLOWED_NAMESPACES = frozenset({
    "ui", "a11y", "narrative", "legal", "chart",
    "control", "modal", "form", "faq",
})

KEY_PATTERN = re.compile(r"^[a-z][a-z0-9_.]*[a-z0-9]$")
MAX_DEPTH = 5
RANGE_MIN = 400
RANGE_MAX = 435

# Default paths — resolved from script location. Override via --paths.
# Script lives in /Холдинг/scripts/ or /TrendStudio-Holding/scripts/.
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT_CANDIDATES = [SCRIPT_DIR.parent]  # parent of scripts/

DEFAULT_RU = "i18n/landing_ru.json"
DEFAULT_EN = "i18n/landing_en.json"
DEFAULT_CANON_EXT_CANDIDATES = [
    "data/landing_canon_extended_v1.0.json",           # /Холдинг/
    "data_extract/landing_canon_extended_v1.0.json",   # /TrendStudio-Holding/
    "landing_canon_extended_v1.0.json",                # fallback: repo root
]


# ------------------------------ helpers ------------------------------

def _flatten(d: Any, prefix: str = "") -> List[Tuple[str, Any]]:
    """Yield (dotted_key, leaf_value) pairs from nested dict."""
    out: List[Tuple[str, Any]] = []
    if isinstance(d, dict):
        for k, v in d.items():
            key = f"{prefix}.{k}" if prefix else str(k)
            out.extend(_flatten(v, key))
    else:
        out.append((prefix, d))
    return out


def _depth(key: str) -> int:
    return key.count(".") + 1


def _resolve_path(p: str) -> Path:
    """Resolve a relative path against repo root candidates."""
    pp = Path(p)
    if pp.is_absolute():
        return pp
    for root in REPO_ROOT_CANDIDATES:
        candidate = root / pp
        if candidate.exists():
            return candidate
    # fallback: first candidate (may not exist — caller handles)
    return REPO_ROOT_CANDIDATES[0] / pp


def _resolve_canon_ext() -> Path | None:
    for c in DEFAULT_CANON_EXT_CANDIDATES:
        p = _resolve_path(c)
        if p.exists():
            return p
    return None


# ------------------------------ check functions ------------------------------

class CheckResult:
    __slots__ = ("fail_code", "warnings", "infos", "summary")

    def __init__(self) -> None:
        self.fail_code: int = 0     # 0 or one of {1,2,3,4}
        self.warnings: List[Tuple[int, str]] = []  # (warn_class, message); warn_class ∈ {1,2,3,4,5}
        self.infos: List[Tuple[int, str]] = []     # WARN, понижённые до INFO по wave-политике
        self.summary: Dict[str, Any] = {}


# Wave-политики смягчения WARN → INFO:
#   W1: допустимо что sim_id (WARN 4) ещё не в i18n — наполнение в W2.
WAVE_WARN_DEMOTIONS: Dict[str, Set[int]] = {
    "W1": {4},
    "W2": set(),
    "W3": set(),
    "W4": set(),
    "W5": set(),
    "W6": set(),
}


def check_i18n(
    ru_path: Path,
    en_path: Path,
    canon_ext_path: Path | None,
    wave: str | None = None,
) -> CheckResult:
    res = CheckResult()

    # ---- load ----
    if not ru_path.exists():
        print(f"[FAIL] RU file not found: {ru_path}", file=sys.stderr)
        res.fail_code = 1
        return res
    if not en_path.exists():
        print(f"[FAIL] EN file not found: {en_path}", file=sys.stderr)
        res.fail_code = 1
        return res

    try:
        ru_data = json.loads(ru_path.read_text(encoding="utf-8"))
        en_data = json.loads(en_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[FAIL] JSON parse error: {e}", file=sys.stderr)
        res.fail_code = 1
        return res

    ru_flat = _flatten(ru_data)
    en_flat = _flatten(en_data)

    ru_keys: Set[str] = {k for k, _ in ru_flat}
    en_keys: Set[str] = {k for k, _ in en_flat}

    res.summary["ru_keys"] = len(ru_keys)
    res.summary["en_keys"] = len(en_keys)
    res.summary["ru_file"] = str(ru_path)
    res.summary["en_file"] = str(en_path)

    # ---- (1) symmetry ----
    missing_in_en = ru_keys - en_keys
    missing_in_ru = en_keys - ru_keys
    if missing_in_en or missing_in_ru:
        print(f"[FAIL] i18n asymmetry: ru-only={len(missing_in_en)} en-only={len(missing_in_ru)}",
              file=sys.stderr)
        for k in sorted(missing_in_en)[:10]:
            print(f"  RU-only: {k}", file=sys.stderr)
        for k in sorted(missing_in_ru)[:10]:
            print(f"  EN-only: {k}", file=sys.stderr)
        res.fail_code = 1
        return res

    all_keys = ru_keys  # == en_keys after symmetry passed
    res.summary["total_keys"] = len(all_keys)

    # ---- (2) namespace whitelist ----
    bad_ns: List[str] = []
    for k in all_keys:
        ns = k.split(".", 1)[0]
        if ns not in ALLOWED_NAMESPACES:
            bad_ns.append(k)
    if bad_ns:
        print(f"[FAIL] unknown namespace in {len(bad_ns)} keys:", file=sys.stderr)
        for k in sorted(bad_ns)[:10]:
            print(f"  {k}", file=sys.stderr)
        res.fail_code = 2
        return res

    # ---- (3) key pattern + depth ----
    bad_pattern: List[str] = []
    bad_depth: List[Tuple[str, int]] = []
    for k in all_keys:
        for segment in k.split("."):
            if not KEY_PATTERN.match(segment):
                bad_pattern.append(k)
                break
        if _depth(k) > MAX_DEPTH:
            bad_depth.append((k, _depth(k)))
    if bad_pattern:
        print(f"[FAIL] invalid key pattern in {len(bad_pattern)} keys:", file=sys.stderr)
        for k in sorted(bad_pattern)[:10]:
            print(f"  {k}", file=sys.stderr)
        res.fail_code = 3
        return res
    if bad_depth:
        print(f"[FAIL] key depth > {MAX_DEPTH} in {len(bad_depth)} keys:", file=sys.stderr)
        for k, d in sorted(bad_depth)[:10]:
            print(f"  {k} (depth={d})", file=sys.stderr)
        res.fail_code = 3
        return res

    # ---- (4) range ----
    total = len(all_keys)
    if total < RANGE_MIN or total > RANGE_MAX:
        print(f"[FAIL] total keys {total} out of range [{RANGE_MIN}, {RANGE_MAX}]",
              file=sys.stderr)
        res.fail_code = 4
        return res

    # ---- (5) empty values — WARN ----
    empty_ru = [k for k, v in ru_flat if isinstance(v, str) and not v.strip()]
    empty_en = [k for k, v in en_flat if isinstance(v, str) and not v.strip()]
    if empty_ru:
        res.warnings.append((1, f"{len(empty_ru)} empty RU leaves (e.g. {empty_ru[0]})"))
    if empty_en:
        res.warnings.append((1, f"{len(empty_en)} empty EN leaves (e.g. {empty_en[0]})"))

    # ---- (6) cross-reference with canon_extended — WARN ----
    if canon_ext_path is not None and canon_ext_path.exists():
        try:
            canon = json.loads(canon_ext_path.read_text(encoding="utf-8"))
            # visualizations / simulators могут быть либо list, либо dict с ключом items[]
            viz_block = canon.get("visualizations", [])
            sim_block = canon.get("simulators", [])
            viz_items = (viz_block.get("items", []) if isinstance(viz_block, dict)
                         else viz_block)
            sim_items = (sim_block.get("items", []) if isinstance(sim_block, dict)
                         else sim_block)
            viz_ids = [v["id"] for v in viz_items
                       if isinstance(v, dict) and "id" in v]
            sim_ids = [s["id"] for s in sim_items
                       if isinstance(s, dict) and "id" in s]
            res.summary["canon_viz_count"] = len(viz_ids)
            res.summary["canon_sim_count"] = len(sim_ids)

            # For each viz: expect chart.{id}.* and a11y.viz.{id}.*
            missing_chart_viz = [
                vid for vid in viz_ids
                if not any(k.startswith(f"chart.{vid}.") for k in all_keys)
            ]
            missing_a11y_viz = [
                vid for vid in viz_ids
                if not any(k.startswith(f"a11y.viz.{vid}.") or k == f"a11y.viz.{vid}"
                           for k in all_keys)
            ]
            if missing_chart_viz:
                res.warnings.append((
                    2,
                    f"{len(missing_chart_viz)} viz_id без chart.* ключей "
                    f"(e.g. {missing_chart_viz[0]})",
                ))
            if missing_a11y_viz:
                res.warnings.append((
                    3,
                    f"{len(missing_a11y_viz)} viz_id без a11y.viz.* ключей "
                    f"(e.g. {missing_a11y_viz[0]})",
                ))

            # Sim_ids: expect presence somewhere in modal.drilldown.* or control.*
            missing_sim = [
                sid for sid in sim_ids
                if not any(sid in k for k in all_keys)
            ]
            if missing_sim:
                res.warnings.append((
                    4,
                    f"{len(missing_sim)} sim_id не встречается в i18n-ключах "
                    f"(e.g. {missing_sim[0]}) — допустимо на W1, "
                    f"fill в W2/W3",
                ))
        except (json.JSONDecodeError, KeyError) as e:
            res.warnings.append((5, f"canon_extended parse error: {e}"))
    else:
        res.warnings.append((5, "canon_extended not found — cross-reference skipped"))

    # ---- wave-aware demotion WARN → INFO ----
    if wave and wave in WAVE_WARN_DEMOTIONS:
        demote = WAVE_WARN_DEMOTIONS[wave]
        if demote:
            kept: List[Tuple[int, str]] = []
            for wcode, msg in res.warnings:
                if wcode in demote:
                    res.infos.append((wcode, f"[{wave}-ok] {msg}"))
                else:
                    kept.append((wcode, msg))
            res.warnings = kept

    return res


# ------------------------------ CLI ------------------------------

def _report(res: CheckResult, quiet: bool) -> None:
    s = res.summary
    ok = res.fail_code == 0
    if not quiet or not ok:
        print("── i18n_check.py ──────────────────────────────────────────")
        if "ru_keys" in s:
            print(f"  RU keys : {s['ru_keys']}")
            print(f"  EN keys : {s['en_keys']}")
        if "total_keys" in s:
            print(f"  Total   : {s['total_keys']}  (range [{RANGE_MIN}, {RANGE_MAX}])")
        if "canon_viz_count" in s:
            print(f"  Canon   : {s['canon_viz_count']} viz, {s['canon_sim_count']} sim")
        for wcode, msg in res.warnings:
            print(f"  [WARN {wcode}] {msg}")
        for wcode, msg in res.infos:
            print(f"  [INFO {wcode}] {msg}")
        print(f"  STATUS  : {'PASS' if ok else f'FAIL (exit {res.fail_code})'}")
        print("───────────────────────────────────────────────────────────")


def main(argv: List[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="TrendStudio Landing v1.0 i18n validator (W1).",
        allow_abbrev=False,
    )
    ap.add_argument("--ru", default=DEFAULT_RU, help=f"landing_ru.json path (default: {DEFAULT_RU})")
    ap.add_argument("--en", default=DEFAULT_EN, help=f"landing_en.json path (default: {DEFAULT_EN})")
    ap.add_argument("--canon-ext", default=None,
                    help="landing_canon_extended_v1.0.json path (auto-detected if omitted)")
    ap.add_argument("--strict", action="store_true",
                    help="WARN → FAIL (exit 10 + warn_class)")
    ap.add_argument("--quiet", action="store_true",
                    help="Print only WARN/FAIL; silent on PASS")
    ap.add_argument("--wave", choices=list(WAVE_WARN_DEMOTIONS.keys()),
                    help="Wave context (W1..W6); смягчает определённые WARN-классы")
    args = ap.parse_args(argv)

    ru_path = _resolve_path(args.ru)
    en_path = _resolve_path(args.en)
    canon_path = (_resolve_path(args.canon_ext) if args.canon_ext
                  else _resolve_canon_ext())

    res = check_i18n(ru_path, en_path, canon_path, wave=args.wave)
    _report(res, args.quiet)

    if res.fail_code != 0:
        return res.fail_code
    if args.strict and res.warnings:
        wcode = res.warnings[0][0]
        return 10 + wcode  # exit 11..15
    return 0


if __name__ == "__main__":
    sys.exit(main())
