// =====================================================================
// Wave 2 Artifact — ТрендСтудио Landing v2.1
// s04 Fund Structure (Recharts donut + 2-way sync + expandable cards)
// s05 Economics (4 flip-cards + waterfall cascade)
// s06 Returns (Internal/Public tabs + DPI LineChart)
// m1  Monte-Carlo Simulator (histogram + click drill-down)
// =====================================================================

// Recharts destructure (shared для W2)
const {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  LineChart, Line, Legend,
} = Recharts;

// ========================================================================
// s04 — FUND STRUCTURE (Recharts donut with 2-way sync)
// ========================================================================

const FUND_DATA = [
  {
    name: 'LP (фонд-партнёр)',
    value: 85,
    absolute: 2550,
    color: '#2A9D8F',
    short: '2 550 млн ₽ от фонда-партнёра, 85% equity',
    types: [
      'Пенсионные фонды',
      'Family offices',
      'Суверенные фонды',
      'Институциональные инвесторы',
    ],
  },
  {
    name: 'GP (холдинг)',
    value: 15,
    absolute: 450,
    color: '#F4A261',
    short: '450 млн ₽ от холдинга, 15% sponsor commitment',
    types: [
      'Sponsor commitment холдинга (2% skin-in-the-game)',
      'Operational reserve',
      'Team equity alignment',
    ],
  },
];

function FundDonut({ activeId, setActiveId }) {
  return (
    <div style={{ position: 'relative', height: 340 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={FUND_DATA}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            animationBegin={200}
            animationDuration={800}
            onMouseEnter={(_, idx) => setActiveId(FUND_DATA[idx].name)}
            onMouseLeave={() => setActiveId(null)}
          >
            {FUND_DATA.map((d) => (
              <Cell
                key={d.name}
                fill={d.color}
                stroke={activeId === d.name ? '#F4A261' : 'transparent'}
                strokeWidth={activeId === d.name ? 3 : 0}
                style={{
                  cursor: 'pointer',
                  filter: activeId === d.name ? 'brightness(1.15)' : 'brightness(1)',
                  transform: activeId === d.name ? 'scale(1.03)' : 'scale(1)',
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
            formatter={(v, n, p) => [`${v}% (${p.payload.absolute} млн ₽)`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Inner hole label — активный сегмент */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {activeId
          ? (() => {
              const seg = FUND_DATA.find((d) => d.name === activeId);
              return (
                <>
                  <div
                    style={{
                      fontSize: 36,
                      fontFamily: "'Playfair Display', serif",
                      color: seg.color,
                    }}
                  >
                    <CountUp end={seg.absolute} decimals={0} suffix=" млн ₽" />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#8E8E93',
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    {seg.name}
                  </div>
                </>
              );
            })()
          : (
            <>
              <div
                style={{
                  fontSize: 36,
                  fontFamily: "'Playfair Display', serif",
                  color: '#EAEAEA',
                }}
              >
                3 000
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8E8E93',
                  textTransform: 'uppercase',
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

function FundFactCards({ activeId, setActiveId }) {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {FUND_DATA.map((d, i) => (
        <Reveal key={d.name} delay={i * 120}>
          <div
            onMouseEnter={() => setActiveId(d.name)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => setExpandedId(expandedId === d.name ? null : d.name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpandedId(expandedId === d.name ? null : d.name);
              }
            }}
            role="button"
            tabIndex={0}
            className="card-hover glass"
            style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${activeId === d.name ? d.color : '#2A2D31'}`,
              boxShadow: activeId === d.name ? `0 0 24px ${d.color}44` : 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            aria-expanded={expandedId === d.name}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
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
              <span
                style={{
                  fontSize: 28,
                  fontFamily: "'Playfair Display', serif",
                  color: d.color,
                }}
              >
                {d.value}%
              </span>
            </div>
            <p style={{ marginTop: 8, color: '#8E8E93', fontSize: 14 }}>{d.short}</p>
            <div
              style={{
                maxHeight: expandedId === d.name ? 200 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: '#EAEAEA',
                  lineHeight: 1.6,
                }}
              >
                <strong>Типы инвесторов:</strong>
                <ul
                  style={{
                    marginTop: 6,
                    paddingLeft: 16,
                    listStyle: 'none',
                  }}
                >
                  {d.types.map((t) => (
                    <li key={t} style={{ marginBottom: 4 }}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#F4A261',
                fontWeight: 500,
              }}
            >
              {expandedId === d.name ? '↑ Свернуть' : '↓ Раскрыть детали'}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function FundStructureSection() {
  const [activeId, setActiveId] = useState(null);
  return (
    <section id="s04" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
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
              marginTop: 12,
              fontSize: 18,
            }}
          >
            Классическая LP/GP-модель. Ваш фонд становится anchor LP.
          </p>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 48,
            marginTop: 64,
            alignItems: 'center',
          }}
        >
          <Reveal delay={200}>
            <FundDonut activeId={activeId} setActiveId={setActiveId} />
          </Reveal>
          <FundFactCards activeId={activeId} setActiveId={setActiveId} />
        </div>
      </div>
    </section>
  );
}

// ========================================================================
// s05 — ECONOMICS (4 flip-cards + waterfall cascade)
// ========================================================================

const ECO_KPI = [
  {
    id: 'mgmt',
    label: 'Management fee',
    value: 2,
    suffix: '%',
    color: '#F4A261',
    formula: '2% × commitment',
    example:
      'На commitment вашего фонда 3 000 млн ₽ = 60 млн ₽/год × 7 лет = 420 млн ₽',
    impact:
      'Ниже industry standard 2.5% → экономия 150 млн в пользу distributions',
  },
  {
    id: 'carry',
    label: 'Carried interest',
    value: 20,
    suffix: '%',
    color: '#2A9D8F',
    formula: '20% × прибыли сверх hurdle',
    example:
      'При portfolio gross 6 600 млн ₽ и hurdle 8% — carry ≈ 900 млн GP',
    impact: 'Classic market-standard, GP aligned with LP success',
  },
  {
    id: 'hurdle',
    label: 'Hurdle rate',
    value: 8,
    suffix: '%',
    color: '#4A9EFF',
    formula: 'Preferred return — LP получает первым',
    example:
      'LP гарантированно возвращает commitment + 8%/год до GP carry',
    impact:
      'Для вашего фонда 3 000 млн = 1 680 млн preferred return за 7 лет',
  },
  {
    id: 'catch',
    label: 'GP catch-up',
    value: 100,
    suffix: '%',
    color: '#A855F7',
    formula: 'GP догоняет 20% после LP hurdle',
    example:
      'После LP получил hurdle, следующие payouts = 100% GP до выравнивания carry',
    impact: 'Market-standard механизм, не снижает ваш NPV',
  },
];

function FlipCard({ kpi, index }) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <Reveal delay={index * 100}>
      <div style={{ perspective: 1000 }}>
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
          style={{
            position: 'relative',
            width: '100%',
            height: 260,
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            cursor: 'pointer',
          }}
          aria-expanded={expanded}
          role="button"
          tabIndex={0}
        >
          {/* FRONT */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              padding: 24,
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
                  fontSize: 12,
                  color: '#8E8E93',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontFamily: "'Playfair Display', serif",
                  color: kpi.color,
                  marginTop: 12,
                  lineHeight: 1,
                }}
              >
                <CountUp end={kpi.value} />
                {kpi.suffix}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#8E8E93' }}>
              ⟳ Наведите — формула
            </div>
          </div>
          {/* BACK */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              padding: 24,
              borderRadius: 14,
              border: `1px solid ${kpi.color}`,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: kpi.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
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
                  color: '#8E8E93',
                  marginTop: 12,
                  lineHeight: 1.6,
                }}
              >
                {kpi.example}
              </div>
            </div>
            <div style={{ fontSize: 12, color: kpi.color }}>
              Клик — impact на ваш фонд
            </div>
          </div>
        </div>
        {expanded && (
          <div
            className="glass"
            style={{
              padding: 16,
              marginTop: 12,
              borderRadius: 10,
              border: `1px solid ${kpi.color}44`,
              fontSize: 13,
              color: '#EAEAEA',
              animation: 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <strong style={{ color: kpi.color }}>Impact:</strong> {kpi.impact}
          </div>
        )}
      </div>
    </Reveal>
  );
}

const WATERFALL_TIERS = [
  {
    id: 't1',
    label: 'Tier 1: hurdle 8%',
    share: 0.15,
    color: '#2A9D8F',
    formula: 'commit × 8% × 7y',
    to: 'LP',
  },
  {
    id: 't2',
    label: 'Tier 2: GP catch-up',
    share: 0.10,
    color: '#F4A261',
    formula: 'до 20% carry parity',
    to: 'GP',
  },
  {
    id: 't3',
    label: 'Tier 3: 80/20 split',
    share: 0.60,
    color: '#2A9D8F',
    formula: '80% LP / 20% GP',
    to: 'LP',
  },
  {
    id: 't4',
    label: 'Tier 4: super-carry',
    share: 0.15,
    color: '#A855F7',
    formula: '5% bonus при MOIC >2.5',
    to: 'LP',
  },
];

function WaterfallCascade() {
  const [hover, setHover] = useState(null);
  const [expanded, setExpanded] = useState(null);
  // Кумулятивные позиции bar'ов
  let acc = 0;
  const positions = WATERFALL_TIERS.map((t) => {
    const start = acc;
    acc += t.share * 100;
    return { ...t, start, end: acc };
  });
  return (
    <Reveal delay={200}>
      <div style={{ marginTop: 64 }}>
        <h3
          style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            color: '#EAEAEA',
            margin: 0,
          }}
        >
          Waterfall cascade — как разделяется 100% прибыли
        </h3>
        <div
          style={{
            position: 'relative',
            height: 140,
            marginTop: 32,
            padding: '0 24px',
          }}
        >
          {positions.map((t, i) => (
            <div
              key={t.id}
              onMouseEnter={() => setHover(t.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpanded(expanded === t.id ? null : t.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${t.start}%`,
                width: `${t.share * 100}%`,
                top: 40,
                bottom: 40,
                background: `linear-gradient(180deg, ${t.color}DD, ${t.color}88)`,
                border: `1px solid ${t.color}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B0D10',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: hover === t.id ? `0 0 24px ${t.color}` : 'none',
                transform: hover === t.id ? 'translateY(-4px)' : 'translateY(0)',
                transition: `all 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 200}ms`,
                animation: `fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 200}ms both`,
              }}
              aria-expanded={expanded === t.id}
              role="button"
              tabIndex={0}
              title={t.label}
            >
              <div style={{ textAlign: 'center', padding: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {(t.share * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 10, opacity: 0.9 }}>→ {t.to}</div>
              </div>
            </div>
          ))}
          {/* Connector arrows между тирами */}
          {positions.slice(0, -1).map((t, i) => (
            <svg
              key={`arrow-${i}`}
              style={{
                position: 'absolute',
                left: `${t.end}%`,
                top: 60,
                width: 20,
                height: 40,
                transform: 'translateX(-50%)',
              }}
              viewBox="0 0 20 40"
              aria-hidden="true"
            >
              <path
                d="M 0 20 L 20 20 M 14 14 L 20 20 L 14 26"
                stroke="#8E8E93"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          ))}
        </div>
        {/* Expanded panel */}
        {expanded && (() => {
          const t = positions.find((p) => p.id === expanded);
          return (
            <div
              className="glass"
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 12,
                border: `1px solid ${t.color}`,
                animation: 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
              }}
            >
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ color: t.color }}>{t.label}</strong>
                </div>
                <div>
                  <strong>Формула:</strong> {t.formula}
                </div>
                <div>
                  <strong>Получает:</strong> {t.to}
                </div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: '#8E8E93',
                }}
              >
                На portfolio gross 6 600 млн ₽ (MOIC 2.2× от 3000) — {t.label} ≈ {(6600 * t.share).toFixed(0)} млн ₽.
              </div>
            </div>
          );
        })()}
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 13,
            color: '#8E8E93',
          }}
        >
          Сумма 100%: Tier 1 (15%) → Tier 2 (10% GP) → Tier 3 (60%) → Tier 4 (15% bonus). LP-доля = T1+T3+T4 = 90%, GP-доля = T2 = 10%.
        </div>
      </div>
    </Reveal>
  );
}

function EconomicsSection() {
  return (
    <section id="s05" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
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
              marginTop: 12,
              fontSize: 18,
              maxWidth: 760,
              margin: '12px auto 0',
            }}
          >
            4 параметра LP/GP-сделки для вашего фонда. Наведите карточку — формула; клик — impact.
          </p>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginTop: 56,
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

// ========================================================================
// s06 — RETURNS (Internal/Public tabs + DPI LineChart)
// ========================================================================

const RETURNS_DATA = {
  internal: {
    label: 'Internal (base case)',
    irr: 24.75,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.85,
    dpiCurve: [0, 0, 0.1, 0.25, 0.45, 0.9, 1.85],
    color: '#F4A261',
    description:
      'Базовый сценарий холдинга: 7 проектов, средний bud 380 млн ₽, pipeline revenue mix 60% box office / 40% OTT.',
  },
  public: {
    label: 'Public (conservative)',
    irr: 20.09,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.75,
    dpiCurve: [0, 0, 0.08, 0.2, 0.4, 0.82, 1.75],
    color: '#4A9EFF',
    description:
      'Консервативный сценарий: -20% к hit-rate, +2pp loss-rate. Показатель — стресс-bottom для Monte-Carlo P50 Public 11.44%.',
  },
};

function ReturnsKPI({ label, value, decimals = 2, suffix = '', color, explanation }) {
  return (
    <div
      className="card-hover glass"
      style={{
        padding: 24,
        borderRadius: 12,
        border: '1px solid #2A2D31',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#8E8E93',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        <Tooltip explanation={explanation}>{label}</Tooltip>
      </div>
      <div
        style={{
          fontSize: 40,
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
          formatter={(v) => [`${v.toFixed(2)}×`, 'DPI']}
          labelStyle={{ color: '#F4A261' }}
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

function ReturnsSection() {
  const [tab, setTab] = useState('internal');
  const r = RETURNS_DATA[tab];
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section id="s06" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Доходность
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 12,
              fontSize: 18,
              maxWidth: 760,
              margin: '12px auto 0',
            }}
          >
            Ожидаемая доходность для вашего фонда — два сценария с прозрачной Monte-Carlo верификацией P50.
          </p>
        </Reveal>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginTop: 32,
            flexWrap: 'wrap',
          }}
        >
          {Object.keys(RETURNS_DATA).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              style={{
                padding: '10px 24px',
                background: tab === k ? RETURNS_DATA[k].color : 'transparent',
                color: tab === k ? '#0B0D10' : '#EAEAEA',
                border: `1px solid ${RETURNS_DATA[k].color}`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition:
                  'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
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
              color: '#8E8E93',
              marginTop: 16,
              fontSize: 14,
              maxWidth: 720,
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
              explanation="Internal Rate of Return — годовая доходность cash-flow'ов проекта за 7 лет."
            />
          </Reveal>
          <Reveal delay={100}>
            <ReturnsKPI
              label="MOIC"
              value={r.moic}
              decimals={1}
              suffix="×"
              color={r.color}
              explanation="Multiple on Invested Capital — сколько раз commitment возвращается суммарно."
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
              explanation="Distributions to Paid-In — доля commitment, уже возвращённая cash к году 7."
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
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: '#8E8E93',
                lineHeight: 1.6,
              }}
            >
              J-curve типичен: первые 2 года cash-out (продакшн), с Y3 начинаются релизы и OTT-делистинги, Y6–Y7 — финальные дистрибуции sequel/library.
            </p>
          </div>
        </Reveal>

        {/* Teaser to MC */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          <PrimaryCTA onClick={() => scrollTo('m1')}>
            Запустить Monte-Carlo симуляцию →
          </PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ========================================================================
// m1 — MONTE-CARLO SIMULATOR (histogram + click drill-down)
// ========================================================================

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
  const pct = (p) => sorted[Math.floor((n * p) / 100)];
  const mean = results.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(
    results.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  );
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

function Slider({ label, value, min, max, step, onChange, display }) {
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

function MonteCarloSimulator() {
  const [hitRate, setHitRate] = useState(0.30);
  const [avgMultiple, setAvgMultiple] = useState(3.2);
  const [lossRate, setLossRate] = useState(0.10);
  const [selectedBin, setSelectedBin] = useState(null);
  const [result, setResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = runMonteCarlo({ hitRate, avgMultiple, lossRate });
      setResult(r);
      setSelectedBin(null);
    }, 150);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [hitRate, avgMultiple, lossRate]);

  return (
    <section id="m1" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
            }}
          >
            M1 Monte-Carlo симулятор
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              maxWidth: 720,
              margin: '12px auto 48px',
              lineHeight: 1.6,
            }}
          >
            Подвигайте параметры — пересчитает 10 000 сценариев portfolio IRR. Canon-reference: P50 Internal 13.95% / Public 11.44%.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
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
              <h3
                style={{
                  fontSize: 18,
                  color: '#EAEAEA',
                  marginTop: 0,
                  marginBottom: 16,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Параметры симуляции
              </h3>
              <Slider
                label={
                  <Tooltip explanation="Доля проектов, попавших в хит-категорию (revenue >2× бюджета)">
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
              <Slider
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
              <Slider
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
            </div>
          </Reveal>

          {/* Результаты */}
          <Reveal delay={300}>
            <div
              className="glass"
              style={{
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
                IRR квантили портфеля
              </h3>
              {result && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8,
                  }}
                >
                  {['p10', 'p25', 'p50', 'p75', 'p90'].map((k) => (
                    <div
                      key={k}
                      style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        background:
                          k === 'p50' ? 'rgba(244,162,97,0.12)' : 'transparent',
                        borderRadius: 8,
                        border:
                          k === 'p50'
                            ? '1px solid #F4A261'
                            : '1px solid #2A2D31',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#8E8E93',
                          textTransform: 'uppercase',
                        }}
                      >
                        {k.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontFamily: "'Playfair Display', serif",
                          color: k === 'p50' ? '#F4A261' : '#EAEAEA',
                          marginTop: 4,
                        }}
                      >
                        {result[k].toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {result && (
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    color: '#8E8E93',
                  }}
                >
                  Mean: {result.mean.toFixed(2)}% · Std: {result.std.toFixed(2)}%
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Гистограмма */}
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
            <h3
              style={{
                fontSize: 18,
                color: '#EAEAEA',
                marginTop: 0,
                marginBottom: 16,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Распределение 10 000 сценариев
            </h3>
            {result && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={result.bins}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setSelectedBin(e.activePayload[0].payload);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                  <XAxis
                    dataKey="mid"
                    stroke="#8E8E93"
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis stroke="#8E8E93" />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#15181C',
                      border: '1px solid #F4A261',
                      borderRadius: 8,
                      color: '#EAEAEA',
                    }}
                    itemStyle={{ color: '#EAEAEA' }}
                    labelStyle={{ color: '#F4A261' }}
                    cursor={{ fill: 'rgba(244,162,97,0.12)' }}
                    formatter={(v, n, p) => [`${v} сценариев`, p.payload.label]}
                  />
                  <ReferenceLine
                    x={result.p50}
                    stroke="#F4A261"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: 'P50', fill: '#F4A261', position: 'top' }}
                  />
                  <ReferenceLine
                    x={result.p25}
                    stroke="#8E8E93"
                    strokeDasharray="2 2"
                    label={{ value: 'P25', fill: '#8E8E93', position: 'top' }}
                  />
                  <ReferenceLine
                    x={result.p75}
                    stroke="#8E8E93"
                    strokeDasharray="2 2"
                    label={{ value: 'P75', fill: '#8E8E93', position: 'top' }}
                  />
                  <Bar
                    dataKey="count"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {result.bins.map((b, i) => (
                      <Cell
                        key={i}
                        fill={
                          selectedBin && selectedBin.mid === b.mid
                            ? '#F4A261'
                            : '#2A9D8F'
                        }
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Click drill-down panel */}
            {selectedBin && result && (
              <div
                className="glass"
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #F4A261',
                  animation:
                    'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: '#F4A261',
                    fontWeight: 600,
                  }}
                >
                  В этом бине: {selectedBin.count} сценариев ({(selectedBin.count / 100).toFixed(1)}% от 10 000)
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: '#EAEAEA',
                  }}
                >
                  IRR ∈ [{selectedBin.lo}%; {selectedBin.hi}%]. Параметры активной симуляции: hit_rate={(hitRate * 100).toFixed(0)}%, avg_mult={avgMultiple.toFixed(1)}×, loss_rate={(lossRate * 100).toFixed(0)}%.
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: '#8E8E93',
                  }}
                >
                  Для вашего фонда 3 000 млн ₽: вероятность превысить P75 ({result.p75.toFixed(1)}%) при таких параметрах ≈ 25%.
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// ROOT APP W2
// ========================================================================

function App_W2() {
  return (
    <>
      <ScrollProgress />
      <TopNav />
      <main>
        <HeroSection />
        <ThesisSection />
        <MarketSection />
        <FundStructureSection />
        <EconomicsSection />
        <ReturnsSection />
        <MonteCarloSimulator />
      </main>
      <FooterStub />
    </>
  );
}
