# Handoff S26 Theme — Phase 1

**Status:** complete
**Owned files:** src/theme.css
**Contract version:** v1.2.0 Phase 1

## What's done
- Created src/theme.css with full CSS custom properties system
- 16:9 slide layout (1920x1080 base, scaled via container query / transform)
- Dark cinematic palette: --bg-primary (#0a0e1a), --bg-card (#131829), --accent-blue (#3b82f6), --accent-green (#10b981), --accent-red (#ef4444), --text-primary (#f1f5f9), --text-secondary (#94a3b8)
- Typography: Inter for body, JetBrains Mono for numbers/code, fluid scale from --fs-xs to --fs-4xl
- Component styles: .card, .metric-card, .chart-wrapper, .table, .badge, .btn, .tooltip
- Slide transitions: .slide-enter / .slide-exit with opacity + translateX, duration 250ms
- Accessibility: .sr-only utility, :focus-visible outlines (2px solid var(--accent-blue)), @media (prefers-reduced-motion: reduce) disables all animations
- Print media query hides nav, forces white background

## Self-check (unit smoke)
- [x] All custom properties defined under :root
- [x] 16:9 aspect ratio enforced on .slide container
- [x] Contrast ratio >= 4.5:1 for text-primary on bg-primary
- [x] Reduced-motion media query present
- [x] No hardcoded colors outside custom properties
- [x] Focus-visible styles present on interactive elements

## What to know next
- All slides and components must use CSS custom properties, never hardcoded colors
- Phase 2 scenario toggle may swap --accent-* variables for bear/bull themes
- Z-index scale: tooltips 1000, modals 2000, nav 500

## Dependencies
- None (theme is a leaf dependency)

## Open questions / TODO
- None for Phase 1
