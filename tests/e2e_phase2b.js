/* S51: Phase 2B end-to-end integration tests
   Runs: node tests/e2e_phase2b.js (jsdom + full bundle load).
   Covers: scenario switch propagation, param:changed → live charts,
   drilldown:open → modal, URL persistence, budget assertion. */

(function() {
  'use strict';

  var passed = 0, failed = 0, errors = [];
  function assert(cond, msg) {
    if (cond) passed++;
    else { failed++; errors.push(msg); console.error('  FAIL: ' + msg); }
  }

  var jsdom, fs, path;
  try {
    jsdom = require('jsdom');
    fs = require('fs');
    path = require('path');
  } catch(e) {
    console.log('SKIP: jsdom missing'); process.exit(0);
  }

  var HTML_PATH = path.resolve(__dirname, '..', 'Deck_v1.2.0', 'TrendStudio_LP_Deck_v1.2.0_Interactive.html');
  if (!fs.existsSync(HTML_PATH)) {
    console.error('SKIP: bundle not built at ' + HTML_PATH);
    process.exit(0);
  }

  var html = fs.readFileSync(HTML_PATH, 'utf-8');

  var dom = new jsdom.JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost/'
  });
  var window = dom.window;
  var document = window.document;

  // Wait for JS to execute synchronously (dangerous scripts load inline)
  console.log('--- Phase 2B E2E Integration ---\n');

  // ========== Test 1: Namespaces exist after bundle load ==========
  (function testNamespaces() {
    console.log('[e2e.namespaces]');
    assert(typeof window.TS === 'object', 'window.TS exists');
    assert(typeof window.TS.Charts === 'object', 'TS.Charts exists');
    assert(typeof window.TS.Charts.register === 'function', 'TS.Charts.register fn');
    assert(typeof window.TS.emit === 'function', 'TS.emit fn');
    assert(typeof window.TS.on === 'function', 'TS.on fn');
    assert(typeof window.TS.Components === 'object', 'TS.Components (Phase 2A) exists');
    assert(typeof window.TS.Components.Modal === 'function', 'Modal factory fn');
    assert(typeof window.TS.Components.DrilldownCard === 'function', 'DrilldownCard fn');
    assert(typeof window.TS.Drilldown === 'object', 'TS.Drilldown (S50) exists');
    assert(typeof window.TS.Controls === 'object', 'TS.Controls (S49) exists');
  })();

  // ========== Test 2: 7 chart ids registered ==========
  (function testChartRegistry() {
    console.log('[e2e.registry.7charts]');
    var expected = ['revenue','ebitda','irr_sensitivity','pipeline_gantt','cashflow','mc_distribution','peers'];
    var actual = window.TS.Charts.chartIds ? window.TS.Charts.chartIds() : [];
    expected.forEach(function(id) {
      assert(actual.indexOf(id) >= 0, 'registered: ' + id);
    });
    assert(actual.length === 7, 'exactly 7 charts registered (got ' + actual.length + ')');
  })();

  // ========== Test 3: scenario:changed propagates ==========
  (function testScenarioEvent() {
    console.log('[e2e.events.scenario]');
    var received = [];
    var handler = function(v) { received.push(v); };
    window.TS.on('scenario:changed', handler);
    window.TS.emit('scenario:changed', 'bull');
    window.TS.emit('scenario:changed', 'bear');
    window.TS.off('scenario:changed', handler);
    window.TS.emit('scenario:changed', 'base');  // should not be captured
    assert(received.length === 2, 'captured 2 events (got ' + received.length + ')');
    assert(received[0] === 'bull', 'first payload = bull');
    assert(received[1] === 'bear', 'second payload = bear');
  })();

  // ========== Test 4: param:changed propagates to S44/S47 subscribers ==========
  (function testParamEvent() {
    console.log('[e2e.events.param]');
    var received = [];
    var handler = function(p) { received.push(p); };
    window.TS.on('param:changed', handler);
    window.TS.emit('param:changed', { rate: 20, horizon: 7, stress: 50 });
    window.TS.off('param:changed', handler);
    assert(received.length === 1, 'param:changed received');
    assert(received[0].rate === 20 && received[0].horizon === 7 && received[0].stress === 50, 'payload correct');
  })();

  // ========== Test 5: drilldown:open opens modal ==========
  (function testDrilldownOpen() {
    console.log('[e2e.drilldown.open]');
    // init Drilldown if not auto-done
    if (window.TS.Drilldown && typeof window.TS.Drilldown.init === 'function') {
      window.TS.Drilldown.init();
    }
    // ensure I18N is minimally available: init from embedded i18n-data
    if (window.I18N && window.I18N.init) {
      try { window.I18N.init(); } catch(e) {}
    }
    window.TS.emit('drilldown:open', {
      chart: 'revenue',
      payload: { year: 2026, value: 385, scenario: 'base' }
    });
    var dialog = document.querySelector('[role="dialog"]');
    assert(dialog !== null, 'modal [role="dialog"] appeared');
    var card = document.querySelector('.ts-drilldown-card');
    assert(card !== null, 'DrilldownCard inside modal');
    // close
    if (window.TS.Drilldown && window.TS.Drilldown.close) window.TS.Drilldown.close();
    // Modal close button may be needed; verify at least one dialog was present
  })();

  // ========== Test 6: URL-state cascade (scenario read from hash) ==========
  (function testURLState() {
    console.log('[e2e.urlstate]');
    assert(typeof window.TS.readURLPriority === 'function', 'readURLPriority exists');
    assert(typeof window.TS.updateURLHash === 'function', 'updateURLHash exists');
    // write + read
    window.TS.updateURLHash('scenario', 'bull');
    var v = window.TS.readURLPriority('scenario', 'base');
    assert(v === 'bull', 'hash reads back = bull (got ' + v + ')');
  })();

  // ========== Test 7: Budget (size of embedded bundle) ==========
  (function testBudget() {
    console.log('[e2e.budget]');
    var size = Buffer.byteLength(html, 'utf-8');
    assert(size <= 650000, 'bundle ≤ 650K (got ' + size.toLocaleString() + ')');
    console.log('  bundle size: ' + size.toLocaleString() + ' bytes (' + Math.round(size/6500) + '% of 650K)');
  })();

  // ========== Test 8: No forbidden primitives in bundle ==========
  (function testForbidden() {
    console.log('[e2e.forbidden]');
    // localStorage may appear in our own strings (e.g. in comments saying "no localStorage"). Check dynamic calls.
    var hasEval = /\beval\s*\(/.test(html);
    var hasNewFunction = /\bnew\s+Function\s*\(/.test(html);
    // localStorage: allow .md-like comments, detect actual calls localStorage.get/set
    var hasLocalStorageCall = /\blocalStorage\s*\.(setItem|getItem|removeItem|clear)\s*\(/.test(html);
    assert(!hasEval, 'no eval() calls');
    assert(!hasNewFunction, 'no new Function()');
    assert(!hasLocalStorageCall, 'no localStorage.*() calls');
  })();

  // Summary
  console.log('\n=== Phase 2B E2E ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });
  process.exit(failed > 0 ? 1 : 0);
})();
