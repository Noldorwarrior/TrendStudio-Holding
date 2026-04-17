# INFRA_PROMPT — Phase 2C Cinematic Infrastructure

**Назначение:** этот промт — единственный вход CC в Волну 1 Phase 2C. Реализует инфраструктурный скелет: папки `src/cinematic/`, `src/slides/`, CSS baseline, build pipeline, i18n ключи, what-if данные, e2e runner. После этого промта CC переходит к MODULE_PROMPTs (G13 первым).

**Version:** 1.0
**Date:** 17 April 2026
**Target:** `claude/deck-v1.2.0-phase2c` (base: tag `v1.2.0-phase2b`)
**Deadline:** Волна 1 closed — 18 April end-of-day (режим SPRINT)

---

## 1. КОНТЕКСТ

### 1.1 Что строим
Phase 2C — это cinematic premium visual overhaul поверх уже существующих Phase 2A (оркестрация, i18n, a11y, components) и Phase 2B (charts, controls, drilldown). Цель: deck производит впечатление Hollywood-уровня для investor-встречи 29 апреля 2026.

### 1.2 10 новых модулей (G8-G17)
| ID | Module | Short | Approx size |
|---|---|---|---:|
| G8 | Ambient Particles | TS.Ambient | ~18 KB |
| G9 | Sound Design | TS.Sound | ~11 KB |
| G10 | Cinema Mode | TS.Cinema | ~8 KB |
| G11 | Easter Eggs | TS.Easter | ~7 KB |
| G12 | Mouse Parallax | TS.Parallax | ~4 KB |
| G13 | Keyboard Shortcuts | TS.Keyboard | ~3 KB |
| G14 | Context Menu | TS.ContextMenu | ~6 KB |
| G15 | Drag Framework | TS.Drag | ~6 KB |
| G16 | Inline What-If | TS.WhatIf | ~9 KB |
| G17 | Scroll Trigger | TS.ScrollTrigger | ~4 KB |
| **Total new** | | | **~76 KB** |

### 1.3 Budget
| | Размер |
|---|---:|
| Phase 2B baseline | ~377 KB |
| + 10 модулей G8-G17 | +76 KB |
| + 25 слайдов (prod js) | +50 KB |
| + CSS cinematic + slides | +12 KB |
| + i18n ~80 новых ключей | +6 KB |
| + whatif_formulas.json | +3 KB |
| **Итого цель** | **~524 KB** |
| **Лимит** | **650 000 байт** |
| **Подушка** | **~126 KB** |

### 1.4 Ссылки на master-файл
Каждый модуль детально описан в:
`/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/CC_PHASE2C_SPEC_v2.md`

Если эта папка `Холдинг/` недоступна CC — считать, что детали прочтены и согласованы. Из неё следуют MODULE_PROMPTs, которые передаются отдельно.

---

## 2. АРХИТЕКТУРА ФАЙЛОВ

### 2.1 Новая структура
```
TrendStudio-Holding/
├── src/
│   ├── cinematic/                       ← Phase 2C модули
│   │   ├── keyboard.js                  ← G13 (первый)
│   │   ├── scroll_trigger.js            ← G17
│   │   ├── ambient.js                   ← G8
│   │   ├── sound.js                     ← G9
│   │   ├── parallax.js                  ← G12
│   │   ├── context_menu.js              ← G14
│   │   ├── drag.js                      ← G15
│   │   ├── easter.js                    ← G11
│   │   ├── whatif.js                    ← G16
│   │   ├── cinema_mode.js               ← G10 (последний)
│   │   └── __tests__/
│   │       ├── keyboard.test.js
│   │       ├── scroll_trigger.test.js
│   │       ├── ambient.test.js
│   │       ├── sound.test.js
│   │       ├── parallax.test.js
│   │       ├── context_menu.test.js
│   │       ├── drag.test.js
│   │       ├── easter.test.js
│   │       ├── whatif.test.js
│   │       ├── cinema_mode.test.js
│   │       └── integration.test.js
│   ├── slides/                          ← Phase 2C слайды (наполняются в Волне 6)
│   │   ├── slide01_cover.js
│   │   ├── slide02_exec_summary.js
│   │   ├── … (25 штук)
│   │   ├── slide25_cta.js
│   │   └── __tests__/
│   │       ├── slide01.test.js
│   │       ├── … (25 штук)
│   │       └── nav_integration.test.js
│   └── css/
│       ├── cinematic.css                ← глобальные keyframes, overlays, z-index layers
│       └── slides_phase2c.css           ← slide-specific overrides
├── i18n/
│   ├── ru.json                          ← +~80 новых ключей
│   └── en.json                          ← симметрично
├── data_extract/
│   ├── deck_data_v1.2.0.json            ← read-only (не трогать)
│   └── whatif_formulas.json             ← NEW для G16
├── scripts/
│   ├── build_html.py                    ← ОБНОВИТЬ (включить cinematic/ + slides/)
│   ├── check_budget.js                  ← NEW QA
│   └── e2e_runner.js                    ← NEW puppeteer/playwright
└── (всё остальное Phase 2A/2B — read-only)
```

### 2.2 Что CC создаёт в Волне 1 (только скелет)
Файлы ниже создаются **пустыми или с минимальным содержимым** (заголовок-комментарий + `export` стаб). Наполнение — в Волнах 2-5.

```javascript
// src/cinematic/keyboard.js (пример скелета)
// G13 — TS.Keyboard global shortcut registry
// See: Handoff_Phase2C/10_modules/g13_keyboard/MODULE_PROMPT.md
// This is a SKELETON created in Wave 1. Implementation comes in Wave 2.

(function (global) {
  'use strict';
  global.TS = global.TS || {};
  global.TS.Keyboard = {
    register: function () { throw new Error('TS.Keyboard.register not implemented yet'); },
    unregister: function () { throw new Error('not implemented'); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
```

Тесты в скелете — `it.skip(...)` с TODO, чтобы suite не падал.

---

## 3. ГЛОБАЛЬНЫЙ NAMESPACE TS.*

### 3.1 Существующий (Phase 2A/2B, read-only)
```
TS.I18N                  — локализация
TS.A11Y                  — accessibility helpers
TS.Components            — Modal, Tabs, Toast, Tooltip
TS.Charts                — chart core + palette + helpers
TS.NAV                   — slide navigation (registerSlide, goto)
TS.URL                   — URL-state ↔ query/hash/sessionStorage
TS.Orchestrator          — TS.emit / TS.on event bus
```

### 3.2 Новый (Phase 2C, создаётся в Волнах 2-5)
```
TS.Keyboard              — G13 shortcut registry
TS.ScrollTrigger         — G17 slide lifecycle on viewport
TS.Ambient               — G8 canvas particle system
TS.Sound                 — G9 WebAudio procedural
TS.Parallax              — G12 mouse-based depth
TS.ContextMenu           — G14 custom right-click
TS.Drag                  — G15 pointer-based drag
TS.Easter                — G11 easter eggs EE-1..EE-7
TS.WhatIf                — G16 inline parameter editor
TS.Cinema                — G10 fullscreen cinematic mode
```

### 3.3 Правила namespace
- Ни один новый модуль не расширяет существующие Phase 2A/2B namespaces (не `TS.Components.X = ...`, не `TS.Charts.Y = ...`)
- Все новые символы — под `TS.<Module>.*`
- Внутренние helpers — приватные через IIFE closure, не экспортируются
- `TS.version` обновляется после Волны 7: `'1.3.0'`

---

## 4. TYPESCRIPT API CONTRACTS (authoritative)

CC реализует JS, но контракты описаны в TS-стиле. Сигнатуры обязательны — MODULE_PROMPT будет ссылаться на них. Любое отклонение — open issue, не действовать.

### 4.1 G13 — TS.Keyboard
```typescript
interface KeyBinding {
  key: string;              // normalized: 'C', 'Esc', 'ArrowLeft', 'Meta+K', 'Shift+?'
  context?: string;         // 'global' | 'slide' | 'modal' — default 'global'
  description: string;      // i18n-key: 'ui.g13.kb.cinema_toggle'
  handler: (e: KeyboardEvent) => void | boolean; // return false = stop propagation
  allowInInput?: boolean;   // default false (ignore when typing in input/textarea)
}

TS.Keyboard = {
  register(id: string, binding: KeyBinding): void,
  unregister(id: string): void,
  list(context?: string): KeyBinding[],
  enable(): void,
  disable(): void
};
```

### 4.2 G17 — TS.ScrollTrigger
```typescript
interface SlideTrigger {
  slideId: string;           // 's01' .. 's25'
  threshold?: number;        // 0..1, default 0.5 (50% visible)
  onEnter?: () => void;
  onExit?: () => void;
  once?: boolean;            // default false
}

TS.ScrollTrigger = {
  register(trigger: SlideTrigger): void,
  unregister(slideId: string): void,
  refresh(): void,           // rerun IO after DOM mutation
  isVisible(slideId: string): boolean
};
```

Emits: `TS.emit('slide:enter', {slideId})`, `TS.emit('slide:exit', {slideId})`.

### 4.3 G8 — TS.Ambient
```typescript
type AmbientPreset = 'dust' | 'sparkle' | 'light_leak' | 'data_stream' | 'film_grain';

interface AmbientConfig {
  preset: AmbientPreset;
  density?: number;          // 0..1, default 0.5
  container?: HTMLElement;   // default: slide element
}

TS.Ambient = {
  start(slideId: string, config: AmbientConfig): void,
  stop(slideId: string): void,
  pause(): void,             // pause all (used in reduced-motion)
  resume(): void,
  setIntensity(value: number): void, // 0..1
  getActivePresets(): string[]
};
```

### 4.4 G9 — TS.Sound
```typescript
type SoundEvent =
  | 'slide_transition' | 'chart_reveal' | 'number_updated'
  | 'easter_found' | 'drilldown_open' | 'cinema_enter';

TS.Sound = {
  enable(): void,            // default is DISABLED
  disable(): void,
  isEnabled(): boolean,
  play(event: SoundEvent, opts?: { volume?: number }): void,
  setMasterVolume(v: number): void // 0..1
};
```

Emits: `TS.emit('sound:toggled', {enabled})`.

### 4.5 G10 — TS.Cinema
```typescript
TS.Cinema = {
  enter(): Promise<void>,    // fullscreen + letterbox + grain boost
  exit(): Promise<void>,
  toggle(): Promise<void>,
  isActive(): boolean
};
```

Keyboard shortcut: `C` (registered via G13).
Emits: `TS.emit('cinema:toggled', {active})`.

### 4.6 G11 — TS.Easter
```typescript
type EggId = 'EE-1' | 'EE-2' | 'EE-3' | 'EE-4' | 'EE-5' | 'EE-6' | 'EE-7';

interface EggDefinition {
  id: EggId;
  slideId: string;
  trigger: 'konami' | 'click_sequence' | 'hover_time' | 'drag_pattern' | 'keyboard_combo';
  triggerConfig: any;        // trigger-specific
  reward: () => void;        // visual/audio effect + sessionStorage flag
}

TS.Easter = {
  register(def: EggDefinition): void,
  markFound(id: EggId): void,
  isFound(id: EggId): boolean,
  listFound(): EggId[]
};
```

Emits: `TS.emit('easter:found', {id})`.
Storage: `sessionStorage['ts.easter.EE-N'] = '1'` (NO localStorage!).

### 4.7 G12 — TS.Parallax
```typescript
TS.Parallax = {
  enable(container: HTMLElement, layers: HTMLElement[]): void,
  disable(container: HTMLElement): void,
  setLerpFactor(f: number): void // default 0.08
};
```

Depth encoded via `data-depth="0..2.5"` on each layer.

### 4.8 G14 — TS.ContextMenu
```typescript
interface MenuItem {
  id: string;
  label: string;             // i18n-key
  icon?: string;             // inline SVG or emoji
  handler: () => void;
  disabled?: boolean;
  divider?: boolean;         // render as separator (ignores other fields)
}

TS.ContextMenu = {
  open(items: MenuItem[], x: number, y: number): void,
  close(): void,
  registerForElement(el: HTMLElement, items: MenuItem[] | (() => MenuItem[])): void
};
```

Emits: `TS.emit('contextmenu:opened', {items})`.

### 4.9 G15 — TS.Drag
```typescript
interface DragHandle {
  el: HTMLElement;
  axis?: 'x' | 'y' | 'both';
  bounds?: DOMRect | (() => DOMRect);
  onStart?: (e: PointerEvent) => void;
  onMove?: (dx: number, dy: number) => void;
  onEnd?: (dx: number, dy: number) => void;
  keyboardStep?: number;     // px per ArrowKey, default 8
}

TS.Drag = {
  enable(h: DragHandle): () => void, // returns disable() fn
};
```

### 4.10 G16 — TS.WhatIf
```typescript
interface WhatIfField {
  selector: string;          // CSS selector (data-whatif-id="...")
  formulaId: string;         // key in whatif_formulas.json
  min: number;
  max: number;
  step?: number;
  format: 'currency' | 'percent' | 'number';
}

TS.WhatIf = {
  register(slideId: string, fields: WhatIfField[]): void,
  activate(slideId: string): void,    // enable dblclick handlers
  deactivate(slideId: string): void,
  reset(slideId: string): void        // restore defaults
};
```

Emits: `TS.emit('whatif:changed', {slideId, fieldId, value})`, `TS.emit('whatif:reset', {slideId})`.

### 4.11 G17 — covered in 4.2

---

## 5. СОБЫТИЯ TS.emit / TS.on

### 5.1 Уже существуют (Phase 2A/2B)
```
scenario:changed             { scenario: 'base' | 'bull' | 'bear' }
param:changed                { rate, horizon, stress }
drilldown:open               { chart, payload }
chart:rendered               { chartId, durationMs }
```

### 5.2 Новые в Phase 2C
```
slide:enter                  { slideId }
slide:exit                   { slideId }
cinema:toggled               { active: boolean }
sound:toggled                { enabled: boolean }
easter:found                 { id: EggId }
whatif:changed               { slideId, fieldId, value }
whatif:reset                 { slideId }
contextmenu:opened           { items: MenuItem[] }
ambient:started              { slideId, preset }
ambient:stopped              { slideId }
```

### 5.3 Правила событий
- Имя события — lowercase, colon-separated, snake_case allowed
- Payload — plain object, JSON-serializable (для debug logging)
- `TS.emit` — синхронный (не async, не promise)
- Подписчики НЕ должны кидать ошибок; если могут — оборачивать в try/catch
- Отписка обязательна при unmount слайда (иначе memory leak при навигации)

---

## 6. I18N КЛЮЧИ (Волна 1, PR #103)

CC добавляет **~80 новых ключей** одновременно в `i18n/ru.json` и `i18n/en.json`. Симметрия обязательна (regex-проверка в `i18n_symmetry.test.js`).

### 6.1 Ключи модулей (ui.gM.*) — ~25 штук
```
ui.g8.preset.dust          RU "Пыль"                    EN "Dust"
ui.g8.preset.sparkle       RU "Искры"                   EN "Sparkle"
ui.g8.preset.light_leak    RU "Световая утечка"         EN "Light Leak"
ui.g8.preset.data_stream   RU "Поток данных"            EN "Data Stream"
ui.g8.preset.film_grain    RU "Киноплёнка"              EN "Film Grain"
ui.g9.toggle_on            RU "Включить звук"           EN "Enable sound"
ui.g9.toggle_off           RU "Выключить звук"          EN "Disable sound"
ui.g10.enter               RU "Кино-режим"              EN "Cinema mode"
ui.g10.exit                RU "Выйти из кино"           EN "Exit cinema"
ui.g13.kb.cinema_toggle    RU "Переключить кино (C)"    EN "Toggle cinema (C)"
ui.g13.kb.next_slide       RU "След. слайд (→)"          EN "Next slide (→)"
ui.g13.kb.prev_slide       RU "Пред. слайд (←)"          EN "Prev slide (←)"
ui.g13.kb.help             RU "Помощь (?)"              EN "Help (?)"
ui.g13.kb.sound            RU "Звук (S)"                EN "Sound (S)"
ui.g13.kb.theme            RU "Тема (T)"                EN "Theme (T)"
ui.g14.copy                RU "Копировать"              EN "Copy"
ui.g14.share               RU "Поделиться"              EN "Share"
ui.g14.drilldown           RU "Подробности"             EN "Drill-down"
ui.g14.export              RU "Экспорт"                 EN "Export"
ui.g14.reset               RU "Сбросить"                EN "Reset"
ui.g16.edit_hint           RU "Двойной клик — изменить" EN "Double-click to edit"
ui.g16.reset               RU "Сбросить значения"       EN "Reset values"
ui.g16.applied             RU "Применено"               EN "Applied"
ui.g11.egg_found           RU "Вы нашли пасхалку!"      EN "Easter egg found!"
ui.g11.eggs_total          RU "Пасхалок найдено: {n}/7" EN "Eggs found: {n}/7"
```

### 6.2 Ключи a11y (a11y.gM.*, a11y.sNN.*) — ~35 штук

Модульные a11y (по одному ключу на каждый из 10 модулей G8-G17):
```
a11y.g8.canvas             RU "Декоративный канвас — можно игнорировать"  EN "Decorative canvas — safe to ignore"
a11y.g9.muted              RU "Звук выключен"           EN "Sound muted"
a11y.g10.active            RU "Включён кино-режим"      EN "Cinema mode active"
a11y.g11.egg_region        RU "Область с пасхалкой"     EN "Easter egg region"
a11y.g12.parallax_layer    RU "Декоративный слой параллакса" EN "Decorative parallax layer"
a11y.g13.kb_help           RU "Доступны клавиатурные сокращения (?)" EN "Keyboard shortcuts available (?)"
a11y.g14.menu_open         RU "Открыто контекстное меню" EN "Context menu opened"
a11y.g15.drag_handle       RU "Ручка перетаскивания, используйте стрелки" EN "Drag handle, use arrow keys"
a11y.g16.field_edit        RU "Поле с возможностью редактирования" EN "Editable field"
a11y.g17.slide_entered     RU "Активирован слайд {n}"   EN "Slide {n} activated"
```

Слайд-region (25 штук для навигации скринридеров):
```
a11y.s01.region            RU "Слайд 1: Обложка"        EN "Slide 1: Cover"
a11y.s02.region            RU "Слайд 2: Резюме для LP"  EN "Slide 2: Executive Summary for LPs"
...
a11y.s25.region            RU "Слайд 25: Контакты"      EN "Slide 25: Contact"
```

### 6.3 Ключи слайдов (ui.sNN.*) — ~20 штук (placeholders для LP-critical)
Волна 1 добавляет ключи **только для LP-critical слайдов** (2, 5, 12, 14, 17, 18, 20, 22) — title + subtitle, всего ~16 ключей. Плюс резерв ~4 ключа для общих UI-меток (next/prev/help).

Полные ключи слайдов (тела, подписи к чартам, аннотации) добавляются в Волне 6 вместе с реализацией конкретного слайда.

```
ui.s02.title               RU "Резюме для LP"           EN "Executive Summary for LPs"
ui.s02.subtitle            RU "Главное за 30 секунд"    EN "Key points in 30 seconds"
ui.s05.title               RU "Рынок"                   EN "Market"
ui.s05.subtitle            RU "Размер и динамика"       EN "Size & dynamics"
...
ui.s22.title               RU "Запрос инвестиций"       EN "Investment Ask"
ui.s22.subtitle            RU "Структура раунда"        EN "Round structure"
```

**Не-LP-critical слайды (1, 3, 4, 6-11, 13, 15, 16, 19, 21, 23-25)** в Волне 1 **не получают** ui-ключей — только a11y.sNN.region из 6.2.

### 6.4 Итого по волне 1
```
25 (ui.gM.*)  +  35 (a11y)  +  20 (ui.sNN для LP-critical)  =  80 ключей
```
Симметрия RU ↔ EN — обязательна (см. 6.5 test).

### 6.5 Правило симметрии
Каждый ключ, добавленный в `ru.json`, **обязан** появиться в `en.json` в том же коммите. Тест `i18n_symmetry.test.js`:

```javascript
// src/__tests__/i18n_symmetry.test.js
const ru = require('../../i18n/ru.json');
const en = require('../../i18n/en.json');

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, prefix + k + '.') : [prefix + k]
  );
}

test('i18n symmetry', () => {
  const ruKeys = new Set(keys(ru));
  const enKeys = new Set(keys(en));
  const onlyRu = [...ruKeys].filter(k => !enKeys.has(k));
  const onlyEn = [...enKeys].filter(k => !ruKeys.has(k));
  expect(onlyRu).toEqual([]);
  expect(onlyEn).toEqual([]);
});
```

---

## 7. CSS CONVENTIONS

### 7.1 Файл `src/css/cinematic.css`

Создаётся в Волне 1 с базовой структурой:

```css
/* ========================================================================
   Phase 2C Cinematic — global CSS variables, keyframes, z-index layers
   ======================================================================== */

:root {
  /* Z-index layers (phase 2C reserves 100-999) */
  --z-ambient: 100;           /* G8 canvas behind content */
  --z-parallax: 110;          /* G12 depth layers */
  --z-slide-content: 200;     /* base content */
  --z-whatif-handle: 300;     /* G16 editable field markers */
  --z-contextmenu: 500;       /* G14 menu */
  --z-modal: 600;             /* Phase 2B modal (existing) */
  --z-cinema-letterbox: 800;  /* G10 letterbox bars */
  --z-cinema-grain: 810;      /* G10 grain overlay */

  /* Animation timings */
  --t-slide-enter: 3500ms;
  --t-slide-exit: 700ms;
  --t-crossfade: 600ms;
  --t-micro: 200ms;

  /* Easing */
  --ease-enter: cubic-bezier(0.22, 0.61, 0.36, 1.0);
  --ease-exit: cubic-bezier(0.42, 0.0, 0.58, 1.0);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1.0);

  /* Ambient colors (base palette — must match TS.Charts.palette) */
  --c-ambient-dust: rgba(255, 235, 180, 0.15);
  --c-ambient-sparkle: rgba(255, 200, 100, 0.4);
  --c-lightleak-warm: #FFCC66;
  --c-lightleak-cold: #66CCFF;
  --c-bg-cinema: #0A1628;

  /* Grain */
  --grain-density: 0.15;
  --grain-fps: 8;
}

/* ======================================================================== */
/* Keyframes shared across modules                                          */
/* ======================================================================== */

@keyframes ts-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ts-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes ts-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes ts-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50% { box-shadow: 0 0 16px 4px currentColor; }
}

@keyframes ts-grain-flicker {
  0%, 100% { opacity: var(--grain-density); }
  50% { opacity: calc(var(--grain-density) * 1.3); }
}

/* ======================================================================== */
/* Reduced-motion overrides (CRITICAL)                                      */
/* ======================================================================== */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Ambient/Parallax must stop — handled by JS (TS.Ambient.pause, TS.Parallax.disable) */
}

/* ======================================================================== */
/* Base classes (individual modules extend these)                           */
/* ======================================================================== */

.ts-ambient-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-ambient);
}

.ts-parallax-layer {
  will-change: transform;
  transition: transform 0.4s var(--ease-enter);
}

.ts-cinema-active .ts-slide {
  filter: contrast(1.05) saturate(1.1);
}

.ts-whatif-editable {
  position: relative;
  cursor: pointer;
  border-bottom: 1px dashed currentColor;
  transition: background var(--t-micro);
}

.ts-whatif-editable:hover {
  background: rgba(255, 255, 255, 0.04);
}
```

### 7.2 Файл `src/css/slides_phase2c.css`
Создаётся пустым с комментарием. Наполняется в Волне 6.

### 7.3 Naming convention CSS классов
- Новые классы — префикс `.ts-` (уже используется Phase 2A/2B)
- Модули: `.ts-ambient-*`, `.ts-sound-*`, `.ts-cinema-*`, `.ts-contextmenu-*`, `.ts-drag-*`, `.ts-parallax-*`, `.ts-whatif-*`, `.ts-easter-*`
- Слайды: `.ts-slide-01`, `.ts-slide-02`, … `.ts-slide-25`
- State: `.is-active`, `.is-hidden`, `.is-dragging`, `.is-editing`

---

## 8. BUILD PIPELINE (PR #102)

### 8.1 Обновление `scripts/build_html.py`

Существующий скрипт уже имеет BUDGET=650000 (обновлено в Phase 2B). CC обновляет список включаемых модулей:

```python
# scripts/build_html.py (модификация)

CINEMATIC_MODULES = [
    'src/cinematic/keyboard.js',       # G13 — first (depends on nothing)
    'src/cinematic/scroll_trigger.js', # G17
    'src/cinematic/ambient.js',        # G8
    'src/cinematic/sound.js',          # G9
    'src/cinematic/parallax.js',       # G12
    'src/cinematic/context_menu.js',   # G14
    'src/cinematic/drag.js',           # G15
    'src/cinematic/easter.js',         # G11
    'src/cinematic/whatif.js',         # G16
    'src/cinematic/cinema_mode.js',    # G10
]

SLIDE_MODULES = [f'src/slides/slide{n:02d}_*.js' for n in range(1, 26)]
# resolved via glob during build

CSS_FILES = [
    'src/css/cinematic.css',           # NEW
    'src/css/slides_phase2c.css',      # NEW
    # ... existing Phase 2A/2B CSS
]
```

Порядок включения критичен — Phase 2A/2B сначала, потом cinematic/, потом slides/.

### 8.2 Новый скрипт `scripts/check_budget.js`

```javascript
#!/usr/bin/env node
/* scripts/check_budget.js — fails build if HTML exceeds budget */

const fs = require('fs');
const path = require('path');

const BUDGET = 650000;
const HTML_PATH = path.join(__dirname, '..', 'Deck_v1.3.0', 'TrendStudio_LP_Deck_v1.3.0_Interactive.html');

if (!fs.existsSync(HTML_PATH)) {
  console.error(`Budget check skipped: ${HTML_PATH} not built yet`);
  process.exit(0);
}

const size = fs.statSync(HTML_PATH).size;
const percent = ((size / BUDGET) * 100).toFixed(1);
const cushion = BUDGET - size;

console.log(`HTML size: ${size} bytes (${percent}% of ${BUDGET}, cushion ${cushion})`);

if (size > BUDGET) {
  console.error(`BUDGET EXCEEDED by ${size - BUDGET} bytes`);
  process.exit(1);
}
```

Подключается в `package.json`:
```json
{
  "scripts": {
    "build": "python scripts/build_html.py",
    "check-budget": "node scripts/check_budget.js",
    "validate": "npm run build && npm run check-budget && npm test"
  }
}
```

---

## 9. WHAT-IF DATA (PR #104)

Новый файл `data_extract/whatif_formulas.json`. Формат:

```json
{
  "slide14_wacc": {
    "description": "WACC impact on Enterprise Value",
    "inputs": [
      { "id": "wacc", "min": 6, "max": 12, "step": 0.5, "default": 9.3, "format": "percent" }
    ],
    "formula": "EV = FCF_year5 / (wacc - g)",
    "formulaJS": "function(inputs, baseline) { const g = 0.03; return baseline.fcf_year5 / (inputs.wacc/100 - g); }",
    "outputField": "#slide14-ev-value",
    "outputFormat": "currency"
  },

  "slide17_monte_carlo_mean": {
    "description": "MC distribution mean shift under new IRR assumption",
    "inputs": [
      { "id": "base_irr", "min": 10, "max": 30, "step": 1, "default": 20, "format": "percent" }
    ],
    "formula": "MC_mean = base_irr + noise_mean(simulations)",
    "formulaJS": "function(inputs, baseline) { return baseline.simulations.map(s => s + (inputs.base_irr - baseline.base_irr)); }",
    "outputField": "#slide17-mc-mean",
    "outputFormat": "percent"
  },

  "slide12_unit_economics_budget": {
    "description": "Budget impact on unit margin",
    "inputs": [
      { "id": "budget_mln", "min": 100, "max": 800, "step": 50, "default": 350, "format": "currency" },
      { "id": "opex_pct", "min": 15, "max": 35, "step": 1, "default": 25, "format": "percent" }
    ],
    "formula": "margin = (revenue - budget - opex*budget) / revenue",
    "formulaJS": "function(inputs, baseline) { const opex = inputs.opex_pct/100 * inputs.budget_mln; return (baseline.revenue - inputs.budget_mln - opex) / baseline.revenue; }",
    "outputField": "#slide12-margin-value",
    "outputFormat": "percent"
  }
}
```

**Важно про `formulaJS`:** это поле — **ДОКУМЕНТАЦИЯ ДЛЯ ЧЕЛОВЕКА** (не исполняемый код). Исполнять `formulaJS` через `eval` / `new Function(...)` **ЗАПРЕЩЕНО** (см. раздел 13.1). В рантайме используется жёстко заданный switch-case в `whatif.js` (CC реализует в Волне 5 G16):

```javascript
// src/cinematic/whatif.js (фрагмент, для справки — финал в MODULE_G16)
function computeWhatIf(formulaId, inputs, baseline) {
  switch (formulaId) {
    case 'slide14_wacc':
      const g = 0.03;
      return baseline.fcf_year5 / (inputs.wacc/100 - g);
    case 'slide17_monte_carlo_mean':
      return baseline.simulations.map(s => s + (inputs.base_irr - baseline.base_irr));
    case 'slide12_unit_economics_budget':
      const opex = inputs.opex_pct/100 * inputs.budget_mln;
      return (baseline.revenue - inputs.budget_mln - opex) / baseline.revenue;
    default:
      throw new Error(`Unknown formula: ${formulaId}`);
  }
}
```

`formulaJS` в JSON — **документация для людей**, исполнение всегда через switch в `whatif.js`. CC в PR #104 создаёт только JSON (как source of truth для документации); логика — в Волне 5 G16.

---

## 10. TEST HARNESS

### 10.1 Существующий (Phase 2A/2B)

**Mixed runner mode approved by Cowork 2026-04-17.** Phase 2B тесты фактически
запускаются через самописные node-скрипты (assert-утилиты + jsdom shim), а не
через jest — jest в `package.json` Phase 2B не установлен. Этот промт ранее
ошибочно утверждал обратное.

Режим на Phase 2C:

- **Phase 2A/2B тесты (350+):** остаются на node-runner (`node src/**/*.test.js`),
  не трогаются Волной 1. Миграция на jest — отдельный Chore-PR после Волны 6
  (чтобы не создавать риск регрессии safety-net перед LP-встречей 29 апреля).
- **Phase 2C тесты (новые):** строго на jest. Идиомы `describe/it/expect/
  jest.fn()/jest.mock()`, файлы в `src/cinematic/__tests__/*.test.js` и
  `src/__tests__/i18n_symmetry.test.js`.
- **npm test (PR #102 настраивает):** `node scripts/run-legacy-tests.js && jest`
  — запускает оба раннера последовательно. Падение любого → exit code != 0.

Правило для CC: при написании Phase 2C тестов — `jest.fn()/jest.mock()/expect`.
При чтении существующих Phase 2B тестов как образца — помнить, что они в
кастомном формате (assert(cond, msg) + process.exit), не jest, и в Phase 2C их
паттерн не копировать.

### 10.2 Новый test harness для Phase 2C

CC создаёт `src/cinematic/__tests__/test-helpers.js`:

```javascript
// src/cinematic/__tests__/test-helpers.js — shared utilities for cinematic tests

const mockTS = () => ({
  I18N: { t: (key) => key, formatCurrency: (v) => `${v} ₽`, formatNumber: (v) => String(v) },
  A11Y: { isReducedMotion: () => false },
  Components: {},
  Charts: {},
  NAV: { registerSlide: jest.fn(), currentSlide: jest.fn() },
  URL: { getState: () => ({}), setState: jest.fn() },
  emit: jest.fn(),
  on: jest.fn()
});

const mockReducedMotion = (enabled = true) => {
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? enabled : false,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }))
  });
};

const mockRaf = () => {
  let time = 0;
  global.requestAnimationFrame = (cb) => { setTimeout(() => cb(time += 16.67), 0); return 1; };
  global.cancelAnimationFrame = jest.fn();
};

const mockCanvas = () => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(), fillRect: jest.fn(), beginPath: jest.fn(),
    arc: jest.fn(), fill: jest.fn(), stroke: jest.fn(),
    save: jest.fn(), restore: jest.fn(), translate: jest.fn(),
    globalAlpha: 1, fillStyle: '', strokeStyle: ''
  });
};

module.exports = { mockTS, mockReducedMotion, mockRaf, mockCanvas };
```

### 10.3 Тест-шаблон `00_infra/test_templates/module.test.template.js`

```javascript
/**
 * Template for module test (used by Волны 2-5)
 * Copy and fill for each module Gxx
 */

const { mockTS, mockReducedMotion, mockRaf } = require('./test-helpers');

describe('TS.<ModuleName>', () => {
  beforeEach(() => {
    window.TS = mockTS();
    mockRaf();
    require('../<module>.js'); // loads TS.<ModuleName>
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete window.TS;
  });

  describe('API surface', () => {
    it('exposes required methods', () => {
      expect(typeof TS.<ModuleName>.<method>).toBe('function');
    });
  });

  describe('reduced-motion', () => {
    it('respects prefers-reduced-motion', () => {
      mockReducedMotion(true);
      TS.<ModuleName>.start();
      // assertions
    });
  });

  describe('memory safety', () => {
    it('no leak over start/stop cycle', () => {
      // start → stop → start × 100 → check no accumulated handlers
    });
  });
});
```

---

## 11. E2E RUNNER (PR #105)

Создаётся `scripts/e2e_runner.js`. Headless Chromium (puppeteer), проверяет:
- Открытие каждого слайда без ошибок в console
- FPS ≥ 45 на каждом слайде (60 fps idealно)
- Нет memory leak при навигации 1→25→1→25
- axe-core 0 violations

```javascript
#!/usr/bin/env node
// scripts/e2e_runner.js — e2e smoke test for Phase 2C

const puppeteer = require('puppeteer');
const path = require('path');

const HTML_URL = 'file://' + path.join(__dirname, '..', 'Deck_v1.3.0', 'TrendStudio_LP_Deck_v1.3.0_Interactive.html');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error('PAGE ERROR:', e); process.exit(1); });
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

  await page.goto(HTML_URL);
  await page.waitForSelector('.ts-slide.is-active', { timeout: 5000 });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  for (let i = 1; i <= 25; i++) {
    await page.keyboard.press('ArrowRight');
    await sleep(800); // puppeteer 21+ удалил page.waitForTimeout — используем sleep
    const hasError = await page.evaluate(() => window.__lastError);
    if (hasError) { console.error(`Slide ${i} threw:`, hasError); process.exit(1); }
  }

  console.log('E2E smoke test passed ✓');
  await browser.close();
})();
```

`package.json`:
```json
{
  "scripts": {
    "e2e": "node scripts/e2e_runner.js"
  },
  "devDependencies": {
    "puppeteer": "^21.0.0"
  }
}
```

---

## 12. MEMORY / STATE RULES

### 12.1 Storage
- **localStorage** — **ЗАПРЕЩЕНО** (regex-проверка в Волне 7)
- **sessionStorage** — разрешено, namespace `ts.*`:
  - `ts.sound.enabled` — '1' | '0'
  - `ts.cinema.last` — timestamp
  - `ts.easter.EE-N` — '1' когда найдено
  - `ts.whatif.<slideId>.<fieldId>` — current value
- **cookies** — не использовать

### 12.2 URL state (расширение существующего)
```
#slide=7                     (существует, Phase 2A)
#slide=14&wacc=10.5          (расширено Phase 2B)
#slide=17&cinema=1           (новое Phase 2C)
#slide=22&theme=dark         (новое Phase 2C)
```

Каскад приоритета (уже в `TS.URL`): query > hash > sessionStorage. Не менять.

---

## 13. ЗАПРЕТЫ (CRITICAL)

### 13.1 Запрещённые API
```
eval()                       — regex-проверка
new Function(...)            — regex-проверка
localStorage                 — regex-проверка
document.write               — regex-проверка
innerHTML с unsanitized input — review required
```

### 13.2 Запрещённые внешние зависимости
Phase 2C — **zero-dependency** в runtime. В `<script>` теге финального HTML — только inline-код. Dev-зависимости (puppeteer, jest) — OK, но в prod HTML не попадают.

**Конкретные запреты:**
- Нет CDN-подключений (jQuery, GSAP, Three.js, p5.js, anime.js, lodash)
- Нет web fonts через import (все шрифты уже встроены в Phase 2A)
- Нет fetch() к внешним API на runtime

### 13.3 Запрещено изменять (read-only для Phase 2C)
```
src/i18n.js                  (Phase 2A)
src/a11y.js                  (Phase 2A)
src/orchestrator.js          (Phase 2A)
src/components.js            (Phase 2A)
src/charts.js                (Phase 2B)
src/charts/*.js              (Phase 2B)
src/controls.js              (Phase 2B)
src/drilldown.js             (Phase 2B)
data_extract/deck_data_v1.2.0.json (read-only data)
```

Изменения — только через MODULE_PROMPT с explicit разрешением. Если в промте не сказано «разрешено менять X» — не менять.

### 13.4 Запрещённое поведение
- Нет глобальных мутаций window/document вне `TS.*` namespace
- Нет синхронных тяжёлых вычислений в main thread (>16ms — обёрнуть в `requestAnimationFrame` и чанковать)
- **Web Workers не использовать** (раздувают bundle и inline-встраивание в единый HTML требует blob URL — усложнение ради минорной выгоды). Если задача требует Worker — открыть issue, не решать единолично
- Нет `setTimeout(fn, 0)` для тяжёлых задач — использовать `requestAnimationFrame`
- Нет alert/confirm/prompt — использовать `TS.Components.Modal`

---

## 14. ACCEPTANCE CRITERIA (Волна 1)

После мержа всех 5 PR Волны 1 в `claude/deck-v1.2.0-phase2c` должно быть верно:

### 14.1 Структура
- [ ] Папка `src/cinematic/` содержит 10 js-файлов + `__tests__/`
- [ ] Папка `src/slides/` создана с `__tests__/`
- [ ] `src/css/cinematic.css` и `src/css/slides_phase2c.css` существуют

### 14.2 Скелеты
- [ ] Каждый `src/cinematic/*.js` содержит IIFE с `TS.<ModuleName>` stub
- [ ] Каждый `__tests__/*.test.js` содержит минимум 1 passing test (или `it.skip` с TODO)
- [ ] Тесты запускаются без ошибок: `npm test`

### 14.3 Build
- [ ] `python scripts/build_html.py` выполняется без ошибок
- [ ] Собранный HTML открывается в Chrome без ошибок в console
- [ ] Итоговый размер после Волны 1 — **ориентир 390-420 KB** (Phase 2B 377 KB + скелеты ~10 KB + CSS baseline ~6 KB + i18n 80 ключей ~6 KB). Жёсткий верхний лимит на Волну 1 — **450 KB** (подушка для наполнения в Волнах 2-6 ≥ 200 KB)
- [ ] `node scripts/check_budget.js` выполняется и возвращает 0 (лимит 650 KB — финальный)

### 14.4 I18N
- [ ] `i18n/ru.json` и `i18n/en.json` содержат ~80 новых ключей
- [ ] Тест `i18n_symmetry.test.js` зелёный
- [ ] При переключении языка в deck — новые ключи подхватываются

### 14.5 What-If Data
- [ ] `data_extract/whatif_formulas.json` создан с 3 формулами (slide14/17/12)
- [ ] JSON валиден (`node -e "JSON.parse(fs.readFileSync('data_extract/whatif_formulas.json'))"`)

### 14.6 E2E
- [ ] `npm run e2e` выполняется и проходит smoke test
- [ ] 25 слайдов открываются без ошибок

### 14.7 Regressions
- [ ] Все 350 Phase 2A+2B тестов зелёные: `npm test`
- [ ] Phase 2A/2B функциональность не изменена: ручное open → первый слайд → переход 7 → drill-down работает

---

## 15. SELF-CHECK (перед push Волны 1)

CC запускает перед push каждого PR:

```bash
# 1. Все тесты зелёные
npm test

# 2. Build успешен
python scripts/build_html.py
echo "Build size: $(stat -c%s Deck_v1.3.0/TrendStudio_LP_Deck_v1.3.0_Interactive.html) bytes"

# 3. Budget check
node scripts/check_budget.js

# 4. Regex — no forbidden APIs
grep -rn 'localStorage\|eval\|new Function\|document\.write' src/cinematic/ src/slides/ && echo "FORBIDDEN API FOUND" && exit 1 || echo "Regex clean ✓"

# 5. i18n symmetry
npm test i18n_symmetry

# 6. Phase 2A/2B regressions
npm test src/charts src/components src/orchestrator src/i18n src/a11y

# 7. Syntax check (для .js без компиляции)
for f in src/cinematic/*.js src/slides/*.js; do node -c "$f" || echo "Syntax error in $f"; done
```

Если любой шаг fail — не пушить, fix first.

---

## 16. КОММИТ-КОНВЕНЦИЯ (Волна 1)

Согласно `99_meta/commit_convention.md`, префикс `Infra:` для всей Волны 1:

```
Infra: skeleton src/cinematic/ and src/slides/        # PR #101
Infra: build_html.py includes cinematic + budget check # PR #102
Infra: i18n keys for Phase 2C (~80 keys, RU/EN)        # PR #103
Infra: whatif_formulas.json for G16 module             # PR #104
Infra: e2e runner with puppeteer                        # PR #105
```

PR-описание (template):
```markdown
## Что в PR
Кратко, 2-3 строки.

## Acceptance (из INFRA_PROMPT.md раздел 14)
- [x] 14.1 структура
- [x] 14.2 скелеты
- [x] 14.3 build (размер: N bytes)
- [x] 14.X другие

## Self-check (из INFRA_PROMPT.md раздел 15)
- [x] npm test
- [x] build_html.py
- [x] check_budget.js: N bytes / 650000 OK
- [x] regex clean
- [x] i18n symmetry

## Зависимости
- Базируется на: tag v1.2.0-phase2b
- Параллельные PR: #101-#105 (не блокируют друг друга)
- Следующая волна: MODULE_PROMPT g13-keyboard и g17-scroll-trigger

## Риски
- (если есть)
```

---

## 17. ЧТО ДЕЛАТЬ ПОСЛЕ ВОЛНЫ 1

После мержа всех 5 PR Волны 1:

1. `git pull` в ветке `claude/deck-v1.2.0-phase2c` (Cowork мержит, CC пулит)
2. Прочесть `Handoff_Phase2C/10_modules/g13_keyboard/MODULE_PROMPT.md`
3. Прочесть `Handoff_Phase2C/10_modules/g17_scroll_trigger/MODULE_PROMPT.md`
4. Реализовать оба модуля параллельно (Волна 2), 2 PR
5. После мержа G13 + G17 — переходим к Волне 3 (G8 + G9 + G12 параллельно)

---

## 18. КОНТАКТ И ЭСКАЛАЦИЯ

Если CC встречает:
- **Противоречие между этим промтом и master-файлом** — master-файл прав, открыть issue, остановиться
- **Существующий Phase 2A/2B файл требует изменения** — не изменять, открыть issue
- **Тест требует >30 мин на зелёный** — открыть issue с описанием, не игнорировать
- **Бюджет нарушен** — не пушить, остановиться, обсудить с Cowork

Канал связи: чат в Cowork (rakhman + Opus), PR-комментарии в origin.

---

_Версия INFRA_PROMPT: 1.0-final (17 апр 2026), П5 «Максимум» 32/32 пройден (самостоятельно Cowork). Правки применены._
