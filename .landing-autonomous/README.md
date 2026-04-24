# cc_autonomous_package_v2.2/ — Landing v2.2 (grep-contract enforced)

**Версия:** 2.2
**Ключевая особенность:** Premium polish и content shift enforced через grep-contract'ы. Любая волна фейлится если grep не находит required pattern.

## Отличие от v2.1

v2.1 делал premium polish «по желанию» — CC часто пропускал. v2.2 делает каждый premium-эффект **обязательным**: acceptance.sh после волны grep'ает HTML на наличие `feTurbulence`, `mask-image`, `backdrop-filter`, `@keyframes kenburns`, etc. Если паттерна нет — CC делает retry. Это заставляет премиум применяться фактически.

## Как запустить

```bash
# 1. Bootstrap
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package_v2.2/scripts/bootstrap.sh

# 2. Claude Code автономно
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding
claude code --dangerously-skip-permissions
```

В CC вставить:
> Прочитай `.landing-autonomous/PROMPT_Landing_v2.2_AUTONOMOUS.md`. Следуй §6 как orchestrator. Grep-contracts §3+§4 — жёсткий gate. Фейл → retry (1 раз) → если ещё fail → SKIPPED. Target: landing_v2.2.html. Полная автономия.

## Ожидаемое время

10-14 часов (с учётом возможных retry'ев на grep-фейлы).

## После завершения

```bash
cat .landing-autonomous/PROGRESS.md
cat .landing-autonomous/FINAL_REPORT.md
cat .landing-autonomous/SKIPPED.md    # ключевое: что не удалось даже с retry
cat .landing-autonomous/DECISIONS_LOG.md
open landing_v2.2.html
gh pr view
```
