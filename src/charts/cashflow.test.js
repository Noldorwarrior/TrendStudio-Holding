/* S46: Chart-5 CashFlow unit tests — Phase 2B
   Run: node src/charts/cashflow.test.js */

(function() {
  'use strict';
  var passed = 0, failed = 0;
  var errors = [];

  function assert(cond, msg) {
    if (cond) { passed++; console.log('  PASS: ' + msg); }
    else { failed++; errors.push(msg); console.error('  FAIL: ' + msg); }
  }
  function approx(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-6); }

  // DOM shim
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

  // Wire TS.emit/on/off shim (before loading charts.js)
  window.TS = window.TS || {};
  var listeners = {};
  var emitted = [];
  window.TS.scenario = 'base';
  window.TS.emit = function(ev, data) {
    emitted.push({ ev: ev, data: data });
    (listeners[ev] || []).forEach(function(fn){ try { fn(data); } catch(e){} });
  };
  window.TS.on = function(ev, fn) {
    if (!listeners[ev]) listeners[ev] = [];
    listeners[ev].push(fn);
  };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f){ return f !== fn; });
  };
  // Stub TS.data() so cashflow module can read the fixture
  window.TS.data = function() {
    return {
      cashflow: {
        cumulative_last: 1250,
        yearly: [
          { year: 2026, operating: 0,   investing: -1250, financing: 0,   net: -1250 },
          { year: 2029, operating: 0,   investing: 0,    financing: 990, net:  990 },
          { year: 2030, operating: 854, investing: 0,    financing: 260, net: 1114 },
          { year: 2031, operating: 162, investing: 0,    financing: 0,   net:  162 },
          { year: 2032, operating: 234, investing: 0,    financing: 0,   net:  234 }
        ]
      }
    };
  };

  // Load charts core (S41)
  try { require('../charts.js'); }
  catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  // Load cashflow.js (S46)
  try { require('./cashflow.js'); }
  catch(e) { console.error('Cannot load cashflow.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;
  if (!C) { console.error('TS.Charts missing'); if (typeof process !== 'undefined') process.exit(1); return; }

  console.log('--- CashFlow Chart Tests (S46) ---\n');

  // 1. Registered
  console.log('[1] register');
  assert(typeof C.hasChart === 'function' && C.hasChart('cashflow') === true,
    'TS.Charts.hasChart("cashflow") === true');

  // 2. Render creates 5 bar groups
  console.log('[2] render 5 groups');
  var cont = document.createElement('div');
  document.body.appendChild(cont);
  var ctrl = C.render('cashflow', cont, { scenario: 'base' });
  assert(ctrl !== null && typeof ctrl.update === 'function',
    'controller with update() returned');
  var groups = cont.querySelectorAll('.ts-cashflow-bar');
  assert(groups.length === 5, 'exactly 5 bar groups rendered (got ' + groups.length + ')');
  var svg = cont.querySelector('svg');
  assert(svg && svg.getAttribute('role') === 'img',
    'SVG with role=img');
  assert(svg && (svg.getAttribute('aria-label') || '').length > 0,
    'SVG has aria-label');

  // 3. Cumulative sum ≈ 1250 (last point)
  console.log('[3] cumulative ≈ 1250');
  var cum = ctrl._cumulative();
  assert(Array.isArray(cum) && cum.length === 5, 'cumulative is array of 5');
  var lastCum = cum[cum.length - 1];
  assert(approx(lastCum, 1250, 1), 'last cumulative = 1250 (got ' + lastCum + ')');
  // running totals check
  var expected = [-1250, -260, 854, 1016, 1250];
  var running = cum.map(function(v){ return Math.round(v); });
  assert(JSON.stringify(running) === JSON.stringify(expected),
    'running cumulative matches expected ' + JSON.stringify(expected) +
    ' (got ' + JSON.stringify(running) + ')');

  // 4. scenario:bull → operating+financing ×1.2 (positive stack bigger than base)
  console.log('[4] scenario bull increases positives');
  var rowsBase = ctrl._rows().map(function(r){ return { op: r.operating, fn: r.financing }; });
  // trigger scenario change via event
  emitted.length = 0;
  window.TS.emit('scenario:changed', 'bull');
  var rowsBull = ctrl._rows().map(function(r){ return { op: r.operating, fn: r.financing }; });
  // For 2030: operating 854 → 1024.8 ; financing 260 → 312
  assert(rowsBull[2].op > rowsBase[2].op + 100,
    '2030 operating grew under bull (' + rowsBase[2].op + ' → ' + rowsBull[2].op + ')');
  assert(rowsBull[2].fn > rowsBase[2].fn + 30,
    '2030 financing grew under bull (' + rowsBase[2].fn + ' → ' + rowsBull[2].fn + ')');
  // And container still has 5 bars after rerender
  assert(cont.querySelectorAll('.ts-cashflow-bar').length === 5,
    '5 bars after bull rerender');
  // bear goes below base
  window.TS.emit('scenario:changed', 'bear');
  var rowsBear = ctrl._rows().map(function(r){ return { op: r.operating, fn: r.financing }; });
  assert(rowsBear[2].op < rowsBase[2].op,
    '2030 operating shrank under bear (' + rowsBase[2].op + ' → ' + rowsBear[2].op + ')');

  // 5. click on bar → drilldown:open with chart='cashflow'
  console.log('[5] click → drilldown:open');
  // go back to base for predictability
  window.TS.emit('scenario:changed', 'base');
  emitted.length = 0;
  var bars = cont.querySelectorAll('.ts-cashflow-bar');
  assert(bars.length === 5, '5 bars for click test');
  // Fire click event
  var target = bars[0]; // year 2026
  var evt;
  try {
    evt = new window.Event('click', { bubbles: true, cancelable: true });
  } catch(e) {
    evt = document.createEvent('Event');
    evt.initEvent('click', true, true);
  }
  target.dispatchEvent(evt);
  var opens = emitted.filter(function(e){ return e.ev === 'drilldown:open'; });
  assert(opens.length >= 1, 'drilldown:open emitted');
  assert(opens[0].data && opens[0].data.chart === 'cashflow',
    'emitted chart === "cashflow"');
  var pl = opens[0].data.payload || {};
  assert(pl.year === 2026, 'payload.year === 2026 (got ' + pl.year + ')');
  assert(approx(pl.investing, -1250, 1e-3),
    'payload.investing === -1250 (got ' + pl.investing + ')');
  assert(approx(pl.cumulative, -1250, 1e-3),
    'payload.cumulative === -1250 (got ' + pl.cumulative + ')');

  // 6. destroy cleans container
  console.log('[6] destroy');
  ctrl.destroy();
  assert(cont.children.length === 0, 'container cleared after destroy');
  document.body.removeChild(cont);

  console.log('\n=== CashFlow Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e){ console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
