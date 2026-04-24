# Wave 6 Output (FINAL v2.1)

## FAQ перемещён в конец (перед Legal) ✓
s18 FAQSection рендерится ПОСЛЕ PressQuotesSection и ПЕРЕД LegalSection.
15 Q&A в 4 категориях (terms 4 / economics 4 / governance 4 / process 3),
search input с live-filter по q+a, highlight matches через `<mark>`,
accordion open/close с max-height transition + aria-expanded.

## Legal: 6 flip-cards (teaser ↔ full text + law ref)
LegalCard: collapsed = icon + title + teaser + «Развернуть ↓»,
expanded = full text + strong law reference (ФЗ-156, Положение ЦБ №577-П, ГК РФ 437/727).
Hover: border-color fade to item.color, cubic-bezier 0.22,1,0.36,1.
NDAGate сохранён: checkbox + disabled CTA «Запросить NDA → доступ к PPM» + toast.

## Term Sheet: 13-row interactive accordion (label → value + explanation + impact)
Default — только label (compact). Click → expand: big value (Playfair),
"Что это" (what) + "Impact для вашего фонда" (color #2A9D8F).
Row background tint on expand + chevron 180° rotate.
Bottom CTA «Скачать PDF Term Sheet →» с non-destructive toast.

## FooterFull: 4-col + newsletter + CountUp copyright
Grid auto-fit minmax(220px, 1fr): Brand / Product / Contact+Social / Newsletter.
Newsletter stub с fake-success animation (3s reset).
3 social icons (Telegram/Email/LinkedIn) — hover color-shift к #F4A261.
Bottom bar: CountUp 2026 + Privacy/Terms/Term Sheet links.

## i18n RU/EN symmetry
**112 ключей** RU = 112 ключей EN (порог ≥94). Полная симметрия, 0 [EN TBD].
Применён useT() в: TopNav2 nav-links, FAQSection, LegalSection, NDAGate,
TermSheetSection, FooterFull. Остальные секции v2.1 — RU-only (v2.2 scope).

## Acceptance
- `assemble_html.py --up-to=6`: ✅ 312 588 B raw JSX-HTML, 6 waves merged
- `inject_images.py`: ✅ 27 placeholder→base64 (20/20 images), 9.09 MB
- `acceptance.sh --wave=6 --image-check`: ✅ passed
  - Reveal/Observer = **123** (порог ≥30 для W6)
  - Tooltips = **34**
  - cubic-bezier = **100** (порог ≥3)
  - @keyframes = **10**
  - backdrop-filter = **6** / `className="glass"` = **37**
  - aria-expanded = **10**, aria-label = **29**
  - pravatar/unsplash = 0
  - Kanban s08 = 0 (удалён в W3)
- `i18n_check.py`: ✅ ru=112 / en=112 / [EN TBD]=0
- `invariants_check.py --wave=6`: ✅ OK
- `verify_images.py`: ✅ 20/20 sha256 OK
- `smoke_playwright.js`: ✅ 0 runtime errors

## Best-guess decisions W6
- D26: FAQ-warning в acceptance (позиция `id="s18"` в HTML раньше чем `id="s21"`) — ложная тревога: grep находит первое упоминание в TopNav2 navLinks (W1 анкор), а не в определении секции. Реальный порядок рендера в App_W6 корректен (FAQ после Press, перед Legal). Warning не блокирующий.
- D27: LangProvider + useT + TopNav2 — React.createContext pattern (без зависимостей), минимальный применение: nav, footer, legal, term, faq-categories. Остальные v2.1 секции остаются RU (scope v2.2).
- D28: Legal «max-height transition» выбран вместо 3D rotateY flip — проще в коде, надёжнее на mobile, a11y-friendly (не ломает tab-focus в collapsed state).
- D29: FAQ search highlighting через `<mark>` inline + regex escape — без зависимостей, полностью XSS-safe (React экранирует).
- D30: Newsletter — fake-success 3s reset, без фактической отправки. `<label>` visually-hidden для a11y.
