# Wave 1 Output (v2.1)

## Foundation
useReveal, Reveal, Tooltip, CountUp, Icon+ICONS (5 glyphs), useIsDesktop, **useFlip** (NEW v2.1 — FLIP helper для будущего M2 reset в W5), PrimaryCTA / SecondaryCTA, mini-viz: Sparkline, MiniDonut, MiniPie, MiniStackedBar, MiniLine.

## Sections
- **s00** — TopNav (9 nav-links + LangSwitcher RU/EN), ScrollProgress (passive listener), FooterStub (#s25).
- **s01 Hero** — hero_bg mask-gradient + ken-burns 30s, film-reel reel-spin 60s screen-blend 25%, hero-vignette, hero-ray shimmer 8s, hero-grain (filter:url(#grain)). H1 «ТрендСтудио» Playfair clamp(56-96px). Tagline v2.1 holding→fund. 3 KPI (3000 / 7 / 20.09%) — CountUp + Tooltip. 2 CTA: «Обсудить партнёрство» (scroll #s22), «Скачать investment pack» (alert stub). Chevron bounce-y. animationDelay cascade 200/500/800/1100/1400 ms.
- **s02 Thesis** — «Почему партнёрство с нами», grid 2fr/1fr/1fr (mobile stack). Карточка 1 large + drop-cap + sparkline релизов. Карточка 2 shield + mini-donut (348/10000/32). Карточка 3 sparkles + mini-pie (4 жанра). Click → aria-expanded toggle, details panel.
- **s03 Market** — parallax mousemove на banner_market, gradient overlay, grain overlay. 4 KPI: BO 45 млрд + sparkline; Budget 350 + mini-pie; Subsidy 40% + stacked-bar; OTT 22% + mini-line OTT vs TV.

## v2.1 content shift
«Кинопроизводственный холдинг», «якорного партнёра-фонд», «Обсудить партнёрство», «Скачать investment pack», «Почему партнёрство с нами», «для вашего фонда» — применены. LP-пакет / LP-фонд российского кино удалены (0 вхождений).

## Premium polish
mask-gradient, ken-burns, reel-spin, ray-shimmer, film-grain, glass (backdrop-filter), card-hover cubic-bezier, drop-cap Playfair 4em, parallax.

## Acceptance pipeline
- assemble_html.py `--up-to=1` ✅ (40 236 B)
- inject_images.py ✅ 3/3 (img17, img19, img20)
- acceptance.sh `--wave=1 --image-check` ✅
- smoke_playwright.js ✅ 0 runtime errors
- Markers: content-shift=7, animationDelay=10, cubic-bezier=16, Reveal/IO=8, forbidden=0.
