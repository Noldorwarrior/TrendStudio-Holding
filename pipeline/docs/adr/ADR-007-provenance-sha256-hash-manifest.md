# ADR-007: Provenance + SHA-256 hash manifest для воспроизводимости артефактов

**Status:** Accepted
**Date:** 2026-02-25 (v1.3.1)
**Deciders:** ведущий разработчик, аудитор, CFO

## Context

L4+N3 архитектура (ADR-002) постулирует, что каждый артефакт должен быть привязан к конкретным входам и версии кода. Без этой привязки:

- Аудитор не может ответить на вопрос «какая модель сгенерировала этот отчёт?».
- При расхождении между версиями отчёта невозможно определить, что изменилось: входные данные, код, или seed.
- Воспроизведение результата трёхмесячной давности требует полной реконструкции среды (включая random state).
- Два одинаковых `model.xlsx` могут отличаться по содержимому (round-trip через Excel меняет метаданные).

### Силы

- **Content-addressable integrity**: артефакт должен быть идентифицируем по своему хешу, а не по имени файла.
- **Traceability**: для каждого артефакта — полный список входов с их хешами.
- **Minimal overhead**: вычисление хеша не должно замедлять пайплайн больше, чем на 5%.
- **Hermetic reproducibility**: один и тот же код на одном и том же YAML всегда должен давать один и тот же артефакт (с точностью до timestamp в metadata).

## Decision

Внедрить **двухуровневую систему provenance**:

### Level 1 — `logs/provenance.json`

Генерируется в начале каждого прогона `run_pipeline.py`. Содержит:

```json
{
  "timestamp": "2026-04-11T16:18:32Z",
  "git_commit": "77f6c0e",
  "pipeline_version": "v1.4.0",
  "python_version": "3.10.12",
  "seed": 42,
  "inputs": [
    {
      "path": "inputs/macro.yaml",
      "sha256": "a1b2c3...",
      "size_bytes": 2134,
      "last_modified": "2026-04-10T22:15:01Z"
    },
    ...
  ],
  "environment": {
    "platform": "Linux-5.15",
    "python_hash_seed": "0"
  }
}
```

Реализовано в `generators/provenance.py::build_provenance`.

### Level 2 — `logs/manifest.json`

Генерируется в конце прогона после создания всех артефактов. Содержит:

```json
{
  "timestamp": "2026-04-11T16:18:38Z",
  "artifacts": [
    {
      "path": "artifacts/model.xlsx",
      "sha256": "d4e5f6...",
      "size_bytes": 145678
    },
    ...
  ],
  "combined_hash": "281bd87fd72e5efb...",
  "provenance_hash": "a1b2c3..."
}
```

`combined_hash` — SHA-256 от конкатенации отсортированных `artifacts[*].sha256`. Это **единственный** идентификатор успешного прогона. Два прогона с одинаковым `combined_hash` гарантированно давали одинаковые артефакты.

Реализовано в `generators/hash_manifest.py::build_manifest`.

### Правила

1. Провенанс пишется **до** любого генератора — чтобы при failure было понятно, какие inputs использовались.
2. Манифест пишется **после** всех артефактов — фиксирует полный результат.
3. SHA-256 вычисляется для всех файлов (не только text) через `hashlib.sha256`.
4. Хеши хранятся в hex form (64 символа).
5. Провенанс и манифест сами хешируются и попадают в CI-gate.

## Options Considered

### Option A: Git commit как единственный identifier

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Zero |
| Reproducibility | Med |
| Team familiarity | High |

**Pros:** git commit однозначно идентифицирует код и inputs (если inputs в git).
**Cons:** не фиксирует seed, python version, platform. Два прогона на одном commit могут давать разные артефакты (timestamps в metadata, non-deterministic dict ordering в старом Python).

### Option B: Полный content-addressable manifest (выбрано)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Low (~150 строк кода) |
| Reproducibility | High |
| Team familiarity | Med |

**Pros:** каждый артефакт имеет cryptographic proof. `combined_hash` — один short ID для всего прогона. Работает даже без git.
**Cons:** нужно писать код провенанса и манифеста; требует тестирования на детерминизм.

### Option C: Dockerized build с immutable tags

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | High (Dockerfile + CI) |
| Reproducibility | Very High |
| Team familiarity | Low |

**Pros:** полная изоляция среды, воспроизводимость на уровне Docker image.
**Cons:** overkill для Python-пайплайна в 5000 строк. Добавляет Docker как зависимость разработки. CFO и продюсеры не запускают docker локально.

### Option D: DVC (Data Version Control)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Med (DVC + remote storage) |
| Reproducibility | High |
| Team familiarity | Low |

**Pros:** готовая система provenance, integration с git.
**Cons:** требует remote storage (S3/GCS), усложняет онбординг. Новая зависимость.

## Trade-off Analysis

Option B выбран как минимальная достаточная реализация без добавления зависимостей. `hashlib.sha256` в stdlib, JSON в stdlib, git commit читается через `subprocess`. Это соответствует принципу hermetic reproducibility: всё нужное есть в `python3 + git`.

Option A отвергнут — недостаточно для гарантии воспроизводимости. Option C — overkill для quarterly release cycle. Option D — новая зависимость + remote storage ломает offline работу продюсеров.

Компромисс: мы жертвуем удобством (DVC предоставляет CLI типа `dvc repro`), но получаем полный контроль над форматом провенанса и отсутствие внешних зависимостей.

## Consequences

**Становится проще:**
- Аудит: один взгляд в `manifest.json` — и понятно, что за артефакты.
- Debugging: при расхождении между версиями отчёта можно сравнить `provenance.json` двух прогонов и увидеть, какой YAML изменился.
- Воспроизведение: `git checkout <commit>` + `python scripts/run_pipeline.py` = тот же `combined_hash`.

**Становится сложнее:**
- Любой непреднамеренный non-determinism (например, `set` вместо `list` в сериализации) ломает `combined_hash` без смысла.
- При добавлении нового артефакта нужно обновлять список в `hash_manifest.py`.
- Timestamp в xlsx/docx metadata — единственный источник non-determinism; пришлось специально настраивать `python-docx` на фиксированное время.

**Надо пересматривать:**
- При появлении external API-calls (рыночные данные live) — нужна политика кэширования с фиксированным snapshot date.
- При переходе на distributed build — требуется centralized manifest store.

## Action Items

- [x] Реализовать `generators/provenance.py::build_provenance`.
- [x] Реализовать `generators/hash_manifest.py::build_manifest`.
- [x] Добавить `write_provenance` в начало `run_pipeline.py`.
- [x] Добавить `write_manifest` в конец `run_pipeline.py`.
- [x] Настроить детерминированность xlsx/docx metadata (фиксированный creation time).
- [x] Написать `tests/test_14_provenance_manifest.py` — проверяет полноту манифеста и ссылочную целостность.
- [x] Задокументировать формат в `README.md`.
