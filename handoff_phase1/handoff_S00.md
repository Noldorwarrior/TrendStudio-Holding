# Handoff S00 DataExtract — Phase 1

**Status:** complete
**Owned files:** extract_investor_model.py, deck_data_v1.2.0.json, TODO_MISSING_DATA.md
**Contract version:** v1.2.0 Phase 1

## What's done
- Wrote extract_investor_model.py to parse source financial model and emit deck_data_v1.2.0.json
- Produced deck_data_v1.2.0.json with all sections: cover, exec_summary, thesis, market, pipeline, financials, valuation, monte_carlo, risks, governance, terms, appendices, cta
- Created TODO_MISSING_DATA.md listing any fields that were unavailable or estimated
- Sanity checks passed: revenue_3y=4545, ebitda_3y=2167, ndp_3y=1385
- All monetary values in consistent units (millions RUB unless noted)
- JSON schema includes metadata block with extraction timestamp and source hash

## Self-check (unit smoke)
- [x] revenue_3y equals 4545
- [x] ebitda_3y equals 2167
- [x] ndp_3y equals 1385
- [x] JSON is valid (no trailing commas, proper UTF-8)
- [x] All slide keys present in JSON (s01 through s25)
- [x] No NaN or null in critical numeric fields

## What to know next
- deck_data_v1.2.0.json is the single source of truth for all slide subagents
- Any new data fields must be added here first, then consumed by slides
- TODO_MISSING_DATA.md tracks fields that need manual confirmation from the deal team

## Dependencies
- None (root of the dependency graph)

## Open questions / TODO
- See TODO_MISSING_DATA.md for fields pending confirmation
- Phase 2 may require scenario-specific data branches (base/bull/bear)
