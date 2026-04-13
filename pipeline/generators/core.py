"""
generators/core.py — оркестратор Этапа 4.

Собирает полный ModelResult для каждого из 3 сценариев (cons/base/opt),
проверяет якорный инвариант по Base и возвращает RunAllResult с
дополнительными артефактами (quarterly_cashflow, warnings).

Usage:
    from schemas.inputs import load_inputs
    from generators.core import run_all

    inputs = load_inputs("inputs")
    result = run_all(inputs)
    print(result.summary())
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from schemas.base import ScenarioName
from schemas.inputs import ValidatedInputs
from schemas.model_output import ModelResult

from .base import check_anchor, cumulative
from .cashflow import generate_cashflow
from .costs_gen import generate_costs
from .pnl import generate_pnl
from .quarterly_cashflow import generate_quarterly_cashflow
from .revenue import generate_revenue
from .valuation import generate_valuation


SCENARIOS: tuple[ScenarioName, ...] = ("cons", "base", "opt")


@dataclass
class RunAllResult:
    """Итог сборки модели по всем 3 сценариям."""
    models: Dict[ScenarioName, ModelResult]
    quarterly_cashflow_base: Dict[str, Dict[str, float]]
    warnings: List[str] = field(default_factory=list)
    anchor_passed: bool = False
    anchor_value: float = 0.0
    anchor_deviation_pct: float = 0.0
    anchor_actual: float = 0.0

    def get(self, scenario: ScenarioName) -> ModelResult:
        return self.models[scenario]

    def summary(self) -> str:
        lines = ["=== RunAllResult ==="]
        for s in SCENARIOS:
            m = self.models[s]
            cum_ebitda = m.cumulative_ebitda
            rev = sum(m.revenue.total_by_year(y) for y in (2026, 2027, 2028))
            fcf = cumulative(m.cashflow.free_cash_flow)
            lines.append(
                f"  {s:>4}: Σ Revenue={rev:>7.0f}  Σ EBITDA={cum_ebitda:>7.0f}  "
                f"Σ FCF={fcf:>7.0f}"
            )
        lines.append(
            f"  anchor: Base EBITDA cum = {self.anchor_actual:.1f} "
            f"(target {self.anchor_value:.1f}, δ={self.anchor_deviation_pct:+.2f}%, "
            f"{'PASS' if self.anchor_passed else 'FAIL'})"
        )
        if self.warnings:
            lines.append(f"  warnings: {len(self.warnings)}")
            for w in self.warnings[:10]:
                lines.append(f"    - {w}")
        return "\n".join(lines)


def _build_scenario(
    scenario: ScenarioName, inputs: ValidatedInputs
) -> tuple[ModelResult, List[str]]:
    """Полная цепочка генераторов для одного сценария."""
    warnings: List[str] = []

    # 1. Revenue
    revenue, rev_warnings = generate_revenue(
        scenario=scenario,
        cinema=inputs.cinema,
        advertising=inputs.advertising,
        festivals=inputs.festivals,
        education=inputs.education,
        license_library=inputs.license_library,
        slate=inputs.slate,
    )
    warnings.extend(rev_warnings)

    # 2. Costs
    costs, _ = generate_costs(
        scenario=scenario,
        revenue=revenue,
        opex_file=inputs.opex,
        pa_file=inputs.pa_costs,
        capex_file=inputs.capex,
        nwc_file=inputs.nwc,
        macro=inputs.macro,
    )

    # 3. P&L (заполняет taxes)
    pnl = generate_pnl(
        scenario=scenario,
        revenue=revenue,
        costs=costs,
        macro=inputs.macro,
    )

    # 4. Cash Flow
    cf = generate_cashflow(
        scenario=scenario,
        pnl=pnl,
        costs=costs,
        capex_file=inputs.capex,
    )

    # 5. Valuation
    valuation = generate_valuation(
        scenario=scenario,
        pnl=pnl,
        cashflow=cf,
        valuation_file=inputs.valuation,
        investment_file=inputs.investment,
    )

    result = ModelResult(
        scenario=scenario,
        revenue=revenue,
        costs=costs,
        pnl=pnl,
        cashflow=cf,
        valuation=valuation,
    )
    return result, warnings


def run_all(inputs: ValidatedInputs) -> RunAllResult:
    """
    Прогнать полный pipeline по всем 3 сценариям.
    Проверяет anchor invariant по Base.
    """
    models: Dict[ScenarioName, ModelResult] = {}
    all_warnings: List[str] = []

    for s in SCENARIOS:
        model, warnings = _build_scenario(s, inputs)
        models[s] = model
        all_warnings.extend(warnings)

    # ── anchor check: Base EBITDA cum 2026-2028 ≈ 3000 ± 1% ──
    anchor = inputs.scenarios.anchor
    base_ebitda_cum = models["base"].cumulative_ebitda
    passed, deviation = check_anchor(
        cumulative_ebitda=base_ebitda_cum,
        anchor_value=anchor.value_mln_rub,
        tolerance_pct=anchor.tolerance_pct,
    )

    # ── quarterly cashflow (только для Base) ──
    qcf_base = generate_quarterly_cashflow(
        scenario="base",
        revenue=models["base"].revenue,
        pnl=models["base"].pnl,
        costs=models["base"].costs,
        capex_file=inputs.capex,
        slate=inputs.slate,
    )

    return RunAllResult(
        models=models,
        quarterly_cashflow_base=qcf_base,
        warnings=all_warnings,
        anchor_passed=passed,
        anchor_value=anchor.value_mln_rub,
        anchor_deviation_pct=round(deviation, 4),
        anchor_actual=round(base_ebitda_cum, 2),
    )


# ─────────────────────────────── CLI ────────────────────────────────
def _cli() -> int:
    """CLI для Makefile-совместимости: --validate-only и --build."""
    import argparse
    import sys
    from pathlib import Path

    parser = argparse.ArgumentParser(description="generators.core CLI")
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--build", action="store_true")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))

    from schemas.inputs import load_inputs
    inputs = load_inputs(root / "inputs")
    print(f">>> inputs OK ({len(inputs.model_dump())} секций)")

    if args.validate_only:
        return 0

    if args.build:
        # Делегируем в scripts/run_pipeline.py
        import subprocess
        return subprocess.call([sys.executable, str(root / "scripts" / "run_pipeline.py")])

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(_cli())
