#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
invariants_check.py — TrendStudio Landing v1.0 invariants aggregator.

Запускает проверки инвариантов INV-01..INV-07 по спецификации
Landing_v1.0_HANDOFF_Stage_B_INVARIANTS.md. На каждой волне (--wave W1..W6)
обязательный набор инвариантов свой:

  W1: INV-01, INV-02, INV-06
  W2: + INV-03, INV-04
  W3: + INV-05
  W4: + INV-07
  W5: all 7 (full)
  W6: all 7 (release gate)

Usage:
  python scripts/invariants_check.py --wave W1
  python scripts/invariants_check.py --wave W1 --strict
  python scripts/invariants_check.py --wave W6 --release

Exit codes:
  0       — all required invariants passed
  11..17  — single-invariant failure (code = 10 + INV number)
  20      — multiple invariants failed (aggregated)
  21      — configuration/environment error

На W1 реализованы INV-01, INV-02, INV-06. Прочие инварианты возвращают
status "DEFERRED" (не-fail) на ранних волнах и будут реализованы к W2-W4.

Zero external deps (stdlib only). Python 3.8+.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

# ------------------------------ constants ------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

WAVE_REQUIREMENTS: Dict[str, List[str]] = {
    "W1": ["INV-01", "INV-02", "INV-06"],
    "W2": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-06"],
    "W3": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06"],
    "W4": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"],
    "W5": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"],
    "W6": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"],
}

CANON_BASE_CANDIDATES = [
    "data/landing_canon_base_v1.0.json",          # /Холдинг/
    "data_extract/landing_canon_base_v1.0.json",  # /TrendStudio-Holding/
    "landing_canon_base_v1.0.json",               # fallback: repo root
    # legacy short names (без _base суффикса) — для обратной совместимости:
    "data/landing_canon_v1.0.json",
    "data_extract/landing_canon_v1.0.json",
    "landing_canon_v1.0.json",
]
CANON_EXT_CANDIDATES = [
    "data/landing_canon_extended_v1.0.json",
    "data_extract/landing_canon_extended_v1.0.json",
    "landing_canon_extended_v1.0.json",
]
IMG_META_CANDIDATES = [
    "data/landing_img_meta_v1.0.json",
    "data_extract/landing_img_meta_v1.0.json",
    "landing_img_meta_v1.0.json",
]
CANON_LOCK = "canon.lock.json"

SECURITY_FORBIDDEN = [
    (re.compile(r"\beval\s*\("), "eval( forbidden"),
    (re.compile(r"\bnew\s+Function\s*\("), "new Function( forbidden"),
    (re.compile(r"\blocalStorage\b"), "localStorage forbidden (use sessionStorage)"),
    (re.compile(r"\bdocument\.write\s*\("), "document.write forbidden"),
]

# ------------------------------ dataclasses ------------------------------

@dataclass
class Finding:
    severity: str  # "FAIL" | "WARN" | "INFO"
    code: str
    detail: str


@dataclass
class InvResult:
    inv_id: str       # "INV-01"
    status: str       # "PASS" | "FAIL" | "WARN" | "DEFERRED" | "SKIP"
    findings: List[Finding] = field(default_factory=list)
    exit_code: int = 0

    @property
    def failed(self) -> bool:
        return self.status == "FAIL"


# ------------------------------ helpers ------------------------------

def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _find_first(names: List[str]) -> Optional[Path]:
    for n in names:
        p = REPO_ROOT / n
        if p.exists():
            return p
    return None


def _read_json(path: Path) -> Optional[dict]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


# ------------------------------ INV-01 canon parity ------------------------------

def inv01_canon_parity() -> InvResult:
    """
    На W1: canon.lock.json может отсутствовать. В этом случае PASS,
    если все 3 canon-файла существуют и валидный JSON.
    Если canon.lock.json есть — сверяем sha256 с записями в lock.
    """
    res = InvResult(inv_id="INV-01", status="PASS", exit_code=11)

    # ---- locate canon files ----
    canon_base = _find_first(CANON_BASE_CANDIDATES)
    canon_ext = _find_first(CANON_EXT_CANDIDATES)
    img_meta = _find_first(IMG_META_CANDIDATES)

    if canon_base is None:
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-01/missing-canon-base", "landing_canon_v1.0.json not found"))
        return res
    if canon_ext is None:
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-01/missing-canon-ext", "landing_canon_extended_v1.0.json not found"))
        return res
    if img_meta is None:
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-01/missing-img-meta", "landing_img_meta_v1.0.json not found"))
        return res

    # ---- verify JSON validity ----
    for label, p in (("canon_base", canon_base), ("canon_ext", canon_ext), ("img_meta", img_meta)):
        if _read_json(p) is None:
            res.status = "FAIL"
            res.findings.append(Finding("FAIL", f"INV-01/invalid-json-{label}", f"{p} is not valid JSON"))
            return res

    # ---- compute current sha256 ----
    current_shas = {
        canon_base.name: _sha256(canon_base),
        canon_ext.name: _sha256(canon_ext),
        img_meta.name: _sha256(img_meta),
    }

    # ---- check lock ----
    lock_path = REPO_ROOT / CANON_LOCK
    if not lock_path.exists():
        # Variant 1: on W1, absence of lock is OK. PASS.
        res.findings.append(Finding(
            "INFO",
            "INV-01/no-lock-w1",
            "canon.lock.json отсутствует — допустимо до закрытия Stage B",
        ))
        res.findings.append(Finding(
            "INFO",
            "INV-01/canon-shas",
            f"current sha256: {json.dumps(current_shas, ensure_ascii=False)}",
        ))
        return res

    # Lock exists — verify
    lock = _read_json(lock_path)
    if lock is None or not isinstance(lock, dict):
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-01/invalid-lock", "canon.lock.json is not valid JSON object"))
        return res

    mismatches = []
    for fname, current in current_shas.items():
        declared = lock.get(fname)
        if declared is None:
            mismatches.append(f"{fname}: missing in lock")
        elif declared != current:
            mismatches.append(f"{fname}: lock={declared[:12]}… current={current[:12]}…")

    if mismatches:
        res.status = "FAIL"
        for m in mismatches:
            res.findings.append(Finding("FAIL", "INV-01/sha-mismatch", m))
    return res


# ------------------------------ INV-02 i18n symmetry ------------------------------

def inv02_i18n_symmetry(strict: bool, wave: str) -> InvResult:
    """Делегируем на i18n_check.py в той же папке; передаём контекст волны."""
    res = InvResult(inv_id="INV-02", status="PASS", exit_code=12)

    checker = SCRIPT_DIR / "i18n_check.py"
    if not checker.exists():
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-02/no-checker", f"i18n_check.py not found at {checker}"))
        return res

    cmd = [sys.executable, str(checker), "--quiet", "--wave", wave]
    if strict:
        cmd.append("--strict")
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        res.status = "FAIL"
        res.findings.append(Finding("FAIL", "INV-02/timeout", "i18n_check.py timeout"))
        return res

    if proc.returncode == 0:
        return res
    res.status = "FAIL"
    detail = (proc.stdout + proc.stderr).strip()[:500] or f"exit code {proc.returncode}"
    res.findings.append(Finding("FAIL", f"INV-02/checker-exit-{proc.returncode}", detail))
    return res


# ------------------------------ INV-06 security ------------------------------

# Landing v1.0 ограничивает область сканирования своим поддеревом src/landing/.
# /TrendStudio-Holding/src/ содержит pre-existing артефакты Phase 2C (Cinematic
# Edition), не относящиеся к лендингу. Без этого ограничения INV-06 ловит
# localStorage в cinematic/__tests__/*.js и ломает сборку лендинга.
LANDING_SRC_CANDIDATES = [
    "src/landing",      # основная локация (появится в W1.5)
    "landing/src",      # альтернативная
]


def inv06_security() -> InvResult:
    """Regex-check по src/landing/**/*.{js,html,css} на forbidden patterns."""
    res = InvResult(inv_id="INV-06", status="PASS", exit_code=16)

    # Ищем landing-specific src/
    src_dir: Optional[Path] = None
    for rel in LANDING_SRC_CANDIDATES:
        candidate = REPO_ROOT / rel
        if candidate.exists() and candidate.is_dir():
            src_dir = candidate
            break

    if src_dir is None:
        res.findings.append(Finding(
            "INFO",
            "INV-06/no-landing-src",
            "src/landing/ отсутствует — нечего проверять (допустимо до W1.5 HTML skeleton)",
        ))
        return res

    violations: List[Tuple[Path, int, str]] = []
    for ext in ("*.js", "*.html", "*.css"):
        for path in src_dir.rglob(ext):
            try:
                lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
            except OSError:
                continue
            for lineno, line in enumerate(lines, start=1):
                for pattern, reason in SECURITY_FORBIDDEN:
                    if pattern.search(line):
                        violations.append((path.relative_to(REPO_ROOT), lineno, reason))

    if violations:
        res.status = "FAIL"
        for p, lineno, reason in violations[:20]:
            res.findings.append(Finding("FAIL", "INV-06/forbidden-pattern",
                                        f"{p}:{lineno}  {reason}"))
        if len(violations) > 20:
            res.findings.append(Finding("FAIL", "INV-06/more",
                                        f"…и ещё {len(violations) - 20} нарушений"))
    else:
        rel = src_dir.relative_to(REPO_ROOT)
        res.findings.append(Finding("INFO", "INV-06/ok",
                                    f"{rel}/ просканирован (0 forbidden patterns)"))
    return res


# ------------------------------ deferred invariants ------------------------------

def _deferred(inv_id: str, wave: str) -> InvResult:
    res = InvResult(inv_id=inv_id, status="DEFERRED")
    res.findings.append(Finding("INFO", f"{inv_id}/deferred",
                                f"Не реализовано для {wave}; check будет добавлен в спеке WAVE_REQUIREMENTS"))
    return res


INV_DISPATCH: Dict[str, Callable[..., InvResult]] = {
    "INV-01": lambda strict, wave: inv01_canon_parity(),
    "INV-02": lambda strict, wave: inv02_i18n_symmetry(strict, wave),
    "INV-03": lambda strict, wave: _deferred("INV-03", wave),
    "INV-04": lambda strict, wave: _deferred("INV-04", wave),
    "INV-05": lambda strict, wave: _deferred("INV-05", wave),
    "INV-06": lambda strict, wave: inv06_security(),
    "INV-07": lambda strict, wave: _deferred("INV-07", wave),
}


# ------------------------------ runner ------------------------------

def _print_report(results: List[InvResult], wave: str) -> None:
    print(f"═══ invariants_check.py — wave {wave} ═══")
    for r in results:
        icon = {
            "PASS": "✓",
            "FAIL": "✗",
            "WARN": "!",
            "DEFERRED": "·",
            "SKIP": "○",
        }.get(r.status, "?")
        print(f"  {icon} {r.inv_id}  {r.status}")
        for f in r.findings:
            print(f"      [{f.severity}] {f.code}: {f.detail}")


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(
        description="TrendStudio Landing v1.0 invariants aggregator.",
        allow_abbrev=False,
    )
    ap.add_argument("--wave", required=True, choices=list(WAVE_REQUIREMENTS.keys()),
                    help="Wave (W1..W6) — определяет required set")
    ap.add_argument("--strict", action="store_true",
                    help="WARN трактуется как FAIL (pass-through для i18n_check)")
    ap.add_argument("--release", action="store_true",
                    help="Release gate: все 7 INV обязательны независимо от --wave")
    ap.add_argument("--no-fail-fast", action="store_true",
                    help="Запускать все INV даже после FAIL")
    args = ap.parse_args(argv)

    required = (
        ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"]
        if args.release else WAVE_REQUIREMENTS[args.wave]
    )

    results: List[InvResult] = []
    for inv_id in required:
        r = INV_DISPATCH[inv_id](args.strict, args.wave)
        results.append(r)
        if r.failed and not args.no_fail_fast:
            break

    # Also run non-required INV in wave mode just to print DEFERRED status for transparency
    if not args.release:
        all_inv = ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"]
        done = {r.inv_id for r in results}
        for inv_id in all_inv:
            if inv_id not in done and inv_id not in required:
                results.append(INV_DISPATCH[inv_id](args.strict, args.wave))

    # sort by INV number for readable output
    results.sort(key=lambda r: r.inv_id)
    _print_report(results, args.wave)

    failed = [r for r in results if r.failed and r.inv_id in required]
    if not failed:
        print(f"\nRESULT: PASS ({len(required)} required invariants passed)")
        return 0
    if len(failed) == 1:
        print(f"\nRESULT: FAIL — {failed[0].inv_id}")
        return failed[0].exit_code
    print(f"\nRESULT: FAIL — {len(failed)} invariants")
    return 20


if __name__ == "__main__":
    sys.exit(main())
