/**
 * TS.Orchestrator — boot-оркестратор Landing v1.0
 *
 * Контракт:
 *   register(name, initFn)              — регистрация модуля (initFn может быть async)
 *   boot(opts?)                         — последовательный init → emit('boot:ready')
 *   getState()                          — снимок состояния
 *   setState(patch)                     — частичный апдейт → emit('state:changed', patch)
 *   isBooted()                          — bool
 *   reset()                             — teardown для тестов
 *
 * URL-state каскад (приоритет):
 *   1) window.location.search   (?scenario=bull&rate=15)
 *   2) window.location.hash     (#scenario=bull&rate=15)
 *   3) sessionStorage['ts.state'] (НЕ localStorage — INV-06)
 *   4) defaults (см. DEFAULT_STATE)
 *
 * Запрещено (INV-06):
 *   — localStorage
 *   — eval / new Function
 *
 * State shape:
 *   { locale, scenario, rate, horizon, stress, slide }
 *
 * События:
 *   'boot:ready'     — { modules: string[], state }
 *   'state:changed'  — patch (только изменённые поля)
 *
 * DI:
 *   boot({ window, sessionStorage }) — явная передача для тестов.
 *   В браузере по умолчанию берётся globalThis.window / globalThis.sessionStorage.
 *
 * ESM, zero deps (кроме EventBus).
 */
import { EventBus } from './eventbus.js';

const STATE_KEY = 'ts.state';

const DEFAULT_STATE = Object.freeze({
  locale: 'ru',
  scenario: 'base',
  rate: 15,
  horizon: 5,
  stress: 0,
  slide: 1,
});

const STATE_FIELDS = Object.keys(DEFAULT_STATE);

let _modules = new Map();
let _state = { ...DEFAULT_STATE };
let _booted = false;

const _warn = (msg) => {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(msg);
  }
};

/** Парсинг пары key=value строки (без '?' или '#'). */
function _parseQueryString(str) {
  const out = {};
  if (typeof str !== 'string' || str.length === 0) return out;
  const clean = str.replace(/^[?#]/, '');
  if (!clean) return out;
  for (const chunk of clean.split('&')) {
    if (!chunk) continue;
    const eq = chunk.indexOf('=');
    if (eq < 0) {
      out[decodeURIComponent(chunk)] = '';
    } else {
      const k = decodeURIComponent(chunk.slice(0, eq));
      const v = decodeURIComponent(chunk.slice(eq + 1));
      out[k] = v;
    }
  }
  return out;
}

/** Приведение значения к типу поля (из DEFAULT_STATE). */
function _coerce(field, raw) {
  const defVal = DEFAULT_STATE[field];
  if (typeof defVal === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : defVal;
  }
  if (typeof defVal === 'string') {
    return typeof raw === 'string' ? raw : String(raw);
  }
  return raw;
}

/** Фильтрация + coerce патча по STATE_FIELDS. */
function _sanitize(patch) {
  const out = {};
  if (!patch || typeof patch !== 'object') return out;
  for (const f of STATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(patch, f)) {
      out[f] = _coerce(f, patch[f]);
    }
  }
  return out;
}

/** Чтение JSON из sessionStorage без падений. */
function _readSession(ss) {
  if (!ss || typeof ss.getItem !== 'function') return {};
  try {
    const raw = ss.getItem(STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

/** Запись JSON в sessionStorage без падений. */
function _writeSession(ss, state) {
  if (!ss || typeof ss.setItem !== 'function') return;
  try {
    ss.setItem(STATE_KEY, JSON.stringify(state));
  } catch (_) { /* quota / disabled — silent */ }
}

/** Собрать state из каскада: query > hash > sessionStorage > defaults. */
function _hydrate(win, ss) {
  const fromSession = _sanitize(_readSession(ss));
  const loc = win && win.location ? win.location : null;
  const fromHash = loc ? _sanitize(_parseQueryString(loc.hash || '')) : {};
  const fromQuery = loc ? _sanitize(_parseQueryString(loc.search || '')) : {};
  return { ...DEFAULT_STATE, ...fromSession, ...fromHash, ...fromQuery };
}

export const Orchestrator = {
  /**
   * Зарегистрировать модуль. initFn получает ({ state }) и может быть async.
   */
  register(name, initFn) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new TypeError('Orchestrator.register: name must be a non-empty string');
    }
    if (typeof initFn !== 'function') {
      throw new TypeError('Orchestrator.register: initFn must be a function');
    }
    if (_modules.has(name)) {
      _warn(`Orchestrator: module "${name}" is already registered — overwriting`);
    }
    _modules.set(name, initFn);
    return true;
  },

  /**
   * Последовательный boot всех зарегистрированных модулей.
   * @param {{ window?: Window, sessionStorage?: Storage }} [opts]
   * @returns {Promise<{modules: string[], state: object}>}
   */
  async boot(opts) {
    if (_booted) {
      _warn('Orchestrator.boot: already booted — no-op');
      return { modules: Array.from(_modules.keys()), state: { ..._state } };
    }
    const win = (opts && opts.window) || (typeof globalThis !== 'undefined' ? globalThis.window : undefined);
    const ss = (opts && opts.sessionStorage)
      || (win && win.sessionStorage)
      || (typeof globalThis !== 'undefined' ? globalThis.sessionStorage : undefined);

    // 1) Гидратация состояния
    _state = _hydrate(win, ss);

    // 2) Последовательный init
    const order = [];
    for (const [name, initFn] of _modules) {
      try {
        // Ждём результата; допускаем и sync, и async
        await initFn({ state: { ..._state } });
        order.push(name);
      } catch (err) {
        _warn(`Orchestrator.boot: module "${name}" init failed — ${err && err.message}`);
        // Продолжаем, чтобы остальные всё же могли проинициализироваться
      }
    }

    _booted = true;
    const payload = { modules: order, state: { ..._state } };
    EventBus.emit('boot:ready', payload);
    return payload;
  },

  /** Снимок состояния (копия). */
  getState() {
    return { ..._state };
  },

  /**
   * Частичное обновление состояния. Эмитит только при реальных изменениях.
   * Пишет в sessionStorage (если доступен) — БЕЗ localStorage (INV-06).
   * @param {object} patch
   * @param {{ window?: Window, sessionStorage?: Storage, persist?: boolean }} [opts]
   */
  setState(patch, opts) {
    if (!patch || typeof patch !== 'object') {
      throw new TypeError('Orchestrator.setState: patch must be an object');
    }
    const clean = _sanitize(patch);
    const diff = {};
    for (const f of Object.keys(clean)) {
      if (_state[f] !== clean[f]) {
        diff[f] = clean[f];
      }
    }
    if (Object.keys(diff).length === 0) return false;
    _state = { ..._state, ...diff };

    // Персист (по умолчанию — да)
    const persist = !opts || opts.persist !== false;
    if (persist) {
      const win = (opts && opts.window) || (typeof globalThis !== 'undefined' ? globalThis.window : undefined);
      const ss = (opts && opts.sessionStorage)
        || (win && win.sessionStorage)
        || (typeof globalThis !== 'undefined' ? globalThis.sessionStorage : undefined);
      _writeSession(ss, _state);
    }

    EventBus.emit('state:changed', diff);
    return true;
  },

  isBooted() {
    return _booted;
  },

  /** Список зарегистрированных модулей (для отладки/тестов). */
  getRegisteredModules() {
    return Array.from(_modules.keys());
  },

  /** Teardown для тестов. */
  reset() {
    _modules = new Map();
    _state = { ...DEFAULT_STATE };
    _booted = false;
  },
};

export default Orchestrator;
