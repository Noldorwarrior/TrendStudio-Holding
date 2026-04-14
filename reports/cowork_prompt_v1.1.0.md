# ПРОМТ для Cowork-сессии — LP Package v1.1.0 + П5 Верификация

**Дата:** 2026-04-14
**Основание:** Ремедиация Investor Public v1.0.2 → v1.1.0 завершена (Claude Code, 462 теста PASS, 39/39 findings closed)
**Цель:** (1) П5 «Максимум» 32/32 верификация, (2) финальная сборка LP Package

---

## ЧАСТЬ 1 — П5 «Максимум» 32/32 Верификация

### Задача
Провести независимую верификацию ремедиации v1.1.0 по пресету П5 «Максимум» (все 32 механизма, 6 категорий). Дополнительно: П13 «Аудитор» — повторение 39 findings аудита на исправленной версии.

### Файлы-источники (все в ветке `claude/remediate-audit-findings-QWitr` репо `Noldorwarrior/TrendStudio-Holding`)

| Файл | Описание |
|------|----------|
| `Investor_Package/investor_model_v1.0_Public.xlsx` | Стерилизованная финмодель v1.1.0, 42 листа |
| `CHANGELOG.md` | Полный перечень изменений R-001..R-025 |
| `reports/baseline_v1.0.2.md` | Baseline до ремедиации |
| `reports/phase_7_final_report.md` | Финальный отчёт Phase 7 |
| `pipeline/generators/finance_core.py` | SSOT: IRR, MOIC, CAPM, blend, stress, risk |
| `pipeline/generators/monte_carlo.py` | MC N=50000 Sobol + Bootstrap CI |
| `pipeline/sterilize.py` | Скрипт стерилизации + verify |
| `pipeline/artifacts/stress_matrix/*.json` | MC/Stress/LHS данные |

### Что проверить (32 механизма П5)

**Factual (Ф1-Ф6):**
- Ф1: NDP = 3 000 млн ₽ (ячейка Assumptions D139)
- Ф2: Revenue = 4 545 млн ₽ (09_P&L)
- Ф3: EBITDA cumul = 2 152 млн ₽ (Assumptions D140)
- Ф4: IRR Public W₃ = 20.09% (24_Investor_Returns, 36_Executive_Summary)
- Ф5: WACC = 19.05% (22_Valuation_DCF, Named Range WACC_BASE)
- Ф6: Investment T₁ = 1 250 млн ₽ (Assumptions D134)

**Numerical (Н1-Н6):**
- Н1: EBITDA = Revenue - COGS - P&A - OpEx (проверить 09_P&L)
- Н2: WACC = 0.70 × 23.1% + 0.30 × 9.6% = 19.05% (CAPM build-up в build_A10)
- Н3: MC Mean IRR = 7.24%, P(IRR>8%) = 19.4%, P(IRR>18%) = 0.0% (28_Monte_Carlo_Summary)
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
- И1: CAPM: Rf=ОФЗ/Cbonds, β=Bloomberg, ERP=Damodaran, Country=Damodaran CDS, Size=Duff&Phelps
- И2: Peer comps: 6 peers × Source/Date/Link
- И3: Tax: ННП 20% (17%+3%), НДС 0% cinema (ст.149 НК)
- И4: Comparable Transactions: 10 RU + 10 Global deals
- И5: MC seed=42, N=50000, Sobol quasi-random
- И6: Requirements pinned (== format)

**Document (Д1-Д6):**
- Д1: 0 occurrences "Internal" (кроме IRR term)
- Д2: 0 absPath в workbook.xml
- Д3: Author=TrendStudio, no L3, no anchor в metadata
- Д4: Cover Letter v1.1.0 без placeholders
- Д5: 0 backup/bak файлов
- Д6: Print_Area на всех 42 листах

**Audience (А1-А2):**
- А1: Документ подходит для LP (квалифицированный инвестор)
- А2: Нет информации Internal model (W₅, V-D) в Public документе

### Ожидаемый результат
JSON-отчёт с 32/32 PASS. Если < 32 — список FAIL с обоснованием и рекомендацией.

---

## ЧАСТЬ 2 — LP Package Сборка (premium-presentations skill)

### Задача
Собрать финальный LP Package v1.1.0 из актуальных данных модели.

### Ключевые метрики v1.1.0 (для вставки в документы)

| Метрика | Значение |
|---------|----------|
| Revenue 3Y | 4 545 млн ₽ |
| EBITDA cumul | 2 152 млн ₽ (GAAP) |
| NDP (anchor) | 3 000 млн ₽ |
| Net Profit 3Y | 1 689 млн ₽ |
| IRR Public W₃ | 20.09% |
| MoIC W₃ Base | 2.0× |
| MoIC aggregate (exit-weighted) | 4.8× |
| Payback | 3.75 лет |
| WACC | 19.05% (CAPM: Rf 14.5% + β×ERP 5.6% + Country 2.0% + Size 1.0%) |
| Investment T₁ | 1 250 млн ₽ (4 транша) |
| Producer equity | 600 млн ₽ |
| MC N=50000 Mean IRR | 7.24% |
| MC P(IRR>18% hurdle) | 0.0% ⚠ |
| MC P(IRR>8% floor) | 19.4% |
| MC Mean NDP | 3 510 млн ₽ |
| MC Median EV | 13 042 млн ₽ |
| DCF EV blended | ~1 815 млн ₽ |
| Peer median EV/EBITDA | 5.71× |
| Films | 12 премиальных, 2026-2028 |

### Что нужно пересобрать

**1. Investor Memo (docx, 15-20 стр.)**
- Основа: `pipeline/artifacts/B3_memo.docx` (v1.0.x)
- Обновить: MC теперь N=50000 Sobol (было N=1000), IRR unified, D&A smoothed
- Добавить: CAPM build-up таблица, Floor/Fair/Ceiling, Sobol indices, stress scenarios
- Добавить: Disclosure P(IRR>hurdle)=0.0% prominently (MC simplified CF timing vs deterministic waterfall IRR=20.09%)
- ⚠ ВАЖНО: MC использует упрощённую схему cash flows (0,0,0,returns Y4-Y7), что занижает IRR vs детерминистический waterfall. Disclosure обязателен.

**2. Investor Presentation (pptx, 25 слайдов)**
- Основа: `Kinoholding_Investor_Deck_v4.pptx`
- Обновить: метрики v1.1.0, CAPM decomposition slide, MC histogram (50k), stress test summary
- Стиль: TBank palette (из B2_presentation)

**3. Executive Summary (1 стр.)**
- Основа: `pipeline/artifacts/B4_onepager.docx`
- Обновить: все числа v1.1.0

**4. Teaser (1 стр.)**
- Создать новый: ключевые метрики + одно-предложение pitch
- Формат: A4, минималистичный, Times New Roman 12pt

### Файлы-шаблоны (загрузить в Cowork)

```
Investor_Package/investor_model_v1.0_Public.xlsx   — модель
pipeline/artifacts/B3_memo.docx                     — memo template
pipeline/artifacts/B4_onepager.docx                 — onepager template
Kinoholding_Investor_Deck_v4.pptx                   — deck template
pipeline/artifacts/B2_presentation.pptx             — style reference
pipeline/artifacts/stress_matrix/*.json             — MC/stress data
CHANGELOG.md                                         — что изменилось
```

### Формат выхода
Архив `InvestorPackage_v1.1.0/` с:
```
InvestorPackage_v1.1.0/
├── 01_Executive_Summary.docx
├── 02_Teaser.docx
├── 03_Cover_Letter.docx          ← уже в xlsx, лист 42
├── 04_Investor_Memo_v1.1.0.docx
├── 05_Investor_Presentation_v1.1.0.pptx
├── 06_Financial_Model_v1.1.0.xlsx
├── Appendix_A_Risk_Register.xlsx  ← лист 29 из модели
├── Appendix_B_Stress_Tests.xlsx   ← лист 30 из модели
├── Appendix_C_MC_Report.xlsx      ← лист 28 из модели
├── Appendix_D_Peer_Comps.xlsx     ← лист 23+32 из модели
└── Appendix_E_CAPM_BuildUp.xlsx   ← лист 22 из модели
```
