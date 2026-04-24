// ==== Wave 1: Foundation + s00-s03 ====

// — FOUNDATION HOOKS & COMPONENTS —

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { setVisible(true); return; }
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ delay = 0, as = 'div', className = '', style = {}, children, ...rest }) {
  const [ref, visible] = useReveal();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
        ...style
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Tooltip({ explanation, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', borderBottom: '1px dotted #8E8E93', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      aria-describedby="tt"
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
            background: '#15181C', border: '1px solid #2A2D31', padding: '8px 12px', borderRadius: 6,
            width: 280, fontSize: 13, color: '#EAEAEA', zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)', fontWeight: 400, lineHeight: 1.5,
            whiteSpace: 'normal', textAlign: 'left'
          }}
        >
          {explanation}
        </span>
      )}
    </span>
  );
}

function CountUp({ end, duration = 1500, decimals = null, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(end); return; }
    const start = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible, end, duration]);
  const fmt = decimals !== null
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString('ru-RU');
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
}

function Icon({ path, size = 20, color = 'currentColor', strokeWidth = 2, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const ICONS = {
  trendingUp: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  sparkles: (
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  ),
  chevronDown: <polyline points="6 9 12 15 18 9" />,
};

// — NAV DATA —

const NAV_LINKS = [
  { id: 's01', label: 'Hero' },
  { id: 's02', label: 'Тезис' },
  { id: 's03', label: 'Рынок' },
  { id: 's04', label: 'Экономика' },
  { id: 's07', label: 'Пайплайн' },
  { id: 's09', label: 'Команда' },
  { id: 's12', label: 'Риски' },
  { id: 's19', label: 'Распределение' },
  { id: 's22', label: 'Контакты' },
];

// — SECTION COMPONENTS —

function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      setW(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div className="scroll-progress" style={{ width: `${w}%` }} aria-hidden="true" />;
}

function TopNav() {
  const [lang, setLang] = useState('RU');
  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,13,16,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2A2D31'
      }}
      aria-label="Основная навигация"
    >
      <div
        style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}
      >
        <a
          href="#s01"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700, color: '#EAEAEA',
            textDecoration: 'none', letterSpacing: 0.3
          }}
        >
          ТрендСтудио
        </a>
        <ul
          style={{
            display: 'flex', gap: 22, listStyle: 'none', margin: 0, padding: 0,
            flexWrap: 'wrap'
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                style={{
                  color: '#EAEAEA', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  transition: 'color 0.2s ease-out'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#EAEAEA')}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Язык интерфейса">
          {['RU', 'EN'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 13, fontWeight: 600,
                background: lang === code ? '#F4A261' : 'transparent',
                color: lang === code ? '#0B0D10' : '#EAEAEA',
                border: `1px solid ${lang === code ? '#F4A261' : '#2A2D31'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      id="s01"
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src="__IMG_PLACEHOLDER_img19__"
        alt="Hero-фон ТрендСтудио Холдинг — кинематографический ландшафт заката"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45 }}
      />
      <img
        src="__IMG_PLACEHOLDER_img20__"
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-1/3 object-cover"
        style={{ opacity: 0.3, mixBlendMode: 'screen' }}
      />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, rgba(11,13,16,0.2) 0%, rgba(11,13,16,0.85) 100%)'
        }}
      />
      <div
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1100, padding: '120px 24px 160px',
          textAlign: 'center', width: '100%'
        }}
      >
        <Reveal delay={0}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(56px, 8vw, 96px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
              color: '#EAEAEA'
            }}
          >
            ТрендСтудио
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p
            style={{
              marginTop: 28,
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              lineHeight: 1.5,
              color: '#EAEAEA',
              maxWidth: 820,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            LP-фонд российского кино. <strong style={{ color: '#F4A261' }}>3 000 млн ₽</strong> на <strong style={{ color: '#F4A261' }}>7 лет</strong>. Целевая IRR <strong style={{ color: '#F4A261' }}>20–25%</strong>.
          </p>
        </Reveal>
        <Reveal delay={400}>
          <div
            style={{
              marginTop: 40,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              maxWidth: 820,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: '#F4A261' }}>
                <CountUp end={3000} /> <span style={{ fontSize: 18, color: '#EAEAEA' }}>млн ₽</span>
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>целевой размер</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: '#F4A261' }}>
                <CountUp end={7} /> <span style={{ fontSize: 18, color: '#EAEAEA' }}>лет</span>
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>горизонт</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: '#F4A261' }}>
                <CountUp end={20.09} decimals={2} suffix="%" />
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>IRR (public)</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={600}>
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <a
              href="#s22"
              style={{
                background: '#F4A261',
                color: '#0B0D10',
                padding: '14px 28px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
                transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                boxShadow: '0 8px 24px rgba(244,162,97,0.35)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Запросить LP-пакет
            </a>
            <a
              href="#s22"
              style={{
                background: 'transparent',
                color: '#EAEAEA',
                padding: '14px 28px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
                border: '1px solid #2A2D31',
                transition: 'border-color 0.2s ease-out, color 0.2s ease-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F4A261';
                e.currentTarget.style.color = '#F4A261';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2D31';
                e.currentTarget.style.color = '#EAEAEA';
              }}
            >
              Скачать memo
            </a>
          </div>
        </Reveal>
      </div>
      <a
        href="#s02"
        aria-label="Перейти к следующей секции"
        className="bounce-y"
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          color: '#F4A261',
          textDecoration: 'none'
        }}
      >
        <Icon path={ICONS.chevronDown} size={36} strokeWidth={2} />
      </a>
    </section>
  );
}

function ThesisCard({ iconPath, title, text }) {
  return (
    <div
      className="card-hover"
      style={{
        background: '#15181C',
        border: '1px solid #2A2D31',
        borderRadius: 16,
        padding: 32,
        height: '100%'
      }}
    >
      <div
        style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(244,162,97,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          color: '#F4A261'
        }}
      >
        <Icon path={iconPath} size={24} />
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 24, fontWeight: 700,
          margin: '0 0 12px', color: '#EAEAEA'
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: '#EAEAEA', margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function ThesisSection() {
  const cards = [
    {
      icon: ICONS.trendingUp,
      title: 'Рост рынка',
      text: 'Российский бокс-офис восстанавливается темпами +18–22% г/г, OTT-платформы показывают двузначный рост подписок. Государственная поддержка закрывает до 40% бюджетов через ФПРК и Минкульт.'
    },
    {
      icon: ICONS.shield,
      title: 'Институциональная дисциплина',
      text: 'Классическая LP/GP-структура с hurdle 8% и catch-up. Финмодель прошла 348 автоматических тестов, invariants-check и Монте-Карло по 10 000 итераций на каждый сценарий.'
    },
    {
      icon: ICONS.sparkles,
      title: 'Портфельный подход',
      text: '7 проектов 2026–2028 в жанрах драма, комедия, триллер, семейное кино. Диверсификация по каналам: театральный прокат, OTT, ТВ, международные продажи. Нет ставки на один хит.'
    }
  ];
  return (
    <section
      id="s02"
      style={{
        padding: '96px 24px',
        background: '#0B0D10',
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
            Почему ТрендСтудио
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93',
              fontSize: 18, maxWidth: 720, margin: '0 auto 56px', lineHeight: 1.6
            }}
          >
            Три принципа, на которых построен фонд.
          </p>
        </Reveal>
        <div
          className="grid md:grid-cols-3 gap-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32
          }}
        >
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 120}>
              <ThesisCard iconPath={c.icon} title={c.title} text={c.text} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketKpi({ label, end, suffix = '', decimals = null }) {
  return (
    <div
      className="card-hover"
      style={{
        background: 'rgba(21,24,28,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid #2A2D31',
        borderRadius: 16,
        padding: 28,
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40, fontWeight: 700,
          color: '#F4A261',
          lineHeight: 1.1
        }}
      >
        <CountUp end={end} suffix={suffix} decimals={decimals} />
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: '#8E8E93', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function MarketSection() {
  const kpis = [
    { label: 'Рынок BO 2025', end: 45, suffix: ' млрд ₽' },
    { label: 'Средний бюджет', end: 350, suffix: ' млн ₽' },
    { label: 'Гос-поддержка', end: 40, suffix: '%' },
    { label: 'OTT-рост г/г', end: 22, decimals: 1, suffix: '%' }
  ];
  return (
    <section
      id="s03"
      style={{
        padding: '96px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <img
        src="__IMG_PLACEHOLDER_img17__"
        alt="Широкий баннер раздела «Контекст рынка» — панорамная кинематографическая сцена"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.2 }}
      />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, #0B0D10 0%, rgba(11,13,16,0.85) 50%, #0B0D10 100%)'
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto' }}>
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
            Рынок кинопроизводства РФ
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center', color: '#8E8E93',
              fontSize: 18, maxWidth: 760, margin: '0 auto 56px', lineHeight: 1.6
            }}
          >
            Четыре ключевых показателя рынка 2025 — база для расчёта целевой доходности фонда.
          </p>
        </Reveal>
        <div
          className="grid md:grid-cols-4 gap-6"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24
          }}
        >
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={i * 100}>
              <MarketKpi {...k} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterStub() {
  return (
    <footer
      id="s25"
      style={{
        padding: '48px 24px',
        borderTop: '1px solid #2A2D31',
        background: '#0B0D10',
        textAlign: 'center'
      }}
    >
      <p style={{ margin: 0, color: '#8E8E93', fontSize: 14 }}>
        © 2026 ТрендСтудио. Все права защищены.
      </p>
    </footer>
  );
}

// — APP —

function App_W1() {
  return (
    <>
      <style>{`
        *:focus-visible { outline: 2px solid #F4A261; outline-offset: 2px; border-radius: 4px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        .card-hover { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); border-color: #F4A261; }
        @keyframes bounce-y { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        .bounce-y { animation: bounce-y 2s ease-in-out infinite; }
        .scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg,#F4A261,#E67E22); z-index: 60; transition: width 0.1s linear; }
        html { scroll-behavior: smooth; }
        body { background: #0B0D10; color: #EAEAEA; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .object-cover { object-fit: cover; }
        .right-0 { right: 0; }
        .top-0 { top: 0; }
        .w-1\\/3 { width: 33.333333%; }
      `}</style>
      <ScrollProgress />
      <TopNav />
      <main>
        <HeroSection />
        <ThesisSection />
        <MarketSection />
      </main>
      <FooterStub />
    </>
  );
}
