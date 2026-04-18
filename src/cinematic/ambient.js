/**
 * G8 — TS.Ambient particle engine
 * Spec: Handoff_Phase2C/10_modules/g8_ambient/MODULE_PROMPT.md (v1.0)
 * API:  INFRA_PROMPT.md §4.3
 *
 * 5 presets (dust, sparkle, light_leak, data_stream, film_grain) over a
 * single shared RAF loop with adaptive FPS-based scaling. Per-slide canvas
 * via ResizeObserver, global pause/resume honoring prefers-reduced-motion,
 * intensity multiplier [0, 2] for G10 Cinema Mode hook.
 */

(function (global) {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // Private state (IIFE closure)
  // ─────────────────────────────────────────────────────────
  var _slides = new Map();
  var _paused = { value: false };
  var _intensity = { value: 1.0 };
  var _rafId = null;
  var _lastTickTs = 0;
  var _fpsEMA = 60;
  var _reducedMotionInit = false;

  var PRESETS = {
    dust:        { spawn: _spawnDust,       update: _updateDust,       baseCount: 50 },
    sparkle:     { spawn: _spawnSparkle,    update: _updateSparkle,    baseCount: 18 },
    light_leak:  { spawn: _spawnLightLeak,  update: _updateLightLeak,  baseCount: 4  },
    data_stream: { spawn: _spawnDataStream, update: _updateDataStream, baseCount: 30 },
    film_grain:  { spawn: null,             update: null,              baseCount: 0  }
  };

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────
  function start(slideId, config) {
    if (typeof slideId !== 'string' || !config || !PRESETS[config.preset]) {
      throw new Error('TS.Ambient.start: invalid arguments');
    }
    _initReducedMotionOnce();

    // Replace if already running
    if (_slides.has(slideId)) stop(slideId);

    var container = config.container ||
      document.querySelector('[data-slide-id="' + slideId + '"]');
    if (!container) {
      // eslint-disable-next-line no-console
      console.warn('TS.Ambient: container for slide ' + slideId + ' not found, skipping');
      return;
    }

    var density = typeof config.density === 'number' ? config.density : 0.5;
    var canvas = _createCanvas(container);
    var ctx = canvas.getContext('2d');

    var sc = {
      slideId: slideId,
      preset: config.preset,
      density: density,
      container: container,
      canvas: canvas,
      ctx: ctx,
      particles: [],
      resizeObserver: null,
      visible: true,
      grainFrames: null,
      grainFrameIndex: 0,
      grainLastSwap: 0
    };

    _resizeCanvas(sc);
    _attachResize(sc);

    if (PRESETS[config.preset].spawn) {
      var count = Math.round(PRESETS[config.preset].baseCount * density);
      for (var i = 0; i < count; i++) {
        sc.particles.push(PRESETS[config.preset].spawn(sc));
      }
    }

    _slides.set(slideId, sc);

    // Start RAF if not running
    if (!_rafId && !_paused.value) {
      _rafId = requestAnimationFrame(_tick);
    }

    if (global.TS && typeof global.TS.emit === 'function') {
      global.TS.emit('ambient:started', {
        slideId: slideId, preset: config.preset, density: density
      });
    }
  }

  function stop(slideId) {
    var sc = _slides.get(slideId);
    if (!sc) return;

    if (sc.resizeObserver && typeof sc.resizeObserver.disconnect === 'function') {
      sc.resizeObserver.disconnect();
    }
    if (sc.canvas && sc.canvas.parentNode) {
      sc.canvas.parentNode.removeChild(sc.canvas);
    }
    sc.particles = [];
    sc.grainFrames = null;

    _slides['delete'](slideId);

    if (_slides.size === 0 && _rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }

    if (global.TS && typeof global.TS.emit === 'function') {
      global.TS.emit('ambient:stopped', { slideId: slideId });
    }
  }

  function pause() {
    _paused.value = true;
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
  }

  function resume() {
    if (!_paused.value) return;
    _paused.value = false;
    if (_slides.size > 0 && !_rafId) {
      _lastTickTs = 0;
      _rafId = requestAnimationFrame(_tick);
    }
  }

  // NOTE: clamp [0, 2] — G10 Cinema Mode uses 1.3 (see MODULE_PROMPT §8.1).
  function setIntensity(value) {
    var v = Math.max(0, Math.min(2, Number(value) || 0));
    _intensity.value = v;
    if (global.TS && typeof global.TS.emit === 'function') {
      global.TS.emit('ambient:intensity_changed', { intensity: v });
    }
  }

  function getActivePresets() {
    var result = [];
    _slides.forEach(function (sc, slideId) {
      result.push({ slideId: slideId, preset: sc.preset, density: sc.density });
    });
    return result;
  }

  // Optional helper for slide code (Wave 6 integration with G17)
  function autoRegister(slideId, config) {
    if (!global.TS || !global.TS.ScrollTrigger ||
        typeof global.TS.ScrollTrigger.register !== 'function') {
      start(slideId, config);
      return;
    }
    global.TS.ScrollTrigger.register({
      slideId: slideId,
      onEnter: function () { start(slideId, config); },
      onExit:  function () { stop(slideId); }
    });
  }

  // ─────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────
  function _createCanvas(container) {
    var canvas = document.createElement('canvas');
    canvas.className = 'ts-ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-ambient', 'true');
    // G12 Parallax integration hook (see MODULE_PROMPT §8.2)
    canvas.setAttribute('data-depth', '0.6');

    var label = 'Decorative canvas';
    if (global.TS && global.TS.I18N && typeof global.TS.I18N.t === 'function') {
      label = global.TS.I18N.t('a11y.cinematic.ambient.canvas') || label;
    }
    canvas.setAttribute('aria-label', label);

    // Ensure container can host an absolutely-positioned canvas
    if (typeof getComputedStyle === 'function') {
      var cs = getComputedStyle(container);
      if (cs && cs.position === 'static') container.style.position = 'relative';
    }
    container.insertBefore(canvas, container.firstChild);
    return canvas;
  }

  function _resizeCanvas(sc) {
    var rect = sc.container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    sc.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    sc.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    sc.canvas.style.width = rect.width + 'px';
    sc.canvas.style.height = rect.height + 'px';
    // setTransform resets + scales in one call (avoids cumulative scaling)
    if (typeof sc.ctx.setTransform === 'function') {
      sc.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // Clamp particles to new bounds
    for (var i = 0; i < sc.particles.length; i++) {
      var p = sc.particles[i];
      p.x = Math.min(p.x, rect.width);
      p.y = Math.min(p.y, rect.height);
    }
  }

  function _attachResize(sc) {
    if (typeof ResizeObserver !== 'undefined') {
      sc.resizeObserver = new ResizeObserver(function () { _resizeCanvas(sc); });
      sc.resizeObserver.observe(sc.container);
    }
  }

  function _tick(ts) {
    if (_paused.value) { _rafId = null; return; }

    if (_lastTickTs) {
      var fps = 1000 / Math.max(1, ts - _lastTickTs);
      _fpsEMA = _fpsEMA * 0.9 + fps * 0.1;
    }
    _lastTickTs = ts;

    var fpsScale = _fpsEMA < 45 ? 0.7 : 1.0;

    _slides.forEach(function (sc) {
      if (!sc.visible) return;
      var p = PRESETS[sc.preset];
      if (p && p.update) {
        for (var i = 0; i < sc.particles.length; i++) {
          p.update(sc.particles[i], sc, ts, fpsScale);
        }
      }
      _renderParticles(sc, ts);
    });

    _rafId = requestAnimationFrame(_tick);
  }

  function _initReducedMotionOnce() {
    if (_reducedMotionInit) return;
    _reducedMotionInit = true;
    if (!window.matchMedia) return;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() {
      if (mq.matches) pause();
      else resume();
    }
    apply();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(apply); // legacy Safari
    }
  }

  // ─────────────────────────────────────────────────────────
  // Preset: dust
  // ─────────────────────────────────────────────────────────
  function _spawnDust(sc) {
    var rect = sc.canvas.getBoundingClientRect();
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: -0.1 - Math.random() * 0.3,    // drift left
      vy: 0.1 + Math.random() * 0.2,     // drift down
      size: 1 + Math.random() * 2,        // 1-3 px
      opacity: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      life: Infinity,
      preset: 'dust'
    };
  }

  function _updateDust(p, sc, ts, fpsScale) {
    p.x += p.vx * fpsScale;
    p.y += p.vy * fpsScale;
    p.phase += 0.01;
    p.x += Math.sin(p.phase) * 0.15;

    var dpr = window.devicePixelRatio || 1;
    var w = sc.canvas.width / dpr;
    var h = sc.canvas.height / dpr;
    if (p.x < -5) p.x = w + 5;
    if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
  }

  // ─────────────────────────────────────────────────────────
  // Preset: sparkle
  // ─────────────────────────────────────────────────────────
  function _spawnSparkle(sc) {
    var rect = sc.canvas.getBoundingClientRect();
    var lifeStart = 4000 + Math.random() * 4000;
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      size: 1.5 + Math.random() * 1.5,
      opacity: 0.3,
      phase: Math.random() * Math.PI * 2,
      life: lifeStart,
      lifeStart: lifeStart,
      preset: 'sparkle'
    };
  }

  function _updateSparkle(p, sc, ts, fpsScale) {
    p.x += p.vx * fpsScale;
    p.y += p.vy * fpsScale;
    p.life -= 16.67 * fpsScale;
    p.phase += 0.05;

    var lifeFrac = p.life / p.lifeStart;
    if (lifeFrac > 0.45 && lifeFrac < 0.55) {
      var pulse = 0.3 + Math.sin((lifeFrac - 0.5) * 10 * Math.PI) * 0.5;
      p.opacity = Math.max(0.3, Math.min(0.9, pulse));
    } else {
      p.opacity = 0.3;
    }

    if (p.life <= 0) {
      var rect = sc.canvas.getBoundingClientRect();
      p.x = Math.random() * rect.width;
      p.y = Math.random() * rect.height;
      p.life = 4000 + Math.random() * 4000;
      p.lifeStart = p.life;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Preset: light_leak
  // ─────────────────────────────────────────────────────────
  function _spawnLightLeak(sc) {
    var rect = sc.canvas.getBoundingClientRect();
    var isGold = Math.random() > 0.5;
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      size: 300 + Math.random() * 300,     // Ø 300-600 px
      opacity: 0.06 + Math.random() * 0.04,
      currentOpacity: 0.08,
      phase: Math.random() * Math.PI * 2,
      life: Infinity,
      color: isGold ? '201,169,97' : '0,112,192',
      preset: 'light_leak'
    };
  }

  function _updateLightLeak(p, sc, ts, fpsScale) {
    p.x += p.vx * fpsScale;
    p.y += p.vy * fpsScale;
    p.phase += 0.005;

    p.currentOpacity = p.opacity * (0.8 + Math.sin(p.phase) * 0.2);

    var rect = sc.canvas.getBoundingClientRect();
    if (p.x < -p.size / 2 || p.x > rect.width + p.size / 2) p.vx *= -1;
    if (p.y < -p.size / 2 || p.y > rect.height + p.size / 2) p.vy *= -1;
  }

  // ─────────────────────────────────────────────────────────
  // Preset: data_stream
  // ─────────────────────────────────────────────────────────
  function _spawnDataStream(sc) {
    var rect = sc.canvas.getBoundingClientRect();
    return {
      x: Math.random() * rect.width,
      y: -20,
      vx: -1.5 - Math.random() * 1.0,
      vy: 2.0 + Math.random() * 1.5,
      size: 1 + Math.random() * 1,
      opacity: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      life: Infinity,
      ch: Math.random() > 0.7 ? '·' : '•',
      preset: 'data_stream'
    };
  }

  function _updateDataStream(p, sc, ts, fpsScale) {
    p.x += p.vx * fpsScale;
    p.y += p.vy * fpsScale;

    var rect = sc.canvas.getBoundingClientRect();
    if (p.y > rect.height + 10) {
      p.y = -20;
      p.x = Math.random() * (rect.width * 1.3);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Preset: film_grain (no particles — noise pattern at 8 FPS)
  // ─────────────────────────────────────────────────────────
  function _ensureGrainFrames(sc) {
    if (sc.grainFrames) return;
    sc.grainFrames = [];
    var w = 128, h = 128;
    for (var f = 0; f < 4; f++) {
      var off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      var offCtx = off.getContext('2d');
      if (!offCtx || typeof offCtx.createImageData !== 'function') {
        // jsdom fallback — skip grain frame generation
        sc.grainFrames = [];
        return;
      }
      var imgData = offCtx.createImageData(w, h);
      var data = imgData.data;
      for (var i = 0; i < data.length; i += 4) {
        var v = Math.floor(Math.random() * 256);
        data[i]     = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 30;  // subtle alpha
      }
      offCtx.putImageData(imgData, 0, 0);
      sc.grainFrames.push(off);
    }
    sc.grainFrameIndex = 0;
    sc.grainLastSwap = 0;
  }

  function _renderFilmGrain(sc, ts) {
    _ensureGrainFrames(sc);
    if (!sc.grainFrames || sc.grainFrames.length === 0) return;

    if (ts - sc.grainLastSwap > 125) {  // 8 FPS = 125ms per frame
      sc.grainFrameIndex = (sc.grainFrameIndex + 1) % sc.grainFrames.length;
      sc.grainLastSwap = ts;
    }

    if (typeof sc.ctx.createPattern !== 'function') return;
    var pat = sc.ctx.createPattern(sc.grainFrames[sc.grainFrameIndex], 'repeat');
    if (!pat) return;

    var dpr = window.devicePixelRatio || 1;
    var w = sc.canvas.width / dpr;
    var h = sc.canvas.height / dpr;
    sc.ctx.save();
    sc.ctx.globalCompositeOperation = 'screen';
    sc.ctx.fillStyle = pat;
    sc.ctx.globalAlpha = 0.15 * _intensity.value;
    sc.ctx.fillRect(0, 0, w, h);
    sc.ctx.restore();
  }

  // ─────────────────────────────────────────────────────────
  // Unified render dispatcher (§4.6)
  // ─────────────────────────────────────────────────────────
  function _renderParticles(sc, ts) {
    var dpr = window.devicePixelRatio || 1;
    var w = sc.canvas.width / dpr;
    var h = sc.canvas.height / dpr;
    sc.ctx.clearRect(0, 0, w, h);

    var intensity = _intensity.value;

    for (var i = 0; i < sc.particles.length; i++) {
      var p = sc.particles[i];
      sc.ctx.save();

      if (p.preset === 'dust') {
        sc.ctx.globalAlpha = p.opacity * intensity;
        sc.ctx.fillStyle = 'rgba(255, 235, 180, 1)';
        sc.ctx.beginPath();
        sc.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        sc.ctx.fill();

      } else if (p.preset === 'sparkle') {
        sc.ctx.globalAlpha = p.opacity * intensity;
        sc.ctx.fillStyle = 'rgba(201, 169, 97, 1)';
        sc.ctx.beginPath();
        sc.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        sc.ctx.fill();

      } else if (p.preset === 'light_leak') {
        if (typeof sc.ctx.createRadialGradient === 'function') {
          var grad = sc.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size / 2);
          grad.addColorStop(0, 'rgba(' + p.color + ',' + (p.currentOpacity * intensity) + ')');
          grad.addColorStop(1, 'rgba(' + p.color + ',0)');
          sc.ctx.fillStyle = grad;
          sc.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

      } else if (p.preset === 'data_stream') {
        sc.ctx.globalAlpha = p.opacity * intensity;
        sc.ctx.fillStyle = 'rgba(102, 204, 255, 1)';
        sc.ctx.font = '10px monospace';
        if (typeof sc.ctx.fillText === 'function') {
          sc.ctx.fillText(p.ch, p.x, p.y);
        }
      }

      sc.ctx.restore();
    }

    // Film grain — separate pass, over particles
    if (sc.preset === 'film_grain') {
      _renderFilmGrain(sc, ts);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────
  global.TS = global.TS || {};
  global.TS.Ambient = {
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    setIntensity: setIntensity,
    getActivePresets: getActivePresets,
    autoRegister: autoRegister
  };

})(typeof window !== 'undefined' ? window : globalThis);
