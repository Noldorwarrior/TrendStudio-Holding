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
    const expected = [
      'Keyboard', 'ScrollTrigger', 'Ambient', 'Sound',
      'Parallax', 'ContextMenu', 'Drag', 'Easter', 'WhatIf', 'Cinema'
    ];
    expected.forEach((name) => {
      expect(window.TS[name]).toBeDefined();
      expect(window.TS[name]._skeleton).toBe(true);
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
