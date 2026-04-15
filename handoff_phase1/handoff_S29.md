# Handoff S29 Components — Phase 1

**Status:** complete
**Owned files:** src/components.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created src/components.js with reusable UI component factory functions
- MetricCard(container, {label, value, delta, icon}) -- renders formatted KPI card with optional delta arrow
- ChartWrapper(container, {type, data, options}) -- Chart.js wrapper with responsive resize, returns {update, destroy}
- D3ChartWrapper(container, {type, data, options}) -- D3-based wrapper for waterfall/histogram, returns {update, destroy}
- TooltipPortal(anchorEl, {content, placement}) -- positioned tooltip with auto-flip, appended to body
- AppendixBadge(container, {label, refSlide}) -- clickable badge linking to appendix slide
- DataTable(container, {columns, rows, sortable}) -- renders table with optional column sort
- PointsList(container, {items, icon}) -- bullet/icon list for qualitative content
- Badge(container, {text, variant}) -- colored label badge (info, success, warning, danger)
- Phase 2 stubs (exported but throw "Not implemented in Phase 1"):
  - ScenarioToggle, LangToggle, Slider, Modal, DrilldownCard

## Self-check (unit smoke)
- [x] All 8 active components exported and callable
- [x] Phase 2 stubs throw descriptive error if called
- [x] MetricCard renders label, value, and delta correctly
- [x] ChartWrapper.destroy() removes canvas and cleans up Chart.js instance
- [x] D3ChartWrapper.destroy() removes SVG and cleans up
- [x] No Cyrillic strings in JS source (all text via I18N keys)

## What to know next
- Components accept a container DOM element as first arg; they append into it
- ChartWrapper and D3ChartWrapper both track instances for TS.CHARTS.destroyAll()
- TooltipPortal auto-removes on mouseleave; no manual cleanup needed
- DataTable sort is client-side, triggered by clicking column headers

## Dependencies
- handoff_S26: src/theme.css (component class styles)
- handoff_S27: src/macros.js (TS.CHARTS integration, TS.I18N for labels)

## Open questions / TODO
- Phase 2: implement ScenarioToggle, LangToggle, Slider, Modal, DrilldownCard
- Phase 2: DrilldownCard will need modal + chart sub-rendering
