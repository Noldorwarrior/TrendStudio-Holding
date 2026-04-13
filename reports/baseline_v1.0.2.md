# Baseline Report — Investor Public v1.0.2

**Дата:** 2026-04-13
**Ветка:** `claude/remediate-audit-findings-QWitr`
**Цель:** зафиксировать состояние v1.0.2 перед началом ремедиации

---

## 1. Тестовый baseline

| Метрика | Значение |
|---------|----------|
| pytest total | **323 passed, 5 skipped, 0 failed** |
| test_25_memo_build.py | **EXCLUDED** (requires `rakhman_docs` — не в pip) |
| Coverage (generators+scripts) | **39%** total |
| Coverage core generators | monte_carlo 96%, valuation 92%, revenue 94%, pnl 100%, cashflow N/A (in xlsx_builder) |
| Coverage scripts | build_dashboard 97%, verify/verify_full/p5_auto/run_pipeline — **0%** |

### Тесты по модулям
- test_01..test_23: **все PASS**
- test_24_dashboard_build: **PASS** (после установки plotly)
- test_25_memo_build: **SKIP** (rakhman_docs)
- test_26_presentation_build: **PASS** (после установки python-pptx)
- test_27_onepager_build: **PASS**
- test_28_final_bundle: **PASS** (5 skips — gitignored JSON)

---

## 2. Подтверждённые findings (39)

### 2.1 Block C — Leakage (CRITICAL/HIGH) ✅ ПОДТВЕРЖДЕНО

**Investor_Package/investor_model_v1.0_Public.xlsx:**
- **F-001** (CRITICAL): sheet24 (24_Investor_Returns) — ref to "Internal"
- **F-002** (CRITICAL): sharedStrings.xml — **7 occurrences** "Internal"
- **F-003** (CRITICAL): absPath = `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Investor_Package/`
- **F-009** (HIGH): sheet3 (03_Change_Log C30) — "Public export + Internal"
- **F-010** (HIGH): sheet23 (23_Valuation_Multiples B46) — "Base (internal)"
- **F-011** (HIGH): sheet32 (32_Comparable_Transactions) — 3 "internal" annotations

**Корневой investor_model_v1.0_Public.xlsx:**
- 7 "Internal" occurrences (inline strings, no sharedStrings)
- **Нет absPath** (отличие от Investor_Package версии)
- Те же metadata issues

**Дополнительно:** sheet37 (37_Glossary) содержит 1 "Internal" — не в аудите, но нужно очистить

### 2.2 Block A — Metadata ✅ ПОДТВЕРЖДЕНО

- **F-020** (MEDIUM): lastModifiedBy = `a`
- **F-021** (MEDIUM): description leaks anchor `cumulative EBITDA 2026–2028 = 3 000 млн ₽`
- **F-022** (MEDIUM): keywords содержат `L3` (internal classification)
- **F-024** (MEDIUM): email в ячейках (team@trendstudio.ru — нужно проверить отдельно)

### 2.3 Block G — Pipeline ✅ ПОДТВЕРЖДЕНО

- **F-017** (HIGH): hardcoded paths в 3 скриптах:
  - `scripts/build_presentation.py:22` → `_DL = Path("/Users/noldorwarrior/Downloads")`
  - `scripts/build_onepager.py:19` → `_DL = Path("/Users/noldorwarrior/Downloads")`
  - `scripts/build_memo.py:27` → `DOWNLOADS = Path("/Users/noldorwarrior/Downloads")`
  - + build-скрипты в `Investor_Package/` (build_A6, A7, A8)
- **F-018** (HIGH): requirements.txt uses `>=` not `==`
- **F-019** (HIGH): missing deps: plotly, python-pptx, rakhman_docs
- **F-033** (MEDIUM): verify.py:161 — hardcoded `== 14` при `INPUT_FILES` = 18
- **F-038** (LOW): README says "78 tests", actual 323+

### 2.4 Block A — Hygiene ✅ ПОДТВЕРЖДЕНО

- **F-039** (LOW): **27 backup/bak files** + 7 FUSE hidden + 1 lock в `Investor_Package/`

### 2.5 Остальные findings (требуют доп. проверки в последующих фазах)

- F-004, F-005 (CRITICAL): 97.5% static — подтверждается архитектурой openpyxl-генерации
- F-006 (HIGH): IRR methods — нужен анализ build_A11, build_A12, patches
- F-007, F-008 (HIGH): Valuation spread, MC disclosure — подтверждены в промте
- F-012..F-016 (HIGH): Math findings — Phase 1-2
- F-025..F-032 (MEDIUM): Structure/Valuation — Phase 2-5
- F-035..F-037 (LOW): Cosmetic — Phase 6

---

## 3. Файловая структура

| Компонент | Кол-во |
|-----------|--------|
| Листов в Public xlsx | 42 |
| Python build-скриптов (Investor_Package) | 17 |
| Pipeline generators | 23 |
| Pipeline scripts | 15 |
| Pipeline tests | 28 файлов |
| INPUT_FILES (YAML schemas) | 18 |
| Backup/bak файлов в Investor_Package | 27 |

---

## 4. Инварианты (проверено)

| Якорь | Значение | Статус |
|-------|----------|--------|
| NDP | 3000 млн ₽ | ✅ в модели и тестах |
| Hurdle Rate | 18% | ✅ в Assumptions |
| WACC base | 19.05% | ✅ в Valuation DCF |
| Тесты | 323 PASS | ✅ baseline |

---

## 5. Окружение

- Python 3.11.15
- openpyxl 3.1.5, numpy 2.4.4, scipy 1.17.1, pandas 3.0.2
- pytest 9.0.3, hypothesis 6.151.14
- Платформа: Linux 4.4.0 (Claude Code web)

---

## 6. Следующий шаг

**СТОП. Ожидаю approval пользователя для начала Phase 0 — Leakage & Metadata Sterilization.**

Phase 0 будет включать:
1. Написание `pipeline/sterilize.py` для zip-level surgery
2. Очистку всех "Internal" из Public xlsx (кроме "Internal Rate of Return")
3. Удаление absPath из workbook.xml
4. Стерилизацию metadata (core.xml)
5. Удаление backup/bak/FUSE файлов
6. Фикс verify.py (14 → len(INPUT_FILES))
7. 10+ новых тестов
