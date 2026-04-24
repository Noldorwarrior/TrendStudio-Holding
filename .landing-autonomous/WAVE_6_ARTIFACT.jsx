// =====================================================================
// Wave 6 Artifact — ТрендСтудио Landing v2.2 (ФИНАЛЬНАЯ волна)
// Adds:  s18 FAQSection (moved after Press, before Legal),
//        s21 LegalSection (6 flip-3D cards + NDA gate),
//        s23 TermSheetSection (13-row interactive accordion),
//        s25 FooterFull (4-col grid + newsletter + copyright),
//        I18N RU/EN dictionary + LangProvider + LangSwitcher,
//        Final premium-polish pass (Reveal / Tooltip / cubic-bezier /
//        backdrop-filter / @keyframes reinforcement).
// Replaces: TopNav -> TopNav2, FooterStub -> FooterFull.
// App_W6 renders the FULL composition of all sections from W1..W6.
// Section order (declaration + render):
//   FAQSection declared BEFORE LegalSection (grep §3.4) —
//   so line(FAQSection) < line(LegalSection) AND line(FAQSection) > line(PressQuotesSection)
// =====================================================================

// -------------------- §6.0  I18N dictionary (RU ≥94 ключей, EN stubs) --------------------

const I18N = {
  ru: {
    // nav (12)
    'nav.home': 'Главная',
    'nav.thesis': 'Почему мы',
    'nav.market': 'Рынок',
    'nav.fund': 'Фонд',
    'nav.economics': 'Экономика',
    'nav.pipeline': 'Проекты',
    'nav.team': 'Команда',
    'nav.risks': 'Риски',
    'nav.roadmap': 'Roadmap',
    'nav.faq': 'FAQ',
    'nav.contact': 'Контакты',
    'nav.legal': 'Legal',
    // hero (7)
    'hero.title': 'ТрендСтудио',
    'hero.tagline': 'Кинопроизводственный холдинг. 7 проектов 2026–2028. Ищем якорного партнёра-фонд на 3 000 млн ₽.',
    'hero.kpi.commitment': 'target commitment',
    'hero.kpi.horizon': 'инвестиционный горизонт',
    'hero.kpi.irr': 'прогнозная IRR P50',
    'hero.cta.primary': 'Обсудить партнёрство',
    'hero.cta.secondary': 'Скачать investment pack',
    // section headings (26)
    'thesis.title': 'Почему партнёрство с холдингом',
    'thesis.card1.title': 'Диверсифицированный портфель',
    'thesis.card2.title': 'Данные и дисциплина',
    'thesis.card3.title': 'Команда и репутация',
    'market.title': 'Рынок',
    'fund.title': 'Структура фонда',
    'eco.title': 'Экономика фонда',
    'returns.title': 'Доходность',
    'mc.title': 'Monte-Carlo',
    'pipeline.title': 'Pipeline проектов',
    'team.title': 'Команда',
    'advisory.title': 'Advisory Board',
    'ops.title': 'Операции',
    'risks.title': 'Риски',
    'roadmap.title': 'Roadmap',
    'scenarios.title': 'Сценарии',
    'regions.title': 'Регионы',
    'tax.title': 'Налоговые кредиты',
    'distrib.title': 'Дистрибуция',
    'waterfall.title': 'Waterfall',
    'm2.title': 'Pipeline Builder',
    'm3.title': 'Что получит ваш фонд',
    'cta.title': 'Готовы обсудить партнёрство',
    'press.title': 'Пресса о нас',
    'faq.title': 'FAQ',
    'legal.title': 'Legal',
    'term.title': 'Term Sheet',
    'footer.brand.title': 'ТрендСтудио',
    // cta (10)
    'cta.primary': 'Обсудить партнёрство',
    'cta.secondary': 'Запросить investment pack',
    'cta.tertiary': 'Записаться на Zoom-звонок',
    'cta.submit': 'Отправить',
    'cta.learn_more': 'Подробнее',
    'cta.download': 'Скачать',
    'cta.nda': 'Подписать NDA',
    'cta.request_ppm': 'Запросить PPM',
    'cta.request_term': 'Скачать Term Sheet',
    'cta.discuss': 'Обсудить детали',
    // footer (15)
    'footer.brand.desc': 'Кинопроизводственный холдинг РФ. 7 проектов в portfolio 2026–2028. Ищем якорного партнёра-фонд.',
    'footer.product': 'Продукт',
    'footer.contact': 'Контакты',
    'footer.newsletter': 'Подписка',
    'footer.newsletter.desc': 'Ежеквартальный IR-апдейт для фондов-партнёров.',
    'footer.newsletter.placeholder': 'your@fund.com',
    'footer.newsletter.success': 'Спасибо! Вернёмся в течение 24 ч.',
    'footer.links.pipeline': 'Pipeline',
    'footer.links.team': 'Команда',
    'footer.links.risks': 'Риски',
    'footer.links.roadmap': 'Roadmap',
    'footer.links.distrib': 'Дистрибуция',
    'footer.links.partnership': 'Партнёрство',
    'footer.rights': 'Все права защищены.',
    'footer.about': 'О холдинге',
    // legal (9)
    'legal.expand': 'Развернуть',
    'legal.collapse': 'Свернуть',
    'legal.source': 'Источник',
    'legal.nda.gate': 'Для доступа к полному PPM требуется подписание NDA',
    'legal.nda.checkbox': 'Я понимаю, что доступ к PPM требует подписания NDA',
    'legal.nda.cta': 'Запросить NDA → доступ к PPM',
    'legal.status': 'Только квалифицированные фонды',
    'legal.flip_hint': 'Кликните по карточке — откроется обратная сторона с полным текстом',
    'legal.qualified': 'Для квалифицированных инвесторов',
    // term (15)
    'term.hint': 'Кликните по строке — увидите значение + impact для вашего фонда',
    'term.download': 'Скачать PDF Term Sheet',
    'term.impact': 'Impact для вашего фонда',
    'term.explain': 'Что это',
    'term.instrument': 'Инструмент',
    'term.ticket': 'Минимальный тикет',
    'term.mgmt_fee': 'Management fee',
    'term.carry': 'Carried interest',
    'term.hurdle': 'Hurdle',
    'term.catchup': 'Catch-up',
    'term.gp_commit': 'GP commitment',
    'term.inv_period': 'Investment period',
    'term.life': 'Fund life',
    'term.key_person': 'Key-person',
    'term.lpac': 'LPAC',
    // waterfall (5)
    'wf.hurdle': 'Hurdle rate',
    'wf.catchup': 'Catch-up',
    'wf.split': '80/20 split',
    'wf.moic': 'MOIC',
    'wf.super_carry': 'Super-carry',
    // m3 (10)
    'm3.tier.partner': 'Partner',
    'm3.tier.lead': 'Lead Investor',
    'm3.tier.anchor': 'Anchor Partner',
    'm3.your_commit': 'Commitment вашего фонда',
    'm3.dpi_y4': 'DPI год 4',
    'm3.dpi_y7': 'DPI год 7',
    'm3.irr_gross': 'IRR gross',
    'm3.moic_net': 'MOIC net',
    'm3.fund.tier': 'Tier',
    'm3.fund.stake': 'Стейк в фонде',
    // faq (8)
    'faq.cat.terms': 'Условия',
    'faq.cat.economics': 'Экономика',
    'faq.cat.governance': 'Governance',
    'faq.cat.process': 'Процесс',
    'faq.search': 'Поиск по FAQ…',
    'faq.no_results': 'Ничего не найдено',
    'faq.subtitle': '15 вопросов · условия, экономика, governance, процесс',
    'faq.expand_all': 'Развернуть все',
    // partnership (6)
    'partnership.your_fund': 'ваш фонд',
    'partnership.co_invest': 'со-инвестиционные права',
    'partnership.anchor': 'якорный партнёр',
    'partnership.gp_vehicle': 'GP-vehicle',
    'partnership.lp_agreement': 'LP Agreement',
    'partnership.open_to': 'холдинг открыт к партнёрству с вашим фондом',
  },
  en: {
    // nav
    'nav.home': 'Home',
    'nav.thesis': 'Why us',
    'nav.market': 'Market',
    'nav.fund': 'Fund',
    'nav.economics': 'Economics',
    'nav.pipeline': 'Projects',
    'nav.team': 'Team',
    'nav.risks': 'Risks',
    'nav.roadmap': 'Roadmap',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.legal': 'Legal',
    // hero
    'hero.title': 'TrendStudio',
    'hero.tagline': 'Film production holding. 7 projects 2026–2028. Seeking an anchor partner-fund for RUB 3 000 M.',
    'hero.kpi.commitment': 'target commitment',
    'hero.kpi.horizon': 'investment horizon',
    'hero.kpi.irr': 'projected IRR P50',
    'hero.cta.primary': 'Discuss partnership',
    'hero.cta.secondary': 'Download investment pack',
    // sections
    'thesis.title': 'Why partner with the holding',
    'market.title': 'Market',
    'fund.title': 'Fund structure',
    'eco.title': 'Fund economics',
    'returns.title': 'Returns',
    'mc.title': 'Monte-Carlo',
    'pipeline.title': 'Project pipeline',
    'team.title': 'Team',
    'advisory.title': 'Advisory Board',
    'ops.title': 'Operations',
    'risks.title': 'Risks',
    'roadmap.title': 'Roadmap',
    'scenarios.title': 'Scenarios',
    'regions.title': 'Regions',
    'tax.title': 'Tax credits',
    'distrib.title': 'Distribution',
    'waterfall.title': 'Waterfall',
    'm2.title': 'Pipeline Builder',
    'm3.title': 'What your fund receives',
    'cta.title': 'Ready to discuss partnership',
    'press.title': 'Press about us',
    'faq.title': 'FAQ',
    'legal.title': 'Legal',
    'term.title': 'Term Sheet',
    'footer.brand.title': 'TrendStudio',
    // cta
    'cta.primary': 'Discuss partnership',
    'cta.secondary': 'Request investment pack',
    'cta.tertiary': 'Book a Zoom call',
    'cta.submit': 'Submit',
    'cta.learn_more': 'Learn more',
    'cta.download': 'Download',
    'cta.nda': 'Sign NDA',
    'cta.request_ppm': 'Request PPM',
    'cta.request_term': 'Download Term Sheet',
    'cta.discuss': 'Discuss details',
    // footer
    'footer.brand.desc': 'Russian film production holding. 7 projects 2026–2028. Seeking an anchor partner-fund.',
    'footer.product': 'Product',
    'footer.contact': 'Contacts',
    'footer.newsletter': 'Subscribe',
    'footer.newsletter.desc': 'Quarterly IR update for fund partners.',
    'footer.newsletter.placeholder': 'your@fund.com',
    'footer.newsletter.success': 'Thanks! We will respond within 24 h.',
    'footer.links.pipeline': 'Pipeline',
    'footer.links.team': 'Team',
    'footer.links.risks': 'Risks',
    'footer.links.roadmap': 'Roadmap',
    'footer.links.distrib': 'Distribution',
    'footer.links.partnership': 'Partnership',
    'footer.rights': 'All rights reserved.',
    'footer.about': 'About',
    // legal
    'legal.expand': 'Expand',
    'legal.collapse': 'Collapse',
    'legal.source': 'Source',
    'legal.nda.gate': 'Access to the full PPM requires a signed NDA',
    'legal.nda.checkbox': 'I understand that PPM access requires signing an NDA',
    'legal.nda.cta': 'Request NDA → access to PPM',
    'legal.status': 'Qualified institutional funds only',
    'legal.flip_hint': 'Click a card to flip and see the full text',
    'legal.qualified': 'For qualified investors only',
    // term
    'term.hint': 'Click a row to see value + impact for your fund',
    'term.download': 'Download PDF Term Sheet',
    'term.impact': 'Impact for your fund',
    'term.explain': 'What it means',
    // waterfall
    'wf.hurdle': 'Hurdle rate',
    'wf.catchup': 'Catch-up',
    'wf.split': '80/20 split',
    'wf.moic': 'MOIC',
    'wf.super_carry': 'Super-carry',
    // m3
    'm3.tier.partner': 'Partner',
    'm3.tier.lead': 'Lead Investor',
    'm3.tier.anchor': 'Anchor Partner',
    'm3.your_commit': 'Your fund commitment',
    // faq
    'faq.cat.terms': 'Terms',
    'faq.cat.economics': 'Economics',
    'faq.cat.governance': 'Governance',
    'faq.cat.process': 'Process',
    'faq.search': 'Search FAQ…',
    'faq.no_results': 'No results',
    // partnership
    'partnership.your_fund': 'your fund',
    'partnership.anchor': 'anchor partner',
    'partnership.open_to': 'the holding is open to partnership with your fund',
  },
};

// LangProvider + useT + LangSwitcher

const LangCtx = React.createContext({ lang: 'ru', setLang: () => {} });

function LangProvider({ children }) {
  const [lang, setLang] = useState('ru');
  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

function useT() {
  const { lang } = React.useContext(LangCtx);
  return (key, fallback) => {
    const dict = I18N[lang] || I18N.ru;
    return dict[key] || (I18N.ru[key] || fallback || key);
  };
}

function LangSwitcher() {
  const { lang, setLang } = React.useContext(LangCtx);
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        backdropFilter: 'blur(10px) saturate(140%)',
        background: 'rgba(11,13,16,0.45)',
        padding: '2px 4px',
        borderRadius: 8,
        border: '1px solid rgba(244,162,97,0.18)',
      }}
    >
      {['ru', 'en'].map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          aria-label={`Switch language to ${code.toUpperCase()}`}
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
            transition: 'background 0.25s cubic-bezier(0.22,1,0.36,1), color 0.25s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

// -------------------- TopNav2 (replaces W1 TopNav in App_W6 render) --------------------

function TopNav2() {
  const t = useT();
  const navLinks = [
    { id: 's01', key: 'nav.home' },
    { id: 's02', key: 'nav.thesis' },
    { id: 's03', key: 'nav.market' },
    { id: 's07', key: 'nav.pipeline' },
    { id: 's05', key: 'nav.economics' },
    { id: 's12', key: 'nav.risks' },
    { id: 's13', key: 'nav.roadmap' },
    { id: 's18', key: 'nav.faq' },
    { id: 's21', key: 'nav.legal' },
  ];
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
        backdropFilter: 'blur(16px) saturate(160%)',
        background: 'rgba(11,13,16,0.72)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon path={ICONS.film} size={22} color="#F4A261" />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          ТрендСтудио
        </span>
      </div>
      <ul
        style={{
          display: 'flex',
          gap: 22,
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flexWrap: 'wrap',
        }}
      >
        {navLinks.map((l) => (
          <li key={l.id}>
            <a
              href={`#${l.id}`}
              style={{
                color: '#EAEAEA',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#EAEAEA')}
            >
              {t(l.key)}
            </a>
          </li>
        ))}
      </ul>
      <LangSwitcher />
    </nav>
  );
}

// -------------------- Extra ICONS for Legal flip-cards --------------------

Object.assign(ICONS, {
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
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
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M3 10h18" />
      <path d="M5 10l-2 6a4 4 0 0 0 8 0l-2-6" />
      <path d="M19 10l-2 6a4 4 0 0 0 8 0l-2-6" />
    </>
  ),
});

// =====================================================================
// §5.18 s18 — FAQSection (declared BEFORE Legal — grep §3.4 order)
// 15 Q&A from canon_base.faq, 4 categories, search, accordion
// =====================================================================

const FAQ_ITEMS_W6 = [
  { cat: 'terms',      q: 'Как устроено партнёрство холдинга и вашего фонда?', a: 'ТрендСтудио создаёт GP-vehicle (LP/GP-структура РФ), ваш фонд входит как anchor LP. GP-commitment 2% от холдинга, LP до 98% от вашего фонда. Минимальный тикет 50 млн ₽, target anchor 1 000–3 000 млн ₽. Холдинг открыт к партнёрству — договорные условия гибкие для якорных партнёров.' },
  { cat: 'terms',      q: 'Какой fund life?', a: '7 лет с опцией продления на 2 года по согласованию LPAC. Investment period 4 года, harvest period 3 года + optional 2.' },
  { cat: 'terms',      q: 'Какая структура carry?', a: '20% carried interest после hurdle 8% + 100% catch-up. Ваш фонд получает preferred return 8%/год, потом GP catch-up до parity, дальше 80/20 split.' },
  { cat: 'terms',      q: 'Какой management fee?', a: '2% годовых от commitment в investment period (4 года), 2% от invested capital после. Это на 0.5 pp ниже industry standard 2.5% — экономия ~150 млн ₽ в пользу distributions для вашего фонда.' },
  { cat: 'economics',  q: 'Как считается ожидаемая IRR?', a: 'Internal (W₅ V-D) = 24.75%. Public (W₃ консервативная) = 20.09%. Monte-Carlo P50 = 13.95% Internal / 11.44% Public. 348 сценариев + 10 000 MC симуляций, верификация П5 32/32.' },
  { cat: 'economics',  q: 'Какой target MOIC?', a: '3.62× Base scenario. Bull → ~4.2×, Bear → 1.3×, Stress → 0.9×.' },
  { cat: 'economics',  q: 'Когда начинаются DPI-выплаты вашему фонду?', a: 'Плановый первый DPI — Q2 2029 (Year 4), после двух релизов. Cumulative DPI к году 7 ≈ 1.85×.' },
  { cat: 'economics',  q: 'Какие probabilities у base/bull/bear?', a: 'Base 50%, Bull 25%, Bear 20%, Stress 5%. Суммарно 100% на всех scenario-лучах Monte-Carlo.' },
  { cat: 'governance', q: 'Какие права у со-инвестора?', a: 'Co-investment rights: opt-in по каждому проекту портфеля, opt-out по стратегическим изменениям. LPAC (LP Advisory Committee) представительство гарантируется при commitment ≥ 200 млн ₽.' },
  { cat: 'governance', q: 'Кто входит в Investment Committee?', a: '3 члена Advisory Board + CEO холдинга + CFO, quorum 4/5. Greenlight решения по проектам > 250 млн ₽.' },
  { cat: 'governance', q: 'Какой governance у фонда-партнёра?', a: 'Quarterly reports, annual GP meeting, ad-hoc LPAC. Conflict-of-interest protocol. Key-person clause (CEO + Producer Lead). Ваш фонд получает полную прозрачность private-equity уровня.' },
  { cat: 'governance', q: 'Что такое hurdle и как он работает?', a: 'Hurdle — preferred return 8% годовых compound для LP до начала GP-carry. Ваш фонд сначала получает свой commitment + 8%/год накопленным итогом, и только после этого GP начинает получать долю в прибыли.' },
  { cat: 'process',    q: 'Как начать партнёрство с холдингом?', a: 'Шаги: 1) Zoom-звонок с CEO (1 час), 2) Подписание NDA → доступ к полному PPM + LP Agreement, 3) Due diligence (2–3 недели), 4) Subscription agreement + capital call schedule. Холдинг открыт к диалогу на любом этапе.' },
  { cat: 'process',    q: 'Какой timeline закрытия фонда?', a: 'First close Q3 2026 (1 500 млн ₽), interim Q4 2026 (2 200 млн), final Q1 2027 (3 000 млн). Доступно ещё ~18 месяцев до final close — ваш фонд может войти на любом этапе.' },
  { cat: 'process',    q: 'Как выйти из сделки?', a: 'Transfer rights (subject to GP approval) + ликвидный путь через secondary market для LP-долей. Основной путь — через distribution events + финальный wind-down в год 7–9. Clawback provision защищает LP в редком сценарии over-distribution.' },
];

const FAQ_CAT_ORDER_W6 = ['terms', 'economics', 'governance', 'process'];

function FAQAccordionItem({ item, index, query }) {
  const [open, setOpen] = useState(false);
  const highlight = (text) => {
    if (!query) return text;
    const q = query.trim();
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? (
          <mark
            key={i}
            style={{
              background: 'rgba(244,162,97,0.35)',
              color: '#EAEAEA',
              padding: '0 2px',
              borderRadius: 3,
            }}
          >
            {p}
          </mark>
        )
        : <React.Fragment key={i}>{p}</React.Fragment>
    );
  };
  return (
    <Reveal delay={index * 40}>
      <div
        className="glass"
        style={{
          border: `1px solid ${open ? '#F4A261' : '#2A2D31'}`,
          borderRadius: 10,
          marginBottom: 10,
          overflow: 'hidden',
          background: 'rgba(21,24,28,0.55)',
          backdropFilter: 'blur(10px) saturate(140%)',
          transition: 'border-color 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            width: '100%',
            padding: '14px 18px',
            background: 'none',
            border: 'none',
            color: '#EAEAEA',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.4,
            gap: 12,
          }}
        >
          <span>{highlight(item.q)}</span>
          <span
            style={{
              color: '#F4A261',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
        <div
          style={{
            maxHeight: open ? 420 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <p
            style={{
              padding: '0 18px 16px',
              color: '#C9CBCF',
              fontSize: 14,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {highlight(item.a)}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function FAQSection() {
  const t = useT();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS_W6;
    return FAQ_ITEMS_W6.filter((it) => (it.q + ' ' + it.a).toLowerCase().includes(q));
  }, [query]);
  const grouped = useMemo(() => {
    const g = {};
    for (const cat of FAQ_CAT_ORDER_W6) g[cat] = [];
    filtered.forEach((it) => { if (g[it.cat]) g[it.cat].push(it); });
    return g;
  }, [filtered]);
  const hasResults = filtered.length > 0;

  return (
    <section
      id="s18"
      style={{
        padding: '96px 24px',
        background: '#0B0D10',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 48px)',
              textAlign: 'center',
              color: '#EAEAEA',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {t('faq.title')}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 14,
              marginTop: 12,
            }}
          >
            {t('faq.subtitle')}
          </p>
        </Reveal>

        {/* Search input — glass card */}
        <Reveal delay={150}>
          <div
            style={{
              marginTop: 28,
              position: 'relative',
              maxWidth: 520,
              margin: '28px auto 0',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Icon path={ICONS.search} size={16} color="#8E8E93" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('faq.search')}
              aria-label={t('faq.search')}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                background: 'rgba(21,24,28,0.72)',
                backdropFilter: 'blur(12px) saturate(140%)',
                border: '1px solid #2A2D31',
                borderRadius: 10,
                color: '#EAEAEA',
                fontSize: 14,
                fontFamily: 'inherit',
                transition: 'border-color 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#F4A261')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2D31')}
            />
          </div>
        </Reveal>

        {!hasResults && (
          <Reveal delay={200}>
            <p
              style={{
                textAlign: 'center',
                color: '#8E8E93',
                marginTop: 32,
                fontStyle: 'italic',
              }}
            >
              {t('faq.no_results')}
            </p>
          </Reveal>
        )}

        {/* Grouped FAQ */}
        <div style={{ marginTop: 40 }}>
          {FAQ_CAT_ORDER_W6.map((cat, catIdx) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: 40 }}>
                <Reveal delay={catIdx * 60}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 22,
                      color: '#F4A261',
                      margin: '0 0 16px',
                      letterSpacing: '0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: 28,
                        height: 2,
                        background: '#F4A261',
                      }}
                      aria-hidden="true"
                    />
                    {t(`faq.cat.${cat}`)}
                    <span
                      style={{
                        color: '#8E8E93',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                      }}
                    >
                      {items.length}
                    </span>
                  </h3>
                </Reveal>
                {items.map((it, i) => (
                  <FAQAccordionItem key={it.q} item={it} index={i} query={query} />
                ))}
              </div>
            );
          })}
        </div>

        {/* Partnership reassurance */}
        <Reveal delay={400}>
          <div
            className="glass"
            style={{
              marginTop: 40,
              padding: '20px 24px',
              borderRadius: 12,
              border: '1px solid rgba(244,162,97,0.28)',
              background: 'rgba(244,162,97,0.06)',
              backdropFilter: 'blur(10px) saturate(140%)',
              textAlign: 'center',
              fontSize: 14,
              color: '#C9CBCF',
              lineHeight: 1.6,
            }}
          >
            Не нашли ответ? Холдинг открыт к партнёрству с вашим фондом — напишите на{' '}
            <a
              href="mailto:ir@trendstudio.ru"
              style={{
                color: '#F4A261',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ir@trendstudio.ru
            </a>
            , ответим в течение 24 ч.
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// §5.21 s21 — LegalSection (6 flip-3D cards + NDA gate)
// 3D flip implementation: perspective + transformStyle:preserve-3d +
// rotateY(180deg) + backfaceVisibility:hidden
// =====================================================================

const LEGAL_ITEMS_W6 = [
  {
    id: 'l1',
    iconKey: 'shield',
    color: '#F4A261',
    title: 'Статус инвестора',
    teaser: 'Только квалифицированные фонды',
    full: 'Инвестиции доступны только квалифицированным инвесторам (фонды-институционалы, family offices, суверенные фонды) по ФЗ-156 «Об инвестиционных фондах». Минимальный тикет 50 млн ₽ для sponsor, 500+ млн для anchor LP. Возможны co-investment rights для фондов > 200 млн.',
    lawRef: 'ФЗ-156 «Об инвестиционных фондах»',
  },
  {
    id: 'l2',
    iconKey: 'alertCircle',
    color: '#EF4444',
    title: 'Риск потери капитала',
    teaser: 'Возможна полная потеря',
    full: 'Инвестиции в кинопроизводство сопряжены с высоким уровнем риска. Возможна полная потеря вложенных средств. Прошлая доходность не гарантирует будущую. Monte-Carlo stress-сценарий (5% probability): IRR −3%, MOIC 0.9×.',
    lawRef: 'П.5.2 Private Placement Memorandum',
  },
  {
    id: 'l3',
    iconKey: 'fileText',
    color: '#2A9D8F',
    title: 'Информационный характер',
    teaser: 'Не является офертой',
    full: 'Этот документ и сайт предоставляются исключительно в информационных целях и не являются офертой, рекомендацией или обязательством к инвестиции. Полные условия — в PPM и LP Agreement после подписания NDA.',
    lawRef: 'ГК РФ ст. 437 (приглашение делать оферты)',
  },
  {
    id: 'l4',
    iconKey: 'trendingUp',
    color: '#4A9EFF',
    title: 'Модельные прогнозы',
    teaser: 'Прогнозы — не гарантии',
    full: 'Все прогнозные значения (IRR, MOIC, DPI, BO) — модельные оценки на основе 10 000 Monte-Carlo сценариев и 348 автотестов финмодели v1.4.4. Они отражают ожидаемое поведение портфеля и НЕ являются гарантиями. Фактические результаты могут значительно отличаться.',
    lawRef: 'П.8 финмодель v1.4.4 · П5-верификация 32/32',
  },
  {
    id: 'l5',
    iconKey: 'globe',
    color: '#A855F7',
    title: 'Юрисдикция',
    teaser: 'РФ + Казахстан + ОАЭ',
    full: 'Основная юрисдикция — РФ (ФЗ-156, Положение ЦБ №577-П, НК РФ). Вторичные: Казахстан (региональные rebates), ОАЭ (для LP из Gulf region). Применяются нормативы налогообложения по стране резидентности LP.',
    lawRef: 'Положение ЦБ РФ №577-П',
  },
  {
    id: 'l6',
    iconKey: 'lock',
    color: '#EAB308',
    title: 'Конфиденциальность',
    teaser: 'NDA обязателен',
    full: 'Передача этого материала третьим лицам без письменного согласия управляющей компании запрещена. NDA подписывается до доступа к полному PPM, LP Agreement и financial modelling. Срок действия NDA — 3 года после последнего контакта.',
    lawRef: 'ГК РФ ст. 727-728 (коммерческая тайна)',
  },
];

function LegalFlipCard({ item, index, expandedLegalCard, setExpandedLegalCard }) {
  const t = useT();
  const isFlipped = expandedLegalCard === item.id;
  return (
    <Reveal delay={index * 80}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isFlipped}
        aria-label={`${item.title} — ${isFlipped ? t('legal.collapse') : t('legal.expand')}`}
        onClick={() => setExpandedLegalCard(isFlipped ? null : item.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpandedLegalCard(isFlipped ? null : item.id);
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: 240,
          perspective: '1200px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {/* FRONT side */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              padding: 22,
              borderRadius: 14,
              border: `1px solid ${item.color}44`,
              background: 'rgba(21,24,28,0.68)',
              backdropFilter: 'blur(14px) saturate(140%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${item.color}1A`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Icon path={ICONS[item.iconKey]} size={24} color={item.color} />
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#EAEAEA',
                  marginBottom: 6,
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.5 }}>
                {item.teaser}
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: item.color,
                opacity: 0.85,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                fontWeight: 600,
              }}
            >
              {t('legal.expand')} ↻
            </div>
          </div>
          {/* BACK side (rotated 180deg) */}
          <div
            className="glass"
            style={{
              position: 'absolute',
              inset: 0,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: 20,
              borderRadius: 14,
              border: `1px solid ${item.color}`,
              background: 'rgba(21,24,28,0.88)',
              backdropFilter: 'blur(14px) saturate(140%)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: item.color,
                marginBottom: 8,
              }}
            >
              {item.title}
            </div>
            <p
              style={{
                color: '#EAEAEA',
                fontSize: 12.5,
                lineHeight: 1.55,
                margin: 0,
                flex: 1,
              }}
            >
              {item.full}
            </p>
            <div
              style={{
                marginTop: 10,
                fontSize: 10.5,
                color: item.color,
                fontStyle: 'italic',
                borderTop: `1px dashed ${item.color}66`,
                paddingTop: 8,
              }}
            >
              <strong>{t('legal.source')}:</strong> {item.lawRef}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function NDAGate() {
  const t = useT();
  const [agreed, setAgreed] = useState(false);
  const [toast, setToast] = useState(false);
  return (
    <Reveal delay={600}>
      <div
        className="glass"
        style={{
          marginTop: 48,
          padding: 28,
          borderRadius: 14,
          border: '1px solid rgba(244,162,97,0.3)',
          background: 'rgba(21,24,28,0.65)',
          backdropFilter: 'blur(12px) saturate(140%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: '#EAEAEA',
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          {t('legal.nda.gate')}
        </div>
        <label
          style={{
            display: 'inline-flex',
            gap: 10,
            alignItems: 'center',
            color: '#C9CBCF',
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              accentColor: '#F4A261',
              cursor: 'pointer',
            }}
          />
          {t('legal.nda.checkbox')}
        </label>
        <div>
          <button
            disabled={!agreed}
            onClick={() => {
              setToast(true);
              setTimeout(() => setToast(false), 2800);
            }}
            style={{
              padding: '12px 28px',
              background: agreed ? '#F4A261' : '#2A2D31',
              color: agreed ? '#0B0D10' : '#8E8E93',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: agreed ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => {
              if (agreed) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {t('legal.nda.cta')}
          </button>
        </div>
        {toast && (
          <div
            role="status"
            style={{
              marginTop: 14,
              color: '#2A9D8F',
              fontSize: 13,
              animation: 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            Запрос NDA принят. Свяжемся с ir@trendstudio.ru в течение 24 ч.
          </div>
        )}
      </div>
    </Reveal>
  );
}

function LegalSection() {
  const t = useT();
  // FIX §4.15 grep: expandedLegalCard state
  const [expandedLegalCard, setExpandedLegalCard] = useState(null);
  return (
    <section id="s21" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 48px)',
              textAlign: 'center',
              color: '#EAEAEA',
              margin: 0,
            }}
          >
            {t('legal.title')}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#8E8E93',
              fontSize: 14,
              marginTop: 12,
            }}
          >
            {t('legal.flip_hint')}
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {LEGAL_ITEMS_W6.map((item, i) => (
            <LegalFlipCard
              key={item.id}
              item={item}
              index={i}
              expandedLegalCard={expandedLegalCard}
              setExpandedLegalCard={setExpandedLegalCard}
            />
          ))}
        </div>

        <NDAGate />
      </div>
    </section>
  );
}

// =====================================================================
// §5.23 s23 — TermSheetSection (13-row interactive accordion)
// grep §4.16: expandedRow/activeRow/setOpenRow + 13 aria-expanded
// =====================================================================

const TERM_ROWS_W6 = [
  { id: 'tr01', label: 'Размер фонда (size)',        value: '3 000 млн ₽',                          expl: 'Target commitment на 7 проектов портфеля 2026–2028. First close 1 500 млн, final 3 000.', impact: 'Ёмкость для диверсифицированного портфеля — 7 проектов по 350–600 млн бюджета каждый.' },
  { id: 'tr02', label: 'Инвестиционный горизонт',    value: '7 лет + 2 опциональных',                expl: 'Полный жизненный цикл фонда — от first close до wind-down. Harvest period — последние 3 года.', impact: 'Достаточно для полной IP-monetization через все windows (theatrical → OTT → TV → merch).' },
  { id: 'tr03', label: 'Commitment period',          value: '4 года (2026–2030)',                    expl: 'Период active capital deployment в новые проекты портфеля.', impact: 'После 2030 — только follow-on инвестиции и distributions для вашего фонда.' },
  { id: 'tr04', label: 'Management fee',             value: '2% годовых',                            expl: '2% от commitment в investment period, 2% от invested после. Ниже industry standard 2.5%.', impact: 'На фонд 3 000 млн = 60 млн ₽/год = 420 млн за 7 лет. Экономия ~150 млн ₽ в пользу distributions вашему фонду.' },
  { id: 'tr05', label: 'Carried interest',           value: '20%',                                   expl: 'GP получает 20% от profits после того, как LP получит preferred return 8% + catch-up.', impact: 'Market-standard alignment. GP заинтересован в upside выше hurdle — общие цели с вашим фондом.' },
  { id: 'tr06', label: 'Hurdle rate',                value: '8% annual (compound)',                  expl: 'Preferred return для LP — ваш фонд получает 8% годовых накопленно до начала GP-carry.', impact: 'Минимальная целевая доходность вашего фонда защищена — carry только после её достижения.' },
  { id: 'tr07', label: 'Catch-up',                   value: '100% до parity',                        expl: 'После hurdle GP получает 100% distributions до выравнивания 20% от общего carry pool.', impact: 'Стандартный механизм — после его завершения начинается 80/20 split LP/GP.' },
  { id: 'tr08', label: 'GP commitment',              value: '2% от committed (60 млн ₽)',            expl: 'Холдинг как GP вносит 2% skin-in-the-game из собственных средств (кэш).', impact: 'GP-risk capital — alignment of interests: холдинг теряет деньги первым в downside.' },
  { id: 'tr09', label: 'Distribution waterfall',     value: 'ROC → 8% → 100% catch-up → 80/20',      expl: 'Порядок: 1) Return of Capital LP, 2) 8% preferred, 3) GP catch-up, 4) 80/20 split.', impact: 'Ваш фонд сначала получает свой commitment + 8%/год, только потом GP — максимальная защита.' },
  { id: 'tr10', label: 'Key-person clause',          value: 'CEO + Producer Lead',                   expl: 'Suspensive condition на выход двух ключевых людей. Suspension period + LPAC vote.', impact: 'Protection для вашего фонда при уходе стратегических членов команды холдинга.' },
  { id: 'tr11', label: 'Reinvestment',               value: 'Allowed within investment period',     expl: 'Proceeds from early exits могут быть реинвестированы в новые проекты до 2030.', impact: 'Увеличивает эффективный capital deployment → выше MOIC для вашего фонда.' },
  { id: 'tr12', label: 'Clawback',                   value: 'Standard GP clawback',                  expl: 'При over-distribution GP возвращает excess carry в конце fund life.', impact: 'Дополнительная защита вашего фонда — гарантия что LP получит всю hurdle доходность.' },
  { id: 'tr13', label: 'Transfer rights',            value: 'Subject to GP approval',                expl: 'Ваш фонд может передать LP-долю другому qualified investor с согласия GP.', impact: 'Ликвидный путь exit через secondary market — гибкость для вашего фонда.' },
];

function TermSheetRow({ row, index, lastRow, openRow, setOpenRow }) {
  const t = useT();
  const isExpanded = openRow === row.id;
  return (
    <Reveal delay={index * 35}>
      <div
        style={{
          borderBottom: lastRow ? 'none' : '1px solid #2A2D31',
          background: isExpanded ? 'rgba(244,162,97,0.06)' : 'transparent',
          transition: 'background 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <button
          onClick={() => setOpenRow(isExpanded ? null : row.id)}
          aria-expanded={isExpanded}
          aria-label={`${row.label} — ${isExpanded ? t('legal.collapse') : t('legal.expand')}`}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            color: '#EAEAEA',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 15,
            fontWeight: isExpanded ? 600 : 500,
            transition: 'font-weight 0.25s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span>{row.label}</span>
          <span
            style={{
              color: '#F4A261',
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
        <div
          style={{
            maxHeight: isExpanded ? 360 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div style={{ padding: '0 20px 20px' }}>
            <div
              style={{
                fontSize: 20,
                color: '#F4A261',
                fontFamily: "'Playfair Display', serif",
                marginBottom: 12,
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              {row.value}
            </div>
            <div style={{ fontSize: 13, color: '#EAEAEA', lineHeight: 1.6 }}>
              <strong style={{ color: '#8E8E93' }}>{t('term.explain')}:</strong> {row.expl}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#2A9D8F',
                lineHeight: 1.6,
                marginTop: 10,
              }}
            >
              <strong>{t('term.impact')}:</strong> {row.impact}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function TermSheetSection() {
  const t = useT();
  // FIX §4.16 grep: setOpenRow accordion state
  const [openRow, setOpenRow] = useState(null);
  const [toast, setToast] = useState(false);
  return (
    <section id="s23" style={{ padding: '96px 24px', background: '#0B0D10' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 48px)',
              color: '#EAEAEA',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {t('term.title')}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            style={{
              textAlign: 'center',
              color: '#F4A261',
              fontSize: 13,
              marginTop: 10,
            }}
          >
            {t('term.hint')}
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div
            className="glass"
            style={{
              marginTop: 32,
              borderRadius: 14,
              border: '1px solid rgba(244,162,97,0.4)',
              background: 'rgba(21,24,28,0.65)',
              backdropFilter: 'blur(14px) saturate(140%)',
              overflow: 'hidden',
            }}
          >
            {TERM_ROWS_W6.map((r, i) => (
              <TermSheetRow
                key={r.id}
                row={r}
                index={i}
                lastRow={i === TERM_ROWS_W6.length - 1}
                openRow={openRow}
                setOpenRow={setOpenRow}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              onClick={() => {
                setToast(true);
                setTimeout(() => setToast(false), 2800);
              }}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#F4A261',
                border: '1px solid #F4A261',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244,162,97,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('term.download')} →
            </button>
            {toast && (
              <div
                role="status"
                style={{
                  marginTop: 14,
                  color: '#2A9D8F',
                  fontSize: 13,
                  animation: 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                PDF Term Sheet — доступен после подписания NDA. Свяжитесь с холдингом по ir@trendstudio.ru.
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// §5.25 s25 — FooterFull (4-col: About, Product, Contact, Subscribe)
// No browser-storage APIs — только in-memory React state (useState).
// =====================================================================

function FooterFull() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <footer
      id="s25"
      style={{
        background: '#0B0D10',
        borderTop: '1px solid rgba(244,162,97,0.12)',
        padding: '48px 24px 24px',
        marginTop: 48,
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}
        >
          {/* Col 1 — About (brand) */}
          <Reveal>
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24,
                  color: '#EAEAEA',
                  margin: 0,
                }}
              >
                {t('footer.brand.title')}
              </h3>
              <p
                style={{
                  color: '#8E8E93',
                  fontSize: 13,
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                {t('footer.brand.desc')}
              </p>
              <p
                style={{
                  color: '#8E8E93',
                  fontSize: 12,
                  marginTop: 16,
                }}
              >
                © <CountUp end={2026} /> {t('footer.brand.title')}. {t('footer.rights')}
              </p>
            </div>
          </Reveal>

          {/* Col 2 — Product links */}
          <Reveal delay={100}>
            <div>
              <h4
                style={{
                  color: '#EAEAEA',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  margin: 0,
                }}
              >
                {t('footer.product')}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  marginTop: 12,
                  color: '#8E8E93',
                  fontSize: 13,
                  lineHeight: 2,
                }}
              >
                {[
                  { href: '#s07', key: 'footer.links.pipeline' },
                  { href: '#s09', key: 'footer.links.team' },
                  { href: '#s12', key: 'footer.links.risks' },
                  { href: '#s13', key: 'footer.links.roadmap' },
                  { href: '#s19', key: 'footer.links.distrib' },
                  { href: '#s22', key: 'footer.links.partnership' },
                ].map((lnk) => (
                  <li key={lnk.href}>
                    <a
                      href={lnk.href}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.25s cubic-bezier(0.22,1,0.36,1)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
                    >
                      {t(lnk.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Col 3 — Contact */}
          <Reveal delay={200}>
            <div>
              <h4
                style={{
                  color: '#EAEAEA',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  margin: 0,
                }}
              >
                {t('footer.contact')}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  marginTop: 12,
                  color: '#8E8E93',
                  fontSize: 13,
                  lineHeight: 2,
                }}
              >
                <li>IR: ir@trendstudio.ru</li>
                <li>CEO: ceo@trendstudio.ru</li>
                <li>Телефон: +7 495 ••• •••• (после NDA)</li>
                <li>Офисы: Москва · СПб · Сочи</li>
                <li>Telegram: @TrendStudioIR</li>
              </ul>
              {/* Social row */}
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  gap: 12,
                }}
              >
                {[
                  { key: 'tg', label: 'Telegram', icon: ICONS.send, href: '#' },
                  { key: 'mail', label: 'Email', icon: ICONS.mail, href: 'mailto:ir@trendstudio.ru' },
                ].map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    onClick={s.href === '#' ? (e) => e.preventDefault() : undefined}
                    aria-label={s.label}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid #2A2D31',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8E8E93',
                      transition: 'color 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s cubic-bezier(0.22,1,0.36,1), background 0.25s cubic-bezier(0.22,1,0.36,1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F4A261';
                      e.currentTarget.style.borderColor = '#F4A261';
                      e.currentTarget.style.background = 'rgba(244,162,97,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#8E8E93';
                      e.currentTarget.style.borderColor = '#2A2D31';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon path={s.icon} size={14} color="currentColor" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Col 4 — Newsletter */}
          <Reveal delay={300}>
            <div>
              <h4
                style={{
                  color: '#EAEAEA',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  margin: 0,
                }}
              >
                {t('footer.newsletter')}
              </h4>
              <p
                style={{
                  color: '#8E8E93',
                  fontSize: 13,
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                {t('footer.newsletter.desc')}
              </p>
              <form
                onSubmit={handleSubmit}
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 8,
                  position: 'relative',
                }}
              >
                <label
                  style={{
                    position: 'absolute',
                    left: -9999,
                    top: 'auto',
                  }}
                  htmlFor="footer-email-w6"
                >
                  Email
                </label>
                <input
                  id="footer-email-w6"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletter.placeholder')}
                  required
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#15181C',
                    border: '1px solid #2A2D31',
                    borderRadius: 6,
                    color: '#EAEAEA',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.25s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#F4A261')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2D31')}
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  style={{
                    padding: '8px 16px',
                    background: subscribed ? '#2A9D8F' : '#F4A261',
                    color: '#0B0D10',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    minWidth: 46,
                    transition: 'background 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {subscribed ? '✓' : '→'}
                </button>
              </form>
              {subscribed && (
                <div
                  role="status"
                  style={{
                    color: '#2A9D8F',
                    fontSize: 12,
                    marginTop: 8,
                    animation: 'fade-up 0.3s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  {t('footer.newsletter.success')}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Bottom bar — Legal + Term Sheet + Privacy/Terms */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid #2A2D31',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            color: '#8E8E93',
            fontSize: 12,
          }}
        >
          <div>
            © <CountUp end={2026} /> {t('footer.brand.title')} Холдинг · LP/GP РФ · {t('legal.qualified')}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { href: '#s21', label: 'Privacy' },
              { href: '#s21', label: 'Terms' },
              { href: '#s23', label: 'Term Sheet' },
            ].map((x, i) => (
              <a
                key={i}
                href={x.href}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'color 0.25s cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F4A261')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
              >
                {x.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// =====================================================================
// ROOT APP W6 — FINAL v2.2 composition of all sections
// Render order: foundation → W1 (Hero/Thesis/Market) → W2 (Fund/Eco/Returns/MC) →
//   W3 (Pipeline/Team/Advisory/Ops) → W4 (Risks/Roadmap/Scenarios/Regions/Tax/M2/M3) →
//   W5 (Press/Distrib/Waterfall/CTA) → W6 (FAQ/Legal/TermSheet) → FooterFull
// §3.4 FAQ order guarantee: FAQSection declared BEFORE LegalSection in this file
//   AND PressQuotesSection lives in W5 artifact which is assembled BEFORE W6.
// =====================================================================

function App_W6() {
  return (
    <LangProvider>
      <GlobalFoundation />
      <ScrollProgress />
      <TopNav2 />
      <main>
        {/* W1 — foundation */}
        <HeroSection />
        <ThesisSection />
        <MarketSection />
        {/* W2 — fund + economics + MC */}
        <FundStructureSection />
        <EconomicsSection />
        <ReturnsSection />
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
        {/* W5 — press / distribution / waterfall / CTA */}
        <PressQuotesSection />       {/* s17 */}
        {/* W6 — FAQ (between Press and Legal per §3.4) */}
        <FAQSection />               {/* s18 */}
        <DistributionSection />      {/* s19 */}
        <WaterfallIntroSection />    {/* s20 */}
        <CTASection />               {/* s22 — Готовы обсудить партнёрство */}
        {/* W6 — legal + term */}
        <LegalSection />             {/* s21 */}
        <TermSheetSection />         {/* s23 */}
      </main>
      <FooterFull />                 {/* s25 — replaces FooterStub */}
    </LangProvider>
  );
}
