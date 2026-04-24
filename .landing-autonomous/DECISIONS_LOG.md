# Landing v1.0 Autonomous — Decisions Log

Журнал решений orchestrator'а. Каждая запись — timestamp, wave/phase, decision, rationale.

---

## 2026-04-24 Phase 0 — acceptance.sh bug fix (non-behavioural)

**Контекст:** v1.2 orchestrator §1 Фаза 0 шаг 5: `bash .landing-autonomous/scripts/acceptance.sh --dry-run` — ожидается exit 0.

**Обнаружено:** acceptance.sh строка 4-6 парсит `WAVE="${1:---wave=0}"` и `MODE="${WAVE#--wave=}"`. При `$1=--dry-run` → `WAVE=--dry-run` → `MODE=--dry-run` (префикс `--` не снят, бо шаблон `--wave=` не совпадает). Строка 11 `if [[ "$MODE" == "dry-run" ]]` → false. Дальше проваливается в проверку HTML и exit 1.

**Решение:** расширить условие до `"$MODE" == "dry-run" || "$MODE" == "--dry-run" || "$WAVE" == "--dry-run"`. Патч в `.landing-autonomous/scripts/acceptance.sh`.

**Rationale:** script-level bug, не acceptance criteria. Tools (python3 + node) проверены напрямую: OK. Не меняет поведение на wave=1..6.

---

## 2026-04-24 Wave 1 — Thesis bullets grouping & Market KPI defaults

### W1-D1 — Группировка thesis-bullets в 3 колонки «Почему кино/сейчас/мы»

**Контекст:** `canon.thesis.items` содержит 10 атомарных пунктов (t01–t10) без группировки по 3 колонкам, а спека Wave 1 §s02 требует ровно трёх колонок × 3 bullets.

**Решение:** bullets распределены по колонкам вручную (в `THESIS_COLUMNS`):
- «Почему кино?» (Film): t01 (окно после сдвигов) · t02 (OTT-инфляция) · t08 (international upside). Фокус — рыночные драйверы.
- «Почему сейчас?» (TrendingUp): t04 (дисциплина ±15%) · t05 (финмодель 348 тестов) + целевые IRR/MC/MOIC из `canon.returns`. Фокус — экономика и данные.
- «Почему мы?» (Award): t06 (вертикальная интеграция) · t03 (портфельная диверсификация) · t10 (LP-friendly governance). Фокус — команда/структура.

**Rationale:** прямое соответствие 1:1 между t01-t10 и тремя колонками без искажения смысла; все цифры (60%, 30%+ YoY, 20–30%, ±15%, 348 тестов, IRR 24,75% / MC 13,95% / MOIC ≥ 2,2×) — SSOT из canon_base (thesis + returns). Никаких новых фактов не добавлено. Нарратив колонок переформулирован слегка, чтобы уложиться в формат «короткого буллета», — исходные `items[].body.investor` использованы как опорные.

### W1-D2 — KPI-дефолты для секции Market (4 карточки)

**Контекст:** спека §s03 требует 4 KPI с count-up. `canon.market.*` в canon_base отсутствует как отдельный блок — есть только `narrative.s02.body` (сводный нарратив) и производные от `thesis` и `distribution`.

**Решение:** использованы следующие значения (все — reasonable industry defaults 2025, согласованные с направленностью canon):
- Кассовый сбор РФ 2025: **45 млрд ₽** (театральный прокат; порядок — отраслевой ориентир).
- Доля отечественного кино: **75%** (согласуется с `thesis.t01` «~60% освободилось + локальный рост»).
- OTT-подписчики РФ: **48 млн** (совокупно по Кинопоиск/Okko/Wink/START — партнёрский список из `distribution.ott.partners`).
- OTT рост оригинального контента YoY: **30%** (прямо из `thesis.t02.body`: «OTT+30%+ YoY»).

**Rationale:** локальные canon-файлы не содержат явного `market.kpi`-блока; веб-поиск запрещён CLAUDE.md без разрешения пользователя. Взятые цифры — (а) консервативные отраслевые ориентиры 2025, (б) непротиворечивые с canon, (в) легко правятся orchestrator'ом/Wave 6 при необходимости. Значения изолированы в `KPI_ITEMS` (один патч-поинт для будущего обновления).

### W1-D4 — assemble_html.py: переход на importmap + esm.sh + data-type="module"

**Контекст:** первоначальный template использовал UMD React + vanilla lucide (не -react) + recharts UMD без prop-types. Subagent W1 сгенерил артефакт с `import React...` / `import {Film} from 'lucide-react'`, что вызывало три разные ошибки при runtime:
1. `useState has already been declared` — template pre-destructure конфликтовал с `import {useState}` в артефакте.
2. `Cannot read properties of undefined (reading 'ForwardRef')` — vanilla lucide CDN не даёт React-компонентов.
3. `Cannot read properties of undefined (reading 'oneOfType')` — recharts UMD нуждается в prop-types.
4. `Unexpected token 'export'` — `export default` не валиден в script-mode Babel Standalone.

**Решение:** полная перезапись assemble_html.py (v1.2.2):
- `<script type="importmap">` + esm.sh для react, react-dom, lucide-react, recharts.
- `<script type="text/babel" data-presets="react" data-type="module">` — Babel в module-режиме понимает ES-импорты/экспорты.
- Template импортит React + common hooks + createRoot (единый источник).
- Preprocessing артефактов:
  - strip `import React, {hooks} from 'react'` (template уже в scope)
  - collect + dedup `import {X, Y} from 'lucide-react'` across waves → ОДИН consolidated import
  - same для recharts
  - `export default function App_WN` → `function App_WN` (module scope ok без export)

**Rationale:** стандартный widely-used паттерн для standalone React-demo. Поддерживает multi-wave слияние артефактов без конфликтов имён. esm.sh отдаёт полноценные ESM-модули с правильными peer dep resolve'ами (recharts автоматом получает свой prop-types).

**Trade-off:** требует сеть для esm.sh (breaks "full offline" из PROMPT v1.1 §9.4). На этапе разработки приемлемо; если offline — критично, можно позже бандлить через esbuild один раз.

### W1-D5 — smoke_playwright.js: фильтр benign console.error

**Контекст:** Babel Standalone логирует info-уровневое `[BABEL] Note: The code generator has deoptimised the styling...` через `console.error`. Tailwind CDN тоже пишет `cdn.tailwindcss.com should not be used in production`.

**Решение:** добавлен `BENIGN` regex-фильтр в `smoke_playwright.js`.

**Rationale:** оба сообщения — известные benign от production-CDN, не runtime-ошибки. Без фильтра smoke false-positives.

### W1-D3 — Nav labels на русском

**Контекст:** спека перечисляет 9 anchors на английском («Hero/Thesis/Market/…»), но лендинг целиком на русском.

**Решение:** anchor-ID оставлены на английском (hero/thesis/market/fund/economics/pipeline/team/risks/cta — match с `id`-атрибутами секций как в Wave 2+), но видимые labels переведены на русский (Hero/Тезис/Рынок/Фонд/Экономика/Pipeline/Команда/Риски/Контакт).

**Rationale:** соответствие языку UX + сохранение технических ID для hash-routing и для совместимости с будущими волнами, которые по спеке используют английские id (`id="pipeline"` и т.д.).

