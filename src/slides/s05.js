/* S05: Pipeline — LP CRITICAL CHART (Gantt-style horizontal bar)
   7 projects with stage-colored bars on a timeline axis.
   Data from TS.chartData('s05_pipeline') and TS.slide(5). */
(function() {
  'use strict';

  var C = window.TS.Components;
  var chartId = 'chart-5-pipeline';

  // Stage-to-color mapping (cinematic dark palette)
  var stageColors = {
    'Script':          'rgba(139,92,246,0.85)',    // purple
    'Development':     'rgba(59,130,246,0.85)',     // blue
    'Pre-Production':  'rgba(6,182,212,0.85)',      // cyan
    'Production':      'rgba(16,185,129,0.85)',     // green
    'Post-Production': 'rgba(245,158,11,0.85)'      // amber
  };

  // Quarter string to numeric position on timeline (Q1 2026 = 0)
  function quarterToNum(q) {
    if (!q) return 0;
    var parts = q.match(/Q(\d)\s+(\d{4})/);
    if (!parts) return 0;
    var quarter = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);
    return (year - 2026) * 4 + (quarter - 1);
  }

  // Stage to approximate duration in quarters before release
  function stageDuration(stage) {
    switch (stage) {
      case 'Post-Production': return 1;
      case 'Production':      return 3;
      case 'Pre-Production':  return 4;
      case 'Development':     return 6;
      case 'Script':          return 7;
      default:                return 4;
    }
  }

  NAV.registerSlide(5, {
    enter: function() {
      var slide = TS.slide(5);
      var cd = TS.chartData('s05_pipeline');
      var pipeline = (cd && cd.pipeline) || (slide && slide.pipeline) || [];
      if (!slide) return;

      // Title + subtitle
      var titleEl = document.getElementById('s05-title');
      var subtitleEl = document.getElementById('s05-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s05.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s05.subtitle');

      // Build horizontal bar chart (Gantt-style)
      var chartArea = document.getElementById('s05-chart-area');
      if (chartArea && pipeline.length) {
        chartArea.innerHTML = '';

        // Prepare labels and data
        var labels = [];
        var barData = [];
        var bgColors = [];
        var borderColors = [];

        for (var i = 0; i < pipeline.length; i++) {
          var p = pipeline[i];
          var name = I18N.t('s05.pipeline.' + i + '.name');
          labels.push(p.code + ' ' + name);

          var releaseQ = quarterToNum(p.release);
          var duration = stageDuration(p.stage);
          var startQ = Math.max(0, releaseQ - duration);

          barData.push([startQ, releaseQ]);
          bgColors.push(stageColors[p.stage] || 'rgba(201,169,97,0.85)');
          borderColors.push((stageColors[p.stage] || 'rgba(201,169,97,1)').replace('0.85', '1'));
        }

        // A11y description
        var a11yValues = pipeline.map(function(p, idx) {
          return p.code + ': ' + p.stage + ', ' + p.budget + ' ' + I18N.t('common.currency') + ', ' + p.release;
        });

        var wrapper = C.ChartWrapper(chartArea, {
          id: chartId,
          title: I18N.t('s05.title'),
          description: TS.A11y.describeChart({
            type: 'horizontal bar (Gantt)',
            title: I18N.t('s05.title'),
            labels: labels,
            values: a11yValues
          })
        });

        // Quarter labels for x-axis
        var quarterLabels = [
          'Q1 26', 'Q2 26', 'Q3 26', 'Q4 26',
          'Q1 27', 'Q2 27', 'Q3 27', 'Q4 27',
          'Q1 28', 'Q2 28', 'Q3 28', 'Q4 28'
        ];

        CHARTS.bar(chartId, {
          data: {
            labels: labels,
            datasets: [{
              label: I18N.t('s05.title'),
              data: barData,
              backgroundColor: bgColors,
              borderColor: borderColors,
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.6,
              categoryPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: function(ctx) {
                    return ctx[0].label;
                  },
                  label: function(ctx) {
                    var idx = ctx.dataIndex;
                    var p = pipeline[idx];
                    return [
                      p.stage,
                      p.budget + ' ' + I18N.t('common.currency'),
                      p.release
                    ];
                  }
                }
              }
            },
            scales: {
              x: {
                type: 'linear',
                min: 0,
                max: 11,
                ticks: {
                  stepSize: 1,
                  color: '#9CA3AF',
                  font: { size: 10, family: "'Inter', sans-serif" },
                  callback: function(value) {
                    return quarterLabels[value] || '';
                  }
                },
                grid: { color: 'rgba(255,255,255,0.04)' },
                title: { display: false }
              },
              y: {
                ticks: {
                  color: '#F5F5F5',
                  font: { size: 12, family: "'Inter', sans-serif" }
                },
                grid: { display: false }
              }
            }
          }
        });

        // Animate chart area in
        ANIM.from(chartArea, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      // Note / disclosure
      var noteEl = document.getElementById('s05-note');
      if (noteEl) {
        noteEl.textContent = I18N.t('s05.note');
      }
    },

    exit: function() {
      CHARTS.destroy(chartId);
      ANIM.killAll();
    }
  });
})();
