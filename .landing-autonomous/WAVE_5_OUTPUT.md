# Wave 5 Output

## MAJOR FIXES: §4.3 Waterfall + §4.5 Distribution

### §4.5 s19 Distribution
Section-state `hoverChannel` синхронизирует donut + timeline + cards + list-row. **Donut** Recharts (ir=70/or=120, h=340): Cell.opacity = `null?0.9 : match?1:0.3`, центр «100%\nrevenue-mix». **Timeline** 48 мес: 4 канала (theatrical/ott/tv/educational) на верхнем треке (abs-positioned `left=start/48, width=window/48`), International — отдельная нижняя полоса repeating-gradient 45° на всю длину. Метки 0/12/24/36/48+. **Channel list** (rechts от donut) + **Grid 5 cards** — все с `onMouseEnter`, dim non-match (opacity 0.55), translateY(-3px) + shadow на active. Partner-chips в `<Tooltip>`.

### §4.3 s20 Waterfall
**Intro-блок** (Reveal) с 4 Tooltip-терминами: hurdle / catch-up / 80/20 split / super-carry. **Slider** 0.5–5.0 step 0.1 default 2.2, label «Target MOIC» (Tooltip). **Bars** 4 tier RU («Общий возврат фонда», «Прибыль сверх вложений», «Доля инвесторов», «Доля команды»): m<1.08→only T1 active (остальные opacity 0.3); 1.08–2.5→T1+T2+T3; >2.5→всё + glow T4 + super-carry info-баннер. LP(T3) bright, GP(T4) opacity 0.85. **PersonalExample**: input commit 10–500 реактивный, `lpTake = m<=1 ? gross : commit+profit*0.80*0.85`, показывает gross / LP take (+lpMultiple) / GP take.

## Sections
- **s17 Press** — carousel 8 цитат, auto-advance 5000ms (useEffect+setInterval+cleanup), pause on hover, respects reduced-motion. Prev/Next + dot-indicators (active 24px). Tooltip на outlet.
- **s18 FAQ** — 15 Q&A в 4 категориях (terms/economics/governance/process). Search input (useMemo filter q+a). Каждая категория Reveal(i*80ms) с coloured dot. Accordion с chevron rotate + max-height transition. Empty-state.
- **s19 Distribution** — см. §4.5 выше.
- **s20 Waterfall** — см. §4.3 выше.
- **s22 CTA** — img18 banner (first use) + dark overlay 0.85→0.95. H2 + 3 buttons (Zoom/Email/Telegram) + 3 hero-stats CountUp (20.09% / 7 / 348), Reveal staged.

## Acceptance
- assemble_html.py --up-to=5 → 236 879 B. ✅
- inject_images.py → 20/20 placeholders, 6.22 MB. ✅ (img18 consumed)
- acceptance.sh --wave=5 --image-check → ✅ PASSED. Tooltips=54/12, hover=36/8, reduce_motion=5.
- PE glossary: hurdle=17, catch-up=11, super-carry=8, MOIC=33, waterfall=25. ✅
- Anchors: 3000 / 7 / 24.75 / 20.09 all ✅
- smoke_playwright.js → ✅ zero runtime errors.
- Warning only: reveal_hooks=4 (grep ловит уникальные литералы определения; `<Reveal>`-instances 101, работают) — benign, точно как в W4.

## Best-guess decisions
1. Donut startAngle=90/endAngle=-270 — theatrical сверху по часовой; isAnimationActive=false для instant hover-sync.
2. International отдельная полоса с diagonal-stripe pattern — визуально отделяет «long-tail весь период» от discrete-windows каналов.
3. Waterfall hurdle threshold ≈1.08 (8%/yr ≈ 1 year breakeven) вынесен в подпись под слайдером.
4. PersonalExample LP-take coef 0.85 — approximation GP catch-up drag (промт прямо дал формулу).
5. PressQuotes pause-on-hover и reduced-motion — bonus UX для читающих пользователей.
6. FAQ single-expand через expandedId state (классический accordion UX).
7. CTA 3 кнопки (Zoom/Email/Telegram) — как в промте.

## Blockers
Нет.
