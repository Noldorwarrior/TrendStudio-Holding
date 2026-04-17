# MODULE_PROMPT — G13 Keyboard Shortcuts (TS.Keyboard)

**Модуль:** G13 — глобальный реестр и диспетчер клавиатурных шорткатов
**Волна:** 2 (первый в DAG, блокирует G8, G9, G10, G12)
**Ветка:** `phase2c/g13-keyboard`
**Коммит (первый):** `G13: TS.Keyboard global shortcut registry`
**Бюджет:** ~3 KB (ориентир, hard-cap 4 KB)
**Зависимости (уже готовы в 2A/2B):** `TS.emit`, `TS.on`, `I18N.t`, `A11Y.announce`, `NAV.go` (оркестратор)

---

## 0. ПРЕЖДЕ ЧЕМ ПИСАТЬ КОД

1. Прочти полностью:
   - Мастер-файл: `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/CC_PHASE2C_SPEC_v2.md` §G13 (строки 177-196)
   - `Handoff_Phase2C/00_infra/INFRA_PROMPT.md` §4.1 (API контракт TS.Keyboard), §6.1 (i18n ключи ui.g13.*), §6.2 (a11y.g13.kb_help), §10 (тесты)
   - Phase 2A orchestrator: `src/orchestrator.js` — оттуда NAV.go, TS.emit, TS.on
2. Убедись, что PR #101-#105 Волны 1 смержены в `claude/deck-v1.2.0-phase2c`. Файл `src/cinematic/keyboard.js` уже создан как skeleton с заглушкой `throw new Error('not implemented yet')` — ты его заполняешь.
3. Если что-то противоречит SPEC_v2 или INFRA_PROMPT — остановись, открой issue, не сочиняй.

---

## 1. ЦЕЛЬ МОДУЛЯ

Единственный централизованный реестр и диспетчер клавиатурных шорткатов в приложении. Остальные модули (G10 Cinema, G9 Sound, оркестратор навигации, drill-down) регистрируют свои бинды через `TS.Keyboard.register(...)`. Сам модуль **не знает** про кино, звук, слайды — он только ловит события, нормализует ключи, находит подходящий биндинг и вызывает его handler.

**Отдельные ответственности:**
- Нормализация ключей (кроссплатформенно, `Meta+K` → `Ctrl+K` на Windows/Linux, `Shift+?` корректно через `e.key === '?'`)
- Роутинг по контексту (`global` / `slide` / `modal`) — в modal-контексте `Esc` отрабатывается только биндом `context: 'modal'`, не глобальным закрытием.
- Игнорирование событий при фокусе в `input` / `textarea` / `contenteditable` (если `allowInInput !== true`)
- Подсказка через `?` / `H` — открывает overlay со списком шорткатов (рендерит TS.Components.Modal из 2A)
- Enable / disable всего модуля (например, Cinema Mode может временно выключить shortcut'ы)

---

## 2. API-КОНТРАКТ (фиксирован INFRA_PROMPT §4.1 — не менять)

```typescript
interface KeyBinding {
  key: string;                    // normalized form, см. §3.1
  context?: 'global'|'slide'|'modal'; // default 'global'
  description: string;            // i18n key, например 'ui.g13.kb.cinema_toggle'
  handler: (e: KeyboardEvent) => void | boolean; // return false = stopPropagation+preventDefault
  allowInInput?: boolean;         // default false
}

TS.Keyboard = {
  register(id: string, binding: KeyBinding): void,
  unregister(id: string): void,
  list(context?: string): KeyBinding[],   // без аргумента — все
  enable(): void,
  disable(): void
};
```

**Дополнительно (внутреннее, но публичное для тестов):**
- `TS.Keyboard._normalize(e: KeyboardEvent): string` — чистая функция, возвращает нормализованную строку типа `Meta+K`, `Shift+?`, `ArrowLeft`. Экспортируется для unit-тестов, но не документируется как стабильный API.
- `TS.Keyboard._state` getter — `{enabled: boolean, bindingsCount: number, activeContext: string}` — только для тестов / devtools.

---

## 3. РЕАЛИЗАЦИЯ

### 3.1 Нормализация ключа (самое важное, легко ошибиться)

Задача: из `KeyboardEvent` построить стабильную строку.

**Алгоритм:**
1. Модификаторы собираются в фиксированном порядке: `Meta`, `Ctrl`, `Alt`, `Shift` (именно так, иначе сравнение строк развалится).
2. База ключа:
   - Если `e.key.length === 1` и не-пробел — использовать `e.key.toUpperCase()` (пример: `'a'` → `'A'`, `'?'` → `'?'`).
   - Иначе использовать `e.key` как есть (`ArrowLeft`, `Escape`, `Home`, `End`, `Tab`, `Enter`, `Space` (вручную мапим `' '` → `'Space'`)).
3. Для macOS приводим `Meta` → `Meta` (command key), для Windows/Linux `Ctrl`. SPEC говорит о `Meta+K`, но CC должен уметь принимать **обе формы** при регистрации: внутренне нормализуем `Cmd+K` / `Ctrl+K` / `Meta+K` → единую каноническую форму.
4. Рекомендуемая каноническая форма (то, что регистрируется): **`Ctrl+K`** для модификатора, кроссплатформенно означающего «основной модификатор». При матчинге на `e.metaKey` на macOS **считаем её `Ctrl`** для регистрационных целей. Т.е.:
   - регистрация: `{key: 'Ctrl+K'}`
   - на macOS сработает `Cmd+K`
   - на Linux/Windows сработает `Ctrl+K`
5. `Shift+?` — в SPEC перечислен так, но на US-раскладке `?` уже требует Shift. Решение: регистрируем `'?'` (без Shift-префикса), а handler опирается на `e.key === '?'`. Нормализатор для `{shift: true, key: '?'}` возвращает `'?'` (не `'Shift+?'`), чтобы не зависеть от раскладки.

**Тестовые ожидания (см. §6.1):**
```
event {key: 'c', shiftKey: false} → 'C'
event {key: 'C', shiftKey: true} → 'C'            (shift-letter регистрируется без Shift-префикса)
event {key: 'ArrowLeft'} → 'ArrowLeft'
event {key: 'Escape'} → 'Escape'
event {key: ' '} → 'Space'
event {key: 'k', ctrlKey: true} → 'Ctrl+K'
event {key: 'k', metaKey: true} → 'Ctrl+K'        (на macOS metaKey → Ctrl в каноне)
event {key: '?', shiftKey: true} → '?'
event {key: 'ArrowLeft', shiftKey: true} → 'Shift+ArrowLeft'
event {key: 'Enter', altKey: true, ctrlKey: true} → 'Ctrl+Alt+Enter'
```

### 3.2 Реестр и регистрация

```javascript
const _bindings = new Map();   // id → KeyBinding (after normalization)
let _enabled = true;
let _activeModalContext = 0;   // счётчик: если >0, значит открыт modal и global-бинды выключены

function register(id, binding) {
  if (!id || typeof id !== 'string') throw new TypeError('id required');
  if (!binding || typeof binding.key !== 'string' || typeof binding.handler !== 'function') {
    throw new TypeError('binding must have string key + function handler');
  }
  if (_bindings.has(id)) {
    // идемпотентность: re-register обновляет; выбрасываем warn в dev
    if (typeof console !== 'undefined') console.warn('TS.Keyboard: re-registering', id);
  }
  const normalized = _canonicalKey(binding.key); // внешнее → каноническое
  _bindings.set(id, {
    ...binding,
    key: normalized,
    context: binding.context || 'global',
    allowInInput: binding.allowInInput === true
  });
}
```

`_canonicalKey(raw)` парсит строку, которую регистрирующий модуль написал (`'Cmd+K'`, `'Meta+K'`, `'Ctrl+K'`) и сводит к каноническому виду. Кейсы — в unit-тестах §6.1.

### 3.3 Обработка события

Единственный listener на `window` с `capture: true` (чтобы перехватить до всплытия в чужой код):

```javascript
window.addEventListener('keydown', onKeydown, { capture: true });

function onKeydown(e) {
  if (!_enabled) return;

  // Игнорируем при вводе (по умолчанию)
  if (_isEditable(e.target)) {
    // handler может разрешить allowInInput — тогда пропускаем дальше
  }

  const normalized = _normalize(e);
  const context = _activeContext(); // 'modal' если есть modal, иначе 'slide' или 'global'

  // Поиск: сначала modal > slide > global (приоритет контекста)
  const match = _findBinding(normalized, context);
  if (!match) return;

  if (_isEditable(e.target) && !match.allowInInput) return;

  const result = match.handler(e);
  if (result === false) {
    e.preventDefault();
    e.stopPropagation();
  }
}
```

`_isEditable(target)` возвращает `true` если:
- `target.tagName === 'INPUT'` и `target.type !== 'checkbox'` (чекбоксы не мешают шорткатам)
- `target.tagName === 'TEXTAREA'`
- `target.isContentEditable === true`

### 3.4 Контекст

`_activeContext()`:
- если в DOM открыт `.ts-modal[aria-hidden="false"]` → `'modal'`
- иначе → `'slide'` (если есть активный слайд через `NAV.currentSlide`) или `'global'`

Биндинг с `context: 'global'` активен всегда, кроме случая когда есть биндинг `context: 'modal'` с тем же ключом (modal перехватывает).

### 3.5 enable / disable

```javascript
function disable() { _enabled = false; }
function enable() { _enabled = true; }
```

Используется, например, Cinema Mode: при переходе в cinema shortcut'ы слайд-навигации остаются, но опциональные (drill-down) отключаются. **Важно:** disable отключает всё глобально. Для селективного отключения используется `unregister` по id.

### 3.6 list(context)

Возвращает массив описаний для overlay:
```javascript
function list(context) {
  const all = [..._bindings.values()];
  if (!context) return all;
  return all.filter(b => b.context === context || b.context === 'global');
}
```

Порядок: стабильный (в порядке регистрации через Map).

### 3.7 Help Overlay (`?` / `H`)

G13 **сам регистрирует** два бинда при старте:

```javascript
register('g13.help.question', {
  key: '?',
  description: 'ui.g13.kb.help',
  handler: () => { _openHelpOverlay(); return false; }
});
register('g13.help.h', {
  key: 'H',
  description: 'ui.g13.kb.help',
  handler: () => { _openHelpOverlay(); return false; }
});
```

`_openHelpOverlay()` вызывает `TS.Components.Modal.open({title: I18N.t('ui.g13.kb.help'), content: _renderHelpList()})`. В теле — таблица `<kbd>key</kbd> | I18N.t(binding.description)`. A11Y: `A11Y.announce(I18N.t('a11y.g13.kb_help'))`.

**Не дублируй реализацию Modal.** Она есть в Phase 2A `src/components.js`.

### 3.8 Глобальные шорткаты — НЕ регистрируй в G13

G13 **ничего не знает** про Cinema, Sound, NAV.go. Эти шорткаты регистрируются в своих модулях через `TS.Keyboard.register(...)`:

| Шорткат | Где регистрируется | В каком PR |
|---|---|---|
| `ArrowRight` / `Space` / `N` / `ArrowLeft` / `P` / `Home` / `End` / `1-9`,`0` / `G` | `src/orchestrator.js` (обновление Phase 2A) | в составе PR #110 G13 (малый патч оркестратора) |
| `C` Cinema | `src/cinematic/cinema_mode.js` | PR #119 G10 |
| `S` Sound | `src/cinematic/sound.js` | PR #113 G9 |
| `D` Drill-down | `src/drilldown.js` (Phase 2B — обновление) | PR #110 G13 (малый патч drilldown) |
| `L` Language | `src/i18n.js` (обновление Phase 2A) | PR #110 G13 (малый патч i18n) |
| `Esc` | универсальный: modal/cinema/easter — каждый регистрирует свой с `context: 'modal'` | в своих PR |
| `R` Reset, `F` Flip scenario | `src/controls.js` (Phase 2B) | PR #110 G13 (малый патч controls) |
| `?` / `H` | сам G13 (help overlay) | PR #110 |

**Итого в PR #110 G13** делается:
1. Полная реализация `src/cinematic/keyboard.js` (TS.Keyboard registry).
2. Регистрация шорткатов навигации в `src/orchestrator.js` (NAV-arrows, 1-9/0, G, Home, End).
3. Регистрация `D` в `src/drilldown.js` (если drill-down активен на слайде).
4. Регистрация `L` в `src/i18n.js` (toggle RU/EN).
5. Регистрация `R`/`F` в `src/controls.js` (если контролы присутствуют).
6. `?`/`H` → help overlay (в keyboard.js).

Регистрации C, S, Esc-modal — НЕ в этом PR, они в своих модулях G9, G10, G14 и т.д.

---

## 4. СОБЫТИЯ

G13 сам **никаких** кастомных событий не эмитит. Он только вызывает handler'ы, которые уже сами дёргают `TS.emit(...)` если нужно.

Исключение — a11y: при открытии help overlay вызывается `A11Y.announce(I18N.t('a11y.g13.kb_help'))`.

---

## 5. i18n и a11y

**Ключи ui.g13.kb.*** — добавлены в Волне 1 (INFRA_PROMPT §6.1), CC их НЕ создаёт заново, только использует:
- `ui.g13.kb.cinema_toggle`, `ui.g13.kb.next_slide`, `ui.g13.kb.prev_slide`, `ui.g13.kb.help`, `ui.g13.kb.sound`, `ui.g13.kb.theme`

Если при реализации нужны новые ключи (например, `ui.g13.kb.drilldown`, `ui.g13.kb.language`, `ui.g13.kb.reset`, `ui.g13.kb.flip`) — добавляй **симметрично в ru.json и en.json** в этом же PR и обновляй тест `i18n_symmetry.test.js` (он должен пройти).

**a11y ключ**: `a11y.g13.kb_help` — уже в i18n. Используй его в `A11Y.announce`.

---

## 6. ТЕСТЫ (обязательно пройти до push)

**Файл:** `src/cinematic/__tests__/keyboard.test.js`
**Runner:** Jest (см. INFRA_PROMPT §10)

**Минимальный набор — 12 unit + 3 integration = 15 тестов. Меньше — PR отклоняется.**

### 6.1 Unit-тесты нормализатора

```javascript
import { _normalize, _canonicalKey } from '../keyboard.js';

describe('G13 _normalize', () => {
  const ev = (opts) => ({ key: '', shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...opts });

  test('lowercase letter → uppercase', () => {
    expect(_normalize(ev({ key: 'c' }))).toBe('C');
  });
  test('shift+letter → letter (no Shift prefix)', () => {
    expect(_normalize(ev({ key: 'C', shiftKey: true }))).toBe('C');
  });
  test('ArrowLeft → ArrowLeft', () => {
    expect(_normalize(ev({ key: 'ArrowLeft' }))).toBe('ArrowLeft');
  });
  test('space → Space', () => {
    expect(_normalize(ev({ key: ' ' }))).toBe('Space');
  });
  test('ctrl+k → Ctrl+K', () => {
    expect(_normalize(ev({ key: 'k', ctrlKey: true }))).toBe('Ctrl+K');
  });
  test('meta+k → Ctrl+K (canonical)', () => {
    expect(_normalize(ev({ key: 'k', metaKey: true }))).toBe('Ctrl+K');
  });
  test('shift+? → ? (no Shift prefix)', () => {
    expect(_normalize(ev({ key: '?', shiftKey: true }))).toBe('?');
  });
  test('shift+arrow → Shift+ArrowLeft (modifier kept for non-letter)', () => {
    expect(_normalize(ev({ key: 'ArrowLeft', shiftKey: true }))).toBe('Shift+ArrowLeft');
  });
  test('ctrl+alt+enter → Ctrl+Alt+Enter (fixed order)', () => {
    expect(_normalize(ev({ key: 'Enter', altKey: true, ctrlKey: true }))).toBe('Ctrl+Alt+Enter');
  });
  test('_canonicalKey("Cmd+K") === _canonicalKey("Meta+K") === "Ctrl+K"', () => {
    expect(_canonicalKey('Cmd+K')).toBe('Ctrl+K');
    expect(_canonicalKey('Meta+K')).toBe('Ctrl+K');
    expect(_canonicalKey('Ctrl+K')).toBe('Ctrl+K');
  });
});
```

### 6.2 Unit-тесты реестра

```javascript
describe('G13 register/unregister/list', () => {
  beforeEach(() => { TS.Keyboard._reset(); }); // экспортировать для тестов

  test('register + list возвращает биндинг', () => {
    TS.Keyboard.register('test.a', { key: 'A', description: 'd', handler: () => {} });
    expect(TS.Keyboard.list().map(b => b.description)).toContain('d');
  });

  test('register с невалидным id / handler выбрасывает TypeError', () => {
    expect(() => TS.Keyboard.register('', { key: 'A', description: 'd', handler: () => {} })).toThrow(TypeError);
    expect(() => TS.Keyboard.register('x', { key: 'A', description: 'd' })).toThrow(TypeError);
  });

  test('unregister удаляет биндинг', () => {
    TS.Keyboard.register('test.a', { key: 'A', description: 'd', handler: () => {} });
    TS.Keyboard.unregister('test.a');
    expect(TS.Keyboard.list()).toEqual([]);
  });
});
```

### 6.3 Integration (симуляция keydown)

```javascript
describe('G13 event dispatch', () => {
  let calls;
  beforeEach(() => { TS.Keyboard._reset(); calls = []; });

  test('простой хоткей вызывает handler', () => {
    TS.Keyboard.register('t.1', { key: 'A', description: 'd', handler: () => calls.push('a') });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(calls).toEqual(['a']);
  });

  test('игнорируется в input (allowInInput false)', () => {
    TS.Keyboard.register('t.1', { key: 'A', description: 'd', handler: () => calls.push('a') });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(calls).toEqual([]);
    document.body.removeChild(input);
  });

  test('modal context перехватывает global', () => {
    const modal = document.createElement('div');
    modal.className = 'ts-modal';
    modal.setAttribute('aria-hidden', 'false');
    document.body.appendChild(modal);
    TS.Keyboard.register('g.esc', { key: 'Escape', context: 'global', description: 'd', handler: () => calls.push('global') });
    TS.Keyboard.register('m.esc', { key: 'Escape', context: 'modal', description: 'd', handler: () => calls.push('modal') });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(calls).toEqual(['modal']);
    document.body.removeChild(modal);
  });
});
```

**Если у тебя после написания кода один из этих тестов красный — НЕ коммить, разберись.**

---

## 7. ACCEPTANCE CRITERIA (что ревьюер проверит)

- [ ] `src/cinematic/keyboard.js` реализует TS.Keyboard согласно §2 API
- [ ] 15+ тестов в `__tests__/keyboard.test.js` зелёные (Jest)
- [ ] Нормализатор проходит все 10 кейсов из §3.1
- [ ] `modal > slide > global` приоритет контекста
- [ ] allowInInput false по умолчанию, не блокирует шорткат если handler сам явно разрешил
- [ ] Patch-файлы оркестратора/drilldown/i18n/controls — минимальные, регистрируют шорткаты навигации. Старые тесты Phase 2A/2B по этим файлам — НЕ падают.
- [ ] `i18n_symmetry.test.js` зелёный (если добавлялись новые ключи)
- [ ] Help overlay открывается по `?` / `H` и корректно рендерит список (проверь руками или через e2e)
- [ ] Размер `keyboard.js` ≤ 4 KB minified (проверь через `wc -c`)
- [ ] Нет `eval`, `new Function`, `localStorage` в модуле (grep -n)
- [ ] Код-коммент шапка модуля на английском с JSDoc-описанием API
- [ ] Коммит-сообщение соответствует `commit_convention.md` (префикс `G13:`)

---

## 8. ЧТО ЗАПРЕЩЕНО

- `eval`, `new Function(...)` — вообще и конкретно в этом модуле
- `localStorage`, `sessionStorage` (исключение: Phase 2A уже использует sessionStorage для URL-state — НЕ трогать, не добавлять новое)
- Прямой вызов `NAV.go`, `Cinema.enter`, `Sound.enable` из `keyboard.js` — эти шорткаты регистрируются в соответствующих модулях, не здесь
- Глобальные утечки слушателей (listener вешается ровно один, в `init()`)
- Подавление `keydown` на полях ввода (`input`, `textarea`) — по умолчанию не трогаем, пользователь должен уметь печатать
- Обработка через `keyup` / `keypress` — только `keydown`
- Нарушение API контракта из §4.1 INFRA_PROMPT

---

## 9. SELF-CHECK ПЕРЕД КОММИТОМ

```bash
# 1. Тесты модуля
npm test -- src/cinematic/__tests__/keyboard.test.js
# Ожидание: 15+ зелёных, 0 красных, 0 skip

# 2. Полный прогон (не сломали ли Phase 2A/2B)
npm test
# Ожидание: все Phase 2A + 2B тесты остаются зелёными; всего ≥ 365 (350 прошлые + 15+ новые)

# 3. Размер
wc -c src/cinematic/keyboard.js
# Ожидание: ≤ 4096 байт; если больше — рефактор или issue

# 4. Запрещённое
grep -nE 'eval\(|new Function|localStorage' src/cinematic/keyboard.js
# Ожидание: пусто

# 5. i18n симметрия (если менял ключи)
npm test -- src/__tests__/i18n_symmetry.test.js

# 6. Build (проверить, что HTML всё ещё собирается)
python scripts/build_html.py
# Ожидание: успех, итоговый размер HTML < 450 KB (Волна 1 + G13 должна быть в бюджете)
```

---

## 10. PATCH-ФАЙЛЫ В ДРУГИХ МОДУЛЯХ

Этот PR также трогает следующие файлы Phase 2A/2B (минимально, чтобы они зарегистрировали свои шорткаты):

### `src/orchestrator.js` (Phase 2A)

Добавить в конец функции `NAV.init(...)` (или аналогичное место инициализации):
```javascript
// Phase 2C G13 — navigation shortcuts
if (window.TS && TS.Keyboard) {
  TS.Keyboard.register('nav.next', { key: 'ArrowRight', description: 'ui.g13.kb.next_slide', handler: () => { NAV.next(); return false; } });
  TS.Keyboard.register('nav.prev', { key: 'ArrowLeft', description: 'ui.g13.kb.prev_slide', handler: () => { NAV.prev(); return false; } });
  TS.Keyboard.register('nav.space', { key: 'Space', description: 'ui.g13.kb.next_slide', handler: () => { NAV.next(); return false; } });
  TS.Keyboard.register('nav.n', { key: 'N', description: 'ui.g13.kb.next_slide', handler: () => { NAV.next(); return false; } });
  TS.Keyboard.register('nav.p', { key: 'P', description: 'ui.g13.kb.prev_slide', handler: () => { NAV.prev(); return false; } });
  TS.Keyboard.register('nav.home', { key: 'Home', description: 'ui.g13.kb.next_slide', handler: () => { NAV.go(1); return false; } });
  TS.Keyboard.register('nav.end', { key: 'End', description: 'ui.g13.kb.next_slide', handler: () => { NAV.go(25); return false; } });
  for (let n = 1; n <= 9; n++) {
    TS.Keyboard.register(`nav.${n}`, { key: String(n), description: 'ui.g13.kb.next_slide', handler: () => { NAV.go(n); return false; } });
  }
  TS.Keyboard.register('nav.0', { key: '0', description: 'ui.g13.kb.next_slide', handler: () => { NAV.go(10); return false; } });
  TS.Keyboard.register('nav.goto', { key: 'G', description: 'ui.g13.kb.next_slide', handler: () => { _openGotoPrompt(); return false; } });
}
```

`_openGotoPrompt()` — минимальная реализация: `prompt('Go to slide 1-25:')` → парсинг числа → `NAV.go(n)`. Если prompt неприемлем по UX, используй TS.Components.Modal с input'ом (лучше, но больше кода). Выбор оставлен на CC, главное — тесты покрывают оба случая через мок.

### `src/drilldown.js` (Phase 2B)

В `Drilldown.init` или `registerChart`:
```javascript
if (window.TS && TS.Keyboard) {
  TS.Keyboard.register('drilldown.d', {
    key: 'D',
    description: 'ui.g13.kb.drilldown', // НОВЫЙ КЛЮЧ — добавь в ru.json + en.json
    handler: () => {
      if (Drilldown.canOpenOnCurrentSlide()) { Drilldown.open(); return false; }
      return true; // не блокируем, если нечего открыть
    }
  });
}
```

### `src/i18n.js` (Phase 2A)

```javascript
if (window.TS && TS.Keyboard) {
  TS.Keyboard.register('i18n.l', {
    key: 'L',
    description: 'ui.g13.kb.language', // НОВЫЙ КЛЮЧ
    handler: () => { I18N.toggle(); return false; }
  });
}
```

### `src/controls.js` (Phase 2B)

```javascript
if (window.TS && TS.Keyboard) {
  TS.Keyboard.register('controls.r', {
    key: 'R',
    description: 'ui.g13.kb.reset', // НОВЫЙ КЛЮЧ
    handler: () => { Controls.resetScenario(); return false; }
  });
  TS.Keyboard.register('controls.f', {
    key: 'F',
    description: 'ui.g13.kb.flip', // НОВЫЙ КЛЮЧ
    handler: () => { Controls.flipScenario(); return false; }
  });
}
```

**Новые i18n-ключи** (добавить в `i18n/ru.json` и `i18n/en.json`):
```
ui.g13.kb.drilldown    RU "Подробности (D)"     EN "Drill-down (D)"
ui.g13.kb.language     RU "Язык (L)"             EN "Language (L)"
ui.g13.kb.reset        RU "Сбросить сценарий (R)" EN "Reset scenario (R)"
ui.g13.kb.flip         RU "Переключить сценарий (F)" EN "Flip scenario (F)"
```

**Обнови `i18n_symmetry.test.js` через полный прогон — он сам проверит.**

---

## 11. CHECKLIST PR #110

Когда всё готово:

- [ ] `src/cinematic/keyboard.js` — 150-200 строк, ≤ 4 KB
- [ ] `src/cinematic/__tests__/keyboard.test.js` — 15+ тестов зелёные
- [ ] `src/orchestrator.js` патч — NAV шорткаты
- [ ] `src/drilldown.js` патч — D
- [ ] `src/i18n.js` патч — L
- [ ] `src/controls.js` патч — R, F
- [ ] `i18n/ru.json` + `i18n/en.json` — 4 новых ключа, симметрично
- [ ] `npm test` — зелёно, ≥ 365 тестов
- [ ] HTML bundle после build — ≤ 450 KB
- [ ] Commit: `G13: TS.Keyboard global shortcut registry`
- [ ] Body коммита:
  ```
  Registry with normalize(meta→ctrl, shift+letter→letter), context routing
  (modal > slide > global), input-editable guard, enable/disable, help overlay
  via TS.Components.Modal. Patches orchestrator/drilldown/i18n/controls to
  register nav/D/L/R/F shortcuts. New i18n keys ui.g13.kb.{drilldown,language,reset,flip}
  symmetric RU/EN.
  ```
- [ ] Branch: `phase2c/g13-keyboard` → push → PR открыт, НЕ мержить самостоятельно

---

## 12. ЕСЛИ ЗАСТРЯЛ

- Нормализатор ведёт себя странно на `shift+?` — проверь `e.key` в браузерной консоли, он даёт `'?'` после shift (не `'/'`); нам этого достаточно.
- `Meta+K` не ловится на macOS — убедись, что `window.addEventListener('keydown', ..., {capture: true})` и нет `e.preventDefault()` до твоего listener.
- `Esc` двойное срабатывание (закрывается и modal, и cinema) — modal должен иметь `context: 'modal'` и перехватывать первым. Если всё равно — открой issue, покажи в логе какой listener отработал.
- Какой-то Phase 2A тест падает — не отключай, это регрессия. Открой issue с именем падающего теста.

---

_Версия: 1.0 (17 апр 2026)_
_Соответствует SPEC_v2 §G13 + INFRA_PROMPT §4.1, §6.1, §6.2, §10_
