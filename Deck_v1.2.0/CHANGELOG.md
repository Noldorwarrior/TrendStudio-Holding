# CHANGELOG — TrendStudio LP Deck

## v1.2.0-phase1 (2026-04-15)

### Added
- Modular build system (`scripts/build_html.py`) compiling src/ fragments into single HTML
- Data extraction pipeline (`data_extract/extract_investor_model.py`) with SSOT sanity checks
- i18n architecture: 250+ Russian keys auto-extracted, EN stubs ready for Phase 2
- CSS design system (`src/theme.css`) with full custom property palette
- Core framework (`src/macros.js`): window.TS, NAV, ANIM, CHARTS, I18N
- Reusable components (`src/components.js`): MetricCard, ChartWrapper, DataTable, etc.
- Accessibility module (`src/a11y.js`): screen reader support, focus trapping, reduced motion
- Event-bus orchestrator (`src/orchestrator.js`): keyboard nav, slide lifecycle
- 25 slides with brand-compliant content
- 8 LP-critical real charts: S02, S05, S12, S14, S17, S18, S20, S22
- BrandGuard linter (`qa/brand_lint.js`): 0 violations
- Playwright QA suite (`qa/playwright_suite.js`): 12 test cases
- axe-core accessibility audit (`qa/axe_core.js`)
- 36 handoff files documenting all subagent work

### Phase 1 metrics
- Build size: ~221 KB (49% of 450 KB budget)
- Brand lint: 0 violations
- i18n audit: 0 Cyrillic chars outside i18n data
- Security: no eval(), no new Function()

### Not included (Phase 2+)
- Scenario toggle cross-slide
- S17 dual slider, S25 terms calc, S14 confidence, S18 horizon controls
- Drill-down modals (S05, S20)
- RU↔EN actual toggle
- 6 remaining charts (S04, S06, S07, S08, S23, S25)
- Animation polish (Phase 3)
- Offline builder S31 (Phase 3)

## v1.1.2 (2026-04-14)
- Previous interactive HTML release (monolithic single file)
