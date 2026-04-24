# ПРОМТ: HTML-лендинг ТрендСтудио Холдинг (v1.1)

**Статус:** v1.1 — вторая итерация промта с учётом 26 решений пользователя по анимации / интерактивности / фону / изображениям / offline-формату.
**Базируется на:** `Промт_HTML_лендинг_Холдинг_v1.0.md` (2026-04-19) + архитектуре `Промт_HTML_лендинг_ЦПИКП_v5.2.md`.
**Дата:** 2026-04-19.
**Формат артефакта:** HTML-лендинг (одностраничный сайт, scroll-storytelling), **без жёсткого лимита объёма** (пользователь явно снял ограничение: «хоть 100 ГБ»). Рекомендуемый практический таргет для offline single-file: **≤ 30 MB** с inline base64 (шрифты + GSAP/D3/Three.js + SVG + GeoJSON + ключевые изображения).
**Формат доставки промта:** **4 файла** — этот `.md` + `canon_holding_base.json` (18 блоков) + `canon_holding_extended.json` (23 блока, +1 относительно v1.0) + `Gemini_TZ_images_v1.0.md` (техзадание на 15-20 ключевых изображений).
**Обязательное требование:** лендинг открывается и корректно работает на **мобильных устройствах** (iOS Safari ≥ 15, Android Chrome ≥ 110) — см. §10 «Mobile-паритет».

---

## §0. Change log v1.0 → v1.1

| № | Решение | Что изменилось в промте |
|---|---------|--------------------------|
| 1 | Lenis + 35 animation patterns | Добавлен §1.5.1 «Smooth-scroll details» + уточнение §10.4 для iOS (`smoothTouch=false`) |
| 2 | 100% coverage interactivity | Подтверждено §6.1 и §6.3 + acceptance criterion 71 (§7.1) |
| 3 | 100% coverage animation on interaction | Подтверждено §6.1 + acceptance criterion 72 (§7.1) |
| 4 | Offline single-file HTML | §11.1 уточнён: ≤ 30 MB target, inline base64 для ВСЕХ ассетов (включая изображения) |
| 5 | **Hybrid background** (layers 1+2 совмещены) | Новый §1.6 «Background strategy — 3 слоя адаптивно» |
| 6 | **Hybrid images** (Gemini ключевые + SVG декор) | Новый §1.7 «Image strategy» + Приложение В «Gemini TZ» |
| 7 | Gemini TZ после v1.1, до canon | §12 (порядок сдачи) обновлён: v1.1 → Gemini TZ → генерация изображений → canon → HTML |
| 8 | A+C naming convention (строгая конвенция + canon.images.* registry) | Новый §1.8 «Image folder и naming convention» + блок `canon.images` (#23) в `canon_holding_extended.json` (§2.2) |

Остальные решения из 18 предыдущих (якоря, 25 секций, 22 визуализации, 13 симуляторов, аудитории, мобильность, П5 32/32 + М4 7/7) — **без изменений относительно v1.0**, детали сохранены.

---

## §0.1. Карта родословной и отличий от ЦПИКП v5.2

| Раздел | ЦПИКП v5.2 (образец) | Холдинг v1.1 (этот промт) |
|--------|-----------------------|----------------------------|
| Предметная область | Центр прикладных исследований (образование + наука + бизнес) | **Киноиндустриальный холдинг** (production + distribution + IP + LP-фонд) |
| Источник данных | `canon_v5.1.json` (12) + `canon_v5.2.json` (18) | `canon_holding_base.json` (18) + `canon_holding_extended.json` (**23**) = **41 блок** |
| Аудитории | leadership / partners / public | **LP-инвесторы / Стратегические партнёры / Госорганы** |
| Секций | 21 | **25** (21 базовая + 4 Holding-специфичных: Pipeline Gallery, Team+Advisory Board, LP-onboarding/Term Sheet, Press carousel) |
| Типов визуализаций | 15+ | **22** (добавлены: Box-office waterfall, Release-window timeline, Genre mix radar, Tax-credit flow, OTT-vs-Theatrical switch) |
| Time-series | 27 точек (M1-M12 + Y2Q1-Y3Q4 + Y4-Y10) | **Наследуется** + **weekly box-office run** (16 недель × 7 проектов × сценарий) |
| Симуляторов | 4 | **13 симуляторов** (см. §5) |
| Лимит объёма | ≤ 10 MB | **Без лимита** (пользователь снял). Рекомендуемый практический таргет: **≤ 30 MB** для offline single-file |
| Стиль | MEPhI corporate | **Dark cinematic Nolan/Dune** (§1.3 палитра: чёрный + глубокий navy + gold, **без electric blue**) |
| Платформы | Desktop-first (mobile — опционально) | **Desktop + Mobile паритет** (обязательное требование) |
| Доставка | Claude.ai Web Artifact | **Offline single HTML** + SEO/OG-теги + Print-friendly (3 формата, без password-защиты) |
| Фон | статичный | **Hybrid 3-layer** (gradient drift + cinematic grain + 3D particles, адаптивно по устройству) |
| Изображения | 1-2 hero-фото | **Hybrid подход**: 15-20 ключевых Gemini Nano Banana + inline SVG декор |
| Верификация | П5 + М4 (7) | **П5 «Максимум» 32/32 + М4 Презентационная 7/7** |

---

## §1. Архитектура и контекст Холдинга

### §1.1. Что такое ТрендСтудио Холдинг (data baseline)

ТрендСтудио Холдинг — российский киноиндустриальный холдинг, формируемый под LP-фонд размером **3 000 млн ₽** (якорь), с pipeline из **7 проектов** (5 полнометражных фильмов + 2 сериала), распределённых по **4 стадиям** (pre-production / production / post-production / release). Горизонт — 7 лет, TVPI target ≥ 2.0×, IRR target ≥ 20% (Public) / ≥ 24% (Internal).

Baseline-данные для лендинга собираются из **4 источников**:

1. **LP Memo v1.1.0** + **5 Appendices** — текстовая часть (повествование, тезисы, FAQ).
2. **Deck v1.1.2** — структурная часть (25 слайдов Interactive HTML).
3. **Investor Model v3.0** (Internal + Public) — числовая часть (IRR, MOIC, TVPI, NPV, MC, cash-flow, pipeline).
4. **Finmodel v1.4.4** — якоря (3 000 млн ₽, 348 тестов, 32/32 П5 «Максимум», MC-движки).

### §1.2. Ключевые якорные цифры (anchor values)

Эти значения канонически фиксированы и **не должны расходиться** между всеми файлами / графиками / симуляторами (М4.7 cross-file integrity):

| Якорь | Значение | Источник |
|-------|----------|----------|
| LP Fund Size | **3 000 млн ₽** | Finmodel v1.4.4 |
| Pipeline count | **7 проектов** (5 фильмов + 2 сериала) | Investor Model v3.0 |
| Stages × projects | **4 × 7 = 28 проект-стадий** (validated 215/215 datapoints) | Investor Model v3.0 |
| IRR Internal (W₅ V-D) | **24.75%** | Investor Model v1.0.1 |
| IRR Public (W₃) | **20.09%** | Investor Model v1.0.1 |
| Monte Carlo p50 IRR Internal | **≈ 13.95%** | Investor Model v1.0.1 |
| Monte Carlo p50 IRR Public | **≈ 11.44%** | Investor Model v1.0.1 |
| Target TVPI / MOIC | ≥ **2.0×** | LP Memo v1.1.0 |
| Horizon | **7 лет** (Y1-Y7) | Finmodel |
| Тесты финмодели | **348/348 PASS** | Finmodel v1.4.4 |

Эти 10 якорей обязаны проходить автоматический ассерт-тест в Фазе 0 (см. §8).

### §1.3. Палитра Dark Cinematic Nolan/Dune (v1.1 — ОБНОВЛЕНА)

**Изменение v1.0 → v1.1:** удалён `accent-blue #4FC3F7` (electric blue, слишком «technoid» для киноиндустрии), добавлен градиент чёрный → глубокий navy в стиле Nolan/Dune (Dune 2021 posters, Tenet title cards, Blade Runner 2049 night scenes).

```
/* Основные фоны (от тёмного к светлому) */
--bg-abyss:       #050508;      /* глубина — hero и параллакс-слой 0 */
--bg-primary:     #0A0A0F;      /* основной фон (body) */
--bg-deep-navy:   #0D1117;      /* Nolan-navy, градиент */
--bg-slate:       #14161C;      /* карточки, панели */
--bg-elevated:    #1C1E26;      /* модалки, overlays */

/* Акценты (gold остаётся главным) */
--accent-gold:       #D4AF37;   /* главный акцент — цифры, CTA, заголовки */
--accent-gold-soft:  #E8C968;   /* hover-state gold */
--accent-ember:      #C77B3A;   /* film-ember (warm orange, второй акцент) */
--accent-rose:       #E91E63;   /* третичный — bear, alerts, error states */
--accent-sand:       #B8A888;   /* Dune-sand, muted neutral (benchmark, low-emphasis) */

/* Текст (high contrast для AA) */
--text-primary:   #F5F5F7;      /* основной текст (ratio ≥ 14:1 на bg-primary) */
--text-secondary: #A8A8B2;      /* второстепенный (ratio ≥ 5.2:1) */
--text-muted:     #6B6B78;      /* подписи, легенды (ratio ≥ 3:1, для графиков только) */

/* Конструктивные */
--border-subtle:  #2A2C36;      /* тонкие рамки */
--border-hover:   #3E4150;      /* hover-state рамок */
--grid-line:      #1C1E28;      /* grid графиков */

/* Градиенты (Nolan/Dune mood) */
--gradient-hero:       linear-gradient(180deg, #050508 0%, #0A0A0F 40%, #0D1117 100%);
--gradient-nebula:     radial-gradient(ellipse at top, #1A1F2E 0%, #0A0A0F 60%);
--gradient-ember-rim:  linear-gradient(135deg, rgba(199,123,58,0.08) 0%, transparent 70%);
--gradient-gold-rim:   linear-gradient(135deg, rgba(212,175,55,0.12) 0%, transparent 60%);

/* Glow-эффекты */
--glow-gold:          0 0 40px rgba(212, 175, 55, 0.4);
--glow-gold-strong:   0 0 60px rgba(212, 175, 55, 0.6), 0 0 120px rgba(212, 175, 55, 0.2);
--glow-ember:         0 0 30px rgba(199, 123, 58, 0.3);

/* Film-grain (inline SVG noise, см. §1.6) */
--film-grain-opacity: 0.045;    /* 4.5% — тонкий, не мешает тексту */
```

**Контрастные пары для графиков (используют в visualizations §4):**
- Base scenario — `--accent-gold`
- Bull scenario — `#2E7D32` (лесной зелёный, narrative «рост»)
- Bear scenario — `--accent-rose`
- Stress scenario — `#7B1FA2` (purple-violet, «критичный»)
- Neutral / benchmark — `--accent-sand`

### §1.4. Шрифты

- **Display (заголовки):** Manrope 700 / 800 — современный sans, хорошо ложится на dark
- **Body (текст):** Inter 400 / 500 / 600 — универсальный, отлично читается на экранах
- **Mono (числа):** JetBrains Mono 500 — для цифр, табличных данных, code-snippets
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`
- **Подключение:** inline через `@font-face` + base64 WOFF2 (для offline-работы). Вес всех шрифтов в base64 ≈ 420 KB (Manrope 2 веса + Inter 3 веса + JetBrains Mono 1 вес, только RU+EN subset).

### §1.5. Технологический стек (tech stack v1.1)

| Слой | Библиотека | Версия | Назначение | Загрузка |
|------|------------|--------|------------|----------|
| Animations | GSAP | 3.12.x | tweens, scroll-driven, text, morphing | **inline** (критическая) |
| Scroll orchestration | ScrollTrigger | 3.12.x | пиннинг, scrub, batch | **inline** (плагин GSAP) |
| Text effects | TextPlugin | 3.12.x | typewriter, text-reveal | **inline** (плагин GSAP) |
| Motion paths | MotionPathPlugin | 3.12.x | SVG-траектории, particle-flow | **inline** (плагин GSAP) |
| Smooth scroll | Lenis | 1.0.x | инерционный скролл desktop; **`smoothTouch=false` на iOS** | **inline** |
| Charts | D3 | v7 | все графики (Sankey, force, chord, radar, choropleth, waterfall, heatmap, funnel, scatter) | **lazy** (первый viewport) |
| 3D | Three.js | r128 | Pipeline 3D-граф, Org 3D-структура, ambient particles | **lazy** (при скролле к §) |
| Intersection | native IntersectionObserver | — | lazy-load, scroll-tracking | inline |

**Обязательная регистрация GSAP:**
```javascript
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);
```

### §1.5.1. Smooth-scroll details (v1.1 — НОВОЕ)

Lenis обеспечивает инерционный скролл на desktop, но на iOS Safari возможны подёргивания. Решение — **разное поведение по платформе:**

```javascript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // exponential out
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,        // ← ВАЖНО: на touch-устройствах native scroll
  touchMultiplier: 2,
  infinite: false
});

function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// Интеграция с ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// prefers-reduced-motion — отключение Lenis полностью
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis.destroy();
}
```

### §1.6. Background strategy — 3 слоя адаптивно (v1.1 — НОВОЕ)

Пользователь выбрал **совмещение вариантов 1+2** (cinematic grain + 3D particles). Реализация — **трёхслойный адаптивный фон**, где каждый слой включается в зависимости от capability устройства:

**Слой 0 — Gradient drift (всегда работает, все устройства):**
- `fixed` background на `<body>` с `--gradient-hero` (от `#050508` до `#0D1117`).
- GSAP анимирует смещение точки градиента по scroll-progress (0-100% страницы), создавая эффект «путешествия сквозь атмосферу».
- CSS: `background-attachment: fixed; transition: background-position 0.8s ease-out;`

**Слой 1 — Cinematic film-grain (все устройства, low-cost):**
- Inline SVG noise (`<feTurbulence>`) как `background-image` на отдельном overlay-div с `pointer-events:none; mix-blend-mode:screen; opacity: 0.045`.
- Animated через CSS `@keyframes` (16 кадров по 1/24 s → 24 fps «фильмовая стробоскопия»).
- Вес: ~800 байт inline SVG. Работает даже на low-end.

**Слой 2 — 3D ambient particles (opt-in, адаптивно):**
- Three.js r128 сцена с `THREE.Points` (BufferGeometry + PointsMaterial, `size: 1.5 px`, `sizeAttenuation: true`).
- ~400 частиц на desktop, ~150 на tablet, **0 на mobile low-GPU** (fallback — только Слои 0+1).
- Цвета: 70% `--accent-gold` (0.3 opacity), 25% `--accent-ember` (0.2), 5% `--accent-sand` (0.15).
- Движение: slow rotation по Y-axis (0.0002 rad/frame), parallax по mouse-move (desktop) / device-orientation (mobile capable).
- Lazy-init: запускается только когда `<canvas id="bg-particles">` попадает в viewport (obvious — всегда, т.к. fixed).
- **Capability detection:**
  ```javascript
  const gpu = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'none';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
    return /(Apple A1[5-9]|Apple M\d|Mali-G[7-9]|Adreno 6[5-9]\d|RTX|GTX [1-4][0-9]{3})/i.test(renderer) ? 'high' :
           /(Apple A1[0-4]|Mali-G[5-6]|Adreno 5)/i.test(renderer) ? 'mid' : 'low';
  })();

  const particleCount = gpu === 'high' ? 400 : gpu === 'mid' ? 150 : 0;
  if (particleCount > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initParticles(particleCount);
  }
  ```

**Отключение:**
- `prefers-reduced-motion: reduce` → Слой 0 без scroll-drift (статичный), Слой 1 без анимации (статичный), Слой 2 не инициализируется.
- Battery API (если доступно) `battery.level < 0.2 && !battery.charging` → Слой 2 выключить.

**Cost budget:**
- Слой 0: 0 KB (CSS), 0 ms CPU.
- Слой 1: 0.8 KB inline SVG, <1 ms CPU/frame.
- Слой 2: ~4 KB JS (после inline Three.js cost вынесен в tech stack), ~2-3 ms GPU/frame на desktop.

### §1.7. Image strategy — hybrid Gemini + SVG (v1.1 — НОВОЕ)

Пользователь выбрал **гибридный подход**: ключевые ~15-20 изображений генерируются Gemini Nano Banana по ТЗ, декоративные элементы — inline SVG (самодостаточные, в теле промта HTML-генерации).

**Что генерируется Gemini (по ТЗ, см. Приложение В):**

| # | Slot | Секция | Назначение | Rel. size |
|---|------|--------|------------|----------:|
| 1 | `hero_bg.jpg` | §1 Hero | Cinematic backdrop (абстрактный кадр: дым, свет, край декорации) | ~400 KB |
| 2 | `hero_film_reel.jpg` | §1 Hero | 3D фильмовая катушка (holographic) | ~300 KB |
| 3-9 | `projects/01-07_<codename>_poster.jpg` | §22 Pipeline Gallery | 7 постеров проектов в едином cinematic-стиле (dark, moody) | ~250 KB × 7 |
| 10-14 | `team/01-05_<name>.jpg` | §23 Team | 5 портретов ключевой команды (abstract/stylized, не реальные лица — см. §1.7.3) | ~180 KB × 5 |
| 15-18 | `advisory/01-04_<role>.jpg` | §23 Advisory | 4 портрета Advisory Board (stylized) | ~180 KB × 4 |
| 19 | `banners/market_context.jpg` | §3 Market | Абстрактный кинорынок (силуэты залов, свет проекторов) | ~350 KB |
| 20 | `banners/press.jpg` | §25 Press | Газетная текстура с мягким gold-тиснением | ~280 KB |

**Итого:** 20 изображений, суммарный вес в JPG Q75 ≈ **5.5-6.5 MB**, после base64-упаковки ≈ **7.5-8.5 MB**.

**Что рисуется inline SVG:**
- Иконки интерфейса (menu, close, search, play, pause, arrows) — ~25 иконок, ~2 KB
- Декоративные рамки film-strip (кадровые перфорации) — inline SVG patterns, ~1 KB
- Декоративные разделители секций (мягкая gold-линия, film-gate silhouette) — ~6 вариантов, ~3 KB
- Графики / диаграммы — D3-сгенерированы runtime (не хранятся)
- Choropleth РФ GeoJSON — inline в canon_extended, рисуется D3

**Unified style prompt (для Gemini TZ):**

> Cinematic, moody, Dark Cinematic Nolan/Dune aesthetic. Deep navy-to-black gradient backgrounds (#050508 — #0D1117). Warm gold accents (#D4AF37) and film-ember highlights (#C77B3A). Grainy film texture, subtle chromatic aberration at edges. Composition: wide frame (16:9 for banners, 2:3 for posters, 1:1 for portraits), cinematic depth-of-field. Mood: prestige-film, contemplative, high-budget production aesthetic. Avoid: bright saturated colors, flat illustration style, cartoon/anime, corporate stock-photo feel.

### §1.7.1. Почему гибрид, а не только Gemini или только SVG

**Только Gemini:**
- Плюс: фотографичность, эмоциональный impact.
- Минус: каждое изображение ~200-400 KB даже в Q75, 40-60 штук → 10-24 MB (offline тяжелеет).
- Минус: повтор-генерация при коррекции стиля затратна по времени.

**Только SVG:**
- Плюс: ~20-40 KB на всё, отличное масштабирование.
- Минус: нет cinematic mood (абстрактные shape-based иллюстрации ощущаются «technical», не «prestige-film»).

**Гибрид (v1.1):**
- 15-20 Gemini для ключевых «эмоциональных» слотов (hero, posters, portraits, banners).
- SVG для функциональных элементов (иконки, рамки, разделители, dataviz).
- Итог: ~7-9 MB изображений, ~40-60 KB SVG → вес в targete, stylistic coherence сохранена.

### §1.7.2. Naming convention (A+C — строгая + registry)

**A — Строгая конвенция имён (зафиксирована в v1.1):**
```
images/
├── hero_bg.jpg
├── hero_film_reel.jpg
├── projects/
│   ├── 01_<codename>_poster.jpg
│   ├── 02_<codename>_poster.jpg
│   ├── 03_<codename>_poster.jpg
│   ├── 04_<codename>_poster.jpg
│   ├── 05_<codename>_poster.jpg
│   ├── 06_<codename>_poster.jpg
│   └── 07_<codename>_poster.jpg
├── team/
│   ├── 01_ceo.jpg
│   ├── 02_producer_lead.jpg
│   ├── 03_cfo.jpg
│   ├── 04_head_distribution.jpg
│   └── 05_creative_director.jpg
├── advisory/
│   ├── 01_industry_veteran.jpg
│   ├── 02_finance_advisor.jpg
│   ├── 03_distribution_advisor.jpg
│   └── 04_international_advisor.jpg
└── banners/
    ├── market_context.jpg
    └── press.jpg
```

Codename проектов 01-07 уточняется в Gemini_TZ_images_v1.0.md на следующем шаге после утверждения этого промта (пользователь даст названия).

**C — Canon registry (страховка, блок `canon.images` #23 в extended):**
```json
{
  "images": {
    "hero": {
      "bg": { "src": "images/hero_bg.jpg", "alt": "Cinematic backdrop" },
      "film_reel": { "src": "images/hero_film_reel.jpg", "alt": "3D holographic film reel" }
    },
    "projects": [
      { "slot": 1, "codename": "<codename_01>", "src": "images/projects/01_<codename>_poster.jpg", "alt": "Poster of <codename_01>" },
      ...
    ],
    "team": [...],
    "advisory": [...],
    "banners": {...}
  }
}
```

HTML читает ТОЛЬКО из `canon.images.*`, никогда не хардкодит пути. Если в будущем файл переименован — правится только canon, HTML не трогается.

**Inline base64 для offline (Фаза 6):**
- При сборке HTML агент читает каждый файл из `images/`, кодирует в base64, подставляет в `canon.images.*.src` → `"data:image/jpeg;base64,..."`.
- В результате `canon.images` становится ~7-9 MB внутри `<script type="application/json">`.
- Оригинальные файлы остаются в `images/` для переиздания / правок (не удаляются).

### §1.8. Структура каталога v1.1

Финальный deliverable — один `.html` файл, но в процессе работы структура такая:

```
/Холдинг/
├── Промт_HTML_лендинг_Холдинг_v1.1.md       ← этот файл
├── Gemini_TZ_images_v1.0.md                  ← ТЗ для Gemini (создаётся после утверждения v1.1)
├── canon_holding_base.json                   ← 18 блоков (создаётся после Gemini-генерации)
├── canon_holding_extended.json               ← 23 блока (включая canon.images)
├── images/                                    ← 20 файлов от Gemini
│   ├── hero_bg.jpg, hero_film_reel.jpg
│   ├── projects/01-07_<codename>_poster.jpg
│   ├── team/01-05_<role>.jpg
│   ├── advisory/01-04_<role>.jpg
│   └── banners/market_context.jpg, press.jpg
└── ТрендСтудио_Холдинг_Лендинг_v1.0.html      ← финал (после Фазы 6 inline-pack)
```

---

## §2. Источники данных: роль и разделение (Data Sourcing)

### §2.1. Принцип разделения ролей

Каждый источник играет одну роль — нельзя смешивать:

| Источник | Роль | Что брать | Что НЕ брать |
|----------|------|-----------|--------------|
| **LP Memo v1.1.0 + 5 Appendices** | Текстовый канон | повествование, thesis, FAQ, цитаты, bios | цифры (приоритет Investor Model v3.0) |
| **Deck v1.1.2 Interactive HTML** | Структурный канон | 25 слайдов → маппинг в секции, порядок блоков, визуальные референсы | вёрстку 1-в-1 (лендинг не slide-deck) |
| **Investor Model v3.0** | Числовой канон | IRR, MOIC, TVPI, NPV, MC, cash-flow, pipeline-таблицы, сценарии | текстовые описания (приоритет LP Memo) |
| **Finmodel v1.4.4** | Якорный канон | 3 000 млн ₽ tap, 7-летний горизонт, 348 тестов, MC-параметры | всё остальное |

### §2.2. Двухфайловая canon-архитектура (v1.1 — 41 блок)

| Файл | Блоков | Назначение | Примеры ключей |
|------|--------|------------|-----------------|
| `canon_holding_base.json` | **18** | Текст + структура + базовые цифры | `narrative` (25×3 audience), `pipeline` (7 проектов × 4 стадии), `benchmark` (5 аналогов), `thesis` (10×3), `team` (5 keys), `advisory_board` (4 members), `risks` (12 + mitigations), `roadmap` (7 лет × milestones), `scenarios` (4), `kpi` (5 ролей), `regions` (9 регионов РФ), `faq` (15×3), `press_quotes` (8), `distribution` (5 каналов), `deal_structure` (LP/GP/waterfall), `tax_credits`, `term_sheet`, `jurisdiction_notes` |
| `canon_holding_extended.json` | **23** (+1 относительно v1.0) | Визуализации + интерактив + формулы + MC + **изображения** | `time_series` (7 лет × 15 метрик × 27 точек), `weekly_box_office` (16 недель × 7 проектов × сценарий), `segmentations` (5), `networks` (Sankey, Force, Chord), `radar_benchmark` (8 × 5), `bubble_deals`, `pipeline_3d_structure`, `monte_carlo` (1000 прогонов × 5 драйверов), `heatmaps` (3), `waterfall` (3), `funnel`, `choropleth_rf`, `ip_portfolio`, `box_office_runs`, `distribution_mix`, `tax_credit_flows`, `release_windows`, `animation_catalog` (35 паттернов), `interaction_rules` (38 × 100%), `simulators` (13), `ott_vs_theatrical`, `genre_tax_mix`, **`images` (новый в v1.1 — реестр 20 слотов)** |

### §2.3. Правило встраивания в HTML

**Агент обязан:**

1. Прочитать оба файла canon в Фазе 0 (проверить парсинг каждого).
2. Встроить оба в HTML отдельными тегами:
   ```html
   <script id="canon-base" type="application/json">
     {{полное содержимое canon_holding_base.json}}
   </script>
   <script id="canon-extended" type="application/json">
     {{полное содержимое canon_holding_extended.json, включая images с base64}}
   </script>
   ```
3. В JS объединить в единый namespace:
   ```javascript
   const canonBase = JSON.parse(document.getElementById('canon-base').textContent);
   const canonExt = JSON.parse(document.getElementById('canon-extended').textContent);
   const canon = { ...canonBase, ...canonExt, _meta: { ...canonBase._meta, ...canonExt._meta } };
   ```
4. **Не копировать** содержимое ни одного файла в разметку — только через `bindCanon()` или прямое чтение `canon.*`.
5. **Все изображения** — только через `canon.images.*.src` (никаких хардкод-путей в `<img src="...">`).

### §2.4. Проверка коллизий и sanity-check

```javascript
// Коллизии верхнего уровня (кроме _meta)
const baseKeys = new Set(Object.keys(canonBase).filter(k => k !== '_meta'));
const extKeys = new Set(Object.keys(canonExt).filter(k => k !== '_meta'));
const collisions = [...baseKeys].filter(k => extKeys.has(k));
console.assert(collisions.length === 0, 'Canon key collisions: ' + collisions.join(','));

// Якоря Holding (§1.2)
console.assert(canon.fund.lp_size_mln_rub === 3000, 'Anchor: fund 3000 mln ₽');
console.assert(canon.pipeline.projects.length === 7, 'Anchor: 7 проектов');
console.assert(canon.pipeline.stages.length === 4, 'Anchor: 4 стадии');
console.assert(canon.returns.irr_internal_w5vd === 24.75, 'Anchor: IRR Internal 24.75%');
console.assert(canon.returns.irr_public_w3 === 20.09, 'Anchor: IRR Public 20.09%');
console.assert(canon.monte_carlo.total_runs === 1000, 'Anchor: MC 1000 runs');
console.assert(canon.monte_carlo.p50_irr_internal >= 13.5 && canon.monte_carlo.p50_irr_internal <= 14.5, 'Anchor: MC p50 IRR Internal ~13.95');
console.assert(canon.finmodel.tests_passed === 348, 'Anchor: 348 тестов PASS');
console.assert(canon.horizon.years === 7, 'Anchor: 7-летний горизонт');

// Покрытие
console.assert(canon.interaction_rules.rule_coverage_pct === 100, 'Coverage must be 100%');
console.assert(canon.interaction_rules.element_requirements.length >= 38, 'Min 38 element types');
console.assert(canon.animation_catalog.scroll_animations.length === 12, '12 scroll animations');
console.assert(canon.animation_catalog.chart_animations.length === 12, '12 chart animations');
console.assert(canon.animation_catalog.interaction_patterns.length === 11, '11 interaction patterns');

// Pipeline integrity (4 стадии × 7 проектов = 28)
const dp = canon.pipeline.stage_project_matrix.flat().length;
console.assert(dp === 28, `Pipeline matrix: ${dp}/28 datapoints`);

// Images registry (v1.1)
console.assert(canon.images.hero.bg && canon.images.hero.bg.src, 'Image: hero_bg');
console.assert(canon.images.hero.film_reel && canon.images.hero.film_reel.src, 'Image: hero_film_reel');
console.assert(canon.images.projects.length === 7, 'Images: 7 project posters');
console.assert(canon.images.team.length === 5, 'Images: 5 team portraits');
console.assert(canon.images.advisory.length === 4, 'Images: 4 advisory portraits');
console.assert(canon.images.banners && Object.keys(canon.images.banners).length >= 2, 'Images: 2+ banners');
```

Если любой assert падает — в hero показать `«Ошибка canon: sanity-check failed ({детали})»`, инициализацию остановить.

---

## §3. 25 секций лендинга (структура + audience-switcher)

### §3.1. Базовые 21 секция

| # | Секция | Основная цель | Источник текста | Главная визуализация |
|---|--------|---------------|-----------------|----------------------|
| 1 | **Hero** | Якорь 3 000 млн ₽ + KPI | `narrative.hero` | Counter-up + 3D holographic film-reel (Gemini hero_film_reel.jpg + Three.js rim-light) |
| 2 | **Thesis** | 3-5 главных тезисов | `narrative.thesis` | Stagger fade-in cards + hover-reveal |
| 3 | **Market Context** | Почему сейчас | `narrative.market` | Choropleth РФ (15 регионов) + banner `market_context.jpg` |
| 4 | **Benchmark** | Сравнение с аналогами | `benchmark` | Radar 8 осей × 5 студий |
| 5 | **Our Model** | Business model | `narrative.model` | Force-graph (studios / distribution / IP / fund) |
| 6 | **Org Structure** | Команда + Advisory | `team` + `advisory_board` | 3D org-tree (Three.js) |
| 7 | **Financial Core** | IRR / MOIC / TVPI | `returns` | Time-series 27 точек × 4 сценария + scrub |
| 8 | **Capital Structure** | LP / GP / waterfall | `deal_structure` | Sankey cash-flow |
| 9 | **Monte Carlo** | Risk-adjusted returns | `monte_carlo` | Histogram p10/p25/p50/p75/p90 + parallel-coords |
| 10 | **Cash Flow Timeline** | Capital calls / distributions | `time_series.cashflow` | Waterfall + кумулятивная кривая |
| 11 | **Scenarios** | Base / Bull / Bear / Stress | `scenarios` | Scenario-switcher (морфинг графиков) |
| 12 | **KPI Cascade** | KPI команды → фонда | `kpi` | Chord diagram + CRM funnel |
| 13 | **Geography** | Региональные налог. льготы | `regions` + `tax_credits` | Choropleth + bubble overlay |
| 14 | **Roadmap** | 7-летний план | `roadmap` | Horizontal timeline + milestones reveal |
| 15 | **Unit Economics** | Cost / revenue per project | `pipeline.unit_econ` | Stacked bars + bubble |
| 16 | **Distribution** | Каналы | `distribution` | Donut + stacked |
| 17 | **Risks** | 12 рисков + mitigations | `risks` | Heatmap 5×5 |
| 18 | **Synergy** | Инфраструктурный эффект | `narrative.synergy` | Sankey value-chain + parallel-coords |
| 19 | **ESG + Impact** | Индустрия, рабочие места | `narrative.esg` | Bubble + choropleth |
| 20 | **FAQ** | 15 вопросов × 3 audience | `faq` | Accordion + search |
| 21 | **CTA / Contact** | Contact + NDA + next steps | `narrative.cta` | Form + calendar embed |

### §3.2. 4 Holding-специфичных секции

| # | Секция | Назначение | Источник | Главная визуализация |
|---|--------|-----------|----------|----------------------|
| 22 | **Pipeline Gallery** | 7 проектов с карточками | `pipeline.projects` + `ip_portfolio` + `canon.images.projects` | 7 film-poster cards (Gemini) + modal drilldown + box-office run |
| 23 | **Team + Advisory Board** | Расширенные bio | `team` + `advisory_board` + `canon.images.team` + `canon.images.advisory` | Grid cards (Gemini portraits) + Three.js 3D org-tree |
| 24 | **LP Onboarding + Term Sheet** | Процесс + MFN + sizing | `deal_structure` + `term_sheet` + sim | Interactive stepper + Term Sheet Simulator |
| 25 | **Press Carousel** | Упоминания + цитаты | `press_quotes` + `canon.images.banners.press` | GSAP carousel + banner background |

### §3.3. Audience-switcher (3 аудитории)

| Режим | Аудитория | Что меняется | Источник |
|-------|-----------|--------------|----------|
| **LP** (default) | LP-инвесторы | Financial-first: IRR, MOIC, TVPI, MC, waterfall, Term Sheet | `narrative.*.lp` |
| **Partners** | Стратегические партнёры (Yandex, VK, Kion, Okko, театральные сети) | Synergy-first: distribution, IP, co-production, co-investment | `narrative.*.partners` |
| **Government** | Госорганы (Фонд кино, Минкульт, ИРИ, РФПИ) | Impact-first: рабочие места, регионы, налоги, ESG | `narrative.*.government` |

Переключение не перезагружает страницу — только текст через `bindCanon()` и цветовой акцент (LP=gold, Partners=ember, Gov=sand).

---

## §4. Каталог 22 типов визуализаций

| # | Тип | Ключ canon | Секция | Библиотека |
|---|-----|------------|--------|------------|
| 1 | **Sankey** (cash-flow LP→GP) | `networks.sankey_cash_flow` | §8 Capital | D3 v7 + d3-sankey |
| 2 | **Force-graph** (holding structure) | `networks.force_graph_partners` | §5 Model | D3 v7 force |
| 3 | **Chord** (genre × distribution) | `networks.chord_genre_distro` | §12 KPI Cascade | D3 v7 chord |
| 4 | **Radar 8 осей** (benchmark) | `radar_benchmark` | §4 Benchmark | D3 v7 polar |
| 5 | **Bubble + scatter** (budget × IRR × stage) | `bubble_deals` | §15 Unit Econ | D3 v7 |
| 6 | **3D Pipeline Graph** (7×4) | `pipeline_3d_structure` | §22 Pipeline | Three.js r128 |
| 7 | **3D Org Tree** (опционально) | `org_3d_structure` | §6 Org / §23 Team | Three.js r128 |
| 8 | **Monte Carlo histogram** | `monte_carlo.histograms.irr` | §9 MC | D3 v7 histogram |
| 9 | **Parallel coordinates** (MC drivers) | `monte_carlo.parallel_coords_samples` | §9 MC | D3 v7 |
| 10 | **Choropleth РФ** (box-office by region) | `choropleth_rf` | §3 Market / §13 Geo | D3 v7 + GeoJSON |
| 11 | **Waterfall × 3** (costs_y1, costs_y7, LP-waterfall) | `waterfall.*` | §10 / §8 | D3 v7 |
| 12 | **CRM funnel** (dealflow) | `funnel.dealflow` | §12 KPI | D3 v7 |
| 13 | **Heatmap NPV 9×9** | `heatmaps.npv_sensitivity` | §7 Financial | D3 v7 grid |
| 14 | **Heatmap box-office × release-window 5×8** | `heatmaps.box_office_release` | §22 Pipeline | D3 v7 grid |
| 15 | **Heatmap рисков 5×5** | из `risks` | §17 Risks | D3 v7 grid |
| 16 | **Time-series 27 точек × 4 сценария** | `time_series.scenarios.*` | §7 Financial | D3 v7 + ScrollTrigger scrub |
| 17 | **Weekly box-office run** (16 недель × 7 проектов) | `weekly_box_office` | §22 Pipeline | D3 v7 + GSAP |
| 18 | **Donut / stacked** (segmentations) | `segmentations` | §3, §15, §16 | D3 v7 arc/stack |
| 19 | **Horizontal timeline** (roadmap) | `roadmap` | §14 Roadmap | SVG + GSAP MotionPath |
| 20 | **Genre Mix Radar + Tax-Credit Flow** | `genre_tax_mix` + `tax_credit_flows` | §13 Geography | D3 v7 polar + Sankey |
| 21 | **Release-window Gantt** | `release_windows` | §22 Pipeline | D3 v7 timeline |
| 22 | **Film-poster cards + modal drilldown** | `pipeline.projects` + `canon.images.projects` | §22 Pipeline | HTML/CSS + GSAP Flip + Gemini imagery |

Минимум **20 типов** обязательны. 2 опциональных (3D Org Tree, Release-window Gantt).

---

## §5. 13 симуляторов (интерактивные калькуляторы)

В `canon.simulators` — 13 формул. Агент реализует **все 13**.

| # | Симулятор | Входы | Формула (ядро) | Визуализация |
|---|-----------|-------|----------------|---------------|
| 1 | **IRR / MOIC Calculator** | horizon (5-10 yr), discount rate (8-18%), commitment size (50-500 млн ₽) | NPV/IRR loop по cash-flow | Time-series + kumulative curve + KPI |
| 2 | **Scenario Switcher** | 1 из 4 (base/bull/bear/stress) | lookup `canon.scenarios` | Морфинг графиков §7 |
| 3 | **Monte Carlo Simulator** | N_runs (100/500/1000), 5 драйверов | Распределения `canon.monte_carlo.driver_distributions` | Histogram + parallel-coords live |
| 4 | **Break-even Slider** | cost inflation (0-20%), pipeline delay (0-18 мес) | `be = base + cost*k1 + delay*k2` | Break-even marker |
| 5 | **LP Commitment Sizer** | Tier (Micro 50 / Small 100 / Medium 250 / Large 500 / Mega 1000 млн ₽) | fee_tier × size × years | Table: fees, distributions, net IRR |
| 6 | **Box-Office Sensitivity** | Opening weekend ±50%, drop-rate ±30%, screens (500-4000) | weekly run | Weekly chart + total revenue |
| 7 | **Pipeline Builder** | drag-and-drop 7 проектов в 4 стадии | cash-flow impact | Live §22 + §10 |
| 8 | **Stress Test Matrix** | 3 стресса × 3 уровня = 9 сценариев | MC subset | Heatmap 3×3 |
| 9 | **Distribution Mix** | theatrical/OTT/TV/licensing/merch (sum=100%) | revenue = Σ(share × price × reach) | Stacked bar + donut |
| 10 | **Term Sheet Simulator** | pref=8%, carry=20%, catch-up=100% | LP/GP split | Waterfall chart |
| 11 | **IP Value Estimator** | Project × 5 streams + multiples | Σ(stream × multiple) | Stacked bars + total |
| 12 | **Release Window Optimizer** | Window (4 options) × screens × competition | window_boost × opening × penalty | Heatmap 5 × 4 |
| 13 | **Theatrical vs OTT + Genre/Tax Optimizer** | theatrical/OTT/hybrid + genre + tax-region | revenue_diff + tax_credit | Break-even matrix + ROI delta |

**Каждый симулятор обязан:**
1. `<fieldset>` входов + `<div>` результата.
2. Live-update (debounced 100 ms).
3. URL hash state (без localStorage).
4. Mobile-friendly (touch-targets ≥ 44 px).

---

## §6. Правило 100% интерактивности и анимации

### §6.1. Базовое требование (v1.1 — подтверждено пользователем)

**Каждый визуальный элемент на каждой секции обязан иметь:**
1. **Анимацию появления** при попадании в viewport (scroll-driven, минимум 1 паттерн из `canon.animation_catalog.scroll_animations`).
2. **Интерактивный отклик** на действие пользователя (hover / click / drag / scroll / focus — минимум 1 паттерн из `canon.animation_catalog.interaction_patterns`).
3. **Анимация on interaction** — сам отклик не мгновенный («skip»), а tween (GSAP tween 150-600 ms с ease-out).

Источник: `canon.interaction_rules.rule_coverage_pct === 100`.

### §6.2. 38 типов элементов (element_requirements)

| Элемент | Обязательная анимация | Обязательный интерактив |
|---------|-----------------------|--------------------------|
| KPI-число | counterUp (0 → target за 1.5с) | hover → tooltip с методикой |
| Film-poster card (Pipeline) | staggerFadeIn + GSAP Flip | click → modal drilldown |
| Time-series график | drawPath за 2с | scroll-scrub + hover crosshair |
| 3D pipeline graph | orbitSpin при входе | drag → ручное вращение + click узла → pin |
| Sankey cash-flow | flowParticles | hover на поток → подсветка цепочки |
| Monte Carlo histogram | barGrow | slider N_runs → live re-draw |
| Weekly box-office run | barsCascade | hover week → tooltip + пересчёт total |
| Radar benchmark | polarSpin | click ось → drilldown |
| Term Sheet steps | stepperReveal | click шаг → expand с формулой |
| Press carousel | autoScroll | hover → pause + click → modal quote |
| Gemini image banner | parallaxY (+ ambient film-grain overlay) | hover → subtle zoom 1.02× + ember-glow |
| Portrait card (Gemini team) | fadeInUp + imageShimmer | hover → bio expand + gold-rim |

Полный каталог — 38 типов в `canon.interaction_rules.element_requirements`.

### §6.3. Self-check покрытия (Фаза 7)

- `N_elements` = `document.querySelectorAll('.viz-element').length`
- `N_with_animation` = `document.querySelectorAll('[data-animated="true"]').length`
- `N_with_interaction` = `document.querySelectorAll('[data-interactive="true"]').length`
- `N_interaction_with_tween` = `document.querySelectorAll('[data-interactive="true"][data-interaction-tween="true"]').length`

Критерий: `N_with_animation === N_elements` И `N_with_interaction === N_elements` И `N_interaction_with_tween === N_with_interaction`.

### §6.4. Исключения — только `prefers-reduced-motion`

При `prefers-reduced-motion: reduce` анимации приглушаются (длительности → 150 ms, эффекты → fade-only), интерактив сохраняется 100%. 3D-слой фона (§1.6) отключается полностью.

---

## §7. Критерии приёмки (72) и запреты (22)

### §7.1. Критерии приёмки (60 базовых + 12 Holding-специфичных = 72)

Базовые 60 наследуются из ЦПИКП v5.2. Ниже 12 Holding-специфичных (в v1.1 +2 относительно v1.0):

**61. Anchor integrity.** 10 якорей §1.2 проходят automated assert на старте (§2.4).

**62. 13 simulators implemented.** Все 13 симуляторов из §5 работают, принимают ввод, обновляют результат live, сохраняют state в URL.

**63. 25 sections rendered.** 21 базовая + 4 Holding-специфичных. Каждая — со своим `<section id="sec-N">` и пунктом в side-dots navigation.

**64. Audience-switcher (3 модa).** Переключение LP / Partners / Gov меняет минимум 80% текста и акцентный цвет header.

**65. Mobile parity.** Все секции и симуляторы работают на iOS Safari ≥ 15 и Android Chrome ≥ 110. Touch-targets ≥ 44×44 px.

**66. Offline-ready.** Лендинг открывается без интернета из local file. **Все** ассеты inline (WOFF2 base64 + inline SVG + inline GeoJSON + base64 изображения в `canon.images.*.src`).

**67. SEO + OG-tags.** `<title>`, `<meta name="description">`, Open Graph, Twitter Card. JSON-LD Organization + InvestmentFund.

**68. Print-friendly.** `@media print` — корректно печатается на A4 (25 страниц), тёмные фоны → белые, графики → outline-SVG. Изображения из `canon.images.*` — либо печатаются в grayscale, либо скрываются (выбор через `.print-hide` класс).

**69. Dark cinematic Nolan/Dune style.** Палитра §1.3 соблюдается. Электрический синий исключён. Film-grain noise применён (Слой 1). Gold accents на KPI и CTA.

**70. Performance on 4G mobile.** LCP ≤ 3000 ms, TTI ≤ 4500 ms, total blocking time ≤ 400 ms. Lazy-load: D3 (первый viewport §3), Three.js (при скролле к §6/§22), Monte Carlo (при клике на §9).

**71. 100% interactivity coverage (v1.1).** Каждый `.viz-element` имеет `data-interactive="true"`. Self-check §6.3 проходит.

**72. 100% interaction-tween coverage (v1.1).** Каждый интерактивный отклик — через GSAP tween 150-600 ms, никаких instant-swap состояний. Self-check §6.3 расширенный.

### §7.2. 22 запрета

1. Нет `eval()`, `new Function()`, `setTimeout(string)`.
2. Нет `localStorage` / `sessionStorage`.
3. Нет внешних скриптов / CDN (всё inline для offline).
4. Нет хардкода цифр вне `canon.*`.
5. Нет хардкода текста вне `canon.narrative.*`.
6. Нет хардкода интерактивов / анимаций вне `canon.animation_catalog` и `canon.interaction_rules`.
7. Нет inline-стилей (только через `<style>` или классы; исключение — dynamic computed).
8. Нет дубликатов ключей в canon.
9. Нет смешивания источников данных (§2.1).
10. Нет `document.write`.
11. **Нет хардкод-путей к изображениям в `<img src="...">` или `background-image: url('images/...')`** — только через `canon.images.*` (v1.1).
12. Нет electric blue (`#4FC3F7`, `#00BFFF`, неоновые циан) в палитре (v1.1).
13. Нет синхронного fetch / XHR.
14. Нет deprecated API (`document.execCommand`, etc.).
15. Нет console.log в production HTML (только `<!-- VERIFICATION REPORT -->` комментарием).
16. Нет размытой ответственности canon (один ключ — один файл, см. §2.3).
17. Нет visibility: hidden вместо display: none для печати (конфликт с a11y).
18. Нет авто-воспроизведения звука.
19. Нет модальных окон без `<dialog>` / `role="dialog"` + `aria-modal="true"`.
20. Нет навигации без keyboard support (Tab/Enter/Esc/Arrows).
21. Нет графиков без aria-label / aria-describedby.
22. Нет анимаций с `opacity: 0 → 1` длительностью > 600 ms без `prefers-reduced-motion` fallback.

---

## §8. Верификация П5 «Максимум» 32/32 + М4 Презентационная 7/7

### §8.1. М4 Презентационная (7 механизмов)

| # | Механизм | Применение к Holding |
|---|----------|----------------------|
| М4.1 | Точный перенос цифр | 10 якорей §1.2 + Investor Model v3.0 сохранены ±0% (MC — допустимо ±2%) |
| М4.2 | Критерии приёмки | 72/72 (60 базовых + 12 Holding) |
| М4.3 | Секция = слот | 25 секций = 25 slot в narrative = соответствие Deck v1.1.2 1-в-1 |
| М4.4 | Audience-switcher + Lite-mode | 3 audience-режима, якоря §1.2 неизменны |
| М4.5 | Responsive breakpoints | Desktop ≥ 1440 / Tablet 768-1439 / Mobile 320-767 — iOS Safari + Android Chrome |
| М4.6 | Cross-file integrity v1.1 | canon_holding_base.json + canon_holding_extended.json + canon.images.* загружены, sanity-check §2.4 пройден |
| М4.7 | Cross-file integrity Holding | 10 якорей совпадают между 4 источниками + 20 images в `canon.images.*` существуют как файлы до inline-pack / base64 после |

### §8.2. П5 «Максимум» (32 механизма)

Пользователь подтвердил — выполнить **все 32**. Группы:

1. **Фактологические (№1-4):** точный перенос цифр / дат / имён, выполнение запроса, сверка сумм, границы.
2. **Формат (№5, 8, 9):** формат документа (HTML W3C валиден), формат секций, согласованность HTML ↔ canon.
3. **Хронология и противоречия (№6-7):** roadmap-хронология consistent, нет противоречий.
4. **Логические (№10-17, 30):** скрытые допущения, парадоксы, обратная логика, декомпозиция, уверенность, полнота, за/против, граф причин-следствий, стресс-тест.
5. **Источники (№18-19, 28):** триангуляция (4 источника), цепочка происхождения, эпистемический статус.
6. **Числовые (№20, 23):** двойной расчёт ключевых метрик (IRR DCF vs MC), метаморфическое тестирование.
7. **Документ (№21, 22, 24, 25, 26, 29, 32):** сверка вход-выход, согласованность файлов, diff было/стало, защита от регрессии, дрейф смысла, кросс-модальная проверка, ссылочная целостность (в т.ч. **все 20 image slots в canon.images.* существуют и корректно base64-encoded**).
8. **Аудитория (№27, 31):** моделирование аудитории (LP / Partners / Gov), проверка адресата.

Отчёт — в конце HTML как `<!-- VERIFICATION REPORT -->`.

### §8.3. VERIFICATION REPORT шаблон

```html
<!-- ================================================================
VERIFICATION REPORT — Промт v1.1 Лендинг ТрендСтудио Холдинг
Pass: П5 Максимум (32/32) + М4 Презентационная (7/7)
Date: {{DATE}}
Canon sources:
  - canon_holding_base.json v{{base._meta.version}} — 18 блоков
  - canon_holding_extended.json v{{ext._meta.version}} — 23 блока (+images)
Total canon blocks: 41/41 loaded
Images: 20/20 base64-embedded, total {{MB}} MB

М4.1 ✓ Anchor integrity: 10/10 якорей
М4.2 ✓ Критерии приёмки: 72/72 выполнены
М4.3 ✓ 25 секций = 25 slot = 25 слайдов Deck v1.1.2
М4.4 ✓ Audience-switcher + якоря неизменны
М4.5 ✓ Responsive: desktop/tablet/mobile iOS+Android
М4.6 ✓ canon sanity-check: OK (включая images registry)
М4.7 ✓ Cross-file integrity (base ↔ extended ↔ 4 source canons + images): 16/16 OK

Coverage:
  - N_elements = {{}}
  - N_with_animation = {{}}/{{}} = 100%
  - N_with_interaction = {{}}/{{}} = 100%
  - N_interaction_with_tween = {{}}/{{}} = 100%
  - N_viz_types = {{}}/22
  - N_simulators = 13/13
  - N_images = 20/20

Performance:
  - LCP desktop: {{}} ms (лимит 2500)
  - LCP 4G mobile: {{}} ms (лимит 3000)
  - TTI: {{}} ms (лимит 4500)
  - FPS 60: {{ok/fail}}
  - Total assets: {{}} MB (target ≤ 30 MB)

Accessibility AA:
  - Контраст ≥ 4.5:1 / 3:1: {{ok/fail}}
  - Keyboard nav: {{ok/fail}}
  - aria-label: {{ok/fail}}
  - prefers-reduced-motion: {{ok/fail}}

Mobile parity:
  - iOS Safari 15+: {{ok/fail}}
  - Android Chrome 110+: {{ok/fail}}
  - Touch targets ≥ 44 px: {{ok/fail}}
  - Landscape+portrait: {{ok/fail}}

Background (§1.6):
  - Layer 0 (gradient drift): active
  - Layer 1 (film-grain): active
  - Layer 2 (3D particles): {{desktop: active / mobile low-GPU: disabled}}

Images (§1.7):
  - Gemini slots: 20/20 present in canon.images.*
  - SVG decorations: {{count}} inline
  - Total image weight (base64): {{MB}} MB

П5.1-32: [подробный чек-лист]

Найденные проблемы: ...
Уровень уверенности: {{%}}
================================================================ -->
```

---

## §9. Порядок выполнения (Фазы 0-7)

### Фаза 0 — Чтение и sanity (10 шагов, +1 относительно v1.0)

1. Прочитать `canon_holding_base.json` полностью (18 блоков, `_meta.version === "v1.0"`).
2. Прочитать `canon_holding_extended.json` полностью (23 блока, `_meta.extends === "base v1.0"`).
3. Проверить коллизии ключей. При коллизии — остановка.
4. Проверить 10 якорей §1.2 (assert). При провале — остановка.
5. Проверить cross-file integrity базовый (§2.4), включая **20 image slots в canon.images.***. При провале — остановка.
6. Прочитать `Промт_HTML_лендинг_Холдинг_v1.1.md` (этот файл).
7. Выписать 35 паттернов из `canon.animation_catalog` (12+12+11).
8. Прочитать все 20 файлов `images/**` и подготовить base64-строки (Фаза 6 финализирует подстановку в canon).
9. Спроектировать архитектуру:
   - `<head>`: inline CSS + inline @font-face (WOFF2 base64) + 2 `<script type="application/json">` (canon-base, canon-extended **с base64 в canon.images**) + SEO/OG-теги + JSON-LD.
   - `<body>`: `<header>` (audience-switcher + side-dots nav) + **25** `<section>` + `<footer>` + `<div id="modals-root">` + `<div id="simulators-root">` + **3 фон-слоя** (§1.6).
   - Критические библиотеки (GSAP + 3 plugins + Lenis) — inline.
   - D3 v7 + Three.js r128 — **lazy** (IntersectionObserver → inline Blob URL).
   - `<style>` для Dark cinematic Nolan/Dune (§1.3 палитра + film-grain + gradient-hero).
10. **Self-check Ф0:** ☑ оба canon + коллизий нет + 10 якорей OK + 4-source cross-check OK + **20 images OK** + архитектура + lazy-loading + 3-layer background плана.

### Фаза 1 — Скелет HTML + header + sections + 3 фон-слоя

1. Построить 25 `<section>` с уникальными `id`.
2. Side-dots nav справа (desktop) / hamburger (mobile).
3. Sticky header с audience-switcher (3 кнопки / `<select>` на mobile).
4. Cmd+K / Ctrl+K — поиск.
5. **Фон-слои (§1.6):**
   - `<div id="bg-layer-0" class="bg-gradient">` — gradient-hero с GSAP scroll-drift
   - `<div id="bg-layer-1" class="bg-grain">` — inline SVG noise, CSS-animated 24 fps
   - `<canvas id="bg-particles">` — Three.js particles (GPU-capability gated)

### Фаза 2 — Заполнение контентом + 100% coverage

1. `bindCanon()` — для каждой секции из `canon.narrative.section_N_*`.
2. Для каждого визуального элемента:
   - Найти в `canon.interaction_rules.element_requirements` (38 типов).
   - Применить анимацию из `canon.animation_catalog.scroll_animations` (12) или `chart_animations` (12).
   - Применить интерактив из `canon.animation_catalog.interaction_patterns` (11) — с GSAP tween 150-600 ms.
3. Добавить `data-animated="true"`, `data-interactive="true"`, `data-interaction-tween="true"` на каждый элемент.
4. **Изображения:** `<img>` / `background-image` ТОЛЬКО через `canon.images.*.src`. Atributes `alt`, `loading="lazy"` (кроме hero), `decoding="async"`.

### Фаза 3 — Реализация 22 визуализаций

| Порядок | Визуализация | Данные | Библиотека |
|---------|--------------|--------|------------|
| 1 | Time-series 4 сценария × 15 метрик × 27 точек | `time_series.scenarios` | D3 v7 + GSAP scrub |
| 2 | Donut / stacked по 5 сегментациям | `segmentations` | D3 v7 |
| 3 | Sankey cash-flow LP→GP | `networks.sankey_cash_flow` | D3 v7 + d3-sankey |
| 4 | Force-graph holding structure | `networks.force_graph_partners` | D3 v7 force |
| 5 | Chord genre×distribution | `networks.chord_genre_distro` | D3 v7 chord |
| 6 | Radar benchmark 8 осей × 5 аналогов | `radar_benchmark` | D3 v7 polar |
| 7 | Bubble deals (7 проектов) | `bubble_deals` | D3 v7 |
| 8 | 3D Pipeline graph (7×4) | `pipeline_3d_structure` | Three.js r128 |
| 9 | Monte Carlo histogram + parallel-coords | `monte_carlo` | D3 v7 |
| 10 | Choropleth РФ 15 регионов | `choropleth_rf` | D3 v7 + inline GeoJSON |
| 11 | Waterfall × 3 | `waterfall.*` | D3 v7 |
| 12 | CRM funnel dealflow | `funnel.dealflow` | D3 v7 |
| 13-15 | Heatmaps (NPV 9×9, box-office×window, risks 5×5) | `heatmaps.*` + `risks` | D3 v7 grid |
| 16 | Weekly box-office run (16×7) | `weekly_box_office` | D3 v7 + GSAP |
| 17 | Horizontal timeline roadmap | `roadmap` | SVG + GSAP MotionPath |
| 18 | Genre-mix radar + Tax-credit Sankey | `genre_tax_mix` + `tax_credit_flows` | D3 v7 |
| 19 | Release-window Gantt | `release_windows` | D3 v7 timeline |
| 20 | Film-poster cards + modal (**Gemini imagery**) | `pipeline.projects` + `canon.images.projects` | HTML/CSS + GSAP Flip |
| 21 | 3D Org Tree (опционально) | `org_3d_structure` | Three.js r128 |
| 22 | Press carousel (**banner Gemini**) | `press_quotes` + `canon.images.banners.press` | GSAP |

### Фаза 4 — 13 симуляторов

Реализация по §5. Каждый — с live-update, URL-state, mobile-touch.

### Фаза 5 — Audience-switcher + Modals + Lite-mode

1. Переключение LP/Partners/Gov через `bindCanon(audience)` + акцент (gold/ember/sand).
2. Модалки для drilldown (project cards с `canon.images.projects`, risk details, FAQ, press quotes).
3. Lite-mode (прячет 3D частицы фона и parallel-coords для слабых устройств) — кнопка в footer.

### Фаза 6 — Mobile parity + Offline + SEO + Print + Image inline-pack

1. **Mobile**: breakpoints 320/768/1024/1440, touch-targets 44px, single-column mobile, simplified 3D (2D fallback), swipe navigation.
2. **Offline single-file pack**:
   - Inline всё: WOFF2 base64, SVG, GeoJSON, GSAP/D3/Three.js как inline scripts.
   - **Image inline-pack:** прочитать каждый файл из `images/`, `base64` encode, заменить в `canon.images.*.src` путь `"images/..."` на `"data:image/jpeg;base64,..."`. Файлы в `images/` остаются для повторной пересборки.
   - Финальный размер — target ≤ 30 MB.
3. **SEO**: `<title>`, meta description, Open Graph, Twitter Card, JSON-LD schema (Organization + InvestmentFund).
4. **Print**: `@media print` — 25 страниц A4, dark → light, графики → outline SVG, Gemini изображения — grayscale или `.print-hide`.

### Фаза 7 — Self-check + Verification Report

1. Посчитать покрытие (§6.3). Если < 100% — вернуться в Ф2-3.
2. Прогнать М4.1-М4.7 (§8.1).
3. Прогнать П5.1-32 (§8.2).
4. Проверить performance (LCP/TTI на 4G mobile через DevTools Throttling).
5. Проверить a11y (aria, keyboard, contrast через axe DevTools).
6. Записать `<!-- VERIFICATION REPORT -->` (§8.3).

---

## §10. Mobile-паритет (обязательное требование)

### §10.1. Breakpoints

| Breakpoint | Ширина | Стратегия |
|------------|--------|-----------|
| Mobile S | 320-479 px | Single column, simplified 3D → 2D fallback, swipe navigation, 3D particles OFF |
| Mobile L | 480-767 px | Single column, touch-friendly sliders, bottom bar вместо side-dots, 3D particles OFF or 50 |
| Tablet | 768-1023 px | 2-col для некоторых секций, 3D работает на A-graded iPad, 150 particles |
| Desktop S | 1024-1439 px | Full desktop layout, 400 particles |
| Desktop L | 1440+ px | Full desktop + max-width 1600, 400 particles |

### §10.2. Graceful degradation для 3D

На mobile с низкой GPU (detection `navigator.deviceMemory < 4` или WebGL renderer):
- **Three.js scenes (§6, §22, §1.6 Layer 2)** → 2D fallback (SVG static с hover state).
- **Monte Carlo parallel-coords** → упрощённая версия (10 сэмплов визуально).
- Все симуляторы — работают полностью (live-compute).

### §10.3. Touch-оптимизация

- Tap-targets ≥ 44×44 px (Apple HIG).
- Sliders — native `<input type="range">` с CSS-стилизацией.
- Swipe-left/right для carousel (GSAP Draggable + Inertia).
- Drag-and-drop в Pipeline Builder — Pointer Events API.

### §10.4. Lenis smooth-scroll на mobile (v1.1 — уточнение)

Lenis на iOS Safari имеет подёргивания. **Решение:**
```javascript
const lenis = new Lenis({
  smooth: true,
  smoothTouch: false,        // ← iOS uses native scroll
  touchMultiplier: 2
});
```

На Android Chrome 110+ `smoothTouch: true` работает стабильно, но мы всё равно ставим `false` для единообразного UX между платформами.

### §10.5. Тестирование

- iOS Safari 15+ (iPhone 11+, iPad Air)
- Android Chrome 110+ (Pixel 5+, Samsung Galaxy S21+)
- Landscape + Portrait
- Low-end mode (Chrome DevTools Performance throttling 4× CPU)

---

## §11. Доставка: Offline HTML + SEO + Print-friendly

### §11.1. Offline single HTML (v1.1 — уточнение по размеру)

- Один файл `ТрендСтудио_Холдинг_Лендинг_v1.0.html`.
- Все ассеты inline:
  - WOFF2 шрифты (base64) — ~420 KB
  - GSAP + 3 plugins — ~80 KB
  - Lenis — ~15 KB
  - D3 v7 — ~280 KB
  - Three.js r128 — ~600 KB
  - Inline SVG (film-grain, иконки, разделители) — ~15 KB
  - Inline GeoJSON (15 регионов РФ) — ~120 KB
  - **Gemini изображения (20 × base64)** — ~7-9 MB
  - canon_holding_base.json — ~150 KB
  - canon_holding_extended.json (без images) — ~400 KB
  - HTML разметка + CSS + JS-логика — ~200 KB
- **Итого: ≈ 9-11 MB** (target ≤ 30 MB — есть запас).
- Работает без интернета (открыть двойным кликом).

### §11.2. SEO + OG-tags

```html
<title>ТрендСтудио Холдинг — LP Fund 3 000 млн ₽ | 7 проектов, IRR 24.75%</title>
<meta name="description" content="Российский киноиндустриальный холдинг. Fund 3 млрд ₽, IRR 24.75% (Internal) / 20.09% (Public), 7 проектов, 4 стадии pipeline, 7-летний горизонт.">
<meta property="og:title" content="ТрендСтудио Холдинг — Инвестиционный меморандум">
<meta property="og:description" content="LP Fund 3 000 млн ₽. 7 проектов, IRR 24.75%, TVPI ≥ 2.0×.">
<meta property="og:image" content="data:image/jpeg;base64,..."> <!-- hero_bg.jpg base64 -->
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ТрендСтудио Холдинг",
  "description": "Киноиндустриальный холдинг РФ с LP-фондом 3 000 млн ₽",
  "foundingDate": "2026",
  "industry": "Film Production"
}
</script>
```

### §11.3. Print-friendly

`@media print` правила:
- Тёмный фон → белый, gold → чёрный на белом.
- Все графики — outline SVG (без fill, только stroke).
- Pagebreak перед каждой секцией (`page-break-before: always`).
- Скрыть: audience-switcher, симуляторы inputs, side-dots nav, footer CTA.
- Скрыть или grayscale: Gemini изображения (выбор через `.print-hide` vs `.print-grayscale` класс).
- Показать: все цифры, все таблицы, все outline-графики.
- Target: 25 печатных страниц A4.

### §11.4. Изображения: inline vs. link fallback (v1.1)

Выбрана стратегия **inline base64 для production deliverable**:
- Плюс: single-file portability, offline, emailable.
- Минус: ~7-9 MB «на диске», но в target.

Если в будущем (v1.2+) размер станет проблемой — опциональный вариант B «dual-mode»:
- Production HTML с inline base64.
- Lite HTML с `<img src="images/01.jpg">` + файлы в папке `images/` рядом (требует раздачи папки вместе с файлом, теряется portability).

На v1.1 используем только вариант A (inline).

---

## §12. Формат сдачи пользователю

### §12.1. Что Claude получает на вход (обновлено v1.1)

**4 файла** в одном каталоге:
- `Промт_HTML_лендинг_Холдинг_v1.1.md` (этот промт)
- `canon_holding_base.json` (18 блоков)
- `canon_holding_extended.json` (23 блока, включая `images`)
- Папка `images/` с 20 файлами (структура §1.7.2)

Плюс 4 источника (§2.1): LP Memo v1.1.0, Deck v1.1.2, Investor Model v3.0, Finmodel v1.4.4.

### §12.2. Что Claude сдаёт на выход

1. **Короткий summary** (5-7 строк):
   > Готов лендинг ТрендСтудио Холдинг v1.0 по промту v1.1. 25 секций, scroll-storytelling, 3 audience-режима (LP / Partners / Gov), 22 типа визуализаций, **13 симуляторов**. Данные из canon_holding_base.json (18 блоков) + canon_holding_extended.json (23 блока, включая 20 images) = 41 блок. Интерактив + анимация 100% (N_elements = {{}}). Mobile parity (iOS+Android). Offline single-file ({{}} MB). 3-layer adaptive background (gradient + film-grain + 3D particles). Nolan/Dune палитра без electric blue. П5 Максимум 32/32 + М4 Презентационная 7/7.

2. **Computer-ссылка** на `.html` файл.

3. **Блок «Результаты верификации v1.0»** (не более 25 строк): М4.1-М4.7 + П5.1-32 + метрики покрытия + performance + a11y + mobile + image registry.

4. **Опционально:** «Что осталось на усмотрение» — 1-2 пункта (обычно: Release-window Gantt и 3D Org Tree как опциональные).

### §12.3. Workflow от утверждения v1.1 до HTML (v1.1 — НОВОЕ)

```
[1] Утверждение промта v1.1         ← текущий шаг
  ↓
[2] Создание Gemini_TZ_images_v1.0.md  ← ТЗ для Gemini Nano Banana (Приложение В ниже)
  ↓
[3] Пользователь генерирует 20 изображений в Gemini → сохраняет в /Холдинг/images/
  ↓
[4] Создание canon_holding_base.json (18 блоков)       ← на основе 4 источников
  ↓
[5] Создание canon_holding_extended.json (23 блока)    ← включая canon.images.* registry (с путями `images/...`, без base64)
  ↓
[6] Передача агенту: промт + 2 canon + папка images/
  ↓
[7] Агент реализует Фазы 0-7, в Фазе 6 inline-pack base64 → финальный single-file .html
  ↓
[8] Верификация П5 32/32 + М4 7/7 + отчёт
```

---

## Приложение А. Шпаргалка для агента v1.1

**Порядок действий при получении промта v1.1:**

1. Открой `canon_holding_base.json` → проверь 18 блоков + `_meta.version`.
2. Открой `canon_holding_extended.json` → проверь 23 блока (включая `images`).
3. Убедись, что ключи верхнего уровня не пересекаются (кроме `_meta`).
4. Прогони 10 якорей §1.2 + 5 image-ассертов (§2.4). Если fail — стоп.
5. Прочитай этот промт полностью.
6. Проверь, что все 20 файлов в `images/**` существуют и корректно открываются как JPEG.
7. Следуй §9 (7 фаз) с акцентом на §5 (13 симуляторов), §6.1 (100% coverage incl. tween), §1.6 (3-layer bg), §10 (mobile parity).
8. В Фазе 0: оба canon + якоря + images + архитектура + lazy-loading + 3-layer bg план.
9. В Фазе 2: каждому элементу — анимация + интерактив + tween. `data-animated`, `data-interactive`, `data-interaction-tween="true"`.
10. В Фазе 3: реализовать 22 визуализации из §4.
11. В Фазе 4: 13 симуляторов из `canon.simulators`.
12. В Фазе 6: mobile + offline + SEO + print + **base64 inline-pack изображений**.
13. В Фазе 7: М4.7 cross-file integrity + 100% coverage + VERIFICATION REPORT.
14. Сдай: HTML-артефакт + summary + verification-блок.

**Ключевые якоря для быстрой проверки:**

| Ключ | Ожидаемое значение |
|------|---------------------|
| `canon.fund.lp_size_mln_rub` | 3000 |
| `canon.pipeline.projects.length` | 7 |
| `canon.pipeline.stages.length` | 4 |
| `canon.pipeline.stage_project_matrix.flat().length` | 28 |
| `canon.returns.irr_internal_w5vd` | 24.75 |
| `canon.returns.irr_public_w3` | 20.09 |
| `canon.monte_carlo.total_runs` | 1000 |
| `canon.monte_carlo.p50_irr_internal` | ≈ 13.95 (±0.5) |
| `canon.monte_carlo.p50_irr_public` | ≈ 11.44 (±0.5) |
| `canon.finmodel.tests_passed` | 348 |
| `canon.horizon.years` | 7 |
| `canon.returns.target_moic` | ≥ 2.0 |
| `canon.interaction_rules.rule_coverage_pct` | 100 |
| `canon.interaction_rules.element_requirements.length` | ≥ 38 |
| `canon.animation_catalog.scroll_animations.length` | 12 |
| `canon.animation_catalog.chart_animations.length` | 12 |
| `canon.animation_catalog.interaction_patterns.length` | 11 |
| `canon.simulators` | 13 формул |
| `canon.images.projects.length` | 7 |
| `canon.images.team.length` | 5 |
| `canon.images.advisory.length` | 4 |
| Total `canon.images.*` slots | 20 |

**Палитра (Dark Cinematic Nolan/Dune, v1.1):**
- Фон: `#050508` / `#0A0A0F` / `#0D1117` / `#14161C` / `#1C1E26`
- Золото: `#D4AF37` (главный акцент, CTA, ключевые цифры)
- Film-ember: `#C77B3A` (warm orange, secondary)
- Dune-sand: `#B8A888` (muted neutral, Partners/Gov audience accent)
- Rose: `#E91E63` (bear, alerts)
- **Electric blue #4FC3F7 — ЗАПРЕЩЁН в v1.1** (заменён gold/ember/sand)
- Текст: `#F5F5F7` / `#A8A8B2` / `#6B6B78`

**Шрифты:** Manrope (700, 800) / Inter (400, 500, 600) / JetBrains Mono (500).

**GSAP регистрация (обязательна):**
```javascript
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);
```

**Если один из canon-файлов или папка images/ не найдены:** остановись, сообщи `«Не найден {file/folder}. Приложите недостающее»`.

**Если якоря §1.2 не сходятся или изображений нет всех 20:** остановись, покажи расхождения.

**Если М4.7 cross-file integrity проваливается:** остановись, покажи расхождения.

---

## Приложение Б. Что сделать до генерации HTML

Финальный workflow перехода от промта v1.1 к HTML:

1. **Утверждение промта v1.1** пользователем (после прочтения этого файла).
2. **Генерация `Gemini_TZ_images_v1.0.md`** — техзадание на 20 изображений (Приложение В ниже — расширяется в отдельный файл).
3. Пользователь запускает Gemini Nano Banana по ТЗ → получает 20 JPEG-файлов → укладывает в `/Холдинг/images/` по структуре §1.7.2.
4. **Извлечение canon-данных** из 4 источников (§2.1): LP Memo v1.1.0, Deck v1.1.2, Investor Model v3.0, Finmodel v1.4.4.
5. **Генерация `canon_holding_base.json`** (18 блоков) — текст + структура.
6. **Генерация `canon_holding_extended.json`** (23 блока) — визуализации + interactivity rules + simulators + **`canon.images` registry** (с путями `images/01_...jpg`, без base64).
7. **Sanity-check** по §2.4 (якоря + images registry).
8. **Применение промта v1.1** → Claude генерирует HTML по §9 (7 фаз).
9. В Фазе 6 агент inline-pack base64 изображений → финальный `.html`.
10. **П5 32/32 + М4 7/7 отчёт** — в комментарии HTML.

---

## Приложение В. Gemini TZ — черновик (будет вынесен в отдельный файл после утверждения v1.1)

После утверждения этого промта v1.1 создаётся отдельный файл `Gemini_TZ_images_v1.0.md` со следующей структурой:

1. **Unified style prompt** (§1.7 выше) — главный стилевой лейтмотив (Nolan/Dune, dark cinematic, gold/ember accents).
2. **20 индивидуальных промтов** — по одному на каждый слот:
   - hero_bg.jpg (16:9, abstract cinematic backdrop)
   - hero_film_reel.jpg (1:1, 3D holographic film reel)
   - projects/01-07 (2:3, film posters, 7 разных настроений под жанры проектов — уточняются после получения codenames от пользователя)
   - team/01-05 (1:1, stylized portraits — НЕ фото реальных людей во избежание privacy/likeness issues; абстрактные силуэты в cinematic-подсветке с gold rim-light)
   - advisory/01-04 (аналогично team)
   - banners/market_context.jpg (21:9, кинорынок — силуэты залов, свет проекторов)
   - banners/press.jpg (21:9, газетная текстура с gold-тиснением)
3. **Технические параметры:** JPEG Q75, разрешения (hero 1920×1080, posters 800×1200, portraits 600×600, banners 1680×720), colourspace sRGB, no watermark, no text overlays.
4. **Naming convention** — точные имена файлов (§1.7.2) для упорядоченной вставки в `canon.images.*`.
5. **QA-чек-лист** после получения от Gemini: 20/20 файлов, имена совпадают, разрешения совпадают, средний вес ≤ 350 KB, no text/watermarks, стилевая когерентность 5/5 (subjective review).

Этот черновик становится файлом `Gemini_TZ_images_v1.0.md` **на следующем шаге после утверждения v1.1** — в том же каталоге `/Холдинг/`.

---

## Приложение Г. Diff v1.0 → v1.1 (сводка для верификации №24)

| Раздел | v1.0 | v1.1 |
|--------|------|------|
| Файлов в доставке | 3 (md + 2 canon) | **4** (md + 2 canon + Gemini TZ) + **папка images/** |
| Блоков canon total | 40 | **41** (+canon.images в extended) |
| Криетриев приёмки | 70 (60 + 10) | **72** (60 + 12: добавлены 71 и 72 про 100% interactivity и tween) |
| Запретов | 22 | 22 (но №11 и №12 изменены: хардкод путей к images + electric blue) |
| Палитра | gold + electric blue + rose | **gold + ember + sand + rose** (electric blue удалён, добавлены Nolan/Dune ember и sand) |
| Фон | статичный `--gradient-hero` | **3-layer адаптивный** (gradient drift + film-grain + 3D particles) |
| Изображения | упоминались косвенно | **hybrid Gemini (20) + inline SVG декор** |
| Naming convention изображений | не определена | **A+C** (строгая структура + `canon.images.*` registry) |
| Фазы выполнения | 7 фаз (Ф0 = 9 шагов) | 7 фаз (Ф0 = **10 шагов**, +шаг «прочитать 20 файлов images и подготовить base64») |
| М-механизмы | 7 (М4.1-7) | 7 (М4.1-7, но М4.6 и М4.7 расширены — включают проверку images registry) |
| П5 | 32 (все) | 32 (все, но №32 «ссылочная целостность» теперь проверяет 20 image-slots) |
| Workflow | промт → canon → HTML | **промт → Gemini TZ → images → canon → HTML** |

---

**Конец промта v1.1.**

**Статус:** драфт v1.1 с учётом 26 решений пользователя. После подтверждения — переход к `Gemini_TZ_images_v1.0.md` (Приложение В в расширении).
**Следующий шаг:** при необходимости — уточняющие вопросы через AskUserQuestion. При отсутствии вопросов — создание Gemini TZ.
