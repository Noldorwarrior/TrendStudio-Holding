# Handoff S12 Unit Economics — Phase 1

**Status:** complete
**Owned files:** src/slides/s12.html, src/slides/s12.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s12.html using chart layout with grouped bar chart container
- Created s12.js with NAV.registerSlide('s12', enter, exit) lifecycle
- LP CRITICAL CHART: grouped bar chart showing unit economics metrics per project/segment
- Chart rendered via TS.CHARTS.bar() with grouped config, data from TS.chartData('unit_economics')
- Bars grouped by segment, showing revenue per unit, cost per unit, margin per unit
- MetricCard components above chart display aggregate KPIs
- TS.A11y.ensureCanvasA11y() called after chart render
- Exit cleanup: chart.destroy(), ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s12', enter, exit) present
- [x] Exit cleanup calls chart.destroy() and ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] ensureCanvasA11y() called on chart canvas
- [x] Chart data sourced from TS.chartData(), not hardcoded

## What to know next
- LP-critical slide; grouped bars must clearly distinguish revenue/cost/margin
- Color coding: revenue=accent-blue, cost=accent-red, margin=accent-green

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.CHARTS, TS.I18N)
- handoff_S28: src/layouts/chart.html
- handoff_S29: src/components.js (MetricCard, ChartWrapper)
- handoff_S00: deck_data_v1.2.0.json (unit_economics section)
- handoff_S33: i18n/ru.json (s12.* keys)
- handoff_S34: src/a11y.js (ensureCanvasA11y)

## Open questions / TODO
- Phase 2: scenario toggle will swap data between base/bull/bear
