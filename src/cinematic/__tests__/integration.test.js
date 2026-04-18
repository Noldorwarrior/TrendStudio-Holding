/* Cinematic integration smoke test (Wave 1) — all skeletons load together */
const { mockTS } = require('./test-helpers');

describe('Cinematic modules integration (skeleton)', () => {
  beforeEach(() => {
    window.TS = mockTS();
    jest.resetModules();
    require('../keyboard.js');
    require('../scroll_trigger.js');
    require('../ambient.js');
    require('../sound.js');
    require('../parallax.js');
    require('../context_menu.js');
    require('../drag.js');
    require('../easter.js');
    require('../whatif.js');
    require('../cinema_mode.js');
  });

  afterEach(() => {
    delete window.TS;
  });

  it('all 10 modules register under TS namespace', () => {
    // Skeleton modules (still Wave 1 stubs)
    const skeletons = [
      'Keyboard', 'ScrollTrigger', 'Sound',
      'Parallax', 'ContextMenu', 'Drag', 'Easter', 'WhatIf', 'Cinema'
    ];
    // Implemented modules (graduated from skeleton)
    //   Wave 3 Sprint 1 G8 — Ambient particle engine (MODULE_PROMPT v1.0)
    const implemented = ['Ambient'];

    skeletons.forEach((name) => {
      expect(window.TS[name]).toBeDefined();
      expect(window.TS[name]._skeleton).toBe(true);
    });
    implemented.forEach((name) => {
      expect(window.TS[name]).toBeDefined();
      // No _skeleton flag — real implementation exposes public API
      expect(typeof window.TS[name].start).toBe('function');
    });
  });

  it('no module pollutes outside TS.* namespace', () => {
    // loading the skeletons should not attach anything to window other than TS.*
    // This is a sanity check — no direct exposure like window.Keyboard, window.Ambient etc.
    expect(window.Keyboard).toBeUndefined();
    expect(window.Ambient).toBeUndefined();
    expect(window.Cinema).toBeUndefined();
  });

  it.skip('wave 2-5 cross-module events propagate (cinema:toggled, slide:enter etc.)', () => {
    // TODO(Wave 5): full integration after all modules implemented
  });
});
