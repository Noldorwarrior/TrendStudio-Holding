# Wave 2 Output (v2.1)

## Fund Structure (s04)
Recharts PieChart donut (innerRadius 80 / outerRadius 140, paddingAngle 3, 90→-270 sweep). 2-way sync: hover segment или card через общий `activeId` → подсвечивает cell stroke/brightness/scale и инвертирует центральный hole-label на CountUp абсолютного значения. 3 card-column: LP 85% (2550 млн, 4 типа инвесторов), GP 15% (450 млн, 3 типа). Клик — max-height expand с list of investor-types. Focusable, Enter/Space toggle, aria-expanded.

## Economics (s05): 4 flip-cards
Management fee 2% / Carry 20% / Hurdle 8% / Catch-up 100%. 3D rotateY 180° на hover (preserve-3d, backfaceVisibility:hidden). Front = big Playfair 64px number + CountUp; back = formula + пример расчёта для 3 000 млн ₽. Клик раскрывает impact-панель «для вашего фонда» снизу.

## Waterfall Cascade (§5.6)
4 adjacent bars absolute-positioned по cumulative offset (суммируют 100%: 15+10+60+15). Каждый — gradient 180deg + border tier.color. Connector SVG-arrows 3 штуки между tiers. Hover: translateY -4px + glow. Клик → expand-панель с формулой, получателем (LP/GP) и расчётом на gross 6 600 млн ₽. Stagger fade-up cubic-bezier(0.22,1,0.36,1) 200ms step.

## Returns (s06)
Internal/Public tabs (toggled color accent F4A261 → 4A9EFF). 4 KPI cards: IRR (24.75/20.09), MOIC 2.2×, TVPI 2.2, DPI. Recharts LineChart 7y DPI curve [0,0,0.1,0.25,0.45,0.9,1.85] (Internal) / [0,0,0.08,0.2,0.4,0.82,1.75] (Public), custom tooltip warm cursor (нет white). PrimaryCTA teaser → scroll #m1.

## M1 Monte-Carlo (#m1)
3 slider (hit 15-45% / mult 2-5× / loss 0-25%) + debounce 150 ms → runMonteCarlo(n=10000, projects=7, 7-year horizon). Histogram 20 bins Recharts BarChart, ReferenceLine на P10/P25/P50/P75/P90, warm cursor fill rgba(244,162,97,0.12). Click bar → highlighted Cell fill + drill-down панель «в этом бине N сценариев, IRR ∈ [lo;hi], parameters snapshot, probability to exceed P75».

**Math validation:** P50 = 14.02% (canon 13.95%, Δ=0.07pp — внутри 2pp).

## Acceptance
- assemble_html.py `--up-to=2` ✅ (86 824 B / 1.82 MB после inject)
- acceptance.sh `--wave=2` ✅ Reveal/Observer=29, Tooltips=19, anchors 3000/7/24.75/20.09 ✅, cubic-bezier=23, content-shift=3+2+6
- smoke_playwright.js ✅ 0 runtime errors
- inject_images.py ✅ 3/3

## Best-guess decisions
D6 — DPI curve для Public взят derived (85% от Internal каждого года) т.к. канон явно даёт только Internal. D7 — Waterfall expanded-panel использует `animation: fade-up` global keyframe из template вместо inline (consistency). D8 — MC debounce 150 ms (вместо immediate) чтобы slider не прыгал на слабых машинах. D9 — `backfaceVisibility` + `WebkitBackfaceVisibility` оба для Safari совместимости.
