/* S27: Macros — window.TS, NAV, ANIM, CHARTS, I18N
   Owner: S27 | Phase 1
   Dependencies: theme.css (custom props), a11y.js (TS.A11y) */

(function() {
  'use strict';

  // === TS (global namespace) ===
  var TS = window.TS || {};
  TS.scenario = 'base';
  TS.lang = 'ru';

  var listeners = {};
  TS.emit = function(event, data) {
    (listeners[event] || []).forEach(function(fn) {
      try { fn(data); } catch(e) { console.error('[TS.emit]', event, e); }
    });
  };
  TS.on = function(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  };
  TS.off = function(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(function(f) { return f !== fn; });
  };

  window.TS = TS;

  // === DECK DATA ===
  var _deckData = null;
  TS.data = function() {
    if (!_deckData) {
      var el = document.getElementById('deck-data');
      if (el) {
        try { _deckData = JSON.parse(el.textContent); } catch(e) { _deckData = {}; }
      } else { _deckData = {}; }
    }
    return _deckData;
  };

  TS.slide = function(n) {
    var d = TS.data();
    if (!d.slides) return null;
    return d.slides.find(function(s) { return s.n === n; }) || null;
  };

  TS.chartData = function(key) {
    var d = TS.data();
    return d.chart_data ? d.chart_data[key] : null;
  };

  // === NAV ===
  var NAV = {};
  var slides = {};
  var currentSlide = 1;
  var totalSlides = 25;
  var initialEntered = false;  // fires enter() hook on first NAV.go(currentSlide)

  NAV.registerSlide = function(n, hooks) {
    if (!hooks.exit) {
      console.warn('[NAV] Slide ' + n + ' registered without exit() — auto-cleanup will apply');
    }
    slides[n] = {
      enter: hooks.enter || function(){},
      exit: hooks.exit || function(){}
    };
  };

  NAV.current = function() { return currentSlide; };

  NAV.go = function(n) {
    n = Math.max(1, Math.min(totalSlides, n));
    // Skip no-op navigation, EXCEPT on the very first call — currentSlide starts
    // at 1 and orchestrator init() calls NAV.go(1) to fire slide-1's enter()
    // hook. Without initialEntered, that first call would return early and the
    // cover slide would stay empty.
    if (n === currentSlide && initialEntered) return;

    var oldN = currentSlide;
    var oldSlide = slides[oldN];
    var newSlide = slides[n];

    // Hide old (only if actually changing slides)
    if (oldN !== n) {
      var oldEl = document.getElementById('slide-' + oldN);
      if (oldEl) {
        if (oldSlide && oldSlide.exit) {
          try { oldSlide.exit(); } catch(e) { console.error('[NAV] exit error S' + oldN, e); }
        }
        oldEl.hidden = true;
      }
    }

    // Show new
    currentSlide = n;
    initialEntered = true;
    var newEl = document.getElementById('slide-' + n);
    if (newEl) {
      newEl.hidden = false;
      if (newSlide && newSlide.enter) {
        try { newSlide.enter(); } catch(e) { console.error('[NAV] enter error S' + n, e); }
      }
    }

    // Update nav UI
    var indicator = document.getElementById('nav-indicator');
    if (indicator) indicator.textContent = n + ' / ' + totalSlides;

    var prevBtn = document.getElementById('nav-prev');
    var nextBtn = document.getElementById('nav-next');
    if (prevBtn) prevBtn.disabled = (n <= 1);
    if (nextBtn) nextBtn.disabled = (n >= totalSlides);

    // a11y announce
    if (TS.A11y) TS.A11y.announce('Slide ' + n + ' of ' + totalSlides);

    TS.emit('nav:change', { from: oldN, to: n });
  };

  NAV.next = function() { NAV.go(currentSlide + 1); };
  NAV.prev = function() { NAV.go(currentSlide - 1); };

  window.NAV = NAV;

  // === ANIM ===
  var ANIM = {};
  var activeTweens = [];

  ANIM.tween = function(target, vars) {
    if (TS.A11y && TS.A11y.prefersReducedMotion()) {
      if (target && target.style) {
        var styleKeys = ['opacity', 'transform', 'left', 'top', 'right', 'bottom', 'width', 'height'];
        styleKeys.forEach(function(k) {
          if (vars[k] !== undefined) target.style[k] = vars[k];
        });
      }
      return { kill: function(){} };
    }

    if (typeof gsap !== 'undefined') {
      var tween = gsap.to(target, vars);
      activeTweens.push(tween);
      return tween;
    }

    // CSS fallback
    if (target && target.style) {
      Object.keys(vars).forEach(function(k) {
        if (typeof vars[k] === 'number' || typeof vars[k] === 'string') {
          target.style[k] = vars[k];
        }
      });
    }
    return { kill: function(){} };
  };

  ANIM.from = function(target, vars) {
    if (TS.A11y && TS.A11y.prefersReducedMotion()) {
      return { kill: function(){} };
    }
    if (typeof gsap !== 'undefined') {
      var tween = gsap.from(target, vars);
      activeTweens.push(tween);
      return tween;
    }
    return { kill: function(){} };
  };

  ANIM.killAll = function() {
    activeTweens.forEach(function(t) {
      if (t && typeof t.kill === 'function') t.kill();
    });
    activeTweens = [];
  };

  window.ANIM = ANIM;

  // === CHARTS ===
  var CHARTS = {};
  var chartInstances = {};

  function getCtx(id) {
    var c = document.getElementById(id);
    return c ? c.getContext('2d') : null;
  }

  function storeChart(id, instance) {
    chartInstances[id] = instance;
  }

  var chartColors = [
    'rgba(59, 130, 246, 0.85)',   // chart-1
    'rgba(139, 92, 246, 0.85)',   // chart-2
    'rgba(16, 185, 129, 0.85)',   // chart-3
    'rgba(245, 158, 11, 0.85)',   // chart-4
    'rgba(239, 68, 68, 0.85)',    // chart-5
    'rgba(236, 72, 153, 0.85)',   // chart-6
    'rgba(6, 182, 212, 0.85)',    // chart-7
    'rgba(132, 204, 22, 0.85)',   // chart-8
  ];

  var chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: "'Inter', sans-serif", size: 12 } } },
      tooltip: {
        backgroundColor: '#141A2A',
        titleColor: '#F5F5F5',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(201,169,97,0.25)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10
      }
    },
    scales: {
      x: { ticks: { color: '#9CA3AF', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#9CA3AF', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.06)' } }
    }
  };

  CHARTS.bar = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var merged = Object.assign({}, chartDefaults, config.options || {});
    var c = new Chart(ctx, {
      type: 'bar',
      data: config.data,
      options: merged
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.line = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var merged = Object.assign({}, chartDefaults, config.options || {});
    var c = new Chart(ctx, {
      type: 'line',
      data: config.data,
      options: merged
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.pie = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, {
      type: 'pie',
      data: config.data,
      options: Object.assign({}, { responsive: true, maintainAspectRatio: false, plugins: chartDefaults.plugins }, config.options || {})
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.doughnut = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, {
      type: 'doughnut',
      data: config.data,
      options: Object.assign({}, { responsive: true, maintainAspectRatio: false, plugins: chartDefaults.plugins }, config.options || {})
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.waterfall = function(id, config) {
    // D3-based waterfall chart
    var container = document.getElementById(id);
    if (!container) return null;

    var data = config.data;
    var margin = config.margin || { top: 20, right: 30, bottom: 40, left: 60 };
    var rect = container.getBoundingClientRect();
    var width = rect.width - margin.left - margin.right;
    var height = rect.height - margin.top - margin.bottom;

    var svg = d3.select(container).append('svg')
      .attr('width', rect.width)
      .attr('height', rect.height)
      .attr('role', 'img')
      .attr('aria-label', config.ariaLabel || 'Waterfall chart');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleBand()
      .domain(data.map(function(d) { return d.label; }))
      .range([0, width])
      .padding(0.3);

    var cumulative = 0;
    data.forEach(function(d) {
      d.start = cumulative;
      if (d.isTotal) {
        d.start = 0;
        d.end = d.value;
      } else {
        d.end = cumulative + d.value;
        cumulative = d.end;
      }
    });

    var yMax = d3.max(data, function(d) { return Math.max(d.start, d.end); }) * 1.1;
    var y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('x', function(d) { return x(d.label); })
      .attr('y', function(d) { return y(Math.max(d.start, d.end)); })
      .attr('width', x.bandwidth())
      .attr('height', function(d) { return Math.abs(y(d.start) - y(d.end)); })
      .attr('fill', function(d) {
        if (d.isTotal) return 'rgba(201,169,97,0.85)';
        return d.value >= 0 ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)';
      })
      .attr('rx', 3);

    // Connector lines
    for (var i = 0; i < data.length - 1; i++) {
      if (!data[i].isTotal) {
        g.append('line')
          .attr('x1', x(data[i].label) + x.bandwidth())
          .attr('x2', x(data[i+1].label))
          .attr('y1', y(data[i].end))
          .attr('y2', y(data[i].end))
          .attr('stroke', 'rgba(255,255,255,0.15)')
          .attr('stroke-dasharray', '3,3');
      }
    }

    // Value labels
    g.selectAll('.val-label')
      .data(data)
      .enter().append('text')
      .attr('x', function(d) { return x(d.label) + x.bandwidth() / 2; })
      .attr('y', function(d) { return y(Math.max(d.start, d.end)) - 6; })
      .attr('text-anchor', 'middle')
      .attr('fill', '#F5F5F5')
      .attr('font-size', '11px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text(function(d) { return d.value.toLocaleString('ru-RU'); });

    // Axes
    g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(function(d) { return d.toLocaleString('ru-RU'); }))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px');

    g.selectAll('.domain, .tick line').attr('stroke', 'rgba(255,255,255,0.1)');

    storeChart(id, { svg: svg, type: 'waterfall' });
    return svg.node();
  };

  CHARTS.histogram = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, {
      type: 'bar',
      data: config.data,
      options: Object.assign({}, chartDefaults, {
        plugins: Object.assign({}, chartDefaults.plugins, {
          legend: { display: false }
        }),
        scales: {
          x: Object.assign({}, chartDefaults.scales.x, { title: { display: true, text: config.xLabel || '', color: '#9CA3AF' } }),
          y: Object.assign({}, chartDefaults.scales.y, { title: { display: true, text: config.yLabel || '', color: '#9CA3AF' } })
        }
      }, config.options || {})
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.radar = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, {
      type: 'radar',
      data: config.data,
      options: Object.assign({}, {
        responsive: true, maintainAspectRatio: false,
        plugins: chartDefaults.plugins,
        scales: { r: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#9CA3AF' } } }
      }, config.options || {})
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.heatmap = function(id, config) {
    // Simple heatmap via D3
    var container = document.getElementById(id);
    if (!container) return null;
    storeChart(id, { type: 'heatmap-placeholder' });
    return container;
  };

  CHARTS.funnel = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    // Funnel rendered as horizontal bar chart
    var c = new Chart(ctx, {
      type: 'bar',
      data: config.data,
      options: Object.assign({}, chartDefaults, { indexAxis: 'y' }, config.options || {})
    });
    storeChart(id, c);
    return c;
  };

  CHARTS.bubble = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, { type: 'bubble', data: config.data, options: Object.assign({}, chartDefaults, config.options || {}) });
    storeChart(id, c);
    return c;
  };

  CHARTS.dualAxis = function(id, config) {
    var ctx = getCtx(id);
    if (!ctx) return null;
    var c = new Chart(ctx, { type: 'bar', data: config.data, options: config.options || {} });
    storeChart(id, c);
    return c;
  };

  CHARTS.gantt = function() { return null; };
  CHARTS.sankey = function() { return null; };
  CHARTS.nestedCircles = function() { return null; };
  CHARTS.orgChart = function() { return null; };

  CHARTS.destroy = function(id) {
    if (chartInstances[id]) {
      if (chartInstances[id].destroy) chartInstances[id].destroy();
      else if (chartInstances[id].svg) chartInstances[id].svg.remove();
      delete chartInstances[id];
    }
  };

  CHARTS.destroyAll = function() {
    Object.keys(chartInstances).forEach(function(id) {
      CHARTS.destroy(id);
    });
  };

  CHARTS.colors = chartColors;
  CHARTS.defaults = chartDefaults;

  window.CHARTS = CHARTS;

  // === I18N ===
  var I18N = {};
  var i18nStrings = {};
  var currentLang = 'ru';

  I18N.init = function() {
    var el = document.getElementById('i18n-data');
    if (el) {
      try {
        var all = JSON.parse(el.textContent);
        i18nStrings = all;
      } catch(e) {
        i18nStrings = { ru: {}, en: {} };
      }
    }
  };

  I18N.t = function(key, params) {
    var dict = i18nStrings[currentLang] || {};
    var val = dict[key] || key;
    if (params) {
      Object.keys(params).forEach(function(k) {
        val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return val;
  };

  I18N.setLang = function(lang) {
    currentLang = lang;
    TS.lang = lang;
    TS.emit('lang:change', lang);
  };

  I18N.currentLang = function() { return currentLang; };

  I18N.formatNumber = function(n, decimals) {
    if (typeof n !== 'number') return String(n);
    var opts = { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 };
    return n.toLocaleString('ru-RU', opts);
  };

  I18N.formatCurrency = function(n, unit) {
    return I18N.formatNumber(n) + ' ' + (unit || I18N.t('common.currency'));
  };

  I18N.formatDate = function(d) {
    if (typeof d === 'string') return d;
    return d.toLocaleDateString('ru-RU');
  };

  window.I18N = I18N;
})();
