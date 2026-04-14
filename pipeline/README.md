# Холдинг Кино «ТрендСтудио» — Финмодель Pipeline

**Версия:** v1.1.0 (Remediation from v1.0.2 audit — 39 findings addressed)
**Архитектура:** L4 (462 автотестов + Pydantic StrictModel + provenance) + N3 (auto-generated navigation + CALLGRAPH)

**Главный инвариант:** `cumulative EBITDA 2026–2028 Base = 3 000 млн ₽ ± 1%` (см. [ADR-001](docs/adr/ADR-001-anchor-invariant-3000-mln-rub.md))

---

## Quick Start

```bash
cd pipeline/
make install      # create venv + install deps
make all          # validate → build → test → verify → nav → manifest
```

Ожидаемое время полного прогона: **3–5 минут**.

Успех: `logs/audit_log.jsonl` содержит запись с `tests_passed: 462, tests_failed: 0`.

---

## Структура

```
pipeline/
├── inputs/           — YAML-входы (single source of truth)
├── schemas/          — Pydantic StrictModel-контракты
├── generators/       — чистые функции (бизнес-логика, включая MC/bootstrap/stage-gate/LHS+copula)
├── tests/            — 462 автотестов (pytest)
├── scripts/          — run_pipeline, build_nav, build_dashboard, build_memo, build_presentation, build_onepager, verify, verify_full
├── navigation/       — компоненты навигационного слоя N3
├── docs/adr/         — Architectural Decision Records (ADR-001…008)
├── artifacts/        — выходы (xlsx, docx, png) — gitignored
└── logs/             — append-only audit + provenance + hash manifest
```

Полная спецификация — в `ARCHITECTURE.md` (уровнем выше в Проекты/Холдинг).
Архитектурные решения с обоснованиями — в [`docs/adr/`](docs/adr/README.md).

---

## Команды Makefile

| Команда | Назначение |
|---|---|
| `make install` | Создать venv и установить зависимости |
| `make validate` | Прогнать Pydantic контракты на `inputs/` |
| `make build` | Собрать xlsx + docx |
| `make test` | Запустить 462 автотестов |
| `make mutation` | Запустить mutation testing (mutmut, ≥85%) |
| `make verify` | Прогнать 32 механизма П3+М2 верификации |
| `make nav` | Перестроить navigation/ из schemas + generators |
| `make manifest` | Обновить hash manifest + audit_log |
| `make all` | Полный цикл всех фаз |
| `make diff` | Сравнить текущий run с предыдущим |
| `make clean` | Очистить artifacts/ (логи не трогаются — append-only) |

---

## Главные правила

1. **Якорь незыблем.** `cumulative_ebitda_2026_2028 ∈ [2 970; 3 030]` для базы. Любое нарушение — падение сборки. См. [ADR-001](docs/adr/ADR-001-anchor-invariant-3000-mln-rub.md).
2. **YAML — единственный источник истины.** Никаких магических чисел в `.py`. См. [ADR-003](docs/adr/ADR-003-pydantic-strictmodel-all-yaml.md).
3. **Pydantic StrictModel (`extra="forbid"`) на каждом слое.** Невалидные данные падают на `make validate`.
4. **Детерминизм через локальные `random.Random(seed)`.** `PYTHONHASHSEED=0`, стабильные SHA-256 между запусками. См. [ADR-008](docs/adr/ADR-008-seed-based-determinism.md).
5. **Provenance + hash manifest.** Каждый прогон создаёт `logs/provenance.json` и `logs/manifest.json` с `combined_hash`. См. [ADR-007](docs/adr/ADR-007-provenance-sha256-hash-manifest.md).
6. **Append-only логи.** `logs/audit_log.jsonl` никогда не переписывается.
7. **Four Monte-Carlo engines:** parametric MC (ADR-004), market block bootstrap (ADR-005), stage-gate binomial tree (ADR-006), LHS+Gaussian copula (ADR-004).

---

## Architectural Decision Records

Все ключевые решения задокументированы в [`docs/adr/`](docs/adr/README.md):

| № | Тема | Версия |
|---|---|---|
| [ADR-001](docs/adr/ADR-001-anchor-invariant-3000-mln-rub.md) | Якорный инвариант 3000 млн ₽ ± 1% | v1.3.0 |
| [ADR-002](docs/adr/ADR-002-l4-n3-pipeline-architecture.md) | L4+N3 архитектура | v1.3.1 |
| [ADR-003](docs/adr/ADR-003-pydantic-strictmodel-all-yaml.md) | Pydantic StrictModel для YAML | v1.3.1 |
| [ADR-004](docs/adr/ADR-004-monte-carlo-cholesky-to-lhs-copula.md) | MC: от Cholesky к LHS + Gaussian copula | v1.4.0 |
| [ADR-005](docs/adr/ADR-005-block-bootstrap-historical-yoy.md) | Block bootstrap исторических YoY | v1.3.8 |
| [ADR-006](docs/adr/ADR-006-stage-gate-binomial-tree-sunk-cost.md) | Stage-gate binomial tree + sunk cost | v1.3.9 |
| [ADR-007](docs/adr/ADR-007-provenance-sha256-hash-manifest.md) | Provenance + SHA-256 manifest | v1.3.1 |
| [ADR-008](docs/adr/ADR-008-seed-based-determinism.md) | Seed-based determinism | v1.3.1 |

Полнота ADR проверяется тестом `tests/test_23_adr_completeness.py`.

---

## Troubleshooting

См. раздел 14 в `ARCHITECTURE.md`.

---

**Версия:** v1.1.0
**Дата:** 14 апреля 2026
**Тесты:** 462/462 PASS
**Верификация:** П5 «Максимум» 32/32 PASS (см. `logs/p5_full_v1_4_4.md`)
