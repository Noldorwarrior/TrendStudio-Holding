/* S44: IRR Sensitivity — unit tests
   Run: node src/charts/irr_sensitivity.test.js */

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

  // ---------- TS event shim with on/off/emit ----------
  window.TS = window.TS || {};
  var listeners = {};
  var emitted = [];
  window.TS.emit = function(ev, data) {
    emitted.push({ ev: ev, data: data });
    (listeners[ev] || []).forEach(function(fn) {
      try { fn({ detail: data }); } catch(e) {}
    });
  };
  window.TS.on = function(ev, fn) {
    if (!listeners[ev]) listeners[ev] = [];
    listeners[ev].push(fn);
  };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f) { return f !== fn; });
  };

  // Mock TS.data() — synthetic matrix mirrors deck_data sensitivity.irr_matrix
  window.TS.data = function() {
    return {
      sensitivity: {
        irr_matrix: {
          rates: [10, 12, 15, 18, 20, 22, 25],
          horizons: [3, 5, 7, 10],
          values: [
            [21.58, 22.48, 23.38, 24.72],
            [21.07, 21.95, 22.83, 24.14],
            [20.31, 21.16, 22.00, 23.27],
            [19.55, 20.37, 21.18, 22.40],
            [19.05, 19.84, 20.63, 21.82],
            [18.54, 19.31, 20.08, 21.24],
            [17.78, 18.52, 19.26, 20.37]
          ],
          anchor: { rate: 19, horizon: 5, irr: 20.09 }
        }
      }
    };
  };

  // Load charts.js core, then irr_sensitivity.js
  if (!window.TS.Charts) {
    try { require('../charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }
  try { require('./irr_sensitivity.js'); }
  catch(e) { console.error('Cannot load irr_sensitivity.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;
  console.log('--- IRR Sensitivity Heatmap Unit Tests (S44) ---\n');

  // ========== 1. Chart registered ==========
  (function test_registered() {
    console.log('[register] ...');
    assert(C.hasChart('irr_sensitivity') === true, 'hasChart("irr_sensitivity") === true');
    assert(C.chartIds().indexOf('irr_sensitivity') >= 0, 'chartIds includes irr_sensitivity');
  })();

  // ========== 2. Render creates 28 cells (7×4) ==========
  (function test_cells() {
    console.log('[render 28 cells] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('irr_sensitivity', cont, { rate: 15, horizon: 5 });
    assert(ctrl !== null, 'controller returned');
    var cells = cont.querySelectorAll('rect.ts-irr-cell');
    assert(cells.length === 28, '28 cells rendered (got ' + cells.length + ')');
    // All cells must have data-rate, data-horizon, data-irr
    var missing = 0;
    for (var i = 0; i < cells.length; i++) {
      if (!cells[i].getAttribute('data-rate') || !cells[i].getAttribute('data-horizon')) missing++;
    }
    assert(missing === 0, 'all cells have data-rate + data-horizon');
    // aria-label on chart svg
    var svg = cont.querySelector('svg');
    assert(svg && svg.getAttribute('aria-label'), 'svg has aria-label');
    // Active highlight present
    assert(cont.querySelector('rect.ts-irr-active') !== null, 'active-highlight rect present');
    C.destroy('irr_sensitivity', cont);
    document.body.removeChild(cont);
  })();

  // ========== 3. update({rate:20, horizon:7}) moves highlight ==========
  (function test_update() {
    console.log('[update moves highlight] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('irr_sensitivity', cont, { rate: 15, horizon: 5 });
    var active = cont.querySelector('rect.ts-irr-active');
    var x0 = active.getAttribute('x');
    var y0 = active.getAttribute('y');
    ctrl.update({ rate: 20, horizon: 7 });
    var x1 = active.getAttribute('x');
    var y1 = active.getAttribute('y');
    assert(x0 !== x1 || y0 !== y1, 'active rect position changed after update');
    // state reflects snapped values (20 is in rates, 7 is in horizons)
    assert(ctrl._state.rate === 20, 'state.rate snapped to 20');
    assert(ctrl._state.horizon === 7, 'state.horizon snapped to 7');
    C.destroy('irr_sensitivity', cont);
    document.body.removeChild(cont);
  })();

  // ========== 4. param:changed → live highlight update ==========
  (function test_param_changed() {
    console.log('[param:changed triggers highlight] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('irr_sensitivity', cont, { rate: 10, horizon: 3 });
    var active = cont.querySelector('rect.ts-irr-active');
    var xBefore = active.getAttribute('x');
    var yBefore = active.getAttribute('y');
    // Emit param:changed — subscription in irr_sensitivity.js must react
    window.TS.emit('param:changed', { rate: 25, horizon: 10 });
    var xAfter = active.getAttribute('x');
    var yAfter = active.getAttribute('y');
    assert(xAfter !== xBefore || yAfter !== yBefore,
      'active moved after param:changed event');
    assert(ctrl._state.rate === 25, 'state.rate updated via event (=25)');
    assert(ctrl._state.horizon === 10, 'state.horizon updated via event (=10)');
    C.destroy('irr_sensitivity', cont);
    document.body.removeChild(cont);
  })();

  // ========== 5. click → drilldown:open with chart='irr' ==========
  (function test_drilldown() {
    console.log('[click emits drilldown:open] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('irr_sensitivity', cont, { rate: 15, horizon: 5 });
    // Find a cell and synthesize a click bubbling up to svg
    var cells = cont.querySelectorAll('rect.ts-irr-cell');
    assert(cells.length === 28, 'cells ready for click');
    emitted.length = 0; // clear
    var target = cells[10]; // arbitrary
    var evt;
    try { evt = new window.MouseEvent('click', { bubbles: true, cancelable: true }); }
    catch(e) { evt = document.createEvent('Event'); evt.initEvent('click', true, true); }
    target.dispatchEvent(evt);
    var dd = emitted.filter(function(e) { return e.ev === 'drilldown:open'; }).pop();
    assert(dd != null, 'drilldown:open emitted');
    assert(dd && dd.data && dd.data.chart === 'irr', 'chart === "irr"');
    assert(dd && dd.data && dd.data.payload &&
           typeof dd.data.payload.rate === 'number' &&
           typeof dd.data.payload.horizon === 'number',
           'payload has numeric rate + horizon');
    C.destroy('irr_sensitivity', cont);
    document.body.removeChild(cont);
  })();

  // ========== Summary ==========
  console.log('\n=== IRR Sensitivity Tests (S44) ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
