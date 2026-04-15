/* S34: Accessibility module — Phase 1
   Owner: S34 | Provides: window.TS.A11y */

(function() {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var liveRegion = null;
  var focusTrapStack = [];

  var A11y = {
    prefersReducedMotion: function() {
      return reducedMotion;
    },

    announce: function(message, priority) {
      if (!liveRegion) {
        liveRegion = document.getElementById('a11y-live');
      }
      if (liveRegion) {
        liveRegion.setAttribute('aria-live', priority === 'assertive' ? 'assertive' : 'polite');
        liveRegion.textContent = '';
        requestAnimationFrame(function() {
          liveRegion.textContent = message;
        });
      }
    },

    trapFocus: function(container) {
      if (!container) return;
      var focusable = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      var handler = function(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      container.addEventListener('keydown', handler);
      focusTrapStack.push({ container: container, handler: handler });
      first.focus();
    },

    releaseFocus: function(container) {
      for (var i = focusTrapStack.length - 1; i >= 0; i--) {
        if (focusTrapStack[i].container === container) {
          container.removeEventListener('keydown', focusTrapStack[i].handler);
          focusTrapStack.splice(i, 1);
          break;
        }
      }
    },

    describeChart: function(data) {
      if (!data) return '';
      var parts = [];

      if (data.type) parts.push('Chart type: ' + data.type);
      if (data.title) parts.push(data.title);

      if (data.values && Array.isArray(data.values)) {
        var labels = data.labels || [];
        var desc = data.values.map(function(v, i) {
          var label = labels[i] || ('Item ' + (i + 1));
          return label + ': ' + v;
        });
        parts.push('Data: ' + desc.join(', '));
      }

      if (data.summary) parts.push(data.summary);

      return parts.join('. ');
    },

    ensureCanvasA11y: function() {
      var canvases = document.querySelectorAll('canvas');
      var violations = 0;
      canvases.forEach(function(c) {
        var hasLabel = c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby');
        var inFigure = c.closest('figure[role="img"][aria-labelledby]');
        if (!hasLabel && !inFigure) {
          violations++;
          console.warn('[A11y] Canvas without aria-label/figure:', c.id || c);
        }
      });
      return violations;
    }
  };

  // Listen for reduced-motion changes
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) {
      mq.addEventListener('change', function(e) { reducedMotion = e.matches; });
    }
  }

  // Expose
  window.TS = window.TS || {};
  window.TS.A11y = A11y;
})();
