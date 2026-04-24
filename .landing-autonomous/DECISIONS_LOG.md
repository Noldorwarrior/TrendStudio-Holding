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
