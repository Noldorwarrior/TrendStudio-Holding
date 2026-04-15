/* S32: Orchestrator — scenario state machine + event bus + init sequence
   Owner: S32 | Phase 2A (extended from Phase 1)
   Dependencies: macros.js (TS, NAV, ANIM, CHARTS, I18N) */

(function() {
  'use strict';

  // === URL State Utilities (public — consumed by S33 i18n) ===

  /**
   * Read a key from URL with priority cascade:
   * 1. ?key=value (query param)
   * 2. #key=value (hash param)
   * 3. sessionStorage.getItem(key)
   * 4. fallback
   */
  function readURLPriority(key, fallback) {
    // 1. Query param
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.has(key)) return params.get(key);
    } catch (e) { /* URLSearchParams not supported — skip */ }

    // 2. Hash param
    var hash = window.location.hash.replace(/^#/, '');
    var hashParts = hash.split('&');
    for (var i = 0; i < hashParts.length; i++) {
      var pair = hashParts[i].split('=');
      if (pair[0] === key && pair.length > 1) return pair[1];
    }

    // 3. sessionStorage
    try {
      var stored = sessionStorage.getItem(key);
      if (stored !== null) return stored;
    } catch (e) { /* sessionStorage blocked */ }

    // 4. fallback
    return fallback;
  }

  /**
   * Update hash param without triggering navigation.
   * Preserves other hash params.
   */
  function updateURLHash(key, value) {
    var hash = window.location.hash.replace(/^#/, '');
    var parts = hash ? hash.split('&') : [];
    var found = false;
    var newParts = [];
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      if (pair[0] === key) {
        newParts.push(key + '=' + encodeURIComponent(value));
        found = true;
      } else if (parts[i]) {
        newParts.push(parts[i]);
      }
    }
    if (!found) newParts.push(key + '=' + encodeURIComponent(value));

    var newHash = newParts.join('&');
    if (typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search + '#' + newHash);
    } else {
      window.location.hash = newHash;
    }

    // Also persist to sessionStorage
    try { sessionStorage.setItem(key, value); } catch (e) { /* blocked */ }
  }

  // Expose URL utilities for S33 and other consumers
  window.TS.readURLPriority = readURLPriority;
  window.TS.updateURLHash = updateURLHash;

  // === S32: Scenario State Machine ===

  var VALID_SCENARIOS = ['base', 'opt', 'pess'];

  // Read initial scenario from URL priority cascade
  var initialScenario = readURLPriority('scenario', 'base');
  if (VALID_SCENARIOS.indexOf(initialScenario) === -1) initialScenario = 'base';
  window.TS.scenario = initialScenario;

  /**
   * Set scenario with validation, URL update, and event emission.
   * Emits 'scenario-change' event with { old, new }.
   */
  TS.setScenario = function(v) {
    if (VALID_SCENARIOS.indexOf(v) === -1) {
      throw new Error('bad scenario: ' + v);
    }
    var old = TS.scenario;
    if (old === v) return;
    TS.scenario = v;
    TS.emit('scenario-change', { old: old, 'new': v });
    updateURLHash('scenario', v);
  };

  // === Init Sequence ===

  function init() {
    // 1. Init i18n
    if (window.I18N && I18N.init) I18N.init();

    // 2. Init keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          NAV.next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          NAV.prev();
          break;
        case 'Home':
          e.preventDefault();
          NAV.go(1);
          break;
        case 'End':
          e.preventDefault();
          NAV.go(25);
          break;
      }
    });

    // 3. Init nav buttons
    var prevBtn = document.getElementById('nav-prev');
    var nextBtn = document.getElementById('nav-next');
    if (prevBtn) prevBtn.addEventListener('click', function() { NAV.prev(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { NAV.next(); });

    // 4. Trigger first slide enter
    var firstSlide = document.getElementById('slide-1');
    if (firstSlide) firstSlide.hidden = false;

    // Wait for all slides to register, then enter slide 1
    requestAnimationFrame(function() {
      setTimeout(function() {
        NAV.go(1);
        // Make body visible
        document.body.classList.add('fonts-loaded');
      }, 50);
    });
  }

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
