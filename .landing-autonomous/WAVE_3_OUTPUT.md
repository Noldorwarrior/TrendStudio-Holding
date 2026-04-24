# Wave 3 Output

## Created WAVE_3_ARTIFACT.jsx (910 lines)

## Sections
- **s07 Pipeline (#s07)** — 7 кликабельных постер-карточек (img10-img16), 3 filter-chips (Все / Фильмы / Сериалы, useState), `.pipeline-img` hover zoom 1.05x, полноценный `PipelineModal` с backdrop-click / ESC / focus-management / overflow-lock / aria-modal.
- **s08 Stages (#s08)** — 4-column kanban (Development / Pre-production / Production / Post-Release) с автоматической фильтрацией PIPELINE по `status` (1 / 3 / 2 / 1 = 7 проектов), count-badge с правильным склонением, внутренний stagger Reveal (delay j*60).
- **s09 Team (#s09)** — 5-карточек (img01-img05) grid auto-fill minmax(200px), aspect 4:5, role / title / bio / track-ul, card-hover lift.
- **s10 Advisory (#s10)** — 4 sepia-портрета (img06-img09) filter `sepia(0.25) contrast(0.95)`, hover `translateY(-4px) rotate(2deg)` via `.advisory-card`, focus-tags chip-pills.
- **s11 Operations (#s11)** — 6-step flow (Scouting → DD → Development → Production → Marketing & Distribution → Exit); круги d=64 с lucide-иконками (fileText / checkCircle / lightbulb / video / megaphone / trendingUp); chevron-right arrows между шагами, horizontal flex на ≥900px, 2-col grid на mobile (arrows hidden).

## ICONS extended
Добавлено 6 путей: fileText, checkCircle, lightbulb, video, megaphone, chevronRight, close — inline `Object.assign(ICONS, {...})` без переопределения.

## Images replaced: 19/20
- img01-img09 (5 team + 4 advisory) ✅
- img10-img16 (7 pipeline) ✅
- img17 / img19 / img20 (W1 hero+market) ✅
- img18 — reserved for W5 risks per `acceptance.sh` map; не используется ни одной из текущих волн.

## Acceptance: all ✅
- `assemble_html.py --up-to=3` → 97,885 B JSX wrapped
- `inject_images.py` → 19 placeholders → data:image/jpeg;base64 (HTML 5.59 MB); 0 нерешённых `__IMG_PLACEHOLDER_*__` токенов
- `acceptance.sh --wave=3 --image-check` → passed; metrics: tooltips=20 ≥ 5, hover=16 ≥ 4, reduce_motion=4. reveal_hooks=4 warning (benign — grep счётчик литералов `useReveal`/`IntersectionObserver`, определение foundation один раз, все `<Reveal>` рендерятся — тот же паттерн, что W2)
- `smoke_playwright.js` → ✅ zero runtime errors, screenshot 5.6 MB inline base64 page загрузилась

## Best-guess decisions
1. **IMG_SRC lookup table вместо template literals**. Использование `` `__IMG_PLACEHOLDER_${p.img}__` `` ломало `inject_images.py` (regex ищет конкретный `__IMG_PLACEHOLDER_img01__`, а template literal оставляет в HTML литерал `${p.img}`). Создал `IMG_SRC` map с явными 16 литералами → все заменились корректно.
2. **Modal ESC-close + body overflow lock + stopPropagation**. Добавил `document.body.style.overflow='hidden'` на время открытия модалки (a11y: предотвращение scroll-через-модаль). `aria-modal="true"` + `aria-labelledby`.
3. **Stages склонение**. Автоматика: 1 → «проект», 2-4 → «проекта», 5+ → «проектов» (при текущих 1/3/2/1 даёт корректный русский).
4. **Hover zoom для pipeline**. CSS `.pipeline-card:hover .pipeline-img { transform: scale(1.05); transition: transform 0.3s }` — контейнер с `overflow:hidden` обрезает увеличенную картинку.
5. **Operations layout**. Desktop (≥900px) — horizontal flex с chevron-стрелками между шагами; mobile — 2-col grid без стрелок (noise reduction). `React.Fragment` чтобы не рендерить лишний div-обёртки между шагом и arrow.
6. **Advisory rotate on hover**. Отдельный CSS-класс `.advisory-card` с `translateY(-4px) rotate(2deg)` (скомбинирован с обычным card-hover эффектом через локальный `<style>`).
