# Handoff S34 — WCAG Infrastructure

## Owner
S34 | File: `src/a11y.js`

## What was done
Extended a11y.js with:
1. Handle-based focus trap (returns handle for releaseFocus)
2. Auto-creating aria-live region if not in DOM
3. Previous activeElement restoration on releaseFocus

## API Signatures

### `TS.A11y.trapFocus(el) -> handle | null`
- Traps Tab/Shift+Tab cycling within `el`
- Remembers `document.activeElement` before trapping
- Focuses first focusable element inside `el`
- Esc key triggers `releaseFocus(handle)` automatically
- Re-queries focusable elements on each Tab (supports dynamic content)
- Returns: `{ id: number, container: HTMLElement }` handle
- Returns `null` if `el` is falsy

### `TS.A11y.releaseFocus(handle) -> void`
- Takes handle from `trapFocus` (not container element)
- Removes keydown listener from container
- Restores focus to previously active element
- No-op if handle is invalid or already released

### `TS.A11y.announce(msg, priority?) -> void`
- `priority`: `'polite'` (default) or `'assertive'`
- Creates `<div id="a11y-live" aria-live="..." class="sr-only">` in body if not found
- Clears then sets text content (via rAF for screen reader re-announcement)

### `TS.A11y.prefersReducedMotion() -> boolean`
- Returns current reduced-motion preference
- Dynamically updated via `matchMedia` change listener

### `TS.A11y.describeChart(data) -> string`
- Unchanged from Phase 1
- Generates text description from chart data object

### `TS.A11y.ensureCanvasA11y() -> number`
- Unchanged from Phase 1
- Returns count of canvas elements without proper aria labels

## Focus Trap Contract
```js
// Open modal
var handle = TS.A11y.trapFocus(modalElement);

// Close modal
TS.A11y.releaseFocus(handle);
// Focus automatically returns to element that was focused before trap
```

## Reduced Motion Behavior
The ANIM wrapper in macros.js already handles reduced-motion:
- `ANIM.tween()` snaps to final state if `prefersReducedMotion()` is true
- Returns `{ kill: function(){} }` stub instead of gsap tween
- `ANIM.from()` returns stub, no animation
- `ANIM.killAll()` cleans up all active tweens

## Dependencies
- Standalone module, no dependencies on S32/S33
- Consumed by: S29 Modal (trapFocus/releaseFocus)
