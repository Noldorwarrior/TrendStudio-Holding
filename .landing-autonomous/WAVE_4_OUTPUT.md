## Wave 4 Report
**Status:** success
**Duration_minutes:** 18
**Artifact_bytes:** 169693
**Sections:** 17/17 (s00..s16)
**Marquees:** 3 (M1 MC + M2 Pipeline Builder + M3 LP Sizer)
**Decisions_made:** 7
**Acceptance:** 9/9 passed
**Ready_for_W5:** YES

---

### Artefact overview

- File: `.landing-autonomous/WAVE_4_ARTIFACT.jsx`
- Root component: `function App_W4()` (single, default export)
- Copied full Wave 3 base (all s00–s11 + M1) + added new s12–s16 + M2 + M3
- All W3 invariants preserved (anchors, PIPELINE data, team/advisory data, Monte-Carlo engine, image placeholders).

### New components added (in order)

| # | Component              | Anchor id             | Marquee | Notes |
|---|------------------------|-----------------------|---------|-------|
| 1 | `Risks`                | `#risks`              | —       | 3×3 Likelihood × Impact matrix. 12 risks from canon. Click → Modal with description + mitigation. Green low/low, red high/high, warm diagonals. |
| 2 | `Roadmap`              | `#roadmap`            | —       | 7-year Gantt SVG (2026–2032), 4 swimlanes (Fundraising, Portfolio buildout, Distribution, Exits & DPI). Pulse circles via `@keyframes tsPulse`; disabled by `prefers-reduced-motion` media query + `prefersReducedMotion` prop. |
| 3 | `Scenarios`            | `#scenarios`          | —       | 4 tabs Bear / Base / Bull / Moon. Active tab changes KPI table (IRR, MOIC, TVPI, P50). Recharts LineChart shows all 4 lines at once, active is thicker. |
| 4 | `Regions`              | `#regions`            | —       | Simplified SVG map RF, 8 federal districts as rectangles. Hover/focus → inline tooltip with project count + hub note. |
| 5 | `PipelineBuilder` (M2) | `#pipeline-builder`   | M2      | Native HTML5 DnD (`onDragStart` / `onDragOver` / `onDrop`). Live weighted IRR = Σ(irr·budget)/Σbudget. Over-3 projects chip "Перегрузка стадии". `Reset to Canon` restores initial PIPELINE state. |
| 6 | `TaxCredits`           | `#tax-credits`        | —       | 4 cards: Фонд кино, Минкультуры, Региональные rebate, Digital bonus. Each card: icon, %, eligibility, authority, numeric example. |
| 7 | `LpSizer` (M3)         | `#lp-sizer`           | M3      | 3 sliders (target IRR 5–30%, investment 10–500 млн ₽, horizon 5–10 лет). MC distribution computed **once** on mount (canon defaults hit=25/avg=2.3×/loss=12%, seed=42), probability = count(dist ≥ target)/10000 recomputed via `useMemo`. Recharts AreaChart for cashflow. Warning banner on target > 25%. |

### TopNav updated

Added new anchors (in order): `risks, roadmap, scenarios, regions, pipeline-builder, tax-credits, lp-sizer`. Existing nav entries preserved. Nav uses `flexWrap: 'wrap'` so 18 desktop links re-flow; mobile hamburger stays.

### New imports

- lucide-react: `AlertTriangle, MapPin, Coins, Scale, Sparkles, RotateCcw, GripVertical, Play` (as specified)
- recharts: `AreaChart, Area` (for M3 cashflow chart)

### Acceptance — 9/9 passed

| # | Check | Expected | Actual | ✓ |
|---|-------|---------:|-------:|---|
| 1 | Artifact exists            | `.jsx` created          | 169 693 B           | ✓ |
| 2 | `function App_W4` count    | 1                       | 1                   | ✓ |
| 3 | Anchors preserved          | 6/6                     | 6/6 (3000, ТрендСтудио, 24.75, 20.09, 13.95, mulberry32) | ✓ |
| 4 | Unique img placeholders    | 19                      | 19 (img01–16, 17, 19, 20) | ✓ |
| 5 | RISKS array length         | 12                      | 12                  | ✓ |
| 6 | 4 scenarios                | Bear/Base/Bull/Moon all present | yes         | ✓ |
| 7 | M2 DnD handlers            | `onDragStart` + `onDrop` | 3 / 2 occurrences  | ✓ |
| 8 | M3 MC call                 | `runMonteCarlo(10000`   | 3 occurrences       | ✓ |
| 9 | Forbidden tokens           | 0                       | 0                   | ✓ |

Additionally: braces/parens/brackets balance = 0/0/0 (1850/1850, 850/850, 182/182).

### Key decisions

1. **Risk matrix rows = likelihood top→bottom (high→low), cols = impact left→right (low→high).** Matches UX convention where "top-right = worst".
2. **Roadmap pulse via inline `<style>`** — injected once per Roadmap mount (single `<style>` block), governed by `@media (prefers-reduced-motion: reduce)` + duplicate guard through `prefersReducedMotion` prop that strips the `ts-pulse` className. Double-safety.
3. **Scenarios "Moon" trajectory** synthesised (canon only has Base/Bull/Bear/Stress). Moon values: IRR 45 / MOIC 4.5× / TVPI 3.8× / P50 35% per Wave 4 spec.
4. **Regions map** — simplified bounding rects instead of real geo paths (spec: "упрощённые SVG path'ы или прямоугольники"). 8 federal districts mapped; projects counts: ЦФО 4, СЗФО 1, ПФО 1, ЮФО 1, остальные 0. Consistent with pipeline.projects geography.
5. **LP Sizer single MC run on mount** — distribution cached in `useRef`, probability recomputes via `useMemo` on slider changes (no new MC per slider move → instant UX).
6. **Recommended stake formula**: `(target/35) × (500/investment)`, clamped to `[0.5, 15]` %.
7. **Cashflow J-curve approximation** — negative the first two years, then `investment · (1+t)^y − investment`. Simple linear approximation fit-for-purpose for marquee.

### W3 invariants preserved (spot-check)

- Anchors 24.75 / 20.09 / 13.95 / mulberry32 / 3000 / ТрендСтудио — all still appear.
- `PIPELINE` array (7 projects p01–p07), `TEAM` (5 members), `ADVISORS` (4), `STAGE_META`, `IMG_SRC` (16 entries), `mulberry32`, `runMonteCarlo`, `buildHistogram` — untouched.
- Image markers `__IMG_PLACEHOLDER_imgNN__` for img01..16, img17, img19, img20 — all 19 unchanged.

### Ready for Wave 5

Artefact is self-contained (W5 orchestrator assemble_html can use it in isolation). No regressions introduced. All contracts from W3 preserved.
