# PROMPT — Landing v2.2 AUTONOMOUS (жёсткие grep-контракты)

**Версия:** v2.2 FINAL
**Дата:** 2026-04-24
**Стратегия:** полный rerun от main, НОВАЯ ветка `claude/landing-v2.2-autonomous`
**Режим:** `--dangerously-skip-permissions`
**Базовая:** v2.1 + анализ почему CC пропустил premium polish

---

## 🎯 КРИТИЧЕСКИЙ УРОК v2.1 → v2.2

### Что пошло не так в v2.1

CC выполнил **содержательные** инструкции (content shift в части секций, математика, структура компонентов), но **систематически проигнорировал** качественные требования к premium polish:
- Hero: нет mask-gradient, film-grain, ken-burns, rotation
- Thesis: нет asymmetric layout, inline-viz, drop-cap, glass-morphism
- Market: нет inline-графиков в KPI, parallax
- Waterfall: плоский список вместо cascade с particles
- M2: пропала KPI-строка (регресс с v2.0)
- Content shift не применён в Hero/Thesis/Market

**Причина:** рекомендации в главном промте типа «применить glass-morphism», «добавить film-grain» **не являются machine-checkable constraints**. CC их трактует как «желательно, если успею». Acceptance-gate не фейлил волну за их отсутствие.

### Что меняется в v2.2

**Каждое visual/content требование превращается в grep-acceptance.** Если grep не находит ожидаемый паттерн в HTML — волна не проходит, CC делает retry. Этот подход работает потому что CC отлично исполняет machine-checkable constraints.

---

## §1. AUDIENCE + CONTENT (без изменений v2.1)

Холдинг «ТрендСтудио» приходит к институциональному фонду-инвестору (РФПИ / ВЭБ.Венчурс / family office / суверенный) за со-финансированием портфеля из 7 кинопроектов на 3 000 млн ₽, горизонт 7 лет.

- «Мы» = холдинг
- «Вы» / «партнёр» / «ваш фонд» = адресат
- CTA: «Обсудить партнёрство» / «Запросить встречу с CEO»
- Математика сохраняется: MOIC 3.62, IRR Internal 24.75% / Public 20.09%, MC P50 13.95% / 11.44%

---

## §2. GREP-CONTRACTS (новая механика v2.2)

Каждая спека секции содержит обязательные `MUST_CONTAIN` и `MUST_NOT_CONTAIN` паттерны. acceptance.sh после волны запускает grep по всем паттернам. **Волна не считается завершённой, пока все MUST_CONTAIN найдены и все MUST_NOT_CONTAIN отсутствуют.**

Если после retry (1 раз) всё ещё фейл — CC пишет в SKIPPED.md почему и продолжает, но это снижает P5 score.

### Общий формат в WAVE_PROMPT

```
## Section XYZ
...content description...

### Acceptance (grep-contract)
MUST_CONTAIN:
  - pattern1
  - pattern2
MUST_NOT_CONTAIN:
  - antipattern1
  - antipattern2
COUNT_AT_LEAST:
  - pattern: count
```

---

## §3. СИСТЕМНЫЕ GREP-CONTRACTS (весь HTML)

Эти паттерны проверяются в финальном HTML (landing_v2.2.html):

### 3.1 Premium polish markers (обязательно)

```
MUST_CONTAIN:
  - feTurbulence                      # SVG film-grain filter
  - mask-image                        # CSS mask для fix color-seam
  - backdrop-filter                   # glass-morphism
  - cubic-bezier(0.22                 # premium easing
  - <canvas                           # Canvas for particles/complex viz (хотя бы один)
  - @keyframes .*grain                # film-grain animation
  - @keyframes .*kenburns             # ken-burns
  - transform-origin                  # правильный pivot для анимаций
  - perspective:                      # 3D context

COUNT_AT_LEAST:
  - Reveal: 40                        # scroll-reveal везде
  - Tooltip: 20                       # tooltip pattern
  - cubic-bezier: 15                  # premium easing много раз
  - @keyframes: 8                     # кастомные анимации
  - backdrop-filter: 5                # glass cards
```

### 3.2 Content shift forbidden + required

```
MUST_NOT_CONTAIN (anywhere in HTML body, case-insensitive):
  - "LP-фонд российского кино"
  - "Запросить LP-пакет"
  - "Почему ТрендСтудио"                 # заголовок Thesis старый
  - "построен фонд"                      # подзаголовок Thesis старый
  - "для расчёта целевой доходности фонда"  # подзаголовок Market старый
  - "Скачать memo"                       # старый CTA

MUST_CONTAIN:
  - "холдинг"                            # lowercase
  - "партнёрств"                         # корень «партнёрство/партнёрства/партнёр»
  - "Обсудить партнёрство"               # primary CTA
  - "Запросить встречу"                  # alt CTA текст
  - "investment pack"                    # новый secondary CTA
  - "ваш фонд"                           # апелляция к адресату

COUNT_AT_LEAST:
  - "холдинг": 8                         # минимум 8 упоминаний «холдинг» (lower/mixed case)
  - "партнёрств": 6                      # минимум 6 раз корень партнёрства
  - "ваш фонд": 4                        # минимум 4 раза «ваш фонд»
```

### 3.3 Structural

```
MUST_NOT_CONTAIN:
  - "function StagesSection"             # Kanban удалён (v2.1 §2)
  - "pravatar"                           # placeholder изображений
  - "unsplash"                           # placeholder изображений
  - "localStorage"                       # запрещено
  - "sessionStorage"                     # запрещено

MUST_CONTAIN:
  - "function HeroSection"
  - "function ThesisSection"
  - "function MarketSection"
  - "function FundStructureSection"
  - "function M2BuilderSection"
  - "function CommitmentCalculatorSection"
  - "function WaterfallSection"
  - "function TaxCreditsSection"
  - "function DistributionSection"
  - "function LegalSection"
  - "function FAQSection"
  - "function TermSheetSection"
  - "function FooterFull"
```

### 3.4 Section order (FAQ в низу)

```
FAQ должен быть ПОСЛЕ Press и ПЕРЕД Legal в section order.
Проверка: позиция «function FAQSection» > позиция «function PressQuotesSection» И позиция «function FAQSection» < позиция «function LegalSection»
```

---

## §4. СПЕЦИФИЧНЫЕ GREP-CONTRACTS ПО СЕКЦИЯМ

### 4.1 s01 Hero

```
MUST_CONTAIN:
  - 'mask-image.*linear-gradient.*transparent.*black.*85%.*transparent'    # fix color-seam
  - '@keyframes.*kenburns|@keyframes.*ken-burns'                           # ken-burns animation
  - 'feTurbulence'                                                          # film-grain SVG
  - 'animation.*rotate.*60s|animation: .*spin.*60s'                        # rotation film-reel loop
  - '"Обсудить партнёрство"|Обсудить партнёрство'                         # primary CTA text
  - 'animationDelay.*200|animationDelay.*500|animationDelay.*800'         # entrance sequence staggered
  - 'radial-gradient.*transparent.*40%'                                     # vignette overlay
  
MUST_NOT_CONTAIN:
  - "LP-фонд российского кино"
  - "Запросить LP-пакет"
  - "Скачать memo"                      # должно быть «Скачать investment pack»
  
COUNT_AT_LEAST:
  - CountUp: 3                          # 3 KPI с counter
  - Tooltip: 3                          # hover на 3 KPI
```

### 4.2 s02 Thesis

```
MUST_CONTAIN:
  - '"Почему партнёрство|Почему сотрудничеств|Что мы приносим'             # новый заголовок
  - 'backdrop-filter.*blur'                                                  # glass-morphism
  - 'gridTemplateColumns.*2fr.*1fr|gridTemplateColumns.*50%.*25%.*25%'      # asymmetric layout
  - 'fontSize.*3em|fontSize.*4em'                                            # drop-cap
  - 'sparkline|<path.*M.*L.*L.*L'                                           # inline мини-viz
  
MUST_NOT_CONTAIN:
  - "Почему ТрендСтудио"
  - "Три принципа, на которых построен фонд"
  - "Рост рынка"                        # старое название карточки
```

### 4.3 s03 Market

```
MUST_CONTAIN:
  - '<svg.*width.*height.*viewBox'      # inline SVG для sparkline в KPI
  - 'background.*parallax|transform.*translate3d\\(.*mousemove'  # parallax фон (упрощённая проверка)
  - 'что это даёт|влияние на вашу|для вашего фонда'    # context-tooltip text
  
COUNT_AT_LEAST:
  - CountUp: 4                          # 4 KPI с counter
  - <svg: 4                             # хотя бы 4 inline SVG (для mini-charts)
  - Tooltip: 4                          # tooltip на каждой карточке

MUST_NOT_CONTAIN:
  - "для расчёта целевой доходности фонда"
```

### 4.4 s04 Fund Structure

```
MUST_CONTAIN:
  - '<Tooltip.*contentStyle.*#15181C|background.*#15181C.*Tooltip'  # tooltip fix background
  - 'activeIndex|onPieEnter|activeShape'                             # донут active-sector выезжает
  - 'animationBegin.*animationDuration'                               # sweep-in анимация

COUNT_AT_LEAST:
  - Reveal: 4                           # 3 карточки справа + donut
```

### 4.5 s05 Economics KPI

```
MUST_CONTAIN:
  - 'rotateY.*180|transform.*rotateY|perspective.*backface-visibility'  # flip-карточки
  
COUNT_AT_LEAST:
  - CountUp: 4                          # 4 KPI (2%, 20%, 8%, 100%)
```

### 4.6 s05 Waterfall Bars (в Economics)

```
MUST_CONTAIN:
  - '<canvas|<svg.*filter.*drop-shadow'      # Canvas для particles или SVG cascade
  - '@keyframes.*flow|@keyframes.*cascade'    # анимация перелива

COUNT_AT_LEAST:
  - @keyframes: 2                        # анимации cascade/flow
```

### 4.7 s06 M1 Monte-Carlo

```
MUST_CONTAIN:
  - 'cursor.*rgba\\(244,162,97'          # tooltip cursor не белый
  - 'ReferenceLine.*P10|ReferenceLine.*P50|ReferenceLine.*P90'  # quantile reference lines
  - 'setActiveBin|selectedBin|onClick.*bar'  # click на bar → drill-down state
  
MUST_NOT_CONTAIN:
  - 'fill.*#FFFFFF.*cursor|cursor.*fill.*white'  # нет белого tooltip cursor
```

### 4.8 s07 Pipeline cards

```
MUST_CONTAIN:
  - 'transform-origin.*center'           # правильный pivot
  - 'perspective:'                       # 3D context для tilt
  - 'will-change.*transform'             # GPU hint
  
Tilt углы ≤ 5deg:
  # Grep не поймает арифметику, так что только negative проверка rough:
MUST_NOT_CONTAIN:
  - 'rotateX\\((10|11|12|13|14|15|20|30)deg\\)'  # углы > 5deg запрещены
  - 'rotateY\\((10|11|12|13|14|15|20|30)deg\\)'
```

### 4.9 s09 Team + s10 Advisory

```
MUST_CONTAIN:
  - 'aria-expanded'                      # 2-state card accessibility
  - 'linear-gradient.*135deg.*#F4A261.*#2A9D8F|linear-gradient.*#F4A261.*#2A9D8F.*135deg'  # gradient border
  - 'role="button"'                      # карточки клик-able

COUNT_AT_LEAST:
  - 'aria-expanded': 9                   # 5 team + 4 advisory
```

### 4.10 s11 Operations 6-step

```
MUST_CONTAIN:
  - 'stroke-dashoffset'                  # animated SVG connector
  - 'expandedStep|activeStep'            # state для click-expand
  
COUNT_AT_LEAST:
  - @keyframes: 1                        # минимум 1 кастом-анимация (иконка pop-in)
```

### 4.11 s13 Roadmap

```
MUST_CONTAIN:
  - 'swimlane|swimLane|lane-'            # 6+ swimlanes
  - 'scrubber|playhead|yearSelector'     # scrubber-playhead
  - 'animationIterationCount.*3'         # pulse 3 cycles only (не infinite)
  
MUST_NOT_CONTAIN:
  - 'animation:.*pulse.*infinite'        # НЕ бесконечная анимация pulse
  - 'animationIterationCount: *infinite' # та же проверка inline
```

### 4.12 s16 Tax Credits

```
MUST_CONTAIN:
  - 'Math.min.*budget.*0\\.85|totalSubsidy.*0\\.85|cap.*85'  # cap 85%

MUST_NOT_CONTAIN:
  - '102%'                               # не должно появляться 102% как summary
  - 'Эффективная ставка.*10[0-9]%'       # любое > 99.9%
```

### 4.13 s19 Distribution

```
MUST_CONTAIN:
  - 'PieChart'                           # donut
  - 'activeChannel|hoverChannel'         # 2-way sync
  - 'TimelineRelease|ReleaseWindow'      # horizontal timeline 48mo
```

### 4.14 s20 Waterfall Intro + Personal Example

```
MUST_CONTAIN:
  - 'scrollProgress|scroll-pin|IntersectionObserver.*threshold.*0'  # scroll-pinned slider
  - '<canvas|<svg.*filter.*particle'     # canvas particles или SVG particles
  - 'Tooltip.*hurdle|Tooltip.*catch-up|Tooltip.*super-carry|Tooltip.*MOIC'  # tooltips на PE-терминах
  - 'commitment.*вашего фонда'           # personal example с LP контекстом
  
COUNT_AT_LEAST:
  - Tooltip: 5                           # минимум 5 PE-tooltip'ов

MUST_NOT_CONTAIN:
  - "Порядок распределения.*Ваш фонд сначала получает свой взнос \\+ 8%"  # проверка что это НЕ просто плоский список (должен быть cascade visual рядом)
```

### 4.15 s21 Legal

```
MUST_CONTAIN:
  - 'rotateY.*180|transform-style.*preserve-3d'  # flip 3D card
  - 'expandedLegalCard|activeLegalCard'           # state для expand
  - 'aria-expanded'                                # a11y

COUNT_AT_LEAST:
  - 'aria-expanded': 6                   # 6 legal cards
```

### 4.16 s23 Term Sheet

```
MUST_CONTAIN:
  - 'expandedRow|activeRow|setOpenRow'   # accordion state
  - 'aria-expanded'                      # a11y
  
COUNT_AT_LEAST:
  - 'aria-expanded': 13                  # 13 rows term sheet
```

### 4.17 M2 Pipeline Builder

```
MUST_CONTAIN:
  - 'Portfolio size|Бюджет портфеля'     # KPI-строка bugdget
  - 'Weighted IRR|weightedIRR'            # KPI-строка IRR
  - 'Проектов в портфеле|[0-9] / 7'      # KPI-строка counter
  - 'onDrop.*rail|rail.*onDragOver'      # rail is drop-target
  - 'animate\\(.*cubic-bezier|transition.*cubic-bezier'  # FLIP with easing
  - 'img.*__IMG_PLACEHOLDER_img1|img.*data:image/jpeg;base64'  # постеры в карточках
  - '"Вернуть к исходному"|Вернуть к исходному'  # renamed button

MUST_NOT_CONTAIN:
  - '"Reset to Canon"'                   # старое имя кнопки
```

### 4.18 M3 Commitment Calculator

```
MUST_CONTAIN:
  - 'Partner|Lead Investor|Anchor Partner'  # новые tier badges
  - 'commitment.*вашего фонда|ваш фонд получит'  # контекст

MUST_NOT_CONTAIN:
  - '"Supporter"'                        # старый tier name
  - '"Sponsor"'                          # старый tier name (для LP)
```

---

## §5. ACCEPTANCE SCRIPT v2.2 (новый)

`acceptance.sh --wave=N --grep-contract` запускает:

1. Static checks (v2.1 legacy)
2. **Grep contracts §3 + §4** для соответствующей волны
3. Выводит report: какие MUST_CONTAIN прошли, какие нет, какие MUST_NOT_CONTAIN нарушены
4. **Exit 1** если любой MUST_CONTAIN не найден или MUST_NOT_CONTAIN найден
5. CC видит exit 1 → делает retry (1 раз) → если снова фейл → SKIPPED.md

---

## §6. ORCHESTRATOR FLOW (без больших изменений v2.1)

- Phase 0: acceptance.sh --dry-run
- Phase 1-6: 6 Task-субагентов, каждый получает свой WAVE_N.md + §3 + §4 (свои секции)
- После каждой волны: assemble_html, inject_images (W1/W3/W5), acceptance.sh --wave=N --grep-contract
- **Если grep-contract фейлит:** orchestrator спавнит новый Task с тем же WAVE_N.md + сообщение «предыдущая попытка не прошла grep-gate, нужно исправить X, Y, Z» — это retry
- После 1 retry если ещё фейл: лог в SKIPPED.md, продолжаем
- Phase 7: П5 Max 32/32 + PR + auto-merge

**Ветка:** `claude/landing-v2.2-autonomous` от main.
**Target:** `landing_v2.2.html`.
**Tag:** `v2.2.0-landing-autonomous`.
**PR title:** «Landing v2.2 — grep-contract enforcement, premium polish verified»

---

## §7. WAVE_PROMPTS v2.2 — что меняется

Каждая WAVE_PROMPT содержит свою часть §4 **как обязательную acceptance**. Субагент видит список MUST_CONTAIN в явном виде и понимает что нужно написать в JSX чтобы этот grep прошёл.

Примеры вставки в W1:

> ### Hero Section — Acceptance (MUST_CONTAIN в HTML после волны)
> - `mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)` на hero-image (fix color-seam)
> - `@keyframes kenburns` определён в CSS + применён к hero-image
> - SVG `<filter id="grain"><feTurbulence/></filter>` определён и применён как `filter: url(#grain)` на overlay
> - `animation: spin 60s linear infinite` на film-reel
> - Entrance sequence через `animationDelay: '200ms'`, `'500ms'`, `'800ms'`, `'1100ms'` на разных элементах
> - CTA **primary text** = «Обсудить партнёрство» (не «Запросить LP-пакет»)
> - CTA **secondary text** = «Скачать investment pack» (не «Скачать memo»)
> 
> Если любой из этих паттернов отсутствует в финальном HTML — волна не принята.

Это **жёстче** чем v2.1 «рекомендации в главном промте». CC видит конкретный grep-паттерн который нужно написать в коде.

---

## §8. ЗАПУСК

```bash
# 1. Bootstrap
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package_v2.2/scripts/bootstrap.sh

# 2. CC
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code --dangerously-skip-permissions
```

В CC:
> Прочитай `.landing-autonomous/PROMPT_Landing_v2.2_AUTONOMOUS.md` и следуй §6 как orchestrator. Полная автономия. Ключевая разница v2.2: каждая волна проверяется через **grep-contract** из §3 + §4. Если grep-pattern не найден — волна фейлит, делай retry. Target: landing_v2.2.html, tag v2.2.0-landing-autonomous. Для Python: `REPO_ROOT=$(pwd) python3 ...`.

Ожидаемое время: 10-14 часов (из-за возможных retry'ев на грeп-фейлы).

---

## §9. CHANGELOG v2.1 → v2.2

1. ✅ **Жёсткие grep-contract'ы** в §3 (системные) + §4 (по секциям)
2. ✅ Premium polish **теперь enforced**: feTurbulence, mask-image, backdrop-filter, canvas, @keyframes, cubic-bezier — все обязательны
3. ✅ Content shift enforced: MUST_NOT_CONTAIN старые LP-строки, MUST_CONTAIN новые холдинг-строки с count thresholds
4. ✅ 10 конкретных fix'ов с ревью v2.1 (каждый с своим grep)
5. ✅ M2 KPI-строка **enforced** (Portfolio size, Weighted IRR, # проектов)
6. ✅ Retry механика: грeп-фейл → retry → если ещё фейл → SKIPPED log
7. ✅ Auto-merge condition: если хотя бы 1 MUST_CONTAIN отсутствует после 1 retry → ready PR (не merge)

---

**Версия:** v2.2 FINAL
**Автор:** Claude (Cowork) после ревью v2.1
**Жёсткость grep-gate'ов:** максимальная (контракт а не рекомендация)
**Готов к запуску:** после сборки пакета `cc_autonomous_package_v2.2/`
