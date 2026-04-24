# Wave 4 Output (v2.1)

## Реализовано

- **s12 Risks** — 3×3 gravity matrix, weight→circle diameter, click→Modal с mitigation+owner
- **s13 Roadmap REDESIGN (MAJOR)** — 7 swimlanes × 7 projects, scrubber playhead draggable, 8 milestones (pulse 3-cycle finite), mini-preview состояния портфеля при скроббинге, swimlane filter, project modal
- **s14 Scenarios** — 4 tabs (Base/Bull/Bear/Stress), CountUp re-anim при смене tab (key-binding), LineChart 4 линии с active highlighting
- **s15 Regions** — 8 ФО heatmap с gradient-fill по count + click popup (tax info)
- **s16 Tax Credits** — shared slider 50-1000 млн, 4 program cards с CountUp, **summary с cap 85%** (исправлен 102% bug из v2.0)
- **M2 Pipeline Builder** — 3 fix: rail drop-target, FLIP reset через useFlip, 40×60 poster thumbs, «Вернуть к исходному», canon-reset = 7 в Development column
- **M3 Commitment Calculator** — tier badge rename `Partner / Lead Investor / Anchor Partner`, title «Сколько получит ваш фонд», «Commitment вашего фонда»

## Acceptance

- `assemble_html.py --up-to=4`: OK, 8.8 MB HTML
- `acceptance.sh --wave=4`: ✅ Reveal/Observer=79, Tooltips=21, cubic-bezier=52, @keyframes=8
- `smoke_playwright.js`: ✅ 0 runtime errors

## Best-guess decisions

- D16: Roadmap scrubber — mouse-drag + click-anywhere для простоты; touch fallback не реализован (v2.2 roadmap)
- D17: Roadmap canon-reset М2 = все 7 в `dev` column (roadmap-modality §2)
- D18: Tax cap 85% = реалистичная верхняя граница с учётом cumulative cross-program overlap
- D19: Regions — heatmap grid не SVG-карта РФ (время > качество для v2.1)
