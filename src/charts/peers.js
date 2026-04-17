/* S48: Chart-7 Peers Scatter — synthetic fallback (Phase 2B)
   TS.Charts.register('peers'). Data: TS.data().peers. X=EV/EBITDA, Y=IRR-historic,
   size~EV/Revenue; country: RU=base,US=bull,FR=neutral; our_marker=gold star.
   drilldown:open on click. Contract: 40_CONTRACTS.md §1,§2,§4,§5.1,§7 */
(function() {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var W = 640, H = 340, P = { l: 60, r: 18, t: 56, b: 56 };
  var BADGE_CSS = 'display:inline-block;padding:3px 8px;margin:0 0 6px 0;border-radius:4px;background:rgba(201,169,97,0.15);border:1px solid rgba(201,169,97,0.45);color:#C9A961;font:11px Inter,sans-serif;';
  var DISC_CSS = 'margin:6px 0 0 0;color:#9CA3AF;font:11px Inter,sans-serif;';
  function el(n, a) {
    var e = document.createElementNS(NS, n);
    if (a) for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) e.setAttribute(k, String(a[k]));
    return e;
  }
  function t(k, f) {
    var I = window.I18N;
    if (I && I.t) { var v = I.t(k); if (v && v !== k) return v; }
    return f == null ? k : f;
  }
  function getData() {
    var d = (window.TS && window.TS.data) ? window.TS.data() : {};
    var p = (d && d.peers) || {};
    return {
      comparables: Array.isArray(p.comparables) ? p.comparables.slice() : [],
      our_marker: p.our_marker || null,
      note: p.note || ''
    };
  }
  function colorOf(cc, pal) {
    return cc === 'RU' ? pal.base : cc === 'US' ? pal.bull : pal.neutral;
  }
  function sc(v, a, b, c, d) { return a === b ? (c + d) / 2 : c + (v - a) / (b - a) * (d - c); }
  function star(cx, cy, n, ro, ri) {
    var o = [];
    for (var i = 0; i < n * 2; i++) {
      var g = Math.PI / n * i - Math.PI / 2, r = (i % 2) ? ri : ro;
      o.push((i ? 'L' : 'M') + (cx + Math.cos(g) * r).toFixed(2) + ',' + (cy + Math.sin(g) * r).toFixed(2));
    }
    return o.join(' ') + ' Z';
  }
  function tip(name, cc, eE, eR, ir, mark) {
    return name + ', ' + cc + '. EV/EBITDA ' + eE.toFixed(1) + '\u00D7, EV/Revenue ' + eR.toFixed(1) + '\u00D7, IRR ' + ir.toFixed(1) + '% ' + mark;
  }
  function build(container, state) {
    var C = window.TS.Charts;
    container.innerHTML = '';
    container.classList.add('ts-chart-peers');
    var wrap = document.createElement('div');
    wrap.className = 'ts-chart-wrap';
    wrap.style.cssText = 'position:relative;';
    container.appendChild(wrap);
    var badge = document.createElement('div');
    badge.className = 'ts-peers-badge';
    badge.setAttribute('role', 'note');
    badge.setAttribute('data-synthetic', '1');
    badge.style.cssText = BADGE_CSS;
    badge.textContent = t('ui.chart.peers.synthetic_badge', '\u26A0 Synthetic: illustrative data');
    wrap.appendChild(badge);
    var svg = C.createSVG(wrap, W, H);
    svg.setAttribute('aria-label', t('a11y.chart.peers.label', 'Peers scatter (synthetic)'));
    svg.setAttribute('tabindex', '0');
    var ti = el('text', { x: P.l, y: 20, 'font-size': 14, 'font-weight': 600, fill: '#F5F5F5' });
    ti.textContent = t('ui.chart.peers.title', 'Peers: EV/EBITDA vs IRR');
    svg.appendChild(ti);
    var comps = state.data.comparables, our = state.data.our_marker;
    var xV = comps.map(function(p) { return +p.ev_ebitda; });
    var yV = comps.map(function(p) { return +p.irr_historic; });
    var rV = comps.map(function(p) { return +p.ev_revenue; });
    if (our) {
      if (our.ev_ebitda != null) xV.push(+our.ev_ebitda);
      yV.push(+((our.irr_projected != null) ? our.irr_projected : (our.irr_historic || 0)));
      if (our.ev_revenue != null) rV.push(+our.ev_revenue);
    }
    var xMin = Math.min.apply(null, xV), xMax = Math.max.apply(null, xV);
    var yMin = Math.min.apply(null, yV), yMax = Math.max.apply(null, yV);
    var xp = (xMax - xMin) * 0.08 || 0.5, yp = (yMax - yMin) * 0.08 || 0.5;
    xMin -= xp; xMax += xp; yMin -= yp; yMax += yp;
    var rMin = Math.min.apply(null, rV), rMax = Math.max.apply(null, rV);
    var iW = W - P.l - P.r, iH = H - P.t - P.b;
    function xs(v) { return P.l + sc(v, xMin, xMax, 0, iW); }
    function ys(v) { return P.t + iH - sc(v, yMin, yMax, 0, iH); }
    function rs(v) { return sc(v, rMin, rMax, 6, 14); }
    // grid + axis ticks
    for (var i = 0; i <= 4; i++) {
      var yv = yMin + (yMax - yMin) * (i / 4), yy = ys(yv);
      svg.appendChild(el('line', { x1: P.l, x2: W - P.r, y1: yy, y2: yy, stroke: 'rgba(255,255,255,0.06)' }));
      var yl = el('text', { x: P.l - 6, y: yy + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#9CA3AF' });
      yl.textContent = yv.toFixed(1); svg.appendChild(yl);
      var xv = xMin + (xMax - xMin) * (i / 4), xx = xs(xv);
      svg.appendChild(el('line', { x1: xx, x2: xx, y1: P.t, y2: P.t + iH, stroke: 'rgba(255,255,255,0.04)' }));
      var xl = el('text', { x: xx, y: P.t + iH + 16, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF' });
      xl.textContent = xv.toFixed(1); svg.appendChild(xl);
    }
    var xt = el('text', { x: P.l + iW / 2, y: H - 10, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF' });
    xt.textContent = t('ui.chart.peers.axis.x', 'EV / EBITDA, \u00D7');
    svg.appendChild(xt);
    var yt = el('text', { x: 14, y: P.t + iH / 2, 'text-anchor': 'middle', 'font-size': 11, fill: '#9CA3AF', transform: 'rotate(-90 14,' + (P.t + iH / 2) + ')' });
    yt.textContent = t('ui.chart.peers.axis.y', 'IRR historic, %');
    svg.appendChild(yt);
    var pal = C.palette;
    comps.forEach(function(p) {
      var nm = t('ui.peers.' + p.code + '.name', p.name || p.code);
      var cc = t('ui.peers.' + p.code + '.country', p.country || '');
      var tp = tip(nm, cc, +p.ev_ebitda, +p.ev_revenue, +p.irr_historic, '\u26A0 synthetic');
      svg.appendChild(el('circle', {
        cx: xs(+p.ev_ebitda), cy: ys(+p.irr_historic), r: rs(+p.ev_revenue),
        fill: colorOf(p.country, pal), 'fill-opacity': 0.75, stroke: '#F5F5F5', 'stroke-width': 1,
        class: 'ts-peer-point',
        'data-point': '1', 'data-code': p.code, 'data-country': p.country || '',
        'data-synthetic': '1', 'data-tooltip': tp,
        tabindex: 0, role: 'button', 'aria-label': tp
      }));
    });
    if (our) {
      var oX = xs(+our.ev_ebitda);
      var oIR = +((our.irr_projected != null) ? our.irr_projected : (our.irr_historic || 0));
      var oY = ys(oIR), sz = 14;
      var lbl = t('ui.peers.ours.label', our.label || 'TrendStudio (project)');
      var tpO = lbl + '. EV/EBITDA ' + (+our.ev_ebitda).toFixed(1) + '\u00D7, EV/Revenue ' + (+our.ev_revenue).toFixed(1) + '\u00D7, IRR proj. ' + oIR.toFixed(1) + '%';
      svg.appendChild(el('path', {
        d: star(oX, oY, 5, sz, sz / 2),
        fill: pal.gold || '#C9A961', stroke: '#F5F5F5', 'stroke-width': 1.2,
        class: 'ts-peer-ours',
        'data-point': '1', 'data-code': 'ours', 'data-ours': '1', 'data-tooltip': tpO,
        tabindex: 0, role: 'button', 'aria-label': tpO
      }));
      var tx = el('text', { x: oX + sz + 4, y: oY + 4, 'font-size': 11, 'font-weight': 600, fill: pal.gold || '#C9A961' });
      tx.textContent = lbl; svg.appendChild(tx);
    }
    C.legend(wrap, [
      { color: pal.base,    label: t('ui.chart.peers.legend.ru',   'RU peers') },
      { color: pal.bull,    label: t('ui.chart.peers.legend.us',   'US peers') },
      { color: pal.neutral, label: t('ui.chart.peers.legend.fr',   'FR peers') },
      { color: pal.gold || '#C9A961', label: t('ui.chart.peers.legend.ours', 'TrendStudio (project)') }
    ]);
    var disc = document.createElement('p');
    disc.className = 'ts-peers-disclaimer';
    disc.setAttribute('data-synthetic', '1');
    disc.style.cssText = DISC_CSS;
    disc.textContent = state.data.note || t('ui.chart.peers.synthetic_badge', '');
    wrap.appendChild(disc);
    return svg;
  }
  function attach(container, svg, state) {
    var C = window.TS.Charts;
    function hov(e) {
      var p = e.target.closest('[data-point]');
      if (!p) { C.tooltip(container, ''); return; }
      C.tooltip(p, p.getAttribute('data-tooltip') || '');
    }
    function out() { C.tooltip(container, ''); }
    function click(e) {
      var p = e.target.closest('[data-point]');
      if (!p) return;
      var TS = window.TS;
      if (!(TS && TS.emit)) return;
      if (p.getAttribute('data-ours') === '1') {
        var our = state.data.our_marker || {};
        TS.emit('drilldown:open', { chart: 'peers', payload: {
          code: 'ours', name: our.label || 'TrendStudio', country: 'RU',
          ev_revenue: +our.ev_revenue || 0, ev_ebitda: +our.ev_ebitda || 0,
          irr_historic: +(our.irr_projected != null ? our.irr_projected : our.irr_historic) || 0,
          synthetic: false, ours: true
        }});
        return;
      }
      var code = p.getAttribute('data-code');
      var peer = state.data.comparables.filter(function(q) { return q.code === code; })[0];
      if (!peer) return;
      TS.emit('drilldown:open', { chart: 'peers', payload: {
        code: peer.code, name: peer.name, country: peer.country,
        ev_revenue: +peer.ev_revenue, ev_ebitda: +peer.ev_ebitda,
        irr_historic: +peer.irr_historic, synthetic: true
      }});
    }
    function key(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(e); } }
    svg.addEventListener('mousemove', hov);
    svg.addEventListener('mouseleave', out);
    svg.addEventListener('focusout', out);
    svg.addEventListener('click', click);
    svg.addEventListener('keydown', key);
    return function() {
      svg.removeEventListener('mousemove', hov);
      svg.removeEventListener('mouseleave', out);
      svg.removeEventListener('focusout', out);
      svg.removeEventListener('click', click);
      svg.removeEventListener('keydown', key);
    };
  }
  if (!window.TS || !window.TS.Charts || typeof window.TS.Charts.register !== 'function') {
    if (typeof console !== 'undefined') console.warn('[charts/peers] TS.Charts missing');
    return;
  }
  window.TS.Charts.register('peers', function(container, payload) {
    if (!container) return null;
    var state = { data: getData() };
    var svg = build(container, state);
    var detach = attach(container, svg, state);
    function rerender() {
      state.data = getData();
      try { detach(); } catch(e) {}
      svg = build(container, state);
      detach = attach(container, svg, state);
    }
    return {
      update: function() { rerender(); },
      destroy: function() {
        try { detach(); } catch(e) {}
        container.innerHTML = '';
        container.classList.remove('ts-chart-peers');
      }
    };
  });
})();
