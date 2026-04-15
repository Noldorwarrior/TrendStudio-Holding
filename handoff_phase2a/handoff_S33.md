# Handoff S33 — i18n Toggle + URL State

## Owner
S33 | Files: `src/i18n.js`, `i18n/ru.json`, `i18n/en.json`

## What was done
1. Created `src/i18n.js` with full I18N implementation (overrides macros.js I18N)
2. Extended `i18n/ru.json` with 13 new keys (ui.*, a11y.*)
3. Extended `i18n/en.json` with matching `[EN:key]` stubs

## API Signatures

### `I18N.lang` (property)
Current language. Default: `'ru'`.

### `I18N.setLang(v) -> void`
- Valid values: `'ru'`, `'en'`
- Throws `Error('bad lang: ' + v)` on invalid input
- No-op if `v === I18N.lang`
- Updates `TS.lang`, URL hash, sessionStorage
- Emits `'lang-change'` event with `{ old: string, new: string }`

### `I18N.t(key, params?) -> string`
- Returns translated string for current language
- Interpolation: `I18N.t('ui.slider_value', { value: 50 })` -> `"Значение: 50"`
- Missing key in EN: returns `'[EN:key]'`
- Missing key in RU: returns `'[!key]'`

### `I18N.formatNumber(v, decimals?) -> string`
- Returns locale-formatted number (`ru-RU` or `en-US`)
- `null/undefined` -> `'—'` (em-dash)

### `I18N.formatCurrency(v, opts?) -> string`
- `opts.suffix`: custom suffix (default: `' млн ₽'` / `' M RUB'`)
- `opts.decimals`: fraction digits

### `I18N.formatDate(d) -> string`
- Locale-aware date formatting

### `I18N.init() -> void`
- Loads data from `<script id="i18n-data">` element
- Resolves initial lang via `TS.readURLPriority('lang', 'ru')`
- Called from orchestrator.js init sequence

## i18n Key Schema

### Existing keys (Phase 1): 80+ keys
Format: `section.subsection` (e.g., `s01.title`, `common.currency`)

### New keys (Phase 2A): 13 keys
- `ui.scenario_toggle`, `ui.scenario_base`, `ui.scenario_opt`, `ui.scenario_pess`
- `ui.lang_toggle`, `ui.lang_ru`, `ui.lang_en`
- `ui.modal_close`, `ui.slider_value`, `ui.drilldown_details`, `ui.drilldown_metrics`
- `ui.loading`, `ui.error`, `ui.no_data`
- `a11y.slide_announce`, `a11y.scenario_changed`, `a11y.lang_changed`
- `a11y.modal_opened`, `a11y.modal_closed`

### EN stubs
All EN keys are `[EN:key]` format. Full translation planned for v1.2.1.

## Intl.NumberFormat Locale Map
- `'ru'` -> `'ru-RU'` (space as thousands separator, comma as decimal)
- `'en'` -> `'en-US'` (comma as thousands separator, period as decimal)

## URL Priority
Same cascade as S32: query > hash > sessionStorage > `'ru'` default.

## Dependencies
- Requires: `TS.readURLPriority`, `TS.updateURLHash` (from S32/orchestrator.js)
- Requires: `TS.emit` (from macros.js)
- Overrides: `window.I18N` from macros.js
