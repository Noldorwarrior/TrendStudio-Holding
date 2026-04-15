# Handoff S16 MC Methodology — Phase 1

**Status:** complete
**Owned files:** src/slides/s16.html, src/slides/s16.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s16.html using table layout with Monte Carlo simulation variables table
- Created s16.js with NAV.registerSlide('s16', enter, exit) lifecycle
- Passive content slide (no charts)
- DataTable component renders MC simulation input variables: variable name, distribution type, min, base, max, std_dev
- Covers key variables: revenue growth, margin, discount rate, terminal multiple, capex ratio
- Badge component used to label distribution types (Normal, Triangular, Uniform)
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s16', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] All MC variables rendered in table

## What to know next
- MC variables from deck_data_v1.2.0.json monte_carlo.variables array
- This slide sets context for the MC results on slides S17 and S18

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/table.html
- handoff_S29: src/components.js (DataTable, Badge)
- handoff_S00: deck_data_v1.2.0.json (monte_carlo.variables section)
- handoff_S33: i18n/ru.json (s16.* keys)

## Open questions / TODO
- None for Phase 1
