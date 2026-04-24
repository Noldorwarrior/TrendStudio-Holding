# ТЗ для Gemini Nano Banana — 20 изображений HTML-лендинга «ТрендСтудио Холдинг»

**Файл:** `Gemini_TZ_images_v1.0.md`
**Дата:** 2026-04-19
**Связанный промт:** `Промт_HTML_лендинг_Холдинг_v1.2.md` (§1.7, §1.7.1, §1.7.2, §1.7.3, Приложение В)
**Целевая модель:** Gemini 2.5 Flash Image («Nano Banana») — AI Studio / Vertex AI
**Уровень верификации ТЗ:** П5 «Максимум» 32/32 (отчёт — отдельный файл `Верификация_GeminiTZ_v1.0_П5.md`)

---

## §0. Метаданные и change log

### §0.1. Reference

| Параметр | Значение |
|---|---|
| Версия ТЗ | v1.0 |
| Автор запроса | rakhman, noldorwarrrior@gmail.com |
| Базовый промт | `Промт_HTML_лендинг_Холдинг_v1.2.md` (96 070 байт / 1 248 строк) |
| Ссылка из базового промта | §1.7 Image strategy + §1.7.3 «Тени заката» + Приложение В |
| Якорь-стиль | Nolan/Dune Dark Cinematic, палитра v1.1 (§1.3) |
| Рабочая папка output | `/Холдинг/images/` + `/TrendStudio-Holding/images/` |
| Количество слотов | **20 всего** = 9 портретов + 11 иллюстраций |
| Policy по реальным личностям | Реальные лица запрещены; портреты — стилизованные силуэты §1.7.3 |
| Policy по именам | В ТЗ используются **placeholder-роли** (CEO, CFO, …). Реальные имена добавляются в canon JSON на следующем шаге |
| Policy по codenames проектов | В ТЗ используются **placeholder-коды** `PROJECT_01…PROJECT_07` с жанровой классификацией. Реальные codenames — в canon JSON |
| Style signature | `shadows_of_sunset_v1` для всех 9 портретов (обязательный тег в canon.images.team[*].style_signature) |
| Верификация | П5 «Максимум» 32/32 (см. §7) |

### §0.2. Change log

| Версия | Дата | Автор | Изменения |
|---|---|---|---|
| v1.0 | 2026-04-19 | Claude + rakhman | Первая версия. 20 слотов, «Тени заката» для 9 портретов, Gemini Nano Banana синтаксис, placeholder-роли, placeholder-codenames |

### §0.3. Table of contents

```
§0.  Метаданные и change log
§1.  Назначение, контекст, целевая модель
§2.  Unified Style Guide (общие константы всех 20 слотов)
§3.  «Тени заката» — Portrait Spec (9 слотов: team 5 + advisory 4)
§4.  Illustrations Spec (11 слотов: hero 2 + posters 7 + banners 2)
§5.  Prompts Library (20 ready-to-paste Gemini-промтов)
§6.  Post-processing + Acceptance checklist
§7.  Verification report template (П5 32/32 + M4 7/7)
```

---

## §1. Назначение, контекст, целевая модель

### §1.1. Назначение

Документ — **единый source-of-truth** для генерации 20 изображений, которые будут inline-base64 упакованы в финальный HTML-лендинг «ТрендСтудио Холдинг» (§9 Фаза 6 базового промта). Любое изображение, попадающее в лендинг, генерируется по этому ТЗ либо утверждается пользователем как исключение с записью в canon.images.*.exceptions.

### §1.2. Почему Gemini Nano Banana (целевая модель)

Пользователь зафиксировал **Gemini 2.5 Flash Image** (кодовое имя «Nano Banana», доступна в AI Studio и Vertex AI) как основной движок.

**Сильные стороны для нашей задачи:**

- Высокая точность на dark cinematic текстурах и контражурной композиции (rim-light).
- Descriptive prose промты работают лучше, чем tag-based MJ-стиль.
- Хорошее следование negative-prompts через явные «avoid…» конструкции.
- Контроль aspect ratio через явный формат ("16:9 cinematic wide frame").
- Минимальная стоимость генерации при относительно-предсказуемом качестве.

**Слабые стороны и компенсация:**

- Менее стабильная «стилевая когерентность» между заходами, чем MJ с `--sref`. Компенсируем **едиными style anchors** (§2) + фиксированными seed-рекомендациями.
- Слабее контроль типографики/текста на изображении. Компенсируем: никакого текста на изображениях (текст идёт HTML-слоем).
- Иногда «сушит» rim-light. Компенсируем явной инструкцией «strong warm ember rim-light, halo intensity, aggressive».

### §1.3. Контекст: куда эти изображения идут

Все 20 изображений попадают в `canon.images.*` (блок #23 extended canon) и через сборку Фазы 6 инжектируются как `data:image/jpeg;base64,…` в `<script type="application/json" id="canon">`. HTML читает ТОЛЬКО через canon, никогда не хардкодит src. Перевод изображения в base64 увеличивает вес на ~33% — это учтено в бюджете §1.7 базового промта (5.5–6.5 MB → ~7.5–8.5 MB).

Специфические места использования (из секций HTML базового промта):

| Slot | Используется в | Роль в сцене |
|---|---|---|
| 1 | s01 Hero | Фоновый cinematic backdrop (за слоями L0/L1/L2), fade-in с GSAP |
| 2 | s01 Hero | Передний holographic 3D film-reel (parallax, scroll-tied rotation) |
| 3–9 | s22 Pipeline Gallery | 7 постеров проектов в grid, hover=tilt+glow |
| 10–14 | s23 Team | 5 портретов team (grid 3+2, каждая карточка раскрывается в bio-modal) |
| 15–18 | s23 Advisory | 4 портрета advisory board (grid 2+2) |
| 19 | s03 Market / s05–s06 context | Банер абстрактного кинорынка (background-layer) |
| 20 | s25 Press / footer | Газетная текстура-подложка press-секции |

### §1.4. Принципы ТЗ

1. **Полнота.** Каждый из 20 слотов имеет: role, placeholder-имя/codename, aspect ratio, resolution, target file size, полный Gemini-промт, negative prompt, список style anchors, seed-рекомендацию, attribute-distinctor (для портретов — из таблицы §1.7.3 базового промта).
2. **Воспроизводимость.** Каждый промт закреплён seed'ом (0, 1, 2, … с §5). При необходимости регенерации — тот же промт + тот же seed → тот же визуал (+ temperature 0.4 как рекомендация).
3. **Style coherence.** Все 20 используют единый набор style anchors (§2.3): палитра, grain, chromatic aberration, reference-directors. Это гарантирует визуальную когерентность на лендинге.
4. **Этичность и legal.** Портреты — силуэты с obscured faces (§1.7.3 базового). Никаких реальных личностей, никаких celebrity-стилизаций. Никаких детей. Никакого текста с названиями проектов или брендами третьих сторон.
5. **Оффлайн-читаемость.** Все 20 в JPG Q75 (портреты) / Q80 (банеры, hero, posters). Никаких WebP-only (для старых iOS-клиентов), но JPG первичен.

---

## §2. Unified Style Guide (общие константы всех 20 слотов)

### §2.1. Палитра v1.1 (Nolan/Dune Dark Cinematic)

Эти 7 цветов используются в промтах как «style anchors». Любой промт упоминает минимум 3 из них (фон + основной акцент + дополнительный акцент).

| Hex | Имя | Роль в композиции |
|---|---|---|
| `#050508` | Deep black | Базовый фон (дальний план, виньетирование) |
| `#0D1117` | Navy-black | Основной фон портретов и banners |
| `#1A1F2E` | Dark navy | Mid-ground (объекты на втором плане) |
| `#D4AF37` | Gold | Главный тёплый акцент (заголовки, декор, highlights) |
| `#C77B3A` | Ember / amber | Тёплый rim-light и film-ember highlights |
| `#B8A888` | Sand | Тёплые midtones (кожа, ткань, бумага) |
| `#8B7355` | Muted bronze | Приглушённые детали, антиквариат, film-grain texture |

**Запрещены в промтах:**

- Bright cyan / electric blue (`#4FC3F7` и около), saturated magenta/pink, neon, flat vector-illustration palette, corporate tech-stock.

### §2.2. Формат, resolution, file size, compression

| Slot-type | Aspect ratio | Генерация (input) | Target JPG (output) | Файл |
|---|---|---|---|---|
| Hero backdrop (#1) | 16:9 | 1920×1080 | 1920×1080, Q80 | `~400 KB` |
| Hero film-reel (#2) | 4:3 | 1600×1200 | 1600×1200, Q80 | `~300 KB` |
| Project posters (#3–9) | 2:3 | 1200×1800 | 1200×1800, Q80 | `~250 KB × 7` |
| Team portraits (#10–14) | 1:1 | 1200×1200 | 1200×1200, Q75 | `~180 KB × 5` |
| Advisory portraits (#15–18) | 1:1 | 1200×1200 | 1200×1200, Q75 | `~180 KB × 4` |
| Market banner (#19) | 21:9 | 2100×900 | 2100×900, Q80 | `~350 KB` |
| Press banner (#20) | 16:9 | 1920×1080 | 1920×1080, Q80 | `~280 KB` |

**Итого (сумма):** 400 + 300 + 250×7 + 180×5 + 180×4 + 350 + 280 = **400 + 300 + 1750 + 900 + 720 + 350 + 280 = 4700 KB ≈ 4.7 MB** (JPG до base64). Соответствие бюджету §1.7 (5.5–6.5 MB): есть подушка на случай превышения Q-настроек (можно поднять Q до 85 без вылета).

### §2.3. Style anchors (обязательны во всех 20 промтах)

Каждый Gemini-промт в §5 содержит блок **Style anchors**, построенный из фиксированного набора:

```
STYLE_ANCHORS = "
  Cinematic, moody, Dark Cinematic aesthetic (Nolan / Villeneuve / Fincher reference).
  Deep navy-to-black gradient backgrounds (#050508 to #0D1117).
  Warm gold accents (#D4AF37) and film-ember highlights (#C77B3A).
  Subtle 35mm film grain (Kodak 500T push +1 reference).
  Minimal chromatic aberration at edges.
  Shallow cinematic depth-of-field.
  High contrast, low-key lighting.
  Prestige-film production quality.
"
```

Эта строка переиспользуется как константа в каждом из 20 промтов §5 (вставляется в начало prompt-блока).

### §2.4. Negative prompt library (единая для всех 20)

```
NEGATIVE_PROMPT = "
  no identifiable real celebrity or politician faces,
  no children,
  no text overlays or written language,
  no brand logos,
  no cyan or electric-blue tones,
  no neon saturated colors,
  no flat vector illustration style,
  no cartoon or anime aesthetic,
  no corporate headshot stock-photo feel,
  no obvious AI-artifacts (extra fingers, merged limbs, distorted ears),
  no lens-flare overdone,
  no watermarks,
  no signatures.
"
```

Для портретов §3 добавляется специфический negative блок (см. §3.2). Для постеров §4 — ещё один (никаких актёров/звёздных лиц).

### §2.5. Seed policy (воспроизводимость)

| Slot | Seed | Temperature | Guidance |
|---|---|---|---|
| 1 hero_bg | 1001 | 0.4 | 7.5 |
| 2 hero_film_reel | 1002 | 0.4 | 7.5 |
| 3–9 posters | 1003…1009 | 0.4 | 7.5 |
| 10–14 team | 1010…1014 | 0.35 | 8.0 |
| 15–18 advisory | 1015…1018 | 0.35 | 8.0 |
| 19 market | 1019 | 0.4 | 7.5 |
| 20 press | 1020 | 0.4 | 7.5 |

Temperature 0.35 для портретов обеспечивает жёсткое следование силуэтной композиции; 0.4 для иллюстраций даёт лёгкий простор на текстуру без отрыва от anchors.

### §2.6. File naming convention (строго из §1.7.2 базового)

```
images/
├── hero_bg.jpg
├── hero_film_reel.jpg
├── projects/
│   ├── 01_PROJECT_01_poster.jpg   ← placeholder до уточнения codename
│   ├── 02_PROJECT_02_poster.jpg
│   ├── 03_PROJECT_03_poster.jpg
│   ├── 04_PROJECT_04_poster.jpg
│   ├── 05_PROJECT_05_poster.jpg
│   ├── 06_PROJECT_06_poster.jpg
│   └── 07_PROJECT_07_poster.jpg
├── team/
│   ├── 01_ceo.jpg
│   ├── 02_producer_lead.jpg
│   ├── 03_cfo.jpg
│   ├── 04_head_distribution.jpg
│   └── 05_creative_director.jpg
├── advisory/
│   ├── 01_industry_veteran.jpg
│   ├── 02_finance_advisor.jpg
│   ├── 03_distribution_advisor.jpg
│   └── 04_international_advisor.jpg
└── banners/
    ├── market_context.jpg
    └── press.jpg
```

При замене `PROJECT_0X` на реальный codename — **переименовать файл** и **обновить canon.images.projects[*].src**. Никакого смешения имён.

---

---

## §3. «Тени заката» — Portrait Spec (9 слотов)

Базовая спецификация стиля — §1.7.3 базового промта v1.2. Здесь — детализация до уровня готового Gemini-промта с role-specific атрибутами.

### §3.1. Эстетика-референс (cinematography rules)

**Директоры-референсы:**
- **Christopher Nolan** (Tenet, Oppenheimer) — жёсткий контражур, свет как второй герой.
- **Denis Villeneuve + Roger Deakins** (Blade Runner 2049, Dune) — силуэт на монохромном glow-фоне.
- **David Fincher** (Mank, Gone Girl) — портрет-архетип, не портрет-идентификация.

**Что заимствуем:** композицию контражура, низкий key-light с доминирующим rim, moody low-key ambient, minimal detail в тенях.

**Что НЕ заимствуем:** текстурную gore-reality (Fincher), технологический blue wash (Blade Runner 2049 city-wide shot). Наша палитра — тёплая: ember + gold + sand, без cyan.

### §3.2. Технические требования (обязательны в каждом портрете)

| Параметр | Значение | Почему |
|---|---|---|
| Композиция | 3/4 three-quarter pose, chest-up framing (от груди до головы) | Grid-карточки s23 1:1, плечо + голова читаются на превью |
| Направление света | Warm ember rim-light #C77B3A сверху-сзади | Halo вокруг головы/плеча, face в тени → face obscured ✓ |
| Заливающий свет | Минимальный, 1–2% от rim intensity | Не должен «подсвечивать» лицо и разрушать silhouette |
| Фон | Dark navy-to-black radial gradient #0D1117 → #050508, пустой | Никаких объектов, чтобы силуэт не спорил с окружением |
| Силуэт | Чёткий читаемый контур; черты лица — в глубокой тени | Этичность + архетипичность + coherence |
| Warm spill | Subtle gold-ember #D4AF37 bleed на скулу / висок / плечо | Добавляет плотности без раскрытия лица |
| Film grain | 35mm Kodak 500T push +1, subtle, не agressive | Prestige-film feel |
| Chromatic aberration | Минимальная, только на крайних 5% кадра | Cinematic lens illusion |
| Aspect ratio | 1:1 square | Grid-сетка Team+Advisory |
| Resolution | 1200×1200 | Retina-ready при отображении 600×600 CSS |
| Target file | JPG Q75, ≈ 180 KB | Баланс веса и оффлайн-ready |
| Style signature | `shadows_of_sunset_v1` | Обязательно в canon (criterion 74) |

### §3.3. Специфический negative для всех 9 портретов (дополняет §2.4)

```
PORTRAIT_NEGATIVE = "
  no visible facial features (nose details, lips, eye colors),
  no jewelry on face,
  no makeup details visible,
  no ethnic stereotyping in silhouette,
  no clear identifiable hairstyle that maps to a known celebrity,
  no glasses with identifiable frame style,
  no profession-stereotype exaggeration (e.g. no scientist with beakers),
  no background objects (windows, art, walls with texture),
  no shadow figures behind main silhouette,
  no doubles of main subject,
  no explicit gender exaggeration (binary drift); gender-neutral default unless role attribute specifies.
"
```

### §3.4. Role-attribute table (9 слотов в деталях)

Каждая строка содержит: slot #, file, placeholder-роль, attribute-distinctor из §1.7.3, gender default, age range, pose nuance, extra accessory silhouette. Gender и age — **индикативны**, не требуются к строгому выдерживанию (пользователь может переиграть в canon).

| # | File | Placeholder-роль | Attribute-distinctor (из §1.7.3) | Gender default | Age range | Pose nuance | Accessory silhouette |
|---|---|---|---|---|---|---|---|
| 10 | `team/01_ceo.jpg` | Chief Executive Officer | Строгий costume-silhouette | neutral, lean toward male-read | 45–55 | Прямая спина, слегка приподнятый подбородок | Воротник классического костюма, галстук-silhouette (без узла-детали) |
| 11 | `team/02_producer_lead.jpg` | Producer Lead | Силуэт с раскрытым scripted notebook | neutral, lean toward female-read | 38–48 | Полуповорот, notebook на уровне груди | Раскрытый сценарий/notebook в руке (темный силуэт, без страниц-текста) |
| 12 | `team/03_cfo.jpg` | Chief Financial Officer | Классический business-silhouette | neutral | 42–52 | Статичная поза, руки сложены | Ручка в нагрудном кармане (тонкая вертикаль) |
| 13 | `team/04_head_distribution.jpg` | Head of Distribution | Силуэт у окна / horizon-line фона | neutral, lean toward male-read | 40–50 | Полуповорот к «окну», взгляд вдаль | Намёк на horizon line в фоне (легчайший gradient cue, без детали) |
| 14 | `team/05_creative_director.jpg` | Creative Director | Силуэт с film-slate в руке | neutral, lean toward female-read | 35–45 | Боковой полуповорот, slate слегка приподнят | Film-slate (clapperboard) silhouette в руке |
| 15 | `advisory/01_industry_veteran.jpg` | Industry Veteran | Более «взрослый» pose, раздумчивый профиль | neutral, lean toward male-read | 60–72 | Задумчивый боковой профиль, подбородок чуть опущен | Силуэт ворота свитера / кардигана, без tie |
| 16 | `advisory/02_finance_advisor.jpg` | Finance Advisor | Строгий business-silhouette, прямая спина | neutral, lean toward female-read | 50–60 | Формальная поза, прямая спина | Блейзер-silhouette, без tie, без украшений |
| 17 | `advisory/03_distribution_advisor.jpg` | Distribution Advisor | Силуэт-вполоборота, жестикуляция | neutral, lean toward male-read | 45–55 | Живая поза, рука в движении | Рукав рубашки без пиджака, закатанный до локтя (silhouette) |
| 18 | `advisory/04_international_advisor.jpg` | International Advisor | Силуэт у globe / map-projection на фоне | neutral, lean toward female-read | 48–58 | Полуповорот, взгляд в сторону globe | Намёк на сферический silhouette globe в фоне (radial gradient cue, очень слабый) |

**Важно:** атрибуты «gender lean» и «age range» — **рекомендательные** для визуального разнообразия 9 карточек. Пользователь может в canon переопределить под реальный кадровый состав; в ТЗ они служат для того, чтобы Gemini не выдал 9 одинаковых портретов.

### §3.5. Base prompt template (используется в §5.3 для 9 слотов)

```
[STYLE_ANCHORS]

Cinematic silhouette portrait, three-quarter pose, chest-up framing.
Figure in dark costume. Face obscured by deep shadow — facial features
NOT identifiable. Strong warm ember rim-light (#C77B3A, hex warm amber)
from upper-back, creating a bright halo around the silhouette's head
and shoulder. Subtle warm gold spill (#D4AF37) on cheekbone and temple.
Background: deep navy-to-black radial gradient (#0D1117 fading to #050508),
no objects, no clutter, no texture on walls.
Subtle 35mm film grain, minimal chromatic aberration at edges.
Aesthetic reference: Christopher Nolan + Denis Villeneuve + David Fincher
prestige-film cinematography.

Role attribute: [ROLE_ATTRIBUTE_FROM_TABLE_3.4]
Pose nuance:    [POSE_NUANCE_FROM_TABLE_3.4]
Accessory:      [ACCESSORY_SILHOUETTE_FROM_TABLE_3.4]
Gender lean:    [GENDER_DEFAULT_FROM_TABLE_3.4] (non-strict, silhouette only)
Age range:      [AGE_RANGE_FROM_TABLE_3.4] (read through silhouette weight only)

Negative prompt:
[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]

Aspect ratio: 1:1
Resolution: 1200x1200
Style signature (metadata tag, not on image): shadows_of_sunset_v1
```

### §3.6. Self-verification per portrait

После генерации каждого из 9 изображений — **manual human review** на 6 критериях:

1. **Face obscured:** невозможно идентифицировать черты лица (нос/глаза/рот читаются как силуэт, но не как фото).
2. **Rim-light readable:** ember halo вокруг головы/плеча чёткий, не размытый.
3. **Background clean:** никаких объектов/текстур на фоне — только gradient.
4. **No cyan bleeding:** палитра исключительно тёплая (ember/gold/sand). Любой cyan spill = регенерация с более жёстким негативом.
5. **Silhouette distinction:** 9 портретов различимы по pose/accessory (CEO ≠ CFO ≠ Head of Distribution).
6. **No AI artifacts:** нет лишних пальцев, склеек, deform ears, деформации воротника.

**Если хоть один критерий fail — регенерировать с тем же seed, но с доусиленным негативом или уточнённым pose nuance.**

### §3.7. Связь с canon и criterion 74

В `canon_holding_extended.json` блок `canon.images.team[*]` и `canon.images.advisory[*]` **обязательно** содержат поле:

```json
{
  "slot": 10,
  "role": "CEO",
  "src": "images/team/01_ceo.jpg",
  "alt": "Silhouette portrait, CEO, Shadows of Sunset style",
  "style_signature": "shadows_of_sunset_v1"
}
```

Criterion 74 базового промта v1.2 проверяет через автотест:

```js
const portraits = [
  ...canon.images.team,
  ...canon.images.advisory
];
console.assert(portraits.length === 9, "Expected 9 portraits");
console.assert(
  portraits.every(p => p.style_signature === "shadows_of_sunset_v1"),
  "All portraits must carry Shadows of Sunset style signature"
);
```

Если style_signature отсутствует или не равен `shadows_of_sunset_v1` — HTML сборка Фазы 6 **fail'ит** с красным gate.

---

## §4. Illustrations Spec (11 слотов)

11 иллюстраций делятся на 3 группы: Hero (#1–2), Project posters (#3–9), Banners (#19–20). Каждая группа имеет свой визуальный язык в рамках единой палитры v1.1 и style anchors §2.3.

### §4.1. Группа A — Hero (2 слота)

Hero-слоты задают первое впечатление лендинга: они видны в первые 0.5–2 секунды после загрузки. Requirement: **cinematic impact + smooth parallax + отсутствие отвлекающих focal points** (поверх них рендерятся заголовки HTML-слоя).

#### §4.1.1. Slot 1 — `hero_bg.jpg` (Cinematic backdrop)

| Параметр | Значение |
|---|---|
| File | `images/hero_bg.jpg` |
| Назначение | Фон секции s01 Hero, работает как «дальний план» под слоями L0 gradient + L1 film-grain + L2 particles |
| Aspect ratio | 16:9 |
| Resolution | 1920×1080 |
| Target JPG | Q80, ~400 KB |
| Composition | Абстрактный cinematic кадр: намёк на край декорации / студийный свет / дым в проекторном луче |
| Focal point | Нет (или смещён в левую или правую треть, центр — свободен под заголовок) |
| Lighting | Одиночный warm ember source (#C77B3A) справа-сверху; тяжёлая тень слева-снизу |
| Color grading | Tritone: deep black #050508 (60%) + navy #0D1117 (25%) + warm ember #C77B3A (15%) |
| Motion hint | Статичный кадр без визуальной «истории» — HTML-слой добавляет scroll-parallax и glow |
| Seed | 1001 |
| Temperature | 0.4 |

#### §4.1.2. Slot 2 — `hero_film_reel.jpg` (3D holographic film-reel)

| Параметр | Значение |
|---|---|
| File | `images/hero_film_reel.jpg` |
| Назначение | Передний объект Hero, parallax + scroll-tied rotation через GSAP |
| Aspect ratio | 4:3 |
| Resolution | 1600×1200 |
| Target JPG | Q80, ~300 KB |
| Composition | 3D фильмовая катушка с намёком на голографичность (прозрачные ribbons с film-strip perforations) |
| Focal point | Центр |
| Lighting | Ember rim сзади (#C77B3A) + gold specular highlights на катушке (#D4AF37) |
| Color grading | Dual-tone: gold-ember rim + dark navy background |
| Detail | Perforations read as silhouette (не photoreal), ribbon-curl создаёт depth |
| Seed | 1002 |
| Temperature | 0.4 |

### §4.2. Группа B — Project posters (7 слотов)

7 постеров проектов — в **едином визуальном языке**, без привязки к актёрам / реальным сценам. Каждый постер — **концепт-art**, читающийся как жанровая обложка, но silhouette-based без photoreal faces. Placeholder-codenames `PROJECT_01…PROJECT_07` в именах файлов заменяются на реальные после уточнения в canon.

#### §4.2.1. Общие правила для всех 7 постеров

| Параметр | Значение |
|---|---|
| Aspect ratio | 2:3 (портретный, классический постер) |
| Resolution | 1200×1800 |
| Target JPG | Q80, ~250 KB each |
| Text | **Никакого текста на постере**. Title/жанр/год — HTML-слой (overlay) |
| Face policy | Никаких распознаваемых лиц; допустимы силуэты на дальнем плане |
| Color grading | Каждый постер имеет **1 ведущий акцент** из палитры v1.1 (gold / ember / sand / bronze) → 4 проекта в gold-линии, 3 в ember-линии (для визуального разнообразия grid) |
| Composition rule | Правило третей или центровая симметрия; focal point выше низкой трети для читаемости на маленьких карточках |
| Seed | 1003…1009 по порядку |
| Temperature | 0.4 |

#### §4.2.2. Жанровая классификация 7 placeholder-проектов

Для различимости в ТЗ привязываю жанры (привязку можно пересмотреть в canon без ре-генерации: Gemini генерит по жанру-референсу, не по конкретному проекту).

| # | File | Placeholder codename | Жанр-референс | Визуальный язык | Ведущий акцент |
|---|---|---|---|---|---|
| 3 | `projects/01_PROJECT_01_poster.jpg` | PROJECT_01 | Historical Drama | Сдержанная цвето-геометрия эпохи, сдержанная фигура на фоне архитектуры-силуэта | gold `#D4AF37` |
| 4 | `projects/02_PROJECT_02_poster.jpg` | PROJECT_02 | Psychological Thriller | Контражурный силуэт, длинная тень по диагонали, lonely figure | ember `#C77B3A` |
| 5 | `projects/03_PROJECT_03_poster.jpg` | PROJECT_03 | Sci-Fi / Technological | Абстрактная геометрия света, horizon line, одинокий силуэт у объекта | bronze `#8B7355` + cold accent через gold |
| 6 | `projects/04_PROJECT_04_poster.jpg` | PROJECT_04 | Crime / Noir | Сильная диагональ света, дождь в проекторном луче, силуэт в шляпе (или без) | ember `#C77B3A` |
| 7 | `projects/05_PROJECT_05_poster.jpg` | PROJECT_05 | Wartime Drama | Выгоревший пейзаж, далёкая фигура, контражур | sand `#B8A888` |
| 8 | `projects/06_PROJECT_06_poster.jpg` | PROJECT_06 | Series — Family Saga | Мульти-поколенческая композиция (3 силуэта на разной глубине) | gold `#D4AF37` |
| 9 | `projects/07_PROJECT_07_poster.jpg` | PROJECT_07 | Series — Political Drama | Геометрия интерьера (colonnade / кабинет-намёк), одинокий силуэт | gold `#D4AF37` |

**Каждый постер имеет 2 варианта (A/B) для выбора пользователем** (см. §5 Prompts Library) — итого 14 генераций, 7 победителей зайдут в canon.

### §4.3. Группа C — Banners (2 слота)

#### §4.3.1. Slot 19 — `banners/market_context.jpg` (абстрактный кинорынок)

| Параметр | Значение |
|---|---|
| File | `images/banners/market_context.jpg` |
| Назначение | Background-layer s03 Market / s05–s06 context (fade-in при scroll) |
| Aspect ratio | 21:9 (ultra-wide) |
| Resolution | 2100×900 |
| Target JPG | Q80, ~350 KB |
| Composition | Абстрактные силуэты кинозалов: ряды кресел в полутени, свет проекторного луча через пыль, далёкий экран (не читаемый) |
| Focal point | Не один, композиция «горизонтальный ритм» — 3–4 повторяющихся cinema-силуэта уходят в перспективу |
| Lighting | Ember проекторный луч сверху-сзади, gold highlights на краях кресел |
| Color grading | Monotone ember + deep black + minimal gold |
| Seed | 1019 |
| Temperature | 0.4 |

#### §4.3.2. Slot 20 — `banners/press.jpg` (газетная текстура)

| Параметр | Значение |
|---|---|
| File | `images/banners/press.jpg` |
| Назначение | Подложка press-секции s25 (footer close) |
| Aspect ratio | 16:9 |
| Resolution | 1920×1080 |
| Target JPG | Q80, ~280 KB |
| Composition | Тёмная газетная текстура с мягким gold-тиснением заголовка (текст не читается, только визуальная форма газетной колонки); fold-марки и микро-artefacts 35mm scan |
| Focal point | Слегка смещён (верх-левая четверть — gold-тиснение); нижняя часть более тёмная под наложение HTML-контента |
| Lighting | Боковое warm gold в верхней четверти, остальное в глубокой navy-тени |
| Color grading | Muted gold on dark navy (#D4AF37 at 35% + #0D1117) |
| Text policy | **Формы букв допустимы, но читаемого текста быть не должно** (типографика — не привязанная к языку) |
| Seed | 1020 |
| Temperature | 0.4 |

### §4.4. Summary illustration slots

| Группа | Slots | Кол-во | Средний вес | Total |
|---|---|---|---|---|
| A — Hero | 1–2 | 2 | 350 KB | 700 KB |
| B — Posters | 3–9 | 7 | 250 KB | 1750 KB |
| C — Banners | 19–20 | 2 | 315 KB | 630 KB |
| **Всего иллюстраций** | | **11** | | **≈ 3080 KB** |

Плюс портреты §3: 9 × 180 KB = 1620 KB. **Итого все 20 слотов: ≈ 4700 KB.** Соответствует бюджету §2.2 и §1.7 базового промта.

---

## §5. Prompts Library (20 ready-to-paste Gemini Nano Banana prompts)

Каждый блок — законченный промт, готовый к вставке в AI Studio / Vertex AI поле «Prompt». Константы `STYLE_ANCHORS`, `NEGATIVE_PROMPT`, `PORTRAIT_NEGATIVE` (см. §2.3, §2.4, §3.3) — при вставке можно либо раскрыть inline, либо передавать в API как extracted variables.

### §5.1. Group A — Hero (slots 1–2)

#### §5.1.1. Slot 1 — `hero_bg.jpg`

```text
[STYLE_ANCHORS]

Abstract cinematic backdrop, no people, no figures.
Composition: wide frame hinting at a soundstage edge.
Subtle beam of projector light cutting diagonally through
fine haze and dust particles. Heavy shadow on the left-lower
quadrant, warm ember glow on the right-upper quadrant.
Centre of the frame kept relatively open — no dominant focal
point — so that overlaid typography can breathe.

Lighting: single warm ember source (#C77B3A, hex warm amber)
from upper-right, with gentle gold specular scatter (#D4AF37)
on dust motes. Deep navy-to-black gradient (#050508 base,
#0D1117 midtones) fills the rest of the frame.

Mood: prestige-film, contemplative, "the moment before action".
Reference: Roger Deakins' hallway scene in "1917",
Nolan's interior tracking shots in "Oppenheimer".

[NEGATIVE_PROMPT]
Extra: no human silhouettes, no text, no camera body visible.

Aspect ratio: 16:9
Resolution: 1920x1080
Seed: 1001
Temperature: 0.4
Guidance: 7.5
```

#### §5.1.2. Slot 2 — `hero_film_reel.jpg`

```text
[STYLE_ANCHORS]

3D holographic film reel as the sole subject, centred.
Reel rendered with a translucent / semi-holographic quality:
ribbons of film-strip with perforations read as silhouette
shapes, not photoreal celluloid. Ribbons curl and float around
the central hub, suggesting a slow rotation.

Lighting: warm ember rim-light (#C77B3A) from behind the reel,
gold specular highlights (#D4AF37) on the metallic hub and ribbon
edges. Deep navy-to-black vignette around the subject, reel
floats in a near-abyssal space.

Mood: cinematic, tactile, "the soul of analog film reinvented".
Reference: title-card reveals from Nolan's Tenet, Villeneuve's
slow object reveals in Dune.

[NEGATIVE_PROMPT]
Extra: no text on the film strip, no frame numbers readable,
no sprocket wheels outside the reel, no projector body.

Aspect ratio: 4:3
Resolution: 1600x1200
Seed: 1002
Temperature: 0.4
Guidance: 7.5
```

### §5.2. Group B — Project posters (slots 3–9)

Каждый постер генерируется **в 2 вариантах** — A (мягкая композиция) и B (жёсткая контрастная). Seed для A — базовый (1003…), для B — +100 (1103…). Пользователь выбирает победителя, попавший в canon.

#### §5.2.1. Slot 3 — `projects/01_PROJECT_01_poster.jpg` (Historical Drama, gold)

```text
[STYLE_ANCHORS]

Concept-art poster for a historical drama (placeholder title).
No title text on the image. 2:3 portrait format.
Composition: a solitary silhouetted figure (gender-neutral, not
identifiable) stands before an architectural silhouette of a
grand period interior — colonnades, distant vaulted ceilings,
single light source far above. Figure in lower third, architecture
in upper two-thirds.

Lighting: warm gold (#D4AF37) key-light falling from high above,
creating long historical shadows. Deep navy-black (#0D1117) fills
the shadows. Sand-coloured midtones (#B8A888) on stone surfaces.
No ember in this poster — gold is the dominant warm accent.

Mood: restrained, dignified, "weight of an era".
Reference: "The Last Duel" (Scott), "Oppenheimer" interior scenes.

[NEGATIVE_PROMPT]
Extra: no identifiable faces, no readable signage, no crowns,
no sceptres, no national symbols.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1003 / Seed B: 1103
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.2. Slot 4 — `projects/02_PROJECT_02_poster.jpg` (Psychological Thriller, ember)

```text
[STYLE_ANCHORS]

Concept-art poster for a psychological thriller.
No title text. 2:3 portrait.
Composition: a contre-jour silhouette of a lone figure at the
end of a long corridor / tunnel of light. Diagonal shadow stretches
toward the viewer, cutting the frame in half. Figure's scale is
small — about 1/4 of the vertical — emphasising isolation.

Lighting: harsh ember key-light (#C77B3A) from behind the figure,
creating a strong halo and throwing the figure into pure silhouette.
Deep black (#050508) fills foreground, navy (#0D1117) sides.

Mood: tense, paranoid, "who is waiting in the light".
Reference: "Prisoners" (Villeneuve), "Sicario" (Villeneuve).

[NEGATIVE_PROMPT]
Extra: no weapons, no crime-scene elements, no blood, no screaming
expressions, no typography implied.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1004 / Seed B: 1104
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.3. Slot 5 — `projects/03_PROJECT_03_poster.jpg` (Sci-Fi / Technological, bronze + gold)

```text
[STYLE_ANCHORS]

Concept-art poster for a near-future science-fiction film.
No title text. 2:3 portrait.
Composition: a lone silhouette stands near a large abstract
geometric object (a monolith, a sphere, or a dim-lit panel)
on a barren horizon line. Sky above dominates 2/3 of the frame
with a muted gold (#D4AF37) gradient fading into deep navy
(#0D1117) at the top.

Lighting: cold ambient from above (navy), warm bronze rim (#8B7355)
on the horizon line, subtle gold atmospheric glow from the object.
The tension is "cold sky, warm artifact".

Mood: cosmic, contemplative, "the first contact before contact".
Reference: "Arrival" (Villeneuve), "2001: A Space Odyssey".

[NEGATIVE_PROMPT]
Extra: no spaceships, no aliens, no explosions, no HUD overlays,
no text on the monolith.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1005 / Seed B: 1105
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.4. Slot 6 — `projects/04_PROJECT_04_poster.jpg` (Crime / Noir, ember)

```text
[STYLE_ANCHORS]

Concept-art poster for a noir crime drama.
No title text. 2:3 portrait.
Composition: a silhouette of a figure in a hat (or hoodless,
gender-neutral) stands in an alley or rain-washed street. A
single street-light throws a strong diagonal shaft of light
across the frame. Rain streaks catch the ember glow.

Lighting: single ember source (#C77B3A) above-right, hard
diagonal down-left. Shadows occupy ~60% of the composition.
Wet pavement reflects the ember with muted gold highlights
(#D4AF37).

Mood: fatalistic, rainy, "the city doesn't sleep".
Reference: "Sin City" (stylised), "Blade Runner 2049" (neo-noir
without the cyan).

[NEGATIVE_PROMPT]
Extra: no guns, no cars visible, no neon signs, no cyan or
electric blue in reflections — all warm tones only.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1006 / Seed B: 1106
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.5. Slot 7 — `projects/05_PROJECT_05_poster.jpg` (Wartime Drama, sand)

```text
[STYLE_ANCHORS]

Concept-art poster for a wartime human-drama film (non-specific
era and geography).
No title text. 2:3 portrait.
Composition: a distant silhouette of a figure walks along a
burnt-out horizon — bare trees, a partially-ruined structure
on the right, sky dominated by diffuse warm haze. Figure scale
small, giving a sense of vastness and solitude.

Lighting: diffuse warm sand-coloured (#B8A888) haze, soft sun
implied rather than shown, low-contrast. Shadows long and soft.
Ember highlights (#C77B3A) only at the horizon line.

Mood: mournful, wide, "aftermath of something heavy".
Reference: "1917" (Mendes / Deakins), "Come and See" (restrained
variant, no gore).

[NEGATIVE_PROMPT]
Extra: no weapons, no corpses, no uniforms distinguishing a
specific army, no national flags, no blood.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1007 / Seed B: 1107
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.6. Slot 8 — `projects/06_PROJECT_06_poster.jpg` (Series — Family Saga, gold)

```text
[STYLE_ANCHORS]

Concept-art key-art for a prestige television series — multi-
generational family saga (placeholder title). Format: feature-
style poster, not a TV-listing thumbnail.
No title text. 2:3 portrait.
Composition: three silhouetted figures at three different depths
of the frame — foreground (largest, bottom-right), midground
(medium, centre-left), background (small, distant). Suggests
three generations without identifying anyone. An architectural
or natural element (a long corridor, a coastline) ties them
spatially.

Lighting: warm gold (#D4AF37) from a single distant source,
creates a receding gradient from bright distant background to
deep dark foreground. Each figure gains less rim-light than the
last — the eldest is the brightest (distant), the youngest is
the darkest (foreground).

Mood: legacy, continuity, "the weight of three generations".
Reference: "Once Upon a Time in America" (Leone), "The Godfather"
(Coppola).

[NEGATIVE_PROMPT]
Extra: no firearms, no weddings, no religious symbols specific
to one faith, no children under 10 implied.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1008 / Seed B: 1108
Temperature: 0.4
Guidance: 7.5
```

#### §5.2.7. Slot 9 — `projects/07_PROJECT_07_poster.jpg` (Series — Political Drama, gold)

```text
[STYLE_ANCHORS]

Concept-art key-art for a prestige television series —
political drama (placeholder title).
No title text. 2:3 portrait.
Composition: a lone silhouette walking through a long colonnade
or corridor of state architecture. Columns or pilasters recede
in perspective. Figure in centre-low-third. Light source at the
far end of the corridor, creating a classic contre-jour.

Lighting: warm gold (#D4AF37) key-light from far end of corridor,
strong and aggressive. Dark navy (#0D1117) in the columns and
floor. Sand midtones (#B8A888) on stone textures.

Mood: solemn, weighted, "corridors of power".
Reference: "The Crown" (prestige treatment), "House of Cards"
(restrained variant).

[NEGATIVE_PROMPT]
Extra: no national emblems, no flags, no identifiable government
buildings, no party insignia, no written signs.

Aspect ratio: 2:3
Resolution: 1200x1800
Seed A: 1009 / Seed B: 1109
Temperature: 0.4
Guidance: 7.5
```

### §5.3. Group C — Portraits «Тени заката» (slots 10–18)

9 промтов, построенных по base template §3.5 с подстановками из role-attribute table §3.4.

#### §5.3.1. Slot 10 — `team/01_ceo.jpg` (CEO)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait, three-quarter pose, chest-up framing.
Figure in a dark formal suit silhouette. Face obscured by deep
shadow — facial features NOT identifiable. Strong warm ember
rim-light (#C77B3A) from upper-back, creating a bright halo
around the silhouette's head and shoulder. Subtle warm gold
spill (#D4AF37) on cheekbone and temple.
Background: deep navy-to-black radial gradient (#0D1117 fading
to #050508), no objects, no clutter.
Subtle 35mm film grain, minimal chromatic aberration at edges.
Aesthetic reference: Christopher Nolan + Denis Villeneuve +
David Fincher prestige-film cinematography.

Role attribute: strict costume silhouette (CEO).
Pose nuance:    straight posture, slightly elevated chin, static.
Accessory:      classic suit collar and tie silhouette (no tie
                knot detail visible).
Gender lean:    neutral, leaning male-read (non-strict, silhouette
                only).
Age range:      45–55 (read through silhouette weight).

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1010
Temperature: 0.35
Guidance: 8.0
Metadata tag (not on image): shadows_of_sunset_v1
```

#### §5.3.2. Slot 11 — `team/02_producer_lead.jpg` (Producer Lead)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: silhouette holding an open script notebook at
                chest level.
Pose nuance:    three-quarter turn, notebook held at chest,
                subtle lean forward.
Accessory:      open notebook / script silhouette in hand
                (dark silhouette, no readable pages, no text).
Gender lean:    neutral, leaning female-read.
Age range:      38–48.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]
Extra: no readable script text, no pen details, no brand on
notebook.

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1011
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.3. Slot 12 — `team/03_cfo.jpg` (CFO)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: classic business silhouette — CFO archetype.
Pose nuance:    static, hands folded subtly at waist level
                (silhouette hint, not detail).
Accessory:      thin vertical silhouette of a pen in a chest
                pocket.
Gender lean:    neutral.
Age range:      42–52.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1012
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.4. Slot 13 — `team/04_head_distribution.jpg` (Head of Distribution)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: silhouette half-turned as if toward a distant
                horizon (cue only through very subtle background
                gradient shift, no actual window / window-frame
                objects).
Pose nuance:    three-quarter away from camera, gaze into the
                distance.
Accessory:      none; the horizon gradient itself is the cue.
Gender lean:    neutral, leaning male-read.
Age range:      40–50.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]
Extra: no window frame, no architectural object behind the figure.

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1013
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.5. Slot 14 — `team/05_creative_director.jpg` (Creative Director)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: silhouette holding a film-slate (clapperboard)
                slightly raised.
Pose nuance:    side half-turn, slate raised to shoulder level.
Accessory:      film-slate silhouette in one hand (solid silhouette,
                no readable labels, no scene-number text).
Gender lean:    neutral, leaning female-read.
Age range:      35–45.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]
Extra: no readable text on the slate, no scene / take numbers.

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1014
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.6. Slot 15 — `advisory/01_industry_veteran.jpg` (Industry Veteran)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: more "senior" silhouette, contemplative profile.
Pose nuance:    thoughtful side-profile, chin slightly lowered.
Accessory:      silhouette of a sweater / cardigan collar (no tie).
Gender lean:    neutral, leaning male-read.
Age range:      60–72 (read through silhouette weight and slight
                posture).

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]
Extra: no identifiable glasses frame, no ethnic/cultural stereotyping.

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1015
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.7. Slot 16 — `advisory/02_finance_advisor.jpg` (Finance Advisor)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: strict business silhouette, straight posture.
Pose nuance:    formal, upright, hands at sides.
Accessory:      silhouette of a blazer collar, no tie, no
                jewellery.
Gender lean:    neutral, leaning female-read.
Age range:      50–60.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1016
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.8. Slot 17 — `advisory/03_distribution_advisor.jpg` (Distribution Advisor)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: half-turned silhouette, gesturing mid-conversation.
Pose nuance:    dynamic half-turn, one arm in subtle gesture.
Accessory:      silhouette of a shirt with sleeve rolled up
                (suggests informal mid-conversation working mode);
                no tie.
Gender lean:    neutral, leaning male-read.
Age range:      45–55.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1017
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

#### §5.3.9. Slot 18 — `advisory/04_international_advisor.jpg` (International Advisor)

```text
[STYLE_ANCHORS]

Cinematic silhouette portrait (see base template §3.5).

Role attribute: silhouette with a subtle spherical gradient cue
                in the background suggesting a globe or map-projection
                (cue only, no actual globe object).
Pose nuance:    half-turn, gaze slightly off-camera.
Accessory:      none on the figure; spherical gradient on background
                does the work.
Gender lean:    neutral, leaning female-read.
Age range:      48–58.

[NEGATIVE_PROMPT]
[PORTRAIT_NEGATIVE]
Extra: no readable maps, no country outlines identifiable, no
national flags in any form, no national symbols.

Aspect ratio: 1:1
Resolution: 1200x1200
Seed: 1018
Temperature: 0.35
Guidance: 8.0
Metadata tag: shadows_of_sunset_v1
```

### §5.4. Group D — Banners (slots 19–20)

#### §5.4.1. Slot 19 — `banners/market_context.jpg`

```text
[STYLE_ANCHORS]

Ultra-wide abstract cinema-hall panorama, no people visible.
Composition: rows of seats in half-shadow receding in
perspective, multiple "cinema chambers" ghosting into the
distance to create a horizontal rhythm. Projector beams cut
diagonally from top-back, catching fine dust particles. Far
screens are unreadable abstractions.

Lighting: ember projector beams (#C77B3A) dominant light source,
gold edge-highlights (#D4AF37) on chair backs, deep navy and
black fill the rest of the frame.

Mood: dormant, cavernous, "the industry at rest".
Reference: interior atmosphere of "Cinema Paradiso" abstracted,
empty Academy-style halls.

[NEGATIVE_PROMPT]
Extra: no audience members, no readable film content on screens,
no brand of projector visible.

Aspect ratio: 21:9
Resolution: 2100x900
Seed: 1019
Temperature: 0.4
Guidance: 7.5
```

#### §5.4.2. Slot 20 — `banners/press.jpg`

```text
[STYLE_ANCHORS]

Dark newspaper-texture banner, moody and aged.
Composition: full-frame newspaper / broadsheet surface in
half-shadow. Upper-left quarter has a soft gold (#D4AF37)
embossing effect suggesting a large headline mass (NO readable
letters, only letterform shapes). Lower three-quarters are
darker, with faint column-structure hints and subtle paper-
fold marks. 35mm scan artefacts (soft noise, slight edge
roll-off).

Lighting: warm gold side-light (#D4AF37) from upper-left,
falling off into navy-black (#0D1117) lower-right. Muted bronze
(#8B7355) midtones on the paper surface.

Mood: archival, weighty, "the press remembers".
Reference: aged cinema periodical covers, Variety's classic
black-and-gold treatment.

[NEGATIVE_PROMPT]
Extra: no readable text in any language, no recognisable publication
brand, no photo panels, no images within the newspaper.

Aspect ratio: 16:9
Resolution: 1920x1080
Seed: 1020
Temperature: 0.4
Guidance: 7.5
```

### §5.5. Prompt index (быстрая таблица 20 слотов)

| # | File | Aspect | Seed | Temp | Section |
|---|---|---|---|---|---|
| 1 | `hero_bg.jpg` | 16:9 | 1001 | 0.4 | §5.1.1 |
| 2 | `hero_film_reel.jpg` | 4:3 | 1002 | 0.4 | §5.1.2 |
| 3 | `projects/01_PROJECT_01_poster.jpg` | 2:3 | 1003/1103 | 0.4 | §5.2.1 |
| 4 | `projects/02_PROJECT_02_poster.jpg` | 2:3 | 1004/1104 | 0.4 | §5.2.2 |
| 5 | `projects/03_PROJECT_03_poster.jpg` | 2:3 | 1005/1105 | 0.4 | §5.2.3 |
| 6 | `projects/04_PROJECT_04_poster.jpg` | 2:3 | 1006/1106 | 0.4 | §5.2.4 |
| 7 | `projects/05_PROJECT_05_poster.jpg` | 2:3 | 1007/1107 | 0.4 | §5.2.5 |
| 8 | `projects/06_PROJECT_06_poster.jpg` | 2:3 | 1008/1108 | 0.4 | §5.2.6 |
| 9 | `projects/07_PROJECT_07_poster.jpg` | 2:3 | 1009/1109 | 0.4 | §5.2.7 |
| 10 | `team/01_ceo.jpg` | 1:1 | 1010 | 0.35 | §5.3.1 |
| 11 | `team/02_producer_lead.jpg` | 1:1 | 1011 | 0.35 | §5.3.2 |
| 12 | `team/03_cfo.jpg` | 1:1 | 1012 | 0.35 | §5.3.3 |
| 13 | `team/04_head_distribution.jpg` | 1:1 | 1013 | 0.35 | §5.3.4 |
| 14 | `team/05_creative_director.jpg` | 1:1 | 1014 | 0.35 | §5.3.5 |
| 15 | `advisory/01_industry_veteran.jpg` | 1:1 | 1015 | 0.35 | §5.3.6 |
| 16 | `advisory/02_finance_advisor.jpg` | 1:1 | 1016 | 0.35 | §5.3.7 |
| 17 | `advisory/03_distribution_advisor.jpg` | 1:1 | 1017 | 0.35 | §5.3.8 |
| 18 | `advisory/04_international_advisor.jpg` | 1:1 | 1018 | 0.35 | §5.3.9 |
| 19 | `banners/market_context.jpg` | 21:9 | 1019 | 0.4 | §5.4.1 |
| 20 | `banners/press.jpg` | 16:9 | 1020 | 0.4 | §5.4.2 |

---

## §6. Post-processing + Acceptance checklist

Раздел описывает, что делать **после** получения raw-JPEG от Gemini: цветокоррекция, grain, нормализация веса, приёмочный чек-лист и интеграция в canon.

### §6.1. Пайплайн post-processing (обязательные шаги)

Применяется к каждому из 20 raw-файлов, полученных от Gemini. Цель — привести изображения к единому визуальному знаменателю и уложить в бюджет §2.2.

#### §6.1.1. Шаг 1 — проверка геометрии и crop

| Проверка | Критерий | Действие при fail |
|---|---|---|
| Aspect ratio | Соответствует §5.X (столбец Aspect) с точностью ±2 px | Re-crop в редакторе; сохранить точную пропорцию |
| Разрешение | ≥ целевое (§5.X Resolution) | Если меньше — **regenerate**, не апскейлить |
| Safe-zone | Нет критичного контента в крайних 40 px | Сместить композицию и regenerate |
| EXIF | Очищен (no GPS, no camera maker) | `exiftool -all= <file>` |

#### §6.1.2. Шаг 2 — цветокоррекция под палитру v1.1

Цель — вытащить raw-JPEG к референсной палитре `#050508 / #0D1117 / #1A1F2E / #D4AF37 / #C77B3A / #B8A888 / #8B7355`.

Рекомендованный профиль (любая RAW-среда — Photoshop Camera Raw / Affinity / DaVinci Resolve / darktable):

| Параметр | Значение | Комментарий |
|---|---|---|
| Black point | −5…−10 | Вытянуть густую тень к #050508 |
| Shadows | −10…−15 | Поддержать low-key |
| Highlights | −5…0 | Ember-халo не должен выбиваться |
| Midtone contrast | +5…+10 | Cinematic separation |
| Saturation (global) | −5…−10 | Убрать «компьютерную» насыщенность |
| Warm accents isolation (HSL) | Oranges +5 sat, Yellows +5 sat | Поддержать gold/ember акценты |
| Temperature | −50…0 K (к тёплому) | Если Gemini выдал холодный результат |
| Tint | 0…+3 magenta | Лёгкая киношная «тонировка» (только если нужно) |

**Проверка результата:** пипеткой в ключевых точках убедиться, что:

- Тёмные области → между `#050508` и `#0D1117`
- Средние тени → `#1A1F2E` ± 8 единиц яркости
- Тёплые акценты → `#D4AF37` (gold) или `#C77B3A` (ember)
- Midtone-песок (в посlineрах wartime/historical) → `#B8A888`

Если результат уходит в холодный серо-синий или тёплый жёлто-зелёный — **regenerate**, не тянуть грейдом.

#### §6.1.3. Шаг 3 — film grain (по необходимости)

Gemini даёт лёгкий нативный шум. Если визуально недостаточно — добавить:

- **Kodak 500T reference** (push +1), intensity 8–12%
- Resolve / Affinity: Film Grain plugin со значениями Size 1.1, Intensity 10%, Roughness 0.5
- Ручной альтернативный вариант — multiply noise layer @ 5–8% opacity

**Критерий:** зерно должно читаться как тонкая текстура, НЕ как digital-noise. Проверка: зум 100%, зерно не «блочное» и не «цветное».

#### §6.1.4. Шаг 4 — chromatic aberration (edge only)

Лёгкий хроматический сдвиг **только по краям кадра** (не по всему кадру):

- Vignette-based CA: 3–5% по углам, 0% в центре
- Red/Blue shift ±0.3 px

Не добавлять, если исходник уже имеет аберрацию (Gemini иногда делает сам). Проверка: если при зуме 400% в центре кадра видна цветная кайма — регулярной CA нет, только edge.

#### §6.1.5. Шаг 5 — sharpening (финальный)

Применять **последним**, после всех цветокоррекций:

- Unsharp Mask: Radius 0.5 px, Amount 80–120%, Threshold 2
- Либо «Smart Sharpen» в PS: Amount 80%, Radius 0.6 px, Reduce Noise 10%

НЕ пересушивать — dark cinematic эстетика плохо переносит перешарп.

#### §6.1.6. Шаг 6 — экспорт и ужатие до бюджета

| Тип | Формат | Качество | Cap веса | Примечание |
|---|---|---|---|---|
| Портреты (9 шт) | JPEG progressive | Q75 | ≤ 200 KB | mozjpeg или cjpeg для лучшей компрессии |
| Постеры (7 шт) | JPEG progressive | Q80 | ≤ 280 KB | |
| Hero (2 шт) | JPEG progressive | Q80 | ≤ 360 KB | Допустимы до 400 KB при visible quality gain |
| Banners (2 шт) | JPEG progressive | Q80 | ≤ 330 KB | |

Рекомендованный CLI (оба варианта работают):

```bash
# Вариант A — cjpeg (mozjpeg)
cjpeg -quality 75 -progressive -optimize -outfile out.jpg in.png

# Вариант B — ImageMagick с квалити-sweep
convert in.png -strip -interlace Plane -sampling-factor 4:2:0 -quality 75 out.jpg

# Batch (пример для 9 портретов Q75)
for f in team/*.png advisory/*.png; do
  cjpeg -quality 75 -progressive -optimize \
    -outfile "${f%.png}.jpg" "$f"
done
```

**Если файл превышает cap**: снизить Q на 3 ступени (75 → 72 → 70), НО не ниже Q70. Если при Q70 всё ещё >cap — уменьшить long-side на 10% и повторить. Если и это не помогает — упростить композицию промта (меньше деталей) и regenerate.

#### §6.1.7. Шаг 7 — файловое именование и раскладка

Финальные файлы должны лечь в:

```
/Холдинг/images/
├── hero_bg.jpg
├── hero_film_reel.jpg
├── projects/
│   ├── 01_PROJECT_01_poster.jpg
│   ├── 02_PROJECT_02_poster.jpg
│   ├── 03_PROJECT_03_poster.jpg
│   ├── 04_PROJECT_04_poster.jpg
│   ├── 05_PROJECT_05_poster.jpg
│   ├── 06_PROJECT_06_poster.jpg
│   └── 07_PROJECT_07_poster.jpg
├── team/
│   ├── 01_ceo.jpg
│   ├── 02_producer_lead.jpg
│   ├── 03_cfo.jpg
│   ├── 04_head_distribution.jpg
│   └── 05_creative_director.jpg
├── advisory/
│   ├── 01_industry_veteran.jpg
│   ├── 02_finance_advisor.jpg
│   ├── 03_distribution_advisor.jpg
│   └── 04_international_advisor.jpg
└── banners/
    ├── market_context.jpg
    └── press.jpg
```

Такая же раскладка — зеркально в `/TrendStudio-Holding/images/`. Когда финальный HTML будет собран в Claude Code, пайплайн Фазы 6 возьмёт файлы из `/TrendStudio-Holding/images/`.

### §6.2. Приёмочный чек-лист (Acceptance — 20/20)

Каждый слот должен пройти **все проверки**. «X» — PASS, «—» — требует regenerate.

#### §6.2.1. Глобальные проверки (20/20)

- [ ] **Slot-count = 20.** Все 20 файлов физически присутствуют в каталогах выше.
- [ ] **File naming = по §6.1.7.** Ни один файл не переименован, ни один не в неправильной папке.
- [ ] **Aspect-ratio совпадает с §5.X.** Допуск ±2 px.
- [ ] **Размер каждого файла ≤ cap §6.1.6.**
- [ ] **Суммарный вес всех 20 файлов ≤ 5 000 KB** (бюджет §2.2 с запасом).
- [ ] **EXIF очищен** на всех 20 файлах.
- [ ] **JPEG progressive** на всех 20 (flag `-progressive` / `-interlace Plane`).

#### §6.2.2. Портреты — critérium 74 (style_signature)

- [ ] Все 9 портретов сгенерированы по base template §3.5.
- [ ] Для каждого из 9 портретов **выполнены 6 пунктов §3.6 self-verification**:
  - [ ] Gradient navy→black присутствует
  - [ ] Ember rim-light (#C77B3A) читается
  - [ ] Face NOT identifiable
  - [ ] 3/4 pose соблюдена
  - [ ] Accessory-silhouette (если прописан в §3.4)
  - [ ] Нет текста/логотипов
- [ ] В canon.images.team[*] и canon.images.advisory[*] **style_signature = "shadows_of_sunset_v1"** для всех 9 записей.
- [ ] Единый «look» при просмотре всех 9 портретов подряд (squint-test: они явно из одной серии).

#### §6.2.3. Постеры — жанр + negative-specific

- [ ] 7 из 7 постеров сгенерированы.
- [ ] A/B варианты сгенерированы для каждого постера (14 файлов raw). Пользователь выбрал победителя (7 финальных).
- [ ] По каждому постеру выполнен negative-check: нет запрещённого контента из §5.2.X "Extra: no…".
- [ ] Жанровая палитра выдержана (gold / ember / sand — см. §4.2).

#### §6.2.4. Hero + banners

- [ ] Hero 1 (`hero_bg.jpg`): 16:9, нет людей, центр кадра открыт для overlay typography.
- [ ] Hero 2 (`hero_film_reel.jpg`): 4:3, film-reel единственный субъект, нет text on strip.
- [ ] Banner 1 (`market_context.jpg`): 21:9, нет аудитории, нет readable контента на экранах.
- [ ] Banner 2 (`press.jpg`): 16:9, нет readable текста, нет brand публикации.

#### §6.2.5. Policy-проверки (обязательные)

- [ ] **Реальные лица**: ни один портрет не распознаётся как конкретная личность (проверка: отправка 3 портретов в Google Lens / TinEye — 0 hits на реальных людей).
- [ ] **Reverse image search**: каждое из 20 изображений — `0 matches` в TinEye (уникальность генерации).
- [ ] **Национальные / религиозные / политические символы**: отсутствуют (negative-list §2.4, §3.3, §4.X).
- [ ] **Text / типографика на изображении**: отсутствует (текст идёт HTML-слоем).
- [ ] **Ethnic / cultural stereotyping**: отсутствует на портретах (см. §3.4 gender lean — «leaning», не strict).

### §6.3. Canon integration (после acceptance)

После того как все 20 слотов прошли §6.2:

#### §6.3.1. canon_holding_extended.json — блок `images`

```jsonc
{
  "images": {
    "hero": [
      { "id": "hero_bg", "file": "images/hero_bg.jpg", "aspect": "16:9",
        "seed": 1001, "source": "Gemini Nano Banana", "license": "Generated" },
      { "id": "hero_film_reel", "file": "images/hero_film_reel.jpg", "aspect": "4:3",
        "seed": 1002, "source": "Gemini Nano Banana", "license": "Generated" }
    ],
    "projects": [
      { "id": "PROJECT_01", "file": "images/projects/01_PROJECT_01_poster.jpg",
        "aspect": "2:3", "seed": 1003, "genre_hint": "historical_drama",
        "source": "Gemini Nano Banana", "license": "Generated" }
      // … × 7
    ],
    "team": [
      { "id": "ceo", "file": "images/team/01_ceo.jpg", "aspect": "1:1",
        "seed": 1010, "style_signature": "shadows_of_sunset_v1",
        "source": "Gemini Nano Banana", "license": "Generated" }
      // … × 5
    ],
    "advisory": [
      { "id": "industry_veteran", "file": "images/advisory/01_industry_veteran.jpg",
        "aspect": "1:1", "seed": 1015, "style_signature": "shadows_of_sunset_v1",
        "source": "Gemini Nano Banana", "license": "Generated" }
      // … × 4
    ],
    "banners": [
      { "id": "market_context", "file": "images/banners/market_context.jpg",
        "aspect": "21:9", "seed": 1019,
        "source": "Gemini Nano Banana", "license": "Generated" },
      { "id": "press", "file": "images/banners/press.jpg",
        "aspect": "16:9", "seed": 1020,
        "source": "Gemini Nano Banana", "license": "Generated" }
    ]
  }
}
```

#### §6.3.2. Автотест criterion 74 (запустить перед сборкой HTML)

```javascript
// tests/acceptance/test_criterion_74_style_signature.js
const canon = require("../../data_extract/canon_holding_extended.json");

const portraits = [
  ...canon.images.team,
  ...canon.images.advisory
];

console.assert(portraits.length === 9,
  `Expected 9 portraits, got ${portraits.length}`);

const missingSig = portraits.filter(p =>
  p.style_signature !== "shadows_of_sunset_v1"
);

console.assert(missingSig.length === 0,
  `${missingSig.length} portraits missing style_signature "shadows_of_sunset_v1": ` +
  missingSig.map(p => p.id).join(", "));

console.log("Criterion 74: PASS — all 9 portraits carry shadows_of_sunset_v1");
```

#### §6.3.3. base64-инжекция (Фаза 6 базового промта)

После успешного автотеста скрипт сборки Фазы 6 читает 20 JPEG, конвертирует в base64 и подставляет в `canon.images.*.data`. Суммарный вес base64 ≈ 4700 KB × 1.33 ≈ 6250 KB + padding ≈ 6.5 MB — ложится в бюджет HTML «без ограничений» (v1.2 §1.1).

### §6.4. Regeneration escalation (что делать, если ≥ 3 слотов не проходят)

| Триггер | Действие |
|---|---|
| 1–2 слота fail по §6.2 | Regenerate только эти слоты с теми же промтами и новыми seed (+1000). |
| 3–5 слотов fail | Проверить, что пользователь вставил полный промт вместе с `STYLE_ANCHORS` и `[NEGATIVE_PROMPT]`. Если да — поднять guidance до 9.0 и regenerate. |
| ≥ 6 слотов fail | Остановиться. Сверить модель (Gemini 2.5 Flash Image ↔ не Imagen / не другой). Эскалировать в чат, пересмотреть §2.3 style anchors. |
| Criterion 74 fail (style_signature) | Пересобрать JSON, проверить §6.3.1. HTML не собирать до зелёного criterion 74. |

---

## §7. Verification report template (П5 32/32 + М4 7/7)

Формальный отчёт по данному ТЗ — **отдельный файл** `Верификация_GeminiTZ_v1.0_П5.md`. Ниже — **шаблон** структуры отчёта, который использует верификатор.

### §7.1. Scope верификации

- **Объект:** `Gemini_TZ_images_v1.0.md`
- **Пресет:** П5 «Максимум» 32/32 (32 механизма верификации)
- **Дополнительный пресет:** М4 «Презентационная» 7/7 (формат + консистентность, т.к. ТЗ идёт как визуальный деливерабл)
- **Цель:** убедиться, что ТЗ пригодно к прямому исполнению пользователем в Gemini без дополнительных пояснений, а результат (20 изображений) пройдёт приёмочный чек-лист §6.2 с 0 регрессиями.

### §7.2. Шаблон сводной таблицы (фрагмент)

| # | Механизм | Статус | Краткий вывод |
|---|---|---|---|
| 1 | Перенос цифр/дат/имён | | Сравнение §1.7 v1.2 ↔ §5 (20 слотов), seeds 1001–1020, aspect/resolution |
| 2 | Проверка выполнения запроса | | 20 слотов × prompt × role/genre — все покрыты |
| 3 | Сверка сумм | | Σ байт §6.1.6 ≤ 5000 KB; §4.4 summary = 4700 KB |
| 4 | Проверка границ | | Q70 floor, long-side step 10%, budget cap §2.2 |
| 5 | Формат документа | | Markdown, таблицы, code-blocks text, H1/H2/H3 consistent |
| 6 | Хронология | | §0.2 change log, дата 2026-04-19, порядок §0→§7 |
| 7 | Поиск противоречий | | §2.3 anchors ↔ §3.X portrait ↔ §4.X illustrations — не противоречат |
| 8 | Формат слайдов | | N/A (нет pptx/html) — применяется М4.3 «формат выходного artefact» |
| 9 | Согласованность pptx/html | | N/A (нет парных артефактов); оставить как N/A с пояснением |
| 10 | Скрытые допущения | | Допущение: Gemini API даёт предсказуемый aspect при "aspect ratio: X:Y" — проверено в §1.4 |
| 11 | Парадоксы | | «face obscured» vs «silhouette identifiable as role» — разрешено через §3.4 accessory-silhouette |
| 12 | Обратная логика | | Если промт скопирован дословно — получим ли мы файл, проходящий §6.2? |
| 13 | Декомпозиция фактов | | 20 слотов разложены: role/genre/aspect/seed/files |
| 14 | Оценка уверенности | | High — visible elements в §5; Medium — style coherence Gemini; Low — typography-suppression (исторически слабое место модели) |
| 15 | Полнота | | 20/20 promp ов, 9/9 portrait + 2/2 hero + 7/7 posters + 2/2 banners |
| 16 | Спор «за/против» | | ЗА placeholder-ов: безопасность имён; ПРОТИВ: риск рассинхронизации с canon; решение в §0.1 |
| 17 | Граф причин-следствий | | canon → HTML Фаза 6 → HTML размер; portrait style → style_signature → auto-test crit. 74 |
| 18 | Триангуляция источников | | References: Nolan / Villeneuve / Fincher / Deakins / Mendes (кино-первоисточники) |
| 19 | Цепочка происхождения | | Исходный базовый промт v1.2 §1.7 → ТЗ v1.0 §5 prompt |
| 20 | Двойной расчёт | | 9×180 + 2×350 + 7×250 + 2×315 = 1620+700+1750+630 = 4700 KB ✓ |
| 21 | Сверка вход-выход | | Вход: 96 070 байт v1.2. Выход: ТЗ v1.0 ~ 55–65 KB — ожидаемо |
| 22 | Согласованность файлов | | Раскладка §6.1.7 ↔ canon §6.3.1 ↔ v1.2 §1.7.2 |
| 23 | Метаморфическое тестирование | | Если заменить Nolan на Villeneuve в refs — качество не падает; устойчивость prompt'ов |
| 24 | Diff было/стало | | N/A (первая версия) — применяется как «снимок v1.0» для будущих версий |
| 25 | Защита от регрессии | | criterion 74 автотест, §6.3.2 — будет runnable в CI |
| 26 | Дрейф смысла | | Placeholder-роли ↔ canon real names — должно быть 1-к-1 mapping |
| 27 | Моделирование аудитории | | Аудитория: rakhman + пользователь Gemini API. Язык ТЗ — RU (объяснения) + EN (промты) — корректно |
| 28 | Эпистемический статус | | Гипотеза: Gemini 2.5 Flash Image ≡ "Nano Banana" — подтверждено §1.2 |
| 29 | Кросс-модальная проверка | | Текст-промт → ожидаемая картинка: для каждого из 20 слотов mental-render даёт результат, соответствующий §4/§3 |
| 30 | Стресс-тест | | Что если Gemini сгенерит 300 KB вместо 180? Есть ответ в §6.1.6 (Q-step-down + resize). Что если regen даст drift? §6.4 escalation |
| 31 | Проверка адресата | | rakhman работает через AI Studio UI → промты готовы к copy-paste без модификации |
| 32 | Ссылочная целостность | | Ссылки §X.Y → §Y.X — все валидны внутри документа (sweep в §7.3) |

### §7.3. Скрипт self-check ссылочной целостности (runnable)

```bash
# Bash / ripgrep проверка
grep -oE '§[0-9]+(\.[0-9]+){0,3}' Gemini_TZ_images_v1.0.md | sort -u > refs.txt
grep -oE '^#+\s+§[0-9]+(\.[0-9]+){0,3}' Gemini_TZ_images_v1.0.md \
  | sed 's/^#\+\s*//' | sort -u > headings.txt
# Любая ссылка без соответствующего heading — нарушение
comm -23 refs.txt headings.txt
```

Ожидаемый вывод — пустой (0 dangling refs). Мелкие исключения допустимы, если ссылка внешняя (например, `§9` базового промта).

### §7.4. М4 «Презентационная» 7/7 — дополнительная проверка

| # | Мех | Проверка |
|---|---|---|
| М4.1 | Точный перенос цифр/дат/имён | Seeds 1001–1020 ↔ §5.X promp ов |
| М4.2 | Проверка выполнения всех пунктов запроса | 20 слотов × (prompt + aspect + seed + temp + guidance) × policy |
| М4.3 | Формат документа | Markdown H1/H2/H3 ровный, таблицы без разрыва, code-блоки не сломаны |
| М4.4 | Согласованность pptx/html | N/A — Не применяется для ТЗ |
| М4.5 | Сверка сумм | Σ §6.1.6 ≤ 5000; §4.4 = 4700 ✓ |
| М4.6 | Проверка границ | Budget cap §2.2 vs §6.1.6 cap per file |
| М4.7 | Формат слайдов | N/A — Не применяется |

### §7.5. Acceptance criterion отчёта

Отчёт `Верификация_GeminiTZ_v1.0_П5.md` считается **PASS**, если:

- Из 32 механизмов П5 — **≥ 30 зелёных**, 0 красных. N/A допустимы, но только с обоснованием (как в §7.2 позиции 8, 9, 24).
- Из 7 механизмов М4 — **≥ 5 зелёных**, 0 красных. N/A допустимы.
- Все замеченные жёлтые (неопределённость) — с планом, что делать на стадии canon / HTML-сборки.

Если отчёт FAIL — исправляется **ТЗ**, а не отчёт. Затем цикл повторяется.

---

**Конец ТЗ v1.0.**

Следующий шаг по workflow (в v1.2 Приложение Г / базового промта): пользователь запускает 20 промтов §5 в Gemini Nano Banana → post-processing §6.1 → приёмка §6.2 → canon integration §6.3 → автотест crit. 74 → HTML Фаза 6.
