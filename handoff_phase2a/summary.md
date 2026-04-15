# Phase 2A Handoff Summary — Deck v1.2.0

## 1. What was done in 2A

- **S32 scenario state machine**: `TS.setScenario(v)` with validation (`base/opt/pess`), active-only subscription pattern via `TS.on('scenario-change', fn)` / `TS.off(...)`, URL state persistence (`#scenario=opt`), sessionStorage fallback. Public URL utilities `TS.readURLPriority(key, fallback)` and `TS.updateURLHash(key, value)` shared with S33.
- **S33 i18n full toggle**: `I18N.setLang(v)` with RU/EN toggle, URL+sessionStorage priority cascade, `I18N.t(key, params)` with interpolation, `I18N.formatNumber/formatCurrency/formatDate` with Intl.NumberFormat locale awareness. 93+ keys in `i18n/ru.json` (80 Phase 1 + 13 new), all mirrored in `i18n/en.json` as `[EN:key]` stubs.
- **S34 WCAG infra**: Handle-based `TS.A11y.trapFocus(el) -> handle`, `TS.A11y.releaseFocus(handle)` with previous activeElement restoration, `TS.A11y.announce(msg, priority)` with auto-created aria-live region, `TS.A11y.prefersReducedMotion()` with dynamic matchMedia listener. ANIM.tween reduced-motion wrapper preserved from Phase 1 macros.js.
- **S29 components**: `TS.Components.Slider` (debounced 16ms via rAF, a11y labels), `TS.Components.Modal` (focus-trap via S34, Esc/overlay close, modal-open/close events), `TS.Components.DrilldownCard` (metrics grid, links). Unit tests: 35 passed, 0 failed.

## 2. Contracts for Phase 2B

### Scenario
```js
TS.setScenario('opt');  // validates, emits 'scenario-change', updates URL
TS.scenario;            // current: 'base' | 'opt' | 'pess'
TS.on('scenario-change', function(e) { /* e.old, e.new */ });
TS.off('scenario-change', fn);
```

### i18n
```js
I18N.setLang('en');     // validates, emits 'lang-change', updates URL
I18N.t('s01.title');    // translated string
I18N.t('key', { n: 5 }); // interpolation
I18N.formatNumber(1234); // '1 234' (ru) or '1,234' (en)
I18N.formatCurrency(500); // '500 млн ₽' (ru) or '500 M RUB' (en)
```

### Focus trap
```js
var handle = TS.A11y.trapFocus(modalEl); // trap + focus first
TS.A11y.releaseFocus(handle);            // release + restore focus
TS.A11y.announce('Message', 'polite');   // screen reader
```

### Components
```js
var slider = TS.Components.Slider(container, { min:0, max:100, onChange:fn });
slider.setValue(50); slider.getValue(); slider.destroy();

var modal = TS.Components.Modal({ title:'...', body:el });
modal.open(); modal.close(); modal.setBody(newEl); modal.destroy();

var card = TS.Components.DrilldownCard({ title:'...', metrics:[...] });
modal.setBody(card); // use in modal
```

## 3. Gates 2A

| Gate | Status |
|------|--------|
| build_html.py --verify | PASS (244,889 bytes, 54% budget) |
| brand_lint touched | PASS (0 violations) |
| i18n grep (Cyrillic outside JSON) | PASS (0 matches) |
| event pair (TS.on/off match) | PASS (0 = 0) |
| URL state roundtrip | PASS (contracts verified) |
| reduced-motion snap | PASS (macros.js ANIM already snaps) |
| components unit tests | PASS (35/35) |

## 4. What is ready for 2B

- 6 new charts can subscribe to `scenario-change` via `TS.on('scenario-change', fn)` and read `TS.scenario` for initial state
- Slider ready for S14/S17/S18/S25 live controls: `TS.Components.Slider(container, opts)`
- Modal ready for S05/S20 drill-down: `TS.Components.Modal({ body: DrilldownCard(data) })`
- DrilldownCard ready for project/investor detail views
- `I18N.t()` ready for all new text in 6 charts and controls
- URL state shared between scenario + lang (no conflicts, same cascade pattern)

## 5. Open risks

- EN stubs visible in UI if LP meeting requires EN preview — acceptable for 2A, full EN in v1.2.1
- macros.js still has old `I18N` definition that gets overridden by `src/i18n.js` — works because i18n.js loads after macros.js in build, but load order must be maintained
- macros.js emits `'lang:change'` (colon separator) while new i18n.js emits `'lang-change'` (dash separator) — Phase 2B slides should subscribe to `'lang-change'` only; old colon-format retained for backward compatibility but should be deprecated in 2C
- No canvas aria-desc updates yet for existing 8 charts — Phase 2C task

## 6. References

- Branch: `claude/deck-v1.2.0-phase2a-57896`
- Base: `0b65ec7` (Phase 1 HEAD)
- QA: `qa_reports/brand_lint_phase2a.json`, `qa_reports/i18n_audit_phase2a.txt`, `qa_reports/event_pair_audit_phase2a.txt`
- Handoffs: `handoff_phase2a/handoff_S{29,32,33,34}.md`
- Tests: `src/components.test.js` (35 passed)
