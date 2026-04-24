# Wave 2 Output

## Sections
s04 Fund Structure (#s04) / s05 Economics (#s05) / s06 Returns (#s06) / M1 Monte-Carlo (#m1)

## Artifact
`.landing-autonomous/WAVE_2_ARTIFACT.jsx` — 744 lines. Reuses W1 foundation (useReveal / Reveal / Tooltip / CountUp / Icon / ScrollProgress / TopNav / HeroSection / ThesisSection / MarketSection / FooterStub) — no duplication. Recharts destructured with `Tooltip: RechartsTooltip` to avoid clash with W1 Tooltip.

## Acceptance
- `assemble_html.py --up-to=2` — 63,908 B JSX wrapped  ok
- `acceptance.sh --wave=2` — invariants ok, animation layer ok (tooltips=20 ≥ 3, hover=10 ≥ 3, reduce_motion=4 ≥ 1). One benign warning `reveal_hooks=4 < 5` — the grep counts literal `useReveal`/`IntersectionObserver` tokens, and foundation is defined only once; every `<Reveal>` call still works. Anchors 3000/7/24.75/20.09 all present.
- `inject_images.py` — 3/3 placeholders replaced (img17/19/20 from W1 hero/market).
- `smoke_playwright.js` — ok, zero runtime errors, screenshot saved.
- Grep counts: Reveal=62, CountUp=11, Tooltip=14, prefers-reduced-motion=4 — all above thresholds.

## P50 validation
actual P50 = **14.06%** at defaults (hitRate=0.30, avgMultiple=3.2, lossRate=0.10, projects=7) — within target band [12, 16], close to 13.95% canon. Tuned `middle` distribution from `1 + rnd*0.8 + 0.3` (baseline 1.3-2.1) → `2.0 + rnd*1.0` (2.0-3.0). Stability across 5 runs: 13.99-14.07%. Other percentiles at defaults: P10≈10.4, P25≈12.4, P75≈15.4, P90≈16.2, mean≈13.6.

## Notes
- s06 Returns: MOIC/TVPI/DPI identical across internal/public per canon (only IRR and DPI-curve shape differ). LineChart animates on tab change via `key` on CountUp.
- s05 Waterfall uses 4-tier SVG-like flexbox bars (ROC 45 / Hurdle 25 / Catch-up 10 / 80-20 20) — not Recharts, per simplicity brief.
- M1 histogram: 20 bins over [-20, +60]% IRR range, Recharts BarChart colour #2A9D8F.
- Debounce on sliders: 150 ms via useRef cleanup + useEffect dep array.
- Run button: 500 ms spinner disable lock, forces fresh MC recompute.
