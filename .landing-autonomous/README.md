# cc_autonomous_package/ — Landing v1.0 Autonomous Build

**Версия:** 1.2
**Размер пакета:** ~5 MB (20 JPEG + 6 JSON + 4 md docs + 10 scripts + 6 WAVE_PROMPTS)

---

## Что это

Self-contained пакет для автономной сборки HTML-лендинга ТрендСтудио Холдинг через Claude Code.
Запуск 1 командой → CC работает 8-12 часов → готовый PR в main.

## Структура

```
cc_autonomous_package/
├── PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md  # ГЛАВНЫЙ промт для orchestrator
├── SHARED_STATE.md                                # state-машина
├── README.md                                      # это
├── canon/                                         # 6 Canon JSONs (SSOT)
│   ├── landing_canon_base_v1.0.json
│   ├── landing_canon_schema_v1.0.json
│   ├── landing_canon_extended_v1.0.json
│   ├── landing_canon_extended_schema_v1.0.json
│   ├── landing_a3_decisions_v1.0.json
│   └── landing_img_meta_v1.0.json
├── docs/                                          # 4 справочных
│   ├── Landing_v1.0_HANDOFF_Stage_B.md
│   ├── Landing_v1.0_HANDOFF_Stage_B_I18N.md
│   ├── HANDOFF_Landing_v1.0_A1_to_A2.md
│   └── Gemini_TZ_images_v1.0.md
├── WAVE_PROMPTS/                                  # 6 спец для субагентов
│   ├── W1.md — Foundation + Hero + Thesis + Market
│   ├── W2.md — Economics + M1 Monte-Carlo
│   ├── W3.md — Pipeline + Team + Operations (16 images)
│   ├── W4.md — Risk + Roadmap + M2 + M3
│   ├── W5.md — Proof + CTA + 6 sims
│   └── W6.md — Polish + i18n + a11y + FINAL
├── images/                                        # 20 JPEG (4.4 MB)
│   ├── team_01_ceo.jpg
│   ├── ...
│   └── hero_film_reel.jpg
├── images_manifest.json                           # sha256 + size для bootstrap-проверки
└── scripts/                                       # 10 исполняемых
    ├── bootstrap.sh                               # setup repo, copy files, verify images
    ├── verify_images.py                           # sha256 pre-flight
    ├── inject_images.py                           # base64 placeholder replace
    ├── acceptance.sh                              # per-wave gate
    ├── invariants_check.py                        # 7 инвариантов
    ├── i18n_check.py                              # RU/EN симметрия
    ├── smoke_playwright.js                        # runtime + screenshots
    ├── assemble_html.py                           # merge waves → single HTML
    ├── p5_max_32_32.py                            # П5 «Максимум» финал
    └── notify_progress.sh                         # PROGRESS.md обновитель
```

## Как запустить

### Шаг 1. Bootstrap (из терминала, вручную)

```bash
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package/scripts/bootstrap.sh
```

Что делает bootstrap:
1. `cd TrendStudio-Holding`, checkout main, pull
2. Создаёт/чекаутит ветку `claude/landing-v1.0-autonomous`
3. Копирует пакет → `.landing-autonomous/`
4. Копирует 20 JPEG → `data_extract/images_processed/`
5. Проверяет sha256 всех 20 изображений
6. Ставит Python deps (jsonschema) и Node deps (playwright)

**Если bootstrap упал:** см. error message, починить, запустить повторно (idempotent).

### Шаг 2. Запустить Claude Code

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code
```

В интерактивном промте CC вставить:
> Прочитай `.landing-autonomous/PROMPT_Landing_ClaudeCode_AUTONOMOUS_v1.2.md` и следуй инструкциям §1 как orchestrator. Действуй автономно. Для всех Python-запусков экспортируй `REPO_ROOT=$(pwd)`.

### Шаг 3. Ждать 8-12 часов

CC выполняет 6 волн + финал. Прогресс — в `.landing-autonomous/PROGRESS.md`.

### Шаг 4. Проверка результата

```bash
cat .landing-autonomous/PROGRESS.md
cat .landing-autonomous/FINAL_REPORT.md
cat .landing-autonomous/p5_verification_report.json | jq '.score, .total, .verdict'
open landing_v1.0.html
gh pr view
```

## Риски и откат

Если результат не понравился:
```bash
# Закрыть PR без мержа
gh pr close <PR_NUM>
# Удалить ветку
git checkout main
git branch -D claude/landing-v1.0-autonomous
git push origin :claude/landing-v1.0-autonomous
```

Или, если auto-merge уже сработал:
```bash
git revert <merge-commit-sha>
git push origin main
```

## Что получите в итоге

- `landing_v1.0.html` (~6.5 MB, single-file, offline-ready)
- `DECISIONS_LOG.md` — что CC решил сам и почему (ключевой артефакт эксперимента)
- `SKIPPED.md` — что пропущено
- `I18N_GAPS.md` — EN-переводы, оставшиеся [TBD]
- `p5_verification_report.json` — П5 «Максимум» 32/32 score
- `FINAL_REPORT.md` — summary запуска
- Git-история ветки: 6 commits + final + tag `v1.0.0-landing-autonomous`
- Screenshots из Playwright smoke (6 штук)

---

**Создано:** 2026-04-24
**Автор промта:** Claude Sonnet 4.7 (Cowork)
**Для запуска:** Claude Code CLI
