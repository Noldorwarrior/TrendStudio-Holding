# i18n Gaps — Landing v2.0

## Coverage summary (W6)

**Total keys:** 94 RU / 94 EN. Symmetry: 100%. `[EN TBD]` placeholders: 0.

## Scope (v2.0)

Покрытие i18n в v2.0 ограничено следующими областями (по плану MAJOR-i18n-pass):

- Nav-links TopNav2 (9 keys: `nav.*`)
- Hero headings + CTA (5 keys: `hero.*`)
- Section-headings для 25 секций (25 keys: `*.title`)
- CTA buttons: Zoom/Email/Telegram/NDA/Download (10 keys: `cta.*`)
- Footer все строки (14 keys: `footer.*`)
- Legal intro + NDA Gate (6 keys: `legal.*`)
- Term Sheet row-labels (13 keys: `term.*`)
- Waterfall tier labels (4 keys: `wf.*`)
- M3 Commitment Calculator labels (8 keys: `m3.*`)

## Not covered (v2.1 roadmap)

Тело секций (параграфы, карточки, подписи внутри графиков, tooltips) — RU only. Причина: рефакторинг 25 секций под i18n-хелпер рискован для 6-wave timeline и может сломать invariants. Планируется расширение в v2.1.

Области под будущее покрытие:
- ThesisCard bodies (3 cards × ~50 слов)
- MarketKpi labels (4 × короткие метки)
- Monte-Carlo simulator UI-strings (~15)
- Pipeline projects descriptions (7 × карточки)
- Team/Advisory member bios (~10 × 40 слов)
- Operations 6-step descriptions
- Risks 12 карточек + modal
- FAQ 15 Q&A + 4 category labels
- Distribution channel cards + tooltips
- Waterfall intro block

## EN translation quality

Перевод сделан без машинного перевода, с использованием PE/LP терминологии (hurdle, MOIC, DPI, carry, catch-up — оставлены в исходной англ. форме как общеупотребительные). Все переводы проверены на симметрию ключей `i18n_check.py --strict`.

Неуверенные формулировки отсутствуют — placeholder `[EN TBD]` не использован.
