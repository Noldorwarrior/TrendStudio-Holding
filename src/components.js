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

  /**
   * Slider — debounced 16ms (requestAnimationFrame), a11y-ready.
   * @param {HTMLElement} container - Parent element to render into
   * @param {object} opts - { min, max, step, value, format(v)->string, onChange(v), a11y: { label, valuetext(v) } }
   * @returns {{ setValue, getValue, destroy }}
   */
  Components.Slider = function(container, opts) {
    opts = opts || {};
    var min = opts.min != null ? opts.min : 0;
    var max = opts.max != null ? opts.max : 100;
    var step = opts.step != null ? opts.step : 1;
    var currentValue = opts.value != null ? opts.value : min;

    var wrapper = document.createElement('div');
    wrapper.className = 'ts-slider';
    wrapper.style.cssText = 'display:flex;align-items:center;gap:12px;';

    // Label
    var label = document.createElement('label');
    label.className = 'ts-slider__label';
    label.style.cssText = 'color:var(--text-secondary,#9CA3AF);font-size:13px;white-space:nowrap;';
    var labelId = 'slider-' + (++Components._sliderId);
    label.id = labelId;
    label.textContent = (opts.a11y && opts.a11y.label) || '';

    // Range input
    var input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = currentValue;
    input.className = 'ts-slider__input';
    input.style.cssText = 'flex:1;cursor:pointer;accent-color:var(--gold,#C9A961);';
    input.setAttribute('aria-labelledby', labelId);

    // Value display
    var valueDisplay = document.createElement('span');
    valueDisplay.className = 'ts-slider__value';
    valueDisplay.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--gold,#C9A961);min-width:50px;text-align:right;";

    function formatValue(v) {
      if (opts.format) return opts.format(v);
      return String(v);
    }

    function updateDisplay(v) {
      valueDisplay.textContent = formatValue(v);
      if (opts.a11y && opts.a11y.valuetext) {
        input.setAttribute('aria-valuetext', opts.a11y.valuetext(v));
      }
    }

    updateDisplay(currentValue);

    // Debounce via requestAnimationFrame (16ms)
    var rafId = null;
    var pendingValue = null;

    function onInput() {
      var v = parseFloat(input.value);
      pendingValue = v;
      currentValue = v;
      updateDisplay(v);

      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = null;
        if (opts.onChange && pendingValue !== null) {
          opts.onChange(pendingValue);
        }
        pendingValue = null;
      });
    }

    input.addEventListener('input', onInput);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(valueDisplay);

    if (container) container.appendChild(wrapper);

    return {
      setValue: function(v) {
        v = Math.max(min, Math.min(max, v));
        currentValue = v;
        input.value = v;
        updateDisplay(v);
      },
      getValue: function() {
        return currentValue;
      },
      destroy: function() {
        input.removeEventListener('input', onInput);
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      }
    };
  };
  Components._sliderId = 0;

  /**
   * Modal — focus-trap, Esc close, overlay click close.
   * @param {object} opts - { title, body (HTMLElement|string), footer, onOpen, onClose, closeOnOverlay }
   * @returns {{ open, close, setBody, destroy }}
   */
  Components.Modal = function(opts) {
    opts = opts || {};
    var isOpen = false;
    var trapHandle = null;
    var modalId = 'modal-' + (++Components._modalId);

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'ts-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9998;display:none;';
    overlay.setAttribute('data-modal-id', modalId);

    // Modal container
    var modal = document.createElement('div');
    modal.className = 'ts-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', modalId + '-title');
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-card,#141A2A);border:1px solid rgba(201,169,97,0.25);border-radius:12px;padding:24px;z-index:9999;max-width:640px;width:90%;max-height:80vh;overflow-y:auto;display:none;';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';

    var titleEl = document.createElement('h2');
    titleEl.id = modalId + '-title';
    titleEl.style.cssText = 'margin:0;font-size:18px;color:var(--text-primary,#F5F5F5);';
    titleEl.textContent = opts.title || '';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'ts-modal__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary,#9CA3AF);font-size:20px;cursor:pointer;padding:4px 8px;';
    closeBtn.innerHTML = '&#x2715;';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body
    var bodyContainer = document.createElement('div');
    bodyContainer.className = 'ts-modal__body';

    function setBodyContent(content) {
      bodyContainer.innerHTML = '';
      if (typeof content === 'string') {
        bodyContainer.textContent = content;
      } else if (content && content.nodeType) {
        bodyContainer.appendChild(content);
      }
    }

    if (opts.body) setBodyContent(opts.body);

    // Footer
    var footerContainer = document.createElement('div');
    footerContainer.className = 'ts-modal__footer';
    footerContainer.style.cssText = 'margin-top:16px;';
    if (opts.footer) {
      if (typeof opts.footer === 'string') {
        footerContainer.textContent = opts.footer;
      } else if (opts.footer.nodeType) {
        footerContainer.appendChild(opts.footer);
      }
    }

    modal.appendChild(header);
    modal.appendChild(bodyContainer);
    modal.appendChild(footerContainer);

    var api = {
      open: function() {
        if (isOpen) return;
        isOpen = true;
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        overlay.style.display = 'block';
        modal.style.display = 'block';

        // Focus trap
        if (window.TS && window.TS.A11y && window.TS.A11y.trapFocus) {
          trapHandle = window.TS.A11y.trapFocus(modal);
        }

        // Announce
        if (window.TS && window.TS.A11y && window.TS.A11y.announce) {
          window.TS.A11y.announce(opts.title || 'Dialog opened', 'assertive');
        }

        // Emit event
        if (window.TS && window.TS.emit) {
          window.TS.emit('modal-open', { id: modalId });
        }

        if (opts.onOpen) opts.onOpen();
      },
      close: function() {
        if (!isOpen) return;
        isOpen = false;

        // Release focus trap
        if (trapHandle && window.TS && window.TS.A11y && window.TS.A11y.releaseFocus) {
          window.TS.A11y.releaseFocus(trapHandle);
          trapHandle = null;
        }

        overlay.style.display = 'none';
        modal.style.display = 'none';

        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (modal.parentNode) modal.parentNode.removeChild(modal);

        // Emit event
        if (window.TS && window.TS.emit) {
          window.TS.emit('modal-close', { id: modalId });
        }

        if (opts.onClose) opts.onClose();
      },
      setBody: function(content) {
        setBodyContent(content);
      },
      destroy: function() {
        if (isOpen) api.close();
        overlay = null;
        modal = null;
      }
    };

    // Close on button click
    closeBtn.addEventListener('click', function() { api.close(); });

    // Close on overlay click (if enabled, default true)
    if (opts.closeOnOverlay !== false) {
      overlay.addEventListener('click', function() { api.close(); });
    }

    return api;
  };
  Components._modalId = 0;

  /**
   * DrilldownCard — project/investor detail card for modals.
   * @param {object} data - { title, subtitle, metrics: [{label, value}], description, links }
   * @returns {HTMLElement}
   */
  Components.DrilldownCard = function(data) {
    data = data || {};

    var card = document.createElement('div');
    card.className = 'ts-drilldown-card';
    card.style.cssText = 'color:var(--text-primary,#F5F5F5);';

    // Title
    if (data.title) {
      var title = document.createElement('h3');
      title.style.cssText = 'margin:0 0 4px 0;font-size:16px;color:var(--gold,#C9A961);';
      title.textContent = data.title;
      card.appendChild(title);
    }

    // Subtitle
    if (data.subtitle) {
      var subtitle = document.createElement('p');
      subtitle.style.cssText = 'margin:0 0 16px 0;font-size:13px;color:var(--text-secondary,#9CA3AF);';
      subtitle.textContent = data.subtitle;
      card.appendChild(subtitle);
    }

    // Metrics grid
    if (data.metrics && data.metrics.length > 0) {
      var grid = document.createElement('div');
      grid.className = 'ts-drilldown-card__metrics';
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;';

      data.metrics.forEach(function(m) {
        var item = document.createElement('div');
        item.style.cssText = 'background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;';

        var val = document.createElement('div');
        val.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--gold,#C9A961);margin-bottom:4px;";
        val.textContent = m.value != null ? String(m.value) : '\u2014';

        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:12px;color:var(--text-secondary,#9CA3AF);';
        lbl.textContent = m.label || '';

        item.appendChild(val);
        item.appendChild(lbl);
        grid.appendChild(item);
      });

      card.appendChild(grid);
    }

    // Description
    if (data.description) {
      var desc = document.createElement('p');
      desc.style.cssText = 'font-size:14px;line-height:1.6;color:var(--text-secondary,#9CA3AF);margin:0;';
      desc.textContent = data.description;
      card.appendChild(desc);
    }

    // Links
    if (data.links && data.links.length > 0) {
      var linksContainer = document.createElement('div');
      linksContainer.style.cssText = 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;';

      data.links.forEach(function(link) {
        var a = document.createElement('a');
        a.href = link.href || '#';
        a.textContent = link.text || link.href;
        a.style.cssText = 'color:var(--gold,#C9A961);font-size:13px;text-decoration:none;';
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        linksContainer.appendChild(a);
      });

      card.appendChild(linksContainer);
    }

    return card;
  };

  Components._escHtml = function(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  window.TS = window.TS || {};
  window.TS.Components = Components;
})();
