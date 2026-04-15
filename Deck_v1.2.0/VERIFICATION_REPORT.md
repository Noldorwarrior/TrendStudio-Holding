# Verification Report — Phase 1

**Date:** 2026-04-15
**Version:** v1.2.0-phase1
**Branch:** claude/deck-v1.2.0-phase1-44503

## Gate Results

| # | Gate | Result | Details |
|---|------|--------|--------|
| G1 | `build_html.py --verify` | PASS | 0 errors |
| G2 | `brand_lint.js` | PASS | 0 violations, 61 files checked |
| G3 | i18n audit (Cyrillic in src/) | PASS | 0 violations |
| G4 | Canvas a11y | PASS | All canvases in accessible `<figure>` wrappers |
| G5 | Size budget | PASS | 221,443 bytes (49% of 450,000 budget) |
| G6 | Security (eval/Function) | PASS | None found |
| G7 | SSOT sanity checks | PASS | mc_mean_irr=11.44, ndp_3y=3000, revenue_3y=4545, ebitda_3y=2167 (xlsx-sourced, non-circular) |

## Playwright Tests (offline verification)

| Test | Description | Expected |
|------|-------------|----------|
| G1 | All 25 slides present | 25 `#slide-N` elements |
| G2 | Navigation forward/backward | ArrowRight/Left works |
| G3 | No console errors on load | 0 error messages |
| G4 | No failed network requests | 0 failures (excluding favicon) |
| G5 | Canvas a11y | 0 unlabeled canvases |
| G6 | Skip link exists | `#skip-link` present |
| G7 | Live region exists | `#a11y-live` with aria-live |
| G8 | Nav indicator updates | Shows current/total |
| G9 | Security scan | No eval()/new Function() |
| G10 | Transition speed | <300ms |
| G11 | Full walkthrough | 25 slides, 0 errors |
| G12 | Memory leak test | 50 random navs, heap <+10% |

## LP-Critical Charts (8/8 implemented)

| Slide | Chart Type | Data Source | Status |
|-------|-----------|-------------|--------|
| S02 | Bar (4 metrics) | TS.slide(2).stats | Real chart |
| S05 | Horizontal bar (Gantt) | TS.chartData('s05_pipeline') | Real chart |
| S12 | Grouped bar (scenarios) | TS.chartData('s12_unit_economics') | Real chart |
| S14 | D3 Waterfall (valuation) | TS.chartData('s14_valuation') | Real chart |
| S17 | Histogram (MC IRR) | TS.chartData('s17_mc_distribution') | Real chart |
| S18 | Bar (Det vs Stoch) | TS.chartData('s18_det_vs_stoch') | Real chart |
| S20 | Horizontal bar (risks) | TS.chartData('s20_top_risks') | Real chart |
| S22 | D3 Waterfall (W3) | TS.chartData('s22_waterfall') | Real chart |

## Files Inventory

- Infrastructure: 11 files (theme, macros, components, orchestrator, a11y, 5 layouts)
- Scripts: 4 files (build_html.py, lint.js, extract_investor_model.py, extract_i18n.py)
- Data: 3 files (deck_data_v1.2.0.json, ru.json, en.json)
- Slides: 50 files (25 html + 25 js)
- QA: 3 files (playwright_suite.js, axe_core.js, brand_lint.js)
- Reports: brand_lint_phase1.json
- Docs: 4 files (CHANGELOG, VERIFICATION_REPORT, brand_guidelines, TODO_MISSING_DATA)
- Handoffs: 36 files
- **Total: ~111 files**

## Bugfix v1 (2026-04-15): MC/NDP extract corrected

**Root cause:** `extract_investor_model.py` read MC metrics and NDP from legacy `Deck_v1.1.1/deck_content.json` (snapshot before v3 pipeline restructuring) instead of xlsx `28_Monte_Carlo_Summary` / `21_KPI_Dashboard`.

**Impact:**
- `mc_mean_irr`: 7.24% → **11.44%** (~4pp understatement corrected)
- `ndp_3y`: 1385 → **3000** (P10 MC was substituting deterministic NDP)
- s17 percentiles: regenerated from xlsx IRR row (P5=-0.41, P25=7.97, Median=12.0, Mean=11.44, P75=15.72, P95=21.11)
- s17 bins: rebuilt from N(mu=11.44, sigma=6.47), no longer hardcoded
- s18 hardcode `7.24` x 3: removed, now reads from `metrics.mc_mean_irr`
- New fields: `mc_stdev_irr=6.47`, `ndp_mc_mean=2104.06`, `ndp_mc_p10=1381.87`
- Sanity checks: now xlsx-sourced (non-circular)

**Files changed:**
- `data_extract/extract_investor_model.py`
- `data_extract/deck_data_v1.2.0.json`
- `src/slides/s17.js`
- `src/slides/s18.js`
- `i18n/ru.json`
- `Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html` (rebuilt)
- `Deck_v1.2.0/VERIFICATION_REPORT.md`
- `Deck_v1.2.0/TODO_MISSING_DATA.md`

## Bugfix v2 (2026-04-15): P&L NDP row + investor_returns structure

**P5 Block B re-review identified 2 blockers on HEAD e85b2de:**

### B-1: P&L NDP row arithmetic inconsistency

**Problem:** `financial.pl_summary.rows` NDP row had y1=75, y2=340, y3=970 (sum=1385 from P10 MC legacy snapshot) but total=3000 (deterministic, fixed in bugfix v1). Internal sum y_i != total.

**Fix:** Set NDP y1/y2/y3 = `null` (render as em-dash in HTML). Deterministic NDP 3000 is a horizon-total metric; per-year breakdown is not available from xlsx `21_KPI_Dashboard` R16 (Y1/Y2/Y3 columns show dash). Any synthetic annual split would create false precision.

**Changes:**
- `extract_investor_model.py`: NDP row patch now sets y1/y2/y3 = None (both slides[13] and financial.pl_summary)
- `s13.js`: New `fmtCell()` helper — `null` → em-dash, numeric → `I18N.formatNumber(v)`. Also fixed highlight match to use `indexOf` (was exact `===`, NDP row never matched).
- `deck_data_v1.2.0.json`: NDP row updated in both locations

### B-2: investor_returns mislabeled fields

**Problem:** `financial.investor_returns` had fields `W3_IRR` and `W3_MOIC` but contained annual cash flow values from Section I of `24_Investor_Returns` (cols 8-9 = Net CF / Cum CF). Values like `W3_IRR=990` (IRR cannot be 990%) and `W3_MOIC=-260` (MOIC >= 0 by definition).

**Root cause:** `extract_investor_returns()` read rows 12-16 (Section I annual CF rows) cols 8-9 (Net CF / Cum CF), not Section II Returns Matrix.

**Fix:** Split into two separate extraction functions:
1. `extract_t1_cashflow(wb)` — reads Section I R8-R15: 8 entries (4 quarterly 2026 Out + 4 annual 2029-2032 In). Fields: period, action, tranche, interest, upside, net_cf, cum_cf, type.
2. `extract_returns_matrix(wb)` — reads Section II R20-R24: 5 scenarios x 10 fields (scenario + 4x(IRR,MOIC) + best + ndp). Correct W3_IRR/W3_MOIC from xlsx.

**New structure:**
```json
"investor_returns": {
  "t1_cashflow": [8 entries],
  "returns_matrix": [5 scenarios]
}
```

**Sanity checks added (3):**
1. T1 total net CF = 1250 (MOIC 2.0 x 1250 invested - 1250 principal)
2. T1 final cum_cf = 1250
3. Base Case W3_IRR = 20.09, W3_MOIC = 2.0 (must match key_metrics)
4. Returns matrix W3_IRR monotonic across scenarios (Bear < ... < Bull)

**Verified values:**
- T1 cashflow: 8 entries, total_net=1250, cum_cf_final=1250
- Returns matrix: Base W3 IRR=20.09, MOIC=2.0, NDP=3000
- No remnant of old structure (grep `W3_IRR.*990` = 0 matches)

**Files changed:**
- `data_extract/extract_investor_model.py` — replaced `extract_investor_returns()` with `extract_t1_cashflow()` + `extract_returns_matrix()`; NDP row y_i=None; new asserts
- `data_extract/deck_data_v1.2.0.json` — NDP row null + investor_returns restructured
- `src/slides/s13.js` — null-safe cell formatting + indexOf highlight match
- `Deck_v1.2.0/VERIFICATION_REPORT.md` — this section

## BUGFIX v3 — pl_summary from 21_KPI_Dashboard

**Date:** 2026-04-15
**Issue:** B-3 from П5 Phase 1 Block B — legacy narrative drift.

### Root cause
`extract_investor_model.py` built `financial.pl_summary.rows` from static `Deck_v1.1.1/deck_content.json` slide s13.pl (6 rows hand-written for v1.1.1). Annual split differed from xlsx:

| Source | Revenue Y1/Y2/Y3 | EBITDA Y1/Y2/Y3 |
|---|---|---|
| `deck_content` v1.1.1 | 650 / 1750 / 2145 | 180 / 550 / 1437 |
| xlsx `09_P&L_Statement` | 310 / 1990 / 2245 | 58.3 / 987.7 / 1121.4 |
| xlsx `21_KPI_Dashboard` (canonical) | **385 / 1665 / 2495** | **58.3 / 987.7 / 1121.4** |

Totals (4545 / 2167) were correct, but per-year split was stale narrative.

### Fix
New function `extract_pl_summary_from_kpi(wb)` reads xlsx `21_KPI_Dashboard` R8/R14/R16 cols D-G and returns a 3-row headline:
- Revenue — R8 (385/1665/2495/4545)
- EBITDA — R14 (58.3/987.7/1121.4/2167.4)
- NDP (к распределению) — R16 (null/null/null/3000)

COGS/Gross Profit/OPEX removed from deck pl_summary (remain in financial model and Appendix). Deck is for LP; 21_KPI is the public dashboard designed for investors.

New contract:
```json
"pl_summary": {
  "rows": [ {row, y1, y2, y3, total} × 3 ],
  "source": "21_KPI_Dashboard R8/R14/R16",
  "note": "Deck shows headline Revenue/EBITDA/NDP. Full P&L — in financial model and Appendix."
}
```

### New asserts (8)
1. `len(pl_summary.rows) == 3`
2. `rows[0].row == "Revenue"`, `rows[1].row == "EBITDA"`
3. `rows[0].total == key_metrics.revenue_3y` (4545)
4. `abs(rows[1].total - key_metrics.ebitda_3y) < 1` (2167.4 ≈ 2167)
5. `abs(Σy_i - total) < 1` for Revenue
6. `abs(Σy_i - total) < 1` for EBITDA
7. `rows[2].total == 3000` (NDP anchor)
8. `pl_summary.source == "21_KPI_Dashboard R8/R14/R16"`

### Files changed
- `data_extract/extract_investor_model.py` — `extract_pl_summary_from_kpi()` + 8 asserts
- `src/slides/s13.js` — source attribution footnote under table
- `data_extract/deck_data_v1.2.0.json` — regenerated (3 rows + source/note)
- `Deck_v1.2.0/VERIFICATION_REPORT.md` — this section

### Scope guards
- NOT touched: `investor_returns` (closed in v2), `key_metrics` (closed in v1).
- NOT touched: 09_P&L vs 21_KPI xlsx-internal mismatch (separate xlsx issue).
- Revenue/EBITDA totals already correct — unchanged.

### Verification output
```
Row count: 3
  Revenue                   y1=385   y2=1665  y3=2495   total=4545
  EBITDA                    y1=58.3  y2=987.7 y3=1121.4 total=2167.4
  NDP (к распределению)     y1=None  y2=None  y3=None   total=3000
Source: 21_KPI_Dashboard R8/R14/R16
```
All sanity checks PASSED (xlsx-sourced).

---

## Escalations

None. All 8 LP-critical charts completed within scope.
