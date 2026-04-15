# Handoff S06 Capital Discipline — Phase 1

**Status:** complete
**Owned files:** src/slides/s06.html, src/slides/s06.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s06.html using split layout with bullet points on left and formula display on right
- Created s06.js with NAV.registerSlide('s06', enter, exit) lifecycle
- Passive content slide (no charts)
- Left panel: PointsList component with capital discipline principles
- Right panel: styled formula block showing return calculation methodology
- Formula rendered as styled HTML with variable highlighting
- Enter animation: points fade in, then formula block scales up
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s06', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] Uses split layout

## What to know next
- Formula uses CSS classes for variable highlighting (--accent-blue for inputs, --accent-green for outputs)
- Capital discipline points sourced from deck_data_v1.2.0.json

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/split.html
- handoff_S29: src/components.js (PointsList)
- handoff_S00: deck_data_v1.2.0.json (capital_discipline section)
- handoff_S33: i18n/ru.json (s06.* keys)

## Open questions / TODO
- None for Phase 1
