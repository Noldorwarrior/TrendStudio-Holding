// ==== Wave 4: s12 Risks + s13 Roadmap + s14 Scenarios + s15 Regions + s16 Tax Credits + M2 Builder + M3 Commitment Calculator ====

// — EXTEND ICONS from previous waves with what W4 needs —
Object.assign(ICONS, {
  grip: (
    <>
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8.01" y2="10" />
      <line x1="12" y1="10" x2="12.01" y2="10" />
      <line x1="16" y1="10" x2="16.01" y2="10" />
      <line x1="8" y1="14" x2="8.01" y2="14" />
      <line x1="12" y1="14" x2="12.01" y2="14" />
      <line x1="16" y1="14" x2="16.01" y2="14" />
      <line x1="8" y1="18" x2="8.01" y2="18" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
      <line x1="16" y1="18" x2="16.01" y2="18" />
    </>
  ),
  map: (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
});

// ============================================================================
// M2 PIPELINE BUILDER — Конструктор портфеля (MAJOR FIX #2)
// ============================================================================

const PIPELINE_SEED = [
  { id: 'P01', title: 'Проект Alpha',   stage: 'prod', budget: 350, irr: 28 },
  { id: 'P02', title: 'Проект Bravo',   stage: 'pre',  budget: 280, irr: 32 },
  { id: 'P03', title: 'Проект Charlie', stage: 'pre',  budget: 600, irr: 26 },
  { id: 'P04', title: 'Проект Delta',   stage: 'prod', budget: 520, irr: 24 },
  { id: 'P05', title: 'Проект Echo',    stage: 'post', budget: 180, irr: 30 },
  { id: 'P06', title: 'Проект Foxtrot', stage: 'pre',  budget: 420, irr: 22 },
  { id: 'P07', title: 'Проект Gamma',   stage: 'pre',  budget: 220, irr: 18 },
];

const M2_COLUMNS = [
  { id: 'pre',     label: 'Pre-production' },
  { id: 'prod',    label: 'Production' },
  { id: 'post',    label: 'Post-production' },
  { id: 'release', label: 'Release' },
];

function M2BuilderSection() {
  const SEED = PIPELINE_SEED;
  const [placement, setPlacement] = useState(() => ({
    rail: SEED.map((p) => p.id),
    pre: [],
    prod: [],
    post: [],
    release: [],
  }));
  const [dragId, setDragId] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // touch fallback
  const [isTouch] = useState(() => typeof window !== 'undefined' && 'ontouchstart' in window);

  const findById = (id) => SEED.find((p) => p.id === id);

  const stagedIds = ['pre', 'prod', 'post', 'release'].flatMap((c) => placement[c]);
  const stagedProjects = stagedIds.map(findById).filter(Boolean);
  const totalBudget = stagedProjects.reduce((a, p) => a + p.budget, 0);
  const weightedIRR = totalBudget > 0
    ? stagedProjects.reduce((a, p) => a + p.irr * p.budget, 0) / totalBudget
    : 0;

  const moveTo = (targetCol, id) => {
    if (!id) return;
    setPlacement((prev) => {
      const np = Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [k, v.filter((x) => x !== id)])
      );
      np[targetCol] = [...np[targetCol], id];
      return np;
    });
    setSelectedId(null);
    setDragId(null);
    setHoverCol(null);
  };

  const resetToCanon = () => {
    setPlacement({
      rail: [],
      pre: SEED.filter((p) => p.stage === 'pre').map((p) => p.id),
      prod: SEED.filter((p) => p.stage === 'prod').map((p) => p.id),
      post: SEED.filter((p) => p.stage === 'post').map((p) => p.id),
      release: [],
    });
    setSelectedId(null);
  };

  const clearAll = () => {
    setPlacement({ rail: SEED.map((p) => p.id), pre: [], prod: [], post: [], release: [] });
    setSelectedId(null);
  };

  const onDragStart = (id) => (e) => {
    setDragId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', id); } catch (_) { /* some browsers */ }
    }
  };
  const onDragEnd = () => { setDragId(null); setHoverCol(null); };
  const onDropTo = (col) => (e) => {
    e.preventDefault();
    const id = dragId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    moveTo(col, id);
  };
  const onDragOver = (e) => { e.preventDefault(); };

  const handleTapProject = (id) => {
    if (!isTouch) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };
  const handleTapColumn = (col) => {
    if (!isTouch) return;
    if (selectedId) moveTo(col, selectedId);
  };

  const renderProjectCard = (p, context) => {
    const isSelected = selectedId === p.id;
    const isDragging = dragId === p.id;
    return (
      <div
        key={p.id}
        draggable={!isTouch}
        onDragStart={onDragStart(p.id)}
        onDragEnd={onDragEnd}
        onClick={() => handleTapProject(p.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTapProject(p.id); }
        }}
        tabIndex={0}
        role="button"
        aria-grabbed={isDragging}
        aria-label={`${p.title}, бюджет ${p.budget} млн ₽, IRR ${p.irr}%. ${isTouch ? 'Нажмите чтобы выбрать, затем нажмите на колонку' : 'Перетащите в стадию'}`}
        style={{
          background: '#1A1D22',
          border: `1px solid ${isSelected ? '#F4A261' : '#2A2D31'}`,
          borderRadius: 8,
          padding: context === 'rail' ? '10px 14px' : '8px 10px',
          cursor: isTouch ? 'pointer' : 'grab',
          minWidth: context === 'rail' ? 160 : 'auto',
          opacity: isDragging ? 0.5 : 1,
          transition: 'border-color 0.15s ease-out, transform 0.15s ease-out',
          boxShadow: isSelected ? '0 0 0 2px rgba(244,162,97,0.3)' : 'none',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { if (!isSelected && !isDragging) e.currentTarget.style.borderColor = '#3A3D41'; }}
        onMouseLeave={(e) => { if (!isSelected && !isDragging) e.currentTarget.style.borderColor = '#2A2D31'; }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#EAEAEA', marginBottom: 2 }}>
          {p.title}
        </div>
        <div style={{ fontSize: 11, color: '#8E8E93' }}>
          {p.budget} млн ₽ · IRR {p.irr}%
        </div>
      </div>
    );
  };

  return (
    <section
      id="m2"
      style={{ padding: '96px 24px', background: 'linear-gradient(180deg, #0F1216 0%, #0B0D10 100%)', position: 'relative' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Reveal delay={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 700,
                  margin: '0 0 8px',
                  color: '#EAEAEA',
                }}
              >
                M2 · Конструктор портфеля
              </h2>
              <p style={{ color: '#8E8E93', fontSize: 16, maxWidth: 680, margin: 0, lineHeight: 1.5 }}>
                Перетащите проекты из пула в стадии — <Tooltip explanation="Средневзвешенный IRR портфеля: Σ(IRR × бюджет) / Σ(бюджет). Обновляется при каждом перемещении.">IRR</Tooltip> и бюджет портфеля обновляются live.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={clearAll}
                style={{
                  background: 'transparent',
                  color: '#EAEAEA',
                  border: '1px solid #2A2D31',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; }}
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={resetToCanon}
                style={{
                  background: '#F4A261',
                  color: '#0B0D10',
                  border: '1px solid #F4A261',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'transform 0.15s ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon path={ICONS.refresh} size={14} /> Reset to Canon
              </button>
            </div>
          </div>
        </Reveal>

        {/* Rail */}
        {placement.rail.length > 0 && (
          <Reveal delay={100}>
            <div
              style={{
                background: 'rgba(21,24,28,0.6)',
                border: '1px dashed #2A2D31',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
              }}
              aria-label="Пул свободных проектов"
            >
              <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Пул проектов · {placement.rail.length}
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {placement.rail.map((id) => {
                  const p = findById(id);
                  return p ? renderProjectCard(p, 'rail') : null;
                })}
              </div>
            </div>
          </Reveal>
        )}

        {/* Stat-bar */}
        <Reveal delay={150}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>
                Portfolio size (бюджет)
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#F4A261' }}>
                <CountUp end={totalBudget} /> <span style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 400 }}>млн ₽</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>
                Weighted IRR
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#2A9D8F' }}>
                <CountUp end={weightedIRR} decimals={2} suffix="%" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>
                Проектов в портфеле
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#EAEAEA' }}>
                <CountUp end={stagedProjects.length} /> <span style={{ fontSize: 14, color: '#8E8E93', fontWeight: 400 }}>/ 7</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 4 drop columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
          className="grid md:grid-cols-4 gap-4"
        >
          {M2_COLUMNS.map((col, i) => {
            const items = placement[col.id];
            const overload = items.length > 3;
            const isHover = hoverCol === col.id;
            return (
              <Reveal key={col.id} delay={200 + i * 80}>
                <div
                  onDragOver={onDragOver}
                  onDragEnter={() => setHoverCol(col.id)}
                  onDragLeave={() => setHoverCol(null)}
                  onDrop={onDropTo(col.id)}
                  onClick={() => handleTapColumn(col.id)}
                  role="region"
                  aria-label={`Стадия ${col.label}, ${items.length} проект(а/ов)`}
                  style={{
                    background: 'rgba(21,24,28,0.6)',
                    border: `1px ${overload ? 'solid' : isHover ? 'solid' : 'dashed'} ${
                      overload ? '#EF4444' : isHover ? '#F4A261' : '#2A2D31'
                    }`,
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 220,
                    transition: 'border-color 0.15s ease-out, background 0.15s ease-out',
                    cursor: selectedId && isTouch ? 'copy' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#EAEAEA' }}>
                      {col.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(244,162,97,0.12)',
                        color: '#F4A261',
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      {items.length}
                    </div>
                  </div>
                  {overload && (
                    <div
                      role="alert"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.4)',
                        color: '#EF4444',
                        fontSize: 11,
                        padding: '6px 8px',
                        borderRadius: 6,
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Icon path={ICONS.alertTriangle} size={12} /> Перегрузка стадии
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.length === 0 ? (
                      <div
                        style={{
                          fontSize: 13,
                          color: '#8E8E93',
                          textAlign: 'center',
                          padding: '28px 8px',
                          border: '1px dashed #2A2D31',
                          borderRadius: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        Перетащите проект сюда
                      </div>
                    ) : (
                      items.map((id) => {
                        const p = findById(id);
                        return p ? renderProjectCard(p, 'col') : null;
                      })
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {isTouch && selectedId && (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: '#F4A261',
              textAlign: 'center',
              padding: 10,
              border: '1px solid rgba(244,162,97,0.4)',
              borderRadius: 8,
              background: 'rgba(244,162,97,0.08)',
            }}
            role="status"
          >
            Проект «{findById(selectedId)?.title}» выбран. Нажмите на колонку, чтобы переместить.
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// M3 COMMITMENT CALCULATOR (MAJOR FIX #3 — полная замена LP Sizer)
// ============================================================================

function computeCommitment(commitment_mln) {
  const MOIC = 3.62;
  const IRR = 20.09;
  const gross = commitment_mln * MOIC;
  const profit = gross - commitment_mln;

  // 4 tiers (LP waterfall, упрощённая модель)
  const tier1 = commitment_mln * 0.08 * 7;                              // hurdle 8% × 7 лет — LP
  const tier2 = Math.min(commitment_mln * 0.60, profit * 0.20);         // GP catch-up (не для LP)
  const tier3 = Math.max(0, (profit - tier1 - tier2) * 0.80);           // 80/20 split — LP
  const tier4 = MOIC > 2.5 ? profit * 0.05 : 0;                         // super-carry bonus — LP
  const your_take = tier1 + tier3 + tier4;                              // LP получает T1 + T3 + T4

  return { gross, profit, tier1, tier2, tier3, tier4, your_take, MOIC, IRR };
}

function useDebouncedValue(value, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function CommitmentCalculatorSection() {
  const [commitment, setCommitment] = useState(100);
  const debCommit = useDebouncedValue(commitment, 150);

  const res = computeCommitment(debCommit);
  const badge = debCommit >= 200 ? 'Anchor LP' : debCommit >= 50 ? 'Sponsor' : 'Supporter';
  const badgeColor = badge === 'Anchor LP' ? '#F4A261' : badge === 'Sponsor' ? '#2A9D8F' : '#4A9EFF';

  const onInput = (v) => {
    const n = Math.max(10, Math.min(500, Number(v) || 0));
    setCommitment(n);
  };

  const scrollToCta = (e) => {
    e.preventDefault();
    const target = document.getElementById('s22') || document.getElementById('cta');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="m3"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 12px',
              color: '#EAEAEA',
            }}
          >
            Сколько вы получите — посчитайте сами
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 17,
              maxWidth: 720,
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            Введите сумму{' '}
            <Tooltip explanation="Commitment — ваш commitment, объём капитала, который вы обязуетесь вложить в фонд за период 4 года.">
              commitment
            </Tooltip>{' '}
            — увидите Base-сценарий возврата и как распределяется прибыль по 4 уровням.
          </p>
        </Reveal>

        {/* Input */}
        <Reveal delay={150}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: 24, alignItems: 'center' }} className="md:grid-cols-2">
              <div>
                <label htmlFor="commitment-input" style={{ fontSize: 13, color: '#8E8E93', display: 'block', marginBottom: 8 }}>
                  Ваш commitment (млн ₽)
                </label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <input
                    id="commitment-input"
                    type="number"
                    min={10}
                    max={500}
                    step={10}
                    value={commitment}
                    onChange={(e) => onInput(e.target.value)}
                    style={{
                      background: '#0B0D10',
                      border: '1px solid #2A2D31',
                      borderRadius: 8,
                      color: '#EAEAEA',
                      fontSize: 32,
                      fontWeight: 700,
                      padding: '8px 14px',
                      width: 140,
                      fontFamily: "'Playfair Display', serif",
                    }}
                    aria-label="Сумма commitment в млн рублей"
                  />
                  <span style={{ color: '#8E8E93', fontSize: 14 }}>млн ₽</span>
                  <span
                    style={{
                      background: `${badgeColor}22`,
                      color: badgeColor,
                      border: `1px solid ${badgeColor}`,
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      marginLeft: 'auto',
                    }}
                    aria-label={`LP tier: ${badge}`}
                  >
                    {badge}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="commitment-slider" style={{ fontSize: 13, color: '#8E8E93', display: 'block', marginBottom: 8 }}>
                  Ползунок: 10 – 500 млн ₽
                </label>
                <input
                  id="commitment-slider"
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={commitment}
                  onChange={(e) => onInput(e.target.value)}
                  style={{ width: '100%', accentColor: '#F4A261' }}
                  aria-label="Ползунок выбора commitment"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                  <span>10 (Supporter)</span>
                  <span>50 (Sponsor)</span>
                  <span>200 (Anchor)</span>
                  <span>500</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Result big */}
        <Reveal delay={250}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(244,162,97,0.08) 0%, rgba(42,157,143,0.08) 100%)',
              border: '1px solid rgba(244,162,97,0.3)',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Через 7 лет (Base scenario)
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 24,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#8E8E93' }}>Вы вложили</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: '#EAEAEA' }}>
                  <CountUp end={debCommit} /> <span style={{ fontSize: 16, color: '#8E8E93' }}>млн ₽</span>
                </div>
              </div>
              <div style={{ fontSize: 28, color: '#F4A261' }} aria-hidden="true">→</div>
              <div>
                <div style={{ fontSize: 12, color: '#8E8E93' }}>Ваша доля (your_take)</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: '#F4A261' }}>
                  <CountUp end={res.your_take} decimals={1} /> <span style={{ fontSize: 18, color: '#EAEAEA' }}>млн ₽</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', fontSize: 14, color: '#EAEAEA' }}>
              <span>
                IRR <strong style={{ color: '#2A9D8F' }}><CountUp end={res.IRR} decimals={2} suffix="%" /></strong>
              </span>
              <span>
                <Tooltip explanation="MOIC = Multiple of Invested Capital — во сколько раз вложенный капитал вернулся (включая исходный). MOIC 3.62× означает 100 млн → 362 млн брутто.">
                  MOIC
                </Tooltip>
                {' '}<strong style={{ color: '#2A9D8F' }}><CountUp end={res.MOIC} decimals={2} suffix="×" /></strong>
              </span>
              <span>
                Чистая прибыль <strong style={{ color: '#EAEAEA' }}><CountUp end={res.profit} decimals={1} /> млн ₽</strong>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Mini waterfall table */}
        <Reveal delay={350}>
          <div style={{ background: '#15181C', border: '1px solid #2A2D31', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#EAEAEA', marginBottom: 16 }}>
              Как ваша доля распределяется по 4 уровням:
            </div>
            <div role="table" aria-label="Mini waterfall таблица" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  label: 'Tier 1',
                  tooltipTerm: 'hurdle',
                  tooltipText: 'Сначала инвесторы получают свои 8% годовых, потом начинается дележ.',
                  desc: 'ваши 8% годовых × 7 лет',
                  value: res.tier1,
                  forLP: true,
                  color: '#4A9EFF',
                },
                {
                  label: 'Tier 2',
                  tooltipTerm: 'catch-up',
                  tooltipText: 'Управляющий догоняет свою долю до 20% от прибыли — эта часть идёт GP, не LP.',
                  desc: 'catch-up догоняет GP до 20% (идёт GP)',
                  value: 0,
                  gpOnly: res.tier2,
                  forLP: false,
                  color: '#8E8E93',
                },
                {
                  label: 'Tier 3',
                  tooltipTerm: '80/20 split',
                  tooltipText: 'После первых двух этапов оставшаяся прибыль делится: 80% инвесторам, 20% команде.',
                  desc: '80/20 split — ваш основной возврат',
                  value: res.tier3,
                  forLP: true,
                  color: '#2A9D8F',
                },
                {
                  label: 'Tier 4',
                  tooltipTerm: 'super-carry',
                  tooltipText: 'Если фонд умножил капитал больше чем в 2.5× — инвесторы получают бонус 5% сверху.',
                  desc: 'super-carry bonus (MOIC > 2.5×)',
                  value: res.tier4,
                  forLP: true,
                  color: '#F4A261',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  role="row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr 140px',
                    gap: 12,
                    padding: '12px 14px',
                    background: row.forLP ? 'rgba(244,162,97,0.04)' : 'rgba(142,142,147,0.04)',
                    border: `1px solid ${row.forLP ? row.color + '44' : '#2A2D31'}`,
                    borderLeft: `3px solid ${row.color}`,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, color: row.color, fontSize: 13 }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#EAEAEA' }}>
                    <Tooltip explanation={row.tooltipText}>{row.tooltipTerm}</Tooltip>
                    {' — '}
                    <span style={{ color: '#8E8E93' }}>{row.desc}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: row.forLP ? '#EAEAEA' : '#8E8E93' }}>
                    {row.forLP
                      ? <><CountUp end={row.value} decimals={1} /> млн ₽</>
                      : <span style={{ fontStyle: 'italic' }}>идёт GP ({row.gpOnly.toFixed(1)})</span>}
                  </div>
                </div>
              ))}
              <div
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 140px',
                  gap: 12,
                  padding: '14px',
                  background: 'rgba(244,162,97,0.12)',
                  border: '1px solid #F4A261',
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 6,
                }}
              >
                <div style={{ fontWeight: 800, color: '#F4A261', fontSize: 14 }}>ИТОГО</div>
                <div style={{ fontSize: 13, color: '#EAEAEA' }}>Ваша доля (your_take = T1 + T3 + T4)</div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 16, color: '#F4A261' }}>
                  <CountUp end={res.your_take} decimals={1} /> млн ₽
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={400}>
          <div style={{ textAlign: 'center' }}>
            <a
              href="#s22"
              onClick={scrollToCta}
              style={{
                display: 'inline-block',
                background: '#F4A261',
                color: '#0B0D10',
                padding: '16px 36px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(244,162,97,0.35)',
                transition: 'transform 0.2s ease-out',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Запросить LP-пакет →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// s12 RISKS — 3×3 matrix 12 рисков с Modal
// ============================================================================

const RISKS = [
  { id: 'r01', cat: 'market',       title: 'Падение theatrical-спроса',         sev: 'medium', mitigation: 'Диверсификация по каналам: OTT/TV/Educational (70% revenue non-theatrical), hedging через pre-sales международных прав.' },
  { id: 'r02', cat: 'production',   title: 'Срыв сроков production',            sev: 'medium', mitigation: 'Жёсткое планирование с buffer 10%, weekly cost-review, production bond через страховую компанию.' },
  { id: 'r03', cat: 'production',   title: 'Overspend > 15%',                   sev: 'high',   mitigation: 'Completion bond для проектов >300 млн ₽, eskrow-account с two-signature releases, contingency 10% в каждом бюджете.' },
  { id: 'r04', cat: 'financial',    title: 'Delayed LP capital calls',          sev: 'medium', mitigation: 'Revolving credit line 300 млн ₽ от партнёрского банка, staggered capital calls каждые 6 месяцев.' },
  { id: 'r05', cat: 'regulatory',   title: 'Изменения в гос.регулировании',     sev: 'high',   mitigation: 'Legal retainer с top-tier media-юристом, раннее участие в ФКЦК и АКАР, multiple funding sources не-зависимые от одной программы.' },
  { id: 'r06', cat: 'distribution', title: 'Потеря OTT-канала',                 sev: 'medium', mitigation: 'Диверсификация партнёров (Kinopoisk/Okko/Wink/IVI), non-exclusive licenses на 2 года, opt-out clauses.' },
  { id: 'r07', cat: 'creative',     title: 'Creative misalignment',             sev: 'low',    mitigation: 'Двойной creative-DD (внутренний + external consultant), phased greenlight gates (scenario → teaser → principal), формальный style-guide на портфель.' },
  { id: 'r08', cat: 'legal',        title: 'IP / rights dispute',               sev: 'medium', mitigation: 'Chain-of-title aduit для каждого проекта, E&O insurance $3M coverage, legal retainer, предварительная clearance.' },
  { id: 'r09', cat: 'market',       title: 'Санкции / трансграничные',          sev: 'high',   mitigation: 'Cross-border structuring через дружественные юрисдикции (Казахстан/ОАЭ), 60% revenue из RF-только источников, SWIFT-alternative channels.' },
  { id: 'r10', cat: 'financial',    title: 'Валютный риск',                     sev: 'medium', mitigation: 'Natural hedging (RUB-deepnominated LP + RUB-expenses 85%), forward-contracts для USD-экспорта >$500K.' },
  { id: 'r11', cat: 'team',         title: 'Key-person dependency',             sev: 'medium', mitigation: 'Key-person insurance на 3 топ-роли, documented playbooks, 2-person rule на все critical decisions, 6-мес buyout clause.' },
  { id: 'r12', cat: 'operational',  title: 'Technology / production pipeline',  sev: 'low',    mitigation: 'Redundant backup pipeline (dual cloud providers), weekly offsite backups, disaster recovery playbook.' },
];

const SEV_COLORS = { low: '#2A9D8F', medium: '#F4A261', high: '#EF4444' };
const SEV_LABELS = { low: 'низкий', medium: 'средний', high: 'высокий' };

function RiskModal({ risk, onClose }) {
  useEffect(() => {
    if (!risk) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [risk, onClose]);

  if (!risk) return null;
  const sevColor = SEV_COLORS[risk.sev];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'modal-fade 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto',
          background: '#15181C', border: `1px solid ${sevColor}`, borderRadius: 16,
          padding: 28, position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        <button
          type="button" onClick={onClose} aria-label="Закрыть"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'transparent', border: '1px solid #2A2D31',
            color: '#EAEAEA', borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <Icon path={ICONS.close} size={16} />
        </button>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px', borderRadius: 999,
            background: `${sevColor}22`, color: sevColor, border: `1px solid ${sevColor}`,
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
            marginBottom: 14,
          }}
        >
          {SEV_LABELS[risk.sev]} · {risk.cat}
        </div>
        <h3
          id="risk-modal-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700, margin: '0 0 16px', color: '#EAEAEA',
          }}
        >
          {risk.title}
        </h3>
        <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Mitigation
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#EAEAEA', margin: 0 }}>
          {risk.mitigation}
        </p>
      </div>
    </div>
  );
}

function RisksSection() {
  const [openRisk, setOpenRisk] = useState(null);
  return (
    <section
      id="s12"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              textAlign: 'center', margin: '0 0 16px', color: '#EAEAEA',
            }}
          >
            Риски и митигации
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93', fontSize: 17,
              maxWidth: 720, margin: '0 auto 48px', lineHeight: 1.6,
            }}
          >
            12 идентифицированных рисков по 7 категориям. Нажмите на карточку, чтобы увидеть mitigation.
          </p>
        </Reveal>

        {/* Severity legend */}
        <Reveal delay={150}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            {['low', 'medium', 'high'].map((sev) => (
              <div key={sev} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block', width: 12, height: 12, borderRadius: 3,
                    background: SEV_COLORS[sev], border: `1px solid ${SEV_COLORS[sev]}`,
                  }}
                />
                <span style={{ fontSize: 13, color: '#EAEAEA' }}>{SEV_LABELS[sev]}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div
          className="grid md:grid-cols-3 gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {RISKS.map((r, i) => {
            const color = SEV_COLORS[r.sev];
            return (
              <Reveal key={r.id} delay={i * 50}>
                <button
                  type="button"
                  className="card-hover"
                  onClick={() => setOpenRisk(r)}
                  aria-label={`Риск: ${r.title}, уровень ${SEV_LABELS[r.sev]}. Открыть mitigation.`}
                  style={{
                    background: `${color}1F`,
                    border: `1px solid ${color}`,
                    borderRadius: 12,
                    padding: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: 140,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700,
                      color, letterSpacing: 0.7, textTransform: 'uppercase',
                    }}
                  >
                    {r.cat} · {SEV_LABELS[r.sev]}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#EAEAEA', lineHeight: 1.35 }}>
                    {r.title}
                  </span>
                  <span style={{ fontSize: 11, color: '#8E8E93', marginTop: 'auto' }}>
                    {r.id.toUpperCase()} → тап для подробностей
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
      <RiskModal risk={openRisk} onClose={() => setOpenRisk(null)} />
    </section>
  );
}

// ============================================================================
// s13 ROADMAP — 7-year Gantt SVG, 4 swimlanes
// ============================================================================

const ROADMAP_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

const ROADMAP_LANES = [
  { id: 'fund',  label: 'Fundraising',            color: '#F4A261' },
  { id: 'prod',  label: 'Portfolio production',   color: '#2A9D8F' },
  { id: 'dist',  label: 'Distribution',           color: '#4A9EFF' },
  { id: 'exit',  label: 'Exits / returns',        color: '#A855F7' },
];

const ROADMAP_MILESTONES = [
  { year: 2026, lane: 'fund',  label: 'First close' },
  { year: 2026, lane: 'fund',  label: 'Advisory assembled' },
  { year: 2027, lane: 'fund',  label: 'Final close' },
  { year: 2027, lane: 'dist',  label: 'First release' },
  { year: 2028, lane: 'dist',  label: '2 releases' },
  { year: 2028, lane: 'prod',  label: 'Production peak' },
  { year: 2029, lane: 'exit',  label: 'First DPI' },
  { year: 2029, lane: 'dist',  label: 'International deals' },
  { year: 2030, lane: 'exit',  label: 'Library monetization' },
  { year: 2031, lane: 'exit',  label: 'Partial exits' },
  { year: 2032, lane: 'exit',  label: 'Wind-down' },
];

function RoadmapSection() {
  const [hover, setHover] = useState(null); // {x,y,label}
  const W = 960;
  const H = 380;
  const padL = 160;
  const padR = 40;
  const padT = 60;
  const padB = 40;
  const laneH = (H - padT - padB) / ROADMAP_LANES.length;
  const colW = (W - padL - padR) / ROADMAP_YEARS.length;

  const yearX = (y) => padL + (ROADMAP_YEARS.indexOf(y) + 0.5) * colW;
  const laneY = (laneId) => padT + (ROADMAP_LANES.findIndex((l) => l.id === laneId) + 0.5) * laneH;

  return (
    <section
      id="s13"
      style={{ padding: '96px 24px', background: '#0F1216', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              textAlign: 'center', margin: '0 0 16px', color: '#EAEAEA',
            }}
          >
            Roadmap 2026–2032
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93', fontSize: 17,
              maxWidth: 720, margin: '0 auto 48px', lineHeight: 1.6,
            }}
          >
            7-летний Gantt по 4 направлениям: fundraising, производство, дистрибуция, exits.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 16,
              padding: 20,
              overflowX: 'auto',
              position: 'relative',
            }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ minWidth: 720, display: 'block' }}
              role="img"
              aria-label="Gantt-диаграмма roadmap 2026-2032, 4 swimlanes, milestones"
            >
              {/* Year headers */}
              {ROADMAP_YEARS.map((y) => (
                <g key={y}>
                  <line
                    x1={padL + ROADMAP_YEARS.indexOf(y) * colW}
                    y1={padT}
                    x2={padL + ROADMAP_YEARS.indexOf(y) * colW}
                    y2={H - padB}
                    stroke="#2A2D31"
                    strokeDasharray="2 3"
                    strokeWidth={1}
                  />
                  <text
                    x={yearX(y)}
                    y={padT - 18}
                    textAnchor="middle"
                    fill="#EAEAEA"
                    fontSize={13}
                    fontWeight={700}
                  >
                    {y}
                  </text>
                </g>
              ))}
              {/* Right edge line */}
              <line x1={W - padR} y1={padT} x2={W - padR} y2={H - padB} stroke="#2A2D31" strokeDasharray="2 3" />
              <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#2A2D31" />

              {/* Lanes */}
              {ROADMAP_LANES.map((lane, li) => {
                const y = padT + li * laneH;
                return (
                  <g key={lane.id}>
                    <rect
                      x={padL}
                      y={y + 4}
                      width={W - padL - padR}
                      height={laneH - 8}
                      fill={lane.color}
                      opacity={0.07}
                      rx={6}
                    />
                    <text
                      x={padL - 16}
                      y={y + laneH / 2 + 4}
                      textAnchor="end"
                      fill={lane.color}
                      fontSize={12}
                      fontWeight={700}
                    >
                      {lane.label}
                    </text>
                  </g>
                );
              })}

              {/* Milestones */}
              {ROADMAP_MILESTONES.map((m, i) => {
                const lane = ROADMAP_LANES.find((l) => l.id === m.lane);
                const cx = yearX(m.year);
                const cy = laneY(m.lane);
                // Offset сдвиг, если несколько в одной ячейке
                const sameCell = ROADMAP_MILESTONES.filter(
                  (x, xi) => xi < i && x.year === m.year && x.lane === m.lane
                ).length;
                const cyAdj = cy + sameCell * 14 - 7;
                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cyAdj}
                      r={6}
                      fill={lane.color}
                      className="pulse-dot"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const pt = e.currentTarget.getBoundingClientRect();
                        const svg = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                        setHover({ cx, cy: cyAdj, label: m.label, year: m.year, color: lane.color });
                      }}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ cx, cy: cyAdj, label: m.label, year: m.year, color: lane.color })}
                      onBlur={() => setHover(null)}
                      tabIndex={0}
                      aria-label={`${m.label}, ${m.year}, ${lane.label}`}
                    >
                      <title>{m.label} ({m.year})</title>
                    </circle>
                  </g>
                );
              })}

              {/* Tooltip */}
              {hover && (
                <g pointerEvents="none">
                  <rect
                    x={Math.max(padL, Math.min(W - padR - 190, hover.cx - 90))}
                    y={hover.cy - 44}
                    width={180}
                    height={32}
                    rx={6}
                    fill="#0B0D10"
                    stroke={hover.color}
                    strokeWidth={1}
                  />
                  <text
                    x={Math.max(padL, Math.min(W - padR - 190, hover.cx - 90)) + 90}
                    y={hover.cy - 24}
                    textAnchor="middle"
                    fill="#EAEAEA"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {hover.year} · {hover.label}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// s14 SCENARIOS — 4 tabs с LineChart
// ============================================================================

const SCENARIOS = [
  { id: 'bear',   label: 'Bear',   irr: 5.00,  moic: 1.3, p: 20, color: '#EF4444',
    drivers: ['Падение box-office на 20%', 'OTT deals -15% от плана', 'Одна premium-франшиза не зашла'] },
  { id: 'base',   label: 'Base',   irr: 13.95, moic: 2.2, p: 50, color: '#F4A261',
    drivers: ['Рынок BO растёт +12% CAGR', 'OTT пакеты на плане', '7 проектов выпущены по графику'] },
  { id: 'bull',   label: 'Bull',   irr: 22.00, moic: 2.8, p: 25, color: '#2A9D8F',
    drivers: ['2 franchise-hit продукта', 'Sold-out OTT pre-sales', 'International sales +40% от плана'] },
  { id: 'stress', label: 'Stress', irr: -3.00, moic: 0.9, p: 5, color: '#A855F7',
    drivers: ['Регуляторная буря / санкции', 'Отмена 2 релизов', 'Massive overspend + OTT freeze'] },
];

function ScenariosSection() {
  const [active, setActive] = useState('base');
  const activeScene = SCENARIOS.find((s) => s.id === active) || SCENARIOS[1];

  // LineChart data: 4 lines, годы 2026-2032, cumulative multiple роста 1 → moic
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
  const chartData = years.map((y, i) => {
    const t = i / (years.length - 1); // 0..1
    const row = { year: y };
    SCENARIOS.forEach((s) => {
      // Экспоненциальный рост от 1.0 до moic
      const mult = 1 + (s.moic - 1) * t;
      row[s.id] = Math.round(mult * 100) / 100;
    });
    return row;
  });

  return (
    <section
      id="s14"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              textAlign: 'center', margin: '0 0 16px', color: '#EAEAEA',
            }}
          >
            Сценарии доходности
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93', fontSize: 17,
              maxWidth: 720, margin: '0 auto 40px', lineHeight: 1.6,
            }}
          >
            4 сценария: Bear (p=20%), Base (p=50%), Bull (p=25%), Stress (p=5%). Weighted-IRR = 13.95%.
          </p>
        </Reveal>

        {/* Tab bar */}
        <Reveal delay={150}>
          <div
            role="tablist"
            aria-label="Выбор сценария"
            style={{
              display: 'flex', justifyContent: 'center', gap: 8,
              marginBottom: 32, flexWrap: 'wrap',
            }}
          >
            {SCENARIOS.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(s.id)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 700,
                    background: isActive ? s.color : 'transparent',
                    color: isActive ? '#0B0D10' : '#EAEAEA',
                    border: `1px solid ${isActive ? s.color : '#2A2D31'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = s.color; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#2A2D31'; }}
                >
                  {s.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>p={s.p}%</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid: left = KPI card, right = drivers */}
        <Reveal delay={250}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${activeScene.color}11 0%, ${activeScene.color}04 100%)`,
                border: `1px solid ${activeScene.color}`,
                borderRadius: 16,
                padding: 28,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, color: activeScene.color, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginBottom: 12 }}>
                {activeScene.label} · p = {activeScene.p}%
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>IRR</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: activeScene.color }}>
                    <CountUp key={`irr-${active}`} end={activeScene.irr} decimals={2} suffix="%" duration={800} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>
                    <Tooltip explanation="MOIC = Multiple of Invested Capital — во сколько раз вложения вернулись (включая исходный капитал).">MOIC</Tooltip>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: activeScene.color }}>
                    <CountUp key={`moic-${active}`} end={activeScene.moic} decimals={1} suffix="×" duration={800} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>Probability</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: activeScene.color }}>
                    <CountUp key={`p-${active}`} end={activeScene.p} decimals={0} suffix="%" duration={800} />
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginBottom: 12 }}>
                Ключевые драйверы
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {activeScene.drivers.map((d, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '8px 0',
                      borderBottom: i < activeScene.drivers.length - 1 ? '1px solid #2A2D31' : 'none',
                      fontSize: 14, color: '#EAEAEA', lineHeight: 1.5,
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: activeScene.color, fontWeight: 700 }}>•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* LineChart */}
        <Reveal delay={350}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 16,
              padding: '24px 12px 12px',
              height: 380,
            }}
          >
            <div style={{ fontSize: 13, color: '#8E8E93', paddingLeft: 12, marginBottom: 8, fontWeight: 600 }}>
              Кумулятивный multiple по годам (активный сценарий выделен)
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData} margin={{ top: 10, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#2A2D31" />
                <XAxis dataKey="year" stroke="#8E8E93" fontSize={12} />
                <YAxis stroke="#8E8E93" fontSize={12} domain={[0.5, 3]} />
                <RechartsTooltip
                  contentStyle={{ background: '#0B0D10', border: '1px solid #2A2D31', borderRadius: 6, color: '#EAEAEA' }}
                  labelStyle={{ color: '#EAEAEA' }}
                  formatter={(v, n) => {
                    const s = SCENARIOS.find((x) => x.id === n);
                    return [`${v}×`, s ? s.label : n];
                  }}
                />
                {SCENARIOS.map((s) => (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    stroke={s.color}
                    strokeWidth={active === s.id ? 3 : 1.5}
                    strokeOpacity={active === s.id ? 1 : 0.3}
                    dot={active === s.id ? { r: 4, fill: s.color } : false}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// s15 REGIONS — 8 ФО РФ grid + heatmap + hover
// ============================================================================

const REGIONS = [
  { id: 'cfo',  name: 'Центральный',      projects: 3, budget: 1470, desc: 'Москва и область — core production-хаб: съёмки, пост-продакшн, HQ.' },
  { id: 'szfo', name: 'Северо-Западный',  projects: 1, budget: 280,  desc: 'Санкт-Петербург — петербургская школа, авторский/исторический формат.' },
  { id: 'yufo', name: 'Южный',            projects: 1, budget: 180,  desc: 'Сочи/Краснодар — локации, rebate-программы, warm-climate shooting.' },
  { id: 'skfo', name: 'Северо-Кавказский',projects: 0, budget: 0,    desc: 'Резерв на будущие региональные copro-проекты.' },
  { id: 'pfo',  name: 'Приволжский',      projects: 0, budget: 0,    desc: 'Резерв: Казань / Н. Новгород — для copro / co-financing.' },
  { id: 'ufo',  name: 'Уральский',        projects: 1, budget: 270,  desc: 'Екатеринбург — локации уральской индустриальной эстетики.' },
  { id: 'sfo',  name: 'Сибирский',        projects: 1, budget: 420,  desc: 'Новосибирск — жанровые сериалы, уникальные locations.' },
  { id: 'dfo',  name: 'Дальневосточный',  projects: 0, budget: 0,    desc: 'Резерв: Владивосток / Камчатка — уникальные локации.' },
];

function RegionsSection() {
  const [hoverId, setHoverId] = useState(null);
  const maxProjects = Math.max(...REGIONS.map((r) => r.projects));

  return (
    <section
      id="s15"
      style={{ padding: '96px 24px', background: '#0F1216', position: 'relative' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              textAlign: 'center', margin: '0 0 16px', color: '#EAEAEA',
            }}
          >
            География проектов
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93', fontSize: 17,
              maxWidth: 720, margin: '0 auto 48px', lineHeight: 1.6,
            }}
          >
            Распределение 7 проектов портфеля по 8 федеральным округам. Heatmap: чем ярче — тем больше проектов.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {REGIONS.map((r, i) => {
            const intensity = maxProjects > 0 ? r.projects / maxProjects : 0;
            const alpha = 0.08 + intensity * 0.32;
            return (
              <Reveal key={r.id} delay={i * 60}>
                <div
                  className="card-hover"
                  onMouseEnter={() => setHoverId(r.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(r.id)}
                  onBlur={() => setHoverId(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${r.name} федеральный округ, ${r.projects} проект(а/ов), бюджет ${r.budget} млн ₽`}
                  style={{
                    background: `rgba(42,157,143,${alpha})`,
                    border: `1px solid ${r.projects > 0 ? '#2A9D8F' : '#2A2D31'}`,
                    borderRadius: 12,
                    padding: 16,
                    position: 'relative',
                    minHeight: 110,
                    display: 'flex', flexDirection: 'column', gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#EAEAEA' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>
                    ФО
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: r.projects > 0 ? '#2A9D8F' : '#2A2D31' }}>
                      {r.projects}
                    </span>
                    <span style={{ fontSize: 11, color: '#8E8E93' }}>
                      {r.budget > 0 ? `${r.budget} млн ₽` : 'резерв'}
                    </span>
                  </div>
                  {hoverId === r.id && (
                    <div
                      role="tooltip"
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#15181C',
                        border: '1px solid #2A9D8F',
                        padding: '10px 12px',
                        borderRadius: 8,
                        width: 260,
                        fontSize: 12,
                        color: '#EAEAEA',
                        zIndex: 20,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                        lineHeight: 1.5,
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 4, color: '#2A9D8F' }}>
                        {r.projects} проект{r.projects === 1 ? '' : r.projects >= 2 && r.projects <= 4 ? 'а' : 'ов'} · {r.budget} млн ₽
                      </div>
                      {r.desc}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// s16 TAX CREDITS — 4 карточки + inline-калькуляторы + общий summary (MAJOR FIX #5)
// ============================================================================

const TAX_PROGRAMS = [
  {
    id: 'fund_kino',
    title: 'Фонд кино',
    rate: '30–80%',
    ratePct: 30,
    color: '#F4A261',
    subtitle: 'Безвозвратная субсидия',
    authority: 'Фонд кино',
    description: 'Проекты высокой социальной значимости, по конкурсному отбору.',
    calcSubsidy: (b) => b * 0.30,
    details: {
      deadlines: 'Весной ежегодно',
      requirements: 'Заявка + scenario + budget',
      contact: 'fondkino.ru',
    },
  },
  {
    id: 'mincult',
    title: 'Минкультуры',
    rate: 'до 50%',
    ratePct: 50,
    color: '#2A9D8F',
    subtitle: 'Безвозвратная + rebate',
    authority: 'Минкультуры РФ',
    description: 'Фильмы и сериалы отечественного производства.',
    calcSubsidy: (b) => b * 0.50,
    details: {
      deadlines: 'Декабрь–февраль',
      requirements: 'Профильная экспертиза',
      contact: 'mkrf.ru',
    },
  },
  {
    id: 'regional',
    title: 'Региональные rebate',
    rate: '15–30%',
    ratePct: 14,
    color: '#4A9EFF',
    subtitle: 'Production spend в регионе',
    authority: 'Правительства регионов',
    description: 'Подтверждённые локальные расходы, до 6 регионов-партнёров.',
    calcSubsidy: (b) => b * 0.20 * 0.7,
    details: {
      deadlines: 'По запросу региона',
      requirements: 'Production spend в регионе',
      contact: 'Москва / СПб / Калининград / Сочи',
    },
  },
  {
    id: 'digital_bonus',
    title: 'Digital bonus (OTT)',
    rate: '5–10%',
    ratePct: 8,
    color: '#A855F7',
    subtitle: 'Доп. бонус за OTT-релиз',
    authority: 'Программы OTT-партнёров',
    description: 'Проекты с премьерой / окном на российских OTT-платформах.',
    calcSubsidy: (b) => b * 0.08,
    details: {
      deadlines: 'Непрерывно',
      requirements: 'OTT-premiere соглашение',
      contact: 'Kinopoisk / Okko / Wink',
    },
  },
];

function TaxCreditCard({ program, budget }) {
  const [expanded, setExpanded] = useState(false);
  const subsidy = program.calcSubsidy(budget);
  return (
    <div
      className="card-hover"
      style={{
        background: '#15181C',
        border: `1px solid ${program.color}55`,
        borderLeft: `3px solid ${program.color}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 10,
        height: '100%',
      }}
    >
      <header>
        <div
          style={{
            display: 'inline-block',
            background: `${program.color}22`,
            color: program.color,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          {program.rate}
        </div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            margin: '0 0 4px', color: '#EAEAEA',
          }}
        >
          {program.title}
        </h3>
        <div style={{ fontSize: 12, color: '#8E8E93' }}>{program.subtitle}</div>
      </header>
      <p style={{ fontSize: 13, color: '#EAEAEA', margin: 0, lineHeight: 1.5 }}>
        {program.description}
      </p>
      <div style={{ fontSize: 11, color: '#8E8E93' }}>
        <strong style={{ color: '#EAEAEA' }}>Орган:</strong> {program.authority}
      </div>

      {/* Inline result */}
      <div
        style={{
          marginTop: 'auto',
          background: `${program.color}0F`,
          border: `1px dashed ${program.color}`,
          borderRadius: 8,
          padding: '10px 12px',
        }}
      >
        <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2 }}>
          При бюджете {budget} млн ₽ субсидия:
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <strong style={{ fontSize: 24, color: program.color, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            <CountUp end={subsidy} decimals={1} />
          </strong>
          <span style={{ fontSize: 12, color: '#EAEAEA' }}>млн ₽</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8E8E93' }}>
            ≈ {program.ratePct}%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        aria-expanded={expanded}
        style={{
          background: 'transparent',
          border: '1px solid #2A2D31',
          color: '#EAEAEA',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = program.color; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; }}
      >
        Подробнее о программе <Icon path={ICONS.chevronDown} size={14} />
      </button>
      {expanded && (
        <ul style={{ margin: 0, padding: '8px 12px', listStyle: 'none', background: 'rgba(0,0,0,0.25)', borderRadius: 6, fontSize: 12, color: '#EAEAEA', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong style={{ color: program.color }}>Срок подачи:</strong> {program.details.deadlines}</li>
          <li><strong style={{ color: program.color }}>Требования:</strong> {program.details.requirements}</li>
          <li><strong style={{ color: program.color }}>Контакты:</strong> {program.details.contact}</li>
        </ul>
      )}
    </div>
  );
}

function TaxCreditsSection() {
  const [budget, setBudget] = useState(300);
  const totalSubsidy = TAX_PROGRAMS.reduce((a, p) => a + p.calcSubsidy(budget), 0);
  const totalPct = budget > 0 ? (totalSubsidy / budget) * 100 : 0;

  return (
    <section
      id="s16"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              textAlign: 'center', margin: '0 0 16px', color: '#EAEAEA',
            }}
          >
            Господдержка и налоговые кредиты
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93', fontSize: 17,
              maxWidth: 760, margin: '0 auto 40px', lineHeight: 1.6,
            }}
          >
            4 программы поддержки российского кино. Подвигайте слайдер ниже — увидите сумму субсидий на ваш бюджет.
          </p>
        </Reveal>

        {/* Single controlling slider */}
        <Reveal delay={150}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 16,
              padding: 24,
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'center' }} className="md:grid-cols-2">
              <div>
                <label htmlFor="budget-slider" style={{ fontSize: 12, color: '#8E8E93', display: 'block', marginBottom: 6 }}>
                  Бюджет проекта
                </label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    step={10}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(50, Math.min(1000, Number(e.target.value) || 0)))}
                    style={{
                      background: '#0B0D10', border: '1px solid #2A2D31', borderRadius: 8,
                      color: '#F4A261', fontSize: 28, fontWeight: 700, padding: '6px 12px',
                      width: 130, fontFamily: "'Playfair Display', serif",
                    }}
                    aria-label="Бюджет проекта в млн рублей"
                  />
                  <span style={{ color: '#EAEAEA', fontSize: 14 }}>млн ₽</span>
                </div>
              </div>
              <div>
                <input
                  id="budget-slider"
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#F4A261' }}
                  aria-label="Ползунок бюджета"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                  <span>50</span><span>300</span><span>600</span><span>1000</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 4 program cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {TAX_PROGRAMS.map((prog, i) => (
            <Reveal key={prog.id} delay={200 + i * 80}>
              <TaxCreditCard program={prog} budget={budget} />
            </Reveal>
          ))}
        </div>

        {/* Summary block */}
        <Reveal delay={550}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(244,162,97,0.08) 0%, rgba(42,157,143,0.08) 100%)',
              border: '1px solid rgba(244,162,97,0.3)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, marginBottom: 12 }}>
              Суммарная господдержка на ваш бюджет
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93' }}>Бюджет</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#EAEAEA' }}>
                  <CountUp end={budget} /> <span style={{ fontSize: 14, color: '#8E8E93' }}>млн ₽</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93' }}>
                  Сумма всех 4 субсидий
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: '#F4A261' }}>
                  <CountUp end={totalSubsidy} decimals={1} /> <span style={{ fontSize: 16, color: '#EAEAEA' }}>млн ₽</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93' }}>
                  Эффективная ставка
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#2A9D8F' }}>
                  <CountUp end={totalPct} decimals={0} suffix="%" />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 14, margin: 0, lineHeight: 1.5 }}>
              * Максимальное наложение всех 4 программ возможно не всегда — реальная ставка обычно 40–70% в зависимости от проекта.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// APP W4
// ============================================================================

function App_W4() {
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
        <PipelineSection />
        <M2BuilderSection />
        <CommitmentCalculatorSection />
        <StagesSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        <RisksSection />
        <RoadmapSection />
        <ScenariosSection />
        <RegionsSection />
        <TaxCreditsSection />
      </main>
      <FooterStub />
    </>
  );
}
