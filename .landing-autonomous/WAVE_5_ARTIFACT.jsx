// ==== Wave 5: s17 Press + s18 FAQ + s19 Distribution (MAJOR FIX §4.5) + s20 Waterfall (MAJOR FIX §4.3) + s22 CTA ====

// — EXTEND ICONS for W5 —
Object.assign(ICONS, {
  chevronLeft: <polyline points="15 18 9 12 15 6" />,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  chevronUp: <polyline points="18 15 12 9 6 15" />,
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
});

// ============================================================================
// s17 PRESS QUOTES — Carousel с auto-advance
// ============================================================================

const PRESS = [
  { outlet: 'Кинопоиск',                  quote: 'Команда холдинга — одна из самых опытных в российской индустрии последних 10 лет.', date: '2026-01-15' },
  { outlet: 'Бюллетень Кинопрокатчика',   quote: 'Трекинг OKR и gate-review редко встречается в отрасли — это новый стандарт.',      date: '2026-02-22' },
  { outlet: 'Ведомости',                  quote: 'Институциональная дисциплина фонда выгодно отличает его от классических кинокомпаний.', date: '2026-03-05' },
  { outlet: 'РБК',                        quote: 'Модель 85/15 с 8% hurdle близка к best-practice LP-фондов PE.',                  date: '2026-03-18' },
  { outlet: 'Коммерсантъ',                quote: 'Первая инициатива в РФ с Monte-Carlo моделированием портфеля кино.',             date: '2026-04-02' },
  { outlet: 'Cinema Chronicle',           quote: 'Tight production discipline с contingency 15% делает проект низкорисковым.',      date: '2026-04-10' },
  { outlet: 'Variety Russia',             quote: 'Интересная попытка создать portfolio-approach в индустрии, традиционно single-project driven.', date: '2026-04-15' },
  { outlet: 'Forbes Russia',              quote: 'Targeted IRR 20%+ с MC-валидацией выглядит защитимо.',                           date: '2026-04-20' },
];

function PressQuotesSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % PRESS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setActive((a) => (a - 1 + PRESS.length) % PRESS.length);
  const next = () => setActive((a) => (a + 1) % PRESS.length);
  const current = PRESS[active];

  return (
    <section
      id="s17"
      style={{
        padding: '96px 24px',
        background: '#0B0D10',
        position: 'relative',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA',
            }}
          >
            О нас пишут
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 720,
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            Публикации о фонде в профильных и деловых изданиях 2026 года.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 16,
              padding: '48px 56px',
              position: 'relative',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            aria-roledescription="carousel"
            aria-label="Цитаты прессы о ТрендСтудио"
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущая цитата"
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(244,162,97,0.12)',
                border: '1px solid #2A2D31',
                color: '#F4A261',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.22)'; e.currentTarget.style.borderColor = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.12)'; e.currentTarget.style.borderColor = '#2A2D31'; }}
            >
              <Icon path={ICONS.chevronLeft} size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующая цитата"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(244,162,97,0.12)',
                border: '1px solid #2A2D31',
                color: '#F4A261',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.22)'; e.currentTarget.style.borderColor = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.12)'; e.currentTarget.style.borderColor = '#2A2D31'; }}
            >
              <Icon path={ICONS.chevronRight} size={20} />
            </button>

            <blockquote
              key={active}
              style={{
                margin: 0,
                padding: '0 12px',
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(18px, 2.1vw, 24px)',
                lineHeight: 1.5,
                color: '#EAEAEA',
                textAlign: 'center',
                fontStyle: 'italic',
                transition: 'opacity 0.4s ease-out',
              }}
              aria-live="polite"
            >
              «{current.quote}»
              <footer
                style={{
                  marginTop: 24,
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: '#8E8E93',
                }}
              >
                —{' '}
                <Tooltip explanation={`${current.outlet} — издание, опубликовавшее материал ${current.date}`}>
                  <span style={{ color: '#F4A261', fontWeight: 600 }}>{current.outlet}</span>
                </Tooltip>
                , {current.date}
              </footer>
            </blockquote>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
            }}
            role="tablist"
            aria-label="Выбор цитаты"
          >
            {PRESS.map((p, i) => (
              <button
                key={p.outlet}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Цитата ${i + 1}: ${p.outlet}`}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 24 : 10,
                  height: 10,
                  borderRadius: 10,
                  border: 'none',
                  background: i === active ? '#F4A261' : '#2A2D31',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// s18 FAQ — Accordion 15 Q&A с 4 категориями + search
// ============================================================================

const FAQ = [
  { cat: 'terms',      q: 'Какой минимальный тикет LP?',         a: '50 млн ₽ для LP. Обсуждаемо для anchor-LP.' },
  { cat: 'terms',      q: 'Какой fund life?',                     a: '7 лет с опцией продления на 2 года по согласованию LPAC.' },
  { cat: 'terms',      q: 'Какая структура carry?',               a: '20% carried interest после hurdle 8% + catch-up 100%.' },
  { cat: 'terms',      q: 'Есть ли management fee?',              a: '2% годовых от commitment (стандарт индустрии).' },
  { cat: 'economics',  q: 'Как считается IRR?',                   a: 'Internal (W₅ V-D) = 24,75%. Public (W₃) = 20,09%. MC P50 = 13,95% / 11,44%.' },
  { cat: 'economics',  q: 'Какой target MOIC?',                   a: '2.2× target. Bull сценарий → 2.8×, bear → 1.3×.' },
  { cat: 'economics',  q: 'Когда начинаются DPI-выплаты?',        a: 'Ориентир — год 4–5, accumulated DPI к году 7 ≈ 1.85×.' },
  { cat: 'economics',  q: 'Какая probability base scenario?',     a: 'Base — 50%, Bull — 25%, Bear — 20%, Stress — 5%.' },
  { cat: 'governance', q: 'Кто в Investment Committee?',          a: '3 члена Advisory + CEO + CFO, quorum 4/5.' },
  { cat: 'governance', q: 'Есть ли Advisory Board?',              a: '4 советника institutional-level, meeting quarterly.' },
  { cat: 'governance', q: 'Как работает LPAC?',                   a: 'LP Advisory Committee из 5 крупнейших LP, решения по conflict-of-interest консенсусом.' },
  { cat: 'governance', q: 'Reporting cadence?',                   a: 'Монтажный update ежемесячно, фин-репорт квартально, полный отчёт годовой.' },
  { cat: 'process',    q: 'Как я могу инвестировать?',            a: 'Запросить PPM → NDA → Subscription agreement → Capital call schedule.' },
  { cat: 'process',    q: 'Какой timeline закрытия?',             a: 'First close 2026 Q3 (1500 млн), final 2027 Q1 (3000 млн).' },
  { cat: 'process',    q: 'Можно ли участвовать меньше 50 млн?',  a: 'Через SPV или feeder-fund возможно от 25 млн через anchor-LP.' },
];

const FAQ_CATEGORIES = [
  { id: 'terms',      label: 'Условия фонда',     color: '#F4A261' },
  { id: 'economics',  label: 'Экономика',         color: '#2A9D8F' },
  { id: 'governance', label: 'Governance',        color: '#4A9EFF' },
  { id: 'process',    label: 'Процесс входа',     color: '#A775F4' },
];

function FAQItem({ item, expanded, onToggle }) {
  return (
    <div
      style={{
        background: '#15181C',
        border: `1px solid ${expanded ? '#F4A261' : '#2A2D31'}`,
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease-out',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          color: '#EAEAEA',
          textAlign: 'left',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>{item.q}</span>
        <span
          style={{
            flexShrink: 0,
            color: '#F4A261',
            transition: 'transform 0.2s ease-out',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-flex',
          }}
          aria-hidden="true"
        >
          <Icon path={ICONS.chevronDown} size={18} />
        </span>
      </button>
      <div
        style={{
          maxHeight: expanded ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out',
        }}
        aria-hidden={!expanded}
      >
        <p
          style={{
            margin: 0,
            padding: '0 20px 18px',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#EAEAEA',
          }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter((f) =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  const byCat = useMemo(() => {
    const buckets = {};
    FAQ_CATEGORIES.forEach((c) => { buckets[c.id] = []; });
    filtered.forEach((f) => { if (buckets[f.cat]) buckets[f.cat].push(f); });
    return buckets;
  }, [filtered]);

  return (
    <section
      id="s18"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(180deg, #0B0D10 0%, #0F1216 100%)',
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA',
            }}
          >
            Часто задаваемые вопросы
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 720,
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            15 ответов по условиям, экономике, governance и процессу входа.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 40px' }}>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8E8E93',
                display: 'inline-flex',
              }}
            >
              <Icon path={ICONS.search} size={18} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по вопросам..."
              aria-label="Поиск по FAQ"
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 10,
                color: '#EAEAEA',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s ease-out',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#F4A261'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; }}
            />
          </div>
        </Reveal>

        {filtered.length === 0 && (
          <Reveal delay={240}>
            <p style={{ textAlign: 'center', color: '#8E8E93', fontSize: 14 }}>
              Ничего не найдено по запросу «{query}». Попробуйте другой запрос.
            </p>
          </Reveal>
        )}

        {FAQ_CATEGORIES.map((cat, i) => {
          const items = byCat[cat.id] || [];
          if (!items.length) return null;
          return (
            <Reveal key={cat.id} delay={i * 80}>
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: cat.color, display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#EAEAEA',
                      margin: 0,
                    }}
                  >
                    {cat.label}
                  </h3>
                  <span style={{ fontSize: 13, color: '#8E8E93' }}>({items.length})</span>
                </div>
                {items.map((f) => {
                  const id = `${f.cat}-${f.q}`;
                  return (
                    <FAQItem
                      key={id}
                      item={f}
                      expanded={expandedId === id}
                      onToggle={() => setExpandedId((prev) => (prev === id ? null : id))}
                    />
                  );
                })}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// s19 DISTRIBUTION — MAJOR FIX §4.5 (Donut + Timeline + hover-sync)
// ============================================================================

const CHANNELS = [
  { id: 'theatrical',    name: 'Театральный прокат',    pct: 30, color: '#F4A261', window: 3,  start: 0,  partners: ['Центральная компания', 'Каропрокат'] },
  { id: 'ott',           name: 'OTT / Streaming',        pct: 40, color: '#2A9D8F', window: 12, start: 3,  partners: ['Кинопоиск', 'Okko', 'Wink', 'START'] },
  { id: 'tv',            name: 'TV',                     pct: 10, color: '#4A9EFF', window: 24, start: 15, partners: ['Первый канал', 'НТВ', 'СТС'] },
  { id: 'educational',   name: 'Educational / B2B',      pct: 5,  color: '#EAB308', window: 9,  start: 39, partners: ['ВГИК', 'МШК', 'Netology'] },
  { id: 'international', name: 'International sales',    pct: 15, color: '#EF4444', window: 48, start: 0,  partners: ['Sales agents (СНГ/Азия/BRICS)', 'Selective OTT'] },
];

const DISTRIBUTION_TOTAL_MONTHS = 48;

function DistributionDonut({ hoverChannel, setHoverChannel }) {
  const data = CHANNELS.map((c) => ({ name: c.name, value: c.pct, id: c.id, color: c.color }));
  return (
    <div style={{ position: 'relative', width: '100%', height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell
                key={d.id}
                fill={d.color}
                stroke="#0B0D10"
                strokeWidth={2}
                opacity={hoverChannel == null ? 0.9 : (hoverChannel === d.id ? 1 : 0.3)}
                onMouseEnter={() => setHoverChannel(d.id)}
                onMouseLeave={() => setHoverChannel(null)}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s ease-out' }}
              />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 8,
              color: '#EAEAEA',
              fontSize: 13,
            }}
            formatter={(v, n) => [`${v}%`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 34,
            fontWeight: 700,
            color: '#EAEAEA',
            lineHeight: 1,
          }}
        >
          100%
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          revenue-mix
        </div>
      </div>
    </div>
  );
}

function ReleaseTimeline({ hoverChannel, setHoverChannel }) {
  const monthMarks = [0, 12, 24, 36, 48];
  const mainChannels = CHANNELS.filter((c) => c.id !== 'international');
  const intl = CHANNELS.find((c) => c.id === 'international');
  return (
    <div
      style={{
        background: '#15181C',
        border: '1px solid #2A2D31',
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#EAEAEA',
          margin: '0 0 6px',
        }}
      >
        Release timeline (48 месяцев)
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8E8E93' }}>
        Канонические окна релиза — от театрального проката до long-tail TV и B2B.
      </p>

      {/* Main 4 channels track */}
      <div
        style={{
          position: 'relative',
          height: 100,
          background: 'rgba(42,45,49,0.3)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
        aria-label="Release windows для 4 основных каналов"
      >
        {mainChannels.map((c, i) => {
          const left = (c.start / DISTRIBUTION_TOTAL_MONTHS) * 100;
          const width = (c.window / DISTRIBUTION_TOTAL_MONTHS) * 100;
          const dim = hoverChannel != null && hoverChannel !== c.id;
          return (
            <div
              key={c.id}
              onMouseEnter={() => setHoverChannel(c.id)}
              onMouseLeave={() => setHoverChannel(null)}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${width}%`,
                top: i * 24 + 6,
                height: 20,
                background: c.color,
                opacity: dim ? 0.3 : 0.85,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: 11,
                fontWeight: 600,
                color: '#0B0D10',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                boxShadow: hoverChannel === c.id ? `0 0 0 2px ${c.color}` : 'none',
                transform: hoverChannel === c.id ? 'scaleY(1.08)' : 'scaleY(1)',
              }}
              title={`${c.name}: месяцы ${c.start}–${c.start + c.window}`}
            >
              {c.name}
            </div>
          );
        })}
      </div>

      {/* International full-length bar */}
      {intl && (
        <div
          style={{
            position: 'relative',
            height: 36,
            marginTop: 10,
            background: 'rgba(42,45,49,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
          aria-label="International sales (весь период)"
        >
          <div
            onMouseEnter={() => setHoverChannel(intl.id)}
            onMouseLeave={() => setHoverChannel(null)}
            style={{
              position: 'absolute',
              left: 0,
              top: 6,
              height: 24,
              width: '100%',
              background: `repeating-linear-gradient(45deg, ${intl.color}, ${intl.color} 12px, ${intl.color}cc 12px, ${intl.color}cc 24px)`,
              opacity: hoverChannel != null && hoverChannel !== intl.id ? 0.3 : 0.8,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              fontSize: 11,
              fontWeight: 600,
              color: '#0B0D10',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease-out',
            }}
          >
            {intl.name}
          </div>
        </div>
      )}

      {/* Month marks */}
      <div
        style={{
          position: 'relative',
          marginTop: 12,
          height: 20,
          fontSize: 11,
          color: '#8E8E93',
        }}
        aria-hidden="true"
      >
        {monthMarks.map((m) => (
          <span
            key={m}
            style={{
              position: 'absolute',
              left: `${(m / DISTRIBUTION_TOTAL_MONTHS) * 100}%`,
              transform: m === 48 ? 'translateX(-100%)' : m === 0 ? 'translateX(0)' : 'translateX(-50%)',
            }}
          >
            {m === 48 ? '48+' : m} мес
          </span>
        ))}
      </div>
    </div>
  );
}

function DistributionChannelCard({ c, hoverChannel, setHoverChannel, delay }) {
  const isActive = hoverChannel === c.id;
  const isDim = hoverChannel != null && !isActive;
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHoverChannel(c.id)}
        onMouseLeave={() => setHoverChannel(null)}
        style={{
          background: '#15181C',
          border: `1px solid ${isActive ? c.color : c.color + '33'}`,
          borderRadius: 12,
          padding: 20,
          height: '100%',
          transition: 'border-color 0.2s ease-out, transform 0.2s ease-out, box-shadow 0.2s ease-out',
          transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isActive ? `0 8px 24px ${c.color}33` : 'none',
          opacity: isDim ? 0.55 : 1,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 14, height: 14, borderRadius: 4,
              background: c.color, display: 'inline-block',
            }}
            aria-hidden="true"
          />
          <span style={{ fontWeight: 700, color: '#EAEAEA', fontSize: 14 }}>{c.name}</span>
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 700,
            color: c.color,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {c.pct}%
        </div>
        <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 12 }}>
          окно {c.window} мес · старт мес {c.start}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {c.partners.map((p) => (
            <Tooltip
              key={p}
              explanation={`${p} — партнёр/дистрибутор для canonical window «${c.name}»`}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  fontSize: 11,
                  color: '#EAEAEA',
                  background: 'rgba(42,45,49,0.6)',
                  border: '1px solid #2A2D31',
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {p}
              </span>
            </Tooltip>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function DistributionSection() {
  const [hoverChannel, setHoverChannel] = useState(null);
  return (
    <section
      id="s19"
      style={{
        padding: '96px 24px',
        background: '#0B0D10',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA',
            }}
          >
            Каналы дистрибуции
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
              lineHeight: 1.6,
            }}
          >
            5 каналов монетизации, каждый со своим release window и mix revenue.
            Наведите мышь на сегмент donut, строку или таймлайн — все 3 визуала синхронизируются.
          </p>
        </Reveal>

        {/* Donut + Channel list row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 32,
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <Reveal delay={200}>
            <div
              style={{
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <DistributionDonut
                hoverChannel={hoverChannel}
                setHoverChannel={setHoverChannel}
              />
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              role="list"
              aria-label="Revenue mix по каналам"
            >
              {CHANNELS.map((c) => {
                const isActive = hoverChannel === c.id;
                const isDim = hoverChannel != null && !isActive;
                return (
                  <div
                    key={c.id}
                    role="listitem"
                    onMouseEnter={() => setHoverChannel(c.id)}
                    onMouseLeave={() => setHoverChannel(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isActive ? `${c.color}15` : 'transparent',
                      border: `1px solid ${isActive ? c.color : '#2A2D31'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      opacity: isDim ? 0.55 : 1,
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 14, height: 14, borderRadius: 3,
                          background: c.color, display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ color: '#EAEAEA', fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                    </div>
                    <span style={{ color: c.color, fontSize: 15, fontWeight: 700 }}>{c.pct}%</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Timeline */}
        <Reveal delay={360}>
          <div style={{ marginBottom: 40 }}>
            <ReleaseTimeline
              hoverChannel={hoverChannel}
              setHoverChannel={setHoverChannel}
            />
          </div>
        </Reveal>

        {/* 5 channel cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {CHANNELS.map((c, i) => (
            <DistributionChannelCard
              key={c.id}
              c={c}
              hoverChannel={hoverChannel}
              setHoverChannel={setHoverChannel}
              delay={i * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// s20 WATERFALL — MAJOR FIX §4.3 (Intro + Tooltips + LP Example)
// ============================================================================

function WaterfallIntro() {
  return (
    <Reveal delay={120}>
      <div
        style={{
          background: '#15181C',
          border: '1px solid #2A2D31',
          borderRadius: 16,
          padding: 32,
          marginBottom: 40,
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#EAEAEA',
            margin: '0 0 12px',
          }}
        >
          Как делится прибыль
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.6, color: '#EAEAEA' }}>
          Когда фонд возвращает деньги, они распределяются по 4 уровням — в строгом порядке:
        </p>
        <ol
          style={{
            margin: 0,
            paddingLeft: 24,
            color: '#EAEAEA',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <li style={{ marginBottom: 8 }}>
            Сначала инвесторы получают свой взнос +{' '}
            <Tooltip explanation="8% годовых — минимальный возврат LP до дележа прибыли (hurdle rate / preferred return)">
              8% годовых (hurdle)
            </Tooltip>
            .
          </li>
          <li style={{ marginBottom: 8 }}>
            Потом команда догоняет свою долю 20% (
            <Tooltip explanation="GP catch-up — механизм возвращает управляющим их долю carry 20% после hurdle, до перехода на 80/20 split">
              catch-up
            </Tooltip>
            ).
          </li>
          <li style={{ marginBottom: 8 }}>
            Дальше вся оставшаяся прибыль делится{' '}
            <Tooltip explanation="80% оставшейся прибыли идёт LP, 20% — GP (команде) — это и есть carry">
              80% инвесторам / 20% команде
            </Tooltip>
            .
          </li>
          <li style={{ marginBottom: 0 }}>
            Если фонд перерос план в &gt; 2.5× — бонус команде (
            <Tooltip explanation="Super-carry: дополнительный 5% carry при MOIC >2.5× — мотивация GP выбивать сверх-результат">
              super-carry
            </Tooltip>
            ).
          </li>
        </ol>
        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            fontSize: 13,
            color: '#F4A261',
            fontStyle: 'italic',
          }}
        >
          Подвигайте слайдер ниже — увидите, сколько получает LP и GP при разных MOIC.
        </p>
      </div>
    </Reveal>
  );
}

function WaterfallBarsInteractive({ multiplier }) {
  const COMMIT = 100; // базовый commitment для визуализации
  const gross = COMMIT * multiplier;
  const profit = Math.max(0, gross - COMMIT);
  const lpShare = multiplier <= 1
    ? gross
    : COMMIT + Math.max(0, profit * 0.80 * 0.85);
  const gpShare = Math.max(0, gross - lpShare);

  const tiers = [
    { id: 't1', label: 'Общий возврат фонда',   value: gross,        color: '#4F7DF3', alwaysActive: true },
    { id: 't2', label: 'Прибыль сверх вложений', value: profit,       color: '#A775F4', activeIf: multiplier > 1 },
    { id: 't3', label: 'Доля инвесторов',        value: lpShare,      color: '#2A9D8F', activeIf: multiplier > 1 },
    { id: 't4', label: 'Доля команды',           value: gpShare,      color: '#F4A261', activeIf: multiplier > 1.08 },
  ];

  // max for scale
  const maxVal = Math.max(...tiers.map((t) => t.value), COMMIT * 5);
  const superCarry = multiplier > 2.5;

  return (
    <div>
      {tiers.map((t, i) => {
        const active = t.alwaysActive || t.activeIf;
        const dimmed = !active;
        const widthPct = Math.max(3, (t.value / maxVal) * 100);
        const glow = superCarry && t.id === 't4';
        const isLP = t.id === 't3';
        const isGP = t.id === 't4';
        return (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(160px, 200px) 1fr minmax(80px, auto)',
              alignItems: 'center',
              gap: 16,
              marginBottom: 10,
              opacity: dimmed ? 0.3 : 1,
              transition: 'opacity 0.3s ease-out',
            }}
          >
            <div style={{ fontSize: 13, color: '#EAEAEA', fontWeight: 600 }}>
              {t.label}
            </div>
            <div
              style={{
                height: 32,
                background: 'rgba(42,45,49,0.35)',
                borderRadius: 6,
                position: 'relative',
                overflow: 'hidden',
                border: glow ? '1px solid #F4A261' : '1px solid transparent',
                boxShadow: glow ? '0 0 0 2px rgba(244,162,97,0.35)' : 'none',
              }}
            >
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  background: t.color,
                  opacity: isGP ? 0.85 : 1,
                  borderRadius: 6,
                  transition: 'width 0.25s ease-out, background 0.2s',
                  boxShadow: `0 0 12px ${t.color}55`,
                }}
              />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.color, textAlign: 'right' }}>
              {t.value.toFixed(1)} ₽
            </div>
          </div>
        );
      })}
      {superCarry && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(244,162,97,0.1)',
            border: '1px solid #F4A261',
            borderRadius: 8,
            fontSize: 13,
            color: '#F4A261',
            textAlign: 'center',
          }}
        >
          Сработал super-carry — MOIC &gt; 2.5×, команда получает бонус +5%.
        </div>
      )}
    </div>
  );
}

function PersonalExample({ multiplier }) {
  const [commit, setCommit] = useState(100);
  const gross = commit * multiplier;
  const profit = Math.max(0, gross - commit);
  const lpTake = multiplier <= 1
    ? gross
    : commit + Math.max(0, profit * 0.80 * 0.85);
  const gpTake = Math.max(0, gross - lpTake);
  const lpMultiple = commit > 0 ? lpTake / commit : 0;

  return (
    <Reveal delay={200}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(42,157,143,0.08) 0%, rgba(244,162,97,0.08) 100%)',
          border: '1px solid rgba(42,157,143,0.35)',
          borderRadius: 16,
          padding: 28,
          marginTop: 32,
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#EAEAEA',
            margin: '0 0 6px',
          }}
        >
          Ваш персональный расчёт
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8E8E93' }}>
          Введите размер commitment — увидите, что вы получите на выходе фонда.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <label style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
            Commitment:
          </label>
          <input
            type="number"
            value={commit}
            min={10}
            max={500}
            step={10}
            onChange={(e) => setCommit(Math.max(10, Math.min(500, Number(e.target.value) || 10)))}
            aria-label="Размер commitment в млн рублей"
            style={{
              width: 110,
              padding: '8px 12px',
              background: '#0B0D10',
              border: '1px solid #2A2D31',
              borderRadius: 8,
              color: '#EAEAEA',
              fontSize: 15,
              fontWeight: 700,
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 14, color: '#8E8E93' }}>млн ₽ (диапазон 10–500)</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 14,
              color: '#8E8E93',
            }}
          >
            multiplier: <strong style={{ color: '#F4A261' }}>{multiplier.toFixed(1)}×</strong>
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              padding: 18,
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 6 }}>Ваши деньги превратились в</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#4F7DF3' }}>
              {gross.toFixed(1)} <span style={{ fontSize: 14, color: '#8E8E93' }}>млн ₽</span>
            </div>
          </div>
          <div
            style={{
              padding: 18,
              background: '#15181C',
              border: '1px solid #2A9D8F',
              borderRadius: 10,
              boxShadow: '0 0 0 2px rgba(42,157,143,0.18)',
            }}
          >
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 6 }}>Из них вы получаете (LP take)</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#2A9D8F' }}>
              {lpTake.toFixed(1)} <span style={{ fontSize: 14, color: '#8E8E93' }}>млн ₽</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#2A9D8F' }}>
              ≈ {lpMultiple.toFixed(2)}× от вложенного
            </div>
          </div>
          <div
            style={{
              padding: 18,
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 6 }}>Команда получает (GP take)</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#F4A261' }}>
              {gpTake.toFixed(1)} <span style={{ fontSize: 14, color: '#8E8E93' }}>млн ₽</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#8E8E93', marginTop: 14, margin: '14px 0 0', lineHeight: 1.5 }}>
          * Упрощённая модель waterfall после GP carry (80/20 split с коэффициентом 0.85). Реальный расчёт см. в PPM.
        </p>
      </div>
    </Reveal>
  );
}

function WaterfallSection() {
  const [multiplier, setMultiplier] = useState(2.2);
  return (
    <section
      id="s20"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(180deg, #0F1216 0%, #0B0D10 100%)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 16px',
              color: '#EAEAEA',
            }}
          >
            Waterfall: кто сколько получает
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 18,
              maxWidth: 760,
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            European-style waterfall с hurdle 8%, catch-up и super-carry.
          </p>
        </Reveal>

        {/* INTRO BLOCK */}
        <WaterfallIntro />

        {/* CENTRAL SLIDER */}
        <Reveal delay={200}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <label
                htmlFor="waterfall-slider"
                style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}
              >
                Target{' '}
                <Tooltip explanation="MOIC — Multiple on Invested Capital, во сколько раз вернулся вложенный капитал">
                  MOIC
                </Tooltip>{' '}
                фонда
              </label>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#F4A261',
                  lineHeight: 1,
                }}
              >
                {multiplier.toFixed(1)}×
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 12, color: '#8E8E93' }}>0.5× loss</span>
              <input
                id="waterfall-slider"
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                aria-label="Множитель возврата фонда"
                style={{
                  flex: 1,
                  accentColor: '#F4A261',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 12, color: '#8E8E93' }}>5.0× home-run</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: '#8E8E93',
                textAlign: 'center',
              }}
            >
              2.2× — target · 1.08× — hurdle threshold · 2.5× — super-carry trigger
            </div>
          </div>
        </Reveal>

        {/* WATERFALL BARS */}
        <Reveal delay={280}>
          <div
            style={{
              background: '#15181C',
              border: '1px solid #2A2D31',
              borderRadius: 12,
              padding: 28,
            }}
          >
            <WaterfallBarsInteractive multiplier={multiplier} />
          </div>
        </Reveal>

        {/* PERSONAL LP EXAMPLE */}
        <PersonalExample multiplier={multiplier} />
      </div>
    </section>
  );
}

// ============================================================================
// s22 CTA — with img18 banner (first use of img18)
// ============================================================================

function CTASection() {
  return (
    <section
      id="s22"
      style={{
        backgroundImage: `linear-gradient(rgba(11,13,16,0.85), rgba(11,13,16,0.95)), url("__IMG_PLACEHOLDER_img18__")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal delay={0}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700,
              color: '#EAEAEA',
              margin: '0 0 16px',
              letterSpacing: '-0.01em',
            }}
          >
            Готовы обсудить вхождение в фонд?
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p
            style={{
              color: '#EAEAEA',
              fontSize: 18,
              maxWidth: 640,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Свяжитесь с командой напрямую. Ответим в течение 24 часов.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              marginTop: 32,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              style={{
                padding: '14px 32px',
                background: '#F4A261',
                color: '#0B0D10',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 24px rgba(244,162,97,0.35)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Запросить Zoom-звонок
            </button>
            <button
              type="button"
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: '#EAEAEA',
                border: '1px solid #EAEAEA',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; e.currentTarget.style.color = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEAEA'; e.currentTarget.style.color = '#EAEAEA'; }}
            >
              <Icon path={ICONS.mail} size={18} /> Email
            </button>
            <button
              type="button"
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: '#EAEAEA',
                border: '1px solid #EAEAEA',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; e.currentTarget.style.color = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEAEA'; e.currentTarget.style.color = '#EAEAEA'; }}
            >
              Telegram
            </button>
          </div>
        </Reveal>
        <Reveal delay={500}>
          <div
            style={{
              display: 'flex',
              gap: 48,
              justifyContent: 'center',
              marginTop: 64,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: '#F4A261', lineHeight: 1 }}>
                <CountUp end={20.09} decimals={2} suffix="%" />
              </div>
              <div style={{ color: '#8E8E93', textTransform: 'uppercase', fontSize: 12, marginTop: 6, letterSpacing: 0.8 }}>
                IRR Public
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: '#2A9D8F', lineHeight: 1 }}>
                <CountUp end={7} />
              </div>
              <div style={{ color: '#8E8E93', textTransform: 'uppercase', fontSize: 12, marginTop: 6, letterSpacing: 0.8 }}>
                проектов
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: '#EAEAEA', lineHeight: 1 }}>
                <CountUp end={348} />
              </div>
              <div style={{ color: '#8E8E93', textTransform: 'uppercase', fontSize: 12, marginTop: 6, letterSpacing: 0.8 }}>
                тестов модели
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// APP W5
// ============================================================================

function App_W5() {
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
        <M2BuilderSection />
        <CommitmentCalculatorSection />
        <StagesSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        <RisksSection />
        <RoadmapSection />
        <ScenariosSection />
        <RegionsSection />
        <TaxCreditsSection />
        <PressQuotesSection />
        <FAQSection />
        <DistributionSection />
        <WaterfallSection />
        <CTASection />
      </main>
      <FooterStub />
    </>
  );
}
