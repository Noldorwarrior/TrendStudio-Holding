# Handoff S27 Macros — Phase 1

**Status:** complete
**Owned files:** src/macros.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created src/macros.js exposing window.TS global namespace
- TS core: emit(event, data), on(event, fn), off(event, fn), data(path), slide(id), chartData(chartKey)
- TS.NAV: registerSlide(id, enterFn, exitFn), go(id), next(), prev(), current()
- TS.ANIM: tween(el, props, opts), from(el, props, opts), killAll() -- wraps GSAP-compatible API
- TS.CHARTS: bar(ctx, cfg), line(ctx, cfg), pie(ctx, cfg), doughnut(ctx, cfg), waterfall(ctx, cfg), histogram(ctx, cfg), radar(ctx, cfg), heatmap(ctx, cfg), funnel(ctx, cfg), bubble(ctx, cfg), dualAxis(ctx, cfg), destroy(id), destroyAll()
- TS.I18N: t(key, params), setLang(lang), currentLang(), formatNumber(n, opts), formatCurrency(n, currency), formatDate(d, fmt)
- Event bus is synchronous; listeners called in registration order
- data(path) supports dot-notation traversal of deck_data_v1.2.0.json
- CHARTS factory returns chart instance with update(newData) and destroy() methods
- All chart instances tracked internally for destroyAll() cleanup

## Self-check (unit smoke)
- [x] window.TS defined after script load
- [x] TS.NAV.registerSlide accepts (id, enterFn, exitFn)
- [x] TS.CHARTS.bar returns object with update() and destroy()
- [x] TS.I18N.t('key') returns translated string
- [x] TS.data('financials.revenue_3y') returns 4545
- [x] No Cyrillic strings in JS source

## What to know next
- Every slide must call TS.NAV.registerSlide in its module
- Chart instances must be destroyed in the slide exit function to prevent memory leaks
- TS.CHARTS.waterfall and TS.CHARTS.histogram use D3 under the hood, rest use Chart.js
- I18N falls back to key name if translation missing (renders [MISSING:key] in dev mode)

## Dependencies
- handoff_S00: deck_data_v1.2.0.json (loaded and cached by TS.data)
- handoff_S33: i18n/ru.json, i18n/en.json (consumed by TS.I18N)

## Open questions / TODO
- Phase 2: add TS.SCENARIO namespace for base/bull/bear switching
- Phase 2: add TS.EXPORT for PDF generation hooks
