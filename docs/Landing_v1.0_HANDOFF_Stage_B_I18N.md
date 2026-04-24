# Landing v1.0 — Stage B HANDOFF · i18n Blueprint

**Версия:** B1b.2
**Дата:** 2026-04-19
**Проект:** TrendStudio Holding — Landing v1.0 (LP audience)
**Контракт:** Cowork (supervisor) → CC (executor), dual-location sha256 parity
**Сопряжённые артефакты:**
- `Landing_v1.0_HANDOFF_Stage_B_CORE.md` (B1a, sha256 `db52406bf9e86f6d…`)
- `Landing_v1.0_HANDOFF_Stage_B_DETAIL.md` (B1b.1, sha256 `539f4a69…5139be9`)
- `data_extract/landing_canon_extended_v1.0.json` (canon — источник ключей)

---

## §0. Назначение

Этот документ — **жёсткий blueprint** для i18n-слоя Landing v1.0. Определяет:

1. **9 namespaces** (пространств имён) с фиксированными префиксами и целевым количеством ключей.
2. **Конвенцию именования** ключей (slug-case, namespace-prefix, семантическая группировка).
3. **Правило симметрии ru⇄en** (жёсткое: build ломается при расхождении).
4. **Плейсхолдеры и плюрализация** (ICU-совместимый синтаксис без внешних библиотек).
5. **Skeleton** — конкретные ключи по каждому namespace с русскими и английскими значениями-заглушками.
6. **Валидатор** — pseudocode для `scripts/i18n_check.py`, который прогоняется в W1.

CC на выходе волны W1 создаёт два файла:
- `i18n/landing_ru.json` — 420 ключей (±5), все значения на русском
- `i18n/landing_en.json` — 420 ключей (±5), зеркальная структура, все значения на английском

Допустимое расхождение количества ключей: **0** (жёсткая симметрия).

---

## §1. Список namespaces (9 штук)

| Префикс    | Назначение                                               | Целевой count | Пример ключа                        |
|------------|----------------------------------------------------------|--------------:|-------------------------------------|
| `ui`       | Кнопки, меню, заголовки разделов, CTA, статические label | ~80           | `ui.nav.menu.pipeline`              |
| `a11y`     | aria-label, roledescription, screen-reader announce      | ~70           | `a11y.viz01.hero_film_reel`         |
| `narrative`| Сторителлинг-блоки, длинный текст, sub-copy              | ~60           | `narrative.intro.paragraph1`        |
| `legal`    | Disclaimer, forward-looking statement, copyright, risk   | ~30           | `legal.disclaimer.forward_looking`  |
| `chart`    | Заголовки чартов, оси, легенды, tooltip-шаблоны          | ~70           | `chart.viz04.irr_sensitivity.title` |
| `control`  | Scenario switcher, sliders, toggles, labels управления   | ~30           | `control.scenario.switcher.bull`    |
| `modal`    | Drill-down модальные окна: заголовки, описания, CTA      | ~30           | `modal.viz02.waterfall_3d.title`    |
| `form`     | Contact form, LP request access form, валидация, ошибки  | ~25           | `form.contact.field.email.label`    |
| `faq`      | Вопросы-ответы LP-секция                                 | ~25           | `faq.question.fund_size`            |
| **Итого**  |                                                          | **~420**      |                                     |

Фактический count после имплементации CC может колебаться в пределах ±5 на namespace, но общая парность ru==en должна быть **абсолютной**.

---

## §2. Протокол симметрии (hard contract)

### 2.1 Алгоритм проверки

```
SymmetricCheck(ru_json, en_json):
  ru_keys = flatten_keys(ru_json).sorted()
  en_keys = flatten_keys(en_json).sorted()

  IF ru_keys != en_keys:
    diff_only_in_ru = ru_keys - en_keys
    diff_only_in_en = en_keys - ru_keys
    FAIL with:
      "i18n asymmetry: only in RU: {diff_only_in_ru}, only in EN: {diff_only_in_en}"
      exit 1

  FOR EACH key IN ru_keys:
    IF not has_value(ru_json, key) OR not has_value(en_json, key):
      FAIL "empty value at {key}"
    IF value_type(ru_json, key) != value_type(en_json, key):
      FAIL "type mismatch at {key}"
```

### 2.2 Jenkins/CI hook

В W1 (Foundation wave) CC добавляет шаг в `npm run prebuild`:

```bash
python3 scripts/i18n_check.py || exit 1
```

Build HTML через `build_html.py` **не выполняется**, если `i18n_check.py` вернул non-zero.

### 2.3 Исключения из симметрии

**Нет.** Даже для «непереводимых» (например, имена городов, названия брендов) создаются два ключа с идентичными значениями:

```json
// ru.json
"ui.footer.legal_entity": "ООО «ТрендСтудио Холдинг»"
// en.json
"ui.footer.legal_entity": "TrendStudio Holding LLC"
```

Если бренд принципиально не переводится (например, «Nano Banana»), оба файла содержат идентичную строку — это допустимо, но не освобождает от наличия ключа в обоих.

---

## §3. Синтаксис плейсхолдеров

### 3.1 Базовый плейсхолдер

```
{variable_name}
```

Пример:

```json
"chart.viz04.tooltip": "IRR: {irr}% · NPV: {npv} млн ₽"
```

В рантайме подстановка делается через `TS.I18N.format(key, vars)`:

```javascript
TS.I18N.format('chart.viz04.tooltip', { irr: 18.5, npv: 240 })
// → "IRR: 18.5% · NPV: 240 млн ₽"
```

### 3.2 Множественное число (plural)

Синтаксис **ICU-lite**, без зависимостей:

```
{count, plural, one {...} few {...} many {...} other {...}}
```

Русский требует 3 форм (one / few / many), английский — 2 (one / other). Шаблон описывает **все** формы в каждом языке:

```json
// ru.json
"ui.pipeline.project_count": "{count, plural, one {# проект} few {# проекта} many {# проектов} other {# проекта}}"

// en.json
"ui.pipeline.project_count": "{count, plural, one {# project} other {# projects}}"
```

Символ `#` заменяется на числовое значение `count`.

### 3.3 Форматирование чисел и валют

Выполняется через отдельный helper `TS.Format.currency` / `TS.Format.number`, а не через i18n-подстановку. В ключах хранятся уже форматированные примеры:

```json
"ui.fund_size.display": "{amount} млн ₽"
```

CC обязан НЕ использовать `Intl.NumberFormat` внутри i18n-ключей (во избежание расхождения locale между ru/en узлами).

---

## §4. Convention именования ключей

### 4.1 Формат

```
<namespace>.<section>.<subsection>.<element>[.<modifier>]
```

Правила:
- **Только ASCII**: `a-z`, `0-9`, `_`, `.`
- **Snake_case** внутри сегментов: `forward_looking`, не `forwardLooking`
- **Максимум 5 уровней** (включая namespace): `chart.viz04.tooltip.base_case.hint` — ок; 6-й уровень — красный флаг
- **Длина ключа ≤ 100 символов**

### 4.2 Зарезервированные подразделы

| Подразделение    | Использование                                    |
|------------------|--------------------------------------------------|
| `.title`         | Заголовок блока/виджета                          |
| `.subtitle`      | Подзаголовок                                     |
| `.label`         | Короткая метка (ось, колонка, input label)       |
| `.description`   | Разъяснение (tooltip, caption, p)                |
| `.cta`           | Кнопка-призыв                                    |
| `.placeholder`   | Плейсхолдер input                                |
| `.error`         | Сообщение об ошибке                              |
| `.hint`          | Вспомогательный текст                            |
| `.aria`          | aria-label (только в namespace `a11y`)           |
| `.fallback`      | Текст для fallback-режима                        |

### 4.3 Связь с canon

Ключи `chart.*` зеркально соответствуют `visualizations[].id` в canon:

```
chart.viz01.hero_film_reel_3d.title  ← visualizations[0].id = "hero_film_reel_3d"
chart.viz04.irr_sensitivity.title    ← visualizations[3].id = "irr_sensitivity"
```

Ключи `control.scenario.switcher.<scenario>` привязаны к `scenario_switcher.options`:

```
control.scenario.switcher.base
control.scenario.switcher.bull
control.scenario.switcher.bear
control.scenario.switcher.stress
```

CC в W1 обязан автоматически **сгенерировать stub-ключи** для всех id из canon (script `scripts/i18n_scaffold.py`).

---

## §5. Плюрализация: сводная таблица форм

| Язык | Формы                | Пример                              |
|------|----------------------|-------------------------------------|
| RU   | one / few / many / other | 1 проект / 2 проекта / 5 проектов / 1.5 проекта |
| EN   | one / other          | 1 project / 2 projects              |

Для определения формы использовать `Intl.PluralRules` в рантайме:

```javascript
TS.I18N.plural = (locale, count) => {
  return new Intl.PluralRules(locale).select(count);
};
```

---

## §6. Skeleton по namespaces

Формат: `key` · **RU** → *EN*

### 6.1 `ui.*` — навигация, CTA, заголовки разделов (~80 keys)

#### 6.1.1 Navigation

```
ui.nav.menu.about        · О фонде              → About the Fund
ui.nav.menu.pipeline     · Портфель             → Pipeline
ui.nav.menu.returns      · Доходность           → Returns
ui.nav.menu.risks        · Риски                → Risks
ui.nav.menu.team         · Команда              → Team
ui.nav.menu.faq          · Вопросы              → FAQ
ui.nav.menu.contact      · Связаться            → Contact
ui.nav.cta.request_access · Запросить доступ    → Request Access
ui.nav.cta.download_memo · Скачать memo         → Download Memo
ui.nav.lang.ru           · Русский              → Russian
ui.nav.lang.en           · English              → English
ui.nav.theme.dark        · Тёмная тема          → Dark Theme
ui.nav.theme.light       · Светлая тема         → Light Theme
```

#### 6.1.2 Hero section

```
ui.hero.title            · Кинокомпания на стыке технологий и искусства → A Film Holding at the Intersection of Tech and Art
ui.hero.subtitle         · Фонд 3 000 млн ₽ · горизонт 5 лет · 7 проектов → Fund of RUB 3,000M · 5-year horizon · 7 projects
ui.hero.cta.primary      · Запросить LP-доступ  → Request LP Access
ui.hero.cta.secondary    · Смотреть портфель    → View Pipeline
ui.hero.scroll_hint      · Прокрутите вниз      → Scroll down
```

#### 6.1.3 About section

```
ui.about.title           · О ТрендСтудио        → About TrendStudio
ui.about.subtitle        · Вертикально-интегрированный холдинг → A vertically integrated holding
ui.about.stats.founded.label   · Основан        → Founded
ui.about.stats.founded.value   · 2021           → 2021
ui.about.stats.projects.label  · Проектов в пайплайне → Pipeline Projects
ui.about.stats.regions.label   · Регионов       → Regions
ui.about.stats.team.label      · Команда        → Team
```

#### 6.1.4 Pipeline section

```
ui.pipeline.title        · Портфель проектов    → Project Pipeline
ui.pipeline.subtitle     · 5 фильмов + 2 сериала → 5 films + 2 series
ui.pipeline.filter.all   · Все                  → All
ui.pipeline.filter.film  · Фильмы               → Films
ui.pipeline.filter.series · Сериалы             → Series
ui.pipeline.filter.stage.dev   · Разработка     → Development
ui.pipeline.filter.stage.prod  · Производство   → Production
ui.pipeline.filter.stage.post  · Пост-продакшн  → Post-production
ui.pipeline.filter.stage.release · Релиз        → Release
ui.pipeline.project_count · {count, plural, one {# проект} few {# проекта} many {# проектов} other {# проекта}} → {count, plural, one {# project} other {# projects}}
ui.pipeline.more_details · Подробнее            → More details
```

#### 6.1.5 Returns section

```
ui.returns.title         · Доходность           → Returns
ui.returns.subtitle      · IRR 20.09% · MOIC 2.4× → IRR 20.09% · MOIC 2.4×
ui.returns.tab.public    · Публичный сценарий   → Public Scenario
ui.returns.tab.internal  · Внутренний сценарий  → Internal Scenario
ui.returns.metric.irr    · IRR                  → IRR
ui.returns.metric.moic   · MOIC                 → MOIC
ui.returns.metric.ndp    · NDP                  → NDP
ui.returns.metric.dpi    · DPI                  → DPI
ui.returns.metric.tvpi   · TVPI                 → TVPI
```

#### 6.1.6 Risks section

```
ui.risks.title           · Риски и смягчения    → Risks and Mitigations
ui.risks.subtitle        · Red-team анализ      → Red-team analysis
ui.risks.severity.high   · Высокий              → High
ui.risks.severity.medium · Средний              → Medium
ui.risks.severity.low    · Низкий               → Low
ui.risks.mitigation.label · Смягчение           → Mitigation
```

#### 6.1.7 Team section

```
ui.team.title            · Команда              → Team
ui.team.role.gp          · GP                   → GP
ui.team.role.cfo         · CFO                  → CFO
ui.team.role.producer    · Продюсер             → Producer
ui.team.role.director    · Режиссёр             → Director
ui.team.role.analyst     · Аналитик             → Analyst
```

#### 6.1.8 Footer

```
ui.footer.legal_entity   · ООО «ТрендСтудио Холдинг» → TrendStudio Holding LLC
ui.footer.copyright      · © 2026 ТрендСтудио. Все права защищены. → © 2026 TrendStudio. All rights reserved.
ui.footer.contact.email.label · Email:          → Email:
ui.footer.contact.phone.label · Телефон:        → Phone:
ui.footer.link.terms     · Условия использования → Terms of Use
ui.footer.link.privacy   · Политика конфиденциальности → Privacy Policy
ui.footer.link.disclaimer · Полный дисклеймер   → Full Disclaimer
```

**Подсчёт ui:** ~55 показанных + ~25 служебных (close/back/loading/empty-state/toast) = **80 keys**.

---

### 6.2 `a11y.*` — ARIA, screen reader (~70 keys)

#### 6.2.1 Navigation a11y

```
a11y.nav.main.aria       · Главная навигация    → Main navigation
a11y.nav.skip_to_content · Перейти к основному содержанию → Skip to main content
a11y.nav.lang_switcher.aria · Переключатель языка → Language switcher
a11y.nav.theme_toggle.aria · Переключатель темы  → Theme toggle
```

#### 6.2.2 Viz a11y (по 22 viz × 2-3 ключа ≈ 50 keys)

Шаблон:

```
a11y.viz<NN>.<id>.aria           · ARIA label для контейнера
a11y.viz<NN>.<id>.roledescription · Роль ("диаграмма", "интерактивный график")
a11y.viz<NN>.<id>.announce.update · Что announcement'ится при update
```

Примеры:

```
a11y.viz01.hero_film_reel_3d.aria · Интерактивная 3D-киноплёнка hero-секции → Interactive 3D film reel of hero section
a11y.viz01.hero_film_reel_3d.roledescription · Декоративная анимация → Decorative animation
a11y.viz04.irr_sensitivity.aria   · График чувствительности IRR → IRR sensitivity chart
a11y.viz04.irr_sensitivity.roledescription · Интерактивный график → Interactive chart
a11y.viz04.irr_sensitivity.announce.update · IRR обновлён: {value}% → IRR updated: {value}%
```

#### 6.2.3 Control a11y

```
a11y.control.scenario.switcher.aria · Переключатель сценария → Scenario switcher
a11y.control.slider.rate.aria       · Слайдер ставки дисконтирования → Discount rate slider
a11y.control.slider.horizon.aria    · Слайдер горизонта → Horizon slider
a11y.control.slider.stress.aria     · Слайдер стресса → Stress slider
```

#### 6.2.4 Modal a11y

```
a11y.modal.dialog.aria     · Диалоговое окно    → Dialog
a11y.modal.close.aria      · Закрыть            → Close
a11y.modal.focus_trap.hint · Нажмите Esc для закрытия → Press Esc to close
```

**Подсчёт a11y:** ~20 служебных + 50 viz-ключей = **70 keys**.

---

### 6.3 `narrative.*` — сторителлинг, длинный текст (~60 keys)

#### 6.3.1 Intro narrative

```
narrative.intro.hook · За последние пять лет российский кинорынок вырос в 2.4 раза и достиг 100 млрд ₽. → Over the past five years, the Russian film market has grown 2.4× to RUB 100B.
narrative.intro.paragraph1 · ТрендСтудио создана как вертикально-интегрированный холдинг, объединяющий девелопмент, производство и дистрибуцию. → TrendStudio was built as a vertically integrated holding covering development, production, and distribution.
narrative.intro.paragraph2 · Наша цель — доходность выше 20% IRR при горизонте 5 лет и максимальной дисциплине капитала. → Our goal is IRR above 20% over a 5-year horizon with maximum capital discipline.
```

#### 6.3.2 Investment thesis

```
narrative.thesis.title        · Инвестиционный тезис → Investment Thesis
narrative.thesis.point1       · Портфельный подход: 7 проектов, диверсификация по жанрам и стадиям → Portfolio approach: 7 projects, diversified by genre and stage
narrative.thesis.point2       · Господдержка: до 70% бюджета через субсидии, tax credits, региональные программы → State support: up to 70% of budget via subsidies, tax credits, regional programs
narrative.thesis.point3       · Waterfall с 8% preferred return и 20% carry после catch-up → Waterfall with 8% preferred return and 20% carry after catch-up
narrative.thesis.point4       · Multiple distribution channels: theatrical, streaming, TV, international → Multiple distribution channels: theatrical, streaming, TV, international
```

#### 6.3.3 Pipeline narrative

```
narrative.pipeline.intro · Портфель строится по принципу balanced risk: 3 high-conviction + 2 mid + 2 low. → The portfolio follows a balanced-risk principle: 3 high-conviction + 2 mid + 2 low.
narrative.pipeline.stage_gate · Каждый проект проходит 4 stage-gate: greenlight, production, post, release. → Every project passes 4 stage gates: greenlight, production, post, release.
narrative.pipeline.kill_rate · 1 из 7 проектов может быть остановлен на stage-gate без ущерба для доходности портфеля. → 1 of 7 projects may be killed at stage gate without impairing portfolio returns.
```

#### 6.3.4 Risk narrative

```
narrative.risks.framing · Мы открыто признаём риски и документируем их смягчения в меморандуме. → We openly acknowledge risks and document mitigations in the memorandum.
narrative.risks.top3.r1 · Риск производственных задержек — смягчён буфером 15% в сроках. → Production delay risk — mitigated by a 15% schedule buffer.
narrative.risks.top3.r2 · Риск box-office underperform — смягчён трёхэтапным greenlight-процессом. → Box-office underperform risk — mitigated by a three-stage greenlight process.
narrative.risks.top3.r3 · Риск санкций/регуляторных изменений — смягчён фокусом на внутренний рынок (85% revenue). → Sanctions/regulatory risk — mitigated by domestic-market focus (85% revenue).
```

#### 6.3.5 Team narrative

```
narrative.team.philosophy · Мы строим команду вокруг исполнительской дисциплины и уважения к IP. → We build the team around execution discipline and respect for IP.
narrative.team.gp.bio · 15 лет в продакшне, 40+ проектов, 3 фестивальных награды. → 15 years in production, 40+ projects, 3 festival awards.
narrative.team.cfo.bio · MBA INSEAD, 10 лет в частном капитале, специализация — media & entertainment. → MBA INSEAD, 10 years in private equity, specializing in media & entertainment.
```

**Подсчёт narrative:** ~40 показанных + ~20 дополнительных (story beats, pull-quotes) = **60 keys**.

---

### 6.4 `legal.*` — disclaimers, legal (~30 keys)

```
legal.disclaimer.title             · Дисклеймер          → Disclaimer
legal.disclaimer.forward_looking   · Настоящий материал содержит прогнозные заявления. Фактические результаты могут существенно отличаться от прогнозируемых. → This material contains forward-looking statements. Actual results may differ materially from projections.
legal.disclaimer.not_offer         · Настоящий материал не является предложением ценных бумаг. → This material is not an offer of securities.
legal.disclaimer.qualified_investor · Предназначено только для квалифицированных инвесторов. → For qualified investors only.
legal.disclaimer.jurisdiction      · Распространение ограничено юрисдикциями, где это разрешено. → Distribution restricted to permitted jurisdictions.
legal.disclaimer.no_warranty       · Предоставляется «как есть», без каких-либо гарантий. → Provided "as is", without any warranties.
legal.disclaimer.confidentiality   · Конфиденциально. Не подлежит распространению без согласия. → Confidential. Not for distribution without consent.
legal.risk.market_risk             · Рыночный риск        → Market risk
legal.risk.liquidity_risk          · Риск ликвидности     → Liquidity risk
legal.risk.concentration_risk      · Риск концентрации    → Concentration risk
legal.risk.execution_risk          · Операционный риск    → Execution risk
legal.risk.regulatory_risk         · Регуляторный риск    → Regulatory risk
legal.copyright.year               · © 2026               → © 2026
legal.copyright.holder             · ТрендСтудио Холдинг  → TrendStudio Holding
legal.terms.title                  · Условия использования → Terms of Use
legal.terms.body_short             · Используя сайт, вы соглашаетесь с условиями. → By using the site, you agree to the terms.
legal.privacy.title                · Политика конфиденциальности → Privacy Policy
legal.privacy.body_short           · Мы собираем только необходимые данные. → We collect only necessary data.
legal.cookie.banner                · Мы используем cookies для улучшения работы сайта. → We use cookies to improve site performance.
legal.cookie.accept                · Принять              → Accept
legal.cookie.decline               · Отклонить            → Decline
```

**Подсчёт legal:** 21 показан + ~9 полных текстов (terms full, privacy full, imprint) = **30 keys**.

---

### 6.5 `chart.*` — чарт-специфичные (~70 keys)

Ключи группированы **по viz_id** из canon. Для каждого viz — минимум 3 ключа (title/subtitle/axis), максимум — до 8 (title/subtitle/x_axis/y_axis/legend/tooltip/annotation/empty_state).

**Сумма:** 22 viz × в среднем 3.2 ключа = **~70 keys**.

Примеры:

```
chart.viz01.hero_film_reel_3d.title       · Кинематограф как актив → Cinema as an Asset
chart.viz01.hero_film_reel_3d.subtitle    · 3D-превью портфеля    → 3D portfolio preview
chart.viz01.hero_film_reel_3d.fallback    · Статичная галерея фильмов → Static film gallery

chart.viz02.waterfall_3d.title            · Водопад распределения → Distribution Waterfall
chart.viz02.waterfall_3d.subtitle         · LP 80% · GP 20% после catch-up → LP 80% · GP 20% after catch-up
chart.viz02.waterfall_3d.legend.lp        · LP share              → LP share
chart.viz02.waterfall_3d.legend.gp        · GP share              → GP share
chart.viz02.waterfall_3d.legend.preferred · Preferred return 8%   → Preferred return 8%

chart.viz04.irr_sensitivity.title         · Чувствительность IRR → IRR Sensitivity
chart.viz04.irr_sensitivity.x_axis        · Изменение ставки (п.п.) → Rate change (p.p.)
chart.viz04.irr_sensitivity.y_axis        · IRR, %                → IRR, %
chart.viz04.irr_sensitivity.tooltip       · Ставка {rate}% → IRR {irr}% → Rate {rate}% → IRR {irr}%

chart.viz05.mc_distribution.title         · Monte Carlo распределение → Monte Carlo Distribution
chart.viz05.mc_distribution.x_axis        · IRR, %                → IRR, %
chart.viz05.mc_distribution.y_axis        · Плотность             → Density
chart.viz05.mc_distribution.p50           · Медиана (P50)         → Median (P50)
chart.viz05.mc_distribution.p90           · P90                   → P90

chart.viz06.revenue_forecast.title        · Прогноз выручки       → Revenue Forecast
chart.viz06.revenue_forecast.x_axis       · Год                   → Year
chart.viz06.revenue_forecast.y_axis       · Выручка, млн ₽        → Revenue, RUB M

chart.viz07.ebitda_waterfall.title        · Водопад EBITDA        → EBITDA Waterfall

chart.viz08.pipeline_gantt.title          · Gantt производства    → Production Gantt

chart.viz09.peers_benchmark.title         · Бенчмарк по peers     → Peer Benchmark
chart.viz09.peers_benchmark.y_axis        · AUM, млн ₽            → AUM, RUB M

chart.viz10.cashflow_stepper.title        · Денежный поток        → Cash Flow
chart.viz10.cashflow_stepper.legend.inflow · Поступления          → Inflows
chart.viz10.cashflow_stepper.legend.outflow · Выплаты              → Outflows

chart.viz11.regions_map.title             · Карта регионов        → Regions Map

chart.viz12.tax_credits_ui.title          · Налоговые льготы      → Tax Credits

chart.viz13.timeline_roadmap.title        · Roadmap 2026–2032     → Roadmap 2026–2032

chart.viz14.kpi_dashboard.title           · KPI-дашборд по ролям  → Role-based KPI Dashboard
chart.viz14.kpi_dashboard.role.lp         · LP                    → LP
chart.viz14.kpi_dashboard.role.gp         · GP                    → GP

chart.viz15.scenario_switcher.title       · Сценарии              → Scenarios

chart.viz16.genre_mix.title               · Жанровый микс         → Genre Mix

chart.viz17.budget_tree.title             · Дерево бюджета        → Budget Tree

chart.viz18.risk_matrix.title             · Матрица рисков        → Risk Matrix
chart.viz18.risk_matrix.x_axis            · Вероятность           → Probability
chart.viz18.risk_matrix.y_axis            · Воздействие           → Impact

chart.viz19.distribution_funnel.title     · Воронка дистрибуции   → Distribution Funnel

chart.viz20.awards_track.title            · Фестивали и награды   → Festivals and Awards

chart.viz21.team_org.title                · Оргструктура          → Organization

chart.viz22.faq_search.title              · Поиск по FAQ          → FAQ Search
```

Точный count будет уточнён после scaffold-скрипта (см. §7.2). Ожидается **68–72 keys** в этой категории.

---

### 6.6 `control.*` — управляющие виджеты (~30 keys)

```
control.scenario.switcher.label         · Сценарий              → Scenario
control.scenario.switcher.base          · Базовый               → Base
control.scenario.switcher.bull          · Оптимистичный         → Bull
control.scenario.switcher.bear          · Пессимистичный        → Bear
control.scenario.switcher.stress        · Стресс                → Stress
control.scenario.switcher.hint          · Переключите сценарий для пересчёта → Toggle scenario to recompute

control.slider.rate.label               · Ставка дисконтирования → Discount Rate
control.slider.rate.unit                · %                     → %
control.slider.rate.hint                · 10–25%                 → 10–25%
control.slider.horizon.label            · Горизонт              → Horizon
control.slider.horizon.unit             · лет                   → years
control.slider.horizon.hint             · 3–10 лет              → 3–10 years
control.slider.stress.label             · Стресс                → Stress
control.slider.stress.unit              · %                     → %
control.slider.stress.hint              · 0–30%                 → 0–30%

control.toggle.motion.label             · Анимация              → Motion
control.toggle.motion.on                · Вкл                   → On
control.toggle.motion.off               · Выкл                  → Off
control.toggle.sound.label              · Звук                  → Sound
control.toggle.sound.on                 · Вкл                   → On
control.toggle.sound.off                · Выкл                  → Off

control.reset.label                     · Сброс                 → Reset
control.reset.hint                      · Вернуть параметры к базовым → Reset to defaults
control.share.label                     · Поделиться            → Share
control.share.copied                    · Ссылка скопирована    → Link copied

control.export.memo                     · Скачать memo          → Download Memo
control.export.pdf                      · Экспорт в PDF         → Export to PDF
control.export.xlsx                     · Экспорт в XLSX        → Export to XLSX
```

**Подсчёт control:** **31 key**.

---

### 6.7 `modal.*` — drill-down modals (~30 keys)

```
modal.close.label                   · Закрыть                  → Close
modal.back.label                    · Назад                    → Back
modal.loading                       · Загрузка…                → Loading…
modal.error.generic                 · Ошибка. Попробуйте снова. → Error. Please try again.
modal.empty_state                   · Нет данных для отображения → No data to display

modal.viz02.waterfall_3d.title      · Детализация водопада     → Waterfall Details
modal.viz02.waterfall_3d.description · Пошаговое распределение между LP и GP с учётом preferred return. → Step-by-step distribution between LP and GP incl. preferred return.
modal.viz02.waterfall_3d.cta        · Скачать схему            → Download Diagram

modal.viz04.irr_sensitivity.title   · Детализация чувствительности IRR → IRR Sensitivity Details
modal.viz04.irr_sensitivity.description · Как меняется IRR при изменении ставки/горизонта/стресса. → How IRR changes vs. rate/horizon/stress.

modal.viz05.mc_distribution.title   · Monte Carlo результаты   → Monte Carlo Results
modal.viz05.mc_distribution.description · 5000 итераций, seed фиксирован. → 5000 iterations, seed fixed.
modal.viz05.mc_distribution.p50.label · P50 (медиана)          → P50 (median)
modal.viz05.mc_distribution.p90.label · P90                    → P90
modal.viz05.mc_distribution.p99.label · P99                    → P99

modal.viz08.pipeline_gantt.title    · Сроки производства       → Production Timeline
modal.viz08.pipeline_gantt.description · Gantt-диаграмма по 7 проектам → Gantt by 7 projects

modal.viz11.regions_map.title       · Региональная разбивка    → Regional Breakdown

modal.viz12.tax_credits_ui.title    · Налоговые льготы         → Tax Credits
modal.viz12.tax_credits_ui.description · 4 программы льгот по 9 регионам. → 4 credit programs across 9 regions.

modal.viz18.risk_matrix.title       · Матрица рисков           → Risk Matrix
modal.viz18.risk_matrix.description · Вероятность × воздействие, смягчения. → Probability × impact, mitigations.

modal.kpi.lp.title                  · KPI для LP               → LP KPIs
modal.kpi.gp.title                  · KPI для GP               → GP KPIs
modal.kpi.cfo.title                 · KPI для CFO              → CFO KPIs
modal.kpi.producer.title            · KPI для продюсера        → Producer KPIs
modal.kpi.analyst.title             · KPI для аналитика        → Analyst KPIs
```

**Подсчёт modal:** **31 key**.

---

### 6.8 `form.*` — LP request access form, contact (~25 keys)

```
form.request_access.title           · Запрос LP-доступа        → Request LP Access
form.request_access.subtitle        · Заполните форму, мы свяжемся в течение 24 часов. → Fill the form, we'll reply within 24 hours.

form.field.name.label               · Имя                      → Name
form.field.name.placeholder         · Полное имя               → Full name
form.field.name.error.required      · Имя обязательно          → Name is required

form.field.email.label              · Email                    → Email
form.field.email.placeholder        · you@company.com          → you@company.com
form.field.email.error.required     · Email обязателен         → Email is required
form.field.email.error.invalid      · Неверный формат email    → Invalid email format

form.field.organization.label       · Организация              → Organization
form.field.organization.placeholder · Название фонда/компании  → Fund / Company name

form.field.role.label               · Роль                     → Role
form.field.role.option.lp           · LP                       → LP
form.field.role.option.advisor      · Консультант              → Advisor
form.field.role.option.other        · Другое                   → Other

form.field.ticket.label             · Размер чека, млн ₽       → Ticket Size, RUB M
form.field.ticket.hint              · Ориентировочный          → Approximate

form.field.message.label            · Сообщение                → Message
form.field.message.placeholder      · Кратко о вашем интересе  → Brief note on your interest

form.consent.privacy                · Я согласен с политикой конфиденциальности → I agree with the privacy policy
form.consent.error.required         · Необходимо согласие      → Consent is required

form.submit.label                   · Отправить                → Submit
form.submit.loading                 · Отправка…                → Submitting…
form.submit.success                 · Заявка отправлена. Спасибо! → Request sent. Thank you!
form.submit.error                   · Ошибка отправки. Попробуйте снова. → Submission error. Please try again.
```

**Подсчёт form:** **26 keys**.

---

### 6.9 `faq.*` — LP frequently asked questions (~25 keys)

Шаблон: каждый FAQ = 1 пара `faq.qNN.question` + `faq.qNN.answer`. ~12 вопросов × 2 = 24, + 1 header = **25 keys**.

```
faq.section.title              · Частые вопросы               → FAQ

faq.q01.question               · Каков минимальный чек?       → What's the minimum ticket?
faq.q01.answer                 · 50 млн ₽ для институциональных LP, 10 млн ₽ для индивидуальных. → RUB 50M for institutional LPs, RUB 10M for individuals.

faq.q02.question               · Каков waterfall?             → What's the waterfall?
faq.q02.answer                 · ROC → 8% preferred → 100% catch-up → 80/20 carry. → ROC → 8% preferred → 100% catch-up → 80/20 carry.

faq.q03.question               · Как устроен committee?       → How is the committee structured?
faq.q03.answer                 · IC: 3 GP + 2 независимых члена. Greenlight требует 4/5. → IC: 3 GP + 2 independents. Greenlight requires 4/5.

faq.q04.question               · Есть ли key-person clause?   → Is there a key-person clause?
faq.q04.answer                 · Да. При одновременном уходе двух из трёх GP — suspension периода инвестирования. → Yes. Suspension of investment period if two of three GPs leave simultaneously.

faq.q05.question               · Как устроена LP-отчётность?  → How is LP reporting structured?
faq.q05.answer                 · Квартально: NAV, capital call, distributions, KPI. Ежегодно: audit. → Quarterly: NAV, capital calls, distributions, KPIs. Annually: audit.

faq.q06.question               · Фонд закрыт/открыт?          → Is the fund open or closed?
faq.q06.answer                 · Closed-end, 5-летний инвестиционный период. → Closed-end, 5-year investment period.

faq.q07.question               · Каков management fee?        → What's the management fee?
faq.q07.answer                 · 2% от committed capital в инвестиционный период, 1.5% от NAV после. → 2% of committed capital during investment period, 1.5% of NAV after.

faq.q08.question               · Каковы комиссии фонда?       → What are the fund fees?
faq.q08.answer                 · Management + performance. Отчётность — транспарентная, квартальная. → Management + performance. Reporting is transparent and quarterly.

faq.q09.question               · Как защищены LP?             → How are LPs protected?
faq.q09.answer                 · GP commitment 5% · LP advisory committee · audit · key-person clause. → GP commitment 5% · LP advisory committee · audit · key-person clause.

faq.q10.question               · Есть ли право выхода?        → Is there an exit right?
faq.q10.answer                 · Ограниченно: после lock-up 3 года, согласие GP. → Limited: after 3-year lock-up, GP consent required.

faq.q11.question               · Как отчитываетесь по рискам? → How do you report on risks?
faq.q11.answer                 · Red-team анализ ежеквартально, включается в LP-report. → Quarterly red-team analysis, included in LP report.

faq.q12.question               · Куда обратиться для due diligence? → Where to go for due diligence?
faq.q12.answer                 · Data room доступен через форму «Запросить доступ». → Data room available via "Request Access" form.
```

**Подсчёт faq:** **25 keys** (1 header + 12 пар).

---

## §7. Валидация и scaffold

### 7.1 `scripts/i18n_check.py` (pseudocode)

```python
#!/usr/bin/env python3
"""
i18n_check.py — symmetric validator for landing_ru.json & landing_en.json.

Exit codes:
  0 — OK
  1 — asymmetry / empty value / type mismatch
  2 — unknown namespace
  3 — invalid key format
"""
import json, sys, re
from pathlib import Path

ALLOWED_NAMESPACES = {"ui", "a11y", "narrative", "legal", "chart", "control", "modal", "form", "faq"}
KEY_RE = re.compile(r"^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,4}$")
MAX_KEY_LEN = 100
ROOT = Path(__file__).resolve().parent.parent / "i18n"
RU = json.loads((ROOT / "landing_ru.json").read_text(encoding="utf-8"))
EN = json.loads((ROOT / "landing_en.json").read_text(encoding="utf-8"))

def flatten(obj, prefix=""):
    """Flatten nested JSON to dotted keys."""
    out = {}
    for k, v in obj.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, full))
        else:
            out[full] = v
    return out

def validate_key(k):
    if not KEY_RE.match(k):
        print(f"FAIL: invalid key format {k}", file=sys.stderr)
        sys.exit(3)
    if len(k) > MAX_KEY_LEN:
        print(f"FAIL: key too long {k}", file=sys.stderr)
        sys.exit(3)
    ns = k.split(".", 1)[0]
    if ns not in ALLOWED_NAMESPACES:
        print(f"FAIL: unknown namespace {ns} in key {k}", file=sys.stderr)
        sys.exit(2)

ru_flat = flatten(RU)
en_flat = flatten(EN)

# 1. symmetry check
ru_keys = set(ru_flat.keys())
en_keys = set(en_flat.keys())
only_ru = ru_keys - en_keys
only_en = en_keys - ru_keys
if only_ru or only_en:
    print(f"FAIL: asymmetry. only_ru={sorted(only_ru)[:10]}... only_en={sorted(only_en)[:10]}...", file=sys.stderr)
    sys.exit(1)

# 2. key format & empty-value check
for k in ru_keys:
    validate_key(k)
    if not ru_flat[k] or not en_flat[k]:
        print(f"FAIL: empty value at {k}", file=sys.stderr)
        sys.exit(1)
    if type(ru_flat[k]) != type(en_flat[k]):
        print(f"FAIL: type mismatch at {k}", file=sys.stderr)
        sys.exit(1)

# 3. namespace counts
from collections import Counter
cnt = Counter(k.split(".", 1)[0] for k in ru_keys)
print(f"i18n OK. Total: {len(ru_keys)} keys. Namespaces: {dict(cnt)}")
sys.exit(0)
```

### 7.2 `scripts/i18n_scaffold.py` (pseudocode)

Генерирует stub-ключи из canon для namespace `chart.*`, `modal.*`, `a11y.*` (viz-специфика). Запускается **один раз** в W1, далее вручную не трогается.

```python
#!/usr/bin/env python3
"""
i18n_scaffold.py — generate stub i18n keys from canon visualizations & simulators.
Writes into i18n/landing_ru.json and i18n/landing_en.json (merge mode, non-destructive).
"""
import json
from pathlib import Path

CANON = json.loads((Path(__file__).resolve().parent.parent / "data_extract" / "landing_canon_extended_v1.0.json").read_text(encoding="utf-8"))

# For each viz: create chart.<viz_id>.title, chart.<viz_id>.subtitle, a11y.<viz_id>.aria, modal.<viz_id>.title
# For each sim: create a11y.announce.<sim_id>.update
# Write into existing landing_ru.json / landing_en.json (preserving existing values)
# Use placeholder "__STUB_RU__" / "__STUB_EN__" for new keys — CC fills in W1
```

После scaffold CC вручную заполняет stub'ы, затем `i18n_check.py` должен пройти.

---

## §8. Сводная таблица целевых counts

| Namespace  | Target | Range   | Критичность |
|------------|-------:|:--------|:------------|
| `ui`       |     80 | 75–85   | HIGH        |
| `a11y`     |     70 | 65–75   | HIGH        |
| `narrative`|     60 | 55–65   | MEDIUM      |
| `legal`    |     30 | 28–32   | HIGH        |
| `chart`    |     70 | 65–75   | HIGH        |
| `control`  |     30 | 28–32   | MEDIUM      |
| `modal`    |     30 | 28–32   | MEDIUM      |
| `form`     |     25 | 23–27   | HIGH        |
| `faq`      |     25 | 23–27   | LOW         |
| **ИТОГО**  |**420** |**400–435** |          |

**Допуск итогового count:** 400 ≤ total ≤ 435.
**Допуск расхождения ru⇄en:** **0** (hard fail).

---

## §9. DoD (Definition of Done) для B1b.2

- [x] Задокументированы 9 namespaces с целевыми counts
- [x] Определён синтаксис плейсхолдеров (простой `{var}` + ICU-lite plural)
- [x] Определена convention именования (регулярка, длина, уровни)
- [x] Правило симметрии закреплено как hard-constraint
- [x] Skeleton расписан по каждому namespace (примеры ru/en)
- [x] Спецификация валидатора (i18n_check.py) дана pseudocode'ом
- [x] Спецификация scaffold (i18n_scaffold.py) дана pseudocode'ом
- [x] Сводная таблица counts + допусков

---

## §10. Следующий шаг

**B1b.3** — создание `landing_b1_wave_plan_v1.0.json` (dual-location sha256) + `invariants_check.py` spec для W1.

После B1b.3 — верификация **П5 «Максимум»** (32/32 механизма) на пакет B1a + B1b.1 + B1b.2 + B1b.3, затем запуск Stage B (CC executor, 6 волн, 70% проекта).

---

**Конец документа.**
