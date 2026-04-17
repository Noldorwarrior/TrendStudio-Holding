#!/usr/bin/env node
/**
 * scripts/check_budget.js — fails build if HTML exceeds budget.
 * See: Handoff_Phase2C/00_infra/INFRA_PROMPT.md §8.2
 *
 * Checks the Phase 2C output (Deck_v1.3.0/...). Falls back to Phase 2B
 * output (Deck_v1.2.0/...) during Wave 1 while v1.3.0 bundle is not yet built.
 */

const fs = require('fs');
const path = require('path');

const BUDGET = 650000;
const ROOT = path.resolve(__dirname, '..');

const CANDIDATES = [
  path.join(ROOT, 'Deck_v1.3.0', 'TrendStudio_LP_Deck_v1.3.0_Interactive.html'),
  path.join(ROOT, 'Deck_v1.2.0', 'TrendStudio_LP_Deck_v1.2.0_Interactive.html')
];

const target = CANDIDATES.find((p) => fs.existsSync(p));

if (!target) {
  console.error(`Budget check skipped: no bundled HTML found at any of:`);
  CANDIDATES.forEach((p) => console.error(`  - ${p}`));
  process.exit(0);
}

const size = fs.statSync(target).size;
const percent = ((size / BUDGET) * 100).toFixed(1);
const cushion = BUDGET - size;

console.log(`Checked: ${path.relative(ROOT, target)}`);
console.log(`HTML size: ${size.toLocaleString()} bytes (${percent}% of ${BUDGET.toLocaleString()}, cushion ${cushion.toLocaleString()})`);

if (size > BUDGET) {
  console.error(`BUDGET EXCEEDED by ${(size - BUDGET).toLocaleString()} bytes`);
  process.exit(1);
}

// Wave 1 soft ceiling (INFRA §14.3): 450 000 bytes — warn if over, do not fail
const WAVE1_SOFT = 450000;
if (size > WAVE1_SOFT) {
  console.warn(`WAVE 1 SOFT CEILING: ${size.toLocaleString()} > ${WAVE1_SOFT.toLocaleString()} — cushion for Waves 2-6 is below recommended 200 KB`);
}

process.exit(0);
