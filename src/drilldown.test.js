/* S50: Drill-Down coordinator unit tests — Phase 2B
   Run: node src/drilldown.test.js (jsdom auto-shim)
   Pattern: mirrors src/charts/*.test.js. */

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
      var dom = new jsdom.JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost/' });
      global.document = dom.window.document;
      global.window = dom.window;
      global.HTMLElement = dom.window.HTMLElement;
      global.Node = dom.window.Node;
      global.Intl = dom.window.Intl || Intl;
      hasDOM = true;
    } catch(e) {
      console.log('SKIP: jsdom not available');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // ---------- TS shim ----------
  window.TS = window.TS || {};
  var listeners = {};
  window.TS.emit = function(ev, data) {
    (listeners[ev] || []).slice().forEach(function(fn) {
      try { fn(data); } catch(e) { console.error(e); }
    });
  };
  window.TS.on = function(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f) { return f !== fn; });
  };
  // Stub A11y (used by Components.Modal)
  window.TS.A11y = {
    trapFocus: function() { return { release: function() {} }; },
    releaseFocus: function() {},
    announce: function() {}
  };

  // Stub I18N — returns keys verbatim (tests exercise fallback → [!key] path,
  // drilldown.js handles that by returning fb).
  window.I18N = {
    lang: 'ru',
    t: function(key) { return '[!' + key + ']'; }, // forces fallback labels
    formatNumber: function(v) { return String(v); },
    formatCurrency: function(v) { return String(v) + ' млн ₽'; }
  };

  // Stub TS.Charts.formatValue
  window.TS.Charts = window.TS.Charts || {};
  window.TS.Charts.formatValue = function(v, type) {
    if (v == null) return '\u2014';
    if (type === 'currency') return String(v) + ' млн ₽';
    return String(v);
  };

  // Load components.js (provides TS.Components.Modal + DrilldownCard)
  require('./components.js');
  // Load drilldown.js (IIFE, registers TS.Drilldown)
  require('./drilldown.js');

  var D = window.TS.Drilldown;
  // jsdom's readyState is 'loading' at require time, so auto-init is deferred
  // to DOMContentLoaded. Tests run synchronously — call init() explicitly.
  if (D && typeof D.init === 'function') D.init();

  // Clean helper
  function cleanup() {
    if (D && typeof D.close === 'function') D.close();
    // Remove any leftover overlays/modals
    var nodes = document.querySelectorAll('.ts-modal-overlay, .ts-modal, [role="dialog"]');
    nodes.forEach(function(n) { if (n.parentNode) n.parentNode.removeChild(n); });
  }

  // ========== 1. API surface ==========
  console.log('[1] TS.Drilldown API exposed');
  assert(D && typeof D.init === 'function', 'TS.Drilldown.init is function');
  assert(D && typeof D.open === 'function', 'TS.Drilldown.open is function');
  assert(D && typeof D.close === 'function', 'TS.Drilldown.close is function');

  // ========== 2. init() registers listener ==========
  console.log('[2] init() registers drilldown:open listener');
  cleanup();
  // init is called by auto-init on load; verify emitting triggers handler
  var before = document.querySelectorAll('[role="dialog"]').length;
  window.TS.emit('drilldown:open', { chart: 'revenue', payload: { year: 2026, value: 385, scenario: 'base' } });
  var after = document.querySelectorAll('[role="dialog"]').length;
  assert(after === before + 1, 'emit drilldown:open creates [role="dialog"] in DOM (before=' + before + ', after=' + after + ')');

  cleanup();

  // ========== 3. All 7 charts open modal without errors ==========
  console.log('[3] All 7 charts open modal without errors');
  var cases = [
    { chart: 'revenue',  payload: { year: 2027, value: 1665, scenario: 'bull' } },
    { chart: 'ebitda',   payload: { year: 2028, revenue: 2495, ebitda: 624, margin_pct: 25.0, scenario: 'base' } },
    { chart: 'irr',      payload: { rate: 15, horizon: 5, irr: 22.5 } },
    { chart: 'pipeline', payload: { projectId: 'p1', code: 'GK', name: 'Голос крика', type: 'film', stage: 'prod', stage_ru: 'Продакшн', start: '2025-Q2', end: '2026-Q3', release: '2026-Q4', budget_mrub: 120, revenue_mrub: 385 } },
    { chart: 'cashflow', payload: { year: 2027, operating: 800, investing: -300, financing: 100, net: 600, cumulative: 1200 } },
    { chart: 'mc',       payload: { bin_lo: 15, bin_hi: 20, count: 240, probability: 0.24, cumulative: 0.58 } },
    { chart: 'peers',    payload: { company: 'Netflix', ticker: 'NFLX', ev_ebitda: 22.5, pe: 35.1, ps: 5.8, region: 'US', synthetic: false } }
  ];
  cases.forEach(function(c) {
    var threw = false;
    try {
      window.TS.emit('drilldown:open', c);
      var dialog = document.querySelector('[role="dialog"]');
      assert(dialog != null, 'chart=' + c.chart + ' → [role="dialog"] created');
    } catch (e) {
      threw = true;
      console.error('threw for ' + c.chart + ':', e && e.message);
    }
    assert(!threw, 'chart=' + c.chart + ' opens without throwing');
    cleanup();
  });

  // ========== 4. peers with synthetic:true shows warning marker ==========
  console.log('[4] peers + synthetic:true → warning marker');
  cleanup();
  window.TS.emit('drilldown:open', {
    chart: 'peers',
    payload: { company: 'Netflix', ticker: 'NFLX', ev_ebitda: 22, pe: 35, ps: 5, region: 'US', synthetic: true }
  });
  var dialog4 = document.querySelector('[role="dialog"]');
  assert(dialog4 != null, 'peers modal opened');
  var warn = dialog4 && dialog4.querySelector('[data-synthetic="true"]');
  assert(warn != null, 'data-synthetic="true" warning element present');
  assert(warn && /\u26A0|data-stub|zaglushka|заглушка|synthetic/i.test(warn.textContent), 'warning text contains ⚠ or synthetic marker (got: "' + (warn && warn.textContent.slice(0,80)) + '")');
  cleanup();

  // ========== 5. close() removes dialog ==========
  console.log('[5] close() removes [role="dialog"] from DOM');
  cleanup();
  window.TS.emit('drilldown:open', { chart: 'revenue', payload: { year: 2026, value: 385, scenario: 'base' } });
  assert(document.querySelector('[role="dialog"]') != null, 'dialog present before close');
  D.close();
  assert(document.querySelector('[role="dialog"]') == null, 'dialog removed after close()');

  // ========== 6. peers without synthetic → no warning ==========
  console.log('[6] peers without synthetic:true → no warning');
  cleanup();
  window.TS.emit('drilldown:open', {
    chart: 'peers',
    payload: { company: 'Disney', ticker: 'DIS', ev_ebitda: 12, pe: 18, ps: 2, region: 'US', synthetic: false }
  });
  var dialog6 = document.querySelector('[role="dialog"]');
  var warn6 = dialog6 && dialog6.querySelector('[data-synthetic="true"]');
  assert(warn6 == null, 'no warning element when synthetic !== true');
  cleanup();

  // ========== Summary ==========
  console.log('\n========================================');
  console.log('PASSED: ' + passed);
  console.log('FAILED: ' + failed);
  if (failed > 0) {
    console.log('Errors:');
    errors.forEach(function(e) { console.log('  - ' + e); });
    if (typeof process !== 'undefined') process.exit(1);
  } else {
    console.log('ALL TESTS PASSED');
    if (typeof process !== 'undefined') process.exit(0);
  }
})();
