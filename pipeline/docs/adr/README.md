# Architectural Decision Records (ADR)

Этот каталог содержит формальные записи архитектурных решений, принятых при разработке финансовой модели холдинга «ТрендСтудио» (v1.3.x – v1.4.x).

## Формат

Каждый ADR следует формату **Michael Nygard** с расширением для количественного сравнения опций:

1. **Status** — Proposed | Accepted | Deprecated | Superseded
2. **Context** — ситуация, силы, ограничения
3. **Decision** — что именно выбрано
4. **Options Considered** — альтернативы с таблицей оценок (Complexity / Cost / Scalability / Team familiarity)
5. **Trade-off Analysis** — обоснование выбора с явным сравнением
6. **Consequences** — что становится проще / сложнее / что пересматривать
7. **Action Items** — чек-лист реализации

## Список ADR

| № | Название | Статус | Версия | Тема |
|---|---|---|---|---|
| [001](ADR-001-anchor-invariant-3000-mln-rub.md) | Якорный инвариант 3000 млн ₽ ± 1% | Accepted | v1.3.0 | Базовая верифицируемость модели |
| [002](ADR-002-l4-n3-pipeline-architecture.md) | Архитектура L4+N3 | Accepted | v1.3.1 | Разделение inputs/schemas/generators/artifacts + provenance |
| [003](ADR-003-pydantic-strictmodel-all-yaml.md) | Pydantic StrictModel для YAML | Accepted | v1.3.1 | Строгие контракты на входы через `extra="forbid"` |
| [004](ADR-004-monte-carlo-cholesky-to-lhs-copula.md) | MC: от Cholesky к LHS + Gaussian copula | Accepted | v1.4.0 | Корректная копула для half-normal delay + variance reduction |
| [005](ADR-005-block-bootstrap-historical-yoy.md) | Block bootstrap исторических YoY | Accepted | v1.3.8 | Сохранение кризисно-восстановительных пар |
| [006](ADR-006-stage-gate-binomial-tree-sunk-cost.md) | Stage-gate binomial tree + sunk cost | Accepted | v1.3.9 | Реалистичная воронка производства 12 фильмов |
| [007](ADR-007-provenance-sha256-hash-manifest.md) | Provenance + SHA-256 manifest | Accepted | v1.3.1 | Content-addressable воспроизводимость |
| [008](ADR-008-seed-based-determinism.md) | Seed-based detereminism | Accepted | v1.3.1 | Явные локальные `Random(seed)` + `PYTHONHASHSEED=0` |

## Граф зависимостей решений

```
ADR-001 (anchor invariant)
    ↓ требует верифицируемости
ADR-002 (L4+N3 architecture)
    ↓ поддерживается
ADR-003 (pydantic contracts) ─┬─ ADR-007 (provenance)
                              └─ ADR-008 (determinism)
                                   ↓
                          ADR-004 (LHS + copula MC)
                          ADR-005 (block bootstrap)
                          ADR-006 (stage-gate tree)
```

ADR-001 (якорь) — фундаментальное требование, из которого растёт вся архитектура. ADR-002 (L4+N3) — структурный ответ на это требование. ADR-003, 007, 008 — поддерживающие механизмы (контракты, провенанс, детерминизм). ADR-004, 005, 006 — специализированные методологические решения для оценки рисков.

## Как добавлять новые ADR

1. Скопировать шаблон из любого существующего (рекомендуется ADR-003 — самый компактный).
2. Назвать файл `ADR-NNN-kebab-case-title.md`, где `NNN` — следующий свободный номер с лидирующими нулями.
3. Заполнить все 7 обязательных секций (проверяется `tests/test_23_adr_completeness.py`).
4. Добавить строку в таблицу выше.
5. При необходимости обновить граф зависимостей.

## Как отменять или заменять ADR

- **Deprecated**: статус меняется на `Deprecated`, в конце добавляется секция `## Replacement` с ссылкой на заменяющий ADR.
- **Superseded**: то же + в новом ADR добавляется `**Supersedes:** ADR-NNN`.

Никогда не удаляем старый ADR — история решений важна для аудита.
