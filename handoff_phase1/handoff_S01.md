# Handoff S01 Cover — Phase 1

**Status:** complete
**Owned files:** src/slides/s01.html, src/slides/s01.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s01.html using full layout with company name, deal title, date, confidentiality notice
- Created s01.js with NAV.registerSlide('s01', enter, exit) lifecycle
- Passive content slide (no charts)
- Enter animation: fade-in logo, title, subtitle sequentially via TS.ANIM.from
- Exit cleanup: TS.ANIM.killAll() for this slide scope
- All text pulled from TS.I18N.t('s01.*') keys

## Self-check (unit smoke)
- [x] NAV.registerSlide('s01', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] Uses full layout template

## What to know next
- Cover is always slide 1; Home key navigates here
- Confidentiality notice text is in i18n/ru.json under s01.confidentiality

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/full.html
- handoff_S00: deck_data_v1.2.0.json (s01 section)
- handoff_S33: i18n/ru.json (s01.* keys)

## Open questions / TODO
- None for Phase 1
