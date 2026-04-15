/* S12: Unit Economics — LP CRITICAL CHART
   Formula + Chart.js grouped bar (3 scenarios) + film portfolio table. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-12-scenarios';

  NAV.registerSlide(12, {
    enter: function() {
      var root = document.getElementById('slide-12');
      var data = TS.slide(12);
      var chartData = TS.chartData('s12_unit_economics');
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s12-title');
      var subtitleEl = document.getElementById('s12-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s12.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s12.subtitle');

      // Formula box
      var formulaEl = document.getElementById('s12-formula');
      if (formulaEl && chartData && chartData.formula) {
        formulaEl.textContent = chartData.formula;
        ANIM.from(formulaEl, {
          opacity: 0,
          y: -10,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.out'
        });
      }

      // Grouped bar chart: 3 scenarios x 3 metrics
      var chartContainer = document.getElementById('s12-chart');
      if (chartContainer && chartData && chartData.scenarios) {
        chartContainer.innerHTML = '';

        var cw = C.ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s12.title'),
          description: I18N.t('s12.subtitle')
        });

        var scenarios = chartData.scenarios;
        var labels = [];
        var hitRates = [];
        var blends = [];
        var revMultipliers = [];

        for (var i = 0; i < scenarios.length; i++) {
          labels.push(scenarios[i].case || '');
          hitRates.push(scenarios[i].hit_rate || 0);
          blends.push(scenarios[i].blend || 0);
          revMultipliers.push(scenarios[i].revenue_multiplier || 0);
        }

        CHARTS.bar(CHART_ID, {
          data: {
            labels: labels,
            datasets: [
              {
                label: I18N.t('s12.hit_rate') || 'Hit Rate',
                data: hitRates,
                backgroundColor: 'rgba(59,130,246,0.85)',
                borderRadius: 4
              },
              {
                label: I18N.t('s12.blend') || 'Blend',
                data: blends,
                backgroundColor: 'rgba(201,169,97,0.85)',
                borderRadius: 4
              },
              {
                label: I18N.t('s12.revenue_multiplier') || 'Revenue Multiplier',
                data: revMultipliers,
                backgroundColor: 'rgba(16,185,129,0.85)',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#9CA3AF',
                  font: { family: "'Inter', sans-serif", size: 12 },
                  usePointStyle: true,
                  pointStyle: 'rectRounded'
                }
              },
              tooltip: CHARTS.defaults.plugins.tooltip
            },
            scales: {
              x: {
                ticks: { color: '#9CA3AF', font: { size: 12 } },
                grid: { color: 'rgba(255,255,255,0.04)' }
              },
              y: {
                ticks: { color: '#9CA3AF', font: { size: 11 } },
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
          delay: 0.2,
          ease: 'power2.out'
        });
      }

      // Film portfolio summary table
      var filmsContainer = document.getElementById('s12-films');
      if (filmsContainer && chartData && chartData.films && chartData.films.length > 0) {
        filmsContainer.innerHTML = '';

        var films = chartData.films;
        var filmRows = [];
        for (var f = 0; f < films.length; f++) {
          var film = films[f];
          filmRows.push([
            film.name || '',
            film.genre || '',
            film.release || '',
            I18N.formatNumber(film.budget || 0),
            I18N.formatNumber(film.revenue || 0),
            (film.margin_pct || 0) + '%',
            film.multiple ? film.multiple.toFixed(1) + 'x' : '',
            film.risk || ''
          ]);
        }

        var table = C.DataTable(filmsContainer, {
          caption: I18N.t('s12.films_caption') || 'Film Portfolio',
          headers: [
            I18N.t('s12.film_name') || 'Film',
            I18N.t('s12.genre') || 'Genre',
            I18N.t('s12.release') || 'Release',
            I18N.t('s12.budget') || 'Budget',
            I18N.t('s12.revenue') || 'Revenue',
            I18N.t('s12.margin') || 'Margin',
            I18N.t('s12.multiple') || 'Multiple',
            I18N.t('s12.risk') || 'Risk'
          ],
          rows: filmRows
        });

        ANIM.from(table, {
          opacity: 0,
          y: 16,
          duration: 0.5,
          delay: 0.4,
          ease: 'power2.out'
        });
      }

      // Note
      var noteEl = document.getElementById('s12-note');
      if (noteEl) {
        noteEl.textContent = I18N.t('s12.note');
      }
    },

    exit: function() {
      CHARTS.destroy(CHART_ID);
      ANIM.killAll();
    }
  });
})();
