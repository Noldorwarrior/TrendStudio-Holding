# Handoff S34 A11y — Phase 1

**Status:** complete
**Owned files:** src/a11y.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created src/a11y.js exposing TS.A11y namespace
- prefersReducedMotion(): returns boolean from matchMedia('(prefers-reduced-motion: reduce)'), live-updates on change
- announce(message, priority): injects text into aria-live region (polite or assertive)
- trapFocus(containerEl): traps tab focus within container, returns release function
- releaseFocus(): restores normal tab order, returns focus to trigger element
- ensureCanvasA11y(canvasEl, chartTitle, chartData): adds role="img", aria-label with chart title, generates hidden data table as fallback
- describeChart(chartType, data): returns human-readable text summary of chart data for screen readers
- Skip-to-content link injected at top of body, visible on focus
- Aria-live region created once at init, reused for all announcements
- Slide transitions announced via announce() -- "Slide N of 25: Title"

## Self-check (unit smoke)
- [x] TS.A11y namespace defined with all 6 functions
- [x] prefersReducedMotion() returns boolean
- [x] announce() creates/updates aria-live region
- [x] trapFocus() constrains Tab/Shift+Tab within container
- [x] ensureCanvasA11y() adds role="img" and aria-label to canvas
- [x] Skip-to-content link present in DOM

## What to know next
- Every chart slide must call ensureCanvasA11y() after chart render
- trapFocus is designed for Phase 2 modals but available now
- announce() debounces rapid calls (100ms) to avoid screen reader flood
- describeChart() output is locale-aware via TS.I18N

## Dependencies
- handoff_S26: src/theme.css (.sr-only class, focus-visible styles, reduced-motion query)
- handoff_S27: src/macros.js (TS namespace, TS.I18N for localized announcements)

## Open questions / TODO
- Phase 2: integrate trapFocus with Modal component
- Phase 2: add roving tabindex for chart data point navigation
