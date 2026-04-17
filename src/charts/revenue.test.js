/* S42: Chart-1 Revenue Waterfall unit tests — Phase 2B
   Run: node src/charts/revenue.test.js (jsdom auto-shim)
   Pattern: mirrors src/charts.test.js. */

(function() {
  'use strict';

  var passed = 0, failed = 0;
  var errors = [];

  function assert(cond, msg) {
    if (cond) { passed++; }
    else { failed++; errors.push(msg); console.error('FAIL: ' + msg); }
  }

  // ---------- jsdom shim ----------
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

  // ---------- TS shim (before requiring charts core) ----------
  window.TS = window.TS || {};
  var listeners = {};
  window.TS.scenario = 'base';
  window.TS.emit = function(ev, data) {
    (listeners[ev] || []).slice().forEach(function(fn) {
      try { fn(data); } catch(e) { console.error(e); }
    });
    window.__emitted = window.__emitted || [];
    window.__emitted.push({ ev: ev, data: data });
  };
  window.TS.on = function(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f) { return f !== fn; });
  };

  // deck data shim
  window.TS.data = function() {
    return {
      pipeline: {
        revenue_by_year: [
          { year: 2026, base: 385,  bull: 462.0,  bear: 269.5 },
          { year: 2027, base: 1665, bull: 1998.0, bear: 1165.5 },
          { year: 2028, base: 2495, bull: 2994.0, bear: 1746.5 }
        ],
        total_3y: { base: 4545, bull: 5454.0, bear: 3181.5 }
      }
    };
  };

  // Load core + chart
  if (!window.TS.Charts) {
    try { require('../charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }
  try { require('./revenue.js'); }
  catch(e) { console.error('Cannot load revenue.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;

  console.log('--- Chart-1 Revenue Waterfall Tests (Phase 2B, S42) ---\n');

  // ========== 1. Registry ==========
  (function testRegistry() {
    console.log('[registry] ...');
    assert(C.hasChart('revenue') === true, 'TS.Charts.hasChart("revenue") true after module load');
    assert(C.chartIds().indexOf('revenue') >= 0, 'chartIds includes "revenue"');
  })();

  // ========== 2. Render creates SVG + role=img ==========
  (function testRender() {
    console.log('[render:base] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    assert(ctrl && typeof ctrl.update === 'function', 'controller returned with update()');
    assert(typeof ctrl.destroy === 'function', 'controller has destroy()');
    var svg = cont.querySelector('svg');
    assert(svg !== null, 'SVG created');
    assert(svg.getAttribute('role') === 'img', 'SVG has role=img');
    assert((svg.getAttribute('aria-label') || '').length > 0, 'SVG aria-label populated');
    // 4 bars (3 years + total)
    var rects = svg.querySelectorAll('rect[data-point]');
    assert(rects.length === 4, 'rendered 4 bars (Y1, Y2Δ, Y3Δ, Total) — got ' + rects.length);
    // legend present
    assert(cont.querySelector('.ts-chart-legend') !== null, 'legend rendered');
    // tabindex for keyboard
    assert(svg.getAttribute('tabindex') === '0', 'SVG tabindex=0 for keyboard focus');
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== 3. update() switches data w/o DOM teardown of container ==========
  (function testUpdate() {
    console.log('[update:bull] ...');
    var cont = document.createElement('div');
    cont.id = 'revenue-cont-update';
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    var baseValue = +cont.querySelector('rect[data-point][data-kind="abs"]').getAttribute('data-value');
    assert(baseValue === 385, 'base 2026 = 385, got ' + baseValue);
    // container reference preserved (not re-created)
    var contBefore = document.getElementById('revenue-cont-update');
    ctrl.update({ scenario: 'bull' });
    var contAfter = document.getElementById('revenue-cont-update');
    assert(contBefore === contAfter, 'container DOM reference unchanged after update');
    var bullValue = +cont.querySelector('rect[data-point][data-kind="abs"]').getAttribute('data-value');
    assert(bullValue === 462, 'bull 2026 = 462, got ' + bullValue);
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== 4. scenario bull ≥ base ==========
  (function testScenarioMonotonicity() {
    console.log('[scenario:bull≥base] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    var baseTotal = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    ctrl.update({ scenario: 'bull' });
    var bullTotal = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    ctrl.update({ scenario: 'bear' });
    var bearTotal = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    assert(bullTotal >= baseTotal, 'bull total ≥ base total (' + bullTotal + ' ≥ ' + baseTotal + ')');
    assert(baseTotal >= bearTotal, 'base total ≥ bear total (' + baseTotal + ' ≥ ' + bearTotal + ')');
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== 5. scenario:changed event re-renders ==========
  (function testScenarioEvent() {
    console.log('[event:scenario:changed] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    var v0 = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    // Fire event — our on() dispatches to subscribers; but the chart registered its own listener via TS.on.
    window.TS.emit('scenario:changed', 'bull');
    var v1 = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    assert(v1 !== v0, 'scenario:changed triggered re-render (total changed ' + v0 + ' → ' + v1 + ')');
    assert(v1 === 5454, 'bull total = 5454 after event');
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== 6. click → drilldown:open with chart='revenue' ==========
  (function testClickDrilldown() {
    console.log('[click:drilldown] ...');
    window.__emitted = [];
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    var rect = cont.querySelector('rect[data-kind="abs"]');
    assert(rect !== null, 'abs bar present');
    // Simulate click via MouseEvent bubbling up SVG
    var ev = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    rect.dispatchEvent(ev);
    var dd = window.__emitted.filter(function(e) { return e.ev === 'drilldown:open'; }).pop();
    assert(dd !== undefined, 'drilldown:open emitted');
    assert(dd && dd.data && dd.data.chart === 'revenue', 'chart=revenue in drilldown event');
    assert(dd && dd.data.payload && dd.data.payload.year === 2026, 'year=2026 in payload');
    assert(dd && dd.data.payload.value === 385, 'value=385 in payload');
    assert(dd && dd.data.payload.scenario === 'base', 'scenario=base in payload');
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== 7. destroy clears DOM and unsubscribes ==========
  (function testDestroy() {
    console.log('[destroy] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    assert(cont.querySelector('svg') !== null, 'svg rendered before destroy');
    var beforeCount = window.__emitted ? window.__emitted.filter(function(e){return e.ev==='drilldown:open';}).length : 0;
    ctrl.destroy();
    assert(cont.querySelector('svg') === null, 'svg removed after destroy');
    assert(cont.children.length === 0, 'container empty after destroy');
    // scenario:changed after destroy must not re-create DOM
    window.TS.emit('scenario:changed', 'bull');
    assert(cont.querySelector('svg') === null, 'scenario:changed ignored after destroy (listener detached)');
    document.body.removeChild(cont);
  })();

  // ========== 8. stress param shrinks values ==========
  (function testStress() {
    console.log('[param:stress] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('revenue', cont, { scenario: 'base' });
    var v0 = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    window.TS.emit('param:changed', { stress: 50 });
    var v1 = +cont.querySelector('rect[data-kind="total"]').getAttribute('data-value');
    assert(v1 < v0, 'stress=50 shrinks total (' + v1 + ' < ' + v0 + ')');
    assert(Math.abs(v1 - v0 * 0.5) < 0.001, 'stress=50 → total × 0.5 exactly');
    ctrl.destroy();
    document.body.removeChild(cont);
  })();

  // ========== Summary ==========
  console.log('\n=== Chart-1 Revenue Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
