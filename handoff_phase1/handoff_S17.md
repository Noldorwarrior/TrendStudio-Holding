# Handoff S17 MC IRR Distribution — Phase 1

**Status:** complete
**Owned files:** src/slides/s17.html, src/slides/s17.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s17.html using chart layout with histogram container
- Created s17.js with NAV.registerSlide('s17', enter, exit) lifecycle
- LP CRITICAL CHART: histogram showing Monte Carlo IRR distribution with deterministic line overlay
- Chart rendered via TS.CHARTS.histogram() with data from TS.chartData('mc_irr_distribution')
- Histogram bins colored by threshold: green (above target IRR), yellow (near target), red (below)
- Vertical deterministic IRR line (det_line) overlaid as annotation with label
- Summary statistics displayed: mean, median, P10, P90, probability of exceeding target
- TS.A11y.ensureCanvasA11y() called after chart render
- Exit cleanup: chart.destroy(), ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s17', enter, exit) present
- [x] Exit cleanup calls chart.destroy() and ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] ensureCanvasA11y() called on chart canvas/SVG
- [x] Deterministic IRR line rendered as annotation
- [x] Chart data sourced from TS.chartData(), not hardcoded

## What to know next
- LP-critical slide; histogram uses D3 under the hood via TS.CHARTS.histogram
- det_line value from deck_data_v1.2.0.json monte_carlo.deterministic_irr
- Bin count auto-calculated from data range (Freedman-Diaconis rule)

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.CHARTS, TS.I18N)
- handoff_S28: src/layouts/chart.html
- handoff_S29: src/components.js (D3ChartWrapper, MetricCard)
- handoff_S00: deck_data_v1.2.0.json (monte_carlo section)
- handoff_S33: i18n/ru.json (s17.* keys)
- handoff_S34: src/a11y.js (ensureCanvasA11y)

## Open questions / TODO
- Phase 2: add interactive bin hover to show simulation count
