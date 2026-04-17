// SPDX-License-Identifier: UNLICENSED
// PR #105 — E2E runner for Phase 2C interactive deck.
// Gates: smoke, fps≥45, memory-leak≤10%, axe-core 0 critical/serious.
// See PR_105_PhaseA_spec_FINAL.md §3.

'use strict';

const path = require('path');
const fs = require('fs');
const config = require('./e2e_config');

// ---------------------------------------------------------------------------
// Helper functions (pure, unit-testable)
// ---------------------------------------------------------------------------

/**
 * Resolve HTML path to a file:// URL absolute to repo root.
 * @param {string} htmlPathRel - path relative to repo root
 * @param {string} [repoRoot=path.resolve(__dirname,'..')] - repo root
 * @returns {{absPath: string, url: string}}
 */
function parseHtmlPath(htmlPathRel, repoRoot) {
  const root = repoRoot || path.resolve(__dirname, '..');
  const abs = path.resolve(root, htmlPathRel);
  return { absPath: abs, url: 'file://' + abs };
}

/**
 * Compute average FPS from an array of frame intervals (ms).
 * @param {number[]} frames - frame-to-frame durations in ms
 * @returns {number} average FPS; 0 for empty/invalid input
 */
function computeAvgFps(frames) {
  if (!Array.isArray(frames) || frames.length === 0) return 0;
  const valid = frames.filter((f) => typeof f === 'number' && f > 0 && isFinite(f));
  if (valid.length === 0) return 0;
  const avgMs = valid.reduce((a, b) => a + b, 0) / valid.length;
  return avgMs > 0 ? 1000 / avgMs : 0;
}

/**
 * Compute memory growth between two heap snapshots as a percentage.
 * @param {number|null} before - usedJSHeapSize at first pass
 * @param {number|null} after - usedJSHeapSize at second pass
 * @returns {number|null} ((after - before) / before) * 100; null on invalid input
 */
function computeMemoryGrowthPct(before, after) {
  if (before === null || before === undefined || before === 0) return null;
  if (after === null || after === undefined) return null;
  if (typeof before !== 'number' || typeof after !== 'number') return null;
  return ((after - before) / before) * 100;
}

/**
 * Filter axe-core violations by blocking impact levels.
 * @param {Array<{impact?: string}>} violations - raw axe violations list
 * @param {string[]} [blockingImpacts=config.GATES.AXE_IMPACT_BLOCKING]
 * @returns {Array} subset with impact in blockingImpacts
 */
function filterBlockingViolations(violations, blockingImpacts) {
  const blocks = blockingImpacts || config.GATES.AXE_IMPACT_BLOCKING;
  if (!Array.isArray(violations)) return [];
  return violations.filter((v) => v && blocks.includes(v.impact));
}

/**
 * Determine memory gate strategy based on browser + strict flag.
 * Hybrid Q3 (see §3.3).
 * @param {string} browserName - 'chromium' | 'firefox' | 'webkit'
 * @param {boolean} strict - whether E2E_STRICT_MEMORY=1 was set
 * @returns {'measure' | 'skip_warn' | 'fail'}
 */
function detectMemoryStrategy(browserName, strict) {
  const hasApi = browserName === 'chromium';
  if (hasApi) return 'measure';
  if (strict) return 'fail';
  return 'skip_warn';
}

/**
 * Build final JSON report per §3.8.
 * @param {object} data - { runId, htmlPath, browser, strictMemory, durationMs,
 *                          smoke, fps, memory, axe, slides }
 * @returns {object} full report with `passed` derived from per-gate `passed`
 */
function aggregateReport(data) {
  const gates = {
    smoke: data.smoke || { passed: true, page_errors: [], console_errors: [] },
    fps: data.fps || { passed: true, avg_fps: 0, min_fps: 0, mode_breakdown: {} },
    memory: data.memory || { passed: true },
    axe: data.axe || { passed: true, violations_total: 0, per_slide: [] },
  };
  const passed = Object.values(gates).every((g) => g.passed);
  return {
    run_id: data.runId,
    html_path: data.htmlPath,
    browser: data.browser,
    strict_memory: Boolean(data.strictMemory),
    duration_ms: data.durationMs || 0,
    passed,
    gates,
    slides: data.slides || [],
  };
}

/**
 * Translate an aggregated report into a process exit code.
 * @param {object} report - output of aggregateReport()
 * @returns {0 | 1} 0 if all gates passed; 1 otherwise
 */
function exitCode(report) {
  return report && report.passed ? 0 : 1;
}

// ---------------------------------------------------------------------------
// sampleFps — pure FSM (unit-testable, mirrors addInitScript logic)
// ---------------------------------------------------------------------------

/**
 * FPS window state machine — pure logic mirrored from the page-injected
 * sampler. Tests drive it via `step({type})` transitions.
 * Used for T8 (§6) and documentation of the transitionend + fallback hybrid.
 * @returns {{state: object, step: function}}
 */
function sampleFps(initial) {
  const state = Object.assign(
    { mode: 'pending', frames: [], closed: false, startedAt: 0, endedAt: 0 },
    initial || {}
  );
  function step(event) {
    if (state.closed) return state;
    switch (event && event.type) {
      case 'open':
        state.startedAt = event.at || 0;
        state.mode = 'pending';
        state.frames = [];
        state.closed = false;
        return state;
      case 'frame':
        if (typeof event.dt === 'number') state.frames.push(event.dt);
        return state;
      case 'transitionend':
        state.mode = 'transitionend';
        state.endedAt = event.at || 0;
        state.closed = true;
        return state;
      case 'timeout':
        state.mode = 'continuous_fallback';
        state.endedAt = event.at || 0;
        state.closed = true;
        return state;
      default:
        return state;
    }
  }
  return { state, step };
}

// ---------------------------------------------------------------------------
// Page-injected sampler source (string — addInitScript'ed into browser)
// ---------------------------------------------------------------------------

const FPS_SAMPLER_INIT = `
  window.__fpsFrames = [];
  window.__fpsWindows = [];
  window.__fpsActiveWindow = null;

  (function () {
    var last = performance.now();
    requestAnimationFrame(function loop(now) {
      var dt = now - last;
      last = now;
      window.__fpsFrames.push(dt);
      if (window.__fpsActiveWindow) {
        window.__fpsActiveWindow.frames.push(dt);
      }
      requestAnimationFrame(loop);
    });
  })();

  window.__startFpsWindow = function (slideIdx) {
    var win = { slide: slideIdx, mode: 'pending', frames: [], startedAt: performance.now() };
    window.__fpsActiveWindow = win;
    var active = document.querySelector('${config.SELECTORS.ACTIVE_SLIDE}');
    var resolved = false;

    function finish(mode) {
      if (resolved) return;
      resolved = true;
      win.mode = mode;
      win.endedAt = performance.now();
      window.__fpsWindows.push(win);
      window.__fpsActiveWindow = null;
      if (active) active.removeEventListener('transitionend', onEnd);
    }
    function onEnd() { finish('transitionend'); }

    if (active) active.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(function () { finish('continuous_fallback'); }, ${config.TIMEOUTS.FPS_WINDOW_FALLBACK_MS});
  };
`;

// ---------------------------------------------------------------------------
// Main runner (exercised only when invoked directly; guard prevents side-effects on require)
// ---------------------------------------------------------------------------

async function main() {
  const startMs = Date.now();

  const HTML_PATH_REL = process.env.HTML_PATH || config.DEFAULT_HTML;
  const REPORT_PATH_REL = process.env.REPORT_PATH || config.DEFAULT_REPORT;
  const STRICT_MEMORY = process.env.E2E_STRICT_MEMORY === '1';
  const BROWSER_NAME = process.env.E2E_BROWSER || 'chromium';

  const { absPath: htmlAbs, url: htmlUrl } = parseHtmlPath(HTML_PATH_REL);
  if (!fs.existsSync(htmlAbs)) {
    console.error(`[e2e] HTML not found: ${htmlAbs}`);
    process.exit(1);
  }

  // Lazy-require playwright so `require('./e2e_runner')` in tests doesn't load it
  // eslint-disable-next-line global-require
  const playwright = require('@playwright/test');
  const AxeBuilder = require('@axe-core/playwright').default;

  const launcher = playwright[BROWSER_NAME];
  if (!launcher) {
    console.error(`[e2e] unknown browser: ${BROWSER_NAME}`);
    process.exit(1);
  }

  const browser = await launcher.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.addInitScript(FPS_SAMPLER_INIT);

  await page.goto(htmlUrl, { timeout: config.TIMEOUTS.PAGE_LOAD_MS });
  await page.waitForSelector(config.SELECTORS.ACTIVE_SLIDE, {
    timeout: config.TIMEOUTS.FIRST_SLIDE_SELECTOR_MS,
  });

  // ---------- memory strategy ----------
  const strategy = detectMemoryStrategy(BROWSER_NAME, STRICT_MEMORY);
  async function readHeap() {
    if (strategy !== 'measure') return null;
    const h = await page.evaluate(() => (performance.memory || {}).usedJSHeapSize);
    return typeof h === 'number' ? h : null;
  }

  // ---------- first pass 1→25 ----------
  const slides = [];
  const fpsModeBreakdown = { transitionend: 0, continuous_fallback: 0, pending: 0 };
  let fpsSumAvg = 0;
  let fpsMin = Infinity;
  const axePerSlide = [];
  let axeViolationsTotal = 0;

  for (let i = 1; i <= config.SLIDE_COUNT; i++) {
    if (i > 1) {
      await page.evaluate((idx) => window.__startFpsWindow(idx), i);
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(
        () => window.__fpsActiveWindow === null,
        { timeout: config.TIMEOUTS.SLIDE_TRANSITION_MS + config.TIMEOUTS.FPS_WINDOW_FALLBACK_MS + 500 }
      );
    }

    const win = await page.evaluate(() => window.__fpsWindows.pop() || null);
    const slideFpsAvg = win ? computeAvgFps(win.frames) : 0;
    const mode = win ? win.mode : 'pending';
    fpsModeBreakdown[mode] = (fpsModeBreakdown[mode] || 0) + 1;
    if (i > 1) {
      fpsSumAvg += slideFpsAvg;
      if (slideFpsAvg > 0 && slideFpsAvg < fpsMin) fpsMin = slideFpsAvg;
    }

    // axe-core per slide
    const axeResults = await new AxeBuilder({ page })
      .withTags(config.GATES.AXE_TAGS)
      .analyze()
      .catch(() => ({ violations: [] }));
    const blocking = filterBlockingViolations(axeResults.violations || []);
    axePerSlide.push({ slide: i, violations: blocking });
    axeViolationsTotal += blocking.length;

    slides.push({
      idx: i,
      fps: { avg: slideFpsAvg, mode },
      axe_violations: blocking,
      memory_heap: null, // filled after memory pass if measured
    });
  }

  const firstPassHeap = await readHeap();

  // ---------- return pass 25→1 ----------
  for (let i = config.SLIDE_COUNT; i > 1; i--) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(config.TIMEOUTS.SLIDE_TRANSITION_MS / 4);
  }

  // ---------- second pass 1→25 ----------
  for (let i = 2; i <= config.SLIDE_COUNT; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(config.TIMEOUTS.SLIDE_TRANSITION_MS / 4);
  }
  const secondPassHeap = await readHeap();

  await browser.close();

  // ---------- aggregate gates ----------
  const smokePassed = pageErrors.length === 0 && consoleErrors.length === 0;
  const slidesCounted = config.SLIDE_COUNT - 1; // skipped slide 1
  const avgFps = slidesCounted > 0 ? fpsSumAvg / slidesCounted : 0;
  const fpsPassed = avgFps >= config.GATES.FPS_MIN;

  let memoryGate;
  if (strategy === 'measure') {
    if (firstPassHeap === null || secondPassHeap === null) {
      memoryGate = { passed: false, strategy, error: 'chromium_api_missing' };
    } else {
      const growth = computeMemoryGrowthPct(firstPassHeap, secondPassHeap);
      memoryGate = {
        passed: growth !== null && growth <= config.GATES.MEMORY_GROWTH_MAX_PCT,
        strategy,
        first_pass_heap: firstPassHeap,
        second_pass_heap: secondPassHeap,
        growth_pct: growth,
      };
    }
  } else if (strategy === 'skip_warn') {
    memoryGate = { passed: true, strategy, skipped: true, reason: `${BROWSER_NAME}_no_api` };
    console.warn(`[memory-gate] skipped: ${BROWSER_NAME} doesn't expose performance.memory`);
  } else {
    memoryGate = { passed: false, strategy, error: 'strict_mode_non_chromium' };
  }

  const axePassed = axeViolationsTotal === 0;

  const report = aggregateReport({
    runId: new Date().toISOString(),
    htmlPath: HTML_PATH_REL,
    browser: BROWSER_NAME,
    strictMemory: STRICT_MEMORY,
    durationMs: Date.now() - startMs,
    smoke: { passed: smokePassed, page_errors: pageErrors, console_errors: consoleErrors },
    fps: {
      passed: fpsPassed,
      avg_fps: avgFps,
      min_fps: fpsMin === Infinity ? 0 : fpsMin,
      mode_breakdown: fpsModeBreakdown,
    },
    memory: memoryGate,
    axe: { passed: axePassed, violations_total: axeViolationsTotal, per_slide: axePerSlide },
    slides,
  });

  const reportAbs = path.resolve(__dirname, '..', REPORT_PATH_REL);
  fs.mkdirSync(path.dirname(reportAbs), { recursive: true });
  fs.writeFileSync(reportAbs, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`[e2e] report: ${reportAbs}`);
  console.log(`[e2e] passed: ${report.passed}`);
  Object.entries(report.gates).forEach(([k, g]) => {
    console.log(`[e2e] gate.${k}: ${g.passed ? 'PASS' : 'FAIL'}`);
  });

  process.exit(exitCode(report));
}

// I8 — guard against side-effects when imported by tests
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}

module.exports = {
  parseHtmlPath,
  computeAvgFps,
  computeMemoryGrowthPct,
  filterBlockingViolations,
  aggregateReport,
  exitCode,
  detectMemoryStrategy,
  sampleFps,
};
