# Generators Map — 13 генераторов

| # | Модуль | Публичные функции | Аргументы |
|---|---|---|---|
| 1 | `cashflow.py` | `generate_cashflow` | `scenario, pnl, costs, capex_file` |
| 2 | `core.py` | `run_all` | `inputs` |
| 3 | `costs_gen.py` | `generate_costs` | `scenario, revenue, opex_file, pa_file, …` |
| 4 | `docx_builder.py` | `build_docx` | `dst, inputs, run, stress, …` |
| 5 | `hash_manifest.py` | `build_manifest` | `pipeline_root, run_context` |
| 6 | `monte_carlo.py` | `generate_monte_carlo` | `base_model, scenario_factors, cost_factors, n_sims, …` |
| 7 | `pnl.py` | `generate_pnl` | `scenario, revenue, costs, macro` |
| 8 | `provenance.py` | `build_provenance` | `inputs` |
| 9 | `quarterly_cashflow.py` | `generate_quarterly_cashflow` | `scenario, revenue, pnl, costs, …` |
| 10 | `revenue.py` | `generate_revenue` | `scenario, cinema, advertising, festivals, …` |
| 11 | `sensitivity.py` | `generate_sensitivity` | `cashflow_base, grid` |
| 12 | `stress_tests.py` | `generate_stress_tests` | `model, anchor_value, tolerance_pct` |
| 13 | `valuation.py` | `generate_valuation` | `scenario, pnl, cashflow, valuation_file, …` |
| 14 | `xlsx_builder.py` | `build_xlsx` | `dst, inputs, run, sensitivity, …` |
