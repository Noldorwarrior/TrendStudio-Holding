/**
 * PR #105 — Unit tests for scripts/e2e_runner.js helpers.
 * 8 tests per FINAL spec §3.5 / §6.
 *
 * Executed via `npx jest qa/__tests__/e2e_runner.test.js`.
 * Note: jest.config.js testMatch includes qa/__tests__/*.test.js (added in PR #105).
 */

'use strict';

const path = require('path');
const {
  parseHtmlPath,
  computeAvgFps,
  computeMemoryGrowthPct,
  filterBlockingViolations,
  aggregateReport,
  exitCode,
  detectMemoryStrategy,
  sampleFps,
} = require('../../scripts/e2e_runner');

describe('e2e_runner helpers', () => {
  test('1. parseHtmlPath resolves relative env to absolute file:// URL', () => {
    const fakeRoot = '/tmp/fake-repo';
    const { absPath, url } = parseHtmlPath(
      'Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html',
      fakeRoot
    );
    expect(absPath).toBe(
      path.resolve(fakeRoot, 'Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html')
    );
    expect(url.startsWith('file://')).toBe(true);
    expect(url.endsWith('.html')).toBe(true);
  });

  test('2. computeAvgFps returns ~60 for 60 frames of ~16.67ms, 0 for empty', () => {
    const sixtyFps = new Array(60).fill(1000 / 60);
    const avg = computeAvgFps(sixtyFps);
    expect(avg).toBeGreaterThan(59.5);
    expect(avg).toBeLessThan(60.5);
    expect(computeAvgFps([])).toBe(0);
    expect(computeAvgFps(null)).toBe(0);
    expect(computeAvgFps([0, -5, NaN])).toBe(0);
  });

  test('3. computeMemoryGrowthPct handles null/zero before', () => {
    expect(computeMemoryGrowthPct(1000, 1100)).toBe(10);
    expect(computeMemoryGrowthPct(1000, 950)).toBe(-5);
    expect(computeMemoryGrowthPct(0, 1000)).toBeNull();
    expect(computeMemoryGrowthPct(null, 1000)).toBeNull();
    expect(computeMemoryGrowthPct(1000, null)).toBeNull();
    expect(computeMemoryGrowthPct('x', 1000)).toBeNull();
  });

  test('4. filterBlockingViolations keeps only critical+serious', () => {
    const violations = [
      { id: 'v1', impact: 'critical' },
      { id: 'v2', impact: 'serious' },
      { id: 'v3', impact: 'moderate' },
      { id: 'v4', impact: 'minor' },
      { id: 'v5', impact: null },
      null,
    ];
    const blocking = filterBlockingViolations(violations);
    expect(blocking.map((v) => v.id)).toEqual(['v1', 'v2']);
    expect(filterBlockingViolations(null)).toEqual([]);
  });

  test('5. aggregateReport builds valid JSON with per-gate passed + overall passed', () => {
    const report = aggregateReport({
      runId: '2026-04-18T12:00:00Z',
      htmlPath: 'Deck_v1.2.0/foo.html',
      browser: 'chromium',
      strictMemory: false,
      durationMs: 12345,
      smoke: { passed: true, page_errors: [], console_errors: [] },
      fps: { passed: true, avg_fps: 58, min_fps: 50, mode_breakdown: { transitionend: 24, continuous_fallback: 0 } },
      memory: { passed: true, strategy: 'measure', first_pass_heap: 1000, second_pass_heap: 1050, growth_pct: 5 },
      axe: { passed: true, violations_total: 0, per_slide: [] },
      slides: [{ idx: 1, fps: { avg: 60, mode: 'transitionend' }, axe_violations: [], memory_heap: null }],
    });
    expect(report.passed).toBe(true);
    expect(report.gates.smoke.passed).toBe(true);
    expect(report.gates.fps.passed).toBe(true);
    expect(report.gates.memory.passed).toBe(true);
    expect(report.gates.axe.passed).toBe(true);
    expect(report.browser).toBe('chromium');
    expect(Array.isArray(report.slides)).toBe(true);

    const failed = aggregateReport({
      runId: 'x', htmlPath: 'x', browser: 'chromium', strictMemory: false, durationMs: 1,
      smoke: { passed: false, page_errors: ['boom'], console_errors: [] },
      fps: { passed: true, avg_fps: 58, mode_breakdown: {} },
      memory: { passed: true, strategy: 'measure' },
      axe: { passed: true, violations_total: 0, per_slide: [] },
    });
    expect(failed.passed).toBe(false);
  });

  test('6. exitCode returns 0 for passed report, 1 for failed', () => {
    expect(exitCode({ passed: true })).toBe(0);
    expect(exitCode({ passed: false })).toBe(1);
    expect(exitCode(null)).toBe(1);
    expect(exitCode(undefined)).toBe(1);
  });

  test('7. detectMemoryStrategy — chromium=measure, firefox=skip_warn, firefox+strict=fail', () => {
    expect(detectMemoryStrategy('chromium', false)).toBe('measure');
    expect(detectMemoryStrategy('chromium', true)).toBe('measure');
    expect(detectMemoryStrategy('firefox', false)).toBe('skip_warn');
    expect(detectMemoryStrategy('firefox', true)).toBe('fail');
    expect(detectMemoryStrategy('webkit', false)).toBe('skip_warn');
    expect(detectMemoryStrategy('webkit', true)).toBe('fail');
  });

  test('8. sampleFps FSM: open → transitionend closes with mode=transitionend; open → timeout closes with mode=continuous_fallback', () => {
    // Path A: transitionend closes first
    const a = sampleFps();
    a.step({ type: 'open', at: 0 });
    a.step({ type: 'frame', dt: 16.67 });
    a.step({ type: 'frame', dt: 16.67 });
    a.step({ type: 'transitionend', at: 300 });
    expect(a.state.mode).toBe('transitionend');
    expect(a.state.closed).toBe(true);
    expect(a.state.frames.length).toBe(2);
    // subsequent events ignored when closed
    a.step({ type: 'frame', dt: 16 });
    expect(a.state.frames.length).toBe(2);

    // Path B: timeout fires first (no transitionend)
    const b = sampleFps();
    b.step({ type: 'open', at: 0 });
    b.step({ type: 'frame', dt: 16.67 });
    b.step({ type: 'timeout', at: 1000 });
    expect(b.state.mode).toBe('continuous_fallback');
    expect(b.state.closed).toBe(true);

    // Path C: timeout after transitionend is no-op (first event wins)
    const c = sampleFps();
    c.step({ type: 'open', at: 0 });
    c.step({ type: 'transitionend', at: 400 });
    c.step({ type: 'timeout', at: 1000 });
    expect(c.state.mode).toBe('transitionend');
  });
});
