// src/cinematic/__tests__/test-helpers.js — shared utilities for cinematic tests
// Used by all Wave 2-5 module tests. Jest idioms only.

const mockTS = () => ({
  I18N: {
    t: (key) => key,
    formatCurrency: (v) => `${v} ₽`,
    formatNumber: (v) => String(v),
    lang: 'ru'
  },
  A11Y: {
    isReducedMotion: () => false,
    announce: jest.fn()
  },
  Components: {
    Modal: jest.fn(() => ({ open: jest.fn(), close: jest.fn(), destroy: jest.fn() }))
  },
  Charts: {
    palette: { base: '#0070C0', bull: '#2E7D32', bear: '#C62828' }
  },
  NAV: {
    registerSlide: jest.fn(),
    current: jest.fn(() => 1),
    go: jest.fn()
  },
  URL: {
    getState: () => ({}),
    setState: jest.fn()
  },
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
});

const mockReducedMotion = (enabled = true) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? enabled : false,
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
};

const mockRaf = () => {
  let time = 0;
  global.requestAnimationFrame = (cb) => {
    setTimeout(() => cb(time += 16.67), 0);
    return 1;
  };
  global.cancelAnimationFrame = jest.fn();
};

const mockCanvas = () => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
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
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  });
};

module.exports = { mockTS, mockReducedMotion, mockRaf, mockCanvas };
