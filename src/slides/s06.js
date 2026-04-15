/* S06: Thesis 3 — Capital Discipline
   Points list + formula box. Passive (waterfall chart is Phase 2). */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(6, {
    enter: function() {
      var root = document.getElementById('slide-6');
      var data = TS.slide(6);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s06-title');
      var subtitleEl = document.getElementById('s06-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s06.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s06.subtitle');

      // Points list
      var pointsContainer = document.getElementById('s06-points');
      if (pointsContainer) {
        pointsContainer.innerHTML = '';
        var points = data.points || [];
        var localizedPoints = [];
        for (var i = 0; i < points.length; i++) {
          localizedPoints.push(I18N.t('s06.points.' + i));
        }
        var list = C.PointsList(pointsContainer, localizedPoints);

        // Staggered entrance animation
        var items = list.querySelectorAll('li');
        for (var j = 0; j < items.length; j++) {
          ANIM.from(items[j], {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: j * 0.1,
            ease: 'power2.out'
          });
        }
      }

      // Formula box
      var formulaEl = document.getElementById('s06-formula');
      if (formulaEl) {
        formulaEl.textContent = I18N.t('s06.formula_box');
        ANIM.from(formulaEl, {
          opacity: 0,
          y: 16,
          duration: 0.6,
          delay: 0.5,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
