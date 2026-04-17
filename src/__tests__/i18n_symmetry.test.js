/**
 * i18n symmetry test — enforces RU ↔ EN parity for all translation keys.
 * Covers Phase 2A/2B (450 keys) + Phase 2C (+80 = 530).
 *
 * Keys are flat (top-level dotted strings), per Phase 2A/2B convention.
 * I18N.t() lookup is dict[key] (see src/i18n.js:77).
 */

const ru = require('../../i18n/ru.json');
const en = require('../../i18n/en.json');

const ruKeys = Object.keys(ru);
const enKeys = Object.keys(en);

describe('i18n symmetry', () => {
  test('key counts match', () => {
    expect(ruKeys.length).toBe(enKeys.length);
  });

  test('every RU key has EN counterpart', () => {
    const missing = ruKeys.filter((k) => !(k in en));
    expect(missing).toEqual([]);
  });

  test('every EN key has RU counterpart', () => {
    const missing = enKeys.filter((k) => !(k in ru));
    expect(missing).toEqual([]);
  });

  test('placeholder symmetry (excluding [EN:*] stubs)', () => {
    // {name}/{n}/{label}/{value}-style params must be present in both RU and EN.
    // Exception: [EN:*] stubs (Phase 2A legacy, yellow flag #26, scope Phase 2D)
    // — they are unvalidated placeholders awaiting native-speaker polish.
    const phRegex = /\{[a-z_]+\}/g;
    const isEnStub = (v) => typeof v === 'string' && /^\[EN:/.test(v);
    const mismatches = ruKeys.filter((k) => {
      if (isEnStub(en[k])) return false; // stubbed key — skip placeholder check
      const rp = (ru[k].match(phRegex) || []).sort().join(',');
      const ep = ((en[k] || '').match(phRegex) || []).sort().join(',');
      return rp !== ep;
    });
    expect(mismatches).toEqual([]);
  });

  test('no new [EN:*] stubs in Phase 2C namespaces', () => {
    // Phase 2C keys (ui.cinematic.*, a11y.cinematic.*, ui.slide.phase2c.*)
    // must have real EN translations, not stubs.
    const phase2cPrefixes = ['ui.cinematic.', 'a11y.cinematic.', 'ui.slide.phase2c.'];
    const stubs = ruKeys.filter((k) =>
      phase2cPrefixes.some((p) => k.startsWith(p)) &&
      typeof en[k] === 'string' &&
      /^\[EN:/.test(en[k])
    );
    expect(stubs).toEqual([]);
  });

  test('no duplicate keys in raw JSON text', () => {
    // JSON.parse silently resolves duplicates (last-wins). Detect by counting
    // "key": patterns in the raw file text and comparing to parsed key count.
    const fs = require('fs');
    const path = require('path');
    const ruRaw = fs.readFileSync(path.resolve(__dirname, '../../i18n/ru.json'), 'utf8');
    const enRaw = fs.readFileSync(path.resolve(__dirname, '../../i18n/en.json'), 'utf8');
    // Match "...":"..." style top-level keys. Regex tuned for flat dict —
    // counts every quoted-colon pair on its own logical line.
    const ruMatches = ruRaw.match(/^\s*"[^"]+":\s/gm) || [];
    const enMatches = enRaw.match(/^\s*"[^"]+":\s/gm) || [];
    expect(ruMatches.length).toBe(ruKeys.length);
    expect(enMatches.length).toBe(enKeys.length);
  });
});
