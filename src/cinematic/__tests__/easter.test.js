/* G11 — TS.Easter skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.Easter (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../easter.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.Easter as skeleton', () => {
    expect(window.TS.Easter).toBeDefined();
    expect(window.TS.Easter._skeleton).toBe(true);
  });

  it('isFound() returns false by default (safe)', () => {
    expect(window.TS.Easter.isFound('EE-1')).toBe(false);
  });

  it('listFound() returns empty array by default', () => {
    expect(window.TS.Easter.listFound()).toEqual([]);
  });

  it('skeleton register() throws not-implemented', () => {
    expect(() => window.TS.Easter.register({ id: 'EE-1' })).toThrow(/not implemented/);
  });

  it.skip('register() stores EggDefinition', () => {
    // TODO(Wave 5): per MODULE_PROMPT g11 §4
  });

  it.skip('markFound() sets sessionStorage (NOT localStorage)', () => {
    // TODO(Wave 5)
  });
});
