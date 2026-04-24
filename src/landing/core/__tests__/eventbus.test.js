/**
 * Unit tests for src/landing/core/eventbus.js
 * Run: node --test src/landing/core/__tests__/eventbus.test.js
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../eventbus.js';

beforeEach(() => EventBus.reset());

test('on + emit: handler получает payload и event-name', () => {
  let received, name;
  EventBus.on('foo', (payload, ev) => { received = payload; name = ev; });
  EventBus.emit('foo', 42);
  assert.equal(received, 42);
  assert.equal(name, 'foo');
});

test('on возвращает функцию отписки', () => {
  let count = 0;
  const off = EventBus.on('tick', () => count++);
  EventBus.emit('tick');
  assert.equal(count, 1);
  off();
  EventBus.emit('tick');
  assert.equal(count, 1);
  assert.equal(EventBus._listenerCount('tick'), 0);
});

test('off удаляет конкретный handler, остальные работают', () => {
  let a = 0, b = 0;
  const ha = () => a++;
  const hb = () => b++;
  EventBus.on('e', ha);
  EventBus.on('e', hb);
  EventBus.emit('e');
  assert.equal(a, 1); assert.equal(b, 1);
  assert.equal(EventBus.off('e', ha), true);
  EventBus.emit('e');
  assert.equal(a, 1); assert.equal(b, 2);
});

test('off на несуществующее событие — false', () => {
  assert.equal(EventBus.off('nope', () => {}), false);
});

test('once: handler вызывается ровно один раз', () => {
  let n = 0;
  EventBus.once('ping', () => n++);
  EventBus.emit('ping');
  EventBus.emit('ping');
  EventBus.emit('ping');
  assert.equal(n, 1);
  assert.equal(EventBus._listenerCount('ping'), 0);
});

test('once: возвращённая unsubscribe-fn отменяет до первого emit', () => {
  let n = 0;
  const off = EventBus.once('ping', () => n++);
  off();
  EventBus.emit('ping');
  assert.equal(n, 0);
});

test('emit: исключение в одном handler не ломает остальных', () => {
  const calls = [];
  EventBus.on('boom', () => { throw new Error('bad'); });
  EventBus.on('boom', () => calls.push('ok'));
  const orig = console.error;
  console.error = () => {}; // подавить шум в выводе теста
  try { EventBus.emit('boom'); } finally { console.error = orig; }
  assert.deepEqual(calls, ['ok']);
});

test("on('*'): wildcard получает все события с (payload, name)", () => {
  const log = [];
  EventBus.on('*', (payload, name) => log.push([name, payload]));
  EventBus.emit('a', 1);
  EventBus.emit('b', 2);
  assert.deepEqual(log, [['a', 1], ['b', 2]]);
});

test('emit: возвращает число вызванных handlers (включая wildcard)', () => {
  EventBus.on('e', () => {});
  EventBus.on('e', () => {});
  EventBus.on('*', () => {});
  assert.equal(EventBus.emit('e'), 3);   // 2 + 1 wildcard
  assert.equal(EventBus.emit('other'), 1); // только wildcard
  assert.equal(EventBus.emit('zero'), 1); // только wildcard
});

test('emit: snapshot — off внутри handler не отменяет уже запланированных', () => {
  let n = 0;
  const h = () => { n++; EventBus.off('x', h); };
  EventBus.on('x', h);
  EventBus.on('x', () => { n++; });
  EventBus.emit('x');
  assert.equal(n, 2);
});

test('reset: полная очистка всех подписок', () => {
  let called = false;
  EventBus.on('x', () => { called = true; });
  EventBus.on('*', () => { called = true; });
  EventBus.reset();
  EventBus.emit('x');
  assert.equal(called, false);
  assert.equal(EventBus._listenerCount('x'), 0);
  assert.equal(EventBus._listenerCount('*'), 0);
});

test('on: типовые ошибки', () => {
  assert.throws(() => EventBus.on('', () => {}), TypeError);
  assert.throws(() => EventBus.on(null, () => {}), TypeError);
  assert.throws(() => EventBus.on('x', null), TypeError);
  assert.throws(() => EventBus.on('x', 'not-a-fn'), TypeError);
});

test('emit: типовые ошибки', () => {
  assert.throws(() => EventBus.emit('', null), TypeError);
  assert.throws(() => EventBus.emit(null, null), TypeError);
});

test('once: handler-валидация', () => {
  assert.throws(() => EventBus.once('x', null), TypeError);
});

test('payload может быть любого типа: undefined, объект, массив', () => {
  let p1, p2, p3;
  EventBus.on('a', (p) => { p1 = p; });
  EventBus.on('b', (p) => { p2 = p; });
  EventBus.on('c', (p) => { p3 = p; });
  EventBus.emit('a');
  EventBus.emit('b', { x: 1 });
  EventBus.emit('c', [1, 2, 3]);
  assert.equal(p1, undefined);
  assert.deepEqual(p2, { x: 1 });
  assert.deepEqual(p3, [1, 2, 3]);
});
