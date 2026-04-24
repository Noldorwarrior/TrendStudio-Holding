# I18N Gaps — Wave 6

**Status:** NO GAPS
**Date:** 2026-04-24
**Artifact:** `.landing-autonomous/WAVE_6_ARTIFACT.jsx`

## Summary

| Metric | Value |
|---|---|
| RU keys (unique) | 82 |
| EN keys (unique) | 82 |
| RU-only keys | 0 |
| EN-only keys | 0 |
| `[EN TBD]` actual gaps | 0 |

All 82 EN keys are fully translated — no fallbacks to Russian required in the `t()` helper.
(The single `[EN TBD]` occurrence in the artifact is inside a code comment describing the fallback
convention, not an actual untranslated value.)

## Translation coverage by section

| Namespace | Keys | Coverage |
|---|---:|---|
| `nav.*` | 25 | 100% |
| `hero.*` | 5 | 100% |
| `section.*` | 27 | 100% |
| `cta.*` / `btn.*` | 7 | 100% |
| `footer.*` | 14 | 100% |
| `label.*` / `a11y.*` | 4 | 100% |

## Image alt-text coverage

All 20 images in `landing_img_meta_v1.0.json` have both `alt.ru` and `alt.en` fields —
no missing EN alt strings detected. Hero alt text (img19) is computed inline in the
`Hero` component based on current `lang` state, using the canon's EN translation verbatim.

## Decisions

- EN microcopy for values like "Fund size" uses "3 000 M RUB" (space as thousands separator, Russian financial convention), which is acceptable for an international LP audience familiar with RUB denominations.
- Proper names ("ТрендСтудио" → "TrendStudio") are localised in Hero, TopNav logo, and Footer brand.
- Section titles like "Distribution" / "Waterfall 2.0" are retained as-is in RU — these are globally-recognised finance/industry terms.
