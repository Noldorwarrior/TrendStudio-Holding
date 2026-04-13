"""
scripts/run_pipeline.py — единая точка входа end-to-end.

Фазы:
  1. load_inputs     — валидация 14 YAML через Pydantic
  2. run_all         — построение 3 сценариев (cons/base/opt)
  3. sensitivity     — NPV(WACC × growth) 36 ячеек
  4. stress_tests    — 6 шоков + breakeven
  5. monte_carlo     — 2000 симуляций, p5/median/p95
  6. provenance      — реестр source_id
  7. hash_manifest   — SHA-256 по inputs/schemas/generators
  8. xlsx_builder    — artifacts/model.xlsx (21 лист)
  9. docx_builder    — artifacts/model_report.docx

Использование:
    python scripts/run_pipeline.py              # полный прогон
    python scripts/run_pipeline.py --validate   # только Pydantic-валидация
    python scripts/run_pipeline.py --quiet      # без подробного лога

Exit code: 0 при прохождении якоря (±1%), 1 при любой ошибке.
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

PIPELINE_ROOT = Path(__file__).parent.parent
if str(PIPELINE_ROOT) not in sys.path:
    sys.path.insert(0, str(PIPELINE_ROOT))


def main() -> int:
    parser = argparse.ArgumentParser(description="Финмодель Холдинга: end-to-end pipeline")
    parser.add_argument("--validate", action="store_true", help="только валидация YAML")
    parser.add_argument("--build", action="store_true", help="только сборка артефактов")
    parser.add_argument("--quiet", action="store_true", help="без подробного лога")
    args = parser.parse_args()

    log = (lambda *a, **k: None) if args.quiet else print
    t0 = time.time()

    # Общий алиас json — используется всеми шагами, которые пишут логи
    import json as _json

    # 1. Inputs
    log(">>> [1/9] load_inputs — Pydantic контракты 14 YAML…")
    from schemas.inputs import load_inputs
    inputs = load_inputs(PIPELINE_ROOT / "inputs")
    log(f"    OK: {len(inputs.model_dump())} секций")

    if args.validate:
        log(">>> Только валидация. Завершено.")
        return 0

    # 2. Core run_all
    log(">>> [2/9] run_all — 3 сценария…")
    from generators.core import run_all
    run = run_all(inputs)
    status = "PASS" if run.anchor_passed else "FAIL"
    log(f"    якорь: actual={run.anchor_actual:.1f} δ={run.anchor_deviation_pct:+.3f}% [{status}]")
    if run.warnings:
        log(f"    предупреждений: {len(run.warnings)}")

    if not run.anchor_passed:
        log("!!! Якорь нарушен — прерываем пайплайн")
        return 1

    # 3. Sensitivity
    log(">>> [3/9] sensitivity…")
    from generators.sensitivity import generate_sensitivity
    sens = generate_sensitivity(run.get("base").cashflow, inputs.valuation.sensitivity_grid)
    log(f"    {len(sens.wacc_values)*len(sens.growth_values)} ячеек NPV")

    # 4. Stress tests
    log(">>> [4/9] stress_tests…")
    from generators.stress_tests import generate_stress_tests
    stress = generate_stress_tests(
        run.get("base"), run.anchor_value, inputs.scenarios.anchor.tolerance_pct
    )
    log(f"    {len(stress.scenarios)} сценариев, breakeven={stress.breakeven_revenue_shock_pct:.1f}%")

    # 5. Monte Carlo (legacy triangular — generic revenue/cost шоки)
    log(">>> [5/9] monte_carlo…")
    from generators.monte_carlo import generate_monte_carlo
    mc = generate_monte_carlo(run.get("base"), anchor_value=run.anchor_value, n_sims=2000, seed=42)
    log(f"    n={mc.n_sims} mean={mc.ebitda_mean:.1f} p5={mc.ebitda_p5:.1f} p95={mc.ebitda_p95:.1f}")

    # 4+5 combined — Ж7 (v1.3.3): интеграция combined_stress_tests в pipeline
    # (ранее artifacts/stress_matrix/*.json собирались вручную, сейчас —
    # детерминированно каждый прогон).
    log(">>> [4+5/9] combined_stress_tests — 3×3×3 + MC с Cholesky + bootstrap…")
    from generators.combined_stress_tests import (
        run_full_matrix,
        run_monte_carlo as run_combined_mc,
        run_monte_carlo_bootstrap,
        report_to_dict,
        mc_report_to_dict,
        bootstrap_mc_report_to_dict,
    )
    sm_dir = PIPELINE_ROOT / "artifacts" / "stress_matrix"
    sm_dir.mkdir(parents=True, exist_ok=True)
    matrix_report = run_full_matrix(inputs)
    mc_combined = run_combined_mc(inputs)
    mc_bootstrap = run_monte_carlo_bootstrap(inputs)
    # Diagnostics: расхождение параметрического и исторического p5
    mc_bootstrap.parametric_p5_diff = round(
        mc_bootstrap.p5_ebitda - mc_combined.p5_ebitda, 2
    )

    (sm_dir / "matrix_27.json").write_text(
        _json.dumps(report_to_dict(matrix_report), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    (sm_dir / "monte_carlo.json").write_text(
        _json.dumps(mc_report_to_dict(mc_combined), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    (sm_dir / "monte_carlo_bootstrap.json").write_text(
        _json.dumps(bootstrap_mc_report_to_dict(mc_bootstrap), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    log(
        f"    matrix: {matrix_report.n_total} сценариев, "
        f"breach={matrix_report.n_breach}, severe={matrix_report.n_severe}, "
        f"worst={matrix_report.worst_scenario_id} ({matrix_report.worst_ebitda:.0f})"
    )
    log(
        f"    MC parametric: n={mc_combined.n_simulations} mean={mc_combined.mean_ebitda:.0f} "
        f"p5={mc_combined.p5_ebitda:.0f} p95={mc_combined.p95_ebitda:.0f} "
        f"VaR95={mc_combined.var_95_mln_rub:.0f} "
        f"breach_p={mc_combined.breach_probability*100:.2f}%"
    )
    log(
        f"    MC bootstrap: n={mc_bootstrap.n_simulations} "
        f"block={mc_bootstrap.block_length} mean={mc_bootstrap.mean_ebitda:.0f} "
        f"p5={mc_bootstrap.p5_ebitda:.0f} p95={mc_bootstrap.p95_ebitda:.0f} "
        f"breach_p={mc_bootstrap.breach_probability*100:.2f}% "
        f"(Δp5 vs parametric={mc_bootstrap.parametric_p5_diff:+.0f})"
    )

    # v1.3.9 F2: Stage-gate дерево решений для 12 фильмов слейта
    log(">>> [4+5c/9] stage_gate — биномиальное дерево 12 фильмов × 4 этапа…")
    from generators.stage_gate import run_stage_gate, stage_gate_report_to_dict
    sg_report = run_stage_gate(inputs)
    (sm_dir / "stage_gate.json").write_text(
        _json.dumps(stage_gate_report_to_dict(sg_report), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    log(
        f"    stage-gate: n={sg_report.n_simulations} "
        f"P(release)={sg_report.p_reach_release:.3f} "
        f"mean_released={sg_report.mean_released_count:.2f}/12 "
        f"mean_sunk={sg_report.mean_sunk_cost_mln_rub:.0f} "
        f"mean_eb={sg_report.mean_ebitda:.0f} "
        f"p5={sg_report.p5_ebitda:.0f} p95={sg_report.p95_ebitda:.0f} "
        f"breach_p={sg_report.breach_probability*100:.1f}%"
    )

    # v1.3.8 F1: Market bootstrap — блочный bootstrap годовых YoY рынка проката
    log(">>> [4+5b/9] market_bootstrap — годовые YoY ЕАИС seed…")
    from generators.market_bootstrap import (
        run_market_bootstrap,
        market_bootstrap_report_to_dict,
    )
    mb_report = run_market_bootstrap(inputs)
    (sm_dir / "market_bootstrap.json").write_text(
        _json.dumps(
            market_bootstrap_report_to_dict(mb_report),
            indent=2, ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    log(
        f"    market: n={mb_report.n_simulations} block={mb_report.block_size} "
        f"beta={mb_report.market_beta} mean={mb_report.mean_ebitda:.0f} "
        f"p5={mb_report.p5_ebitda:.0f} p95={mb_report.p95_ebitda:.0f} "
        f"VaR95={mb_report.var_95_mln_rub:.0f} "
        f"breach_p={mb_report.breach_probability*100:.2f}%"
    )

    # v1.4.0 F3+F4: LHS + Gaussian copula
    log(">>> [4+5d/9] lhs_copula — Latin Hypercube + Gaussian copula…")
    from generators.lhs_copula import run_lhs_copula, lhs_copula_report_to_dict
    lc_report = run_lhs_copula(inputs)
    (sm_dir / "lhs_copula.json").write_text(
        _json.dumps(
            lhs_copula_report_to_dict(lc_report),
            indent=2, ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    log(
        f"    lhs+copula: n={lc_report.n_simulations} method={lc_report.method} "
        f"mean={lc_report.mean_ebitda:.0f} std={lc_report.std_ebitda:.0f} "
        f"p5={lc_report.p5_ebitda:.0f} p95={lc_report.p95_ebitda:.0f} "
        f"VaR95={lc_report.var_95_mln_rub:.0f} VaR99={lc_report.var_99_mln_rub:.0f} "
        f"breach_p={lc_report.breach_probability*100:.2f}%"
    )

    # 5a. Honest hit-rate sensitivity через run_all
    log(">>> [5a/9] sensitivity_hit_rate (через run_all)…")
    from generators.sensitivity_hit_rate import run_hit_rate_sensitivity
    hit_sens = run_hit_rate_sensitivity(inputs, multipliers=(0.75, 0.85, 1.00, 1.10, 1.15))
    log(
        f"    base={hit_sens.base_ebitda:.1f} "
        f"эластичность={hit_sens.elasticity_average:+.3f} "
        f"Δ%EBITDA/Δ%hit_rate"
    )
    _hit_payload = {
        "points": [
            {
                "multiplier": p.multiplier,
                "slate_weight_mean": p.slate_weight_mean,
                "effective_cinema_delta_pct": p.effective_cinema_delta_pct,
                "cumulative_ebitda": p.cumulative_ebitda,
                "delta_ebitda_vs_base": p.delta_ebitda_vs_base,
                "delta_pct": p.delta_pct,
            }
            for p in hit_sens.points
        ],
        "base_ebitda": hit_sens.base_ebitda,
        "slate_weight_by_year": hit_sens.slate_weight_by_year,
        "elasticity_average": hit_sens.elasticity_average,
    }
    (PIPELINE_ROOT / "logs" / "sensitivity_hit_rate.json").write_text(
        _json.dumps(_hit_payload, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 5b. Perturbation analysis 5 скрытых допущений
    log(">>> [5b/9] perturbation_analysis (5 допущений)…")
    from generators.perturbation_analysis import run_perturbation_analysis
    from dataclasses import asdict
    perturb = run_perturbation_analysis(inputs)
    log(
        f"    base={perturb.base_ebitda:.1f}; "
        f"возмущено: {len(perturb.results)} допущений"
    )
    _pert_payload = {
        "base_ebitda": perturb.base_ebitda,
        "results": [asdict(r) for r in perturb.results],
    }
    (PIPELINE_ROOT / "logs" / "perturbation_analysis.json").write_text(
        _json.dumps(_pert_payload, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 6. Provenance
    log(">>> [6/9] provenance…")
    from generators.provenance import build_provenance
    prov = build_provenance(inputs)
    log(f"    entries: {len(prov.entries)}")

    # 7. Manifest
    log(">>> [7/9] hash_manifest…")
    from generators.hash_manifest import build_manifest, write_manifest
    manifest = build_manifest(
        PIPELINE_ROOT,
        run_context={
            "anchor_actual": run.anchor_actual,
            "anchor_deviation_pct": run.anchor_deviation_pct,
            "warnings": len(run.warnings),
        },
    )
    log(f"    combined_hash: {manifest['combined_hash'][:16]}…")

    # 8. xlsx
    log(">>> [8/9] xlsx_builder…")
    from generators.xlsx_builder import build_xlsx
    xlsx_path = PIPELINE_ROOT / "artifacts" / "model.xlsx"
    build_xlsx(xlsx_path, inputs, run, sens, stress, mc, prov, manifest)
    log(f"    {xlsx_path.relative_to(PIPELINE_ROOT)}")

    # 9. docx
    log(">>> [9/9] docx_builder…")
    from generators.docx_builder import build_docx
    docx_path = PIPELINE_ROOT / "artifacts" / "model_report.docx"
    build_docx(docx_path, inputs, run, stress, mc, hit_sens=hit_sens, perturb=perturb)
    log(f"    {docx_path.relative_to(PIPELINE_ROOT)}")

    # Запись манифеста и provenance
    write_manifest(manifest, PIPELINE_ROOT / "logs" / "manifest.json")
    prov.write(PIPELINE_ROOT / "logs" / "provenance.json")

    elapsed = time.time() - t0
    log(f"\n>>> ПАЙПЛАЙН ПРОЙДЕН ЗА {elapsed:.2f} с")
    log(f">>> Якорь: {run.anchor_actual:.1f} млн ₽ (δ={run.anchor_deviation_pct:+.3f}%)")
    log(f">>> Артефакты: artifacts/model.xlsx, artifacts/model_report.docx")
    log(f">>> Логи: logs/manifest.json, logs/provenance.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
