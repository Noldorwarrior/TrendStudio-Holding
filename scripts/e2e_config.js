// SPDX-License-Identifier: UNLICENSED
// PR #105 — E2E runner constants (gates, timeouts, slide count, selectors).
// Invariants I1–I7 + I11 (see PR_105_PhaseA_spec_FINAL.md §8.2).

'use strict';

module.exports = {
  // I2 — default HTML points to v1.2.0; override via HTML_PATH env
  DEFAULT_HTML: 'Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html',
  // I4 — report path fallback
  DEFAULT_REPORT: 'qa_reports/e2e_report.json',
  // I1 — 25 slides (CLAUDE.md §4)
  SLIDE_COUNT: 25,

  GATES: {
    // §5 — 45 FPS with headroom over 30 min, under 60 target
    FPS_MIN: 45,
    // I7 — 10% heap growth cap
    MEMORY_GROWTH_MAX_PCT: 10,
    // I5 — WCAG only, no best-practice (Q4)
    AXE_TAGS: ['wcag2a', 'wcag2aa'],
    // I6 — critical+serious block; moderate+minor logged but non-blocking
    AXE_IMPACT_BLOCKING: ['critical', 'serious'],
  },

  TIMEOUTS: {
    PAGE_LOAD_MS: 10000,
    SLIDE_TRANSITION_MS: 800,
    FIRST_SLIDE_SELECTOR_MS: 5000,
    // I11 — 1000 ms fallback for continuous FPS window when transitionend missing
    FPS_WINDOW_FALLBACK_MS: 1000,
  },

  SELECTORS: {
    // Phase 2B deck markup: <section class="slide" [hidden] ...>. Active slide =
    // one without the [hidden] attribute. Phase 2D may introduce '.ts-slide.is-active'
    // prefixes; at that point both selectors can co-exist via OR.
    ACTIVE_SLIDE: 'section.slide:not([hidden])',
  },
};
