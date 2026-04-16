# 50_VERIFICATION.md — План П5 «Максимум» 32/32 для Phase 2B

**Исполнитель:** S51 QA & Build
**Артефакт:** `P5_Phase2B_Verification_Report_v1.0.docx` → `/sessions/bold-magical-gauss/mnt/Холдинг/`
**Критерий успеха:** ≥ 30 зелёных (✅), 0 красных (❌), ≤ 2 жёлтых (🟡) с явным планом закрытия.

---

## 1. Архитектура верификации

Полная архитектура П5 содержит **32 механизма**, разложенных по **6 категориям**. Для Phase 2B применяются **все 32**, но основная нагрузка распределена по приоритетам:

| Приоритет | Механизмы | Причина фокуса |
|-----------|-----------|----------------|
| **A (критические)** | №3, №4, №20, №23, №30 | Числовые расчёты + стресс-тест бюджета 650 KB |
| **B (регрессия)** | №25, №26, №29, №32 | Phase 2A не должна сломаться, кросс-модальность |
| **C (структурные)** | №5, №8, №9, №21, №22, №24 | Формат документа, согласованность файлов |
| **D (логика/источники)** | №1, №2, №6, №7, №10–17, №18, №19, №28 | Факты, хронология, происхождение, скрытые допущения |
| **E (аудитория)** | №27, №31 | Моделирование восприятия LP |

---

## 2. Механизмы категории A (критические, числовые)

### №3 Сверка сумм

**Что проверяется:**
- Сумма `pipeline.revenue_by_year[].base` == якорь 3 000 млн ₽ (допуск ±0.1%)
- Сумма MC-распределения `mc.irr_distribution[].prob` == 1.0 (допуск ±0.001)
- Сумма `peers.comparables[]` строк == ожидаемое число peers (6±1)

**Автоматизация:** `tests/verify/numerical_check.py`

### №4 Проверка границ

**Что проверяется:**
- `slider.rate ∈ [10, 25]`, `slider.horizon ∈ [3, 10]`, `slider.stress ∈ [0, 100]`
- IRR в отображении в диапазоне `[-50%, +80%]` (экстремальные значения — флаг)
- Все год-метки `∈ [2026, 2035]`

### №20 Двойной расчёт

**Что проверяется:** ключевые метрики (IRR, NPV, EBITDA margin) — рассчитать независимо в JS-чарте и сверить с `deck_data_v1.2.0.json`.

### №23 Метаморфическое тестирование

**Что проверяется:**
- Scenario bull ⇒ все revenue_by_year[].bull ≥ base ≥ bear
- Если slider.stress = 0, MC-распределение идентично baseline
- Если slider.stress = 100, p5 ≤ p50 - 3σ (стресс проявляется)
- Если rate растёт, NPV падает (монотонность)

### №30 Стресс-тест бюджета

**Что проверяется:**
- `os.path.getsize('Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html') ≤ 650_000`
- Time-to-interactive в Chrome DevTools simulator ≤ 2.5 s (Slow 4G)
- 7 чартов рендерятся за ≤ 500 ms total (измерение через `chart:rendered` events)

---

## 3. Механизмы категории B (регрессия Phase 2A)

### №25 Защита от регрессии

**Что проверяется:**
- Все 35 тестов Phase 2A продолжают проходить: `pytest src/components.test.js`
- API `TS.Components`, `TS.State`, `I18N`, `A11Y` не изменился — сигнатуры функций идентичны
- 280 ключей i18n Phase 2A на месте и без изменений значений

### №26 Дрейф смысла

**Что проверяется:** новые ключи i18n в `en.json` не являются stub'ами вида `[EN:...]` — либо переведены, либо явно помечены для Phase 2D.
- Подсчёт: `count(en.json values матчащих /^\[EN:/)` → записать в отчёт
- Порог: ≤ 5 новых stub-ключей (существующие 261 из Phase 2A — not-in-scope, закрывается в Phase 2D)

### №29 Кросс-модальная проверка

**Что проверяется:**
- Каждый чарт имеет **aria-label** или **aria-describedby**
- Числовые значения в tooltip'ах совпадают с aria-live объявлениями
- Scenario switcher — radiogroup с корректными aria-checked
- Sliders — aria-valuenow / aria-valuemin / aria-valuemax

### №32 Ссылочная целостность

**Что проверяется:**
- Все `data-chart-id` в HTML разметке имеют соответствующий `TS.Charts.register(chartId, ...)`
- Все i18n-ключи, используемые через `data-i18n`, существуют в `ru.json` и `en.json`

---

## 4. Механизмы категории C (структурные)

| № | Название | Что проверяется |
|---|----------|-----------------|
| 5 | Формат документа | Итоговый HTML валидный (no unclosed tags) |
| 8 | Формат слайдов | Все 25 слайдов сохраняют Phase 2A-разметку (section/article структура) |
| 9 | Согласованность pptx/html | Slide-titles HTML == titles в pptx v1.1.2 (маппинг через data-slide-id) |
| 21 | Сверка вход-выход | `deck_data_v1.2.0.json` цифры → HTML tooltip значения (random spot-check 20 точек) |
| 22 | Согласованность файлов | `ru.json`, `en.json`, `deck_data*.json`, `build_html.py` — совместимые версии |
| 24 | Diff было/стало | `git diff af54bc1..HEAD` — генерируется summary (файлы, LOC, net delta) |

---

## 5. Механизмы категории D (логика, факты, источники)

| № | Название | Что проверяется (кратко) |
|---|----------|--------------------------|
| 1 | Точный перенос цифр/дат/имён | Имена проектов/peers, годы, названия — совпадают с первоисточником |
| 2 | Проверка выполнения запроса | Все 10 пунктов из 00_CC_PROMPT.md §9 выполнены |
| 6 | Хронология | Даты пайплайна монотонны: start < end, stages идут в правильном порядке |
| 7 | Поиск противоречий | MC p50 ≈ base scenario IRR ± 2% (иначе флаг) |
| 10 | Скрытые допущения | Таблица допущений в деке (discount rate, inflation, WACC) — документирована |
| 11 | Парадоксы | Peers IRR historic vs наш forecast — разница объяснена |
| 12 | Обратная логика | Если стресс = 0, MC должно сходиться к deterministic base IRR |
| 13 | Декомпозиция фактов | Revenue waterfall правильно суммируется |
| 14 | Оценка уверенности | Каждый MC/sensitivity чарт имеет "confidence band" или методологическую ссылку |
| 15 | Полнота | Все 7 чартов + 3 sliders + scenario switch + drilldown присутствуют |
| 16 | Спор «за/против» | Drill-down содержит и bull, и bear аргументы |
| 17 | Граф причин-следствий | Sensitivity matrix отражает зависимость IRR от rate/horizon правильно |
| 18 | Триангуляция источников | Peers из ≥ 2 публичных источников (10-K + annual report; отмечено) |
| 19 | Карта/цепочка происхождения | Каждая цифра → ссылка на `deck_data_v1.2.0.json` путь |
| 28 | Эпистемический статус | Synthetic fallback — помечен ⚠️ в payload и commit-msg |

---

## 6. Механизмы категории E (аудитория)

### №27 Моделирование аудитории

**Что проверяется:**
- LP должен за < 90 секунд ответить на 3 вопроса: «какой IRR?», «какой риск?», «какая траектория выручки?»
- Первый экран (без скролла) содержит scenario switcher + IRR + один ключевой чарт
- Jargon ≤ 5 уникальных терминов, не объяснённых в tooltips

### №31 Проверка адресата

**Что проверяется:** язык соответствует LP-аудитории (не inventor, не retail):
- Термины: IRR, NPV, EBITDA — используются без базовых пояснений (LP их знают)
- Но: «метаморфическое тестирование», «p5/p50/p95» — объясняются в drill-down methodology

---

## 7. Автоматизация vs LLM-проверка

| Механизм | Автомат | LLM | Комментарий |
|----------|:------:|:---:|-------------|
| №3 суммы | ✅ | — | Python script |
| №4 границы | ✅ | — | assert в тестах |
| №20 двойной расчёт | ✅ | — | Независимая JS-функция |
| №23 метаморфика | ✅ | — | Integration tests |
| №25 регрессия | ✅ | — | pytest |
| №26 дрейф | ✅ | ✅ | Count + семантическая выборка 10 ключей |
| №29 кросс-модальность | ✅ | ✅ | DOM-check + LLM оценка качества aria-labels |
| №30 бюджет | ✅ | — | os.path.getsize + perf-tool |
| №32 ссылки | ✅ | — | grep + JSON-validate |
| №10, 11, 14, 16 | — | ✅ | Только LLM (семантика) |
| №27, 31 | — | ✅ | LLM симулирует LP-взгляд |
| остальные | ✅+✅ | ✅+✅ | гибрид |

---

## 8. Автоматические скрипты S51 (список)

```bash
# 1. Regression (Phase 2A)
pytest src/components.test.js

# 2. Phase 2B unit + integration
pytest src/charts.test.js src/charts/*.test.js src/controls.test.js src/drilldown.test.js tests/e2e_phase2b.py

# 3. Budget
python -c "import os; s=os.path.getsize('Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html'); print(f'size={s}'); assert s <= 650_000"

# 4. Regex bans
grep -rn -E "eval\(|new Function|localStorage" src/ && exit 1 || echo OK

# 5. I18N symmetry
python -c "
import json
ru=json.load(open('i18n/ru.json')); en=json.load(open('i18n/en.json'))
d = set(ru.keys()) ^ set(en.keys())
assert not d, f'Asymmetry: {d}'
print(f'ru={len(ru)}, en={len(en)}')
"

# 6. EN stubs count
python -c "
import json, re
en = json.load(open('i18n/en.json'))
stubs = [k for k,v in en.items() if isinstance(v,str) and re.match(r'^\[EN:',v)]
print(f'stubs={len(stubs)}')
"

# 7. Numerical check
python tests/verify/numerical_check.py

# 8. Chart registration
grep -c "TS.Charts.register" Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html   # ожидаем 7

# 9. Aria coverage
python tests/verify/aria_check.py
```

---

## 9. Формат итогового отчёта

**Файл:** `P5_Phase2B_Verification_Report_v1.0.docx`
**Местоположение:** `/sessions/bold-magical-gauss/mnt/Холдинг/`
**Шаблон:** идентичен `P5_Phase2A_Verification_Report_v1.0.docx` (user preference #6)

Структура:

```
1. Резюме
   - Фаза: Phase 2B (v1.2.0)
   - Исполнение: S40–S51 (12 субагентов)
   - Дата: <auto>
   - Вердикт: ЗАКРЫТО / ЗАКРЫТО С ЖЁЛТЫМИ / НЕ ЗАКРЫТО

2. Сводная таблица 32 механизма
   - Колонки: №, Название, Статус, Комментарий
   - Цветовая маркировка: ✅/🟡/❌

3. Детали по механизмам (по категориям A→E)
   - Что проверялось
   - Результат (цифры, доказательства)
   - Вердикт

4. Жёлтые и красные флаги
   - Список
   - Причина
   - План закрытия (в Phase 2C/2D или hotfix)

5. Метрики бюджета
   - Фактический размер HTML
   - Таблица весов по модулям
   - Процент подушки

6. Метрики тестов
   - 35 Phase 2A + 35+ Phase 2B = ≥ 70 total
   - Coverage (если измеряется)

7. Git evidence
   - Commits: S40..S51 list
   - Tag: v1.2.0-phase2b
   - Push status: pushed to origin

8. Рекомендации в Phase 2C
   - Если жёлтые остались — явный план
```

---

## 10. Acceptance criteria (Phase 2B считается закрытой)

- [ ] ≥ 30 механизмов из 32 — зелёные (✅)
- [ ] 0 красных (❌)
- [ ] ≤ 2 жёлтых (🟡) с письменным планом закрытия
- [ ] HTML ≤ 650 000 байт
- [ ] Все 35 Phase 2A тестов + ≥ 35 новых = ≥ 70 passing
- [ ] I18N ru/en симметричны
- [ ] Нет eval/new Function/localStorage
- [ ] Git tag `v1.2.0-phase2b` создан и запушен в origin
- [ ] `P5_Phase2B_Verification_Report_v1.0.docx` сгенерирован

---

## 11. Escalation (если верификация не проходит)

1. **< 28/32 зелёных** → stop, вернуть CC для hotfix-спринта (S52)
2. **≥ 1 красный** → обязательный hotfix, не релизить в LP
3. **Бюджет превышен** → lazy-load Pipeline Gantt и MC Distribution (см. 00_CC_PROMPT.md §10)
4. **Регрессия Phase 2A** → revert Phase 2B полностью, анализ на отдельной ветке

**LP-дедлайн:** 29 апреля 2026. Если 25 апреля верификация не проходит — cut S48 (Peers) и S50 (Drill-down), сохраняем 6 чартов + sliders.
