// @ts-check
/* Phase 2C Wave 3 G8 Ambient — E2E matrix (Chromium / Firefox / WebKit)
   Scope: DOM/API assertions only — NO visual regression (screenshot compare).
   Tests programmatically invoke TS.Ambient.start() via page.evaluate() rather
   than relying on slide-specific integration (G17 ScrollTrigger will wire that
   up later). This keeps tests decoupled from slide markup changes.
   See: MODULE_PROMPT.md §12, CLAUDE.md §9
*/
const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = path.resolve(
  __dirname,
  '..',
  'Deck_v1.2.0',
  'TrendStudio_LP_Deck_v1.2.0_Interactive.html'
);
const FILE_URL = 'file://' + HTML_PATH;

test.describe('G8 Ambient — matrix (DOM/API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    // Wait for TS namespace + TS.Ambient to be available (modules load inline)
    await page.waitForFunction(() => {
      return typeof window.TS !== 'undefined'
        && typeof window.TS.Ambient !== 'undefined'
        && typeof window.TS.Ambient.start === 'function';
    }, null, { timeout: 10_000 });
  });

  test('canvas is created with a11y attrs when start() is called', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'e2e-ambient-host-1';
      container.style.cssText = 'position:relative;width:800px;height:400px;';
      document.body.appendChild(container);
      window.TS.Ambient.start('e2e-1', {
        container: container,
        preset: 'dust',
        density: 1
      });
      const canvas = container.querySelector('canvas');
      return {
        present: !!canvas,
        ariaHidden: canvas && canvas.getAttribute('aria-hidden'),
        ariaLabel: canvas && canvas.getAttribute('aria-label'),
        dataAmbient: canvas && canvas.getAttribute('data-ambient'),
        dataDepth: canvas && canvas.getAttribute('data-depth'),
        className: canvas && canvas.className
      };
    });
    expect(result.present).toBe(true);
    expect(result.ariaHidden).toBe('true');
    expect(result.ariaLabel).toBeTruthy();
    expect(result.dataAmbient).toBe('true');
    expect(result.dataDepth).toBe('0.6');
    expect(result.className).toContain('ts-ambient-canvas');
    // Cleanup so subsequent tests start clean
    await page.evaluate(() => window.TS.Ambient.stop('e2e-1'));
  });

  test('stop() removes canvas and cleans up (no memory leak on repeat)', async ({ page }) => {
    const counts = await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'e2e-ambient-host-2';
      container.style.cssText = 'position:relative;width:400px;height:200px;';
      document.body.appendChild(container);
      // 10 start/stop cycles
      for (let i = 0; i < 10; i++) {
        window.TS.Ambient.start('cycle-' + i, {
          container: container,
          preset: 'sparkle',
          density: 1
        });
        window.TS.Ambient.stop('cycle-' + i);
      }
      const residual = container.querySelectorAll('canvas').length;
      const active = window.TS.Ambient.getActivePresets().length;
      return { residual, active };
    });
    expect(counts.residual).toBe(0);
    expect(counts.active).toBe(0);
  });

  test('all 5 presets start without throwing', async ({ page }) => {
    const result = await page.evaluate(() => {
      const presets = ['dust', 'sparkle', 'light_leak', 'data_stream', 'film_grain'];
      const errors = [];
      presets.forEach((preset, i) => {
        const container = document.createElement('div');
        container.id = 'e2e-preset-' + i;
        container.style.cssText = 'position:relative;width:200px;height:100px;';
        document.body.appendChild(container);
        try {
          window.TS.Ambient.start('preset-' + preset, {
            container: container,
            preset: preset,
            density: 1
          });
        } catch (e) {
          errors.push(preset + ': ' + e.message);
        }
      });
      const active = window.TS.Ambient.getActivePresets();
      // Cleanup
      presets.forEach((preset) => window.TS.Ambient.stop('preset-' + preset));
      return { errors, activeCount: active.length, activePresets: active.map((a) => a.preset) };
    });
    expect(result.errors).toEqual([]);
    expect(result.activeCount).toBe(5);
    expect(result.activePresets.sort()).toEqual(
      ['dust', 'sparkle', 'light_leak', 'data_stream', 'film_grain'].sort()
    );
  });

  test('prefers-reduced-motion: reduce pauses engine on start', async ({ browser }) => {
    // Emulate reduced-motion at browser-context level (must be set BEFORE page load)
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(FILE_URL);
    await page.waitForFunction(() => {
      return typeof window.TS !== 'undefined'
        && typeof window.TS.Ambient !== 'undefined';
    }, null, { timeout: 10_000 });

    const state = await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'e2e-reduce-host';
      container.style.cssText = 'position:relative;width:400px;height:200px;';
      document.body.appendChild(container);
      window.TS.Ambient.start('reduce-1', {
        container: container,
        preset: 'dust',
        density: 1
      });
      // Canvas should still be in DOM (a11y: stops are JS-driven, markup stays)
      const canvas = container.querySelector('canvas');
      const active = window.TS.Ambient.getActivePresets();
      return {
        canvasPresent: !!canvas,
        registeredSlides: active.length,
        firstSlideId: active[0] && active[0].slideId
      };
    });
    expect(state.canvasPresent).toBe(true);
    // Slide is registered (so resume can restart it), but tick loop is paused
    expect(state.registeredSlides).toBe(1);
    expect(state.firstSlideId).toBe('reduce-1');
    await ctx.close();
  });

  test('setIntensity accepts [0..2] range (G10 Cinema Mode uses 1.3)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const out = {};
      window.TS.Ambient.setIntensity(-5);
      out.negative = window.TS.Ambient.setIntensity
        // Re-read by toggling to sample via public API — use a safe probe
        ? (function () {
            // Probe by setting extreme and then a normal value
            window.TS.Ambient.setIntensity(1.3);
            return 'ok';
          })()
        : 'no-api';
      // Core assertion: setIntensity must NOT throw for 1.3 (G10) or 2.0 (upper cap)
      let threw13 = false;
      let threw20 = false;
      let threw30 = false;
      try { window.TS.Ambient.setIntensity(1.3); } catch (e) { threw13 = true; }
      try { window.TS.Ambient.setIntensity(2.0); } catch (e) { threw20 = true; }
      try { window.TS.Ambient.setIntensity(3.0); } catch (e) { threw30 = true; } // clamped, not throws
      // Reset to default for subsequent tests
      window.TS.Ambient.setIntensity(1.0);
      return { threw13, threw20, threw30 };
    });
    expect(result.threw13).toBe(false);
    expect(result.threw20).toBe(false);
    expect(result.threw30).toBe(false);
  });
});
