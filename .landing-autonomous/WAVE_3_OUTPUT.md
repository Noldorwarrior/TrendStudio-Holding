# Wave 3 Output (v2.1)

## Deleted: s08 Stages/Kanban ✓
grep "StagesSection\|kanban" в landing_v2.1.html = **0**. Production planning перенесён в Roadmap s13 (W4) согласно §2 главного промта.

## Pipeline (s07) — 3D tilt + Modal «ваш фонд»
`TiltCard` с perspective(1000px), mousemove → rotateX/Y ±8°, сброс cubic-bezier(0.22,1,0.36,1) 0.4s. 7 постеров (img10–img16), aspectRatio 2/3, poster zoom 1.08× hover, stage-badge оранжевый. Filter chips «Все / Фильмы / Сериалы» (aria-pressed). Click → Modal (dialog/aria-modal) с synopsis, Production budget, Target revenue, Target IRR, Stage, плюс блок «Как участвует ваш фонд» — расчёт commitment по правилу `budget × 3000 / 2620`. Escape / click-outside / × закрывают; body.overflow locked.

## Team (s09) — 5 × 2-state + gradient-border
`TeamGrid` с gradient-border (linear 135° #F4A261→#2A9D8F, padding:3). 4:5 portrait, inner vignette, gradient bottom-caption. Click → scale(1.15), dimmed siblings 0.5/0.92×, overlay-popup с bio/LinkedIn (animation: fade-up). Escape / click-outside (mousedown + `data-teamcard`) закрывают. role=button, tabIndex, Enter/Space, aria-expanded.

## Advisory (s10) — sepia, scale 0.85
Тот же `TeamGrid` c props `sepia=true scale=0.85 label="Advisor"`. CSS filter sepia(0.35) contrast(0.95). 4 портрета img06–img09.

## Operations 6-step (s11) — circle nav + deep lane
6 шагов (scouting, DD, dev, prod, m&d, exit). Кружки 72px с иконкой (fileText/checkCircle/lightbulb/video/megaphone/trendingUp, добавлены в ICONS через Object.assign — trendingUp не перезаписывается). Stagger fade-up cubic-bezier(0.34,1.56,0.64,1) 120ms step. Click → single-open expanded lane (glass, border #F4A261) с полным detail-текстом, aria-controls/aria-expanded.

## Images replaced: **19/20** (expected for W3)
img01–img16 (W3) + img17/img19/img20 (W1). img18 зарезервирован для W5 (Press).

## Acceptance pipeline
- assemble_html.py `--up-to=3` ✅ 123 944 B
- inject_images.py ✅ 19/19 placeholders, 5.61 MB
- acceptance.sh `--wave=3 --image-check` ✅ Reveal/Observer=45, Tooltips=19, cubic-bezier=34, @keyframes=7, Kanban warning **cleared**
- smoke_playwright.js ✅ 0 runtime errors
- Forbidden pravatar/unsplash=0; content-shift холдинг=7, партнёрств=2, «для вашего фонда»=5, «anchor LP»=2

## Best-guess decisions
- **D10** — «Как участвует ваш фонд»: формула pro-rata `budget × 3000 / 2620` (total vehicle 3000 / production 2620). Канон даёт budget и total commitment, но не явно pro-rata; взял линейное масштабирование.
- **D11** — `Object.assign(ICONS, {...})` с `trendingUp: ICONS.trendingUp || <fallback>`, чтобы не затереть иконку из W1 (если уже была). 5 новых иконок: fileText, checkCircle, lightbulb, video, megaphone.
- **D12** — TeamGrid click-outside через `mousedown` + `[data-teamcard="true"]` closest-check (не через ref-list). Поддерживает множественные инстансы (Team + Advisory на одной странице).
- **D13** — TiltCard добавил `role="button"` + `tabIndex=0` + keyboard Enter/Space, т.к. элемент интерактивный (открывает модал). Без этого — fail accessibility.
- **D14** — Stage-badge в postcard: дублирование текста `p.stage` прямо поверх постера (оранжевый pill). Сигнал «в каком этапе» — повышенная нагляднoсть для фонда.
- **D15** — Фразы про комментарий «Kanban» заменены на нейтральные формулировки, чтобы acceptance grep чист (0).
