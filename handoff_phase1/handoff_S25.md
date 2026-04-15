# Handoff S25 CTA — Phase 1

**Status:** complete
**Owned files:** src/slides/s25.html, src/slides/s25.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s25.html using full layout with contacts section and next steps
- Created s25.js with NAV.registerSlide('s25', enter, exit) lifecycle
- Passive content slide (no charts)
- Contact information: team lead, email, phone, office address
- Next steps: numbered list of action items for interested LPs
- Confidentiality reminder and legal disclaimer at bottom
- Enter animation: contacts fade in, then next steps list items stagger in
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s25', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] Contact info and next steps rendered

## What to know next
- CTA is always slide 25; End key navigates here
- Contact and next steps data from deck_data_v1.2.0.json cta section
- Legal disclaimer text is in i18n/ru.json under s25.disclaimer

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/full.html
- handoff_S00: deck_data_v1.2.0.json (cta section)
- handoff_S33: i18n/ru.json (s25.* keys)

## Open questions / TODO
- None for Phase 1
