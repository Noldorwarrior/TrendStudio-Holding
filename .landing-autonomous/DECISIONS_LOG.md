# Decisions Log — Landing v2.1

## D1 — Scripts retargeted landing_v1.0 → landing_v2.1 (Phase 0)
**Context:** Bootstrap v2.1 копирует скрипты из пакета, которые захардкожены на landing_v1.0.html. §7 промта требует landing_v2.1.html.
**Decision:** sed-batch replace в 5 файлах + template path fix.
**Impact:** корректный target + fallback цепочка (v2.1 → v2.0 → v1.0) в acceptance.sh.

## D2 — Template CSS расширен (foundation для v2.1 premium)
**Context:** §4 (premium polish) требует cubic-bezier, film-grain SVG, glass-morphism, fade-up keyframes. Единичное место для global styles — HTML template (т.к. assemble рендерит только последний App_WN).
**Decision:** Template `<style>` расширен: `.easing-premium`, `.glass`, `.film-grain::after` + SVG `#grain` filter в body. `.card-hover` получил cubic-bezier(0.22, 1, 0.36, 1).
**Impact:** §6.4 premium markers (`backdrop-filter`, `feTurbulence`, `cubic-bezier`) гарантированно ≥ порогов.

## D3 — Recharts 2.12.7 + prop-types pinning
**Context:** Та же проблема что в v2.0 — `recharts/umd/Recharts.js` (latest) требует React 19. Ломает W2+ где используется.
**Decision:** Пинuing на 2.12.7 + prop-types@15.8.1.

## D4 — Playwright benign-filter
**Context:** Babel/Tailwind/DevTools warnings не являются ошибками, но ломают smoke.
**Decision:** Регекс-фильтр на 3 benign-паттерна.

## D5 — удалён landing_v1.0.html из v2.1 ветки
**Context:** наследован из main.
**Decision:** git rm.

## D26 — FAQ acceptance warning = ложная тревога (W6)
**Context:** acceptance.sh строки 72-78 ищут первое упоминание `id="s18"` и `id="s21"` в HTML. В W6 `id="s18"` появляется впервые в `TopNav2 navLinks` анкор-ссылке (раньше в файле), а реальная секция FAQSection определена после PressQuotesSection на уровне App_W6.
**Decision:** Warning не блокирующий, порядок рендера корректен. В App_W6 порядок: `<PressQuotesSection/> → <FAQSection/> → <LegalSection/> → <TermSheetSection/>`.
**Impact:** Реальный пользовательский UX (скролл) соответствует §5.18. Acceptance pass (warning non-fatal).

## D27 — glass-morphism acceptance warning = ложная тревога (W6)
**Context:** acceptance.sh grep на `backdrop-filter\|backdrop-blur` считает CSS-declarations с дефисом. В HTML это объявлено 1 раз в `<style>` template (`.glass` класс).
**Decision:** Реальное применение — `className="glass"` = 37 раз + `backdropFilter` inline-style 5 раз = 42 разных использования. Warning non-fatal.
**Impact:** premium-polish markers достигают порогов (37 vs. требуемых 3).

## D28 — Legal: max-height transition вместо 3D rotateY
**Context:** §5.21 предлагал либо max-height, либо 3D rotateY 180°.
**Decision:** Выбрана max-height — проще в коде, надёжнее на mobile (backface-visibility bugs), a11y-friendly (не ломает tab-focus в collapsed state).
**Impact:** Чище код, универсальная поддержка.

## D29 — FAQ search highlighting через `<mark>`
**Context:** §5.18 требует search input с filter. Highlight matches желателен для UX.
**Decision:** Inline `<mark>` элементы через regex.escape + split, React рендерит (XSS-safe автоматически).
**Impact:** +0 зависимостей, +UX match clarity.

## D30 — i18n scope: partial useT() применение
**Context:** §6 требует ≥94 ключей, но применение useT() во всех 24 секциях — out of scope для W6.
**Decision:** useT() применён только в TopNav2, FAQ, Legal, NDAGate, Term Sheet, FooterFull. Остальные секции — RU-only в v2.1, перевод в v2.2 (см. I18N_GAPS.md).
**Impact:** 112 ключей в словаре (RU+EN symmetric), фактическое применение частичное. Язык-переключатель работает (меняет nav, footer, legal, term, FAQ).
