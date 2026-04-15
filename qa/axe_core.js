#!/usr/bin/env node
/* S30: axe-core accessibility audit
   Usage: node qa/axe_core.js
   Requires: npx playwright install chromium */
'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, '..', 'Deck_v1.2.0', 'TrendStudio_LP_Deck_v1.2.0_Interactive.html');
const OUT = path.resolve(__dirname, '..', 'qa_reports', 'axe_core_phase1.json');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('file://' + HTML_PATH);
  await page.waitForTimeout(1000);

  // Inject axe-core
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
  });

  // Run axe on all slides (make them all visible temporarily)
  const results = await page.evaluate(async () => {
    // Show all slides
    document.querySelectorAll('.slide[hidden]').forEach(s => {
      s.removeAttribute('hidden');
      s.style.position = 'relative';
      s.style.height = 'auto';
    });

    return await axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'best-practice'],
      resultTypes: ['violations']
    });
  });

  await browser.close();

  const serious = results.violations.filter(v => v.impact === 'serious');
  const critical = results.violations.filter(v => v.impact === 'critical');

  const report = {
    timestamp: new Date().toISOString(),
    total_violations: results.violations.length,
    serious_count: serious.length,
    critical_count: critical.length,
    status: (serious.length === 0 && critical.length === 0) ? 'PASS' : 'FAIL',
    violations: results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes_count: v.nodes.length,
      help: v.helpUrl
    }))
  };

  const outDir = path.dirname(OUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

  console.log(`axe-core: ${report.total_violations} violations (${report.serious_count} serious, ${report.critical_count} critical)`);
  console.log(`Status: ${report.status}`);

  if (report.status === 'FAIL') {
    serious.concat(critical).forEach(v => {
      console.log(`  ${v.impact.toUpperCase()}: ${v.id} — ${v.description} (${v.nodes.length} nodes)`);
    });
    process.exit(1);
  }
}

run().catch(err => {
  console.error('axe-core error:', err);
  process.exit(1);
});
