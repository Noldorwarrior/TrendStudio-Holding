/**
 * whatif_formulas.json schema + structural validation (PR #104, Phase 2C Wave 2).
 *
 * 6 tests per FINAL spec §9:
 *   1. Schema validity via ajv (draft 2020-12).
 *   2. Every input's baseline within valid_range.
 *   3. Every valid_range is ascending (lo < hi).
 *   4. Exactly 3 top-level formula blocks (fixed keys).
 *   5. All `*_i18n_key` strings match the allowed namespace regex.
 *   6. Every `caveat_i18n_key` exists in both ru.json and en.json.
 *
 * Runs under jest.config.js testMatch `src/__tests__/*.test.js`.
 * Requires `ajv` devDep (installed in Step 7 of PR #104 workflow).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const FORMULAS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'i18n', 'whatif_formulas.json'), 'utf8')
);
const SCHEMA = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'i18n', 'whatif_formulas.schema.json'), 'utf8')
);
const RU = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'ru.json'), 'utf8'));
const EN = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'en.json'), 'utf8'));

const EXPECTED_BLOCKS = ['slide14_wacc', 'slide17_mc_shift', 'slide12_unit_economics'];
const I18N_KEY_REGEX =
  /^(ui\.chart\.|ui\.cinematic\.whatif\.|a11y\.cinematic\.whatif\.)/;

describe('whatif_formulas.json', () => {
  test('1. valid against schema (ajv draft 2020-12)', () => {
    // Lazy-require ajv so that the suite file itself still parses even if the
    // module is not yet installed at pre-commit/pre-push time (CI installs it
    // via `npm ci` from lockfile before invoking jest).
    const Ajv2020 = require('ajv/dist/2020');
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    const validate = ajv.compile(SCHEMA);
    const valid = validate(FORMULAS);
    if (!valid) {
      // eslint-disable-next-line no-console
      console.error('ajv errors:', JSON.stringify(validate.errors, null, 2));
    }
    expect(valid).toBe(true);
  });

  test('2. every input baseline within valid_range', () => {
    const violations = [];
    for (const [blockKey, block] of Object.entries(FORMULAS)) {
      for (const [inputKey, input] of Object.entries(block.inputs || {})) {
        if (input.baseline === null || input.baseline === undefined) continue;
        const [lo, hi] = input.valid_range;
        if (!(lo <= input.baseline && input.baseline <= hi)) {
          violations.push(
            `${blockKey}.inputs.${inputKey}: baseline ${input.baseline} not in [${lo}, ${hi}]`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('3. all valid_range arrays ascending (lo < hi)', () => {
    const violations = [];
    for (const [blockKey, block] of Object.entries(FORMULAS)) {
      for (const [inputKey, input] of Object.entries(block.inputs || {})) {
        const [lo, hi] = input.valid_range;
        if (!(lo < hi)) {
          violations.push(
            `${blockKey}.inputs.${inputKey}: range [${lo}, ${hi}] not ascending`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('4. exactly 3 top-level formula blocks', () => {
    const actual = Object.keys(FORMULAS).sort();
    const expected = [...EXPECTED_BLOCKS].sort();
    expect(actual).toEqual(expected);
  });

  test('5. all *_i18n_key strings match namespace regex', () => {
    const violations = [];
    const visit = (node, prefix) => {
      if (!node || typeof node !== 'object') return;
      for (const [k, v] of Object.entries(node)) {
        const where = `${prefix}.${k}`;
        if (typeof v === 'string' && k.endsWith('_i18n_key')) {
          if (!I18N_KEY_REGEX.test(v)) violations.push(`${where} = ${v}`);
        } else if (v && typeof v === 'object' && !Array.isArray(v)) {
          visit(v, where);
        }
      }
    };
    for (const [blockKey, block] of Object.entries(FORMULAS)) {
      visit(block, blockKey);
    }
    expect(violations).toEqual([]);
  });

  test('6. all caveat_i18n_key exist in both ru.json and en.json', () => {
    const missing = [];
    for (const [blockKey, block] of Object.entries(FORMULAS)) {
      const key = block.caveat_i18n_key;
      if (!RU[key]) missing.push(`ru.json missing ${blockKey}.caveat_i18n_key=${key}`);
      if (!EN[key]) missing.push(`en.json missing ${blockKey}.caveat_i18n_key=${key}`);
    }
    expect(missing).toEqual([]);
  });
});
