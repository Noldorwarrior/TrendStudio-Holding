# ПРОМТ: Полный технический аудит системы финмоделей ТрендСтудио

> **Версия промта:** v3.1 FINAL
> **Исполнитель:** Claude (самоаудит в Cowork — Read/Write/Edit + sandbox bash)
> **Приоритет блоков:** A = B = C = D = E (все равнозначны)
> **Scope xlsx:** v3 (полный аудит) + v1.0 (дельта/регрессия)
> **Артефакты Pipeline:** проверять все B1–B4
> **Толеранс:** стандартный (дельта > 0.1% = находка; для BS/Cash/Control = строго 0)
> **Эталон Internal vs Public:** оба равнозначны; расхождение = баг
> **Ошибки скриптов:** auto retry (2 попытки) + fallback на ручной анализ
> **Выход:** xlsx (7 листов: Findings + Summary + Roadmap + Improvements + DD Readiness + By Design + Script Results)

---

## Роль и мандат

Ты — независимый технический аудитор. Проведи полный аудит финансовых моделей холдинга «ТрендСтудио» по пяти блокам:

- **A** — система сборки и инфраструктура Pipeline (Python-код, тесты, ADR, документация, безопасность)
- **B** — техническое состояние xlsx-файлов (OOXML, формулы, структура, локализация)
- **C** — математика и логика внутри каждой финмодели (Revenue, Cost, P&L→CF→BS, Debt, Waterfall, DCF, MC, Tax, WC)
- **D** — кросс-сверка Pipeline ↔ Investor Package
- **E** — мета-аудит verify_full.py (аудит аудитора — 32 механизма П5 «Максимум»)

**Аудит — read-only.** Ничего не модифицировать. При обнаружении критического бага — немедленно сообщать.

---

## ⚠️ Приоритетные подозрения (проверить ПЕРВЫМИ)

Три известных зоны риска — проверить до начала системного аудита:

1. **ФОТ/Revenue в хвосте 2029–2032:** ФОТ/Revenue достигает 106% в 2032. Возможный баг в going-concern допущении — ФОТ растёт, Revenue падает.

2. **DCF vs P&L хвост:** DCF going-concern использует Rev 1500/1600 млн, а P&L хвост показывает 380/300/220/150. Расхождение может означать ошибку в terminal value или DCF использует отдельные допущения, не связанные с P&L.

3. **Кумулятивный эффект XML-патчей:** Многочисленные раунды ZIP/XML surgery (v1.0→v1.0.2→v3, плюс BS floor fix, cash sync, OOXML fixes). Могли накопиться ошибки: битые ссылки, orphan elements, namespace inconsistencies.

---

## Контекст проекта

### Pipeline (v1.4.4)
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/pipeline/`
- **Архитектура L4:** `inputs/` (YAML SSOT) → `schemas/` (Pydantic StrictModel extra="forbid") → `generators/` → `artifacts/`
- **MC-движки (4):** Naive Cholesky, LHS+Gaussian Copula, Block Bootstrap, Stage-Gate binomial tree
- **Якорь:** cumulative EBITDA 2026–2028 Base = 3 000 млн ₽ ± 1%
- **Тесты:** 348 (345 + 4 skipped в клоне), `make all` ≈ 3–5 мин
- **Детерминизм:** seed-based, PYTHONHASHSEED=0, изолированные RNG
- **Provenance:** SHA-256 manifest, audit_log.jsonl, provenance.json
- **ADR:** docs/adr/ADR-001..008 (якорь, L4+N3, Pydantic, MC→LHS, bootstrap, stage-gate, provenance, determinism)
- **Артефакты B1–B4:** dashboard (html+xlsx+5 PNG), pptx+html презентация, memo docx, one-pager docx
- **Скрипты:** run_pipeline.py, verify_full.py (32 механизма П5), build_*.py, Makefile

### Investor Package (v3.0 — основной scope)
- **Путь:** `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **Файлы v3:** `investor_model_v3_Internal.xlsx` (inlineStr), `investor_model_v3_Public.xlsx` (sharedStrings)
- **Файлы v1.0:** `investor_model_v1.0_Internal.xlsx`, `investor_model_v1.0_Public.xlsx` (для diff)
- **Листов:** 41 (Cover → Executive Summary)
- **Проекты:** 7 (5 фильмов: Родные стены 250, Два сердца 200, Ночной патруль 300, Время героев 250, Сказка наяву 200; 2 сериала: Северный ветер 350, Горизонт событий 300) = 1 850 млн ₽
- **Dual metric:** GAAP EBITDA 2076.1 + legacy NDP 3000
- **Two-tier GM:** Films 55.8%, Series 47%, blended ~53.8%
- **ВКЛ:** лимит 500, 16%, лаг инкассации 1 кв, Σ3Y=28.18 млн
- **Технология патчинга:** ZIP/XML surgery (lxml + zipfile), safe_serialize, namespace stripping
- **Бэкапы:** .bak (initial), .bak2 (BS floor fix), .bak3 (cash sync)

### Утилиты
- **rakhman_docs.py:** `/Users/noldorwarrior/Downloads/rakhman_docs.py` (DocxBuilder/PptxBuilder/XlsxBuilder)
- **build_A5_cf_bs.py:** генератор CF/BS с W₃ waterfall priority

---

## Методология

### Шаг 0: Построение карты проекта
Перед началом аудита — исследовать структуру:
1. `ls -R pipeline/` → построить дерево файлов
2. Прочитать все YAML-файлы в `inputs/` → список ключей и значений
3. Прочитать `Makefile` → DAG таргетов
4. Открыть xlsx → mapping всех 41 листов (имя, диапазон данных, тип содержимого)
5. Сохранить карту в `audit_project_map.json`

### Принципы работы
1. **Этапный режим с ТОЧКАМИ ПАУЗЫ:** завершить блок → сохранить промежуточный xlsx → показать результаты → получить подтверждение → следующий блок
2. **Скриптовая верификация:** для каждой критической проверки — написать Python-скрипт, запустить, зафиксировать stdout/stderr
3. **Auto retry + fallback:** если скрипт упал — починить (до 2 попыток), если не вышло — ручной анализ + пометка «manual fallback»
4. **Двойной расчёт:** ключевые метрики (IRR, EBITDA, NDP, BS balance, Cash chain) пересчитывать независимо
5. **Не доверять кэшам:** формулы пересчитывать программно
6. **Оба файла:** Internal и Public — оба эталонны, расхождение = баг
7. **Толеранс:** дельта > 0.1% = находка (severity зависит от метрики); для BS/Cash/Control = строго 0

### Сохранение прогресса между сессиями
При каждой ТОЧКЕ ПАУЗЫ сохранять:
- `audit_findings_WIP.xlsx` — текущие находки
- `audit_progress.json` — какие блоки/подблоки завершены, время, количество проверок
- `audit_scripts/` — все написанные скрипты (для повторного использования)

В новой сессии: загрузить `audit_progress.json`, прочитать `audit_findings_WIP.xlsx`, продолжить с места остановки.

---

## Автоматические скрипты (обязательные)

Claude ОБЯЗАН написать и запустить следующие скрипты. Все сохранять в `audit_scripts/`.

### СКРИПТ 1: `ooxml_integrity.py`
Открыть каждый xlsx как zip. Проверить: все rels targets существуют, нет orphan calcChain, namespace consistency (stripped vs full xmlns), нет смешения sharedStrings/inlineStr в одном файле.
→ Вывод: JSON `{file, issue, severity}`

### СКРИПТ 2: `formula_audit.py`
Для каждой ячейки каждого листа: есть формула → пересчитать → сравнить с cached value. Найти: stale cache, hardcoded-where-formula-expected, Internal≠Public.
→ Вывод: JSON `{file, sheet, cell, formula, cached, recalculated, delta_pct, status}`

### СКРИПТ 3: `bs_balance_check.py`
Для каждого из 16 периодов (Q1'26..Q4'28 + 2029..2032): Assets = L + E (толеранс = 0). Cash(BS) = EndingCash(CF) (толеранс = 0). Control row = 0.
→ Вывод: JSON `{period, assets, liabilities_equity, delta, cash_bs, cash_cf, delta_cash, control}`

### СКРИПТ 4: `irr_moic_recompute.py`
Извлечь cash flows из waterfall. Пересчитать IRR (numpy_financial.irr / scipy.optimize). Пересчитать MOIC = total_dist / total_invest. Сравнить с 24.75% / 2.13×.
→ Вывод: JSON `{metric, model_value, recomputed, delta, status}`

### СКРИПТ 5: `cross_system_reconcile.py`
Извлечь якорные метрики из Pipeline YAML + xlsx. Сравнить: Revenue 4545, EBITDA, NDP 3000, Budget 1850, IRR, MOIC.
→ Вывод: JSON `{metric, pipeline_value, investor_value, delta_pct, status}`

### СКРИПТ 6: `pipeline_determinism.py`
`make clean && make all` × 2 → SHA-256 всех артефактов → сравнить.
→ Вывод: JSON `{artifact, sha256_run1, sha256_run2, match}`

### СКРИПТ 7: `test_coverage.py`
`pytest --cov` с отчётом. Классификация тестов. Модули без покрытия.
→ Вывод: JSON `{module, coverage_pct, uncovered_lines, test_count, test_types}`

### СКРИПТ 8: `artifact_data_check.py`
Извлечь числа из dashboard.html, pptx, docx (B1–B4). Сравнить с моделью.
→ Вывод: JSON `{artifact, metric, artifact_value, model_value, match}`

### СКРИПТ 9: `mc_convergence.py`
Для каждого MC-движка: n=100, 500, 1000, 2000. Проверить сходимость mean, стабилизацию VaR. Корреляционная матрица — positive semi-definite.
→ Вывод: JSON `{engine, n, mean, std, var95, var99, psd_check}`

### СКРИПТ 10: `v3_v1_regression.py`
Якорные метрики v3 vs v1.0. Намеренные vs. регрессионные изменения. Остаточные артефакты от 12 проектов в v3.
→ Вывод: JSON `{metric, v1_value, v3_value, delta_pct, expected, regression_flag}`

### СКРИПТ 11: `localization_check.py`
Все ячейки с текстом: найти непереведённые EN-метрики, дубли «КЛЮЧЕВЫЕ ВЫВОДЫ (КЛЮЧЕВЫЕ ВЫВОДЫ)», проверить формат «EN (RU)».
→ Вывод: JSON `{file, sheet, cell, text, issue}`

### СКРИПТ 12: `tax_wc_chain.py`
Tax: ставки, налоговая база, Tax→P&L→CF chain. WC: days assumptions, дебиторка/кредиторка/запасы, WC→CF impact, NDP preservation.
→ Вывод: JSON `{check, expected, actual, delta, status}`

### СКРИПТ 13: `verify_full_meta_audit.py`
Прочитать verify_full.py. Для каждого из 32 механизмов: проверить логику ассерта — нет ли false PASS (тривиальный assert, неправильный threshold, неполное покрытие).
→ Вывод: JSON `{mechanism_id, mechanism_name, logic_ok, issues}`

---

## БЛОК A: Система сборки и инфраструктура (Pipeline)

### A.1 Архитектура и зависимости
- DAG зависимостей: inputs → schemas → generators → artifacts — корректность
- Циклические зависимости, мёртвый код, неиспользуемые модули
- Pinning зависимостей (requirements.txt / pyproject.toml)
- Coupling/cohesion модулей

### A.2 Pydantic-схемы
- `extra="forbid"` на всех моделях
- Валидаторы: бизнес-ограничения (≥0, диапазоны, типы)
- Схемы без тестов
- Backward compatibility: загрузка старых YAML

### A.3 YAML-входы (SSOT)
- YAML vs. фактическое использование — неиспользуемые поля
- Хардкоды в генераторах, которые должны быть в YAML
- Консистентность единиц (млн ₽ vs. ₽ vs. тыс. ₽)

### A.4 Детерминизм (СКРИПТ 6)
- `make all` × 2 → побитово идентичные артефакты
- Все seed/RNG: изолированные экземпляры
- PYTHONHASHSEED=0

### A.5 Provenance и аудитный след
- SHA-256 manifest: все артефакты покрыты
- audit_log.jsonl: фиксирует все изменения
- provenance.json: полная цепочка «вход → выход»

### A.6 Makefile
- Идемпотентность таргетов
- Время каждого этапа
- `make clean && make all` без ошибок
- CI-пригодность (абсолютные пути, GUI-зависимости)

### A.7 Тесты (СКРИПТ 7)
- Пирамида: unit / integration / e2e / smoke
- Coverage по модулям
- Качество: нет ли `assert True`, тестов без ассертов
- Хрупкость: конкретные числа vs. инварианты
- 4 skipped — почему, можно ли починить

### A.8 ADR (все 8)
- Прочитать каждый ADR
- Проверить: код соответствует решениям
- Найти drift: код ушёл от ADR без обновления документа

### A.9 Документация
- README: актуальность, покрытие
- Docstrings: наличие, соответствие коду
- Inline-комментарии: не устарели ли

### A.10 Безопасность (базовая)
- YAML: safe_load vs. unsafe_load
- Path traversal в inputs
- `pip audit` — известные уязвимости зависимостей
- Нет ли credentials/secrets в коде

### A.11 Git-история (базовая)
- `git log --oneline` — нет ли force push, подозрительных откатов
- `git status` — uncommitted / untracked изменения в якорных файлах
- `git diff HEAD` — если есть unstaged changes, зафиксировать

### A.12 Авто-навигация (N3) и CALLGRAPH
- N3 навигация: актуальна ли (соответствует текущей структуре модулей)
- CALLGRAPH: отражает ли реальные вызовы (нет ли phantom/orphan узлов)
- Проверить: `make nav` (или аналог) генерирует идентичный результат

### A.13 Отчёты П5 — drift check
- Прочитать `logs/p5_full_v1_4_4.md` и `logs/p5_auto_v1_4_3.md`
- Проверить: выводы отчётов соответствуют текущему состоянию модели
- Если модель менялась после генерации отчёта — зафиксировать drift

---

**🔴 ТОЧКА ПАУЗЫ после Блока A**
Сохранить `audit_findings_WIP.xlsx` + `audit_progress.json`. Показать результаты. Ждать подтверждения.

---

## БЛОК B: Техническое состояние xlsx-файлов

### B.1 OOXML-целостность (СКРИПТ 1)
- XML-ошибки при парсинге
- sharedStrings vs. inlineStr — нет ли смешения
- calcChain.xml — orphan-ссылки
- relationships (.rels) — все targets существуют
- Namespace: stripped vs. full xmlns

### B.2 Формулы vs. кэши (СКРИПТ 2)
- Каждый лист: формулы / хардкоды / ratio
- Stale cache
- «Мёртвые» ячейки: должна быть формула, стоит хардкод
- Internal↔Public sync: полная сверка

### B.3 Структура листов
- Карта 41 листов: диапазон данных, merged cells, hidden rows/cols
- Пустые листы, заглушки, незавершённые
- Данные за пределами визуальной области

### B.4 Стили и форматирование
- Числовые форматы: единообразие
- Conditional formatting: конфликты
- Print areas / page breaks

### B.5 Бэкапы
- Инвентаризация .bak* файлов
- Git-статус (tracked / ignored / modified)
- Рекомендация: что безопасно удалить

### B.6 Регрессионный diff v3 vs v1.0 (СКРИПТ 10)
- Намеренные изменения (7 проектов, two-tier GM, ВКЛ interest)
- Возможные поломки (формулы, ссылки от старых 12 проектов)
- Остаточные артефакты v1.0 в v3

### B.7 Локализация EN→RU (СКРИПТ 11)
- Все метрики переведены
- Нет дублей типа «КЛЮЧЕВЫЕ ВЫВОДЫ (КЛЮЧЕВЫЕ ВЫВОДЫ)»
- Формат «English (Русский)» единообразен
- Непереведённые остатки

---

**🔴 ТОЧКА ПАУЗЫ после Блока B**

---

## БЛОК C: Математика и логика

### C.1 Revenue Model
- Revenue shares (38/28/15/12/7) → сумма = 100%
- Revenue waterfall по кварталам — нет ли double-counting
- CAGR consistency
- Тайминг фильмов vs. revenue recognition

### C.2 Cost Model
- FOT-индексация ×1.08 — единообразно
- OPEX % split = 100% в каждом периоде
- Content Pipeline: Σ 7 проектов = 1 850 млн ₽
- Two-tier GM: Films 55.8%, Series 47%, blended 53.8% — пересчёт
- CAPEX 5%/45%/35%/15%

### C.3 P&L → CF → BS (СКРИПТ 3)
- Сквозная сверка: Revenue → P&L → CF → BS
- NI + Depreciation + WC changes = Operating CF
- **BS balance: Assets = L + E во ВСЕХ 16 периодах (толеранс = 0)**
- **Cash(BS) = EndingCash(CF) во всех периодах (толеранс = 0)**
- **Control row = 0 во всех периодах**

### C.4 Debt и Interest
- ВКЛ dynamic interest: лимит 500, 16%, лаг 1 кв
- Interest (P&L) = Interest (CF)
- Debt balance (BS) = Debt schedule
- Пиковые кварталы Q3'26 / Q2'27

### C.5 Waterfall и Cap Table (СКРИПТ 4)
- W₃ priority: 1× LiqPref + 8% coupon + 60/40 split
- Σ distributions = available cash
- **IRR 24.75% — независимый пересчёт**
- **MOIC 2.13× — independent**

### C.6 Valuation
- DCF WACC 19%
- Terminal value methodology + growth rate
- Comps: мультипликаторы, peer group
- Dual-year EV: FY2027 6806 + FY2028 3597 → midpoint 5201.6

### C.7 Monte Carlo (СКРИПТ 9)
- 4 движка: сходимость
- Корреляционная матрица: PSD
- VaR95/VaR99: квантили
- Breach probability
- Stage-Gate: P(greenlight)

### C.8 Sensitivity и Stress-test
- Matrix 27 (3×3×3): все 27 точек
- Tornado: top drivers
- Stress-тесты vs. accounting identity

### C.9 Tax (СКРИПТ 12)
- Ставки налога на прибыль (текущие для РФ)
- Льготы (если есть) — обоснование
- Налоговая база = EBT
- Tax → P&L → CF chain: сквозная корректность
- Deferred tax (если моделируется)

### C.10 Working Capital (СКРИПТ 12)
- Days assumptions: AR days, AP days, inventory days — реалистичность для кино
- WC расчёт: ΔAR + ΔInventory − ΔAP = WC changes
- WC → CF impact: корректность
- WC → NDP preservation: WC/Gov compensation (232.6→323.9)

### C.11 Going Concern (хвост 2029–2032) ⚠️ ПРИОРИТЕТ
- DCF going-concern (Rev 1500/1600) vs. P&L (380/300/220/150) — **обосновано ли расхождение**
- **ФОТ/Revenue ≤ 100%** (отмечено 106% в 2032)
- Index mapping: [0..11]=Q1'26..Q4'28, [12..15]=2029..2032

---

**🔴 ТОЧКА ПАУЗЫ после Блока C**

---

## БЛОК D: Кросс-сверка Pipeline ↔ Investor Package (СКРИПТ 5)

### D.1 Якорные метрики
| Метрика | Pipeline | xlsx | Допуск |
|---------|----------|------|--------|
| Revenue 3Y | YAML | S7 | 0% |
| EBITDA 3Y | artifacts | S9 | ≤ 0.1% |
| NDP | YAML | S17/S18 | 0% |
| Budget | YAML | S8 | 0% |
| IRR | artifacts | S17/S18 | ≤ 0.1 п.п. |
| MOIC | artifacts | S17/S18 | ≤ 0.01× |

### D.2 Структурная согласованность
- Количество проектов, названия, тайминги
- Временные горизонты: Q1'26–Q4'28 + 2029–2032

### D.3 Артефакты vs. модель (СКРИПТ 8)
- Dashboard (B1): EBITDA, VaR, MC means
- Презентация (B2): ключевые числа на слайдах
- Memo (B3): цифры в тексте
- One-pager (B4): summary metrics

### D.4 Методологическая согласованность
- MC параметры: Pipeline = xlsx
- Sensitivity ranges: Pipeline = xlsx
- WACC / discount rates: Pipeline = xlsx

---

## БЛОК E: Мета-аудит verify_full.py (СКРИПТ 13)

### E.1 Полнота покрытия
- Все 32 механизма П5 присутствуют
- Нет ли механизмов, которые проверяют тривиальные условия (always PASS)

### E.2 Корректность логики
- Для каждого механизма: правильно ли определён PASS/FAIL
- Правильные ли thresholds
- Нет ли false PASS (тест проходит, но реальная проблема не обнаружена)

### E.3 Покрытие данных
- Все ли листы/периоды/файлы проверяются
- Нет ли hardcoded paths / values, которые устареют при изменении модели

---

**🔴 ТОЧКА ПАУЗЫ после Блоков D+E**

---

## Формат выхода: `audit_findings.xlsx`

### Лист «Findings»
| ID | Блок | Подблок | Severity | Статус | Находка | Доказательство | Ожидание | Факт | Δ% | Уверенность | Рекомендация | Приоритет | Скрипт |
|----|------|---------|----------|--------|---------|----------------|----------|------|----|-------------|--------------|-----------|--------|

**Severity:** Critical (нарушает целостность модели) / Major (влияет на метрики) / Minor (косметика/оптимизация) / Info (наблюдение)
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
Рекомендации по улучшению (не баги, а best practices):
| ID | Блок | Область | Текущее состояние | Рекомендация | Effort | Impact | Приоритет |

### Лист «DD Readiness»
Готовность к due diligence глазами внешнего аудитора/инвестора:
| Категория | Статус | Red Flags | Вероятные вопросы инвестора | Рекомендация по подготовке |

Категории: Financial Integrity, Model Transparency, Audit Trail, Documentation, Assumptions Defensibility, Sensitivity to Key Inputs, Code Quality

### Лист «By Design»
Находки, которые являются осознанными компромиссами, а не багами:
| ID | Блок | Находка | Обоснование (by design) | Риск если не пересмотреть | Рекомендация |

Пример: округлённые коэффициенты индексации (1.17 вместо 1.1664, Δ ±0.3%) — design decision, но может накапливаться на горизонте.

### Лист «Script Results»
- Сводка всех 13 скриптов: время, PASS/FAIL/WARNING, количество проверок
- Ошибки скриптов и fallback-действия

---

## Правила выполнения

1. **Шаг 0 первым:** построить карту проекта перед любыми проверками
2. **Приоритетные подозрения:** проверить 3 зоны риска ДО системного аудита
3. **Этапный режим:** блок → ТОЧКА ПАУЗЫ → подтверждение → следующий блок
4. **Скрипты сначала:** автоматические скрипты до ручного анализа
5. **Auto retry:** если скрипт упал — 2 попытки фикса, потом ручной fallback
6. **Read-only:** ничего не модифицировать в проверяемых файлах
7. **Каждая находка с доказательством:** файл, лист, ячейка, числа
8. **v1.0 — только diff:** полный аудит v3, для v1.0 — регрессия
9. **Скрипты сохранять:** все 13 → `audit_scripts/`
10. **Прогресс сохранять:** `audit_findings_WIP.xlsx` + `audit_progress.json` при каждой паузе
11. **Критические баги:** сообщать немедленно

---

## Контрольный чеклист (самопроверка аудитора)

По завершении ВСЕХ блоков:

- [ ] Три приоритетных подозрения проверены
- [ ] IRR пересчитан независимо (СКРИПТ 4)
- [ ] BS balance проверен во всех 16 периодах (СКРИПТ 3)
- [ ] Cash chain CF→BS во всех периодах (СКРИПТ 3)
- [ ] Оба файла Internal + Public проверены (СКРИПТ 2)
- [ ] `make clean && make all` выполнен (СКРИПТ 6)
- [ ] Детерминированность подтверждена (СКРИПТ 6)
- [ ] MC-сходимость проверена (СКРИПТ 9)
- [ ] Кросс-сверка Pipeline↔xlsx выполнена (СКРИПТ 5)
- [ ] Артефакты B1–B4 проверены (СКРИПТ 8)
- [ ] v3 vs v1.0 diff выполнен (СКРИПТ 10)
- [ ] Локализация проверена (СКРИПТ 11)
- [ ] Tax + WC chain проверены (СКРИПТ 12)
- [ ] verify_full.py мета-аудит выполнен (СКРИПТ 13)
- [ ] Все 8 ADR проверены на drift
- [ ] Документация проверена на актуальность
- [ ] Базовая безопасность проверена
- [ ] DD Readiness оценка составлена
- [ ] Git-история проверена на аномалии
- [ ] N3 навигация и CALLGRAPH проверены
- [ ] Отчёты П5 (v1.4.3, v1.4.4) проверены на drift
- [ ] Все 13 скриптов запущены
- [ ] xlsx-отчёт `audit_findings.xlsx` сформирован со всеми 7 листами
- [ ] Top-10 рисков приоритизированы
