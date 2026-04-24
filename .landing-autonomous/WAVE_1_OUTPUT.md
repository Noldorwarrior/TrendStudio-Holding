# Wave 1 Output — v2.2 (grep-contract enforced)

**Артефакт:** `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/.landing-autonomous/WAVE_1_ARTIFACT.jsx`
**Размер:** 1305 строк / 45 929 байт
**JSX-синтаксис:** parsed OK (babel-parser)

## Реализованные секции

- **Foundation hooks/components** — `useReveal`, `<Reveal>`, `<Tooltip>`, `<CountUp>`, `useIsDesktop`, `useFlip`, `Icon`, `PrimaryCTA`, `SecondaryCTA`, inline-viz семейство (`Sparkline`, `MiniDonut`, `MiniPie`, `MiniStackedBar`, `MiniLine`).
- **GlobalFoundation** (новый компонент-обёртка) — рендерит единый `<style>` блок с CSS-переменными, focus-visible, prefers-reduced-motion overrides, card-hover, glass, scroll-progress, `@keyframes kenburns / spin / fadeInUp / fade-up / ray-shimmer / bounce-y / grain-jitter / flow / cascade`, плюс глобальный `<svg><filter id="grain"><feTurbulence/></filter></svg>`.
- **TopNav + ScrollProgress + FooterStub** — sticky glass nav с 9 якорными ссылками и RU/EN-переключателем, фиксированный градиентный progress-bar, базовый футер с ©Холдинг.
- **s01 HeroSection** — hero image с mask-gradient (fix color-seam), ken-burns 30s infinite alternate, film-reel rotation 60s, vignette radial-gradient, film-grain overlay через `filter: url(#grain)`, staggered entrance 200/500/800/1100 ms, 3 KPI (3000 / 7 / 20.09) с CountUp + Tooltip, CTA `Обсудить партнёрство` + `Скачать investment pack`.
- **s02 ThesisSection** — заголовок «Почему партнёрство с нашим холдингом», asymmetric grid 2fr/1fr/1fr, 3 glass-morphism карточки (backdrop-filter blur 12px), drop-cap `fontSize: '4em' float: 'left'` в первой карточке, inline-viz в каждой из 3 карточек (Sparkline / MiniDonut / MiniPie).
- **s03 MarketSection** — parallax bg через `mousemove` + `transform: translate3d(...)`, 4 KPI (45 / 350 / 40 / 22) с CountUp + Tooltip + inline-виз (Sparkline / MiniPie / MiniStackedBar / MiniLine), context tooltips со стройками «что это даёт вашему фонду», «влияние на вашу IRR», «для вашего фонда».
- **App_W1** (root) — собирает GlobalFoundation + ScrollProgress + TopNav + Hero + Thesis + Market + FooterStub.

## Self-checked grep-паттерны

### Hero (§4.1) — все PASS

| Pattern | Result |
|---|---|
| `linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)` | 3 вхождения |
| `@keyframes kenburns` | 3 |
| `kenburns 30s infinite alternate` | 2 |
| `feTurbulence` | 3 |
| `<filter id="grain">` | 2 |
| `url(#grain)` | 5 |
| `spin 60s linear infinite` | 2 |
| `animationDelay: '200ms'` / `'500ms'` / `'800ms'` / `'1100ms'` | 4/4 |
| `radial-gradient(ellipse at center, transparent 40%, #0B0D10 100%)` | 2 |
| `Обсудить партнёрство` / `Скачать investment pack` | 2 / 2 |
| `<CountUp` / `<Tooltip` | 4 / 4 (в Hero 3+3; остальные — в Thesis/Market) |

### Thesis (§4.2) — все PASS

| Pattern | Result |
|---|---|
| `Почему партнёрств` (prefix) | 2 |
| `backdrop-filter` / `backdropFilter blur` | 6 вхождений |
| `gridTemplateColumns.*'2fr 1fr 1fr'` | 2 |
| `fontSize: '4em'` + `float: 'left'` drop-cap | 2 / 1 |
| inline `<svg>` (mini-viz в 3 карточках) | 5 в файле |

### Market (§4.3) — все PASS

| Pattern | Result |
|---|---|
| `mousemove` + `translate3d` | 5 / 6 |
| `CountUp` для 45/350/40/22 | 4 |
| inline `<svg>` в KPI | 5 |
| context-tooltip phrases (что даёт / влияние на IRR / для вашего фонда) | 4 |

### MUST_NOT (все 0) — PASS

`LP-фонд российского кино`, `Запросить LP-пакет`, `Скачать memo`, `Почему ТрендСтудио`, `Три принципа`, `"Рост рынка"` (card title), `для расчёта целевой доходности фонда` — каждый 0 вхождений.

### Системные §3.2 — PASS с запасом

| Pattern | Count | Target W1 |
|---|---|---|
| `холдинг` (lowercase) | 8 | ≥ 4 |
| `партнёрств` (root) | 7 | ≥ 3 |
| `ваш фонд` | 14 | ≥ 2 |
| `investment pack` | 3 | ≥ 1 |

## Открытые вопросы / заметки

1. Комментарии с «запрещёнными» строками v2.1 (`Почему ТрендСтудио`, `Три принципа`, `для расчёта...`) были заменены на нейтральные формулировки, чтобы не проваливать grep на `<script type="text/babel">` блоке финального HTML.
2. Образы `__IMG_PLACEHOLDER_img17/19/20__` оставлены как строгие плейсхолдеры — inject_images.py заменит их на base64 после волны.
3. Все `animationDelay` значения указаны **как строки** (`'200ms'`, `'500ms'`, `'800ms'`, `'1100ms'`) чтобы гарантированно пройти grep `animationDelay.*200` и т.д.
4. Grain-фильтр реализован как **один глобальный** SVG в GlobalFoundation (применяется через `filter: url(#grain)` в Hero и Market overlay divs — нет дублирования).
5. Syntax-check (babel-parser) пройден. Babel standalone в HTML должен транспайлить без ошибок (React UMD + Tailwind CDN + Recharts подгружаются в assemble_html.py).

**Готов к assemble_html + acceptance.sh --wave=1 --grep-contract.**
