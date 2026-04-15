/* S32: Orchestrator — scenario/event bus + init sequence
   Owner: S32 | Phase 1
   Dependencies: macros.js (TS, NAV, ANIM, CHARTS, I18N) */

(function() {
  'use strict';

  // Init sequence: called on DOMContentLoaded
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

  // Event bus: scenario change (Phase 2 stub)
  window.TS.on('scenario:change', function(scenario) {
    window.TS.scenario = scenario;
    // Phase 2: update all slides with new scenario data
  });

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
