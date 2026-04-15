# Handoff S19 Risk Heatmap — Phase 1

**Status:** complete
**Owned files:** src/slides/s19.html, src/slides/s19.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s19.html using split layout with risk badges on left and category breakdown on right
- Created s19.js with NAV.registerSlide('s19', enter, exit) lifecycle
- Passive content slide (no charts)
- Left panel: Badge components for each risk showing severity (critical, high, medium, low)
- Right panel: risk categories (market, operational, financial, regulatory) with count per category
- Badge variants map to severity: danger=critical, warning=high, info=medium, success=low
- Badges animate in with stagger
- Exit cleanup: ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s19', enter, exit) present
- [x] Exit cleanup calls ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] Badge colors match severity levels

## What to know next
- Risk data from deck_data_v1.2.0.json risks.heatmap array
- Categories and severity levels defined in data, not hardcoded in JS

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.I18N)
- handoff_S28: src/layouts/split.html
- handoff_S29: src/components.js (Badge)
- handoff_S00: deck_data_v1.2.0.json (risks section)
- handoff_S33: i18n/ru.json (s19.* keys)

## Open questions / TODO
- None for Phase 1
