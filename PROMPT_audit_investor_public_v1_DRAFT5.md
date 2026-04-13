# ПРОМТ: Полный DD-grade аудит Investor Model v1.0 Public
**Версия промта:** v5.0 DRAFT
**Платформа запуска:** Claude Code (с субагентами-верификаторами, параллельной проверкой блоков A/B/C/D/E/F/G, автоматизированными Python-скриптами)
**Scope:** `investor_model_v1.0_Public.xlsx` (основной) + `investor_model_v1.0_Internal.xlsx` (эталон) + сопроводительные документы (Cover Letter, методологическая записка, README, assumptions log, pitch deck, teaser, term sheet draft) + `audit_scripts/` (собственная архитектура аудита)
**Приоритет блоков:** A = B = C = D = E = F = G (все равнозначны)
**Толеранс:** стандартный (>0.1% = находка; для BS/Cash/Control = строго 0; для precision = machine epsilon)
**Бюджет:** без ограничений — глубина > скорости
**Цель:** (1) передача инвестору, (2) внутренний QA, (3) регуляторная проверка
**Верификация:** Полная П5 «Максимум» (32 механизма)
**Ошибки скриптов:** auto retry (2 попытки) + fallback
**Выход:** 4 файла (findings.xlsx / exec_summary.docx / RED_FLAG_MEMO.docx / REMEDIATION_ROADMAP.xlsx)

---

## Роль и мандат

Независимый финансовый аудитор **DD-grade** (bulge bracket, 15+ лет DD медиахолдингов РФ) + Python-инженер + **red-team VC-партнёр** (скептичный).

Проведи **полный аудит** `investor_model_v1.0_Public.xlsx` по **семи блокам**:

- **A** — техническое состояние xlsx (OOXML, формулы, локализация, version control)
- **B** — математика и логика (Revenue, Cost, P&L→CF→BS, Debt/Covenants, Waterfall+Investor Rights, Cap Table, DCF, MC, Tax, WC, Unit Economics, Accounting Identity, Logic Tests 4-типа, **Precision & Rounding**, **Arguments Coherence**, **Logical Fallacies**, **Red-Team**, **Sensitivity 2×/3× + Tornado**, **Structural Bridges**)
- **C** — сверка Public ↔ Internal
- **D** — Investor Readiness (стресс-тесты, peer multiples+cohort+regulatory, ESG, exit scenarios NPV)
- **E** — Going Concern 2029–2032
- **F** — Cover docs & Documentation (полный DD pitch deck / term sheet / teaser / disclaimers)
- **G** — **Технический аудит инфраструктуры аудита** (архитектура `audit_scripts/`, качество кода, tech debt, воспроизводимость, **производительность/профайлинг, тестовое покрытие/CI, security/SAST, документация/maintainability**)

Аудит — **read-only** для модели; **`audit_scripts/` аудирует сам себя** (Блок G).

---

## ⚠️ Приоритетные подозрения (ПЕРВЫМИ)

1. **Утечка Internal-данных в Public** (hidden, #REF!, docProps, defined names)
2. **Рассогласование якорей** (Revenue/EBITDA/NDP/Budget/GM/ВКЛ должны совпадать 1:1)
3. **Кумулятивный эффект XML-патчей** (битые rels, orphan calcChain, stale cache)
4. **Going Concern аномалии** (ФОТ/Revenue 106%, DCF Rev 1500 vs P&L 380→150)

---

## Контекст проекта

### Investor Package v1.0
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **Файлы:** `investor_model_v1.0_Public.xlsx` + `investor_model_v1.0_Internal.xlsx` + сопроводительные
- **Якоря Public:** IRR W₃=20.09% | MC IRR=11.44% | Revenue 3Y=4 545 | EBITDA 3Y GAAP=2 076.1 | NDP=3 000 | Budget=1 850 (7 проектов) | GM 55.8/47 | ВКЛ Σ3Y=28.18
- **Waterfall:** W₃ (1× LiqPref + 8% coupon + 60/40)
- **Патчи:** v1.0 → v1.0.1 → v1.0.2

### Утилиты
- `rakhman_docs.py`: `/Users/noldorwarrior/Downloads/rakhman_docs.py`
- `build_A5_cf_bs.py`

---

## Методология

### Шаг 0: Карта Public
Mapping листов, visibility, diff с Internal, граф зависимостей формул → `audit_public_v1_map.json`

### Принципы (Claude Code)
1. **Этапный режим с ПАУЗАМИ:** блок → WIP xlsx → подтверждение
2. **Субагенты параллельно:** A, B, C, D, E, F, G
3. **Скрипты:** Python + stdout/stderr в `audit_scripts/`
4. **Auto retry:** 2 попытки, потом fallback
5. **Двойной расчёт:** IRR, EBITDA, NDP, BS, Cash, Cap Table, Covenants, MC — независимо + параллельно 2–3 методами
6. **Не доверять кэшам**
7. **Internal = эталон** для якорей
8. **Толеранс:** >0.1% = находка; BS/Cash/Control = 0; precision = ε
9. **Триангуляция:** benchmarks 2+ источника

---

## Автоматические скрипты (34 шт.)

### БЛОК A: xlsx-техника
**С1: `ooxml_integrity_public.py`** — rels, calcChain, namespace, sharedStrings/inlineStr
**С2: `formula_audit_public.py`** — формула→пересчёт, stale cache, #REF!
**С3: `version_git_hygiene.py`** — .bak*, git status/log, .gitignore

### БЛОК B: финмодель
**С4: `bs_balance_check_public.py`** — 16 периодов, Assets=L+E, Cash(BS)=EndingCash(CF), Control=0
**С5: `irr_moic_recompute_public.py`** — IRR W₃, MOIC, сверка 20.09%
**С6: `accounting_identity_check.py`** — GAAP/IFRS/RAS, revenue recognition, lease, content cap
**С7: `covenant_compliance_public.py`** — Debt/EBITDA ≤4x, ICR ≥2.5x, DSCR ≥1.25x
**С8: `unit_economics_per_project.py`** — 7 проектов, ранжирование
**С9: `mc_convergence_public.py`** — сходимость n=100..2000, PSD, VaR
**С9-deep: `mc_independent_reproduction.py`** — 10 000+ прогонов независимо, KS/AD tests
**С10: `tax_wc_chain_public.py`** — ННП 20%, Tax chain, WC days, NDP preservation

#### Logic Tests (4 типа)
**С11-logic: `logic_chain_causality.py`** — Revenue→EBITDA→FCF→NDP→IRR трассировка
**С11-bound: `logic_chain_boundary.py`** — 0, экстремумы, отрицательные
**С11-meta: `logic_chain_metamorphic.py`** — масштабирование, инварианты
**С11-manual: `logic_chain_manual_verify.py`** — ручная сверка 3–5 ячеек (IRR, EBITDA 3Y, NPV, ВКЛ Σ, Debt/EBITDA пик)

#### Precision & Rounding ⚠️ НОВЫЙ БЛОК
**С25-precision: `precision_and_floating_point.py`** ⚠️ НОВЫЙ — точность:
- **Float vs Decimal:** проверка что в ключевых расчётах (IRR, NPV, Waterfall, Cap Table) накопление ошибки <10⁻⁶ за 16 периодов
- **Floating-point error propagation:** сравнение float64 vs decimal.Decimal для критичных сумм
- **Накопление в протяжке:** кумулятивная ошибка при формулах типа `=A1*1.08` протянутых 16 раз
- **Epsilon check:** 0.0 vs 1e-15 в BS balance / Cash chain (должно быть машинный 0)
- **Excel-specific:** IEEE 754 особенности Excel, 15-digit precision limitation
- **Summing order:** Kahan summation для длинных сумм (NDP 3000, EBITDA 2076.1)

**С25-rounding: `rounding_policy_consistency.py`** ⚠️ НОВЫЙ — политика округления:
- **Round-at-end vs intermediate:** где ROUND() применено в формулах, где нет
- **Consistency по всей модели:** одинаковая политика во всех листах
- **Presentation vs calculation:** округление в ячейках-displays не должно влиять на вычисления
- **Banker's rounding vs standard:** HALF_EVEN vs HALF_UP
- **Валютные округления:** до млн ₽, до тыс ₽, до единиц — единая ли политика
- **Percentages rounding:** 55.8% vs 0.558 vs 0.5580000001

**С25-cross: `cross_sheet_reconciliation.py`** ⚠️ НОВЫЙ — межлистовая точность:
- **Revenue Detail → Revenue Summary → P&L:** бит в бит, для каждого из 16 периодов, для каждого из 7 проектов
- **P&L → Cash Flow:** EBITDA → Net Income → Operating CF
- **Cash Flow → Balance Sheet:** Ending Cash (CF) → Cash (BS)
- **Debt Schedule → BS:** Debt по периодам — полное совпадение
- **Tax calc → P&L → CF:** ННП Σ совпадает всюду
- **DCF inputs → DCF sheet:** Revenue/EBITDA из P&L идентичны inputs DCF
- **Waterfall → IRR sheet:** cash flows инвестора идентичны
- Результат: матрица «откуда→куда» с δ на каждом переносе

**С25-backsolve: `back_solve_verification.py`** ⚠️ НОВЫЙ — обратная реконструкция:
- **Из IRR 20.09% → cash flows инвестора:** восстановить через корни полинома, сверить с waterfall
- **Из EBITDA GAAP 2076.1 → Revenue−Costs:** декомпозировать обратно
- **Из NPV DCF → Revenue по годам:** обратное дисконтирование
- **Из MOIC → размер exit:** реконструкция exit value
- **Из covenant Debt/EBITDA → max допустимый Debt** в пиковом квартале
- Если обратная реконструкция не даёт исходный input — где-то циркулярность или ошибка

#### Arguments Coherence ⚠️ НОВЫЙ БЛОК
**С26-chain: `argument_chain_market_to_irr.py`** ⚠️ НОВЫЙ — цепочка утверждений:
- **Market opportunity (TAM/SAM/SOM)** → **our penetration** → **Revenue assumptions** → **Cost structure** → **EBITDA** → **Valuation** → **IRR**
- Для каждого звена: явное обоснование + источник + численный переход
- Проверка: если TAM сдвинуть ±20% — как изменится IRR (chain sensitivity)
- Weak links — шаги с наибольшей неопределённостью

**С26-sources: `assumption_source_traceability.py`** ⚠️ НОВЫЙ — прослеживание источников:
- Для каждого ключевого допущения:
  - GM 55.8% / 47% ← источник (peer / historical / expert)
  - WACC 19% ← CAPM decomposition (Rf ОФЗ, β, ERP, country premium, small-cap)
  - Revenue shares 38/28/15/12/7 ← обоснование структуры окон
  - FOT 8% индексация ← Росстат CPI прогноз
  - Terminal growth ← МЭР/ЦБ долгосрочный прогноз ВВП
  - LiqPref 1× + 8% coupon ← market terms Series A/B РФ
  - Anti-dilution ← market precedent
- **Missing sources** — красный флаг
- **Weak sources** (1 источник, anecdotal) — warning
- **Strong sources** (≥2 независимых, triangulated) — pass

**С26-consistency: `internal_consistency_cross_docs.py`** ⚠️ НОВЫЙ — внутренняя консистентность:
- **Cover Letter vs xlsx:** EBITDA, IRR, Revenue, NDP, Budget — совпадают?
- **Pitch deck vs xlsx:** каждая цифра на слайдах
- **Teaser vs xlsx:** ключевые метрики
- **Term sheet vs xlsx:** условия waterfall соответствуют W₃
- **Методологич. записка vs xlsx:** WACC, параметры MC, Revenue shares
- **README vs реальность:** версия, changelog актуальны
- **Формат дат:** единообразие (Q1'26 vs 1Q26 vs 2026-Q1)
- **Валюта:** млн ₽ / тыс ₽ / $ — единообразие

**С26-argranking: `arguments_strength_ranking.py`** ⚠️ НОВЫЙ — сильный/слабый:
- Ранжирование всех аргументов инвест-кейса по силе (1 = сильнейший, N = слабейший)
- Факторы силы: (a) triangulated sources, (b) historical data backing, (c) peer benchmark, (d) quantified impact, (e) low uncertainty
- **Strongest 3** — подсветить для pitch
- **Weakest 3** — красные флаги, подготовить защиту
- «Silver bullet» vs «House of cards» оценка overall

#### Logical checks ⚠️ НОВЫЙ БЛОК
**С27-sanity: `sanity_checks_mass.py`** ⚠️ НОВЫЙ — sanity checks:
- GM < 100% | ROI < 1000% | Payback > 0 | Debt/EBITDA < 10× | ICR > 0
- WACC > Rf (должно быть) | Terminal growth < WACC (обязательно)
- Revenue > 0 во всех периодах (кроме явного run-off)
- Tax rate = 20% (ННП РФ) стабильно
- Shares Σ = 100% (точно)
- CAPEX ≤ Revenue (типично)
- NWC days в пределах 30–180
- Валютные суммы правдоподобны (млрд ₽ vs млн ₽)
- IRR ≤ 200% (если больше — подозрительно)

**С27-parallel: `parallel_calculation_methods.py`** ⚠️ НОВЫЙ — параллельные методики:
- **IRR:** numpy_financial.irr vs scipy.optimize.brentq vs ручной bisection vs NPV=0 поиск
- **NPV:** прямое дисконтирование vs формула аннуитета (где применима)
- **EBITDA:** top-down (Revenue − COGS − OPEX) vs bottom-up (сумма по проектам)
- **BS Assets:** прямая сумма vs Equity + Liabilities
- **Cash:** из CF cumulative vs из BS diff
- **Covenants:** ratio вручную vs формулы в модели
- **MOIC:** total distributions / invested
- Все методы должны сойтись в ε = 1e-6

**С27-fallacies: `logical_fallacies_scan.py`** ⚠️ НОВЫЙ — логические ошибки:
- **Circular reasoning:** Revenue justify WACC, WACC justifying valuation, valuation justifying Revenue
- **Survivorship bias в peers:** выбраны только успешные компании
- **Cherry-picking benchmarks:** peers выбраны чтобы показать наш результат в лучшем свете
- **Hindsight bias:** проецирование прошлого успеха в будущее
- **Anchoring:** зависимость ключевых чисел от одного «якоря» без триангуляции
- **Correlation ≠ causation** в MC correlations
- **Extrapolation without limits:** линейный рост в бесконечность
- **Availability bias:** упоминание только «громких» успехов рынка
- **Sunk cost fallacy:** аргументы о невозвратных затратах
- Для каждого — найденные примеры + severity

**С27-redteam: `red_team_vc_attack.py`** ⚠️ НОВЫЙ — red-team режим:
- Сымитировать скептичного VC-партнёра (Tier-1 фонд)
- **Kill question scan:** какой ОДИН вопрос убьёт сделку?
- **Weakest narrative link:** где story breaks
- **Hidden assumption probe:** что подразумевается но не сказано
- **Uncomfortable numbers:** какие цифры VC захочет оспорить
- **Founder risk:** концентрация на команде, bus factor
- **Tech risk:** зависимость от спец. технологий, поставщиков
- **Market risk:** «рынок может схлопнуться потому что X»
- **Regulatory surprise:** что может прилететь из Минкульта/ФНС
- **Competitor move:** что если Яндекс/VK/Окко запустят аналог
- **Exit risk:** может ли компания вообще выйти на IPO в РФ 2029–2030
- Вывод: **10 самых неприятных вопросов** VC + рекомендуемые ответы

#### Sensitivity & Bridges ⚠️ НОВЫЙ БЛОК
**С29-sens: `sensitivity_2d_3d_tornado.py`** ⚠️ НОВЫЙ — многофакторная чувствительность:
- **2-way sensitivity tables:** WACC × g (terminal growth), WACC × EBITDA margin, Revenue growth × COGS%, Debt × ICR
- **3-way sensitivity:** WACC × g × EBITDA margin → IRR/NPV/Valuation; heatmap по срезам
- **Tornado diagram:** вклад каждого драйвера в IRR (Rev±20%, FOT±15%, WACC±3пп, CAPEX±25%, Terminal±1пп, MC correl±0.2, FX±30%, hit rate±15пп)
- **Spider/web chart:** радиальное представление чувствительности
- **Break-even поиски:** при каком значении драйвера IRR = WACC / EBITDA = 0 / Debt/EBITDA = 4×
- **Elasticity matrix:** dIRR/dX для каждого ключевого X
- Результат: xlsx с heatmap + список «top-5 драйверов риска»

**С29-bridges: `structural_breakdown_bridges.py`** ⚠️ НОВЫЙ — структурные брейкдауны:
- **Revenue bridge** 2026→2027→2028: Volume Δ + Price Δ + Mix Δ + New projects Δ = Total Δ
- **EBITDA bridge:** Revenue Δ − COGS Δ − OPEX Δ − FOT Δ − D&A Δ = EBITDA Δ; по периодам
- **Cash bridge:** CFO + CFI + CFF → Net cash Δ; компоненты по периодам
- **Valuation bridge:** DCF vs Multiples vs Internal W₅ — decomposition по драйверам различий
- **Debt bridge:** new debt − repayments − amort = Δ Debt; квартально
- **NWC bridge:** ΔAR + ΔInventory − ΔAP = ΔNWC; с OCF влиянием
- **From Internal to Public bridge:** IRR 24.75% → 20.09% — вклад каждого изменения (waterfall W₅→W₃, liq pref, coupon change, 60/40 split)
- Waterfall-графики (matplotlib bridge chart style) в отдельной вкладке

### БЛОК C: Public↔Internal
**С12: `public_vs_internal_reconcile.py`** — якорные метрики
**С13: `public_leakage_check.py`** ⚠️ КРИТИЧНЫЙ

### БЛОК D: Investor Readiness
**С14: `stress_tests_investor.py`** — 6 шок-сценариев
**С15: `cap_table_dilution.py`** — founders/inv/ESOP, dilution scenarios
**С16: `investor_rights_waterfall.py`** — anti-dilution, ratchet, tag/drag, div policy, cash waterfall, pay-off Best/Base/Worst
**С17: `exit_scenarios_npv.py`** — IPO/M&A/MBO/Secondary/Run-off Expected NPV
**С18: `peer_benchmarking_multiples.py`** — EV/EBITDA, EV/Sales, P/E, PEG; implied value range
**С19: `peer_cohort_roi.py`** — бюджет vs касса РФ 2020–2025, hit rate
**С20: `peer_regulatory_risks.py`** — Фонд кино, Минкульт, ФНС, санкции, льготы
**С21: `esg_country_risk.py`** — ESG + Russia premium

### БЛОК E: Going Concern
**С22: `going_concern_tail_public.py`** — FOT cap + Revenue floor + reconciliation + 2 сценария

### БЛОК F: Cover docs
**С24: `cover_docs_full_dd.py`** — Cover Letter + методологич + README + assumptions log + pitch deck + term sheet + teaser + disclaimers

### Локализация
**С23: `localization_check_public.py`** — EN→RU

### БЛОК G ⚠️ НОВЫЙ: Технический аудит инфраструктуры аудита
**С28-arch: `audit_architecture_review.py`** ⚠️ НОВЫЙ — эффективность архитектуры:
- **Структура `audit_scripts/`:** логичность группировки по блокам
- **Модульность:** общие функции вынесены в `utils.py`? (openpyxl loaders, формула-парсеры)
- **Import graph:** нет циклических зависимостей
- **Повторное использование:** сколько кода дублируется между скриптами
- **Конфигурация:** хардкоды vs `config.yaml` / environment variables
- **Test coverage:** есть ли unit-тесты на критичные функции (IRR, BS balance)
- **Logging:** единый формат, уровни, ротация
- **Error handling:** консистентный try/except, не тихие fallback
- **CLI design:** единый argparse, --help информативен
- **Parallel execution:** какие скрипты могут запускаться параллельно (Task tool subagents)

**С28-quality: `code_quality_audit_scripts.py`** ⚠️ НОВЫЙ — качество кода:
- **PEP 8:** flake8/ruff check всех скриптов
- **Type hints:** покрытие mypy
- **Docstrings:** каждая функция документирована
- **Magic numbers:** минимизированы (константы именованы)
- **Function length:** нет функций >50 строк без декомпозиции
- **Complexity:** cyclomatic complexity < 10 (radon)
- **Security:** нет `eval`, `exec`, hardcoded credentials
- **Determinism:** random seeds фиксированы для воспроизводимости
- **Performance:** нет очевидных O(n²) где можно O(n)

**С28-reproducibility: `reproducibility_check.py`** ⚠️ НОВЫЙ — воспроизводимость:
- **requirements.txt** с pinned версиями (openpyxl==, numpy==, scipy==, pandas==)
- **Python version:** явно указана (3.11+)
- **OS independence:** скрипты работают на macOS/Linux/Windows
- **File path:** нет хардкод-путей, все через args / env
- **Deterministic outputs:** повторный запуск даёт тот же результат (hash diff)
- **Seed management:** все RNG с seed
- **Environment file:** `.env.example` если нужны креды

**С28-techdebt: `tech_debt_scan.py`** ⚠️ НОВЫЙ — технический долг:
- TODO / FIXME / HACK / XXX в коде
- Dead code (unused imports, unreachable branches)
- Deprecated API calls (openpyxl старые методы)
- Outdated dependencies vs latest stable
- Отсутствие обработки known edge cases
- Бэкап-файлы (.bak, .old, .orig) в audit_scripts — их не должно быть

**С30-perf: `performance_profiling.py`** ⚠️ НОВЫЙ — производительность и профайлинг:
- **cProfile** на каждый скрипт audit_scripts/: cumtime, ncalls, top-20 функций
- **line_profiler** на «горячих» функциях (IRR, MC, bridge calcs)
- **memory_profiler** — пиковое потребление памяти (для больших xlsx и MC 10 000+)
- **Wall-clock time** по каждому скрипту: ожидаемое vs фактическое, SLA
- **I/O profile:** время на чтение xlsx (openpyxl read_only), запись findings
- **Bottleneck map:** какие функции съедают >20% времени
- **Parallelization potential:** какие блоки пригодны для multiprocessing/Task subagents
- **Memory leaks:** проверка через tracemalloc snapshots
- **Vectorization opportunities:** pandas/numpy вместо python loops
- Результат: отчёт «Performance profile» + рекомендации по оптимизации (≥20% speedup где возможно)

**С30-tests: `test_coverage_ci.py`** ⚠️ НОВЫЙ — тестовое покрытие + CI:
- **pytest coverage (coverage.py):** line coverage ≥80% по критичным (IRR, BS balance, covenants, waterfall)
- **Unit tests:** для каждой чистой функции (минимум happy path + 2 edge cases)
- **Integration tests:** end-to-end запуск скрипта на sample xlsx
- **Regression tests:** золотые выходы, сравнение через diff
- **Mutation testing (mutmut / cosmic-ray):** mutation score ≥60% для критичных модулей
- **Property-based testing (hypothesis):** инварианты (BS=0, Σshares=1, IRR монотонность)
- **Snapshot tests:** findings.xlsx не меняется на стабильных inputs
- **CI pipeline (GitHub Actions / GitLab CI):** lint + type + tests + coverage + security на каждый commit
- **Test execution time:** полный прогон <5 мин, critical tests <30 сек
- **Flaky tests detection:** повторный прогон ×5, должен быть стабилен
- Результат: coverage report HTML + список непокрытых функций + CI-конфиг шаблон

**С30-security: `security_scan_audit_scripts.py`** ⚠️ НОВЫЙ — безопасность:
- **bandit:** SAST-сканер для Python (B101-B999)
- **safety / pip-audit:** CVE по зависимостям (openpyxl, numpy, scipy, pandas)
- **detect-secrets / trufflehog:** поиск hardcoded credentials, tokens, API keys
- **Injection risks:** eval/exec/subprocess с unsafe args
- **Path traversal:** проверка os.path.join на user-controlled inputs
- **YAML/pickle deserialization:** только safe_load, никакого pickle с untrusted
- **XML entity expansion:** defusedxml для openpyxl/xml parsers
- **Логирование:** нет утечки PII/секретов в логи
- **File permissions:** output files не 777
- Результат: security report + CVSS-оценка находок + remediation per finding

**С30-docs: `documentation_maintainability.py`** ⚠️ НОВЫЙ — обслуживаемость и документация:
- **README.md:** installation, usage, inputs/outputs, troubleshooting
- **CHANGELOG.md:** semver, per-release изменения
- **Inline-docs:** docstrings + type hints в каждой функции
- **API reference:** sphinx/pdoc3 authogenerated
- **RUNBOOK.md:** как запускать полный аудит, частые ошибки, восстановление
- **ARCHITECTURE.md:** диаграмма модулей, data flow findings, точки расширения
- **ONBOARDING.md:** новый аудитор за ≤1 день запускает полный прогон
- **Bus factor analysis:** кто ОДИН сможет поддерживать инфру — если <2, красный флаг
- **Комментарии по WHY, а не WHAT** в сложных местах
- Результат: documentation score (0–100) + список missing docs + рекомендации

---

## БЛОК A: xlsx-техника
A.1 OOXML (С1) | A.2 Формулы (С2) | A.3 Структура | A.4 Стили | A.5 Git (С3) | A.6 Локализация (С23) | A.7 Leakage (С13)

🔴 **ПАУЗА**

---

## БЛОК B: Математика и логика

### B.1 Revenue | B.2 Cost | B.3 P&L→CF→BS (С4)
### B.4 Debt/Interest | B.5 Covenants (С7) | B.6 Waterfall/IRR (С5)
### B.7 Investor Rights (С16) — anti-dilution/ratchet/tag/drag/div policy/cash waterfall
### B.8 Cap Table (С15) | B.9 Valuation DCF+Comps | B.10 Monte Carlo (С9/С9-deep)
### B.11 Sensitivity | B.12 Tax+WC (С10) | B.13 Unit Economics (С8) | B.14 Accounting Identity (С6)

### B.15 Logic Tests 4 типа
B.15.1 Причинно-следственные (С11-logic)
B.15.2 Граничные (С11-bound)
B.15.3 Метаморфические (С11-meta)
B.15.4 Ручная сверка 3–5 ячеек (С11-manual)

### B.16 Precision & Rounding ⚠️ НОВЫЙ
B.16.1 Float/Decimal, floating-point (С25-precision)
B.16.2 Rounding policy consistency (С25-rounding)
B.16.3 Cross-sheet reconciliation (С25-cross)
B.16.4 Back-solve verification (С25-backsolve)

### B.17 Arguments Coherence ⚠️ НОВЫЙ
B.17.1 Chain Market→IRR (С26-chain)
B.17.2 Assumption↔Source traceability (С26-sources)
B.17.3 Internal consistency cross-docs (С26-consistency)
B.17.4 Arguments strength ranking (С26-argranking)

### B.18 Logic Meta-checks ⚠️ НОВЫЙ
B.18.1 Sanity checks mass (С27-sanity)
B.18.2 Parallel calculation methods (С27-parallel)
B.18.3 Logical fallacies scan (С27-fallacies)
B.18.4 Red-team VC attack (С27-redteam)

### B.19 Sensitivity 2×/3× + Tornado ⚠️ НОВЫЙ
B.19.1 2-way sensitivity tables (WACC×g, WACC×EBITDA margin, Rev×COGS)
B.19.2 3-way sensitivity (WACC×g×EBITDA margin)
B.19.3 Tornado diagram — top-5 драйверов IRR
B.19.4 Break-even поиски + elasticity matrix (С29-sens)

### B.20 Structural Breakdowns / Bridges ⚠️ НОВЫЙ
B.20.1 Revenue bridge (Volume/Price/Mix/New)
B.20.2 EBITDA bridge (компоненты период-к-периоду)
B.20.3 Cash/Debt/NWC bridges
B.20.4 Valuation bridge DCF↔Multiples↔Internal; Internal W₅ → Public W₃ bridge (С29-bridges)

🔴 **ПАУЗА**

---

## БЛОК C: Public↔Internal

### C.1 Якорные 1:1
| Метрика | Public | Internal | Допуск |
|---|---|---|---|
| Revenue 3Y | 4 545 | 4 545 | 0% |
| EBITDA 3Y GAAP | 2 076.1 | 2 076.1 | ≤0.1% |
| NDP | 3 000 | 3 000 | 0% |
| Budget | 1 850 | 1 850 | 0% |
| GM | 55.8/47 | 55.8/47 | 0% |
| ВКЛ Σ3Y | 28.18 | 28.18 | ≤0.1% |

### C.2 By Design
IRR 20.09% (W₃) vs 24.75% (W₅ V-D); MC 11.44% vs 13.95%; структура waterfall.

### C.3 Структурная согласованность | C.4 Полнота скрытия | C.5 Leakage (С13)

🔴 **ПАУЗА**

---

## БЛОК D: Investor Readiness

### D.1 Financial Integrity | D.2 Model Transparency
### D.3 Peer Benchmarking (С18/С19/С20)
- Market multiples
- Cohort ROI РФ
- Regulatory risks

### D.4 Stress-tests 6 сценариев (С14)
| Сценарий | Шок | ΔIRR | BS | Covenant |
|---|---|---|---|---|
| Рецессия | Rev −20% | ? | ? | ? |
| Инфляция | FOT +15% | ? | ? | ? |
| Ставки | WACC +3 пп | ? | ? | ? |
| Регулятор | NDP отмена | ? | ? | ? |
| Коробка | Провал фильма | ? | ? | ? |
| FX | Рубль −30% | ? | ? | ? |

### D.5 Sensitivity | D.6 ESG + Country Risk (С21)
### D.7 Exit Scenarios NPV (С17)
### D.8 Red Flags | D.9 Вопросы инвестора

🔴 **ПАУЗА**

---

## БЛОК E: Going Concern 2029–2032 (С22)
E.1 Диагностика | E.2 Рекомендации (FOT cap + Revenue floor + reconciliation + 2 сценария) | E.3 Проверка | E.4 EBITDA в хвосте

🔴 **ПАУЗА**

---

## БЛОК F: Cover docs полный DD (С24)
F.1 Cover Letter | F.2 Методологич | F.3 README | F.4 Assumptions log | F.5 Requirements
F.6 Pitch Deck DD (структура, narrative, психология, цифры, forward-looking, визуал)
F.7 Term Sheet DD (соответствие W₃, anti-dilution, pro-rata, vesting, ESOP, info rights, jurisdiction)
F.8 Teaser DD
F.9 Disclaimers & Legal

🔴 **ПАУЗА**

---

## БЛОК G ⚠️ НОВЫЙ: Технический аудит инфраструктуры `audit_scripts/`

### G.1 Architecture review (С28-arch)
Модульность, import graph, config, test coverage, logging, parallelism.

### G.2 Code quality (С28-quality)
PEP 8, type hints, docstrings, complexity, security, determinism.

### G.3 Reproducibility (С28-reproducibility)
requirements pinned, Python version, OS-indep, deterministic outputs, seeds.

### G.4 Tech debt (С28-techdebt)
TODO/FIXME, dead code, deprecated APIs, outdated deps, .bak в scripts.

### G.5 Performance & Profiling ⚠️ НОВЫЙ (С30-perf)
cProfile / line_profiler / memory_profiler, bottleneck map, parallelization potential, vectorization opportunities, memory leaks.

### G.6 Test coverage + CI ⚠️ НОВЫЙ (С30-tests)
pytest coverage ≥80% критичных путей, unit/integration/regression/mutation/property-based tests, CI pipeline, flaky-detection, execution time SLA.

### G.7 Security ⚠️ НОВЫЙ (С30-security)
bandit / safety / pip-audit / detect-secrets; injection / path traversal / deserialization / XML entity; PII в логах; file permissions.

### G.8 Documentation & Maintainability ⚠️ НОВЫЙ (С30-docs)
README / CHANGELOG / RUNBOOK / ARCHITECTURE / ONBOARDING; docstrings + type hints; API reference; bus factor ≥2; WHY-комментарии.

🔴 **ПАУЗА**

---

## Верификация — П5 «Максимум» (32 механизма)
Фактологические (1,2,6,7) | Числовые (3,4,20,23) | Документные (5,8,9,21,22,24,25,26,29,32) | Логические (10–17,30) | Источники (18,19,28) | Аудитория (27,31)

Блок «Результаты П5» с уровнем уверенности по каждому блоку.

---

## Формат выхода

### 1. `audit_public_v1_findings.xlsx` (14 листов)
1. **Findings** — все находки
2. **Summary** — блок×severity, вердикт, Top-10
3. **Roadmap** — Quick/Structural/Architectural
4. **Improvements** — best practices
5. **DD Readiness** — 12 категорий
6. **By Design** — осознанные компромиссы
7. **Stress-tests** — 6 сценариев
8. **Peer Benchmarks** — multiples + cohort + regulatory
9. **Script Results** — сводка 34 скриптов
10. **Arguments Ranking** — сильнейшие/слабейшие аргументы
11. **Red-Team Attack** — 10 самых неприятных вопросов VC + ответы
12. **Sensitivity & Tornado** ⚠️ НОВЫЙ — 2×/3× таблицы + tornado drivers
13. **Structural Bridges** ⚠️ НОВЫЙ — Revenue/EBITDA/Cash/Valuation bridges
14. **Infra Tech Report** ⚠️ НОВЫЙ — perf/coverage/security/docs audit_scripts/

### 2. `audit_public_v1_executive_summary.docx` (3–5 стр.)
A4, TNR 14pt, H1 22pt #0070C0, поля 3/1.5/2/2 см.
- Вердикт + светофор 7 блоков
- Топ-5 критичных
- Going Concern
- DD Readiness
- Roadmap до FULL PASS
- П5 результаты

### 3. `audit_public_v1_RED_FLAG_MEMO.docx` (1 стр)
Critical Red Flags (до 10): описание + severity + immediate action.

### 4. `audit_public_v1_REMEDIATION_ROADMAP.xlsx`
| ID | Категория | Описание | Priority (P0/P1/P2/P3) | Severity | Ответственный | Effort (h) | Срок | Зависимости | Платформа | Критерий приёмки | Статус |

---

## Правила выполнения

1. Шаг 0: карта Public
2. 4 приоритетных подозрения ДО системного
3. Этапный с ПАУЗАМИ + субагенты параллельно
4. Скрипты сначала
5. Auto retry: 2 попытки
6. Read-only для модели; G-блок аудирует `audit_scripts/`
7. Находки с доказательством
8. Internal — эталон
9. Триангуляция 2+ источника
10. Точный перенос чисел/дат/имён
11. Скрипты → `audit_scripts/` (34)
12. Прогресс → WIP xlsx + progress.json
13. Критические — немедленно
14. Docx дефолт (A4, TNR 14pt, H1 22pt #0070C0)
15. 4 файла выхода

---

## Критерии приёмки (Definition of Done)

- [ ] 4 приоритетных подозрения проверены
- [ ] Все 7 блоков с ПАУЗАМИ
- [ ] Все 34 скрипта запущены
- [ ] 4 типа logic tests
- [ ] Precision & Rounding (4 подпункта: float/decimal, rounding, cross-sheet, back-solve)
- [ ] Arguments Coherence (4 подпункта: chain, sources, consistency, ranking)
- [ ] Logical meta (4 подпункта: sanity, parallel, fallacies, red-team)
- [ ] MC независимо 10 000+
- [ ] 6 stress-тестов
- [ ] Peer multiples + cohort + regulatory
- [ ] Exit scenarios NPV (5 вариантов)
- [ ] Cap table + dilution
- [ ] Investor rights (anti-dilution, tag/drag, div, cash waterfall)
- [ ] Covenant compliance Q3'26/Q2'27
- [ ] Unit economics 7 проектов
- [ ] Accounting identity
- [ ] ESG + country risk
- [ ] Going Concern (FOT cap + floor + reconciliation + 2 сценария)
- [ ] Cover docs full DD (7 подпунктов)
- [ ] **Технический аудит `audit_scripts/`** (architecture + quality + reproducibility + tech debt + **performance/profiling** + **test coverage/CI** + **security/SAST** + **documentation/maintainability**)
- [ ] Sensitivity 2×/3× + Tornado diagram (С29-sens)
- [ ] Structural bridges Revenue/EBITDA/Cash/Debt/NWC/Valuation + Internal→Public bridge (С29-bridges)
- [ ] Performance profile (cProfile / memory_profiler / bottleneck map)
- [ ] Test coverage ≥80% критичных путей + CI pipeline шаблон
- [ ] Security scan (bandit + safety + detect-secrets) — 0 High/Critical
- [ ] Documentation (README + RUNBOOK + ARCHITECTURE + ONBOARDING) + bus factor ≥2
- [ ] IRR 20.09% independent (3 метода)
- [ ] BS balance 16 периодов (0)
- [ ] Cash chain CF→BS (0)
- [ ] Public vs Internal якоря 1:1
- [ ] Leakage пройдена
- [ ] **Red-team VC атака: 10 неприятных вопросов + ответы**
- [ ] **Arguments strongest/weakest ранжированы**
- [ ] П5 «Максимум» 32 механизма
- [ ] 4 файла выхода
- [ ] Top-10 рисков
- [ ] Вердикт PASS/CONDITIONAL/FAIL
- [ ] Effort-оценка до FULL PASS

---

## Ожидаемый результат

4 файла (findings 14 листов + exec summary 3–5 стр + red flag memo 1 стр + remediation roadmap xlsx) + `audit_scripts/` (34 скрипта, сам себя проверяющих через блок G: арх/качество/tech debt/воспроизводимость + перформанс/тесты/CI/security/docs). Уровень **DD-grade + Red-team battle-tested + Infrastructure-hardened**.
