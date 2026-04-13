# ПРОМТ: Полный технический аудит Investor Model v1.0 Public
**Версия промта:** v1.0 DRAFT
**Исполнитель:** Claude (самоаудит в Cowork — Read/Write/Edit + sandbox bash)
**Scope:** исключительно `investor_model_v1.0_Public.xlsx` (публичная версия для внешних инвесторов)
**Приоритет блоков:** A = B = C = D (все равнозначны)
**Толеранс:** стандартный (дельта > 0.1% = находка; для BS/Cash/Control = строго 0)
**Эталон сверки:** `investor_model_v1.0_Internal.xlsx` (Internal = ground truth, Public = производная)
**Ошибки скриптов:** auto retry (2 попытки) + fallback на ручной анализ
**Выход:** xlsx (7 листов: Findings + Summary + Roadmap + Improvements + DD Readiness + By Design + Script Results)

---

## Роль и мандат

Ты — независимый технический аудитор. Проведи полный аудит **публичной** финансовой модели холдинга «ТрендСтудио» (`investor_model_v1.0_Public.xlsx`) по четырём блокам:

- **A** — техническое состояние xlsx (OOXML, формулы, структура, локализация)
- **B** — математика и логика внутри модели (Revenue, Cost, P&L→CF→BS, Debt, Waterfall, DCF, MC, Tax, WC)
- **C** — сверка Public ↔ Internal (публичные метрики 1:1; by design расхождения; утечка Internal-данных в Public)
- **D** — Investor Readiness (готовность к внешней DD: защищённость допущений, transparency, red flags)

Аудит — **read-only**. Ничего не модифицировать. При обнаружении критического бага — сообщать немедленно.

---

## ⚠️ Приоритетные подозрения (проверить ПЕРВЫМИ)

1. **Утечка Internal-данных в Public.** Public должна быть «облегчённой» — без детализированного ФОТ, без индивидуальных P&L по проектам, без внутренних MC-допущений. Проверить: скрытые листы/строки/колонки с чувствительным содержимым; формулы, ссылающиеся на удалённые Internal-листы (#REF!/zombie); внутренняя метаинформация в docProps (автор, компания, revision notes); defined names на удалённые диапазоны.
2. **Рассогласование Public vs Internal в публичных метриках.** Public IRR 20.09% vs Internal IRR 24.75% — **by design** (W₃ vs W₅ V-D). Но **Revenue 3Y, EBITDA 3Y, NDP, Budget 1850, Two-tier GM, ВКЛ Σ3Y** должны совпадать 1:1. Любое расхождение в якорях = баг.
3. **Кумулятивный эффект XML-патчей v1.0 → v1.0.1 → v1.0.2.** Public прошла через переводы EN→RU и фиксы FOT/OPEX/Pipeline/CashFlow. Возможные остатки: битые rels, orphan calcChain, namespace inconsistencies, смешение sharedStrings/inlineStr, stale cached values после формульных патчей.

---

## Контекст проекта

### Investor Package v1.0 (scope аудита)
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **Основной файл:** `investor_model_v1.0_Public.xlsx`
- **Файл для сверки (эталон):** `investor_model_v1.0_Internal.xlsx`
- **Якорные метрики Public:**
  - IRR W₃ = 20.09% | MC IRR mean = 11.44%
  - Revenue 3Y = 4 545 млн ₽
  - EBITDA 3Y GAAP = 2 076.1 млн ₽ | NDP = 3 000 млн ₽
  - Budget = 1 850 млн ₽ (7 проектов: 5 фильмов + 2 сериала)
  - Two-tier GM: Films 55.8%, Series 47%, blended ~53.8%
  - ВКЛ: лимит 500, 16%, лаг 1 кв, Σ3Y interest = 28.18 млн
- **Waterfall Public:** W₃ (1× LiqPref + 8% coupon + 60/40 split)
- **История патчей:** v1.0 (initial) → v1.0.1 (RELEASED) → v1.0.2 (EN→RU + formula fixes FOT/OPEX/Pipeline/CashFlow)
- **Бэкапы:** .bak (initial), .bak2 (BS floor fix), .bak3 (cash sync)
- **Технология патчинга:** ZIP/XML surgery (lxml + zipfile), safe_serialize, namespace stripping

### Утилиты
- `rakhman_docs.py`: `/Users/noldorwarrior/Downloads/rakhman_docs.py` (XlsxBuilder — read-only use)
- `build_A5_cf_bs.py`: генератор CF/BS с W₃ waterfall priority

---

## Методология

### Шаг 0: Построение карты Public-файла
1. Открыть `investor_model_v1.0_Public.xlsx` → mapping всех листов (имя, диапазон, visibility, тип содержимого)
2. Сравнить список листов Public vs Internal → что удалено/скрыто/агрегировано (должно быть осознанно)
3. Построить граф зависимостей формул (лист → лист)
4. Сохранить карту в `audit_public_v1_map.json`

### Принципы работы
1. **Этапный режим с ТОЧКАМИ ПАУЗЫ:** блок → промежуточный xlsx → показать результаты → подтверждение → следующий блок
2. **Скриптовая верификация:** для каждой критической проверки — Python-скрипт + stdout/stderr в лог
3. **Auto retry + fallback:** 2 попытки фикса скрипта, потом ручной анализ с пометкой «manual fallback»
4. **Двойной расчёт:** IRR, EBITDA, NDP, BS balance, Cash chain — пересчитывать независимо
5. **Не доверять кэшам:** формулы пересчитывать программно
6. **Internal = эталон** для публичных метрик; by design расхождения (IRR W₃ vs W₅ V-D, MC параметры) — документировать в листе «By Design»
7. **Толеранс:** дельта > 0.1% = находка; для BS/Cash/Control = строго 0

### Сохранение прогресса между сессиями
При каждой ТОЧКЕ ПАУЗЫ:
- `audit_public_v1_findings_WIP.xlsx` — текущие находки
- `audit_public_v1_progress.json` — статус блоков/подблоков, время, количество проверок
- `audit_scripts/` — все написанные скрипты

---

## Автоматические скрипты (10 шт.) — обязательные

Все сохранять в `audit_scripts/`.

### СКРИПТ 1: `ooxml_integrity_public.py`
Public xlsx как zip. Проверить: rels targets существуют; нет orphan calcChain; namespace consistency (stripped vs full xmlns); нет смешения sharedStrings/inlineStr; нет битых ссылок на удалённые Internal-листы.
→ JSON `{issue, location, severity}`

### СКРИПТ 2: `formula_audit_public.py`
Для каждой ячейки каждого листа: формула → пересчёт → сравнение с cached. Найти: stale cache, hardcoded-where-formula-expected, #REF!/#NAME?/zombie-формулы от удалённых Internal-листов, null/0 из-за отсутствия Internal-ссылок.
→ JSON `{sheet, cell, formula, cached, recalculated, delta_pct, status}`

### СКРИПТ 3: `bs_balance_check_public.py`
16 периодов (Q1'26..Q4'28 + 2029..2032). Assets = L + E (толеранс = 0). Cash(BS) = EndingCash(CF) (толеранс = 0). Control = 0.
→ JSON `{period, assets, le, delta, cash_bs, cash_cf, delta_cash, control}`

### СКРИПТ 4: `irr_moic_recompute_public.py`
Извлечь cash flows из Public W₃ waterfall. Пересчитать IRR (numpy_financial.irr / scipy.optimize). Пересчитать MOIC. Сверка с 20.09%.
→ JSON `{metric, model_value, recomputed, delta, status}`

### СКРИПТ 5: `public_vs_internal_reconcile.py`
Извлечь якорные метрики из обоих файлов. Публичные (Revenue, EBITDA, NDP, Budget, GM, ВКЛ) = 1:1. By design (IRR W₃ vs W₅ V-D, MC) — документировать.
→ JSON `{metric, public, internal, delta_pct, expected_match, status}`

### СКРИПТ 6: `public_leakage_check.py` ⚠️ КРИТИЧНЫЙ
- Hidden sheets/rows/columns с чувствительным содержимым
- Формулы, ссылающиеся на несуществующие (удалённые) Internal-листы
- Комментарии/notes с внутренними ремарками
- Defined names, ссылающиеся на удалённые диапазоны
- docProps (core.xml, app.xml, custom.xml) — внутренняя метаинформация (автор, компания, revision notes, keywords)
→ JSON `{leak_type, location, content, severity}`

### СКРИПТ 7: `mc_convergence_public.py`
MC-движок Public: n=100, 500, 1000, 2000. Сходимость mean, стабилизация VaR. Корреляционная матрица — PSD.
→ JSON `{n, mean, std, var95, var99, psd_check}`

### СКРИПТ 8: `localization_check_public.py`
Все ячейки с текстом: непереведённые EN-метрики, дубли типа «КЛЮЧЕВЫЕ ВЫВОДЫ (КЛЮЧЕВЫЕ ВЫВОДЫ)», формат «EN (RU)», консистентность терминологии.
→ JSON `{sheet, cell, text, issue}`

### СКРИПТ 9: `tax_wc_chain_public.py`
Tax: ставка ННП РФ 20%, налоговая база = EBT, Tax→P&L→CF chain. WC: days (AR/AP/inventory) — реалистичность для кино; ΔAR+ΔInv−ΔAP=ΔWC; WC→CF impact; NDP preservation (WC/Gov compensation 232.6→323.9).
→ JSON `{check, expected, actual, delta, status}`

### СКРИПТ 10: `going_concern_tail_public.py` ⚠️ ПРИОРИТЕТ
Хвост 2029–2032:
- ФОТ/Revenue ≤ 100% (проверить подозрение 106% в 2032)
- DCF going-concern (Rev 1500/1600) vs P&L хвост (380/300/220/150) — обоснование расхождения
- Index mapping: [0..11]=Q1'26..Q4'28, [12..15]=2029..2032
→ JSON `{year, fot, revenue, ratio, dcf_rev, pl_rev, delta, status}`

---

## БЛОК A: Техническое состояние xlsx-файла Public

### A.1 OOXML-целостность (СКРИПТ 1)
XML-парсинг, sharedStrings vs inlineStr (смешение), calcChain orphan, rels targets, namespace (stripped vs full), остаточные артефакты v1.0.1 → v1.0.2 патчей.

### A.2 Формулы vs. кэши (СКРИПТ 2)
Формулы/хардкоды/ratio, stale cache, мёртвые ячейки (должна быть формула — стоит хардкод), #REF!/zombie от удалённых Internal-листов.

### A.3 Структура листов
Карта Public листов: диапазон, merged, hidden. Сравнение с Internal — что удалено/скрыто/агрегировано (должно быть осознанно). Пустые листы, заглушки, данные за визуальной областью.

### A.4 Стили и форматирование
Числовые форматы (единообразие), conditional formatting (конфликты, зависимость от удалённых диапазонов), print areas / page breaks.

### A.5 Бэкапы и версионирование
Инвентаризация .bak* для Public, git-статус (tracked/ignored/modified), рекомендация по безопасному удалению.

### A.6 Локализация EN→RU (СКРИПТ 8)
Непереведённые метрики, дубли, формат «English (Русский)», единообразие терминологии.

### A.7 Public-специфичные проверки (СКРИПТ 6)
Leakage: hidden sheets/rows/columns, defined names, comments, docProps, custom properties.

🔴 **ТОЧКА ПАУЗЫ после Блока A** — сохранить WIP xlsx + progress.json, показать результаты, ждать подтверждения.

---

## БЛОК B: Математика и логика Public-модели

### B.1 Revenue Model
Revenue shares (38/28/15/12/7) → Σ=100%. Revenue waterfall по кварталам — нет double-counting. CAGR. Тайминг фильмов vs recognition.

### B.2 Cost Model
FOT-индексация ×1.08 единообразно (включая фикс v1.0.2). OPEX % split = 100% в каждом периоде (фикс v1.0.2). Content Pipeline: Σ 7 проектов = 1 850 млн ₽ (фикс v1.0.2). Two-tier GM: Films 55.8%, Series 47%, blended 53.8% — пересчёт. CAPEX 5/45/35/15.

### B.3 P&L → CF → BS (СКРИПТ 3)
Сквозная сверка: Revenue → P&L → CF → BS. NI + D + ΔWC = OpCF. BS balance: Assets = L + E во всех 16 периодах (толеранс = 0). Cash(BS) = EndingCash(CF) во всех периодах (толеранс = 0, фикс v1.0.2). Control = 0. BS floor fix — identity не нарушена.

### B.4 Debt и Interest
ВКЛ dynamic interest: лимит 500, 16%, лаг 1 кв. Interest (P&L) = Interest (CF). Debt balance (BS) = Debt schedule. Пиковые Q3'26 / Q2'27.

### B.5 Waterfall W₃ и IRR (СКРИПТ 4)
W₃ priority: 1× LiqPref + 8% coupon + 60/40 split. Σ distributions = available cash. IRR 20.09% — независимый пересчёт. MOIC — independent.

### B.6 Valuation (Public view)
DCF WACC 19%. Terminal value methodology + growth rate. Comps (если раскрыты в Public). Dual-year EV: FY2027 + FY2028 → midpoint.

### B.7 Monte Carlo Public (СКРИПТ 7)
Сходимость (n=100..2000), PSD корреляций, VaR95/99, MC IRR mean 11.44%, breach probability.

### B.8 Sensitivity
Matrix 27 (3×3×3) — если раскрыта в Public. Tornado top-5 drivers. Stress-тесты vs accounting identity.

### B.9 Tax + WC (СКРИПТ 9)
Ставка ННП РФ (20%), налоговая база, Tax chain. WC days (AR/AP/inventory) реалистичность для кино. ΔAR+ΔInv−ΔAP=ΔWC. NDP preservation 232.6→323.9.

### B.10 Going Concern 2029–2032 ⚠️ ПРИОРИТЕТ (СКРИПТ 10)
ФОТ/Revenue ≤ 100% (проверка 106% в 2032). DCF (Rev 1500/1600) vs P&L (380/300/220/150) — обоснование. Index mapping.

🔴 **ТОЧКА ПАУЗЫ после Блока B**

---

## БЛОК C: Сверка Public ↔ Internal (СКРИПТ 5)

### C.1 Якорные метрики (должны совпадать 1:1)
| Метрика | Public | Internal | Допуск |
|---|---|---|---|
| Revenue 3Y | 4 545 | 4 545 | 0% |
| EBITDA 3Y GAAP | 2 076.1 | 2 076.1 | ≤ 0.1% |
| NDP | 3 000 | 3 000 | 0% |
| Budget (7 проектов) | 1 850 | 1 850 | 0% |
| Two-tier GM | 55.8/47 | 55.8/47 | 0% |
| ВКЛ Σ3Y interest | 28.18 | 28.18 | ≤ 0.1% |

### C.2 By Design расхождения (документировать)
| Метрика | Public | Internal | Обоснование |
|---|---|---|---|
| IRR | 20.09% (W₃) | 24.75% (W₅ V-D) | Разные waterfall |
| MC IRR mean | 11.44% | 13.95% | Разные сценарии |
| Waterfall структура | W₃ | W₅ V-D | Public — упрощённая |

### C.3 Структурная согласованность
Количество проектов, названия, тайминги — идентичны. Горизонты Q1'26–Q4'28 + 2029–2032 — идентичны. Макро (inflation, FX) — идентичны.

### C.4 Полнота скрытия чувствительного в Public
- Детальный ФОТ по должностям → агрегирован
- Индивидуальные P&L по проектам → агрегированы/скрыты
- Внутренние MC допущения → упрощены
- Комментарии/notes внутренние → удалены

🔴 **ТОЧКА ПАУЗЫ после Блока C**

---

## БЛОК D: Investor Readiness

### D.1 Financial Integrity
BS balance, Cash chain CF→BS, Control = 0, Waterfall Σ = available cash.

### D.2 Model Transparency
Ключевые допущения видимы, формулы не захардкожены (кроме inputs), input/output разделены, версия модели указана.

### D.3 Assumptions Defensibility
Revenue shares (38/28/15/12/7) — benchmark. GM 55.8/47 — индустрия кино РФ. FOT 8% — макро-обоснование. WACC 19% — CAPM. Terminal growth — реалистичность.

### D.4 Sensitivity to Key Inputs
Matrix 27 раскрыта. Tornado top-5 drivers. Stress-тесты presentable.

### D.5 Red Flags для инвестора
- ФОТ/Revenue 106% в 2032 — **critical**
- DCF vs P&L tail mismatch — требует объяснения
- Любые #REF!/zombie-формулы — автоматический дисквалификатор
- Утечка Internal-данных — репутационный риск

### D.6 Вероятные вопросы инвестора
- «Почему IRR 20% vs 24.75% Internal?» → W₃ vs W₅ V-D
- «Что в хвосте 2029–2032 с ФОТ?» → требует фикса
- «Откуда two-tier GM 55.8/47?» → benchmark
- «Почему MC IRR 11.44% vs модельный 20%?» → волатильность + correlations

🔴 **ТОЧКА ПАУЗЫ после Блока D**

---

## Формат выхода: `audit_public_v1_findings.xlsx`

### Лист «Findings»
| ID | Блок | Подблок | Severity | Статус | Находка | Доказательство | Ожидание | Факт | Δ% | Уверенность | Рекомендация | Приоритет | Скрипт |

**Severity:** Critical (нарушает целостность модели) / Major (влияет на метрики) / Minor (косметика) / Info
**Приоритет fix:** P1 (немедленно) / P2 (следующая итерация) / P3 (бэклог)

### Лист «Summary»
- Матрица: Блок × Severity — количество
- Общий вердикт: PASS / CONDITIONAL PASS / FAIL
- Top-10 рисков с приоритизацией
- Статистика: всего проверок, PASS/FAIL/WARNING

### Лист «Roadmap»
- Quick wins (< 1 часа)
- Structural fixes (1–4 часа)
- Architectural improvements (> 4 часов)

### Лист «Improvements»
| ID | Блок | Область | Текущее состояние | Рекомендация | Effort | Impact | Приоритет |

### Лист «DD Readiness»
| Категория | Статус | Red Flags | Вероятные вопросы инвестора | Рекомендация по подготовке |

Категории: Financial Integrity, Model Transparency, Audit Trail, Documentation, Assumptions Defensibility, Sensitivity to Key Inputs, Public-Safe (no leakage).

### Лист «By Design»
| ID | Блок | Находка | Обоснование (by design) | Риск если не пересмотреть | Рекомендация |

Пример: IRR W₃ 20.09% vs W₅ V-D 24.75% — design decision (упрощённый публичный waterfall), но риск — «инвестор сравнит с Internal».

### Лист «Script Results»
Сводка всех 10 скриптов: время, PASS/FAIL/WARNING, количество проверок. Ошибки скриптов и fallback-действия.

---

## Правила выполнения

1. **Шаг 0 первым:** карта Public до любых проверок
2. **Приоритетные подозрения:** 3 зоны риска ДО системного аудита
3. **Этапный режим:** блок → ТОЧКА ПАУЗЫ → подтверждение → следующий блок
4. **Скрипты сначала:** автоматика до ручного анализа
5. **Auto retry:** 2 попытки фикса, потом ручной fallback + пометка «manual fallback»
6. **Read-only:** ничего не модифицировать в проверяемых файлах
7. **Каждая находка с доказательством:** лист, ячейка, числа
8. **Internal — эталон** для публичных метрик; by design расхождения — в листе «By Design»
9. **Скрипты сохранять:** все 10 → `audit_scripts/`
10. **Прогресс сохранять:** `audit_public_v1_findings_WIP.xlsx` + `audit_public_v1_progress.json` при каждой паузе
11. **Критические баги:** сообщать немедленно

---

## Контрольный чеклист (самопроверка аудитора)

- [ ] 3 приоритетных подозрения проверены (утечка, рассогласование, XML-патчи)
- [ ] IRR W₃ 20.09% пересчитан независимо (СКРИПТ 4)
- [ ] BS balance во всех 16 периодах (СКРИПТ 3)
- [ ] Cash chain CF→BS во всех периодах (СКРИПТ 3)
- [ ] Public vs Internal — якорные сверены (СКРИПТ 5)
- [ ] Leakage-проверка пройдена (СКРИПТ 6)
- [ ] MC-сходимость (СКРИПТ 7)
- [ ] Локализация (СКРИПТ 8)
- [ ] Tax + WC chain (СКРИПТ 9)
- [ ] Going concern хвост (СКРИПТ 10)
- [ ] OOXML целостность (СКРИПТ 1)
- [ ] Formula audit (СКРИПТ 2)
- [ ] DD Readiness оценка
- [ ] Все 10 скриптов запущены
- [ ] `audit_public_v1_findings.xlsx` (7 листов)
- [ ] Top-10 рисков приоритизированы
