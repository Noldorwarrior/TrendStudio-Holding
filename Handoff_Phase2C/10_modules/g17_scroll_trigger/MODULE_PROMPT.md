# MODULE_PROMPT — G17 Scroll Trigger (TS.ScrollTrigger)

**Модуль:** G17 — IntersectionObserver + slide lifecycle dispatcher
**Волна:** 2 (второй после G13, параллельно)
**Ветка:** `phase2c/g17-scroll-trigger`
**Коммит (первый):** `G17: TS.ScrollTrigger IntersectionObserver + slide lifecycle`
**Бюджет:** ~4 KB (ориентир, hard-cap 5 KB)
**Зависимости (готовы в 2A/2B):** `TS.emit`, `TS.on`, `A11Y.announce`, `I18N.t`
**Порядок:** независим от G13, можно разрабатывать параллельно

---

## 0. ПРЕЖДЕ ЧЕМ ПИСАТЬ КОД

1. Прочти:
   - Мастер-файл: `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/CC_PHASE2C_SPEC_v2.md` §G17 (строки 254-269)
   - `Handoff_Phase2C/00_infra/INFRA_PROMPT.md` §4.2 (API контракт), §6.2 (a11y.g17.slide_entered), §10 (тесты)
2. Убедись, что PR #101-#105 Волны 1 смержены в `claude/deck-v1.2.0-phase2c`. Skeleton `src/cinematic/scroll_trigger.js` уже есть — ты его заполняешь.
3. Если что-то противоречит SPEC_v2 или INFRA_PROMPT — остановись, open issue, не гадай.

---

## 1. ЦЕЛЬ МОДУЛЯ

Единственный диспетчер lifecycle слайдов: «пользователь вошёл в слайд N», «пользователь вышел», «слайд активен более чем на X%». Основан на IntersectionObserver — слайды регистрируются, модуль сам наблюдает их видимость, вызывает onEnter/onExit и эмитит `TS.emit('slide:enter', …)` / `TS.emit('slide:exit', …)`.

**Отдельные ответственности:**
- Регистрация/снятие SlideTrigger
- Наблюдение через один общий IntersectionObserver (а не по одному на слайд — это дешевле)
- Отслеживание «первый ли раз зашли» (`firstTime` параметр для onEnter)
- Fast-mode детекция — при быстрой wheel-навигации между слайдами (< 50 ms между tick'ами) onEnter получает флаг `{ fast: true }`, чтобы модули анимаций могли пропустить intro-анимации
- a11y объявление при входе (`A11Y.announce` с ключом `a11y.g17.slide_entered`)
- Refresh после DOM-мутаций (если слайд был ре-рендерен — IO иногда теряет наблюдаемость)
- Pause/resume в Cinema Mode (опционально, см. §3.8)
- onProgress (опциональное расширение из SPEC — см. §3.6, оставлено, но не обязательно в этом PR)

**Что НЕ делает:**
- Не рулит навигацией — это делает orchestrator (NAV из Phase 2A)
- Не скроллит страницу сам
- Не знает про конкретные слайды и что в них запускать (это делают SLIDE_PROMPTs в Волне 6)

---

## 2. API-КОНТРАКТ (фиксирован INFRA_PROMPT §4.2 — не менять)

```typescript
interface SlideTrigger {
  slideId: string;           // 's01' .. 's25'
  threshold?: number;        // 0..1, default 0.5 (50% visible)
  onEnter?: (ctx: { firstTime: boolean, fast: boolean, direction: 'forward'|'backward'|'none' }) => void;
  onExit?: (ctx: { direction: 'forward'|'backward'|'none' }) => void;
  onProgress?: (ratio: number) => void; // optional, 0..1, throttled to rAF
  once?: boolean;            // default false
}

TS.ScrollTrigger = {
  register(trigger: SlideTrigger): void,
  unregister(slideId: string): void,
  refresh(): void,                  // rerun IO after DOM mutation
  isVisible(slideId: string): boolean,
  // internal, exposed for tests:
  _reset(): void,
  _state(): { enabled: boolean, triggers: number, lastEnterTs: number }
};
```

**События (TS.emit / TS.on из Phase 2A):**
- `TS.emit('slide:enter', { slideId, firstTime, fast, direction })`
- `TS.emit('slide:exit', { slideId, direction })`
- `TS.emit('slide:progress', { slideId, ratio })` — только если у триггера есть onProgress

---

## 3. РЕАЛИЗАЦИЯ

### 3.1 Единый IntersectionObserver

Все триггеры наблюдаются одним общим IO, чтобы не плодить наблюдателей:

```javascript
const _triggers = new Map(); // slideId -> SlideTrigger (normalized)
const _visitedOnce = new Set(); // slideIds, что были посещены хотя бы раз
let _observer = null;
let _lastEnterTs = 0;           // для fast-mode
let _currentVisible = null;     // slideId, который сейчас самый видимый (onEnter уже вызван)
let _enabled = true;

function _ensureObserver() {
  if (_observer) return;
  _observer = new IntersectionObserver(_onIntersect, {
    threshold: [0, 0.25, 0.5, 0.75, 1],  // фиксированные пороги, чтобы onProgress работал дискретно
    root: null                            // viewport
  });
}

function register(trigger) {
  if (!trigger || typeof trigger.slideId !== 'string') throw new TypeError('slideId required');
  const el = document.querySelector(`[data-slide-id="${trigger.slideId}"]`)
         || document.getElementById(trigger.slideId);
  if (!el) { console.warn('TS.ScrollTrigger: element not found for', trigger.slideId); return; }
  _ensureObserver();
  const normalized = {
    slideId: trigger.slideId,
    threshold: typeof trigger.threshold === 'number' ? trigger.threshold : 0.5,
    onEnter: trigger.onEnter,
    onExit: trigger.onExit,
    onProgress: trigger.onProgress,
    once: trigger.once === true,
    _el: el
  };
  _triggers.set(trigger.slideId, normalized);
  _observer.observe(el);
}
```

### 3.2 Обработка Intersection

```javascript
function _onIntersect(entries) {
  if (!_enabled) return;
  // Сортируем по ratio убывающей — чтобы самый видимый слайд был первым
  entries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  for (const entry of entries) {
    const slideId = _findSlideIdByEl(entry.target);
    if (!slideId) continue;
    const t = _triggers.get(slideId);
    if (!t) continue;

    const ratio = entry.intersectionRatio;
    const nowVisible = ratio >= t.threshold;

    // onProgress — при любом изменении ratio
    if (t.onProgress) {
      _scheduleProgress(slideId, ratio);
    }

    if (nowVisible && _currentVisible !== slideId) {
      _handleEnter(slideId, t);
    } else if (!nowVisible && _currentVisible === slideId) {
      _handleExit(slideId, t);
    }
  }
}
```

### 3.3 Enter

```javascript
function _handleEnter(slideId, t) {
  const now = performance.now();
  const fast = (now - _lastEnterTs) < 50; // SPEC §G17: fast-mode < 50ms
  const firstTime = !_visitedOnce.has(slideId);
  const previous = _currentVisible;
  const direction = _computeDirection(previous, slideId); // 'forward'|'backward'|'none'

  _lastEnterTs = now;
  _visitedOnce.add(slideId);
  _currentVisible = slideId;

  // Сначала exit предыдущего слайда (если был)
  if (previous) {
    const prevTrigger = _triggers.get(previous);
    if (prevTrigger && prevTrigger.onExit) {
      try { prevTrigger.onExit({ direction }); } catch (err) { console.error('G17 onExit failed', err); }
    }
    TS.emit('slide:exit', { slideId: previous, direction });
  }

  // Потом enter нового
  if (t.onEnter) {
    try { t.onEnter({ firstTime, fast, direction }); } catch (err) { console.error('G17 onEnter failed', err); }
  }
  TS.emit('slide:enter', { slideId, firstTime, fast, direction });

  // A11Y announce — только если не fast (иначе скринридер захлёбывается)
  if (!fast && window.A11Y && I18N) {
    const slideNum = _slideIdToNumber(slideId); // 's03' → 3
    A11Y.announce(I18N.t('a11y.g17.slide_entered', { n: slideNum }));
  }

  if (t.once) {
    unregister(slideId);
  }
}
```

### 3.4 Exit

```javascript
function _handleExit(slideId, t) {
  if (_currentVisible !== slideId) return; // защита от двойных exit
  _currentVisible = null;
  const direction = _computeDirection(slideId, null);
  if (t.onExit) {
    try { t.onExit({ direction }); } catch (err) { console.error('G17 onExit failed', err); }
  }
  TS.emit('slide:exit', { slideId, direction });
}
```

### 3.5 Direction (forward / backward / none)

```javascript
function _computeDirection(fromId, toId) {
  if (!fromId || !toId) return 'none';
  const a = _slideIdToNumber(fromId);
  const b = _slideIdToNumber(toId);
  if (Number.isNaN(a) || Number.isNaN(b)) return 'none';
  return b > a ? 'forward' : b < a ? 'backward' : 'none';
}

function _slideIdToNumber(id) {
  // 's03' → 3, 's25' → 25. Если не подходит — NaN.
  const m = /^s(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : NaN;
}
```

### 3.6 onProgress (throttled to rAF)

```javascript
const _progressQueue = new Map(); // slideId -> latest ratio
let _rafScheduled = false;

function _scheduleProgress(slideId, ratio) {
  _progressQueue.set(slideId, ratio);
  if (_rafScheduled) return;
  _rafScheduled = true;
  requestAnimationFrame(() => {
    _rafScheduled = false;
    for (const [id, r] of _progressQueue) {
      const t = _triggers.get(id);
      if (t && t.onProgress) {
        try { t.onProgress(r); } catch (err) { console.error('G17 onProgress failed', err); }
      }
      TS.emit('slide:progress', { slideId: id, ratio: r });
    }
    _progressQueue.clear();
  });
}
```

Это гарантирует, что onProgress не вызывается чаще чем раз за рендерный тик. Нет throttle-тяжёлых функций → нет риска дропа FPS.

### 3.7 refresh()

После ре-рендера слайдов (например, Language toggle) observer теряет наблюдаемые элементы (они заменяются на новые ноды). `refresh()`:

```javascript
function refresh() {
  if (!_observer) return;
  _observer.disconnect();
  _observer = null;
  _ensureObserver();
  for (const t of _triggers.values()) {
    const el = document.querySelector(`[data-slide-id="${t.slideId}"]`) || document.getElementById(t.slideId);
    if (el) {
      t._el = el;
      _observer.observe(el);
    }
  }
}
```

Orchestrator при смене языка вызовет `TS.ScrollTrigger.refresh()` (патч Phase 2A).

### 3.8 Cinema Mode hook (необязательно, можно отложить)

Если G10 (Cinema Mode) попросит — G17 не перезапускает анимации на повторный enter (чтобы не дёргать). Реализуется через флаг `_cinemaActive`:

```javascript
TS.on('cinema:toggled', ({ active }) => { _cinemaActive = active; });
// в _handleEnter:
if (_cinemaActive && !firstTime) {
  // не пускаем onEnter intro-анимации: эмитим кастом fast:true
  return t.onEnter({ firstTime: false, fast: true, direction });
}
```

Оставь это в коде как комментированный ready-to-enable фрагмент, но сам Cinema Mode приедет в Волне 5 (PR #119). В acceptance для G17 **это не обязательно**.

### 3.9 unregister / isVisible / _reset

```javascript
function unregister(slideId) {
  const t = _triggers.get(slideId);
  if (!t) return;
  if (_observer && t._el) _observer.unobserve(t._el);
  _triggers.delete(slideId);
  if (_currentVisible === slideId) _currentVisible = null;
}

function isVisible(slideId) {
  return _currentVisible === slideId;
}

// Для тестов:
function _reset() {
  if (_observer) _observer.disconnect();
  _observer = null;
  _triggers.clear();
  _visitedOnce.clear();
  _currentVisible = null;
  _lastEnterTs = 0;
  _progressQueue.clear();
}
```

---

## 4. СОБЫТИЯ

Публикуемые (подписываются orchestrator, сами модули G8/G9/G10, слайды):
- `TS.emit('slide:enter', { slideId, firstTime, fast, direction })`
- `TS.emit('slide:exit', { slideId, direction })`
- `TS.emit('slide:progress', { slideId, ratio })` — только для триггеров с onProgress

Слушаемые (опционально):
- `TS.on('cinema:toggled', …)` — см. §3.8 (оставить коммент, не включать)

---

## 5. i18n / a11y

Ключи **уже есть** из Волны 1 (INFRA_PROMPT §6.2):
- `a11y.g17.slide_entered` → `"Активирован слайд {n}"` / `"Slide {n} activated"`

Шаблон `{n}` — номер слайда (1-25). `I18N.t` из Phase 2A должен уметь подставлять параметры. Если не умеет (проверь `src/i18n.js`) — добавь минимальную поддержку (например, простой `.replace('{n}', String(n))`) и сразу тест. Симметрия RU↔EN — тест должен остаться зелёным.

---

## 6. ТЕСТЫ (обязательно пройти до push)

**Файл:** `src/cinematic/__tests__/scroll_trigger.test.js`
**Runner:** Jest
**Минимум:** 12 unit + 3 integration = 15 тестов. Меньше — PR отклоняется.

**Важно:** IntersectionObserver отсутствует в jsdom. Нужен mock:

```javascript
// Mock IntersectionObserver
class MockIO {
  constructor(cb, opts) { this.cb = cb; this.opts = opts; this.targets = new Set(); MockIO.instances.push(this); }
  observe(el) { this.targets.add(el); }
  unobserve(el) { this.targets.delete(el); }
  disconnect() { this.targets.clear(); }
  // test helper: симуляция изменения видимости
  trigger(el, ratio) {
    this.cb([{ target: el, intersectionRatio: ratio, isIntersecting: ratio > 0 }]);
  }
  static instances = [];
  static reset() { MockIO.instances = []; }
}
global.IntersectionObserver = MockIO;
```

### 6.1 Unit — register / unregister / isVisible

```javascript
beforeEach(() => { MockIO.reset(); TS.ScrollTrigger._reset(); document.body.innerHTML = ''; });

test('register добавляет триггер и наблюдает элемент', () => {
  const el = document.createElement('section');
  el.id = 's01';
  document.body.appendChild(el);
  TS.ScrollTrigger.register({ slideId: 's01' });
  expect(MockIO.instances[0].targets.has(el)).toBe(true);
});

test('register без slideId выбрасывает TypeError', () => {
  expect(() => TS.ScrollTrigger.register({})).toThrow(TypeError);
});

test('register с отсутствующим элементом — warn, но не crash', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  TS.ScrollTrigger.register({ slideId: 's99' });
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('unregister снимает наблюдение', () => {
  const el = document.createElement('section'); el.id = 's01'; document.body.appendChild(el);
  TS.ScrollTrigger.register({ slideId: 's01' });
  TS.ScrollTrigger.unregister('s01');
  expect(MockIO.instances[0].targets.has(el)).toBe(false);
});
```

### 6.2 Unit — onEnter/onExit/firstTime/fast

```javascript
test('onEnter вызывается при ratio >= threshold', () => {
  const el = document.createElement('section'); el.id = 's01'; document.body.appendChild(el);
  const onEnter = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's01', onEnter, threshold: 0.5 });
  MockIO.instances[0].trigger(el, 0.75);
  expect(onEnter).toHaveBeenCalledWith(expect.objectContaining({ firstTime: true, direction: 'none' }));
});

test('firstTime=false при повторном enter', () => {
  const el1 = Object.assign(document.createElement('section'), { id: 's01' });
  const el2 = Object.assign(document.createElement('section'), { id: 's02' });
  document.body.append(el1, el2);
  const onEnter = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's01', onEnter });
  TS.ScrollTrigger.register({ slideId: 's02' });
  MockIO.instances[0].trigger(el1, 0.75);   // первый раз s01
  MockIO.instances[0].trigger(el2, 0.75);   // ушли на s02 — exit s01
  MockIO.instances[0].trigger(el1, 0.75);   // вернулись — firstTime=false
  expect(onEnter.mock.calls[1][0].firstTime).toBe(false);
});

test('fast=true при быстром переходе < 50ms', async () => {
  jest.useFakeTimers();
  const el1 = Object.assign(document.createElement('section'), { id: 's01' });
  const el2 = Object.assign(document.createElement('section'), { id: 's02' });
  document.body.append(el1, el2);
  const onEnter2 = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's01' });
  TS.ScrollTrigger.register({ slideId: 's02', onEnter: onEnter2 });
  MockIO.instances[0].trigger(el1, 0.75);
  jest.advanceTimersByTime(20);
  MockIO.instances[0].trigger(el2, 0.75);
  expect(onEnter2).toHaveBeenCalledWith(expect.objectContaining({ fast: true }));
  jest.useRealTimers();
});

test('direction=forward при переходе s01→s03', () => {
  const el1 = Object.assign(document.createElement('section'), { id: 's01' });
  const el3 = Object.assign(document.createElement('section'), { id: 's03' });
  document.body.append(el1, el3);
  const onEnter3 = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's01' });
  TS.ScrollTrigger.register({ slideId: 's03', onEnter: onEnter3 });
  MockIO.instances[0].trigger(el1, 0.75);
  MockIO.instances[0].trigger(el3, 0.75);
  expect(onEnter3.mock.calls[0][0].direction).toBe('forward');
});

test('direction=backward при переходе s05→s02', () => {
  const el2 = Object.assign(document.createElement('section'), { id: 's02' });
  const el5 = Object.assign(document.createElement('section'), { id: 's05' });
  document.body.append(el2, el5);
  const onEnter2 = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's05' });
  TS.ScrollTrigger.register({ slideId: 's02', onEnter: onEnter2 });
  MockIO.instances[0].trigger(el5, 0.75);
  MockIO.instances[0].trigger(el2, 0.75);
  expect(onEnter2.mock.calls[0][0].direction).toBe('backward');
});

test('once:true — триггер удаляется после первого enter', () => {
  const el = Object.assign(document.createElement('section'), { id: 's01' });
  document.body.appendChild(el);
  const onEnter = jest.fn();
  TS.ScrollTrigger.register({ slideId: 's01', onEnter, once: true });
  MockIO.instances[0].trigger(el, 0.75);
  MockIO.instances[0].trigger(el, 0.75);
  expect(onEnter).toHaveBeenCalledTimes(1);
});

test('isVisible возвращает true для текущего слайда', () => {
  const el = Object.assign(document.createElement('section'), { id: 's01' });
  document.body.appendChild(el);
  TS.ScrollTrigger.register({ slideId: 's01' });
  MockIO.instances[0].trigger(el, 0.75);
  expect(TS.ScrollTrigger.isVisible('s01')).toBe(true);
});
```

### 6.3 Integration — события + a11y + refresh

```javascript
test('TS.emit("slide:enter") с правильной полезной нагрузкой', () => {
  const el = Object.assign(document.createElement('section'), { id: 's02' });
  document.body.appendChild(el);
  const listener = jest.fn();
  TS.on('slide:enter', listener);
  TS.ScrollTrigger.register({ slideId: 's02' });
  MockIO.instances[0].trigger(el, 0.75);
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ slideId: 's02', firstTime: true }));
});

test('A11Y.announce вызывается с подставленным номером слайда', () => {
  const announce = jest.spyOn(window.A11Y, 'announce').mockImplementation(() => {});
  const el = Object.assign(document.createElement('section'), { id: 's03' });
  document.body.appendChild(el);
  TS.ScrollTrigger.register({ slideId: 's03' });
  MockIO.instances[0].trigger(el, 0.75);
  expect(announce).toHaveBeenCalledWith(expect.stringMatching(/3/));
  announce.mockRestore();
});

test('refresh после DOM replace сохраняет триггеры', () => {
  const el = Object.assign(document.createElement('section'), { id: 's01' });
  document.body.appendChild(el);
  TS.ScrollTrigger.register({ slideId: 's01' });
  // заменим элемент
  const newEl = Object.assign(document.createElement('section'), { id: 's01' });
  document.body.innerHTML = '';
  document.body.appendChild(newEl);
  TS.ScrollTrigger.refresh();
  expect(MockIO.instances[1].targets.has(newEl)).toBe(true); // новый observer
});
```

---

## 7. ACCEPTANCE CRITERIA

- [ ] `src/cinematic/scroll_trigger.js` ≤ 5 KB, реализует API по §2
- [ ] 15+ тестов в `__tests__/scroll_trigger.test.js` зелёные
- [ ] IntersectionObserver корректно mockается в тестах
- [ ] onEnter/onExit/firstTime/fast/direction — все проверены тестами
- [ ] A11Y.announce вызывается с подставленным номером слайда
- [ ] refresh() переподписывается после DOM мутации
- [ ] `TS.emit('slide:enter')` и `TS.emit('slide:exit')` видны через `TS.on`
- [ ] Нет `eval`, `new Function`, `localStorage`, `Worker`
- [ ] Код-коммент шапка на английском с JSDoc
- [ ] Коммит по `commit_convention.md` (префикс `G17:`)
- [ ] HTML bundle после build < 450 KB (Волна 1 + G13 + G17)

---

## 8. ЧТО ЗАПРЕЩЕНО

- `eval`, `new Function`, `localStorage`, `sessionStorage` (новое), `Worker`, `Blob + URL.createObjectURL`
- Создавать отдельный IntersectionObserver на каждый слайд (использовать один общий)
- Прямой вызов NAV, Cinema, Ambient — G17 только эмитит события, кто надо тот и слушает
- Тяжёлые вычисления в callback IO — всё должно уходить в rAF (см. §3.6)
- Throttling/debounce через setTimeout в onProgress — только requestAnimationFrame
- Нарушение API §4.2 INFRA_PROMPT

---

## 9. SELF-CHECK ПЕРЕД КОММИТОМ

```bash
# 1. Тесты модуля
npm test -- src/cinematic/__tests__/scroll_trigger.test.js
# Ожидание: 15+ зелёных, 0 красных, 0 skip

# 2. Полный прогон
npm test
# Ожидание: ≥ 380 тестов зелёные (Phase 2A/2B + G13 от PR #110 + G17 = 350 + 15 + 15)

# 3. Размер
wc -c src/cinematic/scroll_trigger.js
# Ожидание: ≤ 5120 байт

# 4. Запрещённое
grep -nE 'eval\(|new Function|localStorage|new Worker' src/cinematic/scroll_trigger.js
# Ожидание: пусто

# 5. Build
python scripts/build_html.py
# Ожидание: успех, HTML < 450 KB
```

---

## 10. ИНТЕГРАЦИОННЫЕ ТОЧКИ ДЛЯ ДРУГИХ МОДУЛЕЙ (инфо для SLIDE_PROMPTs и G8/G10)

Слайды в Волне 6 будут использовать G17 так:

```javascript
// в каждом SLIDE_PROMPT:
TS.ScrollTrigger.register({
  slideId: 's12',
  threshold: 0.5,
  onEnter: ({ firstTime, fast }) => {
    if (!fast) TS.Ambient.start('s12', { preset: 'data_stream' });
    if (firstTime) runIntroAnimation();
  },
  onExit: () => { TS.Ambient.stop('s12'); }
});
```

Модули Ambient/Sound/Parallax **НЕ** подписываются на IO напрямую — они слушают `TS.on('slide:enter', …)` или получают вызов через onEnter из SLIDE_PROMPT.

---

## 11. CHECKLIST PR #111

- [ ] `src/cinematic/scroll_trigger.js` — 150-180 строк, ≤ 5 KB
- [ ] `src/cinematic/__tests__/scroll_trigger.test.js` — 15+ тестов зелёные
- [ ] Нет патчей в Phase 2A/2B файлов (G17 самодостаточен; если нужен refresh() hook в orchestrator — добавь минимальный вызов после I18N.setLanguage)
- [ ] `npm test` — зелёно, ≥ 380 тестов суммарно (с учётом G13 от PR #110)
- [ ] HTML build < 450 KB
- [ ] Commit: `G17: TS.ScrollTrigger IntersectionObserver + slide lifecycle`
- [ ] Body коммита:
  ```
  Single shared IO observes all registered slides. onEnter/onExit/onProgress
  with firstTime and fast (<50ms between enters) flags. direction computed
  from numeric slideId. A11Y.announce on enter (not in fast mode).
  TS.emit('slide:enter'|'slide:exit'|'slide:progress'). refresh() reattaches
  after DOM mutation.
  ```
- [ ] Branch: `phase2c/g17-scroll-trigger` → push → PR открыт, НЕ мержить сам

---

## 12. ЕСЛИ ЗАСТРЯЛ

- IntersectionObserver не триггерится в тестах — проверь, что MockIO заменил global ДО импорта модуля; если модуль кэширует ссылку — `_reset()` должен пересоздавать observer.
- firstTime всегда true — значит `_visitedOnce.add` не вызывается; проверь порядок: add **до** вызова onEnter, или используй snapshot в `firstTime = !_visitedOnce.has(...)` до add.
- Direction всегда 'none' — вероятно, slideId не формата 's01'..'s25'; уточни с Cowork через issue, если слайды зовутся иначе в реальных DOM.
- A11Y.announce не вызывается — проверь, что window.A11Y экспортирован в Phase 2A (он должен быть, см. `src/a11y.js`); если нет — открой issue, не делай свою реализацию.

---

_Версия: 1.0 (17 апр 2026)_
_Соответствует SPEC_v2 §G17 + INFRA_PROMPT §4.2, §6.2, §10_
