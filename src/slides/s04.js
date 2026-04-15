/* S04: Thesis 1 — Market Window
   Points list + KPI table. Passive (chart is Phase 2). */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(4, {
    enter: function() {
      var slide = TS.slide(4);
      if (!slide) return;

      // Title + subtitle
      var titleEl = document.getElementById('s04-title');
      var subtitleEl = document.getElementById('s04-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s04.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s04.subtitle');

      // Points list (left column)
      var pointsContainer = document.getElementById('s04-points');
      if (pointsContainer) {
        pointsContainer.innerHTML = '';
        var points = slide.points || [];
        var localizedPoints = [];
        for (var i = 0; i < points.length; i++) {
          localizedPoints.push(I18N.t('s04.points.' + i));
        }
        var list = C.PointsList(pointsContainer, localizedPoints);

        // Animate list items
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

      // KPI table (right column)
      var kpiContainer = document.getElementById('s04-kpi');
      if (kpiContainer) {
        kpiContainer.innerHTML = '';
        var kpiData = slide.kpi || [];
        var rows = [];
        for (var k = 0; k < kpiData.length; k++) {
          rows.push([
            I18N.t('s04.kpi.' + k + '.metric'),
            kpiData[k].value
          ]);
        }
        var table = C.DataTable(kpiContainer, {
          caption: I18N.t('s04.title'),
          headers: ['KPI', I18N.t('common.scenario') + ' (Base)'],
          rows: rows
        });

        ANIM.from(table, {
          opacity: 0,
          x: 20,
          duration: 0.6,
          delay: 0.3,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
