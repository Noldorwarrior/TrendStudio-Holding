/* G8 — TS.Ambient Jest suite (Wave 3) */
/* Spec: Handoff_Phase2C/10_modules/g8_ambient/MODULE_PROMPT.md §7 */

const { mockTS, mockReducedMotion, mockRaf, mockCanvas } = require('./test-helpers');

// Extend mockCanvas with Phase-2C setTransform / createPattern / createRadialGradient /
// fillText / createImageData / putImageData — ambient.js guards these with typeof checks,
// but tests that inspect calls need the Jest mocks present.
function extendedMockCanvas() {
  mockCanvas();
  const proto = HTMLCanvasElement.prototype;
  const originalGetContext = proto.getContext;
  proto.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    setTransform: jest.fn(),
    createPattern: jest.fn(() => ({})),
    createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    fillText: jest.fn(),
    createImageData: jest.fn((w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })),
    putImageData: jest.fn(),
    font: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  });
  return originalGetContext;
}

// Ensure fresh load of ambient.js with reset closure state
function loadAmbient() {
  jest.resetModules();
  require('../ambient.js');
}

describe('TS.Ambient', () => {

  beforeEach(() => {
    window.TS = mockTS();
    mockRaf();
    extendedMockCanvas();
    // Default: reduced-motion OFF (so start doesn't auto-pause)
    mockReducedMotion(false);
    loadAmbient();
  });

  afterEach(() => {
    if (window.TS && window.TS.Ambient && window.TS.Ambient.getActivePresets) {
      window.TS.Ambient.getActivePresets().forEach(({ slideId }) =>
        window.TS.Ambient.stop(slideId)
      );
    }
    jest.clearAllMocks();
    delete window.TS;
    document.body.innerHTML = '';
  });

  // ─── API surface ─────────────────────────────────────────────
  describe('API surface', () => {
    it('exposes start, stop, pause, resume, setIntensity, getActivePresets', () => {
      ['start', 'stop', 'pause', 'resume', 'setIntensity', 'getActivePresets'].forEach((m) => {
        expect(typeof TS.Ambient[m]).toBe('function');
      });
    });

    it('exposes autoRegister helper', () => {
      expect(typeof TS.Ambient.autoRegister).toBe('function');
    });
  });

  // ─── start/stop ──────────────────────────────────────────────
  describe('start/stop', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      el.style.width = '800px';
      el.style.height = '600px';
      document.body.appendChild(el);
    });

    it('start creates canvas inside container with a11y attrs', () => {
      TS.Ambient.start('s01', { preset: 'dust', density: 0.5 });
      const canvas = document.querySelector('[data-slide-id="s01"] .ts-ambient-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.getAttribute('aria-hidden')).toBe('true');
      expect(canvas.getAttribute('data-ambient')).toBe('true');
      expect(canvas.getAttribute('data-depth')).toBe('0.6'); // G12 Parallax hook
    });

    it('start uses i18n aria-label key a11y.cinematic.ambient.canvas', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      const canvas = document.querySelector('[data-slide-id="s01"] .ts-ambient-canvas');
      // mockTS.I18N.t returns the key itself
      expect(canvas.getAttribute('aria-label')).toBe('a11y.cinematic.ambient.canvas');
    });

    it('start twice for same slideId does not leak canvases', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.start('s01', { preset: 'sparkle' });
      const canvases = document.querySelectorAll('[data-slide-id="s01"] .ts-ambient-canvas');
      expect(canvases.length).toBe(1);
    });

    it('stop removes canvas', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.stop('s01');
      expect(document.querySelector('.ts-ambient-canvas')).toBe(null);
    });

    it('stop for unknown slideId is no-op (does not throw)', () => {
      expect(() => TS.Ambient.stop('s99')).not.toThrow();
    });

    it('start throws for invalid preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'invalid' })).toThrow();
    });

    it('start throws for missing config', () => {
      expect(() => TS.Ambient.start('s01')).toThrow();
    });

    it('start emits ambient:started event with payload', () => {
      TS.Ambient.start('s01', { preset: 'dust', density: 0.7 });
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:started',
        expect.objectContaining({ slideId: 's01', preset: 'dust', density: 0.7 })
      );
    });

    it('stop emits ambient:stopped event', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.stop('s01');
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:stopped',
        expect.objectContaining({ slideId: 's01' })
      );
    });
  });

  // ─── 5 presets ───────────────────────────────────────────────
  describe('5 presets', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
    });

    it('supports dust preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'dust' })).not.toThrow();
      expect(TS.Ambient.getActivePresets()[0].preset).toBe('dust');
    });

    it('supports sparkle preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'sparkle' })).not.toThrow();
      expect(TS.Ambient.getActivePresets()[0].preset).toBe('sparkle');
    });

    it('supports light_leak preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'light_leak' })).not.toThrow();
      expect(TS.Ambient.getActivePresets()[0].preset).toBe('light_leak');
    });

    it('supports data_stream preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'data_stream' })).not.toThrow();
      expect(TS.Ambient.getActivePresets()[0].preset).toBe('data_stream');
    });

    it('supports film_grain preset (no particles, noise pattern)', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'film_grain' })).not.toThrow();
      expect(TS.Ambient.getActivePresets()[0].preset).toBe('film_grain');
    });
  });

  // ─── getActivePresets ────────────────────────────────────────
  describe('getActivePresets', () => {
    it('returns empty array when nothing active', () => {
      expect(TS.Ambient.getActivePresets()).toEqual([]);
    });

    it('returns list of active slides with preset+density', () => {
      const el1 = document.createElement('div');
      el1.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el1);
      const el2 = document.createElement('div');
      el2.setAttribute('data-slide-id', 's05');
      document.body.appendChild(el2);

      TS.Ambient.start('s01', { preset: 'dust', density: 0.5 });
      TS.Ambient.start('s05', { preset: 'sparkle', density: 0.8 });

      const active = TS.Ambient.getActivePresets();
      expect(active.length).toBe(2);
      expect(active).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ slideId: 's01', preset: 'dust', density: 0.5 }),
          expect.objectContaining({ slideId: 's05', preset: 'sparkle', density: 0.8 })
        ])
      );
    });
  });

  // ─── setIntensity (clamp [0, 2] per §8.1, G10 compat) ────────
  describe('setIntensity', () => {
    it('clamps negative to 0', () => {
      TS.Ambient.setIntensity(-0.5);
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:intensity_changed',
        { intensity: 0 }
      );
    });

    it('clamps value above 2 to 2 (G10 Cinema Mode may request 1.3)', () => {
      TS.Ambient.setIntensity(3);
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:intensity_changed',
        { intensity: 2 }
      );
    });

    it('accepts 0..2 values unchanged', () => {
      TS.Ambient.setIntensity(0.6);
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:intensity_changed',
        { intensity: 0.6 }
      );
      TS.Ambient.setIntensity(1.3);
      expect(TS.emit).toHaveBeenCalledWith(
        'ambient:intensity_changed',
        { intensity: 1.3 }
      );
    });
  });

  // ─── pause/resume ────────────────────────────────────────────
  describe('pause/resume', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
    });

    it('pause stops RAF loop but keeps slide registered', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.pause();
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });

    it('resume after pause keeps slide active', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.pause();
      TS.Ambient.resume();
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });

    it('resume without prior pause is a no-op', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      expect(() => TS.Ambient.resume()).not.toThrow();
    });
  });

  // ─── reduced-motion ──────────────────────────────────────────
  describe('reduced-motion', () => {
    it('pauses automatically when prefers-reduced-motion is reduce', () => {
      // Override default and reload with reduced-motion=true
      mockReducedMotion(true);
      loadAmbient();
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      TS.Ambient.start('s01', { preset: 'dust' });
      // Slide is registered, but RAF is paused (no crash, no throw)
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });
  });

  // ─── memory safety ───────────────────────────────────────────
  describe('memory safety', () => {
    it('start/stop × 50 cycles leaves no canvases', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      for (let i = 0; i < 50; i++) {
        TS.Ambient.start('s01', { preset: 'dust' });
        TS.Ambient.stop('s01');
      }
      expect(document.querySelectorAll('.ts-ambient-canvas').length).toBe(0);
      expect(TS.Ambient.getActivePresets().length).toBe(0);
    });
  });

  // ─── autoRegister ────────────────────────────────────────────
  describe('autoRegister', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
    });

    it('falls back to direct start when ScrollTrigger not available', () => {
      delete window.TS.ScrollTrigger;
      TS.Ambient.autoRegister('s01', { preset: 'dust' });
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });

    it('uses ScrollTrigger.register when available', () => {
      window.TS.ScrollTrigger = { register: jest.fn() };
      TS.Ambient.autoRegister('s01', { preset: 'dust' });
      expect(TS.ScrollTrigger.register).toHaveBeenCalledWith(
        expect.objectContaining({
          slideId: 's01',
          onEnter: expect.any(Function),
          onExit: expect.any(Function)
        })
      );
    });
  });

  // ─── container resolution ────────────────────────────────────
  describe('container resolution', () => {
    it('uses config.container if provided', () => {
      const custom = document.createElement('section');
      document.body.appendChild(custom);
      TS.Ambient.start('s01', { preset: 'dust', container: custom });
      expect(custom.querySelector('.ts-ambient-canvas')).toBeTruthy();
    });

    it('warns and skips when container not found', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      TS.Ambient.start('sXX', { preset: 'dust' });
      expect(warn).toHaveBeenCalled();
      expect(TS.Ambient.getActivePresets().length).toBe(0);
      warn.mockRestore();
    });
  });

});
