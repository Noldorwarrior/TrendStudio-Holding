/**
 * Unit tests for src/landing/core/orchestrator.js
 * Run: node --test src/landing/core/__tests__/orchestrator.test.js
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../orchestrator.js';
import { EventBus } from '../eventbus.js';

/** Создать мок-window с переданными search/hash. */
function makeWin({ search = '', hash = '', sessionStorage } = {}) {
  return {
    location: { search, hash },
    sessionStorage,
  };
}

/** Мок sessionStorage. */
function makeSS(initial) {
  const store = new Map(Object.entries(initial || {}));
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); },
    _dump() { return Object.fromEntries(store.entries()); },
  };
}

beforeEach(() => {
  EventBus.reset();
  Orchestrator.reset();
});

test('register: сохраняет модуль, дубль — warn но не падает', () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    assert.equal(Orchestrator.register('a', () => {}), true);
    assert.deepEqual(Orchestrator.getRegisteredModules(), ['a']);
    assert.equal(Orchestrator.register('a', () => {}), true); // overwrite
    assert.deepEqual(Orchestrator.getRegisteredModules(), ['a']);
  } finally { console.warn = orig; }
});

test('register: типовые ошибки', () => {
  assert.throws(() => Orchestrator.register('', () => {}), TypeError);
  assert.throws(() => Orchestrator.register(null, () => {}), TypeError);
  assert.throws(() => Orchestrator.register('x', null), TypeError);
  assert.throws(() => Orchestrator.register('x', 'not-fn'), TypeError);
});

test('boot: последовательный init + emit("boot:ready")', async () => {
  const calls = [];
  Orchestrator.register('A', ({ state }) => { calls.push(['A', state.scenario]); });
  Orchestrator.register('B', async ({ state }) => {
    await new Promise((r) => setTimeout(r, 1));
    calls.push(['B', state.scenario]);
  });
  Orchestrator.register('C', ({ state }) => { calls.push(['C', state.scenario]); });

  let bootPayload;
  EventBus.on('boot:ready', (p) => { bootPayload = p; });

  const ret = await Orchestrator.boot({ window: makeWin(), sessionStorage: makeSS() });

  assert.deepEqual(calls, [['A', 'base'], ['B', 'base'], ['C', 'base']]);
  assert.deepEqual(ret.modules, ['A', 'B', 'C']);
  assert.equal(ret.state.scenario, 'base');
  assert.equal(Orchestrator.isBooted(), true);
  assert.deepEqual(bootPayload.modules, ['A', 'B', 'C']);
});

test('boot: повторный вызов — no-op (warn)', async () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    let count = 0;
    Orchestrator.register('A', () => { count++; });
    await Orchestrator.boot({ window: makeWin(), sessionStorage: makeSS() });
    await Orchestrator.boot({ window: makeWin(), sessionStorage: makeSS() });
    assert.equal(count, 1);
  } finally { console.warn = orig; }
});

test('boot: ошибка в init одного модуля не ломает остальные', async () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    const order = [];
    Orchestrator.register('A', () => order.push('A'));
    Orchestrator.register('B', () => { throw new Error('bad'); });
    Orchestrator.register('C', () => order.push('C'));
    const ret = await Orchestrator.boot({ window: makeWin(), sessionStorage: makeSS() });
    assert.deepEqual(order, ['A', 'C']);
    assert.deepEqual(ret.modules, ['A', 'C']); // B отсутствует
  } finally { console.warn = orig; }
});

test('hydrate: query > hash > sessionStorage > defaults', async () => {
  const ss = makeSS({ 'ts.state': JSON.stringify({ scenario: 'bear', rate: 10, horizon: 7, stress: 3 }) });
  const win = makeWin({
    search: '?scenario=bull&rate=20',       // query > всё остальное
    hash: '#scenario=base&horizon=8',       // hash > sessionStorage (но query > hash)
    sessionStorage: ss,
  });
  Orchestrator.register('X', () => {});
  const { state } = await Orchestrator.boot({ window: win, sessionStorage: ss });
  assert.equal(state.scenario, 'bull',  'query побеждает');
  assert.equal(state.rate, 20,           'rate из query');
  assert.equal(state.horizon, 8,         'horizon из hash (в query нет)');
  assert.equal(state.stress, 3,          'stress из session (нигде больше нет)');
  assert.equal(state.slide, 1,           'slide = default');
  assert.equal(state.locale, 'ru',       'locale = default');
});

test('hydrate: мусорные значения не ломают (NaN rate → default)', async () => {
  const win = makeWin({ search: '?rate=abc&horizon=-2' });
  Orchestrator.register('X', () => {});
  const { state } = await Orchestrator.boot({ window: win });
  // rate: Number('abc') = NaN → default 15
  assert.equal(state.rate, 15);
  // horizon: Number('-2') = -2 (валидный number) → -2
  assert.equal(state.horizon, -2);
});

test('hydrate: sessionStorage с битым JSON → игнор', async () => {
  const ss = makeSS({ 'ts.state': '{not-json' });
  const win = makeWin({ sessionStorage: ss });
  Orchestrator.register('X', () => {});
  const { state } = await Orchestrator.boot({ window: win, sessionStorage: ss });
  assert.equal(state.scenario, 'base'); // default
});

test('hydrate: без window / sessionStorage — defaults', async () => {
  Orchestrator.register('X', () => {});
  const { state } = await Orchestrator.boot({});
  assert.deepEqual(state, {
    locale: 'ru', scenario: 'base', rate: 15, horizon: 5, stress: 0, slide: 1,
  });
});

test('setState: emit("state:changed") только при реальных изменениях', async () => {
  Orchestrator.register('X', () => {});
  const ss = makeSS();
  await Orchestrator.boot({ window: makeWin({ sessionStorage: ss }), sessionStorage: ss });

  const events = [];
  EventBus.on('state:changed', (d) => events.push(d));

  assert.equal(Orchestrator.setState({ scenario: 'bull' }, { sessionStorage: ss }), true);
  assert.deepEqual(events.at(-1), { scenario: 'bull' });

  // Повторное присваивание той же величины → no-op
  assert.equal(Orchestrator.setState({ scenario: 'bull' }, { sessionStorage: ss }), false);
  assert.equal(events.length, 1);

  // Частичный патч с одним реально изменённым полем
  assert.equal(Orchestrator.setState({ scenario: 'bull', rate: 99 }, { sessionStorage: ss }), true);
  assert.deepEqual(events.at(-1), { rate: 99 });
});

test('setState: сохраняется в sessionStorage (не localStorage)', async () => {
  const ss = makeSS();
  Orchestrator.register('X', () => {});
  await Orchestrator.boot({ window: makeWin({ sessionStorage: ss }), sessionStorage: ss });
  Orchestrator.setState({ scenario: 'bear', rate: 12 }, { sessionStorage: ss });
  const raw = ss.getItem('ts.state');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.scenario, 'bear');
  assert.equal(parsed.rate, 12);
});

test('setState: persist:false не пишет в sessionStorage', async () => {
  const ss = makeSS();
  Orchestrator.register('X', () => {});
  await Orchestrator.boot({ window: makeWin({ sessionStorage: ss }), sessionStorage: ss });
  Orchestrator.setState({ scenario: 'bear' }, { sessionStorage: ss, persist: false });
  assert.equal(ss.getItem('ts.state'), null);
});

test('setState: типовые ошибки', () => {
  assert.throws(() => Orchestrator.setState(null), TypeError);
  assert.throws(() => Orchestrator.setState('x'), TypeError);
});

test('setState: неизвестные поля игнорируются', async () => {
  Orchestrator.register('X', () => {});
  await Orchestrator.boot({});
  const events = [];
  EventBus.on('state:changed', (d) => events.push(d));
  // 'foo' не из STATE_FIELDS — отбросится
  assert.equal(Orchestrator.setState({ foo: 'bar' }), false);
  assert.equal(events.length, 0);
  // А валидный scenario — пройдёт
  assert.equal(Orchestrator.setState({ foo: 'bar', scenario: 'bull' }), true);
  assert.deepEqual(events[0], { scenario: 'bull' });
});

test('getState: возвращает копию (иммутабельность)', async () => {
  Orchestrator.register('X', () => {});
  await Orchestrator.boot({});
  const s1 = Orchestrator.getState();
  s1.scenario = 'mutated';
  const s2 = Orchestrator.getState();
  assert.equal(s2.scenario, 'base', 'внешняя мутация не влияет на внутренний state');
});

test('reset: всё чистит', async () => {
  Orchestrator.register('A', () => {});
  await Orchestrator.boot({});
  assert.equal(Orchestrator.isBooted(), true);
  Orchestrator.reset();
  assert.equal(Orchestrator.isBooted(), false);
  assert.deepEqual(Orchestrator.getRegisteredModules(), []);
  assert.equal(Orchestrator.getState().scenario, 'base');
});

test('boot: без регистрации модулей — всё равно emit("boot:ready") с modules:[]', async () => {
  let payload;
  EventBus.on('boot:ready', (p) => { payload = p; });
  const ret = await Orchestrator.boot({});
  assert.deepEqual(ret.modules, []);
  assert.deepEqual(payload.modules, []);
  assert.equal(Orchestrator.isBooted(), true);
});
