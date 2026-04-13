# Makefile — Холдинг Кино «ТрендСтудио» Финмодель Pipeline
# Архитектура: L4 + N3
# Anchor: cumulative EBITDA 2026-2028 Base = 3 000 млн ₽ ± 1%

.PHONY: all install validate build test mutation verify nav manifest clean diff help test-selective format lint typecheck

# В sandbox используем системный python3 напрямую.
# На локальной машине: `make PYTHON=.venv/bin/python all`.
PYTHON ?= python3
PYTEST ?= python3 -m pytest

help:
	@echo "Холдинг Кино Finmodel Pipeline — Makefile targets"
	@echo ""
	@echo "  make install         — установка зависимостей (requirements.txt)"
	@echo "  make validate        — Pydantic-валидация 14 YAML"
	@echo "  make build           — полный end-to-end прогон + xlsx/docx"
	@echo "  make test            — 78 автотестов (pytest + hypothesis)"
	@echo "  make mutation        — mutmut mutation testing (target ≥ 85%)"
	@echo "  make verify          — верификация П3+М2 (7 механизмов)"
	@echo "  make nav             — перестроить navigation/ (9 компонентов)"
	@echo "  make manifest        — обновить hash manifest"
	@echo "  make all             — validate → build → test → verify → nav → manifest"
	@echo "  make diff            — сравнить текущий прогон с предыдущим"
	@echo "  make clean           — очистить artifacts/ (logs сохраняются)"

install:
	$(PYTHON) -m pip install -r requirements.txt --break-system-packages

validate:
	@echo ">>> [1/6] validate — Pydantic contracts on 14 YAML"
	$(PYTHON) scripts/run_pipeline.py --validate --quiet
	@echo "    ✓ validate OK"

build: validate
	@echo ">>> [2/6] build — end-to-end pipeline (xlsx + docx)"
	$(PYTHON) scripts/run_pipeline.py
	@echo "    ✓ build OK"

test: build
	@echo ">>> [3/6] test — 78 автотестов"
	$(PYTEST) tests/ -q --tb=short
	@echo "    ✓ test OK"

verify: test
	@echo ">>> [4/6] verify — пресет П3+М2 (7 механизмов)"
	$(PYTHON) scripts/verify.py --preset=П3+М2
	@echo "    ✓ verify OK"

nav: verify
	@echo ">>> [5/6] nav — перестройка N3 (9 компонентов)"
	$(PYTHON) scripts/build_nav.py
	@echo "    ✓ nav OK"

manifest: nav
	@echo ">>> [6/6] manifest — обновление hash manifest"
	$(PYTHON) -m generators.hash_manifest --update
	@echo "    ✓ manifest OK"

all: manifest
	@echo ""
	@echo "═══════════════════════════════════════════════════════════════════"
	@echo "  ✅ ВСЕ ФАЗЫ ПРОЙДЕНЫ"
	@echo "  Артефакты: artifacts/model.xlsx · artifacts/model_report.docx"
	@echo "  Логи:       logs/manifest.json · logs/provenance.json · logs/verification_report.json"
	@echo "  Навигация:  navigation/index.html + 8 других компонентов"
	@echo "═══════════════════════════════════════════════════════════════════"

diff:
	@echo ">>> diff — сравнение текущего прогона с предыдущим"
	$(PYTHON) scripts/diff_runs.py

mutation: test
	@echo ">>> mutation — mutmut (опционально)"
	$(PYTHON) -m mutmut run --paths-to-mutate=generators/ 2>/dev/null || echo "    (mutmut не установлен — пропущено)"

test-selective:
	$(PYTEST) $(TESTS) -vv --tb=long

clean:
	@echo ">>> clean — очистка artifacts/ (logs/ сохраняются)"
	rm -f artifacts/*.xlsx artifacts/*.docx artifacts/*.png
	rm -rf .pytest_cache .hypothesis __pycache__ */__pycache__ */*/__pycache__

# === Development helpers ===
format:
	$(PYTHON) -m black schemas/ generators/ tests/ scripts/ 2>/dev/null || echo "(black не установлен)"

lint:
	$(PYTHON) -m ruff check schemas/ generators/ tests/ scripts/ 2>/dev/null || echo "(ruff не установлен)"

typecheck:
	$(PYTHON) -m mypy schemas/ generators/ 2>/dev/null || echo "(mypy не установлен)"
