/* G10 — TS.Cinema skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.Cinema (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../cinema_mode.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Cinema as skeleton', () => {
    expect(window.TS.Cinema).toBeDefined();
    expect(window.TS.Cinema._skeleton).toBe(true);
  });

  it('isActive() returns false by default (safe)', () => {
    expect(window.TS.Cinema.isActive()).toBe(false);
  });

  it('skeleton enter() rejects with not-implemented', async () => {
    await expect(window.TS.Cinema.enter()).rejects.toThrow(/not implemented/);
  });

  it.skip('enter() requests fullscreen and adds .ts-cinema-active class', () => {
    // TODO(Wave 5): per MODULE_PROMPT g10 §4
  });

  it.skip('bound to key C via TS.Keyboard', () => {
    // TODO(Wave 5) — depends on G13
  });

  it.skip('exit() removes letterbox and grain overlay', () => {
    // TODO(Wave 5)
  });
});
