# Wave 5 Output (v2.1)

## Sections
- **s17 Press Quotes** — 8-quote carousel, auto-advance 5 сек, pause on hover, prev/next buttons, dot indicators с active-pill (32px), fade-up animation при смене, Tooltip на outlet (info)
- **s19 Distribution** — donut (SVG arcs, hover-scale 1.04, opacity dim) + 5 channel cards (hover-sync по activeId) + release-windows timeline (51 мес scale) + 14 partner chips с Tooltip
- **s20 Waterfall Full** — sticky-pin 200vh, scroll-progress→multiplier 0.5×→5×, intro block с 5 Tooltip (hurdle/catch-up/80-20/MOIC/super-carry), 4 tier cards с particles flow-animation, LP example с editable personalCommit
- **s22 CTA Premium** — img18 bg opacity 0.25, animated gradient mesh (mesh-shift 18s), film-grain, 3 CTAs (shimmer ::before), toast feedback (fade-up), 3 KPI CountUp (20.09% / 7 / 348)

## FAQ НЕ рендерен (перемещён в W6 согласно §5.18 v2.1)

## Acceptance
- `assemble_html.py --up-to=5`: OK, 249 392 B raw JSX-HTML
- `inject_images.py`: ✅ 27 placeholder→base64 replacements (включая img18 впервые), финал 9.03 MB
- `acceptance.sh --wave=5 --image-check`: ✅ Reveal/Observer=104, Tooltips=34, cubic-bezier=69, @keyframes=10
- Кастомные проверки:
  - FAQSection в W5 артефакте = 0 ✅
  - «партнёрств» в HTML = 5 ✅ (требовалось ≥5)
  - cubic-bezier = 69 ✅ (требовалось ≥5)
  - PE-glossary: hurdle=15, catch-up=10, super-carry=9, MOIC=27, waterfall=19 ✅
  - `__IMG_PLACEHOLDER_` остатков = 0 ✅
  - base64 images = 27 (20 уник. × дубли в CTA) ✅
- `smoke_playwright.js`: ✅ 0 runtime errors

## Best-guess decisions
- D20: W5 использует scroll-pinned sticky-container (200vh section) для Waterfall — multiplier детерминирован от sectionRef.boundingClientRect, без framer-motion (pure React hook)
- D21: Press carousel pause-on-hover (вместо pause-on-click) — Apple/Stripe референс, 5s auto-advance, reset interval только при изменении paused-state
- D22: Distribution timeline масштаб 51 мес (int. sales 0+48), hover-sync двусторонний (donut↔card↔timeline-row)
- D23: CTA button onClick — не alert (которого блокирует Playwright), а inline toast с auto-dismiss 2.8s (реальный контакт-link в state)
- D24: Partner chips — `<Tooltip>` обёртка напрямую, опираемся на foundation-компонент (W1 §1.3), chip имеет cursor:help для a11y-хинта
- D25 (script fix): acceptance.sh строки 73-74 — grep-pipeline падал под `set -euo pipefail` когда LegalSection/FAQSection отсутствуют (они в W6). Добавлен `|| true` — minimal, безопасно, не ломает W6 проверку
