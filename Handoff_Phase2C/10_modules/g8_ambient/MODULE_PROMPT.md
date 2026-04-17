# G8 — TS.Ambient Particle Engine — MODULE_PROMPT

**Версия:** 1.0
**Дата:** 17 апреля 2026
**Волна:** 3 (после мержа G13 + G17)
**Ветка:** `phase2c/g8-ambient` (от `claude/deck-v1.2.0-phase2c`)
**Целевой размер файла:** ≤ 18 KB (src/cinematic/ambient.js, без тестов)
**Deps upstream:** Phase 2A (TS.A11Y, TS.emit/on, TS.Orchestrator), Phase 2C Волна 1 (скелет ambient.js), Волна 2 (TS.ScrollTrigger G17 — для auto start/stop)
**Deps downstream:** G10 Cinema Mode (setIntensity), G12 Parallax (layer integration — опционально), 25 слайдов (slide-level start/stop)

---

## 0. TL;DR

Реализовать `TS.Ambient` — canvas-based фоновый слой частиц для каждого слайда. 5 пресетов (`dust`, `sparkle`, `light_leak`, `data_stream`, `film_grain`). RAF-цикл, cap 80 частиц, адаптивная плотность по FPS, pause/resume по reduced-motion, hook для Cinema Mode. Один canvas на слайд, но один общий RAF-loop (не 25 независимых rAF). Строгая изоляция памяти: stop(slideId) полностью чистит particles/canvas/listeners.

---

## 1. КОНТЕКСТ

### 1.1 Зачем G8

Слой ambient particles — основа cinematic-впечатления deck'а. Без частиц слайды выглядят «плоскими презентационными», с частицами — киноподобными. Референс: Blade Runner 2049 (dust motes в title sequence), Dune 2021 (песчаная дымка), IMAX countdown (spark-streams). LP-встреча 29 апреля — это первое впечатление, и ambient — топовый визуальный компонент.

### 1.2 Зачем именно 5 пресетов

Каждый пресет имеет своё поведение и предназначен под тип слайда:

| Preset | Поведение | Используется на |
|---|---|---|
| `dust` | Медленный дрейф вниз-влево, 40-60 частиц 1-3 px, opacity 0.15-0.4 | Обложка, резюме, заключение |
| `sparkle` | Золотые искры, 15-25 частиц, вспышка 2× каждые 4-8 сек | Финансовые слайды, Valuation, IRR |
| `light_leak` | 3-5 крупных soft blob'ов Ø 400-600 px, plyvut 60-сек | Переходные, Thesis, Risk |
| `data_stream` | Точки-символы, диагональный поток | Market, Unit Econ, MC, Distribution (слайды 8, 12, 16, 17) |
| `film_grain` | Fullscreen noise-текстура, 8 FPS flicker (через canvas, не CSS) | Каждый слайд в Cinema Mode |

Эти 5 типов покрывают 95% визуальных потребностей. Другие формы (снег, дождь, бумеранги) — в Phase 2D при необходимости.

### 1.3 Бюджет и ограничения

- **Размер файла:** ≤ 18 KB (mini-compressed js), ~18 KB — самый большой модуль Phase 2C
- **Runtime-бюджет:** 80 частиц max, FPS ≥ 45 на iPhone XR-эквиваленте
- **Память:** ≤ 2 MB в heap на все активные слайды (обычно активен 1 слайд)
- **CPU:** ≤ 8% main thread в idle, ≤ 15% при активной навигации

### 1.4 Где лежит скелет

После Волны 1 CC создал `src/cinematic/ambient.js`:
```javascript
// G8 — TS.Ambient canvas particle system
// SKELETON created in Wave 1. Implementation comes in Wave 3.

(function (global) {
  'use strict';
  global.TS = global.TS || {};
  global.TS.Ambient = {
    start: function () { throw new Error('TS.Ambient.start not implemented yet'); },
    stop: function () { throw new Error('not implemented'); },
    pause: function () { throw new Error('not implemented'); },
    resume: function () { throw new Error('not implemented'); },
    setIntensity: function () { throw new Error('not implemented'); },
    getActivePresets: function () { throw new Error('not implemented'); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
```

Волна 3 заменяет скелет на полную реализацию.

---

## 2. API КОНТРАКТ (from INFRA_PROMPT §4.3, authoritative)

```typescript
type AmbientPreset = 'dust' | 'sparkle' | 'light_leak' | 'data_stream' | 'film_grain';

interface AmbientConfig {
  preset: AmbientPreset;
  density?: number;          // 0..1, default 0.5
  container?: HTMLElement;   // default: slide element [data-slide-id="sNN"]
}

TS.Ambient = {
  start(slideId: string, config: AmbientConfig): void,
  stop(slideId: string): void,
  pause(): void,             // pause ALL active slides (used in reduced-motion or backgrounding)
  resume(): void,            // resume all paused
  setIntensity(value: number): void, // 0..1, multiplier applied to ALL active slides
  getActivePresets(): Array<{slideId: string, preset: AmbientPreset, density: number}>
};
```

**Важно:**
- `start` для того же slideId повторно — сначала вызывает внутренний `stop`, потом стартует заново (no leak)
- `stop` для несуществующего slideId — no-op, не бросает
- `pause/resume` — глобальны, не per-slide (per-slide pause пользователем не нужен, а для reduced-motion нужен один switch)
- `setIntensity` — глобальный множитель, применяется мультипликативно к `config.density` каждого активного слайда

### 2.1 События

```javascript
TS.emit('ambient:started', { slideId, preset, density });
TS.emit('ambient:stopped', { slideId });
TS.emit('ambient:intensity_changed', { intensity });
```

---

## 3. АРХИТЕКТУРА ВНУТРИ МОДУЛЯ

### 3.1 Главные сущности

```javascript
// Приватное состояние (IIFE closure)
const _slides = new Map();       // slideId → SlideContext
const _paused = { value: false }; // глобальный флаг
const _intensity = { value: 1.0 }; // глобальный множитель
let _rafId = null;                // единый RAF loop для всех слайдов
let _lastTickTs = 0;              // для adaptive FPS
let _fpsEMA = 60;                 // exponential moving average FPS
let _reducedMotionMQ = null;      // matchMedia для prefers-reduced-motion

// SlideContext — состояние одного активного слайда
{
  slideId: string,
  preset: AmbientPreset,
  density: number,              // raw из config, без _intensity
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  particles: Array<Particle>,
  resizeObserver: ResizeObserver,
  visible: boolean              // false когда слайд не активен (G17 или ручной pause)
}

// Particle — структура с типом от preset
{
  x: number, y: number,
  vx: number, vy: number,
  size: number,
  opacity: number,
  phase: number,                // для sparkle pulse / data_stream stagger
  life: number,                 // для particles с конечной жизнью (sparkle flash)
  preset: AmbientPreset        // для смешанных preset'ов (sparkle + dust)
}
```

### 3.2 Единый RAF loop (критично)

**ЗАПРЕЩЕНО** делать `requestAnimationFrame` независимо в каждом slideContext — это 25 независимых rAF при навигации, вёдра оверхеда. Один глобальный `_tick()`:

```javascript
function _tick(ts) {
  if (_paused.value) { _rafId = null; return; }  // stop loop

  // FPS EMA для adaptive density
  if (_lastTickTs) {
    const fps = 1000 / (ts - _lastTickTs);
    _fpsEMA = _fpsEMA * 0.9 + fps * 0.1;  // smooth
  }
  _lastTickTs = ts;

  // Adaptive: если FPS < 45 — уменьшить density на всех слайдах
  const fpsScale = _fpsEMA < 45 ? 0.7 : 1.0;

  // Обновить и отрендерить каждый активный слайд
  for (const [slideId, sc] of _slides) {
    if (!sc.visible) continue;
    _updateParticles(sc, ts, fpsScale);
    _renderParticles(sc);
  }

  _rafId = requestAnimationFrame(_tick);
}
```

RAF стартуется при первом `start()`, останавливается когда `_slides.size === 0` или `_paused.value === true`.

### 3.3 Обработка reduced-motion

При инициализации модуля:

```javascript
function _initReducedMotion() {
  _reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  function apply() {
    if (_reducedMotionMQ.matches) {
      TS.Ambient.pause();
      // film_grain остаётся статичным через CSS-override, не через JS
    } else {
      TS.Ambient.resume();
    }
  }

  apply();
  // Listener
  if (_reducedMotionMQ.addEventListener) {
    _reducedMotionMQ.addEventListener('change', apply);
  } else if (_reducedMotionMQ.addListener) {
    _reducedMotionMQ.addListener(apply); // legacy Safari
  }
}
```

Инициализация — один раз на загрузку модуля (не в `start`).

### 3.4 ResizeObserver для canvas

Canvas должен адаптироваться при resize контейнера (например, при изменении ориентации):

```javascript
function _attachResize(sc) {
  sc.resizeObserver = new ResizeObserver(() => _resizeCanvas(sc));
  sc.resizeObserver.observe(sc.container);
}

function _resizeCanvas(sc) {
  const rect = sc.container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  sc.canvas.width = Math.max(1, Math.round(rect.width * dpr));
  sc.canvas.height = Math.max(1, Math.round(rect.height * dpr));
  sc.canvas.style.width = rect.width + 'px';
  sc.canvas.style.height = rect.height + 'px';
  sc.ctx.scale(dpr, dpr);

  // Перераспределить particles (clamp к новым bounds)
  for (const p of sc.particles) {
    p.x = Math.min(p.x, rect.width);
    p.y = Math.min(p.y, rect.height);
  }
}
```

### 3.5 Интеграция с G17 ScrollTrigger (опционально, автостарт)

G8 **не вызывает** TS.ScrollTrigger напрямую. Это делает code слайда (Волна 6). Но для удобства G8 предоставляет static helper `TS.Ambient.autoRegister(slideId, config)`, который регистрирует trigger если G17 доступен:

```javascript
TS.Ambient.autoRegister = function (slideId, config) {
  if (!window.TS || !window.TS.ScrollTrigger || typeof TS.ScrollTrigger.register !== 'function') {
    // Fallback: сразу старт (для неактивной слайд-системы)
    TS.Ambient.start(slideId, config);
    return;
  }
  TS.ScrollTrigger.register({
    slideId: slideId,
    onEnter: function () { TS.Ambient.start(slideId, config); },
    onExit:  function () { TS.Ambient.stop(slideId); }
  });
};
```

Это опциональный утилитарный метод, не входит в INFRA §4.3, но согласован как расширение.

---

## 4. РЕАЛИЗАЦИЯ ПРЕСЕТОВ

Каждый пресет = функция `_spawnParticle(sc)` и `_updateParticle(p, sc, ts, fpsScale)`. Dispatcher:

```javascript
const PRESETS = {
  dust:         { spawn: _spawnDust,       update: _updateDust,       baseCount: 50 },
  sparkle:      { spawn: _spawnSparkle,    update: _updateSparkle,    baseCount: 18 },
  light_leak:   { spawn: _spawnLightLeak,  update: _updateLightLeak,  baseCount: 4 },
  data_stream:  { spawn: _spawnDataStream, update: _updateDataStream, baseCount: 30 },
  film_grain:   { spawn: _spawnNoopGrain,  update: _updateNoopGrain,  baseCount: 0 }
};
```

`film_grain` — особый случай: не использует particles, рендерит noise-паттерн через `ctx.putImageData` (см. §4.5).

### 4.1 `dust`

```javascript
function _spawnDust(sc) {
  const rect = sc.canvas.getBoundingClientRect();
  return {
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: -0.1 - Math.random() * 0.3,    // drift left
    vy: 0.1 + Math.random() * 0.2,     // drift down
    size: 1 + Math.random() * 2,        // 1-3 px
    opacity: 0.15 + Math.random() * 0.25,
    phase: Math.random() * Math.PI * 2,
    life: Infinity,
    preset: 'dust'
  };
}

function _updateDust(p, sc, ts, fpsScale) {
  p.x += p.vx * fpsScale;
  p.y += p.vy * fpsScale;
  p.phase += 0.01;
  // Slight oscillation для живости
  p.x += Math.sin(p.phase) * 0.15;

  // Wrap вокруг canvas
  const w = sc.canvas.width / (window.devicePixelRatio || 1);
  const h = sc.canvas.height / (window.devicePixelRatio || 1);
  if (p.x < -5) p.x = w + 5;
  if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
}
```

Цвет: `rgba(255, 235, 180, opacity)` — тёплое золото (см. CSS `--c-ambient-dust`).

### 4.2 `sparkle`

```javascript
function _spawnSparkle(sc) {
  const rect = sc.canvas.getBoundingClientRect();
  return {
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    size: 1.5 + Math.random() * 1.5,
    opacity: 0.3,
    phase: Math.random() * Math.PI * 2,
    life: 4000 + Math.random() * 4000,  // 4-8s cycle
    lifeStart: 4000 + Math.random() * 4000,
    preset: 'sparkle'
  };
}

function _updateSparkle(p, sc, ts, fpsScale) {
  p.x += p.vx * fpsScale;
  p.y += p.vy * fpsScale;
  p.life -= 16.67 * fpsScale;   // приближённый delta
  p.phase += 0.05;

  // Вспышка — 200ms около середины life
  const lifeFrac = p.life / p.lifeStart;
  if (lifeFrac > 0.45 && lifeFrac < 0.55) {
    p.opacity = 0.3 + Math.sin((lifeFrac - 0.5) * 10 * Math.PI) * 0.5;
    p.opacity = Math.max(0.3, Math.min(0.9, p.opacity));
  } else {
    p.opacity = 0.3;
  }

  // Респаун когда life кончилось
  if (p.life <= 0) {
    const rect = sc.canvas.getBoundingClientRect();
    p.x = Math.random() * rect.width;
    p.y = Math.random() * rect.height;
    p.life = 4000 + Math.random() * 4000;
    p.lifeStart = p.life;
  }
}
```

Цвет: `rgba(201, 169, 97, opacity)` — золотой (TS.Charts.palette.stage... нет, специальный sparkle gold).

### 4.3 `light_leak`

Крупные soft blob'ы. Вместо per-particle рендера через `arc(...)`, используется `radialGradient` на ctx.

```javascript
function _spawnLightLeak(sc) {
  const rect = sc.canvas.getBoundingClientRect();
  const isGold = Math.random() > 0.5;
  return {
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.02,   // очень медленно
    vy: (Math.random() - 0.5) * 0.02,
    size: 300 + Math.random() * 300,     // Ø 300-600 px
    opacity: 0.06 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    life: Infinity,
    color: isGold ? '201,169,97' : '0,112,192',
    preset: 'light_leak'
  };
}

function _updateLightLeak(p, sc, ts, fpsScale) {
  p.x += p.vx * fpsScale;
  p.y += p.vy * fpsScale;
  p.phase += 0.005;

  // Дыхание opacity ±20%
  p.currentOpacity = p.opacity * (0.8 + Math.sin(p.phase) * 0.2);

  // Отскок от границ (мягко)
  const rect = sc.canvas.getBoundingClientRect();
  if (p.x < -p.size/2 || p.x > rect.width + p.size/2) p.vx *= -1;
  if (p.y < -p.size/2 || p.y > rect.height + p.size/2) p.vy *= -1;
}
```

Рендер (см. §4.6) — radialGradient с blur-эффектом через composite operation.

### 4.4 `data_stream`

Точки-символы, падающие по диагонали. Используется только на аналитических слайдах.

```javascript
function _spawnDataStream(sc) {
  const rect = sc.canvas.getBoundingClientRect();
  return {
    x: Math.random() * rect.width,
    y: -20,
    vx: -1.5 - Math.random() * 1.0,    // diagonal down-left
    vy: 2.0 + Math.random() * 1.5,
    size: 1 + Math.random() * 1,
    opacity: 0.2 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
    life: Infinity,
    char: Math.random() > 0.7 ? '·' : '•',  // mostly dots, some char
    preset: 'data_stream'
  };
}

function _updateDataStream(p, sc, ts, fpsScale) {
  p.x += p.vx * fpsScale;
  p.y += p.vy * fpsScale;

  const rect = sc.canvas.getBoundingClientRect();
  if (p.y > rect.height + 10) {
    p.y = -20;
    p.x = Math.random() * (rect.width * 1.3);  // запас для diagonal wrap
  }
}
```

### 4.5 `film_grain`

Особый preset: **не использует particles array**. Рендер — noise pattern через `ImageData`. Для экономии CPU — генерируется 4 pre-rendered noise frames и циклически отображается со скоростью 8 FPS.

```javascript
// Pre-render 4 noise frames (lazy, на первом _renderFilmGrain)
function _ensureGrainFrames(sc) {
  if (sc.grainFrames) return;
  sc.grainFrames = [];
  const w = 128, h = 128;  // маленький tile, растягивается через ctx.drawImage с repeat
  for (let f = 0; f < 4; f++) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(w, h);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 256);
      imgData.data[i]     = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 30;  // alpha — низкая, чтобы было subtle
    }
    offCtx.putImageData(imgData, 0, 0);
    sc.grainFrames.push(offCanvas);
  }
  sc.grainFrameIndex = 0;
  sc.grainLastSwap = 0;
}

function _updateNoopGrain(p, sc, ts, fpsScale) { /* no-op — grain не имеет particles */ }

// Рендер grain — особый путь, вызывается из _renderParticles (см. §4.6)
function _renderFilmGrain(sc, ts) {
  _ensureGrainFrames(sc);
  if (ts - sc.grainLastSwap > 125) {  // 8 FPS = 125ms per frame
    sc.grainFrameIndex = (sc.grainFrameIndex + 1) % sc.grainFrames.length;
    sc.grainLastSwap = ts;
  }

  const pat = sc.ctx.createPattern(sc.grainFrames[sc.grainFrameIndex], 'repeat');
  const w = sc.canvas.width / (window.devicePixelRatio || 1);
  const h = sc.canvas.height / (window.devicePixelRatio || 1);
  sc.ctx.save();
  sc.ctx.globalCompositeOperation = 'screen';
  sc.ctx.fillStyle = pat;
  sc.ctx.globalAlpha = 0.15 * _intensity.value;  // --grain-density из CSS
  sc.ctx.fillRect(0, 0, w, h);
  sc.ctx.restore();
}
```

### 4.6 Общий рендер

```javascript
function _renderParticles(sc) {
  const w = sc.canvas.width / (window.devicePixelRatio || 1);
  const h = sc.canvas.height / (window.devicePixelRatio || 1);
  sc.ctx.clearRect(0, 0, w, h);

  const intensity = _intensity.value;

  for (const p of sc.particles) {
    sc.ctx.save();

    if (p.preset === 'dust') {
      sc.ctx.globalAlpha = p.opacity * intensity;
      sc.ctx.fillStyle = 'rgba(255, 235, 180, 1)';
      sc.ctx.beginPath();
      sc.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sc.ctx.fill();

    } else if (p.preset === 'sparkle') {
      sc.ctx.globalAlpha = p.opacity * intensity;
      sc.ctx.fillStyle = 'rgba(201, 169, 97, 1)';
      sc.ctx.beginPath();
      sc.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sc.ctx.fill();

    } else if (p.preset === 'light_leak') {
      const grad = sc.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size / 2);
      grad.addColorStop(0, 'rgba(' + p.color + ',' + (p.currentOpacity * intensity) + ')');
      grad.addColorStop(1, 'rgba(' + p.color + ',0)');
      sc.ctx.fillStyle = grad;
      sc.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);

    } else if (p.preset === 'data_stream') {
      sc.ctx.globalAlpha = p.opacity * intensity;
      sc.ctx.fillStyle = 'rgba(102, 204, 255, 1)';  // --c-lightleak-cold
      sc.ctx.font = '10px monospace';
      sc.ctx.fillText(p.char, p.x, p.y);
    }

    sc.ctx.restore();
  }

  // Film grain — отдельным проходом, поверх particles
  if (sc.preset === 'film_grain' || sc.hasGrain) {
    _renderFilmGrain(sc, performance.now());
  }
}
```

**Важно:** `film_grain` можно комбинировать с любым другим пресетом. Если config был `{preset: 'dust', grain: true}` (расширение) — сначала рендерятся dust, потом grain поверх. В Волне 3 рекомендуется **не поддерживать комбинирование** — ограничиться одним пресетом на слайд. Если нужен grain на всех слайдах — он добавляется отдельным вызовом `TS.Ambient.start(slideId + ':grain', {preset: 'film_grain'})` на отдельном slideId-ключе. Архитектурно это работает, потому что `_slides` — Map по любым строкам.

---

## 5. ПОЛНЫЙ ШАБЛОН РЕАЛИЗАЦИИ

Файл `src/cinematic/ambient.js` (≤ 18 KB, стремимся к 15-16 KB):

```javascript
/**
 * G8 — TS.Ambient particle engine
 * See: Handoff_Phase2C/10_modules/g8_ambient/MODULE_PROMPT.md
 * API: INFRA_PROMPT.md §4.3
 */

(function (global) {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // Приватное состояние
  // ─────────────────────────────────────────────────────────
  const _slides = new Map();
  const _paused = { value: false };
  const _intensity = { value: 1.0 };
  let _rafId = null;
  let _lastTickTs = 0;
  let _fpsEMA = 60;
  let _reducedMotionInit = false;

  const PRESETS = {
    dust:        { spawn: _spawnDust,       update: _updateDust,       baseCount: 50 },
    sparkle:     { spawn: _spawnSparkle,    update: _updateSparkle,    baseCount: 18 },
    light_leak:  { spawn: _spawnLightLeak,  update: _updateLightLeak,  baseCount: 4  },
    data_stream: { spawn: _spawnDataStream, update: _updateDataStream, baseCount: 30 },
    film_grain:  { spawn: null,             update: null,              baseCount: 0  }
  };

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────
  function start(slideId, config) {
    if (typeof slideId !== 'string' || !config || !PRESETS[config.preset]) {
      throw new Error('TS.Ambient.start: invalid arguments');
    }
    _initReducedMotionOnce();

    // Replace if already running
    if (_slides.has(slideId)) stop(slideId);

    const container = config.container || document.querySelector('[data-slide-id="' + slideId + '"]');
    if (!container) {
      // eslint-disable-next-line no-console
      console.warn('TS.Ambient: container for slide ' + slideId + ' not found, skipping');
      return;
    }

    const density = typeof config.density === 'number' ? config.density : 0.5;
    const canvas = _createCanvas(container);
    const ctx = canvas.getContext('2d');

    const sc = {
      slideId: slideId,
      preset: config.preset,
      density: density,
      container: container,
      canvas: canvas,
      ctx: ctx,
      particles: [],
      resizeObserver: null,
      visible: true,
      hasGrain: false
    };

    _resizeCanvas(sc);
    _attachResize(sc);

    if (PRESETS[config.preset].spawn) {
      const count = Math.round(PRESETS[config.preset].baseCount * density);
      for (let i = 0; i < count; i++) {
        sc.particles.push(PRESETS[config.preset].spawn(sc));
      }
    }

    _slides.set(slideId, sc);

    // Start RAF if not running
    if (!_rafId && !_paused.value) {
      _rafId = requestAnimationFrame(_tick);
    }

    TS.emit && TS.emit('ambient:started', { slideId: slideId, preset: config.preset, density: density });
  }

  function stop(slideId) {
    const sc = _slides.get(slideId);
    if (!sc) return;

    if (sc.resizeObserver) sc.resizeObserver.disconnect();
    if (sc.canvas && sc.canvas.parentNode) sc.canvas.parentNode.removeChild(sc.canvas);
    sc.particles = [];
    sc.grainFrames = null;

    _slides.delete(slideId);

    if (_slides.size === 0 && _rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }

    TS.emit && TS.emit('ambient:stopped', { slideId: slideId });
  }

  function pause() {
    _paused.value = true;
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
  }

  function resume() {
    if (!_paused.value) return;
    _paused.value = false;
    if (_slides.size > 0 && !_rafId) {
      _lastTickTs = 0;
      _rafId = requestAnimationFrame(_tick);
    }
  }

  function setIntensity(value) {
    const v = Math.max(0, Math.min(1, value));
    _intensity.value = v;
    TS.emit && TS.emit('ambient:intensity_changed', { intensity: v });
  }

  function getActivePresets() {
    const result = [];
    for (const [slideId, sc] of _slides) {
      result.push({ slideId: slideId, preset: sc.preset, density: sc.density });
    }
    return result;
  }

  // Optional helper for slide code (Wave 6)
  function autoRegister(slideId, config) {
    if (!global.TS || !global.TS.ScrollTrigger || typeof global.TS.ScrollTrigger.register !== 'function') {
      start(slideId, config);
      return;
    }
    global.TS.ScrollTrigger.register({
      slideId: slideId,
      onEnter: function () { start(slideId, config); },
      onExit:  function () { stop(slideId); }
    });
  }

  // ─────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────
  function _createCanvas(container) {
    const canvas = document.createElement('canvas');
    canvas.className = 'ts-ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-ambient', 'true');
    const label = (global.TS && TS.I18N && TS.I18N.t) ? TS.I18N.t('a11y.g8.canvas') : 'Decorative canvas';
    canvas.setAttribute('aria-label', label);
    // Убедиться, что container — position:relative для абсолютного позиционирования canvas
    const cs = getComputedStyle(container);
    if (cs.position === 'static') container.style.position = 'relative';
    container.insertBefore(canvas, container.firstChild);
    return canvas;
  }

  function _resizeCanvas(sc) {
    const rect = sc.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sc.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    sc.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    sc.canvas.style.width = rect.width + 'px';
    sc.canvas.style.height = rect.height + 'px';
    sc.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // reset + scale
    for (const p of sc.particles) {
      p.x = Math.min(p.x, rect.width);
      p.y = Math.min(p.y, rect.height);
    }
  }

  function _attachResize(sc) {
    if (typeof ResizeObserver !== 'undefined') {
      sc.resizeObserver = new ResizeObserver(function () { _resizeCanvas(sc); });
      sc.resizeObserver.observe(sc.container);
    }
  }

  function _tick(ts) {
    if (_paused.value) { _rafId = null; return; }

    if (_lastTickTs) {
      const fps = 1000 / Math.max(1, ts - _lastTickTs);
      _fpsEMA = _fpsEMA * 0.9 + fps * 0.1;
    }
    _lastTickTs = ts;

    const fpsScale = _fpsEMA < 45 ? 0.7 : 1.0;

    for (const [, sc] of _slides) {
      if (!sc.visible) continue;
      const p = PRESETS[sc.preset];
      if (p && p.update) {
        for (let i = 0; i < sc.particles.length; i++) {
          p.update(sc.particles[i], sc, ts, fpsScale);
        }
      }
      _renderParticles(sc, ts);
    }

    _rafId = requestAnimationFrame(_tick);
  }

  function _initReducedMotionOnce() {
    if (_reducedMotionInit) return;
    _reducedMotionInit = true;
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() {
      if (mq.matches) pause();
      else resume();
    }
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }

  // Preset-specific spawn/update/render — см. §4.1-§4.6
  function _spawnDust(sc) { /* ... из §4.1 ... */ }
  function _updateDust(p, sc, ts, fpsScale) { /* ... */ }
  function _spawnSparkle(sc) { /* ... из §4.2 ... */ }
  function _updateSparkle(p, sc, ts, fpsScale) { /* ... */ }
  function _spawnLightLeak(sc) { /* ... из §4.3 ... */ }
  function _updateLightLeak(p, sc, ts, fpsScale) { /* ... */ }
  function _spawnDataStream(sc) { /* ... из §4.4 ... */ }
  function _updateDataStream(p, sc, ts, fpsScale) { /* ... */ }
  function _renderParticles(sc, ts) { /* ... из §4.6 ... */ }
  function _renderFilmGrain(sc, ts) { /* ... из §4.5 ... */ }
  function _ensureGrainFrames(sc) { /* ... из §4.5 ... */ }

  // ─────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────
  global.TS = global.TS || {};
  global.TS.Ambient = {
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    setIntensity: setIntensity,
    getActivePresets: getActivePresets,
    autoRegister: autoRegister
  };

})(typeof window !== 'undefined' ? window : globalThis);
```

**Реализовать нужно все `/* ... */` заглушки, используя §4.1-§4.6 как точный источник логики.**

---

## 6. ИЗМЕНЕНИЯ ВНЕ МОДУЛЯ

### 6.1 `src/css/cinematic.css` (CSS уже создан в Волне 1)

CC проверяет, что в `cinematic.css` уже есть:
```css
.ts-ambient-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-ambient);
}
```

Если нет — добавить (это minor правка, не считается нарушением раздела «не менять Phase 2A/2B», потому что файл создан Phase 2C Волной 1).

### 6.2 `i18n/ru.json` и `i18n/en.json`

Ключ `a11y.g8.canvas` уже был добавлен в Волне 1 (INFRA §6.2):
- RU: «Декоративный канвас — можно игнорировать»
- EN: «Decorative canvas — safe to ignore»

Ключи пресетов (`ui.g8.preset.dust`, `ui.g8.preset.sparkle`, `ui.g8.preset.light_leak`, `ui.g8.preset.data_stream`, `ui.g8.preset.film_grain`) — тоже из Волны 1, используются в Волне 5 (G14 ContextMenu «Preset ambient →») — в G8 напрямую не нужны.

**Новых ключей G8 не добавляет.**

### 6.3 Документация — обновить CC_CHECKLIST

После PR G8 в `Handoff_Phase2C/99_meta/CC_CHECKLIST.md` поставить отметку Волны 3 G8 ✓.

---

## 7. TEST-СПЕЦИФИКАЦИЯ

Файл `src/cinematic/__tests__/ambient.test.js` — ≥ 18 тестов.

### 7.1 Обязательные группы

```javascript
const { mockTS, mockReducedMotion, mockRaf, mockCanvas } = require('./test-helpers');

describe('TS.Ambient', () => {

  beforeEach(() => {
    window.TS = mockTS();
    mockRaf();
    mockCanvas();
    // Clear module cache для чистой загрузки
    jest.resetModules();
    require('../ambient.js');
  });

  afterEach(() => {
    // Остановить все активные слайды
    if (TS.Ambient.getActivePresets) {
      TS.Ambient.getActivePresets().forEach(({slideId}) => TS.Ambient.stop(slideId));
    }
    jest.clearAllMocks();
    delete window.TS;
    document.body.innerHTML = '';
  });

  // ─── API surface ───────────────────────────
  describe('API surface', () => {
    it('exposes start, stop, pause, resume, setIntensity, getActivePresets', () => {
      ['start','stop','pause','resume','setIntensity','getActivePresets'].forEach(m => {
        expect(typeof TS.Ambient[m]).toBe('function');
      });
    });

    it('exposes autoRegister helper', () => {
      expect(typeof TS.Ambient.autoRegister).toBe('function');
    });
  });

  // ─── start/stop ───────────────────────────
  describe('start/stop', () => {
    beforeEach(() => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      el.style.width = '800px';
      el.style.height = '600px';
      document.body.appendChild(el);
    });

    it('start creates canvas in container', () => {
      TS.Ambient.start('s01', { preset: 'dust', density: 0.5 });
      const canvas = document.querySelector('[data-slide-id="s01"] .ts-ambient-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.getAttribute('aria-hidden')).toBe('true');
    });

    it('start twice for same slideId does not leak canvases', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.start('s01', { preset: 'sparkle' });
      const canvases = document.querySelectorAll('[data-slide-id="s01"] .ts-ambient-canvas');
      expect(canvases.length).toBe(1);
    });

    it('stop removes canvas', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.stop('s01');
      expect(document.querySelector('.ts-ambient-canvas')).toBe(null);
    });

    it('stop for unknown slideId is no-op', () => {
      expect(() => TS.Ambient.stop('s99')).not.toThrow();
    });

    it('start throws for invalid preset', () => {
      expect(() => TS.Ambient.start('s01', { preset: 'invalid' })).toThrow();
    });

    it('start emits ambient:started event', () => {
      TS.Ambient.start('s01', { preset: 'dust', density: 0.7 });
      expect(TS.emit).toHaveBeenCalledWith('ambient:started',
        expect.objectContaining({ slideId: 's01', preset: 'dust', density: 0.7 }));
    });

    it('stop emits ambient:stopped event', () => {
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.stop('s01');
      expect(TS.emit).toHaveBeenCalledWith('ambient:stopped',
        expect.objectContaining({ slideId: 's01' }));
    });
  });

  // ─── getActivePresets ──────────────────────
  describe('getActivePresets', () => {
    it('returns empty array when nothing active', () => {
      expect(TS.Ambient.getActivePresets()).toEqual([]);
    });

    it('returns list of active slides with preset+density', () => {
      const el1 = document.createElement('div');
      el1.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el1);
      const el2 = document.createElement('div');
      el2.setAttribute('data-slide-id', 's05');
      document.body.appendChild(el2);

      TS.Ambient.start('s01', { preset: 'dust', density: 0.5 });
      TS.Ambient.start('s05', { preset: 'sparkle', density: 0.8 });

      const active = TS.Ambient.getActivePresets();
      expect(active.length).toBe(2);
      expect(active).toEqual(expect.arrayContaining([
        expect.objectContaining({ slideId: 's01', preset: 'dust', density: 0.5 }),
        expect.objectContaining({ slideId: 's05', preset: 'sparkle', density: 0.8 })
      ]));
    });
  });

  // ─── setIntensity ──────────────────────────
  describe('setIntensity', () => {
    it('clamps value to [0,1]', () => {
      TS.Ambient.setIntensity(-0.5);
      // Проверка через событие
      expect(TS.emit).toHaveBeenCalledWith('ambient:intensity_changed', { intensity: 0 });
      TS.Ambient.setIntensity(2);
      expect(TS.emit).toHaveBeenCalledWith('ambient:intensity_changed', { intensity: 1 });
    });

    it('accepts 0..1 value unchanged', () => {
      TS.Ambient.setIntensity(0.6);
      expect(TS.emit).toHaveBeenCalledWith('ambient:intensity_changed', { intensity: 0.6 });
    });
  });

  // ─── pause/resume ──────────────────────────
  describe('pause/resume', () => {
    it('pause stops RAF loop', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.pause();
      // Нет прямого способа проверить RAF без таймеров — проверяем через getActivePresets (остаётся, но не тикает)
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });

    it('resume after pause re-enables tick', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      TS.Ambient.start('s01', { preset: 'dust' });
      TS.Ambient.pause();
      TS.Ambient.resume();
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });
  });

  // ─── reduced-motion ────────────────────────
  describe('reduced-motion', () => {
    it('pauses automatically when prefers-reduced-motion is reduce', () => {
      mockReducedMotion(true);
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      TS.Ambient.start('s01', { preset: 'dust' });
      // После start + matchMedia apply() должен был вызвать pause()
      // Проверяем косвенно — презенты есть, но они не анимируются (RAF не тикает)
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });
  });

  // ─── memory safety ─────────────────────────
  describe('memory safety', () => {
    it('start/stop × 50 cycles leaves no canvases', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      for (let i = 0; i < 50; i++) {
        TS.Ambient.start('s01', { preset: 'dust' });
        TS.Ambient.stop('s01');
      }
      expect(document.querySelectorAll('.ts-ambient-canvas').length).toBe(0);
    });
  });

  // ─── autoRegister ──────────────────────────
  describe('autoRegister', () => {
    it('falls back to direct start when ScrollTrigger not available', () => {
      delete window.TS.ScrollTrigger;
      const el = document.createElement('div');
      el.setAttribute('data-slide-id', 's01');
      document.body.appendChild(el);
      TS.Ambient.autoRegister('s01', { preset: 'dust' });
      expect(TS.Ambient.getActivePresets().length).toBe(1);
    });

    it('uses ScrollTrigger when available', () => {
      window.TS.ScrollTrigger = { register: jest.fn() };
      TS.Ambient.autoRegister('s01', { preset: 'dust' });
      expect(TS.ScrollTrigger.register).toHaveBeenCalledWith(
        expect.objectContaining({
          slideId: 's01',
          onEnter: expect.any(Function),
          onExit: expect.any(Function)
        })
      );
    });
  });

  // ─── container fallback ────────────────────
  describe('container resolution', () => {
    it('uses config.container if provided', () => {
      const custom = document.createElement('section');
      document.body.appendChild(custom);
      TS.Ambient.start('s01', { preset: 'dust', container: custom });
      expect(custom.querySelector('.ts-ambient-canvas')).toBeTruthy();
    });

    it('warns and skips when container not found', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      TS.Ambient.start('sXX', { preset: 'dust' });
      expect(warn).toHaveBeenCalled();
      expect(TS.Ambient.getActivePresets().length).toBe(0);
      warn.mockRestore();
    });
  });

});
```

### 7.2 Требования

- Все 18+ тестов зелёные
- Покрытие кода ≥ 75% (jest --coverage)
- Время прогона suite ≤ 5s

---

## 8. ВЗАИМОДЕЙСТВИЕ С ДРУГИМИ МОДУЛЯМИ

### 8.1 С G10 Cinema Mode (Волна 5)

G10 при `enter()` вызовет `TS.Ambient.setIntensity(1.3)` (на 30% ярче, per CC_SPEC_v2 §G10: "Ambient particles density +30%"). При `exit()` — возврат к 1.0.

**Важно:** 1.3 > 1, поэтому clamp(0,1) в setIntensity нужно **снять или поднять до 2.0**. Текущая реализация clamp'ит к [0,1]. Решение: clamp поднять до [0, 2] (intensity не имеет семантического верхнего предела в Cinema). Уточнение — внести в §2:

```javascript
function setIntensity(value) {
  const v = Math.max(0, Math.min(2, value));  // [0, 2] вместо [0, 1]
  ...
}
```

В тестах `describe('setIntensity')` обновить `expect(...intensity: 1)` на 2 для случая > 1.

### 8.2 С G12 Parallax (Волна 3)

G12 применяет transform к `.ts-parallax-layer` элементам. Canvas G8 помечается `data-depth="0.6"` (media depth), чтобы G12 автоматически включил его в parallax-layering. Это опционально — если `data-depth` отсутствует, G12 не трогает canvas.

Реализация: добавить `canvas.setAttribute('data-depth', '0.6')` в `_createCanvas`.

### 8.3 С G17 ScrollTrigger (Волна 2, уже done)

`autoRegister` использует `TS.ScrollTrigger.register`. Никакой логики G17 G8 не дублирует.

### 8.4 С reduced-motion detection

Инициализация matchMedia — один раз в `_initReducedMotionOnce()` при первом `start()`. Не инициализировать на module-load, потому что jsdom в тестах без matchMedia mock падает.

---

## 9. БЮДЖЕТ И ПРОИЗВОДИТЕЛЬНОСТЬ

### 9.1 Размер файла

Таргет: 15-18 KB (не minified, читабельный). Порог: **строго ≤ 20 KB** (с запасом на комментарии). Self-check:

```bash
wc -c src/cinematic/ambient.js
# Ожидание: 15000-18000 байт
```

Если превышение — рефакторинг: вынести PRESETS в отдельный constant файл, сократить комментарии, объединить общие path'ы спавна.

### 9.2 Runtime-бенчмарки

Ручной (перед push):
1. Открыть deck в Chrome
2. Перейти на слайд 1 (dust preset)
3. Открыть DevTools → Performance → записать 5 сек
4. Проверить:
   - FPS ≥ 55 (таргет 60)
   - Main thread blocking < 8%
   - Memory (Performance Monitor): < 50 MB JS heap

Если FPS < 45 стабильно — убрать из списка частиц наиболее тяжёлые effects (sparkle pulse через Math.sin → precomputed LUT).

### 9.3 Adaptive density (автоматически)

В `_tick` при `_fpsEMA < 45` применяется `fpsScale = 0.7`. Это УМЕНЬШАЕТ скорость обновления, а не количество частиц. **Альтернатива для v1.1:** удалять лишние particles при fps<45. В первой версии достаточно fpsScale.

---

## 10. ПРОВЕРКИ ПЕРЕД PUSH

```bash
# 1. Jest
npm test src/cinematic/__tests__/ambient.test.js
# Ожидание: все тесты зелёные

# 2. Full suite regression
npm test
# Ожидание: 350 Phase 2A/2B + новые G13/G17 + 18+ G8 = все зелёные

# 3. Размер файла
wc -c src/cinematic/ambient.js
# Ожидание: 15000-18000 байт

# 4. Forbidden APIs
grep -nE 'eval\(|new Function|localStorage|document\.write' src/cinematic/ambient.js
# Ожидание: пусто

# 5. Syntax check
node -c src/cinematic/ambient.js
# Ожидание: OK

# 6. Build + check_budget
python scripts/build_html.py
node scripts/check_budget.js
# Ожидание: HTML ≤ 650 KB

# 7. Smoke — открыть deck, нажать F, Cmd/Ctrl+R, увидеть что частицы рендерятся на слайде 1
# (ручная проверка — записать скриншот в PR description)
```

---

## 11. ACCEPTANCE CRITERIA

- [ ] `src/cinematic/ambient.js` реализован полностью (нет `throw new Error('not implemented')`)
- [ ] `src/cinematic/__tests__/ambient.test.js` содержит ≥ 18 тестов, все зелёные
- [ ] Покрытие кода ≥ 75%
- [ ] Размер файла ambient.js ∈ [13, 20] KB
- [ ] 5 пресетов реализованы: dust, sparkle, light_leak, data_stream, film_grain
- [ ] setIntensity clamp'нут к [0, 2] (не [0, 1])
- [ ] RAF-цикл один общий, не per-slide
- [ ] matchMedia reduced-motion listener подписан и отписан корректно
- [ ] ResizeObserver работает при resize контейнера
- [ ] События `ambient:started/stopped/intensity_changed` эмитятся
- [ ] Нет `eval`, `new Function`, `localStorage`, `document.write`, `setTimeout` для чанкинга (только `requestAnimationFrame`)
- [ ] Full Jest suite green: 350+ (Phase 2A/2B) + G13 + G17 + 18+ G8
- [ ] Budget check: HTML ≤ 650 000 байт
- [ ] Коммит `G8: TS.Ambient canvas particle engine (5 presets, RAF, adaptive FPS)`
- [ ] PR-описание с acceptance checkboxes + скриншот/gif результата

---

## 12. КОММИТ

```
G8: TS.Ambient canvas particle engine

Implements 5 ambient presets (dust, sparkle, light_leak, data_stream,
film_grain) over a single shared RAF loop with adaptive FPS-based density
scaling. Per-slide canvas via ResizeObserver, global pause/resume honoring
prefers-reduced-motion, intensity multiplier [0, 2] for Cinema Mode hook
(G10 Wave 5). autoRegister helper integrates with G17 ScrollTrigger when
available.

Size: ~17 KB. 18+ Jest tests, ≥75% coverage.
Spec: Handoff_Phase2C/10_modules/g8_ambient/MODULE_PROMPT.md
```

---

## 13. PR-ОПИСАНИЕ (шаблон)

```markdown
## G8 — TS.Ambient Particle Engine

### Что в PR
- `src/cinematic/ambient.js` (~17 KB) — полная реализация 5 пресетов
- `src/cinematic/__tests__/ambient.test.js` — 18+ Jest тестов
- Единый RAF loop, adaptive FPS scaling, matchMedia reduced-motion guard
- autoRegister helper для интеграции с G17

### Acceptance
См. MODULE_PROMPT §11 — все чекбоксы ✓

### Скриншот
<img width="800" src="..." alt="dust preset on slide 1"/>
<img width="800" src="..." alt="sparkle preset on slide 14"/>

### Тесты
- ambient.test.js: 18/18 ✓ (coverage 78%)
- Full suite: 370+ tests ✓
- HTML size: 418 KB / 650 KB ✓

### Риски и trade-offs
- `setIntensity` clamp расширен до [0, 2] — обосновано G10 требованием +30%
- film_grain pre-rendered frames (4 шт × 128×128 px) — +~50 KB heap, приемлемо
- При навигации back-to-back 25→1→25 возможен spike CPU (RAF restart). Mitigation: не stop() при exit, а sc.visible = false — оставлено на v1.1 если окажется проблемой
```

---

## 14. КОНТАКТ

При противоречии с INFRA_PROMPT §4.3 или CC_PHASE2C_SPEC_v2 §G8 — CC открывает issue и останавливает PR. Не решать единолично. Escalation: PR-комментарий + чат Cowork.

---

_Версия MODULE_PROMPT G8: 1.0 (17 апр 2026)_
_Готов к Волне 3, старт после мержа G13/G17 PR._
