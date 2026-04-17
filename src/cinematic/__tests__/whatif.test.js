/* G16 — TS.WhatIf skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.WhatIf (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../whatif.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.WhatIf as skeleton', () => {
    expect(window.TS.WhatIf).toBeDefined();
    expect(window.TS.WhatIf._skeleton).toBe(true);
  });

  it('skeleton register() throws not-implemented', () => {
    expect(() => window.TS.WhatIf.register('s14', [])).toThrow(/not implemented/);
  });

  it.skip('register() stores WhatIfField[] for slide', () => {
    // TODO(Wave 5): per MODULE_PROMPT g16 §4
  });

  it.skip('dblclick on data-whatif-id opens inline editor', () => {
    // TODO(Wave 5)
  });

  it.skip('formulas from whatif_formulas.json via switch-case (NOT eval/new Function!)', () => {
    // TODO(Wave 5) — ref INFRA §13.1 security ban
  });

  it.skip('reset() restores defaults and emits whatif:reset', () => {
    // TODO(Wave 5)
  });
});
