# Handoff S35 BrandGuard — Phase 1

**Status:** complete
**Owned files:** brand_guidelines.md, qa/brand_lint.js
**Contract version:** v1.2.0 Phase 1

## What's done
- Created brand_guidelines.md documenting TrendStudio brand rules for the deck
- Created qa/brand_lint.js automated linter with three check categories:
  1. Prohibited words check: scans all HTML/JS for blacklisted terms (e.g., "guaranteed", "risk-free", "sure thing", "no-brainer") that violate regulatory/compliance guidelines
  2. Security check: scans JS files for dangerous patterns -- eval(), new Function(), innerHTML assignments with unsanitized input, document.write()
  3. Brand font check: verifies all font-family declarations reference only approved fonts (Inter, JetBrains Mono) and no system-default-only stacks
- Linter outputs JSON report: {passed: bool, violations: [{file, line, rule, message}]}
- Exit code 0 if all checks pass, exit code 1 if any violations found
- Can be run standalone or integrated into CI pipeline

## Self-check (unit smoke)
- [x] brand_lint.js runs without errors on clean codebase
- [x] Prohibited words check catches test violation when injected
- [x] Security check flags eval() when present
- [x] Brand font check flags Arial-only font stack
- [x] JSON output is valid and parseable
- [x] Exit code reflects pass/fail correctly

## What to know next
- Run with: node qa/brand_lint.js (scans src/ and i18n/ directories)
- Add new prohibited words to the PROHIBITED_WORDS array in brand_lint.js
- brand_guidelines.md is the human-readable reference; brand_lint.js is the automated enforcement

## Dependencies
- None (standalone linter, reads files directly)

## Open questions / TODO
- Phase 2: add color contrast verification against brand palette
- Phase 2: add logo placement and sizing checks
