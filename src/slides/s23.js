/* S23: Terms & Exit — Styled key/value table
   Passive content, no charts. */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(23, {
    enter: function() {
      var root = document.getElementById('slide-23');
      var data = TS.slide(23);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s23-title');
      var subtitleEl = document.getElementById('s23-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s23.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s23.subtitle');

      // Terms table
      var tableContainer = document.getElementById('s23-table');
      if (tableContainer) {
        tableContainer.innerHTML = '';
        var terms = data.terms || [];
        var rows = [];
        for (var i = 0; i < terms.length; i++) {
          rows.push([
            I18N.t('s23.terms.' + i + '.k'),
            I18N.t('s23.terms.' + i + '.v')
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s23.title'),
          headers: [
            I18N.t('s23.term_header') || 'Term',
            I18N.t('s23.value_header') || 'Value'
          ],
          rows: rows
        });

        // Stagger-animate each row
        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          for (var k = 0; k < tbodyRows.length; k++) {
            ANIM.from(tbodyRows[k], {
              opacity: 0,
              x: -16,
              duration: 0.4,
              delay: 0.15 + k * 0.06,
              ease: 'power2.out'
            });
          }
        }
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
