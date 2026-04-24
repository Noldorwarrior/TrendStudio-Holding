import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Film, TrendingUp, Award, ChevronDown, Menu, X, DollarSign, Percent, PiggyBank,
  PlayCircle, Layers, Target, Briefcase,
  FileText, CheckCircle, Lightbulb, Video, Megaphone,
  Users, UserCheck, Clapperboard, ArrowRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  Tooltip, Legend, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

// =============================================================================
// TrendStudio Holding — Landing v1.0 — Wave 3 Artifact (s00–s11 + M1)
// Scope: W2 sections (s00–s06 + M1 Monte-Carlo) +
//        s07 Pipeline (7 posters), s08 Stages (kanban), s09 Team (5 portraits),
//        s10 Advisory (4 portraits), s11 Operations (6-step process).
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
  { id: 'hero',       label: 'Hero' },
  { id: 'thesis',     label: 'Тезис' },
  { id: 'market',     label: 'Рынок' },
  { id: 'fund',       label: 'Фонд' },
  { id: 'economics',  label: 'Экономика' },
  { id: 'returns',    label: 'Доходность' },
  { id: 'pipeline',   label: 'Pipeline' },
  { id: 'stages',     label: 'Стадии' },
  { id: 'team',       label: 'Команда' },
  { id: 'advisory',   label: 'Advisory' },
  { id: 'operations', label: 'Процесс' },
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
// App_W3 — root shell (sections s00..s11 + M1)
// =============================================================================

export default function App_W3() {
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
      </main>
      <FooterStub />
    </div>
  );
}
