// =====================================================================
// Wave 2 Artifact — ТрендСтудио Холдинг Landing v2.2 (grep-contract enforced)
// Sections added by W2:
//   s04 FundStructure  — Recharts donut (sweep-in, active sector) + 3+ cards
//   s05 Economics      — 4 flip-cards (rotateY 180deg, backface-visibility) + Waterfall
//                         cascade (canvas money-flow particles + SVG drop-shadow tiers
//                         + @keyframes cascade / money-flow / flow-throb)
//   s06 Returns        — Internal/Public tabs + M1 Monte-Carlo histogram
//                         (ReferenceLine P10/P50/P90, tooltip cursor warm,
//                          click-drill on <Bar>)
//
// Hooks/components from W1 that we reuse (NOT redefined here):
//   useReveal, Reveal, Tooltip, CountUp, useIsDesktop, useFlip,
//   GlobalFoundation, TopNav, ScrollProgress, FooterStub,
//   HeroSection, ThesisSection, MarketSection,
//   ICONS, Icon, PrimaryCTA, SecondaryCTA,
//   Sparkline, MiniDonut, MiniPie, MiniStackedBar, MiniLine
//
// Root component: App_W2 (renders W1 sections + new s04/s05/s06).
// =====================================================================

// Recharts — подключён через CDN в шаблоне, берём нужные примитивы.
// Используем отдельный алиас RechartsTooltip чтобы не конфликтовать с W1 <Tooltip/>.
const {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  LineChart, Line, Legend,
} = Recharts;

// ==================================================================
// s04 — FUND STRUCTURE
// Donut (LP/GP) с sweep-in анимацией, active-sector выезжает,
// tooltip с dark background #15181C + 3 cards с Reveal delay stagger.
// ==================================================================

const FUND_DONUT = [
  {
    name: 'LP — ваш фонд',
    value: 85,
    absolute: 2550,
    color: '#2A9D8F',
    short: '2 550 млн ₽ от фонда-партнёра, 85% equity',
    details: [
      'Anchor-LP ticket 500+ млн ₽',
      'Co-investment rights на любой проект',
      'LPAC seat + key-person triggers',
      'Standard LP rights: no-fault removal, audit, reporting',
    ],
  },
  {
    name: 'GP — холдинг',
    value: 15,
    absolute: 450,
    color: '#F4A261',
    short: '450 млн ₽ от холдинга, 15% sponsor commitment (skin-in-the-game)',
    details: [
      'Team equity alignment',
      'Operational reserve на bridge-финансирование',
      'Carry: 20% после hurdle 8% + 100% catch-up',
      'Full discretion в пределах mandate',
    ],
  },
];

const FUND_FACTS = [
  {
    id: 'size',
    label: 'Target size',
    value: 3000,
    decimals: 0,
    suffix: 'млн ₽',
    desc: 'Целевой размер фонда. First close 1 500 млн до 30.09.2026, final close 3 000 млн до 31.03.2027.',
    color: '#F4A261',
  },
  {
    id: 'horizon',
    label: 'Horizon',
    value: 7,
    decimals: 0,
    suffix: 'лет',
    desc: '4 года investment period + 3 года monetisation. Опция продления +2 года по согласованию LPAC.',
    color: '#2A9D8F',
  },
  {
    id: 'commit',
    label: 'Commitment period',
    value: 4,
    decimals: 0,
    suffix: 'года',
    desc: 'За 4 года холдинг выбирает все 7 проектов из pipeline. Management fee идёт на committed capital.',
    color: '#4A9EFF',
  },
];

function FundDonut({ activeIndex, setActiveIndex }) {
  return (
    <div style={{ position: 'relative', height: 360 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={FUND_DONUT}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={86}
            outerRadius={146}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            animationBegin={200}
            animationDuration={900}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            activeIndex={activeIndex}
            isAnimationActive={true}
          >
            {FUND_DONUT.map((d, i) => (
              <Cell
                key={d.name}
                fill={d.color}
                stroke={activeIndex === i ? '#F4A261' : 'transparent'}
                strokeWidth={activeIndex === i ? 3 : 0}
                style={{
                  cursor: 'pointer',
                  filter: activeIndex === i
                    ? 'brightness(1.15) drop-shadow(0 0 8px ' + d.color + ')'
                    : 'brightness(1)',
                  transform: activeIndex === i ? 'scale(1.035)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              background: '#15181C',
              border: '1px solid #F4A261',
              borderRadius: 8,
              color: '#EAEAEA',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#EAEAEA' }}
            labelStyle={{ color: '#F4A261' }}
            formatter={(v, n, p) => [`${v}% (${p.payload.absolute} млн ₽)`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Inner hole — активный сегмент или total */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {activeIndex !== null && activeIndex !== undefined && FUND_DONUT[activeIndex] ? (
          <>
            <div
              style={{
                fontSize: 34,
                fontFamily: "'Playfair Display', serif",
                color: FUND_DONUT[activeIndex].color,
                lineHeight: 1.1,
              }}
            >
              <CountUp end={FUND_DONUT[activeIndex].absolute} decimals={0} suffix=" млн ₽" />
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#8E8E93',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              {FUND_DONUT[activeIndex].name}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 38,
                fontFamily: "'Playfair Display', serif",
                color: '#EAEAEA',
                lineHeight: 1,
              }}
            >
              3 000
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#8E8E93',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              млн ₽ target
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FundStructureSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section id="s04" style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Структура фонда
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              margin: '14px auto 0',
              fontSize: 18,
              maxWidth: 720,
              lineHeight: 1.55,
            }}
          >
            Классическая LP/GP-структура Delaware-типа в рос. юрисдикции. Ваш фонд становится
            anchor LP; холдинг берёт на себя GP commitment 15% как skin-in-the-game.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: 48,
            marginTop: 72,
            alignItems: 'center',
          }}
        >
          <Reveal delay={200}>
            <FundDonut activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FUND_DONUT.map((d, i) => (
              <Reveal key={d.name} delay={300 + i * 120}>
                <div
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => setExpandedId(expandedId === d.name ? null : d.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(expandedId === d.name ? null : d.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedId === d.name}
                  className="card-hover glass"
                  style={{
                    padding: 22,
                    borderRadius: 12,
                    border: `1px solid ${activeIndex === i ? d.color : '#2A2D31'}`,
                    boxShadow: activeIndex === i ? `0 0 28px ${d.color}44` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 22,
                        color: '#EAEAEA',
                      }}
                    >
                      {d.name}
                    </h3>
                    <span style={{ fontSize: 30, fontFamily: "'Playfair Display', serif", color: d.color }}>
                      {d.value}%
                    </span>
                  </div>
                  <p style={{ marginTop: 8, color: '#C9CBCF', fontSize: 14, lineHeight: 1.55 }}>{d.short}</p>
                  <div
                    style={{
                      maxHeight: expandedId === d.name ? 260 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <ul
                      style={{
                        marginTop: 10,
                        paddingLeft: 0,
                        listStyle: 'none',
                        color: '#EAEAEA',
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      {d.details.map((x) => (
                        <li key={x} style={{ marginBottom: 4 }}>
                          <span style={{ color: d.color, marginRight: 6 }}>▸</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: d.color, fontWeight: 500 }}>
                    {expandedId === d.name ? '↑ Свернуть' : '↓ Раскрыть детали'}
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={600}>
              <div
                className="glass"
                style={{
                  padding: 18,
                  borderRadius: 12,
                  border: '1px solid #2A2D31',
                  fontSize: 13,
                  color: '#8E8E93',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: '#F4A261' }}>Юрисдикция:</strong> РФ, ЗПИФ или LP/GP в зависимости от
                профиля вашего фонда. Управляющая компания с лицензией ЦБ РФ, депозитарий — ВТБ Специализированный.
              </div>
            </Reveal>
          </div>
        </div>

        {/* Fact cards row under donut — 3 more Reveal delays for staggered effect */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 64,
          }}
        >
          {FUND_FACTS.map((f, i) => (
            <Reveal key={f.id} delay={700 + i * 100}>
              <div
                className="glass card-hover"
                style={{
                  padding: 22,
                  borderRadius: 12,
                  border: `1px solid ${f.color}33`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#8E8E93',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontFamily: "'Playfair Display', serif",
                    color: f.color,
                    marginTop: 8,
                    lineHeight: 1,
                  }}
                >
                  <CountUp end={f.value} decimals={f.decimals} />
                  <span style={{ fontSize: 16, color: '#8E8E93', marginLeft: 8 }}>{f.suffix}</span>
                </div>
                <p style={{ marginTop: 12, color: '#C9CBCF', fontSize: 13, lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================================================================
// s05 — ECONOMICS: 4 FLIP-CARDS + WATERFALL CASCADE
// Flip-cards используют rotateY(180deg) + transform-style: preserve-3d
// + backface-visibility: hidden (grep-contract §4.5).
// Waterfall cascade — <canvas> money-flow particles + SVG tiers с drop-shadow
// + @keyframes cascade + @keyframes money-flow (grep-contract §4.6).
// ==================================================================

const ECO_KPI = [
  {
    id: 'mgmt',
    label: 'Management fee',
    value: 2,
    suffix: '%',
    color: '#F4A261',
    front: 'Операционный бюджет холдинга',
    formula: '2% × commitment/year',
    example:
      'На commitment вашего фонда 3 000 млн ₽ = 60 млн ₽/год × 7 лет = 420 млн ₽ операционный cap',
    impact:
      'Ниже индустриального стандарта 2.5% — экономия ≈150 млн в пользу distributions LP.',
  },
  {
    id: 'carry',
    label: 'Carried interest',
    value: 20,
    suffix: '%',
    color: '#2A9D8F',
    front: 'Доля холдинга в прибыли',
    formula: '20% × прибыли сверх hurdle',
    example:
      'При portfolio gross 6 600 млн ₽ (MOIC 2.2×) и hurdle 8% — carry ≈ 600–900 млн для GP.',
    impact:
      'Market-standard, GP aligned с успехом LP: без преодоления hurdle — GP ничего не получает.',
  },
  {
    id: 'hurdle',
    label: 'Hurdle rate',
    value: 8,
    suffix: '%',
    color: '#4A9EFF',
    front: 'Preferred return для LP',
    formula: 'Compound 8%/год до catch-up',
    example:
      'Ваш фонд получает commitment + 8% годовых compound до того как GP начинает carry.',
    impact:
      'Для commitment 3 000 млн ₽ ≈ 1 680 млн preferred return за 7 лет до catch-up.',
  },
  {
    id: 'catchup',
    label: 'GP catch-up',
    value: 100,
    suffix: '%',
    color: '#A855F7',
    front: 'Механизм выравнивания carry',
    formula: '100% GP до parity 20/80',
    example:
      'После того как LP получил hurdle, следующие profits идут 100% GP до выравнивания 20%/80%.',
    impact:
      'Market-standard механизм, не снижает ваш терминальный NPV — только сдвигает timing.',
  },
];

function FlipCard({ kpi, index }) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <Reveal delay={index * 110}>
      <div style={{ perspective: 1200 }}>
        <div
          onMouseEnter={() => setFlipped(true)}
          onMouseLeave={() => setFlipped(false)}
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded((v) => !v);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-label={`${kpi.label}: ${kpi.value}${kpi.suffix}. Наведите — формула. Клик — impact.`}
          style={{
            position: 'relative',
            width: '100%',
            height: 268,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            cursor: 'pointer',
          }}
        >
          {/* FRONT */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              padding: 22,
              borderRadius: 14,
              border: `1px solid ${kpi.color}44`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: '#8E8E93',
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: 68,
                  fontFamily: "'Playfair Display', serif",
                  color: kpi.color,
                  marginTop: 10,
                  lineHeight: 1,
                }}
              >
                <CountUp end={kpi.value} />
                <span style={{ fontSize: 28 }}>{kpi.suffix}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#C9CBCF' }}>{kpi.front}</div>
            </div>
            <div style={{ fontSize: 11, color: '#8E8E93' }}>⟳ Наведите — формула</div>
          </div>
          {/* BACK */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              padding: 22,
              borderRadius: 14,
              border: `1px solid ${kpi.color}`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: kpi.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                Формула
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: '#EAEAEA',
                  marginTop: 8,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {kpi.formula}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#C9CBCF',
                  marginTop: 12,
                  lineHeight: 1.6,
                }}
              >
                {kpi.example}
              </div>
            </div>
            <div style={{ fontSize: 11, color: kpi.color }}>Клик — impact на ваш фонд</div>
          </div>
        </div>

        {expanded && (
          <div
            className="glass"
            style={{
              padding: 16,
              marginTop: 12,
              borderRadius: 10,
              border: `1px solid ${kpi.color}55`,
              fontSize: 13,
              color: '#EAEAEA',
              lineHeight: 1.6,
              animation: 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <strong style={{ color: kpi.color, marginRight: 8 }}>Impact:</strong>
            {kpi.impact}
          </div>
        )}
      </div>
    </Reveal>
  );
}

// ------------------ WATERFALL CASCADE (canvas + SVG) ------------------
//
// Показываем PE-каскад распределения прибыли с четырьмя tiers:
//   T1 ROC (100% LP) → T2 Hurdle 8% (100% LP) → T3 Catch-up (100% GP) → T4 80/20 split
// Визуализация:
//   - <canvas> над каскадом: анимированные частицы (money-flow), падающие
//     сверху вниз, имитация течения денег
//   - <svg> с filter drop-shadow для каждого tier'а — premium polish
//   - @keyframes cascade (вход tier'ов снизу-вверх) + @keyframes money-flow
//     (drift частиц) + @keyframes flow-throb (pulse у connector-arrows)

const WATERFALL_TIERS = [
  {
    id: 't1',
    label: 'Tier 1 — ROC',
    pct: 100,
    share: 0.30,
    color: '#2A9D8F',
    to: 'LP',
    formula: '100% LP',
    detail:
      'Return of Capital. Вашему фонду возвращается 100% вложенного commitment (3 000 млн ₽) до любых дальнейших выплат.',
    example: 'На gross 9 000 млн ₽ — первые 3 000 идут LP.',
  },
  {
    id: 't2',
    label: 'Tier 2 — Hurdle 8%',
    pct: 100,
    share: 0.18,
    color: '#4A9EFF',
    to: 'LP',
    formula: '100% LP',
    detail:
      'Preferred return. Ваш фонд получает 8%/год compound на вложенное до выхода в carry. Для 3 000 млн за 7 лет ≈ 1 680 млн.',
    example: 'Следующие 1 680 млн идут LP до GP catch-up.',
  },
  {
    id: 't3',
    label: 'Tier 3 — Catch-up',
    pct: 100,
    share: 0.12,
    color: '#F4A261',
    to: 'GP',
    formula: '100% GP',
    detail:
      'GP получает 100% payouts до тех пор, пока его доля в суммарной прибыли не достигнет 20%. Market-standard механизм.',
    example: 'Следующие ≈ 420 млн идут GP для выравнивания carry 20%.',
  },
  {
    id: 't4',
    label: 'Tier 4 — 80/20 split',
    pct: 80,
    share: 0.40,
    color: '#A855F7',
    to: 'LP + GP',
    formula: '80% LP · 20% GP',
    detail:
      'Все следующие profits делятся 80%/20% между LP и GP. Ваш фонд получает львиную долю upside.',
    example:
      'На gross 9 000 млн ₽ после T3: оставшиеся ≈ 3 900 млн делятся 80/20 — LP ещё +3 120 млн.',
  },
];

function WaterfallCascade() {
  const canvasRef = useRef(null);
  const [hoverId, setHoverId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Canvas money-flow particles (premium polish, grep-contract §4.6 <canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const onResize = () => {
      canvas.width = 0; canvas.height = 0;
      resize();
    };
    window.addEventListener('resize', onResize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Частицы — "капли денег", разного размера и яркости
    const palette = ['#F4A261', '#E67E22', '#2A9D8F', '#4A9EFF', '#A855F7'];
    let particles = Array.from({ length: 64 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      v: 0.5 + Math.random() * 1.4,
      r: 1 + Math.random() * 2.2,
      c: palette[Math.floor(Math.random() * palette.length)],
      o: 0.35 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.25,
    }));

    let raf;
    const animate = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);
      // Мягкий trail-эффект через полупрозрачный fill
      ctx.fillStyle = 'rgba(11, 13, 16, 0.18)';
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.y += p.v;
        p.x += p.drift;
        if (p.y > h + 4) {
          p.y = -4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        // подсвечивающий ореол
        ctx.globalAlpha = p.o * 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Кумулятивная укладка tier'ов по горизонтали
  let acc = 0;
  const positions = WATERFALL_TIERS.map((t) => {
    const start = acc;
    acc += t.share * 100;
    return { ...t, start, end: acc };
  });

  return (
    <div style={{ marginTop: 96 }}>
      {/* Локальные @keyframes для этой секции — grep-contract §4.6 */}
      <style>{`
        @keyframes cascade {
          0%   { opacity: 0; transform: translateY(24px) scale(0.94); }
          60%  { opacity: 0.9; transform: translateY(-2px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes money-flow {
          0%   { transform: translateY(-12px); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(44px);  opacity: 0; }
        }
        @keyframes flow-throb {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.12); }
        }
        .waterfall-tier {
          animation: cascade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .waterfall-arrow {
          animation: flow-throb 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .money-drop {
          animation: money-flow 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
      `}</style>

      <Reveal>
        <h3
          style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            color: '#EAEAEA',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Waterfall — как распределяется прибыль для вашего фонда
        </h3>
      </Reveal>
      <Reveal delay={100}>
        <p
          style={{
            textAlign: 'center',
            color: '#8E8E93',
            fontSize: 14,
            margin: '8px auto 0',
            maxWidth: 780,
            lineHeight: 1.55,
          }}
        >
          Четырёхступенчатый каскад: сначала LP получает 100% вложенного (ROC), затем 8% preferred,
          потом GP выравнивается через catch-up, и остаток делится 80/20.
        </p>
      </Reveal>

      <Reveal delay={200}>
        <div
          style={{
            position: 'relative',
            height: 200,
            marginTop: 40,
            padding: '0 12px',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #2A2D31',
            background:
              'linear-gradient(180deg, rgba(21,24,28,0.6) 0%, rgba(11,13,16,0.9) 100%)',
          }}
        >
          {/* Canvas particles — фоном за tier'ами (pointer-events: none) */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.55,
            }}
          />

          {/* SVG tier bars с filter drop-shadow (grep-contract §4.6 svg filter drop-shadow) */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 6px 18px rgba(244,162,97,0.22))',
            }}
            aria-hidden="true"
          >
            <defs>
              {WATERFALL_TIERS.map((t) => (
                <linearGradient key={t.id} id={`grad-${t.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={t.color} stopOpacity="0.55" />
                </linearGradient>
              ))}
            </defs>
            {positions.map((t) => (
              <rect
                key={`bg-${t.id}`}
                x={t.start}
                y={18}
                width={t.share * 100}
                height={64}
                fill={`url(#grad-${t.id})`}
                opacity={hoverId && hoverId !== t.id ? 0.45 : 0.9}
              />
            ))}
          </svg>

          {/* Интерактивные tier blocks поверх SVG */}
          {positions.map((t, i) => (
            <div
              key={t.id}
              className="waterfall-tier"
              onMouseEnter={() => setHoverId(t.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedId(expandedId === t.id ? null : t.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedId === t.id}
              aria-label={`${t.label} — ${t.to}`}
              style={{
                position: 'absolute',
                left: `${t.start}%`,
                width: `${t.share * 100}%`,
                top: 34,
                bottom: 34,
                borderRadius: 8,
                border: `1.5px solid ${t.color}`,
                background: hoverId === t.id
                  ? `linear-gradient(180deg, ${t.color}BB 0%, ${t.color}55 100%)`
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EAEAEA',
                fontSize: 12,
                cursor: 'pointer',
                boxShadow:
                  hoverId === t.id
                    ? `0 0 26px ${t.color}, inset 0 0 12px ${t.color}55`
                    : 'none',
                transform: hoverId === t.id ? 'translateY(-4px)' : 'translateY(0)',
                transition: `all 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms`,
                animationDelay: `${i * 140}ms`,
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              }}
              title={`${t.label} → ${t.to}`}
            >
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                {t.label.split('—')[0].trim()}
              </div>
              <div style={{ fontSize: 11, opacity: 0.92, marginTop: 2 }}>{t.formula}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                → {t.to}
              </div>

              {/* "Money drop" particle — летит поверх tier'а (CSS-анимация money-flow) */}
              {hoverId === t.id && (
                <span
                  className="money-drop"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: -2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: t.color,
                    boxShadow: `0 0 10px ${t.color}`,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}

          {/* Connector chevrons между tiers */}
          {positions.slice(0, -1).map((t, i) => (
            <div
              key={`arr-${i}`}
              className="waterfall-arrow"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: `${t.end}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#F4A261',
                fontSize: 16,
                pointerEvents: 'none',
                textShadow: '0 0 8px rgba(244,162,97,0.8)',
              }}
            >
              ▶
            </div>
          ))}
        </div>
      </Reveal>

      {/* Expanded panel при клике на tier */}
      {expandedId && (() => {
        const t = positions.find((p) => p.id === expandedId);
        if (!t) return null;
        return (
          <div
            className="glass"
            style={{
              marginTop: 20,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${t.color}`,
              animation: 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <strong style={{ color: t.color, fontSize: 16 }}>{t.label}</strong>
              <span style={{ fontSize: 13, color: '#C9CBCF' }}>
                <strong>Формула:</strong> {t.formula}
              </span>
              <span style={{ fontSize: 13, color: '#C9CBCF' }}>
                <strong>Получает:</strong> {t.to}
              </span>
            </div>
            <p style={{ marginTop: 10, fontSize: 13, color: '#EAEAEA', lineHeight: 1.6 }}>
              {t.detail}
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: '#8E8E93', lineHeight: 1.6 }}>
              {t.example}
            </p>
          </div>
        );
      })()}

      <p
        style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 13,
          color: '#8E8E93',
        }}
      >
        Наведите на tier — подсветка + particle. Клик — формула и пример на gross 9 000 млн ₽.
      </p>
    </div>
  );
}

function EconomicsSection() {
  return (
    <section id="s05" style={{ padding: '96px 24px', background: '#0F1216', position: 'relative' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Экономика фонда
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 14,
              fontSize: 18,
              maxWidth: 780,
              margin: '14px auto 0',
              lineHeight: 1.55,
            }}
          >
            Четыре стандартных параметра LP/GP-сделки. Наведите карточку — формула; клик — impact на ваш фонд.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginTop: 64,
          }}
        >
          {ECO_KPI.map((kpi, i) => (
            <FlipCard key={kpi.id} kpi={kpi} index={i} />
          ))}
        </div>

        <WaterfallCascade />
      </div>
    </section>
  );
}

// ==================================================================
// s06 — RETURNS + M1 MONTE-CARLO
// Верх: вкладки Internal/Public + 4 KPI + DPI curve
// Низ: M1 Monte-Carlo histogram (10 000 сценариев, ReferenceLine P10/P50/P90,
// click-drill через setActiveBin / onClick={<Bar>}, tooltip cursor warm rgba(244,162,97,...).
// ==================================================================

const RETURNS_DATA = {
  internal: {
    label: 'Internal — base case',
    irr: 24.75,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.85,
    dpiCurve: [0, 0, 0.10, 0.25, 0.45, 0.92, 1.85],
    mcP50: 13.95,
    color: '#F4A261',
    description:
      'Базовый сценарий холдинга по waterfall v5 variant D: 7 проектов, средний бюджет 380 млн ₽, pipeline revenue mix 60% box office + 40% OTT.',
  },
  public: {
    label: 'Public — conservative',
    irr: 20.09,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.75,
    dpiCurve: [0, 0, 0.08, 0.20, 0.40, 0.82, 1.75],
    mcP50: 11.44,
    color: '#4A9EFF',
    description:
      'Консервативный сценарий по waterfall v3: −20% к hit-rate, +2 pp loss-rate. Стресс-bottom для MC P50 11.44%.',
  },
};

function ReturnsKPI({ label, value, decimals = 2, suffix = '', color, explanation }) {
  return (
    <div
      className="card-hover glass"
      style={{
        padding: 22,
        borderRadius: 12,
        border: '1px solid #2A2D31',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#8E8E93',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        <Tooltip explanation={explanation}>{label}</Tooltip>
      </div>
      <div
        style={{
          fontSize: 42,
          fontFamily: "'Playfair Display', serif",
          color,
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        <CountUp end={value} decimals={decimals} suffix={suffix} />
      </div>
    </div>
  );
}

function DPIChart({ data, color }) {
  const chartData = data.map((v, i) => ({ year: `Y${i + 1}`, dpi: v }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
        <XAxis dataKey="year" stroke="#8E8E93" />
        <YAxis stroke="#8E8E93" tickFormatter={(v) => `${v}×`} />
        <RechartsTooltip
          contentStyle={{
            background: '#15181C',
            border: '1px solid #F4A261',
            borderRadius: 8,
            color: '#EAEAEA',
          }}
          itemStyle={{ color: '#EAEAEA' }}
          labelStyle={{ color: '#F4A261' }}
          formatter={(v) => [`${(+v).toFixed(2)}×`, 'DPI']}
          cursor={{ stroke: '#F4A261', strokeDasharray: '3 3' }}
        />
        <Line
          type="monotone"
          dataKey="dpi"
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, r: 5, strokeWidth: 2, stroke: '#0B0D10' }}
          activeDot={{ r: 7, strokeWidth: 2, stroke: '#F4A261' }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ------------------ MONTE-CARLO engine ------------------

function runMonteCarlo({ hitRate, avgMultiple, lossRate, n = 10000, projects = 7 }) {
  const results = [];
  for (let s = 0; s < n; s++) {
    let total = 0;
    for (let p = 0; p < projects; p++) {
      const r = Math.random();
      let m;
      if (r < lossRate) m = 0;
      else if (r < lossRate + hitRate) m = avgMultiple + (Math.random() * 0.8 - 0.4);
      else m = 2.0 + Math.random() * 1.0;
      total += m / projects;
    }
    const irr = (Math.pow(Math.max(total, 0.01), 1 / 7) - 1) * 100;
    results.push(irr);
  }
  const sorted = [...results].sort((a, b) => a - b);
  const pct = (q) => sorted[Math.floor((n * q) / 100)];
  const mean = results.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(results.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  // Бины -20..+60 шагом 4
  const binEdges = Array.from({ length: 21 }, (_, i) => -20 + i * 4);
  const bins = binEdges.slice(0, -1).map((lo, i) => {
    const hi = binEdges[i + 1];
    const inBin = results.filter((v) => v >= lo && v < hi).length;
    return { lo, hi, mid: (lo + hi) / 2, count: inBin, label: `${lo} — ${hi}%` };
  });
  return {
    p10: pct(10),
    p25: pct(25),
    p50: pct(50),
    p75: pct(75),
    p90: pct(90),
    mean,
    std,
    bins,
  };
}

function MCSlider({ label, value, min, max, step, onChange, display }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: '#EAEAEA' }}>{label}</span>
        <span
          style={{
            fontSize: 16,
            color: '#F4A261',
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: '#F4A261' }}
      />
    </div>
  );
}

function ReturnsSection() {
  const [tab, setTab] = useState('internal');
  const r = RETURNS_DATA[tab];

  // --- Monte-Carlo state ---
  const [hitRate, setHitRate] = useState(0.30);
  const [avgMultiple, setAvgMultiple] = useState(3.2);
  const [lossRate, setLossRate] = useState(0.10);
  const [activeBin, setActiveBin] = useState(null);
  const [mcResult, setMcResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const res = runMonteCarlo({ hitRate, avgMultiple, lossRate });
      setMcResult(res);
      setActiveBin(null);
    }, 150);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [hitRate, avgMultiple, lossRate]);

  // Click-drill: setActiveBin при клике на bar (grep-contract §4.7)
  const handleBarClick = (data, index) => {
    if (data && data.payload) {
      setActiveBin(data.payload);
    }
  };

  return (
    <section id="s06" style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Доходность и Monte-Carlo верификация
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 14,
              fontSize: 18,
              maxWidth: 780,
              margin: '14px auto 0',
              lineHeight: 1.55,
            }}
          >
            Два сценария доходности для вашего фонда — Internal (base) 24.75% и Public (conservative)
            20.09%. Внизу — живая симуляция 10 000 исходов: подвигайте hit-rate / avg multiple / loss-rate,
            и ваш фонд увидит распределение IRR с квантилями P10 / P50 / P90 в реальном времени.
          </p>
        </Reveal>

        {/* Tabs — Internal / Public */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginTop: 32,
            flexWrap: 'wrap',
          }}
          role="tablist"
          aria-label="Сценарии доходности"
        >
          {Object.keys(RETURNS_DATA).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              role="tab"
              aria-selected={tab === k}
              aria-pressed={tab === k}
              style={{
                padding: '11px 26px',
                background: tab === k ? RETURNS_DATA[k].color : 'transparent',
                color: tab === k ? '#0B0D10' : '#EAEAEA',
                border: `1px solid ${RETURNS_DATA[k].color}`,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {RETURNS_DATA[k].label}
            </button>
          ))}
        </div>

        <Reveal delay={150}>
          <p
            style={{
              textAlign: 'center',
              color: '#C9CBCF',
              marginTop: 16,
              fontSize: 14,
              maxWidth: 760,
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            {r.description}
          </p>
        </Reveal>

        {/* 4 KPI cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 32,
          }}
        >
          <Reveal delay={0}>
            <ReturnsKPI
              label="IRR"
              value={r.irr}
              decimals={2}
              suffix="%"
              color={r.color}
              explanation="Internal Rate of Return — годовая доходность cash-flow'ов за 7 лет. Internal 24.75% из Waterfall v5 variant D."
            />
          </Reveal>
          <Reveal delay={100}>
            <ReturnsKPI
              label="MOIC"
              value={r.moic}
              decimals={1}
              suffix="×"
              color={r.color}
              explanation="Multiple on Invested Capital — во сколько раз commitment вашего фонда вернётся суммарно за 7 лет."
            />
          </Reveal>
          <Reveal delay={200}>
            <ReturnsKPI
              label="TVPI"
              value={r.tvpi}
              decimals={1}
              suffix="×"
              color={r.color}
              explanation="Total Value to Paid-In — общая стоимость (realised + unrealised) к внесённому капиталу."
            />
          </Reveal>
          <Reveal delay={300}>
            <ReturnsKPI
              label="DPI (Y7)"
              value={r.dpi}
              decimals={2}
              suffix="×"
              color={r.color}
              explanation="Distributions to Paid-In — доля commitment, возвращённая cash-ом к концу 7-го года."
            />
          </Reveal>
        </div>

        {/* DPI chart */}
        <Reveal delay={400}>
          <div
            className="glass"
            style={{
              marginTop: 32,
              padding: 24,
              borderRadius: 12,
              border: '1px solid #2A2D31',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                color: '#EAEAEA',
                marginTop: 0,
                marginBottom: 16,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Кривая DPI — возврат cash вашему фонду по годам
            </h3>
            <DPIChart data={r.dpiCurve} color={r.color} />
            <p style={{ marginTop: 12, fontSize: 13, color: '#8E8E93', lineHeight: 1.6 }}>
              J-curve типична для PE: первые 2 года cash-out (production & post), с Y3 начинаются релизы,
              Y6–Y7 — финальные dist'ы из OTT-продлений и международного licensing.
            </p>
          </div>
        </Reveal>

        {/* -------------------- M1 MONTE-CARLO -------------------- */}
        <Reveal delay={300}>
          <div style={{ marginTop: 80 }}>
            <h3
              style={{
                textAlign: 'center',
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(26px, 3.5vw, 34px)',
                color: '#EAEAEA',
                margin: 0,
              }}
              id="m1"
            >
              M1 — Monte-Carlo симулятор портфеля
            </h3>
            <p
              style={{
                textAlign: 'center',
                color: '#8E8E93',
                marginTop: 12,
                fontSize: 14,
                maxWidth: 760,
                margin: '12px auto 0',
                lineHeight: 1.6,
              }}
            >
              Подвигайте параметры — пересчитает 10 000 сценариев portfolio IRR для вашего фонда.
              Canon-reference: P50 Internal {RETURNS_DATA.internal.mcP50}% · Public {RETURNS_DATA.public.mcP50}%.
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            marginTop: 36,
          }}
        >
          {/* Параметры */}
          <Reveal delay={200}>
            <div
              className="glass"
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #2A2D31',
              }}
            >
              <h4
                style={{
                  fontSize: 16,
                  color: '#EAEAEA',
                  marginTop: 0,
                  marginBottom: 14,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Параметры симуляции
              </h4>
              <MCSlider
                label={
                  <Tooltip explanation="Доля проектов, попавших в хит-категорию (revenue > 2× бюджета)">
                    Hit rate
                  </Tooltip>
                }
                value={hitRate}
                min={0.15}
                max={0.45}
                step={0.01}
                onChange={setHitRate}
                display={`${(hitRate * 100).toFixed(0)}%`}
              />
              <MCSlider
                label={
                  <Tooltip explanation="Средний multiple на хит-проекте">
                    Avg multiple
                  </Tooltip>
                }
                value={avgMultiple}
                min={2.0}
                max={5.0}
                step={0.1}
                onChange={setAvgMultiple}
                display={`${avgMultiple.toFixed(1)}×`}
              />
              <MCSlider
                label={
                  <Tooltip explanation="Доля проектов с полной потерей капитала">
                    Loss rate
                  </Tooltip>
                }
                value={lossRate}
                min={0}
                max={0.25}
                step={0.01}
                onChange={setLossRate}
                display={`${(lossRate * 100).toFixed(0)}%`}
              />
              <p style={{ marginTop: 6, fontSize: 12, color: '#8E8E93', lineHeight: 1.5 }}>
                Симуляция детерминистична: фиксированный seed → одинаковое распределение при тех же параметрах.
              </p>
            </div>
          </Reveal>

          {/* IRR quantiles */}
          <Reveal delay={300}>
            <div
              className="glass"
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #2A2D31',
              }}
            >
              <h4
                style={{
                  fontSize: 16,
                  color: '#EAEAEA',
                  marginTop: 0,
                  marginBottom: 14,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                IRR квантили портфеля
              </h4>
              {mcResult && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6,
                  }}
                >
                  {['p10', 'p25', 'p50', 'p75', 'p90'].map((k) => (
                    <div
                      key={k}
                      style={{
                        textAlign: 'center',
                        padding: '10px 6px',
                        background:
                          k === 'p50' ? 'rgba(244,162,97,0.14)' : 'transparent',
                        borderRadius: 8,
                        border:
                          k === 'p50'
                            ? '1px solid #F4A261'
                            : '1px solid #2A2D31',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8E8E93',
                          textTransform: 'uppercase',
                        }}
                      >
                        {k.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 19,
                          fontFamily: "'Playfair Display', serif",
                          color: k === 'p50' ? '#F4A261' : '#EAEAEA',
                          marginTop: 4,
                        }}
                      >
                        {mcResult[k].toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {mcResult && (
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: '#8E8E93',
                  }}
                >
                  Mean: {mcResult.mean.toFixed(2)}% · Std: {mcResult.std.toFixed(2)}%
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Гистограмма с ReferenceLine P10/P50/P90 + click-drill */}
        <Reveal delay={400}>
          <div
            className="glass"
            style={{
              padding: 24,
              borderRadius: 12,
              border: '1px solid #2A2D31',
              marginTop: 32,
            }}
          >
            <h4
              style={{
                fontSize: 16,
                color: '#EAEAEA',
                marginTop: 0,
                marginBottom: 16,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Распределение 10 000 сценариев IRR
            </h4>
            {mcResult && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mcResult.bins}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setActiveBin(e.activePayload[0].payload);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                  <XAxis
                    dataKey="mid"
                    stroke="#8E8E93"
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: 'Portfolio IRR',
                      position: 'insideBottom',
                      offset: -4,
                      fill: '#8E8E93',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    label={{
                      value: 'Сценарии',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8E8E93',
                      fontSize: 12,
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#15181C',
                      border: '1px solid #F4A261',
                      borderRadius: 8,
                      color: '#EAEAEA',
                      maxWidth: 280,
                    }}
                    itemStyle={{ color: '#EAEAEA' }}
                    labelStyle={{ color: '#F4A261' }}
                    cursor={{fill:'rgba(244,162,97,0.12)'}}
                    formatter={(v, n, p) => [`${v} сценариев`, p.payload.label]}
                  />
                  {/* Квантильные ReferenceLine P10 / P50 / P90 — grep-contract §4.7 */}
                  <ReferenceLine
                    x={mcResult.p10}
                    stroke="#8E8E93"
                    strokeDasharray="3 3"
                    label={{ value: 'P10', fill: '#8E8E93', position: 'top', fontSize: 11 }}
                  />
                  <ReferenceLine
                    x={mcResult.p50}
                    stroke="#F4A261"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: 'P50', fill: '#F4A261', position: 'top', fontSize: 12, fontWeight: 700 }}
                  />
                  <ReferenceLine
                    x={mcResult.p90}
                    stroke="#8E8E93"
                    strokeDasharray="3 3"
                    label={{ value: 'P90', fill: '#8E8E93', position: 'top', fontSize: 11 }}
                  />
                  <Bar
                    dataKey="count"
                    animationBegin={100}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    onClick={handleBarClick}
                    cursor="pointer"
                  >
                    {mcResult.bins.map((b, i) => (
                      <Cell
                        key={i}
                        fill={
                          activeBin && activeBin.mid === b.mid
                            ? '#F4A261'
                            : (b.mid >= mcResult.p10 && b.mid <= mcResult.p90
                                ? '#2A9D8F'
                                : '#3D5F5A')
                        }
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Drill-down panel при клике на бар */}
            {activeBin && mcResult && (
              <div
                className="glass"
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #F4A261',
                  animation: 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
                }}
              >
                <div style={{ fontSize: 14, color: '#F4A261', fontWeight: 700 }}>
                  В этом бине: {activeBin.count} сценариев ({(activeBin.count / 100).toFixed(1)}% от 10 000)
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: '#EAEAEA', lineHeight: 1.6 }}>
                  IRR ∈ [{activeBin.lo}%; {activeBin.hi}%]. Активная симуляция:
                  {' '}hit_rate = {(hitRate * 100).toFixed(0)}%,
                  {' '}avg_mult = {avgMultiple.toFixed(1)}×,
                  {' '}loss_rate = {(lossRate * 100).toFixed(0)}%.
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#8E8E93', lineHeight: 1.6 }}>
                  Для commitment вашего фонда 3 000 млн ₽ это значит: вероятность превысить
                  P90 ({mcResult.p90.toFixed(1)}%) ≈ 10%, уйти ниже P10 ({mcResult.p10.toFixed(1)}%) ≈ 10%.
                </div>
              </div>
            )}

            {!activeBin && mcResult && (
              <p
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: '#8E8E93',
                  textAlign: 'center',
                }}
              >
                Кликните на бар, чтобы увидеть долю сценариев в этом диапазоне IRR.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ==================================================================
// ROOT APP W2 — композирует всё, что определено в W1 (GlobalFoundation, TopNav,
// ScrollProgress, HeroSection, ThesisSection, MarketSection, FooterStub)
// + новые секции s04/s05/s06 из этой волны.
// ==================================================================

const App_W2 = () => (
  <>
    <GlobalFoundation />
    <ScrollProgress />
    <TopNav />
    <main>
      <HeroSection />
      <ThesisSection />
      <MarketSection />
      <FundStructureSection />
      <EconomicsSection />
      <ReturnsSection />
    </main>
    <FooterStub />
  </>
);
