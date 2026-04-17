/* S49: TS.Controls unit tests — Phase 2B
   Run: node src/controls.test.js (jsdom auto-shim) */

(function() {
  'use strict';

  var passed = 0, failed = 0;
  var errors = [];

  function assert(cond, msg) {
    if (cond) { passed++; }
    else { failed++; errors.push(msg); console.error('FAIL: ' + msg); }
  }

  // ---------- DOM / TS shim ----------
  var hasDOM = typeof document !== 'undefined' && document.createElement;
  if (!hasDOM) {
    try {
      var jsdom = require('jsdom');
      var dom = new jsdom.JSDOM(
        '<!DOCTYPE html><html><body></body></html>',
        { url: 'https://example.com/' }
      );
      global.document = dom.window.document;
      global.window = dom.window;
      global.HTMLElement = dom.window.HTMLElement;
      global.Intl = dom.window.Intl || Intl;
      global.URLSearchParams = dom.window.URLSearchParams;
      global.requestAnimationFrame = function(fn) { return setTimeout(fn, 0); };
      global.cancelAnimationFrame = function(id) { clearTimeout(id); };
      global.history = dom.window.history;
      // sessionStorage may already exist in jsdom; ensure minimal interface
      if (!dom.window.sessionStorage) {
        dom.window.sessionStorage = {
          _d: {},
          getItem: function(k) { return this._d[k] != null ? this._d[k] : null; },
          setItem: function(k, v) { this._d[k] = String(v); },
          removeItem: function(k) { delete this._d[k]; },
          clear: function() { this._d = {}; }
        };
      }
      global.sessionStorage = dom.window.sessionStorage;
      hasDOM = true;
    } catch(e) {
      console.log('SKIP: jsdom not available');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // Reset global state for deterministic tests
  function resetEnv(hash) {
    try { sessionStorage.clear(); } catch (e) { /* */ }
    var url = 'https://example.com/' + (hash ? '#' + hash : '');
    if (window.history && typeof window.history.replaceState === 'function') {
      try { window.history.replaceState(null, '', url); } catch(e) { /* */ }
    }
    // Clear TS state + subscribers between tests
    if (window.TS && window.TS.State) delete window.TS.State;
    // Clear emission listeners
    if (window.TS) {
      window.TS._emitted = [];
    }
  }

  // Base TS + emit recorder
  window.TS = window.TS || {};
  window.TS._emitted = [];
  window.TS.emit = function(ev, data) { window.TS._emitted.push({ ev: ev, data: data }); };
  window.TS.on = window.TS.on || function() {};
  window.TS.off = window.TS.off || function() {};
  window.TS.A11y = window.TS.A11y || {
    announce: function() {}, trapFocus: function() { return {}; }, releaseFocus: function() {},
    prefersReducedMotion: function() { return false; }
  };
  // Orchestrator API shims
  window.TS.readURLPriority = function(key, fb) {
    // Re-implement to read fresh from window.location + sessionStorage
    try {
      var sp = new URLSearchParams(window.location.search);
      if (sp.has(key)) return sp.get(key);
    } catch(e) {}
    var hash = (window.location.hash || '').replace(/^#/, '');
    var parts = hash ? hash.split('&') : [];
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      if (pair[0] === key && pair.length > 1) return decodeURIComponent(pair[1]);
    }
    try {
      var s = sessionStorage.getItem(key);
      if (s !== null) return s;
    } catch(e) {}
    return fb;
  };
  window.TS.updateURLHash = function(key, value) {
    var hash = (window.location.hash || '').replace(/^#/, '');
    var parts = hash ? hash.split('&') : [];
    var found = false;
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      if (pair[0] === key) { out.push(key + '=' + encodeURIComponent(value)); found = true; }
      else if (parts[i]) out.push(parts[i]);
    }
    if (!found) out.push(key + '=' + encodeURIComponent(value));
    try {
      window.history.replaceState(null, '',
        window.location.pathname + window.location.search + '#' + out.join('&'));
    } catch (e) {}
    try { sessionStorage.setItem(key, String(value)); } catch(e) {}
  };
  window.TS.setScenario = function() { /* swallow in tests */ };

  // Provide minimal I18N.t so tr() returns labels (not fallback)
  window.I18N = {
    t: function(k) {
      var dict = {
        'a11y.control.scenario.group': 'Переключатель сценария',
        'ui.control.scenario.label': 'Сценарий',
        'ui.control.scenario.base': 'Базовый',
        'ui.control.scenario.bull': 'Оптимистичный',
        'ui.control.scenario.bear': 'Пессимистичный',
        'a11y.control.rate.label': 'Ставка, %',
        'a11y.control.horizon.label': 'Горизонт',
        'a11y.control.stress.label': 'Стресс, %',
        'ui.control.horizon.format': 'лет'
      };
      return dict[k] != null ? dict[k] : '[!' + k + ']';
    }
  };

  // Load deps
  if (!window.TS.Components) {
    try { require('./components.js'); }
    catch(e) { console.error('Cannot load components.js:', e.message); }
  }
  // Always (re)load controls.js for fresh state
  try { delete require.cache[require.resolve('./controls.js')]; } catch(e) {}
  require('./controls.js');

  var Ctl = window.TS.Controls;
  if (!Ctl) { console.error('TS.Controls not available'); if (typeof process !== 'undefined') process.exit(1); return; }

  console.log('--- TS.Controls Unit Tests (Phase 2B, S49) ---\n');

  // ========== Test 1: mount creates switcher + 3 sliders ==========
  (function testMountStructure() {
    console.log('[mount/structure] ...');
    resetEnv();
    var c = document.createElement('div'); document.body.appendChild(c);
    var m = Ctl.mount(c);

    var radios = c.querySelectorAll('[role="radio"]');
    assert(radios.length === 3, 'scenario switcher has 3 radio buttons');

    var group = c.querySelector('[role="radiogroup"]');
    assert(group !== null, 'radiogroup present');
    assert(group.getAttribute('aria-label') && group.getAttribute('aria-label').length > 0, 'radiogroup has aria-label');

    var sliders = c.querySelectorAll('.ts-slider input[type="range"]');
    assert(sliders.length === 3, 'exactly 3 sliders rendered');

    // Scenario default = 'base' is active
    var baseBtn = c.querySelector('[data-value="base"]');
    assert(baseBtn && baseBtn.getAttribute('aria-checked') === 'true', 'base is initially active');

    m.destroy(); document.body.removeChild(c);
  })();

  // ========== Test 2: click on bull emits scenario:changed ==========
  (function testScenarioClick() {
    console.log('[scenario/click-bull] ...');
    resetEnv();
    var c = document.createElement('div'); document.body.appendChild(c);
    var m = Ctl.mount(c);
    window.TS._emitted = []; // drop mount-time events

    var bullBtn = c.querySelector('[data-value="bull"]');
    bullBtn.click();

    var scenarioEvents = window.TS._emitted.filter(function(e) { return e.ev === 'scenario:changed'; });
    assert(scenarioEvents.length === 1, 'exactly 1 scenario:changed emitted');
    assert(scenarioEvents[0].data === 'bull', 'emitted value is "bull"');

    assert(bullBtn.getAttribute('aria-checked') === 'true', 'bull aria-checked=true after click');
    var baseBtn = c.querySelector('[data-value="base"]');
    assert(baseBtn.getAttribute('aria-checked') === 'false', 'base aria-checked=false after click');

    m.destroy(); document.body.removeChild(c);
  })();

  // ========== Test 3: slider rate change → param:changed with rate ==========
  (function testSliderEmit(done) {
    console.log('[slider/rate-change] ...');
    resetEnv();
    var c = document.createElement('div'); document.body.appendChild(c);
    var m = Ctl.mount(c);
    window.TS._emitted = [];

    var rateInput = c.querySelectorAll('.ts-slider input[type="range"]')[0];
    assert(rateInput != null, 'rate slider exists');
    rateInput.value = '20';
    rateInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    // Wait for rAF (16ms) + 150ms debounce
    setTimeout(function() {
      var paramEvents = window.TS._emitted.filter(function(e) { return e.ev === 'param:changed'; });
      assert(paramEvents.length >= 1, 'param:changed emitted after slider input');
      var last = paramEvents[paramEvents.length - 1];
      assert(last && last.data && last.data.rate === 20, 'payload.rate === 20');
      assert(last.data.horizon === 5 && last.data.stress === 0, 'horizon/stress keep defaults');

      // state persisted to sessionStorage
      assert(sessionStorage.getItem('rate') === '20', 'rate persisted in sessionStorage');

      m.destroy(); document.body.removeChild(c);
      if (typeof done === 'function') done();
    }, 250);
  })(function afterTest3() {
    // ========== Test 4: URL-hash initializer (#scenario=bear) ==========
    (function testHashInit() {
      console.log('[init/hash-bear] ...');
      resetEnv('scenario=bear&rate=22&horizon=7&stress=25');
      var c = document.createElement('div'); document.body.appendChild(c);
      var m = Ctl.mount(c);

      var bear = c.querySelector('[data-value="bear"]');
      assert(bear && bear.getAttribute('aria-checked') === 'true', 'bear active from hash');

      var inputs = c.querySelectorAll('.ts-slider input[type="range"]');
      assert(inputs[0].value === '22', 'rate=22 from hash');
      assert(inputs[1].value === '7',  'horizon=7 from hash');
      assert(inputs[2].value === '25', 'stress=25 from hash');

      m.destroy(); document.body.removeChild(c);
    })();

    // ========== Test 5: sessionStorage persist via TS.State.set ==========
    (function testStatePersist() {
      console.log('[state/persist-sessionStorage] ...');
      resetEnv();
      var c = document.createElement('div'); document.body.appendChild(c);
      var m = Ctl.mount(c);
      var State = window.TS.State;
      assert(State && typeof State.set === 'function', 'TS.State.set exists after mount');
      State.set('rate', 20, { persist: true });
      assert(sessionStorage.getItem('rate') === '20', 'sessionStorage reflects set()');
      assert(State.get('rate') === 20, 'State.get returns latest');

      // subscribe fires
      var seen = null;
      var unsub = State.subscribe('horizon', function(v) { seen = v; });
      State.set('horizon', 8, { persist: true });
      assert(seen === 8, 'subscribe callback fired on set()');
      unsub();

      m.destroy(); document.body.removeChild(c);
    })();

    // ========== Test 6: ArrowRight navigates radio to next scenario ==========
    (function testArrowKey() {
      console.log('[keyboard/arrow-right] ...');
      resetEnv();
      var c = document.createElement('div'); document.body.appendChild(c);
      var m = Ctl.mount(c);
      window.TS._emitted = [];

      var baseBtn = c.querySelector('[data-value="base"]');
      // Simulate ArrowRight keydown while base is focused
      var ev;
      try {
        ev = new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      } catch(e) {
        ev = document.createEvent('Event'); ev.initEvent('keydown', true, true); ev.key = 'ArrowRight';
      }
      baseBtn.dispatchEvent(ev);

      var bullBtn = c.querySelector('[data-value="bull"]');
      assert(bullBtn.getAttribute('aria-checked') === 'true', 'bull becomes active after ArrowRight on base');
      assert(baseBtn.getAttribute('aria-checked') === 'false', 'base is no longer active');

      var scenarioEvents = window.TS._emitted.filter(function(e) { return e.ev === 'scenario:changed'; });
      assert(scenarioEvents.length === 1 && scenarioEvents[0].data === 'bull', 'scenario:changed emitted with "bull"');

      // One more ArrowRight → bear
      var ev2;
      try { ev2 = new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }); }
      catch(e) { ev2 = document.createEvent('Event'); ev2.initEvent('keydown', true, true); ev2.key = 'ArrowRight'; }
      bullBtn.dispatchEvent(ev2);
      var bearBtn = c.querySelector('[data-value="bear"]');
      assert(bearBtn.getAttribute('aria-checked') === 'true', 'bear active after 2nd ArrowRight');

      // ArrowLeft wraps back to bull
      var ev3;
      try { ev3 = new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }); }
      catch(e) { ev3 = document.createEvent('Event'); ev3.initEvent('keydown', true, true); ev3.key = 'ArrowLeft'; }
      bearBtn.dispatchEvent(ev3);
      assert(bullBtn.getAttribute('aria-checked') === 'true', 'bull active after ArrowLeft on bear');

      m.destroy(); document.body.removeChild(c);
    })();

    // ========== Test 7 (bonus): DEFAULTS + SCENARIOS exported ==========
    (function testExports() {
      console.log('[exports/contract] ...');
      assert(Ctl.DEFAULTS && Ctl.DEFAULTS.rate === 15, 'DEFAULTS.rate=15 exported');
      assert(Ctl.DEFAULTS.horizon === 5 && Ctl.DEFAULTS.stress === 0, 'horizon/stress defaults');
      assert(Array.isArray(Ctl.SCENARIOS) && Ctl.SCENARIOS.length === 3, 'SCENARIOS array length=3');
      assert(Ctl.SCENARIOS.indexOf('bull') >= 0 && Ctl.SCENARIOS.indexOf('bear') >= 0, 'bull/bear present');
    })();

    // ========== Summary ==========
    console.log('\n=== TS.Controls Tests ===');
    console.log('Passed: ' + passed);
    console.log('Failed: ' + failed);
    if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });
    if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
  });
})();
