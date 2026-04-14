# Brief: ТрендСтудио LP Deck v1.1.1 — Premium Interactive HTML

**Задача для Claude Code:** собрать премиальный интерактивный HTML-deck (16:9, 25 слайдов) на основе SSOT (`deck_content.json`) и данных визуализаций (`viz_data.json`).

**Источник правды (SSOT):** `deck_content.json` — не дублировать тексты, читать всё из JSON. При расхождении между pptx и HTML — JSON побеждает.

---

## 1. Входные файлы

| Файл | Назначение |
|---|---|
| `deck_content.json` | 25 слайдов × полный контент (title, subtitle, body, tables, bullets, metrics) |
| `viz_data.json` | MC histogram (50 bins, N=50 000, mean 7.24, σ 7.76, P(>0)=82.5%), heat-map 5×5, pipeline 7 проектов × 12 кварталов, waterfall W₃ (bear/base/bull) |
| `TrendStudio_LP_Deck_v1.1.1.pptx` | Референсный рендер (dark cinematic) для визуальной консистентности |
| `TrendStudio_LP_Deck_v1.1.1.pdf` | PDF того же pptx — для сравнения «как должно выглядеть» |

---

## 2. Выходной артефакт

**Один HTML-файл**: `TrendStudio_LP_Deck_v1.1.1_Interactive.html`
- Single-file (CSS+JS inline или CDN), без build step
- Открывается по двойному клику, работает offline (CDN кешируется)
- Формат 16:9 (aspect-ratio: 16/9), fullscreen-ready

---

## 3. Обязательные 8 премиум-фич

1. **Навигация клавишами + свайпами** — `←/→` между слайдами, `Home/End` первый/последний, `F` fullscreen, `Esc` exit, `P` presenter mode, `?` список горячих клавиш. Touch-свайпы для tablet-просмотра.
2. **Прогресс-бар** сверху (gold #C9A961), заполняется по мере прохождения (0% → 100% на 25-м слайде).
3. **Анимации появления элементов** — fade+slide-up для текста, stagger для списков/таблиц, count-up для больших чисел (Det IRR 20.09%, Revenue 4 545 млн и т.д.). IntersectionObserver, без скрипта библиотек.
4. **Интерактивные графики** на D3/Chart.js/Recharts:
   - **Slide 17 (MC percentiles):** гистограмма 50 bins, вертикальная линия Det IRR 20.09 (gold), линия WACC 19.05 (красный), линия mean 7.24 (синий). Tooltip по bin: «range X–Y%, count Z, cumulative P(≤Y)=W%».
   - **Slide 11 (Pipeline timeline):** Gantt-like по 7 проектам × 12 кварталов. Hover — показывает budget, stage, release date.
   - **Slide 19 (Risk heatmap):** 5×5 grid, colour scale зелёный→жёлтый→красный. Клик по ячейке — боковая панель со списком рисков в этом cell.
   - **Slide 22 (Waterfall):** переключатель Bear/Base/Bull, 4 tier stacked bar (ROC → 8% pref → catch-up → 80/20 carry), live update LP distribution.
5. **Интерактивный калькулятор IRR** (новый доп. слайд 25a или встроить в 17): 5 слайдеров (hit_rate, budget_overrun, delay_q, margin, exit_mult) → live IRR с формулой и спаркалайном.
6. **3D parallax на обложке** (slide 1): CSS 3D transform слоёв (фон → gold accent → title), реагирует на `mousemove`. Subtle, не tacky.
7. **Presenter mode** (клавиша `P`) — выводит спикерские заметки в нижней панели и timer текущего слайда.
8. **Dark mode toggle** — по умолчанию dark cinematic (palette из SSOT). Toggle на light-mode (для печати): BG #FAFAF7, text #1A1A1A, accent #8B7355, сохранить gold акценты.

**Доп. премиум (если время):**
- 9. **MC live-replay** — кнопка «▶ Запустить MC N=50 000» на slide 17, анимация построения гистограммы (~3 секунды), finalized = static.
- 10. **Heat-map tooltip с drill-down** — полный список 30 рисков по ID при клике.
- 11. **Share/export** — кнопка «📋 Copy link to current slide» (hash-routing `#slide-N`).
- 12. **D3 pipeline graph** на slide 10: force-directed граф 7 проектов + связи (share producers, cast overlap) — visual candy.

---

## 4. Design system (из SSOT meta.palette)

```
bg_primary:      #0A0E1A    (глубокий ночной)
bg_secondary:    #141A2A    (secondary cards)
accent_gold:     #C9A961    (основной акцент)
accent_gold_l:   #E5C98A    (подсветка)
text_primary:    #F5F5F5
text_secondary:  #9CA3AF
success:         #10B981
warning:         #F59E0B
danger:          #EF4444
chart_1:         #60A5FA    (дополнительный)
```

**Шрифты:**
- Заголовки: **Georgia** (serif, cinematic, 48-60px)
- Тело: **Inter** или **Calibri fallback** (sans-serif, 16-20px, line-height 1.5)
- Формулы/числа: **JetBrains Mono** или **Consolas** (monospace)

**Gold accent line** 3px сверху каждого слайда + под title.
**Footer:** «ТрендСтудио Холдинг · LP Deck v1.1.1 · Confidential» слева, «N / 25» справа. 9pt, text_secondary.

---

## 5. Косметика из QA pptx (исправить в HTML)

- **Slide 5 (Тезис 2):** увеличить правый padding — точки-иконки P3/P5 лезут к краю.
- **Slide 18 (Det vs Stoch):** разнести заголовок и подзаголовок, добавить 20px top-margin подзаголовку.
- **Slide 23 (Terms & Exit):** балансировать 2 колонки — выровнять по верхней границе.

---

## 6. Критерии приёмки

1. Все 25 слайдов отрисованы, тексты совпадают с SSOT 1:1 (diff-check).
2. 8 обязательных фич работают без ошибок в консоли.
3. MC-гистограмма визуально совпадает с `viz_data.json.mc.bins` (50 bars).
4. Калькулятор IRR при default значениях → 20.09% (det) и при случайных → показывает значение из MC-распределения.
5. П5 «Максимум» 32/32 на итоговом HTML (полный набор механизмов): Ф1-7, Н1-4, Л1-9, И1-3 (все закрыты в xlsx appendix), Д1-10, А1-2. Скрипт верификации: сверка с SSOT + визуальные проверки через headless Chrome screenshot.

---

## 7. Процесс работы в CC

1. Читать `Brief.md` + `deck_content.json` + `viz_data.json`.
2. Сгенерировать скелет HTML с 25 пустыми слайдами, подключить навигацию и прогресс-бар.
3. Проитерировать по SSOT.slides — для каждого type → соответствующий renderer.
4. Добавить 4 интерактивных графика (slides 11, 17, 19, 22).
5. Калькулятор IRR + parallax + presenter mode + light/dark toggle.
6. П5 32/32 — после финала.
7. Копия в `/sessions/.../Холдинг/Deck_v1.1.1/TrendStudio_LP_Deck_v1.1.1_Interactive.html`.
8. Commit в `/tmp/tsh` → bundle → fetch в mounted repo → tag `v1.1.2-deck`.

---

## 8. Контекст проекта

- **v1.1.0:** LP Package (Memo + 5 Appendices + 2 верификации). Git tag `v1.1.0-lp`, commit 720c18a.
- **v1.1.1:** Hardening xlsx (n=1000→N=50 000 в 4 местах), П5 32/32 = 100%. Git tag `v1.1.1`, commit 705efbd.
- **v1.1.1 deck:** pptx 25 слайдов (текущий этап, QA 98%).
- **v1.1.2-deck:** финал HTML (этот brief).

**Якорь:** Public W₃, 12 проектов → restructured to 7 (5 фильмов + 2 сериала), 2026-2028. Det IRR 20.09%, MC Mean 7.24% (stress disclosed), MoIC 2.0×, WACC 19.05%, fund 3 000 млн ₽.

**Memory ссылки:**
- `project_trendstudio_lp_v110.md` — LP Package
- `project_investor_model_v3.md` — 7-project pipeline restructuring

---

**Приоритет:** качество > скорость. Это LP-grade deliverable, не MVP.
