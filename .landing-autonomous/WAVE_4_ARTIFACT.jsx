import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Film, TrendingUp, Award, ChevronDown, Menu, X, DollarSign, Percent, PiggyBank,
  PlayCircle, Layers, Target, Briefcase,
  FileText, CheckCircle, Lightbulb, Video, Megaphone,
  Users, UserCheck, Clapperboard, ArrowRight,
  AlertTriangle, MapPin, Coins, Scale, Sparkles, RotateCcw, GripVertical, Play,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  Tooltip, Legend, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

// =============================================================================
// TrendStudio Holding — Landing v1.0 — Wave 4 Artifact (s00–s16 + M1 + M2 + M3)
// Scope: W3 sections (s00–s11 + M1 Monte-Carlo) +
//        s12 Risks 3x3 matrix, s13 Roadmap 7y Gantt, s14 Scenarios 4-tabs,
//        s15 Regions SVG map, s16 Tax Credits 4 cards,
//        M2 Pipeline Builder (HTML5 DnD), M3 LP Sizer (slider + MC prob).
// Expected M1 P50 anchor ≈ 13.95 (default inputs: hit=25%, avg=2.3x, loss=12%)
// Style signature: shadows_of_sunset_v1
// SSOT: .landing-autonomous/canon/landing_canon_base_v1.0.json
// =============================================================================

// --- Design tokens (locked by canon) ---
const COLORS = {
  bg:        '#0B0D10',
  text:      '#EAEAEA',
  muted:     '#8E8E93',
  accentWarm:'#F4A261', // shadows_of_sunset: warm sunset
  accentCool:'#2A9D8F', // shadows_of_sunset: teal shadow
  surface:   '#14171C',
  border:    'rgba(234,234,234,0.12)',
  danger:    '#E74C3C',
  info:      '#3498DB',
  // Stage palette (canon.pipeline.stages)
  stagePre:     '#9E9E9E',
  stageProd:    '#1976D2',
  stagePost:    '#7B1FA2',
  stageRelease: '#388E3C',
};

const NAV_LINKS = [
  { id: 'hero',              label: 'Hero' },
  { id: 'thesis',            label: 'Тезис' },
  { id: 'market',            label: 'Рынок' },
  { id: 'fund',              label: 'Фонд' },
  { id: 'economics',         label: 'Экономика' },
  { id: 'returns',           label: 'Доходность' },
  { id: 'pipeline',          label: 'Pipeline' },
  { id: 'stages',            label: 'Стадии' },
  { id: 'team',              label: 'Команда' },
  { id: 'advisory',          label: 'Advisory' },
  { id: 'operations',        label: 'Процесс' },
  { id: 'risks',             label: 'Риски' },
  { id: 'roadmap',           label: 'Roadmap' },
  { id: 'scenarios',         label: 'Сценарии' },
  { id: 'regions',           label: 'Регионы' },
  { id: 'pipeline-builder',  label: 'Builder' },
  { id: 'tax-credits',       label: 'Налоги' },
  { id: 'lp-sizer',          label: 'LP Sizer' },
];

// --- prefers-reduced-motion hook ---
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    handler();
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else if (mq.removeListener) mq.removeListener(handler);
    };
  }, []);
  return reduced;
}

// --- Smooth scroll helper (bg-safe) ---
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================================================
// s00 — Skeleton: ScrollProgress + TopNav + Footer stub
// =============================================================================

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const total = (h.scrollHeight - h.clientHeight) || 1;
      const pct = (h.scrollTop / total) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '3px',
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${COLORS.accentWarm} 0%, ${COLORS.accentCool} 100%)`,
        zIndex: 100,
        transition: 'width 60ms linear',
        pointerEvents: 'none',
      }}
    />
  );
}

function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav
      aria-label="Основная навигация"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11,13,16,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
        <button
          onClick={() => scrollToId('hero')}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.text,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="К началу — ТрендСтудио"
        >
          ТрендСтудио
        </button>

        {/* Desktop links */}
        <ul
          className="hidden md:flex"
          style={{ listStyle: 'none', gap: 20, margin: 0, padding: 0, flexWrap: 'wrap' }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => scrollToId(l.id)}
                style={{
                  color: COLORS.muted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '6px 2px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.accentWarm; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          style={{ background: 'transparent', border: 'none', color: COLORS.text, cursor: 'pointer' }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <ul
          className="md:hidden"
          style={{
            listStyle: 'none', margin: 0, padding: '8px 24px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => { scrollToId(l.id); setOpen(false); }}
                style={{
                  color: COLORS.text, background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: 14, padding: '8px 0', width: '100%', textAlign: 'left',
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

function FooterStub() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: '32px 0',
        color: COLORS.muted,
        fontSize: 13,
        background: COLORS.bg,
      }}
    >
      <div className="container mx-auto px-6" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>ТрендСтудио Холдинг — LP-фонд кино 3000 млн ₽ · горизонт 7 лет</div>
        <div>© 2026 TrendStudio Holding</div>
      </div>
    </footer>
  );
}

// =============================================================================
// s01 — Hero (img19 + img20)
// =============================================================================

function Hero({ prefersReducedMotion }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center"
      style={{ overflow: 'hidden' }}
    >
      {/* img19 — hero background (eager loading, per img_meta) */}
      <img
        src="__IMG_PLACEHOLDER_img19__"
        alt="Hero-фон ТрендСтудио Холдинг — кинематографический ландшафт заката в палитре shadows_of_sunset_v1"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Gradient readability overlay */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'linear-gradient(180deg, rgba(11,13,16,0.4) 0%, rgba(11,13,16,0.95) 100%)' }}
      />
      {/* img20 — film reel detail, decorative (screen blend) */}
      <img
        src="__IMG_PLACEHOLDER_img20__"
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-1/3 object-cover"
        style={{ opacity: 0.3, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />

      <div className="relative z-10 container mx-auto px-6">
        <div style={{ maxWidth: 880 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              background: 'rgba(20,23,28,0.6)',
              color: COLORS.accentWarm,
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            LP-фонд кино · IRR 24,75%
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(56px, 8vw, 96px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
              color: COLORS.text,
            }}
          >
            ТрендСтудио
          </h1>

          <p
            className="text-xl mt-4"
            style={{
              color: COLORS.muted,
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              maxWidth: 640,
              lineHeight: 1.45,
            }}
          >
            LP-фонд кино 3000 млн ₽, горизонт 7 лет. Диверсифицированный портфель из 7 проектов,
            Monte-Carlo моделирование, дисциплинированная экономика.
          </p>

          <div className="flex gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollToId('pipeline')}
              className="px-8 py-3 rounded"
              style={{
                background: COLORS.accentWarm,
                color: COLORS.bg,
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Запросить питч-дек
            </button>
            <button
              onClick={() => { try { alert('One-pager coming soon'); } catch (_) {} }}
              className="px-8 py-3 rounded border-2"
              style={{
                borderColor: COLORS.text,
                background: 'transparent',
                color: COLORS.text,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Скачать one-pager
            </button>
          </div>
        </div>
      </div>

      {/* Chevron down indicator — bounce disabled under prefers-reduced-motion */}
      <ChevronDown
        className={prefersReducedMotion ? 'absolute bottom-8 left-1/2 -translate-x-1/2' : 'absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'}
        style={{ color: COLORS.muted }}
        size={32}
        aria-hidden="true"
      />
    </section>
  );
}

// =============================================================================
// s02 — Thesis (3 columns × 3 bullets)
// =============================================================================

const THESIS_COLUMNS = [
  {
    icon: Film,
    title: 'Почему кино?',
    subtitle: 'Структурная возможность',
    bullets: [
      'Уход западных мейджоров освободил ~60% theatrical-доли — уникальное окно для локальных игроков.',
      'Оригинальный контент OTT-платформ растёт 30%+ YoY при дефиците production capacity.',
      'Международный upside: pre-sales и licensing дают 20–30% revenue к базовому сценарию.',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Почему сейчас?',
    subtitle: 'Экономика и данные',
    bullets: [
      'Дисциплина: budget tolerance ±15%, gate-review, stop-loss — не допускаем overspend на post.',
      'Финмодель v1.4.4, 348 тестов PASS, 4 Monte-Carlo движка — каждое greenlight с IRR-симуляцией.',
      'Целевой IRR 24,75% (Internal W₅ V-D) · MC p50 13,95% · MOIC ≥ 2,2×.',
    ],
  },
  {
    icon: Award,
    title: 'Почему мы?',
    subtitle: 'Команда и структура',
    bullets: [
      'Вертикальная интеграция: development → production → post → distribution → IP-менеджмент.',
      '7 проектов × 4 стадии × смешанный жанровый микс — диверсификация риска единичного срыва.',
      'LP-friendly governance: 2/20, hurdle 8%, 100% catch-up, LPAC, key-person, no-fault removal.',
    ],
  },
];

function ThesisColumn({ col }) {
  const Icon = col.icon;
  return (
    <article
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 48, height: 48,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(244,162,97,0.12)',
          color: COLORS.accentWarm,
        }}
      >
        <Icon size={24} />
      </div>
      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {col.title}
        </h3>
        <div style={{ color: COLORS.accentCool, fontSize: 13, marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {col.subtitle}
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {col.bullets.map((b, i) => (
          <li
            key={i}
            style={{
              color: COLORS.text,
              fontSize: 15,
              lineHeight: 1.55,
              paddingLeft: 20,
              position: 'relative',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0, top: 10,
                width: 8, height: 8,
                borderRadius: '50%',
                background: COLORS.accentWarm,
              }}
            />
            {b}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Thesis() {
  return (
    <section id="thesis" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Инвестиционный тезис
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            Портфельный подход + дисциплинированная экономика + data-driven решения
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            7 проектов означают диверсификацию риска единичного срыва. Monte-Carlo моделирование
            revenue и cost на всех этапах. Таргет IRR 24,75% при MC p50 13,95%.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {THESIS_COLUMNS.map((c) => (
            <ThesisColumn key={c.title} col={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s03 — Market (img17 as background via CSS gradient)
// =============================================================================

const KPI_ITEMS = [
  {
    id: 'kpi-gross',
    label: 'Кассовый сбор',
    unit: 'млрд ₽',
    target: 45,
    decimals: 0,
    caption: 'Оценка 2025, театральный прокат РФ',
  },
  {
    id: 'kpi-domestic',
    label: 'Доля отечественного кино',
    unit: '%',
    target: 75,
    decimals: 0,
    caption: 'После ухода западных мейджоров',
  },
  {
    id: 'kpi-ott-subs',
    label: 'OTT-подписчики',
    unit: 'млн',
    target: 48,
    decimals: 0,
    caption: 'Суммарно по ключевым платформам',
  },
  {
    id: 'kpi-ott-yoy',
    label: 'OTT рост оригинального контента',
    unit: '% YoY',
    target: 30,
    decimals: 0,
    caption: 'Кинопоиск · Okko · Wink · START',
  },
];

function useCountUp(target, durationMs, shouldStart, decimals, prefersReducedMotion) {
  const [value, setValue] = useState(prefersReducedMotion ? target : 0);
  const rafRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    if (!shouldStart || startedRef.current) return;
    startedRef.current = true;

    const startTs = performance.now();
    function step(now) {
      const elapsed = now - startTs;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      const pow = Math.pow(10, decimals || 0);
      setValue(Math.round(v * pow) / pow);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, shouldStart, decimals, prefersReducedMotion]);

  return value;
}

function KpiCard({ item, inView, prefersReducedMotion }) {
  const value = useCountUp(item.target, 1500, inView, item.decimals || 0, prefersReducedMotion);
  const display = useMemo(() => {
    const d = item.decimals || 0;
    return d > 0 ? value.toFixed(d) : Math.round(value).toString();
  }, [value, item.decimals]);

  return (
    <div
      style={{
        background: 'rgba(20,23,28,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 700,
            color: COLORS.accentWarm,
            lineHeight: 1,
          }}
          aria-live="polite"
        >
          {display}
        </div>
        <div style={{ color: COLORS.text, fontSize: 14 }}>{item.unit}</div>
      </div>
      <div style={{ color: COLORS.text, fontSize: 15, fontWeight: 500 }}>{item.label}</div>
      <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{item.caption}</div>
    </div>
  );
}

function Market({ prefersReducedMotion }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="market"
      ref={ref}
      style={{
        backgroundImage: `linear-gradient(rgba(11,13,16,0.85), rgba(11,13,16,0.95)), url("__IMG_PLACEHOLDER_img17__")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '96px 0',
      }}
    >
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Контекст рынка
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            Российский рынок кино 2025
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Окно возможностей после структурных сдвигов 2022–2025. Консолидация дистрибуции
            и рост OTT-бюджетов формируют среду для вертикально-интегрированного холдинга.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {KPI_ITEMS.map((k) => (
            <KpiCard
              key={k.id}
              item={k}
              inView={inView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s04 — Fund Structure (PieChart LP/GP + 3 factcards)
// =============================================================================

const FUND_PIE_DATA = [
  { name: 'LP', value: 85, fill: COLORS.accentWarm },
  { name: 'GP', value: 15, fill: COLORS.accentCool },
];

const FUND_FACTCARDS = [
  {
    icon: DollarSign,
    label: 'Commitment',
    value: '3 000 млн ₽',
    caption: 'LP-фонд, first close 2026-09-30',
  },
  {
    icon: PlayCircle,
    label: 'Vintage',
    value: '2026',
    caption: 'Investment period 4 года · Fund life 7 лет',
  },
  {
    icon: Briefcase,
    label: 'Jurisdiction',
    value: 'РФ',
    caption: 'LP/GP Limited Partnership (ФЗ-156)',
  },
];

function FundFactCard({ item }) {
  const Icon = item.icon;
  return (
    <article
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 44, height: 44,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(42,157,143,0.15)',
          color: COLORS.accentCool,
        }}
      >
        <Icon size={22} />
      </div>
      <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {item.label}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.text,
          lineHeight: 1.1,
        }}
      >
        {item.value}
      </div>
      <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.45 }}>
        {item.caption}
      </div>
    </article>
  );
}

function FundPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        color: COLORS.text,
        fontSize: 13,
      }}
    >
      <strong style={{ color: p.payload.fill }}>{p.name}</strong>: {p.value}%
    </div>
  );
}

function FundSection() {
  return (
    <section id="fund" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Структура фонда
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            LP/GP Limited Partnership · 3000 млн ₽
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Закрытый фонд LP/GP в юрисдикции РФ. GP-commitment 2% обеспечивает alignment of interest.
            Waterfall европейского типа с hurdle 8% и 100% catch-up — подробно в секции «Экономика».
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 400px) 1fr',
            gap: 40,
            alignItems: 'center',
          }}
          className="fund-grid"
        >
          {/* Pie chart */}
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 24,
              height: 340,
            }}
            aria-label="Круговая диаграмма распределения долей LP и GP"
          >
            <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Распределение долей
            </div>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie
                  data={FUND_PIE_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  stroke={COLORS.bg}
                  strokeWidth={2}
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {FUND_PIE_DATA.map((e, i) => (
                    <Cell key={`c-${i}`} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip content={<FundPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ color: COLORS.text, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fact-cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {FUND_FACTCARDS.map((f) => (
              <FundFactCard key={f.label} item={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s05 — Economics: 4 KPI cards + Waterfall SVG (4 tiers)
// =============================================================================

const ECON_KPIS = [
  { icon: Percent,    label: 'Management Fee',  value: '2%',   caption: 'annual on committed / invested' },
  { icon: Award,      label: 'Carried Interest', value: '20%',  caption: 'после hurdle + catch-up' },
  { icon: Target,     label: 'Hurdle',          value: '8%',   caption: 'preferred return compound' },
  { icon: PiggyBank,  label: 'Catch-up',        value: '100%', caption: 'GP до выравнивания 20%' },
];

const WATERFALL_TIERS = [
  {
    idx: 1,
    name: 'Return of Capital',
    descr: 'Возврат 100% вложенного капитала LP',
    splitLabel: '100/0 LP/GP',
    color: COLORS.accentCool,
  },
  {
    idx: 2,
    name: 'Preferred Return',
    descr: '8% годовых compound до достижения hurdle',
    splitLabel: '100/0 LP/GP',
    color: COLORS.info,
  },
  {
    idx: 3,
    name: 'Catch-up',
    descr: 'GP получает 100% до выравнивания до 20% profits',
    splitLabel: '0/100 LP/GP',
    color: COLORS.accentWarm,
  },
  {
    idx: 4,
    name: 'Carry Split',
    descr: 'Весь дальнейший upside делится 80/20',
    splitLabel: '80/20 LP/GP',
    color: COLORS.danger,
  },
];

function WaterfallSVG() {
  const [hover, setHover] = useState(null);
  const tierW = 150;
  const gap = 16;
  const height = 160;
  const total = WATERFALL_TIERS.length;
  const totalW = total * tierW + (total - 1) * gap;

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        Waterfall distribution (4-tier)
      </div>

      <div style={{ position: 'relative', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${totalW} ${height + 40}`}
          width="100%"
          style={{ display: 'block', minWidth: 580 }}
          role="img"
          aria-label="Диаграмма waterfall с 4 ступенями распределения прибыли"
        >
          {WATERFALL_TIERS.map((t, i) => {
            const x = i * (tierW + gap);
            const isHover = hover === t.idx;
            return (
              <g
                key={t.idx}
                onMouseEnter={() => setHover(t.idx)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(t.idx)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                style={{ cursor: 'pointer', outline: 'none' }}
                aria-label={`${t.name}: ${t.descr}`}
              >
                <rect
                  x={x}
                  y={10}
                  width={tierW}
                  height={height}
                  rx={8}
                  fill={t.color}
                  fillOpacity={isHover ? 0.95 : 0.75}
                  stroke={t.color}
                  strokeWidth={2}
                />
                <text
                  x={x + tierW / 2}
                  y={40}
                  textAnchor="middle"
                  fontFamily="'Playfair Display', serif"
                  fontSize={28}
                  fontWeight={700}
                  fill={COLORS.bg}
                >
                  {t.idx}
                </text>
                <text
                  x={x + tierW / 2}
                  y={78}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={600}
                  fill={COLORS.bg}
                >
                  {t.name}
                </text>
                <text
                  x={x + tierW / 2}
                  y={130}
                  textAnchor="middle"
                  fontSize={12}
                  fill={COLORS.bg}
                  style={{ opacity: 0.85 }}
                >
                  {t.splitLabel}
                </text>
                {/* Arrow between tiers */}
                {i < total - 1 && (
                  <path
                    d={`M ${x + tierW + 2} ${10 + height / 2} L ${x + tierW + gap - 2} ${10 + height / 2}`}
                    stroke={COLORS.muted}
                    strokeWidth={2}
                    markerEnd="url(#wf-arrow)"
                  />
                )}
              </g>
            );
          })}
          <defs>
            <marker id="wf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.muted} />
            </marker>
          </defs>
        </svg>

        {/* Inline tooltip (description) */}
        <div
          aria-live="polite"
          style={{
            marginTop: 16,
            padding: '12px 16px',
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            color: hover ? COLORS.text : COLORS.muted,
            fontSize: 14,
            minHeight: 48,
            lineHeight: 1.5,
          }}
        >
          {hover
            ? (() => {
                const t = WATERFALL_TIERS.find((x) => x.idx === hover);
                return (
                  <>
                    <strong style={{ color: t.color }}>{t.idx}. {t.name}</strong> — {t.descr}
                  </>
                );
              })()
            : 'Наведите на ступень, чтобы увидеть описание.'}
        </div>
      </div>
    </div>
  );
}

function EconKpiCard({ item }) {
  const Icon = item.icon;
  return (
    <article
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 40, height: 40,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(244,162,97,0.15)',
          color: COLORS.accentWarm,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {item.label}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40,
          fontWeight: 700,
          color: COLORS.accentWarm,
          lineHeight: 1,
        }}
      >
        {item.value}
      </div>
      <div style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.4 }}>
        {item.caption}
      </div>
    </article>
  );
}

function Economics() {
  return (
    <section id="economics" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Экономика сделки
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            2/20 · Hurdle 8% · Catch-up 100%
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Классические LP-friendly условия: preferred return, catch-up и carry-split выстроены
            так, чтобы GP разделял риски и получал компенсацию только после достижения hurdle.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {ECON_KPIS.map((k) => (
            <EconKpiCard key={k.label} item={k} />
          ))}
        </div>

        <WaterfallSVG />
      </div>
    </section>
  );
}

// =============================================================================
// s06 — Returns: tabs (Internal / Public) + IRR table + LineChart + M1 Monte-Carlo
// =============================================================================

const RETURNS_DATA = {
  internal: {
    label: 'Internal (W₅ V-D)',
    irr: 24.75,
    moic: 2.40,
    tvpi: 2.40,
    dpi: 1.85,
    trajectory: [
      { year: 'Y1', irr: -8.5 },
      { year: 'Y2', irr: -3.2 },
      { year: 'Y3', irr: 6.4 },
      { year: 'Y4', irr: 14.2 },
      { year: 'Y5', irr: 19.8 },
      { year: 'Y6', irr: 22.9 },
      { year: 'Y7', irr: 24.75 },
    ],
  },
  public: {
    label: 'Public (W₃)',
    irr: 20.09,
    moic: 2.20,
    tvpi: 2.20,
    dpi: 1.55,
    trajectory: [
      { year: 'Y1', irr: -9.1 },
      { year: 'Y2', irr: -4.5 },
      { year: 'Y3', irr: 4.8 },
      { year: 'Y4', irr: 11.6 },
      { year: 'Y5', irr: 16.3 },
      { year: 'Y6', irr: 18.9 },
      { year: 'Y7', irr: 20.09 },
    ],
  },
};

// --- Monte-Carlo engine (mulberry32 PRNG) ---
function mulberry32(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function runMonteCarlo(runs=10000, hitRate=0.25, avgMult=2.3, lossRate=0.12, seed=42) {
  const rand = mulberry32(seed);
  const results = [];
  for (let i = 0; i < runs; i++) {
    let portfolio = 0;
    for (let p = 0; p < 7; p++) {
      const r = rand();
      if (r < lossRate) portfolio += -1;
      else if (r < lossRate + (1 - hitRate - lossRate)) portfolio += 0.5;
      else portfolio += avgMult;
    }
    const multiple = portfolio / 7 + 1;
    const irr = multiple > 0 ? (Math.pow(multiple, 1/7) - 1) * 100 : -100;
    results.push(irr);
  }
  results.sort((a,b) => a - b);
  return {
    p10: results[Math.floor(runs*0.1)],
    p25: results[Math.floor(runs*0.25)],
    p50: results[Math.floor(runs*0.5)],
    p75: results[Math.floor(runs*0.75)],
    p90: results[Math.floor(runs*0.9)],
    distribution: results,
  };
}

function buildHistogram(distribution, bins = 20) {
  if (!distribution || !distribution.length) return [];
  const min = distribution[0];
  const max = distribution[distribution.length - 1];
  const range = (max - min) || 1;
  const step = range / bins;
  const counts = new Array(bins).fill(0);
  for (const v of distribution) {
    let idx = Math.floor((v - min) / step);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  const out = [];
  for (let i = 0; i < bins; i++) {
    const lo = min + step * i;
    const hi = lo + step;
    out.push({
      binStart: lo,
      binEnd: hi,
      label: `${lo.toFixed(1)}…${hi.toFixed(1)}`,
      count: counts[i],
    });
  }
  return out;
}

function HistTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        color: COLORS.text,
        fontSize: 13,
      }}
    >
      IRR {d.label}% → {d.count} симуляций
    </div>
  );
}

function LineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        color: COLORS.text,
        fontSize: 13,
      }}
    >
      <strong>{label}</strong>: IRR {payload[0].value.toFixed(2)}%
    </div>
  );
}

// --- M1 Marquee: MonteCarloSimulator ---
function MonteCarloSimulator() {
  const [hitRate, setHitRate] = useState(25);
  const [avgMult, setAvgMult] = useState(2.3);
  const [lossRate, setLossRate] = useState(12);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      const r = runMonteCarlo(10000, hitRate / 100, avgMult, lossRate / 100, 42);
      setResult(r);
      setRunCount((n) => n + 1);
    }, 150);
    return () => clearTimeout(id);
  }, [hitRate, avgMult, lossRate]);

  const onRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const r = runMonteCarlo(10000, hitRate / 100, avgMult, lossRate / 100, 42);
      setResult(r);
      setRunCount((n) => n + 1);
      setRunning(false);
    }, 30);
  }, [hitRate, avgMult, lossRate]);

  const hist = useMemo(() => (result ? buildHistogram(result.distribution, 20) : []), [result]);

  const percentiles = useMemo(() => {
    if (!result) return null;
    return [
      { key: 'p10', label: 'P10', val: result.p10 },
      { key: 'p25', label: 'P25', val: result.p25 },
      { key: 'p50', label: 'P50', val: result.p50 },
      { key: 'p75', label: 'P75', val: result.p75 },
      { key: 'p90', label: 'P90', val: result.p90 },
    ];
  }, [result]);

  const sliderStyle = {
    width: '100%',
    accentColor: COLORS.accentWarm,
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(244,162,97,0.06) 0%, rgba(42,157,143,0.06) 100%)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 32,
        marginTop: 48,
      }}
      aria-label="Marquee-симулятор Monte-Carlo IRR"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40, height: 40, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244,162,97,0.2)', color: COLORS.accentWarm,
          }}
        >
          <Layers size={20} />
        </div>
        <div>
          <div style={{ color: COLORS.accentWarm, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Marquee · M1
          </div>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28, fontWeight: 700, color: COLORS.text,
              margin: 0, lineHeight: 1.2,
            }}
          >
            Monte-Carlo IRR Explorer
          </h3>
        </div>
      </div>
      <p style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.5, marginBottom: 24, maxWidth: 720 }}>
        10 000 симуляций, 7 проектов на симуляцию, seed=42 (repeatable). При дефолтных входах
        (hit=25%, avg=2.3×, loss=12%) ожидаемый P50 ≈ 13.95% — канонический якорь MC p50.
      </p>

      {/* Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
            Hit-rate: <strong style={{ color: COLORS.accentWarm }}>{hitRate}%</strong>
          </span>
          <input
            type="range" min={10} max={40} step={1}
            value={hitRate}
            onChange={(e) => setHitRate(Number(e.target.value))}
            style={sliderStyle}
            aria-label="Доля проектов-победителей (hit rate)"
          />
          <span style={{ color: COLORS.muted, fontSize: 11 }}>10–40%</span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
            Avg. Multiple: <strong style={{ color: COLORS.accentWarm }}>{avgMult.toFixed(1)}×</strong>
          </span>
          <input
            type="range" min={1.5} max={4.0} step={0.1}
            value={avgMult}
            onChange={(e) => setAvgMult(Number(e.target.value))}
            style={sliderStyle}
            aria-label="Средний множитель возврата на победителях"
          />
          <span style={{ color: COLORS.muted, fontSize: 11 }}>1.5×–4.0×</span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
            Loss-rate: <strong style={{ color: COLORS.accentWarm }}>{lossRate}%</strong>
          </span>
          <input
            type="range" min={5} max={25} step={1}
            value={lossRate}
            onChange={(e) => setLossRate(Number(e.target.value))}
            style={sliderStyle}
            aria-label="Доля проектов-потерь (loss rate)"
          />
          <span style={{ color: COLORS.muted, fontSize: 11 }}>5–25%</span>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={onRun}
          disabled={running}
          style={{
            background: COLORS.accentWarm,
            color: COLORS.bg,
            border: 'none',
            padding: '10px 22px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: running ? 'wait' : 'pointer',
            opacity: running ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
          aria-label="Запустить 10 000 симуляций Monte-Carlo"
        >
          <PlayCircle size={16} />
          {running ? 'Считаем…' : 'Run 10 000 simulations'}
        </button>
        <span style={{ color: COLORS.muted, fontSize: 12 }}>
          runs: {runCount} · seed=42
        </span>
      </div>

      {percentiles && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
          className="mc-percentiles"
        >
          {percentiles.map((p) => (
            <div
              key={p.key}
              style={{
                background: COLORS.surface,
                border: `1px solid ${p.key === 'p50' ? COLORS.accentWarm : COLORS.border}`,
                borderRadius: 10,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: '0.08em' }}>
                {p.label}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: p.key === 'p50' ? COLORS.accentWarm : COLORS.text,
                  lineHeight: 1.2,
                }}
                aria-live="polite"
              >
                {p.val.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {hist.length > 0 && (
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 16,
            height: 280,
          }}
          aria-label="Гистограмма распределения IRR, 20 корзин"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: COLORS.muted, fontSize: 10 }}
                interval={Math.floor(hist.length / 6)}
              />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
              <Tooltip content={<HistTooltip />} />
              <Bar dataKey="count" fill={COLORS.accentWarm} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ReturnsTable({ data }) {
  const rows = [
    { label: 'IRR',  val: `${data.irr.toFixed(2)}%` },
    { label: 'MOIC', val: `${data.moic.toFixed(2)}×` },
    { label: 'TVPI', val: `${data.tvpi.toFixed(2)}×` },
    { label: 'DPI (Y7)', val: `${data.dpi.toFixed(2)}×` },
  ];
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <table
        style={{ width: '100%', borderCollapse: 'collapse', color: COLORS.text }}
        aria-label={`Ключевые метрики доходности сценария ${data.label}`}
      >
        <thead>
          <tr style={{ background: 'rgba(42,157,143,0.08)' }}>
            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, letterSpacing: '0.08em', color: COLORS.muted, textTransform: 'uppercase' }}>
              Метрика
            </th>
            <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, letterSpacing: '0.08em', color: COLORS.muted, textTransform: 'uppercase' }}>
              {data.label}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.label}
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                background: i % 2 === 1 ? 'rgba(20,23,28,0.4)' : 'transparent',
              }}
            >
              <td style={{ padding: '12px 16px', fontSize: 14 }}>{r.label}</td>
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: 18,
                  fontWeight: 700,
                  textAlign: 'right',
                  color: COLORS.accentWarm,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {r.val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IrrTrajectory({ data }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 16,
        height: 300,
      }}
      aria-label={`Траектория IRR по годам — ${data.label}`}
    >
      <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 8px' }}>
        IRR trajectory Y1–Y7
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data.trajectory} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fill: COLORS.muted, fontSize: 12 }} />
          <YAxis tick={{ fill: COLORS.muted, fontSize: 12 }} unit="%" />
          <Tooltip content={<LineTooltip />} />
          <Line
            type="monotone"
            dataKey="irr"
            stroke={COLORS.accentWarm}
            strokeWidth={3}
            dot={{ fill: COLORS.accentWarm, r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Returns() {
  const [tab, setTab] = useState('internal');
  const data = RETURNS_DATA[tab];

  return (
    <section id="returns" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Доходность
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            Internal IRR 24.75% · Public IRR 20.09%
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Два сценария из финмодели v1.4.4: Internal (W₅ V-D) и Public (W₃). MOIC 2.2×+, горизонт 7 лет.
            Якоря сверены с canon.returns — см. Monte-Carlo explorer ниже для чувствительности.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Выбор сценария доходности"
          style={{
            display: 'inline-flex',
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {[
            { id: 'internal', label: 'Internal · W₅ V-D' },
            { id: 'public',   label: 'Public · W₃' },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  background: active ? COLORS.accentWarm : 'transparent',
                  color: active ? COLORS.bg : COLORS.text,
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 360px) 1fr',
            gap: 24,
          }}
          className="returns-grid"
        >
          <ReturnsTable data={data} />
          <IrrTrajectory data={data} />
        </div>

        <MonteCarloSimulator />
      </div>
    </section>
  );
}

// =============================================================================
// s07 — Pipeline (7 posters, filter chips, inline Modal)
// SSOT: canon.pipeline.projects (p01..p07). Stage mapping from status:
//   pre-production → pre, production → prod, post-production → post, release → release
// Images: img10..img16
// =============================================================================

const PIPELINE = [
  { id: 'img10', pid: 'p01', title: 'Проект Alpha',    type: 'film',   genre: 'драма',          stage: 'prod',    budget_mln: 350, target_rev_mln: 850,  target_irr: 28, release: 2027, alt: 'Постер проекта 1 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img11', pid: 'p02', title: 'Проект Bravo',    type: 'film',   genre: 'триллер',        stage: 'pre',     budget_mln: 280, target_rev_mln: 720,  target_irr: 32, release: 2027, alt: 'Постер проекта 2 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img12', pid: 'p03', title: 'Проект Charlie',  type: 'film',   genre: 'исторический',   stage: 'pre',     budget_mln: 600, target_rev_mln: 1400, target_irr: 26, release: 2028, alt: 'Постер проекта 3 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img13', pid: 'p04', title: 'Проект Delta',    type: 'series', genre: 'premium-драма',  stage: 'prod',    budget_mln: 520, target_rev_mln: 1250, target_irr: 24, release: 2028, alt: 'Постер проекта 4 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img14', pid: 'p05', title: 'Проект Echo',     type: 'film',   genre: 'семейный',       stage: 'post',    budget_mln: 180, target_rev_mln: 520,  target_irr: 30, release: 2027, alt: 'Постер проекта 5 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img15', pid: 'p06', title: 'Проект Foxtrot',  type: 'series', genre: 'жанровый',       stage: 'pre',     budget_mln: 420, target_rev_mln: 980,  target_irr: 22, release: 2029, alt: 'Постер проекта 6 — кинематографическая композиция в тёплой тёмной палитре' },
  { id: 'img16', pid: 'p07', title: 'Проект Gamma',    type: 'film',   genre: 'авторский',      stage: 'pre',     budget_mln: 220, target_rev_mln: 480,  target_irr: 18, release: 2029, alt: 'Постер проекта 7 — кинематографическая композиция в тёплой тёмной палитре' },
];

const STAGE_META = {
  pre:     { label: 'Pre-production',  color: COLORS.stagePre },
  prod:    { label: 'Production',      color: COLORS.stageProd },
  post:    { label: 'Post-production', color: COLORS.stagePost },
  release: { label: 'Release',         color: COLORS.stageRelease },
};

// Static placeholder map — each entry is a string-literal token so the orchestrator
// regex `__IMG_PLACEHOLDER_imgNN__` can match in compiled HTML text (not a JS template).
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

const PIPELINE_FILTERS = [
  { id: 'all',    label: 'Все' },
  { id: 'film',   label: 'Фильм', match: (p) => p.type === 'film' },
  { id: 'series', label: 'Сериал', match: (p) => p.type === 'series' },
  { id: 'pre',    label: 'Pre',     match: (p) => p.stage === 'pre' },
  { id: 'prod',   label: 'Prod',    match: (p) => p.stage === 'prod' },
  { id: 'post',   label: 'Post',    match: (p) => p.stage === 'post' },
  { id: 'release', label: 'Release', match: (p) => p.stage === 'release' },
];

function ProjectCard({ project, onOpen, prefersReducedMotion }) {
  const stage = STAGE_META[project.stage] || STAGE_META.pre;
  return (
    <button
      onClick={() => onOpen(project)}
      aria-label={`Открыть детали — ${project.title} (${project.genre}, ${stage.label})`}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: COLORS.text,
        display: 'flex',
        flexDirection: 'column',
        transition: prefersReducedMotion ? 'none' : 'transform 300ms ease, border-color 300ms ease',
      }}
      onMouseEnter={(e) => {
        if (!prefersReducedMotion) {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
        e.currentTarget.style.borderColor = COLORS.accentWarm;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', background: COLORS.bg }}>
        <img
          src={IMG_SRC[project.id]}
          alt={project.alt}
          loading="lazy"
          width="1200"
          height="1800"
          className={prefersReducedMotion ? 'w-full h-full object-cover' : 'w-full h-full object-cover transition-transform duration-500 hover:scale-105'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 12, left: 12,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(11,13,16,0.72)',
            color: stage.color,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: `1px solid ${stage.color}`,
          }}
        >
          {stage.label}
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </div>
        <div style={{ color: COLORS.muted, fontSize: 13 }}>
          {project.type === 'series' ? 'Сериал' : 'Фильм'} · {project.genre} · релиз {project.release}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
          <span style={{ color: COLORS.accentCool }}>Бюджет {project.budget_mln} млн ₽</span>
          <span style={{ color: COLORS.accentWarm }}>IRR {project.target_irr}%</span>
        </div>
      </div>
    </button>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!project) return null;
  const stage = STAGE_META[project.stage] || STAGE_META.pre;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Детали проекта ${project.title}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,13,16,0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: 28,
          position: 'relative',
          color: COLORS.text,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: COLORS.muted,
            cursor: 'pointer',
            padding: 6,
          }}
        >
          <X size={22} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(160px, 200px) 1fr',
            gap: 20,
            alignItems: 'start',
          }}
          className="project-modal-grid"
        >
          <img
            src={IMG_SRC[project.id]}
            alt={project.alt}
            loading="lazy"
            style={{
              width: '100%',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: 10,
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(11,13,16,0.6)',
                color: stage.color,
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: `1px solid ${stage.color}`,
                alignSelf: 'flex-start',
              }}
            >
              {stage.label}
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                color: COLORS.text,
                lineHeight: 1.15,
              }}
            >
              {project.title}
            </h3>
            <div style={{ color: COLORS.muted, fontSize: 14 }}>
              {project.type === 'series' ? 'Сериал' : 'Фильм'} · {project.genre} · релиз {project.release}
            </div>
            <dl
              style={{
                margin: '8px 0 0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px 16px',
              }}
            >
              <div>
                <dt style={{ color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Бюджет</dt>
                <dd style={{ color: COLORS.text, fontSize: 18, margin: 0, fontWeight: 600 }}>{project.budget_mln} млн ₽</dd>
              </div>
              <div>
                <dt style={{ color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target IRR</dt>
                <dd style={{ color: COLORS.accentWarm, fontSize: 18, margin: 0, fontWeight: 600 }}>{project.target_irr}%</dd>
              </div>
              <div>
                <dt style={{ color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Revenue</dt>
                <dd style={{ color: COLORS.text, fontSize: 18, margin: 0, fontWeight: 600 }}>{project.target_rev_mln} млн ₽</dd>
              </div>
              <div>
                <dt style={{ color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Релиз</dt>
                <dd style={{ color: COLORS.text, fontSize: 18, margin: 0, fontWeight: 600 }}>{project.release}</dd>
              </div>
            </dl>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 12, lineHeight: 1.55 }}>
              Проект {project.pid.toUpperCase()} входит в портфель фонда. Финансовая модель v1.4.4
              прошла 348 тестов; стадийная диаграмма — в секции «Стадии». Конфиденциальные детали
              производства раскрываются после подписания NDA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ prefersReducedMotion }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const list = useMemo(() => {
    const f = PIPELINE_FILTERS.find((x) => x.id === activeFilter);
    if (!f || !f.match) return PIPELINE;
    return PIPELINE.filter(f.match);
  }, [activeFilter]);

  return (
    <section id="pipeline" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Пайплайн проектов
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            7 проектов — от драмы до premium-сериала
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Диверсифицированный портфель: 5 фильмов и 2 сериала, жанровая палитра от авторского
            до premium-драмы. Бюджеты 180–600 млн ₽, таргет-IRR 18–32%. Релизы 2027–2029.
          </p>
        </header>

        {/* Filter chips */}
        <div
          role="tablist"
          aria-label="Фильтр проектов"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}
        >
          {PIPELINE_FILTERS.map((f) => {
            const active = f.id === activeFilter;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: `1px solid ${active ? COLORS.accentWarm : COLORS.border}`,
                  background: active ? COLORS.accentWarm : 'transparent',
                  color: active ? COLORS.bg : COLORS.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {list.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={setSelected}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {list.length === 0 && (
          <div
            style={{
              color: COLORS.muted,
              fontSize: 15,
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            Нет проектов с выбранным фильтром.
          </div>
        )}

        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
}

// =============================================================================
// s08 — Stages (4-column kanban)
// Groups the 7 projects by their current stage.
// =============================================================================

function Stages() {
  const columns = useMemo(() => {
    const order = ['pre', 'prod', 'post', 'release'];
    const map = { pre: [], prod: [], post: [], release: [] };
    for (const p of PIPELINE) {
      if (map[p.stage]) map[p.stage].push(p);
    }
    return order.map((id) => ({
      id,
      meta: STAGE_META[id],
      items: map[id],
    }));
  }, []);

  return (
    <section id="stages" style={{ padding: '96px 0', background: COLORS.surface }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Стадии производства
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            Kanban: 4 стадии × 7 проектов
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Статус портфеля на 2026-04. Gate-review между стадиями, budget tolerance ±15%,
            stop-loss на превышении — дисциплина production management.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 220,
              }}
              aria-label={`Стадия ${col.meta.label} — ${col.items.length} проектов`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 8,
                  borderBottom: `2px solid ${col.meta.color}`,
                }}
              >
                <span
                  style={{
                    color: col.meta.color,
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {col.meta.label}
                </span>
                <span
                  style={{
                    background: col.meta.color,
                    color: COLORS.bg,
                    borderRadius: 999,
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {col.items.length}
                </span>
              </div>

              {col.items.length === 0 ? (
                <div style={{ color: COLORS.muted, fontSize: 13, fontStyle: 'italic', padding: '8px 4px' }}>
                  Нет проектов
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.items.map((p) => (
                    <li
                      key={p.pid}
                      style={{
                        background: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 15,
                          fontWeight: 700,
                          color: COLORS.text,
                          lineHeight: 1.2,
                        }}
                      >
                        {p.title}
                      </div>
                      <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                        {p.genre} · {p.release}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s09 — Team (5 portraits, img01..img05)
// SSOT: canon.team.members (masked-name roles)
// =============================================================================

const TEAM = [
  {
    id: 'img01',
    slot: 'CEO',
    name: 'Chief Executive Officer',
    title: 'CEO · Chief Executive Officer',
    bio: '20+ лет в продюсировании и управлении производственными компаниями.',
    track: ['12 релизных фильмов', '3 международных фестиваля', '2 OTT-оригинала'],
    alt: 'Портрет CEO ТрендСтудио Холдинг — кинематографический портрет в тёмных тонах',
  },
  {
    id: 'img02',
    slot: 'Producer Lead',
    name: 'Head of Production',
    title: 'Lead Producer · Head of Production',
    bio: 'Продюсер полного цикла: от development до theatrical release.',
    track: ['18 проектов разной стадии', 'Opening Night Cannes Directors Fortnight', 'Кинотавр Главный приз'],
    alt: 'Портрет главного продюсера холдинга',
  },
  {
    id: 'img03',
    slot: 'CFO',
    name: 'Chief Financial Officer',
    title: 'CFO · Chief Financial Officer',
    bio: '15+ лет в finance — M&A, fund structuring, production accounting.',
    track: ['5 закрытых фондов', 'IPO-опыт', 'Big-4 background'],
    alt: 'Портрет финансового директора (CFO)',
  },
  {
    id: 'img04',
    slot: 'Head of Distribution',
    name: 'Head of Distribution & IP',
    title: 'Head of Distribution & IP',
    bio: 'Выстраивал OTT-pipeline для крупнейших российских платформ.',
    track: ['Lead на 40+ OTT-сделках', 'Международный sales — 25 стран'],
    alt: 'Портрет главы дистрибуции',
  },
  {
    id: 'img05',
    slot: 'Creative Director',
    name: 'Creative Director',
    title: 'Creative Director',
    bio: 'Авторский голос холдинга. Режиссёр и scriptwriter.',
    track: ['3 фестивальных фильма', 'Сценарист для 8 проектов'],
    alt: 'Портрет креативного директора',
  },
];

function TeamCard({ member }) {
  return (
    <figure
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <img
        src={IMG_SRC[member.id]}
        alt={member.alt}
        loading="lazy"
        width="800"
        height="1000"
        style={{
          width: '100%',
          aspectRatio: '4 / 5',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <figcaption style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            color: COLORS.accentCool,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {member.slot}
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: 1.25,
          }}
        >
          {member.name}
        </div>
        <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {member.bio}
        </p>
        <ul
          style={{
            listStyle: 'none',
            margin: '6px 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {member.track.map((t, i) => (
            <li
              key={i}
              style={{
                color: COLORS.text,
                fontSize: 12,
                paddingLeft: 14,
                position: 'relative',
                lineHeight: 1.4,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 7,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: COLORS.accentWarm,
                }}
              />
              {t}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

function Team() {
  return (
    <section id="team" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Команда
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            5 человек ядра: development → IP management
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Вертикальная интеграция — от зелёного света до прокатного релиза. Вакансии key-person
            зафиксированы в term-sheet: при уходе лидера — right to pause investment period.
          </p>
        </header>

        <div
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {TEAM.map((m) => (
            <TeamCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s10 — Advisory (4 portraits, img06..img09, round with sepia)
// SSOT: canon.advisory_board.members
// =============================================================================

const ADVISORS = [
  {
    id: 'img06',
    slot: 'Industry Veteran',
    name: 'Senior Industry Advisor',
    bio: '40+ лет в индустрии, экс-CEO крупного российского киноконцерна.',
    focus: ['industry relations', 'strategy'],
    alt: 'Портрет члена экспертного совета — ветерана киноиндустрии',
  },
  {
    id: 'img07',
    slot: 'Finance Advisor',
    name: 'Finance Advisor',
    bio: 'Экс-партнёр private equity, структурирование фондов.',
    focus: ['fund structuring', 'lp relations', 'governance'],
    alt: 'Портрет финансового советника экспертного совета',
  },
  {
    id: 'img08',
    slot: 'Distribution Advisor',
    name: 'Distribution Advisor',
    bio: 'Экс-руководитель OTT-платформы, отвечал за оригинальный контент.',
    focus: ['OTT strategy', 'content curation'],
    alt: 'Портрет советника по дистрибуции',
  },
  {
    id: 'img09',
    slot: 'International Advisor',
    name: 'International Advisor',
    bio: 'Международный sales agent, работа с фестивалями и pre-sales.',
    focus: ['international sales', 'festivals', 'co-productions'],
    alt: 'Портрет международного советника',
  },
];

function AdvisorCard({ advisor }) {
  return (
    <article
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
      }}
    >
      <img
        src={IMG_SRC[advisor.id]}
        alt={advisor.alt}
        loading="lazy"
        width="800"
        height="1000"
        style={{
          width: '100%',
          maxWidth: 220,
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          borderRadius: '50%',
          filter: 'sepia(0.3) brightness(0.9)',
          display: 'block',
        }}
      />
      <div
        style={{
          color: COLORS.accentCool,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: 8,
        }}
      >
        {advisor.slot}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.text,
          lineHeight: 1.25,
        }}
      >
        {advisor.name}
      </div>
      <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
        {advisor.bio}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        {advisor.focus.map((f) => (
          <span
            key={f}
            style={{
              color: COLORS.accentWarm,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 999,
              background: 'rgba(244,162,97,0.1)',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </article>
  );
}

function Advisory() {
  return (
    <section id="advisory" style={{ padding: '96px 0', background: COLORS.surface }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Advisory Board
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            4 эксперта: индустрия · финансы · дистрибуция · международные рынки
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Советники формируют LPAC и подключаются к gate-review. Без права голоса на greenlight,
            но с правом вето по ключевым сделкам > 500 млн ₽.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {ADVISORS.map((a) => (
            <AdvisorCard key={a.id} advisor={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s11 — Operations (6-step SVG process with icons)
// =============================================================================

const OPERATIONS_STEPS = [
  {
    id: 'origination',
    icon: FileText,
    title: 'Origination',
    sub: 'Скаутинг и отбор',
    descr: 'Deal flow от сценаристов, агентств, развитых IP-холдингов. 50+ заявок/год → shortlist 10.',
  },
  {
    id: 'greenlight',
    icon: CheckCircle,
    title: 'Green-light',
    sub: 'Gate-review № 1',
    descr: 'IC-решение: MC-симуляция IRR, бюджетный draft, casting preview, contracts readiness.',
  },
  {
    id: 'development',
    icon: Lightbulb,
    title: 'Development',
    sub: 'Сценарий и пакет',
    descr: 'Финализация сценария, attachments, юридика, детальный бюджет с budget tolerance ±15%.',
  },
  {
    id: 'production',
    icon: Video,
    title: 'Production',
    sub: 'Съёмки + post',
    descr: 'Physical production + post-production. Weekly budget tracking, stop-loss на превышении.',
  },
  {
    id: 'distribution',
    icon: Megaphone,
    title: 'Distribution',
    sub: 'Theatrical + OTT',
    descr: 'Theatrical window, OTT-продажа, licensing, международный sales, festival run.',
  },
  {
    id: 'exit',
    icon: TrendingUp,
    title: 'Exit',
    sub: 'IP & residuals',
    descr: 'Library-монетизация, remake rights, sequel options. DPI Y5 → Y7, возврат LP с carry.',
  },
];

function OperationStep({ step, idx, total, prefersReducedMotion }) {
  const Icon = step.icon;
  return (
    <div
      style={{
        position: 'relative',
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: prefersReducedMotion ? 'none' : 'transform 200ms ease, border-color 200ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accentWarm; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40, height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(244,162,97,0.15)',
            color: COLORS.accentWarm,
          }}
        >
          <Icon size={20} />
        </div>
        <div
          style={{
            color: COLORS.muted,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Шаг {idx + 1} / {total}
        </div>
      </div>
      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {step.title}
        </h3>
        <div style={{ color: COLORS.accentCool, fontSize: 12, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {step.sub}
        </div>
      </div>
      <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
        {step.descr}
      </p>
    </div>
  );
}

function Operations({ prefersReducedMotion }) {
  const total = OPERATIONS_STEPS.length;
  return (
    <section id="operations" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Операционный процесс
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.text,
              margin: 0,
            }}
          >
            6 шагов от скаутинга до exit
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Каждая сделка проходит через те же 6 gate'ов. На каждом шаге — MC-симуляция IRR,
            бюджетная проверка, юридика, контрактная обвязка.
          </p>
        </header>

        {/* Horizontal connector — decorative svg line visible on md+ */}
        <div
          aria-hidden="true"
          className="operations-connector"
          style={{
            position: 'relative',
            height: 0,
          }}
        >
          <svg
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: 56,
              left: 0,
              width: '100%',
              height: 2,
              opacity: 0.35,
            }}
          >
            <line x1="0" y1="1" x2="100" y2="1" stroke={COLORS.accentWarm} strokeWidth="0.3" strokeDasharray="2 2" />
          </svg>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            position: 'relative',
          }}
        >
          {OPERATIONS_STEPS.map((s, i) => (
            <OperationStep
              key={s.id}
              step={s}
              idx={i}
              total={total}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        <div
          aria-hidden="true"
          style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: COLORS.muted,
            fontSize: 13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Clapperboard size={16} />
          <span>Origination → Exit</span>
          <ArrowRight size={16} />
          <span style={{ color: COLORS.accentWarm, fontWeight: 600 }}>DPI Y7 · возврат LP</span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s12 — Risks: 3×3 Likelihood × Impact matrix + click Modal
// SSOT: canon.risks.items (12 entries, probability=likelihood, severity=impact)
// =============================================================================

const RISKS = [
  { id: 'r01', likelihood: 'med',  impact: 'med',  title: 'Падение theatrical-спроса',      category: 'market',      description: 'Структурный сдвиг в сторону OTT снижает box office.',                      mitigation: 'Гибкое распределение revenue между окнами, более агрессивный OTT-licensing.' },
  { id: 'r02', likelihood: 'high', impact: 'med',  title: 'Срыв сроков production',         category: 'production',  description: 'Погодные, логистические, cast-availability риски.',                        mitigation: 'Contingency 15% в бюджете, insurance, параллельные slots production.' },
  { id: 'r03', likelihood: 'med',  impact: 'high', title: 'Overspend > 15%',                category: 'production',  description: 'Перерасход production budget.',                                            mitigation: 'Gate-review на каждой стадии, stop-loss по превышению порога.' },
  { id: 'r04', likelihood: 'low',  impact: 'med',  title: 'Задержка LP capital calls',      category: 'financial',   description: 'Задержки call-ов со стороны LP.',                                          mitigation: 'Bridge-facility с банком-партнёром, диверсификация LP-базы.' },
  { id: 'r05', likelihood: 'med',  impact: 'high', title: 'Изменения в гос.регулировании',  category: 'regulatory',  description: 'Корректировка правил контент-регулирования.',                              mitigation: 'Legal advisor in-house, сценарии с early-warning.' },
  { id: 'r06', likelihood: 'med',  impact: 'med',  title: 'Потеря OTT-канала',              category: 'distribution', description: 'Изменение стратегии ключевого OTT-партнёра.',                             mitigation: 'Диверсификация OTT (минимум 3 платформы).' },
  { id: 'r07', likelihood: 'low',  impact: 'high', title: 'Key-person risk',                category: 'team',        description: 'Уход ключевого члена команды.',                                             mitigation: 'Key-person clause в LP agreement, bench depth.' },
  { id: 'r08', likelihood: 'med',  impact: 'med',  title: 'Дефицит режиссёров/актёров',     category: 'talent',      description: 'Конкуренция за top talent с другими студиями.',                            mitigation: 'Long-term multi-project deals, retainer-контракты.' },
  { id: 'r09', likelihood: 'med',  impact: 'med',  title: 'Технологическая disruption (AI)', category: 'technology', description: 'AI-контент меняет экономику production.',                                  mitigation: 'Внедрение AI-инструментов в pre-viz, VFX, dubbing.' },
  { id: 'r10', likelihood: 'med',  impact: 'med',  title: 'Валютные риски',                 category: 'financial',   description: 'Импортное оборудование, международные расчёты.',                          mitigation: 'Forward-контракты на валюту, локализация supply chain.' },
  { id: 'r11', likelihood: 'low',  impact: 'med',  title: 'Недостижение hurdle rate',       category: 'financial',   description: 'IRR ниже 8% → нулевой carry для GP.',                                       mitigation: 'Дисциплина гейтов, гибкое перераспределение budget между проектами.' },
  { id: 'r12', likelihood: 'high', impact: 'low',  title: 'Пиратство и копирайт',           category: 'legal',       description: 'Неконтролируемое распространение контента.',                               mitigation: 'Anti-piracy сервисы, DMCA-процедуры, watermarking.' },
];

const RISK_LIKELIHOODS = ['low', 'med', 'high'];
const RISK_IMPACTS     = ['low', 'med', 'high'];
const RISK_LABELS = {
  low:  'Низкая',
  med:  'Средняя',
  high: 'Высокая',
};

function riskCellColor(likelihood, impact) {
  // low+low = green (accentCool teal), middle diagonals = orange (accentWarm), high+high = danger red
  if (likelihood === 'low' && impact === 'low') return COLORS.accentCool;
  if (likelihood === 'high' && impact === 'high') return COLORS.danger;
  // corners that contain a 'high' on one axis → warm
  if (likelihood === 'high' || impact === 'high') return COLORS.accentWarm;
  // everything else = neutral warm tint
  return COLORS.accentWarm;
}

function RiskModal({ risk, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!risk) return null;
  const cellColor = riskCellColor(risk.likelihood, risk.impact);
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Детали риска ${risk.title}`}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,13,16,0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          border: `1px solid ${cellColor}`,
          borderRadius: 16, maxWidth: 560, width: '100%',
          padding: 28, position: 'relative', color: COLORS.text,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'transparent', border: 'none', color: COLORS.muted,
            cursor: 'pointer', padding: 6,
          }}
        >
          <X size={22} />
        </button>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(11,13,16,0.6)',
            color: cellColor, border: `1px solid ${cellColor}`,
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          <AlertTriangle size={12} />
          {risk.category}
        </div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26, fontWeight: 700, margin: 0,
            color: COLORS.text, lineHeight: 1.2,
          }}
        >
          {risk.title}
        </h3>
        <div
          style={{
            display: 'flex', gap: 16, flexWrap: 'wrap',
            marginTop: 12, marginBottom: 12,
            color: COLORS.muted, fontSize: 13,
          }}
        >
          <span>Вероятность: <strong style={{ color: COLORS.text }}>{RISK_LABELS[risk.likelihood]}</strong></span>
          <span>Импакт: <strong style={{ color: COLORS.text }}>{RISK_LABELS[risk.impact]}</strong></span>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Описание
          </div>
          <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.55, margin: 0 }}>
            {risk.description}
          </p>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Mitigation
          </div>
          <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.55, margin: 0 }}>
            {risk.mitigation}
          </p>
        </div>
      </div>
    </div>
  );
}

function Risks() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const grid = useMemo(() => {
    // rows = likelihood (top=high), cols = impact (right=high)
    const rows = ['high', 'med', 'low'];
    const cols = ['low', 'med', 'high'];
    return rows.map((lk) => cols.map((im) => RISKS.filter((r) => r.likelihood === lk && r.impact === im)));
  }, []);

  const rowLabels = ['Высокая', 'Средняя', 'Низкая'];
  const colLabels = ['Низкий',  'Средний', 'Высокий'];

  return (
    <section id="risks" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Риски
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            Матрица 3×3: Вероятность × Импакт · 12 ключевых рисков
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Кликните по риску, чтобы увидеть описание и mitigation-план. Категории: market, production,
            financial, regulatory, distribution, team, talent, technology, legal.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto repeat(3, 1fr)',
            gap: 10,
          }}
          className="risks-matrix"
        >
          {/* Header row */}
          <div />
          {colLabels.map((l, i) => (
            <div
              key={'ch'+i}
              style={{
                color: COLORS.muted, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                textAlign: 'center', padding: '6px 4px',
              }}
            >
              Импакт: {l}
            </div>
          ))}

          {/* 3×3 body */}
          {grid.map((row, rIdx) => (
            <React.Fragment key={'r'+rIdx}>
              <div
                style={{
                  color: COLORS.muted, fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  padding: '6px 8px', textAlign: 'right',
                }}
              >
                Верт. {rowLabels[rIdx]}
              </div>
              {row.map((cellRisks, cIdx) => {
                // rIdx: 0=high, 1=med, 2=low ; cIdx: 0=low, 1=med, 2=high
                const lk = ['high','med','low'][rIdx];
                const im = ['low','med','high'][cIdx];
                const color = riskCellColor(lk, im);
                return (
                  <div
                    key={`c-${rIdx}-${cIdx}`}
                    style={{
                      background: COLORS.surface,
                      border: `1px solid ${color}`,
                      borderLeft: `4px solid ${color}`,
                      borderRadius: 10,
                      padding: 12,
                      minHeight: 120,
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                    aria-label={`Клетка вероятность ${RISK_LABELS[lk]}, импакт ${RISK_LABELS[im]}: ${cellRisks.length} рисков`}
                  >
                    {cellRisks.length === 0 ? (
                      <div style={{ color: COLORS.muted, fontSize: 12, fontStyle: 'italic' }}>—</div>
                    ) : (
                      cellRisks.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRisk(r)}
                          style={{
                            background: 'rgba(11,13,16,0.5)',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 6,
                            padding: '6px 8px',
                            color: COLORS.text,
                            fontSize: 12,
                            textAlign: 'left',
                            cursor: 'pointer',
                            lineHeight: 1.35,
                          }}
                          aria-label={`Открыть риск ${r.id.toUpperCase()}: ${r.title}`}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
                        >
                          <strong style={{ color }}>{r.id.toUpperCase()}</strong> · {r.title}
                        </button>
                      ))
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: 16, color: COLORS.muted, fontSize: 13 }}>
          Всего {RISKS.length} рисков · Подсвечены: зелёный = low/low, красный = high/high, оранжевый = диагонали.
        </div>

        <RiskModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
      </div>
    </section>
  );
}

// =============================================================================
// s13 — Roadmap: 7-year Gantt SVG (2026–2032), 4 swimlanes + pulse milestones
// =============================================================================

const ROADMAP_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

const ROADMAP_LANES = [
  {
    id: 'fund',
    label: 'Fundraising',
    color: COLORS.accentCool,
    bars: [
      { start: 2026.0, end: 2027.25, title: 'First close 1 500 → Final close 3 000 млн ₽' },
    ],
    milestones: [
      { year: 2026.6, label: 'First close 1 500 млн ₽' },
      { year: 2027.0, label: 'Final close 3 000 млн ₽' },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio buildout',
    color: COLORS.stageProd,
    bars: [
      // 7 sub-bars mapping PIPELINE projects across 2026 Q2 → 2029
      { start: 2026.25, end: 2027.75, title: 'p01 Alpha · production → release' },
      { start: 2026.25, end: 2028.0,  title: 'p04 Delta · production → release' },
      { start: 2026.5,  end: 2028.0,  title: 'p05 Echo · post → release 2027' },
      { start: 2026.75, end: 2028.25, title: 'p02 Bravo · pre → release 2027' },
      { start: 2027.0,  end: 2028.5,  title: 'p03 Charlie · pre → release 2028' },
      { start: 2028.0,  end: 2029.5,  title: 'p06 Foxtrot · pre → release 2029' },
      { start: 2028.5,  end: 2029.75, title: 'p07 Gamma · pre → release 2029' },
    ],
    milestones: [
      { year: 2027.0, label: 'Production start p02, p03' },
      { year: 2029.25, label: 'Last greenlights' },
    ],
  },
  {
    id: 'distribution',
    label: 'Distribution',
    color: COLORS.stagePost,
    bars: [
      { start: 2027.0, end: 2031.5, title: 'Theatrical + OTT + international sales' },
    ],
    milestones: [
      { year: 2027.75, label: 'First theatrical release' },
      { year: 2028.25, label: 'Start international sales' },
    ],
  },
  {
    id: 'exits',
    label: 'Exits & DPI',
    color: COLORS.accentWarm,
    bars: [
      { start: 2029.0, end: 2032.5, title: 'DPI + library exits + winding-down' },
    ],
    milestones: [
      { year: 2029.25, label: 'Первые DPI LP' },
      { year: 2030.75, label: 'DPI ≈ 0.45×' },
      { year: 2031.5,  label: 'Pre-exit подготовка' },
      { year: 2032.75, label: 'DPI ≈ 1.85× · winding-down' },
    ],
  },
];

function Roadmap({ prefersReducedMotion }) {
  // Gantt canvas: map year to X coordinate
  const W = 880;      // viewBox width
  const H = 360;      // viewBox height
  const leftGutter = 140;
  const rightPad = 24;
  const topHeader = 40;
  const laneH = 70;
  const laneGap = 8;

  const plotW = W - leftGutter - rightPad;
  const yearSpan = ROADMAP_YEARS.length;  // 7 years 2026-2032
  const yearToX = (year) => leftGutter + ((year - 2026) / yearSpan) * plotW;

  return (
    <section id="roadmap" style={{ padding: '96px 0', background: COLORS.surface }}>
      {/* Inject pulse keyframes (respects prefers-reduced-motion via CSS media) */}
      <style>{`
        @keyframes tsPulse {
          0%   { r: 5; opacity: 1; }
          50%  { r: 8; opacity: 0.55; }
          100% { r: 5; opacity: 1; }
        }
        .ts-pulse { animation: tsPulse 1800ms ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .ts-pulse { animation: none !important; }
        }
      `}</style>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Roadmap
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            7-летний горизонт: 2026 → 2032
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            4 потока: Fundraising, Portfolio Buildout, Distribution, Exits. Пульсирующие точки —
            ключевые milestones. DPI Y7 ≈ 1.85× · возврат LP с carry 20%.
          </p>
        </header>

        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 20,
            overflowX: 'auto',
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: 'block', minWidth: 720 }}
            role="img"
            aria-label="Gantt-диаграмма roadmap 2026–2032: 4 swimlane"
          >
            {/* Year grid */}
            {ROADMAP_YEARS.map((y) => {
              const x = yearToX(y);
              return (
                <g key={y}>
                  <line
                    x1={x} y1={topHeader - 6}
                    x2={x} y2={H - 16}
                    stroke={COLORS.border} strokeWidth={1}
                  />
                  <text
                    x={x} y={topHeader - 12}
                    textAnchor="middle"
                    fill={COLORS.muted}
                    fontSize={12}
                    fontWeight={600}
                  >
                    {y}
                  </text>
                </g>
              );
            })}
            {/* Final grid line (end of 2032) */}
            <line
              x1={yearToX(2033)} y1={topHeader - 6}
              x2={yearToX(2033)} y2={H - 16}
              stroke={COLORS.border} strokeWidth={1}
            />

            {/* Lanes */}
            {ROADMAP_LANES.map((lane, li) => {
              const y0 = topHeader + li * (laneH + laneGap);
              return (
                <g key={lane.id}>
                  {/* lane label */}
                  <text
                    x={leftGutter - 10}
                    y={y0 + laneH / 2 + 4}
                    textAnchor="end"
                    fill={lane.color}
                    fontSize={12}
                    fontWeight={700}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    {lane.label}
                  </text>
                  {/* lane background */}
                  <rect
                    x={leftGutter} y={y0}
                    width={plotW}
                    height={laneH}
                    fill={COLORS.surface}
                    rx={6}
                  />
                  {/* bars */}
                  {lane.bars.map((b, bi) => {
                    const x1 = yearToX(b.start);
                    const x2 = yearToX(b.end);
                    // Stack sub-bars vertically within lane for portfolio (7 bars)
                    const subCount = lane.bars.length;
                    const subH = Math.max(6, (laneH - 16) / Math.max(1, subCount));
                    const subY = y0 + 8 + bi * subH;
                    return (
                      <rect
                        key={bi}
                        x={x1}
                        y={subCount > 1 ? subY : y0 + 18}
                        width={Math.max(4, x2 - x1)}
                        height={subCount > 1 ? Math.max(4, subH - 2) : laneH - 36}
                        fill={lane.color}
                        fillOpacity={0.55}
                        stroke={lane.color}
                        strokeWidth={1}
                        rx={4}
                      >
                        <title>{b.title}</title>
                      </rect>
                    );
                  })}
                  {/* milestones pulse dots */}
                  {lane.milestones.map((m, mi) => {
                    const cx = yearToX(m.year);
                    const cy = y0 + laneH / 2;
                    return (
                      <g key={mi}>
                        <circle
                          cx={cx} cy={cy} r={5}
                          fill={lane.color}
                          className={prefersReducedMotion ? '' : 'ts-pulse'}
                        >
                          <title>{m.label} — {Math.floor(m.year)}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend + milestone list */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          {ROADMAP_LANES.map((lane) => (
            <div
              key={lane.id}
              style={{
                background: COLORS.bg,
                border: `1px solid ${lane.color}`,
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: lane.color, display: 'inline-block',
                  }}
                />
                <span style={{ color: lane.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {lane.label}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {lane.milestones.map((m, i) => (
                  <li key={i} style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.4 }}>
                    <strong style={{ color: COLORS.text }}>{Math.floor(m.year)}</strong> — {m.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s14 — Scenarios: 4 Tabs (Bear / Base / Bull / Moon), KPI table + LineChart
// =============================================================================

const SCENARIOS = {
  bear: {
    id: 'bear',
    label: 'Bear',
    color: COLORS.danger,
    irr: 8, moic: 1.4, tvpi: 1.3, p50: 6,
    descr: '1–2 флопа, падение theatrical −20%, задержки в production.',
    trajectory: [-11.0, -7.5, -3.8, 0.2, 3.2, 6.0, 8.0],
  },
  base: {
    id: 'base',
    label: 'Base',
    color: COLORS.accentCool,
    irr: 20.09, moic: 2.2, tvpi: 1.9, p50: 13.95,
    descr: 'Исторически-средний BO, OTT-рост 20%, budget tolerance ±10%.',
    trajectory: [-9.1, -4.5, 4.8, 11.6, 16.3, 18.9, 20.09],
  },
  bull: {
    id: 'bull',
    label: 'Bull',
    color: COLORS.accentWarm,
    irr: 30, moic: 3.0, tvpi: 2.6, p50: 22,
    descr: '2 хита в портфеле, международные sales +30%, OTT pre-sales × 7.',
    trajectory: [-6.5, -1.0, 8.0, 17.0, 23.0, 27.0, 30.0],
  },
  moon: {
    id: 'moon',
    label: 'Moon',
    color: COLORS.info,
    irr: 45, moic: 4.5, tvpi: 3.8, p50: 35,
    descr: 'Экстремальный upside: 3+ хита, international breakout, IP franchises.',
    trajectory: [-4.5, 3.0, 13.5, 24.0, 32.0, 39.5, 45.0],
  },
};

const SCENARIO_ORDER = ['bear', 'base', 'bull', 'moon'];

function ScenarioLineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        color: COLORS.text,
        fontSize: 13,
      }}
    >
      <strong>{label}</strong>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke, fontSize: 12 }}>
          {p.dataKey.toUpperCase()}: {Number(p.value).toFixed(2)}%
        </div>
      ))}
    </div>
  );
}

function Scenarios() {
  const [activeScenario, setActiveScenario] = useState('base');
  const active = SCENARIOS[activeScenario];

  const chartData = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 7; i++) {
      rows.push({
        year: `Y${i + 1}`,
        bear: SCENARIOS.bear.trajectory[i],
        base: SCENARIOS.base.trajectory[i],
        bull: SCENARIOS.bull.trajectory[i],
        moon: SCENARIOS.moon.trajectory[i],
      });
    }
    return rows;
  }, []);

  return (
    <section id="scenarios" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Сценарии
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            Bear · Base · Bull · Moon — 4 траектории
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Переключите tab, чтобы сравнить IRR, MOIC, TVPI и P50. Base = Public (W₃) 20.09% · MC p50 13.95% —
            канонический якорь. График показывает все 4 линии одновременно, активная — жирная.
          </p>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Выбор сценария"
          style={{
            display: 'inline-flex', flexWrap: 'wrap',
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: 4, marginBottom: 28, gap: 4,
          }}
        >
          {SCENARIO_ORDER.map((sid) => {
            const s = SCENARIOS[sid];
            const isActive = sid === activeScenario;
            return (
              <button
                key={sid}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveScenario(sid)}
                style={{
                  background: isActive ? s.color : 'transparent',
                  color: isActive ? COLORS.bg : COLORS.text,
                  border: 'none', padding: '8px 18px',
                  borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* KPI table + description */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 360px) 1fr',
            gap: 24, marginBottom: 24,
          }}
          className="scenarios-grid"
        >
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${active.color}`,
              borderRadius: 12, overflow: 'hidden',
            }}
          >
            <table
              style={{ width: '100%', borderCollapse: 'collapse', color: COLORS.text }}
              aria-label={`Метрики сценария ${active.label}`}
            >
              <thead>
                <tr style={{ background: 'rgba(42,157,143,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, letterSpacing: '0.08em', color: COLORS.muted, textTransform: 'uppercase' }}>
                    Метрика
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, letterSpacing: '0.08em', color: active.color, textTransform: 'uppercase' }}>
                    {active.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'IRR',     val: `${active.irr.toFixed(2)}%` },
                  { label: 'MOIC',    val: `${active.moic.toFixed(1)}×` },
                  { label: 'TVPI',    val: `${active.tvpi.toFixed(1)}×` },
                  { label: 'P50 IRR', val: `${active.p50.toFixed(2)}%` },
                ].map((r, i) => (
                  <tr
                    key={r.label}
                    style={{
                      borderTop: `1px solid ${COLORS.border}`,
                      background: i % 2 === 1 ? 'rgba(20,23,28,0.4)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{r.label}</td>
                    <td
                      style={{
                        padding: '12px 16px', fontSize: 18, fontWeight: 700,
                        textAlign: 'right', color: active.color,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {r.val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ color: active.color, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              Драйверы сценария {active.label}
            </div>
            <p style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
              {active.descr}
            </p>
            <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 8 }}>
              Траектория Y1–Y7: от {active.trajectory[0].toFixed(1)}% до {active.trajectory[6].toFixed(2)}% IRR.
            </div>
          </div>
        </div>

        {/* 4-line comparison chart */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: 16, height: 340,
          }}
          aria-label="Сравнение IRR-траекторий всех 4 сценариев"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 12 }} unit="%" />
              <Tooltip content={<ScenarioLineTooltip />} />
              <Legend wrapperStyle={{ color: COLORS.text, fontSize: 12 }} />
              {SCENARIO_ORDER.map((sid) => {
                const s = SCENARIOS[sid];
                const isActive = sid === activeScenario;
                return (
                  <Line
                    key={sid}
                    type="monotone"
                    dataKey={sid}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={isActive ? 4 : 1.5}
                    strokeOpacity={isActive ? 1 : 0.55}
                    dot={{ fill: s.color, r: isActive ? 4 : 2 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s15 — Regions: simplified SVG map of РФ, 8 federal districts + tooltips
// =============================================================================

const FEDERAL_DISTRICTS = [
  { id: 'fd-c',  name: 'Центральный',       x: 220, y: 180, w: 110, h: 70, projects: 4, note: 'Москва: production hub' },
  { id: 'fd-nw', name: 'Северо-Западный',   x: 160, y: 110, w: 120, h: 65, projects: 1, note: 'СПб: production hub' },
  { id: 'fd-s',  name: 'Южный',             x: 220, y: 260, w: 110, h: 60, projects: 1, note: 'Сочи: натура, локации' },
  { id: 'fd-sk', name: 'Северо-Кавказский', x: 220, y: 325, w: 80,  h: 45, projects: 0, note: 'Резерв: горные локации' },
  { id: 'fd-v',  name: 'Приволжский',       x: 335, y: 180, w: 110, h: 85, projects: 1, note: 'Казань: talent pool' },
  { id: 'fd-u',  name: 'Уральский',         x: 450, y: 160, w: 90,  h: 90, projects: 0, note: 'Екатеринбург: talent pool' },
  { id: 'fd-si', name: 'Сибирский',         x: 545, y: 145, w: 130, h: 110, projects: 0, note: 'Новосибирск: post-production' },
  { id: 'fd-f',  name: 'Дальневосточный',   x: 680, y: 100, w: 150, h: 130, projects: 0, note: 'Владивосток: distribution' },
];

function Regions() {
  const [hover, setHover] = useState(null);

  return (
    <section id="regions" style={{ padding: '96px 0', background: COLORS.surface }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Регионы
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            8 федеральных округов · география производства
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Наведите на округ, чтобы увидеть число проектов и ключевой хаб. Портфель фонда сфокусирован
            на ЦФО и СЗФО (55% production spend), с natura в Южном и post-production в Сибирском.
          </p>
        </header>

        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 20,
            position: 'relative',
          }}
        >
          <svg
            viewBox="0 0 880 420"
            width="100%"
            style={{ display: 'block', minWidth: 560 }}
            role="img"
            aria-label="Упрощённая карта федеральных округов РФ с числом проектов"
          >
            {/* Simplified outline of РФ: bounding shape */}
            <rect
              x="120" y="60" width="740" height="340"
              fill={COLORS.surface}
              stroke={COLORS.border}
              strokeWidth="1"
              rx="12"
            />
            {FEDERAL_DISTRICTS.map((fd) => {
              const isHover = hover === fd.id;
              const color = fd.projects > 0 ? COLORS.accentWarm : COLORS.muted;
              return (
                <g
                  key={fd.id}
                  onMouseEnter={() => setHover(fd.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(fd.id)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  style={{ cursor: 'pointer', outline: 'none' }}
                  aria-label={`${fd.name}: ${fd.projects} проектов, ${fd.note}`}
                >
                  <rect
                    x={fd.x} y={fd.y}
                    width={fd.w} height={fd.h}
                    rx={6}
                    fill={color}
                    fillOpacity={isHover ? 0.7 : (fd.projects > 0 ? 0.35 : 0.12)}
                    stroke={color}
                    strokeWidth={isHover ? 2.5 : 1}
                  />
                  <text
                    x={fd.x + fd.w / 2}
                    y={fd.y + fd.h / 2 - 4}
                    textAnchor="middle"
                    fill={COLORS.text}
                    fontSize={11}
                    fontWeight={600}
                  >
                    {fd.name}
                  </text>
                  <text
                    x={fd.x + fd.w / 2}
                    y={fd.y + fd.h / 2 + 12}
                    textAnchor="middle"
                    fill={color}
                    fontSize={14}
                    fontWeight={700}
                  >
                    {fd.projects}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Inline tooltip */}
          <div
            aria-live="polite"
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              color: hover ? COLORS.text : COLORS.muted,
              fontSize: 14,
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <MapPin size={16} aria-hidden="true" style={{ color: COLORS.accentWarm }} />
            {hover
              ? (() => {
                  const fd = FEDERAL_DISTRICTS.find((x) => x.id === hover);
                  return (
                    <span>
                      <strong style={{ color: COLORS.accentWarm }}>{fd.name}</strong> — {fd.projects} проектов · {fd.note}
                    </span>
                  );
                })()
              : 'Наведите или фокус на округ, чтобы увидеть количество проектов и хаб.'}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// M2 — Pipeline Builder (Marquee): HTML5 Drag-and-Drop, live weighted IRR
// =============================================================================

const INITIAL_BUILDER_STATE = {
  pre:     ['p02', 'p03', 'p06', 'p07'],
  prod:    ['p01', 'p04'],
  post:    ['p05'],
  release: [],
};

const BUILDER_STAGES = [
  { id: 'pre',     label: 'Pre-production',  color: COLORS.stagePre },
  { id: 'prod',    label: 'Production',      color: COLORS.stageProd },
  { id: 'post',    label: 'Post-production', color: COLORS.stagePost },
  { id: 'release', label: 'Release',         color: COLORS.stageRelease },
];

function PipelineBuilder() {
  const [state, setState] = useState(INITIAL_BUILDER_STATE);
  const [dragPid, setDragPid] = useState(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [dropHover, setDropHover] = useState(null);

  const allProjects = useMemo(() => PIPELINE, []);
  const projectsByPid = useMemo(() => {
    const m = {};
    for (const p of PIPELINE) m[p.pid] = p;
    return m;
  }, []);

  const onDragStart = useCallback((pid, from) => (e) => {
    setDragPid(pid);
    setDragFrom(from);
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', pid);
    } catch (_) {}
  }, []);

  const onDragEnd = useCallback(() => {
    setDragPid(null);
    setDragFrom(null);
    setDropHover(null);
  }, []);

  const onDragOver = useCallback((stageId) => (e) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
    if (dropHover !== stageId) setDropHover(stageId);
  }, [dropHover]);

  const onDragLeave = useCallback(() => setDropHover(null), []);

  const onDrop = useCallback((stageId) => (e) => {
    e.preventDefault();
    setDropHover(null);
    if (!dragPid) return;
    setState((prev) => {
      const next = { pre: [...prev.pre], prod: [...prev.prod], post: [...prev.post], release: [...prev.release] };
      // remove pid from any column
      for (const k of Object.keys(next)) {
        next[k] = next[k].filter((x) => x !== dragPid);
      }
      if (!next[stageId].includes(dragPid)) next[stageId].push(dragPid);
      return next;
    });
    setDragPid(null);
    setDragFrom(null);
  }, [dragPid]);

  const stats = useMemo(() => {
    // weighted IRR = Σ(irr_i * budget_i) / Σ(budget_i)
    let totalBudget = 0;
    let weighted = 0;
    let n = 0;
    for (const k of Object.keys(state)) {
      for (const pid of state[k]) {
        const p = projectsByPid[pid];
        if (!p) continue;
        totalBudget += p.budget_mln;
        weighted += p.target_irr * p.budget_mln;
        n++;
      }
    }
    const weightedIRR = totalBudget > 0 ? weighted / totalBudget : 0;
    return { totalBudget, weightedIRR, n };
  }, [state, projectsByPid]);

  const reset = useCallback(() => setState(INITIAL_BUILDER_STATE), []);

  return (
    <section id="pipeline-builder" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={14} />
            Marquee · M2
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            Pipeline Builder — соберите свой портфель
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 17, marginTop: 14, lineHeight: 1.5, maxWidth: 720 }}>
            Перетащите проекты из левого rail в стадии справа. Weighted IRR пересчитывается мгновенно.
            Если в одной стадии оказывается больше 3 проектов — появляется предупреждение о перегрузке.
          </p>
        </header>

        {/* Top stats bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 24,
          }}
        >
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Projects
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.text, fontWeight: 700, lineHeight: 1.1 }}>
              {stats.n}
            </div>
          </div>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Budget
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.accentCool, fontWeight: 700, lineHeight: 1.1 }}>
              {stats.totalBudget.toLocaleString('ru-RU')} <span style={{ fontSize: 14, color: COLORS.muted }}>млн ₽</span>
            </div>
          </div>
          <div style={{ background: COLORS.surface, border: `2px solid ${COLORS.accentWarm}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Weighted IRR
            </div>
            <div
              aria-live="polite"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.accentWarm, fontWeight: 700, lineHeight: 1.1 }}
            >
              {stats.weightedIRR.toFixed(2)}%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: 'transparent', color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                padding: '10px 16px', borderRadius: 8,
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
              aria-label="Вернуть исходное распределение канона"
            >
              <RotateCcw size={14} />
              Reset to Canon
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 280px) 1fr',
            gap: 20,
          }}
          className="builder-grid"
        >
          {/* Left rail — full list of 7 projects */}
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: 14,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
            aria-label="Rail проектов для drag-and-drop"
          >
            <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              7 проектов (rail)
            </div>
            {allProjects.map((p) => {
              // find current stage
              let curStage = null;
              for (const k of Object.keys(state)) {
                if (state[k].includes(p.pid)) { curStage = k; break; }
              }
              const isDragging = dragPid === p.pid;
              return (
                <div
                  key={p.pid}
                  draggable
                  onDragStart={onDragStart(p.pid, curStage)}
                  onDragEnd={onDragEnd}
                  style={{
                    background: COLORS.bg,
                    border: `1px solid ${isDragging ? COLORS.accentWarm : COLORS.border}`,
                    borderRadius: 8,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'grab',
                    opacity: isDragging ? 0.4 : 1,
                  }}
                  aria-label={`Проект ${p.title}, текущая стадия: ${curStage || 'вне стадий'}`}
                >
                  <GripVertical size={14} style={{ color: COLORS.muted }} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                      {p.pid.toUpperCase()} · {p.title}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: 11 }}>
                      {p.budget_mln} млн ₽ · IRR {p.target_irr}% · {curStage ? STAGE_META[curStage].label : '—'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — 4 drop zones */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 12,
            }}
          >
            {BUILDER_STAGES.map((st) => {
              const isHover = dropHover === st.id;
              const items = state[st.id];
              const overCount = items.length > 3;
              return (
                <div
                  key={st.id}
                  onDragOver={onDragOver(st.id)}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop(st.id)}
                  style={{
                    background: COLORS.surface,
                    border: `2px ${isHover ? 'solid' : 'dashed'} ${isHover ? st.color : COLORS.border}`,
                    outline: isHover ? `3px solid ${st.color}` : 'none',
                    outlineOffset: isHover ? 2 : 0,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 260,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    transition: 'border-color 120ms ease',
                  }}
                  aria-label={`Drop-zone: ${st.label}, сейчас ${items.length} проектов`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${st.color}`, paddingBottom: 6 }}>
                    <span style={{ color: st.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {st.label}
                    </span>
                    <span
                      style={{
                        background: st.color, color: COLORS.bg,
                        borderRadius: 999, padding: '2px 8px',
                        fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'center',
                      }}
                    >
                      {items.length}
                    </span>
                  </div>

                  {overCount && (
                    <div
                      style={{
                        background: 'rgba(231,76,60,0.12)',
                        border: `1px solid ${COLORS.danger}`,
                        color: COLORS.danger,
                        borderRadius: 6, padding: '4px 8px',
                        fontSize: 11, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <AlertTriangle size={12} />
                      Перегрузка стадии
                    </div>
                  )}

                  {items.length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 12, fontStyle: 'italic', padding: '8px 4px' }}>
                      Перетащите проект сюда…
                    </div>
                  ) : (
                    items.map((pid) => {
                      const p = projectsByPid[pid];
                      if (!p) return null;
                      const isDragging = dragPid === pid;
                      return (
                        <div
                          key={pid}
                          draggable
                          onDragStart={onDragStart(pid, st.id)}
                          onDragEnd={onDragEnd}
                          style={{
                            background: COLORS.bg,
                            border: `1px solid ${isDragging ? COLORS.accentWarm : st.color}`,
                            borderRadius: 6,
                            padding: '6px 8px',
                            cursor: 'grab',
                            opacity: isDragging ? 0.4 : 1,
                          }}
                          aria-label={`${p.title} · стадия ${st.label}`}
                        >
                          <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                            {p.pid.toUpperCase()} · {p.title}
                          </div>
                          <div style={{ color: COLORS.muted, fontSize: 10 }}>
                            {p.budget_mln} млн ₽ · IRR {p.target_irr}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// s16 — Tax Credits: 4 cards with icons, credits %, example numbers
// SSOT: canon.tax_credits.programs
// =============================================================================

const TAX_PROGRAMS = [
  {
    id: 'tc-fund',
    icon: Coins,
    name: 'Фонд кино',
    subtitle: 'Безвозвратная субсидия',
    credit_pct: '30–80%',
    eligibility: 'Проекты высокой социальной значимости, по конкурсному отбору.',
    authority: 'Фонд кино',
    example: 'Бюджет 350 млн ₽ · субсидия 30% = 105 млн ₽ безвозмездно',
    color: COLORS.accentWarm,
  },
  {
    id: 'tc-minc',
    icon: Award,
    name: 'Минкультуры',
    subtitle: 'Безвозвратная + rebate',
    credit_pct: 'до 50%',
    eligibility: 'Фильмы и сериалы отечественного производства по профилю.',
    authority: 'Минкультуры РФ',
    example: 'Бюджет 600 млн ₽ · 50% = 300 млн ₽ государственной доли',
    color: COLORS.accentCool,
  },
  {
    id: 'tc-region',
    icon: Scale,
    name: 'Региональные rebate',
    subtitle: 'Production spend в регионе',
    credit_pct: '15–30%',
    eligibility: 'Подтверждённые локальные расходы, резидент РФ. До 6 регионов-партнёров.',
    authority: 'Правительства регионов (Москва, СПб, Калининград, Сочи и др.)',
    example: 'Spend 200 млн ₽ в Москве · rebate 20% = 40 млн ₽ возврата',
    color: COLORS.info,
  },
  {
    id: 'tc-digital',
    icon: Sparkles,
    name: 'Digital bonus (OTT)',
    subtitle: 'Доп. бонус за OTT-релиз',
    credit_pct: '5–10%',
    eligibility: 'Проекты с премьерой/окном на российских OTT-платформах.',
    authority: 'Программы OTT-партнёров',
    example: 'Бюджет 280 млн ₽ · digital bonus 8% = 22,4 млн ₽',
    color: COLORS.stagePost,
  },
];

function TaxCredits() {
  return (
    <section id="tax-credits" style={{ padding: '96px 0', background: COLORS.bg }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 40 }}>
          <div style={{ color: COLORS.accentWarm, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Налоговые льготы и субсидии
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            4 источника non-dilutive capital
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 18, marginTop: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Фонд кино, Минкультуры, региональные rebate и OTT digital bonus суммарно покрывают 25–60%
            production budget без размытия доли LP.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {TAX_PROGRAMS.map((tp) => {
            const Icon = tp.icon;
            return (
              <article
                key={tp.id}
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${tp.color}`,
                  borderLeft: `4px solid ${tp.color}`,
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(11,13,16,0.5)',
                      color: tp.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 32, fontWeight: 700,
                      color: tp.color, lineHeight: 1,
                    }}
                  >
                    {tp.credit_pct}
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20, fontWeight: 700,
                      color: COLORS.text, margin: 0, lineHeight: 1.2,
                    }}
                  >
                    {tp.name}
                  </h3>
                  <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {tp.subtitle}
                  </div>
                </div>

                <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  {tp.eligibility}
                </p>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>
                  <strong style={{ color: COLORS.text }}>Орган:</strong> {tp.authority}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    padding: '8px 10px',
                    background: 'rgba(11,13,16,0.5)',
                    border: `1px dashed ${tp.color}`,
                    borderRadius: 6,
                    color: tp.color, fontSize: 12, lineHeight: 1.4,
                  }}
                >
                  <strong>Пример:</strong> {tp.example}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// M3 — LP Sizer (Marquee): target IRR slider + MC probability + AreaChart
// =============================================================================

function LpSizer() {
  const [targetIrr, setTargetIrr] = useState(20);       // 5..30%
  const [investment, setInvestment] = useState(100);    // 10..500 млн ₽
  const [horizon, setHorizon] = useState(7);            // 5..10 лет

  // Compute MC distribution ONCE per mount (default canon inputs).
  const mcOnce = useRef(null);
  const [mcReady, setMcReady] = useState(false);
  useEffect(() => {
    // Single MC run at canon defaults — used by ALL slider moves for probability calc.
    const r = runMonteCarlo(10000, 0.25, 2.3, 0.12, 42);
    mcOnce.current = r;
    setMcReady(true);
  }, []);

  // P(IRR >= target) from canon MC distribution
  const probability = useMemo(() => {
    if (!mcReady || !mcOnce.current) return null;
    const dist = mcOnce.current.distribution;
    let count = 0;
    for (let i = 0; i < dist.length; i++) {
      if (dist[i] >= targetIrr) count++;
    }
    return count / dist.length;
  }, [targetIrr, mcReady]);

  // Recommended stake %
  const stakePct = useMemo(() => {
    const t = Math.max(5, Math.min(30, targetIrr));
    const inv = Math.max(10, Math.min(500, investment));
    const raw = (t / 35) * (500 / inv);
    // clamp 0.5..15
    return Math.max(0.5, Math.min(15, raw));
  }, [targetIrr, investment]);

  // Expected cashflow (approximate): J-curve ramp to target over horizon years
  const cashflow = useMemo(() => {
    const rows = [];
    const t = targetIrr / 100;
    for (let y = 0; y <= horizon; y++) {
      // simple J-curve approx: negative first 2 years, then grows to (1+t)^y * investment
      const grown = investment * Math.pow(1 + t, y);
      const adj = y <= 2 ? investment * (-0.08 * (3 - y)) : grown - investment;
      rows.push({
        year: `Y${y}`,
        value: Math.round(adj * 10) / 10,
      });
    }
    return rows;
  }, [targetIrr, investment, horizon]);

  const warning = targetIrr > 25;

  const sliderStyle = { width: '100%', accentColor: COLORS.accentCool };

  return (
    <section id="lp-sizer" style={{ padding: '96px 0', background: COLORS.surface }}>
      <div className="container mx-auto px-6">
        <header style={{ maxWidth: 780, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.accentCool, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={14} />
            Marquee · M3
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 700, lineHeight: 1.1,
              color: COLORS.text, margin: 0,
            }}
          >
            LP Sizer — какой коммитмент вам подходит?
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 17, marginTop: 14, lineHeight: 1.5, maxWidth: 720 }}>
            Укажите таргет-IRR, сумму и горизонт — увидите вероятность достижения цели (по MC-распределению
            базового сценария) и рекомендуемую долю вашего коммитмента в фонде.
          </p>
        </header>

        {/* Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20, marginBottom: 24,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
              Target IRR: <strong style={{ color: COLORS.accentCool }}>{targetIrr}%</strong>
            </span>
            <input
              type="range" min={5} max={30} step={1}
              value={targetIrr}
              onChange={(e) => setTargetIrr(Number(e.target.value))}
              style={sliderStyle}
              aria-label="Таргет-IRR (5–30%)"
            />
            <span style={{ color: COLORS.muted, fontSize: 11 }}>5–30%</span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
              Инвестиция: <strong style={{ color: COLORS.accentCool }}>{investment} млн ₽</strong>
            </span>
            <input
              type="range" min={10} max={500} step={10}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              style={sliderStyle}
              aria-label="Сумма инвестиции (10–500 млн ₽)"
            />
            <span style={{ color: COLORS.muted, fontSize: 11 }}>10–500 млн ₽</span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>
              Горизонт: <strong style={{ color: COLORS.accentCool }}>{horizon} лет</strong>
            </span>
            <input
              type="range" min={5} max={10} step={1}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              style={sliderStyle}
              aria-label="Горизонт инвестиции (5–10 лет)"
            />
            <span style={{ color: COLORS.muted, fontSize: 11 }}>5–10 лет</span>
          </label>
        </div>

        {/* Warning banner */}
        {warning && (
          <div
            role="alert"
            style={{
              background: 'rgba(231,76,60,0.12)',
              border: `1px solid ${COLORS.danger}`,
              color: COLORS.danger,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13,
            }}
          >
            <AlertTriangle size={16} />
            Превышает P90 базового сценария M1 — вероятность достижения резко падает.
          </div>
        )}

        {/* Results */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 24,
          }}
        >
          <div style={{ background: COLORS.bg, border: `2px solid ${COLORS.accentCool}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              P(IRR ≥ {targetIrr}%)
            </div>
            <div
              aria-live="polite"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, color: COLORS.accentCool, fontWeight: 700, lineHeight: 1.1,
              }}
            >
              {probability != null ? `${(probability * 100).toFixed(1)}%` : '…'}
            </div>
            <div style={{ color: COLORS.muted, fontSize: 11 }}>
              из 10 000 MC симуляций
            </div>
          </div>
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Рек. доля в фонде
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.text, fontWeight: 700, lineHeight: 1.1 }}>
              {stakePct.toFixed(1)}%
            </div>
            <div style={{ color: COLORS.muted, fontSize: 11 }}>
              от 3 000 млн ₽
            </div>
          </div>
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Горизонт
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.text, fontWeight: 700, lineHeight: 1.1 }}>
              {horizon} <span style={{ fontSize: 14, color: COLORS.muted }}>лет</span>
            </div>
          </div>
        </div>

        {/* Area chart — expected cashflow */}
        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 16, height: 300,
          }}
          aria-label="Ожидаемый cashflow по годам (AreaChart)"
        >
          <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 8px' }}>
            Expected cashflow · {investment} млн ₽ · {horizon} лет · target {targetIrr}%
          </div>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={cashflow} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="lp-cf-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.accentCool} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={COLORS.accentCool} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, color: COLORS.text, fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Cashflow"
                stroke={COLORS.accentCool}
                fill="url(#lp-cf-grad)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// App_W4 — root shell (sections s00..s16 + M1 + M2 + M3)
// =============================================================================

export default function App_W4() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <ScrollProgress />
      <TopNav />
      <main>
        <Hero prefersReducedMotion={prefersReducedMotion} />
        <Thesis />
        <Market prefersReducedMotion={prefersReducedMotion} />
        <FundSection />
        <Economics />
        <Returns />
        <Pipeline prefersReducedMotion={prefersReducedMotion} />
        <Stages />
        <Team />
        <Advisory />
        <Operations prefersReducedMotion={prefersReducedMotion} />
        <Risks />
        <Roadmap prefersReducedMotion={prefersReducedMotion} />
        <Scenarios />
        <Regions />
        <PipelineBuilder />
        <TaxCredits />
        <LpSizer />
      </main>
      <FooterStub />
    </div>
  );
}
