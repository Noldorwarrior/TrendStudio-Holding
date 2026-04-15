# Handoff S07 Exit Routes — Phase 1

**Status:** complete
**Owned files:** src/slides/s07.html, src/slides/s07.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s07.html using table layout with full-width exit routes comparison table
- Created s07.js with NAV.registerSlide('s07', enter, exit) lifecycle
- Passive content slide (no charts)
- DataTable component renders exit route options with columns: route type, timeline, probability, expected multiple, notes
- Table rows animate in with stagger via TS.ANIM.from
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s07', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] DataTable renders with correct columns

## What to know next
- Exit routes data from deck_data_v1.2.0.json exit_routes array
- Table supports sortable columns (click header to sort)

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/table.html
- handoff_S29: src/components.js (DataTable)
- handoff_S00: deck_data_v1.2.0.json (exit_routes section)
- handoff_S33: i18n/ru.json (s07.* keys)

## Open questions / TODO
- None for Phase 1
