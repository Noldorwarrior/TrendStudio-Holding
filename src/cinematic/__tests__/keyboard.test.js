/* G13 — TS.Keyboard skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.Keyboard (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../keyboard.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Keyboard as skeleton', () => {
    expect(window.TS.Keyboard).toBeDefined();
    expect(window.TS.Keyboard._skeleton).toBe(true);
    expect(typeof window.TS.Keyboard.register).toBe('function');
  });

  it('skeleton register() throws not-implemented', () => {
    expect(() => window.TS.Keyboard.register('C', {})).toThrow(/not implemented/);
  });

  it.skip('register() adds shortcut to registry', () => {
    // TODO(Wave 2): implement per Handoff_Phase2C/10_modules/g13_keyboard/MODULE_PROMPT.md §4
  });

  it.skip('list(context) filters by context', () => {
    // TODO(Wave 2)
  });

  it.skip('disable() stops all shortcut firing', () => {
    // TODO(Wave 2)
  });

  it.skip('allowInInput=false ignores events from inputs', () => {
    // TODO(Wave 2)
  });
});
