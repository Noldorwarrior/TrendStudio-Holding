/* S41: TS.Charts unit tests — Phase 2B
   Run: node src/charts.test.js (jsdom auto-shim) */

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
      // Don't override global.performance (jsdom's Performance proxies it and recurses forever)
      hasDOM = true;
    } catch(e) {
      console.log('SKIP: jsdom not available — open in browser after loading charts.js');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  window.TS = window.TS || {};
  var emitted = [];
  window.TS.emit = function(ev, data) { emitted.push({ ev: ev, data: data }); };
  window.TS.on = window.TS.on || function(){};
  window.TS.off = window.TS.off || function(){};

  // Load charts.js
  if (!window.TS.Charts) {
    try { require('./charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }

  var C = window.TS.Charts;
  if (!C) { console.error('TS.Charts not available'); if (typeof process !== 'undefined') process.exit(1); return; }

  console.log('--- TS.Charts Unit Tests (Phase 2B, S41) ---\n');

  // ========== 1. Palette ==========
  (function testPalette() {
    console.log('[palette] ...');
    assert(typeof C.palette === 'object', 'palette is object');
    assert(C.palette.base === '#0070C0', 'palette.base = #0070C0');
    assert(C.palette.bull === '#2E7D32', 'palette.bull = green');
    assert(C.palette.bear === '#C62828', 'palette.bear = red');
    assert(C.palette.positive && C.palette.negative && C.palette.neutral, 'positive/negative/neutral present');
    assert(C.palette.stage && C.palette.stage.prod === '#1976D2', 'stage.prod defined');
    // frozen
    var threw = false;
    try { C.palette.base = 'xxx'; } catch(e) { threw = true; }
    // In non-strict mode frozen assignment silently fails, so check value
    assert(C.palette.base === '#0070C0', 'palette.base unchanged after write attempt');
  })();

  // ========== 2. createCanvas ==========
  (function testCreateCanvas() {
    console.log('[createCanvas] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctx = C.createCanvas(cont, 400, 200);
    assert(ctx !== null, 'ctx or fallback ref returned');
    // jsdom without canvas npm pkg → __noContext fallback
    var canvases = cont.querySelectorAll('canvas');
    assert(canvases.length === 1, 'exactly 1 canvas appended');
    assert(canvases[0].__tsW === 400, 'canvas __tsW saved');
    assert(canvases[0].__tsH === 200, 'canvas __tsH saved');
    document.body.removeChild(cont);
  })();

  // ========== 3. createSVG ==========
  (function testCreateSVG() {
    console.log('[createSVG] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var svg = C.createSVG(cont, 300, 150);
    assert(svg !== null, 'svg returned');
    assert(svg.tagName === 'svg' || svg.tagName === 'SVG' || svg.nodeName.toLowerCase() === 'svg', 'tag is svg');
    assert(svg.getAttribute('width') === '300', 'width attr = 300');
    assert(svg.getAttribute('viewBox') === '0 0 300 150', 'viewBox set');
    assert(svg.getAttribute('role') === 'img', 'role=img');
    document.body.removeChild(cont);
  })();

  // ========== 4. formatValue ==========
  (function testFormatValue() {
    console.log('[formatValue] ...');
    assert(C.formatValue(null) === '\u2014', 'null → em-dash');
    assert(C.formatValue(0.201, 'percent').indexOf('0,2') === 0 || C.formatValue(0.201, 'percent').indexOf('0.2') === 0, 'percent 1 decimal');
    assert(C.formatValue(2.0, 'moic').indexOf('2,0') === 0 || C.formatValue(2.0, 'moic').indexOf('2.0') === 0, 'moic has comma/decimal');
    assert(C.formatValue(2.0, 'moic').indexOf('\u00D7') > -1, 'moic has ×');
    assert(C.formatValue(2026, 'year') === '2026', 'year renders int');
    var num = C.formatValue(3000);
    assert(typeof num === 'string' && num.length > 0, 'default number renders');
  })();

  // ========== 5. legend ==========
  (function testLegend() {
    console.log('[legend] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ul = C.legend(cont, [
      { color: C.palette.base, label: 'Base' },
      { color: C.palette.bull, label: 'Bull' },
      { color: C.palette.bear, label: 'Bear' }
    ]);
    assert(ul !== null, 'legend returned');
    assert(cont.querySelectorAll('.ts-chart-legend > li').length === 3, '3 legend items');
    assert(cont.querySelector('[role="list"]') !== null, 'role=list present');
    assert(cont.querySelectorAll('[role="listitem"]').length === 3, '3 listitems');
    document.body.removeChild(cont);
  })();

  // ========== 6. tooltip ==========
  (function testTooltip() {
    console.log('[tooltip] ...');
    var anchor = document.createElement('div');
    document.body.appendChild(anchor);
    var tip = C.tooltip(anchor, 'Hello 2026 год');
    assert(tip !== null, 'tooltip returned');
    assert(tip.textContent === 'Hello 2026 год', 'textContent set');
    assert(tip.style.display === 'block', 'tooltip shown');
    // hide
    C.tooltip(anchor, '');
    assert(tip.style.display === 'none', 'tooltip hidden on empty content');
    // XSS guard (default): pass HTML as text, not innerHTML
    var tip2 = C.tooltip(anchor, '<img src=x onerror=alert(1)>');
    assert(tip2.textContent.indexOf('<img') === 0, 'HTML escaped to text (XSS-safe default)');
    assert(tip2.querySelector('img') === null, 'no <img> in tooltip DOM');
    document.body.removeChild(anchor);
  })();

  // ========== 7. register / render / destroy ==========
  (function testRegistry() {
    console.log('[register/render/destroy] ...');
    assert(typeof C.register === 'function', 'register is fn');
    var calls = [];
    var ok = C.register('testchart', function(container, payload) {
      calls.push({ container: container, payload: payload });
      var span = document.createElement('span');
      span.textContent = 'rendered';
      container.appendChild(span);
      var destroyed = false;
      return {
        update: function(p) { calls.push({ update: p }); },
        destroy: function() { destroyed = true; container.innerHTML = ''; }
      };
    });
    assert(ok === true, 'register returns true');
    assert(C.hasChart('testchart') === true, 'hasChart true');
    assert(C.chartIds().indexOf('testchart') >= 0, 'chartIds includes new id');

    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var ctrl = C.render('testchart', cont, { year: 2026 });
    assert(ctrl !== null, 'controller returned');
    assert(typeof ctrl.update === 'function', 'controller.update fn');
    assert(typeof ctrl.destroy === 'function', 'controller.destroy fn');
    assert(calls.length === 1 && calls[0].payload.year === 2026, 'render invoked fn with payload');
    assert(cont.querySelector('span') !== null, 'render produced DOM');

    // chart:rendered emitted
    var evnt = emitted.filter(function(e) { return e.ev === 'chart:rendered'; }).pop();
    assert(evnt && evnt.data.chartId === 'testchart', 'chart:rendered emitted');
    assert(typeof evnt.data.durationMs === 'number', 'durationMs is number');

    // re-render auto-destroys previous
    C.render('testchart', cont, { year: 2027 });
    assert(cont.querySelectorAll('span').length === 1, 'previous cleared on re-render');

    // destroy
    C.destroy('testchart', cont);
    assert(cont.children.length === 0, 'destroy cleaned DOM');

    // unknown chart returns null + warning (captured silently)
    var nullCtrl = C.render('__does_not_exist__', cont, {});
    assert(nullCtrl === null, 'unknown chart → null');

    document.body.removeChild(cont);
  })();

  // ========== 8. axisX / axisY on SVG ==========
  (function testAxes() {
    console.log('[axisX/axisY] ...');
    var cont = document.createElement('div');
    document.body.appendChild(cont);
    var svg = C.createSVG(cont, 400, 200);
    var labels = C.axisX(svg, [2026, 2027, 2028, 2029, 2030], { type: 'category' });
    assert(Array.isArray(labels) && labels.length > 0, 'axisX returns labels');
    assert(svg.querySelector('.ts-axis-x') !== null, 'axisX created <g>');
    var meta = C.axisY(svg, [0, 3000], { ticks: 5 });
    assert(meta.min === 0 && meta.max === 3000, 'axisY min/max correct');
    assert(meta.values.length === 6, 'axisY returns 6 values (ticks+1)');
    assert(svg.querySelector('.ts-axis-y') !== null, 'axisY created <g>');
    document.body.removeChild(cont);
  })();

  // ========== Summary ==========
  console.log('\n=== TS.Charts Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e) { console.log('  ' + e); });

  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
