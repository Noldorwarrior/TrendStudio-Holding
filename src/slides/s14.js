/* S14: Valuation — LP CRITICAL CHART
   DCF + Multiples blend. D3 waterfall chart.
   Method cards at top, D3ChartWrapper for waterfall. */
(function() {
  'use strict';

  var C = window.TS.Components;
  var CHART_ID = 'chart-14-waterfall';

  NAV.registerSlide(14, {
    enter: function() {
      var root = document.getElementById('slide-14');
      var data = TS.slide(14);
      var chartData = TS.chartData('s14_valuation');
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s14-title');
      var subtitleEl = document.getElementById('s14-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s14.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s14.subtitle');

      // Method cards
      var methodsContainer = document.getElementById('s14-methods');
      if (methodsContainer && chartData && chartData.components) {
        methodsContainer.innerHTML = '';
        var components = chartData.components;

        for (var i = 0; i < components.length; i++) {
          var comp = components[i];
          var weightLabel = comp.weight ? (comp.weight * 100) + '%' : '';
          var valueLabel = comp.value_bn ? comp.value_bn.toFixed(2) + 'B' : '';

          C.MetricCard(methodsContainer, {
            value: valueLabel,
            label: (comp.method || '') + (weightLabel ? ' (' + weightLabel + ')' : ''),
            color: 'gold'
          });
        }

        // Animate cards
        var cards = methodsContainer.querySelectorAll('.metric-card');
        for (var j = 0; j < cards.length; j++) {
          ANIM.from(cards[j], {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: j * 0.12,
            ease: 'power2.out'
          });
        }
      }

      // Waterfall chart
      var chartContainer = document.getElementById('s14-chart');
      if (chartContainer && chartData && chartData.bridge) {
        chartContainer.innerHTML = '';

        var d3w = C.D3ChartWrapper(chartContainer, {
          id: CHART_ID,
          title: I18N.t('s14.title'),
          description: I18N.t('s14.subtitle')
        });

        var bridge = chartData.bridge;
        var waterfallData = [
          { label: 'DCF', value: chartData.components && chartData.components[0] ? chartData.components[0].value_bn : 6.2, isTotal: false },
          { label: 'Multiples', value: chartData.components && chartData.components[1] ? chartData.components[1].value_bn : 6.5, isTotal: false },
          { label: I18N.t('s14.blended_ev') || 'Blended EV', value: bridge.ev || 6.38, isTotal: true },
          { label: I18N.t('s14.net_debt') || 'Net Debt', value: bridge.net_debt || -0.5, isTotal: false },
          { label: I18N.t('s14.equity') || 'Equity', value: bridge.equity || 6.88, isTotal: true }
        ];

        CHARTS.waterfall(CHART_ID, {
          data: waterfallData,
          ariaLabel: I18N.t('s14.waterfall_aria') || 'Valuation waterfall: DCF + Multiples to Equity value'
        });

        ANIM.from(chartContainer, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.3,
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
