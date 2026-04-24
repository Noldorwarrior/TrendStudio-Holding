// ==== Wave 6: s21 Legal (MAJOR FIX §4.6) + s23 Term Sheet + s24 FooterFull + i18n RU/EN ====

// — EXTEND ICONS for W6 —
Object.assign(ICONS, {
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
});

// ============================================================================
// i18n RU/EN — LangContext + I18N dictionary + useT hook
// ============================================================================

const I18N = {
  ru: {
    // Nav (9)
    'nav.hero': 'Главная',
    'nav.thesis': 'Тезис',
    'nav.market': 'Рынок',
    'nav.economics': 'Экономика',
    'nav.pipeline': 'Пайплайн',
    'nav.team': 'Команда',
    'nav.risks': 'Риски',
    'nav.distribution': 'Распределение',
    'nav.contact': 'Контакты',
    // Hero (5)
    'hero.title': 'ТрендСтудио',
    'hero.tagline': 'LP-фонд российского кино. 3 000 млн ₽ на 7 лет. Целевая IRR 20–25%.',
    'hero.cta.primary': 'Запросить LP-пакет',
    'hero.cta.secondary': 'Скачать memo',
    'hero.scroll': 'Перейти к следующей секции',
    // Section headings (25)
    'thesis.title': 'Почему ТрендСтудио',
    'market.title': 'Рынок кинопроизводства РФ',
    'fund.title': 'Структура фонда',
    'economics.title': 'Экономика для LP',
    'returns.title': 'Ожидаемая доходность',
    'mc.title': 'M1 Monte-Carlo симулятор',
    'pipeline.title': 'Портфельные проекты',
    'm2.title': 'M2 Конструктор портфеля',
    'm3.title': 'Сколько вы получите — посчитайте сами',
    'stages.title': 'Производственные стадии',
    'team.title': 'Команда',
    'advisory.title': 'Экспертный совет',
    'operations.title': '6-step process',
    'risks.title': 'Карта рисков',
    'roadmap.title': '7-летний план',
    'scenarios.title': 'Сценарии',
    'regions.title': 'Регионы',
    'tax.title': 'Гос-поддержка',
    'press.title': 'О нас пишут',
    'faq.title': 'Часто задаваемые вопросы',
    'distribution.title': 'Каналы дистрибуции',
    'waterfall.title': 'Waterfall: кто сколько получает',
    'cta.title': 'Готовы обсудить вхождение в фонд?',
    'legal.title': 'Правовая информация',
    'term.title': 'Term Sheet',
    // CTA buttons (10)
    'cta.zoom': 'Запросить Zoom-звонок',
    'cta.email': 'Email',
    'cta.telegram': 'Telegram',
    'cta.nda': 'Запросить NDA и доступ к полному PPM →',
    'cta.subscribe': 'Подписаться',
    'cta.download_term': 'Скачать PDF Term Sheet',
    'cta.consent': 'Я прочитал и согласен. Подтверждаю статус',
    'cta.qualified': 'квалифицированного инвестора',
    'cta.qualified.tooltip': 'Квалифицированный инвестор по ФЗ-156: физлицо с активами ≥6 млн ₽ или юрлицо, соответствующее требованиям ЦБ.',
    'cta.consent.dot': '.',
    // Footer (14)
    'footer.slogan': 'LP-фонд российского кино с институциональной дисциплиной.',
    'footer.rights': '© 2026 ТрендСтудио. Все права защищены.',
    'footer.product': 'Продукт',
    'footer.contact': 'Контакты',
    'footer.newsletter': 'Подписка',
    'footer.newsletter.desc': 'Ежеквартальные обновления для LP и advisors.',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.terms': 'Условия использования',
    'footer.email.placeholder': 'your@email.com',
    'footer.phone': '+7 (495) 000-00-00',
    'footer.address': 'Москва · Санкт-Петербург',
    'footer.telegram': 'Telegram @trendstudio_ir',
    'footer.mail': 'ir@trendstudio.ru',
    'footer.subscribe.thanks': 'Спасибо! Мы свяжемся с вами в ближайшее время.',
    // Legal (6)
    'legal.subtitle': 'Ключевые правовые оговорки и условия доступа к материалам фонда.',
    'legal.nda.request': 'Запрос NDA: отправьте письмо на ir@trendstudio.ru',
    'legal.expand': 'Развернуть',
    'legal.collapse': 'Свернуть',
    'legal.nda.title': 'Доступ к полному PPM и LP Agreement',
    'legal.nda.desc': 'После подтверждения квалификации вы получите полный пакет документов по NDA.',
    // Term Sheet (13)
    'term.instrument': 'Инструмент',
    'term.ticket': 'Минимальный тикет',
    'term.mgmt': 'Management fee',
    'term.carry': 'Carried interest',
    'term.gp_commit': 'GP commitment',
    'term.invest_period': 'Investment period',
    'term.life': 'Fund life',
    'term.key_person': 'Key-person',
    'term.lpac': 'LPAC',
    'term.first_close': 'First close',
    'term.interim_close': 'Interim close',
    'term.final_close': 'Final close',
    'term.subtitle': 'Ключевые коммерческие условия LP/GP-соглашения.',
    // Waterfall tiers (4)
    'wf.t1': 'Общий возврат фонда',
    'wf.t2': 'Прибыль сверх вложений',
    'wf.t3': 'Доля инвесторов',
    'wf.t4': 'Доля команды',
    // M3 labels (8)
    'm3.commit': 'Размер вашего commitment',
    'm3.multiplier': 'Target MOIC',
    'm3.gross': 'Ваши деньги превратились в',
    'm3.lp_take': 'Из них вы получаете (LP take)',
    'm3.gp_take': 'Команда получает (GP take)',
    'm3.multiple': 'от вложенного',
    'm3.range': 'диапазон',
    'm3.unit': 'млн ₽',
  },
  en: {
    // Nav (9)
    'nav.hero': 'Home',
    'nav.thesis': 'Thesis',
    'nav.market': 'Market',
    'nav.economics': 'Economics',
    'nav.pipeline': 'Pipeline',
    'nav.team': 'Team',
    'nav.risks': 'Risks',
    'nav.distribution': 'Distribution',
    'nav.contact': 'Contact',
    // Hero (5)
    'hero.title': 'TrendStudio',
    'hero.tagline': 'LP fund for Russian cinema. 3 000 mln ₽ over 7 years. Target IRR 20–25%.',
    'hero.cta.primary': 'Request LP pack',
    'hero.cta.secondary': 'Download memo',
    'hero.scroll': 'Go to next section',
    // Section headings (25)
    'thesis.title': 'Why TrendStudio',
    'market.title': 'Russian cinema market',
    'fund.title': 'Fund structure',
    'economics.title': 'LP economics',
    'returns.title': 'Expected returns',
    'mc.title': 'M1 Monte-Carlo simulator',
    'pipeline.title': 'Portfolio projects',
    'm2.title': 'M2 Portfolio builder',
    'm3.title': 'How much will you get — run the numbers',
    'stages.title': 'Production stages',
    'team.title': 'Team',
    'advisory.title': 'Advisory board',
    'operations.title': '6-step process',
    'risks.title': 'Risk map',
    'roadmap.title': '7-year roadmap',
    'scenarios.title': 'Scenarios',
    'regions.title': 'Regions',
    'tax.title': 'Government support',
    'press.title': 'Press coverage',
    'faq.title': 'Frequently asked questions',
    'distribution.title': 'Distribution channels',
    'waterfall.title': 'Waterfall: who gets what',
    'cta.title': 'Ready to discuss joining the fund?',
    'legal.title': 'Legal information',
    'term.title': 'Term Sheet',
    // CTA buttons (10)
    'cta.zoom': 'Schedule a Zoom call',
    'cta.email': 'Email',
    'cta.telegram': 'Telegram',
    'cta.nda': 'Request NDA and full PPM access →',
    'cta.subscribe': 'Subscribe',
    'cta.download_term': 'Download PDF Term Sheet',
    'cta.consent': 'I have read and agree. I confirm status of',
    'cta.qualified': 'qualified investor',
    'cta.qualified.tooltip': 'Qualified investor under FZ-156: individual with ≥6 mln ₽ in assets or legal entity meeting CBR criteria.',
    'cta.consent.dot': '.',
    // Footer (14)
    'footer.slogan': 'LP fund for Russian cinema with institutional discipline.',
    'footer.rights': '© 2026 TrendStudio. All rights reserved.',
    'footer.product': 'Product',
    'footer.contact': 'Contact',
    'footer.newsletter': 'Newsletter',
    'footer.newsletter.desc': 'Quarterly updates for LPs and advisors.',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms of use',
    'footer.email.placeholder': 'your@email.com',
    'footer.phone': '+7 (495) 000-00-00',
    'footer.address': 'Moscow · St. Petersburg',
    'footer.telegram': 'Telegram @trendstudio_ir',
    'footer.mail': 'ir@trendstudio.ru',
    'footer.subscribe.thanks': 'Thank you! We will be in touch shortly.',
    // Legal (6)
    'legal.subtitle': 'Key legal disclaimers and conditions for accessing fund materials.',
    'legal.nda.request': 'NDA request: email ir@trendstudio.ru',
    'legal.expand': 'Expand',
    'legal.collapse': 'Collapse',
    'legal.nda.title': 'Access to full PPM and LP Agreement',
    'legal.nda.desc': 'After qualification confirmation, you will receive the complete document package under NDA.',
    // Term Sheet (13)
    'term.instrument': 'Instrument',
    'term.ticket': 'Minimum ticket',
    'term.mgmt': 'Management fee',
    'term.carry': 'Carried interest',
    'term.gp_commit': 'GP commitment',
    'term.invest_period': 'Investment period',
    'term.life': 'Fund life',
    'term.key_person': 'Key-person',
    'term.lpac': 'LPAC',
    'term.first_close': 'First close',
    'term.interim_close': 'Interim close',
    'term.final_close': 'Final close',
    'term.subtitle': 'Key commercial terms of the LP/GP agreement.',
    // Waterfall tiers (4)
    'wf.t1': 'Total fund return',
    'wf.t2': 'Profit above invested',
    'wf.t3': 'LP share',
    'wf.t4': 'GP share',
    // M3 labels (8)
    'm3.commit': 'Your commitment size',
    'm3.multiplier': 'Target MOIC',
    'm3.gross': 'Your money becomes',
    'm3.lp_take': 'Of which you receive (LP take)',
    'm3.gp_take': 'Team receives (GP take)',
    'm3.multiple': 'of invested',
    'm3.range': 'range',
    'm3.unit': 'mln ₽',
  },
};

const LangContext = React.createContext({ lang: 'ru', setLang: () => {} });

function useT() {
  const { lang } = React.useContext(LangContext);
  return (k) => (I18N[lang] && I18N[lang][k]) || I18N.ru[k] || k;
}

function LangProvider({ children }) {
  const [lang, setLang] = useState('ru');
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ============================================================================
// TopNav2 — новый с i18n
// ============================================================================

function TopNav2() {
  const { lang, setLang } = React.useContext(LangContext);
  const t = useT();
  const navLinks = [
    { id: 's01', key: 'nav.hero' },
    { id: 's02', key: 'nav.thesis' },
    { id: 's03', key: 'nav.market' },
    { id: 's04', key: 'nav.economics' },
    { id: 's07', key: 'nav.pipeline' },
    { id: 's09', key: 'nav.team' },
    { id: 's12', key: 'nav.risks' },
    { id: 's19', key: 'nav.distribution' },
    { id: 's22', key: 'nav.contact' },
  ];
  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,13,16,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2A2D31',
      }}
      aria-label="Основная навигация"
    >
      <div
        style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}
      >
        <a
          href="#s01"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700, color: '#EAEAEA',
            textDecoration: 'none', letterSpacing: 0.3,
          }}
        >
          {t('hero.title')}
        </a>
        <ul
          style={{
            display: 'flex', gap: 22, listStyle: 'none', margin: 0, padding: 0,
            flexWrap: 'wrap',
          }}
          className="hidden md:flex"
        >
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                style={{
                  color: '#EAEAEA', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  transition: 'color 0.2s ease-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#EAEAEA')}
              >
                {t(l.key)}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Язык интерфейса / Language">
          {[
            { code: 'ru', label: 'RU' },
            { code: 'en', label: 'EN' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              aria-pressed={lang === item.code}
              aria-label={`Switch to ${item.label}`}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 13, fontWeight: 600,
                background: lang === item.code ? '#F4A261' : 'transparent',
                color: lang === item.code ? '#0B0D10' : '#EAEAEA',
                border: `1px solid ${lang === item.code ? '#F4A261' : '#2A2D31'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// s21 LEGAL — MAJOR FIX §4.6 (desktop stagger + mobile accordion + NDA Gate)
// ============================================================================

const LEGAL_ITEMS = [
  {
    id: 'l1', iconKey: 'shield', color: '#F4A261',
    title: 'Статус инвестора',
    text: 'Инвестиции доступны только квалифицированным инвесторам по ФЗ-156 «Об инвестиционных фондах». Минимальный тикет 50 млн ₽ (обсуждаемо для anchor LP).',
  },
  {
    id: 'l2', iconKey: 'alertCircle', color: '#EF4444',
    title: 'Риск потери капитала',
    text: 'Инвестиции в кинопроизводство сопряжены с высоким уровнем риска. Возможна полная потеря вложенных средств. Прошлая доходность не гарантирует будущую.',
  },
  {
    id: 'l3', iconKey: 'fileText', color: '#2A9D8F',
    title: 'Информационный характер',
    text: 'Этот документ предоставляется только в информационных целях и не является офертой, рекомендацией или обязательством к инвестиции. Полные условия — в PPM.',
  },
  {
    id: 'l4', iconKey: 'trendingUp', color: '#4A9EFF',
    title: 'Модельные прогнозы',
    text: 'Все прогнозные значения (IRR, MOIC, DPI, BO) — модельные оценки на основе Monte-Carlo с 348 сценариев. Они НЕ являются гарантиями.',
  },
  {
    id: 'l5', iconKey: 'globe', color: '#A855F7',
    title: 'Юрисдикция',
    text: 'Основная юрисдикция — РФ. Вторичные: Казахстан (региональные rebates), ОАЭ (для LP из Gulf). Применяются нормативы ФЗ-156, Положение ЦБ №577-П, НК РФ.',
  },
  {
    id: 'l6', iconKey: 'lock', color: '#EAB308',
    title: 'Конфиденциальность',
    text: 'Передача этого материала третьим лицам без письменного согласия управляющей компании запрещена. NDA подписывается до доступа к полному PPM и LP Agreement.',
  },
];

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => setDesktop(mq.matches);
    handler();
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, []);
  return desktop;
}

function LegalCard({ item, index, desktop, expanded, onToggle }) {
  const isOpen = desktop || expanded;
  const [hover, setHover] = useState(false);
  const panelId = `legal-panel-${item.id}`;
  return (
    <Reveal delay={desktop ? index * 80 : 0}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: '#15181C',
          border: `1px solid ${hover ? item.color : '#2A2D31'}`,
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'border-color 0.2s ease-out',
          height: '100%',
        }}
      >
        {desktop ? (
          <div style={{ padding: 24 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.color}1f`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <Icon path={ICONS[item.iconKey]} size={20} color={item.color} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18, fontWeight: 700,
                  color: '#EAEAEA', margin: 0, lineHeight: 1.25,
                }}
              >
                {item.title}
              </h3>
            </div>
            <p
              id={panelId}
              style={{
                margin: 0, fontSize: 14, lineHeight: 1.6, color: '#EAEAEA',
              }}
            >
              {item.text}
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-controls={panelId}
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${item.color}1f`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color, flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Icon path={ICONS[item.iconKey]} size={16} color={item.color} />
                </span>
                {item.title}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  color: item.color,
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
              id={panelId}
              style={{
                maxHeight: expanded ? 400 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-out',
              }}
              aria-hidden={!expanded}
            >
              <p
                style={{
                  margin: 0, padding: '0 20px 18px',
                  fontSize: 14, lineHeight: 1.6, color: '#EAEAEA',
                }}
              >
                {item.text}
              </p>
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}

function NDAGate() {
  const t = useT();
  const [agreed, setAgreed] = useState(false);
  const handleClick = () => {
    if (agreed) {
      // eslint-disable-next-line no-alert
      alert(t('legal.nda.request'));
    }
  };
  return (
    <Reveal delay={200}>
      <div
        style={{
          marginTop: 48,
          padding: 28,
          background: 'linear-gradient(135deg, rgba(244,162,97,0.06) 0%, rgba(42,157,143,0.06) 100%)',
          border: '1px solid rgba(244,162,97,0.35)',
          borderRadius: 16,
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
          {t('legal.nda.title')}
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: '#8E8E93', lineHeight: 1.6 }}>
          {t('legal.nda.desc')}
        </p>
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            marginBottom: 18,
            fontSize: 14,
            color: '#EAEAEA',
            lineHeight: 1.55,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            aria-label={t('cta.consent')}
            style={{
              marginTop: 3,
              width: 18,
              height: 18,
              accentColor: '#F4A261',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <span>
            {t('cta.consent')}{' '}
            <Tooltip explanation={t('cta.qualified.tooltip')}>
              {t('cta.qualified')}
            </Tooltip>
            {t('cta.consent.dot')}
          </span>
        </label>
        <button
          type="button"
          onClick={handleClick}
          disabled={!agreed}
          aria-disabled={!agreed}
          style={{
            padding: '12px 24px',
            background: agreed ? '#F4A261' : '#2A2D31',
            color: agreed ? '#0B0D10' : '#8E8E93',
            border: 'none',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 15,
            cursor: agreed ? 'pointer' : 'not-allowed',
            opacity: agreed ? 1 : 0.5,
            transition: 'all 0.25s ease-out',
            boxShadow: agreed ? '0 8px 24px rgba(244,162,97,0.35)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (agreed) e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {t('cta.nda')}
        </button>
      </div>
    </Reveal>
  );
}

function LegalSection() {
  const t = useT();
  const desktop = useIsDesktop();
  const [expandedId, setExpandedId] = useState(null);
  return (
    <section
      id="s21"
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(180deg, #0B0D10 0%, #0F1216 100%)',
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
            {t('legal.title')}
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
              lineHeight: 1.6,
            }}
          >
            {t('legal.subtitle')}
          </p>
        </Reveal>

        {desktop ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {LEGAL_ITEMS.map((item, i) => (
              <LegalCard
                key={item.id}
                item={item}
                index={i}
                desktop
                expanded
                onToggle={() => {}}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEGAL_ITEMS.map((item, i) => (
              <LegalCard
                key={item.id}
                item={item}
                index={i}
                desktop={false}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
              />
            ))}
          </div>
        )}

        <NDAGate />
      </div>
    </section>
  );
}

// ============================================================================
// s23 TERM SHEET — 2-col table with key terms
// ============================================================================

const TERM_SHEET = [
  { labelKey: 'term.instrument',     value: 'LP/GP Limited Partnership (РФ)' },
  { labelKey: 'term.ticket',         value: '50 млн ₽ (до 500 млн ₽)' },
  { labelKey: 'term.mgmt',           value: '2% годовых от commitment' },
  { labelKey: 'term.carry',          value: '20% с hurdle 8% + 100% catch-up' },
  { labelKey: 'term.gp_commit',      value: '2% от committed' },
  { labelKey: 'term.invest_period',  value: '4 года' },
  { labelKey: 'term.life',           value: '7 лет (+2 опционально)' },
  { labelKey: 'term.key_person',     value: 'CEO + Producer Lead' },
  { labelKey: 'term.lpac',           value: '5 LP-representatives' },
  { labelKey: 'term.first_close',    value: '2026 Q3, 1 500 млн ₽' },
  { labelKey: 'term.interim_close',  value: '2026 Q4, 2 200 млн ₽' },
  { labelKey: 'term.final_close',    value: '2027 Q1, 3 000 млн ₽' },
];

function TermSheetSection() {
  const t = useT();
  const handleDownload = () => {
    // eslint-disable-next-line no-alert
    alert('PDF Term Sheet будет доступен после подписания NDA. Свяжитесь: ir@trendstudio.ru');
  };
  return (
    <section
      id="s23"
      style={{
        padding: '96px 24px',
        background: '#0B0D10',
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
            {t('term.title')}
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
            {t('term.subtitle')}
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)',
            gap: 28,
            alignItems: 'start',
          }}
          className="term-sheet-grid"
        >
          <Reveal delay={180}>
            <dl
              style={{
                margin: 0,
                background: '#15181C',
                border: '1px solid #2A2D31',
                borderRadius: 16,
                overflow: 'hidden',
              }}
              aria-label="Term Sheet ключевые условия"
            >
              {TERM_SHEET.map((row, i) => (
                <Reveal key={row.labelKey} delay={i * 40} as="div">
                  <div
                    className="term-sheet-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 2fr)',
                      gap: 16,
                      padding: '14px 20px',
                      borderBottom: i < TERM_SHEET.length - 1 ? '1px solid #2A2D31' : 'none',
                      transition: 'background 0.2s ease-out',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <dt
                      style={{
                        fontSize: 13,
                        color: '#8E8E93',
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        fontWeight: 600,
                        alignSelf: 'center',
                      }}
                    >
                      {t(row.labelKey)}
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: '#EAEAEA',
                        fontWeight: 600,
                        alignSelf: 'center',
                      }}
                    >
                      {row.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={240}>
            <div
              style={{
                position: 'sticky',
                top: 96,
                background: 'linear-gradient(135deg, rgba(244,162,97,0.08) 0%, rgba(42,157,143,0.08) 100%)',
                border: '1px solid rgba(244,162,97,0.35)',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#EAEAEA',
                  margin: '0 0 10px',
                }}
              >
                PDF-версия
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: '#8E8E93', lineHeight: 1.55 }}>
                Полный Term Sheet (3 страницы) + LP Agreement summary доступны по NDA.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: '#F4A261',
                  color: '#0B0D10',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 8px 24px rgba(244,162,97,0.35)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Icon path={ICONS.download} size={16} /> {t('cta.download_term')}
              </button>
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .term-sheet-grid { grid-template-columns: 1fr !important; }
          .term-sheet-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        }
      `}</style>
    </section>
  );
}

// ============================================================================
// s24 FOOTER FULL — 4-col layout
// ============================================================================

function FooterFull() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    // eslint-disable-next-line no-alert
    alert(t('footer.subscribe.thanks'));
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const productLinks = [
    { id: 's01', key: 'nav.hero' },
    { id: 's02', key: 'nav.thesis' },
    { id: 's04', key: 'nav.economics' },
    { id: 's07', key: 'nav.pipeline' },
    { id: 's09', key: 'nav.team' },
    { id: 's18', key: 'faq.title' },
    { id: 's22', key: 'nav.contact' },
  ];

  return (
    <footer
      id="s24"
      style={{
        padding: '72px 24px 40px',
        borderTop: '1px solid #2A2D31',
        background: '#0B0D10',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Col 1: Brand */}
          <Reveal delay={0}>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24, fontWeight: 700,
                  color: '#EAEAEA',
                  marginBottom: 12,
                  letterSpacing: 0.3,
                }}
              >
                {t('hero.title')}
              </div>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: 13,
                  color: '#8E8E93',
                  lineHeight: 1.6,
                }}
              >
                {t('footer.slogan')}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#8E8E93',
                }}
              >
                {t('footer.rights')}
              </p>
            </div>
          </Reveal>

          {/* Col 2: Product links */}
          <Reveal delay={80}>
            <div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#EAEAEA',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  margin: '0 0 14px',
                }}
              >
                {t('footer.product')}
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {productLinks.map((l) => (
                  <li key={l.id} style={{ marginBottom: 8 }}>
                    <a
                      href={`#${l.id}`}
                      style={{
                        color: '#8E8E93',
                        textDecoration: 'none',
                        fontSize: 13,
                        transition: 'color 0.2s ease-out',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
                    >
                      {t(l.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Col 3: Contacts */}
          <Reveal delay={160}>
            <div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#EAEAEA',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  margin: '0 0 14px',
                }}
              >
                {t('footer.contact')}
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13, color: '#8E8E93' }}>
                <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon path={ICONS.mail} size={14} color="#F4A261" />
                  <a
                    href="mailto:ir@trendstudio.ru"
                    style={{ color: '#8E8E93', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
                  >
                    {t('footer.mail')}
                  </a>
                </li>
                <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon path={ICONS.phone} size={14} color="#F4A261" />
                  <span>{t('footer.phone')}</span>
                </li>
                <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon path={ICONS.globe} size={14} color="#F4A261" />
                  <span>{t('footer.address')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon path={ICONS.send} size={14} color="#F4A261" />
                  <span>{t('footer.telegram')}</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Col 4: Newsletter */}
          <Reveal delay={240}>
            <div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#EAEAEA',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  margin: '0 0 14px',
                }}
              >
                {t('footer.newsletter')}
              </h3>
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 13,
                  color: '#8E8E93',
                  lineHeight: 1.55,
                }}
              >
                {t('footer.newsletter.desc')}
              </p>
              <form
                onSubmit={handleSubscribe}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                aria-label="Newsletter subscription"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.email.placeholder')}
                  aria-label={t('footer.email.placeholder')}
                  required
                  style={{
                    padding: '10px 14px',
                    background: '#15181C',
                    border: '1px solid #2A2D31',
                    borderRadius: 8,
                    color: '#EAEAEA',
                    fontSize: 13,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#F4A261'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2D31'; }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    background: '#F4A261',
                    color: '#0B0D10',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {submitted ? '✓' : t('cta.subscribe')}
                </button>
              </form>
            </div>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <Reveal delay={320}>
          <div
            style={{
              borderTop: '1px solid #2A2D31',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 12,
              color: '#8E8E93',
            }}
          >
            <span>{t('footer.rights')}</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <a
                href="#s21"
                style={{ color: '#8E8E93', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
              >
                {t('footer.privacy')}
              </a>
              <a
                href="#s21"
                style={{ color: '#8E8E93', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
              >
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

// ============================================================================
// APP W6 — FINAL
// ============================================================================

function App_W6() {
  return (
    <LangProvider>
      <ScrollProgress />
      <TopNav2 />
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
        <LegalSection />
        <TermSheetSection />
      </main>
      <FooterFull />
    </LangProvider>
  );
}
