# Handoff S33 I18N — Phase 1

**Status:** complete
**Owned files:** i18n/ru.json, i18n/en.json, scripts/extract_i18n.py
**Contract version:** v1.2.0 Phase 1

## What's done
- Created i18n/ru.json with 250+ translation keys covering all 25 slides
- Keys organized by slide: s01.title, s01.subtitle, s02.chart_title, s02.metric_revenue, etc.
- Common keys: common.next, common.prev, common.slide_n_of_m, common.appendix, common.source, etc.
- Created i18n/en.json with stub values in format [EN:key_name] for all 250+ keys
- Created scripts/extract_i18n.py utility to scan HTML/JS for TS.I18N.t() calls and verify all keys exist in both JSON files
- Number formatting: TS.I18N.formatNumber uses ru-RU locale (spaces as thousand separator, comma as decimal)
- Currency formatting: TS.I18N.formatCurrency defaults to RUB with locale-appropriate symbol placement
- Date formatting: TS.I18N.formatDate supports dd.MM.yyyy (ru) and MM/dd/yyyy (en) patterns

## Self-check (unit smoke)
- [x] i18n/ru.json valid JSON with 250+ keys
- [x] i18n/en.json has same key count as ru.json
- [x] extract_i18n.py finds zero missing keys when run against src/
- [x] No raw Cyrillic text in any JS file (all goes through I18N)
- [x] formatNumber(4545) returns "4 545" in ru locale
- [x] formatCurrency(2167, 'RUB') returns formatted string with currency symbol

## What to know next
- All user-visible text must go through TS.I18N.t(key) -- no hardcoded strings
- ru.json is the primary language; en.json stubs are for Phase 2 localization
- extract_i18n.py should be run as a pre-commit check to catch missing keys

## Dependencies
- handoff_S27: src/macros.js (TS.I18N namespace definition)

## Open questions / TODO
- Phase 2: complete en.json translations (currently stubs only)
- Phase 2: add language toggle UI (LangToggle component from S29)
