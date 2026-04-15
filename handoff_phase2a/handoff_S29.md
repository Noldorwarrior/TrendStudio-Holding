# Handoff S29 — Components Extend

## Owner
S29 | Files: `src/components.js` (extend), `src/components.test.js`

## What was done
Replaced stub implementations (return null) with full components:
1. `TS.Components.Slider` — debounced range input with a11y
2. `TS.Components.Modal` — focus-trapped dialog with overlay
3. `TS.Components.DrilldownCard` — detail card for modals
4. Unit tests: 35 tests, all passing

## API Signatures

### `TS.Components.Slider(container, opts) -> { setValue, getValue, destroy }`

**Options:**
```js
{
  min: 0,          // number, default 0
  max: 100,        // number, default 100
  step: 1,         // number, default 1
  value: 0,        // number, initial value (default: min)
  format: fn(v),   // function, formats display value (default: String)
  onChange: fn(v),  // function, called on value change (debounced 16ms via rAF)
  a11y: {
    label: '',          // string, aria label
    valuetext: fn(v)    // function, aria-valuetext formatter
  }
}
```

**Returns:**
- `setValue(v)`: set value (clamped to min/max)
- `getValue()`: get current value
- `destroy()`: remove DOM, clean listeners, cancel pending rAF

### `TS.Components.Modal(opts) -> { open, close, setBody, destroy }`

**Options:**
```js
{
  title: '',           // string, modal title
  body: null,          // HTMLElement | string, modal body content
  footer: null,        // HTMLElement | string, footer content
  onOpen: fn(),        // callback on open
  onClose: fn(),       // callback on close
  closeOnOverlay: true // boolean, click overlay to close (default true)
}
```

**Returns:**
- `open()`: show modal, trap focus, emit `'modal-open'`
- `close()`: hide modal, release focus, emit `'modal-close'`
- `setBody(content)`: replace body content (HTMLElement or string)
- `destroy()`: close if open, null references

**Behavior:**
- Focus trap via `TS.A11y.trapFocus(modal)` on open
- Focus restore via `TS.A11y.releaseFocus(handle)` on close
- Esc key closes (handled by trapFocus Esc handler)
- Overlay click closes (if `closeOnOverlay !== false`)
- Emits `'modal-open'` / `'modal-close'` with `{ id: modalId }`
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on modal

### `TS.Components.DrilldownCard(data) -> HTMLElement`

**Data:**
```js
{
  title: '',       // string, gold-colored heading
  subtitle: '',    // string, secondary text
  metrics: [       // array of { label, value }
    { label: 'IRR', value: '20.09%' }
  ],
  description: '', // string, paragraph text
  links: [         // array of { text, href }
    { text: 'Details', href: '#' }
  ]
}
```

**Returns:** HTMLElement (div.ts-drilldown-card) ready for insertion into Modal body.

## Destroy Contract
All components clean up:
- DOM elements removed from parent
- Event listeners removed
- requestAnimationFrame cancelled (Slider)
- No references retained after destroy

## Dependencies
- `TS.A11y.trapFocus/releaseFocus` (from S34) — Modal
- `TS.emit` (from macros.js) — Modal events
- No dependency on scenario or lang — components are generic

## Test Results
```
35 passed, 0 failed
- Slider: create, setValue, getValue, boundary clamping, DOM render, destroy cleanup
- Modal: create, open, close, setBody, DOM presence, destroy cleanup
- DrilldownCard: create with data, empty data, null data
```
