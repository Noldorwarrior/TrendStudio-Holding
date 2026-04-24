import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Film, TrendingUp, Award, ChevronDown, Menu, X } from 'lucide-react';

// =============================================================================
// TrendStudio Holding — Landing v1.0 — Wave 1 Artifact (s00–s03 + 3 images)
// Scope: Foundation (s00), Hero (s01), Thesis (s02), Market (s03)
// Images placed: img17 (market bg), img19 (hero bg), img20 (hero detail overlay)
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
};

const NAV_LINKS = [
  { id: 'hero',      label: 'Hero' },
  { id: 'thesis',    label: 'Тезис' },
  { id: 'market',    label: 'Рынок' },
  { id: 'fund',      label: 'Фонд' },
  { id: 'economics', label: 'Экономика' },
  { id: 'pipeline',  label: 'Pipeline' },
  { id: 'team',      label: 'Команда' },
  { id: 'risks',     label: 'Риски' },
  { id: 'cta',       label: 'Контакт' },
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
          style={{ listStyle: 'none', gap: 24, margin: 0, padding: 0 }}
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
// Bullets derived from canon.thesis.items (10 items), grouped into 3 pillars.
// Mapping decision logged in DECISIONS_LOG.md (W1-D1).
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
// 4 KPI cards with count-up animation (rAF, 1.5s, IntersectionObserver).
// KPI values: canon.distribution.channels (OTT=42%), canon.thesis.items (OTT 30%+ YoY).
// Cinema gross + domestic-share — reasonable industry defaults (logged W1-D2).
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
      // easeOutCubic
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
// App_W1 — root shell
// =============================================================================

export default function App_W1() {
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
      </main>
      <FooterStub />
    </div>
  );
}
