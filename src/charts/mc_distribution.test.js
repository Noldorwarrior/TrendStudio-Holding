/* S47: Chart-6 Monte Carlo IRR Distribution — tests
   Run: node src/charts/mc_distribution.test.js (jsdom auto-shim) */

(function() {
  'use strict';

  var passed = 0, failed = 0, errors = [];
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
      console.log('SKIP: jsdom not available — ' + e.message);
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // ---------- Minimal TS event bus (same shape as macros.js) ----------
  window.TS = window.TS || {};
  var listeners = {};
  window.TS.emit = function(ev, data) {
    emitted.push({ ev: ev, data: data });
    (listeners[ev] || []).forEach(function(fn) { try { fn({ detail: data }); } catch(e){} });
  };
  window.TS.on = function(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f){ return f !== fn; });
  };
  var emitted = [];

  // Mock TS.data() with realistic mc section from deck_data_v1.2.0.json.
  window.TS.data = function() {
    return {
      mc: {
        irr_distribution: (function() {
          var arr = []; var lo = -10;
          for (var i = 0; i < 30; i++) {
            var hi = lo + 1.5;
            // Rough bell probabilities; concrete values don't matter for shape tests.
            var mid = (lo + hi) / 2;
            var p = Math.exp(-Math.pow((mid - 11.44) / 6.47, 2) / 2) * 0.15;
            arr.push({ bin_low: lo, bin_high: hi, prob: Number(p.toFixed(5)) });
            lo = hi;
          }
          return arr;
        })(),
        percentiles: { p5: -0.41, p25: 7.97, p50: 12.0, mean: 11.44, p75: 15.72, p95: 21.11 },
        det_line: 20.09,
        n: 50000,
        seed: 42,
        stdev: 6.47,
        stress_levels: {
          '0':   { mean_shift:  0.0, sigma_mult: 1.0 },
          '25':  { mean_shift: -1.5, sigma_mult: 1.1 },
          '50':  { mean_shift: -3.5, sigma_mult: 1.25 },
          '75':  { mean_shift: -6.0, sigma_mult: 1.4 },
          '100': { mean_shift: -9.0, sigma_mult: 1.6 }
        }
      }
    };
  };

  // I18N mock (returns keys so charts use fallbacks).
  window.I18N = { t: function(k){ return k; }, formatNumber: function(n,d){ return Number(n).toFixed(d||0); } };

  // Load charts.js (S41) and mc_distribution.js (S47).
  if (!window.TS.Charts) {
    try { require('../charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }
  try { require('./mc_distribution.js'); }
  catch(e) { console.error('Cannot load mc_distribution.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;

  console.log('--- S47 MC Distribution Chart Tests ---\n');

  // ========== 1. hasChart ==========
  (function testRegistered() {
    console.log('[1] hasChart(mc_distribution)...');
    assert(C.hasChart('mc_distribution') === true, 'mc_distribution registered in TS.Charts');
  })();

  // ========== 2. render creates 30 bars ==========
  (function testBarsCount() {
    console.log('[2] render creates 30 bars...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('mc_distribution', cont, { stress: 0 });
    assert(ctrl !== null, 'controller returned');
    var bars = cont.querySelectorAll('.ts-mc-bar');
    assert(bars.length === 30, 'exactly 30 bars rendered (got ' + bars.length + ')');
    // each bar has data-point attribute for drilldown handling
    assert(bars[0].getAttribute('data-point') === '1', 'bar has data-point=1');
    assert(bars[0].getAttribute('tabindex') === '0', 'bar is keyboard-focusable');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== 3. update(stress:100) shifts distribution noticeably ==========
  (function testStressShift() {
    console.log('[3] update({stress:100}) shifts percentile markers...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('mc_distribution', cont, { stress: 0 });
    var p50Before = cont.querySelector('.ts-mc-p50');
    var xBefore = p50Before ? parseFloat(p50Before.getAttribute('x1')) : NaN;
    ctrl.update({ stress: 100 });
    var p50After = cont.querySelector('.ts-mc-p50');
    var xAfter = p50After ? parseFloat(p50After.getAttribute('x1')) : NaN;
    assert(!isNaN(xBefore) && !isNaN(xAfter), 'both P50 markers present');
    assert(Math.abs(xAfter - xBefore) > 1, 'P50 marker x shifted noticeably under stress=100 (Δ=' + (xAfter-xBefore).toFixed(2) + ')');
    // Also check that bars re-rendered (still 30)
    assert(cont.querySelectorAll('.ts-mc-bar').length === 30, '30 bars after stress update');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== 4. det_line marker present in DOM ==========
  (function testDetLine() {
    console.log('[4] det_line marker present...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('mc_distribution', cont, { stress: 0 });
    var det = cont.querySelector('.ts-mc-det');
    assert(det !== null, 'ts-mc-det line present');
    assert(det.getAttribute('stroke-dasharray') !== null, 'det line is dashed');
    // det at 20.09% should sit inside the plotted domain
    var x1 = parseFloat(det.getAttribute('x1'));
    assert(!isNaN(x1) && x1 > 40 && x1 < 760, 'det line x in-chart (' + x1 + ')');
    // P5/P50/P95 markers also present
    assert(cont.querySelector('.ts-mc-p5')  !== null, 'P5 marker');
    assert(cont.querySelector('.ts-mc-p50') !== null, 'P50 marker');
    assert(cont.querySelector('.ts-mc-p95') !== null, 'P95 marker');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== 5. param:changed → update invoked ==========
  (function testParamChangedSubscription() {
    console.log('[5] param:changed event triggers update...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('mc_distribution', cont, { stress: 0 });
    var xBefore = parseFloat(cont.querySelector('.ts-mc-p50').getAttribute('x1'));
    // Simulate S49 emitting a param change including stress.
    window.TS.emit('param:changed', { rate: 15, horizon: 5, stress: 75 });
    var xAfter = parseFloat(cont.querySelector('.ts-mc-p50').getAttribute('x1'));
    assert(Math.abs(xAfter - xBefore) > 1,
      'P50 shifted after param:changed with stress=75 (Δ=' + (xAfter - xBefore).toFixed(2) + ')');
    // Event without stress must be ignored (payload without stress key).
    var xBeforeNoStress = parseFloat(cont.querySelector('.ts-mc-p50').getAttribute('x1'));
    window.TS.emit('param:changed', { rate: 20, horizon: 7 });
    var xAfterNoStress = parseFloat(cont.querySelector('.ts-mc-p50').getAttribute('x1'));
    assert(Math.abs(xAfterNoStress - xBeforeNoStress) < 0.001,
      'param:changed without stress does not re-render (Δ=' + (xAfterNoStress - xBeforeNoStress).toFixed(4) + ')');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== 6. click on bar → drilldown:open with chart='mc' ==========
  (function testDrilldownEmit() {
    console.log('[6] click on bar emits drilldown:open...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('mc_distribution', cont, { stress: 0 });
    emitted.length = 0;
    var bar = cont.querySelectorAll('.ts-mc-bar')[15];
    assert(bar !== null && bar !== undefined, 'target bar exists');
    // jsdom supports MouseEvent
    var evt = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    bar.dispatchEvent(evt);
    var drill = emitted.filter(function(e){ return e.ev === 'drilldown:open'; }).pop();
    assert(drill && drill.data && drill.data.chart === 'mc', 'drilldown:open emitted with chart=mc');
    assert(typeof drill.data.payload.bin_low === 'number', 'payload.bin_low is number');
    assert(typeof drill.data.payload.bin_high === 'number', 'payload.bin_high is number');
    assert(typeof drill.data.payload.prob === 'number', 'payload.prob is number');
    assert(drill.data.payload.stress === 0, 'payload.stress reflected (0)');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== 7. aria-label on container ==========
  (function testAria() {
    console.log('[7] aria-label present on container...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('mc_distribution', cont, { stress: 0 });
    assert(cont.getAttribute('role') === 'figure', 'container role=figure');
    assert(cont.getAttribute('aria-label') !== null, 'container has aria-label');
    C.destroy('mc_distribution', cont);
    document.body.removeChild(cont);
  })();

  // ========== Summary ==========
  console.log('\n=== S47 MC Distribution Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e){ console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
