# CC_TRIGGER.md — команда для запуска Claude Code

**Как пользоваться:** скопируйте текст ниже одним блоком и вставьте в новую сессию Claude Code внутри репозитория `TrendStudio-Holding`. Cowork параллельно продолжит писать MODULE_PROMPTs и слайд-карточки — они появятся в ветке `claude/phase2c-handoff` до того, как вы дойдёте до соответствующей волны.

---

## ТЕКСТ-ТРИГГЕР (копировать блок)

```
Ты — Claude Code. Начинаем Phase 2C Cinematic Premium Visual Overhaul над Phase 2B.

Рабочий репозиторий: TrendStudio-Holding (ты уже в нём).

Сделай строго по шагам:

1) Прочти полностью и по порядку:
   - Handoff_Phase2C/README.md
   - Handoff_Phase2C/99_meta/branch_strategy.md
   - Handoff_Phase2C/99_meta/commit_convention.md
   - Handoff_Phase2C/99_meta/CC_CHECKLIST.md
   - Handoff_Phase2C/00_infra/INFRA_PROMPT.md

2) Volna 0 (setup):
   - Обнови теги: git fetch --tags origin
   - Убедись, что тег v1.2.0-phase2b существует: git tag | grep phase2b
   - Создай базовую ветку: git checkout v1.2.0-phase2b && git checkout -b claude/deck-v1.2.0-phase2c && git push -u origin claude/deck-v1.2.0-phase2c
   - Прогон тестов Phase 2A+2B: npm test (ожидание — 350+ зелёных)
   - Если что-то не так — остановись и сообщи, не продолжай.

3) Volna 1 (5 PR параллельно) — см. INFRA_PROMPT.md и CC_CHECKLIST.md разделы PR #101-#105:
   - PR #101 Skeleton (ветка phase2c/infra-skeleton)
   - PR #102 Build + Budget (ветка phase2c/infra-build)
   - PR #103 I18N Keys ~80 штук, RU↔EN symmetric (ветка phase2c/infra-i18n)
   - PR #104 whatif_formulas.json (ветка phase2c/infra-whatif-data)
   - PR #105 E2E Setup puppeteer (ветка phase2c/infra-e2e)

   Для каждого PR:
   - ветка от claude/deck-v1.2.0-phase2c
   - коммиты по commit_convention.md (префикс Infra:)
   - push в origin, открой PR
   - НЕ мержь сам

4) Остановись после того, как все 5 PR запушены и открыты. Сообщи Cowork URLs PR, не переходи к Волне 2.

Важные инварианты:
- master-файл правды: /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/CC_PHASE2C_SPEC_v2.md (read-only)
- Бюджет после Волны 1: ориентир 390-420 KB, hard limit 450 KB (подушка для Волн 2-6 ≥ 200 KB)
- Запрещено: eval, new Function, localStorage, document.write, Web Workers
- i18n: каждый новый ключ одновременно в ru.json и en.json (тест i18n_symmetry.test.js должен проходить)
- Jest (не vitest) — идиомы jest.fn(), jest.mock()
- При любой неопределённости, противоречии с master-файлом или красном тесте — остановись и открой issue, не отключай тест.

Если понимаешь — начинай шаг 1. Пиши короткие статусы, чтобы Cowork видел прогресс.
```

---

## Что Cowork делает параллельно

Пока CC работает над Волной 1 (ориентир 8-12 часов):

1. Пишет `10_modules/g13_keyboard/MODULE_PROMPT.md` (первый блокер Волны 2)
2. Пишет `10_modules/g17_scroll_trigger/MODULE_PROMPT.md`
3. Пишет остальные 8 MODULE_PROMPTs (G8, G9, G10, G11, G12, G14, G15, G16)
4. Пишет 25 SLIDE_PROMPTs + слайд-карточки в master
5. Пишет 4 QA промта (30_qa/)

Готовые промты коммитятся в ветку `claude/phase2c-handoff` и становятся доступны CC по мере необходимости.

---

## Что если CC закончит Волну 1 до того, как готов G13 MODULE_PROMPT

CC ждёт Cowork (не запускает Волну 2 без промта). В этом случае Cowork ускоряется или отдаёт G13 в сокращённой черновой форме с явной пометкой «draft, требует уточнений».

---

_Версия CC_TRIGGER: 1.0 (17 апр 2026)_
