# Handoff S32 — Scenario State Machine

## Owner
S32 | File: `src/orchestrator.js`

## What was done
Extended orchestrator.js with:
1. URL state utility functions (public, consumed by S33 and others)
2. Scenario state machine with validation, URL persistence, and event emission

## API Signatures

### `TS.readURLPriority(key, fallback) -> string`
Reads a value from URL with priority cascade:
1. `?key=value` (query param)
2. `#key=value` (hash param)
3. `sessionStorage.getItem(key)`
4. `fallback`

### `TS.updateURLHash(key, value) -> void`
Updates hash param without navigation. Preserves other hash params.
Also persists to `sessionStorage`.

### `TS.setScenario(v) -> void`
- Valid values: `'base'`, `'opt'`, `'pess'`
- Throws `Error('bad scenario: ' + v)` on invalid input
- No-op if `v === TS.scenario`
- Sets `TS.scenario = v`
- Emits `'scenario-change'` event with `{ old: string, new: string }`
- Calls `updateURLHash('scenario', v)`

### `TS.scenario` (property)
Current scenario value. Default: `'base'` (or from URL priority cascade at init).

## Event Convention
- Event name: `'scenario-change'`
- Payload: `{ old: 'base', new: 'opt' }`
- Subscribe: `TS.on('scenario-change', fn)`
- Unsubscribe: `TS.off('scenario-change', fn)`

## URL Priority Doctrine
All URL-stateful values follow the same cascade:
1. Query param (`?scenario=opt`)
2. Hash param (`#scenario=opt`)
3. sessionStorage
4. Default value

This cascade is reusable via `TS.readURLPriority(key, fallback)`.

## Dependencies
- Requires: `window.TS` namespace (from macros.js)
- Provides: `TS.readURLPriority`, `TS.updateURLHash`, `TS.setScenario`, `TS.scenario`

## Notes for Phase 2B
- Slides should subscribe in `enter()` and unsubscribe in `exit()`:
  ```js
  NAV.registerSlide(N, {
    enter: function() {
      this._onScenario = function(e) { rerender(e.new); };
      TS.on('scenario-change', this._onScenario);
      rerender(TS.scenario);
    },
    exit: function() {
      TS.off('scenario-change', this._onScenario);
      this._onScenario = null;
      ANIM.killAll();
    }
  });
  ```
