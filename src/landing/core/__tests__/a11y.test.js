/**
 * Unit tests for src/landing/core/a11y.js
 * Run: node --test src/landing/core/__tests__/a11y.test.js
 *
 * Без jsdom — используем минимальный mock-DOM, достаточный для контракта A11y.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { A11y } from '../a11y.js';
import { EventBus } from '../eventbus.js';

function makeNode(tag) {
  const node = {
    tagName: String(tag).toUpperCase(),
    _children: [],
    _attrs: {},
    _listeners: {},
    _focusables: [],
    textContent: '',
    parentNode: null,
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    removeAttribute(k) { delete this._attrs[k]; },
    appendChild(child) {
      this._children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      const idx = this._children.indexOf(child);
      if (idx >= 0) this._children.splice(idx, 1);
      child.parentNode = null;
      return child;
    },
    addEventListener(ev, h) {
      if (!this._listeners[ev]) this._listeners[ev] = [];
      this._listeners[ev].push(h);
    },
    removeEventListener(ev, h) {
      const arr = this._listeners[ev];
      if (!arr) return;
      const i = arr.indexOf(h);
      if (i >= 0) arr.splice(i, 1);
    },
    /** Симулировать событие keydown. */
    dispatch(ev, data) {
      const arr = this._listeners[ev];
      if (!arr) return;
      arr.slice().forEach((h) => h(data));
    },
    querySelectorAll(_sel) { return this._focusables.slice(); },
    set className(v) { this._attrs.class = v; },
    get className() { return this._attrs.class || ''; },
    set id(v) { this._attrs.id = v; },
    get id() { return this._attrs.id || ''; },
  };
  return node;
}

function makeDoc() {
  const doc = { activeElement: null };
  doc.createElement = (tag) => makeNode(tag);
  doc.body = makeNode('body');
  doc.documentElement = makeNode('html');
  return doc;
}

function makeFocusable(name) {
  const el = makeNode('button');
  el.id = name;
  el.focus = function () { /* parent doc.activeElement выставит trapFocus вне */ };
  return el;
}

beforeEach(() => {
  EventBus.reset();
  A11y.reset();
});

test('mount: создаёт 2 region (polite + assertive) с правильными ARIA-атрибутами', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  assert.equal(doc.body._children.length, 2);
  const polite = doc.body._children[0];
  const assertive = doc.body._children[1];
  assert.equal(polite.getAttribute('aria-live'), 'polite');
  assert.equal(polite.getAttribute('aria-atomic'), 'true');
  assert.equal(polite.getAttribute('role'), 'status');
  assert.equal(assertive.getAttribute('aria-live'), 'assertive');
  assert.equal(assertive.getAttribute('role'), 'alert');
  assert.equal(A11y.isMounted(), true);
});

test('mount: повторный вызов — no-op (без дублирования regions)', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  A11y.mount({ document: doc });
  assert.equal(doc.body._children.length, 2);
});

test('mount: ошибка при отсутствии document', () => {
  assert.throws(() => A11y.mount({}), TypeError);
  assert.throws(() => A11y.mount(null), TypeError);
});

test('unmount: удаляет regions и сбрасывает isMounted', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  A11y.unmount();
  assert.equal(doc.body._children.length, 0);
  assert.equal(A11y.isMounted(), false);
});

test('announce: emit("a11y:announce", { text, assertive })', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  let payload;
  EventBus.on('a11y:announce', (p) => { payload = p; });
  A11y.announce('Привет');
  assert.deepEqual(payload, { text: 'Привет', assertive: false });
});

test('announce(assertive): пишет в assertive-region', async () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  A11y.announce('Внимание!', { assertive: true });
  // Дождаться microtask
  await new Promise((r) => setTimeout(r, 5));
  const assertive = doc.body._children[1];
  assert.equal(assertive.textContent, 'Внимание!');
  // polite должен остаться пустым
  const polite = doc.body._children[0];
  assert.equal(polite.textContent, '');
});

test('announce(polite по умолчанию): пишет в polite-region', async () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  A11y.announce('Привет');
  await new Promise((r) => setTimeout(r, 5));
  const polite = doc.body._children[0];
  assert.equal(polite.textContent, 'Привет');
});

test('announce: без mount — не падает, возвращает false (warn в консоль подавляем)', () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    const r = A11y.announce('hello');
    assert.equal(r, false);
  } finally { console.warn = orig; }
});

test('announce: типовые ошибки', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  assert.throws(() => A11y.announce(''), TypeError);
  assert.throws(() => A11y.announce(null), TypeError);
});

test('trapFocus: фокус на первом focusable + Tab ловит Shift+Tab на first', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  const modal = makeNode('div');
  const b1 = makeFocusable('b1');
  const b2 = makeFocusable('b2');
  modal._focusables = [b1, b2];
  // overload focus() чтобы выставлять doc.activeElement
  b1.focus = function () { doc.activeElement = b1; };
  b2.focus = function () { doc.activeElement = b2; };

  A11y.trapFocus(modal);
  assert.equal(doc.activeElement, b1, 'фокус сразу на первом');

  // Shift+Tab на первом → переход на последний
  doc.activeElement = b1;
  modal.dispatch('keydown', { key: 'Tab', shiftKey: true, preventDefault: () => {} });
  assert.equal(doc.activeElement, b2);

  // Tab на последнем → возврат на первый
  doc.activeElement = b2;
  modal.dispatch('keydown', { key: 'Tab', shiftKey: false, preventDefault: () => {} });
  assert.equal(doc.activeElement, b1);
});

test('trapFocus: некорректный element — TypeError', () => {
  assert.throws(() => A11y.trapFocus(null), TypeError);
  assert.throws(() => A11y.trapFocus({}), TypeError);
});

test('releaseFocus: снимает trap и возвращает фокус на prevActive', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  const opener = makeFocusable('opener');
  opener.focus = function () { doc.activeElement = opener; };
  doc.activeElement = opener;

  const modal = makeNode('div');
  const b1 = makeFocusable('b1');
  modal._focusables = [b1];
  b1.focus = function () { doc.activeElement = b1; };

  A11y.trapFocus(modal);
  assert.equal(doc.activeElement, b1);

  A11y.releaseFocus();
  assert.equal(doc.activeElement, opener, 'фокус вернулся на opener');
});

test('reset: snova umount + releaseFocus всё чистит', () => {
  const doc = makeDoc();
  A11y.mount({ document: doc });
  const modal = makeNode('div');
  modal._focusables = [makeFocusable('x')];
  A11y.trapFocus(modal);
  A11y.reset();
  assert.equal(A11y.isMounted(), false);
  assert.equal(doc.body._children.length, 0);
});
