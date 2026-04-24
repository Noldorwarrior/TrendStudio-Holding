// =====================================================================
// Wave 1 Artifact — ТрендСтудио Холдинг Landing v2.2 (grep-contract enforced)
// Foundation hooks/components + global styles + SVG grain filter
// Sections: TopNav + ScrollProgress, s01 Hero, s02 Thesis asymmetric, s03 Market parallax
// Target: assemble_html.py wraps this JSX with ReactDOM.createRoot(<App_W1/>)
// =====================================================================

// ------------------------- GLOBAL STYLES + SVG FILTER --------------------------
//
// GlobalFoundation renders:
//   (1) <style> with CSS variables, focus-visible, prefers-reduced-motion overrides,
//       card-hover, glass, @keyframes kenburns, spin, fadeInUp, fade-up, ray-shimmer,
//       bounce-y, grain-jitter, flow, cascade
//   (2) SVG <filter id="grain"><feTurbulence/></filter> (film-grain source,
//       applied via `filter: url(#grain)` on overlay divs)
//
// These are rendered once at App_W1 root so all sections can reuse them.

function GlobalFoundation() {
  return (
    <>
      <style>{`
        :root {
          --bg-0: #0B0D10;
          --bg-1: #15181C;
          --bg-2: #2A2D31;
          --text-hi: #EAEAEA;
          --text-mid: #C9CBCF;
          --text-lo: #8E8E93;
          --accent: #F4A261;
          --accent-2: #E67E22;
          --accent-3: #2E8F9E;
          --danger: #E63946;
          --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
        }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #0B0D10; color: #EAEAEA; font-family: 'Inter', system-ui, sans-serif; }
        *:focus-visible { outline: 2px solid #F4A261; outline-offset: 2px; border-radius: 3px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
        .glass {
          background: rgba(21, 24, 28, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .card-hover {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(244, 162, 97, 0.25);
          border-color: rgba(244, 162, 97, 0.4) !important;
        }
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #F4A261, #E67E22);
          z-index: 100;
          transition: width 0.12s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 10px rgba(244, 162, 97, 0.6);
        }
        @keyframes kenburns {
          0%   { transform: scale(1.02) translate(0, 0); transform-origin: center center; }
          50%  { transform: scale(1.08) translate(-2%, -1%); transform-origin: center center; }
          100% { transform: scale(1.02) translate(0, 0); transform-origin: center center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ray-shimmer {
          0%, 100% { opacity: 0.28; }
          50%      { opacity: 0.55; }
        }
        @keyframes bounce-y {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(8px); }
        }
        @keyframes grain-jitter {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-1%, 1%); }
          50%  { transform: translate(1%, -1%); }
          75%  { transform: translate(-1%, -1%); }
          100% { transform: translate(0, 0); }
        }
        @keyframes flow {
          0%   { stroke-dashoffset: 100; opacity: 0.4; }
          100% { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes cascade {
          0%   { transform: translateY(-8px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .bounce-y { animation: bounce-y 2.4s ease-in-out infinite; }
      `}</style>

      {/* SVG filter for film-grain — referenced by style={{filter:'url(#grain)'}} */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
          </filter>
        </defs>
      </svg>
    </>
  );
}

// ------------------------- FOUNDATION HOOKS --------------------------

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { setVisible(true); return; }
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
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
        transition:
          `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, ` +
          `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        ...style,
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
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#15181C',
            border: '1px solid #F4A261',
            padding: '10px 14px',
            borderRadius: 8,
            width: 280,
            fontSize: 13,
            color: '#EAEAEA',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            fontWeight: 400,
            lineHeight: 1.5,
            whiteSpace: 'normal',
            textAlign: 'left',
            pointerEvents: 'none',
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
  const fmt =
    decimals !== null
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString('ru-RU');
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => setDesktop(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return desktop;
}

// FLIP animation helper (used later by W5 M2 Pipeline Builder reset)
function useFlip() {
  const positions = useRef({});
  const record = (id, el) => { if (el) positions.current[id] = el.getBoundingClientRect(); };
  const animateTo = (id, el) => {
    const prev = positions.current[id];
    if (!prev || !el) return;
    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0,0)' }],
      { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  };
  return { record, animateTo };
}

// ------------------------- ICONS --------------------------

function Icon({ path, size = 20, color = 'currentColor', strokeWidth = 2, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
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
  film: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </>
  ),
};

// ------------------------- CTA buttons --------------------------

function PrimaryCTA({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 32px',
        background: '#F4A261',
        color: '#0B0D10',
        border: 'none',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        transition:
          'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(244,162,97,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
}

function SecondaryCTA({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 32px',
        background: 'transparent',
        color: '#F4A261',
        border: '1px solid #F4A261',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        transition:
          'transform 0.2s cubic-bezier(0.22,1,0.36,1), background-color 0.2s cubic-bezier(0.22,1,0.36,1), color 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = 'rgba(244,162,97,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ------------------------- MINI VIZ (inline SVG sparkline / donut / pie / bar / line) --------------------------

function Sparkline({ points, color = '#F4A261', height = 40, width = 120 }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((v, i) => [i * stepX, height - ((v - min) / range) * height]);
  const poly = coords.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }} aria-hidden="true">
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

function MiniDonut({ data, size = 80, thickness = 12 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', marginTop: 8 }} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2D31" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const len = frac * C;
        const dash = `${len} ${C - len}`;
        const dashOffset = -offset;
        offset += len;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

function MiniPie({ data, size = 80 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  let angle = -Math.PI / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', marginTop: 8 }} aria-hidden="true">
      {data.map((d, i) => {
        const slice = (d.value / total) * Math.PI * 2;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const next = angle + slice;
        const x2 = cx + r * Math.cos(next);
        const y2 = cy + r * Math.sin(next);
        const large = slice > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        angle = next;
        return <path key={i} d={path} fill={d.color} />;
      })}
    </svg>
  );
}

function MiniStackedBar({ data, width = 120, height = 12 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let x = 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }} aria-hidden="true">
      <rect x="0" y="0" width={width} height={height} rx="3" fill="#2A2D31" />
      {data.map((d, i) => {
        const w = (d.value / total) * width;
        const rect = <rect key={i} x={x} y="0" width={w} height={height} fill={d.color} rx={i === 0 ? 3 : 0} />;
        x += w;
        return rect;
      })}
    </svg>
  );
}

function MiniLine({ datasets, width = 120, height = 40 }) {
  // datasets: [{ points:[], color, label }]
  const all = datasets.flatMap((d) => d.points);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }} aria-hidden="true">
      {datasets.map((d, di) => {
        const stepX = width / (d.points.length - 1);
        const poly = d.points.map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`).join(' ');
        return (
          <polyline
            key={di}
            points={poly}
            fill="none"
            stroke={d.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

// ------------------------- s00: TopNav + ScrollProgress --------------------------

function TopNav() {
  const navLinks = [
    { id: 's01', label: 'Главная' },
    { id: 's02', label: 'Почему мы' },
    { id: 's03', label: 'Рынок' },
    { id: 's07', label: 'Проекты' },
    { id: 's10', label: 'Экономика' },
    { id: 's15', label: 'Риски' },
    { id: 's18', label: 'FAQ' },
    { id: 's22', label: 'Контакты' },
    { id: 's21', label: 'Legal' },
  ];
  const [lang, setLang] = useState('ru');
  return (
    <nav
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(244,162,97,0.12)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon path={ICONS.film} size={22} color="#F4A261" />
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, letterSpacing: '0.02em' }}>
          ТрендСтудио
        </span>
      </div>
      <ul style={{ display: 'flex', gap: 22, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
        {navLinks.map((l) => (
          <li key={l.id}>
            <a
              href={`#${l.id}`}
              style={{
                color: '#EAEAEA',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.2s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#EAEAEA')}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {['ru', 'en'].map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            style={{
              padding: '4px 10px',
              background: lang === code ? '#F4A261' : 'transparent',
              color: lang === code ? '#0B0D10' : '#EAEAEA',
              border: '1px solid rgba(244,162,97,0.4)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {code}
          </button>
        ))}
      </div>
    </nav>
  );
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} aria-hidden="true" />;
}

function FooterStub() {
  return (
    <footer
      id="s25"
      style={{
        padding: '48px 32px',
        textAlign: 'center',
        borderTop: '1px solid rgba(244,162,97,0.12)',
        color: '#8E8E93',
        fontSize: 13,
        marginTop: 80,
      }}
    >
      © 2026 ТрендСтудио Холдинг. Все права защищены.
    </footer>
  );
}

// ------------------------- s01: HERO (ken-burns + mask + film-grain + rotation reel) --------------------------
//
// GREP-CONTRACT MUST_CONTAIN for s01:
//   - mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
//   - @keyframes kenburns + animation: 'kenburns 30s infinite alternate'
//   - filter: url(#grain) on overlay
//   - animation: 'spin 60s linear infinite' on film-reel
//   - 4+ animationDelay values of '200ms' / '500ms' / '800ms' / '1100ms'
//   - radial-gradient(ellipse at center, transparent 40%, #0B0D10 100%) vignette
//   - 3 CountUp (3000, 7, 20.09) + 3 Tooltip
//   - CTA primary "Обсудить партнёрство", secondary "Скачать investment pack"

function HeroSection() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section
      id="s01"
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ken-burns hero image with mask-gradient (fixes color-seam) */}
      <img
        src="__IMG_PLACEHOLDER_img19__"
        alt="ТрендСтудио Холдинг — кинематографический ландшафт заката"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          animation: 'kenburns 30s infinite alternate',
          transformOrigin: 'center center',
          opacity: 0.55,
          zIndex: 0,
        }}
      />

      {/* Film-reel on right — slow rotation */}
      <img
        src="__IMG_PLACEHOLDER_img20__"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '33%',
          objectFit: 'cover',
          opacity: 0.28,
          mixBlendMode: 'screen',
          animation: 'spin 60s linear infinite',
          transformOrigin: 'center center',
          zIndex: 1,
        }}
      />

      {/* Vignette overlay (required grep: radial-gradient transparent 40%) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, #0B0D10 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Accent-ray (shimmer) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '40%',
          background: 'radial-gradient(ellipse at right center, rgba(244,162,97,0.15), transparent 70%)',
          animation: 'ray-shimmer 8s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Film-grain (feTurbulence filter referenced) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#grain)',
          opacity: 0.35,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Hero content — staggered entrance 200/500/800/1100 ms */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1100,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(56px, 10vw, 96px)',
            fontWeight: 700,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: '-0.02em',
            color: '#EAEAEA',
            opacity: 0,
            animation: 'fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
            animationDelay: '200ms',
          }}
        >
          ТрендСтудио Холдинг
        </h1>

        <p
          style={{
            fontSize: 20,
            color: '#EAEAEA',
            marginTop: 24,
            maxWidth: 860,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.55,
            opacity: 0,
            animation: 'fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
            animationDelay: '500ms',
          }}
        >
          Кинопроизводственный холдинг. Портфель из 7 проектов на горизонте 2026–2033.
          Ваш фонд мы приглашаем к со-финансированию портфеля объёмом 3 000 млн ₽.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 48,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 40,
            opacity: 0,
            animation: 'fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
            animationDelay: '800ms',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#F4A261' }}>
              <CountUp end={3000} /> <span style={{ fontSize: 20 }}>млн&nbsp;₽</span>
            </div>
            <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
              <Tooltip explanation="Целевой размер партнёрства: ваш фонд делает вклад в GP-структуру холдинга, срок выборки 4 года.">
                размер партнёрства
              </Tooltip>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#F4A261' }}>
              <CountUp end={7} /> <span style={{ fontSize: 20 }}>лет</span>
            </div>
            <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
              <Tooltip explanation="Инвестиционный горизонт от first close до финальной дистрибуции DPI. Опция продления +2 года по решению LPAC.">
                инвестиционный горизонт
              </Tooltip>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#F4A261' }}>
              <CountUp end={20.09} decimals={2} />% <span style={{ fontSize: 20 }}>IRR</span>
            </div>
            <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
              <Tooltip explanation="Прогнозная IRR Public-сценария (W₃), Monte-Carlo P50 из 10 000 симуляций. Для партнёра это нижняя консервативная граница — та доходность, на которую ваш фонд может рассчитывать при стресс-кейсах.">
                прогнозная IRR (Public W₃)
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 48,
            opacity: 0,
            animation: 'fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
            animationDelay: '1100ms',
          }}
        >
          <PrimaryCTA onClick={() => scrollTo('s22')}>Обсудить партнёрство</PrimaryCTA>
          <SecondaryCTA onClick={() => scrollTo('s22')}>
            Скачать investment pack
          </SecondaryCTA>
        </div>
      </div>

      {/* Chevron-down hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          opacity: 0,
          animation: 'fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
          animationDelay: '1400ms',
        }}
        aria-hidden="true"
      >
        <Icon path={ICONS.chevronDown} size={28} color="#F4A261" className="bounce-y" />
      </div>
    </section>
  );
}

// ------------------------- s02: THESIS (asymmetric 2fr/1fr/1fr + glass + drop-cap + inline-viz) --------------------------
//
// GREP-CONTRACT MUST_CONTAIN for s02:
//   - title one of: "Почему партнёрство" / "Почему сотрудничество с нами" / "Что мы приносим вашему фонду"
//   - backdrop-filter: blur(12px) in cards (glass)
//   - gridTemplateColumns: '2fr 1fr 1fr' asymmetric layout
//   - fontSize: '4em' float:'left' drop-cap
//   - inline <svg> mini-viz in 2+ cards out of 3
// MUST_NOT_CONTAIN: old v2.0/v2.1 thesis title, old "3 principles" subtitle, old "market growth" card name — see §4.2 in prompt

function ThesisCard({ icon, title, body, dropCap = false, children, delay = 0, large = false }) {
  const [expanded, setExpanded] = useState(false);
  const bodyEl = dropCap && body ? (
    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#C9CBCF' }}>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '4em',
          color: '#F4A261',
          float: 'left',
          lineHeight: 0.85,
          marginRight: 10,
          marginTop: 4,
          fontWeight: 700,
        }}
      >
        {body.charAt(0)}
      </span>
      {body.slice(1)}
    </p>
  ) : (
    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#C9CBCF' }}>{body}</p>
  );
  return (
    <Reveal delay={delay}>
      <div
        className="card-hover glass"
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
        style={{
          border: '1px solid #2A2D31',
          borderRadius: 16,
          padding: 32,
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(21, 24, 28, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: large ? 56 : 44,
              height: large ? 56 : 44,
              borderRadius: 12,
              background: 'rgba(244,162,97,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon path={icon} size={large ? 28 : 22} color="#F4A261" />
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: large ? 28 : 22,
              color: '#EAEAEA',
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
        </div>
        <div style={{ overflow: 'hidden' }}>{bodyEl}</div>
        {children}
        {expanded && (
          <div
            style={{
              borderTop: '1px dashed rgba(244,162,97,0.3)',
              paddingTop: 14,
              marginTop: 6,
              fontSize: 13,
              color: '#8E8E93',
              lineHeight: 1.6,
            }}
          >
            Источник: внутренние данные холдинга, верифицированы внешним аудитом.
            Полный breakdown — в investment pack для вашего фонда.
          </div>
        )}
        <div style={{ fontSize: 12, color: '#F4A261', marginTop: 'auto', letterSpacing: '0.04em' }}>
          {expanded ? '▲ Свернуть' : '▼ Детали'}
        </div>
      </div>
    </Reveal>
  );
}

function ThesisSection() {
  const isDesktop = useIsDesktop();
  return (
    <section id="s02" style={{ padding: '120px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <Reveal>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: '#EAEAEA',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Почему партнёрство с нашим холдингом
        </h2>
        <p style={{ color: '#8E8E93', fontSize: 18, marginTop: 12, maxWidth: 780 }}>
          Что мы приносим вашему фонду: track record, дисциплину и диверсифицированный pipeline
        </p>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '2fr 1fr 1fr' : '1fr',
          gap: 24,
          marginTop: 48,
          alignItems: 'stretch',
        }}
      >
        <ThesisCard
          icon={ICONS.trendingUp}
          title="Track record команды холдинга"
          body="Team холдинга приносит вашему фонду 20+ лет продюсерского опыта: 12 релизных фильмов, 3 международных фестиваля, 2 OTT-оригинала. Ядро — 5 senior-специалистов и 4 institutional-level советника."
          dropCap={true}
          delay={0}
          large={true}
        >
          <div>
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Релизы команды 2020–2025</div>
            <Sparkline points={[2, 3, 4, 3, 5, 4]} color="#F4A261" height={40} width={220} />
          </div>
        </ThesisCard>

        <ThesisCard
          icon={ICONS.shield}
          title="Институциональная дисциплина"
          body="ваш фонд получает LP/GP-структуру, прошедшую 348 автотестов финмодели, 10 000 Monte-Carlo симуляций и П5-верификацию 32/32. Это институциональный стандарт, на который ваш фонд может опереться при due diligence."
          delay={120}
        >
          <div>
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Тесты · MC-симуляции · P5</div>
            <MiniDonut
              data={[
                { value: 348, color: '#F4A261' },
                { value: 10000, color: '#E67E22' },
                { value: 32, color: '#2E8F9E' },
              ]}
              size={84}
              thickness={14}
            />
          </div>
        </ThesisCard>

        <ThesisCard
          icon={ICONS.sparkles}
          title="Диверсифицированный pipeline"
          body="7 проектов 2026–2028 в 4 жанрах: драма, триллер, исторический, премиум-сериал. Бюджет портфеля 2 620 млн ₽."
          delay={240}
        >
          <div>
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>Жанровый микс портфеля</div>
            <MiniPie
              data={[
                { value: 3, color: '#F4A261' },
                { value: 2, color: '#E63946' },
                { value: 1, color: '#2E8F9E' },
                { value: 1, color: '#4A7FB8' },
              ]}
              size={84}
            />
          </div>
        </ThesisCard>
      </div>
    </section>
  );
}

// ------------------------- s03: MARKET (parallax bg + inline-viz KPI + context tooltips) --------------------------
//
// GREP-CONTRACT MUST_CONTAIN for s03:
//   - parallax: mousemove listener + transform: translate3d(...) on bg
//   - 4+ inline <svg> in KPI cards (sparkline / pie / bar / line)
//   - context tooltips 2+ times with phrases "что это даёт вашему фонду" / "влияние на вашу IRR" / "для вашего фонда"
//   - 4 CountUp (45, 350, 40, 22)
// MUST_NOT_CONTAIN: старый подзаголовок Market (убран в v2.2) — см. §4.3

function MarketKPI({ value, suffix, decimals = null, label, explanation, children, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div
        className="card-hover glass"
        style={{
          border: '1px solid #2A2D31',
          borderRadius: 16,
          padding: 24,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(21, 24, 28, 0.55)',
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 700,
            color: '#F4A261',
            lineHeight: 1,
          }}
        >
          <CountUp end={value} decimals={decimals} />
          {suffix && <span style={{ fontSize: 20, marginLeft: 4 }}>{suffix}</span>}
        </div>
        <div style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 500 }}>
          <Tooltip explanation={explanation}>{label}</Tooltip>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

function MarketSection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;
    // Parallax via mousemove → translate3d
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bg.style.transform = `translate3d(${x * -24}px, ${y * -18}px, 0) scale(1.08)`;
    };
    const onLeave = () => {
      bg.style.transform = 'translate3d(0, 0, 0) scale(1.08)';
    };
    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      id="s03"
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 32px',
      }}
    >
      {/* Parallax bg — translate3d driven by mousemove */}
      <img
        ref={bgRef}
        src="__IMG_PLACEHOLDER_img17__"
        alt=""
        aria-hidden="true"
        className="parallax-bg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.22,
          transform: 'translate3d(0, 0, 0) scale(1.08)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          willChange: 'transform',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11,13,16,0.85) 0%, rgba(11,13,16,0.65) 50%, rgba(11,13,16,0.9) 100%)',
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#grain)',
          opacity: 0.4,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: '#EAEAEA',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Рынок и господдержка — что это даёт вашему фонду
          </h2>
          <p style={{ color: '#8E8E93', fontSize: 18, marginTop: 12, maxWidth: 820 }}>
            4 метрики рынка, которые формируют ROI портфеля вашего партнёрства 3 000 млн ₽
          </p>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            marginTop: 48,
          }}
        >
          <MarketKPI
            value={45}
            suffix="млрд ₽"
            label="Box office РФ 2025"
            explanation="Объём российского кинорынка в 2025 году. Рост +60% за пять лет. Для вашего фонда 3 000 млн — потенциальный вход в ~6% market share через диверсифицированный портфель 7 проектов. Это прямое влияние на вашу IRR."
            delay={0}
          >
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93' }}>Рост 2020–2025</div>
              <Sparkline points={[28, 32, 35, 38, 42, 45]} color="#F4A261" height={40} width={160} />
            </div>
          </MarketKPI>

          <MarketKPI
            value={350}
            suffix="млн ₽"
            label="Средний бюджет production"
            explanation="Средний бюджет production РФ. Для вашего фонда 3 000 млн это ≈ 8,5 таких бюджетов или 7 оптимально диверсифицированных проектов в портфеле."
            delay={100}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MiniPie
                data={[
                  { value: 40, color: '#F4A261' },
                  { value: 30, color: '#E63946' },
                  { value: 30, color: '#2E8F9E' },
                ]}
                size={60}
              />
              <div style={{ fontSize: 11, color: '#8E8E93', lineHeight: 1.5 }}>
                драма 40%<br />триллер 30%<br />прочее 30%
              </div>
            </div>
          </MarketKPI>

          <MarketKPI
            value={40}
            suffix="%"
            label="Господдержка (средняя)"
            explanation="Средняя эффективная господдержка по портфелю: Фонд кино, Минкультуры, региональные рибейты, OTT pre-sales. Что это даёт вашему фонду: ≈1,2 млрд безвозвратного финансирования = +5–7 п.п. к IRR портфеля холдинга."
            delay={200}
          >
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93' }}>Фонд кино · Минкульт · Регион · OTT</div>
              <MiniStackedBar
                data={[
                  { value: 30, color: '#F4A261' },
                  { value: 50, color: '#E67E22' },
                  { value: 14, color: '#2E8F9E' },
                  { value: 8, color: '#4A7FB8' },
                ]}
                width={180}
                height={12}
              />
            </div>
          </MarketKPI>

          <MarketKPI
            value={22}
            suffix="%/год"
            label="Рост OTT-аудитории"
            explanation="Годовой рост подписочной OTT-аудитории РФ. Для вашего фонда это значит, что OTT-канал обеспечит ≈40% revenue-mix портфеля холдинга, что стабилизирует доходность второго-третьего года."
            delay={300}
          >
            <div>
              <div style={{ fontSize: 12, color: '#8E8E93' }}>OTT vs TV (usage)</div>
              <MiniLine
                datasets={[
                  { points: [40, 48, 58, 70, 82, 95], color: '#F4A261', label: 'OTT' },
                  { points: [90, 85, 78, 70, 64, 58], color: '#8E8E93', label: 'TV' },
                ]}
                width={180}
                height={40}
              />
            </div>
          </MarketKPI>
        </div>
      </div>
    </section>
  );
}

// ------------------------- ROOT APP_W1 --------------------------

function App_W1() {
  return (
    <>
      <GlobalFoundation />
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
