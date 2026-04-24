# HANDOFF — TrendStudio Landing v1.0 · A1 → A2

**Дата:** 2026-04-19
**Статус:** Этап A подготовки, A1 завершён (3% / 100%). Дальше — A2.
**Режим:** этапный, паузы между подэтапами, вопросы через AskUserQuestion.

---

## 1. КОПИ-ПАСТ ПРОМТ ДЛЯ НОВОГО ОКНА

Вставь текст ниже в новое окно и отправь. Claude восстановит контекст из памяти + из этого файла.

```
Продолжаем работу над TrendStudio-Holding Landing v1.0.

Контекст-пакет лежит здесь:
/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/HANDOFF_Landing_v1.0_A1_to_A2.md

Инструкции:
1) Прочитай HANDOFF-файл целиком — там сводка A1 + следующий шаг A2 + все якоря.
2) Прочитай auto-memory (MEMORY.md) — там история проекта.
3) Убедись, что оба Canon-файла (schema + base) на месте в обеих локациях:
   /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/
   /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/
   sha256 должен совпадать попарно.
4) Подтверди готовность к A2 в формате:
   `✅ A1 подтверждён, готов к A2 [Canon Extended +4%, итого 7%]. Начинать?`
5) После моего «да» — запусти A2 одним этапом с паузой в конце, отчёт по шаблону:
   `✅ [A2] Canon extended готов. Прогресс: 7% / 100%. Следующий: [A3].`

Всегда: русский язык, AskUserQuestion для вопросов, этапный режим.
```

---

## 2. ТЕКУЩИЙ СТАТУС

### ✅ A1 — Canon Base JSON (3%) — ЗАВЕРШЁН

**Артефакты** (идентичные в двух локациях, sha256 match):

| Файл | Размер | SHA-256 (первые 16 байт) |
|---|---:|---|
| `landing_canon_schema_v1.0.json` | 25 642 B | `c739b3bde4782a3c…` |
| `landing_canon_base_v1.0.json` | 55 326 B | `7cc163afabbe0925…` |

**Локации (страховка 1+2):**
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/` — Cowork SSOT
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/` — CC/git SSOT

**Валидация:**
- JSON parse: OK (9 ключей в schema, 23 в base)
- Schema compliance (Draft-07 strict, `additionalProperties: false`): **VALID** (0 ошибок, python jsonschema)
- 10 якорей через `const` — подтверждены
- 25 секций narrative, 7 проектов, 4 стадии, 5 team + 4 advisory, 12 рисков, 7-летний roadmap, 4 сценария, 15 FAQ

---

## 3. ЯКОРНЫЕ ЗНАЧЕНИЯ (ЗАМОРОЖЕНЫ)

Эти 10 чисел — единая правда, через `const` в Schema. Любое отклонение ломает валидацию.

| Путь в Canon | Значение | Источник |
|---|---:|---|
| `fund.lp_size_mln_rub` | **3 000** млн ₽ | LP Memo v1.1.0 |
| `horizon.years` | **7** | Finmodel v1.4.4 |
| `pipeline.projects` (count) | **7** | Investor Model v3.0 |
| `pipeline.stages` (count) | **4** | Investor Model v3.0 |
| `returns.irr_internal_w5vd` | **24.75%** | Investor v1.0.1 Internal |
| `returns.irr_public_w3` | **20.09%** | Investor v1.0.1 Public |
| `returns.mc_p50_internal` | **13.95%** (диапазон 13.5–14.5) | Investor v1.0.1 MC |
| `returns.mc_p50_public` | **11.44%** (диапазон 11.0–12.0) | Investor v1.0.1 MC |
| `finmodel.tests_passed` | **348** | Finmodel v1.4.4 |
| `finmodel.version` | **"v1.4.4"** | Finmodel v1.4.4 |

---

## 4. СЛЕДУЮЩИЙ ШАГ — A2 (Canon Extended, +4%, итого 7%)

### Что делать в A2

Создать `landing_canon_extended_v1.0.json` + расширить `landing_canon_schema_v1.0.json`
(либо отдельная schema `landing_canon_extended_schema_v1.0.json` — решить в начале A2).

**23 дополнительных блока** (UI/UX/контент, которые не вошли в базовый инвест-контент):

1. `canon.images` — реестр 20 изображений (имя, размер, sha256, alt_ru, alt_en, role, placement_section) — source: `data_extract/images_processed/manifest.json`
2. `canon.visualizations` — 22 типа визуализаций (tier Marquee/Hero/Standard, lib D3v7/Threejs/GSAP, payload-schema)
3. `canon.simulators` — 13 симуляторов (3 Marquee + 4 Hero + 6 Standard), привязка к секциям
4. `canon.navigation` — TOC, breadcrumbs, scroll-spy, prev/next
5. `canon.i18n.skeleton` — ключи ui/a11y/narrative (полное наполнение — позже, этап C)
6. `canon.audio` — 3 трека (ambient, tension, release), cue-points, mute-default
7. `canon.animations` — переходы, Scroll-Trigger cues, reveal-patterns
8. `canon.palette` — Dark Cinematic Nolan/Dune, signature `shadows_of_sunset_v1`, токены
9. `canon.typography` — 2 шрифта (display + body), шкала, line-heights
10. `canon.modals` — Drill-Down структуры (13+ модалок: simulators + team_bio + project_detail)
11. `canon.forms` — Subscribe/Contact/LP-intake, валидация, reply-channels
12. `canon.cta` — 4 основных + 7 secondary, placement map, URL-targets
13. `canon.hero` — hero-bg sequence, parallax-layers, hero_film_reel integration
14. `canon.footer` — контакты, лицензии, копирайт, compliance links
15. `canon.legal_disclaimers` — 4 disclaimer'а (forward-looking, tax, jurisdiction, investor-risk)
16. `canon.social_proof` — 8 press-цитат (layout: слайдер vs grid vs marquee)
17. `canon.timeline_roadmap` — UI-представление 7-летнего roadmap (scroll-horizontal)
18. `canon.waterfall_diagram` — 4-tier (ROC → 8% pref → 100% catch-up → 80/20) payload
19. `canon.tax_credits_ui` — 4 программы, интерактивная карта
20. `canon.scenario_switcher` — base/bull/bear/stress, state-machine, URL-hash
21. `canon.regions_map` — 9 регионов, hover/click interactions
22. `canon.benchmark_chart` — 5 studios, радар/бар, payload
23. `canon.kpi_dashboard` — 5 ролей × KPI, spark-lines

### Контракт A2
- То же правило страховки: запись в ОБЕ локации (`/Холдинг/data/` + `/TrendStudio-Holding/data_extract/`), sha256 match
- Схема строгая Draft-07, `additionalProperties: false`
- Все ID по паттернам (`^s\d{2}$`, `^t\d{2}$`, `^sim\d{2}$`, `^viz\d{2}$`, `^img\d{2}$` и т.п.)
- Якоря НЕ ДУБЛИРОВАТЬ — в extended их нет, они уже в base
- Валидация python jsonschema перед отчётом

### После A2
- **A3** (+1%, итого 8%): AskUser gate — интерактивные уточнения (бренд-тон, language-priority, первые CTA, мобильное поведение, audio-default)
- **A4** (+2%, итого 10%): img-meta embed — интеграция 20 sha256 из `manifest.json` в `canon.images` (уже в A2 частично, в A4 — финализация + alt-ru/alt-en generation)
- **Checkpoint A**: approval before Stage B (вейв-режим CC, 5–7 subagents, +70% → 80%)
- **Stage C** (+20% → 100%): Playwright E2E, Lighthouse ≥95, П5 32/32, М4 7/7, релиз

---

## 5. КАРТА АРТЕФАКТОВ (читать в новом окне)

**Критично (читать в первую очередь):**
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/HANDOFF_Landing_v1.0_A1_to_A2.md` — этот файл
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/landing_canon_schema_v1.0.json` — схема A1
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/landing_canon_base_v1.0.json` — контент A1
- `/Users/noldorwarrior/Library/Application Support/Claude/local-agent-mode-sessions/…/memory/MEMORY.md` — auto-memory индекс (авто-загрузка)

**Ссылочно (читать по необходимости):**
- `/Users/noldorwarrior/Documents/Claude/Projects/Холдинг/Промт_HTML_лендинг_Холдинг_v1.2.md` — исходное ТЗ лендинга
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/images_processed/manifest.json` — 20 изображений с sha256
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/post_process_images.sh` — pipeline обработки изображений (уже прогнан)
- `/Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/CLAUDE.md` — code-style проекта (опционально для A2)

---

## 6. PLAN v1.1 — СТРУКТУРА (сокращённо)

**Этап A — Подготовка (10%)**
- ✅ A1 (3%) — Canon Base JSON + strict Schema
- ⏭️ A2 (4%) — Canon Extended (23 UI-блока)
- ⏳ A3 (1%) — AskUser gate
- ⏳ A4 (2%) — img-meta embed

**Checkpoint A** — approval user

**Этап B — Core build (70%)**
- B1 (10%) — HTML skeleton + CSS-tokens + scroll-storytelling
- B2 (15%) — 25 sections HTML markup + текстовое наполнение
- B3 (15%) — 22 visualizations (D3v7 / Three.js r128 / GSAP)
- B4 (15%) — 13 simulators (3 Marquee, 4 Hero, 6 Standard)
- B5 (5%) — i18n (ru/en full, ~400 keys)
- B6 (5%) — audio + animations + modals + forms
- B7 (5%) — integration + URL-state + accessibility base

Режим B: **wave-mode CC**, 5–7 parallel subagents на волну.

**Этап C — Верификация и релиз (20%)**
- C1 (5%) — Playwright E2E (3 браузера: Chromium/Firefox/WebKit)
- C2 (4%) — Lighthouse ≥95 (perf/a11y/best/seo)
- C3 (4%) — П5 Максимум 32/32 (все 32 механизма верификации)
- C4 (3%) — М4 Презентационная 7/7
- C5 (2%) — bugfix round
- C6 (2%) — release (single-file HTML offline, assets inlined)

**Итого:** 3 этапа, 16 подэтапов, 8 чекпоинтов.

---

## 7. ПОЛЬЗОВАТЕЛЬСКИЕ ПРЕДПОЧТЕНИЯ (кратко)

1. **Язык** — русский всегда
2. **Вопросы** — только через AskUserQuestion (интерактивная панель), не плейн-текст
3. **Этапный режим** — работать этапами с паузами, ждать подтверждения
4. **Объёмные спеки** — писать сразу в md-файл, в чат только уведомление + ссылка
5. **Страховка** — 2 локации (Холдинг + TrendStudio-Holding), sha256 должен совпадать попарно
6. **Отчёт** — строго по шаблону: `✅ [Xn] <что готово>. Прогресс: X% / 100%. Следующий: [Xm].`
7. **Верификация** — П5 Максимум 32/32 обязательна после финальной сборки
8. **Канал** для финансовых/госдок/DOCX — отдельные форматы; для лендинга — свои (см. ТЗ v1.2)

---

## 8. ЧЕК-ЛИСТ ДЛЯ СТАРТА В НОВОМ ОКНЕ

- [ ] Отправил промт из §1 (копи-паст)
- [ ] Claude прочитал HANDOFF-файл целиком
- [ ] Claude прочитал MEMORY.md
- [ ] Claude подтвердил наличие 2 файлов × 2 локации + sha256 match
- [ ] Claude написал `✅ A1 подтверждён, готов к A2. Начинать?`
- [ ] Ответил «да» → A2 стартует

---

## 9. БЫСТРЫЙ САНИТИ-ПРОВЕРКА (одна команда в новом окне при желании)

```bash
cd /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data && \
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract && \
shasum -a 256 \
  /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/data/landing_canon_*.json \
  /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding/data_extract/landing_canon_*.json
```

Ожидаемо: 4 хеша в 2 парах:
- `c739b3bde4782a3cead316f4aef6fd4f11df30d594f74ab160bec2dced769900` × 2 (schema)
- `7cc163afabbe0925f8ebd7aa82f8325b5c5243367765158b5b55aaf3679b479a` × 2 (base)

---

**Конец handoff. Новое окно → промт §1 → работа с A2.**
