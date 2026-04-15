/* S17: MC IRR Distribution — LP CRITICAL CHART
   Chart.js histogram with det_line annotation at 20.09%.
   Bins generated from data (mc_mean_irr, mc_stdev_irr) via normal approx. */
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

        // Build bins from data-driven mu/sigma (normal approximation)
        var metrics = TS.data().key_metrics;
        if (!metrics || !metrics.mc_mean_irr || !metrics.mc_stdev_irr) {
          throw new Error('S17: mc_mean_irr and mc_stdev_irr required in key_metrics');
        }
        var mu = metrics.mc_mean_irr;
        var sigma = metrics.mc_stdev_irr;
        var p5 = (chartData && chartData.percentiles && chartData.percentiles[0]) ? chartData.percentiles[0].irr : mu - 1.645 * sigma;
        var p95 = (chartData && chartData.percentiles) ? chartData.percentiles[chartData.percentiles.length - 1].irr : mu + 1.645 * sigma;
        var lo = Math.floor(p5 / 3) * 3;
        var hi = Math.ceil(p95 / 3) * 3;
        var nBins = Math.max(Math.round((hi - lo) / 3), 5);
        var binWidth = (hi - lo) / nBins;

        var binLabels = [];
        var binHeights = [];
        var totalArea = 0;
        for (var b = 0; b < nBins; b++) {
          var left = lo + b * binWidth;
          var right = left + binWidth;
          binLabels.push(Math.round(left) + '% \u2013 ' + Math.round(right) + '%');
          // Normal PDF approximation at bin center
          var center = left + binWidth / 2;
          var z = (center - mu) / sigma;
          var h = Math.exp(-0.5 * z * z);
          binHeights.push(h);
          totalArea += h;
        }
        // Scale to ~50000 total
        var nSim = (chartData && chartData.n) ? chartData.n : 50000;
        for (var b2 = 0; b2 < binHeights.length; b2++) {
          binHeights[b2] = Math.round(binHeights[b2] / totalArea * nSim);
        }

        // Gold annotation plugin for deterministic IRR vertical line
        var detLinePlugin = {
          id: 'detLineAnnotation',
          afterDatasetsDraw: function(chart) {
            var xScale = chart.scales.x;
            var yScale = chart.scales.y;
            var ctx = chart.ctx;

            // Position det_line dynamically based on bin range
            var bars = chart.getDatasetMeta(0).data;
            if (!bars || bars.length === 0) return;

            // Calculate which bin detLine falls in and interpolate pixel X
            var detBinIdx = Math.min(Math.max(Math.floor((detLine - lo) / binWidth), 0), bars.length - 1);
            var detBar = bars[detBinIdx];
            var barWidth = detBar.width || 40;
            var fraction = ((detLine - lo) / binWidth) - detBinIdx;
            var lineX = detBar.x - barWidth / 2 + barWidth * Math.max(0, Math.min(1, fraction));

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
