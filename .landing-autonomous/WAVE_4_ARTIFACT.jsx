// =====================================================================
// Wave 4 Artifact — ТрендСтудио Landing v2.1
// s12 Risks (gravity matrix 3×3 + modal)
// s13 Roadmap REDESIGN (7 swimlanes × 7 projects + scrubber + 8 milestones)
// s14 Scenarios (4 tabs + CountUp re-anim + LineChart)
// s15 Regions (heatmap 8 ФО РФ + popup)
// s16 Tax Credits (4 inline calc + shared slider + 85% cap summary)
// M2 Pipeline Builder (rail drop-target + FLIP reset + poster thumbs + "Вернуть к исходному")
// M3 Commitment Calculator (Partner / Lead Investor / Anchor Partner)
// =====================================================================

// ========================================================================
// DATA BLOCKS
// ========================================================================

const RISKS = [
  { id: 'r01', cat: 'market',       title: 'Падение theatrical-спроса',          sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Гибкое распределение revenue по каналам, более агрессивный OTT-licensing. Owner: Head of Distribution.' },
  { id: 'r02', cat: 'production',   title: 'Срыв сроков production',             sev: 'medium', prob: 'high',   weight: 4.0, mitigation: 'Contingency 15% в бюджете, insurance, параллельные production slots. Owner: Lead Producer.' },
  { id: 'r03', cat: 'production',   title: 'Overspend > 15%',                    sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Gate-review на каждой стадии, stop-loss при превышении порога. Owner: CFO.' },
  { id: 'r04', cat: 'financial',    title: 'Delayed LP capital calls',           sev: 'medium', prob: 'low',    weight: 2.0, mitigation: 'Bridge-facility с банком-партнёром, диверсификация LP-базы. Owner: CFO.' },
  { id: 'r05', cat: 'regulatory',   title: 'Изменения в гос.регулировании',      sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Legal advisor in-house, сценарии с early-warning. Owner: CEO + Legal.' },
  { id: 'r06', cat: 'distribution', title: 'Потеря OTT-канала',                  sev: 'medium', prob: 'medium', weight: 3.0, mitigation: '4+ OTT-партнёра в бенчмарке, не single-point dependency. Owner: Head of Distribution.' },
  { id: 'r07', cat: 'creative',     title: 'Creative misalignment',              sev: 'low',    prob: 'low',    weight: 1.5, mitigation: 'Creative Director gate + monthly review с LP. Owner: Creative Director.' },
  { id: 'r08', cat: 'legal',        title: 'IP / rights dispute',                sev: 'medium', prob: 'low',    weight: 2.0, mitigation: 'Clean-chain-of-title на стадии development, E&O insurance. Owner: Legal.' },
  { id: 'r09', cat: 'market',       title: 'Санкции / трансграничные',           sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Диверсификация international sales на СНГ/Азию/BRICS. Owner: CEO.' },
  { id: 'r10', cat: 'financial',    title: 'Валютный риск',                      sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Hedging по крупным USD/EUR контрактам, RUB cashflows dominant. Owner: CFO.' },
  { id: 'r11', cat: 'team',         title: 'Key-person dependency',              sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Deputy для каждой key-роли, knowledge transfer, equity retention. Owner: CEO.' },
  { id: 'r12', cat: 'operational',  title: 'Technology / production pipeline',   sev: 'low',    prob: 'low',    weight: 1.5, mitigation: 'Backup vendors, cloud-redundancy для dailies/post. Owner: Head of Production.' }
];
const SEV_COLORS = { low: '#2A9D8F', medium: '#F4A261', high: '#EF4444' };
const PROB_ORDER = { low: 0, medium: 1, high: 2 };
const SEV_ORDER  = { low: 0, medium: 1, high: 2 };

// ------------------------------------------------------------------------
// Roadmap swimlanes / projects / milestones
// ------------------------------------------------------------------------
const SWIMLANES = [
  { id: 'fund', label: 'Fundraising',     color: '#F4A261' },
  { id: 'dev',  label: 'Development',     color: '#2A9D8F' },
  { id: 'pre',  label: 'Pre-production',  color: '#4A9EFF' },
  { id: 'prod', label: 'Production',      color: '#EAB308' },
  { id: 'post', label: 'Post-production', color: '#A855F7' },
  { id: 'dist', label: 'Distribution',    color: '#EF4444' },
  { id: 'exit', label: 'Exits / IP',      color: '#8E8E93' }
];

const PROJECTS_TIMELINE = [
  { id: 'p01', title: 'Alpha',   color: '#F4A261', segments: { dev:[2026.50,2027.00], pre:[2027.00,2027.25], prod:[2027.25,2027.75], post:[2027.75,2028.00], dist:[2028.00,2030.00] } },
  { id: 'p02', title: 'Bravo',   color: '#2A9D8F', segments: { dev:[2026.50,2027.25], pre:[2027.25,2027.75], prod:[2027.75,2028.25], post:[2028.25,2028.50], dist:[2028.50,2030.50] } },
  { id: 'p03', title: 'Charlie', color: '#4A9EFF', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2029.00], post:[2029.00,2029.25], dist:[2029.25,2031.25] } },
  { id: 'p04', title: 'Delta',   color: '#EAB308', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2029.25], post:[2029.25,2029.75], dist:[2029.75,2031.75] } },
  { id: 'p05', title: 'Echo',    color: '#A855F7', segments: { dev:[2026.50,2027.00], pre:[2027.00,2027.25], prod:[2027.25,2027.50], post:[2027.50,2027.75], dist:[2027.75,2029.75] } },
  { id: 'p06', title: 'Foxtrot', color: '#EF4444', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2028.75], post:[2028.75,2029.00], dist:[2029.00,2031.00] } },
  { id: 'p07', title: 'Golf',    color: '#EC4899', segments: { dev:[2027.00,2028.25], pre:[2028.25,2028.75], prod:[2028.75,2029.25], post:[2029.25,2029.50], dist:[2029.50,2031.50] } }
];

const MILESTONES = [
  { year: 2026.75, label: 'First close 1 500 млн ₽',        category: 'fund' },
  { year: 2027.25, label: 'Final close 3 000 млн ₽',        category: 'fund' },
  { year: 2027.75, label: 'Первый релиз (Echo)',            category: 'dist' },
  { year: 2028.50, label: 'Пиковая production (3+ проекта)', category: 'prod' },
  { year: 2029.25, label: 'Первые DPI-выплаты LP',          category: 'dist' },
  { year: 2030.00, label: 'Монетизация библиотеки',          category: 'exit' },
  { year: 2031.50, label: 'Частичные exits',                 category: 'exit' },
  { year: 2032.00, label: 'Wind-down фонда',                 category: 'fund' }
];

// ------------------------------------------------------------------------
// Scenarios
// ------------------------------------------------------------------------
const SCENARIOS = {
  base:   { id: 'base',   label: 'Base',   irr: 13.95, moic: 2.2, prob: 50, color: '#2A9D8F', drivers: ['Исторически-средний BO', 'OTT-рост 20%', 'Budget tolerance ±10%'] },
  bull:   { id: 'bull',   label: 'Bull',   irr: 22.0,  moic: 2.8, prob: 25, color: '#F4A261', drivers: ['2 хита в портфеле', 'International sales +30%', 'OTT pre-sales на всех 7'] },
  bear:   { id: 'bear',   label: 'Bear',   irr: 5.0,   moic: 1.3, prob: 20, color: '#4A9EFF', drivers: ['1-2 флопа', 'Падение theatrical -20%', 'Delay в production'] },
  stress: { id: 'stress', label: 'Stress', irr: -3.0,  moic: 0.9, prob: 5,  color: '#EF4444', drivers: ['Рыночный шок', '3+ срыва', 'Регуляторное ужесточение'] }
};

// Pre-computed DPI curves для LineChart (years 2027-2032)
const SCENARIO_DPI = {
  base:   [{ y: 2027, dpi: 0.05 }, { y: 2028, dpi: 0.25 }, { y: 2029, dpi: 0.75 }, { y: 2030, dpi: 1.35 }, { y: 2031, dpi: 1.85 }, { y: 2032, dpi: 2.2 }],
  bull:   [{ y: 2027, dpi: 0.08 }, { y: 2028, dpi: 0.40 }, { y: 2029, dpi: 1.05 }, { y: 2030, dpi: 1.75 }, { y: 2031, dpi: 2.35 }, { y: 2032, dpi: 2.8 }],
  bear:   [{ y: 2027, dpi: 0.03 }, { y: 2028, dpi: 0.15 }, { y: 2029, dpi: 0.45 }, { y: 2030, dpi: 0.80 }, { y: 2031, dpi: 1.10 }, { y: 2032, dpi: 1.3 }],
  stress: [{ y: 2027, dpi: 0.02 }, { y: 2028, dpi: 0.08 }, { y: 2029, dpi: 0.25 }, { y: 2030, dpi: 0.50 }, { y: 2031, dpi: 0.72 }, { y: 2032, dpi: 0.9 }]
};

// ------------------------------------------------------------------------
// Regions 8 ФО РФ
// ------------------------------------------------------------------------
const REGIONS = [
  { id: 'cfo',  name: 'ЦФО',             count: 3, budget: 1050, taxRebate: '30% rebate' },
  { id: 'szfo', name: 'СЗФО',            count: 1, budget: 280,  taxRebate: '25% rebate' },
  { id: 'yfo',  name: 'ЮФО',             count: 1, budget: 180,  taxRebate: '35% rebate (Сочи)' },
  { id: 'skfo', name: 'СКФО',            count: 0, budget: 0,    taxRebate: '—' },
  { id: 'pfo',  name: 'Приволжский',     count: 0, budget: 0,    taxRebate: '15% rebate' },
  { id: 'ufo',  name: 'Уральский',       count: 1, budget: 420,  taxRebate: '20% rebate' },
  { id: 'sfo',  name: 'Сибирский',       count: 1, budget: 600,  taxRebate: '25% rebate' },
  { id: 'dfo',  name: 'Дальневосточный', count: 1, budget: 270,  taxRebate: '40% rebate' }
];

// ------------------------------------------------------------------------
// Tax credits programs
// ------------------------------------------------------------------------
const TAX_PROGRAMS = [
  { id: 'fund_kino',     title: 'Фонд кино',          rate: '30–80%', color: '#F4A261',
    calcSubsidy: (b) => b * 0.30,            subtitle: 'Безвозвратная субсидия',
    description: 'Проекты высокой социальной значимости, по конкурсному отбору.' },
  { id: 'mincult',       title: 'Минкультуры',        rate: 'до 50%', color: '#2A9D8F',
    calcSubsidy: (b) => b * 0.50,            subtitle: 'Безвозвратная + rebate',
    description: 'Фильмы и сериалы отечественного производства по профилю.' },
  { id: 'regional',      title: 'Региональные rebate', rate: '15–30%', color: '#4A9EFF',
    calcSubsidy: (b) => b * 0.20 * 0.7,      subtitle: 'Production spend в регионе',
    description: 'Подтверждённые локальные расходы, до 6 регионов-партнёров.' },
  { id: 'digital_bonus', title: 'Digital bonus (OTT)', rate: '5–10%',  color: '#A855F7',
    calcSubsidy: (b) => b * 0.08,            subtitle: 'Доп. бонус за OTT-релиз',
    description: 'Проекты с премьерой на российских OTT-платформах.' }
];

// ------------------------------------------------------------------------
// M2 Pipeline Builder — canon layout (все 7 в Development)
// ------------------------------------------------------------------------
const M2_STAGES = [
  { id: 'dev',     label: 'Development'     },
  { id: 'pre',     label: 'Pre-production'  },
  { id: 'prod',    label: 'Production'      },
  { id: 'post',    label: 'Post-production' },
  { id: 'release', label: 'Release'         }
];

const M2_CANON = {
  rail:    [],
  dev:     ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07'],
  pre:     [],
  prod:    [],
  post:    [],
  release: []
};

const PIPELINE_POSTERS = {
  p01: 'img10', p02: 'img11', p03: 'img12', p04: 'img13', p05: 'img14', p06: 'img15', p07: 'img16'
};

// ========================================================================
// s12 — RISKS (gravity matrix 3×3 + Modal)
// ========================================================================

function RisksSection() {
  const [selected, setSelected] = useState(null);

  // Build 3×3 matrix (rows = sev high→low, cols = prob low→high)
  const matrix = {};
  for (const r of RISKS) {
    const k = `${r.sev}|${r.prob}`;
    if (!matrix[k]) matrix[k] = [];
    matrix[k].push(r);
  }

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  // Size from weight (1.5..4.5) -> 56..120 px
  const weightToSize = (w) => Math.round(56 + ((w - 1.5) / 3.0) * 64);

  const sevRows  = ['high', 'medium', 'low'];
  const probCols = ['low', 'medium', 'high'];

  return (
    <section id="s12" style={{ padding: '96px 24px', background: '#0F1216', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Риски и митигация
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            12 рисков в 3×3 матрице — severity × probability, размер = weight
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Клик на кружок → митигация + owner
          </p>
        </Reveal>

        {/* Matrix */}
        <Reveal delay={260}>
          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 8, alignItems: 'stretch' }}>
            {/* Header row */}
            <div />
            {probCols.map((p) => (
              <div key={`hdr-${p}`} style={{
                textAlign: 'center', fontSize: 12, color: '#8E8E93',
                textTransform: 'uppercase', letterSpacing: 1, padding: '4px 0'
              }}>
                prob: {p}
              </div>
            ))}

            {/* Rows */}
            {sevRows.map((s) => (
              <React.Fragment key={`row-${s}`}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  fontSize: 12, color: SEV_COLORS[s], paddingRight: 12,
                  textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
                  minWidth: 90
                }}>
                  sev: {s}
                </div>
                {probCols.map((p) => {
                  const cellRisks = matrix[`${s}|${p}`] || [];
                  return (
                    <div key={`${s}-${p}`} style={{
                      position: 'relative',
                      minHeight: 140,
                      background: 'rgba(21,24,28,0.5)',
                      border: '1px solid rgba(42,45,49,0.7)',
                      borderRadius: 12,
                      padding: 12,
                      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
                      gap: 8
                    }}>
                      {cellRisks.map((r) => {
                        const sz = weightToSize(r.weight);
                        return (
                          <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            aria-label={`Риск: ${r.title}`}
                            style={{
                              width: sz, height: sz, borderRadius: '50%',
                              background: `radial-gradient(circle at 30% 30%, ${SEV_COLORS[r.sev]}, ${SEV_COLORS[r.sev]}99)`,
                              border: `2px solid ${SEV_COLORS[r.sev]}`,
                              boxShadow: `0 0 16px ${SEV_COLORS[r.sev]}55`,
                              cursor: 'pointer',
                              fontSize: Math.min(11, sz / 9),
                              color: '#0B0D10',
                              fontWeight: 700,
                              padding: 4,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              textAlign: 'center',
                              lineHeight: 1.15,
                              transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                              fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.12)';
                              e.currentTarget.style.boxShadow = `0 0 32px ${SEV_COLORS[r.sev]}`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = `0 0 16px ${SEV_COLORS[r.sev]}55`;
                            }}
                          >
                            {r.id.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Reveal>

        {/* Legend */}
        <Reveal delay={360}>
          <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: '#8E8E93' }}>
            {Object.entries(SEV_COLORS).map(([k, c]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                severity: {k}
              </span>
            ))}
            <span>• размер кружка = weight (1.5 – 4.5)</span>
          </div>
        </Reveal>

        {/* Modal */}
        {selected && (
          <div role="dialog" aria-modal="true" aria-labelledby="risk-modal-title"
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}>
            <div className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 560, width: '100%',
                background: '#15181C', border: `1px solid ${SEV_COLORS[selected.sev]}`,
                borderRadius: 14, padding: 32, position: 'relative',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)'
              }}>
              <button onClick={() => setSelected(null)} aria-label="Закрыть"
                style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#8E8E93', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>×</button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: SEV_COLORS[selected.sev],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0B0D10', fontWeight: 700, fontSize: 12
                }}>{selected.id.toUpperCase()}</div>
                <div>
                  <h3 id="risk-modal-title" style={{ fontSize: 22, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0 }}>
                    {selected.title}
                  </h3>
                  <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {selected.cat} · sev {selected.sev} · prob {selected.prob} · weight {selected.weight}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 20, padding: 16,
                background: 'rgba(244,162,97,0.08)', borderRadius: 8,
                border: '1px solid rgba(244,162,97,0.3)'
              }}>
                <div style={{ fontSize: 11, color: '#F4A261', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Митигация и owner
                </div>
                <p style={{ color: '#EAEAEA', marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                  {selected.mitigation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================================================
// s13 — ROADMAP (REDESIGN: 7 swimlanes × 7 projects + scrubber playhead)
// ========================================================================

function RoadmapSection() {
  const [scrubberYear, setScrubberYear] = useState(2027.50);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterLane, setFilterLane] = useState(null);
  const containerRef = useRef(null);

  const X_MIN = 2026, X_MAX = 2032;
  const yearToX = (y) => ((y - X_MIN) / (X_MAX - X_MIN)) * 100; // %

  const activeProjects = PROJECTS_TIMELINE.map((p) => {
    const entry = Object.entries(p.segments).find(([, [s, e]]) => s <= scrubberYear && scrubberYear < e);
    return { ...p, currentLane: entry ? entry[0] : null };
  });

  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    setScrubberYear(X_MIN + pct * (X_MAX - X_MIN));
  };

  const startDrag = (e) => {
    handleDrag(e);
    const onMove = handleDrag;
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelectedProject(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedProject]);

  const quarterOf = (y) => {
    const frac = y - Math.floor(y);
    return Math.min(4, Math.max(1, Math.floor(frac * 4) + 1));
  };

  return (
    <section id="s13" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Roadmap 7 лет
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            Production + fundraising + distribution — Gantt для 7 проектов
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Перетащите scrubber — увидите какой проект в какой фазе в выбранный момент
          </p>
        </Reveal>

        {/* Scrubber preview */}
        <Reveal delay={220}>
          <div className="glass" style={{
            padding: 16, borderRadius: 10, border: '1px solid #F4A261',
            marginTop: 32, textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>
              Состояние портфеля на
            </div>
            <div style={{ fontSize: 24, fontFamily: "'Playfair Display'", color: '#F4A261', marginTop: 4 }}>
              Q{quarterOf(scrubberYear)} {Math.floor(scrubberYear)}
            </div>
            <div style={{ fontSize: 13, color: '#EAEAEA', marginTop: 8 }}>
              {SWIMLANES.filter((l) => l.id !== 'fund' && l.id !== 'exit').map((l) => {
                const inLane = activeProjects.filter((p) => p.currentLane === l.id).length;
                return inLane > 0 ? (
                  <span key={l.id} style={{ marginRight: 12 }}>
                    {l.label}: <strong style={{ color: l.color }}>{inLane}</strong>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </Reveal>

        {/* Gantt */}
        <Reveal delay={300}>
          <div style={{ marginTop: 32, overflowX: 'auto' }}>
            <div
              ref={containerRef}
              onMouseDown={startDrag}
              style={{
                position: 'relative',
                minWidth: 1000, height: 460,
                background: '#0F1216', borderRadius: 12,
                border: '1px solid #2A2D31', padding: '24px 0 8px',
                cursor: 'ew-resize',
                userSelect: 'none'
              }}>
              {/* Year grid */}
              {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => (
                <div key={y} style={{
                  position: 'absolute', left: `${yearToX(y)}%`, top: 0, bottom: 0,
                  borderLeft: '1px dashed rgba(142,142,147,0.2)', width: 1, pointerEvents: 'none'
                }}>
                  <div style={{
                    position: 'absolute', top: -20, left: 0,
                    fontSize: 12, color: '#8E8E93', transform: 'translateX(-50%)'
                  }}>
                    {y}
                  </div>
                </div>
              ))}

              {/* Swimlanes */}
              {SWIMLANES.map((lane, laneIdx) => (
                <div
                  key={lane.id}
                  onClick={(evt) => { evt.stopPropagation(); setFilterLane(filterLane === lane.id ? null : lane.id); }}
                  style={{
                    position: 'absolute',
                    top: 20 + laneIdx * 56,
                    left: 0, right: 0, height: 50,
                    background: filterLane === lane.id ? 'rgba(244,162,97,0.05)' : 'transparent',
                    borderTop: '1px solid rgba(42,45,49,0.3)',
                    cursor: 'pointer',
                    transition: 'background 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  title={`Фильтр: ${lane.label}`}
                >
                  <div style={{
                    position: 'absolute', left: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 11, color: lane.color, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5, zIndex: 2,
                    background: '#0F1216', padding: '2px 8px', borderRadius: 4
                  }}>
                    {lane.label}
                  </div>
                </div>
              ))}

              {/* Project bars */}
              {PROJECTS_TIMELINE.map((p, pIdx) =>
                Object.entries(p.segments).map(([laneId, [s, e]]) => {
                  const laneIdx = SWIMLANES.findIndex((l) => l.id === laneId);
                  if (laneIdx < 0) return null;
                  const dim = filterLane && filterLane !== laneId;
                  return (
                    <div
                      key={`${p.id}-${laneId}`}
                      onClick={(evt) => { evt.stopPropagation(); setSelectedProject(p); }}
                      style={{
                        position: 'absolute',
                        left: `${yearToX(s)}%`,
                        width: `${yearToX(e) - yearToX(s)}%`,
                        top: 20 + laneIdx * 56 + 14 + (pIdx % 7) * 2,
                        height: 20, background: p.color, borderRadius: 4,
                        opacity: dim ? 0.2 : 0.9,
                        cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#0B0D10',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', overflow: 'hidden', whiteSpace: 'nowrap',
                        transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        boxShadow: dim ? 'none' : `0 0 8px ${p.color}55`
                      }}
                      title={`${p.title}: ${SWIMLANES[laneIdx].label} (${s} — ${e})`}
                      onMouseEnter={(e) => { if (!dim) e.currentTarget.style.transform = 'scaleY(1.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scaleY(1)'; }}
                    >
                      {p.title}
                    </div>
                  );
                })
              )}

              {/* Milestones */}
              {MILESTONES.map((m, i) => {
                const laneIdx = SWIMLANES.findIndex((l) => l.id === m.category);
                if (laneIdx < 0) return null;
                return (
                  <div
                    key={`ms-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${yearToX(m.year)}%`,
                      top: 14 + laneIdx * 56,
                      transform: 'translate(-50%, 0)',
                      zIndex: 5, pointerEvents: 'none'
                    }}
                  >
                    <svg width="14" height="14" style={{ overflow: 'visible' }}>
                      <circle cx="7" cy="7" r="5" fill="#F4A261" stroke="#FFFFFF" strokeWidth="1.5"
                        style={{
                          animation: `pulse-ms 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 150}ms 3`,
                          transformOrigin: 'center'
                        }} />
                    </svg>
                    <div className="glass" style={{
                      position: 'absolute', top: 'calc(100% + 4px)',
                      left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid #2A2D31',
                      fontSize: 10, color: '#EAEAEA', whiteSpace: 'nowrap',
                      opacity: 0.7
                    }}>
                      {m.label}
                    </div>
                  </div>
                );
              })}

              {/* Scrubber playhead */}
              <div style={{
                position: 'absolute',
                left: `${yearToX(scrubberYear)}%`, top: 0, bottom: 0,
                width: 2, background: '#F4A261', zIndex: 10, pointerEvents: 'none',
                boxShadow: '0 0 12px #F4A261'
              }}>
                <div style={{
                  position: 'absolute', top: -8, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16, height: 16, background: '#F4A261',
                  borderRadius: '50%', boxShadow: '0 0 16px #F4A261',
                  border: '2px solid #FFFFFF'
                }} />
              </div>

              <style>{`
                @keyframes pulse-ms {
                  0%,100% { transform: scale(1); opacity: 1; }
                  50%     { transform: scale(1.8); opacity: 0.5; }
                }
              `}</style>
            </div>
          </div>
        </Reveal>

        {/* Filter hint */}
        {filterLane && (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#F4A261' }}>
            Фильтр: {SWIMLANES.find((l) => l.id === filterLane)?.label} — нажмите снова, чтобы снять
          </div>
        )}

        {/* Project modal */}
        {selectedProject && (
          <div role="dialog" aria-modal="true" aria-labelledby="roadmap-proj-title"
            onClick={() => setSelectedProject(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}>
            <div className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 560, width: '100%', padding: 32, borderRadius: 14,
                border: `1px solid ${selectedProject.color}`,
                background: '#15181C', position: 'relative',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)'
              }}>
              <button onClick={() => setSelectedProject(null)} aria-label="Закрыть"
                style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#8E8E93', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>×</button>
              <h3 id="roadmap-proj-title" style={{
                fontSize: 28, fontFamily: "'Playfair Display'",
                color: selectedProject.color, margin: 0
              }}>
                Проект {selectedProject.title}
              </h3>
              <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Roadmap timeline по стадиям
              </div>
              <div style={{
                marginTop: 16, display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 12
              }}>
                {Object.entries(selectedProject.segments).map(([laneId, [s, e]]) => {
                  const lane = SWIMLANES.find((l) => l.id === laneId);
                  if (!lane) return null;
                  return (
                    <div key={laneId} style={{
                      padding: 10, background: 'rgba(21,24,28,0.6)',
                      borderRadius: 6, borderLeft: `3px solid ${lane.color}`
                    }}>
                      <div style={{ fontSize: 11, color: lane.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        {lane.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#EAEAEA', marginTop: 4 }}>
                        {s.toFixed(2)} — {e.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  marginTop: 24, padding: '10px 20px',
                  background: selectedProject.color, color: '#0B0D10',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600
                }}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================================================
// s14 — SCENARIOS (4 tabs + CountUp re-anim + DPI LineChart)
// ========================================================================

function ScenariosSection() {
  const [activeId, setActiveId] = useState('base');
  const scenario = SCENARIOS[activeId];

  // Merge DPI curves into chart data
  const chartData = SCENARIO_DPI[activeId].map((row, i) => ({
    y: row.y,
    base:   SCENARIO_DPI.base[i]?.dpi,
    bull:   SCENARIO_DPI.bull[i]?.dpi,
    bear:   SCENARIO_DPI.bear[i]?.dpi,
    stress: SCENARIO_DPI.stress[i]?.dpi
  }));

  return (
    <section id="s14" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Сценарии доходности
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            Base / Bull / Bear / Stress — 4 окна будущего для вашего фонда
          </p>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={200}>
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            marginTop: 32, flexWrap: 'wrap'
          }}>
            {Object.values(SCENARIOS).map((sc) => {
              const active = activeId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveId(sc.id)}
                  aria-pressed={active}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    background: active ? sc.color : 'transparent',
                    color: active ? '#0B0D10' : '#EAEAEA',
                    border: `1px solid ${active ? sc.color : '#2A2D31'}`,
                    cursor: 'pointer',
                    fontWeight: 600, fontSize: 14,
                    transform: active ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: active ? `0 0 20px ${sc.color}66` : 'none',
                    transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                >
                  {sc.label} · {sc.prob}%
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Scenario card */}
        <Reveal delay={320}>
          <div key={activeId} className="glass" style={{
            marginTop: 32, padding: 32, borderRadius: 14,
            border: `2px solid ${scenario.color}`,
            boxShadow: `0 16px 48px ${scenario.color}33`,
            animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 24, textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>IRR</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: scenario.color, marginTop: 4 }}>
                  <CountUp key={`irr-${activeId}`} end={scenario.irr} decimals={1} suffix="%" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>MOIC</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`moic-${activeId}`} end={scenario.moic} decimals={1} suffix="x" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>Probability</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`prob-${activeId}`} end={scenario.prob} suffix="%" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>
                Ключевые драйверы
              </div>
              <ul style={{
                marginTop: 8, paddingLeft: 18,
                color: '#EAEAEA', fontSize: 14, lineHeight: 1.7
              }}>
                {scenario.drivers.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* DPI LineChart */}
        <Reveal delay={440}>
          <div className="glass" style={{
            marginTop: 24, padding: 20, borderRadius: 14,
            border: '1px solid #2A2D31'
          }}>
            <div style={{ fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Кумулятивный DPI по сценариям (2027 – 2032)
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                <XAxis dataKey="y" stroke="#8E8E93" fontSize={12} />
                <YAxis stroke="#8E8E93" fontSize={12} tickFormatter={(v) => `${v}x`} />
                <RechartsTooltip
                  contentStyle={{ background: '#15181C', border: '1px solid #F4A261', borderRadius: 8, color: '#EAEAEA' }}
                  formatter={(val, key) => [`${(+val).toFixed(2)}x`, SCENARIOS[key].label]}
                />
                {['base', 'bull', 'bear', 'stress'].map((k) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={SCENARIOS[k].color}
                    strokeWidth={activeId === k ? 3 : 1.2}
                    strokeOpacity={activeId === k ? 1 : 0.35}
                    dot={activeId === k ? { r: 4, fill: SCENARIOS[k].color } : false}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
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

// ========================================================================
// s15 — REGIONS (heatmap 8 ФО + popup)
// ========================================================================

function RegionsSection() {
  const [selected, setSelected] = useState(null);
  const maxCount = Math.max(...REGIONS.map((r) => r.count), 1);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <section id="s15" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            География производства
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            8 федеральных округов РФ — распределение проектов и региональные rebate
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Клик на округ → tax rebate и бюджет в регионе
          </p>
        </Reveal>

        {/* Heatmap grid */}
        <Reveal delay={260}>
          <div style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            {REGIONS.map((r, i) => {
              const intensity = r.count / maxCount; // 0..1
              const dim = intensity === 0;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  style={{
                    position: 'relative',
                    padding: 20, borderRadius: 12,
                    background: dim
                      ? 'rgba(21,24,28,0.6)'
                      : `linear-gradient(135deg, rgba(42,157,143,${0.25 + intensity * 0.55}), rgba(244,162,97,${0.15 + intensity * 0.4}))`,
                    border: dim ? '1px dashed #2A2D31' : `1px solid rgba(42,157,143,${0.5 + intensity * 0.4})`,
                    color: '#EAEAEA', cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: dim ? 'none' : `0 0 ${16 + intensity * 16}px rgba(42,157,143,${0.2 + intensity * 0.35})`,
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    animation: `fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`,
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    if (!dim) e.currentTarget.style.boxShadow = `0 0 32px rgba(42,157,143,0.6)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = dim ? 'none' : `0 0 ${16 + intensity * 16}px rgba(42,157,143,${0.2 + intensity * 0.35})`;
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display'" }}>
                    {r.name}
                  </div>
                  <div style={{
                    marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Проектов
                      </div>
                      <div style={{ fontSize: 28, fontFamily: "'Playfair Display'", color: dim ? '#8E8E93' : '#F4A261' }}>
                        {r.count}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Бюджет
                      </div>
                      <div style={{ fontSize: 14, color: '#EAEAEA', marginTop: 2 }}>
                        {r.budget > 0 ? `${r.budget} млн ₽` : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 12, fontSize: 12, color: '#2A9D8F',
                    borderTop: '1px solid rgba(42,45,49,0.6)', paddingTop: 8
                  }}>
                    {r.taxRebate}
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Popup */}
        {selected && (
          <div role="dialog" aria-modal="true" aria-labelledby="region-modal-title"
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}>
            <div className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 460, width: '100%', padding: 28, borderRadius: 14,
                border: '1px solid #2A9D8F', background: '#15181C',
                position: 'relative', boxShadow: '0 24px 72px rgba(0,0,0,0.8)'
              }}>
              <button onClick={() => setSelected(null)} aria-label="Закрыть"
                style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#8E8E93', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>×</button>
              <h3 id="region-modal-title" style={{
                fontSize: 24, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0
              }}>
                {selected.name}
              </h3>
              <div style={{
                marginTop: 16, display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 12
              }}>
                <div style={{ padding: 12, background: 'rgba(21,24,28,0.5)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>Проектов</div>
                  <div style={{ fontSize: 22, fontFamily: "'Playfair Display'", color: '#F4A261', marginTop: 4 }}>
                    {selected.count}
                  </div>
                </div>
                <div style={{ padding: 12, background: 'rgba(21,24,28,0.5)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>Бюджет</div>
                  <div style={{ fontSize: 22, fontFamily: "'Playfair Display'", color: '#2A9D8F', marginTop: 4 }}>
                    {selected.budget > 0 ? `${selected.budget} млн ₽` : '—'}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 16, padding: 14,
                background: 'rgba(42,157,143,0.1)', borderRadius: 8,
                border: '1px solid rgba(42,157,143,0.3)'
              }}>
                <div style={{ fontSize: 11, color: '#2A9D8F', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Региональный rebate
                </div>
                <div style={{ color: '#EAEAEA', marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
                  {selected.taxRebate}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================================================
// s16 — TAX CREDITS (shared slider + 4 inline cards + 85% cap summary)
// ========================================================================

function TaxCreditsSection() {
  const [budget, setBudget] = useState(300);
  const [expandedCap, setExpandedCap] = useState(false);

  const subsidies = TAX_PROGRAMS.map((p) => ({ ...p, subsidy: p.calcSubsidy(budget) }));
  const rawTotal = subsidies.reduce((acc, p) => acc + p.subsidy, 0);
  const cappedTotal = Math.min(rawTotal, budget * 0.85);
  const effectiveRate = (cappedTotal / budget) * 100;

  return (
    <section id="s16" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Государственная поддержка
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            4 программы, эффективная ставка до 85% бюджета
          </p>
        </Reveal>

        {/* Shared slider */}
        <Reveal delay={200}>
          <div className="glass" style={{
            marginTop: 32, padding: 20, borderRadius: 12,
            border: '1px solid #F4A261',
            maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>
              Ваш бюджет проекта
            </div>
            <div style={{ fontSize: 36, fontFamily: "'Playfair Display'", color: '#F4A261', marginTop: 4 }}>
              {budget} млн ₽
            </div>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={budget}
              onChange={(e) => setBudget(+e.target.value)}
              aria-label="Бюджет проекта в млн ₽"
              style={{ width: '100%', marginTop: 12, accentColor: '#F4A261' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#8E8E93', marginTop: 4
            }}>
              <span>50 млн</span>
              <span>1 000 млн</span>
            </div>
          </div>
        </Reveal>

        {/* 4 program cards */}
        <div style={{
          marginTop: 48, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20
        }}>
          {TAX_PROGRAMS.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article
                className="card-hover glass"
                style={{
                  padding: 20, borderRadius: 12,
                  border: `1px solid ${p.color}44`, height: '100%',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: p.color }}>
                  {p.rate}
                </div>
                <h3 style={{ fontSize: 18, color: '#EAEAEA', marginTop: 8, fontFamily: "'Playfair Display'" }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {p.subtitle}
                </div>
                <p style={{ color: '#EAEAEA', marginTop: 12, fontSize: 13, lineHeight: 1.5, flexGrow: 1 }}>
                  {p.description}
                </p>
                <div style={{
                  marginTop: 16, padding: 12,
                  background: 'rgba(11,13,16,0.5)',
                  borderRadius: 8, border: '1px dashed #2A2D31'
                }}>
                  <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>
                    Субсидия для вашего бюджета
                  </div>
                  <div style={{ fontSize: 24, fontFamily: "'Playfair Display'", color: p.color, marginTop: 4 }}>
                    <CountUp key={`${p.id}-${budget}`} end={p.calcSubsidy(budget)} decimals={1} suffix=" млн ₽" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Summary with cap */}
        <Reveal delay={520}>
          <div className="glass" style={{
            marginTop: 48, padding: 32, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(244,162,97,0.10), rgba(42,157,143,0.10))',
            border: '2px solid rgba(244,162,97,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#F4A261', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              Суммарная господдержка на ваш бюджет {budget} млн ₽
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'baseline',
              marginTop: 20, flexWrap: 'wrap', gap: 24
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>Суммарно (brutto)</div>
                <div style={{ fontSize: 36, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`raw-${budget}`} end={rawTotal} decimals={0} suffix=" млн" />
                </div>
              </div>
              <div style={{ fontSize: 24, color: '#8E8E93' }}>→ cap 85%</div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>Эффективно (реалистично)</div>
                <div style={{ fontSize: 48, fontFamily: "'Playfair Display'", color: '#F4A261', marginTop: 4 }}>
                  <CountUp key={`cap-${budget}`} end={cappedTotal} decimals={0} suffix=" млн" />
                </div>
                <div style={{ fontSize: 13, color: '#2A9D8F', marginTop: 4 }}>
                  {effectiveRate.toFixed(1)}% от budget
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpandedCap((e) => !e)}
              aria-expanded={expandedCap}
              style={{
                marginTop: 24, padding: '10px 20px',
                background: 'transparent', color: '#F4A261',
                border: '1px solid #F4A261', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 500
              }}
            >
              {expandedCap ? 'Свернуть ↑' : 'Что означает эффективная ставка ↓'}
            </button>

            {expandedCap && (
              <div style={{
                marginTop: 16, padding: 16,
                background: 'rgba(11,13,16,0.55)', borderRadius: 8,
                textAlign: 'left', fontSize: 13, color: '#EAEAEA', lineHeight: 1.6,
                animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
              }}>
                <strong style={{ color: '#F4A261' }}>Cap 85%</strong> = разумная верхняя граница с учётом того что программы частично пересекаются (Фонд кино + Минкультуры не складываются 1:1) и не все проекты получают все 4 одновременно. На бюджет {budget} млн это означает: холдинг получит ~{Math.round(cappedTotal)} млн безвозвратно, эффективный cost of capital = {budget - Math.round(cappedTotal)} млн ({(100 - effectiveRate).toFixed(1)}%).
                <br /><br />
                <strong style={{ color: '#2A9D8F' }}>Для вашего фонда:</strong> эта поддержка снижает чистый capital-risk портфеля и улучшает IRR на +5-7 пп относительно unsupported production.
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// M2 — PIPELINE BUILDER (rail drop-target + FLIP reset + posters)
// ========================================================================

function M2BuilderSection() {
  // state: columns (id -> array of project ids)
  const [cols, setCols] = useState(() => JSON.parse(JSON.stringify(M2_CANON)));
  const flip = useFlip();
  const cardRefs = useRef({}); // pid -> el
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const allStages = [{ id: 'rail', label: 'Portfolio rail' }, ...M2_STAGES];

  const recordAll = () => {
    for (const pid of Object.keys(cardRefs.current)) {
      flip.record(pid, cardRefs.current[pid]);
    }
  };

  const animateAll = () => {
    for (const pid of Object.keys(cardRefs.current)) {
      flip.animateTo(pid, cardRefs.current[pid]);
    }
  };

  const moveProject = (pid, targetCol) => {
    recordAll();
    setCols((prev) => {
      const next = {};
      for (const c of Object.keys(prev)) {
        next[c] = prev[c].filter((x) => x !== pid);
      }
      if (!next[targetCol]) next[targetCol] = [];
      next[targetCol].push(pid);
      return next;
    });
  };

  useEffect(() => {
    // After any move -> animate FLIP
    const raf = requestAnimationFrame(animateAll);
    return () => cancelAnimationFrame(raf);
  }, [cols]);

  const handleDragStart = (pid) => (e) => {
    setDragId(pid);
    try { e.dataTransfer.setData('text/plain', pid); } catch {}
    try { e.dataTransfer.effectAllowed = 'move'; } catch {}
  };

  const handleDragOver = (colId) => (e) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch {}
    if (overCol !== colId) setOverCol(colId);
  };

  const handleDragLeave = () => setOverCol(null);

  const handleDrop = (colId) => (e) => {
    e.preventDefault();
    let pid = dragId;
    try { const d = e.dataTransfer.getData('text/plain'); if (d) pid = d; } catch {}
    if (!pid) return;
    moveProject(pid, colId);
    setDragId(null);
    setOverCol(null);
  };

  const resetCanon = () => {
    recordAll();
    setCols(JSON.parse(JSON.stringify(M2_CANON)));
  };

  const projectById = (pid) => PIPELINE.find((p) => p.id === pid);
  // Static literals only — assemble_html.py placeholder replacement does not parse JS expressions.
  const posterSrc = (pid) => {
    switch (PIPELINE_POSTERS[pid]) {
      case 'img10': return '__IMG_PLACEHOLDER_img10__';
      case 'img11': return '__IMG_PLACEHOLDER_img11__';
      case 'img12': return '__IMG_PLACEHOLDER_img12__';
      case 'img13': return '__IMG_PLACEHOLDER_img13__';
      case 'img14': return '__IMG_PLACEHOLDER_img14__';
      case 'img15': return '__IMG_PLACEHOLDER_img15__';
      case 'img16': return '__IMG_PLACEHOLDER_img16__';
      default: return '';
    }
  };

  return (
    <section id="m2" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 44, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Pipeline Builder — соберите свой портфель
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 16 }}>
            Drag &amp; drop 7 проектов между стадиями — проверьте распределение рисков и сроков
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={resetCanon}
              style={{
                padding: '8px 18px', background: 'transparent', color: '#F4A261',
                border: '1px solid #F4A261', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                transition: 'background 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              ↺ Вернуть к исходному
            </button>
          </div>
        </Reveal>

        {/* Rail (drop-target) */}
        <Reveal delay={260}>
          <div
            onDragOver={handleDragOver('rail')}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop('rail')}
            style={{
              marginTop: 32, padding: 16, borderRadius: 12,
              background: overCol === 'rail' ? 'rgba(244,162,97,0.10)' : 'rgba(21,24,28,0.55)',
              border: overCol === 'rail' ? '2px dashed #F4A261' : '1px dashed #2A2D31',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
              minHeight: 96
            }}
          >
            <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Portfolio rail — перетащите сюда, чтобы вернуть проект в запас
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(cols.rail || []).map((pid) => {
                const p = projectById(pid);
                if (!p) return null;
                return (
                  <div
                    key={pid}
                    ref={(el) => { if (el) cardRefs.current[pid] = el; }}
                    draggable
                    onDragStart={handleDragStart(pid)}
                    className="glass"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: 6, borderRadius: 8,
                      border: '1px solid #2A2D31', background: '#15181C',
                      cursor: 'grab', fontSize: 12, color: '#EAEAEA',
                      opacity: dragId === pid ? 0.5 : 1,
                      transition: 'opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                    title={p.title}
                  >
                    <img
                      src={posterSrc(pid)}
                      alt={p.title}
                      loading="lazy"
                      style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                );
              })}
              {(!cols.rail || cols.rail.length === 0) && (
                <span style={{ fontSize: 12, color: '#8E8E93' }}>Rail пуст — все проекты распределены.</span>
              )}
            </div>
          </div>
        </Reveal>

        {/* Stage columns */}
        <Reveal delay={340}>
          <div style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14
          }}>
            {M2_STAGES.map((st) => {
              const items = cols[st.id] || [];
              return (
                <div
                  key={st.id}
                  onDragOver={handleDragOver(st.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(st.id)}
                  style={{
                    padding: 14, borderRadius: 12,
                    background: overCol === st.id ? 'rgba(42,157,143,0.10)' : 'rgba(15,18,22,0.7)',
                    border: overCol === st.id ? '2px dashed #2A9D8F' : '1px solid #2A2D31',
                    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    minHeight: 220
                  }}
                >
                  <div style={{
                    fontSize: 11, color: '#F4A261',
                    textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600,
                    marginBottom: 10
                  }}>
                    {st.label} · {items.length}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((pid) => {
                      const p = projectById(pid);
                      if (!p) return null;
                      return (
                        <div
                          key={pid}
                          ref={(el) => { if (el) cardRefs.current[pid] = el; }}
                          draggable
                          onDragStart={handleDragStart(pid)}
                          className="glass card-hover"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: 8, borderRadius: 8,
                            border: '1px solid #2A2D31', background: '#15181C',
                            cursor: 'grab', color: '#EAEAEA',
                            opacity: dragId === pid ? 0.5 : 1,
                            transition: 'opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                          }}
                          title={`${p.title} — ${p.budget} млн ₽, IRR ${p.irr}%`}
                        >
                          <img
                            src={posterSrc(pid)}
                            alt={p.title}
                            loading="lazy"
                            style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Playfair Display'", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 2 }}>
                              {p.budget} млн · IRR {p.irr}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div style={{ fontSize: 11, color: '#8E8E93', textAlign: 'center', padding: '20px 8px', border: '1px dashed rgba(42,45,49,0.6)', borderRadius: 6 }}>
                        Перетащите проект сюда
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// M3 — COMMITMENT CALCULATOR (Partner / Lead Investor / Anchor Partner)
// ========================================================================

function CommitmentCalculatorSection() {
  const [commitment, setCommitment] = useState(100); // млн ₽

  // Waterfall logic (same as v2.0 canon):
  //   tier1: 8% hurdle on commitment (annualized, base 3000 млн)
  //   tier2: GP catch-up (to reach 20% carry on excess)
  //   tier3: 80/20 split (LP 80 / GP 20) on next tranche
  //   tier4: super-carry 70/30 on top tranche
  // Illustrative allocation over 7y portfolio, assume fund gross-MOIC 2.2 at base
  const grossMOIC = 2.2;
  const fundEquity = 3000; // base
  const commitShare = commitment / fundEquity;

  const totalGross = commitment * grossMOIC;   // total distributions at gross
  const profit = totalGross - commitment;

  // 8% hurdle approx — 8% × 5y average = 40% preferred
  const preferred = commitment * 0.40; // LP preferred
  let remaining = profit - preferred;
  if (remaining < 0) remaining = 0;

  // catch-up 20% of (preferred + catchup) = catchup -> catchup = 0.25 * preferred
  const catchup = Math.min(remaining, preferred * 0.25);
  remaining -= catchup;

  // 80/20 split
  const splitLP = remaining * 0.80;
  const splitGP = remaining * 0.20;

  const lpTotal = commitment + preferred + splitLP; // тело + preferred + 80%
  const gpTotal = catchup + splitGP;
  const lpMultiple = lpTotal / commitment;

  const badge = commitment >= 200 ? 'Anchor Partner'
              : commitment >= 50  ? 'Lead Investor'
              : 'Partner';
  const badgeColor = badge === 'Anchor Partner' ? '#F4A261'
                    : badge === 'Lead Investor' ? '#2A9D8F'
                    : '#4A9EFF';

  const tiers = [
    { id: 't1', label: 'Tier 1 — Preferred (8% hurdle)', split: 'LP 100%', amount: preferred,     color: '#2A9D8F',
      tip: 'Сначала LP получает свой вклад + 8% годовых (≈40% при 5-летнем holding-периоде).' },
    { id: 't2', label: 'Tier 2 — GP catch-up',           split: 'GP 100%', amount: catchup,       color: '#F4A261',
      tip: 'GP добирает 20% carry от совокупной прибыли после preferred.' },
    { id: 't3', label: 'Tier 3 — Split 80/20',           split: 'LP 80 / GP 20', amount: splitLP + splitGP, color: '#4A9EFF',
      tip: 'Оставшаяся прибыль делится 80% LP / 20% GP — основной tier для доходности.' },
    { id: 't4', label: 'Tier 4 — Super-carry 70/30',     split: 'LP 70 / GP 30', amount: 0,       color: '#A855F7',
      tip: 'Super-carry активируется при IRR > 25% — в base-case не срабатывает.' }
  ];

  return (
    <section id="m3" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 44, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Сколько получит ваш фонд — посчитайте сами
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 16 }}>
            Waterfall: LP preferred 8% → catch-up → 80/20 → super-carry 70/30
          </p>
        </Reveal>

        {/* Slider */}
        <Reveal delay={200}>
          <div className="glass" style={{
            marginTop: 32, padding: 24, borderRadius: 14,
            border: `1px solid ${badgeColor}`,
            maxWidth: 680, marginLeft: 'auto', marginRight: 'auto',
            textAlign: 'center',
            boxShadow: `0 0 24px ${badgeColor}22`
          }}>
            <div style={{ fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>
              Commitment вашего фонда (10 – 500 млн ₽)
            </div>
            <div style={{ fontSize: 42, fontFamily: "'Playfair Display'", color: badgeColor, marginTop: 6 }}>
              {commitment} млн ₽
            </div>
            <div style={{
              display: 'inline-block', marginTop: 8,
              padding: '4px 14px', borderRadius: 999,
              background: `${badgeColor}22`, color: badgeColor,
              border: `1px solid ${badgeColor}`,
              fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1
            }}>
              {badge}
            </div>
            <input
              type="range"
              min={10} max={500} step={5}
              value={commitment}
              onChange={(e) => setCommitment(+e.target.value)}
              aria-label="Commitment вашего фонда"
              style={{ width: '100%', marginTop: 16, accentColor: badgeColor }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#8E8E93', marginTop: 4
            }}>
              <span>Partner ≥ 10</span>
              <span>Lead Investor ≥ 50</span>
              <span>Anchor Partner ≥ 200</span>
            </div>
          </div>
        </Reveal>

        {/* Summary */}
        <Reveal delay={320}>
          <div className="glass" style={{
            marginTop: 28, padding: 28, borderRadius: 14,
            border: '1px solid #2A2D31',
            background: 'linear-gradient(135deg, rgba(244,162,97,0.06), rgba(42,157,143,0.06))'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20, textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>LP gets total</div>
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: '#2A9D8F', marginTop: 4 }}>
                  <CountUp key={`lp-${commitment}`} end={lpTotal} decimals={0} suffix=" млн ₽" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>Multiple</div>
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`mx-${commitment}`} end={lpMultiple} decimals={2} suffix="x" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>GP carry total</div>
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: '#F4A261', marginTop: 4 }}>
                  <CountUp key={`gp-${commitment}`} end={gpTotal} decimals={0} suffix=" млн ₽" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>Ваша доля фонда</div>
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`sh-${commitment}`} end={commitShare * 100} decimals={1} suffix="%" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Mini-waterfall table */}
        <Reveal delay={420}>
          <div className="glass" style={{
            marginTop: 24, padding: 24, borderRadius: 14,
            border: '1px solid #2A2D31'
          }}>
            <div style={{ fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Waterfall — распределение cash по tiers
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="card-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 16, alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(21,24,28,0.55)',
                    borderLeft: `3px solid ${t.color}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: '#EAEAEA', fontWeight: 600 }}>
                      <Tooltip explanation={t.tip}>{t.label}</Tooltip>
                    </div>
                    <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>
                      {t.split}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: t.color, fontFamily: "'Playfair Display'" }}>
                    <CountUp key={`${t.id}-${commitment}`} end={t.amount} decimals={1} suffix=" млн" />
                  </div>
                  <div style={{
                    width: 80, height: 6, borderRadius: 3, background: 'rgba(42,45,49,0.6)', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, (t.amount / Math.max(1, profit)) * 100)}%`,
                      height: '100%', background: t.color,
                      transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// ROOT APP W4
// ========================================================================

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
        <MonteCarloSimulator />
        <PipelineSection />
        <M2BuilderSection />
        <CommitmentCalculatorSection />
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
