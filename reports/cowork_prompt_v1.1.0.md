# ПРОМТ для Cowork-сессии — LP Package v1.1.0 + П5 Верификация

**Дата:** 2026-04-14 (обновлено после MC sync fix)
**Основание:** Ремедиация Investor Public v1.0.2 → v1.1.0 завершена (Claude Code, 462 теста PASS, 39/39 findings closed)
**Цель:** (1) П5 «Максимум» 32/32 верификация, (2) финальная сборка LP Package

---

## ⚠ КРИТИЧЕСКИЙ КОНТЕКСТ: MC vs Deterministic IRR

**Детерминистический IRR (waterfall W₃)** = 20.09% — рассчитан по реальной структуре каскада с ежегодными распределениями 2026–2032.

**MC стохастический Mean IRR** = 7.24% — рассчитан с упрощённой схемой cash flows: `[-1250, 0, 0, 0, 20%, 50%, 15%, 15%]` (invest Y0, returns Y4–Y7).

**Причина разрыва:** MC использует 4-летнюю задержку перед первыми cash flows, тогда как реальный waterfall начинает возвращать средства раньше. Это занижает MC IRR. MC-метрика P(IRR>18%)=0.0% — следствие схемы CF, а не модельного риска.

**Правило для LP документов:**
- Детерминистический IRR 20.09% = **основная метрика** (Section V, Executive Summary)
- MC IRR = **стресс-метрика** с обязательным disclosure о CF timing
- Никогда не смешивать эти два IRR без объяснения методологического различия

---

## ЧАСТЬ 1 — П5 «Максимум» 32/32 Верификация

### Задача
Провести независимую верификацию ремедиации v1.1.0 по пресету П5 «Максимум» (все 32 механизма, 6 категорий). Дополнительно: П13 «Аудитор» — повторение 39 findings аудита на исправленной версии.

### Файлы-источники (все в ветке `claude/remediate-audit-findings-QWitr` репо `Noldorwarrior/TrendStudio-Holding`)

| Файл | Описание |
|------|----------|
| `Investor_Package/investor_model_v1.0_Public.xlsx` | Стерилизованная финмодель v1.1.0, 42 листа, MC N=50k |
| `CHANGELOG.md` | Полный перечень изменений R-001..R-025 |
| `reports/baseline_v1.0.2.md` | Baseline до ремедиации |
| `reports/phase_7_final_report.md` | Финальный отчёт Phase 7 |
| `pipeline/generators/finance_core.py` | SSOT: IRR, MOIC, CAPM, blend, stress, risk |
| `pipeline/generators/monte_carlo.py` | MC N=50000 Sobol + Bootstrap CI |
| `pipeline/sterilize.py` | Скрипт стерилизации + verify |
| `pipeline/artifacts/stress_matrix/*.json` | MC/Stress/LHS данные |
| `Investor_Package/build_A12_sensitivity_scenario_mc.py` | MC builder (n_sims=50000) |

### Что проверить (32 механизма П5)

**Factual (Ф1-Ф6):**
- Ф1: NDP = 3 000 млн ₽ (ячейка Assumptions D139)
- Ф2: Revenue = 4 545 млн ₽ (09_P&L)
- Ф3: EBITDA cumul = 2 152 млн ₽ (Assumptions D140)
- Ф4: IRR Public W₃ = 20.09% — **детерминистический** (24_Investor_Returns, 36_Executive_Summary)
- Ф5: WACC = 19.05% (22_Valuation_DCF, Named Range WACC_BASE)
- Ф6: Investment T₁ = 1 250 млн ₽ (Assumptions D134)

**Numerical (Н1-Н6):**
- Н1: EBITDA = Revenue − COGS − P&A − OpEx (проверить 09_P&L)
- Н2: WACC = 0.70 × 23.1% + 0.30 × 9.6% = 19.05% (CAPM build-up в build_A10)
- Н3: MC N=50000: Mean IRR = 7.24%, P(IRR>8%) = 19.4%, P(IRR>18%) = 0.0%, Mean NDP = 3 510 (28_Monte_Carlo_Summary)
- Н4: D&A transition 3→175→348→520 (плавный ramp, не 3→500)
- Н5: Revenue blend E[blend] = 1.00 при E[hit_rate]=0.70 (формула 0.79 + 0.30×hr)
- Н6: MoIC aggregate 4.8× vs T1 cash-on-cash 2.0× (оба присутствуют)

**Logical (Л1-Л6):**
- Л1: Один метод IRR (numpy_financial.irr) во всех скриптах
- Л2: Prob vector SSOT = [0.05, 0.15, 0.50, 0.20, 0.10]
- Л3: Floor ≤ Fair ≤ Ceiling (valuation ordering)
- Л4: Risk rubric 5×5 калиброван (score 15+ = CRITICAL)
- Л5: Stress сценарии — NDP снижается при каждом шоке
- Л6: Reverse stress breakeven hit_rate < 0.70

**Source (И1-И6):**
- И1: CAPM: Rf=ОФЗ 26238 10Y/Cbonds, β=Bloomberg peer median, ERP=Damodaran Russia, Country=Damodaran CDS, Size=Duff&Phelps/Kroll
- И2: Peer comps: 6 peers × Source/Date/Link (MOEX, SPARK, CNews, Kontur, GPM, RBK)
- И3: Tax: ННП 20% (17%+3%), НДС 0% cinema (ст.149 НК РФ)
- И4: Comparable Transactions: 10 RU + 10 Global deals
- И5: MC seed=42, N=50000, quasi-random (Sobol в pipeline, random.seed в build_A12)
- И6: Requirements pinned (== format, all deps)

**Document (Д1-Д6):**
- Д1: 0 occurrences "Internal" (кроме "Internal Rate of Return")
- Д2: 0 absPath в workbook.xml
- Д3: Author=TrendStudio, no L3, no anchor в metadata (core.xml)
- Д4: Cover Letter v1.1.0 без placeholders, дата 14 апреля 2026
- Д5: 0 backup/bak/FUSE файлов в Investor_Package
- Д6: Print_Area установлена на всех 42 листах

**Audience (А1-А2):**
- А1: Документ подходит для LP (квалифицированный инвестор, DD-grade)
- А2: Нет информации Internal model (W₅, V-D, L3) в Public документе

### Ожидаемый результат
JSON-отчёт с 32/32 PASS. Если < 32 — список FAIL с обоснованием и рекомендацией.

---

## ЧАСТЬ 2 — LP Package Сборка (premium-presentations skill)

### Задача
Собрать финальный LP Package v1.1.0 из актуальных данных модели.

### Ключевые метрики v1.1.0 (SSOT — для вставки в документы)

**Детерминистические (из модели):**

| Метрика | Значение | Источник |
|---------|----------|----------|
| Revenue 3Y cumul | 4 545 млн ₽ | 09_P&L_Statement |
| EBITDA 3Y cumul (GAAP) | 2 167 млн ₽ | 09_P&L T28 (actual sum), 02_Assumptions D140 |
| NDP (anchor) | 3 000 млн ₽ | 02_Assumptions D139, Named Range NDP_ANCHOR |
| Net Profit 3Y | 1 698 млн ₽ | 09_P&L T36 (actual sum), 02_Assumptions D141 |
| IRR Public W₃ (deterministic) | **20.09%** | 24_Investor_Returns H22, 36_Executive_Summary |
| MoIC W₃ Base (T1 cash-on-cash) | 2.0× | 24_Investor_Returns I22 |
| Payback | 3.23 лет | 24_Investor_Returns G37, 36_ES E27 |
| WACC | 19.05% | 22_Valuation_DCF, Named Range WACC_BASE |
| CAPM Ke | 23.1% | Rf 14.5% + β(0.80)×ERP(7.0%) + Country 2.0% + Size 1.0% |
| Investment T₁ | 1 250 млн ₽ | 02_Assumptions D134 (4 транша) |
| Producer equity | 600 млн ₽ | 02_Assumptions D135 |
| DCF EV blended | ~1 815 млн ₽ | 22_Valuation_DCF |
| Peer median EV/EBITDA | 5.71× | 23_Valuation_Multiples |
| Films | 12 премиальных | 08_Content_Pipeline |

**Стохастические MC (N=50,000, seed=42):**

| Метрика | Значение | Примечание |
|---------|----------|------------|
| MC Mean IRR | **7.24%** | ⚠ Упрощённая CF схема (0,0,0,returns Y4-Y7) |
| MC P(IRR>18% hurdle) | **0.0%** | ⚠ Следствие CF timing, не модельного риска |
| MC P(IRR>8% floor) | **19.4%** | |
| MC P(loss IRR<0) | **0.0%** | |
| MC Mean NDP | **3 509.8 млн ₽** | Выше anchor (positive skew) |
| MC Median EV | **13 042 млн ₽** | |
| MC N | 50 000 | seed=42, 5 stochastic vars |
| Blend formula | 0.79 + 0.30×hit_rate | E[blend]=1.00 при E[hr]=0.70 (unbiased) |

### ⚠ Обязательный disclosure для LP документов

В каждом документе, где упоминается MC IRR, добавить блок:

> **Методологическое примечание.** Стохастическая IRR (MC Mean 7.24%) рассчитана с упрощённой схемой cash flows: инвестиция в Y0, нулевые потоки Y1–Y3, распределение в Y4–Y7. Детерминистическая IRR (20.09%) использует фактическую структуру waterfall W₃ с ежегодными распределениями начиная с Y1. Разрыв обусловлен различием в timing cash flows, а не в прогнозе доходности. Для оценки инвестиционной привлекательности следует ориентироваться на детерминистическую IRR 20.09% как базовую метрику, а MC — как стресс-индикатор при extreme scenarios.

### Что нужно пересобрать

**1. Investor Memo (docx, 15–20 стр.)**
- Основа: `pipeline/artifacts/B3_memo.docx` (v1.0.x)
- Обновить: MC N=50000 (было 1000), blend=0.79 (было 0.85), все метрики из таблицы выше
- Добавить: CAPM build-up таблица (5 компонент с источниками), Floor/Fair/Ceiling, stress test summary
- Добавить: Disclosure MC vs Deterministic IRR (блок выше) — prominently в Section III
- Секция рисков: MC P(IRR>8%)=19.4%, breakeven hit_rate=0.627

**2. Investor Presentation (pptx, 25 слайдов)**
- Основа: `Kinoholding_Investor_Deck_v4.pptx` (6 слайдов — структура/дизайн)
- Дополнить из: `pipeline/artifacts/B2_presentation.pptx` (12 слайдов — аналитика/MC)
- Обновить: все метрики v1.1.0, добавить слайды CAPM, Floor/Fair/Ceiling, Stress Tests, MC histogram (50k bins)
- Стиль: TBank palette
- Slide с disclosure MC vs Det. IRR

**3. Executive Summary (1 стр.)**
- Основа: `pipeline/artifacts/B4_onepager.docx`
- Обновить: все числа из таблицы метрик выше
- Добавить строку: MC disclosure (1 предложение)

**4. Teaser (1 стр.)**
- Создать новый: NDP 3 000, IRR 20.09%, T₁ 1 250, 12 фильмов
- Формат: A4, минималистичный, Times New Roman 12pt
- Одно-предложение pitch + таблица 5 ключевых метрик

### Файлы-шаблоны (загрузить в Cowork)

```
Investor_Package/investor_model_v1.0_Public.xlsx   — финмодель v1.1.0 (42 листа)
pipeline/artifacts/B3_memo.docx                     — memo template
pipeline/artifacts/B4_onepager.docx                 — onepager template
Kinoholding_Investor_Deck_v4.pptx                   — investor deck (стиль + структура)
pipeline/artifacts/B2_presentation.pptx             — техническая презентация (MC/риски)
pipeline/artifacts/stress_matrix/*.json             — MC/stress data (7 JSON файлов)
CHANGELOG.md                                         — что изменилось v1.0.2→v1.1.0
reports/cowork_prompt_v1.1.0.md                      — этот промт
```

### Формат выхода
Архив `InvestorPackage_v1.1.0/`:
```
InvestorPackage_v1.1.0/
├── 01_Executive_Summary.docx        ← 1 стр., ключевые метрики
├── 02_Teaser.docx                   ← 1 стр., pitch + 5 метрик
├── 03_Cover_Letter.docx             ← из xlsx лист 42 (уже v1.1.0)
├── 04_Investor_Memo_v1.1.0.docx     ← 15–20 стр., полный анализ
├── 05_Investor_Presentation_v1.1.0.pptx  ← 25 слайдов
├── 06_Financial_Model_v1.1.0.xlsx   ← стерилизованная модель
├── Appendix_A_Risk_Register.xlsx    ← лист 29 (30 рисков, rubric 5×5)
├── Appendix_B_Stress_Tests.xlsx     ← лист 30 + stress scenarios
├── Appendix_C_MC_Report.xlsx        ← лист 28 (N=50k, seed=42)
├── Appendix_D_Peer_Comps.xlsx       ← листы 23 + 32 (с sources)
└── Appendix_E_CAPM_BuildUp.xlsx     ← лист 22 (5 компонент CAPM)
```
