# Handoff S32 Orchestrator — Phase 1

**Status:** complete
**Owned files:** src/orchestrator.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created src/orchestrator.js as the main entry point / bootstrap script
- DOMContentLoaded listener initializes the deck:
  1. Loads deck_data_v1.2.0.json into TS.data cache
  2. Waits for all slide modules to register via TS.NAV.registerSlide
  3. Calls TS.NAV.go(1) to enter the first slide
- Keyboard navigation:
  - ArrowRight / ArrowDown / Space: TS.NAV.next()
  - ArrowLeft / ArrowUp: TS.NAV.prev()
  - Home: TS.NAV.go(1)
  - End: TS.NAV.go(25)
  - Escape: reserved (no-op in Phase 1)
- Nav button click handlers: .nav-prev and .nav-next buttons wired to prev/next
- Slide progress indicator updated on every navigation event
- Scenario change stub: listens for TS event 'scenario:change' but logs "Phase 2" and no-ops
- Error boundary: wraps slide enter/exit in try-catch, logs to console.error

## Self-check (unit smoke)
- [x] DOMContentLoaded triggers init sequence
- [x] All 5 keyboard bindings functional (ArrowRight, ArrowLeft, Home, End, Space)
- [x] Nav buttons wired and clickable
- [x] First slide enters on load
- [x] Scenario change listener registered (stub)
- [x] No Cyrillic strings in JS source

## What to know next
- Orchestrator assumes all slide JS files are loaded before DOMContentLoaded fires (script order matters)
- Error boundary prevents one broken slide from crashing the entire deck
- Phase 2 will flesh out scenario:change handler to re-render active slide with new data branch

## Dependencies
- handoff_S00: deck_data_v1.2.0.json (loaded at init)
- handoff_S27: src/macros.js (TS.NAV, TS.data, event bus)
- handoff_S01 through handoff_S25: all slide modules register via NAV.registerSlide

## Open questions / TODO
- Phase 2: implement scenario switching logic
- Phase 2: add touch/swipe navigation for tablet
