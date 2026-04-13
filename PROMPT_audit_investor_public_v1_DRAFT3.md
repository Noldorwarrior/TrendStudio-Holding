# ПРОМТ: Полный DD-grade аудит Investor Model v1.0 Public
**Версия промта:** v3.0 DRAFT
**Платформа запуска:** Claude Code (с субагентами-верификаторами, параллельной проверкой блоков A/B/C/D/E/F, автоматизированными Python-скриптами)
**Scope:** `investor_model_v1.0_Public.xlsx` (основной) + `investor_model_v1.0_Internal.xlsx` (эталон для leakage/якорей) + сопроводительные документы (Cover Letter, методологическая записка, README, assumptions log, pitch deck, teaser, term sheet draft)
**Приоритет блоков:** A = B = C = D = E = F (все равнозначны)
**Толеранс:** стандартный (дельта > 0.1% = находка; для BS/Cash/Control = строго 0)
**Бюджет:** без ограничений — глубина > скорости
**Цель:** комбинированная — (1) подготовка к передаче инвестору, (2) внутренний QA, (3) регуляторная проверка (Фонд кино, NDP, гос. компенсации)
**Верификация результатов:** Полная П5 «Максимум» (все 32 механизма)
**Ошибки скриптов:** auto retry (2 попытки) + fallback на ручной анализ
**Выход:**
1. `audit_public_v1_findings.xlsx` (9 листов)
2. `audit_public_v1_executive_summary.docx` (3–5 стр.)
3. `audit_public_v1_RED_FLAG_MEMO.docx` (1-страничник критичных находок)
4. `audit_public_v1_REMEDIATION_ROADMAP.xlsx` (детальный план фиксов)

---

## Роль и мандат

Ты — независимый финансовый аудитор **DD-grade** (уровень bulge bracket, 15+ лет опыта due diligence медиахолдингов РФ). Одновременно — Python-инженер пайплайна финмодели: OOXML zip-surgery, numpy_financial, scipy, openpyxl strict mode.

Проведи **полный аудит** публичной финансовой модели холдинга «ТрендСтудио» (`investor_model_v1.0_Public.xlsx`) по **шести блокам**:

- **A** — техническое состояние xlsx (OOXML, формулы, структура, локализация, version control, Git-гигиена)
- **B** — математика и логика финмодели (Revenue, Cost, P&L→CF→BS, Debt/Covenants, Waterfall+Investor Rights, Cap Table, DCF, MC, Tax, WC, Unit Economics, Accounting Identity, **Logic Tests 4-типа**)
- **C** — сверка Public ↔ Internal (якорные метрики 1:1; by design расхождения; leakage Internal-данных)
- **D** — Investor Readiness (стресс-тесты, peer benchmarking multiples+cohort+regulatory, ESG/страновые риски, defensibility)
- **E** — Going Concern 2029–2032 (FOT cap + Revenue floor + DCF reconciliation + 2 сценария: run-off и pipeline renewal)
- **F** — Cover docs & Documentation DD (Cover Letter, методологическая, README, assumptions log, **полный DD презентационных доков**)

Аудит — **read-only**. Критические баги — сообщать немедленно.

---

## ⚠️ Приоритетные подозрения (проверить ПЕРВЫМИ — до системного аудита)

1. **Утечка Internal-данных в Public.** Public должна быть «облегчённой». Проверить: скрытые листы/строки/колонки; формулы #REF!/zombie от удалённых Internal-листов; docProps метаинформация; defined names на удалённые диапазоны; custom properties.

2. **Рассогласование Public vs Internal в публичных метриках.** IRR 20.09% vs 24.75% — **by design**. Но **Revenue 3Y=4 545, EBITDA 3Y GAAP=2 076.1, NDP=3 000, Budget=1 850, Two-tier GM 55.8/47, ВКЛ Σ3Y=28.18** — должны совпадать 1:1.

3. **Кумулятивный эффект XML-патчей v1.0 → v1.0.1 → v1.0.2.** Остатки: битые rels, orphan calcChain, namespace inconsistencies, смешение sharedStrings/inlineStr, stale cached values, орфан-ссылки.

4. **Going Concern abnormalities 2029–2032.** ФОТ/Revenue ≈106% в 2032; DCF Rev 1500/1600 vs P&L Rev 380→150 — 10× разрыв. Требует: FOT cap + Revenue floor + DCF reconciliation note + 2 сценария.

---

## Контекст проекта

### Investor Package v1.0 (scope аудита)
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **Основной файл:** `investor_model_v1.0_Public.xlsx`
- **Файл для сверки (эталон):** `investor_model_v1.0_Internal.xlsx`
- **Сопроводительные:** Cover Letter (Internal + Public), методологическая записка, README, assumptions log, pitch deck, teaser, term sheet draft (если есть)
- **Якорные метрики Public:**
  - IRR W₃ = 20.09% | MC IRR mean = 11.44%
  - Revenue 3Y = 4 545 млн ₽
  - EBITDA 3Y GAAP = 2 076.1 млн ₽ | NDP = 3 000 млн ₽
  - Budget = 1 850 млн ₽ (7 проектов: 5 фильмов + 2 сериала)
  - Two-tier GM: Films 55.8%, Series 47%, blended ~53.8%
  - ВКЛ: лимит 500, 16%, лаг 1 кв, Σ3Y interest = 28.18 млн
- **Waterfall Public:** W₃ (1× LiqPref + 8% coupon + 60/40 split)
- **История патчей:** v1.0 → v1.0.1 (RELEASED) → v1.0.2 (EN→RU + formula fixes)

### Pipeline context
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/pipeline/` (L4, 348 тестов, verify_full.py П5)

### Утилиты
- `rakhman_docs.py`: `/Users/noldorwarrior/Downloads/rakhman_docs.py`
- `build_A5_cf_bs.py`: CF/BS генератор с W₃

---

## Методология

### Шаг 0: Карта Public-файла
1. Mapping листов (имя, диапазон, visibility, тип)
2. Сравнение Public vs Internal → удалено/скрыто/агрегировано
3. Граф зависимостей формул
4. `audit_public_v1_map.json`

### Принципы (Claude Code)
1. **Этапный режим с ТОЧКАМИ ПАУЗЫ:** блок → WIP xlsx → подтверждение → следующий
2. **Субагенты-верификаторы (Task tool, параллельно):** A, B, C, D, E, F
3. **Скриптовая верификация:** Python-скрипт + stdout/stderr в `audit_scripts/`
4. **Auto retry + fallback:** 2 попытки, потом ручной
5. **Двойной расчёт:** IRR, EBITDA, NDP, BS, Cash, Cap Table, Covenants, MC — независимо
6. **Не доверять кэшам**
7. **Internal = эталон** для якорей; by design — в «By Design»
8. **Толеранс:** >0.1% = находка; BS/Cash/Control = 0
9. **Триангуляция:** benchmarks — 2+ независимых источника (Росстат, ФинКоРусс, TASS, Кинопоиск Pro, Яндекс IR, SEC 10-K, годовые отчёты peers)

### Сохранение прогресса
- `audit_public_v1_findings_WIP.xlsx`
- `audit_public_v1_progress.json`
- `audit_scripts/`

---

## Автоматические скрипты (22 шт.) — обязательные

### БЛОК A: xlsx-техника
**С1: `ooxml_integrity_public.py`** — rels, calcChain orphan, namespace, смешение sharedStrings/inlineStr, битые ссылки.

**С2: `formula_audit_public.py`** — формула → пересчёт → сравнение с cached. Stale cache, #REF!/#NAME?/zombie.

**С3: `version_git_hygiene.py`** — .bak* инвентаризация, git status/log, history patterns, .gitignore.

### БЛОК B: финмодель
**С4: `bs_balance_check_public.py`** — 16 периодов, Assets=L+E (0), Cash(BS)=EndingCash(CF) (0), Control=0.

**С5: `irr_moic_recompute_public.py`** — IRR W₃ (numpy_financial/scipy), MOIC, сверка с 20.09%.

**С6: `accounting_identity_check.py`** — GAAP/IFRS/RAS, консистентность, Revenue recognition, lease accounting, content capitalization.

**С7: `covenant_compliance_public.py`** — Debt/EBITDA (≤4x), ICR (≥2.5x), DSCR (≥1.25x) в Q3'26/Q2'27. ВКЛ лимит 500, cooling-off.

**С8: `unit_economics_per_project.py`** — для 7 проектов: Budget → Revenue → EBITDA → ROI → Payback → вклад в EBITDA. Ранжирование.

**С9: `mc_convergence_public.py`** — сходимость n=100..2000, PSD, VaR.

**С9-deep: `mc_independent_reproduction.py`** ⚠️ УСИЛЕНО — независимая репродукция MC на Python:
- 10 000+ Монте-Карло прогонов независимо от модели
- Проверка seeds (детерминизм одного и того же scenarios)
- Воспроизведение распределений IRR, EBITDA, NDP
- Сверка: mean, median, σ, p5, p25, p75, p95, p99, VaR95/99, CVaR
- Проверка корреляционной матрицы (копула, Cholesky)
- Стресс-тесты MC: что при экстремальных корреляциях ±0.99
- Дивергенция распределений: KS-test, Anderson-Darling, Q-Q plot

**С10: `tax_wc_chain_public.py`** — ННП 20%, Tax→P&L→CF, WC days, NDP preservation.

**С11-logic: `logic_chain_causality.py`** ⚠️ НОВЫЙ (тест 1) — причинно-следственные цепочки:
- Revenue → EBITDA → FCF → NDP → IRR: трассировка каждого драйвера
- Изменить Revenue share проекта №1 на +10% → ожидаемое изменение Revenue_Y1, EBITDA, IRR, NDP
- Изменить GM Films на +5 пп → сверка изменения EBITDA, marginal IRR contribution
- Изменить WACC на +1 пп → сверка изменения NPV, DCF valuation
- Изменить FOT rate на +2 пп → сверка P&L chain, covenants
- Для каждой цепочки — ручной ожидаемый эффект vs модельный

**С11-bound: `logic_chain_boundary.py`** ⚠️ НОВЫЙ (тест 2) — граничные сценарии:
- Revenue = 0 в Q1'26 → что с P&L, CF, BS, IRR
- Budget ×10 (максимум) → не должно быть overflow
- Отрицательный FCF 3 квартала подряд → ВКЛ должен активироваться
- Нулевой NWC → проверка Cash flow
- Отрицательный EBITDA → tax shield корректен?
- WACC = 0% / 50% → DCF стабилен
- Growth = 0% / -5% terminal → valuation consistency
- 7/7 проектов провалились → ФИКСАЦИЯ как expected behavior

**С11-meta: `logic_chain_metamorphic.py`** ⚠️ НОВЫЙ (тест 3) — метаморфические тесты:
- Удвоение всех Revenue → удвоение EBITDA (± OPEX эффект), удвоение NPV
- Удвоение Budget при Revenue неизменном → удвоение CAPEX, изменение IRR
- Масштабирование X2, X5, X10 всех inputs → проверка линейности/нелинейности
- Инвариант: сумма Revenue по проектам = consolidated Revenue (100% covered)
- Инвариант: EBITDA GAAP − EBITDA NDP = NDP (идентичность)
- Инвариант: BS Assets − Liabilities = Equity (всегда)
- Инвариант: Cash(end) − Cash(start) = ΔCash в CF (всегда)

**С11-manual: `logic_chain_manual_verify.py`** ⚠️ НОВЫЙ (тест 4) — ручная сверка 3–5 ячеек:
- **Ячейка 1:** IRR W₃ — пересчёт из cash flows инвестора по шагам
- **Ячейка 2:** EBITDA GAAP 3Y = Σ(Revenue_i − COGS_i − OPEX_i) для всех проектов — ручной расчёт
- **Ячейка 3:** NPV из DCF WACC 19% — дисконтирование вручную по годам
- **Ячейка 4:** ВКЛ Σ3Y interest = 28.18 — расчёт по каждому кварталу с лагом
- **Ячейка 5:** Debt/EBITDA пик в Q3'26 — из BS и annualized EBITDA
- Формат: исходные данные, формула, шаги расчёта, итог, сравнение с моделью, δ%

### БЛОК C: Public↔Internal
**С12: `public_vs_internal_reconcile.py`** — якорные метрики 1:1.

**С13: `public_leakage_check.py`** ⚠️ КРИТИЧНЫЙ — hidden, #REF!, docProps, defined names.

### БЛОК D: Investor Readiness
**С14: `stress_tests_investor.py`** — 6 шок-сценариев:
- Revenue −20% | FOT +15% | WACC +3 пп | NDP отменён | Провал 1-го фильма | Девальвация −30%
Для каждого: ΔIRR, ΔEBITDA, BS consistency, covenant breach probability.

**С15: `cap_table_dilution.py`** — founders/investors/ESOP, pre/post-money, anti-dilution, pro-rata, dilution scenarios.

**С16: `investor_rights_waterfall.py`** ⚠️ РАСШИРЕНО — W₃ детально + инвесторские angles:
- LiqPref 1×, coupon 8%, participation/cap, downside protection
- **Anti-dilution** provisions: broad-based vs full ratchet, weighted-average
- **Ratchet-механика** в W₃: срабатывает ли при down round, на каком уровне
- **Tag-along** (право инвестора продать пропорционально founder-exit) — моделируется ли
- **Drag-along** (право majority потянуть minority в M&A) — условия срабатывания
- **Dividend policy:** cumulative/non-cumulative preferred div, payout ratio, accrual
- **Cash waterfall при дивидендах vs при exit:** различия приоритетов
- **Pay-off matrix Best/Base/Worst** для founder vs investor
- **Break-even exit value** для полного возврата инвестиций

**С17: `exit_scenarios_npv.py`** ⚠️ НОВЫЙ — exit scenarios с NPV:
- **IPO** (Russian exchange / cross-listing, оценка по peer multiples): NPV инвестора
- **M&A** (strategic sale: ВК, Яндекс, Газпром-Медиа): premium 20–40%, NPV
- **MBO** (management buyout, по net asset value + premium): NPV
- **Secondary** (продажа стейка другому фин. инвестору): NPV
- **Run-off** (постепенная ликвидация с возвратом через dividend stream): NPV
- Для каждого: probability × NPV = Expected NPV, ранжирование, IRR инвестора в каждом

**С18: `peer_benchmarking_multiples.py`** ⚠️ РАСШИРЕНО — рыночные мультипликаторы:
- **EV/EBITDA:** ТрендСтудио implied vs peers (RU: Яндекс-медиа, VK, Окко, IVI, START; Global: Netflix, Disney, Warner, Lionsgate)
- **EV/Sales:** Revenue multiple valuation cross-check
- **EV/Revenue 3Y**
- **P/E (forward и trailing):** приведение к рыночной капитализации
- **PEG:** P/E к growth rate — fairness
- **Источники:** годовые отчёты peers, Bloomberg (если доступно), MOEX/SPB listing data, Yahoo Finance, годовая отчётность по МСФО
- Выводы: **implied value range** для ТрендСтудио из мультипликаторов

**С19: `peer_cohort_roi.py`** ⚠️ НОВЫЙ — когортный анализ ROI контента:
- **Бюджет фильма vs кассовые сборы** в РФ (2020–2025): Кинопоиск Pro, ЕАИС (gosfilm.ru)
- Когорты: мегабюджет (>500 млн), средний (100–500), микро (<100)
- ROI, окупаемость, распределение успех/неудача (hit rate)
- Сравнение 7 проектов ТрендСтудио vs соответствующие когорты
- **Realistic vs assumed:** насколько prognosis ТрендСтудио реалистичен vs база
- Distribution windows: theatrical, VOD, TV, international — benchmark вклады

**С20: `peer_regulatory_risks.py`** ⚠️ НОВЫЙ — регуляторные риски отрасли:
- **Фонд кино:** условия возвратных/безвозвратных денег, история отказов/требований возврата
- **Министерство культуры РФ:** прокатные удостоверения (частота отказов, сроки)
- **Минцифры / Роскомнадзор:** возрастные рейтинги, VOD регулирование
- **ФНС:** специальные налоговые режимы (ННП льготы для IT, медиа), риск отмены
- **Антипиратский закон:** эффективность для доходов
- **Санкционный режим:** ограничения на западное оборудование, post-production за рубежом, international distribution
- **Льготы на экспорт:** Roskino, международные фонды
- Для каждого риска: вероятность × impact = expected loss, mitigation

**С21: `esg_country_risk.py`** — ESG + Russia risk premium в WACC, sanctions exposure.

### БЛОК E: Going Concern
**С22: `going_concern_tail_public.py`** ⚠️ ПРИОРИТЕТ:
- ФОТ/Revenue ≤100% проверка
- **FOT cap:** Revenue_t / Revenue_peak < 85% → FOT_t = min(FOT_t-1 × 1.08, Revenue_t × 70%)
- **Revenue floor:** ≥15–20% от пика в run-off
- **DCF vs P&L reconciliation note**
- **Два сценария:** run-off + pipeline renewal

### Отдельно (не скрипт):
**С23: `localization_check_public.py`** — непереведённые EN, дубли, формат, терминология.

### БЛОК F: Cover docs полный DD
**С24: `cover_docs_full_dd.py`** ⚠️ РАСШИРЕНО:
- Cover Letter sync (даты, версии, цифры)
- Методологическая: WACC decomposition, Revenue shares, GM benchmark, MC params
- README актуальность
- Assumptions log (все ~150 различий Internal vs Public)
- **Pitch deck DD:**
  - Структура изложения (problem → solution → traction → market → team → ask)
  - Narrative логика: поток мысли, связность, caption-graph consistency
  - Психология восприятия инвестором: первые 3 слайда (hook), последний (CTA)
  - Цифры на слайдах vs xlsx (каждое число verify)
  - Forward-looking statements: корректность формулировок, hedging
  - Визуальный язык: графики без искажений, нейтральная подача
- **Term sheet draft DD** (если есть):
  - Соответствие заявленным условиям waterfall W₃
  - LiqPref, coupon, anti-dilution, pro-rata, tag/drag прописаны
  - Вестинг founders, ESOP resize
  - Information rights, board composition
  - Юр.формулировки: standard market terms vs custom/aggressive
- **Disclaimers & legal:**
  - Forward-looking statement disclaimer
  - Confidentiality notice
  - No-reliance / investor acknowledgement
  - Jurisdiction (РФ vs офшор)
- **Teaser (executive-1-pager) DD:**
  - Hook, ключевые метрики, ask, contact
  - Достаточность без раскрытия чувствительного

---

## БЛОК A: Техническое состояние xlsx (Public)
A.1 OOXML-целостность (С1) | A.2 Формулы vs кэши (С2) | A.3 Структура листов | A.4 Стили | A.5 Version Control & Git (С3) | A.6 Локализация EN→RU (С23) | A.7 Leakage техн. (С13)

🔴 **ПАУЗА после Блока A**

---

## БЛОК B: Математика и логика (углубление)

### B.1 Revenue Model
Shares (38/28/15/12/7)=100%, без double-counting, CAGR, тайминг.

### B.2 Cost Model
FOT ×1.08, OPEX %=100%, Content Pipeline Σ=1850, Two-tier GM 55.8/47, CAPEX 5/45/35/15.

### B.3 P&L→CF→BS (С4)
Сквозная. NI+D+ΔWC=OpCF. BS balance (0), Cash(BS)=EndingCash(CF) (0). Control=0.

### B.4 Debt и Interest
ВКЛ 500/16%/лаг1кв. Interest(P&L)=Interest(CF). Debt(BS)=Schedule.

### B.5 Covenant Compliance (С7)
Debt/EBITDA ≤4x, ICR ≥2.5x, DSCR ≥1.25x в пиках. Breach probability + recs.

### B.6 Waterfall W₃ и IRR (С5)
1× LiqPref + 8% coupon + 60/40. IRR 20.09% independent.

### B.7 Investor Rights в Waterfall (С16) ⚠️ УСИЛЕНО
- LiqPref 1× vs market benchmark
- Coupon 8% vs Series A/B RU benchmarks
- Participation / non-participating / cap
- **Anti-dilution:** broad-based weighted-average vs full ratchet — какой в W₃
- **Ratchet trigger:** при какой down round price срабатывает
- **Tag-along** при founder exit
- **Drag-along** threshold (обычно ≥50–75% инвесторов)
- **Dividend policy:** cumulative preferred 8%, payout waterfall
- **Cash waterfall в div vs exit:** приоритеты разные
- Pay-off matrix: Best/Base/Worst для founder vs investor
- Break-even exit value
- Downside protection analysis

### B.8 Cap Table и Dilution (С15)
Founders/seed/Series A/ESOP. Pre/post-money. Anti-dilution. Pro-rata. Dilution scenarios (Series B, down round, option pool). Σ=100%.

### B.9 Valuation (DCF + Comps)
DCF WACC 19%, TV, Comps (С18). Dual-year EV FY27+FY28→midpoint.

### B.10 Monte Carlo (С9, С9-deep) ⚠️ УСИЛЕНО
- Сходимость (n=100..2000), PSD, VaR95/99, MC IRR 11.44%, breach probability
- **Независимая репродукция:** 10 000+ прогонов на Python, KS/AD tests, сверка распределений

### B.11 Sensitivity
Matrix 27, Tornado top-5, stress vs identity.

### B.12 Tax + WC (С10)
ННП 20%, Tax chain, WC days, NDP 232.6→323.9.

### B.13 Unit Economics 7 проектов (С8)
Budget → Revenue → EBITDA → ROI → Payback → вклад в EBITDA %. Ранжирование.

### B.14 Accounting Identity (С6)
GAAP/IFRS/RAS. Revenue recognition (completed vs %-of-completion). Content capitalization. Lease (IFRS 16 / ASC 842). Deferred tax.

### B.15 Logic Tests (4 типа) ⚠️ НОВЫЙ — КРИТИЧЕСКИ ВАЖНО
- **B.15.1 Причинно-следственные цепочки (С11-logic):** Revenue→EBITDA→FCF→NDP→IRR трассировка
- **B.15.2 Граничные сценарии (С11-bound):** 0, экстремумы, отрицательные
- **B.15.3 Метаморфические тесты (С11-meta):** масштабирование, инварианты
- **B.15.4 Ручная сверка 3–5 ячеек (С11-manual):** IRR, EBITDA GAAP 3Y, NPV, ВКЛ Σ, Debt/EBITDA пик

🔴 **ПАУЗА после Блока B**

---

## БЛОК C: Сверка Public ↔ Internal (С12)

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
| Waterfall структура | W₃ | W₅ V-D | Public упрощённая |

### C.3 Структурная согласованность | C.4 Полнота скрытия | C.5 Leakage (С13)

🔴 **ПАУЗА после Блока C**

---

## БЛОК D: Investor Readiness

### D.1 Financial Integrity | D.2 Model Transparency

### D.3 Assumptions Defensibility + Peer Benchmarking ⚠️ ТРИ СКРИПТА (С18/С19/С20)
- **D.3.1 Market multiples (С18):** EV/EBITDA, EV/Sales, P/E, PEG → implied value range
- **D.3.2 Cohort ROI content (С19):** бюджеты vs кассы в РФ 2020–2025, hit rate, realistic vs assumed
- **D.3.3 Regulatory risks (С20):** Фонд кино, Минкульт, ФНС, санкции, льготы, експорт
- Revenue shares benchmark
- GM 55.8/47 peers
- FOT 8% vs CPI
- WACC 19% CAPM decomposition
- Terminal growth vs ВВП РФ

### D.4 Stress-тесты (С14) — 6 сценариев
| Сценарий | Шок | ΔIRR | BS | Covenant |
|---|---|---|---|---|
| Рецессия | Revenue −20% | ? | ? | ? |
| Инфляция | FOT +15% | ? | ? | ? |
| Рост ставок | WACC +3 пп | ? | ? | ? |
| Регуляторный | NDP отменён | ? | ? | ? |
| Коробка | Провал 1-го фильма | ? | ? | ? |
| FX | Девальвация −30% | ? | ? | ? |

### D.5 Sensitivity (Matrix 27, Tornado top-5)

### D.6 ESG + Country Risk (С21)
ESG: transparency, governance, environmental, social. Страновые: санкции, FX, регулятор, полит.стаб. Russia risk premium в WACC. Sanctions exposure.

### D.7 Exit Scenarios (С17) ⚠️ НОВЫЙ
Expected NPV по IPO / M&A / MBO / Secondary / Run-off с probability weighting.

### D.8 Red Flags для инвестора
ФОТ/Revenue 106%, DCF-P&L mismatch, #REF!, leakage, covenant breach, отсутствие peer benchmarks, ESG не проанализированы, anti-dilution не прописан.

### D.9 Вероятные вопросы инвестора (готовые ответы)
- IRR 20% vs 24.75% → W₃ vs W₅ V-D
- Хвост 2029–2032 → FOT cap + floor + 2 сценария
- GM 55.8/47 → peer benchmark + окна
- MC IRR 11.44% → волатильность + корреляции
- Covenant headroom → пики Q3'26/Q2'27
- Санкции → country premium
- Dilution при Series B → cap table scenarios
- **Anti-dilution при down round** → ratchet details
- **Exit через IPO/M&A** → probabilities и NPV
- **Peer multiples implied value** → EV/EBITDA range
- **Reality check 7 проектов** → cohort ROI RU 2020–25

🔴 **ПАУЗА после Блока D**

---

## БЛОК E: Going Concern 2029–2032 (С22) ⚠️ ПРИОРИТЕТ

### E.1 Диагностика | E.2 Рекомендации (комб. Б+В)

**E.2.1 FOT cap:** Revenue_t / Revenue_peak < 85% → FOT_t = min(FOT_t-1 × 1.08, Revenue_t × 70%)
**E.2.2 Revenue floor:** ≥15–20% от пика
**E.2.3 DCF ↔ P&L reconciliation note**
**E.2.4 Два сценария:** Run-off + Pipeline renewal

### E.3 Проверка в модели | E.4 EBITDA в хвосте

🔴 **ПАУЗА после Блока E**

---

## БЛОК F: Cover docs & Documentation (С24) ⚠️ ПОЛНЫЙ DD

### F.1 Cover Letter sync (даты, версии, цифры, разделение раскрытия)
### F.2 Методологическая записка (WACC, Revenue shares, GM benchmark, MC params, W₃)
### F.3 README (версия, changelog, инструкция)
### F.4 Assumptions log (~150 различий, формат «что/почему/authority»)
### F.5 Requirements / dependencies
### F.6 Pitch Deck DD ⚠️ НОВЫЙ
- Структура: problem → solution → traction → market → team → ask
- Narrative: связность, caption-graph consistency
- Психология: первые 3 слайда (hook), последний (CTA)
- Цифры на слайдах vs xlsx (каждое число)
- Forward-looking: корректность, hedging
- Визуальный язык: графики без искажений
- Длительность (оптимально 10–15 слайдов)
### F.7 Term Sheet Draft DD (если есть) ⚠️ НОВЫЙ
- Соответствие W₃ (LiqPref, coupon 8%, 60/40)
- Anti-dilution, pro-rata, tag/drag прописаны
- Vesting founders (typical 4y + 1y cliff)
- ESOP (typical 10–15%)
- Information rights, board composition
- Juridical standards vs custom/aggressive terms
### F.8 Teaser (1-pager) DD ⚠️ НОВЫЙ
- Hook, ключевые метрики, ask, contact
- Достаточность без раскрытия чувствительного
### F.9 Disclaimers & Legal ⚠️ НОВЫЙ
- Forward-looking statement disclaimer
- Confidentiality notice
- No-reliance
- Jurisdiction

🔴 **ПАУЗА после Блока F**

---

## Верификация результатов — П5 «Максимум» (32 механизма)

**Фактологические (№1,2,6,7):** точный перенос, проверка запроса, хронология, противоречия.
**Числовые (№3,4,20,23):** сверка сумм, границы, двойной расчёт, метаморфика.
**Документные (№5,8,9,21,22,24,25,26,29,32):** формат, согласованность, diff, регрессия, дрейф, ссылки.
**Логические (№10–17,30):** допущения, парадоксы, обратная логика, декомпозиция, полнота, спор, граф, стресс.
**Источники (№18,19,28):** триангуляция, происхождение, эпистемика.
**Аудитория (№27,31):** моделирование инвестора, адресат.

Блок «Результаты верификации П5» с уровнем уверенности.

---

## Формат выхода

### 1. `audit_public_v1_findings.xlsx` (9 листов)

**1. Findings** — все находки
| ID | Блок | Подблок | Severity | Статус | Находка | Доказательство | Ожидание | Факт | Δ% | Уверенность | Рекомендация | Приоритет | Скрипт |

**2. Summary** — Блок×Severity, вердикт, Top-10 рисков.
**3. Roadmap** — Quick wins / Structural / Architectural (Code/Cowork).
**4. Improvements** — best practices.
**5. DD Readiness** — Financial Integrity, Transparency, Audit Trail, Documentation, Defensibility, Sensitivity, Public-Safe, ESG, Cap Table, Investor Rights, Exit.
**6. By Design** — осознанные компромиссы vs баги.
**7. Stress-tests** — 6 сценариев.
**8. Peer Benchmarks** — Multiples + Cohort ROI + Regulatory.
**9. Script Results** — сводка 22 скриптов.

### 2. `audit_public_v1_executive_summary.docx` (3–5 стр.)
Формат — дефолт пользователя (A4, TNR 14pt, H1 22pt #0070C0, поля 3/1.5/2/2 см).
- Вердикт (1 стр): PASS/CONDITIONAL/FAIL + светофор 6 блоков
- Топ-5 критичных (1 стр)
- Going Concern (0.5 стр)
- DD Readiness матрица (0.5 стр)
- Roadmap до FULL PASS (1 стр)
- П5 (0.5 стр)

### 3. `audit_public_v1_RED_FLAG_MEMO.docx` (1 стр) ⚠️ НОВЫЙ
Только критичные находки для быстрого просмотра CFO/CEO:
- Critical Red Flags (до 10 пунктов)
- Each: 1 строка описания + severity + immediate action
- Без воды, форматирование одной таблицей
- Формат docx по дефолту пользователя

### 4. `audit_public_v1_REMEDIATION_ROADMAP.xlsx` ⚠️ НОВЫЙ
Детальный план фиксов с:
| ID | Категория | Описание | Priority | Severity | Ответственный | Effort (h) | Срок | Зависимости | Платформа (Code/Cowork) | Критерий приёмки | Статус |
- Группировка: P0 (blockers) / P1 (high) / P2 (medium) / P3 (low)
- Effort оценка в часах
- Gantt-style зависимости

---

## Правила выполнения

1. **Шаг 0:** карта Public до проверок
2. **Приоритетные подозрения:** 4 зоны (утечка, рассогласование, XML, Going Concern) ДО системного
3. **Этапный режим с субагентами:** блок → ПАУЗА → подтверждение. Субагенты параллельно.
4. **Скрипты сначала:** автоматика до ручного
5. **Auto retry:** 2 попытки, потом fallback
6. **Read-only:** ничего не модифицировать
7. **Каждая находка с доказательством**
8. **Internal — эталон** для якорей
9. **Триангуляция:** benchmarks 2+ источника
10. **Числа/даты/имена — точный перенос** (№1 П5)
11. **Скрипты → `audit_scripts/`** (все 22)
12. **Прогресс → WIP xlsx + progress.json**
13. **Критические баги — немедленно**
14. **Docx по дефолту:** A4, TNR 14pt, H1 22pt #0070C0
15. **4 итоговых файла** (xlsx findings + docx exec summary + docx red flag + xlsx roadmap)

---

## Критерии приёмки (Definition of Done)

- [ ] 4 приоритетных подозрения проверены
- [ ] Все 6 блоков (A/B/C/D/E/F) пройдены с ПАУЗАМИ
- [ ] Все 22 скрипта запущены
- [ ] 4 типа logic tests (причинно-следственные + граничные + метаморфические + ручная сверка 3–5 ячеек)
- [ ] MC независимо репродуцирован 10 000+ прогонов
- [ ] 6 stress-тестов выполнены
- [ ] Peer benchmarking: multiples + cohort ROI + regulatory
- [ ] Exit scenarios NPV (IPO/M&A/MBO/Secondary/Run-off)
- [ ] Cap table + dilution scenarios
- [ ] Investor rights + anti-dilution + tag/drag + div policy
- [ ] Covenant compliance пики Q3'26/Q2'27
- [ ] Unit economics 7 проектов
- [ ] Accounting identity стандарт
- [ ] ESG + country risk
- [ ] Going Concern: FOT cap + Revenue floor + reconciliation + 2 сценария
- [ ] Cover docs: Cover Letter + методологич + README + assumptions log + pitch deck + term sheet + teaser + disclaimers
- [ ] Version control + Git-гигиена
- [ ] IRR W₃ 20.09% independent
- [ ] BS balance 16 периодов (0)
- [ ] Cash chain CF→BS (0)
- [ ] Public vs Internal якоря 1:1
- [ ] Leakage пройдена
- [ ] П5 «Максимум» (32 механизма)
- [ ] 4 файла выхода: findings.xlsx (9 л) + exec_summary.docx (3–5 стр) + RED_FLAG_MEMO.docx (1 стр) + REMEDIATION_ROADMAP.xlsx
- [ ] Top-10 рисков приоритизированы
- [ ] Вердикт: PASS / CONDITIONAL / FAIL
- [ ] Путь до FULL PASS с effort

---

## Ожидаемый результат

4 файла (findings xlsx / exec summary docx / red flag memo docx / remediation roadmap xlsx) + `audit_scripts/` (22). Уровень DD-grade, готово к передаче инвестору после P0/P1 фиксов.
