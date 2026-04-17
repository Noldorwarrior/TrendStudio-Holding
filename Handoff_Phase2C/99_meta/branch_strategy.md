# Branch Strategy — Phase 2C

## Иерархия веток

```
main
  └── v1.2.0-phase2b (tag)
       └── claude/deck-v1.2.0-phase2c          ← базовая для Phase 2C
            ├── phase2c/infra-skeleton         ← PR #101
            ├── phase2c/infra-build            ← PR #102
            ├── phase2c/infra-i18n             ← PR #103
            ├── phase2c/infra-whatif-data      ← PR #104
            ├── phase2c/infra-e2e              ← PR #105
            ├── phase2c/g13-keyboard           ← PR #110
            ├── phase2c/g17-scroll-trigger     ← PR #111
            ├── phase2c/g08-ambient            ← PR #112
            ├── phase2c/g09-sound              ← PR #113
            ├── phase2c/g12-parallax           ← PR #114
            ├── phase2c/g14-context-menu       ← PR #115
            ├── phase2c/g15-drag               ← PR #116
            ├── phase2c/g11-easter             ← PR #117
            ├── phase2c/g16-whatif             ← PR #118
            ├── phase2c/g10-cinema             ← PR #119
            ├── phase2c/slide-01               ← PR #201
            ├── phase2c/slide-02               ← PR #202
            ├── ...
            └── phase2c/slide-25               ← PR #225

claude/phase2c-handoff                         ← параллельная, только Handoff_Phase2C/
```

## Правила

1. **Base** всех feature-веток — `claude/deck-v1.2.0-phase2c`.
2. **Feature-ветки** никогда не коммитят в `main` напрямую.
3. **Merge direction:** feature → `claude/deck-v1.2.0-phase2c` (через PR, делает Cowork).
4. **Rebase стратегия:** `git rebase claude/deck-v1.2.0-phase2c` перед PR, чтобы diff был чистый.
5. **Не удалять** merged feature-ветки без согласования — они нужны для audit trail.
6. **После Волны 7 QA:** Cowork создаёт PR `claude/deck-v1.2.0-phase2c` → `main` и tag `v1.3.0-phase2c`.

## Именование

- **Модули:** `phase2c/g<NN>-<slug>` где NN = 08-17, slug = ambient | sound | cinema | easter | parallax | keyboard | context-menu | drag | whatif | scroll-trigger
- **Слайды:** `phase2c/slide-<NN>` где NN = 01-25 (всегда 2 цифры)
- **Инфра:** `phase2c/infra-<slug>` где slug = skeleton | build | i18n | whatif-data | e2e
- **QA:** `phase2c/qa-<slug>` где slug = a11y | perf | budget-regex | p5

## Конфликты

Если два PR трогают один файл (например, `src/css/cinematic.css`):
1. Второй PR делает `git rebase claude/deck-v1.2.0-phase2c` после мержа первого
2. Разрешает конфликт (CSS — обычно append, проблем не должно)
3. Force-push `git push -f origin phase2c/xxx`
4. Cowork перепроверяет ревью (diff может измениться)

## SSH ключ для push

Используется account-wide ключ в `.git-ssh/id_ed25519`. Пример:
```bash
GIT_SSH_COMMAND="ssh -i ~/.git-ssh/id_ed25519 -o IdentitiesOnly=yes" \
  git push origin phase2c/g13-keyboard
```

_Версия: 1.0 (17 апр 2026)_
