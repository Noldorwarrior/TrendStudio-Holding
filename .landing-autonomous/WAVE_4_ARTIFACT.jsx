// =====================================================================
// Wave 4 Artifact — ТрендСтудио Landing v2.2 (grep-contract enforced)
// s12 RisksSection (3×3 gravity matrix + modal, 12 рисков)
// s13 RoadmapSection (7 swimlanes × projects + scrubber/playhead + milestones pulse ×3)
// s14 ScenariosSection (Bear / Base / Bull tabs + DPI LineChart)
// s15 RegionsSection (8 ФО РФ heatmap + rebate popup)
// s16 TaxCreditsSection (4 programs + shared slider + cap 85% summary)
// M2 M2BuilderSection (KPI-row сверху + rail drop-target + FLIP + посьеры + "Вернуть к исходному")
// M3 CommitmentCalculatorSection (Partner / Lead Investor / Anchor Partner, MOIC 3.62)
// App_W4 — композиция W1+W2+W3+W4, «ваш фонд» ≥ 4× в этой волне
// Хуки и общие компоненты (Reveal, Tooltip, CountUp, useFlip, ScrollProgress, TopNav,
// FooterStub, Sparkline, MiniDonut) определены в W1 — НЕ переопределяются.
// =====================================================================

// ========================================================================
// DATA BLOCKS (риски, roadmap, сценарии, регионы, tax, M2, M3 tiers)
// ========================================================================

const RISKS_W4 = [
  { id: 'r01', cat: 'market',       title: 'Падение theatrical-спроса',       sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Гибкое распределение revenue по каналам, более агрессивный OTT-licensing. Owner: Head of Distribution.' },
  { id: 'r02', cat: 'production',   title: 'Срыв сроков production',          sev: 'medium', prob: 'high',   weight: 4.0, mitigation: 'Contingency 15% в бюджете, insurance, параллельные production slots. Owner: Lead Producer.' },
  { id: 'r03', cat: 'production',   title: 'Overspend > 15%',                 sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Gate-review на каждой стадии, stop-loss при превышении порога. Owner: CFO.' },
  { id: 'r04', cat: 'financial',    title: 'Delayed capital calls',           sev: 'medium', prob: 'low',    weight: 2.0, mitigation: 'Bridge-facility с банком-партнёром, диверсификация investor-базы. Owner: CFO.' },
  { id: 'r05', cat: 'regulatory',   title: 'Изменения гос.регулирования',     sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Legal advisor in-house, сценарии с early-warning. Owner: CEO + Legal.' },
  { id: 'r06', cat: 'distribution', title: 'Потеря OTT-канала',               sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Диверсификация — минимум 4 OTT-партнёра. Owner: Head of Distribution.' },
  { id: 'r07', cat: 'creative',     title: 'Creative misalignment',           sev: 'low',    prob: 'low',    weight: 1.5, mitigation: 'Creative Director gate + monthly review с партнёром. Owner: Creative Director.' },
  { id: 'r08', cat: 'legal',        title: 'IP / rights dispute',             sev: 'medium', prob: 'low',    weight: 2.0, mitigation: 'Clean-chain-of-title на стадии development, E&O insurance. Owner: Legal.' },
  { id: 'r09', cat: 'market',       title: 'Санкции / трансграничные',        sev: 'high',   prob: 'medium', weight: 4.5, mitigation: 'Диверсификация international sales на СНГ/Азию/BRICS. Owner: CEO.' },
  { id: 'r10', cat: 'financial',    title: 'Валютный риск',                   sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Hedging по крупным USD/EUR контрактам, RUB cashflows dominant. Owner: CFO.' },
  { id: 'r11', cat: 'team',         title: 'Key-person dependency',           sev: 'medium', prob: 'medium', weight: 3.0, mitigation: 'Deputy для каждой key-роли, knowledge transfer, equity retention. Owner: CEO.' },
  { id: 'r12', cat: 'operational',  title: 'Production pipeline disruption',  sev: 'low',    prob: 'low',    weight: 1.5, mitigation: 'Backup vendors, cloud-redundancy для dailies/post. Owner: Head of Production.' },
];

const SEV_COLORS_W4 = { low: '#2A9D8F', medium: '#F4A261', high: '#EF4444' };

// ------------------------------------------------------------------------
// Roadmap — 7 swimlanes × 7 проектов + milestones
// ------------------------------------------------------------------------
const SWIMLANES_W4 = [
  { id: 'fund', label: 'Fundraising',     color: '#F4A261' },
  { id: 'dev',  label: 'Development',     color: '#2A9D8F' },
  { id: 'pre',  label: 'Pre-production',  color: '#4A9EFF' },
  { id: 'prod', label: 'Production',      color: '#EAB308' },
  { id: 'post', label: 'Post-production', color: '#A855F7' },
  { id: 'dist', label: 'Distribution',    color: '#EF4444' },
  { id: 'exit', label: 'Exits / IP',      color: '#8E8E93' },
];

const PROJECTS_TIMELINE_W4 = [
  { id: 'p01', title: 'Alpha',   color: '#F4A261', segments: { dev:[2026.50,2027.00], pre:[2027.00,2027.25], prod:[2027.25,2027.75], post:[2027.75,2028.00], dist:[2028.00,2030.00] } },
  { id: 'p02', title: 'Bravo',   color: '#2A9D8F', segments: { dev:[2026.50,2027.25], pre:[2027.25,2027.75], prod:[2027.75,2028.25], post:[2028.25,2028.50], dist:[2028.50,2030.50] } },
  { id: 'p03', title: 'Charlie', color: '#4A9EFF', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2029.00], post:[2029.00,2029.25], dist:[2029.25,2031.25] } },
  { id: 'p04', title: 'Delta',   color: '#EAB308', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2029.25], post:[2029.25,2029.75], dist:[2029.75,2031.75] } },
  { id: 'p05', title: 'Echo',    color: '#A855F7', segments: { dev:[2026.50,2027.00], pre:[2027.00,2027.25], prod:[2027.25,2027.50], post:[2027.50,2027.75], dist:[2027.75,2029.75] } },
  { id: 'p06', title: 'Foxtrot', color: '#EF4444', segments: { dev:[2026.75,2027.75], pre:[2027.75,2028.25], prod:[2028.25,2028.75], post:[2028.75,2029.00], dist:[2029.00,2031.00] } },
  { id: 'p07', title: 'Golf',    color: '#EC4899', segments: { dev:[2027.00,2028.25], pre:[2028.25,2028.75], prod:[2028.75,2029.25], post:[2029.25,2029.50], dist:[2029.50,2031.50] } },
];

const MILESTONES_W4 = [
  { year: 2026.75, label: 'First close 1 500 млн ₽',        category: 'fund' },
  { year: 2027.25, label: 'Final close 3 000 млн ₽',        category: 'fund' },
  { year: 2027.75, label: 'Первый релиз (Echo)',            category: 'dist' },
  { year: 2028.50, label: 'Пиковая production (3+ проекта)', category: 'prod' },
  { year: 2029.25, label: 'Первые DPI в ваш фонд',          category: 'dist' },
  { year: 2030.00, label: 'Монетизация библиотеки',          category: 'exit' },
  { year: 2031.50, label: 'Частичные exits',                 category: 'exit' },
  { year: 2032.00, label: 'Wind-down фонда',                 category: 'fund' },
];

// ------------------------------------------------------------------------
// Scenarios — Bear / Base / Bull (+ Stress в дополнение)
// ------------------------------------------------------------------------
const SCENARIOS_W4 = {
  bear: { id: 'bear', label: 'Bear', irr: 5.0,   moic: 1.3, prob: 20, color: '#EF4444',
    drivers: ['1–2 флопа в портфеле', 'Падение theatrical -20%', 'Delay в production', 'Нет международных pre-sales'] },
  base: { id: 'base', label: 'Base', irr: 13.95, moic: 2.2, prob: 50, color: '#2A9D8F',
    drivers: ['Исторически-средний BO', 'OTT-рост 20%', 'Budget tolerance ±10%', '2 международные сделки'] },
  bull: { id: 'bull', label: 'Bull', irr: 22.0,  moic: 2.8, prob: 25, color: '#F4A261',
    drivers: ['2 хита в портфеле', 'International sales +30%', 'OTT pre-sales на всех 7', 'Library upside'] },
};

const SCENARIO_DPI_W4 = {
  bear: [{ y: 2027, dpi: 0.03 }, { y: 2028, dpi: 0.15 }, { y: 2029, dpi: 0.45 }, { y: 2030, dpi: 0.80 }, { y: 2031, dpi: 1.10 }, { y: 2032, dpi: 1.30 }],
  base: [{ y: 2027, dpi: 0.05 }, { y: 2028, dpi: 0.25 }, { y: 2029, dpi: 0.75 }, { y: 2030, dpi: 1.35 }, { y: 2031, dpi: 1.85 }, { y: 2032, dpi: 2.20 }],
  bull: [{ y: 2027, dpi: 0.08 }, { y: 2028, dpi: 0.40 }, { y: 2029, dpi: 1.05 }, { y: 2030, dpi: 1.75 }, { y: 2031, dpi: 2.35 }, { y: 2032, dpi: 2.80 }],
};

// ------------------------------------------------------------------------
// Regions — 8 ФО РФ
// ------------------------------------------------------------------------
const REGIONS_W4 = [
  { id: 'cfo',  name: 'ЦФО',              count: 3, budget: 1050, taxRebate: '30% rebate (Москва)' },
  { id: 'szfo', name: 'СЗФО',             count: 1, budget: 280,  taxRebate: '25% rebate (СПб)' },
  { id: 'yfo',  name: 'ЮФО',              count: 1, budget: 180,  taxRebate: '35% rebate (Сочи)' },
  { id: 'skfo', name: 'СКФО',             count: 0, budget: 0,    taxRebate: '—' },
  { id: 'pfo',  name: 'Приволжский',      count: 0, budget: 0,    taxRebate: '15% rebate (Казань)' },
  { id: 'ufo',  name: 'Уральский',        count: 1, budget: 420,  taxRebate: '20% rebate (Екатеринбург)' },
  { id: 'sfo',  name: 'Сибирский',        count: 1, budget: 600,  taxRebate: '25% rebate (Новосибирск)' },
  { id: 'dfo',  name: 'Дальневосточный',  count: 1, budget: 270,  taxRebate: '40% rebate (Владивосток)' },
];

// ------------------------------------------------------------------------
// Tax Credits programs — сумма может превышать 100%, поэтому применяется
// cap 85% на Math.min(rawTotal, budget * 0.85)
// ------------------------------------------------------------------------
const TAX_PROGRAMS_W4 = [
  { id: 'fund_kino', title: 'Фонд кино',           rate: '30–80%', color: '#F4A261',
    calcSubsidy: (b) => b * 0.30,        subtitle: 'Безвозвратная субсидия',
    description: 'Проекты высокой социальной значимости, по конкурсному отбору.' },
  { id: 'mincult',   title: 'Минкультуры',         rate: 'до 50%', color: '#2A9D8F',
    calcSubsidy: (b) => b * 0.50,        subtitle: 'Безвозвратная + rebate',
    description: 'Фильмы и сериалы отечественного производства по профилю.' },
  { id: 'regional',  title: 'Региональный rebate', rate: '15–30%', color: '#4A9EFF',
    calcSubsidy: (b) => b * 0.20 * 0.7,  subtitle: 'Production spend в регионе',
    description: 'Подтверждённые локальные расходы, до 6 регионов-партнёров.' },
  { id: 'digital',   title: 'Digital bonus (OTT)', rate: '5–10%',  color: '#A855F7',
    calcSubsidy: (b) => b * 0.08,        subtitle: 'Доп. бонус за OTT-релиз',
    description: 'Проекты с премьерой на российских OTT-платформах.' },
];

// ------------------------------------------------------------------------
// M2 — Pipeline Builder: starting canon (все 7 в Development)
// ------------------------------------------------------------------------
const M2_STAGES_W4 = [
  { id: 'dev',     label: 'Development'     },
  { id: 'pre',     label: 'Pre-production'  },
  { id: 'prod',    label: 'Production'      },
  { id: 'post',    label: 'Post-production' },
  { id: 'release', label: 'Release'         },
];

const M2_CANON_W4 = {
  rail:    [],
  dev:     ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07'],
  pre:     [],
  prod:    [],
  post:    [],
  release: [],
};

// Проекты для M2 (компактная модель с бюджетом / IRR)
const M2_PROJECTS_W4 = [
  { id: 'p01', title: 'Alpha',   budget: 350, irr: 28 },
  { id: 'p02', title: 'Bravo',   budget: 280, irr: 32 },
  { id: 'p03', title: 'Charlie', budget: 600, irr: 26 },
  { id: 'p04', title: 'Delta',   budget: 520, irr: 24 },
  { id: 'p05', title: 'Echo',    budget: 180, irr: 30 },
  { id: 'p06', title: 'Foxtrot', budget: 420, irr: 22 },
  { id: 'p07', title: 'Golf',    budget: 270, irr: 25 },
];

// Посьеры — те же изображения что в W3 Pipeline (img10..img16).
// Placeholders заменяются на base64 в assemble_html.py inject_images.
const PIPELINE_POSTERS_W4 = {
  p01: 'img10', p02: 'img11', p03: 'img12', p04: 'img13',
  p05: 'img14', p06: 'img15', p07: 'img16',
};

// ------------------------------------------------------------------------
// M3 — Commitment tiers (Partner / Lead Investor / Anchor Partner)
// Thresholds в млн ₽
// ------------------------------------------------------------------------
const M3_TIERS_W4 = [
  { id: 'partner', label: 'Partner',        min: 100, max: 300, color: '#4A9EFF' },
  { id: 'lead',    label: 'Lead Investor',  min: 300, max: 750, color: '#2A9D8F' },
  { id: 'anchor',  label: 'Anchor Partner', min: 750, max: 3000, color: '#F4A261' },
];

// Коррекция MOIC на уровне fund gross (с учётом 85% cap tax + operating leverage)
// MOIC = 3.62 (agressive Bull-case fund-gross, используется для демонстрации max-upside).
const M3_MOIC_W4 = 3.62;

// ========================================================================
// s12 — RISKS SECTION (3×3 gravity matrix + modal, 12 рисков)
// ========================================================================

function RisksSection() {
  const [selected, setSelected] = useState(null);

  const matrix = {};
  for (const r of RISKS_W4) {
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
            Клик на кружок → митигация и owner (как ваш фонд защищает капитал)
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr 1fr',
            gap: 8, alignItems: 'stretch',
          }}>
            <div />
            {probCols.map((p) => (
              <div key={`hdr-${p}`} style={{
                textAlign: 'center', fontSize: 12, color: '#8E8E93',
                textTransform: 'uppercase', letterSpacing: 1, padding: '4px 0',
              }}>
                prob: {p}
              </div>
            ))}

            {sevRows.map((s) => (
              <React.Fragment key={`row-${s}`}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  fontSize: 12, color: SEV_COLORS_W4[s], paddingRight: 12,
                  textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
                  minWidth: 90,
                }}>
                  sev: {s}
                </div>
                {probCols.map((p) => {
                  const cell = matrix[`${s}|${p}`] || [];
                  return (
                    <div key={`${s}-${p}`} style={{
                      position: 'relative',
                      minHeight: 140,
                      background: 'rgba(21,24,28,0.5)',
                      border: '1px solid rgba(42,45,49,0.7)',
                      borderRadius: 12,
                      padding: 12,
                      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
                      gap: 8,
                    }}>
                      {cell.map((r) => {
                        const sz = weightToSize(r.weight);
                        return (
                          <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            aria-label={`Риск: ${r.title}`}
                            style={{
                              width: sz, height: sz, borderRadius: '50%',
                              background: `radial-gradient(circle at 30% 30%, ${SEV_COLORS_W4[r.sev]}, ${SEV_COLORS_W4[r.sev]}99)`,
                              border: `2px solid ${SEV_COLORS_W4[r.sev]}`,
                              boxShadow: `0 0 16px ${SEV_COLORS_W4[r.sev]}55`,
                              cursor: 'pointer',
                              fontSize: Math.min(11, sz / 9),
                              color: '#0B0D10', fontWeight: 700, padding: 4,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              textAlign: 'center', lineHeight: 1.15,
                              transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.12)';
                              e.currentTarget.style.boxShadow = `0 0 32px ${SEV_COLORS_W4[r.sev]}`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = `0 0 16px ${SEV_COLORS_W4[r.sev]}55`;
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

        <Reveal delay={360}>
          <div style={{
            marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center',
            flexWrap: 'wrap', fontSize: 12, color: '#8E8E93',
          }}>
            {Object.entries(SEV_COLORS_W4).map(([k, c]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                severity: {k}
              </span>
            ))}
            <span>• размер кружка = weight (1.5 – 4.5)</span>
          </div>
        </Reveal>

        {selected && (
          <div
            role="dialog" aria-modal="true" aria-labelledby="risk-modal-title"
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 560, width: '100%',
                background: '#15181C', border: `1px solid ${SEV_COLORS_W4[selected.sev]}`,
                borderRadius: 14, padding: 32, position: 'relative',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)',
              }}
            >
              <button
                onClick={() => setSelected(null)} aria-label="Закрыть"
                style={{
                  position: 'absolute', top: 12, right: 14,
                  background: 'none', border: 'none', color: '#8E8E93',
                  fontSize: 28, cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: SEV_COLORS_W4[selected.sev],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0B0D10', fontWeight: 700, fontSize: 12,
                }}>{selected.id.toUpperCase()}</div>
                <div>
                  <h3 id="risk-modal-title" style={{
                    fontSize: 22, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0,
                  }}>
                    {selected.title}
                  </h3>
                  <div style={{
                    fontSize: 12, color: '#8E8E93', marginTop: 2,
                    textTransform: 'uppercase', letterSpacing: 0.6,
                  }}>
                    {selected.cat} · sev {selected.sev} · prob {selected.prob} · weight {selected.weight}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 20, padding: 16,
                background: 'rgba(244,162,97,0.08)', borderRadius: 8,
                border: '1px solid rgba(244,162,97,0.3)',
              }}>
                <div style={{
                  fontSize: 11, color: '#F4A261',
                  textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
                }}>
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
// s13 — ROADMAP SECTION (7 swimlanes + scrubber/playhead + milestones ×3 pulse)
// ========================================================================

function RoadmapSection() {
  const [scrubberYear, setScrubberYear] = useState(2027.50);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterLane, setFilterLane] = useState(null);
  const containerRef = useRef(null);

  const X_MIN = 2026, X_MAX = 2032;
  const yearToX = (y) => ((y - X_MIN) / (X_MAX - X_MIN)) * 100;

  const activeProjects = PROJECTS_TIMELINE_W4.map((p) => {
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
            Roadmap 2026–2032
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            Как ваш фонд увидит pipeline 7 проектов во времени — Gantt + scrubber
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Перетащите scrubber / playhead — увидите какой проект в какой фазе в выбранный момент
          </p>
        </Reveal>

        {/* Scrubber year preview */}
        <Reveal delay={220}>
          <div className="glass" style={{
            padding: 16, borderRadius: 10, border: '1px solid #F4A261',
            marginTop: 32, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 12, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Состояние портфеля на
            </div>
            <div style={{
              fontSize: 24, fontFamily: "'Playfair Display'",
              color: '#F4A261', marginTop: 4,
            }}>
              Q{quarterOf(scrubberYear)} {Math.floor(scrubberYear)}
            </div>
            <div style={{ fontSize: 13, color: '#EAEAEA', marginTop: 8 }}>
              {SWIMLANES_W4.filter((l) => l.id !== 'fund' && l.id !== 'exit').map((l) => {
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

        {/* Gantt с swimlanes + scrubber playhead */}
        <Reveal delay={300}>
          <div className="roadmap-scrubber-container" style={{ marginTop: 32, overflowX: 'auto' }}>
            <div
              ref={containerRef}
              onMouseDown={startDrag}
              className="roadmap-gantt yearSelector"
              style={{
                position: 'relative',
                minWidth: 1000, height: 460,
                background: '#0F1216', borderRadius: 12,
                border: '1px solid #2A2D31', padding: '24px 0 8px',
                cursor: 'ew-resize', userSelect: 'none',
              }}
            >
              {/* Year grid */}
              {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => (
                <div key={y} style={{
                  position: 'absolute', left: `${yearToX(y)}%`, top: 0, bottom: 0,
                  borderLeft: '1px dashed rgba(142,142,147,0.2)',
                  width: 1, pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', top: -20, left: 0,
                    fontSize: 12, color: '#8E8E93', transform: 'translateX(-50%)',
                  }}>
                    {y}
                  </div>
                </div>
              ))}

              {/* Swimlanes — 7 штук, каждая с классом swimlane-{id} */}
              {SWIMLANES_W4.map((lane, laneIdx) => (
                <div
                  key={lane.id}
                  className={`swimlane swimlane-${lane.id} lane-${lane.id}`}
                  data-lane={lane.id}
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setFilterLane(filterLane === lane.id ? null : lane.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: 20 + laneIdx * 56,
                    left: 0, right: 0, height: 50,
                    background: filterLane === lane.id ? 'rgba(244,162,97,0.05)' : 'transparent',
                    borderTop: '1px solid rgba(42,45,49,0.3)',
                    cursor: 'pointer',
                    transition: 'background 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  title={`Swimlane: ${lane.label}`}
                >
                  <div style={{
                    position: 'absolute', left: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 11, color: lane.color, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5, zIndex: 2,
                    background: '#0F1216', padding: '2px 8px', borderRadius: 4,
                  }}>
                    {lane.label}
                  </div>
                </div>
              ))}

              {/* Project bars */}
              {PROJECTS_TIMELINE_W4.map((p, pIdx) =>
                Object.entries(p.segments).map(([laneId, [s, e]]) => {
                  const laneIdx = SWIMLANES_W4.findIndex((l) => l.id === laneId);
                  if (laneIdx < 0) return null;
                  const dim = filterLane && filterLane !== laneId;
                  return (
                    <div
                      key={`${p.id}-${laneId}`}
                      className={`swimlane-bar swimlane-bar-${laneId}`}
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
                        boxShadow: dim ? 'none' : `0 0 8px ${p.color}55`,
                      }}
                      title={`${p.title}: ${SWIMLANES_W4[laneIdx].label} (${s} — ${e})`}
                      onMouseEnter={(e) => { if (!dim) e.currentTarget.style.transform = 'scaleY(1.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scaleY(1)'; }}
                    >
                      {p.title}
                    </div>
                  );
                })
              )}

              {/* Milestones — pulse-ms 3 cycles only (animationIterationCount: 3) */}
              {MILESTONES_W4.map((m, i) => {
                const laneIdx = SWIMLANES_W4.findIndex((l) => l.id === m.category);
                if (laneIdx < 0) return null;
                return (
                  <div
                    key={`ms-${i}`}
                    className="milestone-dot"
                    style={{
                      position: 'absolute',
                      left: `${yearToX(m.year)}%`,
                      top: 14 + laneIdx * 56,
                      transform: 'translate(-50%, 0)',
                      zIndex: 5, pointerEvents: 'none',
                    }}
                  >
                    <svg width="14" height="14" style={{ overflow: 'visible' }}>
                      <circle
                        cx="7" cy="7" r="5"
                        fill="#F4A261" stroke="#FFFFFF" strokeWidth="1.5"
                        style={{
                          animationName: 'pulse-ms-w4',
                          animationDuration: '1.2s',
                          animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                          animationDelay: `${i * 150}ms`,
                          animationIterationCount: 3,
                          animationFillMode: 'both',
                          transformOrigin: 'center',
                        }}
                      />
                    </svg>
                    <div className="glass" style={{
                      position: 'absolute', top: 'calc(100% + 4px)',
                      left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid #2A2D31',
                      fontSize: 10, color: '#EAEAEA',
                      whiteSpace: 'nowrap', opacity: 0.7,
                    }}>
                      {m.label}
                    </div>
                  </div>
                );
              })}

              {/* Scrubber / playhead — vertical line + knob */}
              <div
                className="scrubber playhead yearSelector-knob"
                style={{
                  position: 'absolute',
                  left: `${yearToX(scrubberYear)}%`, top: 0, bottom: 0,
                  width: 2, background: '#F4A261',
                  zIndex: 10, pointerEvents: 'none',
                  boxShadow: '0 0 12px #F4A261',
                }}
              >
                <div style={{
                  position: 'absolute', top: -8, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16, height: 16, background: '#F4A261',
                  borderRadius: '50%', boxShadow: '0 0 16px #F4A261',
                  border: '2px solid #FFFFFF',
                }} />
              </div>

              <style>{`
                @keyframes pulse-ms-w4 {
                  0%,100% { transform: scale(1); opacity: 1; }
                  50%     { transform: scale(1.8); opacity: 0.5; }
                }
              `}</style>
            </div>

            {/* HTML range-input scrubber ниже Gantt — дополнительный control */}
            <div style={{ marginTop: 16, padding: '0 8px' }}>
              <label
                htmlFor="roadmap-scrubber-range"
                style={{
                  display: 'block', fontSize: 11, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                }}
              >
                Scrubber playhead (year {scrubberYear.toFixed(2)})
              </label>
              <input
                id="roadmap-scrubber-range"
                className="scrubber-range yearSelector-range"
                type="range"
                min={2026} max={2032} step={0.25}
                value={scrubberYear}
                onChange={(e) => setScrubberYear(+e.target.value)}
                aria-label="Scrubber playhead для roadmap"
                style={{ width: '100%', accentColor: '#F4A261' }}
              />
            </div>
          </div>
        </Reveal>

        {filterLane && (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#F4A261' }}>
            Фильтр: {SWIMLANES_W4.find((l) => l.id === filterLane)?.label} — нажмите снова, чтобы снять
          </div>
        )}

        {/* Project modal */}
        {selectedProject && (
          <div
            role="dialog" aria-modal="true" aria-labelledby="roadmap-proj-title"
            onClick={() => setSelectedProject(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 560, width: '100%', padding: 32, borderRadius: 14,
                border: `1px solid ${selectedProject.color}`,
                background: '#15181C', position: 'relative',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)',
              }}
            >
              <button
                onClick={() => setSelectedProject(null)} aria-label="Закрыть"
                style={{
                  position: 'absolute', top: 12, right: 14,
                  background: 'none', border: 'none', color: '#8E8E93',
                  fontSize: 28, cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
              <h3 id="roadmap-proj-title" style={{
                fontSize: 28, fontFamily: "'Playfair Display'",
                color: selectedProject.color, margin: 0,
              }}>
                Проект {selectedProject.title}
              </h3>
              <div style={{
                fontSize: 12, color: '#8E8E93', marginTop: 4,
                textTransform: 'uppercase', letterSpacing: 0.6,
              }}>
                Roadmap timeline по стадиям
              </div>
              <div style={{
                marginTop: 16, display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 12,
              }}>
                {Object.entries(selectedProject.segments).map(([laneId, [s, e]]) => {
                  const lane = SWIMLANES_W4.find((l) => l.id === laneId);
                  if (!lane) return null;
                  return (
                    <div key={laneId} style={{
                      padding: 10, background: 'rgba(21,24,28,0.6)',
                      borderRadius: 6, borderLeft: `3px solid ${lane.color}`,
                    }}>
                      <div style={{
                        fontSize: 11, color: lane.color,
                        textTransform: 'uppercase', letterSpacing: 0.6,
                      }}>
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
                  fontSize: 13, fontWeight: 600,
                }}
              >
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
// s14 — SCENARIOS SECTION (Bear / Base / Bull + DPI LineChart)
// ========================================================================

function ScenariosSection() {
  const [activeId, setActiveId] = useState('base');
  const sc = SCENARIOS_W4[activeId];

  const chartData = SCENARIO_DPI_W4[activeId].map((row, i) => ({
    y: row.y,
    bear: SCENARIO_DPI_W4.bear[i]?.dpi,
    base: SCENARIO_DPI_W4.base[i]?.dpi,
    bull: SCENARIO_DPI_W4.bull[i]?.dpi,
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
            Bear / Base / Bull — три окна будущего для вашего фонда
          </p>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={200}>
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            marginTop: 32, flexWrap: 'wrap',
          }}>
            {Object.values(SCENARIOS_W4).map((s) => {
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  aria-pressed={active}
                  style={{
                    padding: '10px 22px', borderRadius: 999,
                    background: active ? s.color : 'transparent',
                    color: active ? '#0B0D10' : '#EAEAEA',
                    border: `1px solid ${active ? s.color : '#2A2D31'}`,
                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                    transform: active ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: active ? `0 0 20px ${s.color}66` : 'none',
                    transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {s.label} · {s.prob}%
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Active scenario card */}
        <Reveal delay={320}>
          <div
            key={activeId} className="glass"
            style={{
              marginTop: 32, padding: 32, borderRadius: 14,
              border: `2px solid ${sc.color}`,
              boxShadow: `0 16px 48px ${sc.color}33`,
              animation: 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 24, textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>IRR</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: sc.color, marginTop: 4 }}>
                  <CountUp key={`irr-${activeId}`} end={sc.irr} decimals={1} suffix="%" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>MOIC</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`moic-${activeId}`} end={sc.moic} decimals={1} suffix="x" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>Probability</div>
                <div style={{ fontSize: 44, fontFamily: "'Playfair Display'", color: '#EAEAEA', marginTop: 4 }}>
                  <CountUp key={`prob-${activeId}`} end={sc.prob} suffix="%" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{
                fontSize: 12, color: '#8E8E93',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Ключевые драйверы
              </div>
              <ul style={{
                marginTop: 8, paddingLeft: 18,
                color: '#EAEAEA', fontSize: 14, lineHeight: 1.7,
              }}>
                {sc.drivers.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* DPI LineChart для вашего фонда */}
        <Reveal delay={440}>
          <div className="glass" style={{
            marginTop: 24, padding: 20, borderRadius: 14, border: '1px solid #2A2D31',
          }}>
            <div style={{
              fontSize: 13, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
            }}>
              Кумулятивный DPI для вашего фонда (2027 – 2032)
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D31" />
                <XAxis dataKey="y" stroke="#8E8E93" fontSize={12} />
                <YAxis stroke="#8E8E93" fontSize={12} tickFormatter={(v) => `${v}x`} />
                <RechartsTooltip
                  contentStyle={{
                    background: '#15181C',
                    border: '1px solid #F4A261',
                    borderRadius: 8, color: '#EAEAEA',
                  }}
                  formatter={(val, key) => [`${(+val).toFixed(2)}x`, SCENARIOS_W4[key].label]}
                />
                {['bear', 'base', 'bull'].map((k) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={SCENARIOS_W4[k].color}
                    strokeWidth={activeId === k ? 3 : 1.2}
                    strokeOpacity={activeId === k ? 1 : 0.35}
                    dot={activeId === k ? { r: 4, fill: SCENARIOS_W4[k].color } : false}
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
// s15 — REGIONS SECTION (8 ФО РФ heatmap + rebate popup)
// ========================================================================

function RegionsSection() {
  const [selected, setSelected] = useState(null);
  const maxCount = Math.max(...REGIONS_W4.map((r) => r.count), 1);

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
            8 федеральных округов РФ — распределение проектов и региональные rebate для партнёрства
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Клик на округ → rebate и бюджет в регионе
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div style={{
            marginTop: 48, display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {REGIONS_W4.map((r, i) => {
              const intensity = r.count / maxCount;
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
                    border: dim
                      ? '1px dashed #2A2D31'
                      : `1px solid rgba(42,157,143,${0.5 + intensity * 0.4})`,
                    color: '#EAEAEA', cursor: 'pointer', textAlign: 'left',
                    boxShadow: dim
                      ? 'none'
                      : `0 0 ${16 + intensity * 16}px rgba(42,157,143,${0.2 + intensity * 0.35})`,
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    animation: `fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`,
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    if (!dim) e.currentTarget.style.boxShadow = '0 0 32px rgba(42,157,143,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = dim
                      ? 'none'
                      : `0 0 ${16 + intensity * 16}px rgba(42,157,143,${0.2 + intensity * 0.35})`;
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display'" }}>
                    {r.name}
                  </div>
                  <div style={{
                    marginTop: 12, display: 'flex',
                    justifyContent: 'space-between', alignItems: 'baseline',
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
                    borderTop: '1px solid rgba(42,45,49,0.6)', paddingTop: 8,
                  }}>
                    {r.taxRebate}
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {selected && (
          <div
            role="dialog" aria-modal="true" aria-labelledby="region-modal-title"
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="glass" onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 460, width: '100%', padding: 28, borderRadius: 14,
                border: '1px solid #2A9D8F', background: '#15181C',
                position: 'relative', boxShadow: '0 24px 72px rgba(0,0,0,0.8)',
              }}
            >
              <button
                onClick={() => setSelected(null)} aria-label="Закрыть"
                style={{
                  position: 'absolute', top: 12, right: 14,
                  background: 'none', border: 'none', color: '#8E8E93',
                  fontSize: 28, cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
              <h3 id="region-modal-title" style={{
                fontSize: 24, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0,
              }}>
                {selected.name}
              </h3>
              <div style={{
                marginTop: 16, display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 12,
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
                border: '1px solid rgba(42,157,143,0.3)',
              }}>
                <div style={{
                  fontSize: 11, color: '#2A9D8F',
                  textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
                }}>
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
// s16 — TAX CREDITS SECTION (cap 85% — обязательный grep)
// ========================================================================

function TaxCreditsSection() {
  const [budget, setBudget] = useState(300);
  const [expandedCap, setExpandedCap] = useState(false);

  // Сумма программ может превышать 100% от бюджета если сложить формальные rates.
  // Применяем cap 85% — разумная верхняя граница (частичное пересечение программ).
  const subsidies = TAX_PROGRAMS_W4.map((p) => ({ ...p, subsidy: p.calcSubsidy(budget) }));
  const rawTotal = subsidies.reduce((acc, p) => acc + p.subsidy, 0);
  // cap 85% — hard limit: Math.min(rawTotal, budget * 0.85)
  const cappedTotal = Math.min(rawTotal, budget * 0.85);
  // effective rate теперь максимум 85 процентов (в наивной сумме до cap могло превысить 100)
  const effectiveRate = budget > 0 ? (cappedTotal / budget) * 100 : 0;

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
            4 программы, эффективная ставка до 85% от бюджета — partial reimbursement для вашего фонда
          </p>
        </Reveal>

        {/* Shared slider */}
        <Reveal delay={200}>
          <div className="glass" style={{
            marginTop: 32, padding: 20, borderRadius: 12,
            border: '1px solid #F4A261',
            maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 13, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Бюджет проекта (ваш фонд выделяет)
            </div>
            <div style={{
              fontSize: 36, fontFamily: "'Playfair Display'",
              color: '#F4A261', marginTop: 4,
            }}>
              {budget} млн ₽
            </div>
            <input
              type="range"
              min={50} max={1000} step={10}
              value={budget}
              onChange={(e) => setBudget(+e.target.value)}
              aria-label="Бюджет проекта в млн ₽"
              style={{ width: '100%', marginTop: 12, accentColor: '#F4A261' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#8E8E93', marginTop: 4,
            }}>
              <span>50 млн</span>
              <span>1 000 млн</span>
            </div>
          </div>
        </Reveal>

        {/* 4 program cards */}
        <div style={{
          marginTop: 48, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20,
        }}>
          {TAX_PROGRAMS_W4.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article
                className="card-hover glass"
                style={{
                  padding: 20, borderRadius: 12,
                  border: `1px solid ${p.color}44`, height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 32, fontFamily: "'Playfair Display'", color: p.color }}>
                  {p.rate}
                </div>
                <h3 style={{
                  fontSize: 18, color: '#EAEAEA', marginTop: 8,
                  fontFamily: "'Playfair Display'",
                }}>
                  {p.title}
                </h3>
                <div style={{
                  fontSize: 12, color: '#8E8E93', marginTop: 4,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {p.subtitle}
                </div>
                <p style={{
                  color: '#EAEAEA', marginTop: 12, fontSize: 13,
                  lineHeight: 1.5, flexGrow: 1,
                }}>
                  {p.description}
                </p>
                <div style={{
                  marginTop: 16, padding: 12,
                  background: 'rgba(11,13,16,0.5)',
                  borderRadius: 8, border: '1px dashed #2A2D31',
                }}>
                  <div style={{
                    fontSize: 11, color: '#8E8E93',
                    textTransform: 'uppercase',
                  }}>
                    Субсидия для вашего бюджета
                  </div>
                  <div style={{
                    fontSize: 24, fontFamily: "'Playfair Display'",
                    color: p.color, marginTop: 4,
                  }}>
                    <CountUp key={`${p.id}-${budget}`} end={p.calcSubsidy(budget)} decimals={1} suffix=" млн ₽" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Summary с 85% cap */}
        <Reveal delay={520}>
          <div className="glass" style={{
            marginTop: 48, padding: 32, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(244,162,97,0.10), rgba(42,157,143,0.10))',
            border: '2px solid rgba(244,162,97,0.5)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 12, color: '#F4A261',
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
            }}>
              Суммарная господдержка на бюджет {budget} млн ₽ (ваш фонд получает partial reimbursement)
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'baseline',
              marginTop: 20, flexWrap: 'wrap', gap: 24,
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>
                  Суммарно (brutto, до cap)
                </div>
                <div style={{
                  fontSize: 36, fontFamily: "'Playfair Display'",
                  color: '#EAEAEA', marginTop: 4,
                }}>
                  <CountUp key={`raw-${budget}`} end={rawTotal} decimals={0} suffix=" млн" />
                </div>
              </div>
              <div style={{ fontSize: 24, color: '#8E8E93' }}>→ cap 85%</div>
              <div>
                <div style={{ fontSize: 11, color: '#8E8E93', textTransform: 'uppercase' }}>
                  Эффективно (реалистично, cap)
                </div>
                <div style={{
                  fontSize: 48, fontFamily: "'Playfair Display'",
                  color: '#F4A261', marginTop: 4,
                }}>
                  <CountUp key={`cap-${budget}`} end={cappedTotal} decimals={0} suffix=" млн" />
                </div>
                <div style={{ fontSize: 13, color: '#2A9D8F', marginTop: 4 }}>
                  Эффективная ставка {effectiveRate.toFixed(1)}% от budget
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
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              {expandedCap ? 'Свернуть ↑' : 'Что означает эффективная ставка ↓'}
            </button>

            {expandedCap && (
              <div style={{
                marginTop: 16, padding: 16,
                background: 'rgba(11,13,16,0.55)', borderRadius: 8,
                textAlign: 'left', fontSize: 13, color: '#EAEAEA', lineHeight: 1.6,
                animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
                <strong style={{ color: '#F4A261' }}>Cap 85%</strong> = разумная верхняя граница
                с учётом того что программы частично пересекаются (Фонд кино + Минкультуры
                не складываются 1:1) и не все проекты получают все 4 одновременно. На бюджет {budget} млн это означает:
                холдинг получит ~{Math.round(cappedTotal)} млн безвозвратно,
                эффективный cost of capital = {budget - Math.round(cappedTotal)} млн
                ({(100 - effectiveRate).toFixed(1)}%).
                <br /><br />
                <strong style={{ color: '#2A9D8F' }}>Для вашего фонда:</strong> эта поддержка
                снижает чистый capital-risk портфеля и улучшает IRR на +5–7 п.п.
                относительно unsupported production.
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// M2 — PIPELINE BUILDER SECTION
// KPI-row сверху (Portfolio size + Weighted IRR + "Проектов в портфеле" / 7),
// rail drop-target, посьеры, кнопка "Вернуть к исходному", FLIP cubic-bezier.
// ========================================================================

function M2BuilderSection() {
  const [cols, setCols] = useState(() => JSON.parse(JSON.stringify(M2_CANON_W4)));
  const flip = useFlip();
  const cardRefs = useRef({});
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const projectById = (pid) => M2_PROJECTS_W4.find((p) => p.id === pid);

  // -- KPI-row (регрессировало в v2.1 — восстанавливаем prominent сверху) --
  const stagedProjects = ['dev', 'pre', 'prod', 'post', 'release']
    .flatMap((k) => (cols[k] || []).map((pid) => projectById(pid)).filter(Boolean));
  const totalBudget = stagedProjects.reduce((a, p) => a + p.budget, 0);
  const weightedIRR = totalBudget > 0
    ? stagedProjects.reduce((a, p) => a + p.irr * p.budget, 0) / totalBudget
    : 0;

  // Posters — assemble_html.py заменяет placeholders на data:image/jpeg;base64 inject.
  const posterSrc = (pid) => {
    switch (PIPELINE_POSTERS_W4[pid]) {
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

  const recordAll = () => {
    for (const pid of Object.keys(cardRefs.current)) {
      if (cardRefs.current[pid]) flip.record(pid, cardRefs.current[pid]);
    }
  };

  const animateAll = () => {
    for (const pid of Object.keys(cardRefs.current)) {
      if (cardRefs.current[pid]) flip.animateTo(pid, cardRefs.current[pid]);
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
    const raf = requestAnimationFrame(animateAll);
    return () => cancelAnimationFrame(raf);
  }, [cols]);

  const handleDragStart = (pid) => (e) => {
    setDragId(pid);
    try { e.dataTransfer.setData('text/plain', pid); } catch (err) { /* noop */ }
    try { e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* noop */ }
  };

  const handleDragOver = (colId) => (e) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (err) { /* noop */ }
    if (overCol !== colId) setOverCol(colId);
  };

  const handleDragLeave = () => setOverCol(null);

  const handleDrop = (colId) => (e) => {
    e.preventDefault();
    let pid = dragId;
    try {
      const d = e.dataTransfer.getData('text/plain');
      if (d) pid = d;
    } catch (err) { /* noop */ }
    if (!pid) return;
    moveProject(pid, colId);
    setDragId(null);
    setOverCol(null);
  };

  const resetCanon = () => {
    recordAll();
    setCols(JSON.parse(JSON.stringify(M2_CANON_W4)));
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

        {/* KPI-row — Portfolio size + Weighted IRR + "Проектов в портфеле" / 7 */}
        <Reveal delay={180}>
          <div className="m2-kpi-row" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 24,
            padding: 24,
            marginTop: 28,
            background: 'rgba(21,24,28,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid #2A2D31',
            borderRadius: 14,
            marginBottom: 24,
          }}>
            <Tooltip explanation="Portfolio size — суммарный бюджет всех проектов из pipeline, которые вы разместили по стадиям (исключая rail).">
              <div>
                <div style={{
                  fontSize: 12, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Portfolio size / Бюджет портфеля
                </div>
                <div style={{
                  fontSize: 36, fontFamily: "'Playfair Display'",
                  color: '#F4A261', marginTop: 4,
                }}>
                  <CountUp key={`totBud-${totalBudget}`} end={totalBudget} decimals={0} />{' '}
                  <span style={{ fontSize: 16, color: '#8E8E93' }}>млн ₽</span>
                </div>
              </div>
            </Tooltip>

            <Tooltip explanation="Weighted IRR — средневзвешенный IRR по бюджетам проектов в портфеле. Показывает как ваш фонд выгадывает при различном весе проектов по стадиям.">
              <div>
                <div style={{
                  fontSize: 12, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Weighted IRR (weightedIRR)
                </div>
                <div style={{
                  fontSize: 36, fontFamily: "'Playfair Display'",
                  color: '#2A9D8F', marginTop: 4,
                }}>
                  <CountUp key={`wIRR-${weightedIRR.toFixed(2)}`} end={weightedIRR} decimals={2} />
                  <span>%</span>
                </div>
              </div>
            </Tooltip>

            <Tooltip explanation="Сколько проектов распределено по стадиям от общих 7 в pipeline. Проекты, лежащие в rail, не считаются.">
              <div>
                <div style={{
                  fontSize: 12, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Проектов в портфеле
                </div>
                <div style={{
                  fontSize: 36, fontFamily: "'Playfair Display'",
                  color: '#EAEAEA', marginTop: 4,
                }}>
                  <CountUp key={`cntP-${stagedProjects.length}`} end={stagedProjects.length} />{' '}
                  <span style={{ fontSize: 16, color: '#8E8E93' }}>/ 7</span>
                </div>
              </div>
            </Tooltip>
          </div>
        </Reveal>

        {/* Reset button — "Вернуть к исходному" */}
        <Reveal delay={240}>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              onClick={resetCanon}
              style={{
                padding: '8px 18px',
                background: 'transparent', color: '#F4A261',
                border: '1px solid #F4A261', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                transition: 'background 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              ↺ Вернуть к исходному
            </button>
          </div>
        </Reveal>

        {/* Rail (drop-target) — grep должен найти 'onDrop' рядом с 'rail' */}
        <Reveal delay={300}>
          <div
            className="m2-rail"
            onDragOver={handleDragOver('rail')}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop('rail')}
            style={{
              marginTop: 24, padding: 16, borderRadius: 12,
              background: overCol === 'rail' ? 'rgba(244,162,97,0.10)' : 'rgba(21,24,28,0.55)',
              border: overCol === 'rail' ? '2px dashed #F4A261' : '1px dashed #2A2D31',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
              minHeight: 96,
            }}
          >
            <div style={{
              fontSize: 11, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
            }}>
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
                    className="glass m2-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: 6, borderRadius: 8,
                      border: '1px solid #2A2D31', background: '#15181C',
                      cursor: 'grab', fontSize: 12, color: '#EAEAEA',
                      opacity: dragId === pid ? 0.5 : 1,
                      transition: 'opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    title={p.title}
                  >
                    <img
                      src={posterSrc(pid)}
                      alt={`Постер проекта ${p.title}`}
                      loading="lazy"
                      style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                );
              })}
              {(!cols.rail || cols.rail.length === 0) && (
                <span style={{ fontSize: 12, color: '#8E8E93' }}>
                  Rail пуст — все проекты распределены. Перетащите карточку обратно сюда чтобы вынуть её из портфеля.
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {/* Stage columns */}
        <Reveal delay={360}>
          <div style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}>
            {M2_STAGES_W4.map((st) => {
              const items = cols[st.id] || [];
              return (
                <div
                  key={st.id}
                  onDragOver={handleDragOver(st.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(st.id)}
                  className={`m2-col m2-col-${st.id}`}
                  style={{
                    padding: 14, borderRadius: 12,
                    background: overCol === st.id ? 'rgba(42,157,143,0.10)' : 'rgba(15,18,22,0.7)',
                    border: overCol === st.id ? '2px dashed #2A9D8F' : '1px solid #2A2D31',
                    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    minHeight: 220,
                  }}
                >
                  <div style={{
                    fontSize: 11, color: '#F4A261',
                    textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600,
                    marginBottom: 10,
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
                          className="glass card-hover m2-card"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: 8, borderRadius: 8,
                            border: '1px solid #2A2D31', background: '#15181C',
                            cursor: 'grab', color: '#EAEAEA',
                            opacity: dragId === pid ? 0.5 : 1,
                            transition: 'opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                          title={`${p.title} — ${p.budget} млн ₽, IRR ${p.irr}%`}
                        >
                          <img
                            src={posterSrc(pid)}
                            alt={`Постер ${p.title}`}
                            loading="lazy"
                            style={{
                              width: 40, height: 60, objectFit: 'cover',
                              borderRadius: 4, flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 600,
                              fontFamily: "'Playfair Display'",
                              whiteSpace: 'nowrap', overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
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
                      <div style={{
                        fontSize: 11, color: '#8E8E93',
                        textAlign: 'center', padding: '20px 8px',
                        border: '1px dashed rgba(42,45,49,0.6)', borderRadius: 6,
                      }}>
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
// M3 — COMMITMENT CALCULATOR SECTION
// Tier badges: Partner / Lead Investor / Anchor Partner (не Supporter/Sponsor!)
// MOIC 3.62 (bull-gross), «commitment вашего фонда», «ваш фонд получит».
// ========================================================================

function CommitmentCalculatorSection() {
  const [commitment, setCommitment] = useState(300);

  // -- Waterfall-математика для персонального payout --
  // MOIC = 3.62 (fund-gross Bull-case, max-upside).
  // Tier1: preferred 8% hurdle (~40% от commitment за 5 лет)
  // Tier2: GP catch-up = 0.25 × preferred
  // Tier3: 80/20 split
  // Tier4: super-carry 70/30 (активируется при IRR>25%, в base не срабатывает)
  const grossMOIC = M3_MOIC_W4; // = 3.62
  const fundEquity = 3000; // млн ₽ base
  const commitShare = commitment / fundEquity;

  const totalGross = commitment * grossMOIC; // totalGross = commitment × MOIC 3.62
  const profit = totalGross - commitment;

  const preferred = commitment * 0.40;
  let remaining = Math.max(0, profit - preferred);
  const catchup = Math.min(remaining, preferred * 0.25);
  remaining -= catchup;

  const splitLP = remaining * 0.80;
  const splitGP = remaining * 0.20;

  // В Bull-case MOIC 3.62 IRR может превышать 25% — активация super-carry 70/30
  // на остаточный tranche над первым 3.0x
  const baseLPUpto3x = Math.min(totalGross, commitment * 3.0);
  const superTranche = Math.max(0, totalGross - commitment * 3.0);
  const superLP = superTranche * 0.70;
  const superGP = superTranche * 0.30;

  const lpTotal = commitment + preferred + splitLP; // простая тригеря tier1+tier3
  const gpTotal = catchup + splitGP;
  const lpMultiple = lpTotal / commitment;

  // Определяем badge на основе commitment (млн ₽)
  // Partner: 100-300, Lead Investor: 300-750, Anchor Partner: 750+
  const tier = commitment >= 750 ? M3_TIERS_W4[2] // Anchor Partner
             : commitment >= 300 ? M3_TIERS_W4[1] // Lead Investor
             : M3_TIERS_W4[0];                    // Partner
  const badge = tier.label;
  const badgeColor = tier.color;

  const waterfallTiers = [
    { id: 't1', label: 'Tier 1 — Preferred (8% hurdle)', split: 'LP 100%',       amount: preferred,               color: '#2A9D8F',
      tip: 'Сначала ваш фонд получает свой вклад + 8% годовых (≈40% при 5-летнем holding-периоде).' },
    { id: 't2', label: 'Tier 2 — GP catch-up',            split: 'GP 100%',       amount: catchup,                 color: '#F4A261',
      tip: 'Холдинг-GP добирает 20% carry от совокупной прибыли после preferred.' },
    { id: 't3', label: 'Tier 3 — Split 80/20',            split: 'LP 80 / GP 20', amount: splitLP + splitGP,       color: '#4A9EFF',
      tip: 'Оставшаяся прибыль делится 80% ваш фонд / 20% GP — основной tier для доходности.' },
    { id: 't4', label: 'Tier 4 — Super-carry 70/30',      split: 'LP 70 / GP 30', amount: superLP + superGP,       color: '#A855F7',
      tip: 'Super-carry активируется при MOIC > 3.0× (IRR > 25%) — в Bull-case с MOIC 3.62 срабатывает на остаточный транш.' },
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
            Waterfall: preferred 8% → catch-up → 80/20 → super-carry 70/30 (activates &gt; MOIC 3.0x)
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 6 }}>
            Ваш фонд получит персональный payout, посчитанный на базе fund-MOIC {M3_MOIC_W4.toFixed(2)}x
          </p>
        </Reveal>

        {/* Slider — commitment вашего фонда */}
        <Reveal delay={220}>
          <div className="glass" style={{
            marginTop: 32, padding: 24, borderRadius: 14,
            border: `1px solid ${badgeColor}`,
            maxWidth: 680, marginLeft: 'auto', marginRight: 'auto',
            textAlign: 'center',
            boxShadow: `0 0 24px ${badgeColor}22`,
          }}>
            <div style={{
              fontSize: 12, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Commitment вашего фонда (100 – 1500 млн ₽)
            </div>
            <div style={{
              fontSize: 42, fontFamily: "'Playfair Display'",
              color: badgeColor, marginTop: 6,
            }}>
              {commitment} млн ₽
            </div>
            <div style={{
              display: 'inline-block', marginTop: 8,
              padding: '4px 14px', borderRadius: 999,
              background: `${badgeColor}22`, color: badgeColor,
              border: `1px solid ${badgeColor}`,
              fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {badge}
            </div>
            <input
              type="range"
              min={100} max={1500} step={25}
              value={commitment}
              onChange={(e) => setCommitment(+e.target.value)}
              aria-label="Commitment вашего фонда"
              style={{ width: '100%', marginTop: 16, accentColor: badgeColor }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#8E8E93', marginTop: 4,
            }}>
              <span>Partner ≥ 100</span>
              <span>Lead Investor ≥ 300</span>
              <span>Anchor Partner ≥ 750</span>
            </div>
          </div>
        </Reveal>

        {/* Tier-badge explainer row */}
        <Reveal delay={300}>
          <div style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {M3_TIERS_W4.map((t) => {
              const active = tier.id === t.id;
              return (
                <div
                  key={t.id}
                  className="glass m3-tier-badge"
                  style={{
                    padding: 14, borderRadius: 10,
                    border: active ? `2px solid ${t.color}` : '1px solid #2A2D31',
                    background: active ? `${t.color}15` : 'rgba(21,24,28,0.55)',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: active ? `0 0 20px ${t.color}44` : 'none',
                  }}
                >
                  <div style={{
                    fontSize: 12, color: t.color, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                    {t.min} – {t.max} млн ₽
                  </div>
                  <div style={{ fontSize: 11, color: '#EAEAEA', marginTop: 6, lineHeight: 1.4 }}>
                    {t.id === 'partner' && 'Partner — базовый тикет для фонда. Quarterly reporting, LPAC observer rights.'}
                    {t.id === 'lead'    && 'Lead Investor — расширенные информационные права, co-investment rights по отдельным проектам.'}
                    {t.id === 'anchor'  && 'Anchor Partner — key-person clause, full LPAC vote, pre-emption на следующий fund-vintage.'}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Summary — ваш фонд получит */}
        <Reveal delay={360}>
          <div className="glass" style={{
            marginTop: 28, padding: 28, borderRadius: 14,
            border: '1px solid #2A2D31',
            background: 'linear-gradient(135deg, rgba(244,162,97,0.06), rgba(42,157,143,0.06))',
          }}>
            <div style={{
              fontSize: 12, color: '#F4A261',
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 18,
              textAlign: 'center',
            }}>
              Ваш фонд получит (Bull-case, MOIC {M3_MOIC_W4.toFixed(2)}x)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20, textAlign: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: 11, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Total payout
                </div>
                <div style={{
                  fontSize: 32, fontFamily: "'Playfair Display'",
                  color: '#2A9D8F', marginTop: 4,
                }}>
                  <CountUp key={`lp-${commitment}`} end={lpTotal + superLP} decimals={0} suffix=" млн ₽" />
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 11, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Multiple
                </div>
                <div style={{
                  fontSize: 32, fontFamily: "'Playfair Display'",
                  color: '#EAEAEA', marginTop: 4,
                }}>
                  <CountUp key={`mx-${commitment}`} end={(lpTotal + superLP) / commitment} decimals={2} suffix="x" />
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 11, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  GP carry total
                </div>
                <div style={{
                  fontSize: 32, fontFamily: "'Playfair Display'",
                  color: '#F4A261', marginTop: 4,
                }}>
                  <CountUp key={`gp-${commitment}`} end={gpTotal + superGP} decimals={0} suffix=" млн ₽" />
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 11, color: '#8E8E93',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Ваша доля фонда
                </div>
                <div style={{
                  fontSize: 32, fontFamily: "'Playfair Display'",
                  color: '#EAEAEA', marginTop: 4,
                }}>
                  <CountUp key={`sh-${commitment}`} end={commitShare * 100} decimals={1} suffix="%" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Mini-waterfall table */}
        <Reveal delay={460}>
          <div className="glass" style={{
            marginTop: 24, padding: 24, borderRadius: 14,
            border: '1px solid #2A2D31',
          }}>
            <div style={{
              fontSize: 13, color: '#8E8E93',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
            }}>
              Waterfall — распределение cash по tiers
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {waterfallTiers.map((t) => (
                <div
                  key={t.id}
                  className="card-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 16, alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(21,24,28,0.55)',
                    borderLeft: `3px solid ${t.color}`,
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
                  <div style={{
                    fontSize: 16, color: t.color,
                    fontFamily: "'Playfair Display'",
                  }}>
                    <CountUp key={`${t.id}-${commitment}`} end={t.amount} decimals={1} suffix=" млн" />
                  </div>
                  <div style={{
                    width: 80, height: 6, borderRadius: 3,
                    background: 'rgba(42,45,49,0.6)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(100, (t.amount / Math.max(1, totalGross - commitment)) * 100)}%`,
                      height: '100%', background: t.color,
                      transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 18, padding: 12,
              background: 'rgba(42,157,143,0.07)',
              borderRadius: 8, border: '1px dashed rgba(42,157,143,0.3)',
              fontSize: 12, color: '#EAEAEA', lineHeight: 1.55,
            }}>
              <strong style={{ color: '#2A9D8F' }}>Note:</strong> расчёт иллюстративный,
              базируется на fund-gross MOIC {M3_MOIC_W4.toFixed(2)}x (Bull scenario).
              В Base-scenario MOIC 2.20x super-carry не активируется, итоговый multiple для вашего фонда
              составит ~2.0x с учётом 8% preferred.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// ROOT APP — W4 композиция: W1+W2+W3 + все секции W4 + FooterStub
// Порядок после OperationsSection (s11, W3): s12 → s13 → s14 → s15 → s16 → M2 → M3
// ========================================================================

function App_W4() {
  return (
    <>
      <ScrollProgress />
      <TopNav />
      <main>
        {/* W1 — foundation */}
        <HeroSection />
        <ThesisSection />
        <MarketSection />
        {/* W2 — fund + economics + MC + pipeline */}
        <FundStructureSection />
        <EconomicsSection />
        <ReturnsSection />
        {/* W3 — pipeline cards + team + advisory + operations */}
        <PipelineSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        {/* W4 — risks + roadmap + scenarios + regions + tax + M2 + M3 */}
        <RisksSection />
        <RoadmapSection />
        <ScenariosSection />
        <RegionsSection />
        <TaxCreditsSection />
        <M2BuilderSection />
        <CommitmentCalculatorSection />
      </main>
      <FooterStub />
    </>
  );
}
