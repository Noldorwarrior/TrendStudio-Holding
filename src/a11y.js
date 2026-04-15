/* S34: Accessibility module — Phase 2A (extended from Phase 1)
   Owner: S34 | Provides: window.TS.A11y
   Contract: trapFocus(el) -> handle, releaseFocus(handle), announce(msg, priority),
             prefersReducedMotion() */

(function() {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var liveRegion = null;
  var handleCounter = 0;
  var focusTrapHandles = {};

  var FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * Ensure aria-live region exists in body.
   * Creates one if #a11y-live not found.
   */
  function ensureLiveRegion() {
    if (liveRegion) return liveRegion;
    liveRegion = document.getElementById('a11y-live');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  }

  var A11y = {
    prefersReducedMotion: function() {
      return reducedMotion;
    },

    /**
     * Announce message to screen readers via aria-live region.
     * @param {string} message - Text to announce
     * @param {string} priority - 'polite' (default) or 'assertive'
     */
    announce: function(message, priority) {
      var region = ensureLiveRegion();
      region.setAttribute('aria-live', priority === 'assertive' ? 'assertive' : 'polite');
      region.textContent = '';
      requestAnimationFrame(function() {
        region.textContent = message;
      });
    },

    /**
     * Trap focus within a container element.
     * Remembers previous activeElement for restoration.
     * Tab/Shift+Tab cycle within container. Esc calls releaseFocus.
     * @param {HTMLElement} el - Container to trap focus in
     * @returns {object|null} handle - { id, container } for releaseFocus
     */
    trapFocus: function(el) {
      if (!el) return null;
      var focusable = el.querySelectorAll(FOCUSABLE_SELECTOR);

      var previousActiveElement = document.activeElement;
      var id = ++handleCounter;

      var handler = function(e) {
        if (e.key === 'Escape') {
          A11y.releaseFocus({ id: id, container: el });
          return;
        }
        if (e.key !== 'Tab') return;

        // Re-query focusable elements (they may change dynamically)
        var current = el.querySelectorAll(FOCUSABLE_SELECTOR);
        if (current.length === 0) return;

        var first = current[0];
        var last = current[current.length - 1];

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

      el.addEventListener('keydown', handler);

      var handle = {
        id: id,
        container: el
      };

      focusTrapHandles[id] = {
        container: el,
        handler: handler,
        previousActiveElement: previousActiveElement
      };

      // Focus first focusable element
      if (focusable.length > 0) {
        focusable[0].focus();
      }

      return handle;
    },

    /**
     * Release focus trap and restore previous activeElement.
     * @param {object} handle - Handle returned by trapFocus ({ id, container })
     */
    releaseFocus: function(handle) {
      if (!handle || handle.id == null) return;

      var entry = focusTrapHandles[handle.id];
      if (!entry) return;

      entry.container.removeEventListener('keydown', entry.handler);

      // Restore focus to previous element
      if (entry.previousActiveElement && typeof entry.previousActiveElement.focus === 'function') {
        try { entry.previousActiveElement.focus(); } catch (e) { /* element may be gone */ }
      }

      delete focusTrapHandles[handle.id];
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

  // Listen for reduced-motion changes dynamically
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
