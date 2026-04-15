/* S33: i18n — RU/EN toggle with URL state + sessionStorage persistence
   Owner: S33 | Phase 2A
   Dependencies: macros.js (TS.emit/on/off), orchestrator.js (TS.readURLPriority, TS.updateURLHash)
   Overrides: I18N from macros.js with full implementation */

(function() {
  'use strict';

  var SUPPORTED_LANGS = ['ru', 'en'];
  var i18nData = { ru: {}, en: {} };
  var currentLang = 'ru';

  var I18N = {
    get lang() { return currentLang; },
    set lang(v) { currentLang = v; },

    data: i18nData,

    /**
     * Initialize i18n: load JSON data, resolve initial lang from URL priority.
     * Called from orchestrator.js init().
     */
    init: function() {
      // Load i18n data from embedded <script id="i18n-data"> or fetch
      var el = document.getElementById('i18n-data');
      if (el) {
        try {
          var parsed = JSON.parse(el.textContent);
          if (parsed.ru) i18nData.ru = parsed.ru;
          if (parsed.en) i18nData.en = parsed.en;
        } catch (e) {
          console.error('[I18N] Failed to parse i18n-data:', e);
        }
      }
      I18N.data = i18nData;

      // Resolve initial lang from URL priority cascade
      var readPriority = (window.TS && window.TS.readURLPriority) || function(key, fb) { return fb; };
      var initial = readPriority('lang', 'ru');
      if (SUPPORTED_LANGS.indexOf(initial) === -1) initial = 'ru';
      currentLang = initial;
      if (window.TS) window.TS.lang = currentLang;
    },

    /**
     * Set language with URL update + sessionStorage + event emission.
     * @param {string} v - 'ru' or 'en'
     */
    setLang: function(v) {
      if (SUPPORTED_LANGS.indexOf(v) === -1) {
        throw new Error('bad lang: ' + v);
      }
      var old = currentLang;
      if (old === v) return;
      currentLang = v;
      if (window.TS) window.TS.lang = v;

      // URL + sessionStorage persistence
      var updateHash = (window.TS && window.TS.updateURLHash) || function() {};
      updateHash('lang', v);

      // Emit event for subscribers
      if (window.TS && window.TS.emit) {
        window.TS.emit('lang-change', { old: old, 'new': v });
      }
    },

    /**
     * Translate key to current language string.
     * Supports {param} interpolation.
     * @param {string} key - Translation key (e.g. 's01.title')
     * @param {object} [params] - Interpolation params { key: value }
     * @returns {string}
     */
    t: function(key, params) {
      var dict = i18nData[currentLang] || i18nData.ru;
      var val = dict[key];

      if (val == null) {
        // Fallback: try RU if current is EN
        if (currentLang === 'en' && i18nData.ru[key] != null) {
          return '[EN:' + key + ']';
        }
        return '[!' + key + ']';
      }

      // Interpolation
      if (params) {
        Object.keys(params).forEach(function(k) {
          val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
        });
      }

      return val;
    },

    /**
     * Format number according to current locale.
     * @param {number} v
     * @param {number} [decimals]
     * @returns {string}
     */
    formatNumber: function(v, decimals) {
      if (v == null) return '\u2014';
      if (typeof v !== 'number') return String(v);
      var locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
      var opts = {};
      if (decimals != null) {
        opts.minimumFractionDigits = decimals;
        opts.maximumFractionDigits = decimals;
      }
      return new Intl.NumberFormat(locale, opts).format(v);
    },

    /**
     * Format currency value with locale-appropriate suffix.
     * @param {number} v
     * @param {object} [opts] - { suffix, decimals }
     * @returns {string}
     */
    formatCurrency: function(v, opts) {
      opts = opts || {};
      var num = I18N.formatNumber(v, opts.decimals);
      var suffix = opts.suffix || (currentLang === 'ru' ? ' \u043C\u043B\u043D \u20BD' : ' M RUB');
      return num + suffix;
    },

    /**
     * Format date according to current locale.
     * @param {Date|string} d
     * @returns {string}
     */
    formatDate: function(d) {
      if (typeof d === 'string') return d;
      var locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
      return d.toLocaleDateString(locale);
    },

    /**
     * Get current language.
     * @returns {string}
     */
    currentLang: function() { return currentLang; }
  };

  // Override macros.js I18N with full implementation
  window.I18N = I18N;
})();
