# Handoff S28 Layouts — Phase 1

**Status:** complete
**Owned files:** src/layouts/full.html, src/layouts/split.html, src/layouts/metrics.html, src/layouts/chart.html, src/layouts/table.html
**Contract version:** v1.2.0 Phase 1

## What's done
- Created 5 HTML layout templates in src/layouts/
- full.html: single full-bleed content area (cover, CTA slides)
- split.html: 50/50 left-right layout with .split-left and .split-right zones
- metrics.html: top title bar + grid of metric card slots (3-4 columns)
- chart.html: title bar + main chart container + optional sidebar for legend/notes
- table.html: title bar + scrollable table container with sticky header support
- All layouts use CSS Grid, reference theme.css custom properties
- Each layout has named slots: [data-slot="title"], [data-slot="content"], [data-slot="chart"], etc.
- Layouts are 16:9 compliant (1920x1080 grid)

## Self-check (unit smoke)
- [x] All 5 layout files present in src/layouts/
- [x] Each layout has .slide as root element
- [x] Named data-slot attributes present for content injection
- [x] No inline styles; all styling via theme.css classes
- [x] Responsive within 16:9 container (no overflow)

## What to know next
- Slides include a layout via their HTML template, then fill slots with content
- The chart layout reserves a fixed-size canvas/svg container to prevent reflow
- Table layout supports up to 12 columns before horizontal scroll engages

## Dependencies
- handoff_S26: src/theme.css (all styling)

## Open questions / TODO
- None for Phase 1
