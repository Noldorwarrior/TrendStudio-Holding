/**
 * Unit tests for src/landing/index.html (W1.5 HTML skeleton)
 * Run: node --test src/landing/__tests__/index.test.js
 *
 * Три группы:
 *   №0  Structure     — DOCTYPE, lang, meta, h1, main, skip-link, fonts, tokens.css
 *   №Б  Canon sync    — 25 sections + 22 viz + 13 sim, размещение совпадает с canon_extended
 *   №В  INV-06 sec    — no localStorage/eval/new Function/@import url(/<script> inline JS
 *
 * Zero-deps: native node:test + node:assert/strict. Regex-based DOM-проверка
 * (jsdom нет — сознательно: всё, что нам нужно, — атрибуты и тэги, они хорошо
 * покрываются regex).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, '..', 'index.html');

// Canon может лежать в Холдинг/data или TrendStudio-Holding/data_extract
const CANON_CANDIDATES = [
  resolve(__dirname, '..', '..', '..', 'data', 'landing_canon_extended_v1.0.json'),
  resolve(__dirname, '..', '..', '..', 'data_extract', 'landing_canon_extended_v1.0.json'),
];
const CANON_PATH = CANON_CANDIDATES.find(existsSync);
if (!CANON_PATH) {
  throw new Error(
    'canon_extended not found. Tried:\n  ' + CANON_CANDIDATES.join('\n  ')
  );
}

const html = readFileSync(HTML_PATH, 'utf8');
const canon = JSON.parse(readFileSync(CANON_PATH, 'utf8'));

// ──────────────────────────────────────────────────────────────────────────
// Helpers: regex-based DOM extraction (без jsdom, zero-deps)
// ──────────────────────────────────────────────────────────────────────────
function attrValues(html, tag, attr) {
  const re = new RegExp(
    `<${tag}\\b[^>]*\\b${attr}\\s*=\\s*"([^"]*)"`,
    'gi'
  );
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}
function countOpenTags(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  return (html.match(re) || []).length;
}
function hasAttr(html, tag, attrPattern) {
  const re = new RegExp(`<${tag}\\b[^>]*${attrPattern}`, 'i');
  return re.test(html);
}
function getDataAttrValues(html, dataAttr) {
  // ищет любые элементы с data-<attr>="VALUE"
  const re = new RegExp(`\\b${dataAttr}\\s*=\\s*"([^"]*)"`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}
function getBlockByTag(html, tag) {
  // возвращает массив inner-content всех <tag>...</tag>
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Группа №0 — Structure (базовые HTML-инварианты, 10 тестов)
// ──────────────────────────────────────────────────────────────────────────
test('0.1 HTML starts with <!DOCTYPE html>', () => {
  assert.match(html.trimStart().slice(0, 20), /^<!DOCTYPE html>/i);
});

test('0.2 <html lang="ru">', () => {
  assert.match(html, /<html\b[^>]*\blang\s*=\s*"ru"/i);
});

test('0.3 meta charset UTF-8', () => {
  assert.match(html, /<meta\b[^>]*\bcharset\s*=\s*"utf-8"/i);
});

test('0.4 meta viewport с initial-scale=1.0', () => {
  assert.match(
    html,
    /<meta\b[^>]*\bname\s*=\s*"viewport"[^>]*\bcontent\s*=\s*"[^"]*initial-scale=1\.0/i
  );
});

test('0.5 Ровно один <h1>', () => {
  const n = countOpenTags(html, 'h1');
  assert.equal(n, 1, `ожидали 1 <h1>, фактически ${n}`);
});

test('0.6 <main id="main"> присутствует ровно 1 раз', () => {
  const ids = attrValues(html, 'main', 'id');
  assert.deepEqual(ids, ['main']);
});

test('0.7 Skip-link <a class="skip-link" href="#main">', () => {
  assert.match(
    html,
    /<a\b[^>]*\bclass\s*=\s*"skip-link"[^>]*\bhref\s*=\s*"#main"/i
  );
});

test('0.8 <title> непустой', () => {
  const titles = getBlockByTag(html, 'title');
  assert.equal(titles.length, 1, 'ожидали ровно один <title>');
  assert.ok(titles[0].trim().length > 0, '<title> не должен быть пустым');
});

test('0.9 meta description непустой', () => {
  const m = html.match(
    /<meta\b[^>]*\bname\s*=\s*"description"[^>]*\bcontent\s*=\s*"([^"]*)"/i
  );
  assert.ok(m, 'meta description отсутствует');
  assert.ok(m[1].trim().length > 0, 'meta description пустой');
});

test('0.10 Google Fonts preconnect×2 + stylesheet + tokens.css link', () => {
  assert.match(html, /<link\b[^>]*\brel\s*=\s*"preconnect"[^>]*\bhref\s*=\s*"https:\/\/fonts\.googleapis\.com"/i);
  assert.match(html, /<link\b[^>]*\brel\s*=\s*"preconnect"[^>]*\bhref\s*=\s*"https:\/\/fonts\.gstatic\.com"[^>]*\bcrossorigin/i);
  assert.match(html, /<link\b[^>]*\bhref\s*=\s*"https:\/\/fonts\.googleapis\.com\/css2\?[^"]*Cormorant\+Garamond[^"]*Inter[^"]*"[^>]*\brel\s*=\s*"stylesheet"/i);
  assert.match(html, /<link\b[^>]*\brel\s*=\s*"stylesheet"[^>]*\bhref\s*=\s*"styles\/tokens\.css"/i);
});

// ──────────────────────────────────────────────────────────────────────────
// Группа №Б — Canon sync (сверка с canon_extended, 7 тестов)
// ──────────────────────────────────────────────────────────────────────────
const CANON_TOC_IDS = canon.navigation.toc.items.map((i) => i.section);
const CANON_VIZ = canon.visualizations.items; // 22 items
const CANON_SIM = canon.simulators.items;     // 13 items

test('Б.1 Ровно 25 <section id="sNN">, уникальные, s01..s25', () => {
  const sectionIds = attrValues(html, 'section', 'id');
  assert.equal(sectionIds.length, 25, `ожидали 25 section#id, фактически ${sectionIds.length}`);
  const unique = new Set(sectionIds);
  assert.equal(unique.size, 25, 'section id-шники должны быть уникальными');
  const expected = Array.from({ length: 25 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
  assert.deepEqual(sectionIds.slice().sort(), expected.slice().sort());
});

test('Б.2 section id-шники совпадают с canon.navigation.toc.items[].section', () => {
  const sectionIds = attrValues(html, 'section', 'id').slice().sort();
  const canonIds = CANON_TOC_IDS.slice().sort();
  assert.deepEqual(sectionIds, canonIds);
});

test('Б.3 TOC: ровно 25 ссылок href="#sNN", порядок = canon', () => {
  // Извлекаем <a href="#s01"...> внутри <nav id="toc">
  const navMatch = html.match(/<nav\b[^>]*\bid\s*=\s*"toc"[\s\S]*?<\/nav>/i);
  assert.ok(navMatch, 'не нашли <nav id="toc">');
  const navHtml = navMatch[0];
  const hrefs = attrValues(navHtml, 'a', 'href');
  assert.equal(hrefs.length, 25, `ожидали 25 TOC-ссылок, фактически ${hrefs.length}`);
  const expected = CANON_TOC_IDS.map((id) => `#${id}`);
  assert.deepEqual(hrefs, expected, 'порядок TOC должен совпадать с canon');
});

test('Б.4 22 data-viz-id, все уникальны, множество = {viz01..viz22}', () => {
  const vizIds = getDataAttrValues(html, 'data-viz-id');
  assert.equal(vizIds.length, 22, `ожидали 22 data-viz-id, фактически ${vizIds.length}`);
  assert.equal(new Set(vizIds).size, 22, 'data-viz-id должны быть уникальными');
  const expected = CANON_VIZ.map((v) => v.id).slice().sort();
  assert.deepEqual(vizIds.slice().sort(), expected);
});

test('Б.5 13 data-sim-id, все уникальны, множество = {sim01..sim13}', () => {
  const simIds = getDataAttrValues(html, 'data-sim-id');
  assert.equal(simIds.length, 13, `ожидали 13 data-sim-id, фактически ${simIds.length}`);
  assert.equal(new Set(simIds).size, 13, 'data-sim-id должны быть уникальными');
  const expected = CANON_SIM.map((s) => s.id).slice().sort();
  assert.deepEqual(simIds.slice().sort(), expected);
});

test('Б.6 Каждая viz размещена в правильной секции (canon.placement_section)', () => {
  // Секция содержит viz, если она ограничивает блок <section id="sNN">...</section>,
  // в котором встречается data-viz-id="vizXX".
  const sectionBlocks = {};
  const reSec = /<section\b[^>]*\bid\s*=\s*"(s\d{2})"[^>]*>([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = reSec.exec(html)) !== null) sectionBlocks[m[1]] = m[2];

  for (const v of CANON_VIZ) {
    const expectedSec = v.placement_section;
    const block = sectionBlocks[expectedSec];
    assert.ok(block, `нет section #${expectedSec} (ожидалась для ${v.id})`);
    const re = new RegExp(`\\bdata-viz-id\\s*=\\s*"${v.id}"`, 'i');
    assert.ok(re.test(block), `${v.id} не найдён в section #${expectedSec}`);
  }
});

test('Б.7 Каждый sim размещён в правильной секции (canon.section)', () => {
  const sectionBlocks = {};
  const reSec = /<section\b[^>]*\bid\s*=\s*"(s\d{2})"[^>]*>([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = reSec.exec(html)) !== null) sectionBlocks[m[1]] = m[2];

  for (const s of CANON_SIM) {
    const expectedSec = s.section;
    const block = sectionBlocks[expectedSec];
    assert.ok(block, `нет section #${expectedSec} (ожидалась для ${s.id})`);
    const re = new RegExp(`\\bdata-sim-id\\s*=\\s*"${s.id}"`, 'i');
    assert.ok(re.test(block), `${s.id} не найдён в section #${expectedSec}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Группа №В — INV-06 security (5 тестов)
// ──────────────────────────────────────────────────────────────────────────
test('В.1 Нет упоминания localStorage / sessionStorage в HTML', () => {
  // Разрешено в src/landing/* НЕ иметь вообще — это статический skeleton.
  assert.doesNotMatch(html, /\blocalStorage\b/);
  // sessionStorage тоже не должно быть в HTML-skeleton (оно живёт в orchestrator.js)
  assert.doesNotMatch(html, /\bsessionStorage\b/);
});

test('В.2 Нет eval( в HTML', () => {
  assert.doesNotMatch(html, /\beval\s*\(/);
});

test('В.3 Нет new Function( в HTML', () => {
  assert.doesNotMatch(html, /\bnew\s+Function\s*\(/);
});

test('В.4 Внутри <style>…</style> нет @import url(', () => {
  const styles = getBlockByTag(html, 'style');
  for (const s of styles) {
    assert.doesNotMatch(s, /@import\s+url\s*\(/i);
  }
});

test('В.5 Нет inline <script> с JS-кодом (разрешены только src-linked или пустые)', () => {
  // Находим все <script>…</script>, допускаются только пустые (или чисто whitespace) inline.
  const reScript = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = reScript.exec(html)) !== null) {
    const attrs = m[1];
    const body = m[2];
    const hasSrc = /\bsrc\s*=/i.test(attrs);
    if (!hasSrc) {
      assert.equal(
        body.trim().length,
        0,
        'inline <script> с кодом запрещён (INV-06): ' + body.slice(0, 80)
      );
    }
  }
});
