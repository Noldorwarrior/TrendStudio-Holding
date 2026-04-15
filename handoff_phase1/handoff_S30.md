# Handoff S30 QA — Phase 1

**Status:** complete
**Owned files:** qa/playwright_suite.js, qa/axe_core.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created qa/playwright_suite.js with 12 Playwright tests covering Phase 1 gates
- Created qa/axe_core.js for automated accessibility audits via axe-core
- Test suite covers:
  1. All 25 slides present in DOM
  2. Forward navigation (arrow right) visits all slides in order
  3. Backward navigation (arrow left) works correctly
  4. Home key jumps to slide 1, End key jumps to slide 25
  5. Nav button click handlers trigger correct slide transition
  6. No console errors during full navigation pass
  7. Canvas elements have aria-label or role="img" with aria-label
  8. Skip-to-content link present and functional
  9. Memory leak test: navigate all slides 3x, check JS heap delta < 5MB
  10. Slide transition completes in < 300ms
  11. All LP-critical charts render (canvas/svg has non-zero dimensions)
  12. axe-core returns zero critical/serious violations
- qa/axe_core.js runs axe.run() on each slide, reports violations by impact level

## Self-check (unit smoke)
- [x] 12 tests defined in playwright_suite.js
- [x] axe_core.js imports and configures axe-core correctly
- [x] Tests use data-testid selectors where possible
- [x] Memory leak test uses performance.measureUserAgentSpecificMemory or equivalent
- [x] Transition timing test uses performance.now() bracketing

## What to know next
- Run with: npx playwright test qa/playwright_suite.js
- axe_core.js can be run standalone or as part of the Playwright suite
- Tests assume the deck is served at http://localhost:3000
- Phase 2 will add scenario-toggle tests and i18n switching tests

## Dependencies
- handoff_S27: src/macros.js (TS.NAV API used in nav tests)
- handoff_S32: src/orchestrator.js (keyboard handlers being tested)
- handoff_S34: src/a11y.js (a11y features being validated)

## Open questions / TODO
- Phase 2: add visual regression tests (screenshot comparison)
- Phase 2: add performance budget test (total bundle < 2MB)
