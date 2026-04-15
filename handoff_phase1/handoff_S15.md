# Handoff S15 WACC — Phase 1

**Status:** complete
**Owned files:** src/slides/s15.html, src/slides/s15.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s15.html using table layout with CAPM/WACC assumptions table
- Created s15.js with NAV.registerSlide('s15', enter, exit) lifecycle
- Passive content slide (no charts)
- DataTable component renders CAPM parameters: risk-free rate, equity risk premium, beta, cost of equity, cost of debt, tax rate, D/E ratio, WACC
- Key result row (WACC) highlighted
- Formula display below table showing WACC = E/(E+D)*Re + D/(E+D)*Rd*(1-T)
- Numbers formatted via TS.I18N.formatNumber() with percentage formatting where appropriate
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s15', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] DataTable renders CAPM parameters correctly
- [x] WACC formula displayed

## What to know next
- WACC data from deck_data_v1.2.0.json valuation.wacc object
- Percentage values stored as decimals in JSON, formatted as % in display

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/table.html
- handoff_S29: src/components.js (DataTable)
- handoff_S00: deck_data_v1.2.0.json (valuation.wacc section)
- handoff_S33: i18n/ru.json (s15.* keys)

## Open questions / TODO
- None for Phase 1
