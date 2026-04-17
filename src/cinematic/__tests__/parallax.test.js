/* G12 — TS.Parallax skeleton test (Wave 1) */
const { mockTS, mockRaf } = require('./test-helpers');

describe('TS.Parallax (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    mockRaf();
    jest.resetModules();
    require('../parallax.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Parallax as skeleton', () => {
    expect(window.TS.Parallax).toBeDefined();
    expect(window.TS.Parallax._skeleton).toBe(true);
  });

  it('skeleton enable() throws not-implemented', () => {
    expect(() => window.TS.Parallax.enable(document.createElement('div'), [])).toThrow(/not implemented/);
  });

  it.skip('enable() attaches mousemove listener with lerp 0.08', () => {
    // TODO(Wave 3): per MODULE_PROMPT g12 §4
  });

  it.skip('depth layers encoded via data-depth move proportionally', () => {
    // TODO(Wave 3)
  });

  it.skip('reduced-motion disables parallax', () => {
    // TODO(Wave 3)
  });
});
