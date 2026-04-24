# Wave 1 Output

## Created
- `.landing-autonomous/WAVE_1_ARTIFACT.jsx` — 691 lines
- `landing_v2.0.html` — 1.76 MB (1,847,113 B)

## Foundation components defined
- `useReveal(threshold=0.15)` — IntersectionObserver hook с support `prefers-reduced-motion`
- `Reveal` — wrapper для fade+slide reveal (opacity 0→1, translateY 32px→0, ease-out 0.6s, delay param)
- `Tooltip` — span с hover/focus popover (280px, aria role="tooltip", keyboard-accessible via tabIndex=0)
- `CountUp` — requestAnimationFrame-анимация числа от 0 до end, easeOutCubic, `decimals` + `suffix` + `prefix`
- `Icon` + `ICONS` — SVG-wrapper с путями lucide (trendingUp, shield, sparkles, chevronDown)
- Global `<style>` блок: focus-visible outline, prefers-reduced-motion, .card-hover, .bounce-y keyframe, .scroll-progress, tailwind-utility стабы (absolute/inset-0/object-cover/w-1/3 и т.п.)

## Sections rendered
- **s00** TopNav (sticky, 9 nav-links, логотип «ТрендСтудио», RU/EN switcher) + ScrollProgress bar (fixed top 3px) + FooterStub (#s25, © 2026)
- **s01 Hero** (`#s01`, min-h 100vh): img19 bg (opacity 0.45) + img20 accent (right 1/3, mixBlendMode screen), gradient overlay, h1 Playfair clamp(56–96px), tagline с якорями «3 000 млн ₽ / 7 лет / 20–25%», 3 CountUp KPI, 2 CTA (primary «Запросить LP-пакет» + outline «Скачать memo»), chevron-down .bounce-y
- **s02 Thesis** (`#s02`): 3 карточки (Рост рынка / Институциональная дисциплина / Портфельный подход) с stagger Reveal delay={i*120}, card-hover эффект
- **s03 Market** (`#s03`): img17 bg (opacity 0.2) + gradient overlay, 4 KPI count-up (45 млрд ₽ BO / 350 млн ₽ бюджет / 40% господдержка / 22.0% OTT-рост)

## Acceptance
- ✅ `assemble_html.py --up-to=1` → 24,071 B JSX wrapped
- ✅ `inject_images.py` → 3/3 images replaced (img17, img19, img20), HTML 1.76 MB, sha256 verified
- ✅ `acceptance.sh --wave=1 --image-check` → passed (Invariants OK, все 4 якоря 3000/7/24.75/20.09 резерв под W2+)
- ✅ `smoke_playwright.js` → no runtime errors, full-page screenshot 948 KB

## Infra fixes applied (minimal, shared across all waves)
- `assemble_html.py`: зафиксирована версия `recharts@2.12.7` + добавлен `prop-types@15.8.1` — Recharts@latest (3.8.1) требует React 19 и падал с `Cannot read properties of undefined (reading 'ForwardRef')` на старте под React 18 UMD.
- `smoke_playwright.js`: добавлен BENIGN-фильтр для трёх не-фатальных сообщений (Babel standalone 500KB note, Tailwind CDN production note, React DevTools suggestion) — согласуется с прецедентом v1.0 (commit 2cafad3).

## Notes for W2-W6
- `useReveal`, `Reveal`, `Tooltip`, `CountUp`, `Icon`/`ICONS` — готовы к повторному использованию, импорт не нужен (все волны вставляются в один `<script type="text/babel">`).
- `.card-hover`, `.bounce-y`, `.scroll-progress` CSS-классы — готовы.
- Не нужно переопределять `<style>`-блок в других волнах: он монтируется один раз из App_W1. Если в App_W2 root будет `App_W2`, ему тоже нужно включать этот `<style>` — или W2 должна экспортировать компонент, который W6 всё равно отрендерит через `App_latest`.
