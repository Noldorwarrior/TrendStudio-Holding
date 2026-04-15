# Handoff S23 Terms — Phase 1

**Status:** complete
**Owned files:** src/slides/s23.html, src/slides/s23.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s23.html using table layout with key-value terms table
- Created s23.js with NAV.registerSlide('s23', enter, exit) lifecycle
- Passive content slide (no charts)
- DataTable component renders deal terms as key-value pairs: fund size, management fee, carry, hurdle rate, fund life, investment period, GP commitment, etc.
- Two-column layout: term label (left) and value (right)
- Key terms highlighted with accent background
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s23', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] All deal terms rendered in table

## What to know next
- Terms data from deck_data_v1.2.0.json terms array
- This is a compliance-sensitive slide; all values must match offering documents

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/table.html
- handoff_S29: src/components.js (DataTable)
- handoff_S00: deck_data_v1.2.0.json (terms section)
- handoff_S33: i18n/ru.json (s23.* keys)

## Open questions / TODO
- None for Phase 1
