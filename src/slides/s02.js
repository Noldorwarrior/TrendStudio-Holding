/* S02: Executive Summary — LP CRITICAL CHART
   4 metric cards + bar chart comparing key metrics */
(function() {
  'use strict';

  var C = window.TS.Components;
  var chartId = 'chart-2-exec';

  NAV.registerSlide(2, {
    enter: function() {
      var slide = TS.slide(2);
      var km = TS.data().key_metrics || {};
      if (!slide) return;

      // Title + subtitle
      var titleEl = document.getElementById('s02-title');
      var subtitleEl = document.getElementById('s02-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s02.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s02.subtitle');

      // Metric cards
      var metricsGrid = document.getElementById('s02-metrics');
      if (metricsGrid) {
        metricsGrid.innerHTML = '';
        var stats = slide.stats || [];
        for (var i = 0; i < stats.length; i++) {
          C.MetricCard(metricsGrid, {
            value: stats[i].value,
            label: I18N.t('s02.stats.' + i + '.label'),
            color: stats[i].color
          });
        }
      }

      // Bar chart — 4 metrics comparison (gold-colored bars)
      var chartArea = document.getElementById('s02-chart-area');
      if (chartArea) {
        chartArea.innerHTML = '';
        var wrapper = C.ChartWrapper(chartArea, {
          id: chartId,
          title: I18N.t('s02.title'),
          description: TS.A11y.describeChart({
            type: 'bar',
            title: I18N.t('s02.title'),
            labels: ['Det IRR', 'MoIC', 'Anchor', 'WACC'],
            values: [km.det_irr, km.moic, km.anchor, km.wacc]
          })
        });

        CHARTS.bar(chartId, {
          data: {
            labels: [
              I18N.t('s02.stats.0.label'),
              I18N.t('s02.stats.1.label'),
              I18N.t('s02.stats.2.label'),
              I18N.t('s02.stats.3.label')
            ],
            datasets: [{
              label: I18N.t('s02.title'),
              data: [km.det_irr || 20.09, km.moic || 2.0, (km.anchor || 3000) / 100, km.wacc || 19.05],
              backgroundColor: [
                'rgba(201,169,97,0.85)',
                'rgba(201,169,97,0.70)',
                'rgba(201,169,97,0.55)',
                'rgba(201,169,97,0.40)'
              ],
              borderColor: 'rgba(201,169,97,1)',
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            indexAxis: 'x',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    var idx = ctx.dataIndex;
                    var raw = [km.det_irr, km.moic, km.anchor, km.wacc];
                    var suffixes = ['%', '\u00d7', ' ' + I18N.t('common.currency'), '%'];
                    return raw[idx] + suffixes[idx];
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#9CA3AF', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.06)' }
              },
              x: {
                ticks: {
                  color: '#9CA3AF',
                  font: { size: 10 },
                  maxRotation: 0,
                  callback: function(value, index) {
                    var labels = [
                      'Det IRR',
                      'MoIC',
                      'Anchor /100',
                      'WACC'
                    ];
                    return labels[index] || value;
                  }
                },
                grid: { color: 'rgba(255,255,255,0.04)' }
              }
            }
          }
        });
      }

      // Disclosure
      var disclosureEl = document.getElementById('s02-disclosure');
      if (disclosureEl) {
        disclosureEl.textContent = I18N.t('s02.disclosure');
      }

      // Animate cards in
      var cards = metricsGrid ? metricsGrid.querySelectorAll('.metric-card') : [];
      for (var j = 0; j < cards.length; j++) {
        ANIM.from(cards[j], {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: j * 0.12,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      CHARTS.destroy(chartId);
      ANIM.killAll();
    }
  });
})();
