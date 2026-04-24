# PROMPT — Landing v2.1 AUTONOMOUS (холдинг → фонд, премиум-уровень)

**Версия:** v2.1 FINAL
**Дата:** 2026-04-24
**Стратегия:** полный rerun от main, НОВАЯ ветка `claude/landing-v2.1-autonomous`
**Режим:** `--dangerously-skip-permissions` (абсолютная автономия)
**Базовая:** v2.0 + ревью от пользователя (13+ скринов, 4 system-wide принципа)

---

## 🎯 КРИТИЧЕСКИЙ СДВИГ КОНТЕКСТА v2.0 → v2.1

### Что меняется принципиально

**v2.0:** «ТрендСтудио = LP-фонд кино. Сайт привлекает LP (институционалов, family offices).»

**v2.1:** **«ТрендСтудио = кинопроизводственный холдинг. Сайт показывает холдинг потенциальному инвестиционному фонду (РФПИ, ВЭБ.Венчурс, family office, суверенный фонд) который рассматривает со-финансирование портфеля из 7 проектов.»**

### Audience shift

- **«Мы»** в тексте = холдинг «ТрендСтудио»
- **«Вы»** / «партнёр» = институциональный фонд-инвестор
- **Цель сайта:** убедить фонд войти в партнёрство с холдингом как якорный LP в создаваемом холдингом vehicle'е

### Content rewrite — принципы

1. **Hero переосмыслить.** Было: «LP-фонд кино. 3 000 млн ₽. Целевая IRR 20-25%». Стало: что-то вроде «ТрендСтудио. Кинопроизводственный холдинг ищет партнёра на портфель из 7 проектов. 3 000 млн ₽ target commitment. 20.09% прогнозная IRR».
2. **CTA переименовать:**
   - «Запросить LP-пакет» → «Обсудить партнёрство» / «Запросить встречу с CEO»
   - «Скачать memo» → «Скачать investment pack»
   - «Запросить NDA и доступ к PPM» → оставить (актуально для фонда)
3. **Thesis** — не «почему кино», а **«Почему стоит партнёрствовать с нами»** (track record, команда, pipeline, госпрограммы, структурированный риск)
4. **Terminology сохраняется:** LP/GP waterfall, hurdle, MOIC — это стандартный язык институционалов, фонд его понимает
5. **NDA Gate** в Legal остаётся — фонд после просмотра лендинга подписывает NDA и получает PPM/LP Agreement

### Что НЕ меняется

- Финансовая математика (формулы computeCommitment, runMonteCarlo, waterfall split)
- 10 замороженных якорей (3000, 7, 24.75, 20.09, 13.95, 11.44, 348, 7, 4, v1.4.4)
- Dark Cinematic палитра (shadows_of_sunset_v1)
- 20 изображений Gemini
- i18n symmetry (94 RU / 94 EN)
- React + Recharts + Tailwind стек

---

## §1. ЧЕТЫРЕ СИСТЕМНЫХ ПРИНЦИПА (применять во ВСЕХ 25 секциях)

Эти 4 правила от пользователя — обязательны. Каждая секция должна удовлетворять всем четырём.

### P1. Интерактив = новая информация (не движение ради движения)

Каждый hover / click / tap ДОЛЖЕН давать семантическую ценность:
- Новые данные (цифры, пояснения, контекст, источник)
- Новая визуализация (drill-down, breakdown, cross-section)
- Новая возможность (персональный расчёт, кастомизация, выбор сценария)
- Новый эпизод (кадр, иллюстрация, пример)

**ЗАПРЕЩЕНО:** голые hover-эффекты без нового контента («просто scale 1.02», «просто подсветить»). Если hover/click не раскрывает новое — **не делать** интерактив вообще. Статика лучше пустого интерактива.

### P2. Wow-level анимации (premium/Apple-tier)

Каждая анимация должна вызывать эффект «круто сделано»:
- Smooth easing (cubic-bezier(0.22, 1, 0.36, 1) или spring physics)
- Корректная длительность: 200-400ms micro, 600-1200ms macro, 1500-2500ms hero-sequences
- Layered motion (композиция из нескольких одновременных эффектов)
- Physics feel — вес, инерция, натяжение
- Декоративные слои: particles, glow, gradient-shifts, blur-transitions
- Никаких step-функций, snap'ов, линейных easing, мгновенных state changes

**Референсы качества:** Apple keynote transitions, Stripe landing, Linear UI, Arc browser hero, Vercel case studies, Framer Sites.

### P3. Scroll animations (при прокрутке страницы)

Обязательно во всех секциях:
- Scroll-reveal fade-in-up для блоков (stagger index × 80-120ms)
- Parallax для hero-image, section backgrounds, decorative layers
- Scroll-triggered CountUp, charts sweep-in, timeline playhead
- Sticky/pin для тяжёлых секций (Waterfall — pin на 200vh, slider привязан к scroll)
- Horizontal scroll для Pipeline projects, Roadmap Gantt

### P4. Load animations (при загрузке страницы)

Обязательно:
- Entrance sequence: bg → title → tagline → KPIs → CTA (layered delay)
- Hero hero-image: subtle ken-burns zoom при загрузке
- Skeleton states (не внезапный pop-in контента)
- Возможно короткий preloader для первого paint (base64 6.5MB тяжёлые)
- Smooth scroll + section highlight при клике в TopNav

---

## §2. ROADMAP-MODALITY (новое в v2.1)

**Решение:** удалить s08 Stages (Kanban) как отдельную секцию. Всё production planning показывается через **Roadmap s13 (Gantt)**.

### Причины
- Все 7 проектов в Development сейчас (Stage 00) — Kanban с 3 пустыми колонками выглядит странно
- Roadmap логичнее показывает **план** (2026-2032) чем текущее состояние
- Избавляемся от дубля (проекты показаны в s07 Pipeline + s08 Stages = одно и то же)

### Новая структура Roadmap s13

Swimlanes (вместо колонок Kanban):
- **Fundraising** (2026 Q2-Q4): soft circle, hard circle, first close, final close
- **Development** (2026 Q3 — 2027 Q2): 7 проектов одновременно в этой полосе
- **Pre-production** (2027 Q1 — 2027 Q4): проекты начинают переходить
- **Production** (2027 Q3 — 2029 Q2): съёмочные периоды
- **Post-production** (2028 Q1 — 2030 Q1)
- **Distribution** (2028 Q3 — 2032): theatrical → OTT → TV
- **Exits / IP monetization** (2029 Q4 — 2032)

Каждый из 7 проектов — мини-bar через все swimlanes с датами начала/конца этапа.

### Hover/click interactions (P1)

- Hover на milestone-точку → tooltip с deliverables + budget snapshot
- Click на swimlane → выделение + показ всех проектов в этой фазе с timeline detail
- Click на project-row → modal с полной информацией + постер + synopsis
- Scrubber-playhead: draggable year selector → весь интерфейс подстраивается под выбранный год (показывает какие проекты сейчас в какой фазе)

### Удалить

- s08 Stages (Kanban) — полностью убрать из WAVE_PROMPTS/W3.md
- Пересчитать нумерацию секций или оставить (s00 s01 ... s07 s09 s10 ...) на усмотрение CC

---

## §3. ANIMATION & INTERACTION LAYER (из v2.0 §3, без изменений)

Использовать ВСЕ компоненты из v2.0:
- `useReveal()` hook
- `<Reveal>` wrapper
- `<Tooltip>` с 280px width
- `<CountUp>` с requestAnimationFrame
- `useIsDesktop()` hook
- Global styles для focus-visible + reduce-motion + card-hover

Все они определяются в W1 как foundation. Используются в W2-W6.

**Расширение v2.1:** добавить helper для FLIP-анимации:

```jsx
function useFlip() {
  const positions = useRef({});
  const recordPosition = (id, el) => {
    if (el) positions.current[id] = el.getBoundingClientRect();
  };
  const animateTo = (id, el) => {
    const prev = positions.current[id];
    if (!prev || !el) return;
    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0,0)' }],
      { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  };
  return { recordPosition, animateTo };
}
```

Использовать для M2 Pipeline Builder FLIP-reset и для Team 2-state card.

---

## §4. PREMIUM POLISH — рекомендации (P2)

CC свободен выбирать техники под каждую секцию. Референсы качества и inspiration:

### Apple Keynote / Apple.com product pages
- Layered parallax при scroll
- Masked video backgrounds
- Typography hierarchy с discrete weights
- Spring-based transitions

### Stripe.com
- Gradient meshes (animated)
- Glass-morphism cards с subtle backdrop-filter
- Hover reveals с exit/enter transitions
- Clear CTA hierarchy

### Linear.app
- Pure dark theme с precision typography
- Micro-interactions на кнопках
- Staggered list reveals
- Subtle neon accents

### Arc Browser (thebrowser.company/arc)
- Film-grain overlay на cinematic sections
- Bold serif typography для эмоциональных хедеров
- Organic motion (не строгие рамки)

### Vercel.com / v0.dev
- Grid-based layouts с breathing whitespace
- Monochrome + 1-2 accent colors
- Smooth page transitions

### Framer.com / Sites showcase
- Bold visual statements
- Кинематографичные cover-видео
- Anchor-based navigation с smooth scroll

### Techniques to consider (CC выбирает что уместно где)

- `backdrop-filter: blur()` для glass cards
- SVG `filter: feTurbulence + feDisplacementMap` для film-grain
- Canvas particles для money-flow в Waterfall
- Radial gradients для section backgrounds
- `mask-image` для плавных переходов изображений в фон (fix color-seam)
- Ken-burns на hero-image (subtle scale + slow translate)
- CSS `@property` для anim-friendly gradient colors
- ScrollTrigger-like через IntersectionObserver (native, без GSAP)

**Strict constraint:** Dark Cinematic theme (shadows_of_sunset_v1) сохраняется везде. Premium polish — в рамках этой палитры.

---

## §5. FIX-СПЕКИ ДЛЯ 15 ПРОБЛЕМНЫХ СЕКЦИЙ (по ревью пользователя)

Каждая спека — обязательный fix с proofpoint'ом в acceptance.

### §5.1 s01 Hero — fix color-seam + premium polish

**Проблема v2.0:** видна граница между hero-image и фоном слева.

**Fix:**
```jsx
<img src="__IMG_PLACEHOLDER_img19__" alt="..."
     style={{
       maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
       WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
     }}
/>
<div className="vignette-overlay" style={{
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse at center, transparent 40%, #0B0D10 100%)'
}}/>
```

**Плюс premium polish:**
- Film-grain overlay (SVG filter или animated noise canvas)
- Subtle ken-burns на hero-image (scale 1.02 → 1.08 за 30s loop)
- Ray-of-light через CSS radial-gradient справа (там где film-reel)
- Rotation loop на film-reel 60s
- Entrance sequence: bg → h1 → tagline → KPIs CountUp → CTAs (stagger 300ms total 1200ms)

**Интерактив P1:**
- Hover на KPI «3 000 млн» → tooltip «target commitment от фонда-партнёра»
- Hover на «7 лет» → tooltip «horizon от first close до final distribution»
- Hover на «20.09%» → tooltip «прогнозная IRR Public-сценария (после carry), Monte-Carlo P50»
- Click «Обсудить партнёрство» → модалка с inline-формой или scroll к s22 CTA

### §5.2 s02 Thesis — premium-asymmetric layout

**Проблема:** 3 идентичные box'а, скучно.

**Fix:**
- Асимметричная композиция: первая карточка крупнее (50% row-width), 2+3 по 25%. Или stagger по вертикали с offset'ом.
- Inside-cards мини-визуализации:
  - «Track record»: sparkline релизов по годам
  - «Команда»: mini-avatar-stack (5 кружков с иконками)
  - «Pipeline structure»: donut 7 проектов по жанрам
- Drop-cap для первой буквы body text (Playfair Display 4em)
- Glass-morphism на карточках

**Content rewrite (холдинг→фонд):**
- Заголовок: «Почему ТрендСтудио» → **«Почему партнёрство с нами»** или **«Что мы приносим в вашу инвестицию»**
- Карточка 1: «Track record» (было «Рост рынка») — наш опыт: X релизов, Y проектов в OTT, Z международных
- Карточка 2: «Институциональная дисциплина» (оставить) — но формулировка: «вы получаете LP/GP-структуру, проверенную на 348 автотестах»
- Карточка 3: «Диверсифицированный портфель» (было «Портфельный подход») — «7 проектов 2026-2028 в 4 жанрах, не ставка на один хит»

**Интерактив P1:** click на карточку → expand с данными + источниками.

### §5.3 s03 Market — interactive + wow

**Проблема:** 4 плоских KPI без контекста.

**Fix:**
- Каждая карточка содержит **мини-график** (sparkline/bar/pie):
  - 45 млрд ₽: линия роста 2020-2025
  - 350 млн ₽: mini-pie по жанрам
  - 40% господдержки: stacked bar программ
  - 22% OTT: линия OTT vs TV
- Parallax-фон секции (cinematic background image с mousemove)
- CountUp на всех 4 числах при появлении
- Hover на число → «что это значит для фонда 3000 млн ₽» (например, 40% → «до 1.2 млрд безвозвратных субсидий по всему портфелю»)
- Click на карточку → expand с deep-dive (источники, прогноз, влияние на вашу IRR)

### §5.4 s04 Fund Structure donut — fix tooltip + 2-way sync

**Проблема:** белый tooltip-фон на чёрном фоне, статичный интерактив, 3 карточки справа не связаны с донутом.

**Fix:**
- Recharts Tooltip: `contentStyle={{background:'#15181C', border:'1px solid #F4A261', color:'#EAEAEA'}}`
- Активный сегмент выезжает из круга (cx/cy offset +8px)
- Sweep-in animation при появлении (draw-in по часовой стрелке, 800ms)
- Inner hole: показывает активную долю цифрой (2 550 млн или 450 млн)
- 2-way sync: click сегмент ↔ карточка справа подсвечивается, и наоборот
- Карточки справа: `<Reveal delay={i*100}>`, hover = lift + border glow
- Click карточки → expand с типами LP (пенсионные фонды / family offices / суверенные)

### §5.5 s05 Economics 4 KPI — wow-interactive

**Проблема:** 4 плоских числа.

**Fix:**
- Каждая карточка — flip-animation на hover (front: число + название; back: формула + пример «2% от 3000 млн = 60 млн ₽/год»)
- Gradient-stroke на появлении (border shimmer)
- CountUp на всех 4 (2%, 20%, 8%, 100%)
- Click → expand с детальной механикой и impact на LP return

### §5.6 s05 Waterfall Bars — cascade + particles + premium

**Проблема:** 4 плоских независимых бара, скучно.

**Fix:**
- Настоящий **waterfall cascade** (последовательные бары, каждый «отнимает» от предыдущего)
- Соединительные SVG-линии/стрелки между tier'ами
- Particles-анимация «перелива денег» между tier'ами (canvas или SVG circles)
- Click tier → expand с formula + example: для portfolio 3000 млн и MOIC 3.62, Tier N = X млн
- Stagger appearance: T1 → T2 → T3 → T4 с delay 200ms
- Hover: bar «дышит» (subtle pulse + glow)
- **Math check:** проверить что 45% + 25% + 10% + 20% = 100% имеет смысл. Если нет — пересчитать по правильной waterfall logic

### §5.7 s06 M1 Monte-Carlo histogram — fix white bg + interactive bars

**Проблема v2.0:** белый фон за hovered столбцом (Recharts cursor default), скучная анимация, нет click-интерактива.

**Fix:**
- `<Tooltip cursor={{fill:'rgba(244,162,97,0.12)'}}/>` — warm подсветка вместо белой
- Bar animation: `animationDuration={1200} animationBegin={0} animationEasing="ease-out"` + custom gradient fill + subtle glow на hovered bar
- Click на bar → detail-panel справа/ниже: «в этом бине 3644 сценария. Комбинации параметров: hit_rate ∈ [22-28%], avg_multiple ∈ [2.1-2.5×]. Что это значит для вас: 36% вероятность превысить P75.»
- Quantile-линии P10/P25/P50/P75/P90 как горизонтальные reference lines
- Highlight активного сценария (hit_rate/avg_multiple/loss_rate из слайдеров) — подсветка bin'а в котором попали

### §5.8 s07 Pipeline cards — постеры + 2-state card

**Проблема:** сейчас decent, но можно premium-полировку.

**Fix:**
- Постеры (img10-img16) уже есть, проверить что они грамотно вписаны с aspect-[2/3]
- Hover на карточку → tilt (3D rotateX/rotateY по mousemove)
- Click → modal с полной инфо (уже есть, улучшить premium design)
- Filter chips: active с glow + scale, inactive с opacity 0.6

### §5.9 s08 УДАЛИТЬ Kanban Stages

Полностью убрать секцию. См. §2.

### §5.10 s09/s10 Team + Advisory — 2-state card

**Проблема:** скучные статичные карточки, цветовой срез между фото и фоном.

**Fix:**
- **Default state (collapsed):** только фото + должность (CEO / Lead Producer / CFO / ...)
- **On click (expanded):** карточка выдвигается вперёд (z-index 100 + scale 1.15 + big shadow), раскрывается текст (имя, bio bullets, LinkedIn link). Остальные карточки в grid затемняются/scale 0.92.
- Click снова / Esc / click outside → возврат в default
- **Gradient border** вокруг фото: `linear-gradient(135deg, #F4A261, #2A9D8F)` с 2-3px, чтобы убрать color-seam
- Inner vignette на фото (plavное растворение границ)
- Spring transition 400ms для expand
- Accessibility: role="button", aria-expanded, Enter/Space, Esc, focus management
- Advisory — те же 2-state карточки, но меньшего размера (60% от Team) + sepia filter

### §5.11 s11 Operations 6-step — interactive = deeper info

**Проблема:** 6 иконок с коротким текстом, никакого интерактива.

**Fix:**
- Click на шаг → раскрывается lane под шагом с deeper info:
  - Scouting: «Анализ 300+ сценариев в год. Источники: фестивали, ВГИК, запросы от OTT-партнёров. Criteria: trend-fit, genre-demand, casting-feasibility.»
  - Due Diligence: «Creative / financial / legal экспертиза. 3 недели, 5 экспертов. Deliverables: green-light memo для инвесткомитета.»
  - Development: «Script lock, cast attachments, budget lock, cash call план. 2-6 месяцев.»
  - Production: «Съёмочный период, weekly cost-review, monthly dashboards LP. 3-6 месяцев.»
  - Marketing & Distribution: «OTT/theatrical window planning. Partnership with Кинопоиск/Okko/Wink. International sales через агентов.»
  - Exit / IP Monetization: «Library sales, remake rights, sequel options, perpetual IP.»
- SVG connector-линии между шагами — animated stroke-dashoffset on scroll
- Scroll-reveal stagger по шагам слева направо (index × 120ms)
- Icons pop-in с scale spring при появлении

### §5.12 s12 Risks 3×3 — interactive matrix

**Проблема v2.0:** OK сделано, но проверить premium polish.

**Fix:**
- Каждая клетка 3×3 — гравитационно-масштабированные кружки (больший = более важный риск)
- Hover на кружок → tooltip с «что именно» и «как митигируем»
- Click → modal с детальным планом митигации + владельцем (кто из команды ответственен)
- Цветовая шкала: low #2A9D8F → med #F4A261 → high #EF4444
- Стагер-reveal по 12 рискам (index × 60ms)

### §5.13 s13 Roadmap — REDESIGN (из §2 + premium)

**Проблема v2.0:** скучная графика, сломанные беcконечные pulse-анимации, нет интерактива.

**Fix:**
- Полный redesign Gantt (см. §2)
- 6 swimlanes (Fundraising / Development / Pre / Prod / Post / Distribution / Exits) — можно сжать до 4-5 если визуально лучше
- 7 проектов как цветные bars через swimlanes
- Milestones — точки с цветом по stage, **pulse только 3 цикла при появлении или hover**, НЕ бесконечно
- Horizontal scroll для long timeline (или zoom-in/zoom-out)
- Scrubber-playhead (draggable year selector) — при движении в Kanban-mini-preview показывает какие проекты в какой фазе
- Click на проект-row → modal
- Click на swimlane-label → фильтр показывает только проекты в этой фазе

### §5.14 s14 Scenarios — без изменений (decent в v2.0)

Добавить только: CountUp на KPI при смене tab, spring transition chart'а (не hard-switch).

### §5.15 s15 Regions — или SVG-карта РФ, или минимум heatmap+polish

**Проблема v2.0:** упрощённо в 3×3 heatmap.

**Fix (pick one):**
- (A) **SVG-карта РФ** — лицензированная упрощённая топология 8 ФО. Heatmap заливка по # проектов. Hover → tooltip.
- (B) Улучшить heatmap: gradient-fills вместо плоских цветов, glow на active регионе, click → popup со списком проектов в регионе и налоговыми льготами

### §5.16 s16 Tax Credits — summary premium + 102% fix

**Проблема:** summary скучное, 102% выглядит подозрительно.

**Fix:**
- Premium summary block: glass-morphism с gradient border
- CountUp на всех 3 числах
- **Cap maximum effective rate на 85-90%** (не 102%) — это соответствует реальной cumulative доступной по РФ
- Click на «Эффективная ставка XX%» → expand с breakdown: «это означает из 530 млн бюджета холдинг получит 450 млн безвозвратно, эффективная cost of capital = 80 млн»
- Visual: progress-bars по каждой из 4 программ с color-coding

### §5.17 s17 Press — без изменений (OK в v2.0)

### §5.18 s18 FAQ — ПЕРЕМЕСТИТЬ В НИЗ СТРАНИЦЫ

**Проблема:** FAQ в середине лендинга сейчас. Пользователь попросил **в самый низ** (перед Legal → Term Sheet → Footer).

**Fix:** переместить `<FAQSection>` в конец, после Press, перед Legal.

### §5.19 s19 Distribution — OK в v2.0 (donut + timeline)

Добавить мини-polish: hover tooltips на partner chips с описанием.

### §5.20 s20 Waterfall Intro + Interactive

**Проблема v2.0:** OK intro + tooltips, но бары не premium и нет click-drill-down.

**Fix:**
- См. §5.6 (waterfall cascade с particles)
- Hover на PE-термин в intro-тексте → tooltip (уже есть)
- Slider scroll-pinned: пока user scroll'ит через секцию — slider меняется автоматически (sticky + scroll-progress мапится на multiplier 1× → 4×)

### §5.21 s21 Legal — flip-карточки

**Проблема:** default показывает полный текст. Пользователь хочет: default = icon + название + короткий teaser, expand = полный текст.

**Fix:**
- 6 карточек с 2-state:
  - **Collapsed:** иконка + название + 1-line teaser (например, «Статус инвестора: только квалы»)
  - **Expanded:** полный текст + ссылка на источник (ФЗ-156, Положение ЦБ и т.д.)
- Flip 3D анимация при click (rotateY 180deg)
- Или expand сверху вниз (max-height transition)
- Keep: NDA gate снизу с checkbox + disabled-button

### §5.22 s22 CTA — premium

**Проблема v2.0:** OK background с img18, но можно лучше.

**Fix (минимальный):**
- Gradient mesh background (animated)
- CountUp на 3 KPI внизу (20.09% / 7 / 348)
- Hover на CTA кнопки → shimmer-effect
- **Content rewrite:** «Готовы обсудить вхождение в фонд?» → «Готовы обсудить партнёрство с холдингом?»
- 3 CTA: «Zoom-звонок с CEO» / «Email CIO» / «Telegram IR-команды»

### §5.23 s23 Term Sheet — interactive + premium

**Проблема:** скучная таблица, никакой интерактивности.

**Fix:**
- **Default state:** 13 строк таблицы показывают только Label (например, «Management fee») без значения
- **On click row:** раскрывается значение + объяснение + impact на LP (например, «2% от commitment = 60 млн ₽/год = 420 млн за 7 лет. Это меньше industry standard 2.5%, что даёт вам +150 млн в пользу distributions.»)
- Accordion stagger reveal
- Alternating row colors с subtle gradient
- Premium: glass-morphism на container, gold accent на hovered row
- PDF download CTA — реальный asset (стаб: mailto или alert)

### §5.24 s24 Footer — минимум

Оставить как v2.0 (4 col grid). Добавить:
- Newsletter subscribe input с premium-animation на submit (subtle checkmark)
- Social icons: hover = color-shift
- Copyright с CountUp на годе (© 2026)

### §5.25 M2 Pipeline Builder — 3 fix'а

**Проблема v2.0:**
1. Нельзя вернуть карточки из колонок обратно в rail
2. Нет анимации FLIP при reset
3. Нет постеров в карточках

**Fix:**
1. **Rail становится drop-target:** drag из колонки → rail возвращает проект
2. **FLIP-анимация на reset:** используй useFlip (см. §3 расширение). Записать позиции, вызвать setState, после re-render применить inverse-transform + transition. 500-700ms ease-out, stagger 30ms.
3. **Постеры в карточках:** `<img src={`__IMG_PLACEHOLDER_img${10+i}__`}/>` thumbnail 40×60px слева от текста. Hover на карточку → постер scales 1.15.
4. **Переименовать кнопку:** «Reset to Canon» → «Вернуть к исходному» (простой язык для фонда)
5. **Canon-reset v2.1:** все 7 проектов → Development swimlane (а не распределены по stages). Это согласуется с §2 roadmap-modality.

### §5.26 M3 Commitment Calculator — переосмыслить под «холдинг → фонд»

**Проблема:** в v2.0 это «LP commitment calculator» — но audience v2.1 = фонд, он заходит как LP в наш vehicle. Значит название ok, но переформулировать вокруг фонда как инвестора.

**Fix:**
- Заголовок: «Сколько получит ваш фонд — посчитайте сами»
- Input: «Commitment вашего фонда (10-500 млн)»
- Output: «Ваш фонд получит X млн ₽ через 7 лет · IRR 20.09% · MOIC 3.62×»
- LP tier badge: «Supporter / Sponsor / Anchor» — переименовать на «Partner / Lead Investor / Anchor Partner»
- Mini-waterfall сохраняется

---

## §6. ACCEPTANCE CRITERIA v2.1

### §6.1 Content audit — «холдинг → фонд» shift applied

```bash
# grep должен НЕ найти:
grep -i "LP-пакет\|LP-фонд российского кино" landing_v2.1.html
# grep должен найти (новые формулировки):
grep -i "холдинг\|партнёр\|обсудить партнёрство\|фонд-инвестор" landing_v2.1.html
```

### §6.2 Roadmap-modality check

- grep «Kanban» не должен найти (s08 удалён)
- Roadmap s13 должен содержать все 7 проектов как rows через swimlanes

### §6.3 4 Systemic principles applied

- P1 интерактив = info: все carddirect`onClick` должны открывать drill-down или modal (не просто toggle)
- P2 wow-anim: grep `cubic-bezier` ≥10, `@keyframes` ≥5, `animate(` ≥10
- P3 scroll-anim: Reveal instances ≥30 (системно ко всему)
- P4 load-anim: entrance-sequence в Hero (grep `animationDelay` ≥5)

### §6.4 Premium polish markers

- grep `backdrop-filter\|glass` ≥5 (glass-morphism где-то применён)
- grep `filter: url(#grain)\|feTurbulence` ≥1 (film-grain)
- grep `spring\|cubic-bezier(0.22, 1, 0.36, 1)` ≥5
- grep `parallax\|mousemove` ≥3

### §6.5 Legacy checks (из v2.0)

- M2 Pipeline Builder: drag-drop в обе стороны (rail ↔ columns)
- M3 Commitment Calc math: tier1+tier3+tier4 formula + Partner/Lead/Anchor badges
- Waterfall: tooltips на hurdle/catch-up/super-carry/MOIC
- Tax Credits: inline calc + effective rate cap на 85%
- Distribution: donut + timeline + hover-sync
- Legal: flip-cards + NDA gate
- Team/Advisory: 2-state card expand on click + gradient border
- FAQ: перемещён в низ (после Press, перед Legal)
- 20/20 images inlined
- P5 Max ≥ 30/32

### §6.6 Mutual Exclusivity (new v2.1)

- grep `__IMG_PLACEHOLDER_` = 0 в финале
- grep `localStorage\|sessionStorage` = 0
- grep `pravatar\|unsplash` = 0 (все изображения из pack)

---

## §7. ORCHESTRATOR FLOW

Без изменений v2.0 §2: Phase 0 (dry-run) → W1-W6 Task субагенты → Phase 7 (P5 + PR + auto-merge).

**Ветка:** `claude/landing-v2.1-autonomous` от main (НЕ от v2.0).

**Target HTML:** `landing_v2.1.html` (проверить что все скрипты указывают именно на v2.1).

**Tag:** `v2.1.0-landing-autonomous`.

**PR title:** «Landing v2.1 — холдинг → фонд, премиум polish, roadmap-modality»

---

## §8. WAVE_PROMPTS v2.1 — overview

Каждый WAVE_N.md обновляется с учётом:
1. Content shift (холдинг → фонд)
2. 4 system principles
3. Premium polish references
4. Roadmap modality (W3 убирает Kanban)
5. Конкретные fix'ы из §5

Детали — в файлах `WAVE_PROMPTS/W1.md ... W6.md` в пакете `cc_autonomous_package_v2.1/`.

---

## §9. ЗАПУСК ДЛЯ ПОЛЬЗОВАТЕЛЯ

```bash
# 1. Bootstrap (2 минуты)
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package_v2.1/scripts/bootstrap.sh

# 2. CC в полной автономии
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code --dangerously-skip-permissions
```

В CC вставить:
> Прочитай `.landing-autonomous/PROMPT_Landing_v2.1_AUTONOMOUS.md` и следуй §7 как orchestrator. Полная автономия. Для всех Python: `REPO_ROOT=$(pwd) python3 ...`. Action: создать ветку claude/landing-v2.1-autonomous от main, выполнить 6 волн + П5 + PR + auto-merge. Контекст: холдинг приходит к фонду за партнёрством, не LP-сайт. Target: landing_v2.1.html, tag v2.1.0-landing-autonomous.

Ожидаемое время: 8-12 часов.

---

## §10. ЧТО ВЫ ПОЛУЧИТЕ

- `landing_v2.1.html` (~6.5 MB)
- PR #12 в main с auto-merge (если CI green) или ready PR (если нет CI)
- Tag `v2.1.0-landing-autonomous`
- `.landing-autonomous/DECISIONS_LOG.md` — что CC решил сам
- `.landing-autonomous/FINAL_REPORT.md` — сводка
- `.landing-autonomous/p5_verification_report.json` — 32/32 или 31/32
- Playwright screenshots 6 штук (по одной на волну)

---

## §11. CHANGELOG v2.0 → v2.1

1. ✅ Content rewrite: холдинг идёт к фонду за партнёрством (не LP-сайт)
2. ✅ 4 системных принципа (интерактив=инфо, wow-anim, scroll-anim, load-anim) во всех 25 секциях
3. ✅ Premium polish с референсами Apple/Stripe/Linear/Arc/Vercel/Framer
4. ✅ Roadmap-modality: удалён Kanban s08, всё в Gantt s13
5. ✅ 15+ конкретных fix'ов по скринам ревью
6. ✅ FAQ перемещён в низ (перед Legal)
7. ✅ Legal flip-карточки (default=title, expand=text)
8. ✅ Term Sheet interactive (click row → reveal value+impact)
9. ✅ Team/Advisory 2-state card с gradient border
10. ✅ M2 rail drop-target + FLIP-reset + постеры в карточках
11. ✅ Tax Credits effective rate cap 85%
12. ✅ s05 Economics KPI flip-карточки
13. ✅ s05 Waterfall cascade с particles
14. ✅ M1 histogram tooltip fix + click-drill-down
15. ✅ Hero mask-gradient fix color-seam
16. ✅ Thesis asymmetric premium layout

---

**Версия:** v2.1 FINAL
**Автор:** Claude Sonnet 4.7 (Cowork) после ревью v2.0 от пользователя
**Готов к запуску:** после сборки пакета `cc_autonomous_package_v2.1/`
