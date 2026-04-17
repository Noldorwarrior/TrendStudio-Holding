/* S45: Pipeline Gantt — unit tests (jsdom)
   Run: node src/charts/pipeline_gantt.test.js */

(function() {
  'use strict';

  var passed = 0, failed = 0, errors = [];
  function assert(cond, msg) {
    if (cond) { passed++; }
    else { failed++; errors.push(msg); console.error('FAIL: ' + msg); }
  }

  // DOM shim via jsdom if needed
  var hasDOM = typeof document !== 'undefined' && document.createElement;
  if (!hasDOM) {
    try {
      var jsdom = require('jsdom');
      var dom = new jsdom.JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
      global.HTMLElement = dom.window.HTMLElement;
      global.SVGSVGElement = dom.window.SVGSVGElement;
      global.getComputedStyle = dom.window.getComputedStyle;
      hasDOM = true;
    } catch(e) {
      console.log('SKIP: jsdom not available');
      if (typeof process !== 'undefined') process.exit(0);
      return;
    }
  }

  // TS shim + emit capture
  window.TS = window.TS || {};
  var emitted = [];
  window.TS.emit = function(ev, data) { emitted.push({ ev: ev, data: data }); };
  window.TS.on = window.TS.on || function(){};
  window.TS.off = window.TS.off || function(){};
  window.TS.scenario = 'base';

  // Mock TS.data() → pipeline.projects (7)
  var PROJECTS = [
    { id:'p1', code:'P1', name:'«Крылья Родины»',    type:'film',   stage:'prod',   stage_ru:'Production',      start:'2025-Q4', end:'2026-Q3', release:'Q3 2026', budget_mrub:650, revenue_mrub:1755 },
    { id:'p2', code:'P2', name:'«Северный путь»',    type:'film',   stage:'post',   stage_ru:'Post-Production', start:'2026-Q3', end:'2027-Q1', release:'Q1 2027', budget_mrub:480, revenue_mrub:1296 },
    { id:'p3', code:'P3', name:'«Дом на Арбате»',    type:'series', stage:'dev',    stage_ru:'Development',     start:'2026-Q2', end:'2027-Q4', release:'Q4 2027', budget_mrub:720, revenue_mrub:1944 },
    { id:'p4', code:'P4', name:'«Огонь и вода»',     type:'film',   stage:'pre',    stage_ru:'Pre-Production',  start:'2026-Q2', end:'2027-Q2', release:'Q2 2027', budget_mrub:550, revenue_mrub:1485 },
    { id:'p5', code:'P5', name:'«Наследники»',       type:'series', stage:'dev',    stage_ru:'Development',     start:'2027-Q1', end:'2028-Q3', release:'Q3 2028', budget_mrub:890, revenue_mrub:2403 },
    { id:'p6', code:'P6', name:'«Песнь горизонта»',  type:'film',   stage:'script', stage_ru:'Script',          start:'2026-Q1', end:'2028-Q1', release:'Q1 2028', budget_mrub:420, revenue_mrub:1134 },
    { id:'p7', code:'P7', name:'«Время идти»',       type:'film',   stage:'script', stage_ru:'Script',          start:'2026-Q4', end:'2028-Q4', release:'Q4 2028', budget_mrub:390, revenue_mrub:1053 }
  ];
  window.TS.data = function() { return { pipeline: { projects: PROJECTS } }; };

  // Simple I18N stub
  window.I18N = {
    t: function(k) { return '[!' + k + ']'; } // forces fallbacks in chart code
  };

  // Load charts core
  if (!window.TS.Charts) {
    try { require('../charts.js'); }
    catch(e) { console.error('Cannot load charts.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }
  }
  // Load pipeline gantt
  try { require('./pipeline_gantt.js'); }
  catch(e) { console.error('Cannot load pipeline_gantt.js:', e.message); if (typeof process !== 'undefined') process.exit(1); return; }

  var C = window.TS.Charts;
  console.log('--- Pipeline Gantt Unit Tests (S45) ---\n');

  // === 1. hasChart('pipeline_gantt') === true
  (function test_registered(){
    console.log('[registered]');
    assert(typeof C.hasChart === 'function' && C.hasChart('pipeline_gantt') === true,
      'TS.Charts.hasChart("pipeline_gantt") must be true');
  })();

  // === 2. render creates 7 project bar-groups
  (function test_render_seven_bars(){
    console.log('[render produces 7 bars]');
    var cont = document.createElement('div');
    cont.style.width = '720px'; cont.style.height = '360px';
    Object.defineProperty(cont, 'clientWidth', { value: 720, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 360, configurable: true });
    document.body.appendChild(cont);
    var ctrl = C.render('pipeline_gantt', cont, { scenario: 'base' });
    assert(ctrl !== null, 'controller returned');
    var bars = cont.querySelectorAll('g.ts-gantt-bar');
    assert(bars.length === 7, 'exactly 7 bar-groups, got ' + bars.length);
    // chart:rendered emitted
    var evt = emitted.filter(function(e){return e.ev==='chart:rendered';}).pop();
    assert(evt && evt.data.chartId === 'pipeline_gantt', 'chart:rendered emitted with correct chartId');
    document.body.removeChild(cont);
  })();

  // === 3. each bar has data-project-id p1..p7
  (function test_data_project_id(){
    console.log('[data-project-id]');
    var cont = document.createElement('div');
    Object.defineProperty(cont, 'clientWidth', { value: 720, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 360, configurable: true });
    document.body.appendChild(cont);
    C.render('pipeline_gantt', cont, {});
    var ids = [];
    cont.querySelectorAll('g.ts-gantt-bar').forEach(function(g){
      ids.push(g.getAttribute('data-project-id'));
    });
    var expected = ['p1','p2','p3','p4','p5','p6','p7'];
    var ok = expected.every(function(id){ return ids.indexOf(id) >= 0; });
    assert(ok, 'all p1..p7 present as data-project-id; got ' + ids.join(','));
    // series type marker on p3 and p5
    var p3 = cont.querySelector('g.ts-gantt-bar[data-project-id="p3"]');
    var p5 = cont.querySelector('g.ts-gantt-bar[data-project-id="p5"]');
    assert(p3 && p3.getAttribute('data-type') === 'series', 'p3 marked as series');
    assert(p5 && p5.getAttribute('data-type') === 'series', 'p5 marked as series');
    document.body.removeChild(cont);
  })();

  // === 4. click on a bar → drilldown:open with chart='pipeline' and projectId
  (function test_click_drilldown(){
    console.log('[click → drilldown:open]');
    var cont = document.createElement('div');
    Object.defineProperty(cont, 'clientWidth', { value: 720, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 360, configurable: true });
    document.body.appendChild(cont);
    C.render('pipeline_gantt', cont, {});
    // Clear prior events of this type
    emitted = emitted.filter(function(e){ return e.ev !== 'drilldown:open'; });
    var p4Bar = cont.querySelector('g.ts-gantt-bar[data-project-id="p4"]');
    assert(p4Bar !== null, 'p4 bar-group exists');
    // dispatch click event
    var ev = new window.Event('click', { bubbles: true, cancelable: true });
    p4Bar.dispatchEvent(ev);
    var drill = emitted.filter(function(e){ return e.ev === 'drilldown:open'; }).pop();
    assert(drill != null, 'drilldown:open emitted on click');
    assert(drill && drill.data.chart === 'pipeline', 'chart field === "pipeline"');
    assert(drill && drill.data.payload && drill.data.payload.projectId === 'p4', 'payload.projectId === "p4"');
    assert(drill && drill.data.payload && drill.data.payload.code === 'P4', 'payload.code === "P4"');
    document.body.removeChild(cont);
  })();

  // === 5. legend lists 5 stages
  (function test_legend(){
    console.log('[legend 5 stages]');
    var cont = document.createElement('div');
    Object.defineProperty(cont, 'clientWidth', { value: 720, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 360, configurable: true });
    document.body.appendChild(cont);
    C.render('pipeline_gantt', cont, {});
    var items = cont.querySelectorAll('.ts-gantt-legend-host .ts-chart-legend > li');
    assert(items.length === 5, 'legend has 5 items, got ' + items.length);
    document.body.removeChild(cont);
  })();

  // === 6. aria-label on svg (defensive)
  (function test_aria(){
    console.log('[aria-label]');
    var cont = document.createElement('div');
    Object.defineProperty(cont, 'clientWidth', { value: 720, configurable: true });
    Object.defineProperty(cont, 'clientHeight', { value: 360, configurable: true });
    document.body.appendChild(cont);
    C.render('pipeline_gantt', cont, {});
    var svg = cont.querySelector('svg');
    assert(svg !== null, 'svg rendered');
    assert(svg.getAttribute('aria-label') && svg.getAttribute('aria-label').length > 10, 'svg has a non-trivial aria-label');
    document.body.removeChild(cont);
  })();

  // === Summary ===
  console.log('\n=== Pipeline Gantt Tests ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length) errors.forEach(function(e){ console.log('  ' + e); });
  if (typeof process !== 'undefined') process.exit(failed > 0 ? 1 : 0);
})();
