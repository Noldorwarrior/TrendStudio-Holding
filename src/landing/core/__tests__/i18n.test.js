/**
 * Unit tests for src/landing/core/i18n.js
 * Run: node --test src/landing/core/__tests__/i18n.test.js
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { I18N } from '../i18n.js';
import { EventBus } from '../eventbus.js';

const RU = {
  ui: {
    chart: { revenue: { title: 'Выручка', subtitle: 'млн ₽' } },
    cta: { invest: 'Инвестировать' },
  },
  narrative: {
    pipeline: {
      count: '{count, plural, one {# проект} few {# проекта} many {# проектов} other {# проекта}}',
      hello: 'Привет, {name}!',
    },
  },
  // Плоский ключ с точками — для проверки приоритета flat→nested
  'ui.legacy.flat': 'Плоский',
};

const EN = {
  ui: {
    chart: { revenue: { title: 'Revenue', subtitle: 'M₽' } },
    cta: { invest: 'Invest' },
  },
  narrative: {
    pipeline: {
      count: '{count, plural, one {# project} other {# projects}}',
      hello: 'Hello, {name}!',
    },
  },
  'ui.legacy.flat': 'Flat',
};

beforeEach(() => {
  I18N.reset();
  EventBus.reset();
  I18N.init({ ru: RU, en: EN, locale: 'ru' });
});

test('init: типовые ошибки', () => {
  I18N.reset();
  assert.throws(() => I18N.init(null), TypeError);
  assert.throws(() => I18N.init({ ru: {} }), TypeError);
  assert.throws(() => I18N.init({ ru: {}, en: 'no' }), TypeError);
  assert.throws(() => I18N.init({ ru: {}, en: {}, locale: 'fr' }), RangeError);
});

test('format: nested-ключ через точки', () => {
  assert.equal(I18N.format('ui.chart.revenue.title'), 'Выручка');
  assert.equal(I18N.format('ui.chart.revenue.subtitle'), 'млн ₽');
  assert.equal(I18N.format('ui.cta.invest'), 'Инвестировать');
});

test('format: плоский ключ имеет приоритет над nested-walk', () => {
  // 'ui.legacy.flat' лежит как плоская строка — найдётся flat-проходом, а не walk
  assert.equal(I18N.format('ui.legacy.flat'), 'Плоский');
});

test('format: интерполяция {var}', () => {
  assert.equal(I18N.format('narrative.pipeline.hello', { name: 'Олег' }), 'Привет, Олег!');
});

test('format: необъявленный {var} остаётся буквально', () => {
  assert.equal(I18N.format('narrative.pipeline.hello'), 'Привет, {name}!');
});

test('format: неизвестный ключ → возвращает сам key', () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    assert.equal(I18N.format('nope.such.key'), 'nope.such.key');
  } finally { console.warn = orig; }
});

test('format: типовые ошибки key', () => {
  assert.throws(() => I18N.format(''), TypeError);
  assert.throws(() => I18N.format(null), TypeError);
});

test('plural RU: one', () => {
  assert.equal(I18N.format('narrative.pipeline.count', { count: 1 }), '1 проект');
});

test('plural RU: few (2,3,4)', () => {
  assert.equal(I18N.format('narrative.pipeline.count', { count: 2 }), '2 проекта');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 3 }), '3 проекта');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 4 }), '4 проекта');
});

test('plural RU: many (5,11,21,...)', () => {
  assert.equal(I18N.format('narrative.pipeline.count', { count: 5 }), '5 проектов');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 11 }), '11 проектов');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 25 }), '25 проектов');
});

test('plural EN: one/other', () => {
  I18N.setLocale('en');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 1 }), '1 project');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 2 }), '2 projects');
  assert.equal(I18N.format('narrative.pipeline.count', { count: 0 }), '0 projects');
});

test('plural: missing count → warn и сырой шаблон с интерполяцией vars', () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    const out = I18N.format('narrative.pipeline.count', {});
    // не упадёт; вернёт строку (детали не критичны для контракта)
    assert.equal(typeof out, 'string');
    assert.ok(out.length > 0);
  } finally { console.warn = orig; }
});

test('setLocale: переключение + emit("locale:changed", newLocale)', () => {
  let fired;
  EventBus.on('locale:changed', (l) => { fired = l; });
  assert.equal(I18N.setLocale('en'), true);
  assert.equal(I18N.getLocale(), 'en');
  assert.equal(fired, 'en');
  assert.equal(I18N.format('ui.chart.revenue.title'), 'Revenue');
});

test('setLocale: повторная установка той же локали — no-op (без emit)', () => {
  let count = 0;
  EventBus.on('locale:changed', () => count++);
  assert.equal(I18N.setLocale('ru'), false); // уже ru
  assert.equal(count, 0);
});

test('setLocale: невалидная локаль — RangeError', () => {
  assert.throws(() => I18N.setLocale('fr'), RangeError);
});

test('getAvailableLocales: возвращает копию ["ru","en"]', () => {
  const arr = I18N.getAvailableLocales();
  assert.deepEqual(arr, ['ru', 'en']);
  arr.push('zzz'); // мутация копии не должна влиять
  assert.deepEqual(I18N.getAvailableLocales(), ['ru', 'en']);
});

test('has: существование ключа в активной локали', () => {
  assert.equal(I18N.has('ui.cta.invest'), true);
  assert.equal(I18N.has('nope.x'), false);
});

test('reset: очищает словари и сбрасывает локаль', () => {
  I18N.setLocale('en');
  I18N.reset();
  assert.equal(I18N.getLocale(), 'ru');
  assert.equal(I18N.has('ui.cta.invest'), false);
});
