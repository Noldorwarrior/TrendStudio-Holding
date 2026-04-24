/**
 * TS.I18N — i18n-движок Landing v1.0
 *
 * Контракт (из B1b.2 и CLAUDE.md):
 *   init({ ru, en, locale? })            — передать словари и начальную локаль
 *   format(key, vars?)                   — форматирование по ключу
 *   setLocale(locale)                    — переключение с emit('locale:changed')
 *   getLocale() / getAvailableLocales()  — инспекция
 *   reset()                              — очистка состояния (тесты)
 *
 * Формат ключей: "ns.sub.leaf" (точки как разделитель nested-путей).
 *   Сначала пробуем плоский матч obj[key], затем nested-walk.
 *
 * Плейсхолдеры: {varName}
 *   "{count} проектов" + { count: 3 }  →  "3 проектов"
 *   Необъявленный var остаётся буквально: "{missing}"
 *
 * ICU-lite plural (весь value — plural-блок):
 *   "{count, plural, one {# проект} few {# проекта} many {# проектов} other {# проекта}}"
 *   Использует Intl.PluralRules(locale). '#' заменяется на значение count.
 *   RU категории: one/few/many/other.  EN категории: one/other.
 *
 * Fallback-стратегия:
 *   — неизвестный ключ           → возвращает сам key (и warn в консоль)
 *   — значение не string/number   → String(value)
 *
 * ESM, zero deps (кроме EventBus).
 */
import { EventBus } from './eventbus.js';

const SUPPORTED_LOCALES = ['ru', 'en'];
const DEFAULT_LOCALE = 'ru';

let translations = { ru: {}, en: {} };
let currentLocale = DEFAULT_LOCALE;

const _warn = (msg) => {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(msg);
  }
};

/** Внутренний резолв ключа в словаре: flat-match → nested-walk. */
function _resolve(dict, key) {
  if (dict === null || typeof dict !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  const parts = key.split('.');
  let node = dict;
  for (const part of parts) {
    if (node && typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, part)) {
      node = node[part];
    } else {
      return undefined;
    }
  }
  return node;
}

/** Проверка: строка целиком — plural-блок? */
function _isPluralBlock(str) {
  return typeof str === 'string'
    && /^\s*\{\s*\w+\s*,\s*plural\s*,/.test(str)
    && str.trim().endsWith('}');
}

/** Парсер plural-блока. Возвращает { varName, cases: { one, few, many, other } }. */
function _parsePlural(str) {
  const trimmed = str.trim();
  // Снять внешние {}
  const inner = trimmed.slice(1, -1).trim();
  const header = inner.match(/^(\w+)\s*,\s*plural\s*,\s*/);
  if (!header) return null;
  const varName = header[1];
  let i = header[0].length;
  const cases = {};
  while (i < inner.length) {
    while (i < inner.length && /\s/.test(inner[i])) i++;
    if (i >= inner.length) break;
    const nameMatch = inner.slice(i).match(/^([\w=]+)\s*\{/);
    if (!nameMatch) break;
    const caseName = nameMatch[1];
    i += nameMatch[0].length;
    let depth = 1;
    const start = i;
    while (i < inner.length && depth > 0) {
      const ch = inner[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) break;
      }
      i++;
    }
    cases[caseName] = inner.slice(start, i);
    i++; // skip closing '}'
  }
  return { varName, cases };
}

/** Выбор plural-кейса. */
function _pickPlural(cases, count, locale) {
  // Явные case '=0', '=1' и т.п. имеют приоритет
  const exact = `=${count}`;
  if (Object.prototype.hasOwnProperty.call(cases, exact)) return cases[exact];
  let category = 'other';
  try {
    category = new Intl.PluralRules(locale).select(count);
  } catch (_) { /* Intl может отсутствовать — fallback на 'other' */ }
  if (Object.prototype.hasOwnProperty.call(cases, category)) return cases[category];
  return cases.other !== undefined ? cases.other : '';
}

/** Интерполяция переменных {name} (и '#' для plural). */
function _interpolate(template, vars, hashValue) {
  let result = template;
  if (hashValue !== undefined) {
    result = result.replace(/#/g, String(hashValue));
  }
  return result.replace(/\{(\w+)\}/g, (_m, name) => {
    if (vars && Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return `{${name}}`;
  });
}

export const I18N = {
  /**
   * Инициализация словарей и начальной локали.
   * @param {{ru:object, en:object, locale?:string}} opts
   */
  init(opts) {
    if (!opts || typeof opts !== 'object') {
      throw new TypeError('I18N.init: opts must be an object');
    }
    if (!opts.ru || typeof opts.ru !== 'object') {
      throw new TypeError('I18N.init: opts.ru must be an object');
    }
    if (!opts.en || typeof opts.en !== 'object') {
      throw new TypeError('I18N.init: opts.en must be an object');
    }
    translations = { ru: opts.ru, en: opts.en };
    const locale = opts.locale || DEFAULT_LOCALE;
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new RangeError(`I18N.init: unsupported locale "${locale}" (expected ru|en)`);
    }
    currentLocale = locale;
  },

  /**
   * Форматирование значения по ключу.
   * @param {string} key
   * @param {object?} vars
   * @returns {string}
   */
  format(key, vars) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('I18N.format: key must be a non-empty string');
    }
    const dict = translations[currentLocale] || {};
    let value = _resolve(dict, key);
    if (value === undefined) {
      _warn(`I18N: missing key "${key}" for locale "${currentLocale}"`);
      return key;
    }
    if (typeof value !== 'string') {
      return String(value);
    }
    if (_isPluralBlock(value)) {
      const parsed = _parsePlural(value);
      if (!parsed) return value;
      const count = vars && vars[parsed.varName];
      if (typeof count !== 'number') {
        _warn(`I18N: plural key "${key}" expects numeric vars.${parsed.varName}`);
        return _interpolate(value, vars);
      }
      const chosen = _pickPlural(parsed.cases, count, currentLocale);
      return _interpolate(chosen, vars, count);
    }
    return _interpolate(value, vars);
  },

  /**
   * Переключение локали с emit('locale:changed', newLocale).
   * Если локаль уже текущая — emit не происходит (no-op).
   */
  setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new RangeError(`I18N.setLocale: unsupported locale "${locale}"`);
    }
    if (locale === currentLocale) return false;
    currentLocale = locale;
    EventBus.emit('locale:changed', locale);
    return true;
  },

  getLocale() {
    return currentLocale;
  },

  getAvailableLocales() {
    return SUPPORTED_LOCALES.slice();
  },

  /** true, если ключ существует в активной локали. */
  has(key) {
    const dict = translations[currentLocale] || {};
    return _resolve(dict, key) !== undefined;
  },

  /** Очистка состояния (для тестов). */
  reset() {
    translations = { ru: {}, en: {} };
    currentLocale = DEFAULT_LOCALE;
  },
};

export default I18N;
