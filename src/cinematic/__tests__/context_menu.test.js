/* G14 — TS.ContextMenu skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.ContextMenu (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../context_menu.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.ContextMenu as skeleton', () => {
    expect(window.TS.ContextMenu).toBeDefined();
    expect(window.TS.ContextMenu._skeleton).toBe(true);
  });

  it('skeleton open() throws not-implemented', () => {
    expect(() => window.TS.ContextMenu.open([], 0, 0)).toThrow(/not implemented/);
  });

  it.skip('open(items, x, y) renders glass-morphism menu', () => {
    // TODO(Wave 4): per MODULE_PROMPT g14 §4
  });

  it.skip('keyboard navigation (Arrow, Enter, Esc) works', () => {
    // TODO(Wave 4)
  });

  it.skip('registerForElement() adds contextmenu listener', () => {
    // TODO(Wave 4)
  });
});
