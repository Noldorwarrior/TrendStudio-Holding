// =====================================================================
// Wave 5 Artifact — ТрендСтудио Landing v2.1
// s17 Press Quotes (8-quote carousel, auto-advance 5s)
// s19 Distribution (donut + timeline + hover-sync + partner chip tooltips)
// s20 Waterfall Full (intro + scroll-pinned slider + cascade bars + particles + LP example)
// s22 CTA (img18 background + gradient mesh + 3 CTAs + 3 KPI CountUp + holding→fund rewrite)
// NB: FAQ ПЕРЕМЕЩЁН в W6 (§5.18 v2.1) — НЕ рендерим здесь!
// =====================================================================

// ========================================================================
// DATA BLOCKS
// ========================================================================

const PRESS = [
  { outlet: 'Кинопоиск',               quote: 'Команда холдинга — одна из самых опытных в российской индустрии последних 10 лет.',          date: '2026-01-15', info: 'Ведущий OTT-сервис РФ' },
  { outlet: 'Бюллетень Кинопрокатчика', quote: 'Трекинг OKR и gate-review редко встречается в отрасли — это новый стандарт.',                  date: '2026-02-22', info: 'Отраслевое издание' },
  { outlet: 'Ведомости',               quote: 'Институциональная дисциплина холдинга выгодно отличает его от классических кинокомпаний.',     date: '2026-03-05', info: 'Деловая газета' },
  { outlet: 'РБК',                     quote: 'Модель 85/15 с 8% hurdle — close to best-practice PE-фондов.',                                  date: '2026-03-18', info: 'Бизнес-медиа' },
  { outlet: 'Коммерсантъ',             quote: 'Первая инициатива в РФ с Monte-Carlo моделированием портфеля кино.',                            date: '2026-04-02', info: 'Ежедневная деловая газета' },
  { outlet: 'Cinema Chronicle',        quote: 'Tight production discipline с contingency 15% делает проект низкорисковым.',                   date: '2026-04-10', info: 'Отраслевой журнал' },
  { outlet: 'Variety Russia',          quote: 'Интересная попытка создать portfolio-approach в индустрии single-project driven.',             date: '2026-04-15', info: 'Российское издание Variety' },
  { outlet: 'Forbes Russia',           quote: 'Targeted IRR 20%+ с MC-валидацией выглядит защитимо для институциональных LP.',                 date: '2026-04-20', info: 'Деловой журнал Forbes' }
];

const CHANNELS = [
  { id: 'theatrical',    name: 'Театральный прокат',    pct: 30, color: '#F4A261', window: 3,  start: 0,
    partners: [
      { name: 'Центральная компания', info: 'Крупнейший theatrical-дистрибьютор РФ. Вы получаете доступ к 1500+ экранов.' },
      { name: 'Каропрокат',            info: 'Independent distributor, специализация на авторском кино.' }
    ]
  },
  { id: 'ott',           name: 'OTT / Streaming',       pct: 40, color: '#2A9D8F', window: 12, start: 3,
    partners: [
      { name: 'Кинопоиск', info: '22 млн подписчиков. Premium-размещение для портфеля.' },
      { name: 'Okko',      info: '10 млн подписчиков. Window после Кинопоиск.' },
      { name: 'Wink',      info: 'Rostelecom OTT, 5 млн подписчиков.' },
      { name: 'START',     info: 'Нишевый premium OTT. Specialist для качественных драм.' }
    ]
  },
  { id: 'tv',            name: 'TV',                    pct: 10, color: '#4A9EFF', window: 24, start: 15,
    partners: [
      { name: 'Первый канал', info: 'Федеральный broadcast, высокая reach для исторических и семейных.' },
      { name: 'НТВ',          info: 'Специализация на жанровом контенте (триллеры).' },
      { name: 'СТС',          info: 'Развлекательный канал, семейный контент.' }
    ]
  },
  { id: 'educational',   name: 'Educational / B2B',     pct: 5,  color: '#EAB308', window: 9,  start: 39,
    partners: [
      { name: 'ВГИК',     info: 'Академический канал, long-tail revenue.' },
      { name: 'Netology', info: 'Онлайн-образование, licensing для курсов.' }
    ]
  },
  { id: 'international', name: 'International sales',   pct: 15, color: '#EF4444', window: 48, start: 0,
    partners: [
      { name: 'Sales agents СНГ',  info: 'Продажи в Казахстан, Беларусь, Азербайджан, Узбекистан.' },
      { name: 'Sales agents Азия', info: 'КНР, Индия, Вьетнам, Индонезия — growing markets.' },
      { name: 'BRICS distribution', info: 'Бразилия, ЮАР — через двусторонние культурные соглашения.' }
    ]
  }
];

// ========================================================================
// §5.17 s17 — PRESS QUOTES (carousel, auto-advance 5s)
// ========================================================================

function PressQuotesSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % PRESS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setActive((i) => (i - 1 + PRESS.length) % PRESS.length);
  const next = () => setActive((i) => (i + 1) % PRESS.length);

  const q = PRESS[active];

  return (
    <section
      id="s17"
      aria-labelledby="s17-title"
      style={{ background: '#0F1216', padding: '96px 24px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <div style={{
            fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
            letterSpacing: 2, fontWeight: 600, marginBottom: 10, textAlign: 'center'
          }}>
            Press & Media
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="s17-title" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: '#EAEAEA', textAlign: 'center', margin: 0, lineHeight: 1.15
          }}>
            Что о холдинге пишут <span style={{ color: '#F4A261' }}>СМИ</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p style={{
            textAlign: 'center', color: '#8E8E93', marginTop: 12,
            fontSize: 14, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto'
          }}>
            8 публикаций отраслевой и деловой прессы за последние 4 месяца
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div
            className="glass"
            style={{
              marginTop: 48, padding: 'clamp(32px, 5vw, 56px)',
              borderRadius: 16, border: '1px solid #2A2D31',
              position: 'relative', minHeight: 280
            }}
          >
            {/* Quote mark decorative */}
            <div style={{
              position: 'absolute', top: 16, left: 24,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 120, color: 'rgba(244,162,97,0.14)',
              lineHeight: 1, userSelect: 'none', pointerEvents: 'none'
            }}>
              &ldquo;
            </div>

            <blockquote
              key={active}
              style={{
                margin: 0, padding: 0, position: 'relative', zIndex: 2,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(20px, 2.4vw, 28px)',
                lineHeight: 1.45, color: '#EAEAEA', fontStyle: 'italic',
                animation: 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both'
              }}
            >
              {q.quote}
            </blockquote>

            <footer style={{
              marginTop: 32, display: 'flex', gap: 16, alignItems: 'center',
              flexWrap: 'wrap', position: 'relative', zIndex: 2
            }}>
              <div style={{
                width: 40, height: 2, background: '#F4A261', borderRadius: 1
              }} />
              <div style={{ fontSize: 15, color: '#EAEAEA', fontWeight: 600 }}>
                <Tooltip explanation={q.info}>{q.outlet}</Tooltip>
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93' }}>
                {new Date(q.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </footer>

            {/* Nav buttons */}
            <button
              onClick={prev}
              aria-label="Предыдущая цитата"
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(11,13,16,0.6)', border: '1px solid #2A2D31',
                color: '#EAEAEA', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; e.currentTarget.style.color = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; e.currentTarget.style.color = '#EAEAEA'; }}
            >
              &lsaquo;
            </button>
            <button
              onClick={next}
              aria-label="Следующая цитата"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(11,13,16,0.6)', border: '1px solid #2A2D31',
                color: '#EAEAEA', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F4A261'; e.currentTarget.style.color = '#F4A261'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; e.currentTarget.style.color = '#EAEAEA'; }}
            >
              &rsaquo;
            </button>
          </div>
        </Reveal>

        {/* Dot indicators */}
        <Reveal delay={320}>
          <div
            role="tablist"
            aria-label="Выбор цитаты"
            style={{
              marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {PRESS.map((p, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Цитата ${i + 1}: ${p.outlet}`}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  border: 'none',
                  background: i === active ? '#F4A261' : '#2A2D31',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  padding: 0
                }}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={380}>
          <div style={{
            marginTop: 16, textAlign: 'center', color: '#8E8E93', fontSize: 11,
            letterSpacing: 0.5
          }}>
            {paused ? 'Пауза (наведение курсора)' : 'Авто-прокрутка каждые 5 сек'}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// §5.19 s19 — DISTRIBUTION (donut + timeline + partner tooltips)
// ========================================================================

function DistributionDonut({ activeId, setActiveId }) {
  const size = 280;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const total = CHANNELS.reduce((s, c) => s + c.pct, 0);

  let acc = 0;
  const arcs = CHANNELS.map((c) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += c.pct;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    return {
      id: c.id, color: c.color, pct: c.pct,
      d: `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`
    };
  });

  const activeChannel = CHANNELS.find((c) => c.id === activeId);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-label="Donut: распределение revenue по каналам">
        {arcs.map((a) => (
          <path
            key={a.id}
            d={a.d}
            fill={a.color}
            opacity={!activeId || activeId === a.id ? 1 : 0.28}
            stroke="#0B0D10"
            strokeWidth={2}
            style={{
              cursor: 'pointer',
              transformOrigin: `${cx}px ${cy}px`,
              transform: activeId === a.id ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
            onMouseEnter={() => setActiveId(a.id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => setActiveId(activeId === a.id ? null : a.id)}
          />
        ))}
        {/* inner hole */}
        <circle cx={cx} cy={cy} r={r * 0.58} fill="#0F1216" />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: activeChannel ? 36 : 28,
          color: activeChannel ? activeChannel.color : '#F4A261',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          lineHeight: 1
        }}>
          {activeChannel ? `${activeChannel.pct}%` : '100%'}
        </div>
        <div style={{
          fontSize: 10, color: '#8E8E93', textTransform: 'uppercase',
          letterSpacing: 1, marginTop: 6, maxWidth: 120
        }}>
          {activeChannel ? activeChannel.name : 'revenue mix'}
        </div>
      </div>
    </div>
  );
}

function DistributionTimeline({ activeId, setActiveId }) {
  // Max window = 51 месяца (international 48+3 buffer)
  const maxMonths = 51;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 12
      }}>
        Release windows (месяцев от первого показа)
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {CHANNELS.map((c) => {
          const leftPct = (c.start / maxMonths) * 100;
          const widthPct = (c.window / maxMonths) * 100;
          const dim = activeId && activeId !== c.id;
          return (
            <div
              key={c.id}
              onMouseEnter={() => setActiveId(c.id)}
              onMouseLeave={() => setActiveId(null)}
              style={{
                display: 'grid', gridTemplateColumns: '160px 1fr 80px', gap: 12,
                alignItems: 'center', cursor: 'pointer',
                opacity: dim ? 0.35 : 1,
                transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <div style={{ fontSize: 13, color: '#EAEAEA' }}>{c.name}</div>
              <div style={{
                position: 'relative', height: 14, background: 'rgba(42,45,49,0.6)',
                borderRadius: 4
              }}>
                <div style={{
                  position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`,
                  top: 0, bottom: 0,
                  background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`,
                  borderRadius: 4,
                  boxShadow: activeId === c.id ? `0 0 16px ${c.color}88` : 'none',
                  transition: 'box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                }} />
              </div>
              <div style={{
                fontSize: 12, color: c.color, textAlign: 'right',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {c.start}&ndash;{c.start + c.window} мес
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistributionSection() {
  const [activeId, setActiveId] = useState(null);

  return (
    <section
      id="s19"
      aria-labelledby="s19-title"
      style={{ background: '#0B0D10', padding: '96px 24px' }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <div style={{
            fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
            letterSpacing: 2, fontWeight: 600, marginBottom: 10
          }}>
            Дистрибуция
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="s19-title" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: '#EAEAEA', margin: 0, lineHeight: 1.15
          }}>
            Каналы монетизации и <span style={{ color: '#F4A261' }}>release windows</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p style={{ color: '#8E8E93', marginTop: 12, fontSize: 15, maxWidth: 760 }}>
            5 каналов дистрибуции, выстроенные в каскад release windows.
            Наведите на сегмент donut или строку timeline — остальное подсветится.
          </p>
        </Reveal>

        {/* 2-column grid top */}
        <div style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: 48, alignItems: 'start'
        }}>
          <Reveal delay={240}>
            <div
              className="glass"
              style={{
                padding: 24, borderRadius: 14, border: '1px solid #2A2D31',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <div style={{
                fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 18
              }}>
                Revenue mix
              </div>
              <DistributionDonut activeId={activeId} setActiveId={setActiveId} />
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div style={{ display: 'grid', gap: 10 }}>
              {CHANNELS.map((c) => {
                const dim = activeId && activeId !== c.id;
                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setActiveId(c.id)}
                    onMouseLeave={() => setActiveId(null)}
                    className="card-hover"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '10px 1fr auto',
                      gap: 14, alignItems: 'center',
                      padding: '14px 18px', borderRadius: 10,
                      background: 'rgba(21,24,28,0.55)',
                      border: `1px solid ${activeId === c.id ? c.color : '#2A2D31'}`,
                      opacity: dim ? 0.5 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    <div style={{
                      width: 10, height: 30, borderRadius: 3, background: c.color
                    }} />
                    <div>
                      <div style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>
                        {c.window} мес window, starts +{c.start} мес
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 22, color: c.color
                    }}>
                      {c.pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Timeline below */}
        <Reveal delay={400}>
          <div
            className="glass"
            style={{
              marginTop: 48, padding: 24, borderRadius: 14,
              border: '1px solid #2A2D31'
            }}
          >
            <DistributionTimeline activeId={activeId} setActiveId={setActiveId} />
          </div>
        </Reveal>

        {/* Partner chip grid with tooltips */}
        <Reveal delay={480}>
          <div style={{ marginTop: 56 }}>
            <div style={{
              fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 16
            }}>
              Партнёры по каналам
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}>
              {CHANNELS.map((c) => (
                <div
                  key={c.id}
                  className="card-hover"
                  style={{
                    padding: 18, borderRadius: 12,
                    background: 'rgba(21,24,28,0.55)',
                    border: `1px solid ${activeId === c.id ? c.color : '#2A2D31'}`,
                    transition: 'border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onMouseEnter={() => setActiveId(c.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: c.color
                    }} />
                    <div style={{ fontSize: 13, color: '#EAEAEA', fontWeight: 600 }}>
                      {c.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {c.partners.map((p) => (
                      <span
                        key={p.name}
                        style={{
                          display: 'inline-flex', padding: '4px 10px',
                          borderRadius: 999, fontSize: 11,
                          background: `${c.color}18`,
                          border: `1px solid ${c.color}44`,
                          color: '#EAEAEA',
                          cursor: 'help'
                        }}
                      >
                        <Tooltip explanation={p.info}>{p.name}</Tooltip>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ========================================================================
// §5.20 s20 — WATERFALL FULL (intro + scroll-pinned slider + cascade + particles + LP example)
// ========================================================================

function WaterfallSection() {
  const sectionRef = useRef(null);
  const [multiplier, setMultiplier] = useState(2.2);
  const [personalCommit, setPersonalCommit] = useState(100);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionH = sectionRef.current.offsetHeight;
      // Active: top < vh && top > -sectionH + vh
      if (rect.top < vh && rect.top > -sectionH + vh) {
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / sectionH));
        // 0..1 -> 0.5..5.0
        setMultiplier(0.5 + progress * 4.5);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Waterfall math
  const gross = personalCommit * multiplier;
  const profit = Math.max(0, gross - personalCommit);
  const tier1 = personalCommit * 0.08 * 7;                              // hurdle LP (8% x ~7 years)
  const tier2 = Math.min(personalCommit * 0.60, profit * 0.20);         // catch-up GP (cap)
  const tier3 = Math.max(0, (profit - tier1 - tier2) * 0.80);           // 80/20 LP
  const tier4 = multiplier > 2.5 ? profit * 0.05 : 0;                   // super-carry LP
  const lpTake = tier1 + tier3 + tier4;
  const gpTake = Math.max(0, gross - lpTake);

  const tierActive = (tierIdx) => {
    if (multiplier < 1.08) return tierIdx === 0;
    if (multiplier < 2.5)  return tierIdx < 3;
    return true;
  };

  return (
    <section
      id="s20"
      ref={sectionRef}
      aria-labelledby="s20-title"
      style={{
        minHeight: '200vh',
        background: '#0F1216',
        padding: '96px 24px 0',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'sticky',
        top: 96,
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <Reveal>
          <div style={{
            fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
            letterSpacing: 2, fontWeight: 600, textAlign: 'center', marginBottom: 10
          }}>
            Waterfall
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h2 id="s20-title" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: '#EAEAEA', textAlign: 'center', margin: 0, lineHeight: 1.15
          }}>
            Waterfall: как делится <span style={{ color: '#F4A261' }}>прибыль</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p style={{
            textAlign: 'center', color: '#F4A261',
            fontSize: 13, marginTop: 12, letterSpacing: 0.3
          }}>
            Прокрутите секцию &mdash; slider multiplier двигается автоматически от 0.5&times; до 5&times;
          </p>
        </Reveal>

        {/* Intro block with Tooltips */}
        <Reveal delay={180}>
          <div
            className="glass"
            style={{
              marginTop: 32, padding: 24, borderRadius: 12,
              border: '1px solid #2A2D31'
            }}
          >
            <h3 style={{
              fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif",
              color: '#EAEAEA', margin: 0
            }}>
              Порядок распределения
            </h3>
            <ol style={{
              color: '#EAEAEA', marginTop: 12, paddingLeft: 22,
              lineHeight: 1.9, fontSize: 14
            }}>
              <li>
                Ваш фонд сначала получает свой взнос + {' '}
                <Tooltip explanation="8% годовых — минимальный preferred return LP до дележа прибыли">
                  8% годовых (hurdle)
                </Tooltip>
              </li>
              <li>
                Холдинг догоняет свою carry-долю 20% ({' '}
                <Tooltip explanation="GP catch-up механизм — управляющие получают свою долю после LP hurdle">
                  catch-up
                </Tooltip>
                )
              </li>
              <li>
                Дальше прибыль делится {' '}
                <Tooltip explanation="80% оставшейся прибыли — фонду, 20% — холдингу">
                  80/20
                </Tooltip>
                {' '} ({' '}
                <Tooltip explanation="MOIC = Multiple on Invested Capital, во сколько раз кратно вернулся вложенный капитал">
                  MOIC
                </Tooltip>
                {' '} — ключевой индикатор)
              </li>
              <li>
                Если MOIC &gt; 2.5&times; &mdash; бонус команде ({' '}
                <Tooltip explanation="Дополнительный 5% carry при MOIC >2.5× — super-carry для команды холдинга">
                  super-carry
                </Tooltip>
                )
              </li>
            </ol>
          </div>
        </Reveal>

        {/* Slider indicator (read-only, scroll-driven) */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{
            fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Scroll-pinned multiplier
          </div>
          <div style={{
            fontSize: 48, fontFamily: "'Playfair Display', Georgia, serif",
            color: '#F4A261', marginTop: 4, lineHeight: 1
          }}>
            {multiplier.toFixed(2)}&times;
          </div>
          <div style={{
            maxWidth: 400, margin: '12px auto', height: 4,
            background: '#2A2D31', borderRadius: 2, position: 'relative'
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${((multiplier - 0.5) / 4.5) * 100}%`,
              background: 'linear-gradient(90deg, #F4A261, #E67E22)',
              borderRadius: 2,
              transition: 'width 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
            }} />
          </div>
        </div>

        {/* Waterfall cascade */}
        <Reveal delay={260}>
          <div style={{
            marginTop: 32, padding: 24,
            background: 'rgba(11,13,16,0.5)', borderRadius: 12,
            border: '1px solid #2A2D31'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12
            }}>
              {[
                { label: 'Tier 1', name: 'hurdle 8%',   value: tier1, color: '#2A9D8F', to: 'LP', active: tierActive(0) },
                { label: 'Tier 2', name: 'GP catch-up', value: tier2, color: '#F4A261', to: 'GP', active: tierActive(1) },
                { label: 'Tier 3', name: '80/20 split', value: tier3, color: '#2A9D8F', to: 'LP', active: tierActive(2) },
                { label: 'Tier 4', name: 'super-carry', value: tier4, color: '#A855F7', to: 'LP', active: tierActive(3) }
              ].map((t, i) => (
                <div
                  key={i}
                  className="glass"
                  style={{
                    padding: 16, borderRadius: 10, position: 'relative',
                    border: `1px solid ${t.active ? t.color : '#2A2D31'}`,
                    opacity: t.active ? 1 : 0.4,
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: t.active && i === 3 && multiplier > 2.5 ? `0 0 24px ${t.color}` : 'none'
                  }}
                >
                  <div style={{
                    fontSize: 10, color: '#8E8E93', textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#EAEAEA', marginTop: 4 }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif",
                    color: t.color, marginTop: 8
                  }}>
                    {t.value.toFixed(1)} млн
                  </div>
                  <div style={{ fontSize: 10, color: t.color, marginTop: 4 }}>
                    &rarr; {t.to}
                  </div>
                  {/* Particles flowing to recipient */}
                  {t.active && t.value > 0 && [0, 1, 2].map((p) => (
                    <div
                      key={p}
                      style={{
                        position: 'absolute', top: '50%', right: -8,
                        width: 4, height: 4, borderRadius: '50%',
                        background: t.color,
                        animation: `particle-flow 1.8s cubic-bezier(0.22, 1, 0.36, 1) ${p * 0.6}s infinite`
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Personal LP example */}
        <Reveal delay={340}>
          <div
            className="glass"
            style={{
              marginTop: 32, padding: 24, borderRadius: 12,
              border: '1px dashed #F4A26188'
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#EAEAEA', fontSize: 14 }}>
                На commitment вашего фонда
              </span>
              <input
                type="number"
                min={10}
                max={500}
                value={personalCommit}
                onChange={(e) => setPersonalCommit(Math.max(10, Math.min(500, +e.target.value || 10)))}
                aria-label="Commitment вашего фонда в млн ₽"
                style={{
                  width: 90, padding: '6px 10px',
                  background: '#0B0D10', border: '1px solid #2A2D31',
                  borderRadius: 6, color: '#EAEAEA', fontSize: 14
                }}
              />
              <span style={{ color: '#EAEAEA', fontSize: 14 }}>
                млн ₽ при текущем multiplier {multiplier.toFixed(2)}&times;:
              </span>
            </div>
            <div style={{ marginTop: 16, color: '#EAEAEA', lineHeight: 1.9, fontSize: 14 }}>
              &bull; Ваш commitment превратился в {' '}
              <strong style={{ color: '#F4A261' }}>{gross.toFixed(0)} млн ₽</strong> брутто<br />
              &bull; Из них {' '}
              <strong style={{ color: '#2A9D8F' }}>вы получаете {lpTake.toFixed(0)} млн ₽</strong>
              {' '} ({(lpTake / personalCommit).toFixed(2)}&times; net return)<br />
              &bull; Холдинг получает {gpTake.toFixed(0)} млн ₽ в виде GP carry
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes particle-flow {
          0%   { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(30px) scale(0); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ========================================================================
// §5.22 s22 — CTA PREMIUM (img18 bg + gradient mesh + 3 CTAs + 3 KPI CountUp)
// ========================================================================

function CTASection() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2800);
    return () => clearTimeout(t);
  }, [msg]);

  const clickCta = (btn) => {
    // stub: mailto / telegram deep-links (non-destructive)
    const label = `${btn.label} — связь: ${btn.contact}`;
    setMsg(label);
  };

  return (
    <section
      id="s22"
      aria-labelledby="s22-title"
      style={{
        position: 'relative',
        padding: '120px 24px',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      {/* BG img18 */}
      <img
        src="__IMG_PLACEHOLDER_img18__"
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.25
        }}
      />
      {/* Animated gradient mesh */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 30%, rgba(244,162,97,0.25), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(42,157,143,0.2), transparent 50%)',
          pointerEvents: 'none',
          animation: 'mesh-shift 18s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate'
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(11,13,16,0.6) 0%, rgba(11,13,16,0.95) 100%)',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          filter: 'url(#grain)', opacity: 0.3, pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto' }}>
        <Reveal>
          <div style={{
            fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
            letterSpacing: 2, fontWeight: 600, marginBottom: 14
          }}>
            Контакты холдинга
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="s22-title" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#EAEAEA', lineHeight: 1.1, margin: 0
          }}>
            Готовы обсудить <span style={{ color: '#F4A261' }}>партнёрство</span>?
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p style={{
            color: '#C8C8CE', marginTop: 16, fontSize: 18,
            maxWidth: 700, margin: '16px auto 0', lineHeight: 1.6
          }}>
            Свяжитесь с командой холдинга напрямую: обсудим структуру партнёрства для вашего фонда,
            ответим в течение 24 часов, проведём Zoom-звонок или вышлем полный investment pack.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            marginTop: 40, flexWrap: 'wrap'
          }}>
            {[
              { label: 'Zoom-звонок с CEO',   primary: true,  contact: 'zoom.us/ceo-trendstudio' },
              { label: 'Email CIO',            primary: false, contact: 'mailto:cio@trendstudio.ru' },
              { label: 'Telegram IR-команды',  primary: false, contact: 't.me/trendstudio_ir' }
            ].map((btn, i) => (
              <button
                key={i}
                className="cta-btn"
                style={{
                  padding: '14px 28px',
                  background: btn.primary ? '#F4A261' : 'transparent',
                  color: btn.primary ? '#0B0D10' : '#EAEAEA',
                  border: btn.primary ? 'none' : '1px solid #EAEAEA',
                  borderRadius: 10, fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onClick={() => clickCta(btn)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Toast for CTA feedback (non-destructive) */}
        {msg && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: 20, display: 'inline-block',
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(244,162,97,0.12)', color: '#F4A261',
              border: '1px solid #F4A26144', fontSize: 13,
              animation: 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both'
            }}
          >
            {msg}
          </div>
        )}

        <Reveal delay={500}>
          <div style={{
            display: 'flex', gap: 'clamp(24px, 6vw, 64px)',
            justifyContent: 'center', marginTop: 80, flexWrap: 'wrap'
          }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(40px, 5vw, 56px)', color: '#F4A261', lineHeight: 1
              }}>
                <CountUp end={20.09} decimals={2} suffix="%" />
              </div>
              <div style={{
                color: '#8E8E93', textTransform: 'uppercase',
                fontSize: 11, letterSpacing: 1, marginTop: 8
              }}>
                IRR Public
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(40px, 5vw, 56px)', color: '#2A9D8F', lineHeight: 1
              }}>
                <CountUp end={7} />
              </div>
              <div style={{
                color: '#8E8E93', textTransform: 'uppercase',
                fontSize: 11, letterSpacing: 1, marginTop: 8
              }}>
                проектов в портфеле
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(40px, 5vw, 56px)', color: '#EAEAEA', lineHeight: 1
              }}>
                <CountUp end={348} />
              </div>
              <div style={{
                color: '#8E8E93', textTransform: 'uppercase',
                fontSize: 11, letterSpacing: 1, marginTop: 8
              }}>
                тестов финмодели
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={600}>
          <div style={{
            marginTop: 56, color: '#8E8E93', fontSize: 12,
            letterSpacing: 0.5
          }}>
            Для институциональных LP: family office, PE-фонды, стратегические инвесторы.
            Партнёрство начинается с knowledge-sharing call, а формат партнёрства согласуется индивидуально.
          </div>
        </Reveal>
      </div>

      <style>{`
        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(244,162,97,0.5);
        }
        .cta-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cta-btn:hover::before { left: 100%; }
        @keyframes mesh-shift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-4%, 3%) scale(1.06); }
        }
      `}</style>
    </section>
  );
}

// ========================================================================
// ROOT APP W5
// ========================================================================

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
        <MonteCarloSimulator />
        <PipelineSection />
        <M2BuilderSection />
        <CommitmentCalculatorSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        <RisksSection />
        <RoadmapSection />
        <ScenariosSection />
        <RegionsSection />
        <TaxCreditsSection />
        <PressQuotesSection />   {/* NEW W5 — s17 */}
        <DistributionSection />  {/* NEW W5 — s19 */}
        <WaterfallSection />     {/* NEW W5 — s20 scroll-pinned */}
        <CTASection />           {/* NEW W5 — s22 img18 premium */}
      </main>
      <FooterStub />
    </>
  );
}
