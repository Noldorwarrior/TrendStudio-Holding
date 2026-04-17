/* S43: Chart-2 EBITDA unit tests — Phase 2B
   Run: node src/charts/ebitda.test.js (jsdom auto-shim) */

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
      var dom = new jsdom.JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
      global.HTMLElement = dom.window.HTMLElement;
      global.SVGSVGElement = dom.window.SVGSVGElement;
      global.Intl = dom.window.Intl || Intl;
      hasDOM = true;
    } catch(e) {
      console.log('SKIP: jsdom not available');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // Minimal TS shim + event bus
  window.TS = window.TS || {};
  var emitted = [];
  var _listeners = {};
  window.TS.emit = function(ev, data) {
    emitted.push({ ev: ev, data: data });
    (_listeners[ev] || []).forEach(function(fn) { try { fn(data); } catch(e) {} });
  };
  window.TS.on = function(ev, fn) { (_listeners[ev] = _listeners[ev] || []).push(fn); };
  window.TS.off = function(ev, fn) {
    if (!_listeners[ev]) return;
    _listeners[ev] = _listeners[ev].filter(function(f) { return f !== fn; });
  };
  window.TS.scenario = 'base';
  // stub TS.data — simulates pnl.ebitda_breakdown
  window.TS.data = function() {
    return {
      pnl: {
        ebitda_breakdown: [
          { year: 2026, revenue: 385,  cogs: -390,  opex: -80,  ebitda: 58.3,   margin_pct: 15.1 },
          { year: 2027, revenue: 1665, cogs: -1050, opex: -150, ebitda: 987.7,  margin_pct: 59.3 },
          { year: 2028, revenue: 2495, cogs: -1287, opex: -220, ebitda: 1121.4, margin_pct: 44.9 }
        ],
        ebitda_total_3y: 2167.4,
        ebitda_margin_avg_pct: 47.7
      }
    };
  };
  // Minimal I18N stub
  window.I18N = { t: function(k) { return k; } };

  // Load charts.js then ebitda.js
  try { require('../charts.js'); }
  catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  try { require('./ebitda.js'); }
  catch(e) { console.error('Cannot load ebitda.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;
  if (!C) { console.error('TS.Charts not available'); if (typeof process !== 'undefined') process.exit(1); return; }

  console.log('--- Chart-2 EBITDA Tests (Phase 2B, S43) ---\n');

  // Helper: fresh container + render
  function mount(scenario) {
    emitted.length = 0;
    var cont = document.createElement('div');
    // jsdom clientWidth is 0 — fake one so createSVG uses sane defaults
    Object.defineProperty(cont, 'clientWidth', { value: 640, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 320, configurable: true });
    document.body.appendChild(cont);
    var ctrl = C.render('ebitda', cont, { scenario: scenario || 'base' });
    return { cont: cont, ctrl: ctrl };
  }

  // ========== 1. hasChart ==========
  (function testRegistered() {
    console.log('[registered] ...');
    assert(C.hasChart('ebitda') === true, "hasChart('ebitda') === true");
    assert(C.chartIds().indexOf('ebitda') >= 0, 'chartIds includes ebitda');
  })();

  // ========== 2. render creates SVG in container ==========
  (function testRender() {
    console.log('[render/SVG] ...');
    var m = mount('base');
    assert(m.ctrl !== null, 'controller returned');
    assert(typeof m.ctrl.update === 'function', 'update fn');
    assert(typeof m.ctrl.destroy === 'function', 'destroy fn');
    var svg = m.cont.querySelector('svg');
    assert(svg !== null, 'SVG created');
    assert(svg.getAttribute('role') === 'img', 'SVG role=img');
    assert(svg.getAttribute('aria-label').length > 0, 'SVG has aria-label');
    // Expect 3 year-bars = 3 "revenue" rects
    var revBars = svg.querySelectorAll('rect[data-point="revenue"]');
    assert(revBars.length === 3, '3 revenue bars for 3 years');
    // Legend: 5 items (Revenue, COGS, OPEX, EBITDA, Margin)
    var legendItems = m.cont.querySelectorAll('.ts-chart-legend > li');
    assert(legendItems.length === 5, '5 legend items');
    // chart:rendered emitted
    var ev = emitted.filter(function(e) { return e.ev === 'chart:rendered'; }).pop();
    assert(ev && ev.data.chartId === 'ebitda', 'chart:rendered emitted for ebitda');
    m.ctrl.destroy();
    document.body.removeChild(m.cont);
  })();

  // ========== 3. controller.update changes EBITDA via scenario ==========
  (function testUpdate() {
    console.log('[controller.update] ...');
    var m = mount('base');
    var baseEbitda = m.ctrl._state.rows.map(function(r) { return r.ebitda; });
    m.ctrl.update({ scenario: 'bull' });
    var bullEbitda = m.ctrl._state.rows.map(function(r) { return r.ebitda; });
    assert(baseEbitda[0] !== bullEbitda[0], 'EBITDA[0] changed after update(bull)');
    assert(bullEbitda[0] > baseEbitda[0], 'bull EBITDA > base EBITDA');
    // SVG re-rendered — still 3 revenue bars
    var revBars = m.cont.querySelectorAll('rect[data-point="revenue"]');
    assert(revBars.length === 3, 'still 3 revenue bars after update');
    m.ctrl.destroy();
    document.body.removeChild(m.cont);
  })();

  // ========== 4. scenario bull != scenario bear ==========
  (function testScenarioDivergence() {
    console.log('[scenario bull vs bear] ...');
    var mBull = mount('bull');
    var bull = mBull.ctrl._state.rows.map(function(r) { return r.ebitda; });
    mBull.ctrl.destroy();
    document.body.removeChild(mBull.cont);

    var mBear = mount('bear');
    var bear = mBear.ctrl._state.rows.map(function(r) { return r.ebitda; });
    mBear.ctrl.destroy();
    document.body.removeChild(mBear.cont);

    assert(bull.length === bear.length && bull.length === 3, 'both scenarios have 3 years');
    var anyDiff = false;
    for (var i = 0; i < bull.length; i++) if (bull[i] !== bear[i]) anyDiff = true;
    assert(anyDiff, 'bull EBITDA differs from bear EBITDA');
    for (var j = 0; j < bull.length; j++) {
      if (bear[j] !== 0) assert(bull[j] > bear[j], 'bull > bear for year idx ' + j);
    }
    // margin_pct should also diverge (proportional to EBITDA given fixed revenue)
    // via re-mount for clean state check
    var mBull2 = mount('bull');
    var mBear2 = mount('bear');
    var mBullMg = mBull2.ctrl._state.rows[0].margin_pct;
    var mBearMg = mBear2.ctrl._state.rows[0].margin_pct;
    assert(mBullMg > mBearMg, 'bull margin > bear margin');
    mBull2.ctrl.destroy(); document.body.removeChild(mBull2.cont);
    mBear2.ctrl.destroy(); document.body.removeChild(mBear2.cont);
  })();

  // ========== 5. click → drilldown:open with chart='ebitda' ==========
  (function testDrilldown() {
    console.log('[click → drilldown:open] ...');
    var m = mount('base');
    emitted.length = 0;
    var revBar = m.cont.querySelector('rect[data-point="revenue"][data-year="2027"]');
    assert(revBar !== null, 'found 2027 revenue bar');
    // Synthesize click via dispatchEvent (jsdom MouseEvent)
    var ev = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    revBar.dispatchEvent(ev);
    var dd = emitted.filter(function(x) { return x.ev === 'drilldown:open'; }).pop();
    assert(dd !== undefined, 'drilldown:open emitted');
    assert(dd && dd.data.chart === 'ebitda', "chart === 'ebitda'");
    assert(dd && String(dd.data.payload.year) === '2027', 'payload.year = 2027');
    assert(dd && typeof dd.data.payload.ebitda === 'number', 'payload.ebitda is number');
    assert(dd && typeof dd.data.payload.margin_pct === 'number', 'payload.margin_pct is number');
    assert(dd && dd.data.payload.scenario === 'base', 'payload.scenario = base');
    m.ctrl.destroy();
    document.body.removeChild(m.cont);
  })();

  // ========== 6. scenario:changed event updates chart ==========
  (function testScenarioEvent() {
    console.log('[scenario:changed → re-render] ...');
    var m = mount('base');
    var before = m.ctrl._state.rows[0].ebitda;
    window.TS.emit('scenario:changed', 'bull');
    var after = m.ctrl._state.rows[0].ebitda;
    assert(after !== before, 'ebitda changes on scenario:changed');
    assert(m.ctrl._state.scenario === 'bull', 'internal state reflects bull');
    m.ctrl.destroy();
    document.body.removeChild(m.cont);
  })();

  // ========== Summary ==========
  console.log('\n=== S43 EBITDA Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
