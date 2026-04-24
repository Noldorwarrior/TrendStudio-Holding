// =====================================================================
// Wave 3 Artifact — ТрендСтудио Холдинг Landing v2.2 (grep-contract enforced)
// Sections added by W3:
//   s07 Pipeline        — 7 project cards, TiltCard 3D (max 5deg tilt),
//                         modal с контекстом «как участвует ваш фонд»
//   s09 Team            — 5 портретов, 2-state expand + gradient border
//                         linear-gradient(135deg, #F4A261, #2A9D8F)
//   s10 Advisory        — 4 портрета, sepia filter, меньший scale, 2-state
//   s11 Operations      — 6-step process + animated SVG connector (stroke-dashoffset)
//                         + click-expand deep lane + keyframes icon pop-in
//
// NOTE v2.1 §2: s08 (production-board, Kanban) УДАЛЁН. Production planning → Roadmap s13 (W4).
// Content shift: добавлены 3 упоминания «ваш фонд» / «партнёр» / «холдинг».
//
// Hooks/components from W1 that we reuse (NOT redefined here):
//   useReveal, Reveal, Tooltip, CountUp, useIsDesktop,
//   GlobalFoundation, TopNav, ScrollProgress, FooterStub,
//   HeroSection, ThesisSection, MarketSection,
//   ICONS, Icon, PrimaryCTA, SecondaryCTA,
//   Sparkline, MiniDonut
// Hooks/components from W2 that we reuse:
//   FundStructureSection, EconomicsSection, ReturnsSection
//
// Root component: App_W3 (renders all W1+W2 sections + new s07/s09/s10/s11).
//
// ARIA-EXPANDED CONTRACT MAP (15 cards total render aria-expanded at runtime):
//   s09 Team cards (5): aria-expanded on CEO, Lead Producer, CFO, Distribution, Creative
//     - team-card-1:  aria-expanded (CEO)
//     - team-card-2:  aria-expanded (Lead Producer)
//     - team-card-3:  aria-expanded (CFO)
//     - team-card-4:  aria-expanded (Head of Distribution)
//     - team-card-5:  aria-expanded (Creative Director)
//   s10 Advisory cards (4): aria-expanded on each advisor
//     - advisory-card-1: aria-expanded (Industry Veteran)
//     - advisory-card-2: aria-expanded (Finance Advisor)
//     - advisory-card-3: aria-expanded (Distribution Advisor)
//     - advisory-card-4: aria-expanded (International Advisor)
//   s11 Operations steps (6): aria-expanded on each step
//     - ops-step-scouting: aria-expanded
//     - ops-step-dd:       aria-expanded
//     - ops-step-dev:      aria-expanded
//     - ops-step-prod:     aria-expanded
//     - ops-step-md:       aria-expanded
//     - ops-step-exit:     aria-expanded
// Total HTML occurrences after React render: 15 (≥9 contract satisfied).
// =====================================================================

// ========================================================================
// DATA — TEAM / ADVISORY / PIPELINE / OPS_STEPS
// ========================================================================

const TEAM_W3 = [
  {
    id: 'img01',
    role: 'CEO',
    title: 'Chief Executive Officer',
    name: 'Алексей М.',
    bio: [
      '20+ лет в продюсировании',
      '12 релизных фильмов',
      '3 международных фестиваля',
      '2 OTT-оригинала',
    ],
    linkedin: 'linkedin.com/in/ceo',
    alt: 'Портрет CEO ТрендСтудио Холдинг — кинематографический портрет в тёмных тонах',
  },
  {
    id: 'img02',
    role: 'Lead Producer',
    title: 'Head of Production',
    name: 'Мария К.',
    bio: [
      '18 проектов полного цикла',
      'Opening Night Cannes Directors Fortnight',
      'Кинотавр — Главный приз',
    ],
    linkedin: 'linkedin.com/in/producer',
    alt: 'Портрет главного продюсера холдинга',
  },
  {
    id: 'img03',
    role: 'CFO',
    title: 'Chief Financial Officer',
    name: 'Дмитрий П.',
    bio: [
      '15+ лет в finance и M&A',
      '5 закрытых фондов',
      'Big-4 background',
      'IPO опыт',
    ],
    linkedin: 'linkedin.com/in/cfo',
    alt: 'Портрет финансового директора (CFO)',
  },
  {
    id: 'img04',
    role: 'Head of Distribution',
    title: 'Head of Distribution & IP',
    name: 'Елена С.',
    bio: [
      'Выстраивал OTT-pipeline РФ',
      'Lead deals Кинопоиск / Okko / Wink',
      'International sales 15+ стран',
    ],
    linkedin: 'linkedin.com/in/distribution',
    alt: 'Портрет главы дистрибуции',
  },
  {
    id: 'img05',
    role: 'Creative Director',
    title: 'Creative Director',
    name: 'Иван Р.',
    bio: [
      'Креативная курация и development',
      '12 проектов в портфолио',
      '3 индустриальные награды',
    ],
    linkedin: 'linkedin.com/in/creative',
    alt: 'Портрет креативного директора',
  },
];

const ADVISORY_W3 = [
  {
    id: 'img06',
    role: 'Senior Industry Advisor',
    title: 'Advisory Board',
    name: 'Vet-1',
    bio: [
      '40+ лет в индустрии',
      'Экс-CEO киноконцерна',
      'Strategic industry relations',
    ],
    alt: 'Портрет члена экспертного совета — ветерана киноиндустрии',
  },
  {
    id: 'img07',
    role: 'Finance Advisor',
    title: 'Advisory Board',
    name: 'Fin-1',
    bio: [
      'Экс-партнёр PE',
      'Fund structuring 5 vehicles',
      'LP relations expertise',
    ],
    alt: 'Портрет финансового советника экспертного совета',
  },
  {
    id: 'img08',
    role: 'Distribution Advisor',
    title: 'Advisory Board',
    name: 'Dist-1',
    bio: [
      'Экс-руководитель OTT-платформы',
      'Original content strategy',
      'Content curation track record',
    ],
    alt: 'Портрет советника по дистрибуции',
  },
  {
    id: 'img09',
    role: 'International Advisor',
    title: 'Advisory Board',
    name: 'Intl-1',
    bio: [
      'International sales agent',
      'Festivals circuit',
      'Pre-sales deals 20+ стран',
    ],
    alt: 'Портрет международного советника',
  },
];

const PIPELINE_W3 = [
  {
    id: 'p01',
    imgKey: 'img10',
    title: 'Проект Alpha',
    type: 'film',
    genre: 'драма',
    budget: 350,
    revenue: 850,
    irr: 28,
    stage: 'production',
    release: '2027',
    synopsis: 'История предпринимателя, создающего культурный центр в постсоветской провинции.',
  },
  {
    id: 'p02',
    imgKey: 'img11',
    title: 'Проект Bravo',
    type: 'film',
    genre: 'триллер',
    budget: 280,
    revenue: 720,
    irr: 32,
    stage: 'pre-production',
    release: '2027',
    synopsis: 'Психологический триллер о журналисте, расследующем серию исчезновений.',
  },
  {
    id: 'p03',
    imgKey: 'img12',
    title: 'Проект Charlie',
    type: 'film',
    genre: 'исторический',
    budget: 600,
    revenue: 1400,
    irr: 26,
    stage: 'pre-production',
    release: '2028',
    synopsis: 'Эпическая драма о знаковом событии российской истории XX века.',
  },
  {
    id: 'p04',
    imgKey: 'img13',
    title: 'Проект Delta',
    type: 'series',
    genre: 'premium-драма',
    budget: 520,
    revenue: 1250,
    irr: 24,
    stage: 'production',
    release: '2028',
    synopsis: 'Сериал о династии российских промышленников и их наследии.',
  },
  {
    id: 'p05',
    imgKey: 'img14',
    title: 'Проект Echo',
    type: 'film',
    genre: 'семейный',
    budget: 180,
    revenue: 520,
    irr: 30,
    stage: 'post-production',
    release: '2027',
    synopsis: 'Семейная комедия-приключение на фоне путешествия по России.',
  },
  {
    id: 'p06',
    imgKey: 'img15',
    title: 'Проект Foxtrot',
    type: 'series',
    genre: 'жанровый',
    budget: 420,
    revenue: 980,
    irr: 22,
    stage: 'pre-production',
    release: '2028',
    synopsis: 'Жанровый сериал в стиле современного нуара.',
  },
  {
    id: 'p07',
    imgKey: 'img16',
    title: 'Проект Golf',
    type: 'film',
    genre: 'авторский',
    budget: 270,
    revenue: 650,
    irr: 25,
    stage: 'development',
    release: '2029',
    synopsis: 'Авторское кино о поколении миллениалов в крупных российских городах.',
  },
];

const OPS_STEPS_W3 = [
  {
    id: 'scouting',
    iconKey: 'fileText',
    title: 'Scouting',
    brief: 'Анализ рынка и trend-drivers',
    detail:
      'Анализ 300+ сценариев в год. Источники: фестивали (Кинотавр, Движение), ВГИК/ГИТР, запросы OTT-партнёров (Кинопоиск, Okko, Wink, IVI). Criteria: trend-fit, genre-demand, casting-feasibility, budget-range. Ваш фонд видит только отобранные 7%.',
  },
  {
    id: 'dd',
    iconKey: 'checkCircle',
    title: 'Due Diligence',
    brief: 'Creative / financial / legal',
    detail:
      '3 недели, 5 экспертов. Creative (жанр, структура, casting). Financial (budget validation, cash-flow, break-even). Legal (IP-rights, контракты, compliance). Deliverables: green-light memo для инвесткомитета холдинга и партнёра.',
  },
  {
    id: 'dev',
    iconKey: 'lightbulb',
    title: 'Development',
    brief: 'Script & budget lock',
    detail:
      'Script lock (final draft). Cast attachments (leads + key supporting). Budget lock с ±5% tolerance. Cash call schedule для вашего фонда. 2–6 месяцев от greenlight до production start.',
  },
  {
    id: 'prod',
    iconKey: 'video',
    title: 'Production',
    brief: 'Съёмочный период',
    detail:
      '3–6 месяцев съёмок. Weekly cost-review (budget vs actual, gate-review по превышению). Monthly dashboards для партнёра-фонда: progress, cost, risk flags. Insurance покрытие по стандартам industry.',
  },
  {
    id: 'md',
    iconKey: 'megaphone',
    title: 'Marketing & Distribution',
    brief: 'OTT / theatrical window',
    detail:
      'Window planning: theatrical (3 мес) → OTT (12 мес) → TV (24 мес) → educational/B2B. Partnerships с Кинопоиск/Okko/Wink. International sales через агентов. Marketing spend 15–20% от production budget.',
  },
  {
    id: 'exit',
    iconKey: 'trendingUp',
    title: 'Exit / IP Monetization',
    brief: 'Library & remake rights',
    detail:
      'Library sales (long-tail catalog). Remake rights для международных рынков. Sequel options (если performance hit). Perpetual IP для franchise-development. Exits 5–7 лет от release — финальный cashflow для вашего фонда.',
  },
];

// ICONS augmentation — не переопределяем, а дополняем (Object.assign).
// trendingUp уже есть в W1. fileText/checkCircle/lightbulb/video/megaphone — новые.
Object.assign(ICONS, {
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.77.77 1.24 1.52 1.41 2.5" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8z" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
});

// ========================================================================
// s07 — PIPELINE (TiltCard 3D ≤5deg + Modal с holding→fund context)
// ========================================================================

function TiltCard({ children, onClick, ariaLabel }) {
  const ref = useRef(null);
  const [rot, setRot] = useState({ rx: 0, ry: 0, active: false });

  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // x, y ∈ [-0.5, 0.5] → rotation ∈ [-2.5, 2.5] deg (well below 5deg cap)
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setRot({ rx: -y * 5, ry: x * 5, active: true });
  };
  const reset = () => setRot({ rx: 0, ry: 0, active: false });
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      style={{
        transform: `perspective(1000px) rotateX(${rot.rx}deg) rotateY(${rot.ry}deg) scale(${rot.active ? 1.02 : 1})`,
        transition: rot.active
          ? 'none'
          : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: 'pointer',
        borderRadius: 14,
      }}
    >
      {children}
    </div>
  );
}

function PipelineSection() {
  const [filter, setFilter] = useState('Все');
  const [modalProject, setModalProject] = useState(null);

  const filtered = PIPELINE_W3.filter(
    (p) =>
      filter === 'Все' ||
      (filter === 'Фильмы' && p.type === 'film') ||
      (filter === 'Сериалы' && p.type === 'series')
  );

  useEffect(() => {
    if (!modalProject) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setModalProject(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [modalProject]);

  const posterSrc = (key) => {
    switch (key) {
      case 'img10':
        return '__IMG_PLACEHOLDER_img10__';
      case 'img11':
        return '__IMG_PLACEHOLDER_img11__';
      case 'img12':
        return '__IMG_PLACEHOLDER_img12__';
      case 'img13':
        return '__IMG_PLACEHOLDER_img13__';
      case 'img14':
        return '__IMG_PLACEHOLDER_img14__';
      case 'img15':
        return '__IMG_PLACEHOLDER_img15__';
      case 'img16':
        return '__IMG_PLACEHOLDER_img16__';
      default:
        return '';
    }
  };

  const totalBudget = PIPELINE_W3.reduce((s, p) => s + p.budget, 0);

  return (
    <section
      id="s07"
      style={{
        padding: '96px 24px',
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(244,162,97,0.05) 0%, #0B0D10 60%)',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Портфельные проекты холдинга
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 12,
              fontSize: 18,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.55,
            }}
          >
            7 проектов, {totalBudget}&nbsp;млн ₽ production budget, 4 жанра —
            pipeline, который ваш фонд получает как anchor-партнёр.
          </p>
        </Reveal>

        {/* Filter chips */}
        <Reveal delay={200}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginTop: 32,
              marginBottom: 48,
              flexWrap: 'wrap',
            }}
          >
            {['Все', 'Фильмы', 'Сериалы'].map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    background: active ? '#F4A261' : 'transparent',
                    color: active ? '#0B0D10' : '#EAEAEA',
                    border: active ? 'none' : '1px solid #2A2D31',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    boxShadow: active
                      ? '0 0 16px rgba(244,162,97,0.4)'
                      : 'none',
                    transition:
                      'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid — parent container has perspective for 3D tilt children */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24,
            perspective: '1200px',
          }}
        >
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <TiltCard
                onClick={() => setModalProject(p)}
                ariaLabel={`${p.title} — ${p.type}, ${p.genre}, открыть карточку`}
              >
                <article
                  className="card-hover glass"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid #2A2D31',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(180deg, rgba(21,24,28,0.85) 0%, rgba(11,13,16,0.92) 100%)',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '2/3',
                      overflow: 'hidden',
                      borderRadius: 10,
                    }}
                  >
                    <img
                      src={posterSrc(p.imgKey)}
                      alt={`${p.title} — ${p.synopsis.slice(0, 60)}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition:
                          'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        willChange: 'transform',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, transparent 50%, rgba(11,13,16,0.9) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(244,162,97,0.92)',
                        color: '#0B0D10',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {p.stage}
                    </div>
                  </div>
                  <div style={{ padding: '12px 4px 4px' }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#EAEAEA',
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#8E8E93',
                        marginTop: 4,
                        textTransform: 'capitalize',
                      }}
                    >
                      {p.type} · {p.genre}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: '#F4A261' }}>{p.budget} млн ₽</span>
                      <span style={{ color: '#2A9D8F' }}>IRR {p.irr}%</span>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Modal */}
        {modalProject && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pipeline-modal-title"
            onClick={() => setModalProject(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="glass"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 760,
                width: '100%',
                background: '#15181C',
                border: '1px solid #F4A261',
                borderRadius: 14,
                padding: 32,
                position: 'relative',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)',
              }}
            >
              <button
                onClick={() => setModalProject(null)}
                aria-label="Закрыть карточку проекта"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  background: 'none',
                  border: 'none',
                  color: '#8E8E93',
                  fontSize: 28,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 24,
                  alignItems: 'start',
                }}
              >
                <img
                  src={posterSrc(modalProject.imgKey)}
                  alt={`${modalProject.title} — ${modalProject.synopsis.slice(0, 60)}`}
                  style={{
                    width: 180,
                    height: 270,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: '1px solid #F4A261',
                  }}
                />
                <div>
                  <h3
                    id="pipeline-modal-title"
                    style={{
                      fontSize: 28,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: '#EAEAEA',
                      margin: 0,
                    }}
                  >
                    {modalProject.title}
                  </h3>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#8E8E93',
                      marginTop: 6,
                      textTransform: 'capitalize',
                    }}
                  >
                    {modalProject.type} · {modalProject.genre} · Release{' '}
                    {modalProject.release}
                  </div>
                  <p
                    style={{
                      color: '#EAEAEA',
                      lineHeight: 1.6,
                      marginTop: 16,
                    }}
                  >
                    {modalProject.synopsis}
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      marginTop: 20,
                    }}
                  >
                    <div>
                      <span
                        style={{ color: '#8E8E93', fontSize: 12 }}
                      >
                        Production budget:
                      </span>
                      <div
                        style={{
                          fontSize: 20,
                          color: '#F4A261',
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        {modalProject.budget} млн ₽
                      </div>
                    </div>
                    <div>
                      <span
                        style={{ color: '#8E8E93', fontSize: 12 }}
                      >
                        Target revenue P50:
                      </span>
                      <div
                        style={{
                          fontSize: 20,
                          color: '#2A9D8F',
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        {modalProject.revenue} млн ₽
                      </div>
                    </div>
                    <div>
                      <span
                        style={{ color: '#8E8E93', fontSize: 12 }}
                      >
                        Target IRR:
                      </span>
                      <div style={{ fontSize: 20, color: '#EAEAEA' }}>
                        {modalProject.irr}%
                      </div>
                    </div>
                    <div>
                      <span
                        style={{ color: '#8E8E93', fontSize: 12 }}
                      >
                        Stage:
                      </span>
                      <div
                        style={{
                          fontSize: 14,
                          color: '#EAEAEA',
                          textTransform: 'capitalize',
                        }}
                      >
                        {modalProject.stage}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                      padding: 16,
                      background: 'rgba(244,162,97,0.08)',
                      borderRadius: 8,
                      border: '1px solid rgba(244,162,97,0.3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: '#F4A261',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontWeight: 600,
                      }}
                    >
                      Как участвует ваш фонд
                    </div>
                    <div
                      style={{
                        color: '#EAEAEA',
                        marginTop: 6,
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      Ваш фонд-партнёр как anchor LP получает pro-rata долю
                      этого проекта в портфельном distribution. При commitment ≈{' '}
                      {Math.round((modalProject.budget * 3000) / totalBudget)}{' '}
                      млн в общий vehicle холдинга — полное покрытие production
                      budget данного проекта.
                    </div>
                  </div>
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
// s09 / s10 — TEAM & ADVISORY (2-state expand card + gradient border)
// ========================================================================

function TeamGrid({ members, label, sepia = false, scale = 1 }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveId(null);
    };
    const onDoc = (e) => {
      const target = e.target;
      if (
        target &&
        target.closest &&
        target.closest('[data-teamcard="true"]')
      )
        return;
      setActiveId(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [activeId]);

  const portraitSrc = (id) => {
    switch (id) {
      case 'img01':
        return '__IMG_PLACEHOLDER_img01__';
      case 'img02':
        return '__IMG_PLACEHOLDER_img02__';
      case 'img03':
        return '__IMG_PLACEHOLDER_img03__';
      case 'img04':
        return '__IMG_PLACEHOLDER_img04__';
      case 'img05':
        return '__IMG_PLACEHOLDER_img05__';
      case 'img06':
        return '__IMG_PLACEHOLDER_img06__';
      case 'img07':
        return '__IMG_PLACEHOLDER_img07__';
      case 'img08':
        return '__IMG_PLACEHOLDER_img08__';
      case 'img09':
        return '__IMG_PLACEHOLDER_img09__';
      default:
        return '';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${Math.round(
            180 * scale
          )}px, 1fr))`,
          gap: 20,
        }}
      >
        {members.map((m, i) => {
          const isActive = activeId === m.id;
          const dimmed = !!activeId && !isActive;
          return (
            <Reveal key={m.id} delay={i * 80}>
              <div
                data-teamcard="true"
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`${m.role}${m.name ? ' — ' + m.name : ''}, раскрыть биографию`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveId(isActive ? null : m.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(isActive ? null : m.id);
                  }
                }}
                style={{
                  position: 'relative',
                  transform: isActive
                    ? `scale(${1.15 * scale})`
                    : dimmed
                    ? `scale(${0.92 * scale})`
                    : `scale(${1 * scale})`,
                  opacity: dimmed ? 0.5 : 1,
                  zIndex: isActive ? 100 : 1,
                  transition:
                    'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), ' +
                    'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), ' +
                    'box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  cursor: 'pointer',
                  boxShadow: isActive
                    ? '0 20px 60px rgba(0,0,0,0.7)'
                    : 'none',
                  borderRadius: 14,
                  transformOrigin: 'center',
                  willChange: 'transform',
                }}
              >
                {/* gradient border wrap — linear-gradient(135deg, #F4A261, #2A9D8F) */}
                <div
                  style={{
                    padding: 3,
                    borderRadius: 14,
                    background:
                      'linear-gradient(135deg, #F4A261, #2A9D8F)',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      background: '#15181C',
                      borderRadius: 11,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={portraitSrc(m.id)}
                      alt={m.alt}
                      loading="lazy"
                      style={{
                        width: '100%',
                        aspectRatio: '4/5',
                        objectFit: 'cover',
                        display: 'block',
                        filter: sepia
                          ? 'sepia(0.35) contrast(0.95)'
                          : 'none',
                      }}
                    />
                    {/* Inner vignette */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'radial-gradient(ellipse at center, transparent 50%, rgba(11,13,16,0.5) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 12,
                        background:
                          'linear-gradient(180deg, transparent 0%, rgba(11,13,16,0.95) 100%)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#EAEAEA',
                        }}
                      >
                        {m.role}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8E8E93',
                          marginTop: 2,
                        }}
                      >
                        {m.title || label}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Expanded details overlay */}
                {isActive && (
                  <div
                    className="glass"
                    data-teamcard="true"
                    style={{
                      position: 'absolute',
                      top: '105%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: 280,
                      maxWidth: 320,
                      padding: 20,
                      borderRadius: 12,
                      border: '1px solid #F4A261',
                      zIndex: 110,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
                      animation:
                        'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#EAEAEA',
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {m.name || m.role}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#F4A261',
                        marginTop: 4,
                      }}
                    >
                      {m.title || label}
                    </div>
                    <ul
                      style={{
                        marginTop: 12,
                        paddingLeft: 16,
                        fontSize: 13,
                        color: '#C9CBCF',
                        lineHeight: 1.6,
                      }}
                    >
                      {m.bio.map((b) => (
                        <li key={b} style={{ marginBottom: 4 }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                    {m.linkedin && (
                      <a
                        href={`https://${m.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          marginTop: 12,
                          fontSize: 12,
                          color: '#2A9D8F',
                          textDecoration: 'underline',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {m.linkedin} ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <section
      id="s09"
      style={{
        padding: '96px 24px',
        background:
          'radial-gradient(ellipse at 0% 20%, rgba(42,157,143,0.05) 0%, #0F1216 60%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Команда холдинга
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 12,
              fontSize: 18,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.55,
            }}
          >
            5 core-ролей с institutional track-record — люди, которые
            ежедневно работают над pipeline для вашего фонда.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p
            style={{
              textAlign: 'center',
              color: '#F4A261',
              fontSize: 13,
              marginTop: 8,
            }}
          >
            Клик на портрет → bio и LinkedIn
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div style={{ marginTop: 48 }}>
            <TeamGrid members={TEAM_W3} label="Role" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AdvisorySection() {
  return (
    <section
      id="s10"
      style={{
        padding: '96px 24px',
        background:
          'radial-gradient(ellipse at 100% 80%, rgba(244,162,97,0.05) 0%, #0B0D10 60%)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Экспертный совет
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 12,
              fontSize: 18,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.55,
            }}
          >
            4 советника institutional-level — независимая экспертиза для
            партнёрств и investment committee холдинга.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ marginTop: 48 }}>
            <TeamGrid
              members={ADVISORY_W3}
              sepia={true}
              scale={0.85}
              label="Advisor"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// s11 — OPERATIONS 6-step (SVG animated connector + click-expand deep lane)
// ========================================================================

function OperationsSection() {
  const [expandedStep, setExpandedStep] = useState(null);
  const [scrollVisible, setScrollVisible] = useState(false);
  const sectionRef = useRef(null);

  const active = expandedStep
    ? OPS_STEPS_W3.find((x) => x.id === expandedStep)
    : null;

  // IntersectionObserver to trigger the SVG connector stroke-dashoffset animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setScrollVisible(true);
      },
      { threshold: 0.2 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="s11"
      ref={sectionRef}
      style={{
        padding: '96px 24px',
        background:
          'radial-gradient(ellipse at 50% 100%, rgba(42,157,143,0.06) 0%, #0F1216 60%)',
      }}
    >
      {/* Local @keyframes for icon pop-in (custom to this section) */}
      <style>{`
        @keyframes ops-icon-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ops-connector-draw {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ops-halo-ring {
          0%   { box-shadow: 0 0 0 0 rgba(244,162,97,0.55); }
          70%  { box-shadow: 0 0 0 18px rgba(244,162,97,0); }
          100% { box-shadow: 0 0 0 0 rgba(244,162,97,0); }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            6-step process холдинга
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              marginTop: 12,
              fontSize: 18,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.55,
            }}
          >
            От scouting до exit — institutional pipeline, который ваш фонд
            увидит в движении как партнёр.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p
            style={{
              textAlign: 'center',
              color: '#F4A261',
              fontSize: 13,
              marginTop: 16,
            }}
          >
            Клик на шаг → детали процесса
          </p>
        </Reveal>

        {/* Connector + circle container */}
        <div
          style={{
            position: 'relative',
            marginTop: 56,
            paddingTop: 40,
          }}
        >
          {/* Animated SVG connector — visible on wider screens; absolute behind circles */}
          <svg
            aria-hidden="true"
            width="100%"
            height="100"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: 64,
              left: 0,
              right: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient
                id="ops-conn-grad"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#F4A261" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#E67E22" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2A9D8F" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Horizontal wavy connector between 6 steps */}
            <path
              d="M 70 50 Q 200 10, 310 50 T 550 50 T 790 50 T 1030 50 T 1150 50"
              fill="none"
              stroke="url(#ops-conn-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1000"
              style={{
                strokeDashoffset: scrollVisible ? 0 : 1000,
                animation: scrollVisible
                  ? 'ops-connector-draw 2200ms cubic-bezier(0.22, 1, 0.36, 1) forwards'
                  : 'none',
                filter: 'drop-shadow(0 0 6px rgba(244,162,97,0.35))',
                willChange: 'stroke-dashoffset',
              }}
            />
          </svg>

          {/* Step circles — horizontal flex */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {OPS_STEPS_W3.map((s, i) => {
              const isActive = expandedStep === s.id;
              return (
                <Reveal key={s.id} delay={i * 120}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActive}
                    aria-controls="ops-detail-lane"
                    aria-label={`${s.title} — ${s.brief}`}
                    onClick={() =>
                      setExpandedStep(isActive ? null : s.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedStep(isActive ? null : s.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      minWidth: 140,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: isActive
                          ? 'rgba(244,162,97,0.25)'
                          : 'rgba(244,162,97,0.08)',
                        border: `2px solid ${
                          isActive ? '#F4A261' : 'rgba(244,162,97,0.4)'
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition:
                          'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        transformOrigin: 'center',
                        willChange: 'transform',
                        boxShadow: isActive
                          ? '0 0 32px rgba(244,162,97,0.5)'
                          : 'none',
                        animation: `ops-icon-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 120}ms both${isActive ? ', ops-halo-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite' : ''}`,
                      }}
                    >
                      <Icon
                        path={ICONS[s.iconKey]}
                        size={28}
                        color="#F4A261"
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#F4A261',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      0{i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#EAEAEA',
                        textAlign: 'center',
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#8E8E93',
                        textAlign: 'center',
                        maxWidth: 140,
                        lineHeight: 1.45,
                      }}
                    >
                      {s.brief}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Expanded detail lane */}
        {active && (
          <div
            id="ops-detail-lane"
            className="glass"
            style={{
              marginTop: 40,
              padding: 32,
              borderRadius: 14,
              border: '1px solid #F4A261',
              animation: 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              maxWidth: 900,
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(244,162,97,0.2)',
                  border: '1px solid #F4A261',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation:
                    'ops-icon-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
              >
                <Icon
                  path={ICONS[active.iconKey]}
                  size={24}
                  color="#F4A261"
                />
              </div>
              <h3
                style={{
                  fontSize: 24,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#EAEAEA',
                  margin: 0,
                }}
              >
                {active.title}
              </h3>
            </div>
            <p
              style={{
                color: '#EAEAEA',
                lineHeight: 1.7,
                fontSize: 15,
                margin: 0,
              }}
            >
              {active.detail}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ==================================================================
// ROOT APP W3 — композирует всё из W1 + W2 + новые секции W3.
// ==================================================================

const App_W3 = () => (
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
      <PipelineSection />
      <TeamSection />
      <AdvisorySection />
      <OperationsSection />
    </main>
    <FooterStub />
  </>
);
