# cc_autonomous_package_v2.1/ — Landing v2.1 Autonomous Build

**Версия:** 2.1
**Отличие от v2.0:** content shift «холдинг → фонд» + 4 системных принципа (интерактив=инфо, wow-anim, scroll-anim, load-anim) + premium polish (Apple/Stripe/Linear references) + roadmap-modality (Kanban удалён) + 15+ конкретных fix'ов по ревью пользователя.

## Как запустить

### Шаг 1. Bootstrap

```bash
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package_v2.1/scripts/bootstrap.sh
```

Создаст ветку `claude/landing-v2.1-autonomous` от main, скопирует пакет, проверит 20 изображений.

### Шаг 2. Запустить CC с полной автономией

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code --dangerously-skip-permissions
```

В CC вставьте:
> Прочитай `.landing-autonomous/PROMPT_Landing_v2.1_AUTONOMOUS.md` и следуй §7 как orchestrator. Полная автономия, никаких уточняющих вопросов. Target: landing_v2.1.html, tag v2.1.0-landing-autonomous. Контекст: холдинг ТрендСтудио приходит к фонду-инвестору за партнёрством по 7 проектам (НЕ LP-сайт). Для Python: `REPO_ROOT=$(pwd) python3 ...`.

### Шаг 3. Уйти на 8-12 часов

CC выполнит 6 волн + П5 + PR + auto-merge. Прогресс — в `.landing-autonomous/PROGRESS.md`.

### Шаг 4. Проверка

```bash
cat .landing-autonomous/PROGRESS.md
cat .landing-autonomous/FINAL_REPORT.md
cat .landing-autonomous/DECISIONS_LOG.md
cat .landing-autonomous/p5_verification_report.json | python3 -m json.tool
open landing_v2.1.html
gh pr view
```

## Что изменилось (v2.0 → v2.1)

См. PROMPT_Landing_v2.1_AUTONOMOUS.md §11 changelog. 16 ключевых отличий:

1. Content: холдинг → фонд (70% текста переписан)
2. 4 systemic principles во всех 25 секциях
3. Premium polish с референсами
4. Roadmap-modality: Kanban s08 удалён, всё в Gantt s13
5. FAQ перемещён в низ
6. Legal → flip-карточки (collapsed/expanded)
7. Term Sheet → interactive accordion
8. Team/Advisory → 2-state card с gradient border
9. M2 → rail drop-target + FLIP-reset + project posters
10. Tax Credits → effective rate cap 85%
11. s05 Economics KPI → flip-карточки
12. s05 Waterfall → cascade с particles
13. M1 histogram → tooltip fix + click drill-down
14. Hero → mask-gradient fix color-seam
15. Thesis → asymmetric premium layout
16. M3 → Partner / Lead / Anchor badges (не LP Supporter/Sponsor/Anchor)
