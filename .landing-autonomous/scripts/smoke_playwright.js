// smoke_playwright.js v1.2
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const html = process.argv[2] || path.join(process.env.REPO_ROOT || '.', 'landing_v1.0.html');
  if (!fs.existsSync(html)) { console.error('❌ HTML missing:', html); process.exit(1); }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  // Benign console.error noise we intentionally ignore (Babel informational notes, etc.)
  const BENIGN = [
    /\[BABEL\].*code generator has deoptimised/i,
    /tailwindcss\.com should not be used in production/i,
  ];
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (BENIGN.some(rx => rx.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('file://' + path.resolve(html));
  await page.waitForTimeout(3000);

  const outDir = path.dirname(html);
  const shot = path.join(outDir, `smoke_${Date.now()}.png`);
  await page.screenshot({ path: shot, fullPage: true });

  await browser.close();

  if (errors.length > 0) {
    console.error(`❌ ${errors.length} runtime errors:`);
    errors.forEach(e => console.error('  ', e));
    process.exit(1);
  }
  console.log(`✅ Playwright smoke OK (screenshot: ${path.basename(shot)})`);
})();
