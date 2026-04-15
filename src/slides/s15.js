/* S15: WACC — CAPM Build-Up
   Table with component/value/source columns. Final WACC row highlighted. */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(15, {
    enter: function() {
      var root = document.getElementById('slide-15');
      var data = TS.slide(15);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s15-title');
      var subtitleEl = document.getElementById('s15-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s15.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s15.subtitle');

      // CAPM rows table
      var tableContainer = document.getElementById('s15-table');
      if (tableContainer) {
        tableContainer.innerHTML = '';
        var capmRows = data.capm_rows || [];

        var rows = [];
        for (var i = 0; i < capmRows.length; i++) {
          var r = capmRows[i];
          rows.push([
            r.component || '',
            r.value !== undefined ? String(r.value) : '',
            r.source || ''
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s15.title'),
          headers: [
            I18N.t('s15.component') || 'Component',
            I18N.t('s15.value') || 'Value',
            I18N.t('s15.source') || 'Source'
          ],
          rows: rows
        });

        // Highlight the last row (WACC total) in gold
        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          if (tbodyRows.length > 0) {
            var lastRow = tbodyRows[tbodyRows.length - 1];
            lastRow.style.cssText = 'background:rgba(201,169,97,0.12);border-top:2px solid rgba(201,169,97,0.4);';
            var cells = lastRow.querySelectorAll('td');
            for (var c = 0; c < cells.length; c++) {
              cells[c].style.color = 'var(--gold)';
              cells[c].style.fontWeight = '700';
              cells[c].style.fontSize = '15px';
            }
          }

          // Stagger-animate each row
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
