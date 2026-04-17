/* S49: Live-Controls — scenario switcher + 3 sliders (rate/horizon/stress)
   Owner: S49 | Phase 2B
   Depends: macros.js, orchestrator.js (TS.readURLPriority/updateURLHash/setScenario),
            components.js (TS.Components.Slider), i18n.js (I18N.t)
   Provides: window.TS.Controls.mount(container), window.TS.State (minimal store).
   Scenario alias: event payload stays in {base,bull,bear} (charts S42-S48 expect this);
   in parallel we call TS.setScenario('opt'|'pess'|'base') for orchestrator compatibility. */

(function() {
  'use strict';

  var DEFAULTS = { scenario: 'base', rate: 15, horizon: 5, stress: 0 };
  var SCENARIOS = ['base', 'bull', 'bear'];
  var ORCH = { base: 'base', bull: 'opt', bear: 'pess' };
  var DEBOUNCE_MS = 150;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function readPriority(key, fb) {
    var TS = window.TS;
    if (TS && typeof TS.readURLPriority === 'function') return TS.readURLPriority(key, fb);
    try {
      var sp = new URLSearchParams(window.location.search);
      if (sp.has(key)) return sp.get(key);
    } catch (e) { /* */ }
    var hash = (window.location.hash || '').replace(/^#/, '');
    var parts = hash ? hash.split('&') : [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].split('=');
      if (p[0] === key && p.length > 1) return decodeURIComponent(p[1]);
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        var s = sessionStorage.getItem(key);
        if (s !== null) return s;
      }
    } catch (e) { /* */ }
    return fb;
  }

  function updateHash(key, value) {
    var TS = window.TS;
    if (TS && typeof TS.updateURLHash === 'function') { TS.updateURLHash(key, value); return; }
    try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, String(value)); }
    catch (e) { /* */ }
  }

  // Minimal TS.State store (created once per page)
  function ensureState() {
    window.TS = window.TS || {};
    if (window.TS.State && typeof window.TS.State.get === 'function') return window.TS.State;
    var store = {}, subs = {};
    var State = {
      get: function(k) { return store[k]; },
      set: function(k, v, opts) {
        var old = store[k];
        if (old === v) return;
        store[k] = v;
        if (opts && opts.persist) updateHash(k, v);
        (subs[k] || []).slice().forEach(function(fn) {
          try { fn(v, old); } catch (e) { /* swallow */ }
        });
      },
      subscribe: function(k, fn) {
        if (!subs[k]) subs[k] = [];
        subs[k].push(fn);
        return function() { subs[k] = (subs[k] || []).filter(function(f) { return f !== fn; }); };
      }
    };
    window.TS.State = State;
    return State;
  }

  function initValues() {
    var raw = {
      scenario: readPriority('scenario', DEFAULTS.scenario),
      rate:     readPriority('rate',     DEFAULTS.rate),
      horizon:  readPriority('horizon',  DEFAULTS.horizon),
      stress:   readPriority('stress',   DEFAULTS.stress)
    };
    if (SCENARIOS.indexOf(raw.scenario) === -1) raw.scenario = DEFAULTS.scenario;
    raw.rate    = clamp(parseInt(raw.rate, 10)    || DEFAULTS.rate,    10, 25);
    raw.horizon = clamp(parseInt(raw.horizon, 10) || DEFAULTS.horizon,  3, 10);
    raw.stress  = clamp(parseInt(raw.stress, 10)  || DEFAULTS.stress,   0, 100);
    return raw;
  }

  function tr(key, fb) {
    if (window.I18N && typeof window.I18N.t === 'function') {
      var v = window.I18N.t(key);
      if (v && v.indexOf('[!') !== 0 && v.indexOf('[EN:') !== 0) return v;
    }
    return fb;
  }

  function debounce(fn, ms) {
    var t = null;
    var w = function() {
      if (t) clearTimeout(t);
      t = setTimeout(function() { t = null; fn(); }, ms);
    };
    w.cancel = function() { if (t) { clearTimeout(t); t = null; } };
    return w;
  }

  function emitParam(state) {
    if (window.TS && typeof window.TS.emit === 'function') {
      window.TS.emit('param:changed', {
        rate: state.get('rate'), horizon: state.get('horizon'), stress: state.get('stress')
      });
    }
  }

  function renderSwitch(container, state) {
    var group = document.createElement('div');
    group.className = 'ts-scenario-switch';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', tr('a11y.control.scenario.group', 'Scenario switcher'));
    group.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';

    var legend = document.createElement('span');
    legend.className = 'ts-scenario-switch__legend';
    legend.textContent = tr('ui.control.scenario.label', 'Scenario');
    legend.style.cssText = 'color:var(--text-secondary,#9CA3AF);font-size:13px;margin-right:4px;';
    group.appendChild(legend);

    var buttons = {};

    function setActive(v, opts) {
      opts = opts || {};
      if (SCENARIOS.indexOf(v) === -1) return;
      Object.keys(buttons).forEach(function(k) {
        var on = (k === v);
        buttons[k].setAttribute('aria-checked', on ? 'true' : 'false');
        buttons[k].tabIndex = on ? 0 : -1;
        buttons[k].classList.toggle('is-active', on);
      });
      if (opts.focus) { try { buttons[v].focus(); } catch (e) { /* */ } }
      state.set('scenario', v, { persist: true });
      if (opts.silent) return;
      if (window.TS && typeof window.TS.emit === 'function') {
        window.TS.emit('scenario:changed', v);
      }
      var o = ORCH[v];
      if (o && window.TS && typeof window.TS.setScenario === 'function') {
        try { window.TS.setScenario(o); } catch (e) { /* different branch */ }
      }
    }

    SCENARIOS.forEach(function(v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('data-value', v);
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('aria-label', tr('a11y.control.scenario.' + v, v));
      btn.className = 'ts-scenario-switch__btn';
      btn.style.cssText = 'padding:6px 12px;border:1px solid rgba(201,169,97,0.35);background:transparent;color:var(--text-primary,#F5F5F5);border-radius:6px;cursor:pointer;font-size:13px;';
      btn.textContent = tr('ui.control.scenario.' + v, v);
      btn.addEventListener('click', function() { setActive(v, { focus: false }); });
      btn.addEventListener('keydown', function(e) {
        var idx = SCENARIOS.indexOf(v);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault(); setActive(SCENARIOS[(idx + 1) % SCENARIOS.length], { focus: true });
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault(); setActive(SCENARIOS[(idx - 1 + SCENARIOS.length) % SCENARIOS.length], { focus: true });
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault(); setActive(v, { focus: true });
        }
      });
      buttons[v] = btn;
      group.appendChild(btn);
    });

    setActive(state.get('scenario') || DEFAULTS.scenario, { silent: true });
    container.appendChild(group);
    return { setActive: setActive, buttons: buttons, root: group };
  }

  function mountSlider(container, state, cfg, debounced) {
    var Slider = window.TS && window.TS.Components && window.TS.Components.Slider;
    if (typeof Slider !== 'function') return null;
    return Slider(container, {
      min: cfg.min, max: cfg.max, step: cfg.step,
      value: state.get(cfg.key),
      format: cfg.format,
      a11y: { label: cfg.a11yLabel, valuetext: cfg.valuetext },
      onChange: function(v) {
        state.set(cfg.key, v, { persist: true });
        debounced();
      }
    });
  }

  function mount(container) {
    if (!container) throw new Error('TS.Controls.mount: container required');
    var state = ensureState();
    var init = initValues();
    state.set('scenario', init.scenario, { persist: true });
    state.set('rate',     init.rate,     { persist: true });
    state.set('horizon',  init.horizon,  { persist: true });
    state.set('stress',   init.stress,   { persist: true });

    var root = document.createElement('div');
    root.className = 'ts-controls';
    root.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:12px;';

    var sc = renderSwitch(root, state);

    var box = document.createElement('div');
    box.className = 'ts-controls__sliders';
    box.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
    root.appendChild(box);

    var debounced = debounce(function() { emitParam(state); }, DEBOUNCE_MS);

    var cfgs = [
      { key: 'rate', min: 10, max: 25, step: 1,
        a11yLabel: tr('a11y.control.rate.label', 'Discount rate, %'),
        format: function(v) { return v + '%'; },
        valuetext: function(v) { return v + ' percent'; } },
      { key: 'horizon', min: 3, max: 10, step: 1,
        a11yLabel: tr('a11y.control.horizon.label', 'Horizon, years'),
        format: function(v) { return v + ' ' + tr('ui.control.horizon.format', 'yrs'); },
        valuetext: function(v) { return v + ' years'; } },
      { key: 'stress', min: 0, max: 100, step: 5,
        a11yLabel: tr('a11y.control.stress.label', 'Stress, %'),
        format: function(v) { return v + '%'; },
        valuetext: function(v) { return v + ' percent stress'; } }
    ];

    var sliders = {};
    cfgs.forEach(function(cfg) { sliders[cfg.key] = mountSlider(box, state, cfg, debounced); });

    container.appendChild(root);

    return {
      root: root, scenario: sc, sliders: sliders, state: state,
      destroy: function() {
        debounced.cancel();
        Object.keys(sliders).forEach(function(k) {
          if (sliders[k] && typeof sliders[k].destroy === 'function') sliders[k].destroy();
        });
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  window.TS = window.TS || {};
  window.TS.Controls = {
    mount: mount,
    DEFAULTS: DEFAULTS,
    SCENARIOS: SCENARIOS,
    _ensureState: ensureState,
    _initValues: initValues
  };
})();
