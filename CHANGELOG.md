# CHANGELOG — Investor Public v1.0.2 → v1.1.0

## v1.1.0 (2026-04-14) — Remediation Release

Remediation of 39 audit findings (DD-grade investor distribution).
Audit verdict: CONDITIONAL FAIL → target PASS.

### Phase 0 — Leakage & Metadata Sterilization (P0 CRITICAL)
- **R-001**: Scrubbed Internal W₅ V-D reference from 24_Investor_Returns!B49
- **R-002**: Removed 7 "Internal" occurrences from Public xlsx (preserved "Internal Rate of Return")
- **R-003**: Stripped x15ac:absPath from workbook.xml
- **R-004**: Cleaned docProps/core.xml (Author→TrendStudio, cleared description/keywords L3/lastModifiedBy)
- **R-024/F-033**: Fixed verify.py hardcoded 14 → len(INPUT_FILES) (was 18)
- **F-036**: Fixed dangling '=' sign in 17_Deal_Structures
- **F-039**: Deleted 35 backup/bak/FUSE/lock files from Investor_Package
- Added `pipeline/sterilize.py` with zip-level surgery + verify
- +34 new tests

### Phase 1 — IRR Unification + Math Hardening (P1 HIGH)
- **R-008/F-006**: Unified all IRR on `numpy_financial.irr` via `finance_core.compute_irr`
  - Replaced bisect method in `valuation.py`
  - Replaced MOIC^(1/6.5) in `build_A12` MC + tornado
- **R-009/F-016**: Fixed MC revenue blend +6% bias (intercept 0.85→0.79, E[blend]=1.00)
- **R-007/F-014**: Documented PROB_VECTOR_BASE = [0.05, 0.15, 0.50, 0.20, 0.10] as SSOT
- **R-012/F-012**: Smoothed D&A transition (3→175→348→520, was 3→500 = 167× jump)
- **R-013/F-013**: compute_moic + compute_payback in finance_core.py
- **R-018/F-027**: Tax separation documented (ННП 20% + НДС 0% cinema)
- +21 new tests

### Phase 2 — Peer Comps + Valuation Reconciliation (P1 HIGH)
- **R-010/F-015**: Source/Date/Link citations for all 6 peer comps
- **R-019/F-030**: Full CAPM build-up (5 components: Rf, β, ERP, Country, Size) with sources
- **R-011/F-007**: Floor/Fair/Ceiling valuation framework
- Cleaned "(internal)" from build_A14 comparable transactions
- +12 new tests

### Phase 3 — MC Upgrade (P1 HIGH)
- N: 2,000 → 50,000 (Sobol quasi-random sequences)
- Bootstrap CI 95% for mean EBITDA and P(EBITDA>anchor)
- Sobol sensitivity indices (first-order + total-order)
- Convergence diagnostics at N=10k/20k/50k
- Vectorized numpy simulation
- +16 new tests

### Phase 4 — Hybrid Live Formulas + Named Ranges (P2 MEDIUM)
- 7 Named Ranges: NDP_ANCHOR, HURDLE_RATE, WACC_BASE, EBITDA_3Y, INVESTMENT_T1, NET_PROFIT_3Y, PRODUCER_EQUITY
- DCF WACC cell → =WACC_BASE (live formula)
- `formula_injector.py` for reproducible injection
- +14 new tests

### Phase 5 — Stress Tests + Risk Calibration (P2 MEDIUM)
- **R-020/F-028**: Risk scoring rubric 5×5 (Probability × Impact)
- 5 stress scenarios: WACC+500bps, cost overrun +30%, timing +12mo, НДС+2%, combined
- Reverse stress: breakeven hit_rate calculated
- +14 new tests

### Phase 6 — Pipeline Hardening (P2 MEDIUM)
- **R-022/F-018**: requirements.txt pinned with ==
- **R-023/F-019**: Added plotly, python-pptx, numpy-financial to deps
- **R-025/F-017**: Replaced 3 hardcoded /Users/ paths with env var + fallback
- **F-038**: README updated (78→445+ tests, v1.1.0)
- +11 new tests

---

### Test Summary
| Metric | v1.0.2 Baseline | v1.1.0 |
|--------|----------------|--------|
| Tests passed | 323 | 445 |
| Tests skipped | 5 | 5 |
| Tests failed | 0 | 0 |
| New tests added | — | +122 |

### R-items Status (25 total)
| Status | Count |
|--------|-------|
| DONE | 22 |
| Partial (requires Cowork/LP package) | 3 |

### Findings Status (39 total)
| Severity | Total | Closed | Open |
|----------|-------|--------|------|
| CRITICAL | 5 | 5 | 0 |
| HIGH | 14 | 14 | 0 |
| MEDIUM | 15 | 13 | 2* |
| LOW | 5 | 4 | 1* |

*Remaining: F-032 (Cover Letter personalization — Cowork), F-035 (counter 62→45 — cosmetic), F-037 (Print_Area — requires LibreOffice).
