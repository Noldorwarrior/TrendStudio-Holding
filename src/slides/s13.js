/* S13: Financial Summary
   P&L table with years as columns. EBITDA and NDP rows highlighted in gold.
   Null y_i values render as em-dash (deterministic NDP has no per-year breakdown). */
(function() {
  'use strict';

  var C = window.TS.Components;

  var HIGHLIGHT_ROWS = ['EBITDA', 'NDP'];

  function fmtCell(v) {
    return v != null ? I18N.formatNumber(v) : '\u2014';
  }

  NAV.registerSlide(13, {
    enter: function() {
      var root = document.getElementById('slide-13');
      var data = TS.slide(13);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s13-title');
      var subtitleEl = document.getElementById('s13-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s13.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s13.subtitle');

      // P&L table
      var tableContainer = document.getElementById('s13-table');
      if (tableContainer) {
        tableContainer.innerHTML = '';
        var pl = data.pl || [];

        var rows = [];
        for (var i = 0; i < pl.length; i++) {
          var r = pl[i];
          rows.push([
            r.row || '',
            fmtCell(r.y1),
            fmtCell(r.y2),
            fmtCell(r.y3),
            fmtCell(r.total)
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s13.title'),
          headers: [
            '',
            I18N.t('s13.year1') || 'Y1',
            I18N.t('s13.year2') || 'Y2',
            I18N.t('s13.year3') || 'Y3',
            I18N.t('s13.total') || 'Total'
          ],
          rows: rows
        });

        // Highlight EBITDA and NDP rows in gold
        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          for (var k = 0; k < tbodyRows.length; k++) {
            var firstCell = tbodyRows[k].querySelector('td');
            if (firstCell) {
              var cellText = (firstCell.textContent || '').trim();
              for (var h = 0; h < HIGHLIGHT_ROWS.length; h++) {
                if (cellText.indexOf(HIGHLIGHT_ROWS[h]) !== -1) {
                  tbodyRows[k].style.cssText = 'background:rgba(201,169,97,0.08);';
                  var cells = tbodyRows[k].querySelectorAll('td');
                  for (var c = 0; c < cells.length; c++) {
                    cells[c].style.color = 'var(--gold)';
                    cells[c].style.fontWeight = '700';
                  }
                  break;
                }
              }
            }
          }
        }

        // Source attribution footnote (BUGFIX v3)
        var financial = (TS.data && TS.data.financial) || {};
        var pl_summary = financial.pl_summary || {};
        if (pl_summary.source) {
          var footnote = document.createElement('div');
          footnote.className = 's13-source-note';
          footnote.style.cssText = 'margin-top:8px;font-size:11px;color:#888;font-style:italic;';
          footnote.textContent = 'Источник: ' + pl_summary.source +
            '. Полный P&L — в финмодели и Appendix.';
          tableContainer.appendChild(footnote);
        }

        // Animate table
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
