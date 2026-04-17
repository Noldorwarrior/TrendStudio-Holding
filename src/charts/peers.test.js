/* S48: Chart-7 Peers Scatter unit tests — Phase 2B
   Run: node src/charts/peers.test.js (jsdom auto-shim) */

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
      console.log('SKIP: jsdom not available');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // Minimal TS event bus shim (real macros.js not loaded to keep test hermetic)
  window.TS = window.TS || {};
  var emitted = [];
  var listeners = {};
  window.TS.emit = function(ev, data) {
    emitted.push({ ev: ev, data: data });
    (listeners[ev] || []).forEach(function(fn) { try { fn(data); } catch(e) {} });
  };
  window.TS.on  = function(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  window.TS.off = function(ev, fn) {
    if (!listeners[ev]) return;
    listeners[ev] = listeners[ev].filter(function(f) { return f !== fn; });
  };
  window.TS.scenario = 'base';

  // Synthetic peers fixture (mirrors deck_data_v1.2.0.json shape)
  var PEERS_FIXTURE = {
    comparables: [
      { code:'central_partnership', name:'\u0426\u0435\u043D\u0442\u0440\u0430\u043B \u041F\u0430\u0440\u0442\u043D\u0435\u0440\u0448\u0438\u043F', country:'RU', ev_revenue:1.6, ev_ebitda:7.2, irr_historic:14.3, synthetic:true },
      { code:'kion',                name:'KION (\u041C\u0422\u0421 \u041C\u0435\u0434\u0438\u0430)',                                  country:'RU', ev_revenue:2.4, ev_ebitda:9.1, irr_historic:12.8, synthetic:true },
      { code:'yandex_kinopoisk',    name:'\u042F\u043D\u0434\u0435\u043A\u0441 \u041A\u0438\u043D\u043E\u043F\u043E\u0438\u0441\u043A',  country:'RU', ev_revenue:3.1, ev_ebitda:11.4, irr_historic:16.5, synthetic:true },
      { code:'globalny_kapital',    name:'Global Capital Pics.',              country:'US', ev_revenue:1.9, ev_ebitda:9.4,  irr_historic:11.2, synthetic:true },
      { code:'uniglobal_media',     name:'Uniglobal Media',                   country:'US', ev_revenue:3.2, ev_ebitda:13.1, irr_historic:18.7, synthetic:true },
      { code:'europacorp',          name:'EuropaCorp',                        country:'FR', ev_revenue:1.4, ev_ebitda:6.8,  irr_historic:9.5,  synthetic:true }
    ],
    our_marker: {
      ev_revenue: 1.4, ev_ebitda: 6.5, irr_projected: 20.09,
      label: 'TrendStudio (\u043F\u0440\u043E\u0435\u043A\u0442)'
    },
    note: 'Peers \u2014 illustrative mock',
    synthetic: true
  };

  window.TS.data = function() { return { peers: PEERS_FIXTURE }; };

  // Minimal I18N shim — identity fallback
  window.I18N = {
    t: function(key) { return key; },
    formatCurrency: function(n) { return String(n); },
    formatNumber: function(n) { return String(n); }
  };

  // Load TS.Charts core, then peers chart
  if (!window.TS.Charts) {
    try { require('../charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }
  try { require('./peers.js'); }
  catch(e) { console.error('Cannot load peers.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;
  if (!C) { console.error('TS.Charts not available'); if (typeof process !== 'undefined') process.exit(1); return; }

  console.log('--- Chart-7 Peers Unit Tests (Phase 2B, S48) ---\n');

  // ========== 1. hasChart('peers') ==========
  (function testRegistered() {
    console.log('[registry] ...');
    assert(typeof C.hasChart === 'function', 'TS.Charts.hasChart is function');
    assert(C.hasChart('peers') === true, "hasChart('peers') === true");
    assert(C.chartIds().indexOf('peers') >= 0, "chartIds() includes 'peers'");
  })();

  // ========== 2. render produces 7 points (6 peers + 1 our_marker) ==========
  (function testRenderPoints() {
    console.log('[render/points] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('peers', cont, {});
    assert(ctrl !== null, 'controller returned');
    assert(typeof ctrl.update === 'function', 'controller.update is fn');
    assert(typeof ctrl.destroy === 'function', 'controller.destroy is fn');

    var svg = cont.querySelector('svg');
    assert(svg !== null, '<svg> inserted');

    var circles = cont.querySelectorAll('circle[data-point]');
    assert(circles.length === 6, '6 peer circles rendered, got ' + circles.length);

    var ourStar = cont.querySelector('[data-ours="1"][data-point]');
    assert(ourStar !== null, 'our_marker star rendered');
    assert(ourStar.tagName.toLowerCase() === 'path', 'our_marker rendered as <path> (star)');

    var allPoints = cont.querySelectorAll('[data-point]');
    assert(allPoints.length === 7, '7 total data-points (6 peers + 1 our_marker), got ' + allPoints.length);

    // country coverage — at least one RU, one US, one FR
    assert(cont.querySelectorAll('circle[data-country="RU"]').length >= 1, 'at least one RU peer');
    assert(cont.querySelectorAll('circle[data-country="US"]').length >= 1, 'at least one US peer');
    assert(cont.querySelectorAll('circle[data-country="FR"]').length >= 1, 'at least one FR peer');

    document.body.removeChild(cont);
  })();

  // ========== 3. Synthetic badge visible in DOM ==========
  (function testSyntheticBadge() {
    console.log('[synthetic-badge] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('peers', cont, {});

    var badge = cont.querySelector('.ts-peers-badge');
    assert(badge !== null, 'synthetic badge present in DOM');
    assert(badge.getAttribute('data-synthetic') === '1', "badge has data-synthetic='1'");
    assert(badge.getAttribute('role') === 'note', "badge role=note");
    // content comes from i18n key (identity t(key) returns the key itself)
    assert(badge.textContent && badge.textContent.length > 0, 'badge has visible text');
    assert(badge.textContent.indexOf('ui.chart.peers.synthetic_badge') === 0
        || badge.textContent.indexOf('\u26A0') >= 0
        || badge.textContent.toLowerCase().indexOf('synthetic') >= 0,
        'badge text references synthetic key / warn-glyph / word');

    // disclaimer (under legend) also marked synthetic
    var disc = cont.querySelector('.ts-peers-disclaimer');
    assert(disc !== null, 'disclaimer paragraph present');

    document.body.removeChild(cont);
  })();

  // ========== 4. Click on peer emits drilldown:open with chart='peers' and synthetic:true ==========
  (function testClickDrilldown() {
    console.log('[click-drilldown] ...');
    emitted.length = 0;
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('peers', cont, {});

    var kion = cont.querySelector('circle[data-code="kion"]');
    assert(kion !== null, 'KION peer circle exists');

    // Synthetic click event (jsdom supports MouseEvent)
    var ev = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    kion.dispatchEvent(ev);

    var dd = emitted.filter(function(e) { return e.ev === 'drilldown:open'; }).pop();
    assert(dd != null, 'drilldown:open emitted');
    assert(dd.data && dd.data.chart === 'peers', "drilldown.chart === 'peers'");
    assert(dd.data.payload && dd.data.payload.code === 'kion', "payload.code === 'kion'");
    assert(dd.data.payload.synthetic === true, 'payload.synthetic === true');
    assert(dd.data.payload.country === 'RU', 'payload.country === RU');
    assert(typeof dd.data.payload.ev_ebitda === 'number' && dd.data.payload.ev_ebitda > 0, 'payload.ev_ebitda is positive number');
    assert(typeof dd.data.payload.irr_historic === 'number', 'payload.irr_historic is number');

    // our_marker click emits synthetic:false + ours:true
    emitted.length = 0;
    var star = cont.querySelector('[data-ours="1"]');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    var ddOur = emitted.filter(function(e) { return e.ev === 'drilldown:open'; }).pop();
    assert(ddOur != null, 'drilldown:open emitted for our_marker');
    assert(ddOur.data.payload.ours === true, 'our_marker payload.ours === true');
    assert(ddOur.data.payload.synthetic === false, 'our_marker payload.synthetic === false');

    document.body.removeChild(cont);
  })();

  // ========== 5. our_marker has distinguishing class/shape ==========
  (function testOurMarkerDistinct() {
    console.log('[our-marker-distinct] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('peers', cont, {});

    var star = cont.querySelector('.ts-peer-ours');
    assert(star !== null, "element with class 'ts-peer-ours' present");
    assert(star.getAttribute('data-ours') === '1', "star data-ours='1'");
    assert(star.tagName.toLowerCase() === 'path', 'star uses <path> (not <circle>)');

    var peerFill  = (cont.querySelector('circle[data-code="kion"]').getAttribute('fill') || '').toLowerCase();
    var ourFill   = (star.getAttribute('fill') || '').toLowerCase();
    assert(peerFill !== ourFill, 'our_marker fill differs from peer circle fill');
    // gold palette expectation
    assert(ourFill === '#c9a961' || ourFill.indexOf('c9a961') >= 0, 'our_marker fill is gold (#C9A961)');

    // No peer circle accidentally tagged as ours
    var miss = cont.querySelectorAll('circle[data-ours="1"]');
    assert(miss.length === 0, 'no <circle> is tagged as ours');

    document.body.removeChild(cont);
  })();

  // ========== 6. a11y + aria-label coverage (bonus sanity) ==========
  (function testA11y() {
    console.log('[a11y] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    C.render('peers', cont, {});

    var svg = cont.querySelector('svg');
    assert(svg.getAttribute('aria-label') && svg.getAttribute('aria-label').length > 0, 'svg has aria-label');
    assert(svg.getAttribute('role') === 'img', 'svg role=img (from createSVG)');

    var pts = cont.querySelectorAll('[data-point]');
    var withLabel = 0, withTabindex = 0;
    pts.forEach(function(p) {
      if (p.getAttribute('aria-label')) withLabel++;
      if (p.getAttribute('tabindex') === '0') withTabindex++;
    });
    assert(withLabel === pts.length, 'all points have aria-label');
    assert(withTabindex === pts.length, 'all points keyboard-focusable (tabindex=0)');

    document.body.removeChild(cont);
  })();

  // ========== 7. destroy cleans up ==========
  (function testDestroy() {
    console.log('[destroy] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('peers', cont, {});
    assert(cont.children.length > 0, 'DOM populated after render');
    ctrl.destroy();
    assert(cont.children.length === 0, 'destroy cleaned DOM');
    assert(!cont.classList.contains('ts-chart-peers'), 'class removed on destroy');
    document.body.removeChild(cont);
  })();

  // ========== Summary ==========
  console.log('\n=== Chart-7 Peers Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
