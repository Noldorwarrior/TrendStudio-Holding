/**
 * TS.A11y — a11y-примитивы Landing v1.0
 *
 * Контракт:
 *   mount({ document })                 — создаёт 2 aria-live region'а (polite/assertive)
 *   unmount()                           — удаляет regions, возвращает фокус
 *   announce(text, { assertive? })      — асинхронно обновляет region (SR озвучит)
 *   trapFocus(element)                  — замыкает Tab-навигацию внутри element
 *   releaseFocus()                      — снимает trap, возвращает фокус на prevActive
 *   isMounted()                         — bool
 *   reset()                             — teardown + очистка (для тестов)
 *
 * DOM-зависимость:
 *   — mount() принимает document (DI). Без mount — announce/trap-функции no-op
 *     (с warn в dev), что делает модуль безопасным для Node-тестов и SSR.
 *   — Эмит 'a11y:announce' через EventBus для внешних логгеров/тестов.
 *
 * ARIA:
 *   role="status" на polite, role="alert" на assertive (избыточная подстраховка
 *   для кроссбраузерной поддержки aria-live). aria-atomic="true".
 *
 * ESM, zero deps (кроме EventBus).
 */
import { EventBus } from './eventbus.js';

const REGION_ID_POLITE = 'ts-a11y-live-polite';
const REGION_ID_ASSERTIVE = 'ts-a11y-live-assertive';
const SR_ONLY_STYLE =
  'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let _doc = null;
let _regionPolite = null;
let _regionAssertive = null;
let _prevActive = null;
let _trapElement = null;
let _trapHandler = null;

const _warn = (msg) => {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(msg);
  }
};

function _createRegion(doc, id, liveKind, role) {
  const el = doc.createElement('div');
  el.id = id;
  el.setAttribute('aria-live', liveKind);
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('role', role);
  el.className = 'ts-a11y-live ts-a11y-live--' + liveKind;
  el.setAttribute('style', SR_ONLY_STYLE);
  return el;
}

function _getFocusable(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
    // Отбросить скрытые (простая эвристика)
    if (typeof el.getAttribute === 'function' && el.getAttribute('aria-hidden') === 'true') return false;
    return true;
  });
}

export const A11y = {
  /**
   * Прикрепить aria-live regions к document.body.
   * @param {{document: Document}} opts
   */
  mount(opts) {
    if (!opts || !opts.document) {
      throw new TypeError('A11y.mount: opts.document is required');
    }
    if (_regionPolite) {
      // Уже смонтировано — no-op
      return;
    }
    _doc = opts.document;
    _regionPolite = _createRegion(_doc, REGION_ID_POLITE, 'polite', 'status');
    _regionAssertive = _createRegion(_doc, REGION_ID_ASSERTIVE, 'assertive', 'alert');
    const body = _doc.body || _doc.documentElement;
    if (!body) throw new Error('A11y.mount: document has neither body nor documentElement');
    body.appendChild(_regionPolite);
    body.appendChild(_regionAssertive);
  },

  unmount() {
    if (_trapElement) {
      this.releaseFocus();
    }
    if (_regionPolite && _regionPolite.parentNode) {
      _regionPolite.parentNode.removeChild(_regionPolite);
    }
    if (_regionAssertive && _regionAssertive.parentNode) {
      _regionAssertive.parentNode.removeChild(_regionAssertive);
    }
    _regionPolite = null;
    _regionAssertive = null;
    _doc = null;
  },

  isMounted() {
    return _regionPolite !== null && _regionAssertive !== null;
  },

  /**
   * Асинхронно объявить текст. SR прочитает.
   * @param {string} text
   * @param {{assertive?: boolean}} [opts]
   */
  announce(text, opts) {
    if (typeof text !== 'string' || text.length === 0) {
      throw new TypeError('A11y.announce: text must be a non-empty string');
    }
    const assertive = !!(opts && opts.assertive);
    EventBus.emit('a11y:announce', { text, assertive });
    const region = assertive ? _regionAssertive : _regionPolite;
    if (!region) {
      _warn('A11y.announce: not mounted — skip (emit only)');
      return false;
    }
    // Чтобы SR повторно озвучил даже одинаковый текст — сначала очистить.
    region.textContent = '';
    const write = () => { region.textContent = text; };
    // queueMicrotask недоступен в старых средах — fallback на setTimeout(0)
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(write);
    } else if (typeof setTimeout === 'function') {
      setTimeout(write, 0);
    } else {
      write();
    }
    return true;
  },

  /**
   * Замкнуть Tab-навигацию внутри element. Фокус переходит на первый focusable.
   * @param {HTMLElement} element
   */
  trapFocus(element) {
    if (!element || typeof element.querySelectorAll !== 'function') {
      throw new TypeError('A11y.trapFocus: element must be a DOM element');
    }
    if (_trapElement) {
      this.releaseFocus();
    }
    _trapElement = element;
    if (_doc && _doc.activeElement) {
      _prevActive = _doc.activeElement;
    }
    const focusable = _getFocusable(element);
    if (focusable.length > 0 && typeof focusable[0].focus === 'function') {
      focusable[0].focus();
    }
    _trapHandler = (ev) => {
      if (ev.key !== 'Tab') return;
      const list = _getFocusable(element);
      if (list.length === 0) { ev.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      const active = _doc ? _doc.activeElement : null;
      if (ev.shiftKey && active === first) {
        ev.preventDefault();
        if (typeof last.focus === 'function') last.focus();
      } else if (!ev.shiftKey && active === last) {
        ev.preventDefault();
        if (typeof first.focus === 'function') first.focus();
      }
    };
    if (typeof element.addEventListener === 'function') {
      element.addEventListener('keydown', _trapHandler);
    }
  },

  /**
   * Отпустить trap, вернуть фокус на prevActive (если есть).
   */
  releaseFocus() {
    if (!_trapElement) return;
    if (_trapHandler && typeof _trapElement.removeEventListener === 'function') {
      _trapElement.removeEventListener('keydown', _trapHandler);
    }
    _trapElement = null;
    _trapHandler = null;
    if (_prevActive && typeof _prevActive.focus === 'function') {
      try { _prevActive.focus(); } catch (_) { /* noop */ }
    }
    _prevActive = null;
  },

  /** Teardown всех side-effects (для тестов). */
  reset() {
    this.releaseFocus();
    this.unmount();
  },
};

export default A11y;
