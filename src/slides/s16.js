/* S16: MC Methodology — Stochastic Variables Table
   Passive content: 5 stochastic variables + disclosure. */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(16, {
    enter: function() {
      var root = document.getElementById('slide-16');
      var data = TS.slide(16);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s16-title');
      var subtitleEl = document.getElementById('s16-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s16.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s16.subtitle');

      // Variables table
      var tableContainer = document.getElementById('s16-table');
      if (tableContainer) {
        tableContainer.innerHTML = '';
        var variables = data.variables || [];

        var rows = [];
        for (var i = 0; i < variables.length; i++) {
          var v = variables[i];
          rows.push([
            v['var'] || v.variable || '',
            v.dist || v.distribution || ''
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s16.title'),
          headers: [
            I18N.t('s16.variable') || 'Variable',
            I18N.t('s16.distribution') || 'Distribution'
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
              delay: 0.15 + k * 0.08,
              ease: 'power2.out'
            });
          }
        }
      }

      // Disclosure
      var disclosureEl = document.getElementById('s16-disclosure');
      if (disclosureEl) {
        disclosureEl.textContent = data.disclosure || I18N.t('s16.disclosure');
        ANIM.from(disclosureEl, {
          opacity: 0,
          y: 10,
          duration: 0.4,
          delay: 0.6,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
