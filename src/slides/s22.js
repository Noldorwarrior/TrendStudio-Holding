/* S22: Waterfall W3 — LP CRITICAL CHART
   Real D3 waterfall showing W3 distribution stages.
   Comparison table of W1–W4 variants below. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-22-waterfall-w3';

  NAV.registerSlide(22, {
    enter: function() {
      var root = document.getElementById('slide-22');
      var data = TS.slide(22);
      var chartData = TS.chartData('s22_waterfall');
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s22-title');
      var subtitleEl = document.getElementById('s22-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s22.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s22.subtitle');

      // D3 Waterfall chart
      var chartContainer = document.getElementById('s22-chart');
      if (chartContainer) {
        chartContainer.innerHTML = '';

        C.D3ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s22.title'),
          description: I18N.t('s22.chart_desc') || I18N.t('s22.subtitle')
        });

        var waterfallData = [
          { label: 'Return of Capital', value: 1250 },
          { label: '8% Coupon 5Y', value: 500 },
          { label: '60/40 Carry', value: 750 },
          { label: 'Total Investor', value: 2500, isTotal: true }
        ];

        // Override with live data if available
        if (chartData && chartData.W3 && chartData.W3.stages) {
          var stages = chartData.W3.stages;
          waterfallData = [];
          for (var s = 0; s < stages.length; s++) {
            waterfallData.push({
              label: stages[s].name || '',
              value: stages[s].investor || 0
            });
          }
          // Add total bar
          if (chartData.W3.total) {
            waterfallData.push({
              label: I18N.t('s22.total_investor') || 'Total Investor',
              value: chartData.W3.total.investor || 2500,
              isTotal: true
            });
          }
        }

        CHARTS.waterfall(CHART_ID, {
          data: waterfallData,
          ariaLabel: I18N.t('s22.waterfall_aria') || 'W3 distribution waterfall: Return of Capital, Preferred Return, Carry, Total Investor'
        });

        ANIM.from(chartContainer, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out'
        });
      }

      // Comparison table (W1–W4 variants)
      var tableContainer = document.getElementById('s22-table');
      if (tableContainer && chartData && chartData.comparison) {
        tableContainer.innerHTML = '';
        var comparison = chartData.comparison;
        var rows = [];
        for (var i = 0; i < comparison.length; i++) {
          var v = comparison[i];
          rows.push([
            v.variant || '',
            I18N.formatCurrency(v.investor),
            I18N.formatNumber(v.inv_pct) + '%',
            I18N.formatCurrency(v.producer),
            v.moic ? v.moic + 'x' : ''
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s22.table_caption') || I18N.t('s22.title'),
          headers: [
            I18N.t('s22.variant') || 'Variant',
            I18N.t('s22.investor') || 'Investor',
            I18N.t('s22.inv_pct') || 'Inv %',
            I18N.t('s22.producer') || 'Producer',
            I18N.t('s22.moic') || 'MOIC'
          ],
          rows: rows
        });

        // Highlight W3 row
        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          for (var k = 0; k < tbodyRows.length; k++) {
            var cells = tbodyRows[k].querySelectorAll('td');
            if (cells.length > 0 && (cells[0].textContent || '').indexOf('W3') !== -1) {
              tbodyRows[k].style.cssText = 'background:rgba(201,169,97,0.12);border-left:3px solid var(--gold);';
              for (var c = 0; c < cells.length; c++) {
                cells[c].style.fontWeight = '600';
              }
            }

            ANIM.from(tbodyRows[k], {
              opacity: 0,
              x: -12,
              duration: 0.35,
              delay: 0.5 + k * 0.06,
              ease: 'power2.out'
            });
          }
        }
      }

      // Note
      var noteEl = document.getElementById('s22-note');
      if (noteEl) {
        noteEl.textContent = I18N.t('s22.note') || '';
      }

      // Tier descriptions from slide data
      var tiers = data.tiers || [];
      // Tiers are informational; rendered via the waterfall and table above
    },

    exit: function() {
      CHARTS.destroy(CHART_ID);
      ANIM.killAll();
    }
  });
})();
