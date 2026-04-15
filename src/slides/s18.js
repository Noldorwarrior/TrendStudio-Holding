/* S18: Deterministic vs Stochastic — LP CRITICAL CHART
   Side-by-side MetricCards (Det IRR 20.09% vs MC Mean IRR 7.24%),
   bar chart comparing the two, DataTable of aspects, conclusion. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-18-det-vs-stoch';

  NAV.registerSlide(18, {
    enter: function() {
      var root = document.getElementById('slide-18');
      var data = TS.slide(18);
      var chartData = TS.chartData('s18_det_vs_stoch');
      if (!root || !data) return;

      var metrics = TS.data().key_metrics || {};

      // Title + subtitle
      var titleEl = document.getElementById('s18-title');
      var subtitleEl = document.getElementById('s18-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s18.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s18.subtitle');

      // Two metric cards
      var metricsContainer = document.getElementById('s18-metrics');
      if (metricsContainer) {
        metricsContainer.innerHTML = '';

        C.MetricCard(metricsContainer, {
          value: (metrics.det_irr || 20.09) + '%',
          label: I18N.t('s18.det_irr_label') || 'Deterministic IRR',
          color: 'gold'
        });

        C.MetricCard(metricsContainer, {
          value: (metrics.mc_mean_irr || 7.24) + '%',
          label: I18N.t('s18.mc_mean_irr_label') || 'MC Mean IRR',
          color: 'gold'
        });

        var cards = metricsContainer.querySelectorAll('.metric-card');
        for (var i = 0; i < cards.length; i++) {
          ANIM.from(cards[i], {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'power2.out'
          });
        }
      }

      // Bar chart comparing Det IRR vs MC Mean IRR
      var chartContainer = document.getElementById('s18-chart');
      if (chartContainer) {
        chartContainer.innerHTML = '';

        C.ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s18.title'),
          description: I18N.t('s18.chart_desc') || I18N.t('s18.subtitle')
        });

        var detIrr = metrics.det_irr || 20.09;
        var mcIrr = metrics.mc_mean_irr || 7.24;

        CHARTS.bar(CHART_ID, {
          data: {
            labels: [
              I18N.t('s18.det_irr_short') || 'Det IRR',
              I18N.t('s18.mc_mean_irr_short') || 'MC Mean IRR'
            ],
            datasets: [{
              label: 'IRR %',
              data: [detIrr, mcIrr],
              backgroundColor: [
                'rgba(201,169,97,0.85)',
                'rgba(59,130,246,0.85)'
              ],
              borderRadius: 6,
              barPercentage: 0.5,
              categoryPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: CHARTS.defaults.plugins.tooltip
            },
            scales: {
              x: {
                ticks: { color: '#9CA3AF', font: { size: 13 } },
                grid: { color: 'rgba(255,255,255,0.04)' }
              },
              y: {
                ticks: {
                  color: '#9CA3AF',
                  font: { size: 11 },
                  callback: function(v) { return v + '%'; }
                },
                grid: { color: 'rgba(255,255,255,0.06)' },
                beginAtZero: true
              }
            }
          }
        });

        ANIM.from(chartContainer, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.25,
          ease: 'power2.out'
        });
      }

      // Comparison table
      var tableContainer = document.getElementById('s18-table');
      if (tableContainer && chartData && chartData.table) {
        tableContainer.innerHTML = '';
        var tableData = chartData.table;

        var rows = [];
        for (var t = 0; t < tableData.length; t++) {
          var row = tableData[t];
          rows.push([
            row.aspect || '',
            row.det || '',
            row.stoch || ''
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s18.table_caption') || I18N.t('s18.title'),
          headers: [
            I18N.t('s18.aspect') || 'Aspect',
            I18N.t('s18.deterministic') || 'Deterministic',
            I18N.t('s18.stochastic') || 'Stochastic'
          ],
          rows: rows
        });

        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          for (var k = 0; k < tbodyRows.length; k++) {
            ANIM.from(tbodyRows[k], {
              opacity: 0,
              x: -12,
              duration: 0.4,
              delay: 0.4 + k * 0.06,
              ease: 'power2.out'
            });
          }
        }
      }

      // Conclusion
      var conclusionEl = document.getElementById('s18-conclusion');
      if (conclusionEl && chartData && chartData.conclusion) {
        conclusionEl.textContent = chartData.conclusion;
        ANIM.from(conclusionEl, {
          opacity: 0,
          y: 10,
          duration: 0.4,
          delay: 0.7,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      CHARTS.destroy(CHART_ID);
      ANIM.killAll();
    }
  });
})();
