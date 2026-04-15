/* S20: Top 10 Risks — LP CRITICAL CHART
   Horizontal bar chart (severity color-coded) + styled risk table. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-20-top-risks';

  // Map risk level to bar color
  function levelColor(lvl) {
    var l = (lvl || '').toUpperCase();
    if (l === 'CRITICAL') return 'rgba(239,68,68,0.85)';
    if (l === 'HIGH')     return 'rgba(245,158,11,0.85)';
    if (l === 'MEDIUM')   return 'rgba(59,130,246,0.85)';
    return 'rgba(16,185,129,0.85)';
  }

  // Numeric severity for bar height
  function levelValue(lvl) {
    var l = (lvl || '').toUpperCase();
    if (l === 'CRITICAL') return 4;
    if (l === 'HIGH')     return 3;
    if (l === 'MEDIUM')   return 2;
    return 1;
  }

  NAV.registerSlide(20, {
    enter: function() {
      var root = document.getElementById('slide-20');
      var data = TS.slide(20);
      var chartData = TS.chartData('s20_top_risks');
      if (!root || !data) return;

      var risks = (chartData && chartData.top_risks) ? chartData.top_risks : [];

      // Title + subtitle
      var titleEl = document.getElementById('s20-title');
      var subtitleEl = document.getElementById('s20-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s20.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s20.subtitle');

      // Horizontal bar chart
      var chartContainer = document.getElementById('s20-chart');
      if (chartContainer && risks.length > 0) {
        chartContainer.innerHTML = '';

        C.ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s20.title'),
          description: I18N.t('s20.chart_desc') || I18N.t('s20.subtitle')
        });

        var labels = [];
        var values = [];
        var colors = [];
        for (var i = 0; i < risks.length; i++) {
          var r = risks[i];
          labels.push(r.name || ('Risk ' + r.rank));
          values.push(levelValue(r.lvl));
          colors.push(levelColor(r.lvl));
        }

        CHARTS.bar(CHART_ID, {
          data: {
            labels: labels,
            datasets: [{
              label: I18N.t('s20.severity') || 'Severity',
              data: values,
              backgroundColor: colors,
              borderRadius: 4,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: CHARTS.defaults.plugins.tooltip
            },
            scales: {
              x: {
                ticks: {
                  color: '#9CA3AF',
                  font: { size: 11 },
                  stepSize: 1,
                  callback: function(v) {
                    var map = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 4: 'CRITICAL' };
                    return map[v] || v;
                  }
                },
                grid: { color: 'rgba(255,255,255,0.04)' },
                min: 0,
                max: 4.5
              },
              y: {
                ticks: {
                  color: '#9CA3AF',
                  font: { size: 12 },
                  crossAlign: 'far'
                },
                grid: { display: false }
              }
            }
          }
        });

        ANIM.from(chartContainer, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out'
        });
      }

      // Risks table
      var tableContainer = document.getElementById('s20-table');
      if (tableContainer && risks.length > 0) {
        tableContainer.innerHTML = '';

        var rows = [];
        for (var t = 0; t < risks.length; t++) {
          var risk = risks[t];
          rows.push([
            risk.rank || (t + 1),
            risk.name || '',
            risk.cat || '',
            risk.lvl || '',
            risk.mitig || ''
          ]);
        }

        var table = C.DataTable(tableContainer, {
          caption: I18N.t('s20.table_caption') || I18N.t('s20.title'),
          headers: [
            I18N.t('s20.rank') || '#',
            I18N.t('s20.risk_name') || 'Risk',
            I18N.t('s20.category') || 'Category',
            I18N.t('s20.level') || 'Level',
            I18N.t('s20.mitigation') || 'Mitigation'
          ],
          rows: rows
        });

        // Color-code the level cells with badges
        if (table) {
          var tbodyRows = table.querySelectorAll('tbody tr');
          for (var k = 0; k < tbodyRows.length; k++) {
            var cells = tbodyRows[k].querySelectorAll('td');
            // Level is the 4th column (index 3)
            if (cells.length > 3) {
              var lvlText = cells[3].textContent;
              cells[3].textContent = '';
              var badge = C.Badge(lvlText, (lvlText || '').toUpperCase());
              cells[3].appendChild(badge);
            }

            ANIM.from(tbodyRows[k], {
              opacity: 0,
              x: -12,
              duration: 0.35,
              delay: 0.4 + k * 0.05,
              ease: 'power2.out'
            });
          }
        }
      }
    },

    exit: function() {
      CHARTS.destroy(CHART_ID);
      ANIM.killAll();
    }
  });
})();
