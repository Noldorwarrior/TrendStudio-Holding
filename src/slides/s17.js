/* S17: MC IRR Distribution — LP CRITICAL CHART
   Chart.js histogram with det_line annotation at 20.09%.
   Bins simulate bell-ish distribution centered ~7.24% mean. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-17-mc-distribution';

  NAV.registerSlide(17, {
    enter: function() {
      var root = document.getElementById('slide-17');
      var data = TS.slide(17);
      var chartData = TS.chartData('s17_mc_distribution');
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s17-title');
      var subtitleEl = document.getElementById('s17-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s17.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s17.subtitle');

      // Chart
      var chartContainer = document.getElementById('s17-chart');
      if (chartContainer) {
        chartContainer.innerHTML = '';

        var cw = C.ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s17.title'),
          description: I18N.t('s17.chart_desc') || I18N.t('s17.subtitle')
        });

        var detLine = (chartData && chartData.det_line) ? chartData.det_line : 20.09;

        // Bin labels and approximate heights (triangular-ish around mean 7.24%)
        var binLabels = [
          '-5% \u2013 -2%',
          '-2% \u2013 1%',
          '1% \u2013 4%',
          '4% \u2013 7%',
          '7% \u2013 10%',
          '10% \u2013 13%',
          '13% \u2013 16%',
          '16% \u2013 19%',
          '19% \u2013 22%'
        ];
        var binHeights = [500, 2500, 6000, 12000, 14000, 8000, 4500, 2000, 500];

        // Gold annotation plugin for deterministic IRR vertical line
        var detLinePlugin = {
          id: 'detLineAnnotation',
          afterDatasetsDraw: function(chart) {
            var xScale = chart.scales.x;
            var yScale = chart.scales.y;
            var ctx = chart.ctx;

            // det_line at 20.09% falls in the last bin (19-22%), ~position at bin index 8
            // Calculate pixel X for the last bin center area
            var lastBarMeta = chart.getDatasetMeta(0).data;
            if (!lastBarMeta || lastBarMeta.length === 0) return;

            // Position within the last bin: (20.09 - 19) / (22 - 19) = ~0.36 of bin width
            var lastBar = lastBarMeta[lastBarMeta.length - 1];
            var barWidth = lastBar.width || 40;
            var lineX = lastBar.x - barWidth / 2 + barWidth * 0.36;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(201,169,97,0.9)';
            ctx.moveTo(lineX, yScale.top);
            ctx.lineTo(lineX, yScale.bottom);
            ctx.stroke();

            // Label
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(201,169,97,1)';
            ctx.font = "bold 12px 'JetBrains Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillText(I18N.t('s17.det_irr_label') || ('Det IRR: ' + detLine + '%'), lineX, yScale.top - 8);
            ctx.restore();
          }
        };

        CHARTS.bar(CHART_ID, {
          data: {
            labels: binLabels,
            datasets: [{
              label: I18N.t('s17.frequency') || 'Frequency',
              data: binHeights,
              backgroundColor: 'rgba(59,130,246,0.7)',
              borderColor: 'rgba(59,130,246,0.9)',
              borderWidth: 1,
              borderRadius: 2,
              barPercentage: 1.0,
              categoryPercentage: 0.92
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
                ticks: { color: '#9CA3AF', font: { size: 11 }, maxRotation: 45 },
                grid: { color: 'rgba(255,255,255,0.04)' },
                title: {
                  display: true,
                  text: I18N.t('s17.xLabel') || 'IRR %',
                  color: '#9CA3AF'
                }
              },
              y: {
                ticks: { color: '#9CA3AF', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.06)' },
                beginAtZero: true,
                title: {
                  display: true,
                  text: I18N.t('s17.yLabel') || 'n',
                  color: '#9CA3AF'
                }
              }
            }
          }
        });

        // Register the annotation plugin on this chart instance
        var canvas = document.getElementById(CHART_ID);
        if (canvas) {
          var chartInstance = Chart.getChart(canvas);
          if (chartInstance) {
            chartInstance.config.plugins = chartInstance.config.plugins || [];
            chartInstance.config.plugins.push(detLinePlugin);
            chartInstance.update();
          }
        }

        ANIM.from(chartContainer, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out'
        });
      }

      // Percentile badges
      var percContainer = document.getElementById('s17-percentiles');
      if (percContainer && chartData && chartData.percentiles) {
        percContainer.innerHTML = '';
        var percentiles = chartData.percentiles;

        for (var i = 0; i < percentiles.length; i++) {
          var pct = percentiles[i];
          var card = document.createElement('div');
          card.style.cssText = 'background:var(--bg-secondary);border:var(--border-subtle);border-radius:var(--r-md);padding:12px 20px;text-align:center;flex:1;min-width:100px;';

          var valEl = document.createElement('div');
          valEl.style.cssText = "font-family:var(--font-mono);font-size:20px;font-weight:700;color:var(--gold);";
          valEl.textContent = pct.irr + '%';

          var lblEl = document.createElement('div');
          lblEl.style.cssText = 'font-size:12px;color:var(--text-secondary);margin-top:4px;';
          lblEl.textContent = pct.p;

          card.appendChild(valEl);
          card.appendChild(lblEl);
          percContainer.appendChild(card);

          ANIM.from(card, {
            opacity: 0,
            y: 12,
            duration: 0.4,
            delay: 0.5 + i * 0.08,
            ease: 'power2.out'
          });
        }
      }

      // Note
      var noteEl = document.getElementById('s17-note');
      if (noteEl && chartData) {
        var nSim = chartData.n || 50000;
        var seed = chartData.seed || 42;
        noteEl.textContent = I18N.t('s17.note', { n: I18N.formatNumber(nSim), seed: seed });
      }
    },

    exit: function() {
      CHARTS.destroy(CHART_ID);
      ANIM.killAll();
    }
  });
})();
