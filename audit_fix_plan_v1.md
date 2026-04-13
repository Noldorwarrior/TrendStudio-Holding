# План исправлений по результатам аудита TrendStudio v3

**Дата:** 2026-04-13  
**Цель:** Подготовка модели к Due Diligence инвестора  
**Вердикт аудита:** CONDITIONAL PASS → целевой: FULL PASS  
**Верификация:** П5 «Максимум» (все 32 механизма)

---

## Сводка: что исправляем

| Приоритет | Кол-во | Блокирует DD? | Суммарный effort |
|-----------|--------|---------------|------------------|
| P1 (Critical) | 3 находки (F-01, F-02, F-03) | Да | ~12 часов |
| P2 (Major) | 4 находки (F-04, F-05, F-06, F-07) | Да | ~4 часа |
| P3 (Minor) | 4 находки (F-08, F-09, F-10, F-11) + 1 Info (F-12) | Нет | ~2 часа |
| **ИТОГО** | **12 находок** | | **~18 часов** |

---

## ЭТАП 1 — ARCHITECTURAL: Хвост 2029–2032 (P1, блокирует DD)

### FIX-01: Revenue floor от библиотеки контента (F-01, F-03)
**Проблема:** Revenue падает до 150 млн к 2032, а ФОТ растёт до 158.93 → убыток. EBITDA отрицательна в 2031–2032.  
**Решение:**
- В модуле Revenue (pipeline) добавить `revenue_floor` — минимальный доход от библиотеки контента (лицензии, перепродажи прав, VOD-каталог)
- Параметр: ~15–20% от пикового Revenue как floor (обосновать через benchmark российских кинохолдингов)
- Формула: `Revenue[t] = max(revenue_calculated[t], revenue_floor)`

### FIX-02: ФОТ cap при падении выручки (F-01, I-05)
**Проблема:** ФОТ индексируется на инфляцию даже при падении Revenue → ФОТ/Revenue > 100%.  
**Решение:**
- Добавить условие: `if Revenue[t] < Revenue[t-1] * threshold → freeze/reduce ФОТ`
- Параметр threshold: ~0.85 (если Revenue упал >15% — ФОТ замораживается)
- Параметр reduction: ФОТ = min(ФОТ_indexed, Revenue[t] * max_fot_ratio), где max_fot_ratio ≈ 0.70

### FIX-03: DCF ↔ P&L reconciliation (F-02) — Вариант C (согласовано)
**Проблема:** DCF Revenue 1500/1600 vs P&L 380/300 в 2029/2030 — разрыв 4×.  
**Решение (Вариант C — note + renewal сценарий):**
1. Добавить reconciliation note в DCF лист: «DCF моделирует сценарий с обновлением pipeline (новые проекты), P&L Base — текущий pipeline без renewal»
2. Добавить в P&L отдельный сценарий «with pipeline renewal», где Revenue в хвосте соответствует DCF assumptions (~1500/1600)
3. Сценарий renewal: упрощённый — 2–3 новых проекта в 2029–2031, бюджет на уровне текущего среднего
**Effort:** +4–6 часов (итого FIX-03 = ~6 часов)

**Платформа:** Claude Code  
**Обоснование:** Требуется изменение Python-кода pipeline (Revenue, FOT, DCF модули), запуск 348 тестов, rebuild xlsx.

---

## ЭТАП 2 — STRUCTURAL: BS и OOXML (P2, блокирует DD)

### FIX-04: Floor=0 для Content Library и PP&E (F-04, F-05)
**Проблема:** Отрицательные активы в BS 2029–2032 (Content Library до -300, PP&E до -11).  
**Решение:** `asset[t] = max(0, asset_calculated[t])` — актив не может быть ниже нуля.  
**Где:** BS builder в pipeline.

### FIX-05: Loan balance floor (F-06)
**Проблема:** T₁ Loan balance отрицателен 2030–2032 (-853..-1255).  
**Решение:** Пересмотреть механику waterfall — после полного погашения долга, surplus идёт в cash, а не в «отрицательный долг». `loan_balance[t] = max(0, loan_balance[t-1] - repayment[t])`.

### FIX-06: OOXML orphan rels в Public.xlsx (F-07)
**Проблема:** Orphan reference на sharedStrings.xml → может сломать Excel при открытии.  
**Решение:** Удалить orphan relationship из `xl/_rels/workbook.xml.rels` или добавить пустой sharedStrings.xml.

**Платформа:**
- FIX-04, FIX-05 → **Claude Code** (Python pipeline + тесты)
- FIX-06 → **Claude Code** (zip-level surgery, как в предыдущих xlsx-фиксах)

---

## ЭТАП 3 — QUICK WINS: Minor + Info (P3, не блокирует DD)

### FIX-07: Убрать 61 дубль локализации (F-08)
**Проблема:** «ВЫРУЧКА (ВЫРУЧКА)» вместо «ВЫРУЧКА (REVENUE)».  
**Решение:** Regex replace в pipeline: если оригинал уже RU, не дублировать в скобках.  
**Effort:** 30 мин.

### FIX-08: Синхронизировать Cover Letter (F-10)
**Проблема:** Разные даты (11 vs 12 апреля) и версии (v1.0 vs v1.0.1) между Internal и Public.  
**Решение:** Единая дата + версия из config.  
**Effort:** 10 мин.

### FIX-09: Стандартизировать namespace (F-11)
**Проблема:** Internal workbook ns0/ns1 vs Public default xmlns.  
**Решение:** Унифицировать namespace stripping при генерации.  
**Effort:** 15 мин.

### FIX-10: Документировать Internal vs Public различия (F-09)
**Проблема:** 150+ различий в Assumptions не документированы.  
**Решение:** Создать лист «Internal vs Public differences» или отдельный .md.  
**Effort:** 1 час.

### FIX-11: Верхние границы версий (F-12)
**Проблема:** requirements.txt с `>=` без верхних границ.  
**Решение:** Добавить `>=X,<Y` для ключевых зависимостей.  
**Effort:** 10 мин.

**Платформа:** FIX-07..FIX-11 → **Claude Code** (всё в Python pipeline / config файлах)

---

## ЭТАП 4 — Верификация П5 «Максимум»

После внесения всех исправлений:
- Rebuild: `make all` (pipeline → xlsx → tests)
- Верификация П5: все 32 механизма
- Повторный прогон audit scripts (S1–S13)
- Целевой результат: 0 Critical, 0 Major, FULL PASS

---

## Рекомендация по платформе

| Задача | Cowork | Claude Code | Рекомендация |
|--------|--------|-------------|--------------|
| **FIX-01..FIX-05** (Python pipeline) | Нет доступа к make/pytest | Полный доступ к репо, тестам, Git | **Claude Code** |
| **FIX-06** (OOXML surgery) | Можно через Bash | Лучше: zip-level + тесты | **Claude Code** |
| **FIX-07..FIX-11** (pipeline config) | Можно частично | Полный доступ + CI | **Claude Code** |
| **Верификация П5** | Ограниченный sandbox | verify_full.py + 348 тестов | **Claude Code** |
| **Документация** (reconciliation notes, Internal vs Public diff) | Хорошо для .md/.docx | Тоже можно | **Cowork или Code** |

### Итоговая рекомендация: **Claude Code** как основная платформа

**Почему Code, а не Cowork:**
1. Все 11 фиксов затрагивают Python-код pipeline — нужен доступ к репозиторию
2. 348 тестов нужно прогнать после каждого изменения (`make test`)
3. Верификация П5 требует запуска verify_full.py
4. Git workflow: каждый этап = отдельный коммит/ветка
5. Предыдущие xlsx-фиксы (project_investor_xlsx_fixes_apr2026) уже делались через zip-level surgery в Code

**Cowork полезен для:**
- Создания сопроводительной документации (reconciliation note, Internal vs Public diff document)
- Финальной вычитки и оформления Cover Letter
- Анализа результатов (как сейчас — прочитать аудит, согласовать план)

---

## Порядок работы (рекомендуемый)

```
Этап 1  →  Этап 2  →  make test  →  Этап 3  →  make all  →  Этап 4 (П5)
 12ч          4ч        30мин         2ч          1ч           2ч
                                                          ИТОГО: ~21.5ч
```

Между этапами — пауза для согласования результатов.
