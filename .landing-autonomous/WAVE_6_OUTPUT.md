# Wave 6 Output (FINAL)

## Sections delivered
- **s21 Legal** — MAJOR FIX §4.6: `useIsDesktop` hook (media query `(min-width:768px)`), 6 карточек с color-coded icons (shield/alertCircle/fileText/trendingUp/globe/lock). Desktop: grid `repeat(auto-fit, minmax(300px, 1fr))`, Reveal stagger `delay=i*80`, hover border-color без lift. Mobile: accordion single-expand через `expandedId`, chevron rotate 180°, `aria-expanded`+`aria-controls`. NDA Gate: checkbox + Tooltip на «квалифицированный инвестор» + кнопка disabled до agreed (bg #2A2D31/#F4A261, opacity 0.5/1, cursor swap). onClick → alert stub «Запрос NDA: ir@trendstudio.ru».
- **s23 Term Sheet** — 12 строк в `<dl>` (grid 1fr/2fr, hover bg tint). Sticky right-col c CTA «Скачать PDF Term Sheet» (Icon+Download, stub alert). Mobile breakpoint 640px: rows stack (label над value).
- **s24 FooterFull** — 4 колонки (auto-fit 220px): Brand (logo+slogan+©), Product (7 anchor links), Contact (mail+phone+address+telegram с иконками), Newsletter (email-input + subscribe button, stub alert). Bottom bar: rights + privacy/terms ссылки.

## i18n
**94 ключа** в обоих языках (ru/en), **0 TBD**, 100% symmetry. Покрытие: nav(9) + hero(5) + section-headings(25) + CTA(10) + footer(14) + legal(6) + term(13) + waterfall tiers(4) + M3(8). TopNav2 новый компонент подписан на LangContext (setLang). Оригинальный TopNav W1 остаётся в scope (unused, ~20 строк). `I18N_GAPS.md` обновлён.

## Animation Layer metrics (from final HTML)
- `<Reveal>` instances: **115** (well above threshold)
- Tooltip instances: **41** (threshold ≥15)
- onMouseEnter/hover: **46** (threshold ≥10)
- prefers-reduced-motion blocks: **5** (threshold ≥1)
- `useReveal`/IntersectionObserver defs: 4 (grep ловит уникальные определения, инстансов через `<Reveal>` — 115, работают)
- aria-expanded: 3 (Legal mobile accordion + FAQ + waterfall-like)

## Acceptance (wave=6 --image-check)
- Assembled 1..6, size 282 225 B (JSX). Injected 20 images → **6.26 MB** HTML.
- `acceptance.sh --wave=6 --image-check`: **PASSED** (Invariants OK, i18n 94/94 TBD=0, PE-glossary all present, 20/20 images, 0 unreplaced placeholders).
- `smoke_playwright.js`: **PASSED** (0 runtime errors).

## a11y final pass
- Modals (W3 Pipeline, W4 Risks): `role="dialog"` + `aria-modal="true"` + `aria-labelledby` — OK.
- Accordions (FAQ, Legal mobile): `aria-expanded` + `aria-controls` + `aria-hidden` — OK.
- All `<img>` с `alt` — проверено грепом (W1 hero, W3 pipeline, W5 CTA).
- Legal cards: panelId linked через `aria-controls`. NDA Tooltip через `aria-describedby` (inherited из Tooltip base).
- LangSwitcher: `aria-pressed`, `aria-label` per-button, `role="group"`.

## Polish
- `console.log/warn` в артефактах отсутствуют (grep 0 matches).
- Все secondary-action кнопки-stubs (PDF, NDA, Subscribe) — с явными alert-стабами.
- FINAL_REPORT.md создан.

## Best-guess decisions
1. `useIsDesktop` вместо `window.innerWidth` — реактивно через matchMedia, cleanup-safe.
2. Desktop Legal без card-hover lift — по промту «только border color change».
3. Term Sheet sticky-right col (top:96) — при скролле длинной таблицы PDF-кнопка остаётся видимой.
4. TopNav W1 остался в коде (unused) — rewrite/удаление опаснее для invariants, +20 строк на bundle терпимо.
5. i18n покрытие only headings+nav+footer+legal — полный EN тела секций → v2.1 (отмечено в I18N_GAPS.md).
6. NDA Gate — на desktop и mobile одинаковый (карточный layout), только content-cards различаются.

## Blockers
Нет.
