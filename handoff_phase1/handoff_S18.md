# Handoff S18 Det vs Stoch — Phase 1

**Status:** complete
**Owned files:** src/slides/s18.html, src/slides/s18.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s18.html using chart layout with comparison bar chart container
- Created s18.js with NAV.registerSlide('s18', enter, exit) lifecycle
- LP CRITICAL CHART: comparison bar chart showing deterministic vs stochastic results side by side
- Chart rendered via TS.CHARTS.bar() with grouped config, data from TS.chartData('det_vs_stoch')
- Two bar groups per metric: deterministic (solid) and stochastic mean (hatched/lighter)
- Metrics compared: IRR, NPV, equity multiple, payback period
- Error bars on stochastic bars showing P10-P90 range
- TS.A11y.ensureCanvasA11y() called after chart render
- Exit cleanup: chart.destroy(), ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s18', enter, exit) present
- [x] Exit cleanup calls chart.destroy() and ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] ensureCanvasA11y() called on chart canvas
- [x] Chart data sourced from TS.chartData(), not hardcoded

## What to know next
- LP-critical slide; deterministic vs stochastic comparison is key for investor decision
- Error bars implemented via Chart.js error bar plugin or custom drawing
- Color coding: deterministic=accent-blue, stochastic=accent-green

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.CHARTS, TS.I18N)
- handoff_S28: src/layouts/chart.html
- handoff_S29: src/components.js (ChartWrapper)
- handoff_S00: deck_data_v1.2.0.json (monte_carlo.comparison section)
- handoff_S33: i18n/ru.json (s18.* keys)
- handoff_S34: src/a11y.js (ensureCanvasA11y)

## Open questions / TODO
- Phase 2: scenario toggle will update both deterministic and stochastic bars
