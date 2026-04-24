/**
 * TS.EventBus — минимальный pub/sub для Landing v1.0
 *
 * События Landing (неполный список):
 *   'locale:changed'     payload: 'ru' | 'en'
 *   'boot:ready'         payload: { modules: string[], state: {...} }
 *   'scenario:changed'   payload: 'base' | 'bull' | 'bear'
 *   'param:changed'      payload: { key, value }
 *   'drilldown:open'     payload: { viz_id | sim_id, context }
 *   'chart:rendered'     payload: { viz_id, durationMs }
 *   'a11y:announce'      payload: { text, assertive }
 *
 * Wildcard:
 *   EventBus.on('*', handler) — вызывается для каждого события;
 *   handler получает (payload, eventName).
 *
 * Гарантии:
 *   — snapshot-iteration: off/once-cleanup внутри handler не ломает текущий emit
 *   — handler-exceptions пойманы, логируются, но не прерывают остальных
 *   — on() возвращает функцию отписки (unsubscribe-fn)
 *   — reset() полностью очищает все подписки (использовать в тестах)
 *
 * ESM; zero deps; работает в Node ≥ 18 и в браузере (как ES-module).
 */

const handlers = new Map(); // event -> Set<handler>

const _logError = (msg, err) => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(msg, err);
  }
};

export const EventBus = {
  /**
   * Подписка на событие.
   * @param {string} event  непустое имя события ('*' — wildcard)
   * @param {Function} handler  (payload, eventName) => void
   * @returns {Function} unsubscribe
   */
  on(event, handler) {
    if (typeof event !== 'string' || event.length === 0) {
      throw new TypeError('EventBus.on: event must be a non-empty string');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('EventBus.on: handler must be a function');
    }
    let set = handlers.get(event);
    if (!set) {
      set = new Set();
      handlers.set(event, set);
    }
    set.add(handler);
    return () => EventBus.off(event, handler);
  },

  /**
   * Отписка.
   * @returns {boolean} true, если handler был найден и удалён
   */
  off(event, handler) {
    const set = handlers.get(event);
    if (!set) return false;
    const removed = set.delete(handler);
    if (set.size === 0) handlers.delete(event);
    return removed;
  },

  /**
   * Одноразовая подписка: handler вызовется ровно один раз, затем отписка.
   * @returns {Function} unsubscribe (на случай, если надо отменить до первого emit)
   */
  once(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('EventBus.once: handler must be a function');
    }
    const wrapper = (payload, name) => {
      EventBus.off(event, wrapper);
      handler(payload, name);
    };
    return EventBus.on(event, wrapper);
  },

  /**
   * Испустить событие. Вызывает (в порядке подписки):
   *   1) handlers для конкретного `event`
   *   2) handlers для '*' (wildcard)
   * Исключения в handler'ах пойманы и не прерывают цикл.
   * @returns {number} количество фактически вызванных handler'ов
   */
  emit(event, payload) {
    if (typeof event !== 'string' || event.length === 0) {
      throw new TypeError('EventBus.emit: event must be a non-empty string');
    }
    let count = 0;
    const set = handlers.get(event);
    if (set) {
      for (const h of Array.from(set)) {
        try { h(payload, event); count++; }
        catch (err) { _logError(`EventBus: handler for "${event}" threw:`, err); }
      }
    }
    if (event !== '*') {
      const wild = handlers.get('*');
      if (wild) {
        for (const h of Array.from(wild)) {
          try { h(payload, event); count++; }
          catch (err) { _logError('EventBus: wildcard handler threw:', err); }
        }
      }
    }
    return count;
  },

  /**
   * Полная очистка подписок. Для тестов и teardown.
   */
  reset() {
    handlers.clear();
  },

  /**
   * Количество подписчиков для события (для наблюдаемости / тестов).
   */
  _listenerCount(event) {
    const s = handlers.get(event);
    return s ? s.size : 0;
  },
};

export default EventBus;
