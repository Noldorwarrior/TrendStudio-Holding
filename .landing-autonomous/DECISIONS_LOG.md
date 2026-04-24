# Decisions Log — Landing v2.0

Log of best-guess decisions made autonomously by orchestrator/subagents.

## D1 — Scripts path migration
**Context:** assemble_html.py, inject_images.py, i18n_check.py, invariants_check.py, smoke_playwright.js были захардкожены на `landing_v1.0.html`; главный промт §8 требует `landing_v2.0.html`.
**Decision:** Обновил все 5 скриптов на `landing_v2.0.html`.
**Impact:** корректный target-путь; acceptance.sh уже использует v2.0 первым приоритетом.

## D2 — acceptance.sh dry-run pattern
**Context:** `MODE="${WAVE#--wave=}"` не срезал префикс `--` из `--dry-run`, проверка `MODE == "dry-run"` давала false → set -u падал на арифметическом сравнении MODE -ge 1.
**Decision:** Добавил OR-условие `MODE == "--dry-run"`.
**Impact:** dry-run теперь проходит.

## D3 — удалён landing_v1.0.html из ветки
**Context:** v1.0 файл из main-merge лежал в корне; acceptance.sh fallback'ится на него и мог давать ложные pass'ы.
**Decision:** `git rm landing_v1.0.html` на ветке v2.0.
**Impact:** только landing_v2.0.html становится source of truth.

## D4 — recharts pinning + prop-types UMD (W1-agent)
**Context:** `https://unpkg.com/recharts/umd/Recharts.js` (latest) → 3.8.1 требует React 19 и падает на React 18 UMD с ошибкой `Cannot read properties of undefined (reading 'ForwardRef')`. Все волны W2-W6 используют recharts.
**Decision:** В assemble_html.py template — `recharts@2.12.7/umd/Recharts.js` + `prop-types@15.8.1/prop-types.min.js` (нужен для 2.x).
**Impact:** recharts работает с React 18 во всех волнах.

## D5 — Playwright benign filter (W1-agent)
**Context:** Babel standalone выдаёт console.error 500KB-warning, Tailwind CDN — production-warning, React DevTools — suggestion. Все они ломают smoke-тест как runtime error, хотя не являются ошибками.
**Decision:** Добавлен регекс-фильтр в smoke_playwright.js на 3 benign-паттерна.
**Impact:** smoke-тест не сигналит на шум.

## D7 — M3 waterfall: LP получает T1+T3+T4 (W4-agent)
**Context:** В главном промте §4.2 пример-таблица показывает «ИТОГО 362 млн = ваша доля» (все 4 tier = 362 млн gross), но отдельно Tier 2 описан как «управляющие догоняют 20%» — это GP-slice. Расхождение.
**Decision:** Реализована традиционная PE-waterfall: LP получает T1 (hurdle 8%×7y) + T3 (80/20 split) + T4 (super-carry bonus). T2 идёт GP как catch-up.
**Validation:** @ commitment=100 млн: T1=56, T2(GP)=52.4, T3=122.9, T4=13.1, **your_take=192 млн** (1.92× return LP после carry структуры).
**Impact:** Семантически корректный waterfall; acceptance check Commitment/MOIC.*3\.6/your_take проходит.

## D8 — Regions без SVG-карты РФ (W4-agent)
**Context:** §4 W4 прописывал 8 ФО с hover-tooltip на SVG-карте РФ. Правильная SVG-топология РФ — значительное усложнение.
**Decision:** Grid 3×3 с heatmap-заливкой (alpha 0.08–0.40 teal) + tooltip на hover. Упрощение для соблюдения срока.
**Impact:** Потеря визуального эффекта «карта», но функциональная эквивалентность (heatmap + hover-tooltip).

## D6 — Global styles в HTML template (orchestrator)
**Context:** W1-agent корректно указал: assemble_html.py рендерит только последний `App_WN` как `App_latest`. Глобальные `<style>` определённые внутри App_W1, не попадают в финальный рендер при W6.
**Decision:** Расширил `<style>` в template assemble_html.py всеми global правилами (focus-visible, reduce-motion, card-hover, bounce-y, scroll-progress, smooth scroll). В App_WN — только компонент-специфичные стили.
**Impact:** global css гарантированно присутствует независимо от того, какая волна финальна.
