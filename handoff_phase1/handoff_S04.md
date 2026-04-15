# Handoff S04 Market Window — Phase 1

**Status:** complete
**Owned files:** src/slides/s04.html, src/slides/s04.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s04.html using split layout with points list on left and KPI table on right
- Created s04.js with NAV.registerSlide('s04', enter, exit) lifecycle
- Passive content slide (no charts)
- Left panel: PointsList component with market window arguments
- Right panel: DataTable component with key market KPIs (market size, growth rate, penetration)
- Enter animation: left panel slides in, then table rows fade in
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s04', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] Uses split layout with PointsList and DataTable components

## What to know next
- Market data sourced from deck_data_v1.2.0.json market section
- KPI table has 4-5 rows with label, value, and source columns

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/split.html
- handoff_S29: src/components.js (PointsList, DataTable)
- handoff_S00: deck_data_v1.2.0.json (market section)
- handoff_S33: i18n/ru.json (s04.* keys)

## Open questions / TODO
- None for Phase 1
