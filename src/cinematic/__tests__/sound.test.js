/* G9 — TS.Sound skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.Sound (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../sound.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Sound as skeleton', () => {
    expect(window.TS.Sound).toBeDefined();
    expect(window.TS.Sound._skeleton).toBe(true);
  });

  it('isEnabled() returns false by default (safe)', () => {
    expect(window.TS.Sound.isEnabled()).toBe(false);
  });

  it('skeleton enable() throws not-implemented', () => {
    expect(() => window.TS.Sound.enable()).toThrow(/not implemented/);
  });

  it.skip('enable() creates AudioContext lazily', () => {
    // TODO(Wave 3): per MODULE_PROMPT g9 §4
  });

  it.skip('play(event) plays registered tone', () => {
    // TODO(Wave 3)
  });

  it.skip('persists toggle state in sessionStorage (not localStorage!)', () => {
    // TODO(Wave 3)
  });
});
