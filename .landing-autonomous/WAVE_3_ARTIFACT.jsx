// =====================================================================
// Wave 3 Artifact — ТрендСтудио Landing v2.1
// s07 Pipeline (7 posters, 3D tilt + Modal с holding→fund context)
// s09 Team    (5 portraits, 2-state expand + gradient-border)
// s10 Advisory(4 portraits, sepia, меньший scale, 2-state)
// s11 Operations 6-step (click-expand lane)
// NOTE v2.1 §2: s08 (production-board) УДАЛЁН. Production planning → Roadmap s13 (W4).
// =====================================================================

// ========================================================================
// DATA — TEAM / ADVISORY / PIPELINE / OPS_STEPS
// ========================================================================

const TEAM = [
  { id:'img01', role:'CEO',                 title:'Chief Executive Officer',   name:'Алексей М.', bio:['20+ лет в продюсировании','12 релизных фильмов','3 международных фестиваля','2 OTT-оригинала'], linkedin:'linkedin.com/in/ceo',          alt:'Портрет CEO ТрендСтудио Холдинг' },
  { id:'img02', role:'Lead Producer',       title:'Head of Production',        name:'Мария К.',   bio:['18 проектов полного цикла','Opening Night Cannes DF','Кинотавр — Главный приз'],            linkedin:'linkedin.com/in/producer',     alt:'Портрет главного продюсера' },
  { id:'img03', role:'CFO',                 title:'Chief Financial Officer',   name:'Дмитрий П.', bio:['15+ лет в finance & M&A','5 закрытых фондов','Big-4 background','IPO опыт'],                   linkedin:'linkedin.com/in/cfo',          alt:'Портрет финансового директора' },
  { id:'img04', role:'Head of Distribution',title:'Head of Distribution & IP', name:'Елена С.',   bio:['Выстраивал OTT-pipeline РФ','Lead deals Кинопоиск/IVI','International sales 15+ стран'],     linkedin:'linkedin.com/in/distribution', alt:'Портрет главы дистрибуции' },
  { id:'img05', role:'Creative Director',   title:'Creative Director',         name:'Иван Р.',    bio:['Креативная курация и development','12 проектов в портфолио','3 индустриальные награды'],     linkedin:'linkedin.com/in/creative',     alt:'Портрет креативного директора' }
];

const ADVISORY = [
  { id:'img06', role:'Senior Industry Advisor', name:'Vet-1',  bio:['40+ лет в индустрии','Экс-CEO киноконцерна','Strategic industry relations'], alt:'Портрет члена экспертного совета — ветерана индустрии' },
  { id:'img07', role:'Finance Advisor',         name:'Fin-1',  bio:['Экс-партнёр PE','Fund structuring 5 vehicles','LP relations expertise'],     alt:'Портрет финансового советника' },
  { id:'img08', role:'Distribution Advisor',    name:'Dist-1', bio:['Экс-руководитель OTT-платформы','Original content strategy','Content curation track record'], alt:'Портрет советника по дистрибуции' },
  { id:'img09', role:'International Advisor',   name:'Intl-1', bio:['International sales agent','Festivals circuit','Pre-sales deals 20+ стран'], alt:'Портрет международного советника' }
];

const PIPELINE = [
  { id:'p01', imgKey:'img10', title:'Проект Alpha',    type:'film',   genre:'драма',        budget:350, revenue:850,  irr:28, stage:'production',      release:2027, synopsis:'История предпринимателя, создающего культурный центр в постсоветской провинции.' },
  { id:'p02', imgKey:'img11', title:'Проект Bravo',    type:'film',   genre:'триллер',      budget:280, revenue:720,  irr:32, stage:'pre-production',  release:2027, synopsis:'Психологический триллер о журналисте, расследующем серию исчезновений.' },
  { id:'p03', imgKey:'img12', title:'Проект Charlie',  type:'film',   genre:'исторический', budget:600, revenue:1400, irr:26, stage:'pre-production',  release:2028, synopsis:'Эпическая драма о знаковом событии российской истории XX века.' },
  { id:'p04', imgKey:'img13', title:'Проект Delta',    type:'series', genre:'premium-драма',budget:520, revenue:1250, irr:24, stage:'production',      release:2028, synopsis:'Сериал о династии российских промышленников и их наследии.' },
  { id:'p05', imgKey:'img14', title:'Проект Echo',     type:'film',   genre:'семейный',     budget:180, revenue:520,  irr:30, stage:'post-production', release:2027, synopsis:'Семейная комедия-приключение на фоне путешествия по России.' },
  { id:'p06', imgKey:'img15', title:'Проект Foxtrot',  type:'series', genre:'жанровый',     budget:420, revenue:980,  irr:22, stage:'pre-production',  release:2028, synopsis:'Жанровый сериал в стиле современного нуара.' },
  { id:'p07', imgKey:'img16', title:'Проект Golf',     type:'film',   genre:'авторский',    budget:270, revenue:650,  irr:25, stage:'development',     release:2029, synopsis:'Авторское кино о поколении миллениалов в крупных российских городах.' }
];

const OPS_STEPS = [
  { id:'scouting', iconKey:'fileText', title:'Scouting', brief:'Анализ рынка и trend-drivers',
    detail:'Анализ 300+ сценариев в год. Источники: фестивали (Кинотавр, Ко8, Движение), ВГИК/ГИТР, запросы от OTT-партнёров (Кинопоиск, Okko, Wink, IVI). Criteria: trend-fit, genre-demand, casting-feasibility, budget-range.' },
  { id:'dd', iconKey:'checkCircle', title:'Due Diligence', brief:'Creative/financial/legal',
    detail:'3 недели, 5 экспертов. Creative expertise (жанр, структура, пакет актёров). Financial (budget validation, cash-flow, break-even). Legal (IP-rights, контракты, compliance). Deliverables: green-light memo для инвесткомитета.' },
  { id:'dev', iconKey:'lightbulb', title:'Development', brief:'Script & budget lock',
    detail:'Script lock с final draft scenario. Cast attachments (leads + key supporting). Budget lock с ±5% tolerance. Cash call schedule для фонда. 2-6 месяцев от greenlight до production start.' },
  { id:'prod', iconKey:'video', title:'Production', brief:'Съёмочный период',
    detail:'3-6 месяцев съёмок. Weekly cost-review (budget vs actual, gate-review по превышению). Monthly dashboards для фонда: progress, cost, risk flags. Insurance покрытие по стандартам industry.' },
  { id:'md', iconKey:'megaphone', title:'Marketing & Distribution', brief:'OTT/theatrical window',
    detail:'Window planning: theatrical (3 мес) → OTT (12 мес) → TV (24 мес) → educational/B2B. Partnerships с Кинопоиск/Okko/Wink. International sales через агентов (selective Netflix, Azia/BRICS markets). Marketing spend 15-20% от production budget.' },
  { id:'exit', iconKey:'trendingUp', title:'Exit / IP Monetization', brief:'Library & remake rights',
    detail:'Library sales (long-tail catalog). Remake rights для международных рынков. Sequel options (если performance hit). Perpetual IP для franchise-development. Exits 5-7 лет от release.' }
];

// Добавляем 5 новых иконок (trendingUp уже в W1 ICONS, остальные добавляем).
// Используем Object.assign вместо прямого присваивания, чтобы не перезаписать существующие.
Object.assign(ICONS, {
  fileText:    <React.Fragment><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></React.Fragment>,
  checkCircle: <React.Fragment><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></React.Fragment>,
  lightbulb:   <React.Fragment><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.77.77 1.24 1.52 1.41 2.5"/></React.Fragment>,
  video:       <React.Fragment><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8z"/></React.Fragment>,
  megaphone:   <React.Fragment><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></React.Fragment>,
  trendingUp:  ICONS.trendingUp || <React.Fragment><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></React.Fragment>
});

// ========================================================================
// s07 — PIPELINE (TiltCard 3D + Modal «для вашего фонда»)
// ========================================================================

function TiltCard({ children, onClick }) {
  const ref = useRef(null);
  const [rot, setRot] = useState({ rx: 0, ry: 0 });
  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setRot({ rx: y * -8, ry: x * 8 });
  };
  const reset = () => setRot({ rx: 0, ry: 0 });
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); }
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
      style={{
        transform: `perspective(1000px) rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
        transition: (rot.rx === 0 && rot.ry === 0)
          ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'none',
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}

function PipelineSection() {
  const [filter, setFilter] = useState('Все');
  const [modalProject, setModalProject] = useState(null);

  const filtered = PIPELINE.filter(p =>
    filter === 'Все' ||
    (filter === 'Фильмы'  && p.type === 'film') ||
    (filter === 'Сериалы' && p.type === 'series')
  );

  useEffect(() => {
    if (!modalProject) return;
    const onKey = (e) => { if (e.key === 'Escape') setModalProject(null); };
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
    <section id="s07" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0 }}>
            Портфельные проекты
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            7 проектов, 2&nbsp;620 млн ₽ production budget, 4 жанра — target для вашего фонда
          </p>
        </Reveal>

        {/* Filter chips */}
        <Reveal delay={200}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, marginBottom: 48, flexWrap: 'wrap' }}>
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
                    boxShadow: active ? '0 0 16px rgba(244,162,97,0.4)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <TiltCard onClick={() => setModalProject(p)}>
                <article
                  className="card-hover glass"
                  aria-label={`${p.title} — ${p.type}, ${p.genre}`}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid #2A2D31',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', borderRadius: 10 }}>
                    <img
                      src={posterSrc(p.imgKey)}
                      alt={p.synopsis.slice(0, 60)}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 50%, rgba(11,13,16,0.9) 100%)',
                      pointerEvents: 'none'
                    }}/>
                    <div style={{
                      position: 'absolute',
                      bottom: 8, right: 8,
                      background: 'rgba(244,162,97,0.92)',
                      color: '#0B0D10',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      {p.stage}
                    </div>
                  </div>
                  <div style={{ padding: '12px 4px 4px' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#EAEAEA', fontFamily: "'Playfair Display'" }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 4, textTransform: 'capitalize' }}>
                      {p.type} · {p.genre}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
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
            aria-labelledby="project-modal-title"
            onClick={() => setModalProject(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
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
                boxShadow: '0 24px 72px rgba(0,0,0,0.8)'
              }}
            >
              <button
                onClick={() => setModalProject(null)}
                aria-label="Закрыть"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  background: 'none',
                  border: 'none',
                  color: '#8E8E93',
                  fontSize: 28,
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'start' }}>
                <img
                  src={posterSrc(modalProject.imgKey)}
                  alt={modalProject.synopsis.slice(0, 60)}
                  style={{
                    width: 180,
                    height: 270,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: '1px solid #F4A261'
                  }}
                />
                <div>
                  <h3
                    id="project-modal-title"
                    style={{ fontSize: 28, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0 }}
                  >
                    {modalProject.title}
                  </h3>
                  <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 6, textTransform: 'capitalize' }}>
                    {modalProject.type} · {modalProject.genre} · Release {modalProject.release}
                  </div>
                  <p style={{ color: '#EAEAEA', lineHeight: 1.6, marginTop: 16 }}>
                    {modalProject.synopsis}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                    <div>
                      <span style={{ color: '#8E8E93', fontSize: 12 }}>Production budget:</span>
                      <div style={{ fontSize: 20, color: '#F4A261', fontFamily: "'Playfair Display'" }}>
                        {modalProject.budget} млн ₽
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#8E8E93', fontSize: 12 }}>Target revenue:</span>
                      <div style={{ fontSize: 20, color: '#2A9D8F', fontFamily: "'Playfair Display'" }}>
                        {modalProject.revenue} млн ₽
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#8E8E93', fontSize: 12 }}>Target IRR:</span>
                      <div style={{ fontSize: 20, color: '#EAEAEA' }}>{modalProject.irr}%</div>
                    </div>
                    <div>
                      <span style={{ color: '#8E8E93', fontSize: 12 }}>Stage:</span>
                      <div style={{ fontSize: 14, color: '#EAEAEA', textTransform: 'capitalize' }}>
                        {modalProject.stage}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 20,
                    padding: 16,
                    background: 'rgba(244,162,97,0.08)',
                    borderRadius: 8,
                    border: '1px solid rgba(244,162,97,0.3)'
                  }}>
                    <div style={{
                      fontSize: 12, color: '#F4A261', textTransform: 'uppercase',
                      letterSpacing: 1, fontWeight: 600
                    }}>
                      Как участвует ваш фонд
                    </div>
                    <div style={{ color: '#EAEAEA', marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>
                      Ваш фонд-партнёр как anchor LP получает pro-rata долю этого проекта в общем портфельном distribution.
                      При commitment {Math.round(modalProject.budget * 3000 / 2620)} млн в общий vehicle ≈ полное покрытие
                      production budget данного проекта.
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
// s09 / s10 — TEAM & ADVISORY (2-state expand card + gradient-border)
// ========================================================================

function TeamGrid({ members, label, sepia = false, scale = 1 }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveId(null); };
    const onDoc = (e) => {
      // Клик вне любой карточки — закрыть. Проверяем data-attr.
      const target = e.target;
      if (target && target.closest && target.closest('[data-teamcard="true"]')) return;
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
      case 'img01': return '__IMG_PLACEHOLDER_img01__';
      case 'img02': return '__IMG_PLACEHOLDER_img02__';
      case 'img03': return '__IMG_PLACEHOLDER_img03__';
      case 'img04': return '__IMG_PLACEHOLDER_img04__';
      case 'img05': return '__IMG_PLACEHOLDER_img05__';
      case 'img06': return '__IMG_PLACEHOLDER_img06__';
      case 'img07': return '__IMG_PLACEHOLDER_img07__';
      case 'img08': return '__IMG_PLACEHOLDER_img08__';
      case 'img09': return '__IMG_PLACEHOLDER_img09__';
      default: return '';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${Math.round(180 * scale)}px, 1fr))`,
        gap: 20
      }}>
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
                aria-label={`${m.role}${m.name ? ' — ' + m.name : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveId(isActive ? null : m.id); }}
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
                    'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), ' +
                    'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), ' +
                    'box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 20px 60px rgba(0,0,0,0.7)' : 'none',
                  borderRadius: 14
                }}
              >
                <div style={{
                  padding: 3,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #F4A261, #2A9D8F)'
                }}>
                  <div style={{
                    position: 'relative',
                    background: '#15181C',
                    borderRadius: 11,
                    overflow: 'hidden'
                  }}>
                    <img
                      src={portraitSrc(m.id)}
                      alt={m.alt}
                      loading="lazy"
                      style={{
                        width: '100%',
                        aspectRatio: '4/5',
                        objectFit: 'cover',
                        display: 'block',
                        filter: sepia ? 'sepia(0.35) contrast(0.95)' : 'none'
                      }}
                    />
                    {/* Inner vignette */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(11,13,16,0.5) 100%)',
                      pointerEvents: 'none'
                    }}/>
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      padding: 12,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(11,13,16,0.95) 100%)'
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#EAEAEA' }}>{m.role}</div>
                      <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>
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
                      animation: 'fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: '#EAEAEA', fontFamily: "'Playfair Display'"
                    }}>
                      {m.name || m.role}
                    </div>
                    <div style={{ fontSize: 12, color: '#F4A261', marginTop: 4 }}>
                      {m.title || label}
                    </div>
                    <ul style={{
                      marginTop: 12, paddingLeft: 16, fontSize: 13, color: '#8E8E93', lineHeight: 1.6
                    }}>
                      {m.bio.map((b) => (
                        <li key={b} style={{ marginBottom: 4 }}>{b}</li>
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
                          textDecoration: 'underline'
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
    <section id="s09" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{
            fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0
          }}>
            Команда
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            5 core-ролей с institutional track-record
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 8 }}>
            Клик на портрет → bio и LinkedIn
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div style={{ marginTop: 48 }}>
            <TeamGrid members={TEAM} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AdvisorySection() {
  return (
    <section id="s10" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{
            fontFamily: "'Playfair Display'", fontSize: 44, color: '#EAEAEA', textAlign: 'center', margin: 0
          }}>
            Экспертный совет
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            4 советника institutional-level
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ marginTop: 48 }}>
            <TeamGrid members={ADVISORY} sepia={true} scale={0.85} label="Advisor" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// s11 — OPERATIONS 6-step (circle nav + click-expand deep lane)
// ========================================================================

function OperationsSection() {
  const [expandedId, setExpandedId] = useState(null);
  const active = expandedId ? OPS_STEPS.find((x) => x.id === expandedId) : null;

  return (
    <section id="s11" style={{ padding: '96px 24px', background: '#0F1216' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{
            fontFamily: "'Playfair Display'", fontSize: 48, color: '#EAEAEA', textAlign: 'center', margin: 0
          }}>
            6-step process
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 18 }}>
            От scouting до exit — institutional-pipeline холдинга
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ textAlign: 'center', color: '#F4A261', fontSize: 13, marginTop: 16 }}>
            Клик на шаг → детали процесса
          </p>
        </Reveal>

        {/* Step circles horizontal */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48
        }}>
          {OPS_STEPS.map((s, i) => {
            const isActive = expandedId === s.id;
            return (
              <Reveal key={s.id} delay={i * 120}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  aria-controls="ops-detail-lane"
                  onClick={() => setExpandedId(isActive ? null : s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(isActive ? null : s.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    minWidth: 140,
                    padding: 16,
                    animation: `fade-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 120}ms both`
                  }}
                >
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: isActive ? 'rgba(244,162,97,0.25)' : 'rgba(244,162,97,0.08)',
                    border: `2px solid ${isActive ? '#F4A261' : 'rgba(244,162,97,0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isActive ? '0 0 32px rgba(244,162,97,0.5)' : 'none'
                  }}>
                    <Icon path={ICONS[s.iconKey]} size={28} color="#F4A261" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#EAEAEA', textAlign: 'center' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#8E8E93', textAlign: 'center', maxWidth: 120 }}>
                    {s.brief}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Expanded detail lane */}
        {active && (
          <div
            id="ops-detail-lane"
            className="glass"
            style={{
              marginTop: 32,
              padding: 32,
              borderRadius: 14,
              border: '1px solid #F4A261',
              animation: 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              maxWidth: 900,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <Icon path={ICONS[active.iconKey]} size={28} color="#F4A261" />
              <h3 style={{
                fontSize: 24, fontFamily: "'Playfair Display'", color: '#EAEAEA', margin: 0
              }}>
                {active.title}
              </h3>
            </div>
            <p style={{ color: '#EAEAEA', lineHeight: 1.7, fontSize: 15, margin: 0 }}>
              {active.detail}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================================================
// ROOT APP W3
// ========================================================================

function App_W3() {
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
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        {/* s08 removed per v2.1 §2 — production planning moved to Roadmap s13 (W4) */}
      </main>
      <FooterStub />
    </>
  );
}
