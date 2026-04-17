# qa_reports

Здесь сохраняются JSON-отчёты прогонов E2E runner.

## Файлы
- `e2e_report.json` — последний прогон `npm run e2e` (gitignored)
- `.gitkeep` / `.gitignore` — инфраструктура директории (commit'ятся)

## Формат отчёта
См. `PR_105_PhaseA_spec_FINAL.md §3.8` (Cowork outputs, вне репо).
Кратко: `{ run_id, html_path, browser, strict_memory, duration_ms, passed,
gates: { smoke, fps, memory, axe }, slides: [...] }`.

## Env-переменные
- `HTML_PATH` — путь к HTML относительно repo root
  (default: `Deck_v1.2.0/TrendStudio_LP_Deck_v1.2.0_Interactive.html`)
- `REPORT_PATH` — куда писать JSON
  (default: `qa_reports/e2e_report.json`)
- `E2E_STRICT_MEMORY` — `1` = fail на non-Chromium, `0`/unset = skip + warn
- `E2E_BROWSER` — `chromium` / `firefox` / `webkit` (default: `chromium`)

## Запуск
```bash
npm run e2e                                    # default: chromium + v1.2.0 HTML
HTML_PATH=Deck_v1.3.0/foo.html npm run e2e     # override HTML (after Phase 2D)
E2E_STRICT_MEMORY=1 npm run e2e                # CI-grade memory check
E2E_BROWSER=firefox npm run e2e                # graceful memory skip
```

Exit code: `0` all gates green; `1` at least one gate failed; `2` uncaught exception.
