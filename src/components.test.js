/* S29: Components unit tests — Phase 2A
   Tests: Slider, Modal, DrilldownCard create/destroy without leaks
   Run: node src/components.test.js (requires jsdom or browser) */

(function() {
  'use strict';

  var passed = 0;
  var failed = 0;
  var errors = [];

  function assert(condition, msg) {
    if (condition) {
      passed++;
    } else {
      failed++;
      errors.push('FAIL: ' + msg);
      console.error('FAIL: ' + msg);
    }
  }

  // Minimal DOM shim check
  var hasDOM = typeof document !== 'undefined' && document.createElement;

  if (!hasDOM) {
    // Try to load jsdom for Node environment
    try {
      var jsdom = require('jsdom');
      var dom = new jsdom.JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
      global.requestAnimationFrame = function(fn) { return setTimeout(fn, 16); };
      global.cancelAnimationFrame = function(id) { clearTimeout(id); };
      global.matchMedia = function() {
        return { matches: false, addEventListener: function() {} };
      };
      global.sessionStorage = { _d: {}, getItem: function(k) { return this._d[k] || null; }, setItem: function(k, v) { this._d[k] = v; } };
      global.history = { replaceState: function() {} };
      hasDOM = true;
    } catch (e) {
      console.log('SKIP: jsdom not available, running in browser context only');
      console.log('To run: open this file in a browser after loading components.js');
    }
  }

  if (!hasDOM) {
    console.log('Tests skipped (no DOM). Load in browser with components.js.');
    if (typeof process !== 'undefined') process.exit(0);
    return;
  }

  // Ensure TS namespace
  window.TS = window.TS || {};
  window.TS.A11y = window.TS.A11y || {
    trapFocus: function() { return { id: 999, container: null }; },
    releaseFocus: function() {},
    announce: function() {},
    prefersReducedMotion: function() { return false; }
  };
  window.TS.emit = window.TS.emit || function() {};
  window.TS.on = window.TS.on || function() {};
  window.TS.off = window.TS.off || function() {};

  // Load components if not loaded
  if (!window.TS.Components) {
    try {
      require('./components.js');
    } catch (e) {
      console.error('Could not load components.js:', e.message);
    }
  }

  var C = window.TS.Components;
  if (!C) {
    console.error('TS.Components not available. Tests aborted.');
    if (typeof process !== 'undefined') process.exit(1);
    return;
  }

  console.log('--- Components Unit Tests (Phase 2A) ---\n');

  // === Slider Tests ===
  (function testSlider() {
    console.log('[Slider] Testing create/destroy...');

    var container = document.createElement('div');
    document.body.appendChild(container);

    var onChange_called = false;
    var slider = C.Slider(container, {
      min: 0,
      max: 100,
      step: 5,
      value: 50,
      format: function(v) { return v + '%'; },
      onChange: function(v) { onChange_called = true; },
      a11y: {
        label: 'Test slider',
        valuetext: function(v) { return v + ' percent'; }
      }
    });

    assert(slider !== null, 'Slider should not be null');
    assert(typeof slider.setValue === 'function', 'Slider should have setValue');
    assert(typeof slider.getValue === 'function', 'Slider should have getValue');
    assert(typeof slider.destroy === 'function', 'Slider should have destroy');
    assert(slider.getValue() === 50, 'Slider initial value should be 50');

    // Test setValue
    slider.setValue(75);
    assert(slider.getValue() === 75, 'Slider value should be 75 after setValue');

    // Test boundary clamping
    slider.setValue(200);
    assert(slider.getValue() === 100, 'Slider value should be clamped to max 100');

    slider.setValue(-10);
    assert(slider.getValue() === 0, 'Slider value should be clamped to min 0');

    // Test DOM was created
    assert(container.querySelector('.ts-slider') !== null, 'Slider should render .ts-slider');
    assert(container.querySelector('input[type="range"]') !== null, 'Slider should render range input');

    // Test destroy
    slider.destroy();
    assert(container.querySelector('.ts-slider') === null, 'Slider DOM should be cleaned after destroy');

    document.body.removeChild(container);
    console.log('[Slider] Done.\n');
  })();

  // === Modal Tests ===
  (function testModal() {
    console.log('[Modal] Testing create/open/close/destroy...');

    var openCalled = false;
    var closeCalled = false;

    var modal = C.Modal({
      title: 'Test Modal',
      body: 'Hello world',
      onOpen: function() { openCalled = true; },
      onClose: function() { closeCalled = true; },
      closeOnOverlay: true
    });

    assert(modal !== null, 'Modal should not be null');
    assert(typeof modal.open === 'function', 'Modal should have open');
    assert(typeof modal.close === 'function', 'Modal should have close');
    assert(typeof modal.setBody === 'function', 'Modal should have setBody');
    assert(typeof modal.destroy === 'function', 'Modal should have destroy');

    // Test open
    modal.open();
    assert(openCalled === true, 'Modal onOpen should be called');
    assert(document.querySelector('.ts-modal') !== null, 'Modal should be in DOM when open');
    assert(document.querySelector('.ts-modal-overlay') !== null, 'Modal overlay should be in DOM when open');
    assert(document.querySelector('[role="dialog"]') !== null, 'Modal should have role="dialog"');

    // Test setBody
    var newBody = document.createElement('p');
    newBody.textContent = 'New content';
    modal.setBody(newBody);

    // Test close
    modal.close();
    assert(closeCalled === true, 'Modal onClose should be called');
    assert(document.querySelector('.ts-modal') === null, 'Modal should be removed from DOM when closed');
    assert(document.querySelector('.ts-modal-overlay') === null, 'Overlay should be removed from DOM when closed');

    // Test destroy
    modal.destroy();

    // Verify no leftover DOM
    assert(document.querySelector('.ts-modal') === null, 'No modal DOM after destroy');
    assert(document.querySelector('.ts-modal-overlay') === null, 'No overlay DOM after destroy');

    console.log('[Modal] Done.\n');
  })();

  // === DrilldownCard Tests ===
  (function testDrilldownCard() {
    console.log('[DrilldownCard] Testing create...');

    var card = C.DrilldownCard({
      title: 'Project Alpha',
      subtitle: 'Film production',
      metrics: [
        { label: 'Budget', value: '500M' },
        { label: 'IRR', value: '20.09%' },
        { label: 'MoIC', value: '2.0x' }
      ],
      description: 'A flagship project in the pipeline.',
      links: [
        { text: 'Details', href: '#details' }
      ]
    });

    assert(card !== null, 'DrilldownCard should not be null');
    assert(card.nodeType === 1, 'DrilldownCard should return an HTMLElement');
    assert(card.className === 'ts-drilldown-card', 'DrilldownCard should have correct class');
    assert(card.querySelector('h3') !== null, 'DrilldownCard should have title h3');
    assert(card.querySelectorAll('.ts-drilldown-card__metrics > div').length === 3, 'DrilldownCard should have 3 metric items');

    // Test with minimal data
    var minCard = C.DrilldownCard({});
    assert(minCard !== null, 'DrilldownCard with empty data should not be null');
    assert(minCard.nodeType === 1, 'DrilldownCard with empty data should return HTMLElement');
    assert(minCard.children.length === 0, 'DrilldownCard with empty data should have no children');

    // Test null data
    var nullCard = C.DrilldownCard(null);
    assert(nullCard !== null, 'DrilldownCard with null should not be null');
    assert(nullCard.nodeType === 1, 'DrilldownCard with null should return HTMLElement');

    console.log('[DrilldownCard] Done.\n');
  })();

  // === Summary ===
  console.log('=== Results ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(function(e) { console.log('  ' + e); });
  }

  if (typeof process !== 'undefined') {
    process.exit(failed > 0 ? 1 : 0);
  }
})();
