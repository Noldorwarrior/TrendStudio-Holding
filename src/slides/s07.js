/* S07: Thesis 4 — Exit Routes
   7 exit routes displayed as a data table. Passive content. */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(7, {
    enter: function() {
      var root = document.getElementById('slide-7');
      var data = TS.slide(7);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s07-title');
      var subtitleEl = document.getElementById('s07-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s07.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s07.subtitle');

      // Exit routes table
      var tableContainer = document.getElementById('s07-table');
      if (tableContainer) {
        tableContainer.innerHTML = '';
        var exits = data.exits || [];
        var rows = [];
        for (var i = 0; i < exits.length; i++) {
          var e = exits[i];
          rows.push([
            e.id,
            I18N.t('s07.exits.' + i + '.name'),
            e.timing,
            (e.prob * 100) + '%'
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s07.title'),
          headers: [
            I18N.t('s07.col_id'),
            I18N.t('s07.col_name'),
            I18N.t('s07.col_timing'),
            I18N.t('s07.col_prob')
          ],
          rows: rows
        });

        // Animate table entrance
        ANIM.from(table, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
