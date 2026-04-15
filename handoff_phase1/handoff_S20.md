# Handoff S20 Top Risks — Phase 1

**Status:** complete
**Owned files:** src/slides/s20.html, src/slides/s20.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created s20.html using chart layout with horizontal bar chart container
- Created s20.js with NAV.registerSlide('s20', enter, exit) lifecycle
- LP CRITICAL CHART: horizontal bar chart showing top risks ranked by impact score
- Chart rendered via TS.CHARTS.bar() with horizontal config, data from TS.chartData('top_risks')
- Bars sorted descending by impact score, colored by severity (red=critical, orange=high, yellow=medium)
- Each bar labeled with risk name and impact score
- TS.A11y.ensureCanvasA11y() called after chart render
- Exit cleanup: chart.destroy(), ANIM.killAll()

## Self-check (unit smoke)
- [x] NAV.registerSlide('s20', enter, exit) present
- [x] Exit cleanup calls chart.destroy() and ANIM.killAll()
- [x] No Cyrillic in JS source
- [x] ensureCanvasA11y() called on chart canvas
- [x] Bars sorted descending by impact

## What to know next
- LP-critical slide; risk ranking must be accurate and visually clear
- Top 8-10 risks shown; remaining in appendix
- Bar colors derived from severity field in data

## Dependencies
- handoff_S26: src/theme.css
- handoff_S27: src/macros.js (TS.NAV, TS.ANIM, TS.CHARTS, TS.I18N)
- handoff_S28: src/layouts/chart.html
- handoff_S29: src/components.js (ChartWrapper)
- handoff_S00: deck_data_v1.2.0.json (risks.top_risks section)
- handoff_S33: i18n/ru.json (s20.* keys)
- handoff_S34: src/a11y.js (ensureCanvasA11y)

## Open questions / TODO
- Phase 2: click-to-expand risk detail via DrilldownCard
