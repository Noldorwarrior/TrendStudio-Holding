// ==== Wave 3: s07 Pipeline + s08 Stages + s09 Team + s10 Advisory + s11 Operations ====

// — EXTEND ICONS from W1 with lucide paths needed for s11 —
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
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
});

// — IMAGE SRC MAP (literal placeholders so inject_images.py regex can replace them pre-runtime) —
const IMG_SRC = {
  img01: '__IMG_PLACEHOLDER_img01__',
  img02: '__IMG_PLACEHOLDER_img02__',
  img03: '__IMG_PLACEHOLDER_img03__',
  img04: '__IMG_PLACEHOLDER_img04__',
  img05: '__IMG_PLACEHOLDER_img05__',
  img06: '__IMG_PLACEHOLDER_img06__',
  img07: '__IMG_PLACEHOLDER_img07__',
  img08: '__IMG_PLACEHOLDER_img08__',
  img09: '__IMG_PLACEHOLDER_img09__',
  img10: '__IMG_PLACEHOLDER_img10__',
  img11: '__IMG_PLACEHOLDER_img11__',
  img12: '__IMG_PLACEHOLDER_img12__',
  img13: '__IMG_PLACEHOLDER_img13__',
  img14: '__IMG_PLACEHOLDER_img14__',
  img15: '__IMG_PLACEHOLDER_img15__',
  img16: '__IMG_PLACEHOLDER_img16__',
};

// — CANON DATA (W3) —

const TEAM = [
  { id: 'img01', role: 'CEO', title: 'Chief Executive Officer', bio: '20+ лет в продюсировании', track: ['12 релизов', '3 фестиваля', '2 OTT-оригинала'], alt: 'Портрет CEO ТрендСтудио Холдинг' },
  { id: 'img02', role: 'Producer Lead', title: 'Head of Production', bio: 'Продюсер полного цикла', track: ['18 проектов', 'Cannes DF', 'Кинотавр'], alt: 'Портрет главного продюсера' },
  { id: 'img03', role: 'CFO', title: 'Chief Financial Officer', bio: '15+ лет finance & M&A', track: ['5 закрытых фондов', 'IPO опыт', 'Big-4 background'], alt: 'Портрет финансового директора' },
  { id: 'img04', role: 'Head of Distribution', title: 'Head of Distribution & IP', bio: 'Выстраивал OTT-pipeline РФ', track: ['Lead deals', 'Кинопоиск HD', 'IVI'], alt: 'Портрет главы дистрибуции' },
  { id: 'img05', role: 'Creative Director', title: 'Creative Director', bio: 'Креативная курация и development', track: ['12 проектов', '3 награды'], alt: 'Портрет креативного директора' },
];

const ADVISORY = [
  { id: 'img06', role: 'Senior Industry Advisor', bio: '40+ лет в индустрии, экс-CEO киноконцерна', focus: ['industry_relations', 'strategy'], alt: 'Портрет члена экспертного совета — ветерана индустрии' },
  { id: 'img07', role: 'Finance Advisor', bio: 'Экс-партнёр PE, fund structuring', focus: ['fund_structuring', 'lp_relations'], alt: 'Портрет финансового советника' },
  { id: 'img08', role: 'Distribution Advisor', bio: 'Экс-руководитель OTT, original content', focus: ['ott_strategy', 'curation'], alt: 'Портрет советника по дистрибуции' },
  { id: 'img09', role: 'International Advisor', bio: 'International sales, festivals, pre-sales', focus: ['international', 'festivals'], alt: 'Портрет международного советника' },
];

const PIPELINE = [
  { id: 'p01', img: 'img10', title: 'Проект Alpha',    type: 'film',   genre: 'драма',         budget: 350, revenue: 850,  irr: 28, status: 'production',      release: 2027, alt: 'Постер проекта Alpha — драма' },
  { id: 'p02', img: 'img11', title: 'Проект Bravo',    type: 'film',   genre: 'триллер',       budget: 280, revenue: 720,  irr: 32, status: 'pre-production',  release: 2027, alt: 'Постер проекта Bravo — триллер' },
  { id: 'p03', img: 'img12', title: 'Проект Charlie',  type: 'film',   genre: 'исторический',  budget: 600, revenue: 1400, irr: 26, status: 'pre-production',  release: 2028, alt: 'Постер проекта Charlie — исторический' },
  { id: 'p04', img: 'img13', title: 'Проект Delta',    type: 'series', genre: 'premium-драма', budget: 520, revenue: 1250, irr: 24, status: 'production',      release: 2028, alt: 'Постер проекта Delta — premium-драма (сериал)' },
  { id: 'p05', img: 'img14', title: 'Проект Echo',     type: 'film',   genre: 'семейный',      budget: 180, revenue: 520,  irr: 30, status: 'post-production', release: 2027, alt: 'Постер проекта Echo — семейный фильм' },
  { id: 'p06', img: 'img15', title: 'Проект Foxtrot',  type: 'series', genre: 'жанровый',      budget: 420, revenue: 980,  irr: 22, status: 'pre-production',  release: 2028, alt: 'Постер проекта Foxtrot — жанровый сериал' },
  { id: 'p07', img: 'img16', title: 'Проект Golf',     type: 'film',   genre: 'авторский',     budget: 270, revenue: 650,  irr: 25, status: 'development',     release: 2029, alt: 'Постер проекта Golf — авторский фильм' },
];

const OPS_STEPS = [
  { id: 1, iconKey: 'fileText',    title: 'Scouting',                 text: 'Анализ рынка, оценка trend-drivers' },
  { id: 2, iconKey: 'checkCircle', title: 'Due Diligence',            text: 'Creative/financial/legal проверка' },
  { id: 3, iconKey: 'lightbulb',   title: 'Development',              text: 'Script, budget lock, cast/crew attachments' },
  { id: 4, iconKey: 'video',       title: 'Production',               text: 'Съёмочный период, weekly cost-review' },
  { id: 5, iconKey: 'megaphone',   title: 'Marketing & Distribution', text: 'OTT/theatrical window planning' },
  { id: 6, iconKey: 'trendingUp',  title: 'Exit / IP Monetization',   text: 'Библиотека прав, повторная продажа' },
];

// — s07 PIPELINE with Filter Chips + Modal —

function PipelineCard({ p, onClick, delay }) {
  return (
    <Reveal delay={delay}>
      <figure
        className="card-hover pipeline-card"
        role="button"
        tabIndex={0}
        aria-label={`Открыть детали: ${p.title}`}
        onClick={() => onClick(p)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(p); } }}
        style={{
          background: '#15181C',
          border: '1px solid #2A2D31',
          borderRadius: 12,
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
          <img
            src={IMG_SRC[p.img]}
            alt={p.alt}
            width="1200"
            height="1800"
            loading="lazy"
            className="w-full object-cover pipeline-img"
            style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <figcaption style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#EAEAEA', marginBottom: 6 }}>
            {p.title}
          </div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 8 }}>
            {p.genre} · {p.type === 'film' ? 'фильм' : 'сериал'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#F4A261', fontWeight: 600 }}>
              {p.budget} млн ₽
            </span>
            <span style={{ fontSize: 12, color: '#2A9D8F', fontWeight: 600 }}>
              IRR {p.irr}%
            </span>
          </div>
        </figcaption>
      </figure>
    </Reveal>
  );
}

function PipelineModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  if (!project) return null;
  const p = project;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipeline-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'modal-fade 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#15181C',
          border: '1px solid #2A2D31',
          borderRadius: 16,
          padding: 32,
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: '1px solid #2A2D31',
            color: '#EAEAEA',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease-out, color 0.2s ease-out'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; e.currentTarget.style.color = '#F4A261'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; e.currentTarget.style.color = '#EAEAEA'; }}
        >
          <Icon path={ICONS.close} size={18} />
        </button>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(160px, 200px) 1fr',
            gap: 24,
            alignItems: 'start'
          }}
        >
          <img
            src={IMG_SRC[p.img]}
            alt={p.alt}
            width="1200"
            height="1800"
            loading="lazy"
            style={{
              width: '100%',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: 12,
              display: 'block'
            }}
          />
          <div>
            <h3
              id="pipeline-modal-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                margin: '0 0 12px',
                color: '#EAEAEA'
              }}
            >
              {p.title}
            </h3>
            <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 20 }}>
              {p.genre} · {p.type === 'film' ? 'полнометражный фильм' : 'сериал'} · релиз {p.release}
            </div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              <div>
                <dt style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Production budget</dt>
                <dd style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F4A261' }}>{p.budget} млн ₽</dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Target revenue</dt>
                <dd style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#EAEAEA' }}>{p.revenue} млн ₽</dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Target IRR</dt>
                <dd style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#2A9D8F' }}>{p.irr}%</dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Stage</dt>
                <dd style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#EAEAEA', textTransform: 'capitalize' }}>{p.status}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F4A261',
              color: '#0B0D10',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-out'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Закрыть
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
        .pipeline-card:hover .pipeline-img { transform: scale(1.05); }
        .pipeline-img { transition: transform 0.3s ease-out; }
      `}</style>
    </div>
  );
}

function PipelineSection() {
  const [filter, setFilter] = useState('Все');
  const [modalProject, setModalProject] = useState(null);

  const filters = [
    { id: 'Все',      test: () => true },
    { id: 'Фильмы',   test: (p) => p.type === 'film' },
    { id: 'Сериалы',  test: (p) => p.type === 'series' },
  ];
  const activeFilter = filters.find((f) => f.id === filter) || filters[0];
  const visible = PIPELINE.filter(activeFilter.test);

  return (
    <section
      id="s07"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            Портфельные проекты
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 32px',
              lineHeight: 1.6
            }}
          >
            7 проектов, 2 620 млн ₽ production budget, 9 жанров.
          </p>
        </Reveal>

        {/* Filter chips */}
        <Reveal delay={200}>
          <div
            role="group"
            aria-label="Фильтр проектов по типу"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 40,
              flexWrap: 'wrap'
            }}
          >
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    background: active ? '#F4A261' : 'transparent',
                    color: active ? '#0B0D10' : '#EAEAEA',
                    border: `1px solid ${active ? '#F4A261' : '#2A2D31'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = '#F4A261'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = '#2A2D31'; }}
                >
                  {f.id}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24
          }}
        >
          {visible.map((p, i) => (
            <PipelineCard key={p.id} p={p} onClick={setModalProject} delay={i * 80} />
          ))}
        </div>

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8E8E93', marginTop: 40 }}>
            Нет проектов по выбранному фильтру.
          </p>
        )}
      </div>

      <PipelineModal project={modalProject} onClose={() => setModalProject(null)} />
    </section>
  );
}

// — s08 STAGES (Kanban 4 columns) —

const STAGE_COLUMNS = [
  { id: 'development',     label: 'Development',      num: '01', match: (p) => p.status === 'development' },
  { id: 'pre-production',  label: 'Pre-production',   num: '02', match: (p) => p.status === 'pre-production' },
  { id: 'production',      label: 'Production',       num: '03', match: (p) => p.status === 'production' },
  { id: 'post-release',    label: 'Post / Release',   num: '04', match: (p) => p.status === 'post-production' || p.status === 'release' },
];

function StagesSection() {
  return (
    <section
      id="s08"
      style={{ padding: '96px 24px', background: 'linear-gradient(180deg, #0F1216 0%, #0B0D10 100%)', position: 'relative' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            Производственные стадии
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
            Распределение 7 проектов по статусам (live pipeline-view).
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16
          }}
        >
          {STAGE_COLUMNS.map((col, i) => {
            const items = PIPELINE.filter(col.match);
            const word = items.length === 1 ? 'проект' : (items.length >= 2 && items.length <= 4 ? 'проекта' : 'проектов');
            return (
              <Reveal key={col.id} delay={i * 100}>
                <div
                  style={{
                    background: 'rgba(21,24,28,0.6)',
                    border: '1px solid #2A2D31',
                    borderRadius: 12,
                    padding: 20,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#F4A261',
                        lineHeight: 1
                      }}
                    >
                      {col.num}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#EAEAEA' }}>
                      {col.label}
                    </span>
                  </div>
                  <div
                    aria-label={`${items.length} ${word}`}
                    style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      background: 'rgba(244,162,97,0.12)',
                      color: '#F4A261',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 16
                    }}
                  >
                    {items.length} {word}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((p, j) => (
                      <Reveal key={p.id} delay={j * 60}>
                        <div
                          className="card-hover"
                          style={{
                            background: '#15181C',
                            border: '1px solid #2A2D31',
                            borderRadius: 8,
                            padding: '12px 14px'
                          }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#EAEAEA', marginBottom: 2 }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#F4A261' }}>
                            {p.budget} млн ₽
                          </div>
                        </div>
                      </Reveal>
                    ))}
                    {items.length === 0 && (
                      <div style={{ fontSize: 12, color: '#8E8E93', fontStyle: 'italic' }}>
                        Пусто
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// — s09 TEAM —

function TeamSection() {
  return (
    <section
      id="s09"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            Команда
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 56px',
              lineHeight: 1.6
            }}
          >
            5 core-ролей с institutional track-record.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24
          }}
        >
          {TEAM.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <figure
                className="card-hover"
                style={{
                  padding: 16,
                  background: '#15181C',
                  borderRadius: 12,
                  border: '1px solid #2A2D31',
                  margin: 0,
                  height: '100%'
                }}
              >
                <img
                  src={IMG_SRC[p.id]}
                  alt={p.alt}
                  width="800"
                  height="1000"
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 5',
                    objectFit: 'cover',
                    borderRadius: 8,
                    display: 'block'
                  }}
                />
                <figcaption style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 700, color: '#EAEAEA', fontSize: 15 }}>
                    {p.role}
                  </div>
                  <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#EAEAEA', marginTop: 10, lineHeight: 1.4 }}>
                    {p.bio}
                  </div>
                  <ul style={{ fontSize: 11, color: '#8E8E93', marginTop: 10, listStyle: 'none', padding: 0 }}>
                    {p.track.map((t) => (
                      <li key={t} style={{ marginBottom: 3 }}>• {t}</li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// — s10 ADVISORY BOARD —

function AdvisorySection() {
  return (
    <section
      id="s10"
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
            Экспертный совет
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 56px',
              lineHeight: 1.6
            }}
          >
            4 советника institutional-level.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32
          }}
        >
          {ADVISORY.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <figure
                className="card-hover advisory-card"
                style={{
                  padding: 20,
                  background: '#15181C',
                  borderRadius: 12,
                  border: '1px solid #2A2D31',
                  margin: 0,
                  height: '100%'
                }}
              >
                <img
                  src={IMG_SRC[p.id]}
                  alt={p.alt}
                  width="800"
                  height="1000"
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 5',
                    objectFit: 'cover',
                    borderRadius: 8,
                    display: 'block',
                    filter: 'sepia(0.25) contrast(0.95)'
                  }}
                />
                <figcaption style={{ marginTop: 14, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#EAEAEA', fontSize: 14 }}>
                    {p.role}
                  </div>
                  <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 6, lineHeight: 1.5 }}>
                    {p.bio}
                  </div>
                  <ul style={{ fontSize: 11, color: '#F4A261', marginTop: 10, listStyle: 'none', padding: 0, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {p.focus.map((t) => (
                      <li
                        key={t}
                        style={{
                          border: '1px solid rgba(244,162,97,0.3)',
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: 10
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .advisory-card { transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.2s ease-out; }
        .advisory-card:hover { transform: translateY(-4px) rotate(2deg); box-shadow: 0 16px 40px rgba(0,0,0,0.5); border-color: #F4A261; }
      `}</style>
    </section>
  );
}

// — s11 OPERATIONS (6-step SVG process) —

function OperationsSection() {
  return (
    <section
      id="s11"
      style={{ padding: '96px 24px', background: '#0B0D10', position: 'relative' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            6-step process
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 64px',
              lineHeight: 1.6
            }}
          >
            Institutional pipeline от scouting до exit.
          </p>
        </Reveal>

        <div className="ops-flow">
          {OPS_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <Reveal delay={i * 120}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0 8px'
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(244,162,97,0.12)',
                      border: '2px solid #F4A261',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F4A261',
                      marginBottom: 16,
                      transition: 'transform 0.2s ease-out, background 0.2s ease-out'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = 'rgba(244,162,97,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(244,162,97,0.12)'; }}
                  >
                    <Icon path={ICONS[s.iconKey]} size={26} strokeWidth={2} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#EAEAEA', fontSize: 15, marginBottom: 6 }}>
                    {i + 1}. {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.5, maxWidth: 170 }}>
                    {s.text}
                  </div>
                </div>
              </Reveal>
              {i < OPS_STEPS.length - 1 && (
                <div className="ops-arrow" aria-hidden="true" style={{ color: '#8E8E93', display: 'flex', alignItems: 'flex-start', paddingTop: 20 }}>
                  <Icon path={ICONS.chevronRight} size={24} strokeWidth={2} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <style>{`
        .ops-flow {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px 12px;
          align-items: start;
        }
        .ops-flow > .ops-arrow { display: none; }
        @media (min-width: 900px) {
          .ops-flow {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0;
          }
          .ops-flow > .ops-arrow { display: flex; flex: 0 0 auto; }
        }
      `}</style>
    </section>
  );
}

// — APP W3 —

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
        <MonteCarloSection />
        <PipelineSection />
        <StagesSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
      </main>
      <FooterStub />
    </>
  );
}
