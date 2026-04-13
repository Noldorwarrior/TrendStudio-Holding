# ПРОМТ: Ремедиация Investor Model v1.0.2 Public → v1.1 «DD-Ready»

**Версия промта:** v1.0 (draft)
**Дата:** 2026-04-14
**Платформа:** Claude Code (primary) + Cowork (финальная верификация и оформление)
**Заказчик:** rakhman / TrendStudio
**Цель:** Привести Investor Public Package v1.0.2 к статусу **FULL PASS по всем 39 findings и 25 R-items аудита**, создать defensible narrative для DD, упаковать v1.1.0 с полным SHA-256 manifest.

---

## 0. КОНТЕКСТ

Ты — Claude Code в роли Senior Financial Engineer + OOXML-surgeon + Python pipeline maintainer. Тебе поручена ремедиация финмодели TrendStudio Investor Public v1.0.2 после независимого аудита DD-grade (см. `audit/public_v1/`).

**Текущий статус модели:** CONDITIONAL FAIL — 5 CRITICAL, 14 HIGH, 15 MEDIUM, 5 LOW findings. 32/32 П5-механизмов применены аудитором.

**Твоя миссия:** Выйти в FULL PASS без ломки архитектуры, с сохранением всех 287+ существующих тестов зелёными + регрессионное покрытие по каждому закрытому finding.

**Ключевые метрики успеха:**
- 0 CRITICAL findings OPEN
- 0 HIGH findings OPEN (или оформлены как documented design choice с defence narrative)
- pytest: 287+ прежних зелёные + ≥40 новых regression-тестов по findings
- coverage ≥ 85% на `pipeline/generators/`
- 0 leakage hits (grep по `internal|absPath|claude|L3|team@trendstudio` в xlsx = 0)
- SHA-256 manifest v1.1.0 детерминирован и воспроизводим (seed=42)
- П5 «Максимум» (32/32) пройден после каждой фазы

---

## 1. ВХОДНЫЕ ДАННЫЕ (AUDIT SSOT)

**Репозиторий:** `https://github.com/Noldorwarrior/TrendStudio-Holding.git`
**Рабочая ветка:** создать `feature/v1.1-remediation` от актуального main.
**Audit SSOT:** 4 файла должны быть положены в `audit/public_v1/` (добавить в `.gitignore` чтобы не утекли с публичным релизом):
- `audit/public_v1/executive_summary.docx`
- `audit/public_v1/RED_FLAG_MEMO.docx`
- `audit/public_v1/findings.xlsx` — 39 findings с ID/Block/Severity/Category/Location/Evidence/Remediation/Status
- `audit/public_v1/REMEDIATION_ROADMAP.xlsx` — 25 R-items с Priority/Effort/Dependencies/Acceptance

**Inline-слепок (для быстрого ориентирования, полная правда в xlsx):**

**CRITICAL (P0):**
- **F-001** `24_Investor_Returns!B49` — leakage Internal W5 V-D waterfall (текст «Margin to hurdle under W3 (2.09pp) is lower than under Internal W5 V-D (6.75pp)»)
- **F-002** `sharedStrings.xml` — 8× keyword «Internal»
- **F-003** `xl/workbook.xml` absPath — `/Users/noldorwarrior/Documents/Claude/Projects/Holding/Investor_Package/`
- **F-004** — 97.5% статика (226 формул / 9000+ значений)
- **F-005** — Anchor-back-solving: `4545 = 2008.8 + 368.8 + 2167.4` точно до десятых

**HIGH (P1):**
- **F-006** — 3 метода IRR (Newton, MOIC^(1/6.5), numpy) дают разные цифры
- **F-007** — Spread 6×: DCF 1.8B / Comps 7.5B / MC 11.2B
- **F-008** — MC P(IRR>18%) = 13.6%, Mean 11.44% vs Base 20.09%
- **F-009/010/011** — «Internal» labels в Change Log, Valuation Multiples, Comparable Transactions
- **F-012** — D&A jumps 167× (3M → 500M в 2029)
- **F-013** — MoIC 4.8× vs 1.39× без метки
- **F-014** — Scenario probabilities 5/15/50/20/10 vs 10/20/40/20/10
- **F-015** — 5/6 peer comps на EV/Revenue 0.80–0.81 без citations
- **F-016** — MC revenue blend +6% bias (`0.85 + 0.30*hit_rate` at mode=1.06)
- **F-017/018/019** — Pipeline: 3 hardcoded paths, requirements не pinned, 3 missing deps

Остальные 24 finding (MEDIUM/LOW) — в `audit/public_v1/findings.xlsx`.

---

## 2. ПЛАТФОРМА И РАБОЧИЙ РЕЖИМ

### 2.1 Распределение работы
- **Claude Code (~85% работы):** OOXML surgery, Python pipeline refactor, pytest/coverage, git, openpyxl formula conversion, MC re-simulation, regression suite.
- **Cowork (~15% работы, финал):** визуальное ревью сгенерированных docx/pptx/xlsx, П5-верификация через `verification-core` и `govdoc-analytics:verify`, финальная AskUserQuestion-сверка перед отправкой.

### 2.2 Этапность и паузы
Работаем **этапно с обязательными паузами между фазами**. После каждой фазы:
1. Запусти `pytest -v` + coverage report.
2. Запусти верификатора-субагента (П5 «Максимум», 32 механизма).
3. Сгенерируй **Phase Completion Report** (`reports/phase_N_report.md`): что сделано, diff before/after, findings closed/remaining, evidence per R-item.
4. **ОСТАНОВИСЬ** и жди явного одобрения пользователя: «Продолжай фазу N+1».

Никогда не переходи к следующей фазе без подтверждения. Если видишь блокер — сразу останавливайся и запрашивай решение через AskUserQuestion.

### 2.3 Git-workflow
- Ветка `feature/v1.1-remediation` от main.
- Коммиты атомарные по R-item или группе findings: `fix(leakage): scrub W5 V-D from 24_Investor_Returns!B49 [F-001]`.
- После каждой фазы — annotated tag: `v1.1-phase-0-leakage`, `v1.1-phase-1-math`, ... `v1.1.0`.
- Бандлы через `/tmp`-workflow (FUSE обход), как в предыдущих проектах.
- Итоговый merge в main только после П5 PASS и финального одобрения.

---

## 3. АРХИТЕКТУРНЫЕ РЕШЕНИЯ (ЗАФИКСИРОВАНЫ)

### 3.1 Формулы: **Гибридный подход** (Variant 1)
- Конвертируем 4 ключевых листа в live formulas: **P&L / Cash Flow / Waterfall / DCF**.
- Ключевые якоря защищаем named ranges: `NDP_ANCHOR=3000`, `HURDLE_RATE=0.18`, `WACC_BASE=0.1905`.
- Pydantic контракт `AnchorInvariant` в `schemas/anchors.py`: NDP=3000 ±1% (actual 3000.7 допустим).
- pytest-тест `test_anchor_invariant.py` падает если якорь уезжает за tolerance.
- Остальные 38 листов — оставляем как есть (cosmetic/reporting), но чистим от leakage/metadata.

### 3.2 Pipeline: **v1.1 incremental** (без ломки API)
- Все публичные функции `generators/*.py` сохраняют сигнатуры.
- Semver bump: v1.0.2 → v1.1.0 (minor = новая функциональность backward-compatible).
- v1.0.2 консервируется как annotated git tag + read-only zip в `releases/v1.0.2-archive/`.

### 3.3 IRR: **Унификация на `numpy_financial.irr`** (R-008)
- Удалить Newton и MOIC^(1/6.5) implementations.
- Создать `pipeline/generators/irr.py::compute_irr()` как единственную точку.
- Documentation ADR-009: «IRR methodology: numpy_financial.irr, tolerance 1e-6, max_iter 100».
- Regression-тест: `test_irr_consistency.py` сверяет 5+ кейсов с ручной проверкой по финтерминалу.

### 3.4 Монте-Карло: **N=50,000 + Sobol + Bootstrap CI + Bias fix**
- Увеличить simulations 5000 → 50000 (R-009).
- Исправить +6% bias: `blend = 1.0 + (hit_rate - 1.0) * 0.30` (центр в 1.0 при mode).
- Добавить Sobol-индексы через SALib (новая dep).
- Bootstrap 95% CI на Mean IRR, P5, P95, P(IRR>hurdle).
- ADR-010: «MC engine v2: N, variance reduction, sensitivity decomposition».

### 3.5 Валуация: **Floor/Fair/Ceiling + CAPM + Sourced Comps**
- Переформатировать Valuation spread как единый framework:
 - DCF → **FLOOR** (5yr horizon, WACC 19.05%, 1.8B).
 - Comps (med EV/Revenue) → **FAIR** (7.5B).
 - MC P50 → **CEILING** (11.2B).
- Все три — на единых assumptions (same revenue, same EBITDA, same exit year).
- Target spread ≤ 2× с документированным объяснением гапа.
- CAPM build-up для WACC: Rf (ЦБ РФ 10Y ОФЗ), β (Damodaran media sector), ERP (Damodaran Russia), country premium, size premium.
- Peer comps — новый sheet `23a_Peer_Comps_Sources` с колонками: Company, Multiple, Source URL, Date, Methodology, Confidence.

### 3.6 Метаданные: **Полная стерилизация**
- `docProps/core.xml`: Author='TrendStudio', lastModifiedBy='TrendStudio', description=empty, keywords=empty (без «L3»).
- `xl/workbook.xml`: удалить все `x15ac:absPath` элементы.
- `sharedStrings.xml`: 0 вхождений «Internal», «W5 V-D», «L3», «Claude», «noldorwarrior».
- Email `team@trendstudio.ru` — оставить только в официальных контактных ячейках (сверить по whitelist).
- Post-condition: `python -m scripts/leakage_scan.py` возвращает 0 hits.

---

## 4. ФАЗОВЫЙ ПЛАН

### ФАЗА 0 — LEAKAGE & METADATA SCRUB (P0, 1 день)
**Цель:** xlsx безопасен для любой передачи после этой фазы.
**R-items:** R-001, R-002, R-003, R-004, R-005, F-009, F-010, F-011, F-020 — F-024.

**Шаги:**
1. Создать `scripts/phase0_leakage_scrub.py`:
 - Распаковать xlsx как zip.
 - Удалить `x15ac:absPath` из `workbook.xml` (XPath surgery через lxml).
 - В `sharedStrings.xml` — regex-replace: `Internal W5 V-D → Scenario Base`, `(internal) →` (пусто), удалить stray W₅/W₃ unicode.
 - `core.xml`: установить Author/lastModifiedBy = 'TrendStudio', description = '', keywords = ''.
 - Переименовать `Internal` labels в `23_Valuation_Multiples`, `32_Comparable_Transactions`, `03_Change_Log`.
 - Пересобрать zip без recompression метаданных.
2. Создать `scripts/leakage_scan.py` (post-check):
 - `grep -ic "internal\|abspath\|claude\|noldorwarrior\|L3\|W5 V-D\|W₅"` на распакованном xlsx.
 - Должно вернуть 0. Если >0 — exit 1.
3. Запустить `pytest tests/test_leakage_regression.py` (новый тест).

**Acceptance:**
- `leakage_scan.py` → 0 hits.
- `workbook.xml` не содержит `x15ac:absPath`.
- `docProps/core.xml` Author='TrendStudio'.
- pytest zero failures.
- Diff before/after задокументирован в `reports/phase_0_report.md`.

**Верификация:** П5 блоки C (leakage), A (xlsx technical). Механизмы №1, №2, №7, №25, №32.

**ПАУЗА** → ждать «Продолжай Фазу 1».

---

### ФАЗА 1 — MATH & IRR STANDARDIZATION (P1, 3 дня)
**Цель:** Математическая последовательность, единая IRR, исправленный MC, документированные MoIC-метрики.
**R-items:** R-007, R-008, R-009, R-012, R-013, F-006, F-014, F-016, F-026, F-027.

**Шаги:**
1. Создать `pipeline/generators/irr.py` с единственной `compute_irr(cashflows, tol=1e-6)` на numpy_financial.
2. Rewire все вызовы IRR в `build_A11`, `build_A12`, `generators/returns.py`, `monte_carlo.py`, patches v1.0.1.
3. Удалить Newton и MOIC^(1/6.5) implementations. Заменить на delegation в `compute_irr`.
4. Исправить MC revenue blend (R-009): переписать формулу, проверить что центр при mode=1.0.
5. Reconcile scenario probabilities (R-007): выбрать single set (рекомендую 10/20/40/20/10 как в manifest), обновить `build_A12` и все упоминания.
6. MoIC dual-label: `MoIC_Aggregate` vs `MoIC_T1_Cash` в `36_Executive_Summary` и `28_Monte_Carlo_Summary`.
7. D&A bridge (R-012): добавить asset-base schedule в `22_Valuation_DCF`, justified transition 2028→2029 с depreciation policy note.
8. VAT vs Profit Tax (R-018/F-027): отдельные строки в P&L — «НДС (pass-through)» и «Налог на прибыль 20%».
9. Regression tests:
 - `test_irr_single_source.py` — grep проверяет что `numpy_financial.irr` единственный caller.
 - `test_mc_bias.py` — simulate at mode, assert mean revenue ratio ≈ 1.0 ± 0.01.
 - `test_scenario_probs.py` — 10/20/40/20/10 везде.
 - `test_moic_labels.py` — оба MoIC с метками.

**Acceptance:**
- Все 3 IRR методы сведены к одному.
- MC bias fixed, Mean IRR пересчитан с N=50000.
- Scenario probs единые.
- D&A transition задокументирован.
- pytest: новые 10+ тестов зелёные, старые 287+ зелёные.

**Верификация:** П5 блок B (математика). Механизмы №1, №2, №3, №4, №20, №23.

**ПАУЗА** → «Продолжай Фазу 2».

---

### ФАЗА 2 — MONTE CARLO UPGRADE + SENSITIVITY (P1, 2 дня)
**Цель:** Statistically robust MC с uncertainty quantification.
**R-items:** R-009 (завершение), новые UQ-дополнения.

**Шаги:**
1. Установить `SALib` (добавить в pinned requirements).
2. Создать `pipeline/generators/mc_v2.py`:
 - N=50000 vectorized numpy.
 - Cashflow-based IRR (не MOIC approximation).
 - Correlated shocks via Cholesky или Gaussian copula (LHS existing).
 - Возврат: full distribution array.
3. Добавить `pipeline/generators/sobol.py`: Sobol first + total-effect indices на 8 драйверах (Revenue, EBITDA margin, hit_rate, capex, exit_mult, WACC, opex, P&A).
4. Bootstrap 95% CI для Mean/Median IRR, P5, P95, P(IRR>18%), P(Loss).
5. Обновить `28_Monte_Carlo_Summary` в xlsx: добавить CI, Sobol bar chart, distribution histogram.
6. ADR-010: «MC engine v2».

**Acceptance:**
- N=50000 runs в <60 сек на typical machine.
- Sobol indices сходятся при N=50000 (вариация < 0.01 на trial).
- Bootstrap CI узкие (±1pp для Mean IRR).
- Determinism: seed=42 → идентичные результаты 3 runs подряд.

**Верификация:** П5 блок B (UQ). Механизмы №20, №23, №30.

**ПАУЗА** → «Продолжай Фазу 3».

---

### ФАЗА 3 — FORMULA CONVERSION (P1-P2, 5 дней)
**Цель:** 4 ключевых листа — live formulas с named range anchor protection.
**R-items:** R-014, R-015, R-016, R-017, F-004.

**Шаги:**
1. Создать `pipeline/schemas/anchors.py`:
 - `class AnchorInvariant(StrictModel): NDP_ANCHOR=3000, tolerance=0.01, HURDLE_RATE=0.18, WACC_BASE=0.1905`.
2. Создать `pipeline/generators/xlsx_formulas.py`:
 - Helper для генерации formula strings ссылающихся на Assumptions sheet.
 - Support для named ranges (openpyxl `DefinedName`).
3. Конвертировать листы в указанном порядке (от data-entry к valuation):
 - **P&L (`09_P_and_L`)** — каждая ячейка ссылается на Assumptions!B_x или Revenue_Segments!C_y.
 - **Cash Flow (`10_Cash_Flow`)** — ссылается на P&L и BS.
 - **Waterfall (`24_Investor_Returns`)** — ссылается на Cash Flow и DealStructure.
 - **DCF (`22_Valuation_DCF`)** — ссылается на P&L, NDP, WACC_BASE.
4. Named ranges register:
 - `NDP_ANCHOR` → `Assumptions!$B$3` (значение 3000).
 - `HURDLE_RATE` → `Assumptions!$B$4` (0.18).
 - `WACC_BASE` → `Assumptions!$B$5` (0.1905).
5. Sanity-test: открыть файл в LibreOffice (headless), recalc, сверить топ-метрики (Revenue, EBITDA, NDP, IRR W3) с cached values из v1.0.2. Расхождение ≤ 0.1%.
6. Invariant tests:
 - `test_anchor_ndp.py`: parse xlsx через openpyxl, evaluate NDP bridge = 3000 ±1%.
 - `test_formulas_count.py`: formula density ≥ 25% (vs 2.5% v1.0.2).
 - `test_cross_sheet_refs.py`: P&L!Revenue = sum(Revenue_Segments), Cash Flow cascade consistent.

**Acceptance:**
- 4 листа с formula density ≥ 50% каждый.
- Recalc через LibreOffice → NDP ≈ 3000 ±0.1%, IRR ≈ 20.09% ±0.01%.
- Named ranges прописаны и видны в «Name Manager».
- При изменении Revenue!C5 на +10% — P&L/CF/Waterfall/DCF пересчитываются автоматически.

**Верификация:** П5 блок B, A. Механизмы №1, №2, №3, №17, №23, №25, №29.

**ПАУЗА** → «Продолжай Фазу 4».

---

### ФАЗА 4 — VALUATION FRAMEWORK & COMPS (P1, 2 дня)
**Цель:** Floor/Fair/Ceiling framework, CAPM, sourced peer comps.
**R-items:** R-010, R-011, R-019, R-020, R-021, F-007, F-015, F-028, F-029, F-030.

**Шаги:**
1. Создать sheet `22a_Valuation_Framework`:
 - Table: Method / Value / Role (Floor/Fair/Ceiling) / Assumptions / Spread vs Median.
 - DCF 1.8B → FLOOR (5y, 19.05% WACC, implicit 2% g).
 - Comps median 7.5B → FAIR (market approach).
 - MC P50 11.2B → CEILING (probabilistic exit).
2. Reconcile spread ≤ 2×: либо нормировать DCF на 10y horizon и g=3% (поднимет до ~3.5B), либо явный narrative: «6× spread reflects uncertainty in exit timing; DD audience should weight by stage (floor для downside, median для base case, ceiling для upside)».
3. CAPM build-up в `22b_WACC_Decomposition`:
 - Rf = 13.5% (ОФЗ 10Y, ЦБ РФ, дата).
 - β = 1.05 (Damodaran Media Emerging Markets, дата).
 - ERP_global = 5.5% (Damodaran 2026).
 - Country_Risk_Premium_Russia = 8.0% (Damodaran sovereign yield spread, дата).
 - Size_premium = 2.0% (Duff & Phelps размер portfolio).
 - Cost_of_Debt = 14% (bank term sheet range).
 - D/E = 0.35 (target capital structure).
 - WACC = 19.05% (derivation formula в ячейке).
 - Каждая строка — source URL.
4. Peer Comps (`23a_Peer_Comps_Sources`):
 - Columns: Company / EV_mln_RUB / Revenue_mln_RUB / EV_Revenue / EV_EBITDA / Source / Source_Date / Source_URL / Confidence (High/Med/Low/Indicative).
 - Сбор данных:
 - **Kinopoisk** — СПАРК/отчётность Яндекса, пресс-релизы.
 - **Okko** — сделка Сбер 2023 (пресс, РБК).
 - **ivi** — отчётность ООО «Иви.ру» из СПАРК + cancelled IPO 2021 materials.
 - **START** — отчётность МТС Медиа.
 - **Premier** — отчётность Газпром-Медиа.
 - **Mosfilm** — open government data.
 - Если источник недоступен или спорный — `Confidence = Indicative`, `Source = TBD pre-DD via Pitchbook/Mergermarket`.
 - Web-research через WebSearch tool на предмет обзоров J'son & Partners, TelecomDaily, ИРИ, Delovoy Profil (OTT Russia).
5. Risk Rubric sheet `29a_Risk_Scoring_Rubric`: Probability 1-5 (Rare/Unlikely/Possible/Likely/Almost Certain), Impact 1-5 (Negligible/Minor/Moderate/Major/Catastrophic), heatmap 5×5.
6. Capital Stack (`17a_Capital_Stack`):
 - Hierarchy: Senior LP (pref 8%, W3) → Producer Equity 600M (T2) → Catch-up tier (removed in W3) → GP carry.
 - Cash-on-cash per tier, IRR per tier.

**Acceptance:**
- Floor/Fair/Ceiling explicit framework с единой базой.
- Spread документирован (≤ 2× или явное обоснование).
- CAPM build-up с 6 sourced components + URL на каждый.
- 6+ peer comps с source, date, confidence.
- Risk rubric калиброван.
- Capital stack визуально понятен.

**Верификация:** П5 блок D (investor readiness). Механизмы №3, №4, №10, №11, №18, №19, №27, №31.

**ПАУЗА** → «Продолжай Фазу 5».

---

### ФАЗА 5 — PIPELINE HARDENING (P2, 1 день)
**Цель:** Clean pipeline, pinned deps, no hardcoded paths, full test coverage.
**R-items:** R-022, R-023, R-024, R-025, F-017, F-018, F-019, F-033, F-035 — F-039.

**Шаги:**
1. `pip freeze > requirements.txt` → pinned versions `==`.
2. Добавить missing: `plotly`, `python-pptx`, `rakhman_docs`, `SALib`, `numpy_financial` (если не был), `openpyxl`, `hypothesis`.
3. Убрать 3 hardcoded macOS paths в `build_memo.py`, `build_onepager.py`, `build_presentation.py`. Заменить на `os.getenv('OUTPUT_DIR', default=tempfile.gettempdir())` или CLI arg.
4. Fix `scripts/verify.py:161`: hardcoded `14` → `len(INPUT_FILES)` или `len(list(INPUT_DIR.glob('*.yml')))`.
5. Update `pipeline/README.md`: test count 287+ (актуально), новые ADRs.
6. Unify test_16 numbering.
7. Remove *.bak files from release (добавить в .gitignore).
8. Hypothesis расширить:
 - `test_property_irr_monotonicity`: IRR monotonic in exit_mult.
 - `test_property_bs_balance`: Assets = L + E после любой valid perturbation.
 - `test_property_cash_cascade`: Ending Cash = Beginning + OCF + ICF + FCF.
9. Coverage: `pytest --cov=pipeline/generators --cov-report=html --cov-fail-under=85`.
10. Mutation testing (optional): `mutmut run --paths-to-mutate=pipeline/generators`. Цель: ≥ 70% killed.

**Acceptance:**
- `pip install -r requirements.txt` на чистом venv → все импорты работают.
- `python -m pipeline.run_all` на чистом клоне → success без manual patches.
- `verify.py` → 7/7 pass (включая fix на count).
- coverage ≥ 85%.
- Hypothesis 3 new properties зелёные.

**Верификация:** П5 блок G (pipeline). Механизмы №1, №2, №7, №15, №25, №30.

**ПАУЗА** → «Продолжай Фазу 6».

---

### ФАЗА 6 — ARTEFACTS & PACKAGING (P2, 2 дня)
**Цель:** Новые документы + финальная упаковка v1.1.0.

**Шаги:**

**6.1 Architecture & Methodology Defence Memo (docx, RU)**
- Положение: `deliverables/v1.1/docs/architecture_defence_memo.docx`.
- Разделы:
 1. Anchor-based architecture rationale (NDP=3000 как commitment, а не forecast).
 2. Dual GAAP/NDP framework (зачем две метрики и как их читать).
 3. W3 vs W5 waterfall (что публичное, почему W3 consevative).
 4. MC vs deterministic gap (structural reasons: hit_rate, frontload, regime shift).
 5. Formula-based hybrid choice (живые формулы + invariant-тесты).
 6. Dependencies и voided-by v2.0 future rebuild.
- Форматирование по Правилу #6.

**6.2 Red Team Q&A Playbook (docx, RU)**
- Положение: `deliverables/v1.1/docs/red_team_playbook.docx`.
- Содержит 10 kill-вопросов из `audit/public_v1/findings.xlsx::Red Team Attack` + для каждого:
 - Почему вопрос опасен.
 - Рекомендованный ответ (3–5 предложений, numeric evidence).
 - Fallback если доп. вопросы.
 - Who speaks: CFO / Model Owner / Producer.

**6.3 Remediation Completion Report (docx + xlsx, RU)**
- Положение: `deliverables/v1.1/docs/remediation_completion_report.docx` + `.xlsx`.
- xlsx: 39 findings × колонки Status (Closed/Documented/Deferred), Evidence file/cell, Test name, Verification date, Verifier.
- docx: narrative по каждому блоку (A–G), before/after скрины xlsx для top-10 CRITICAL/HIGH (через LibreOffice headless + imagemagick).

**6.4 Cover Letter template в 3 версиях (docx, RU)**
- Положение: `deliverables/v1.1/cover_letters/`:
 - `cover_letter_PE_fund.docx` — для private equity (риск-доходность, IRR, exit strategy).
 - `cover_letter_strategic.docx` — для стратега (synergies, production capacity, content library).
 - `cover_letter_family_office.docx` — для family office (patient capital, distribution schedule, legacy).
- Все с placeholders `[LP_NAME]`, `[DATE]` для финальной подстановки.

**6.5 Updated Manifest v1.1 (docx)**
- Копия manifest v1.0.2 + CHANGELOG v1.0.2→v1.1 + обновлённые SHA-256 + 34-item self-audit updated (closed/remaining).

**6.6 Capital Stack Document** (входит в `17a_Capital_Stack` в xlsx + visualized в docx memo).

**6.7 Data Room Index (xlsx, RU)**
- Положение: `deliverables/v1.1/data_room_index.xlsx`.
- Columns: File / Type / Purpose / Confidentiality / Last Updated / Owner / LP Access Level.

**6.8 Финальная упаковка:**
- ZIP `TrendStudio_Investor_v1.1.0.zip` в `releases/v1.1.0/`.
- Compute SHA-256 для каждого файла → `releases/v1.1.0/manifest.txt`.
- Git tag `v1.1.0` (annotated с release notes).
- v1.0.2 → git tag `v1.0.2-archive` + zip в `releases/v1.0.2-archive/` (immutable).

**Acceptance:**
- Все 7 артефактов созданы, верстка по Правилу #6.
- ZIP разворачивается, SHA-256 совпадают.
- Git tags видны в remote.
- Манифест описывает delta полностью.

**Верификация:** П5 блок F (cover docs). Механизмы №2, №5, №21, №27, №31, №32.

**ПАУЗА** → «Продолжай Фазу 7».

---

### ФАЗА 7 — FINAL VERIFICATION (П5 «Максимум», 0.5 дня)
**Цель:** Независимая финальная проверка 32/32 П5 перед выдачей.

**Шаги:**
1. Запустить 5 параллельных верификаторов-субагентов:
 - Агент А: блоки A+C (leakage, metadata, xlsx technical).
 - Агент B: блок B (math, IRR, MC).
 - Агент D: блок D (valuation, comps, risk).
 - Агент F: блок F (cover docs, artefacts).
 - Агент G: блок G (pipeline, tests, coverage).
2. Каждый агент возвращает:
 - Checklist 32 механизмов (PASS/FAIL/N/A).
 - List of residual issues.
 - Recommended follow-ups.
3. Сводный отчёт `reports/final_verification_report.md`.
4. Если любой CRITICAL/HIGH → OPEN: вернуться на соответствующую фазу.
5. Если всё PASS: final merge `feature/v1.1-remediation` → `main`, push tags.

**Acceptance:**
- 32/32 механизмов PASS (или явное N/A с обоснованием).
- 0 CRITICAL OPEN.
- 0 HIGH OPEN (или Documented).

---

## 5. ПРАВИЛА И ИНВАРИАНТЫ

### 5.1 Инварианты (НЕЛЬЗЯ нарушать)
- **NDP_ANCHOR = 3000 ±1%** (actual 3000.7).
- **BS Balance = 0** во всех 16 периодах.
- **Cash End 2032 > 0** (сейчас 891.75M).
- **IRR W3 Base ≥ 18%** (hurdle), actual 20.09%.
- **Revenue 3Y = 4545** (sum of segments).
- **Determinism:** seed=42 → идентичные xlsx hashes на повторных запусках.
- **Тесты:** все 287+ прежних + новые regression ВСЕГДА зелёные.

### 5.2 Язык артефактов
- Все новые docx/xlsx — **русский**.
- Финансовые термины дублируем в скобках англ: «IRR (внутренняя норма доходности)», «EBITDA (прибыль до процентов, налогов, амортизации)», «DCF (дисконтированные денежные потоки)».
- Формулы, код, commit messages — английский.

### 5.3 Форматирование docx
По Правилу #6 пользователя:
- A4 книжная, поля: верх/низ 2см, лево 3см, право 1.5см.
- Times New Roman 14pt, по ширине, красная строка 1.5см, межстрочный 1.15, после абзаца 8pt.
- H1 22pt / H2 18pt / H3 16pt, жирный #0070C0.
- Таблицы 12pt, межстрочный 1.0.
- Верхний колонтитул 9pt курсив #999999 справа. Нижний: нумерация 12pt по центру.
- Использовать `rakhman_docs.py` как SSOT для генерации (см. memory `reference_rakhman_docs.md`).

### 5.4 Версионирование
- Semver: v1.0.2 (current) → v1.1.0 (этот релиз).
- Breaking changes запрещены → любые сигнатуры `generators/*.py` сохраняются.
- Новые функции — backward-compatible additions.

### 5.5 Безопасность
- Никаких secrets / credentials / private keys в xlsx/docx/pipeline.
- OOXML metadata стерильна (Author=TrendStudio).
- `.gitignore` содержит: `audit/`, `*.bak`, `releases/*.zip` (если LP-confidential).

### 5.6 Коммуникация с пользователем
- Вопросы ТОЛЬКО через AskUserQuestion (Правило #4 памяти).
- Перед каждой фазой: короткое summary «что сделаю» + acceptance criteria.
- После каждой фазы: Phase Completion Report + пауза.
- Никаких неожиданных решений — если архитектурный выбор выходит за scope промта, останавливайся и спрашивай.

---

## 6. ANTI-PATTERNS (ЧЕГО НЕ ДЕЛАТЬ)

- ❌ **Не трогать** NDP_ANCHOR=3000 как «если модель не сходится, подкрутим anchor».
- ❌ **Не удалять** существующие тесты «потому что старые».
- ❌ **Не вносить** breaking changes в API generators/.
- ❌ **Не заменять** `numpy_financial.irr` на самописные методы.
- ❌ **Не пропускать** паузы между фазами.
- ❌ **Не коммитить** audit/ в публичную ветку без gitignore.
- ❌ **Не использовать** hardcoded paths /Users/noldorwarrior/* в новом коде.
- ❌ **Не фабриковать** peer comps — если нет source, пометить `Indicative + TBD`.
- ❌ **Не писать** artefacts на английском (если пользователь явно не попросит).
- ❌ **Не финализировать** v1.1.0 без П5 «Максимум» 32/32 PASS.

---

## 7. CHECKPOINTS

После каждой фазы — обязательный `reports/phase_N_report.md` с:
- Summary что сделано.
- Закрытые finding IDs.
- Открытые finding IDs (если перенесены).
- Diff before/after (git diff stats + xlsx metric delta).
- pytest results (passed/failed/skipped, runtime).
- Coverage report.
- Рекомендация: «Готов к Фазе N+1» или «Требуется решение по X».

Список обязательных checkpoints (семь):
- ☐ Phase 0 done → leakage = 0 hits.
- ☐ Phase 1 done → IRR unified, MC bias fixed, scenarios consistent.
- ☐ Phase 2 done → MC v2 N=50000, Sobol, bootstrap CI live.
- ☐ Phase 3 done → 4 sheets live formulas, anchor invariant test зелёный.
- ☐ Phase 4 done → Floor/Fair/Ceiling framework + CAPM + sourced comps.
- ☐ Phase 5 done → pipeline clean, coverage ≥ 85%.
- ☐ Phase 6 done → 7 artefacts + ZIP + tags.
- ☐ Phase 7 done → П5 32/32 PASS, merge в main.

---

## 8. НАЧАЛЬНЫЕ ДЕЙСТВИЯ (ПЕРВЫЕ 30 МИН)

1. Clone repo `https://github.com/Noldorwarrior/TrendStudio-Holding.git`.
2. Create branch `feature/v1.1-remediation`.
3. Положить audit files в `audit/public_v1/` + добавить `audit/` в `.gitignore`.
4. Run `pytest -v --tb=short` → зафиксировать baseline (ожидаем 323/328 pass).
5. Run `pipeline/scripts/verify.py` → baseline.
6. Запустить `scripts/leakage_scan.py` (создать если нет) на текущем xlsx → зафиксировать baseline 23 hits.
7. Создать `reports/baseline_state.md` с метриками.
8. **СТОП.** Summary в чат: «Baseline зафиксирован, готов к Фазе 0. Подтверди?»

---

## 9. ФАЙЛЫ ДЛЯ ОБЯЗАТЕЛЬНОГО ЧТЕНИЯ ПЕРЕД РАБОТОЙ

1. `audit/public_v1/executive_summary.docx` — общий verdict.
2. `audit/public_v1/RED_FLAG_MEMO.docx` — P0/P1 urgency.
3. `audit/public_v1/findings.xlsx` sheet `Findings` — все 39.
4. `audit/public_v1/REMEDIATION_ROADMAP.xlsx` sheet `Remediation Roadmap` — все 25 R-items с Acceptance.
5. `audit/public_v1/findings.xlsx` sheets: `By Design`, `Stress Tests`, `Sensitivity & Tornado`, `Red Team Attack`, `Structural Bridges` — дают narrative для Defence Memo.
6. Текущий `pipeline/README.md`, все 8 ADRs, `schemas/`.
7. Memory: `project_investor_model_v102.md`, `project_audit_prompt_investor_public_final.md`, `project_investor_xlsx_fixes_apr2026.md`, `reference_rakhman_docs.md`, `feedback_bundle_workflow.md`.

---

## 10. УСПЕХ — КРИТЕРИИ ВЫХОДА

**FULL PASS достигнут когда:**
- 0 CRITICAL / 0 HIGH finding в статусе OPEN.
- MEDIUM/LOW либо закрыты, либо documented как accepted with rationale.
- П5 «Максимум» 32/32 PASS.
- pytest: 287+ прежних + 40+ новых всё зелёные.
- coverage ≥ 85%.
- xlsx leakage scan = 0 hits.
- 4 live-formula sheets с anchor invariant.
- 7 новых артефактов созданы и отформатированы.
- v1.1.0 tag пушнут, ZIP с SHA-256 manifest.
- Remediation Completion Report подписан как DONE.

**После этого:** готов к formal DD с любым LP.

---

_Версия промта v1.0 от 2026-04-14. Подлежит итерации._
