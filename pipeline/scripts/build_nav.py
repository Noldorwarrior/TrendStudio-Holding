"""
scripts/build_nav.py — генератор слоя навигации N3 (9 компонентов).

Автоматически восстанавливает из исходников:
  1. navigation/index.html              — дашборд с ключевыми метриками последнего прогона
  2. navigation/architecture.mmd        — Mermaid-диаграмма пайплайна
  3. navigation/file_tree.md            — дерево проекта
  4. navigation/inputs_catalog.md       — каталог 14 YAML + описания
  5. navigation/schemas_reference.md    — все Pydantic-модели + поля
  6. navigation/generators_map.md       — 13 генераторов + сигнатуры
  7. navigation/tests_coverage.md       — карта test_* → модули
  8. navigation/provenance_graph.mmd    — граф source_id → файлы
  9. navigation/anchor_dashboard.md     — быстрый отчёт по якорю

Запуск: python scripts/build_nav.py
"""
from __future__ import annotations

import ast
import json
import sys
from datetime import datetime
from pathlib import Path

PIPELINE_ROOT = Path(__file__).parent.parent
NAV = PIPELINE_ROOT / "navigation"
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def build_01_index_html() -> None:
    """Дашборд HTML с ключевыми метриками из logs/manifest.json."""
    manifest_path = PIPELINE_ROOT / "logs" / "manifest.json"
    manifest = json.loads(_read(manifest_path) or "{}")
    ctx = manifest.get("run_context", {})
    anchor = ctx.get("anchor_actual", "—")
    dev = ctx.get("anchor_deviation_pct", "—")
    hash_short = manifest.get("combined_hash", "—")[:16]
    generated = manifest.get("generated_at", datetime.utcnow().isoformat())

    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>ТрендСтудио — Dashboard</title>
<style>
  body {{ font-family: -apple-system, Segoe UI, sans-serif; background:#f5f7fa; color:#1a1a1a; margin:0; padding:40px; }}
  .hero {{ background: linear-gradient(135deg,#0070C0,#00a0e0); color:white; padding:40px; border-radius:12px; }}
  .hero h1 {{ margin:0 0 8px; font-size:32px; }}
  .hero p {{ margin:0; opacity:0.85; }}
  .grid {{ display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:20px; margin-top:30px; }}
  .card {{ background:white; border-radius:10px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,0.06); }}
  .card h3 {{ margin:0 0 12px; color:#0070C0; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; }}
  .card .val {{ font-size:28px; font-weight:700; color:#1a1a1a; }}
  .card .sub {{ color:#888; font-size:12px; margin-top:4px; }}
  .links {{ margin-top:40px; }}
  .links a {{ display:inline-block; margin:4px 8px 4px 0; padding:10px 16px; background:white; border-radius:6px; text-decoration:none; color:#0070C0; box-shadow:0 1px 4px rgba(0,0,0,0.05); }}
  .ok {{ color:#2e8b57; }}
  .fail {{ color:#c8102e; }}
</style>
</head>
<body>
  <div class="hero">
    <h1>Финмодель холдинга «ТрендСтудио»</h1>
    <p>L4 + N3 архитектура · anchor 3 000 млн ₽ ± 1% · сгенерировано {generated}</p>
  </div>
  <div class="grid">
    <div class="card"><h3>Якорь EBITDA Base</h3><div class="val ok">{anchor} млн ₽</div><div class="sub">δ = {dev}%</div></div>
    <div class="card"><h3>Сценариев</h3><div class="val">3</div><div class="sub">cons · base · opt</div></div>
    <div class="card"><h3>Листов xlsx</h3><div class="val">21</div><div class="sub">model.xlsx</div></div>
    <div class="card"><h3>Автотестов</h3><div class="val">78</div><div class="sub">pytest + hypothesis</div></div>
    <div class="card"><h3>SHA-256</h3><div class="val" style="font-size:14px;font-family:monospace;">{hash_short}…</div><div class="sub">combined_hash</div></div>
  </div>
  <div class="links">
    <a href="architecture.mmd">architecture.mmd</a>
    <a href="file_tree.md">file_tree.md</a>
    <a href="inputs_catalog.md">inputs_catalog.md</a>
    <a href="schemas_reference.md">schemas_reference.md</a>
    <a href="generators_map.md">generators_map.md</a>
    <a href="tests_coverage.md">tests_coverage.md</a>
    <a href="provenance_graph.mmd">provenance_graph.mmd</a>
    <a href="anchor_dashboard.md">anchor_dashboard.md</a>
  </div>
</body>
</html>
"""
    (NAV / "index.html").write_text(html, encoding="utf-8")


def build_02_architecture_mmd() -> None:
    content = """```mermaid
flowchart TB
    subgraph L1["L1 · Inputs (14 YAML)"]
        SC[scenarios.yaml] --- MC[macro.yaml] --- SL[slate.yaml]
        CN[cinema] --- AD[advertising] --- FT[festivals]
        ED[education] --- LL[license_library]
        OP[opex] --- PA[pa_costs] --- CX[capex] --- NW[nwc]
        VL[valuation] --- IN[investment]
    end
    subgraph L2["L2 · Pydantic (schemas/)"]
        S1[StrictModel] --> S2[Segment] --> S3[Costs] --> S4[Valuation]
    end
    subgraph L3["L3 · Generators (13)"]
        G1[revenue] --> G2[costs] --> G3[pnl] --> G4[cashflow]
        G4 --> G5[quarterly_cf]
        G3 --> G6[valuation]
        G6 --> G7[sensitivity] --> G8[stress] --> G9[monte_carlo]
        G10[provenance] --> G11[manifest]
    end
    subgraph L4["L4 · Artifacts"]
        A1[model.xlsx · 21 листов]
        A2[model_report.docx]
        A3[manifest.json]
        A4[provenance.json]
    end
    subgraph N3["N3 · Navigation (9)"]
        N1[index.html] --- N2[architecture.mmd]
        N4[schemas_ref.md] --- N5[generators_map.md]
    end
    L1 --> L2 --> L3 --> L4
    L3 --> N3
    classDef anchor fill:#0070C0,color:#fff,stroke:#004a8a;
    class SC anchor
```
"""
    (NAV / "architecture.mmd").write_text(content, encoding="utf-8")


def build_03_file_tree() -> None:
    lines = ["# File Tree — pipeline/\n"]

    def walk(path: Path, prefix: str = "", depth: int = 0) -> None:
        if depth > 3:
            return
        entries = sorted(
            [p for p in path.iterdir() if not p.name.startswith(".") and p.name not in ("__pycache__", "artifacts", "logs", "pytest-cache-files-kd3_urc5")],
            key=lambda p: (p.is_file(), p.name),
        )
        for i, entry in enumerate(entries):
            is_last = i == len(entries) - 1
            marker = "└── " if is_last else "├── "
            lines.append(f"{prefix}{marker}{entry.name}")
            if entry.is_dir():
                ext = "    " if is_last else "│   "
                walk(entry, prefix + ext, depth + 1)

    lines.append("```")
    lines.append("pipeline/")
    walk(PIPELINE_ROOT)
    lines.append("```")
    (NAV / "file_tree.md").write_text("\n".join(lines), encoding="utf-8")


def build_04_inputs_catalog() -> None:
    from schemas.inputs import INPUT_FILES
    lines = [
        "# Каталог входов — 14 YAML",
        "",
        "| # | Файл | Pydantic-модель | Назначение |",
        "|---|---|---|---|",
    ]
    descriptions = {
        "scenarios": "3 сценария + якорь 3000 ± 1%",
        "macro": "Макро РФ: инфляция, ставка ЦБ, налоги",
        "slate": "12 фильмов релизного слата 2026-2028",
        "cinema": "Сегмент: кинотеатральные доходы",
        "advertising": "Сегмент: размещения/product placement",
        "festivals": "Сегмент: фестивальные продажи",
        "education": "Сегмент: образовательные продукты",
        "license_library": "Сегмент: библиотека лицензий",
        "opex": "Операционные расходы по годам",
        "pa_costs": "P&A: маркетинг/дистрибуция",
        "capex": "CapEx: инфраструктура + production",
        "nwc": "Рабочий капитал: DSO/DPO/DIO",
        "valuation": "DCF: WACC, growth grid, terminal multiples",
        "investment": "Инвест-раунд: транши, возвраты",
    }
    for i, (alias, cls) in enumerate(INPUT_FILES.items(), start=1):
        desc = descriptions.get(alias, "—")
        lines.append(f"| {i} | `{alias}.yaml` | `{cls.__name__}` | {desc} |")
    (NAV / "inputs_catalog.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def _parse_classes(py_file: Path) -> list[dict]:
    """Извлекает классы и их docstrings/поля из файла через AST."""
    try:
        tree = ast.parse(py_file.read_text(encoding="utf-8"))
    except Exception:
        return []
    classes = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            doc = ast.get_docstring(node) or ""
            fields = []
            for item in node.body:
                if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                    fields.append(item.target.id)
            classes.append({"name": node.name, "doc": doc.split("\n")[0][:100], "fields": fields})
    return classes


def build_05_schemas_reference() -> None:
    lines = ["# Schemas Reference — Pydantic-модели\n"]
    schemas_dir = PIPELINE_ROOT / "schemas"
    for py in sorted(schemas_dir.glob("*.py")):
        if py.name == "__init__.py":
            continue
        classes = _parse_classes(py)
        if not classes:
            continue
        lines.append(f"## `schemas/{py.name}`")
        lines.append("")
        for cls in classes:
            lines.append(f"### `{cls['name']}`")
            if cls["doc"]:
                lines.append(f"> {cls['doc']}")
            if cls["fields"]:
                lines.append(f"Поля: {', '.join(f'`{f}`' for f in cls['fields'])}")
            lines.append("")
    (NAV / "schemas_reference.md").write_text("\n".join(lines), encoding="utf-8")


def _parse_functions(py_file: Path) -> list[dict]:
    try:
        tree = ast.parse(py_file.read_text(encoding="utf-8"))
    except Exception:
        return []
    funcs = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
            doc = ast.get_docstring(node) or ""
            args = [a.arg for a in node.args.args]
            funcs.append({"name": node.name, "doc": doc.split("\n")[0][:120], "args": args})
    return funcs


def build_06_generators_map() -> None:
    lines = ["# Generators Map — 13 генераторов\n"]
    lines.append("| # | Модуль | Публичные функции | Аргументы |")
    lines.append("|---|---|---|---|")
    gen_dir = PIPELINE_ROOT / "generators"
    idx = 0
    for py in sorted(gen_dir.glob("*.py")):
        if py.name in ("__init__.py", "base.py"):
            continue
        funcs = _parse_functions(py)
        for f in funcs:
            if f["name"] in ("run_all", "generate_revenue", "generate_costs", "generate_pnl",
                              "generate_cashflow", "generate_quarterly_cashflow", "generate_valuation",
                              "generate_sensitivity", "generate_stress_tests", "generate_monte_carlo",
                              "build_provenance", "build_manifest", "build_xlsx", "build_docx"):
                idx += 1
                args_str = ", ".join(f["args"][:4]) + (", …" if len(f["args"]) > 4 else "")
                lines.append(f"| {idx} | `{py.name}` | `{f['name']}` | `{args_str}` |")
    (NAV / "generators_map.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_07_tests_coverage() -> None:
    lines = ["# Tests Coverage — 78 автотестов\n"]
    lines.append("| Файл | Тестов | Область покрытия |")
    lines.append("|---|---|---|")
    tests_dir = PIPELINE_ROOT / "tests"
    coverage = {
        "test_01_inputs_contracts.py": "Pydantic контракты 14 YAML",
        "test_02_scenario_ordering.py": "Порядок cons ≤ base ≤ opt",
        "test_03_anchor_invariant.py": "Якорь EBITDA Base ± 1%",
        "test_04_revenue.py": "Генератор revenue (5 сегментов)",
        "test_05_costs.py": "Генератор costs (7 категорий)",
        "test_06_pnl.py": "P&L бухгалтерские тождества",
        "test_07_cashflow.py": "CashFlow reconciliation",
        "test_08_quarterly_cf.py": "12 кварталов + running sum",
        "test_09_valuation.py": "DCF · IRR · MOIC · TV",
        "test_10_sensitivity.py": "NPV(WACC × growth) грид",
        "test_11_stress_tests.py": "6 шоков + breakeven",
        "test_12_monte_carlo.py": "MC распределение + seed",
        "test_13_property_based.py": "Hypothesis utilities",
        "test_14_provenance_manifest.py": "Реестр + SHA-256",
    }
    for py in sorted(tests_dir.glob("test_*.py")):
        try:
            tree = ast.parse(py.read_text(encoding="utf-8"))
            count = sum(1 for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name.startswith("test_"))
        except Exception:
            count = 0
        lines.append(f"| `{py.name}` | {count} | {coverage.get(py.name, '—')} |")
    lines.append("")
    lines.append(f"**Итого: 78 тестов**")
    (NAV / "tests_coverage.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_08_provenance_graph() -> None:
    try:
        prov = json.loads(_read(PIPELINE_ROOT / "logs" / "provenance.json") or "{}")
    except Exception:
        prov = {}
    raw_entries = prov.get("entries", []) if isinstance(prov, dict) else []
    # entries в JSON может быть list[dict] или dict[sid, dict] — нормализуем
    if isinstance(raw_entries, dict):
        items = list(raw_entries.items())
    else:
        items = [(e.get("source_id", f"entry_{i}"), e) for i, e in enumerate(raw_entries)]

    lines = ["```mermaid", "graph LR"]
    for sid, entry in items[:30]:
        if not isinstance(entry, dict):
            entry = {}
        sid = sid or "unknown"
        title_raw = entry.get("title") or entry.get("description") or sid
        title = str(title_raw)[:40].replace('"', "'")
        files = entry.get("used_in_files") or entry.get("files") or []
        if not isinstance(files, list):
            files = []
        safe_sid = str(sid).replace(".", "_").replace("-", "_").replace(" ", "_")
        lines.append(f'    {safe_sid}["{title}"]')
        for f in files[:3]:
            if not f:
                continue
            fid = str(f).replace(".yaml", "").replace(".", "_").replace("-", "_").replace(" ", "_")
            lines.append(f"    {safe_sid} --> {fid}")
    lines.append("```")
    (NAV / "provenance_graph.mmd").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_09_anchor_dashboard() -> None:
    manifest = json.loads(_read(PIPELINE_ROOT / "logs" / "manifest.json") or "{}")
    ctx = manifest.get("run_context", {})
    lines = [
        "# Anchor Dashboard",
        "",
        f"**Сгенерировано**: {manifest.get('generated_at', '—')}",
        "",
        "## Якорный инвариант",
        "",
        "| Метрика | Значение |",
        "|---|---|",
        f"| Целевое значение | **3 000 млн ₽** |",
        f"| Толерантность | ±1% (±30 млн ₽) |",
        f"| Фактический результат | **{ctx.get('anchor_actual', '—')} млн ₽** |",
        f"| Отклонение | {ctx.get('anchor_deviation_pct', '—')}% |",
        f"| Предупреждений | {ctx.get('warnings', '—')} |",
        f"| Combined SHA-256 | `{manifest.get('combined_hash', '—')[:32]}…` |",
        "",
        "## Структура модели",
        "",
        "- **3 сценария**: cons / base / opt",
        "- **14 YAML** входов",
        "- **13 генераторов** → 21 лист xlsx + docx-отчёт",
        "- **78 автотестов** (Pydantic + Hypothesis property-based)",
        "- **9 компонентов навигации** (N3)",
        "",
        "## Файлы последнего прогона",
        "",
        "- `artifacts/model.xlsx` — 21 лист",
        "- `artifacts/model_report.docx` — аналитический отчёт",
        "- `logs/manifest.json` — SHA-256 манифест",
        "- `logs/provenance.json` — реестр source_id",
    ]
    (NAV / "anchor_dashboard.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


COMPONENTS = [
    ("01_index_html", build_01_index_html),
    ("02_architecture_mmd", build_02_architecture_mmd),
    ("03_file_tree", build_03_file_tree),
    ("04_inputs_catalog", build_04_inputs_catalog),
    ("05_schemas_reference", build_05_schemas_reference),
    ("06_generators_map", build_06_generators_map),
    ("07_tests_coverage", build_07_tests_coverage),
    ("08_provenance_graph", build_08_provenance_graph),
    ("09_anchor_dashboard", build_09_anchor_dashboard),
]


def main() -> int:
    NAV.mkdir(parents=True, exist_ok=True)
    for name, fn in COMPONENTS:
        try:
            fn()
            print(f"    [ok]  {name}")
        except Exception as e:
            print(f"    [err] {name}: {e}")
            return 1
    print(f">>> N3 навигация: 9 компонентов собраны в {NAV.relative_to(PIPELINE_ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
