# Handoff S21 Governance — Phase 1

**Status:** complete
**Owned files:** src/slides/s21.html, src/slides/s21.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s21.html using metrics layout with committee/governance cards
- Created s21.js with NAV.registerSlide('s21', enter, exit) lifecycle
- Passive content slide (no charts)
- Each governance body rendered as a card with: committee name, role, key members, meeting frequency
- Cards use MetricCard variant with extended description area
- 3-4 committee cards (Board, Investment Committee, Risk Committee, Audit Committee)
- Cards animate in with stagger
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s21', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] All governance bodies rendered

## What to know next
- Governance data from deck_data_v1.2.0.json governance.committees array
- Member names come from I18N keys, not hardcoded

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/metrics.html
- handoff_S29: src/components.js (MetricCard)
- handoff_S00: deck_data_v1.2.0.json (governance section)
- handoff_S33: i18n/ru.json (s21.* keys)

## Open questions / TODO
- None for Phase 1
