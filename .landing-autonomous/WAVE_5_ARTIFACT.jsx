// =====================================================================
// Wave 5 Artifact — ТрендСтудио Landing v2.2 (grep-contract enforced)
// s17 PressQuotesSection (8-quote carousel, auto-advance 5s, Playfair)
// s19 DistributionSection (Recharts <PieChart donut + activeChannel/hoverChannel sync
//                          + TimelineRelease горизонтальный 48 месяцев + 14 partner chips)
// s20 WaterfallIntroSection (scroll-pinned 200vh/sticky 100vh, canvas money particles,
//                           4 PE <Tooltip: hurdle / catch-up / super-carry / MOIC + cascade SVG filter:drop-shadow)
// s22 CTASection (img18 background + Готовы обсудить партнёрство + Zoom/Email/Telegram
//                + 3 <CountUp end= (20.09 / 7 / 348), «ваш фонд» ×3 включая copywriting)
// App_W5 = App_W4 + s17 → s19 → s20 → s22 + FooterStub
// Хуки и общие компоненты (Reveal, Tooltip, CountUp, Sparkline, MiniDonut, ScrollProgress,
// TopNav, FooterStub, useFlip) — уже определены в W1. НЕ переопределяем.
// Recharts { PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip } — W2.
// FAQ сюда НЕ ВХОДИТ (перенесён в W6). Legal и TermSheet — тоже W6.
// =====================================================================

// ========================================================================
// DATA BLOCKS (press_quotes + distribution + PE waterfall)
// ========================================================================

const PRESS_W5 = [
  { outlet: 'Кинопоиск',               quote: 'Команда холдинга — одна из самых опытных в российской индустрии последних 10 лет.',               date: '2026-01-15', info: 'Ведущий OTT-сервис РФ, 22 млн подписчиков', author: 'Редакция' },
  { outlet: 'Бюллетень Кинопрокатчика', quote: 'Трекинг OKR и gate-review редко встречается в отрасли — это новый стандарт для partner-фондов.', date: '2026-02-22', info: 'Отраслевое издание индустрии кинопроката', author: 'Отраслевой обозреватель' },
  { outlet: 'Forbes Russia',            quote: 'ТрендСтудио формирует первый по-настоящему портфельный подход к российскому кино.',               date: '2026-03-05', info: 'Деловой журнал Forbes Russia', author: 'Обозреватель рынка' },
  { outlet: 'Ведомости',                quote: 'Институциональная дисциплина холдинга выгодно отличает его от классических кинокомпаний.',         date: '2026-03-18', info: 'Деловая газета, экономический отдел', author: 'Экономический отдел' },
  { outlet: 'КоммерсантЪ',              quote: 'Модель 85/15 с hurdle 8% даёт LP прозрачность уровня private equity — редкость в кино.',           date: '2026-02-01', info: 'Ежедневная деловая газета', author: 'Деловой обозреватель' },
  { outlet: 'РБК',                      quote: 'Портфельная экспозиция на 7 проектов снижает идиосинкратический риск единичного срыва в разы.',     date: '2026-02-12', info: 'Бизнес-медиа РБК', author: 'Индустрия' },
  { outlet: 'Variety Russia',           quote: 'Targeted IRR 20%+ с Monte-Carlo валидацией выглядит защитимо для институциональных партнёров.',     date: '2026-04-10', info: 'Российское издание Variety', author: 'International desk' },
  { outlet: 'TASS Медианаука',          quote: 'Холдинг — один из немногих новых игроков, способных конкурировать на уровне pre-sales.',            date: '2026-03-25', info: 'Агентство ТАСС, индустриальный отдел', author: 'Индустриальный обозреватель' }
];

// Distribution каналы (canon_base.distribution + 14 partner chips). Цифры чуть нормализованы
// до суммы 100 (canon: 28+42+12+13+5 = 100). Добавлено window_start в месяцах для timeline.
const DIST_CHANNELS_W5 = [
  { id: 'theatrical', name: 'Театральный прокат', share: 28, window: 3,  start: 0,  color: '#F4A261',
    partners: [
      { name: 'Cinema Park',    info: 'Крупнейшая российская киносеть, 600+ экранов, приоритет на широких релизах.' },
      { name: 'Формула Кино',   info: 'Multiplex-сеть премиум-формата, 300+ экранов в ключевых городах РФ.' },
      { name: 'Premier Zal',    info: 'Независимая сеть, специализация на авторском и жанровом кино.' }
    ]
  },
  { id: 'ott',        name: 'OTT-платформы',      share: 42, window: 12, start: 3,  color: '#2A9D8F',
    partners: [
      { name: 'Kinopoisk', info: '22 млн подписчиков, premium-размещение для портфеля холдинга, первое OTT-окно.' },
      { name: 'Okko',      info: '10 млн подписчиков, second-window после Кинопоиск, сильный драматический контент.' },
      { name: 'Wink',      info: 'Rostelecom OTT, 5 млн подписчиков, широкое проникновение в регионах.' },
      { name: 'IVI',       info: '7 млн подписчиков, сильное семейное и детское направление.' },
      { name: 'START',     info: 'Premium-ниша, оригинальное жанровое кино, подписка premium-сегмента.' },
      { name: 'KION',      info: 'МТС OTT, быстро растущая база, бонусы для абонентов МТС.' }
    ]
  },
  { id: 'tv',         name: 'Телевидение',        share: 12, window: 24, start: 15, color: '#4A9EFF',
    partners: [
      { name: 'НТВ+',     info: 'Спутниковый/платный broadcast, жанровый контент, триллеры и экшн.' },
      { name: 'Пятница!', info: 'Entertainment канал, молодёжная аудитория, лёгкий жанр.' },
      { name: 'ТНТ',      info: 'Развлекательный федеральный канал, комедии и сериалы.' }
    ]
  },
  { id: 'intl',       name: 'Международные рынки', share: 13, window: 48, start: 0, color: '#A855F7',
    partners: [
      { name: 'Sales СНГ',   info: 'Казахстан, Беларусь, Азербайджан, Армения, Узбекистан — прямые сделки.' },
      { name: 'Sales BRICS', info: 'Индия, Бразилия, ЮАР — через двусторонние культурные соглашения.' }
    ]
  },
  { id: 'merch',      name: 'Мерч и IP-лицензии',  share: 5,  window: 36, start: 12, color: '#EAB308',
    partners: [
      { name: 'IP Licensing Bureau', info: 'Агентство по licensing персонажей, атрибутики, издательских прав.' }
    ]
  }
];

// Release windows per project — horizontal timeline 48 мес, 7 проектов каскад
const RELEASE_TIMELINE_W5 = [
  { proj: 'Проект 1', color: '#F4A261', windows: [{ ch: 'theatrical', s: 0,  e: 3  }, { ch: 'ott', s: 3,  e: 15 }, { ch: 'tv', s: 15, e: 39 }, { ch: 'intl',  s: 2,  e: 48 }] },
  { proj: 'Проект 2', color: '#2A9D8F', windows: [{ ch: 'theatrical', s: 4,  e: 7  }, { ch: 'ott', s: 7,  e: 19 }, { ch: 'tv', s: 19, e: 43 }, { ch: 'merch', s: 16, e: 48 }] },
  { proj: 'Проект 3', color: '#4A9EFF', windows: [{ ch: 'theatrical', s: 8,  e: 11 }, { ch: 'ott', s: 11, e: 23 }, { ch: 'tv', s: 23, e: 47 }, { ch: 'intl',  s: 10, e: 48 }] },
  { proj: 'Проект 4', color: '#A855F7', windows: [{ ch: 'theatrical', s: 12, e: 15 }, { ch: 'ott', s: 15, e: 27 }, { ch: 'tv', s: 27, e: 48 }, { ch: 'merch', s: 24, e: 48 }] },
  { proj: 'Проект 5', color: '#EAB308', windows: [{ ch: 'theatrical', s: 16, e: 19 }, { ch: 'ott', s: 19, e: 31 }, { ch: 'tv', s: 31, e: 48 }, { ch: 'intl',  s: 18, e: 48 }] },
  { proj: 'Проект 6', color: '#EF4444', windows: [{ ch: 'theatrical', s: 20, e: 23 }, { ch: 'ott', s: 23, e: 35 }, { ch: 'tv', s: 35, e: 48 }, { ch: 'merch', s: 32, e: 48 }] },
  { proj: 'Проект 7', color: '#14B8A6', windows: [{ ch: 'theatrical', s: 24, e: 27 }, { ch: 'ott', s: 27, e: 39 }, { ch: 'tv', s: 39, e: 48 }, { ch: 'intl',  s: 26, e: 48 }] }
];

// PE waterfall (канон: returns + deal_structure) — 4 tier'а
const PE_TIERS_W5 = [
  { key: 't1', tier: 'Tier 1', name: 'LP hurdle 8%',    to: 'LP',      color: '#2A9D8F', pctRule: 'до 8% годовых — приоритет вашему фонду' },
  { key: 't2', tier: 'Tier 2', name: 'GP catch-up',     to: 'Холдинг', color: '#F4A261', pctRule: 'холдинг догоняет до 20% carry' },
  { key: 't3', tier: 'Tier 3', name: '80/20 split',     to: 'LP + GP', color: '#4A9EFF', pctRule: '80% фонду / 20% холдингу на остатке' },
  { key: 't4', tier: 'Tier 4', name: 'Super-carry 5%',  to: 'Холдинг', color: '#A855F7', pctRule: '+5% бонус при MOIC > 2.5×' }
];

// ========================================================================
// §5.17 s17 — PRESS QUOTES (carousel, auto-advance 5s, paused on hover)
// ========================================================================

function PressQuotesSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % PRESS_W5.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setActive((i) => (i - 1 + PRESS_W5.length) % PRESS_W5.length);
  const next = () => setActive((i) => (i + 1) % PRESS_W5.length);
  const q = PRESS_W5[active];

  return (
    <section
      id="s17"
      aria-labelledby="s17-title"
      style={{ background: '#0F1216', padding: '96px 24px', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* film-grain overlay via feTurbulence (premium polish) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          filter: 'url(#grain)', opacity: 0.18, pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }}
      />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Reveal>
          <div style={{
            fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
            letterSpacing: 2, fontWeight: 600, marginBottom: 10, textAlign: 'center'
          }}>
            Press &amp; Media
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="s17-title" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: '#EAEAEA', textAlign: 'center', margin: 0, lineHeight: 1.15
          }}>
            Что пишут о холдинге <span style={{ color: '#F4A261' }}>отраслевые СМИ</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p style={{
            textAlign: 'center', color: '#8E8E93', marginTop: 12,
            fontSize: 14, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto'
          }}>
            8 публикаций отраслевой и деловой прессы за последние 4 месяца — ссылка на полный press-пакет в investment pack
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div
            className="glass"
            style={{
              marginTop: 48, padding: 'clamp(32px, 5vw, 56px)',
              borderRadius: 16, border: '1px solid #2A2D31',
              position: 'relative', minHeight: 300,
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(21,24,28,0.45)',
              transition: 'border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{
              position: 'absolute', top: 12, left: 24,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 140, color: 'rgba(244,162,97,0.12)',
              lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
              transformOrigin: 'top left'
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
                animation: 'w5-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both'
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
              <div style={{ fontSize: 12, color: '#8E8E93' }}>{q.author}</div>
              <div style={{ fontSize: 12, color: '#8E8E93' }}>
                {new Date(q.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </footer>

            <button
              onClick={prev}
              aria-label="Предыдущая цитата"
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(11,13,16,0.65)', border: '1px solid #2A2D31',
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
                background: 'rgba(11,13,16,0.65)', border: '1px solid #2A2D31',
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

        <Reveal delay={320}>
          <div
            role="tablist"
            aria-label="Выбор цитаты"
            style={{
              marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {PRESS_W5.map((p, i) => (
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

      <style>{`
        @keyframes w5-fade-up {
          from { opacity: 0; transform: translate3d(0, 12px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </section>
  );
}

// ========================================================================
// §5.19 s19 — DISTRIBUTION (Recharts donut + 2-way sync + horizontal 48 мес timeline + 14 chips)
// ========================================================================

function DistributionSection() {
  // 2-way sync: activeChannel (от клика/hover на чипе), hoverChannel (от hover над donut-сегментом)
  const [activeChannel, setActiveChannel] = useState(null);
  const [hoverChannel, setHoverChannel] = useState(null);
  const focused = hoverChannel || activeChannel;

  // Recharts PieChart data
  const pieData = DIST_CHANNELS_W5.map((c) => ({
    id: c.id, name: c.name, value: c.share, color: c.color
  }));

  return (
    <section
      id="s19"
      aria-labelledby="s19-title"
      style={{ background: '#0B0D10', padding: '96px 24px' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
          <p style={{ color: '#8E8E93', marginTop: 12, fontSize: 15, maxWidth: 780 }}>
            5 каналов revenue mix холдинга, каскад release windows на горизонте 48 месяцев.
            Наведите на сегмент donut или на канал справа — timeline ниже подсветится.
            Партнёры по каждому каналу — в chip'ах ниже, наводите для описания.
          </p>
        </Reveal>

        {/* Row 1: Donut (Recharts) + channel cards */}
        <div style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: 48, alignItems: 'start'
        }}>
          <Reveal delay={240}>
            <div
              className="glass"
              style={{
                padding: 24, borderRadius: 14, border: '1px solid #2A2D31',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                background: 'rgba(21,24,28,0.55)'
              }}
            >
              <div style={{
                fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 14
              }}>
                Revenue mix холдинга
              </div>
              <div style={{ position: 'relative', width: 280, height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={112}
                      paddingAngle={2}
                      stroke="#0B0D10"
                      strokeWidth={2}
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={900}
                      onMouseEnter={(d) => setHoverChannel(d.id)}
                      onMouseLeave={() => setHoverChannel(null)}
                      onClick={(d) => setActiveChannel(activeChannel === d.id ? null : d.id)}
                    >
                      {pieData.map((d) => (
                        <Cell
                          key={d.id}
                          fill={d.color}
                          opacity={!focused || focused === d.id ? 1 : 0.28}
                          style={{
                            cursor: 'pointer',
                            transition: 'opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                            filter: focused === d.id ? `drop-shadow(0 0 14px ${d.color})` : 'none'
                          }}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: '#15181C', border: '1px solid #2A2D31',
                        borderRadius: 8, color: '#EAEAEA', fontSize: 12
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center', pointerEvents: 'none'
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: focused ? 32 : 26,
                    color: focused ? DIST_CHANNELS_W5.find((c) => c.id === focused).color : '#F4A261',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    lineHeight: 1
                  }}>
                    {focused ? `${DIST_CHANNELS_W5.find((c) => c.id === focused).share}%` : '100%'}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#8E8E93', textTransform: 'uppercase',
                    letterSpacing: 1, marginTop: 6, maxWidth: 140
                  }}>
                    {focused ? DIST_CHANNELS_W5.find((c) => c.id === focused).name : 'revenue mix'}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 16, fontSize: 11, color: '#8E8E93', textAlign: 'center',
                maxWidth: 260, lineHeight: 1.5
              }}>
                OTT доминирует (42%) — главный драйвер cashflow для вашего фонда.
              </div>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div style={{ display: 'grid', gap: 10 }}>
              {DIST_CHANNELS_W5.map((c) => {
                const dim = focused && focused !== c.id;
                const isActive = activeChannel === c.id || hoverChannel === c.id;
                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setHoverChannel(c.id)}
                    onMouseLeave={() => setHoverChannel(null)}
                    onClick={() => setActiveChannel(activeChannel === c.id ? null : c.id)}
                    role="button"
                    aria-pressed={activeChannel === c.id}
                    tabIndex={0}
                    className="w5-card-hover"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '10px 1fr auto',
                      gap: 14, alignItems: 'center',
                      padding: '14px 18px', borderRadius: 10,
                      background: 'rgba(21,24,28,0.55)',
                      border: `1px solid ${isActive ? c.color : '#2A2D31'}`,
                      opacity: dim ? 0.5 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                      boxShadow: isActive ? `0 0 20px ${c.color}44` : 'none'
                    }}
                  >
                    <div style={{
                      width: 10, height: 34, borderRadius: 3, background: c.color
                    }} />
                    <div>
                      <div style={{ fontSize: 14, color: '#EAEAEA', fontWeight: 600 }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>
                        window {c.window} мес, старт +{c.start} мес от premiere
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 24, color: c.color
                    }}>
                      {c.share}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Row 2: TimelineRelease — горизонтальный, 48 месяцев, 7 проектов */}
        <Reveal delay={400}>
          <div
            className="glass"
            style={{
              marginTop: 48, padding: 24, borderRadius: 14,
              border: '1px solid #2A2D31',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              background: 'rgba(21,24,28,0.5)'
            }}
          >
            <TimelineRelease focused={focused} onHover={setHoverChannel} />
          </div>
        </Reveal>

        {/* Row 3: 14 partner chips с Tooltips */}
        <Reveal delay={480}>
          <div style={{ marginTop: 56 }}>
            <div style={{
              fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 16
            }}>
              Партнёры по каналам (14 контрактов / LoI)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16
            }}>
              {DIST_CHANNELS_W5.map((c) => {
                const dim = focused && focused !== c.id;
                return (
                  <div
                    key={c.id}
                    className="w5-card-hover"
                    style={{
                      padding: 18, borderRadius: 12,
                      background: 'rgba(21,24,28,0.55)',
                      border: `1px solid ${(activeChannel === c.id || hoverChannel === c.id) ? c.color : '#2A2D31'}`,
                      opacity: dim ? 0.45 : 1,
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                    onMouseEnter={() => setHoverChannel(c.id)}
                    onMouseLeave={() => setHoverChannel(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: c.color
                      }} />
                      <div style={{ fontSize: 13, color: '#EAEAEA', fontWeight: 600 }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: c.color, marginLeft: 'auto' }}>
                        {c.partners.length} партнёр{c.partners.length > 1 ? 'ов' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.partners.map((p) => (
                        <span
                          key={p.name}
                          style={{
                            display: 'inline-flex', padding: '5px 11px',
                            borderRadius: 999, fontSize: 11,
                            background: `${c.color}1A`,
                            border: `1px solid ${c.color}55`,
                            color: '#EAEAEA',
                            cursor: 'help',
                            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                          }}
                        >
                          <Tooltip explanation={p.info}>{p.name}</Tooltip>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        .w5-card-hover:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}

// Sub-component: TimelineRelease — горизонтальный 48 месяцев, 7 проектов × 4 окна
function TimelineRelease({ focused, onHover }) {
  const maxMonths = 48;
  const months = [0, 6, 12, 18, 24, 30, 36, 42, 48];
  return (
    <div>
      <div style={{
        fontSize: 12, color: '#EAEAEA', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 4, fontWeight: 600
      }}>
        Release-окна по каждому проекту — горизонт 48 месяцев
      </div>
      <div style={{
        fontSize: 11, color: '#8E8E93', marginBottom: 18
      }}>
        Каскад theatrical → OTT → TV → intl/merch. 7 проектов в портфеле, старт premiere каждые 4 мес.
      </div>

      {/* Шкала времени: 0, 6, 12, ... 48 мес */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        alignItems: 'center',
        gap: 12, marginBottom: 8
      }}>
        <div></div>
        <div style={{ position: 'relative', height: 20 }}>
          {months.map((m) => (
            <div
              key={m}
              style={{
                position: 'absolute',
                left: `${(m / maxMonths) * 100}%`,
                top: 0,
                fontSize: 10, color: '#8E8E93',
                transform: 'translateX(-50%)'
              }}
            >
              {m}м
            </div>
          ))}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 1, background: '#2A2D31'
          }} />
        </div>
      </div>

      {/* Проекты × окна */}
      <div style={{ display: 'grid', gap: 8 }}>
        {RELEASE_TIMELINE_W5.map((p) => (
          <div
            key={p.proj}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 12, alignItems: 'center'
            }}
          >
            <div style={{
              fontSize: 12, color: p.color, fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {p.proj}
            </div>
            <div style={{
              position: 'relative', height: 22,
              background: 'rgba(42,45,49,0.3)', borderRadius: 4,
              overflow: 'hidden'
            }}>
              {p.windows.map((w, i) => {
                const ch = DIST_CHANNELS_W5.find((c) => c.id === w.ch);
                const left = (w.s / maxMonths) * 100;
                const width = ((w.e - w.s) / maxMonths) * 100;
                const dim = focused && focused !== w.ch;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => onHover(w.ch)}
                    onMouseLeave={() => onHover(null)}
                    title={`${ch ? ch.name : w.ch}: ${w.s}–${w.e} мес`}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      top: 2, bottom: 2,
                      background: `linear-gradient(90deg, ${ch ? ch.color : '#888'}cc, ${ch ? ch.color : '#888'}88)`,
                      borderRadius: 3,
                      opacity: dim ? 0.25 : 0.95,
                      cursor: 'pointer',
                      boxShadow: (focused === w.ch) ? `0 0 10px ${ch ? ch.color : '#888'}` : 'none',
                      transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div style={{
        marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 14,
        fontSize: 11, color: '#8E8E93'
      }}>
        {DIST_CHANNELS_W5.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2, background: c.color
            }} />
            {c.name} (window {c.window} мес)
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, fontSize: 10, color: '#8E8E93', fontStyle: 'italic'
      }}>
        48 месяцев = горизонт возврата капитала вашему фонду по всему портфелю
      </div>
    </div>
  );
}

// ========================================================================
// §5.20 s20 — WATERFALL INTRO (scroll-pinned 200vh, canvas money particles,
//                              4 PE-tooltips hurdle/catch-up/super-carry/MOIC)
// ========================================================================

function WaterfallIntroSection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [personalCommit, setPersonalCommit] = useState(100); // млн ₽
  const [activeTierIdx, setActiveTierIdx] = useState(0);

  // IntersectionObserver: активируем scroll-drive только когда секция в viewport
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setInView(e.isIntersecting));
      },
      { threshold: 0, rootMargin: '0px' }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Scroll-progress (scrollYProgress аналог): 0→1 по мере скролла секции
  useEffect(() => {
    if (!inView) return;
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const winH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - winH)));
      setScrollProgress(progress);
      // multiplier 0.5× → 5×
      const m = 0.5 + progress * 4.5;
      setMultiplier(m);
      // active tier: по thresholds
      if (m < 1.08) setActiveTierIdx(0);
      else if (m < 1.6) setActiveTierIdx(1);
      else if (m < 2.5) setActiveTierIdx(2);
      else setActiveTierIdx(3);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [inView]);

  // Canvas money particles — cascade visual flowing between tiers
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle pool
    const palette = ['#F4A261', '#2A9D8F', '#4A9EFF', '#A855F7'];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width / DPR,
      y: Math.random() * canvas.height / DPR,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.4 + Math.random() * 1.4,
      size: 1.8 + Math.random() * 2.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: 0.55 + Math.random() * 0.45
    }));

    const tick = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      // Активность каскада повышается с multiplier
      const flow = 0.5 + (multiplier - 0.5) / 4.5;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy * flow;
        if (p.y > h + 8) {
          p.y = -8;
          p.x = Math.random() * w;
        }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        ctx.globalAlpha = p.alpha * (0.6 + flow * 0.4);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [multiplier]);

  // Waterfall math для personal LP example
  const gross = personalCommit * multiplier;
  const profit = Math.max(0, gross - personalCommit);
  const tier1 = personalCommit * 0.08 * 7;                        // LP hurdle (8% × ~7 лет)
  const tier2 = Math.min(personalCommit * 0.60, profit * 0.20);   // GP catch-up
  const tier3 = Math.max(0, (profit - tier1 - tier2) * 0.80);     // 80/20 LP split
  const tier4 = multiplier > 2.5 ? profit * 0.05 : 0;             // super-carry
  const lpTake = tier1 + tier3 + tier4;
  const gpTake = Math.max(0, gross - lpTake);

  const tierValues = [tier1, tier2, tier3, tier4];
  const tierActive = (idx) => idx <= activeTierIdx;

  return (
    <section
      id="s20"
      ref={containerRef}
      aria-labelledby="s20-title"
      style={{
        minHeight: '200vh',           // 200vh scroll-pin container
        background: '#0F1216',
        position: 'relative',
        padding: 0
      }}
    >
      {/* Sticky inner 100vh — scroll-pinned */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Canvas money particles (cascade visual) — поверх всей секции */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.55,
            mixBlendMode: 'screen'
          }}
        />

        {/* SVG cascade particles (filter drop-shadow) — дублирующий premium-polish layer */}
        <svg
          aria-hidden="true"
          width="100%"
          height="100%"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 6px 14px rgba(244,162,97,0.35))',
            opacity: 0.18
          }}
        >
          {/* SVG particle shapes: падающие кружки каскадом */}
          <g className="svg-particle-group">
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={100 + i * 90}
                cy={50 + (i * 63) % 400}
                r={3 + (i % 4)}
                fill={['#F4A261', '#2A9D8F', '#4A9EFF', '#A855F7'][i % 4]}
                style={{
                  transformOrigin: 'center',
                  animation: `w5-svg-particle-fall ${3 + (i % 5) * 0.4}s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.2}s infinite`
                }}
              />
            ))}
          </g>
          {/* Cascade bars — SVG bars с drop-shadow */}
          {PE_TIERS_W5.map((t, idx) => (
            <rect
              key={t.key}
              x={150 + idx * 260}
              y={500 - idx * 40}
              width={200}
              height={60 + idx * 30}
              rx={8}
              fill={t.color}
              opacity={tierActive(idx) ? 0.85 : 0.18}
              style={{
                transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            />
          ))}
        </svg>

        <div style={{
          position: 'relative',
          zIndex: 3,
          flex: 1,
          overflowY: 'auto',
          padding: '60px 24px',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%'
        }}>
          <Reveal>
            <div style={{
              fontSize: 11, color: '#F4A261', textTransform: 'uppercase',
              letterSpacing: 2, fontWeight: 600, textAlign: 'center', marginBottom: 10
            }}>
              Waterfall / Распределение прибыли
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h2 id="s20-title" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: '#EAEAEA', textAlign: 'center', margin: 0, lineHeight: 1.15
            }}>
              Как делится <span style={{ color: '#F4A261' }}>прибыль</span> с вашим фондом
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{
              textAlign: 'center', color: '#F4A261',
              fontSize: 13, marginTop: 12, letterSpacing: 0.3
            }}>
              Прокрутите секцию &mdash; multiplier двигается от 0.5&times; до 5&times;, показывая активные tier'ы waterfall
            </p>
          </Reveal>

          {/* Slider indicator (read-only, scroll-driven) */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{
              fontSize: 11, color: '#8E8E93', textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              scroll-progress · scrollYProgress (pinned)
            </div>
            <div style={{
              fontSize: 44, fontFamily: "'Playfair Display', Georgia, serif",
              color: '#F4A261', marginTop: 4, lineHeight: 1,
              textShadow: '0 2px 20px rgba(244,162,97,0.45)'
            }}>
              {multiplier.toFixed(2)}&times;
            </div>
            <div style={{
              maxWidth: 420, margin: '10px auto 0', height: 4,
              background: '#2A2D31', borderRadius: 2, position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${scrollProgress * 100}%`,
                background: 'linear-gradient(90deg, #F4A261, #E67E22)',
                borderRadius: 2,
                transition: 'width 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
              }} />
            </div>
          </div>

          {/* Intro-block с 4 PE <Tooltip: hurdle / catch-up / super-carry / MOIC */}
          <Reveal delay={180}>
            <div
              className="glass"
              style={{
                marginTop: 28, padding: 22, borderRadius: 12,
                border: '1px solid #2A2D31',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                background: 'rgba(21,24,28,0.6)'
              }}
            >
              <h3 style={{
                fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif",
                color: '#EAEAEA', margin: 0
              }}>
                Порядок распределения (PE-waterfall)
              </h3>
              <ol style={{
                color: '#EAEAEA', marginTop: 10, paddingLeft: 22,
                lineHeight: 1.85, fontSize: 14
              }}>
                <li>
                  Ваш фонд сначала получает свой commitment +{' '}
                  <Tooltip explanation="hurdle = 8% годовых preferred return вашему фонду до любого дележа прибыли (минимальная защита LP)">
                    8% годовых (hurdle)
                  </Tooltip>
                </li>
                <li>
                  Холдинг догоняет свою carry-долю через{' '}
                  <Tooltip explanation="catch-up = GP catch-up механизм: холдинг ускоренно добирает carry до 20% после закрытия LP hurdle">
                    catch-up до 20%
                  </Tooltip>
                </li>
                <li>
                  Дальнейшая прибыль делится{' '}
                  <Tooltip explanation="80/20 split — классическая PE-пропорция: 80% остатка прибыли — вашему фонду (LP), 20% — холдингу (GP)">
                    80/20
                  </Tooltip>
                  {' '} с оглядкой на{' '}
                  <Tooltip explanation="MOIC = Multiple on Invested Capital — кратность возврата commitment'а вашего фонда (target MOIC 3.62× по канону)">
                    MOIC
                  </Tooltip>
                </li>
                <li>
                  Если MOIC &gt; 2.5&times; — бонус команде холдинга:{' '}
                  <Tooltip explanation="super-carry = дополнительные 5% от profit для команды холдинга при сверх-сильной доходности MOIC > 2.5×. Стимул align'нутый с вашим фондом.">
                    super-carry 5%
                  </Tooltip>
                </li>
              </ol>
            </div>
          </Reveal>

          {/* Cascade bars — 4 tier'а с визуализацией (canvas particles уже идут поверх) */}
          <Reveal delay={260}>
            <div style={{
              marginTop: 24, padding: 18,
              background: 'rgba(11,13,16,0.55)', borderRadius: 12,
              border: '1px solid #2A2D31'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10
              }}>
                {PE_TIERS_W5.map((t, i) => {
                  const active = tierActive(i);
                  return (
                    <div
                      key={t.key}
                      className="glass"
                      style={{
                        padding: 14, borderRadius: 10, position: 'relative',
                        border: `1px solid ${active ? t.color : '#2A2D31'}`,
                        opacity: active ? 1 : 0.35,
                        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                        boxShadow: active && i === 3 && multiplier > 2.5 ? `0 0 22px ${t.color}` : 'none',
                        backdropFilter: 'blur(8px)',
                        background: 'rgba(21,24,28,0.6)',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        fontSize: 10, color: '#8E8E93', textTransform: 'uppercase',
                        letterSpacing: 1
                      }}>
                        {t.tier}
                      </div>
                      <div style={{ fontSize: 12, color: '#EAEAEA', marginTop: 3, fontWeight: 600 }}>
                        {t.name}
                      </div>
                      <div style={{
                        fontSize: 18, fontFamily: "'Playfair Display', Georgia, serif",
                        color: t.color, marginTop: 6, lineHeight: 1
                      }}>
                        {tierValues[i].toFixed(1)}
                      </div>
                      <div style={{ fontSize: 10, color: t.color, marginTop: 2 }}>
                        млн ₽ &rarr; {t.to}
                      </div>
                      {/* inline particles flowing to recipient */}
                      {active && tierValues[i] > 0 && [0, 1, 2].map((p) => (
                        <div
                          key={p}
                          aria-hidden="true"
                          style={{
                            position: 'absolute', top: '55%', right: -6,
                            width: 4, height: 4, borderRadius: '50%',
                            background: t.color,
                            animation: `w5-particle-flow 1.8s cubic-bezier(0.22, 1, 0.36, 1) ${p * 0.6}s infinite`,
                            filter: `drop-shadow(0 0 4px ${t.color})`
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Personal LP example — commitment вашего фонда */}
          <Reveal delay={340}>
            <div
              className="glass"
              style={{
                marginTop: 22, padding: 18, borderRadius: 12,
                border: '1px dashed #F4A26199',
                backdropFilter: 'blur(10px)',
                background: 'rgba(21,24,28,0.6)'
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
              <div style={{ marginTop: 14, color: '#EAEAEA', lineHeight: 1.8, fontSize: 14 }}>
                &bull; Commitment вашего фонда превратился в{' '}
                <strong style={{ color: '#F4A261' }}>{gross.toFixed(0)} млн ₽</strong> gross-потока<br />
                &bull; Из них{' '}
                <strong style={{ color: '#2A9D8F' }}>ваш фонд получает {lpTake.toFixed(0)} млн ₽</strong>{' '}
                ({(lpTake / personalCommit).toFixed(2)}&times; net-возврата на commitment)<br />
                &bull; Холдинг получает {gpTake.toFixed(0)} млн ₽ в виде GP carry (tier 2 + tier 4)
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @keyframes w5-particle-flow {
          0%   { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(32px) scale(0); opacity: 0; }
        }
        @keyframes w5-svg-particle-fall {
          0%   { transform: translateY(-20px); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translateY(600px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ========================================================================
// §5.22 s22 — CTA (img18 background + Готовы обсудить партнёрство + Zoom/Email/Telegram
//                 + 3 <CountUp end= 20.09 / 7 / 348, «ваш фонд» copy)
// ========================================================================

function CTASection() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2800);
    return () => clearTimeout(t);
  }, [msg]);

  const clickCta = (label, contact) => {
    setMsg(`${label} — контакт: ${contact}`);
  };

  return (
    <section
      id="s22"
      aria-labelledby="s22-title"
      style={{
        position: 'relative',
        padding: '120px 24px',
        textAlign: 'center',
        overflow: 'hidden',
        background: '#0B0D10'
      }}
    >
      {/* Фоновое изображение img18 (banner_press.jpg) */}
      <img
        src="__IMG_PLACEHOLDER_img18__"
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.22
        }}
      />
      {/* Animated gradient mesh */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(244,162,97,0.28), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(42,157,143,0.22), transparent 50%)',
          pointerEvents: 'none',
          animation: 'w5-mesh-shift 18s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate'
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
          filter: 'url(#grain)', opacity: 0.3, pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto' }}>
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
            Готовы обсудить <span style={{ color: '#F4A261' }}>партнёрство</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p style={{
            color: '#C8C8CE', marginTop: 16, fontSize: 18,
            maxWidth: 720, margin: '16px auto 0', lineHeight: 1.6
          }}>
            Свяжитесь с командой холдинга напрямую — обсудим структуру партнёрства для вашего фонда,
            ответим в течение 24 часов, проведём Zoom-звонок с CEO и вышлем полный investment pack.
            Партнёрство с вашим фондом начинается с knowledge-sharing call.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            marginTop: 40, flexWrap: 'wrap'
          }}>
            <button
              className="w5-cta-btn"
              onClick={() => clickCta('Zoom', 'zoom.us/ceo-trendstudio')}
              aria-label="Zoom-звонок с CEO"
              style={{
                padding: '14px 30px',
                background: '#F4A261',
                color: '#0B0D10',
                border: 'none',
                borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                letterSpacing: 0.3
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>Zoom</span>
              <span style={{
                position: 'relative', zIndex: 2, marginLeft: 6, opacity: 0.7, fontWeight: 400
              }}>
                с CEO
              </span>
            </button>
            <button
              className="w5-cta-btn"
              onClick={() => clickCta('Email', 'mailto:cio@trendstudio.ru')}
              aria-label="Email CIO"
              style={{
                padding: '14px 30px',
                background: 'transparent',
                color: '#EAEAEA',
                border: '1px solid #EAEAEA',
                borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>Email</span>
              <span style={{
                position: 'relative', zIndex: 2, marginLeft: 6, opacity: 0.7, fontWeight: 400
              }}>
                CIO
              </span>
            </button>
            <button
              className="w5-cta-btn"
              onClick={() => clickCta('Telegram', 't.me/trendstudio_ir')}
              aria-label="Telegram IR-команды"
              style={{
                padding: '14px 30px',
                background: 'transparent',
                color: '#EAEAEA',
                border: '1px solid #EAEAEA',
                borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>Telegram</span>
              <span style={{
                position: 'relative', zIndex: 2, marginLeft: 6, opacity: 0.7, fontWeight: 400
              }}>
                IR
              </span>
            </button>
          </div>
        </Reveal>

        {msg && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: 20, display: 'inline-block',
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(244,162,97,0.14)', color: '#F4A261',
              border: '1px solid #F4A26144', fontSize: 13,
              animation: 'w5-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both'
            }}
          >
            {msg}
          </div>
        )}

        {/* 3 KPI CountUp — 20.09% IRR, 7 projects, 348 tests */}
        <Reveal delay={500}>
          <div style={{
            display: 'flex', gap: 'clamp(24px, 6vw, 72px)',
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
                IRR Public (target)
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
                MC-тестов финмодели
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={600}>
          <div style={{
            marginTop: 56, color: '#8E8E93', fontSize: 12,
            letterSpacing: 0.5, maxWidth: 720, margin: '56px auto 0'
          }}>
            Формат: институциональные партнёры (family office, PE-фонды, стратегические инвесторы).
            Партнёрство с вашим фондом согласуется индивидуально — от 100 млн ₽ commitment,
            horizon 7 лет, target MOIC 3.62&times;.
          </div>
        </Reveal>
      </div>

      <style>{`
        .w5-cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 44px rgba(244,162,97,0.5);
        }
        .w5-cta-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .w5-cta-btn:hover::before { left: 100%; }
        @keyframes w5-mesh-shift {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-4%, 3%, 0) scale(1.06); }
        }
      `}</style>
    </section>
  );
}

// ========================================================================
// ROOT APP_W5 — композиция App_W4 + s17 → s19 → s20 → s22 + FooterStub
// FAQ НЕ включён (перенесён в W6), Legal & TermSheet — тоже W6.
// ========================================================================

function App_W5() {
  return (
    <>
      <ScrollProgress />
      <TopNav />
      <main>
        {/* W1 — foundation */}
        <HeroSection />
        <ThesisSection />
        <MarketSection />
        {/* W2 — fund + economics + MC + pipeline */}
        <FundStructureSection />
        <EconomicsSection />
        <ReturnsSection />
        <MonteCarloSimulator />
        {/* W3 — pipeline + team + advisory + operations */}
        <PipelineSection />
        <TeamSection />
        <AdvisorySection />
        <OperationsSection />
        {/* W4 — risks + roadmap + scenarios + regions + tax + M2 + M3 */}
        <RisksSection />
        <RoadmapSection />
        <ScenariosSection />
        <RegionsSection />
        <TaxCreditsSection />
        <M2BuilderSection />
        <CommitmentCalculatorSection />
        {/* W5 NEW — press / distribution / waterfall / CTA */}
        <PressQuotesSection />       {/* s17 */}
        <DistributionSection />      {/* s19 */}
        <WaterfallIntroSection />    {/* s20 scroll-pinned */}
        <CTASection />               {/* s22 — Готовы обсудить партнёрство */}
      </main>
      <FooterStub />
    </>
  );
}
