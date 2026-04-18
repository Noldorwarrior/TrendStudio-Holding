// @ts-check
/* Playwright config — Phase 2C Wave 3 G8 Ambient
   Scope: e2e/*.spec.js (new matrix tests), 3 browsers, DOM/API assertions only.
   NOT included: visual regression (screenshot compare) — intentionally omitted
   per hybrid A+C plan (approved 2026-04-18). Legacy suite qa/playwright_suite.js
   is executed separately via `npm test`.
   Docs: CLAUDE.md §9, Handoff_Phase2C/10_modules/g8_ambient/MODULE_PROMPT.md §12
*/
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'qa_reports/playwright-report' }]]
    : [['list']],
  use: {
    headless: true,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } }
  ],
  outputDir: 'qa_reports/playwright-artifacts/'
});
