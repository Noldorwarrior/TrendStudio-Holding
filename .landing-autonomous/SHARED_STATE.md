# Landing v2.2 Autonomous — Shared State (grep-contract enforced)

**volume:** fresh
**version:** 2.2
**started_at:** <FILL_AT_BOOTSTRAP>
**branch:** claude/landing-v2.2-autonomous (от main)
**contract_mode:** grep-enforced (any MUST_CONTAIN missing → wave fail)
**target_html:** landing_v2.2.html

## Waves

- [ ] W1 Foundation + Hero (mask+grain+kenburns+spin+entrance) + Thesis (glass+asymmetric+drop-cap+mini-viz) + Market (inline-svg+parallax+context-tooltips)
- [ ] W2 Fund (tooltip dark bg + sweep-in) + Economics (flip-cards) + Waterfall (canvas cascade) + M1 (cursor warm + drill-down)
- [ ] W3 Pipeline (pivot+perspective+5deg-tilt) + Team/Advisory (9 aria-expanded + gradient-border) + Operations (stroke-dashoffset+step-expand)
- [ ] W4 Risks + Roadmap (swimlanes+scrubber+3-cycle-pulse) + Scenarios + Regions + Tax (cap 85%) + M2 (KPI-row+rail-drop+posters+renamed-button) + M3 (Partner/Lead/Anchor)
- [ ] W5 Press + Distribution + Waterfall (scroll-pin+particles+4-PE-tooltips) + CTA (партнёрство) + 6 sims [NO FAQ]
- [ ] W6 Term Sheet (accordion) + FAQ (MOVED HERE) + Legal (flip 3D) + Footer + i18n + final polish

## Critical v2.2 rules

- Каждая MUST_CONTAIN в §3+§4 — обязательна, fail = retry
- Каждая MUST_NOT_CONTAIN — запрещена, fail = retry
- COUNT_AT_LEAST — проверяются thresholds
- После 1 retry при продолжающемся fail → SKIPPED.md

## Artifacts

- landing_v2.2.html: not yet
- WAVE_N_ARTIFACT.jsx: not yet
- p5_verification_report.json: not yet
