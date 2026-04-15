/* S29: Components — reusable UI components
   Owner: S29 | Phase 1
   Provides: window.TS.Components */

(function() {
  'use strict';
  var Components = {};

  Components.MetricCard = function(container, opts) {
    var el = document.createElement('div');
    el.className = 'metric-card';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', opts.label || '');

    var val = document.createElement('div');
    val.className = 'metric-card__value';
    val.textContent = opts.value || '';
    if (opts.color === 'gold') val.style.color = 'var(--gold)';

    var lbl = document.createElement('div');
    lbl.className = 'metric-card__label';
    lbl.textContent = opts.label || '';

    el.appendChild(val);
    el.appendChild(lbl);

    if (container) container.appendChild(el);
    return el;
  };

  Components.ChartWrapper = function(container, opts) {
    var figure = document.createElement('figure');
    figure.setAttribute('role', 'img');
    figure.setAttribute('aria-labelledby', opts.id + '-title');
    figure.setAttribute('aria-describedby', opts.id + '-desc');
    figure.style.cssText = 'width:100%;height:100%;margin:0;position:relative;';

    var caption = document.createElement('figcaption');
    caption.id = opts.id + '-title';
    caption.className = 'sr-only';
    caption.textContent = opts.title || '';

    var canvas = document.createElement('canvas');
    canvas.id = opts.id;
    canvas.style.cssText = 'width:100%!important;height:100%!important;';

    var desc = document.createElement('div');
    desc.id = opts.id + '-desc';
    desc.className = 'sr-only';
    desc.textContent = opts.description || '';

    figure.appendChild(caption);
    figure.appendChild(canvas);
    figure.appendChild(desc);

    if (container) container.appendChild(figure);
    return { figure: figure, canvas: canvas, id: opts.id };
  };

  Components.D3ChartWrapper = function(container, opts) {
    var figure = document.createElement('figure');
    figure.setAttribute('role', 'img');
    figure.setAttribute('aria-labelledby', opts.id + '-title');
    figure.setAttribute('aria-describedby', opts.id + '-desc');
    figure.style.cssText = 'width:100%;height:100%;margin:0;position:relative;';

    var caption = document.createElement('figcaption');
    caption.id = opts.id + '-title';
    caption.className = 'sr-only';
    caption.textContent = opts.title || '';

    var chartDiv = document.createElement('div');
    chartDiv.id = opts.id;
    chartDiv.style.cssText = 'width:100%;height:100%;';

    var desc = document.createElement('div');
    desc.id = opts.id + '-desc';
    desc.className = 'sr-only';
    desc.textContent = opts.description || '';

    figure.appendChild(caption);
    figure.appendChild(chartDiv);
    figure.appendChild(desc);

    if (container) container.appendChild(figure);
    return { figure: figure, container: chartDiv, id: opts.id };
  };

  Components.TooltipPortal = (function() {
    var portal = null;
    function getPortal() {
      if (!portal) {
        portal = document.createElement('div');
        portal.className = 'tooltip-portal';
        portal.setAttribute('role', 'tooltip');
        document.body.appendChild(portal);
      }
      return portal;
    }
    return {
      show: function(html, x, y) {
        var p = getPortal();
        p.textContent = html;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.classList.add('visible');
      },
      hide: function() {
        if (portal) portal.classList.remove('visible');
      }
    };
  })();

  Components.AppendixBadge = function(container, opts) {
    var el = document.createElement('span');
    el.className = 'badge badge--gold';
    el.textContent = 'App. ' + (opts.id || '');
    el.title = opts.desc || '';
    if (container) container.appendChild(el);
    return el;
  };

  Components.DataTable = function(container, opts) {
    var table = document.createElement('table');
    table.className = 'data-table';
    table.setAttribute('role', 'table');

    if (opts.caption) {
      var cap = document.createElement('caption');
      cap.className = 'sr-only';
      cap.textContent = opts.caption;
      table.appendChild(cap);
    }

    if (opts.headers) {
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      opts.headers.forEach(function(h) {
        var th = document.createElement('th');
        th.textContent = h;
        th.setAttribute('scope', 'col');
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    if (opts.rows) {
      var tbody = document.createElement('tbody');
      opts.rows.forEach(function(row) {
        var tr = document.createElement('tr');
        row.forEach(function(cell, i) {
          var td = document.createElement('td');
          td.textContent = cell;
          if (i > 0 && typeof cell === 'number') td.className = 'num';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
    }

    if (container) container.appendChild(table);
    return table;
  };

  Components.PointsList = function(container, points) {
    var ul = document.createElement('ul');
    ul.style.cssText = 'list-style:none;padding:0;';
    points.forEach(function(p) {
      var li = document.createElement('li');
      li.style.cssText = 'padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);color:var(--text-secondary);font-size:15px;display:flex;align-items:baseline;gap:12px;';
      li.innerHTML = '<span style="color:var(--gold);font-size:10px;">&#9679;</span> ' + '<span>' + Components._escHtml(p) + '</span>';
      ul.appendChild(li);
    });
    if (container) container.appendChild(ul);
    return ul;
  };

  Components.Badge = function(text, level) {
    var el = document.createElement('span');
    var cls = 'badge';
    if (level === 'CRITICAL') cls += ' badge--critical';
    else if (level === 'HIGH') cls += ' badge--high';
    else if (level === 'MEDIUM') cls += ' badge--medium';
    else if (level === 'LOW') cls += ' badge--low';
    else cls += ' badge--gold';
    el.className = cls;
    el.textContent = text;
    return el;
  };

  Components.ScenarioToggle = function() { return null; };
  Components.LangToggle = function() { return null; };
  Components.Slider = function() { return null; };
  Components.Modal = function() { return null; };
  Components.DrilldownCard = function() { return null; };

  Components._escHtml = function(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  window.TS = window.TS || {};
  window.TS.Components = Components;
})();
