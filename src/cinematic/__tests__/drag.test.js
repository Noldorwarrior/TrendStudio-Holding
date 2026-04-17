/* G15 — TS.Drag skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.Drag (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../drag.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Drag as skeleton', () => {
    expect(window.TS.Drag).toBeDefined();
    expect(window.TS.Drag._skeleton).toBe(true);
  });

  it('skeleton enable() throws not-implemented', () => {
    expect(() => window.TS.Drag.enable({ el: document.createElement('div') })).toThrow(/not implemented/);
  });

  it.skip('enable() attaches PointerEvent listeners', () => {
    // TODO(Wave 4): per MODULE_PROMPT g15 §4
  });

  it.skip('keyboard arrow keys move by keyboardStep (default 8px)', () => {
    // TODO(Wave 4)
  });

  it.skip('bounds constraint limits movement', () => {
    // TODO(Wave 4)
  });
});
