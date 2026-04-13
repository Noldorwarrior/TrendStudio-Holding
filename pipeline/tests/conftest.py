"""
tests/conftest.py — общие фикстуры для всех 78 тестов.

Фикстуры:
- inputs: ValidatedInputs (все 14 YAML)
- run: RunAllResult (3 сценария + quarterly CF base)
- base_model / cons_model / opt_model: ModelResult по сценарию
- all_models: dict{scenario → ModelResult}
- anchor: объект Anchor
- float_tol / money_tol: толерантности сравнений

Все фикстуры session-scope: модель собирается один раз на прогон
тестов (~300 мс), не на каждый тест.
"""

import sys
from pathlib import Path

import pytest

PIPELINE_ROOT = Path(__file__).parent.parent
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))

FLOAT_TOL = 1e-6
MONEY_TOL_MLN = 0.01


@pytest.fixture(scope="session")
def float_tol() -> float:
    return FLOAT_TOL


@pytest.fixture(scope="session")
def money_tol() -> float:
    return MONEY_TOL_MLN


@pytest.fixture(scope="session")
def inputs_path() -> Path:
    return PIPELINE_ROOT / "inputs"


@pytest.fixture(scope="session")
def inputs(inputs_path):
    from schemas.inputs import load_inputs
    return load_inputs(inputs_path)


@pytest.fixture(scope="session")
def run(inputs):
    from generators.core import run_all
    return run_all(inputs)


@pytest.fixture(scope="session")
def anchor(inputs):
    return inputs.scenarios.anchor


@pytest.fixture(scope="session")
def base_model(run):
    return run.get("base")


@pytest.fixture(scope="session")
def cons_model(run):
    return run.get("cons")


@pytest.fixture(scope="session")
def opt_model(run):
    return run.get("opt")


@pytest.fixture(scope="session")
def all_models(run):
    return {s: run.get(s) for s in ("cons", "base", "opt")}


@pytest.fixture(scope="session")
def years():
    return (2026, 2027, 2028)
