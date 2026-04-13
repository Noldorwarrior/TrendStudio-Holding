# ADR-003: Pydantic StrictModel для всех YAML входов с extra="forbid"

**Status:** Accepted
**Date:** 2026-02-22 (v1.3.1)
**Deciders:** ведущий разработчик, аудитор пайплайна

## Context

L4-архитектура (ADR-002) требует, чтобы каждый YAML вход имел строгий контракт. В v1.2 валидация была частичной: проверялось наличие полей, но не их типы и диапазоны. Последствия:

- Опечатка `hit_rate_prem: 5.5` вместо `0.55` (≈ 550%) проходила валидацию и тихо ломала EBITDA на 5 млрд ₽.
- Добавление нового поля в YAML не ломало старый код, но и не использовалось — mystery debugging неделями.
- Любое внешнее изменение структуры YAML (перевод из Excel) приходило скрыто.

### Силы

- **Fail-fast**: ошибка в YAML должна падать при загрузке, а не через 30 секунд после прогона на cryptic stack trace.
- **Самодокументированность**: схема должна служить документацией для продюсеров, которые правят YAML вручную.
- **Версионируемость**: схема является частью репозитория; изменения схемы = изменения контракта.
- **Без доп. зависимостей**: избегать jsonschema/voluptuous, использовать уже установленный Pydantic v2 (через mypy).

## Decision

Использовать **Pydantic v2 `StrictModel`** (кастомный класс с `model_config = ConfigDict(extra="forbid", strict=True)`) для всех YAML-входов.

Реализация в `schemas/base.py`:

```python
from pydantic import BaseModel, ConfigDict

class StrictModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",          # опечатка в YAML → падение с указанием поля
        strict=True,             # "0.55" не превращается в 0.55, а требует явного приведения
        str_strip_whitespace=True,
        validate_assignment=True,
    )
```

Правила для всех новых схем:

1. Каждая схема наследуется от `StrictModel`.
2. Все числовые поля имеют `Field(..., ge=..., le=...)` с разумными границами.
3. Все строки-идентификаторы — `pattern=r"^[a-z0-9_]+$"`.
4. Все поля обязательны (`...`) если не доказано обратное.
5. Процентные значения — `ge=0.0, le=1.0` для долей, `ge=-0.5, le=0.5` для изменений YoY.
6. Pattern для enum-like значений — использовать `Literal[...]`.

## Options Considered

### Option A: jsonschema + ручная валидация

| Dimension | Assessment |
|-----------|------------|
| Complexity | Med |
| Cost | Med (обучение jsonschema синтаксису) |
| Scalability | Med |
| Team familiarity | Low |

**Pros:** стандарт, работает для любого YAML/JSON.
**Cons:** отдельный файл схемы на каждый YAML; нет type hints для IDE; mypy не видит типы.

### Option B: Pydantic v2 StrictModel (выбрано)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Low (Python-код, естественный для команды) |
| Scalability | High |
| Team familiarity | High |

**Pros:** type hints, mypy-поддержка, автогенерация документации, доступ к полям через `.dot`. Ошибки с указанием пути `fx_pass_through.cinema.hit_rate_prem`.
**Cons:** Pydantic v2 требует Python ≥3.10.

### Option C: Dataclasses + ручная валидация

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Med (ручная валидация дублируется) |
| Scalability | Low (no extra="forbid") |
| Team familiarity | High |

**Pros:** стандартная библиотека, без зависимостей.
**Cons:** нет `extra="forbid"`, нет автоматической валидации типов, нет границ полей.

## Trade-off Analysis

Option B выбран из-за комбинации «low cost + high value». Pydantic v2 уже требовался для mypy-валидации бизнес-объектов, так что добавить `StrictModel` как базу — нулевая новая зависимость.

Option A отвергнут — дублирует Python-типизацию в отдельный YAML формат, что ломает single source of truth. Option C отвергнут — теряет `extra="forbid"`, который ловит именно те опечатки, ради которых всё затевается.

## Consequences

**Становится проще:**
- IDE показывает автокомплит для всех полей `inputs.cinema.targets_mln_rub[0].base`.
- Ошибки при загрузке содержат точный путь: `ValidationError: cinema -> targets_mln_rub -> 0 -> base`.
- Добавление нового поля = одна строка в pydantic модели.

**Становится сложнее:**
- Любое расширение требует обновления схемы (что правильно, но замедляет prototype).
- Некоторые поля с вариативной структурой (напр., рекламные каналы с переменным числом платформ) требуют `Optional[...]` + valid field_validator.

**Надо пересматривать:**
- Если появится необходимость принимать внешний YAML от партнёров — потребуется promotional `model_config = ConfigDict(extra="allow")` для отдельных секций.
- При переходе на Python 3.12+ — включить `Annotated[float, Field(...)]` формат для лучшей читаемости.

## Action Items

- [x] Создать `schemas/base.py` с `StrictModel` и `ConfidenceLevel` enum.
- [x] Мигрировать все 18 YAML к схемам на базе `StrictModel`.
- [x] Написать `tests/test_01_inputs_contracts.py` с проверкой загрузки всех 18 файлов.
- [x] Добавить `test_01` в CI-gate: падение = блокировка релиза.
- [x] Документировать стиль схем в `schemas/README.md` (примеры, паттерны, best practices).
