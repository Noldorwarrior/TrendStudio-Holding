# TrendStudio Brand Guidelines v1.2.0

## 1. Brand Voice

- **Tone:** Professional, confident, data-driven. Institutional LP audience.
- **Register:** Formal-professional. No colloquialisms, slang, or overly casual phrasing.
- **Language:** Russian primary, English financial terms acceptable (IRR, MOIC, WACC, EBITDA, NDP, LP, GP).
- **Numbers:** Always formatted with spaces as thousands separators (3 000, not 3,000). Currency: "млн ₽".

### Prohibited words/phrases:
- "гарантированный доход" / "guaranteed return"
- "безрисковый" / "risk-free" (when applied to the fund)
- "обещаем" / "we promise"
- "100% вероятность"
- "лучший фонд" / "best fund"
- Any superlatives without data backing (e.g., "крупнейший" without source)

### Required disclosures:
- MC Mean IRR must always be accompanied by "stress-метрика" qualifier
- Det IRR must be labeled as "главная метрика (single best-estimate)"
- Forward-looking statements require disclaimer

## 2. Visual Brand

### Colors (CSS custom properties):
- Primary background: `--bg-primary: #0A0E1A`
- Secondary background: `--bg-secondary: #141A2A`
- Gold accent: `--gold: #C9A961`
- Text primary: `--text-primary: #F5F5F5`
- Text secondary: `--text-secondary: #9CA3AF`

### Typography:
- Headers: Georgia, serif (--font-display)
- Body: Inter, sans-serif (--font-body)
- Data/numbers: JetBrains Mono, monospace (--font-mono)
- Minimum body text: 14px
- Minimum chart labels: 12px

### Layout:
- 16:9 aspect ratio (1920×1080 reference)
- Padding: 80px top/bottom, 120px left/right
- Dark cinematic aesthetic
- Gold accents for key metrics and highlights

### Charts:
- Chart.js 4.4 for standard charts
- D3.js v7 for waterfall/sankey
- All canvases must be wrapped in accessible `<figure>` elements
- Chart palette: --chart-1 through --chart-8

## 3. Compliance

- No `eval()` or `new Function()` in JavaScript
- No `.innerHTML =` with user-provided input
- CSP-compatible (inline scripts via build pipeline)
- All financial data sourced from SSOT (deck_data_v1.2.0.json)
- No hardcoded numbers — all from data layer
