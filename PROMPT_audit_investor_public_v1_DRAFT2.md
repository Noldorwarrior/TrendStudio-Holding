# ПРОМТ: Полный DD-grade аудит Investor Model v1.0 Public
**Версия промта:** v2.0 DRAFT
**Платформа запуска:** Claude Code (с субагентами-верификаторами, параллельной проверкой блоков A/B/C/D/E/F, автоматизированными Python-скриптами)
**Scope:** `investor_model_v1.0_Public.xlsx` (основной) + `investor_model_v1.0_Internal.xlsx` (эталон для leakage/якорей) + сопроводительные документы (Cover Letter, методологическая записка, README, assumptions log)
**Приоритет блоков:** A = B = C = D = E = F (все равнозначны)
**Толеранс:** стандартный (дельта > 0.1% = находка; для BS/Cash/Control = строго 0)
**Бюджет:** без ограничений — глубина > скорости
**Цель:** комбинированная — (1) подготовка к передаче инвестору, (2) внутренний QA, (3) регуляторная проверка (Фонд кино, NDP, гос. компенсации)
**Верификация результатов:** Полная П5 «Максимум» (все 32 механизма)
**Ошибки скриптов:** auto retry (2 попытки) + fallback на ручной анализ
**Выход:** xlsx (9 листов) + docx Executive Summary (3–5 стр.)

---

## Роль и мандат

Ты — независимый финансовый аудитор **DD-grade** (уровень bulge bracket, 15+ лет опыта due diligence медиахолдингов РФ). Одновременно выступаешь как Python-инженер пайплайна финмодели: владеешь OOXML zip-surgery, numpy_financial, scipy, openpyxl strict mode.

Проведи **полный аудит** публичной финансовой модели холдинга «ТрендСтудио» (`investor_model_v1.0_Public.xlsx`) по **шести блокам**:

- **A** — техническое состояние xlsx (OOXML, формулы, структура, локализация, version control, Git-гигиена)
- **B** — математика и логика финмодели (Revenue, Cost, P&L→CF→BS, Debt/Covenants, Waterfall+Investor Rights, Cap Table, DCF, MC, Tax, WC, Unit Economics, Accounting Identity)
- **C** — сверка Public ↔ Internal (якорные метрики 1:1; by design расхождения; leakage Internal-данных)
- **D** — Investor Readiness (стресс-тесты, peer benchmarking, ESG/страновые риски, defensibility)
- **E** — Going Concern 2029–2032 (FOT cap + Revenue floor + DCF reconciliation + 2 сценария: run-off и pipeline renewal)
- **F** — Cover docs & Documentation (Cover Letter sync, методологическая записка, README, assumptions log)

Аудит — **read-only**. Ничего не модифицировать. Критические баги — сообщать немедленно.

---

## ⚠️ Приоритетные подозрения (проверить ПЕРВЫМИ — до системного аудита)

1. **Утечка Internal-данных в Public.** Public должна быть «облегчённой» — без детализированного ФОТ, без индивидуальных P&L по проектам, без внутренних MC-допущений. Проверить: скрытые листы/строки/колонки; формулы #REF!/zombie от удалённых Internal-листов; docProps метаинформация (автор, компания, revision notes, keywords); defined names на удалённые диапазоны; custom properties.

2. **Рассогласование Public vs Internal в публичных метриках.** Public IRR 20.09% vs Internal IRR 24.75% — **by design** (W₃ vs W₅ V-D). Но **Revenue 3Y = 4 545, EBITDA 3Y GAAP = 2 076.1, NDP = 3 000, Budget = 1 850, Two-tier GM 55.8/47, ВКЛ Σ3Y = 28.18** — должны совпадать 1:1. Любое расхождение в якорях = баг.

3. **Кумулятивный эффект XML-патчей v1.0 → v1.0.1 → v1.0.2.** Public прошла через EN→RU + формульные фиксы (FOT/OPEX/Pipeline/CashFlow) + BS floor + cash sync. Возможные остатки: битые rels, orphan calcChain, namespace inconsistencies, смешение sharedStrings/inlineStr, stale cached values после формульных патчей, орфан-ссылки на удалённые Internal-диапазоны.

4. **Going Concern abnormalities 2029–2032.** ФОТ/Revenue ≈ 106% в 2032 (физически невозможно). DCF Revenue 1500/1600 vs P&L Revenue 380/300/220/150 — разрыв в 10× в одних и тех же годах. Требует: FOT cap + Revenue floor + DCF reconciliation note + 2 сценария (run-off + pipeline renewal).

---

## Контекст проекта

### Investor Package v1.0 (scope аудита)
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **Основной файл:** `investor_model_v1.0_Public.xlsx`
- **Файл для сверки (эталон):** `investor_model_v1.0_Internal.xlsx`
- **Сопроводительные:** Cover Letter (Internal + Public), методологическая записка, README, assumptions log
- **Якорные метрики Public:**
  - IRR W₃ = 20.09% | MC IRR mean = 11.44%
  - Revenue 3Y = 4 545 млн ₽
  - EBITDA 3Y GAAP = 2 076.1 млн ₽ | NDP = 3 000 млн ₽
  - Budget = 1 850 млн ₽ (7 проектов: 5 фильмов + 2 сериала)
  - Two-tier GM: Films 55.8%, Series 47%, blended ~53.8%
  - ВКЛ: лимит 500, 16%, лаг 1 кв, Σ3Y interest = 28.18 млн
- **Waterfall Public:** W₃ (1× LiqPref + 8% coupon + 60/40 split)
- **История патчей:** v1.0 → v1.0.1 (RELEASED) → v1.0.2 (EN→RU + formula fixes)
- **Бэкапы:** .bak, .bak2, .bak3

### Pipeline context (для cross-reference)
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/pipeline/` (L4 архитектура, 348 тестов, verify_full.py П5)

### Утилиты
- `rakhman_docs.py`: `/Users/noldorwarrior/Downloads/rakhman_docs.py`
- `build_A5_cf_bs.py`: CF/BS генератор с W₃ waterfall

---

## Методология

### Шаг 0: Построение карты Public-файла
1. `investor_model_v1.0_Public.xlsx` → mapping всех листов (имя, диапазон, visibility, тип)
2. Сравнение списка листов Public vs Internal → удалено/скрыто/агрегировано
3. Граф зависимостей формул (лист → лист)
4. Сохранить в `audit_public_v1_map.json`

### Принципы работы (Claude Code)
1. **Этапный режим с ТОЧКАМИ ПАУЗЫ:** блок → промежуточный xlsx → показать результаты → подтверждение → следующий блок
2. **Субагенты-верификаторы:** для блоков A, B, C, D, E, F — запускать **параллельно** через Task tool (subagent_type: general-purpose), каждый со своим scope
3. **Скриптовая верификация:** для каждой критической проверки — Python-скрипт в `audit_scripts/` + stdout/stderr в лог
4. **Auto retry + fallback:** 2 попытки фикса, потом ручной анализ с пометкой «manual fallback»
5. **Двойной расчёт:** IRR, EBITDA, NDP, BS balance, Cash chain, Cap Table, Covenants — независимые пересчёты
6. **Не доверять кэшам:** формулы пересчитывать программно
7. **Internal = эталон** для публичных метрик; by design расхождения — в листе «By Design»
8. **Толеранс:** дельта > 0.1% = находка; для BS/Cash/Control = строго 0
9. **Триангуляция источников:** benchmarks сверять с 2+ независимыми источниками (Росстат, ФинКоРусс, TASS, Кинопоиск Pro, Яндекс IR)

### Сохранение прогресса между сессиями
- `audit_public_v1_findings_WIP.xlsx` — находки (при каждой паузе)
- `audit_public_v1_progress.json` — статус блоков
- `audit_scripts/` — все скрипты

---

## Автоматические скрипты (18 шт.) — обязательные

### БЛОК A: xlsx-техника
**С1: `ooxml_integrity_public.py`** — rels, calcChain orphan, namespace consistency, смешение sharedStrings/inlineStr, битые ссылки на удалённые Internal-листы.

**С2: `formula_audit_public.py`** — формула → пересчёт → сравнение с cached. Stale cache, #REF!/#NAME?/zombie, null/0 из-за отсутствия Internal-ссылок.

**С3: `version_git_hygiene.py`** — .bak* инвентаризация, git status, git log --oneline для Public файла, uncommitted changes, history patterns (force push, подозрительные откаты), .gitignore валидация.

### БЛОК B: финмодель
**С4: `bs_balance_check_public.py`** — 16 периодов, Assets=L+E (0), Cash(BS)=EndingCash(CF) (0), Control=0.

**С5: `irr_moic_recompute_public.py`** — IRR W₃ (numpy_financial/scipy), MOIC, сверка с 20.09%.

**С6: `accounting_identity_check.py`** — GAAP vs IFRS vs RAS: какой стандарт применён, консистентность, конвертируемость для западного инвестора. Revenue recognition: completed contract vs percentage-of-completion. Operating lease vs financial lease. Capitalized vs expensed content production.

**С7: `covenant_compliance_public.py`** — Debt/EBITDA (typical cap ≤ 4x), ICR Interest Coverage (≥ 2.5x), DSCR Debt Service Coverage (≥ 1.25x), в пиковые кварталы Q3'26/Q2'27. Для ВКЛ: соответствие лимиту 500, cooling-off periods.

**С8: `unit_economics_per_project.py`** — для каждого из 7 проектов (если раскрыто): budget → expected Revenue → expected EBITDA → ROI на бюджет → Payback period → вклад в консолидированную EBITDA. Ранжирование от лучших к худшим.

**С9: `mc_convergence_public.py`** — n=100, 500, 1000, 2000. Сходимость mean, стабилизация VaR. Корреляционная матрица PSD.

**С10: `tax_wc_chain_public.py`** — Tax ННП 20% РФ, Tax→P&L→CF chain. WC days (AR/AP/inventory). NDP preservation 232.6→323.9.

### БЛОК C: Public↔Internal
**С11: `public_vs_internal_reconcile.py`** — якорные метрики 1:1, by design расхождения документировать.

**С12: `public_leakage_check.py`** ⚠️ КРИТИЧНЫЙ — hidden sheets/rows/columns, формулы на удалённые Internal-листы, комментарии/notes, defined names, docProps.

### БЛОК D: Investor Readiness
**С13: `stress_tests_investor.py`** — 6 шок-сценариев:
- Revenue −20% (рецессионный)
- FOT +15% (инфляционный)
- WACC +3 пп (рост ставок)
- NDP отменён (регуляторный риск)
- Провал 1-го фильма (худшая коробка)
- Девальвация рубля −30% (FX-шок)
Для каждого: ΔIRR, ΔEBITDA, BS consistency, covenant breach probability.

**С14: `cap_table_dilution.py`** — структура АК (founders/investors/ESOP), pre-money/post-money, anti-dilution, pro-rata rights, dilution scenarios (next round, down round). Проверка суммы долей = 100% в каждом round.

**С15: `investor_rights_waterfall.py`** — W₃ детально: LiqPref 1×, coupon 8%, participation/cap, downside protection. Pay-off инвестора в сценариях: Best/Base/Worst. Break-even инвестиции.

**С16: `peer_benchmarking.py`** — Peers RU: Яндекс (медиа-сегмент), VK, Окко, IVI, START. Peers global: Netflix, Disney, Warner, Lionsgate. Метрики: EV/EBITDA, P/E, EV/Revenue, GM, Operating Margin. Где ТрендСтудио выше/ниже peers → defensibility.

**С17: `esg_country_risk.py`** — ESG флаги (transparency, governance, environmental footprint кинопроизводства). Страновые риски: санкции (вторичные), FX, регуляторный режим (Минкультуры, Фонд кино). Russia risk premium в WACC.

### БЛОК E: Going Concern
**С18: `going_concern_tail_public.py`** ⚠️ ПРИОРИТЕТ — расширенный:
- ФОТ/Revenue ≤ 100% проверка (подозрение 106% в 2032)
- **FOT cap механизм:** если Revenue падает >15%, ФОТ автоматически замораживается/сокращается — реализован ли в формулах?
- **Revenue floor:** минимум 15–20% от пика в run-off (лицензии старых фильмов, VOD, перепродажа прав) — заложен ли?
- **DCF vs P&L reconciliation:** Rev 1500/1600 vs 380→150 — есть ли объяснение (reconciliation note)
- **Два сценария:** (1) run-off scenario — постепенное сворачивание, (2) pipeline renewal — запуск новых фильмов с 2029. Оба должны быть явно представлены.
- Index mapping [0..11]=Q + [12..15]=Y

### Отдельно (не скрипт):
**С19: `localization_check_public.py`** — непереведённые EN, дубли «КЛЮЧЕВЫЕ ВЫВОДЫ (КЛЮЧЕВЫЕ ВЫВОДЫ)», формат «EN (RU)», терминология.

**С20: `cover_docs_sync.py`** — Cover Letter Internal ↔ Public: даты, версии, ключевые цифры. Методологическая записка vs модель. README актуальность. Assumptions log (все ~150 различий Internal vs Public задокументированы).

---

## БЛОК A: Техническое состояние xlsx (Public)

### A.1 OOXML-целостность (С1)
XML-парсинг, sharedStrings/inlineStr смешение, calcChain orphan, rels targets, namespace, остаточные артефакты v1.0.1→v1.0.2.

### A.2 Формулы vs. кэши (С2)
Формулы/хардкоды/ratio, stale cache, мёртвые ячейки, #REF!/zombie от удалённых Internal-листов.

### A.3 Структура листов
Карта Public vs Internal. Пустые листы, заглушки, данные за визуальной областью (возможная утечка).

### A.4 Стили и форматирование
Числовые форматы, conditional formatting (конфликты), print areas, page breaks.

### A.5 Version Control & Git-гигиена (С3)
.bak* инвентаризация, git status/log для Public, uncommitted changes, history patterns, .gitignore. **Рекомендации** по очистке бэкапов и правильному версионированию.

### A.6 Локализация EN→RU (С19)
Непереведённые, дубли, формат, терминология.

### A.7 Leakage технический (С12)
Hidden sheets/rows/columns, defined names, comments, docProps, custom properties.

🔴 **ТОЧКА ПАУЗЫ после Блока A** → WIP xlsx + progress.json → подтверждение

---

## БЛОК B: Математика и логика финмодели (углубление)

### B.1 Revenue Model
Shares (38/28/15/12/7)=100%, waterfall без double-counting, CAGR consistency, тайминг фильмов vs recognition.

### B.2 Cost Model
FOT ×1.08 (фикс v1.0.2), OPEX %=100% (фикс v1.0.2), Content Pipeline Σ=1850 (фикс v1.0.2), Two-tier GM 55.8/47/53.8, CAPEX 5/45/35/15.

### B.3 P&L → CF → BS (С4)
Revenue→P&L→CF→BS сквозная. NI+D+ΔWC=OpCF. BS balance (0), Cash(BS)=EndingCash(CF) (0, фикс v1.0.2). Control=0. BS floor fix identity.

### B.4 Debt и Interest
ВКЛ 500/16%/лаг1кв. Interest(P&L)=Interest(CF). Debt(BS)=Schedule. Пики Q3'26/Q2'27.

### B.5 Covenant Compliance (С7) ⚠️ НОВЫЙ
- **Debt/EBITDA** (cap ≤ 4x) в пиковые кварталы
- **ICR** Interest Coverage Ratio (≥ 2.5x)
- **DSCR** Debt Service Coverage Ratio (≥ 1.25x)
- ВКЛ: соответствие лимиту 500, cooling-off periods
- Breach probability в каждый период
- Рекомендации по renegotiation / equity injection если breach

### B.6 Waterfall W₃ и IRR (С5)
1× LiqPref + 8% coupon + 60/40, Σ=available, IRR 20.09% independent, MOIC independent.

### B.7 Investor Rights в Waterfall (С15) ⚠️ НОВЫЙ
- LiqPref 1× — обоснование (стандартный market term)
- Coupon 8% — vs benchmark (Series A/B RU)
- Participation / non-participating / cap
- Downside protection: что получает инвестор в Worst-case
- Pay-off matrix Best/Base/Worst для founder vs investor
- Break-even инвестиции (минимальная exit value для полного возврата)

### B.8 Cap Table и Dilution (С14) ⚠️ НОВЫЙ
- Структура АК: founders / seed / Series A / ESOP
- Pre-money / post-money valuation
- Anti-dilution provisions (broad-based vs full ratchet)
- Pro-rata rights инвесторов
- Dilution scenarios:
  - Next funding round (Series B)
  - Down round scenario
  - Option pool expansion
- Σ долей = 100% в каждом раунде

### B.9 Valuation (DCF + Comps)
DCF WACC 19%, TV methodology + growth, Comps мультипликаторы, Dual-year EV FY27+FY28→midpoint.

### B.10 Monte Carlo (С9)
Сходимость (n=100..2000), PSD, VaR95/99, MC IRR 11.44%, breach probability.

### B.11 Sensitivity
Matrix 27 (3×3×3), Tornado top-5, stress vs identity.

### B.12 Tax + WC (С10)
ННП 20%, Tax chain. WC days realistic. NDP preservation 232.6→323.9.

### B.13 Unit Economics по проектам (С8) ⚠️ НОВЫЙ
Для каждого из 7 проектов (если раскрыто в Public):
- Budget (млн ₽)
- Expected Revenue (windows: theatrical, VOD, TV, international)
- Expected EBITDA
- ROI = (Revenue − Budget) / Budget
- Payback period (кварталы)
- Вклад в консолидированную EBITDA (%)
Ранжирование от best to worst. Выявление «токсичных» проектов.

### B.14 Accounting Identity (С6) ⚠️ НОВЫЙ
- **Стандарт учёта:** GAAP / IFRS / RAS — какой применён
- Консистентность применения во всех листах
- **Revenue recognition:** completed contract vs percentage-of-completion (критично для кино)
- **Content capitalization:** capitalized vs expensed production costs — amortization schedule
- **Lease accounting:** operating vs financial lease (IFRS 16 vs US GAAP ASC 842)
- Конвертируемость отчётности для западного инвестора (если применимо)
- **Deferred tax:** моделируется ли?

🔴 **ТОЧКА ПАУЗЫ после Блока B**

---

## БЛОК C: Сверка Public ↔ Internal (С11)

### C.1 Якорные метрики (1:1)
| Метрика | Public | Internal | Допуск |
|---|---|---|---|
| Revenue 3Y | 4 545 | 4 545 | 0% |
| EBITDA 3Y GAAP | 2 076.1 | 2 076.1 | ≤ 0.1% |
| NDP | 3 000 | 3 000 | 0% |
| Budget (7 проектов) | 1 850 | 1 850 | 0% |
| Two-tier GM | 55.8/47 | 55.8/47 | 0% |
| ВКЛ Σ3Y | 28.18 | 28.18 | ≤ 0.1% |

### C.2 By Design расхождения
| Метрика | Public | Internal | Обоснование |
|---|---|---|---|
| IRR | 20.09% (W₃) | 24.75% (W₅ V-D) | Разные waterfall |
| MC IRR mean | 11.44% | 13.95% | Разные сценарии |
| Waterfall структура | W₃ | W₅ V-D | Public — упрощённая |

### C.3 Структурная согласованность
Проекты, тайминги, горизонты Q1'26–Q4'28 + 2029–2032, макро.

### C.4 Полнота скрытия чувствительного
- Детальный ФОТ по должностям → агрегирован
- Индивидуальные P&L по проектам → агрегированы/скрыты
- Внутренние MC допущения → упрощены
- Комментарии/notes внутренние → удалены
- Все ~150 различий Internal vs Public задокументированы в assumptions log

### C.5 Leakage (С12)
Full leakage audit — см. Блок A.7.

🔴 **ТОЧКА ПАУЗЫ после Блока C**

---

## БЛОК D: Investor Readiness

### D.1 Financial Integrity
BS balance, Cash chain, Control, Waterfall Σ.

### D.2 Model Transparency
Ключевые допущения видимы, формулы не захардкожены (кроме inputs), input/output разделены, версия указана.

### D.3 Assumptions Defensibility (+ Peer Benchmarking С16) ⚠️ УСИЛЕНО
- Revenue shares (38/28/15/12/7) — benchmark кино РФ
- **GM 55.8/47** — сравнение с peers:
  - RU: Яндекс (медиа), VK, Окко, IVI, START
  - Global: Netflix, Disney, Warner, Lionsgate
- FOT 8% индексация — макро (Росстат CPI)
- **WACC 19%** — CAPM decomposition: Rf (ОФЗ) + Beta × ERP + Country Risk + Small Cap Premium
- Terminal growth — реалистичность vs долгосрочный прогноз ВВП РФ
- Тайминг releases — vs исторический рейтинг побочных касс

### D.4 Stress-тесты инвестора (С13) ⚠️ НОВЫЙ
Прогон 6 шок-сценариев:
| Сценарий | Шок | Expected ΔIRR | BS consistency | Covenant breach |
|---|---|---|---|---|
| Рецессия | Revenue −20% | ? | ? | ? |
| Инфляция | FOT +15% | ? | ? | ? |
| Рост ставок | WACC +3 пп | ? | ? | ? |
| Регуляторный | NDP отменён | ? | ? | ? |
| Коробка | Провал 1-го фильма | ? | ? | ? |
| FX | Девальвация −30% | ? | ? | ? |
Для каждого — вердикт Pass/Warn/Fail.

### D.5 Sensitivity to Key Inputs
Matrix 27, Tornado top-5, stress presentable.

### D.6 ESG + Country Risk (С17) ⚠️ НОВЫЙ
- **ESG:** transparency, governance structure, environmental footprint кинопроизводства, social (workforce diversity)
- **Страновые риски:** санкции (вторичные, особенно для международного dist), FX volatility, регуляторный режим (Минкультуры, Фонд кино, ФНС), политическая стабильность
- **Russia risk premium** в WACC — эксплицитно?
- Sanctions exposure: suppliers, distribution, financing

### D.7 Red Flags для инвестора
- ФОТ/Revenue 106% в 2032 — **critical**
- DCF vs P&L tail mismatch — требует объяснения
- #REF!/zombie — дисквалификатор
- Leakage Internal-данных — репутация
- Covenant breach в пиковых кварталах — ликвидность
- Отсутствие peer benchmarks — defensibility
- ESG/sanctions не проанализированы — западный инвестор

### D.8 Вероятные вопросы инвестора (готовые ответы)
- «Почему IRR 20% vs 24.75% Internal?» → W₃ vs W₅ V-D (упрощённый публичный waterfall)
- «Что в хвосте 2029–2032 с ФОТ?» → FOT cap + Revenue floor + 2 сценария (требует фикса)
- «Откуда GM 55.8/47?» → Peer benchmark + структура окон
- «Почему MC IRR 11.44% vs модельный 20%?» → волатильность + correlations
- «Какой covenant headroom?» → Debt/EBITDA в пиках Q3'26/Q2'27
- «Что с санкциями?» → Country risk premium в WACC 19%
- «Dilution при Series B?» → Cap table scenarios

🔴 **ТОЧКА ПАУЗЫ после Блока D**

---

## БЛОК E: Going Concern 2029–2032 (С18) ⚠️ ПРИОРИТЕТ

Отдельный блок по критичной зоне.

### E.1 Диагностика аномалий
- ФОТ/Revenue 106% в 2032 → физически невозможно
- DCF Rev 1500/1600 vs P&L Rev 380/300/220/150 → 10× разрыв

### E.2 Рекомендации (комбинация Б + В)

**E.2.1 FOT cap (формульный фикс):**
Если Revenue_t / Revenue_peak < 85% → FOT_t = min(FOT_t-1 × 1.08, Revenue_t × 70%). Т.е. ФОТ замораживается и не может превышать 70% от выручки.

**E.2.2 Revenue floor (run-off):**
В сценарии run-off Revenue_t ≥ 15–20% от Revenue_peak (лицензии старых фильмов, VOD, перепродажа прав). Обоснование: библиотека контента продолжает приносить доход даже без новых релизов.

**E.2.3 DCF ↔ P&L reconciliation note:**
Явное объяснение: DCF с допущением «pipeline renewal» (новые фильмы с 2029), P&L в «run-off» без renewal. Без note — расхождение = баг.

**E.2.4 Два явных сценария:**
- **Сценарий 1: Run-off** — без новых проектов с 2029, Revenue → 15–20% от пика, FOT cap активен, EBITDA → ноль к 2032
- **Сценарий 2: Pipeline renewal** — новые фильмы с 2029 (budget ~XXX млн), Revenue стабилизируется на уровне 2028 ±10%, FOT продолжает рост

Оба сценария должны быть явно представлены, с указанием который используется в DCF terminal value.

### E.3 Проверка в текущей модели
- Реализован ли FOT cap механизм? (С18)
- Есть ли Revenue floor? (С18)
- Присутствует ли reconciliation note?
- Есть ли 2 сценария?

### E.4 EBITDA в хвосте
Не должна уходить в отрицательную зону без явного обоснования (sign-off от CFO, например).

🔴 **ТОЧКА ПАУЗЫ после Блока E**

---

## БЛОК F: Cover docs & Documentation (С20)

### F.1 Cover Letter sync Internal↔Public
- Даты (релиз, версия) — идентичны
- Версии (v1.0.2) — совпадают
- Ключевые цифры: IRR, Revenue, EBITDA, Budget — соответствуют Public модели
- Разделение: что раскрывается в Public vs Internal — осознанно

### F.2 Методологическая записка
- WACC decomposition обоснован
- Revenue shares обоснованы
- GM benchmark peers указаны
- MC параметры объяснены
- Waterfall W₃ структура описана

### F.3 README
- Версия модели
- История изменений (changelog)
- Инструкция по использованию
- Актуальность

### F.4 Assumptions log (Internal vs Public diff)
- Все ~150 различий задокументированы
- Формат: «что изменено / почему / on whose authority»
- Чувствительные данные — обоснование скрытия

### F.5 Requirements / dependencies
- requirements.txt: верхние границы версий openpyxl, pandas, numpy
- Воспроизводимость на чистой машине

🔴 **ТОЧКА ПАУЗЫ после Блока F**

---

## Верификация результатов аудита — П5 «Максимум» (32 механизма)

После завершения всех 6 блоков — полная проверка по П5:

**Фактологические (№1, 2, 6, 7):** точный перенос чисел/дат/имён, проверка выполнения запроса, хронология, противоречия.

**Числовые (№3, 4, 20, 23):** сверка сумм, границы, двойной расчёт, метаморфическое тестирование.

**Документные (№5, 8, 9, 21, 22, 24, 25, 26, 29, 32):** формат документа/слайдов, согласованность pptx/html, diff было/стало, защита от регрессии, дрейф смысла, ссылочная целостность.

**Логические (№10–17, 30):** скрытые допущения, парадоксы, обратная логика, декомпозиция, уверенность, полнота, спор «за/против», граф причин-следствий, стресс-тест.

**Источники (№18, 19, 28):** триангуляция источников (минимум 2), цепочка происхождения, эпистемический статус.

**Аудитория (№27, 31):** моделирование восприятия инвестором, проверка адресата (язык, глубина).

По завершении — блок «Результаты верификации П5»: что проверено, что найдено, уровень уверенности по каждому блоку.

---

## Формат выхода

### Основной: `audit_public_v1_findings.xlsx` (9 листов)

**1. Findings** — все находки
| ID | Блок | Подблок | Severity | Статус | Находка | Доказательство | Ожидание | Факт | Δ% | Уверенность | Рекомендация | Приоритет | Скрипт |

**2. Summary** — Блок×Severity матрица, вердикт, Top-10 рисков, статистика.

**3. Roadmap** — Quick wins (< 1 ч) / Structural (1–4 ч) / Architectural (> 4 ч). Платформа для каждого фикса (Code/Cowork).

**4. Improvements** — рекомендации best practices.

**5. DD Readiness** — | Категория | Статус | Red Flags | Вопросы инвестора | Подготовка |. Категории: Financial Integrity, Transparency, Audit Trail, Documentation, Defensibility, Sensitivity, Public-Safe, ESG, Cap Table.

**6. By Design** — осознанные компромиссы vs баги.

**7. Stress-tests** — результаты 6 сценариев (Блок D.4, С13).

**8. Peer Benchmarks** — сравнительная таблица с Яндекс/VK/Окко/IVI/START/Netflix/Disney/Warner/Lionsgate.

**9. Script Results** — сводка 18 скриптов: время, PASS/FAIL/WARNING, ошибки и fallback.

### Дополнительно: `audit_public_v1_executive_summary.docx` (3–5 стр.)

Формат — по дефолту пользователя (A4, TNR 14pt, H1 22pt #0070C0, поля 3/1.5/2/2 см).

Структура:
1. **Вердикт** (1 стр): FULL PASS / CONDITIONAL PASS / FAIL + светофор по 6 блокам
2. **Топ-5 критичных находок** (1 стр)
3. **Going Concern** (0.5 стр) — отдельно
4. **DD Readiness матрица** (0.5 стр)
5. **Roadmap до FULL PASS** (1 стр)
6. **Результаты верификации П5** (0.5 стр)

---

## Правила выполнения

1. **Шаг 0 первым:** карта Public до проверок
2. **Приоритетные подозрения:** 4 зоны риска (утечка, рассогласование, XML-патчи, Going Concern) ДО системного аудита
3. **Этапный режим с субагентами:** блок → ПАУЗА → подтверждение. Внутри блока — субагенты параллельно.
4. **Скрипты сначала:** автоматика до ручного анализа. Субагенты-верификаторы для параллельной проверки.
5. **Auto retry:** 2 попытки, потом ручной fallback
6. **Read-only:** ничего не модифицировать
7. **Каждая находка с доказательством:** лист, ячейка, числа, источник
8. **Internal — эталон** для якорных; by design — в «By Design»
9. **Триангуляция:** benchmarks минимум 2 независимых источника
10. **Числа/даты/имена — точный перенос** (механизм №1 П5)
11. **Скрипты → `audit_scripts/`** (все 18)
12. **Прогресс → WIP xlsx + progress.json** при каждой паузе
13. **Критические баги — немедленно**
14. **Docx по дефолту пользователя:** A4, TNR 14pt, H1 22pt #0070C0

---

## Критерии приёмки (Definition of Done)

- [ ] 4 приоритетных подозрения проверены
- [ ] Все 6 блоков (A/B/C/D/E/F) пройдены с ПАУЗАМИ
- [ ] Все 18 скриптов запущены (С1–С20)
- [ ] 6 stress-тестов выполнены (С13)
- [ ] Peer benchmarking 5 RU + 4 global (С16)
- [ ] Cap table + dilution scenarios (С14)
- [ ] Investor rights waterfall pay-off (С15)
- [ ] Covenant compliance в пиках Q3'26/Q2'27 (С7)
- [ ] Unit economics 7 проектов (С8)
- [ ] Accounting identity стандарт определён (С6)
- [ ] ESG + country risk проанализированы (С17)
- [ ] Going Concern: FOT cap + Revenue floor + reconciliation + 2 сценария (С18)
- [ ] Cover docs sync + assumptions log (С20)
- [ ] Version control + Git-гигиена (С3)
- [ ] IRR W₃ 20.09% пересчитан независимо
- [ ] BS balance во всех 16 периодах (толеранс 0)
- [ ] Cash chain CF→BS (толеранс 0)
- [ ] Public vs Internal якоря 1:1
- [ ] Leakage-проверка пройдена
- [ ] П5 «Максимум» (32 механизма) выполнена
- [ ] `audit_public_v1_findings.xlsx` (9 листов)
- [ ] `audit_public_v1_executive_summary.docx` (3–5 стр.)
- [ ] Top-10 рисков приоритизированы
- [ ] Вердикт: PASS / CONDITIONAL / FAIL с обоснованием
- [ ] Путь до FULL PASS с effort-оценкой

---

## Ожидаемый результат

xlsx-реестр (9 листов) + docx Executive Summary (3–5 стр) + `audit_scripts/` (18 скриптов). Уровень — DD-grade, готово к передаче инвестору после применения P1/P2 фиксов.
