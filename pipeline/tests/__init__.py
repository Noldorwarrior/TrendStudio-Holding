"""
tests/ — 78 автотестов в 12 категориях (A–L) + property-based + mutation.

Категории:
- A: Anchor (5)
- B: Audit stops (7)
- C: Reconciliation (6)
- D: Bounds (9)
- E: PnL structure (7)
- F: Monotonicity (6)
- G: Valuation (5)
- H: Sensitivity/MC (6)
- I: Provenance/hashes (6)
- J: Verification sheets (3)
- K: Legal (5)
- L: Temporal (5)
- Property-based (Hypothesis): 7

Итого: 70 example-based + 7 property = 77+
+ mutation testing (mutmut, target ≥ 85% mutation score).
"""
