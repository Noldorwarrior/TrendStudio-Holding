// ==== Wave 2: s04-s06 + M1 Monte-Carlo ====

// — RECHARTS IMPORTS (Tooltip renamed to RechartsTooltip to avoid clash) —
const {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  Tooltip: RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} = Recharts;

// — DATA —

const FUND_STRUCTURE = [
  { name: 'LP (инвесторы)', value: 85, color: '#2A9D8F' },
  { name: 'GP (команда)',   value: 15, color: '#F4A261' }
];

const FUND_FACTS = [
  {
    title: 'LP-коммитмент: 85%',
    primary: '2 550 млн ₽ от LP',
    text: 'Институциональные инвесторы и family offices формируют основной equity-пул фонда. Ограниченная ответственность, приоритетное получение hurdle 8% до распределения carry.'
  },
  {
    title: 'GP-коммитмент: 15%',
    primary: '450 млн ₽, из них 2% (60 млн) skin-in-the-game',
    text: 'Команда вкладывает собственный капитал наравне с LP. Aligned interests: GP зарабатывает carry только после того, как LP получат preferred return.'
  },
  {
    title: 'Период + жизнь фонда',
    primary: '4 года инвестиций + 7 лет общего срока',
    text: 'Investment period: 4 года на формирование портфеля из 7 проектов. Fund life: 7 лет от first close до финальной дистрибуции DPI.'
  }
];

const ECONOMICS_KPIS = [
  {
    label: 'Management fee',
    end: 2,
    decimals: 0,
    suffix: '%',
    sub: 'годовых от commitment',
    tooltip: 'Годовая комиссия на операционные расходы: офис, зарплаты, due diligence'
  },
  {
    label: 'Carried interest',
    end: 20,
    decimals: 0,
    suffix: '%',
    sub: 'GP доля прибыли сверх hurdle',
    tooltip: 'Доля команды в прибыли сверх порога доходности, выплачивается в конце жизни фонда'
  },
  {
    label: 'Hurdle rate',
    end: 8,
    decimals: 0,
    suffix: '%',
    sub: 'preferred return / приоритет LP',
    tooltip: 'Минимальный порог доходности 8% годовых, который LP получают до того, как GP начнёт получать долю'
  },
  {
    label: 'GP catch-up',
    end: 100,
    decimals: 0,
    suffix: '%',
    sub: 'после hurdle, догоняет до parity',
    tooltip: 'После достижения hurdle управляющие догоняют свою долю 20% от общей прибыли'
  }
];

const WATERFALL_TIERS = [
  { label: 'Tier 1: Return of Capital', share: 45, color: '#4F7DF3' },
  { label: 'Tier 2: Hurdle 8% LP',       share: 25, color: '#F4A261' },
  { label: 'Tier 3: GP Catch-up',        share: 10, color: '#2A9D8F' },
  { label: 'Tier 4: 80/20 Split',        share: 20, color: '#A775F4' }
];

const RETURNS_DATA = {
  internal: {
    label: 'Internal W₅ V-D',
    color: '#2A9D8F',
    irr: 24.75,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.85,
    dpiCurve: [
      { year: '1', dpi: 0.00 },
      { year: '2', dpi: 0.00 },
      { year: '3', dpi: 0.10 },
      { year: '4', dpi: 0.25 },
      { year: '5', dpi: 0.45 },
      { year: '6', dpi: 0.90 },
      { year: '7', dpi: 1.85 }
    ]
  },
  public: {
    label: 'Public W₃ консервативная',
    color: '#F4A261',
    irr: 20.09,
    moic: 2.2,
    tvpi: 2.2,
    dpi: 1.85,
    dpiCurve: [
      { year: '1', dpi: 0.00 },
      { year: '2', dpi: 0.00 },
      { year: '3', dpi: 0.08 },
      { year: '4', dpi: 0.22 },
      { year: '5', dpi: 0.40 },
      { year: '6', dpi: 0.85 },
      { year: '7', dpi: 1.85 }
    ]
  }
};

const RETURNS_TOOLTIPS = {
  irr:  'Internal Rate of Return — годовая доходность с учётом времени денежных потоков. Целевой показатель для LP.',
  moic: 'Multiple on Invested Capital — сколько раз вернулся вложенный капитал (без учёта времени).',
  tvpi: 'Total Value to Paid-In — отношение совокупной стоимости (распределено + NAV) к внесённому капиталу.',
  dpi:  'Distributions to Paid-In — фактические распределения LP / внесённый капитал на конец жизни фонда.'
};

// — s04 FUND STRUCTURE —

function FundStructureSection() {
  return (
    <section
      id="s04"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA'
            }}
          >
            Структура фонда
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 720,
              margin: '0 auto 56px',
              lineHeight: 1.6
            }}
          >
            Классическая LP/GP-модель, институциональные условия.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 48,
            alignItems: 'center'
          }}
        >
          {/* Left column: PieChart */}
          <Reveal delay={200}>
            <div
              style={{
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 16,
                padding: 24
              }}
            >
              <div style={{ width: '100%', height: 340 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={FUND_STRUCTURE}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={130}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#0B0D10"
                      strokeWidth={2}
                    >
                      {FUND_STRUCTURE.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: '#15181C',
                        border: '1px solid #2A2D31',
                        borderRadius: 8,
                        color: '#EAEAEA'
                      }}
                      formatter={(v) => `${v}%`}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ color: '#EAEAEA', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p
                style={{
                  textAlign: 'center',
                  color: '#8E8E93',
                  fontSize: 12,
                  marginTop: 16,
                  marginBottom: 0
                }}
              >
                Source: Canon v1.0 / Investor Model v3.0
              </p>
            </div>
          </Reveal>

          {/* Right column: fact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {FUND_FACTS.map((fact, i) => (
              <Reveal key={fact.title} delay={i * 100}>
                <div
                  className="card-hover"
                  style={{
                    background: '#15181C',
                    border: '1px solid #2A2D31',
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      margin: '0 0 8px',
                      color: '#F4A261'
                    }}
                  >
                    {fact.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#EAEAEA',
                      margin: '0 0 8px'
                    }}
                  >
                    {fact.primary}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#8E8E93', margin: 0 }}>
                    {fact.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// — s05 ECONOMICS —

function WaterfallBars() {
  const max = 100;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: 16,
        height: 260,
        padding: '0 8px'
      }}
      aria-label="Waterfall распределения прибыли"
    >
      {WATERFALL_TIERS.map((t) => (
        <div
          key={t.label}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#EAEAEA',
              textAlign: 'center',
              marginBottom: 8,
              minHeight: 32,
              lineHeight: 1.3
            }}
          >
            {t.label}
          </div>
          <div
            style={{
              width: '70%',
              height: `${(t.share / max) * 200}px`,
              background: t.color,
              borderRadius: '8px 8px 0 0',
              transition: 'opacity 0.2s ease-out',
              boxShadow: `0 -4px 16px ${t.color}33`
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.color,
              marginTop: 8
            }}
          >
            {t.share}%
          </div>
        </div>
      ))}
    </div>
  );
}

function EconomicsSection() {
  return (
    <section
      id="s05"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(180deg, #0B0D10 0%, #0F1216 100%)',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA'
            }}
          >
            Экономика для LP
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 720,
              margin: '0 auto 56px',
              lineHeight: 1.6
            }}
          >
            Все fees и carry — открыто, как у институциональных фондов.
          </p>
        </Reveal>

        {/* 4 KPI cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 64
          }}
        >
          {ECONOMICS_KPIS.map((k, i) => (
            <Reveal key={k.label} delay={i * 80}>
              <div
                className="card-hover"
                style={{
                  background: '#15181C',
                  border: '1px solid #2A2D31',
                  borderRadius: 12,
                  padding: 32,
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 48,
                    fontWeight: 700,
                    color: '#F4A261',
                    lineHeight: 1.1
                  }}
                >
                  <CountUp end={k.end} decimals={k.decimals} suffix={k.suffix} />
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#EAEAEA'
                  }}
                >
                  <Tooltip explanation={k.tooltip}>{k.label}</Tooltip>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: '#8E8E93' }}>
                  {k.sub}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mini waterfall */}
        <Reveal delay={400}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 32
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                margin: '0 0 24px',
                color: '#EAEAEA',
                textAlign: 'center'
              }}
            >
              Waterfall распределения прибыли
            </h3>
            <WaterfallBars />
            <p
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 13,
                color: '#8E8E93'
              }}
            >
              European-style waterfall: ROC → Hurdle → Catch-up → 80/20 split
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// — s06 RETURNS —

function ReturnsSection() {
  const [tab, setTab] = useState('internal');
  const data = RETURNS_DATA[tab];

  const scrollToM1 = (e) => {
    e.preventDefault();
    const el = document.getElementById('m1');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="s06"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA'
            }}
          >
            Ожидаемая доходность
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}
          >
            Internal W₅ V-D vs Public W₃ консервативная.
          </p>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={200}>
          <div
            role="tablist"
            aria-label="Сценарии доходности"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 32,
              flexWrap: 'wrap'
            }}
          >
            {[
              { id: 'internal', label: 'Internal' },
              { id: 'public',   label: 'Public' }
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    background: active ? '#F4A261' : 'transparent',
                    color: active ? '#0B0D10' : '#EAEAEA',
                    border: `1px solid ${active ? '#F4A261' : '#2A2D31'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.borderColor = '#F4A261';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.borderColor = '#2A2D31';
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* KPI card */}
        <Reveal delay={300}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 32,
              marginBottom: 32
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 24,
                textAlign: 'center'
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: data.color,
                    lineHeight: 1.1
                  }}
                >
                  <CountUp key={`irr-${tab}`} end={data.irr} decimals={2} suffix="%" />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                  <Tooltip explanation={RETURNS_TOOLTIPS.irr}>IRR</Tooltip>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: data.color,
                    lineHeight: 1.1
                  }}
                >
                  <CountUp key={`moic-${tab}`} end={data.moic} decimals={1} suffix="×" />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                  <Tooltip explanation={RETURNS_TOOLTIPS.moic}>MOIC</Tooltip>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: data.color,
                    lineHeight: 1.1
                  }}
                >
                  <CountUp key={`tvpi-${tab}`} end={data.tvpi} decimals={1} suffix="×" />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                  <Tooltip explanation={RETURNS_TOOLTIPS.tvpi}>TVPI</Tooltip>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: data.color,
                    lineHeight: 1.1
                  }}
                >
                  <CountUp key={`dpi-${tab}`} end={data.dpi} decimals={2} />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                  <Tooltip explanation={RETURNS_TOOLTIPS.dpi}>DPI (year 7)</Tooltip>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* DPI curve LineChart */}
        <Reveal delay={400}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 24
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 16px',
                color: '#EAEAEA',
                textAlign: 'center'
              }}
            >
              DPI curve — 7 лет ({data.label})
            </h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={data.dpiCurve} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                  <XAxis dataKey="year" stroke="#8E8E93" label={{ value: 'Год', position: 'insideBottom', offset: -4, fill: '#8E8E93' }} />
                  <YAxis stroke="#8E8E93" label={{ value: 'DPI', angle: -90, position: 'insideLeft', fill: '#8E8E93' }} />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#15181C',
                      border: '1px solid #2A2D31',
                      borderRadius: 8,
                      color: '#EAEAEA'
                    }}
                    formatter={(v) => [`${Number(v).toFixed(2)}`, 'DPI']}
                    labelFormatter={(l) => `Год ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="dpi"
                    stroke={data.color}
                    strokeWidth={3}
                    dot={{ fill: data.color, r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        {/* Monte-Carlo teaser */}
        <Reveal delay={500}>
          <div
            style={{
              marginTop: 40,
              padding: 24,
              background: 'rgba(244,162,97,0.08)',
              border: '1px dashed #F4A261',
              borderRadius: 12,
              textAlign: 'center'
            }}
          >
            <p style={{ margin: '0 0 16px', color: '#EAEAEA', fontSize: 16 }}>
              Симуляция 10 000 сценариев →
            </p>
            <a
              href="#m1"
              onClick={scrollToM1}
              style={{
                display: 'inline-block',
                background: '#F4A261',
                color: '#0B0D10',
                padding: '12px 28px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Запустить M1 симуляцию
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// — M1 MONTE-CARLO SIMULATOR —

function runMonteCarlo({ hitRate, avgMultiple, lossRate, n = 10000, projects = 7 }) {
  const results = [];
  for (let s = 0; s < n; s++) {
    let total = 0;
    for (let p = 0; p < projects; p++) {
      const roll = Math.random();
      let multiple;
      if (roll < lossRate) multiple = 0;
      else if (roll < lossRate + hitRate) multiple = avgMultiple + (Math.random() * 0.8 - 0.4); // ±0.4 noise
      else multiple = 2.0 + Math.random() * 1.0; // middle: 2.0-3.0 (tuned so defaults → P50≈13.95)
      total += multiple / projects;
    }
    const irr = Math.pow(Math.max(total, 0.01), 1 / projects) - 1;
    results.push(irr * 100);
  }
  results.sort((a, b) => a - b);
  const pct = (p) => results[Math.floor((n * p) / 100)];
  const mean = results.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(results.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  // Histogram binning: 20 bins from -20 to +60
  const BIN_MIN = -20, BIN_MAX = 60, BINS = 20;
  const binW = (BIN_MAX - BIN_MIN) / BINS;
  const hist = [];
  for (let i = 0; i < BINS; i++) {
    const lo = BIN_MIN + i * binW;
    hist.push({ bin: `${Math.round(lo)}%`, mid: lo + binW / 2, count: 0 });
  }
  for (const r of results) {
    let idx = Math.floor((r - BIN_MIN) / binW);
    if (idx < 0) idx = 0;
    if (idx >= BINS) idx = BINS - 1;
    hist[idx].count += 1;
  }
  return {
    p10: pct(10), p25: pct(25), p50: pct(50), p75: pct(75), p90: pct(90),
    mean, std, hist
  };
}

function MonteCarloSection() {
  const [hitRate, setHitRate]       = useState(0.30);
  const [avgMultiple, setAvgMulti]  = useState(3.2);
  const [lossRate, setLossRate]     = useState(0.10);
  const [running, setRunning]       = useState(false);
  const [result, setResult]         = useState(() =>
    runMonteCarlo({ hitRate: 0.30, avgMultiple: 3.2, lossRate: 0.10 })
  );
  const debounceRef = useRef(null);

  // Debounced recompute on slider change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResult(runMonteCarlo({ hitRate, avgMultiple, lossRate }));
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hitRate, avgMultiple, lossRate]);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setResult(runMonteCarlo({ hitRate, avgMultiple, lossRate }));
      setRunning(false);
    }, 500);
  };

  const pRows = [
    { key: 'p10', label: 'P10', val: result.p10, hi: false },
    { key: 'p25', label: 'P25', val: result.p25, hi: false },
    { key: 'p50', label: 'P50 (медиана)', val: result.p50, hi: true },
    { key: 'p75', label: 'P75', val: result.p75, hi: false },
    { key: 'p90', label: 'P90', val: result.p90, hi: false }
  ];

  return (
    <section
      id="m1"
      style={{ padding: '96px 24px', background: '#0F1216', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA'
            }}
          >
            M1 Monte-Carlo симулятор
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 48px',
              lineHeight: 1.6
            }}
          >
            Подвигайте параметры — пересчитает 10 000 сценариев portfolio IRR.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32
          }}
        >
          {/* Left: controls */}
          <Reveal delay={200}>
            <div
              style={{
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 12,
                padding: 32
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  margin: '0 0 24px',
                  color: '#EAEAEA'
                }}
              >
                Параметры симуляции
              </h3>

              {/* Hit rate */}
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="mc-hit"
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#EAEAEA', marginBottom: 8 }}
                >
                  <span>
                    <Tooltip explanation="доля проектов, попавших в хит-категорию">Hit rate (доля хитов)</Tooltip>
                  </span>
                  <span style={{ color: '#F4A261', fontWeight: 700 }}>{(hitRate * 100).toFixed(0)}%</span>
                </label>
                <input
                  id="mc-hit"
                  type="range"
                  min="0.15"
                  max="0.45"
                  step="0.01"
                  value={hitRate}
                  onChange={(e) => setHitRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#F4A261' }}
                  aria-valuemin={0.15}
                  aria-valuemax={0.45}
                  aria-valuenow={hitRate}
                />
              </div>

              {/* Avg multiple */}
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="mc-mult"
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#EAEAEA', marginBottom: 8 }}
                >
                  <span>
                    <Tooltip explanation="среднее, во сколько раз вырос капитал на хит-проектах">Avg multiple хита</Tooltip>
                  </span>
                  <span style={{ color: '#F4A261', fontWeight: 700 }}>{avgMultiple.toFixed(1)}×</span>
                </label>
                <input
                  id="mc-mult"
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.1"
                  value={avgMultiple}
                  onChange={(e) => setAvgMulti(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#F4A261' }}
                  aria-valuemin={2.0}
                  aria-valuemax={5.0}
                  aria-valuenow={avgMultiple}
                />
              </div>

              {/* Loss rate */}
              <div style={{ marginBottom: 32 }}>
                <label
                  htmlFor="mc-loss"
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#EAEAEA', marginBottom: 8 }}
                >
                  <span>
                    <Tooltip explanation="доля проектов с полной потерей капитала">Loss rate (полная потеря)</Tooltip>
                  </span>
                  <span style={{ color: '#F4A261', fontWeight: 700 }}>{(lossRate * 100).toFixed(0)}%</span>
                </label>
                <input
                  id="mc-loss"
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.01"
                  value={lossRate}
                  onChange={(e) => setLossRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#F4A261' }}
                  aria-valuemin={0}
                  aria-valuemax={0.25}
                  aria-valuenow={lossRate}
                />
              </div>

              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                style={{
                  width: '100%',
                  background: running ? '#8E8E93' : '#F4A261',
                  color: '#0B0D10',
                  padding: '14px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  cursor: running ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease-out, transform 0.2s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => { if (!running) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {running && (
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      border: '2px solid #0B0D10',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'mc-spin 0.7s linear infinite'
                    }}
                  />
                )}
                {running ? 'Симуляция…' : 'Run 10 000 simulations'}
              </button>
              <style>{`@keyframes mc-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </Reveal>

          {/* Right: P-values */}
          <Reveal delay={300}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pRows.map((row) => (
                <div
                  key={row.key}
                  className="card-hover"
                  style={{
                    background: row.hi ? 'rgba(244,162,97,0.12)' : '#15181C',
                    border: `1px solid ${row.hi ? '#F4A261' : '#2A2D31'}`,
                    borderRadius: 10,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: row.hi ? '#F4A261' : '#EAEAEA',
                      fontWeight: row.hi ? 700 : 500
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: row.hi ? 28 : 22,
                      fontWeight: 700,
                      color: row.hi ? '#F4A261' : '#EAEAEA'
                    }}
                  >
                    <CountUp key={`${row.key}-${row.val.toFixed(2)}`} end={row.val} decimals={2} suffix="%" duration={600} />
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 8,
                  padding: '16px 20px',
                  background: '#15181C',
                  border: '1px solid #2A2D31',
                  borderRadius: 10,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#8E8E93' }}>mean</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#EAEAEA' }}>
                    {result.mean.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8E8E93' }}>std</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#EAEAEA' }}>
                    {result.std.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Histogram */}
        <Reveal delay={400}>
          <div
            style={{
              marginTop: 32,
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 24
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 16px',
                color: '#EAEAEA',
                textAlign: 'center'
              }}
            >
              Распределение portfolio IRR (10 000 сценариев)
            </h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={result.hist} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                  <XAxis dataKey="bin" stroke="#8E8E93" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8E8E93" tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#0B0D10',
                      border: '1px solid #2A2D31',
                      borderRadius: 8,
                      color: '#EAEAEA'
                    }}
                    formatter={(v) => [`${v} сценариев`, 'Частота']}
                    labelFormatter={(l) => `IRR ≈ ${l}`}
                  />
                  <Bar dataKey="count" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// — APP —

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
        <MonteCarloSection />
      </main>
      <FooterStub />
    </>
  );
}
