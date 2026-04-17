/* S41: TS.Charts core — Phase 2B
   Owner: S41 | Provides: window.TS.Charts
   Low-level helpers (canvas/svg/axis/tooltip/legend/palette/formatValue)
   + chart registry (register/render/destroy).
   Dependencies: macros.js (TS.emit/on), i18n.js (I18N.formatCurrency/formatNumber).
   Consumers: S42-S48 (7 charts), S49 (controls), S50 (drilldown).
   Contract frozen in .claude/phase2b/40_CONTRACTS.md §1. */

(function() {
  'use strict';

  var registry = {};        // chartId -> renderFn
  var instances = {};       // containerKey -> Controller
  var ARIA_LIVE_ID = 'a11y-live';

  function containerKey(chartId, container) {
    if (!container) return chartId + '::default';
    if (!container.__tsChartKey) {
      container.__tsChartKey = chartId + '::' + (++TS.Charts._keyCounter);
    }
    return container.__tsChartKey;
  }

  // ============================================================
  // Palette — frozen, referenced by charts via TS.Charts.palette
  // ============================================================
  var palette = {
    base:     '#0070C0',
    bull:     '#2E7D32',
    bear:     '#C62828',
    positive: '#4CAF50',
    negative: '#F44336',
    neutral:  '#757575',
    gold:     '#C9A961',
    stage: {
      pre:     '#9E9E9E',
      prod:    '#1976D2',
      post:    '#7B1FA2',
      release: '#388E3C',
      script:  '#546E7A',
      dev:     '#FF9800'
    },
    scenario: {
      base: '#0070C0',
      bull: '#2E7D32',
      bear: '#C62828',
      opt:  '#2E7D32',
      pess: '#C62828'
    }
  };

  function freeze(obj) {
    if (Object.freeze) {
      Object.keys(obj).forEach(function(k) {
        if (obj[k] && typeof obj[k] === 'object') freeze(obj[k]);
      });
      return Object.freeze(obj);
    }
    return obj;
  }
  freeze(palette);

  // ============================================================
  // createCanvas — DPR-aware <canvas> factory
  // ============================================================
  function createCanvas(container, width, height) {
    if (!container) throw new Error('createCanvas: container required');
    width = width || container.clientWidth || 600;
    height = height || container.clientHeight || 300;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    var canvas = document.createElement('canvas');
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.__tsW = width;
    canvas.__tsH = height;
    canvas.__tsDpr = dpr;
    container.appendChild(canvas);

    var ctx = null;
    try { ctx = canvas.getContext ? canvas.getContext('2d') : null; }
    catch(e) { ctx = null; /* jsdom without canvas package */ }
    if (ctx && ctx.scale) ctx.scale(dpr, dpr);
    if (ctx) {
      ctx.__canvas = canvas;
      ctx.__tsW = width;
      ctx.__tsH = height;
    }
    // Return a reference that chart impls can always use (canvas even if 2d unavailable in test env)
    return ctx || { __canvas: canvas, __tsW: width, __tsH: height, __noContext: true };
  }

  // ============================================================
  // createSVG — sized <svg> with viewBox
  // ============================================================
  function createSVG(container, width, height) {
    if (!container) throw new Error('createSVG: container required');
    width = width || container.clientWidth || 600;
    height = height || container.clientHeight || 300;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    container.appendChild(svg);
    return svg;
  }

  // ============================================================
  // axisX / axisY — minimal domain+ticks painter
  // Works on CanvasRenderingContext2D OR SVGSVGElement.
  // ============================================================
  function axisX(target, domain, opts) {
    opts = opts || {};
    var ticks = opts.ticks || Math.min(domain.length || 6, 8);
    var type = opts.type || 'category';
    var fmt = opts.format || function(v) { return String(v); };
    var w = _surfaceWidth(target);
    var h = _surfaceHeight(target);
    var pad = opts.padding || { left: 40, right: 10, top: 10, bottom: 26 };

    var labels = _tickLabels(domain, ticks, type);
    var count = labels.length;
    var step = (w - pad.left - pad.right) / Math.max(count - 1, 1);

    if (_isCanvas(target)) {
      target.save();
      target.strokeStyle = opts.color || 'rgba(255,255,255,0.3)';
      target.fillStyle = opts.color || '#9CA3AF';
      target.font = (opts.fontSize || 11) + 'px Inter, sans-serif';
      target.beginPath();
      target.moveTo(pad.left, h - pad.bottom);
      target.lineTo(w - pad.right, h - pad.bottom);
      target.stroke();
      for (var i = 0; i < count; i++) {
        var x = pad.left + i * step;
        target.textAlign = 'center';
        target.textBaseline = 'top';
        target.fillText(fmt(labels[i]), x, h - pad.bottom + 4);
      }
      if (opts.label) {
        target.textAlign = 'center';
        target.fillText(opts.label, w / 2, h - 8);
      }
      target.restore();
    } else {
      // SVG fallback
      var NS = 'http://www.w3.org/2000/svg';
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'ts-axis-x');
      for (var j = 0; j < count; j++) {
        var tx = pad.left + j * step;
        var t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(tx));
        t.setAttribute('y', String(h - pad.bottom + 14));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('fill', opts.color || '#9CA3AF');
        t.setAttribute('font-size', String(opts.fontSize || 11));
        t.textContent = fmt(labels[j]);
        g.appendChild(t);
      }
      target.appendChild(g);
    }
    return labels;
  }

  function axisY(target, domain, opts) {
    opts = opts || {};
    var ticks = opts.ticks || 5;
    var fmt = opts.format || function(v) { return String(v); };
    var w = _surfaceWidth(target);
    var h = _surfaceHeight(target);
    var pad = opts.padding || { left: 40, right: 10, top: 10, bottom: 26 };
    var min = Math.min.apply(null, domain);
    var max = Math.max.apply(null, domain);
    if (min === max) { max = min + 1; }
    var values = [];
    for (var i = 0; i <= ticks; i++) {
      values.push(min + (max - min) * (i / ticks));
    }

    if (_isCanvas(target)) {
      target.save();
      target.strokeStyle = opts.color || 'rgba(255,255,255,0.08)';
      target.fillStyle = opts.color || '#9CA3AF';
      target.font = (opts.fontSize || 11) + 'px Inter, sans-serif';
      for (var k = 0; k < values.length; k++) {
        var ry = h - pad.bottom - (k / ticks) * (h - pad.top - pad.bottom);
        target.beginPath();
        target.moveTo(pad.left, ry);
        target.lineTo(w - pad.right, ry);
        target.stroke();
        target.textAlign = 'right';
        target.textBaseline = 'middle';
        target.fillText(fmt(values[k]), pad.left - 4, ry);
      }
      target.restore();
    } else {
      var NS = 'http://www.w3.org/2000/svg';
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'ts-axis-y');
      for (var m = 0; m < values.length; m++) {
        var sy = h - pad.bottom - (m / ticks) * (h - pad.top - pad.bottom);
        var t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(pad.left - 4));
        t.setAttribute('y', String(sy + 4));
        t.setAttribute('text-anchor', 'end');
        t.setAttribute('fill', opts.color || '#9CA3AF');
        t.setAttribute('font-size', String(opts.fontSize || 11));
        t.textContent = fmt(values[m]);
        g.appendChild(t);
      }
      target.appendChild(g);
    }
    return { min: min, max: max, values: values };
  }

  // ============================================================
  // tooltip — DOM-anchored popup
  // ============================================================
  var _tooltipEl = null;
  function tooltip(anchor, contentHTML, opts) {
    opts = opts || {};
    if (!_tooltipEl) {
      _tooltipEl = document.createElement('div');
      _tooltipEl.className = 'ts-chart-tooltip';
      _tooltipEl.setAttribute('role', 'tooltip');
      _tooltipEl.style.cssText = 'position:fixed;pointer-events:none;background:rgba(20,26,42,0.96);border:1px solid rgba(201,169,97,0.35);border-radius:6px;padding:8px 10px;color:#F5F5F5;font:12px Inter,sans-serif;z-index:9990;max-width:240px;line-height:1.4;box-shadow:0 4px 12px rgba(0,0,0,0.4);';
      document.body.appendChild(_tooltipEl);
    }
    if (contentHTML == null || contentHTML === '') {
      _tooltipEl.style.display = 'none';
      return _tooltipEl;
    }
    // Guard against HTML injection by default — contentHTML is used as text
    if (opts.html === true) {
      _tooltipEl.innerHTML = String(contentHTML);
    } else {
      _tooltipEl.textContent = String(contentHTML);
    }
    var rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    var x = (opts.x != null) ? opts.x : (rect.left + rect.width / 2);
    var y = (opts.y != null) ? opts.y : (rect.top - 8);
    _tooltipEl.style.display = 'block';
    _tooltipEl.style.left = Math.round(x) + 'px';
    _tooltipEl.style.top = Math.round(y) + 'px';
    _tooltipEl.style.transform = 'translate(-50%, -100%)';
    return _tooltipEl;
  }

  // ============================================================
  // legend — palette → label list
  // ============================================================
  function legend(container, items) {
    if (!container) return null;
    var ul = document.createElement('ul');
    ul.className = 'ts-chart-legend';
    ul.setAttribute('role', 'list');
    ul.style.cssText = 'list-style:none;padding:0;margin:6px 0 0 0;display:flex;flex-wrap:wrap;gap:10px 16px;font:12px Inter,sans-serif;color:#9CA3AF;';
    (items || []).forEach(function(it) {
      var li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.style.cssText = 'display:inline-flex;align-items:center;gap:6px;';
      var sw = document.createElement('span');
      sw.style.cssText = 'display:inline-block;width:10px;height:10px;border-radius:2px;background:' + (it.color || palette.neutral) + ';';
      sw.setAttribute('aria-hidden', 'true');
      var lbl = document.createElement('span');
      lbl.textContent = it.label || '';
      li.appendChild(sw);
      li.appendChild(lbl);
      ul.appendChild(li);
    });
    container.appendChild(ul);
    return ul;
  }

  // ============================================================
  // formatValue — delegates to I18N when available
  // ============================================================
  function formatValue(v, type) {
    if (v == null || (typeof v === 'number' && !isFinite(v))) return '\u2014';
    var I = (typeof window !== 'undefined') ? window.I18N : null;
    var t = type || 'number';
    if (t === 'currency') {
      if (I && I.formatCurrency) {
        try { return I.formatCurrency(v); } catch(e) {}
      }
      return _fmtNumber(v) + ' \u043C\u043B\u043D \u20BD';
    }
    if (t === 'percent') {
      var num = (typeof v === 'number') ? v : parseFloat(v);
      if (I && I.formatNumber) {
        try { return I.formatNumber(num, 1) + '%'; } catch(e) {}
      }
      return _fmtNumber(num, 1) + '%';
    }
    if (t === 'year') return String(parseInt(v, 10));
    if (t === 'moic') return _fmtNumber(v, 1) + '\u00D7';
    if (I && I.formatNumber) {
      try { return I.formatNumber(v); } catch(e) {}
    }
    return _fmtNumber(v);
  }

  function _fmtNumber(v, decimals) {
    if (typeof v !== 'number') return String(v);
    var d = (decimals == null) ? 0 : decimals;
    var opts = { minimumFractionDigits: d, maximumFractionDigits: d };
    try {
      return new Intl.NumberFormat('ru-RU', opts).format(v);
    } catch(e) {
      return v.toFixed(d);
    }
  }

  // ============================================================
  // Registry: register / render / destroy
  // ============================================================
  function register(chartId, renderFn) {
    if (!chartId) throw new Error('register: chartId required');
    if (typeof renderFn !== 'function') throw new Error('register: renderFn must be function');
    registry[chartId] = renderFn;
    return true;
  }

  function render(chartId, container, payload) {
    var fn = registry[chartId];
    if (!fn) {
      console.warn('[TS.Charts] no renderer for "' + chartId + '"');
      return null;
    }
    if (!container) {
      console.warn('[TS.Charts.render] container is falsy for "' + chartId + '"');
      return null;
    }
    var key = containerKey(chartId, container);
    if (instances[key]) {
      try { if (instances[key].destroy) instances[key].destroy(); } catch(e) {}
      delete instances[key];
    }
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var controller = null;
    try {
      controller = fn(container, payload || {});
    } catch (e) {
      console.error('[TS.Charts] render error for ' + chartId, e);
      return null;
    }
    if (!controller || typeof controller !== 'object') {
      controller = { update: function(){}, destroy: function(){ container.innerHTML = ''; } };
    }
    if (typeof controller.update !== 'function') controller.update = function(){};
    if (typeof controller.destroy !== 'function') controller.destroy = function(){ container.innerHTML = ''; };
    instances[key] = controller;

    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (TS && TS.emit) {
      TS.emit('chart:rendered', {
        chartId: chartId,
        durationMs: Math.round((t1 - t0) * 100) / 100
      });
    }
    return controller;
  }

  function destroy(chartId, container) {
    if (!chartId) return;
    if (container) {
      var key = containerKey(chartId, container);
      var c = instances[key];
      if (c && c.destroy) { try { c.destroy(); } catch(e) {} }
      delete instances[key];
      return;
    }
    // destroy all instances of chartId
    Object.keys(instances).forEach(function(k) {
      if (k.indexOf(chartId + '::') === 0) {
        try { if (instances[k].destroy) instances[k].destroy(); } catch(e) {}
        delete instances[k];
      }
    });
  }

  // ============================================================
  // internals
  // ============================================================
  function _isCanvas(target) {
    return target && typeof target.fillText === 'function' && typeof target.beginPath === 'function';
  }
  function _surfaceWidth(target) {
    if (_isCanvas(target)) return target.__tsW || (target.canvas && target.canvas.width) || 600;
    if (target && target.getAttribute) return parseFloat(target.getAttribute('width')) || 600;
    return 600;
  }
  function _surfaceHeight(target) {
    if (_isCanvas(target)) return target.__tsH || (target.canvas && target.canvas.height) || 300;
    if (target && target.getAttribute) return parseFloat(target.getAttribute('height')) || 300;
    return 300;
  }
  function _tickLabels(domain, maxTicks, type) {
    if (!domain || !domain.length) return [];
    if (type === 'category' || typeof domain[0] === 'string') {
      if (domain.length <= maxTicks) return domain.slice();
      var step = Math.ceil(domain.length / maxTicks);
      var out = [];
      for (var i = 0; i < domain.length; i += step) out.push(domain[i]);
      return out;
    }
    // linear: use domain endpoints + equally spaced
    var min = domain[0], max = domain[domain.length - 1];
    if (typeof min !== 'number') { min = Math.min.apply(null, domain); max = Math.max.apply(null, domain); }
    var labels = [];
    for (var k = 0; k <= maxTicks; k++) {
      labels.push(min + (max - min) * (k / maxTicks));
    }
    return labels;
  }

  // ============================================================
  // Public
  // ============================================================
  var TS = (typeof window !== 'undefined') ? (window.TS = window.TS || {}) : (globalThis.TS = globalThis.TS || {});
  TS.Charts = {
    createCanvas: createCanvas,
    createSVG: createSVG,
    axisX: axisX,
    axisY: axisY,
    tooltip: tooltip,
    legend: legend,
    formatValue: formatValue,
    palette: palette,
    register: register,
    render: render,
    destroy: destroy,
    // introspection helpers (used by tests and S51 QA)
    _registry: registry,
    _instances: instances,
    _keyCounter: 0,
    hasChart: function(id) { return !!registry[id]; },
    chartIds: function() { return Object.keys(registry); }
  };
})();
