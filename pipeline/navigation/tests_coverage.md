# Tests Coverage — 462 автотестов

| Файл | Тестов | Область покрытия |
|---|---|---|
| `test_01_inputs_contracts.py` | 8 | Pydantic контракты 14 YAML |
| `test_02_scenario_ordering.py` | 6 | Порядок cons ≤ base ≤ opt |
| `test_03_anchor_invariant.py` | 5 | Якорь EBITDA Base ± 1% |
| `test_04_revenue.py` | 6 | Генератор revenue (5 сегментов) |
| `test_05_costs.py` | 6 | Генератор costs (7 категорий) |
| `test_06_pnl.py` | 6 | P&L бухгалтерские тождества |
| `test_07_cashflow.py` | 5 | CashFlow reconciliation |
| `test_08_quarterly_cf.py` | 5 | 12 кварталов + running sum |
| `test_09_valuation.py` | 6 | DCF · IRR · MOIC · TV |
| `test_10_sensitivity.py` | 5 | NPV(WACC × growth) грид |
| `test_11_stress_tests.py` | 5 | 6 шоков + breakeven |
| `test_12_monte_carlo.py` | 5 | MC распределение + seed |
| `test_13_property_based.py` | 5 | Hypothesis utilities |
| `test_14_provenance_manifest.py` | 5 | Реестр + SHA-256 |

**Итого: 78 тестов**
