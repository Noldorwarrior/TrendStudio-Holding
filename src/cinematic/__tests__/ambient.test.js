/* G8 — TS.Ambient skeleton test (Wave 1) */
const { mockTS, mockCanvas, mockRaf } = require('./test-helpers');

describe('TS.Ambient (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    mockCanvas();
    mockRaf();
    jest.resetModules();
    require('../ambient.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Ambient as skeleton', () => {
    expect(window.TS.Ambient).toBeDefined();
    expect(window.TS.Ambient._skeleton).toBe(true);
  });

  it('skeleton start() throws not-implemented', () => {
    expect(() => window.TS.Ambient.start('s01', { preset: 'dust' })).toThrow(/not implemented/);
  });

  it.skip('start(dust preset) creates canvas and loops rAF', () => {
    // TODO(Wave 3): per MODULE_PROMPT g8 §4
  });

  it.skip('pause() stops rAF without dropping canvas', () => {
    // TODO(Wave 3)
  });

  it.skip('reduced-motion auto-pauses on start', () => {
    // TODO(Wave 3)
  });

  it.skip('auto-degrades density if fps < 45', () => {
    // TODO(Wave 3)
  });
});
