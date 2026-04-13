# File Tree — pipeline/

```
pipeline/
├── generators
│   ├── __init__.py
│   ├── base.py
│   ├── cashflow.py
│   ├── core.py
│   ├── costs_gen.py
│   ├── docx_builder.py
│   ├── hash_manifest.py
│   ├── monte_carlo.py
│   ├── pnl.py
│   ├── provenance.py
│   ├── quarterly_cashflow.py
│   ├── revenue.py
│   ├── sensitivity.py
│   ├── stress_tests.py
│   ├── valuation.py
│   └── xlsx_builder.py
├── inputs
│   ├── advertising.yaml
│   ├── capex.yaml
│   ├── cinema.yaml
│   ├── education.yaml
│   ├── festivals.yaml
│   ├── investment.yaml
│   ├── license_library.yaml
│   ├── macro.yaml
│   ├── nwc.yaml
│   ├── opex.yaml
│   ├── pa_costs.yaml
│   ├── scenarios.yaml
│   ├── slate.yaml
│   └── valuation.yaml
├── navigation
│   ├── DOMAIN_DOSSIERS
│   ├── anchor_dashboard.md
│   ├── architecture.mmd
│   ├── file_tree.md
│   ├── generators_map.md
│   ├── index.html
│   ├── inputs_catalog.md
│   ├── p5_verification.md
│   ├── provenance_graph.mmd
│   ├── schemas_reference.md
│   └── tests_coverage.md
├── schemas
│   ├── __init__.py
│   ├── base.py
│   ├── costs.py
│   ├── inputs.py
│   ├── investment.py
│   ├── macro.py
│   ├── model_output.py
│   ├── scenarios.py
│   ├── segments.py
│   ├── slate.py
│   └── valuation.py
├── scripts
│   ├── __init__.py
│   ├── build_nav.py
│   ├── build_p5_report.py
│   ├── diff_runs.py
│   ├── run_pipeline.py
│   ├── verify.py
│   └── verify_p5.py
├── tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_01_inputs_contracts.py
│   ├── test_02_scenario_ordering.py
│   ├── test_03_anchor_invariant.py
│   ├── test_04_revenue.py
│   ├── test_05_costs.py
│   ├── test_06_pnl.py
│   ├── test_07_cashflow.py
│   ├── test_08_quarterly_cf.py
│   ├── test_09_valuation.py
│   ├── test_10_sensitivity.py
│   ├── test_11_stress_tests.py
│   ├── test_12_monte_carlo.py
│   ├── test_13_property_based.py
│   └── test_14_provenance_manifest.py
├── Makefile
├── README.md
├── pyproject.toml
└── requirements.txt
```