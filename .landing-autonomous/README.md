# cc_autonomous_package_v2/ — Landing v2.0 Autonomous Build

**Версия:** 2.0
**Отличие от v1.2:** систематический animation/interaction layer + 6 fix-спек для проблемных секций (M2, M3, Waterfall, Tax Credits, Distribution, Legal)
**Размер:** ~5 MB (images unchanged)
**Базовая:** анализ результатов v1.0 autonomous run (6 выявленных проблем)

## Как запустить

### Шаг 1. Bootstrap

```bash
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package_v2/scripts/bootstrap.sh
```

Создаст ветку `claude/landing-v2.0-autonomous` от main, скопирует пакет, проверит 20 изображений.

### Шаг 2. Запустить CC с полной автономией

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code --dangerously-skip-permissions
```

В CC вставьте:
> Прочитай `.landing-autonomous/PROMPT_Landing_v2.0_AUTONOMOUS.md` и следуй §1-§4 как orchestrator. Полная автономия, никаких уточняющих вопросов. Для Python: `REPO_ROOT=$(pwd) python3 ...`

### Шаг 3. Уйти на 8-12 часов

CC выполнит 6 волн + П5 32/32 + PR + auto-merge. Прогресс — в `.landing-autonomous/PROGRESS.md`.

### Шаг 4. Проверка

```bash
cat .landing-autonomous/PROGRESS.md
cat .landing-autonomous/FINAL_REPORT.md
cat .landing-autonomous/DECISIONS_LOG.md
cat .landing-autonomous/p5_verification_report.json | python3 -m json.tool
open landing_v2.0.html
gh pr view
```

## Что изменилось (v1.2 → v2.0)

1. **Системно:** Animation & Interaction Layer во всех 25 секциях (scroll-reveal, hover, Tooltip, stagger)
2. **M2 Pipeline Builder:** полный refactor семантики — rail = pool, колонки = empty initial, IRR меняется от drag
3. **M3 LP Sizer → Commitment Calculator + mini-waterfall:** позитивный personal-calc вместо «0% probability»
4. **s20 Waterfall:** intro на простом языке + Tooltip на hurdle/catch-up/super-carry/MOIC + персональный LP-пример
5. **s16 Tax Credits:** inline-калькулятор budget→субсидия в каждой карточке
6. **s19 Distribution:** donut 100% mix + horizontal timeline release windows + hover-интерактив
7. **s21 Legal:** mobile accordion + stagger + NDA conversion gate с checkbox

## Итог

Landing ловит LP за счёт:
- Personal calculator (M3 replace) — «вы получите X млн»
- Tax credits calculator — «ваш бюджет → ваша субсидия»
- Waterfall на простом языке — механика без PE-жаргона
- Visual polish — scroll-reveal и hover на всех карточках
- NDA gate в Legal — prolongation to PPM
