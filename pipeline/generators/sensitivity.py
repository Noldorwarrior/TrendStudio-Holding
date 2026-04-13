"""
generators/sensitivity.py — сетка чувствительности NPV(WACC × growth).

Вход: CashFlow[base], SensitivityGrid
Выход: SensitivityTable (матрица NPV в млн ₽)

Матрица строится вокруг Base FCF по Gordon growth terminal value.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from schemas.model_output import CashFlow, PnL
from schemas.valuation import SensitivityGrid

from .base import YEARS


@dataclass
class SensitivityTable:
    wacc_values: List[float]
    growth_values: List[float]
    npv_matrix: Dict[Tuple[float, float], float] = field(default_factory=dict)

    def to_rows(self) -> List[List[float | str]]:
        """Возвращает 2D таблицу для вставки в xlsx (header + data)."""
        header = ["WACC \\ g"] + [f"{g*100:.1f}%" for g in self.growth_values]
        rows: List[List[float | str]] = [header]
        for w in self.wacc_values:
            row: List[float | str] = [f"{w*100:.1f}%"]
            for g in self.growth_values:
                row.append(round(self.npv_matrix.get((w, g), 0.0), 1))
            rows.append(row)
        return rows


def _dcf_with_terminal(
    fcf_list: List[float], wacc: float, growth: float
) -> float:
    """DCF сумма + Gordon TV. Если wacc ≤ growth — возвращает NaN-маркер 0.0."""
    if wacc <= growth:
        return 0.0
    total = 0.0
    for t, cf in enumerate(fcf_list, start=1):
        total += cf / ((1.0 + wacc) ** t)
    tv = fcf_list[-1] * (1.0 + growth) / (wacc - growth)
    total += tv / ((1.0 + wacc) ** len(fcf_list))
    return total


def generate_sensitivity(
    cashflow_base: CashFlow,
    grid: SensitivityGrid,
) -> SensitivityTable:
    fcf_list = [cashflow_base.free_cash_flow[y] for y in YEARS]
    table = SensitivityTable(
        wacc_values=list(grid.wacc_range),
        growth_values=list(grid.terminal_growth_range),
    )
    for w in grid.wacc_range:
        for g in grid.terminal_growth_range:
            table.npv_matrix[(w, g)] = _dcf_with_terminal(fcf_list, w, g)
    return table
