/**
 * Unit tests for src/landing/styles/tokens.json + tokens.css
 * Run: node --test src/landing/styles/__tests__/tokens.test.js
 *
 * Проверяется:
 *   1. tokens.json соответствует shadows_of_sunset_v1 схеме
 *   2. tokens.css содержит все CSS custom properties, точно соответствующие JSON
 *   3. Все hex-цвета валидны
 *   4. WCAG 2.1 контрасты: все заявленные пары проходят min_ratio
 *   5. INV-06: в CSS нет localStorage / eval / new Function / @import url(
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = resolve(__dirname, '..', 'tokens.json');
const CSS_PATH  = resolve(__dirname, '..', 'tokens.css');

const tokens = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const css    = readFileSync(CSS_PATH, 'utf8');

// ──────────────────────────────────────────────────────────────────────────
// WCAG helpers (WCAG 2.1 relative luminance + contrast ratio)
// ──────────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) throw new Error(`Bad hex: ${hex}`);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function relLum([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrast(hex1, hex2) {
  const L1 = relLum(hexToRgb(hex1));
  const L2 = relLum(hexToRgb(hex2));
  const lighter = Math.max(L1, L2);
  const darker  = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ──────────────────────────────────────────────────────────────────────────
// CSS parser — извлекает custom properties из :root { ... }
// ──────────────────────────────────────────────────────────────────────────
function parseCssCustomProperties(cssText) {
  // Берём первый блок :root { ... }
  const m = cssText.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) throw new Error('No :root block found');
  const body = m[1];
  const out = {};
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    out[match[1]] = match[2].trim();
  }
  return out;
}
const cssVars = parseCssCustomProperties(css);

// ──────────────────────────────────────────────────────────────────────────
// 1. Schema sanity
// ──────────────────────────────────────────────────────────────────────────
test('signature shadows_of_sunset_v1', () => {
  assert.equal(tokens.signature, 'shadows_of_sunset_v1');
  assert.equal(tokens.mode, 'dark');
});

test('palette: ровно 11 цветов, все валидные #RRGGBB', () => {
  const EXPECTED = ['bg', 'bg_elevated', 'surface', 'text', 'text_muted',
    'primary', 'accent', 'bull', 'bear', 'neutral', 'border'];
  assert.deepEqual(Object.keys(tokens.palette).sort(), [...EXPECTED].sort());
  const hexRe = /^#[0-9A-F]{6}$/;
  for (const [name, value] of Object.entries(tokens.palette)) {
    assert.match(value, hexRe, `palette.${name}=${value} должен быть #RRGGBB`);
  }
});

test('shadows: 3 ключа sm/md/lg, каждая начинается с offset', () => {
  assert.deepEqual(Object.keys(tokens.shadows).sort(), ['lg', 'md', 'sm']);
  for (const [k, v] of Object.entries(tokens.shadows)) {
    assert.match(v, /^\d+\s+\d+px\s+\d+px\s+/, `shadows.${k}=${v}`);
  }
});

test('radii: 3 ключа sm/md/lg, все в px', () => {
  assert.deepEqual(Object.keys(tokens.radii).sort(), ['lg', 'md', 'sm']);
  for (const v of Object.values(tokens.radii)) {
    assert.match(v, /^\d+px$/);
  }
});

test('typography: families, scale, line_heights, weights', () => {
  assert.deepEqual(Object.keys(tokens.typography.families).sort(), ['body', 'display']);
  assert.equal(tokens.typography.families.display.name, 'Cormorant Garamond');
  assert.equal(tokens.typography.families.body.name, 'Inter');

  assert.deepEqual(Object.keys(tokens.typography.scale).sort(),
    ['body', 'caption', 'h1', 'h2', 'h3', 'h4']);
  // Fluid-значения у h1/h2/h3
  for (const k of ['h1', 'h2', 'h3']) {
    assert.match(tokens.typography.scale[k], /^clamp\(/);
  }
  // Fixed — у h4/body/caption
  for (const k of ['h4', 'body', 'caption']) {
    assert.match(tokens.typography.scale[k], /rem$/);
  }

  assert.deepEqual(tokens.typography.line_heights, { tight: 1.1, normal: 1.5, relaxed: 1.75 });
  assert.deepEqual(tokens.typography.weights,      { regular: 400, medium: 500, bold: 700 });
});

// ──────────────────────────────────────────────────────────────────────────
// 2. CSS ↔ JSON consistency
// ──────────────────────────────────────────────────────────────────────────
test('CSS: все --color-* соответствуют tokens.json.palette', () => {
  for (const [name, hex] of Object.entries(tokens.palette)) {
    const varName = '--color-' + name.replaceAll('_', '-');
    assert.ok(cssVars[varName], `CSS не содержит ${varName}`);
    assert.equal(
      cssVars[varName].toUpperCase(),
      hex.toUpperCase(),
      `${varName} в CSS=${cssVars[varName]}, в JSON=${hex}`,
    );
  }
});

test('CSS: --shadow-* соответствуют tokens.json.shadows', () => {
  for (const [name, v] of Object.entries(tokens.shadows)) {
    const varName = `--shadow-${name}`;
    assert.ok(cssVars[varName], `CSS не содержит ${varName}`);
    // Нормализуем пробелы — в CSS пробелы после запятых, в JSON — как в canon
    const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');
    assert.equal(norm(cssVars[varName]), norm(v));
  }
});

test('CSS: --radius-* соответствуют tokens.json.radii', () => {
  for (const [name, v] of Object.entries(tokens.radii)) {
    const varName = `--radius-${name}`;
    assert.equal(cssVars[varName], v);
  }
});

test('CSS: --font-display / --font-body — первое имя в кавычках', () => {
  assert.ok(cssVars['--font-display']);
  assert.ok(cssVars['--font-body']);
  assert.match(cssVars['--font-display'], /"Cormorant Garamond"/);
  assert.match(cssVars['--font-body'], /"Inter"/);
});

test('CSS: --fs-* соответствуют typography.scale', () => {
  for (const [name, v] of Object.entries(tokens.typography.scale)) {
    const varName = `--fs-${name}`;
    assert.ok(cssVars[varName], `CSS не содержит ${varName}`);
    // нормализуем пробелы вокруг запятых внутри clamp()
    const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ');
    assert.equal(norm(cssVars[varName]), norm(v));
  }
});

test('CSS: --lh-* и --fw-* корректны', () => {
  for (const [name, v] of Object.entries(tokens.typography.line_heights)) {
    assert.equal(cssVars[`--lh-${name}`], String(v));
  }
  for (const [name, v] of Object.entries(tokens.typography.weights)) {
    assert.equal(cssVars[`--fw-${name}`], String(v));
  }
});

// ──────────────────────────────────────────────────────────────────────────
// 3. WCAG contrasts (М2 «Расширенная» — границы)
// ──────────────────────────────────────────────────────────────────────────
test('WCAG: все contrast_pairs проходят min_ratio', () => {
  for (const [pairName, pair] of Object.entries(tokens.contrast_pairs)) {
    if (pairName.startsWith('_')) continue;
    const fg = tokens.palette[pair.fg];
    const bg = tokens.palette[pair.bg];
    assert.ok(fg && bg, `${pairName}: palette colors not found`);
    const ratio = contrast(fg, bg);
    assert.ok(
      ratio >= pair.min_ratio,
      `${pairName}: ratio=${ratio.toFixed(2)} < min_ratio=${pair.min_ratio}`,
    );
  }
});

test('WCAG: основной текстовый цвет даёт AAA (>=7) на bg/bg_elevated/surface', () => {
  const text = tokens.palette.text;
  for (const bgKey of ['bg', 'bg_elevated', 'surface']) {
    const ratio = contrast(text, tokens.palette[bgKey]);
    assert.ok(ratio >= 7.0, `text/${bgKey} ratio=${ratio.toFixed(2)} < 7.0 (AAA)`);
  }
});

test('WCAG: text_muted проходит AA (>=4.5) на bg', () => {
  const ratio = contrast(tokens.palette.text_muted, tokens.palette.bg);
  assert.ok(ratio >= 4.5, `text_muted/bg ratio=${ratio.toFixed(2)} < 4.5`);
});

test('WCAG: accent проходит AA (>=4.5) на bg (CTA)', () => {
  const ratio = contrast(tokens.palette.accent, tokens.palette.bg);
  assert.ok(ratio >= 4.5, `accent/bg ratio=${ratio.toFixed(2)} < 4.5`);
});

test('WCAG: bull/bear проходят AA-large (>=3.0) на bg', () => {
  for (const k of ['bull', 'bear']) {
    const ratio = contrast(tokens.palette[k], tokens.palette.bg);
    assert.ok(ratio >= 3.0, `${k}/bg ratio=${ratio.toFixed(2)} < 3.0`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// 4. INV-06 — запреты в CSS
// ──────────────────────────────────────────────────────────────────────────
test('INV-06: в tokens.css нет localStorage / eval / new Function', () => {
  assert.equal(/\blocalStorage\b/.test(css), false);
  assert.equal(/\beval\s*\(/.test(css), false);
  assert.equal(/new\s+Function\s*\(/.test(css), false);
});

test('CSS не содержит @import url( (шрифты грузятся из HTML)', () => {
  assert.equal(/@import\s+url\(/.test(css), false);
});

// ──────────────────────────────────────────────────────────────────────────
// 5. Сверка сумм (М2 №3): счётчики токенов
// ──────────────────────────────────────────────────────────────────────────
test('Σ: 11 colors + 3 shadows + 3 radii + 2 families + 6 scale + 3 lh + 3 fw = 31 token group', () => {
  const sum =
    Object.keys(tokens.palette).length +
    Object.keys(tokens.shadows).length +
    Object.keys(tokens.radii).length +
    Object.keys(tokens.typography.families).length +
    Object.keys(tokens.typography.scale).length +
    Object.keys(tokens.typography.line_heights).length +
    Object.keys(tokens.typography.weights).length;
  assert.equal(sum, 31);
});

test('Σ: в CSS объявлено >= 31 custom property (tokens + возможные служебные)', () => {
  assert.ok(Object.keys(cssVars).length >= 31,
    `CSS custom properties count=${Object.keys(cssVars).length} < 31`);
});
