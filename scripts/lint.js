#!/usr/bin/env node
/* Wrapper: runs qa/brand_lint.js with forwarded args */
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const args = process.argv.slice(2).join(' ');
const script = path.join(__dirname, '..', 'qa', 'brand_lint.js');
try {
  execSync(`node "${script}" ${args}`, { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
