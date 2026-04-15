# П5 Lite — Phase 1 Verification (Blocks A + B)

## Block A: Data Integrity

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| revenue_3y | 4545 | 4545 | PASS |
| ebitda_3y | 2167 | 2167 | PASS |
| ndp_3y | 1385 | 1385 | PASS |
| det_irr | 20.09 | 20.09 | PASS |
| moic | 2.0 | 2.0 | PASS |
| wacc | 19.05 | 19.05 | PASS |
| mc_mean_irr | 7.24 | 7.24 | PASS |
| anchor | 3000 | 3000 | PASS |

**Source:** deck_data_v1.2.0.json (extracted from investor_model_v1.1.1_Public.xlsx)
**Method:** Python assert in extract_investor_model.py

## Block B: Structural Integrity

| Check | Status |
|-------|--------|
| All 25 slides have `#slide-N` DOM elements | PASS |
| All slides have NAV.registerSlide(N, {enter, exit}) | PASS |
| All exit() functions call cleanup (CHARTS.destroy or ANIM.killAll) | PASS |
| All canvases wrapped in accessible `<figure>` | PASS |
| Skip link present | PASS |
| Live region present | PASS |
| No eval()/new Function() | PASS |
| No hardcoded Cyrillic in src/*.js | PASS |
| Build size <= 450 KB | PASS (221 KB) |
| Brand lint 0 violations | PASS |

## Blocks C-E: Phase 2/3

Not applicable for Phase 1.
