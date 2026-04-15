// @ts-check
/* S30: QA Playwright suite — Phase 1 gates
   Runs against built HTML file. */
const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, '..', 'Deck_v1.2.0', 'TrendStudio_LP_Deck_v1.2.0_Interactive.html');
const FILE_URL = 'file://' + HTML_PATH;

test.describe('Phase 1 QA Gates', () => {

  test('G1: All 25 slides present', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);
    for (let i = 1; i <= 25; i++) {
      const slide = page.locator('#slide-' + i);
      await expect(slide).toBeAttached();
    }
  });

  test('G2: Navigation works (forward/backward)', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    // Slide 1 visible
    const s1 = page.locator('#slide-1');
    await expect(s1).toBeVisible();

    // Press ArrowRight to go to slide 2
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    const s2 = page.locator('#slide-2');
    await expect(s2).toBeVisible();
    await expect(s1).toBeHidden();

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    await expect(s1).toBeVisible();
  });

  test('G3: No console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(FILE_URL);
    await page.waitForTimeout(1000);
    // Filter out known non-critical warnings
    const real_errors = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    expect(real_errors).toHaveLength(0);
  });

  test('G4: No failed network requests', async ({ page }) => {
    const failures = [];
    page.on('requestfailed', req => {
      if (!req.url().includes('favicon')) {
        failures.push(req.url());
      }
    });
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    expect(failures).toHaveLength(0);
  });

  test('G5: Canvas a11y — all canvases labeled', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    // Walk all slides to trigger chart rendering
    for (let i = 1; i <= 25; i++) {
      await page.evaluate((n) => { if (window.NAV) NAV.go(n); }, i);
      await page.waitForTimeout(100);
    }

    const unlabeled = await page.evaluate(() => {
      var canvases = document.querySelectorAll('canvas');
      var count = 0;
      canvases.forEach(function(c) {
        var hasLabel = c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby');
        var inFigure = c.closest('figure[role="img"][aria-labelledby]');
        if (!hasLabel && !inFigure) count++;
      });
      return count;
    });
    expect(unlabeled).toBe(0);
  });

  test('G6: Skip link exists', async ({ page }) => {
    await page.goto(FILE_URL);
    const skip = page.locator('#skip-link');
    await expect(skip).toBeAttached();
  });

  test('G7: Live region exists', async ({ page }) => {
    await page.goto(FILE_URL);
    const live = page.locator('#a11y-live');
    await expect(live).toBeAttached();
    const ariaLive = await live.getAttribute('aria-live');
    expect(ariaLive).toBeTruthy();
  });

  test('G8: Nav indicator updates', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    const indicator = page.locator('#nav-indicator');
    await expect(indicator).toContainText('1');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await expect(indicator).toContainText('2');
  });

  test('G9: No security violations (eval/new Function)', async ({ page }) => {
    await page.goto(FILE_URL);
    const content = await page.content();
    expect(content).not.toContain('eval(');
    expect(content).not.toContain('new Function(');
  });

  test('G10: Slide transition completes in <300ms', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    const duration = await page.evaluate(() => {
      var start = performance.now();
      NAV.go(5);
      return performance.now() - start;
    });
    expect(duration).toBeLessThan(300);
  });

  test('G11: Full slide walkthrough (25 slides, no errors)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    for (let i = 1; i <= 25; i++) {
      await page.evaluate((n) => { NAV.go(n); }, i);
      await page.waitForTimeout(150);
    }

    expect(errors).toHaveLength(0);
  });

  test('G12: Memory leak test (50 random navigations)', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(1000);

    // Get initial heap
    const initialHeap = await page.evaluate(() => {
      if (performance.memory) return performance.memory.usedJSHeapSize;
      return 0;
    });

    // If memory API not available, skip
    if (initialHeap === 0) {
      test.skip();
      return;
    }

    // 50 random navigations
    for (let i = 0; i < 50; i++) {
      const target = Math.floor(Math.random() * 25) + 1;
      await page.evaluate((n) => { NAV.go(n); }, target);
      await page.waitForTimeout(50);
    }

    // Force GC if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });
    await page.waitForTimeout(500);

    const finalHeap = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Heap should not grow >10%
    const growth = (finalHeap - initialHeap) / initialHeap;
    expect(growth).toBeLessThan(0.10);
  });
});
