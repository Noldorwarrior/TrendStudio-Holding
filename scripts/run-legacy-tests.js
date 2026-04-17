#!/usr/bin/env node
/**
 * scripts/run-legacy-tests.js — runs Phase 2A/2B self-contained node tests.
 *
 * Mixed runner mode approved by Cowork 2026-04-17:
 * Phase 2A/2B tests use custom assert + jsdom shim, not jest. This
 * runner spawns them in sequence and aggregates pass/fail counts.
 * Full jest migration deferred to post-Wave-6 Chore-PR to avoid
 * regression risk of the 350-assertion safety-net before the LP
 * meeting on 29 April 2026.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob') || null;  // glob may not be installed; fall back below

const ROOT = path.resolve(__dirname, '..');

// Legacy test files (Phase 2A + Phase 2B, executed via `node <file>`).
const LEGACY_TESTS = [
  'src/components.test.js',
  'src/charts.test.js',
  // Chart impls (7 files)
  'src/charts/revenue.test.js',
  'src/charts/ebitda.test.js',
  'src/charts/irr_sensitivity.test.js',
  'src/charts/pipeline_gantt.test.js',
  'src/charts/cashflow.test.js',
  'src/charts/mc_distribution.test.js',
  'src/charts/peers.test.js',
  // Phase 2B infra
  'src/controls.test.js',
  'src/drilldown.test.js',
  // E2E
  'tests/e2e_phase2b.js'
];

let totalPassed = 0;
let totalFailed = 0;
let filesRun = 0;
let filesSkipped = 0;

for (const rel of LEGACY_TESTS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.log(`SKIP: ${rel} (not present on this branch)`);
    filesSkipped++;
    continue;
  }
  const result = spawnSync('node', [full], { encoding: 'utf-8' });
  const out = (result.stdout || '') + '\n' + (result.stderr || '');

  const passMatch = out.match(/(?:Passed|PASSED):\s*(\d+)/);
  const failMatch = out.match(/(?:Failed|FAILED):\s*(\d+)/);
  const p = passMatch ? parseInt(passMatch[1], 10) : 0;
  const f = failMatch ? parseInt(failMatch[1], 10) : 0;

  if (result.status !== 0 && f === 0) {
    console.error(`FAIL: ${rel} (exit ${result.status})`);
    console.error(out.trim().split('\n').slice(-10).join('\n'));
    totalFailed++;
    filesRun++;
    continue;
  }

  totalPassed += p;
  totalFailed += f;
  filesRun++;
  const status = f === 0 ? 'OK ' : 'FAIL';
  console.log(`${status} ${rel}: ${p} passed, ${f} failed`);
}

console.log('');
console.log(`Legacy runner summary: ${totalPassed} passed / ${totalFailed} failed across ${filesRun} files (${filesSkipped} skipped)`);

process.exit(totalFailed > 0 ? 1 : 0);
