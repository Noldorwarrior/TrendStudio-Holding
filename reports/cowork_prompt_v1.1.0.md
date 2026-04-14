# ПРОМТ для Cowork-сессии — LP Package v1.1.0 + П5 Верификация

**Дата:** 2026-04-14 (v3 — после deep audit fix)
**Основание:** Ремедиация Investor Public v1.0.2 → v1.1.0 завершена (Claude Code, 462 теста PASS, 39 original + 18 deep audit findings closed)
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

### Файлы-источники

Все файлы в ветке `claude/remediate-audit-findings-QWitr` репо `Noldorwarrior/TrendStudio-Holding`.

| # | Файл | Описание |
|---|------|----------|
| 1 | `Investor_Package/investor_model_v1.0_Public.xlsx` | Финмодель v1.1.0 (42 листа, MC N=50k, стерилизована) |
| 2 | `CHANGELOG.md` | Полный перечень изменений R-001..R-025 |
| 3 | `reports/baseline_v1.0.2.md` | Baseline до ремедиации |
| 4 | `reports/phase_7_final_report.md` | Финальный отчёт Phase 7 |
| 5 | `pipeline/generators/finance_core.py` | SSOT: IRR, MOIC, CAPM, blend, stress, risk rubric |
| 6 | `pipeline/generators/monte_carlo.py` | MC N=50000 Sobol + Bootstrap CI |
| 7 | `pipeline/sterilize.py` | Скрипт стерилизации + verify |
| 8 | `pipeline/artifacts/stress_matrix/*.json` | MC/Stress/LHS данные (7 JSON) |
| 9 | `Investor_Package/build_A12_sensitivity_scenario_mc.py` | MC builder (n_sims=50000) |
| 10 | `pipeline/artifacts/B3_memo.docx` | Шаблон memo (v1.0.x) |
| 11 | `pipeline/artifacts/B4_onepager.docx` | Шаблон one-pager (v1.0.x) |
| 12 | `pipeline/artifacts/B2_presentation.pptx` | Техническая презентация (MC/Tornado/VaR) |
| 13 | `Kinoholding_Investor_Deck_v4.pptx` | Investor Deck (6 слайдов, дизайн/структура) |

### Что проверить (32 механизма П5)

**Factual (Ф1-Ф6):**
- Ф1: NDP = 3 000 млн ₽ (Assumptions D139, Named Range NDP_ANCHOR)
- Ф2: Revenue = 4 545 млн ₽ (09_P&L)
- Ф3: EBITDA cumul = 2 167 млн ₽ (09_P&L T28, Assumptions D140=2167.4)
- Ф4: IRR Public W₃ = 20.09% — **детерминистический** (24_Investor_Returns H22, 36_ES)
- Ф5: WACC = 19.05% (22_Valuation_DCF, Named Range WACC_BASE, все labels=19.05%)
- Ф6: Investment T₁ = 1 250 млн ₽ (Assumptions D134)

**Numerical (Н1-Н6):**
- Н1: EBITDA = Revenue − COGS − P&A − OpEx (проверить 09_P&L)
- Н2: WACC = 0.70 × 23.1% + 0.30 × 9.6% = 19.05% (CAPM build-up в build_A10)
- Н3: MC N=50,000: Mean IRR = 7.24%, P(IRR>8%) = 19.4%, P(IRR>18%) = 0.0%, Mean NDP = 3 509.8 (28_Monte_Carlo_Summary)
- Н4: D&A transition 3→3→175→348→520 (плавный ramp в 22_DCF R24)
- Н5: Revenue blend E[blend] = 1.00 при E[hit_rate]=0.70 (формула 0.79 + 0.30×hr)
- Н6: MoIC T1 cash-on-cash 2.0× (24_Investor_Returns I22)

**Logical (Л1-Л6):**
- Л1: Один метод IRR (numpy_financial.irr) во всех скриптах (включая build_A11)
- Л2: Prob vector SSOT = [0.05, 0.15, 0.50, 0.20, 0.10] (во всех файлах)
- Л3: Floor ≤ Fair ≤ Ceiling (valuation ordering)
- Л4: Risk rubric 5×5 калиброван (score 15+ = CRITICAL)
- Л5: Stress сценарии — NDP снижается при каждом шоке
- Л6: Reverse stress breakeven hit_rate < 0.70

**Source (И1-И6):**
- И1: CAPM: Rf=ОФЗ 26238/Cbonds, β=Bloomberg peer, ERP=Damodaran, Country=Damodaran CDS, Size=Duff&Phelps
- И2: Peer comps: 6 peers × Source/Date/Link
- И3: Tax: ННП 20%, НДС 0% cinema (ст.149 НК РФ)
- И4: Comparable Transactions: 10 RU + 10 Global deals
- И5: MC seed=42, N=50000
- И6: Requirements pinned == format

**Document (Д1-Д6):**
- Д1: 0 occurrences "Internal" (кроме "Internal Rate of Return")
- Д2: 0 absPath в workbook.xml
- Д3: Author=TrendStudio, no L3, no anchor в metadata
- Д4: Cover Letter v1.1.0, дата 14 апреля 2026, без placeholders
- Д5: 0 backup/bak/FUSE файлов
- Д6: Print_Area на всех 42 листах

**Audience (А1-А2):**
- А1: Документ подходит для LP (DD-grade)
- А2: Нет информации Internal model (W₅, V-D, L3)

### Ожидаемый результат
JSON-отчёт с 32/32 PASS. Если < 32 — список FAIL с обоснованием.

---

## ЧАСТЬ 2 — LP Package Сборка

### Задача
Собрать финальный LP Package v1.1.0 из актуальных данных модели.

### Ключевые метрики v1.1.0 (SSOT)

**Детерминистические (из модели):**

| Метрика | Значение | Источник в xlsx |
|---------|----------|-----------------|
| Revenue 3Y cumul | 4 545 млн ₽ | 09_P&L_Statement |
| EBITDA 3Y cumul (GAAP) | 2 167 млн ₽ | 09_P&L T28 (sum), Assumptions D140 |
| NDP (anchor) | 3 000 млн ₽ | Assumptions D139, NDP_ANCHOR |
| Net Profit 3Y | 1 698 млн ₽ | 09_P&L T36 (sum), Assumptions D141 |
| IRR Public W₃ (det.) | **20.09%** | 24_Investor_Returns H22 |
| MoIC W₃ Base (T1) | 2.0× | 24_Investor_Returns I22 |
| Payback | 3.23 лет | 24_Investor_Returns G37 |
| WACC | 19.05% | 22_Valuation_DCF, WACC_BASE |
| CAPM Ke | 23.1% | Rf 14.5% + β×ERP 5.6% + Country 2.0% + Size 1.0% |
| Investment T₁ | 1 250 млн ₽ | Assumptions D134 |
| Producer equity | 600 млн ₽ | Assumptions D135 |
| DCF EV blended | ~1 815 млн ₽ | 22_Valuation_DCF |
| Peer median EV/EBITDA | 5.71× | 23_Valuation_Multiples |
| D&A ramp (2026-2030) | 3, 3, 175, 348, 520 | 22_Valuation_DCF R24 |
| Films | 12 премиальных | 08_Content_Pipeline |

**Стохастические MC (N=50,000, seed=42):**

| Метрика | Значение | Примечание |
|---------|----------|------------|
| MC Mean IRR | **7.24%** | ⚠ Упрощённая CF схема (0,0,0,returns Y4-Y7) |
| MC P(IRR>18% hurdle) | **0.0%** | ⚠ Следствие CF timing |
| MC P(IRR>8% floor) | **19.4%** | |
| MC P(loss IRR<0) | **0.0%** | |
| MC Mean NDP | **3 509.8 млн ₽** | Выше anchor |
| MC Median EV | **13 042 млн ₽** | |
| MC N | 50 000 | seed=42, 5 stochastic vars |
| Blend formula | 0.79 + 0.30×hit_rate | E[blend]=1.00 (unbiased) |
| Histogram bins | 10 bins, sum=50000 | 28_MC R39-R48 |

### ⚠ Обязательный disclosure для LP документов

В каждом документе, где упоминается MC IRR, добавить:

> **Методологическое примечание.** Стохастическая IRR (MC Mean 7.24%) рассчитана с упрощённой схемой cash flows: инвестиция в Y0, нулевые потоки Y1–Y3, распределение в Y4–Y7. Детерминистическая IRR (20.09%) использует фактическую структуру waterfall W₃ с ежегодными распределениями начиная с Y1. Разрыв обусловлен различием в timing cash flows, а не в прогнозе доходности. Для оценки инвестиционной привлекательности следует ориентироваться на детерминистическую IRR 20.09% как базовую метрику, а MC — как стресс-индикатор при extreme scenarios.

### Что нужно пересобрать

**1. Investor Memo (docx, 15–20 стр.)**
- Основа: `pipeline/artifacts/B3_memo.docx`
- Обновить: MC N=50000, blend=0.79, EBITDA=2167, NP=1698, Payback=3.23
- Добавить: CAPM build-up, Floor/Fair/Ceiling, stress test summary
- Добавить: MC vs Det. IRR disclosure — prominently в Section III

**2. Investor Presentation (pptx, 25 слайдов)**
- Основа: `Kinoholding_Investor_Deck_v4.pptx` + `B2_presentation.pptx`
- Обновить: все метрики v1.1.0
- Добавить: слайды CAPM, Floor/Fair/Ceiling, Stress, MC histogram
- Slide с disclosure MC vs Det. IRR

**3. Executive Summary (1 стр.)**
- Основа: `pipeline/artifacts/B4_onepager.docx`
- Обновить: все числа из таблиц выше + MC disclosure (1 предложение)

**4. Teaser (1 стр.)**
- Новый: NDP 3 000, IRR 20.09%, T₁ 1 250, 12 фильмов, Payback 3.23
- A4, Times New Roman 12pt

### Формат выхода
```
InvestorPackage_v1.1.0/
├── 01_Executive_Summary.docx
├── 02_Teaser.docx
├── 03_Cover_Letter.docx          ← из xlsx лист 42
├── 04_Investor_Memo_v1.1.0.docx
├── 05_Investor_Presentation_v1.1.0.pptx
├── 06_Financial_Model_v1.1.0.xlsx
├── Appendix_A_Risk_Register.xlsx  ← лист 29
├── Appendix_B_Stress_Tests.xlsx   ← лист 30
├── Appendix_C_MC_Report.xlsx      ← лист 28
├── Appendix_D_Peer_Comps.xlsx     ← листы 23 + 32
└── Appendix_E_CAPM_BuildUp.xlsx   ← лист 22
```

---

## ФАЙЛЫ ДЛЯ ЗАГРУЗКИ В COWORK (13 файлов)

| # | Путь в репо | Размер | Описание |
|---|-------------|--------|----------|
| 1 | `Investor_Package/investor_model_v1.0_Public.xlsx` | ~238 KB | Финмодель v1.1.0 (ГЛАВНЫЙ ФАЙЛ) |
| 2 | `pipeline/artifacts/B3_memo.docx` | 48 KB | Шаблон memo |
| 3 | `pipeline/artifacts/B4_onepager.docx` | 39 KB | Шаблон one-pager |
| 4 | `pipeline/artifacts/B2_presentation.pptx` | 43 KB | Техническая презентация |
| 5 | `Kinoholding_Investor_Deck_v4.pptx` | 128 KB | Investor Deck (дизайн) |
| 6 | `CHANGELOG.md` | 4 KB | Что изменилось |
| 7 | `reports/cowork_prompt_v1.1.0.md` | ~10 KB | Этот промт |
| 8 | `pipeline/artifacts/stress_matrix/mc_samples.json` | 18 KB | MC samples |
| 9 | `pipeline/artifacts/stress_matrix/matrix_27.json` | 7 KB | 27 scenarios |
| 10 | `pipeline/artifacts/stress_matrix/monte_carlo.json` | 0.4 KB | MC summary |
| 11 | `pipeline/artifacts/stress_matrix/monte_carlo_bootstrap.json` | 0.5 KB | Bootstrap CI |
| 12 | `pipeline/artifacts/stress_matrix/lhs_copula.json` | 0.6 KB | LHS data |
| 13 | `pipeline/artifacts/stress_matrix/stage_gate.json` | 0.8 KB | Stage-gate |

**Итого: ~540 KB, 13 файлов.**

Все файлы скачиваются из GitHub:
```
https://github.com/Noldorwarrior/TrendStudio-Holding/tree/claude/remediate-audit-findings-QWitr
```
Или: Code → Download ZIP → переключить на ветку `claude/remediate-audit-findings-QWitr`.
