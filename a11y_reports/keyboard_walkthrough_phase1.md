# Keyboard Walkthrough — Phase 1

**Date:** 2026-04-15
**Version:** v1.2.0-phase1

## Navigation Controls

| Key | Action | Status |
|-----|--------|--------|
| ArrowRight / PageDown | Next slide | Implemented |
| ArrowLeft / PageUp | Previous slide | Implemented |
| Home | Go to slide 1 | Implemented |
| End | Go to slide 25 | Implemented |
| Tab | Focus through interactive elements | Via browser default + focus-visible |

## Accessibility Features

| Feature | Status |
|---------|--------|
| Skip link (#skip-link) | Present, sr-only-focusable |
| Live region (#a11y-live) | aria-live="polite", announces slide changes |
| Nav buttons | aria-label on prev/next, disabled state |
| Slide sections | role="group", aria-roledescription="slide", aria-label |
| Chart figures | role="img", aria-labelledby, aria-describedby |
| Canvas descriptions | sr-only figcaption + numeric summary div |
| Focus trapping | TS.A11y.trapFocus() available (Phase 2 modals) |
| Reduced motion | @media (prefers-reduced-motion) + ANIM guard |
| Focus visible | 2px gold outline on :focus-visible |

## Known Limitations (Phase 1)

- Focus trap not active (no modals in Phase 1)
- Chart tooltips not keyboard-accessible (Chart.js limitation, Phase 2 enhancement)
- Slide content not tabbable within (passive content, no interactive controls in Phase 1 slides)
