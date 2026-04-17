/* S42: Chart-1 Revenue Waterfall — Phase 2B
   Owner: S42 | TS.Charts.register('revenue', ...)
   Data: TS.data().pipeline.revenue_by_year + total_3y (base/bull/bear)
   Emits: drilldown:open | Listens: scenario:changed, param:changed (stress)
   Contract: .claude/phase2b/40_CONTRACTS.md §1-§7 */

(function() {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var W = 640, H = 320, PL = 56, PR = 16, PT = 28, PB = 44;

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  function t(key, fb) {
    var I = window.I18N;
    if (I && typeof I.t === 'function') { var v = I.t(key); if (v && v !== key) return v; }
    return fb == null ? key : fb;
  }

  function getSeries(scenario) {
    var TS = window.TS;
    var pipe = (TS && typeof TS.data === 'function' && TS.data().pipeline) || {};
    var years = pipe.revenue_by_year || [];
    var s = (scenario === 'bull' || scenario === 'bear') ? scenario : 'base';
    var pts = years.map(function(r) { return { year: r.year, value: +r[s] || 0 }; });
    var tot = (pipe.total_3y && pipe.total_3y[s] != null) ? +pipe.total_3y[s]
      : pts.reduce(function(a, p) { return a + p.value; }, 0);
    return { scenario: s, points: pts, total: tot };
  }

  function applyStress(s, stress) {
    var f = 1 - (+stress || 0) / 100;
    if (f === 1) return s;
    return {
      scenario: s.scenario,
      points: s.points.map(function(p) { return { year: p.year, value: p.value * f }; }),
      total: s.total * f
    };
  }

  function build(container, state) {
    var C = window.TS.Charts, pal = C.palette, series = state.series, pts = series.points, total = series.total;
    container.innerHTML = '';
    container.classList.add('ts-chart-revenue');
    var wrap = container.appendChild(document.createElement('div'));
    wrap.className = 'ts-chart-wrap';
    var svg = C.createSVG(wrap, W, H);
    svg.setAttribute('aria-label', t('a11y.chart.revenue.label', 'Revenue waterfall 2026–2028'));
    svg.setAttribute('tabindex', '0');
    svg.appendChild(el('text', { x: PL, y: 18, 'font-size': 14, 'font-weight': 600, fill: '#F5F5F5' }, t('ui.chart.revenue.title', 'Revenue by year')));

    // bars: Y1, Y2Δ, Y3Δ, Total
    var bars = [];
    if (pts[0]) bars.push({ kind: 'abs', label: String(pts[0].year), value: pts[0].value, year: pts[0].year });
    if (pts[1]) bars.push({ kind: 'delta', label: String(pts[1].year), value: pts[1].value, year: pts[1].year, baseLine: pts[0].value });
    if (pts[2]) bars.push({ kind: 'delta', label: String(pts[2].year), value: pts[2].value, year: pts[2].year, baseLine: pts[0].value + pts[1].value });
    bars.push({ kind: 'total', label: t('ui.chart.revenue.total', 'Total 3Y'), value: total });

    var iW = W - PL - PR, iH = H - PT - PB, n = bars.length, slot = iW / n, barW = Math.max(20, slot * 0.52);
    var cumMax = pts.reduce(function(a, p) { return a + p.value; }, 0);
    var yMax = Math.max(total, cumMax) * 1.08 || 1;
    function Y(v) { return PT + iH - (v / yMax) * iH; }
    var yAxisLabel = t('ui.chart.revenue.axis.y', 'M RUB');

    // gridlines + y-labels (5 ticks)
    for (var g = 0; g <= 4; g++) {
      var yv = (yMax / 4) * g, yy = Y(yv);
      svg.appendChild(el('line', { x1: PL, x2: W - PR, y1: yy, y2: yy, stroke: 'rgba(255,255,255,0.08)' }));
      svg.appendChild(el('text', { x: PL - 6, y: yy + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#9CA3AF' }, C.formatValue(yv, 'number')));
    }
    var yMid = PT + iH / 2;
    svg.appendChild(el('text', { x: 8, y: yMid, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF', transform: 'rotate(-90 8,' + yMid + ')' }, yAxisLabel));
    svg.appendChild(el('line', { x1: PL, x2: W - PR, y1: PT + iH, y2: PT + iH, stroke: 'rgba(255,255,255,0.3)' }));

    bars.forEach(function(b, i) {
      var cx = PL + slot * i + (slot - barW) / 2;
      var yTop, yBot, fill;
      if (b.kind === 'delta') {
        yTop = Y(b.baseLine + b.value); yBot = Y(b.baseLine); fill = pal.positive;
        svg.appendChild(el('line', { x1: cx - (slot - barW) / 2, x2: cx, y1: Y(b.baseLine), y2: Y(b.baseLine), stroke: 'rgba(255,255,255,0.3)', 'stroke-dasharray': '3,3' }));
      } else {
        yTop = Y(b.value); yBot = Y(0); fill = (b.kind === 'total') ? pal.base : pal.positive;
      }
      svg.appendChild(el('rect', {
        x: cx, y: yTop, width: barW, height: Math.max(2, yBot - yTop),
        fill: fill, rx: 2, ry: 2,
        'data-point': '1', 'data-year': (b.year != null ? b.year : 'total'), 'data-value': b.value, 'data-kind': b.kind,
        tabindex: 0, role: 'button',
        'aria-label': b.label + ' ' + C.formatValue(b.value, 'number') + ' ' + yAxisLabel
      }));
      svg.appendChild(el('text', { x: cx + barW / 2, y: yTop - 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#F5F5F5' }, C.formatValue(b.value, 'number')));
      svg.appendChild(el('text', { x: cx + barW / 2, y: PT + iH + 16, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF' }, b.label));
    });

    svg.appendChild(el('text', { x: PL + iW / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF' }, t('ui.chart.revenue.axis.x', 'Year')));

    C.legend(wrap, [
      { color: pal.positive, label: t('ui.chart.revenue.legend.' + series.scenario, series.scenario) + ' (+ΔY)' },
      { color: pal.base, label: t('ui.chart.revenue.total', 'Total 3Y') }
    ]);
    return svg;
  }

  function attach(container, svg, state) {
    var C = window.TS.Charts;
    function over(e) {
      var pt = e.target.closest && e.target.closest('[data-point]');
      if (!pt) { C.tooltip(container, ''); return; }
      var year = pt.getAttribute('data-year'), value = +pt.getAttribute('data-value'), kind = pt.getAttribute('data-kind');
      var delta = '';
      if (kind !== 'total' && year) {
        var bear = getSeries('bear').points.filter(function(p){ return String(p.year) === year; })[0];
        if (bear && bear.value > 0) {
          var d = Math.round((value / bear.value - 1) * 100);
          if (d !== 0) delta = ' · Δ ' + (d > 0 ? '+' : '') + d + '% vs bear';
        }
      }
      var head = (kind === 'total') ? t('ui.chart.revenue.total', 'Total 3Y') : year;
      C.tooltip(pt, head + ': ' + C.formatValue(value, 'number') + ' ' + t('ui.chart.revenue.axis.y', 'M RUB') + delta + ' · ' + state.series.scenario);
    }
    function out() { C.tooltip(container, ''); }
    function click(e) {
      var pt = e.target.closest && e.target.closest('[data-point]');
      if (!pt) return;
      var year = pt.getAttribute('data-year');
      if (window.TS && window.TS.emit) window.TS.emit('drilldown:open', {
        chart: 'revenue',
        payload: {
          year: year === 'total' ? null : parseInt(year, 10),
          value: +pt.getAttribute('data-value'),
          scenario: state.series.scenario,
          kind: pt.getAttribute('data-kind')
        }
      });
    }
    function key(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(e); } }

    svg.addEventListener('mousemove', over);
    svg.addEventListener('mouseleave', out);
    svg.addEventListener('focusout', out);
    svg.addEventListener('click', click);
    svg.addEventListener('keydown', key);
    return function detach() {
      svg.removeEventListener('mousemove', over);
      svg.removeEventListener('mouseleave', out);
      svg.removeEventListener('focusout', out);
      svg.removeEventListener('click', click);
      svg.removeEventListener('keydown', key);
    };
  }

  if (!window.TS || !window.TS.Charts || typeof window.TS.Charts.register !== 'function') {
    if (typeof console !== 'undefined') console.warn('[charts/revenue] TS.Charts missing at load');
    return;
  }

  window.TS.Charts.register('revenue', function(container, payload) {
    if (!container) return null;
    var state = {
      scenario: (payload && payload.scenario) || (window.TS && window.TS.scenario) || 'base',
      stress: (payload && payload.stress) || 0,
      series: null
    };
    state.series = applyStress(getSeries(state.scenario), state.stress);
    var svg = build(container, state);
    var detach = attach(container, svg, state);

    function rerender(np) {
      if (np && np.scenario) state.scenario = np.scenario;
      if (np && np.stress != null) state.stress = +np.stress;
      state.series = applyStress(getSeries(state.scenario), state.stress);
      try { detach(); } catch(e) {}
      svg = build(container, state);
      detach = attach(container, svg, state);
    }
    function onSc(sc) { if (sc && sc !== state.scenario) rerender({ scenario: sc }); }
    function onPr(p) { if (p && p.stress != null && +p.stress !== state.stress) rerender({ stress: +p.stress }); }

    if (window.TS && window.TS.on) {
      window.TS.on('scenario:changed', onSc);
      window.TS.on('param:changed', onPr);
    }
    return {
      update: rerender,
      destroy: function() {
        try { detach(); } catch(e) {}
        if (window.TS && window.TS.off) {
          window.TS.off('scenario:changed', onSc);
          window.TS.off('param:changed', onPr);
        }
        container.innerHTML = '';
        container.classList.remove('ts-chart-revenue');
      }
    };
  });
})();
