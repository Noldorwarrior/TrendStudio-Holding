# Промты для генерации изображений — Тренд Студио Холдинг Investor Deck v4

**Версия:** v4-improved (доработка промтов под Gemini Imagen 3)
**Дата:** 2026-04-05

---

## Что изменено по сравнению с v3

### Системные улучшения (применены ко всем 17 промтам)

1. **Сокращение длины** — Hero-промты урезаны с 350–500 до 150–250 слов. Gemini Imagen 3 теряет когерентность на длинных промтах: второстепенные детали начинают конкурировать с ключевыми объектами.

2. **Hex-коды → описательные цвета** — Hex-коды перенесены в технические комментарии (не в сам промт). Imagen 3 не парсит hex надёжно. Вместо `#D4A843` используем `warm gold`, `amber gold`; вместо `#1E2D45` — `dark navy`, `charcoal blue`.

3. **Bullet-списки → связный текст** — Gemini лучше интерпретирует текучее описание сцены, чем пронумерованные списки объектов. Переформатировано в параграфы.

4. **Фокус на 3–5 ключевых элементах** — Убраны мелкие детали, которые Gemini всё равно проигнорирует или исказит (конкретные числа объектов, точное расположение). Оставлены только семантически значимые элементы.

5. **Добавлены quality boosters** — `octane render style`, `clean sharp edges`, `studio lighting`, `high detail`, `artstation quality` — усиливают качество 3D-рендера.

6. **Усилены negative prompts** — Расширены запреты: `no text, no labels, no logos, no numbers, no watermarks, no UI elements, no people's faces`.

7. **Единый стилевой якорь** — Каждый промт начинается с `3D isometric miniature diorama, dark cinematic style, octane render` для стилистической консистентности.

8. **Уменьшена перегрузка композиции** — Промты 4.3 (Фестивали) и 6.1 (Roadmap) содержали 4–5 отдельных «сцен» в одном кадре. Упрощены до одной центральной и 1–2 вспомогательных.

---

## Техническая спецификация (не включать в промты — справочная)

| Параметр | Значение |
|---|---|
| Генератор | Google Gemini (Imagen 3) |
| Hero-формат | 16:9, 1920×1080 px |
| Иконки/аватары | 1:1, 512×512 px |
| Карточки | 4:3 или 1:1 |
| Фон | deep black / dark navy |
| Акценты | warm gold / amber |
| Объёмы | dark charcoal-blue / navy |
| Стиль | 3D isometric, clean geometry, miniature diorama |

### Цветовая карта (для пост-продакшна, не для промтов)

- Фон: `#060D1A`, `#0A1628`, `#1A1A2E`
- Золото: `#D4A843`, `#F5C563`, `#B8922E`
- Объёмы: `#152238`, `#1E2D45`, `#2A3A55`

---

## СЛАЙД 1 — Титульный / Инвестиционный тезис

### 1.1 — Hero «Контентная фабрика нового поколения» (16:9)

**Роль:** Центральный 3D-объект на фоне слайда 1, под метриками и заголовком.

```
3D isometric miniature diorama of a premium media holding campus, dark cinematic style, octane render.

A stylized miniature campus viewed from above at a 30-degree isometric angle, sitting on a dark floating platform with golden edge lighting. The campus has a central glass dome hub with golden framework connecting four distinct wings.

Front-left wing: a film production soundstage with open walls revealing golden studio lights and a golden camera inside. Front-right wing: a modern advertising studio with a large glowing golden screen on the facade and a golden megaphone on the rooftop. Back-left wing: an open-air festival amphitheater with golden stage lighting and semicircular golden seating. Back-right wing: a sleek education center with golden digital screens and a golden graduation cap on the roof.

Golden illuminated pathways connect all wings through the central hub like premium runway lighting. Small golden human figures gathered near the amphitheater. The entire complex sits on layered dark geometric tiers above a pure black void.

Dark matte buildings with warm gold accent objects. Soft ambient lighting from above-right, golden objects emit subtle warm glow. Clean sharp edges, smooth surfaces, minimal texture, studio lighting quality.

No text, no labels, no logos, no numbers, no watermarks, no UI elements. Aspect ratio 16:9.
```

**Изменения vs v3:** Убраны отдельные перечисления мелких деталей (film reels, data flow particles). Объединены описания крыльев в единый поток. Добавлены quality boosters. Сокращено с ~400 до ~200 слов.

---

### 1.2 — Иконка «Кинокамера» (1:1)

```
3D isometric icon of a professional cinema camera, dark premium style, octane render.

A single stylized film camera on a compact tripod, viewed from an isometric angle. The camera body is dark charcoal with warm golden accents on the lens ring, viewfinder, and control dials. It sits on a small dark circular platform with a thin golden edge line.

Clean minimal 3D render, isolated object on pure black background. Sharp geometry, smooth surfaces, studio lighting. Square format.

No text, no labels. High resolution.
```

**Изменения vs v3:** Минимальные — убраны hex-коды, добавлен `octane render`. Промт уже был хорошо сфокусирован.

---

### 1.3 — Иконка «CAGR/Рост» (1:1)

```
3D isometric icon of a golden ascending bar chart with a small rocket launching from the tallest bar, dark premium style, octane render.

Three stylized rectangular bars of increasing height arranged left to right on a small dark platform. The bars progress from warm gold to bright amber, the tallest glowing intensely. A small stylized golden rocket launches from the top of the tallest bar, trailing golden sparks upward.

Small dark rectangular base with clean edges, pure black background. Clean minimal 3D isometric render, sharp geometry, studio lighting. Square format.

No text, no numbers, no axes, no labels. High resolution.
```

**Изменения vs v3:** Убраны hex-коды. Добавлено уточнение `progress from warm gold to bright amber` вместо градиента по hex. Минимальные правки.

---

### 1.4 — Иконка «EBITDA / Бриллиант» (1:1)

```
3D isometric icon of a faceted golden diamond gem hovering above a dark pedestal, dark premium style, octane render.

A stylized geometric brilliant-cut diamond shape floating slightly above a small dark circular platform. The diamond is rendered in warm gold with faceted surfaces — each facet a slightly different shade from deep amber in shadows to bright gold on highlights. A subtle golden glow halo beneath the diamond, with three to four small golden sparkle particles floating around it.

Dark pedestal with thin golden edge. Pure black background. Clean 3D isometric render, premium feel, studio lighting. Square format.

No text, no labels. High resolution.
```

**Изменения vs v3:** Заменены hex-коды на `deep amber` / `bright gold`. Убрана избыточная конкретика по оттенкам.

---

### 1.5 — Иконка «Аудитория 100 млн+» (1:1)

```
3D isometric icon of a golden broadcast tower radiating signal waves over a massive crowd, dark premium style, octane render.

A central golden antenna tower on a small dark platform, with concentric golden rings expanding outward like radio waves. Dozens of tiny golden human figure silhouettes scattered in groups within the rings — densely packed near the center, sparser at the edges, conveying massive scale. Three golden connection beams radiate from the tower to distant clusters of figures.

Dark circular base with golden edge. Pure black background. Clean minimal 3D isometric render, studio lighting. Square format.

No text, no numbers, no labels. High resolution.
```

**Изменения vs v3:** Упрощена формулировка. Убрано «representing 100 million+ audience reach» — это метаданные для нас, но Gemini это не поможет.

---

## СЛАЙД 2 — Рынок и позиционирование

### 2.1 — Hero «Медиа-рынок / Город контента» (16:9)

```
3D isometric miniature diorama of a dark stylized media city, cinematic style, octane render.

A bird's-eye isometric view of a miniature city representing the media and content market on a large dark rectangular platform. At the center stands one tall dominant skyscraper — a dark geometric tower with a large golden glowing display panel on its facade, the biggest structure in the scene. Around it, a middle ring of four to five medium-height content studio buildings with golden window rows and satellite dishes. Scattered in the outer ring are smaller dark office blocks with individual golden accent lights.

Golden illuminated pathways connect buildings like data highways. Small golden broadcast antennas on several rooftops, golden play-button triangles floating above some buildings, and a few golden vehicles on the pathways.

The city fills the right sixty percent of the frame; the left side is darker and emptier for overlay space. Tallest tower at right-center. Dark platform with golden edge above pure black void. Soft ambient lighting, warm golden glows from building facades.

Clean 3D isometric render, stylized miniature city, premium investor-grade aesthetic, studio lighting.

No text, no labels, no logos, no numbers. Aspect ratio 16:9.
```

**Изменения vs v3:** Убрано пояснение «TAM/SAM/SOM» — это для нас, не для генератора. Сокращён с ~350 до ~200 слов. Уточнена композиция (60/40 split).

---

## СЛАЙД 3 — Финансовые показатели

### 3.1 — Hero «Экспоненциальная золотая лестница» (16:9)

```
3D isometric miniature diorama of four massive golden stepped platforms ascending dramatically from left to right, dark cinematic style, octane render.

Four golden blocks form an exponential staircase, each step dramatically taller than the previous one — the rightmost block towers over the others. On top of block one, a small golden film camera. On block two, a golden megaphone. On block three, a golden festival tent. On the summit of block four, the tallest and brightest, a large golden trophy star glowing intensely with golden light particles cascading upward.

Each block has layered sub-segments in slightly different gold shades representing multiple revenue streams. A thin golden ascending arrow connects the tops of all four blocks. The blocks progress from warm matte gold on the left to brilliant bright amber on the right with increasing glow.

Long dark rectangular base with golden edges. Pure black background. Dramatic scale contrast between blocks — the fourth is at least four times taller than the first. Premium cinematic lighting with warm golden highlights.

No text, no numbers, no labels, no axes. Aspect ratio 16:9. High resolution.
```

**Изменения vs v3:** Убрано перечисление «representing Кино, Реклама, Фестивали, Обучение» — Gemini не понимает русский контекст. Вместо этого конкретные золотые объекты на вершинах. Усилен контраст масштабов.

---

## СЛАЙД 4 — Экономика направлений

### 4.1 — Карточка «Кино» (4:3 или 1:1)

```
3D isometric miniature diorama of a premium film production soundstage interior, dark cinematic style, octane render.

A compact isometric scene: a large dark rectangular soundstage building with one wall removed to reveal the interior. Inside, a golden film camera on a dolly track points at a set illuminated by two large golden Fresnel lamps on C-stands. A row of golden poster frames lines the back wall. Two golden director's chairs sit side by side. A golden clapperboard rests on the dark floor. Outside the stage, stacks of golden film reels and a dolly track extend outward.

Dark floor with subtle golden tape marks. Compact dark platform base with golden edge. Pure black background. Warm studio lighting from the golden lamps, cinematic shadows.

Clean 3D isometric render, miniature diorama feel, premium dark with golden accents, sharp edges.

No text, no labels, no numbers. High resolution.
```

**Изменения vs v3:** Минимальные — промт уже был хорошо структурирован. Убраны hex-коды, добавлен стилевой якорь.

---

### 4.2 — Карточка «Реклама» (4:3 или 1:1)

```
3D isometric miniature diorama of a premium product placement and advertising studio, dark cinematic style, octane render.

A compact isometric scene of a branded content production space. At the center, a golden product — a stylized golden bottle shape — is being filmed under a golden spotlight beam from above, with a dark film camera pointed at it from the side. To the left, a dark editing desk with a golden monitor displaying abstract golden frames and golden headphones. To the right, a display shelf with five golden product packages of distinct shapes — cube, cylinder, pyramid, sphere, hexagon — each glowing subtly. Behind everything, a large dark backdrop with a golden film frame border.

A golden megaphone on a stand and thin golden connection lines from each product to the camera accent the scene. Compact dark base with golden edge. Pure black background. Premium commercial shoot atmosphere, warm spotlight lighting.

Clean 3D isometric render, miniature diorama, sharp geometry.

No text, no numbers, no labels, no brand names. High resolution.
```

**Изменения vs v3:** Убран плавающий символ «%» — Gemini отрисует его как текстовый элемент, что нарушит правило «no text». Убраны hex-коды.

---

### 4.3 — Карточка «Фестивали» (4:3 или 1:1)

```
3D isometric miniature diorama of a massive open-air festival venue, dark cinematic style, octane render.

A compact isometric scene dominated by a large golden stage platform with a golden lighting truss overhead holding multiple golden spotlights beaming outward and upward. A golden screen backdrop behind the stage. In front, a vast semicircular audience area densely filled with hundreds of tiny golden human figure dots — the crowd extends far to emphasize massive scale.

Golden confetti particles float in the air above the stage. Small golden banner flag poles line the edges of the festival area. Golden spotlight beams cut through the dark atmosphere. The audience area visually dominates the composition.

Compact dark base with golden edge. Pure black background. Festival energy combined with investor-grade elegance. Warm golden stage lighting contrasting with dark surroundings.

Clean 3D isometric render, miniature diorama, premium dark with golden accents.

No text, no numbers, no city names, no labels, no map. High resolution.
```

**Изменения vs v3:** **Ключевое изменение** — убрана карта России и вышка радиовещания. Оригинал пытался уместить 4 отдельные «подсцены» (сцена + аудитория + карта + вышка) в одном кадре — Gemini бы размазал фокус. Теперь единый фокус: сцена + массовая аудитория = визуальный wow-эффект масштаба.

---

### 4.4 — Карточка «Обучение» (4:3 или 1:1)

```
3D isometric miniature diorama of a digital education platform ecosystem, dark cinematic style, octane render.

A compact isometric scene with three key elements. At the center, a large golden holographic globe hovering above a dark pedestal with three golden orbital rings around it, small golden dots on the globe's surface. To the left, a tall dark bookshelf structure densely packed with rows of golden content tablets and cards glowing from within — a digital content library. To the right, a modern dark amphitheater with ascending semicircular rows of golden individual screens, tiny golden seated figures filling the seats.

Golden data stream lines flow from the library through the globe to the amphitheater. Small golden graduation cap icons float along the data streams. A golden laptop sits at the front of the amphitheater.

Compact dark base with golden edge. Pure black background. Tech-enabled global education atmosphere, soft ambient and golden glow lighting.

Clean 3D isometric render, miniature diorama, premium dark with golden accents.

No text, no numbers, no country names, no labels. High resolution.
```

**Изменения vs v3:** Убрано упоминание «РФ, СНГ, BRICS» — Gemini не знает, что с этим делать в визуальном контексте. Заменено на абстрактный глобус с точками. Убраны «certificate scrolls» как второстепенная деталь.

---

## СЛАЙД 5 — Инвестиционное предложение

### 5.1 — Hero «Инвестиционная сделка / Золотой сейф» (16:9)

```
3D isometric miniature diorama of a premium open vault revealing golden treasures, dark cinematic dramatic style, octane render.

A dramatic isometric view of a large dark luxury vault with its heavy door swung wide open, golden hinges and combination dial gleaming. Inside the vault, four golden treasures sit on individual golden display pedestals: a golden film camera, a golden megaphone, a golden stage spotlight, and a golden graduation cap with open book — all glowing warmly.

Golden light rays stream outward from the open vault door. In front of the vault, a large golden key lies on the dark platform. To one side, a golden ascending bar chart sculpture of four physical golden metal bars, each progressively taller. Golden sparkle particles float around the vault interior.

The vault sits atop elevated dark geometric steps like a premium pedestal with golden edge lighting. Pure black background. Dramatic reveal atmosphere — the investment opportunity is literally golden. Cinematic warm lighting focused on the vault interior.

Clean 3D isometric render, premium dramatic lighting, sharp edges.

No text, no numbers, no labels, no logos, no symbols. Aspect ratio 16:9. High resolution.
```

**Изменения vs v3:** Убрана «golden scale/balance» (слишком много объектов перед сейфом). Убрано зачёркнутое «×8.6» — в оригинале автор сам удалил это, но оставил текст инструкции в промте, что путает. Убран символ «%». Чистый фокус: сейф → 4 сокровища → ключ → рост.

---

## СЛАЙД 6 — Команда и Milestones

### 6.1 — Hero «Команда и дорожная карта» (16:9)

```
3D isometric miniature diorama of a creative team headquarters with an ascending milestone pathway, dark premium style, octane render.

A panoramic isometric view split into two sections. On the left, a modern open-plan office on a dark platform with four individual workstations arranged in a semi-circle, each with a dark desk, golden monitor, and a unique golden accent object: a tiny film camera, a stage spotlight, a megaphone with network lines, and a briefcase with small chart.

On the right, a physical golden pathway ascending steeply from the office area toward the upper-right corner. Four milestone markers along the path, each larger and brighter than the last: a golden premiere archway at the start, a golden balance scale at mid-height, a golden globe with orbital rings higher up, and a massive golden glowing trophy obelisk at the summit. The path itself glows progressively brighter toward the peak.

A golden dotted line connects the team area to the first marker; solid golden lines link all subsequent markers. The team section sits slightly lower than the roadmap summit, suggesting upward trajectory. Dark layered platform, pure black background. Warm cinematic lighting.

Clean 3D isometric render, premium dark with golden accents.

No text, no numbers, no dates, no labels. Aspect ratio 16:9. High resolution.
```

**Изменения vs v3:** Убраны подробные описания персонажей команды (15 years experience, ex-Big4) — это текстовая метаинформация, не визуальная. Gemini не может «показать 15 лет опыта». Акцент на визуально различимые атрибуты рабочих мест.

---

### 6.2a — Аватар CEO / Продюсер (1:1)

```
3D isometric stylized portrait bust of a film producer, dark premium style, octane render.

A minimal geometric bust sculpture from shoulders up, viewed from isometric angle. Dark smooth faceted low-poly charcoal surface. Golden accents: golden-rimmed glasses, golden collar edges on a suit jacket, a tiny golden film clapperboard pin on the chest. Behind the bust, a subtle golden film strip arc.

Dark circular pedestal with golden edge. Pure black background. Subtle golden rim light from behind. Abstract geometric style, like a premium chess piece, smooth surfaces, clean edges.

Square format. No text, no labels, no face features — abstract geometric only. High resolution.
```

**Изменения vs v3:** Добавлено явное уточнение `no face features — abstract geometric only`. Без этого Gemini может попытаться генерировать реалистичные лица, что нарушает стилистику и создаёт uncanny valley эффект.

---

### 6.2b — Аватар CCO / Креативный директор (1:1)

```
3D isometric stylized portrait bust of a creative director, dark premium style, octane render.

A minimal geometric bust sculpture, dark smooth faceted low-poly charcoal surface. Golden accents: a golden beret or artistic hat, golden scarf or collar detail, a tiny golden star award pin on the chest. Behind the bust, a subtle golden laurel wreath arc.

Dark circular pedestal with golden edge. Pure black background. Golden rim light from behind. Abstract geometric premium sculpture style.

Square format. No text, no labels, no face features. High resolution.
```

**Изменения vs v3:** Аналогично — добавлено `no face features`, убрано перечисление достижений.

---

### 6.2c — Аватар Head of Talent (1:1)

```
3D isometric stylized portrait bust of a talent manager, dark premium style, octane render.

A minimal geometric bust sculpture, dark smooth faceted low-poly charcoal surface. Golden accents: a golden earpiece headset, a golden lapel microphone, a tiny golden network web pin on the chest. Above the head, three small golden floating circles representing a managed talent network.

Dark circular pedestal with golden edge. Pure black background. Golden rim light from behind. Abstract geometric premium sculpture style.

Square format. No text, no labels, no face features. High resolution.
```

---

### 6.2d — Аватар CFO (1:1)

```
3D isometric stylized portrait bust of a CFO, dark premium style, octane render.

A minimal geometric bust sculpture, dark smooth faceted low-poly charcoal surface — the most formal and corporate of the set. Golden accents: a golden pocket square in the suit breast pocket, golden cufflink detail, a tiny golden ascending chart arrow pin on the chest. Behind the bust, a subtle golden ascending bar chart arc.

Dark circular pedestal with golden edge. Pure black background. Golden rim light from behind. Abstract geometric premium sculpture style, sharp formal silhouette.

Square format. No text, no labels, no face features. High resolution.
```

---

## Рекомендации по генерации

### Порядок генерации

Рекомендую генерировать в таком порядке для быстрой калибровки стиля:

1. **Сначала иконки** (1.2–1.5) — маленькие, быстрые, позволят откалибровать палитру и стиль
2. **Затем аватары** (6.2a–d) — средняя сложность, проверка абстрактного стиля
3. **Карточки** (4.1–4.4) — средняя сложность, проверка композиции diorama
4. **Hero-изображения** (1.1, 2.1, 3.1, 5.1, 6.1) — самые сложные, генерировать последними

### Если Gemini не справляется

- **Слишком много объектов в кадре** → убирайте второстепенные детали, оставляя только 2–3 ключевых
- **Цвета не те** → добавьте `dark navy blue background, warm amber gold accent color, no other colors`
- **Появляется текст** → усильте негативный промт: `absolutely no text anywhere, no letters, no writing, no signs`
- **Не изометрия** → добавьте `top-down view tilted at exactly 30 degrees, isometric projection, miniature model look`
- **Слишком реалистично** → добавьте `stylized, low-poly inspired, game asset style, not photorealistic`

---

## ФОН ПРЕЗЕНТАЦИИ (HTML + PPTX)

### BG-1 — Фон слайдов (16:9)

**Задача:** Фон должен бесшовно совпадать с краями сгенерированных 3D-изображений, чтобы картинки «растворялись» в фоне без видимых границ. Базовый цвет изображений: near-black с deep navy undertone (~#060D1A).

```
Seamless dark abstract background for a premium investor presentation, ultra-minimal, no objects, octane render lighting.

A vast dark polished surface viewed from a very slight angle. The base color is near-black with a subtle deep navy blue tint. Extremely faint warm golden ambient light creates soft barely visible gradient pools in the upper-right and lower-left areas — like distant reflections off a polished dark floor.

A whisper-faint dark geometric grid texture barely visible beneath the surface, almost imperceptible — like brushed dark metal. A very dim golden horizontal light streak across the lower third, like a distant horizon glow.

Overall brightness is extremely low — the image reads as almost black at first glance. Golden accents are at five percent opacity maximum, just enough to add depth. The surface has a subtle reflective quality, like dark polished obsidian.

No objects, no shapes, no particles, no stars, no patterns, no gradients stronger than five percent. Only color, subtle light, and the barest suggestion of surface texture.

Absolutely no text, no logos, no watermarks.

Aspect ratio 16:9, 1920x1080, high resolution.
```

**Альтернатива без генерации (CSS для HTML-версии):**

```css
body {
  background: #060D1A;
  background-image:
    radial-gradient(ellipse at 70% 25%, rgba(212,168,67,0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 30% 75%, rgba(212,168,67,0.02) 0%, transparent 50%);
}
```

**Альтернатива для PPTX:**
Сплошная заливка `#060D1A` или градиент от `#060D1A` (центр) к `#030A12` (края).

---

### A/B-тестирование

Для каждого hero-изображения рекомендую сгенерировать 3–4 варианта и выбрать лучший. Параметры для вариации:
- Угол освещения (сверху-справа vs сверху-слева)
- Плотность деталей (больше/меньше мелких объектов)
- Интенсивность золотого свечения (subtle vs dramatic)
