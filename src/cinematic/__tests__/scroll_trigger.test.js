/* G17 — TS.ScrollTrigger skeleton test (Wave 1) */
const { mockTS } = require('./test-helpers');

describe('TS.ScrollTrigger (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../scroll_trigger.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('loads and exposes TS.ScrollTrigger as skeleton', () => {
    expect(window.TS.ScrollTrigger).toBeDefined();
    expect(window.TS.ScrollTrigger._skeleton).toBe(true);
  });

  it('skeleton register() throws not-implemented', () => {
    expect(() => window.TS.ScrollTrigger.register({ slideId: 's01' })).toThrow(/not implemented/);
  });

  it.skip('register() hooks IntersectionObserver on slide element', () => {
    // TODO(Wave 2): per MODULE_PROMPT g17 §4
  });

  it.skip('emits slide:enter and slide:exit at threshold 0.5', () => {
    // TODO(Wave 2)
  });

  it.skip('once:true unregisters after first enter', () => {
    // TODO(Wave 2)
  });

  it.skip('refresh() rebinds after DOM mutation', () => {
    // TODO(Wave 2)
  });
});
