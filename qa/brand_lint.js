#!/usr/bin/env node
/* S35: BrandGuard lint — checks HTML + JS files for brand violations.
   Usage: node qa/brand_lint.js --src src/ --out qa_reports/brand_lint_phase1.json
   Owner: S35 */

'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let srcDir = 'src';
let outFile = 'qa_reports/brand_lint_phase1.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' && args[i+1]) srcDir = args[i+1];
  if (args[i] === '--out' && args[i+1]) outFile = args[i+1];
}

const violations = [];

const PROHIBITED_WORDS = [
  { pattern: /гарантированн\w*\s+доход/gi, rule: 'BRAND-001', msg: 'Prohibited: "guaranteed return" language' },
  { pattern: /безрисков\w*/gi, rule: 'BRAND-002', msg: 'Prohibited: "risk-free" claim' },
  { pattern: /обещаем/gi, rule: 'BRAND-003', msg: 'Prohibited: "we promise"' },
  { pattern: /100%\s*вероятност/gi, rule: 'BRAND-004', msg: 'Prohibited: "100% probability"' },
  { pattern: /лучший\s+фонд/gi, rule: 'BRAND-005', msg: 'Prohibited: "best fund" without source' },
];

const SECURITY_CHECKS = [
  { pattern: /\beval\s*\(/g, rule: 'SEC-001', msg: 'Security: eval() usage' },
  { pattern: /new\s+Function\s*\(/g, rule: 'SEC-002', msg: 'Security: new Function() usage' },
];

const BRAND_CHECKS = [
  { pattern: /font-family:\s*['"]?Arial/gi, rule: 'BRAND-010', msg: 'Wrong font: use Inter/Georgia/JetBrains Mono' },
  { pattern: /#fff(?:fff)?(?:\b|;)/gi, rule: 'BRAND-011', msg: 'Use --text-primary (#F5F5F5) instead of pure white' },
];

function walkDir(dir, ext) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...walkDir(full, ext));
    } else if (ext.some(e => item.name.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

function checkFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const allChecks = [...PROHIBITED_WORDS, ...SECURITY_CHECKS, ...BRAND_CHECKS];

  for (const check of allChecks) {
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(check.pattern);
      if (matches) {
        violations.push({
          file: filepath,
          line: i + 1,
          rule: check.rule,
          msg: check.msg,
          match: matches[0]
        });
      }
    }
  }
}

// Check src/ files
const srcFiles = walkDir(srcDir, ['.js', '.html', '.css']);
srcFiles.forEach(checkFile);

// Also check the built HTML if it exists
const builtHtml = path.join('Deck_v1.2.0', 'TrendStudio_LP_Deck_v1.2.0_Interactive.html');
if (fs.existsSync(builtHtml)) {
  checkFile(builtHtml);
}

// Write report
const report = {
  timestamp: new Date().toISOString(),
  files_checked: srcFiles.length + (fs.existsSync(builtHtml) ? 1 : 0),
  violations: violations,
  total_violations: violations.length,
  status: violations.length === 0 ? 'PASS' : 'FAIL'
};

const outDir = path.dirname(outFile);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log(`BrandGuard: ${report.files_checked} files checked, ${report.total_violations} violations`);
if (violations.length > 0) {
  violations.forEach(v => console.log(`  ${v.rule} ${v.file}:${v.line} — ${v.msg} [${v.match}]`));
  process.exit(1);
} else {
  console.log('  PASS: 0 violations');
  process.exit(0);
}
