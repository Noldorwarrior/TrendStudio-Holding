/**
 * TS-core barrel — публичный экспорт ядра Landing v1.0.
 *
 * Использование (ESM):
 *   import { TS } from './core/index.js';
 *   TS.EventBus.on('boot:ready', ...);
 *   TS.I18N.format('ui.cta.invest');
 *
 * Или именованно:
 *   import { I18N, A11y, EventBus, Orchestrator } from './core/index.js';
 *
 * Намеренно НЕ создаём global `window.TS` — namespace создаёт точка входа
 * (boot.js / inline-script лендинга), чтобы это ядро оставалось чистым ESM
 * и работало в Node-тестах без side-effects.
 */
import { EventBus } from './eventbus.js';
import { I18N } from './i18n.js';
import { A11y } from './a11y.js';
import { Orchestrator } from './orchestrator.js';

export { EventBus, I18N, A11y, Orchestrator };

/** Удобный namespace-объект (без присваивания в global). */
export const TS = Object.freeze({
  EventBus,
  I18N,
  A11y,
  Orchestrator,
});

export default TS;
