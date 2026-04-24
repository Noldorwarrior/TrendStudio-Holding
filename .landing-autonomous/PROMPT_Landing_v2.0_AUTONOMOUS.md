# PROMPT — Landing v2.0 AUTONOMOUS (Fix based on v1.0 lessons)

**Версия:** v2.0 FINAL
**Дата:** 2026-04-24
**Стратегия:** полный autonomous-rerun с нуля — **новая ветка** `claude/landing-v2.0-autonomous` от `main`
**Режим:** `--dangerously-skip-permissions` (полная автономия, пользователь не нажимает ничего)
**Базовая:** v1.2 PROMPT + 6 выявленных проблем первого прогона

---

## 🎯 ЧТО ИЗМЕНИЛОСЬ ПРОТИВ v1.2 (6 исправлений + 1 системное)

| # | Секция | Проблема v1.0 autonomous | Требование v2.0 |
|---|---|---|---|
| 1 | **Системное** | Во всех секциях нет scroll-reveal, hover, stagger | **Animation & Interaction Layer (§3)** обязателен во всех 25 секциях |
| 2 | **M2 Pipeline Builder** | Проекты дублируются в rail+колонках, IRR не меняется | Чистый конструктор: rail = pool, колонки = empty initial, IRR считается от колонок (§4.1) |
| 3 | **M3 LP Sizer** | Анти-LP: «0.0% вероятность» при target 30% | **Заменить полностью** на Commitment Calculator + mini-waterfall (§4.2) |
| 4 | **s20 Waterfall** | PE-жаргон без объяснений (hurdle/catch-up/super-carry) | + Intro plain-RU + tooltip над каждым термином + personal LP-пример (§4.3) |
| 5 | **s16 Tax Credits** | Статичный grid без калькулятора | + inline-калькулятор `budget → субсидия` + scroll-reveal + hover (§4.4) |
| 6 | **s19 Distribution** | Нет donut/timeline, нет интерактива | + Donut chart 100% mix + horizontal timeline release windows + hover на channel (§4.5) |
| 7 | **s21 Legal** | Нет mobile accordion, нет stagger, нет conversion | + Accordion на mobile + «Прочитал и согласен» checkbox → NDA CTA (§4.6) |

---

## §1. ЗАПУСК ДЛЯ ПОЛЬЗОВАТЕЛЯ (одна команда, потом уход)

```bash
# 1. Перейти в репо
cd /Users/noldorwarrior/Documents/Claude/Projects/TrendStudio-Holding

# 2. Подготовить ветку
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b claude/landing-v2.0-autonomous

# 3. Bootstrap (тот же, что v1.2)
bash /Users/noldorwarrior/Documents/Claude/Projects/Холдинг/cc_autonomous_package/scripts/bootstrap.sh

# 4. Запустить CC с флагом автономии
claude code --dangerously-skip-permissions

# 5. В CC-сессии вставить промт:
# "Прочитай .landing-autonomous/PROMPT_Landing_v2.0_AUTONOMOUS.md и следуй §2 как orchestrator.
#  Ты работаешь в полной автономии. Никаких уточняющих вопросов — всё в промте.
#  Для каждого Python скрипта: REPO_ROOT=$(pwd) python3 ..."
```

**Ожидаемое время:** 8-12 часов. Вы можете закрыть ноутбук и уйти — CC работает фоном.

---

## §2. ORCHESTRATOR FLOW (как в v1.2, но с enforcement v2.0 правил)

Логика из v1.2 §1 сохраняется без изменений:
- Phase 0: проверка инструментов (`acceptance.sh --dry-run`)
- Phase 1-6: 6 волн через Task-субагенты
- Phase 7: П5 32/32 + PR + auto-merge

**НО:** каждый субагент получает не только базовый WAVE_N.md, но и дополнительно:
- **§3** — Animation & Interaction Layer rulebook (обязательно применить)
- **§4** — конкретные fix-спеки для своих проблемных секций

Orchestrator при запуске Task агента передаёт через `prompt` поле **полный текст WAVE_N.md + §3 + §4**, относящиеся к этой волне. Субагенты ВСЕГДА читают эти два раздела перед кодированием.

---

## §3. ANIMATION & INTERACTION LAYER (ОБЯЗАТЕЛЬНО ВО ВСЕХ 25 СЕКЦИЯХ)

Это **системное требование** v2.0. Все секции без исключения должны применять:

### §3.1 Scroll-reveal (IntersectionObserver)

Каждый «блок» секции (заголовок, карточка, график, таблица) появляется **не одновременно с загрузкой**, а **при скролле к нему**:

```jsx
function useReveal(threshold=0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

// Использование:
function Card({ delay = 0, children }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
```

**Staggered появление**: при 3+ карточек в ряду — каждая следующая с задержкой `index * 80ms`.

### §3.2 Hover states

Каждая интерактивная карточка должна иметь:
```css
.card {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
  cursor: pointer; /* если clickable */
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  border-color: var(--card-accent);  /* glow эффект */
}
```

**Не анимировать:** Legal secции (неуместно прыгать), Footer, TopNav.

### §3.3 Focus states (WCAG AA)

```css
*:focus-visible {
  outline: 2px solid #F4A261;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### §3.4 Reduce motion

ОБЯЗАТЕЛЬНО:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

При `matchMedia('(prefers-reduced-motion: reduce)').matches === true` — все useReveal hooks сразу возвращают `visible = true`, без анимации.

### §3.5 Tooltip pattern (для всех специфических терминов)

```jsx
function Tooltip({ term, explanation, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position:'relative', borderBottom:'1px dotted #8E8E93', cursor:'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      aria-describedby={`tip-${term}`}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          id={`tip-${term}`}
          style={{
            position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)',
            background:'#15181C', border:'1px solid #2A2D31', padding:'8px 12px', borderRadius:6,
            width:280, fontSize:13, color:'#EAEAEA', zIndex:50,
            boxShadow:'0 8px 24px rgba(0,0,0,0.6)'
          }}
        >
          {explanation}
        </span>
      )}
    </span>
  );
}

// Использование:
<Tooltip term="hurdle" explanation="Сначала инвесторы получают свои 8% годовых, потом начинается дележ.">
  hurdle 8%
</Tooltip>
```

Применять ко ВСЕМ PE-терминам: hurdle, catch-up, super-carry, MOIC, TVPI, DPI, waterfall, carry, LP, GP, Tier, commitment, vintage, IRR.

### §3.6 Count-up анимация для числа

При появлении KPI-карточек: число анимируется от 0 до финального значения (requestAnimationFrame, 1500ms).
**Применить:** Hero KPI, Market KPI, Fund Structure (3000 млн), Economics (20% carry и т.д.), Scenarios (результаты каждого сценария).

### §3.7 Чеклист применения Animation Layer (проверить для каждой волны)

- [ ] IntersectionObserver hook `useReveal` определён в скелете W1
- [ ] Каждая карточка/блок использует `<Card>` wrapper с reveal
- [ ] Staggered delays `index * 80ms` для grid-rows
- [ ] Hover-эффекты на всех clickable cards
- [ ] Focus-visible стиль определён глобально
- [ ] prefers-reduced-motion respected
- [ ] Count-up анимация на всех ключевых числах
- [ ] Tooltip-компонент определён и используется для PE-жаргона

---

## §4. ДЕТАЛЬНЫЕ FIX-СПЕКИ ДЛЯ 6 ПРОБЛЕМНЫХ СЕКЦИЙ

### §4.1 M2 Pipeline Builder — полный рефактор семантики (волна W4)

**Проблема v1.0:** rail и колонки дублировали проекты → IRR не менялся.

**Новая семантика v2.0 (вариант A «Конструктор портфеля»):**

```jsx
function M2PipelineBuilder() {
  // Source: 7 проектов from Canon, определены один раз
  const SEED = PIPELINE_DATA; // 7 проектов с {id, title, genre, stage, budget, irr}

  // State: какие проекты где
  const [placement, setPlacement] = useState(() => {
    // Initial: все 7 в rail, колонки пустые
    return { rail: SEED.map(p => p.id), pre: [], prod: [], post: [], release: [] };
  });

  const [draggedId, setDraggedId] = useState(null);

  // Compute derived values from placement
  const stagedProjects = useMemo(() =>
    ['pre','prod','post','release'].flatMap(col =>
      placement[col].map(id => SEED.find(p => p.id === id))
    ), [placement]);

  const totalBudget = stagedProjects.reduce((a,p) => a + p.budget, 0);
  const weightedIRR = totalBudget > 0
    ? stagedProjects.reduce((a,p) => a + p.irr * p.budget, 0) / totalBudget
    : 0;

  const handleDrop = (col) => (e) => {
    e.preventDefault();
    if (!draggedId) return;
    // Убрать откуда был
    const newPlacement = Object.fromEntries(
      Object.entries(placement).map(([k,v]) => [k, v.filter(id => id !== draggedId)])
    );
    // Добавить куда дропнули
    newPlacement[col] = [...newPlacement[col], draggedId];
    setPlacement(newPlacement);
    setDraggedId(null);
  };

  const resetToCanon = () => {
    setPlacement({
      rail: [],
      pre: SEED.filter(p => p.stage === 'pre').map(p => p.id),
      prod: SEED.filter(p => p.stage === 'prod').map(p => p.id),
      post: SEED.filter(p => p.stage === 'post').map(p => p.id),
      release: SEED.filter(p => p.stage === 'release').map(p => p.id)
    });
  };

  // render rail (if placement.rail.length > 0) + 4 columns + stats + warnings
}
```

**Поведение:**
- Старт: все 7 в rail, колонки пустые, IRR = 0%, total = 0 млн ₽
- Drag проект из rail → колонка: из rail уходит, в колонке появляется
- Drag между колонками: уезжает/приезжает
- Drag колонка → rail: возвращается в rail (если прямо вытащить)
- Кнопка «Reset to Canon»: загрузить Canon-распределение (rail пуст, все 7 в стадиях)
- Warning «⚠️ Перегрузка стадии»: если в одной колонке > 3 проектов
- Empty-state в пустой колонке: «Перетащите проект сюда»

**Что видит LP:** приходит → видит 7 проектов в rail + 4 пустые колонки. Видит кнопку «Reset to Canon» — нажимает → проекты разлетаются по Canon-распределению с анимацией FLIP. Теперь IRR = 25.46%. LP может перетащить проект в другую стадию — IRR не меняется (все 7 всё ещё в портфеле), но срабатывает warning «Перегрузка». LP может вытащить проект в rail — IRR меняется (портфель уменьшился).

### §4.2 M3 REPLACE — Commitment Calculator + mini-waterfall (волна W4)

**ПОЛНОСТЬЮ удалить v1.0 M3 LP Sizer.** Заменить на новый компонент.

**Интерфейс:**

```
┌─────────────────────────────────────────────────────────────┐
│ СКОЛЬКО ВЫ ГОТОВЫ ВЛОЖИТЬ?                                  │
│                                                             │
│ [Input] 100 млн ₽        [Slider: 10 ─────●────── 500]     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ЧЕРЕЗ 7 ЛЕТ (Base scenario)                             │ │
│ │                                                         │ │
│ │       ВЫ ВЛОЖИЛИ        ВЫ ПОЛУЧИТЕ                     │ │
│ │        100 млн    →      362 млн                        │ │
│ │                                                         │ │
│ │        IRR 20.09%    •    MOIC 3.62×                    │ │
│ │        Чистая прибыль: 262 млн                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ КАК ВЫ ПОЛУЧИТЕ ЭТИ ДЕНЬГИ:                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tier 1 │ 56 млн  │ ваши 8% годовых               ✓     │ │
│ │ Tier 2 │ 60 млн  │ управляющие догоняют 20%      ✓     │ │
│ │ Tier 3 │ 176 млн │ 80/20 дележ прибыли           ✓     │ │
│ │ Tier 4 │ 70 млн  │ супер-бонус (>2.5×)           ✓     │ │
│ │ ─────── │ ────── │ ─────────────────────                │ │
│ │ ИТОГО   │ 362 млн │ ваша доля                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [PRIMARY CTA] Запросить LP-пакет                            │
└─────────────────────────────────────────────────────────────┘
```

**Формулы (упрощённые для клиентского рендера):**

```jsx
function computeReturn(commitment_mln, moic=3.62, irr_target=0.2009) {
  const gross = commitment_mln * moic;
  const profit = gross - commitment_mln;
  
  // Waterfall split (упрощённо, основывается на Canon)
  const tier1 = commitment_mln * 0.08 * 7;  // 8% × 7 лет preferred
  const tier2 = commitment_mln * 0.60;      // catch-up до 20% carry parity
  const tier3 = profit * 0.80 - tier1 - tier2;  // остаток 80/20 split
  const tier4_bonus = moic > 2.5 ? profit * 0.05 : 0;  // super-carry bonus
  
  return {
    gross,
    profit,
    your_take: tier1 + tier2 + tier3 + tier4_bonus,
    tier1, tier2, tier3, tier4: tier4_bonus,
    irr: irr_target,
    moic
  };
}
```

**Требования:**
- Input: number input + slider 10-500 млн ₽, дефолт 100
- Output: `ваши N млн → Y млн` (count-up animation при изменении)
- Mini-waterfall: 4 ряда таблицы с цветом-индикатором tier
- LP tier badge (если commitment ≥ 50 млн → «Sponsor», ≥ 200 млн → «Anchor LP»)
- CTA кнопка ниже: «Запросить LP-пакет» → scroll to s22

**НЕ использовать:** никаких «probability», «P10/P50/P90», «Monte-Carlo» — это v1.0 M1 уже покрывает. M3 здесь — **позитивный personalized calculator**.

**Заголовок секции:** «Сколько вы получите — посчитайте сами»
**Подзаголовок:** «Введите сумму commitment — увидите Base-сценарий возврата и как распределяется прибыль по 4 уровням»

### §4.3 s20 Waterfall — intro + tooltips + LP-пример (волна W5)

**Добавить в начало секции:**

```
┌─────────────────────────────────────────────────────────────┐
│ КАК ДЕЛИТСЯ ПРИБЫЛЬ                                         │
│                                                             │
│ Когда фонд возвращает деньги, они распределяются            │
│ по 4 уровням — в строгом порядке:                           │
│                                                             │
│ 1. Сначала инвесторы получают обратно свой взнос + 8%      │
│    годовых (называется «hurdle»)                            │
│ 2. Потом команда догоняет свою долю 20% (называется         │
│    «catch-up»)                                              │
│ 3. Дальше вся прибыль делится 80% инвесторам / 20% команде  │
│ 4. Если фонд перерос план в >2.5 раза — бонус команде       │
│    (называется «super-carry»)                               │
│                                                             │
│ Подвигайте слайдер ниже — увидите, сколько получает LP       │
│ при разных сценариях доходности.                            │
└─────────────────────────────────────────────────────────────┘
```

**На каждый PE-термин — Tooltip (см. §3.5):**
- **hurdle 8%** → «Сначала инвесторы получают свои 8% годовых, потом начинается дележ»
- **GP catch-up 20%** → «Управляющий догоняет свою долю до 20% от прибыли»
- **80/20 split** → «После первых двух этапов вся дальнейшая прибыль делится: 80% инвесторам, 20% команде»
- **super-carry (>2.5×)** → «Если фонд умножил капитал больше чем в 2.5 раза — команда получает дополнительный бонус 5%»
- **MOIC** → «Multiple of Invested Capital — во сколько раз ваши вложения вернулись (включая исходный капитал)»

**Персональный LP-пример под слайдером:**
```
На commitment [100 млн ₽] при этом сценарии (multiplier 2.5×):
  • Ваши деньги превратились в 250 млн
  • Из них вы получаете 208 млн (2.08×)
  • Команда получает 42 млн
```

Где `[100 млн ₽]` — это inline-input (можно поменять число), reactive.

**Убрать/переформулировать:**
- «Gross return» → «Общий возврат фонда»
- «Profit over committed» → «Прибыль сверх вложений»
- «LP take» → «Доля инвесторов»
- «GP take» → «Доля команды»

**Визуал баров:**
- LP-бары (teal #2A9D8F) — ярче, выделяются
- GP-бары (orange #F4A261) — чуть приглушены
- Активные tier'ы — с glow-border, неактивные (если multiplier < 1.08) — притушены

### §4.4 s16 Tax Credits — inline калькулятор + интерактивность (волна W4)

**В каждую из 4 карточек** (Фонд кино / Минкультуры / Региональные / Digital):

```jsx
function TaxCreditCard({ program }) {
  const [budget, setBudget] = useState(100); // млн ₽
  const [ref, visible] = useReveal();
  
  const subsidy = program.calcSubsidy(budget); // функция зависит от program

  return (
    <Card ref={ref} visible={visible}>
      <header>
        <Icon />
        <h3>{program.rate}</h3>
        <h2>{program.title}</h2>
        <p>{program.subtitle}</p>
      </header>
      <p>{program.description}</p>
      <p><strong>Орган:</strong> {program.authority}</p>
      
      {/* Inline calculator */}
      <div className="calculator">
        <label>Ваш бюджет, млн ₽</label>
        <input 
          type="range" min="50" max="1000" step="10"
          value={budget} 
          onChange={e => setBudget(+e.target.value)}
        />
        <span className="value-big">{budget} млн ₽</span>
        
        <div className="result">
          <span>Вернётся / субсидия:</span>
          <strong style={{color: program.color}}>
            {subsidy.toFixed(1)} млн ₽
          </strong>
          <small>({program.ratePct(budget)}%)</small>
        </div>
      </div>
      
      {/* Click → expand для деталей */}
      <button onClick={expand}>Подробнее о программе ↓</button>
      {expanded && (
        <div className="details">
          <ul>
            <li>Срок подачи: {program.deadlines}</li>
            <li>Требования: {program.requirements}</li>
            <li>Контакты: {program.contact}</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
```

**Функции калькулятора (4 штуки, упрощённые):**
```js
const PROGRAMS = [
  {
    id:'fund_kino', title:'Фонд кино', rate:'30–80%',
    calcSubsidy: b => b * 0.30,       // 30% базово
    ratePct: b => 30,
    color:'#F4A261',
    ...
  },
  {
    id:'mincult', title:'Минкультуры', rate:'до 50%',
    calcSubsidy: b => b * 0.50,
    ratePct: b => 50,
    color:'#2A9D8F',
    ...
  },
  {
    id:'regional', title:'Региональные rebate', rate:'15–30%',
    calcSubsidy: b => b * 0.20 * 0.7,  // 20% среднее × 0.7 production-share
    ratePct: b => 14,
    color:'#4A9EFF',
    ...
  },
  {
    id:'digital_bonus', title:'Digital bonus (OTT)', rate:'5–10%',
    calcSubsidy: b => b * 0.08,
    ratePct: b => 8,
    color:'#A855F7',
    ...
  }
];
```

**Плюс:** кнопка «Посчитать суммарно» внизу секции — показывает сумму всех 4 субсидий при текущем budget (может быть до 2× от bargo при максимальном наложении).

### §4.5 s19 Distribution — donut + timeline + hover (волна W5)

**Добавить вверху секции (перед карточками каналов):**

```
┌────────────────────────────────────────────────────────────────┐
│   100% REVENUE-MIX                                             │
│                                                                │
│     ╭──────────╮                                               │
│    │  40% OTT  │           ◉ Театральный прокат    30%        │
│    │           │           ◉ OTT / Streaming       40%        │
│    │ 30%      │           ◉ TV                     10%        │
│    │ THEA    │           ◉ Educational / B2B      5%         │
│     ╰──────────╯           ◉ International sales    15%        │
│                                                                │
│   ────────────────────────────────────────────────────────     │
│                                                                │
│   TIMELINE ВЫХОДА (в месяцах после релиза)                     │
│                                                                │
│    0        3           15          39                         │
│    ├────────┼───────────┼───────────┼─────────────────────→   │
│    │ Theat. │   OTT     │    TV     │    Educational           │
│    │  3мес  │   12 мес  │   24 мес  │    36+ мес               │
│    │        │           │           │                          │
│    │  International sales — параллельно с любым каналом   →    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Компоненты:**

1. **Donut chart** (Recharts PieChart, innerRadius=60%) — 5 сегментов, цвета из карточек. Hover на сегмент → выделяется + подсвечивает соответствующую карточку ниже.

2. **Horizontal timeline** (inline SVG или div с width-%) — 0 → 48 месяцев, 5 цветных сегментов. International — отдельная полоса снизу (параллельно).

3. **Cumulative bar** (опционально) — под timeline, показывает как накапливается выручка: 0%→30% (мес 3) → 70% (мес 15) → 80% → 85% → 100%.

**Hover на карточке канала:**
- Сегмент в donut выделяется (opacity других → 0.3)
- Соответствующий сегмент в timeline тоже выделяется
- Партнёр-чипы внутри карточки показывают tooltip с описанием

### §4.6 s21 Legal — mobile accordion + stagger + NDA gate (волна W6)

**Desktop (≥768px):** все 6 карточек expanded, как сейчас, НО:
- Добавить scroll-reveal stagger: каждая следующая карточка с задержкой 80ms
- Hover: тонкая подсветка рамки (без lift — Legal не должен прыгать)

**Mobile (<768px):** accordion — заголовок + иконка видны, текст collapse, click → раскрыть.

```jsx
function LegalCard({ item, isDesktop }) {
  const [expanded, setExpanded] = useState(isDesktop);
  const [ref, visible] = useReveal();
  
  useEffect(() => {
    setExpanded(isDesktop); // на resize
  }, [isDesktop]);

  return (
    <Card ref={ref} visible={visible}>
      <button
        onClick={() => !isDesktop && setExpanded(x => !x)}
        aria-expanded={expanded}
        disabled={isDesktop}
      >
        <Icon />
        <h3>{item.title}</h3>
        {!isDesktop && <ChevronDown style={{transform: expanded ? 'rotate(180deg)' : ''}}/>}
      </button>
      <div style={{maxHeight: expanded ? 500 : 0, overflow:'hidden', transition:'max-height 0.3s'}}>
        <p>{item.text}</p>
      </div>
    </Card>
  );
}
```

**NDA Conversion Gate (новое — внизу секции):**

```jsx
function NDAGate() {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="nda-gate">
      <label>
        <input 
          type="checkbox" 
          checked={agreed} 
          onChange={e => setAgreed(e.target.checked)}
        />
        <span>
          Я прочитал и согласен с указанными оговорками. Подтверждаю статус 
          квалифицированного инвестора.
        </span>
      </label>
      <button 
        disabled={!agreed}
        onClick={requestNDA}
        style={{
          background: agreed ? '#F4A261' : '#2A2D31',
          cursor: agreed ? 'pointer' : 'not-allowed',
          opacity: agreed ? 1 : 0.5
        }}
      >
        Запросить NDA и доступ к полному PPM →
      </button>
    </div>
  );
}
```

`requestNDA` = mailto link или alert-stub (как другие CTA).

---

## §5. ОБНОВЛЁННЫЕ WAVE_PROMPTS (что субагенты делают иначе)

### W1 (без существенных изменений) + применить §3

В базовый W1.md добавить инструкцию:
> **ОБЯЗАТЕЛЬНО:** определи компонент `useReveal`, `Card`, `Tooltip` в skeleton W1 — они используются во всех последующих волнах. Применяй их ко всем элементам s00-s03.

### W2 (без существенных изменений) + применить §3

Применить stagger-reveal ко всем карточкам s04-s06. Count-up animation на returns (IRR/MOIC/TVPI/DPI).

### W3 — применить §3

Staggered появление Team/Advisory grid (каждый портрет +80ms). Hover на project-card в Pipeline → lift + poster zoom.

### W4 — **MAJOR CHANGES**: M2 fix + M3 replace + Tax Credits калькулятор

Полностью заменить реализацию M2 (см. §4.1), M3 (см. §4.2), Tax Credits (см. §4.4).

Плюс обычный §3 layer ко всем остальным секциям волны.

### W5 — **MAJOR CHANGES**: Distribution timeline/donut + Waterfall intro+tooltip

Реализовать §4.3 и §4.5 полностью.

### W6 — **MAJOR CHANGES**: Legal mobile accordion + NDA gate

Реализовать §4.6.

Плюс финальный check: применён ли §3 Animation Layer во всех секциях (grep reveal/Tooltip/Card во всех WAVE_*_ARTIFACT.jsx).

---

## §6. ACCEPTANCE CRITERIA v2.0 (чем ваще будет отличаться приёмка)

В дополнение к v1.2 acceptance.sh (anchors, invariants, П5, i18n) — добавить:

### §6.1 Animation Layer check

```bash
# acceptance.sh добавляет новый проверочный блок:
echo "=== Animation Layer check ==="
ANIM_COUNT=$(grep -c "useReveal\|IntersectionObserver" "$HTML" || echo 0)
TOOLTIP_COUNT=$(grep -c "Tooltip\|tooltip\|aria-describedby" "$HTML" || echo 0)
HOVER_COUNT=$(grep -c ":hover\|onMouseEnter" "$HTML" || echo 0)
REDUCE_MOTION=$(grep -c "prefers-reduced-motion" "$HTML" || echo 0)

echo "  Reveal hooks: $ANIM_COUNT (ожидается ≥20)"
echo "  Tooltip usage: $TOOLTIP_COUNT (ожидается ≥15)"
echo "  Hover states: $HOVER_COUNT (ожидается ≥10)"
echo "  Reduce-motion: $REDUCE_MOTION (ожидается ≥1)"

[[ "$ANIM_COUNT" -ge 20 && "$TOOLTIP_COUNT" -ge 15 && "$HOVER_COUNT" -ge 10 && "$REDUCE_MOTION" -ge 1 ]] \
  || echo "❌ Animation Layer incomplete"
```

### §6.2 M3 replace check

```bash
# grep старого M3 LP Sizer — должно быть 0
grep -qi "probability\|monte-carlo.*sizer\|P90\|LP Sizer" "$HTML" && \
  echo "❌ Old M3 LP Sizer still present" && exit 1

# grep нового компонента — должно быть ≥1
grep -qi "Commitment\|MOIC.*3.6\|your_take\|Sponsor.*Anchor" "$HTML" || \
  echo "❌ New Commitment Calculator not found"
```

### §6.3 PE-glossary check (Waterfall tooltips)

```bash
for TERM in "hurdle" "catch-up" "super-carry" "MOIC" "waterfall"; do
  grep -iq "$TERM.*explanation\|Tooltip.*$TERM\|aria-describedby.*$TERM" "$HTML" || \
    echo "⚠️  Term $TERM без tooltip"
done
```

### §6.4 P5 Max 32/32 check — без изменений

Запускается orchestrator'ом в Phase 7, должен дать ≥30/32.

---

## §7. РИСКИ v2.0 И ИХ МИТИГАЦИИ

| Риск | Новый в v2.0? | Митигация |
|---|---|---|
| Animation Layer замедлит рендер (6.5+ MB HTML) | да | `useReveal` с `threshold: 0.15` + lazy-init observer |
| Tooltip на mobile без hover не работает | да | tap-to-show вариант (onClick handler в мобиле) |
| M2 drag-drop на touch не работает | карряжен v1.0 | добавить touch events + fallback на mobile-tap |
| Commitment Calculator слайдер не на RU | да | тестирование ru-locale `toLocaleString('ru-RU')` |
| `--dangerously-skip-permissions` → CC делает что-то неожиданное | новый режим | limit ширины действий через явные правила в промте (НЕ трогать файлы вне landing_v1.0.html) |
| Больше кода → context overflow в субагенте | усугубился | Task субагент получает только СВОЙ WAVE_N.md + §3 + соотв. §4, не весь промт |

---

## §8. ФИНАЛЬНАЯ ПОСТАВКА v2.0

Когда orchestrator завершает Phase 7 успешно:
- HTML: `landing_v2.0.html` в корне ветки
- Git tag: `v2.0.0-landing-autonomous`
- PR: создан, **auto-merge** в main после CI green
- Reports: `PROGRESS.md`, `DECISIONS_LOG.md`, `FINAL_REPORT.md`, `p5_verification_report.json`

---

## §9. CHANGELOG v1.2 → v2.0

1. ✅ Добавлен §3 Animation & Interaction Layer (системно)
2. ✅ Добавлен §4.1 M2 Pipeline Builder refactor (чистая семантика)
3. ✅ Добавлен §4.2 M3 replace Commitment Calculator + mini-waterfall
4. ✅ Добавлен §4.3 Waterfall intro + tooltips + LP-пример
5. ✅ Добавлен §4.4 Tax Credits inline-калькулятор
6. ✅ Добавлен §4.5 Distribution donut + timeline
7. ✅ Добавлен §4.6 Legal mobile accordion + NDA gate
8. ✅ Добавлен §6.1-§6.3 новые acceptance-проверки
9. ✅ Изменён запуск: `--dangerously-skip-permissions` с начала
10. ✅ Новая ветка: `claude/landing-v2.0-autonomous` от `main`

---

**Версия документа:** v2.0 FINAL
**Автор:** Claude Sonnet 4.7 (Cowork) после анализа результатов v1.0 autonomous run
**Дата:** 2026-04-24
**Ожидаемое время CC-рана:** 8-12 часов
**Запуск:** см. §1
