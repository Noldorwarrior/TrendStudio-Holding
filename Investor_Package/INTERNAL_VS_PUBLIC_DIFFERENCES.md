# Internal vs Public: Documented Differences

**Model:** investor_model_v3 (ТрендСтудио)
**Date:** 2026-04-13
**Version:** v1.0.1
**FIX-10:** Аудит находка F-09 — документация различий

## Summary

| Metric | Internal | Public |
|--------|----------|--------|
| Total sheets | 42 | 42 |
| Sheets with differences | 7 | 7 |
| Total cell-level differences | 77 | — |

## Identical Sheets (35 of 42)

The following sheets are byte-identical between Internal and Public versions:
01_Cover, 02_Assumptions, 03_Change_Log, 04_FOT_Staff_A1, 05_FOT_Staff_A2,
06_Cost_Structure, 07_Revenue_Breakdown, 09_P&L_Statement, 10_Cash_Flow,
11_Balance_Sheet, 12_Working_Capital, 13_Debt_Schedule, 14_Investment_Inflow,
15_Investment_Summary, 16_Milestones, 17_Deal_Structures, 18_Risks_Register,
20_Key_Assumptions, 21_Sensitivity, 23_Valuation_Multiples, 25_Scenarios,
26_Break_Even, 27_Sensitivity_Tornado, 29_Exit_Strategy, 30_Exit_Waterfall,
31_Adjacent_Opportunities, 32_Use_of_Funds, 33_Tax_Structure,
34_Cap_Table, 35_Governance, 37_Glossary, 38_Notes_and_Sources,
39_Service_ModelInfo, 40_Investor_Checklist, 41_Version_Roadmap

## Sheets with Differences (7 of 42)

### 08_Content_Pipeline (8 differences)
- Internal contains production-sensitive data: actual per-film budgets,
  director compensation ranges, talent deal terms
- Public shows rounded/anonymized figures

### 19_Waterfall (24 differences)
- Internal contains full W₃/W₅ waterfall scenarios including
  fallback positions, producer ratchet terms, and negotiation boundaries
- Public shows only the default W₃ waterfall (1× Liq Pref + 8% coupon + 60/40)

### 22_Valuation_DCF (1 difference)
- Minor numerical rounding difference in terminal value sensitivity

### 24_Investor_Returns (7 differences)
- Internal contains IRR sensitivity to exit timing (2028/2029/2030)
  and alternative exit multiples (4×/5×/6×/7×)
- Public shows only base case returns

### 28_Monte_Carlo_Summary (33 differences)
- Internal contains full distribution statistics, correlation matrix,
  seed information, and convergence diagnostics
- Public shows summary statistics only (mean/median/p5/p95)

### 36_Executive_Summary (2 differences)
- Internal labels with "INTERNAL VERSION" marker
- Different audience description

### 42_Cover_Letter (2 differences)
- Date difference (synchronized in FIX-08)
- Recipient targeting differs:
  - Internal: "Для внутреннего использования команды ТрендСтудио"
  - Public: "Для потенциальных инвесторов"

## Classification of Differences

| Category | Count | Rationale |
|----------|-------|-----------|
| Confidential production data | 8 | Budget/talent details not for external |
| Negotiation-sensitive terms | 24 | Waterfall fallback positions |
| Statistical detail level | 33+7 | Full MC diagnostics for internal review |
| Labeling/recipient | 4 | Appropriate audience targeting |
| Rounding | 1 | Immaterial |

## Recommendation

All differences are intentional and appropriate for the dual-audience model
(Internal for management/board, Public for external investors). No
reconciliation issues found — the financial substance (Revenue, EBITDA,
DCF, Loan terms) is identical in both versions.
