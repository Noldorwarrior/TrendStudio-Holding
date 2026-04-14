"""
build_presentation.py
B2 — Премиальная презентация результатов финмодели v1.4.3.
Формирует pptx (PptxBuilder, palette 'tbank') и интерактивный HTML 16:9
на основе артефактов stress_matrix/*.json.

Этап 6 L4+N3 pipeline для ТрендСтудио. Якорь-инвариант:
cumulative_ebitda_2026_2028 ∈ [2970; 3030] млн ₽.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PIPELINE = HERE.parent
STRESS = PIPELINE / "artifacts" / "stress_matrix"
ARTIFACTS = PIPELINE / "artifacts"

# ---------- rakhman_docs import (R-025: no hardcoded paths) ----------
import os as _os

_RAKHMAN_DIR = _os.environ.get("TRENDSTUDIO_RAKHMAN_DIR", "")
for _p in filter(None, [_RAKHMAN_DIR, str(Path.home() / "Downloads")]):
    _pp = Path(_p)
    if _pp.exists() and (_pp / "rakhman_docs.py").exists():
        sys.path.insert(0, str(_pp))
        break
from rakhman_docs import PptxBuilder  # noqa: E402

ANCHOR_BASE = 3000.0
ANCHOR_LOWER = 2970.0
ANCHOR_UPPER = 3030.0


# ---------- helpers ----------
def fmt(v: float, d: int = 0) -> str:
    if d == 0:
        return f"{int(round(v)):,}".replace(",", " ")
    formatted = f"{v:,.{d}f}".replace(",", "~").replace(".", ",").replace("~", " ")
    return formatted


def pct(v: float, d: int = 2) -> str:
    return f"{v * 100:.{d}f}%".replace(".", ",")


def load_artifacts() -> dict:
    files = {
        "mc": "monte_carlo.json",
        "boot": "market_bootstrap.json",
        "gate": "stage_gate.json",
        "lhs": "lhs_copula.json",
        "m27": "matrix_27.json",
    }
    return {k: json.loads((STRESS / f).read_text(encoding="utf-8")) for k, f in files.items()}


# ==========================================================================
# PPTX
# ==========================================================================
def build_pptx(data: dict, out_path: Path) -> None:
    mc = data["mc"]
    boot = data["boot"]
    gate = data["gate"]
    lhs = data["lhs"]

    p = PptxBuilder("Финмодель ТрендСтудио 2026–2028 (v1.4.3)", palette="tbank")

    # 1. Title
    p.title_slide(
        "Финансовая модель ТрендСтудио",
        "Сценарные результаты 2026–2028 | v1.4.3",
    )

    # 2. Section: Результаты
    p.section_slide("Результаты и методология", number=1)

    # 3. Executive summary — ключевые метрики
    p.stat_slide(
        "Ключевые показатели",
        [
            (f"{fmt(ANCHOR_BASE)} млн ₽", "Базовый EBITDA 2026–2028"),
            (f"{fmt(lhs['mean_ebitda'])} млн ₽", "LHS+Copula mean"),
            (pct(lhs["breach_probability"]), "P(нарушения якоря)"),
            (f"{fmt(lhs['var_95_mln_rub'])} млн ₽", "VaR95"),
        ],
    )

    # 4. Методология
    p.content_slide(
        "Методология (4 MC-движка)",
        [
            "Naive MC Cholesky — базовая эталонная симуляция (n=2000)",
            "Block Bootstrap — непараметрическая оценка рыночных факторов",
            "Stage-Gate binomial tree — 12 фильмов, P(reach)=72,1%",
            "LHS + Gaussian Copula — reference engine, variance reduction",
            "Якорь-инвариант: cumulative EBITDA 2026–2028 ∈ [2970; 3030] млн ₽",
        ],
    )

    # 5. Сравнение движков
    p.content_slide(
        "Сравнение MC-движков",
        [
            f"Naive MC:       mean {fmt(mc['mean_ebitda'])}  |  std {fmt(mc['std_ebitda'])}  |  breach {pct(mc['breach_probability'])}",
            f"LHS+Copula:     mean {fmt(lhs['mean_ebitda'])}  |  std {fmt(lhs['std_ebitda'])}  |  breach {pct(lhs['breach_probability'])}",
            f"Block Bootstrap: mean {fmt(boot['mean_ebitda'])}  |  std {fmt(boot['std_ebitda'])}",
            f"Stage-Gate:      mean {fmt(gate['mean_ebitda'])}  |  std {fmt(gate['std_ebitda'])}",
            "LHS+Copula выбран как эталон (наименьшая дисперсия оценок)",
        ],
    )

    # 6. Tornado
    p.content_slide(
        "Tornado — основные драйверы риска",
        [
            "FX (0 → 20%): диапазон EBITDA ≈ 247 млн ₽",
            "Inflation (0 → 20%): диапазон EBITDA ≈ 240 млн ₽",
            "Delay (0 → 20%): диапазон EBITDA ≈ 180 млн ₽",
            "Combo (FX+Infl+Delay): диапазон EBITDA ≈ 634 млн ₽",
            "Самый широкий — комбинированный сценарий → приоритет митигации",
        ],
    )

    # 7. Stage-Gate воронка
    p.stat_slide(
        "Stage-Gate воронка (12 фильмов)",
        [
            ("85%", "Development → Greenlight"),
            ("92%", "Greenlight → Production"),
            ("95%", "Production → Post"),
            ("72,1%", "Cumulative P(release)"),
        ],
    )

    # 8. VaR и breach
    p.comparison_slide(
        "VaR и вероятность нарушения",
        "Naive MC",
        [
            f"VaR95: {fmt(mc['var_95_mln_rub'])} млн ₽",
            f"Breach: {pct(mc['breach_probability'])}",
            f"Severe: {pct(mc.get('severe_breach_probability', 0))}",
        ],
        "LHS+Copula",
        [
            f"VaR95: {fmt(lhs['var_95_mln_rub'])} млн ₽",
            f"VaR99: {fmt(lhs['var_99_mln_rub'])} млн ₽",
            f"Breach: {pct(lhs['breach_probability'])}",
        ],
    )

    # 9. Риски
    p.content_slide(
        "Ключевые риски",
        [
            "Валютный риск — 35% OPEX валютно-чувствительные",
            "Инфляция выше ориентира ЦБ РФ (6%) — давление на OPEX",
            "Производственные задержки — сдвиг релизов, sunk cost до 830 млн ₽ (p95)",
            "Зависимость от FP+K — концентрация доходов",
            "Регуляторные изменения (СНГ + ЕАЭС рынки)",
        ],
    )

    # 10. Митигация
    p.content_slide(
        "Митигация и рекомендации",
        [
            "FX-хеджирование через форварды/NDF на 50% валютной экспозиции",
            "Stage-gate дисциплина: обязательная зелёная светофорная проверка",
            "Резервный фонд 5% от бюджета проекта (≈250 млн ₽)",
            "Диверсификация портфеля: минимум 8 релизов в окне",
            "Квартальная ре-калибровка якоря по факту исполнения",
        ],
    )

    # 11. Roadmap
    p.content_slide(
        "Road-map 2026–2028",
        [
            "Q1 2026 — утверждение базового сценария и якоря Советом директоров",
            "Q2 2026 — внедрение FX-хеджирования и stage-gate регламента",
            "Q4 2026 — первая ре-калибровка модели по факту H1",
            "2027 — расширение портфеля до 14 проектов",
            "2028 — ревью cumulative EBITDA и сверка с целью 3 000 млн ₽",
        ],
    )

    # 12. End
    p.end_slide("Спасибо за внимание", "ТрендСтудио | v1.4.3 | 2026-04-11")

    p.save(str(out_path))


# ==========================================================================
# Премиальный HTML (16:9, Reveal-like, клавиатура + прогресс + анимации)
# ==========================================================================
HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Финмодель ТрендСтудио — v1.4.3</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.27.0/plotly.min.js"></script>
<style>
:root {{
  --bg: #0a1929;
  --bg-grad: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);
  --accent: #FFDD2D;
  --accent2: #4C9AFF;
  --text: #E6F1FF;
  --muted: #8892B0;
  --card: rgba(255,255,255,0.05);
  --border: rgba(255,221,45,0.25);
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
}}
.progress {{
  position: fixed; top: 0; left: 0; height: 4px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 100%);
  z-index: 1000; transition: width 0.4s ease;
}}
.nav-hint {{
  position: fixed; bottom: 16px; right: 24px;
  font-size: 12px; color: var(--muted); z-index: 999;
}}
.slide-counter {{
  position: fixed; bottom: 16px; left: 24px;
  font-size: 12px; color: var(--muted); z-index: 999;
}}
.slide {{
  position: absolute;
  width: 100vw; height: 100vh;
  padding: 60px 80px;
  display: flex; flex-direction: column;
  background: var(--bg-grad);
  opacity: 0; pointer-events: none;
  transform: translateX(40px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}}
.slide.active {{ opacity: 1; pointer-events: auto; transform: translateX(0); }}
.slide h1 {{
  font-size: 44px; font-weight: 700; color: var(--accent);
  margin-bottom: 24px; letter-spacing: -0.5px;
}}
.slide h2 {{
  font-size: 28px; font-weight: 600; color: var(--text);
  margin-bottom: 16px;
}}
.slide p, .slide li {{
  font-size: 20px; line-height: 1.6; color: var(--text);
}}
.slide ul {{ padding-left: 28px; margin-top: 16px; }}
.slide ul li {{ margin-bottom: 12px; }}
.title-slide {{
  align-items: center; justify-content: center; text-align: center;
}}
.title-slide h1 {{ font-size: 72px; margin-bottom: 20px; }}
.title-slide .sub {{ font-size: 28px; color: var(--muted); }}
.kpi-grid {{
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  margin-top: 40px;
}}
.kpi-card {{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 32px;
  text-align: center;
  transition: transform 0.3s ease, border-color 0.3s ease;
}}
.kpi-card:hover {{
  transform: translateY(-4px);
  border-color: var(--accent);
}}
.kpi-value {{
  font-size: 42px; font-weight: 700; color: var(--accent);
  margin-bottom: 8px; letter-spacing: -1px;
}}
.kpi-label {{ font-size: 14px; color: var(--muted); text-transform: uppercase; }}
.chart-container {{
  flex: 1; margin-top: 20px; min-height: 400px;
}}
.two-col {{
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px;
  flex: 1;
}}
.col-card {{
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px;
}}
.col-card h3 {{ color: var(--accent2); margin-bottom: 16px; font-size: 22px; }}
.table {{
  width: 100%; border-collapse: collapse; margin-top: 16px;
}}
.table th, .table td {{
  padding: 12px 16px; text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 16px;
}}
.table th {{ color: var(--accent); font-weight: 600; }}
.roadmap {{
  display: flex; gap: 16px; margin-top: 32px; flex: 1; align-items: stretch;
}}
.roadmap-item {{
  flex: 1; background: var(--card); border-left: 4px solid var(--accent);
  padding: 20px; border-radius: 8px;
}}
.roadmap-item .date {{ color: var(--accent); font-size: 14px; font-weight: 600; }}
.roadmap-item .text {{ color: var(--text); font-size: 16px; margin-top: 8px; }}
.badge {{
  display: inline-block; background: var(--accent); color: #0a1929;
  padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;
  margin-left: 12px; vertical-align: middle;
}}
</style>
</head>
<body>

<div class="progress" id="progress"></div>
<div class="slide-counter" id="counter">1 / 12</div>
<div class="nav-hint">← → клавиши | свайп | пробел</div>

<!-- SLIDE 1: Title -->
<div class="slide title-slide active" data-slide="1">
  <h1>Финмодель ТрендСтудио</h1>
  <div class="sub">Сценарные результаты 2026–2028<br><span class="badge">v1.4.3</span></div>
</div>

<!-- SLIDE 2: KPI -->
<div class="slide" data-slide="2">
  <h1>Ключевые показатели</h1>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">{anchor_base_str} ₽</div>
      <div class="kpi-label">Базовый EBITDA 2026–28</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{lhs_mean_str}</div>
      <div class="kpi-label">LHS+Copula mean, млн ₽</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{lhs_breach_pct}</div>
      <div class="kpi-label">P(нарушения якоря)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{lhs_var95_str}</div>
      <div class="kpi-label">VaR95, млн ₽</div>
    </div>
  </div>
  <p style="margin-top:40px; color:var(--muted); text-align:center;">
    Якорь-инвариант: cumulative EBITDA ∈ [2970; 3030] млн ₽
  </p>
</div>

<!-- SLIDE 3: Anchor gauge chart -->
<div class="slide" data-slide="3">
  <h1>Якорь EBITDA 2026–2028</h1>
  <div class="chart-container" id="chart-anchor"></div>
</div>

<!-- SLIDE 4: MC comparison chart -->
<div class="slide" data-slide="4">
  <h1>Сравнение 4 MC-движков</h1>
  <div class="chart-container" id="chart-mc"></div>
</div>

<!-- SLIDE 5: Tornado -->
<div class="slide" data-slide="5">
  <h1>Tornado — драйверы риска</h1>
  <div class="chart-container" id="chart-tornado"></div>
</div>

<!-- SLIDE 6: Stage-Gate Funnel -->
<div class="slide" data-slide="6">
  <h1>Stage-Gate воронка (12 фильмов)</h1>
  <div class="chart-container" id="chart-funnel"></div>
</div>

<!-- SLIDE 7: VaR -->
<div class="slide" data-slide="7">
  <h1>VaR и вероятность нарушения</h1>
  <div class="two-col">
    <div class="col-card">
      <h3>Naive MC Cholesky</h3>
      <table class="table">
        <tr><td>Mean EBITDA</td><td>{mc_mean_str} млн ₽</td></tr>
        <tr><td>Std</td><td>{mc_std_str} млн ₽</td></tr>
        <tr><td>VaR95</td><td>{mc_var95_str} млн ₽</td></tr>
        <tr><td>Breach prob.</td><td>{mc_breach_pct}</td></tr>
      </table>
    </div>
    <div class="col-card">
      <h3>LHS + Gaussian Copula</h3>
      <table class="table">
        <tr><td>Mean EBITDA</td><td>{lhs_mean_str} млн ₽</td></tr>
        <tr><td>Std</td><td>{lhs_std_str} млн ₽</td></tr>
        <tr><td>VaR95</td><td>{lhs_var95_str} млн ₽</td></tr>
        <tr><td>VaR99</td><td>{lhs_var99_str} млн ₽</td></tr>
        <tr><td>Breach prob.</td><td>{lhs_breach_pct}</td></tr>
      </table>
    </div>
  </div>
</div>

<!-- SLIDE 8: Risks -->
<div class="slide" data-slide="8">
  <h1>Ключевые риски</h1>
  <ul>
    <li><strong>Валютный:</strong> 35% OPEX валютно-чувствительные</li>
    <li><strong>Инфляция:</strong> выше ориентира ЦБ РФ (6%)</li>
    <li><strong>Производство:</strong> задержки, sunk cost до 830 млн ₽ (p95)</li>
    <li><strong>Концентрация:</strong> зависимость от ключевых партнёров (FP+K)</li>
    <li><strong>Регуляторный:</strong> СНГ + ЕАЭС рынки</li>
  </ul>
</div>

<!-- SLIDE 9: Mitigation -->
<div class="slide" data-slide="9">
  <h1>Митигация</h1>
  <ul>
    <li>FX-хеджирование (форварды/NDF) на 50% валютной экспозиции</li>
    <li>Stage-gate дисциплина с обязательной зелёной светофорной проверкой</li>
    <li>Резервный фонд 5% от бюджета проекта (≈ 250 млн ₽)</li>
    <li>Диверсификация: минимум 8 релизов в окне 2026–2028</li>
    <li>Квартальная ре-калибровка якоря по факту исполнения</li>
  </ul>
</div>

<!-- SLIDE 10: Roadmap -->
<div class="slide" data-slide="10">
  <h1>Road-map 2026–2028</h1>
  <div class="roadmap">
    <div class="roadmap-item"><div class="date">Q1 2026</div><div class="text">Утверждение якоря Советом директоров</div></div>
    <div class="roadmap-item"><div class="date">Q2 2026</div><div class="text">FX-хеджирование + stage-gate регламент</div></div>
    <div class="roadmap-item"><div class="date">Q4 2026</div><div class="text">Первая ре-калибровка модели (факт H1)</div></div>
    <div class="roadmap-item"><div class="date">2027</div><div class="text">Расширение портфеля до 14 проектов</div></div>
    <div class="roadmap-item"><div class="date">2028</div><div class="text">Ревью cumulative EBITDA vs цель 3 000 млн ₽</div></div>
  </div>
</div>

<!-- SLIDE 11: Methodology -->
<div class="slide" data-slide="11">
  <h1>Методология</h1>
  <ul>
    <li><strong>Naive MC Cholesky</strong> — базовая эталонная симуляция (n=2000)</li>
    <li><strong>Block Bootstrap</strong> — непараметрическая оценка рынка</li>
    <li><strong>Stage-Gate binomial tree</strong> — 12 фильмов, P(reach)=72,1%</li>
    <li><strong>LHS + Gaussian Copula</strong> — reference engine, variance reduction</li>
    <li>Якорь: cumulative EBITDA 2026–2028 ∈ [2970; 3030] млн ₽ (±1%)</li>
  </ul>
</div>

<!-- SLIDE 12: End -->
<div class="slide title-slide" data-slide="12">
  <h1>Спасибо за внимание</h1>
  <div class="sub">ТрендСтудио | v1.4.3<br><span style="font-size:18px">2026-04-11</span></div>
</div>

<script>
const slides = document.querySelectorAll('.slide');
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
const total = slides.length;
let current = 0;

function show(idx) {{
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  progress.style.width = ((idx + 1) / total * 100) + '%';
  counter.textContent = (idx + 1) + ' / ' + total;
  current = idx;
}}

document.addEventListener('keydown', (e) => {{
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') show(Math.min(current + 1, total - 1));
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(Math.max(current - 1, 0));
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(total - 1);
}});

let touchX = 0;
document.addEventListener('touchstart', (e) => {{ touchX = e.touches[0].clientX; }});
document.addEventListener('touchend', (e) => {{
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(dx < 0 ? Math.min(current + 1, total - 1) : Math.max(current - 1, 0));
}});

// ------ Plotly charts ------
const PLOT_BG = 'rgba(0,0,0,0)';
const PLOT_FONT = {{ color: '#E6F1FF', family: 'Inter, sans-serif' }};
const YELLOW = '#FFDD2D', BLUE = '#4C9AFF', GREEN = '#2E8540', RED = '#C62828', ORANGE = '#F58518';

// 1. Anchor gauge
Plotly.newPlot('chart-anchor', [{{
  type: 'indicator',
  mode: 'gauge+number+delta',
  value: {lhs_mean_raw},
  number: {{ suffix: ' млн ₽', font: {{ size: 44, color: YELLOW }} }},
  delta: {{ reference: {anchor_base_raw}, relative: false, valueformat: '.0f' }},
  gauge: {{
    axis: {{ range: [2500, 3500], tickcolor: '#8892B0' }},
    bar: {{ color: YELLOW, thickness: 0.25 }},
    bgcolor: 'rgba(255,255,255,0.05)',
    borderwidth: 2, bordercolor: '#4C9AFF',
    steps: [
      {{ range: [2500, 2970], color: 'rgba(198,40,40,0.35)' }},
      {{ range: [2970, 3030], color: 'rgba(46,133,64,0.55)' }},
      {{ range: [3030, 3500], color: 'rgba(76,154,255,0.35)' }}
    ],
    threshold: {{ line: {{ color: 'white', width: 3 }}, thickness: 0.9, value: {anchor_base_raw} }}
  }}
}}], {{ paper_bgcolor: PLOT_BG, font: PLOT_FONT, margin: {{t:40,b:40,l:40,r:40}} }}, {{ displayModeBar: false }});

// 2. MC comparison bar
Plotly.newPlot('chart-mc', [{{
  type: 'bar',
  x: ['Naive MC', 'Block Boot.', 'Stage-Gate', 'LHS+Copula'],
  y: [{mc_mean_raw}, {boot_mean_raw}, {gate_mean_raw}, {lhs_mean_raw}],
  marker: {{ color: [BLUE, ORANGE, RED, GREEN] }},
  text: ['{mc_mean_str}', '{boot_mean_str}', '{gate_mean_str}', '{lhs_mean_str}'],
  textposition: 'outside',
  textfont: {{ color: '#E6F1FF', size: 16 }}
}}], {{
  paper_bgcolor: PLOT_BG, plot_bgcolor: PLOT_BG, font: PLOT_FONT,
  yaxis: {{ title: 'EBITDA, млн ₽', gridcolor: 'rgba(255,255,255,0.1)', range: [1800, 3600] }},
  xaxis: {{ tickfont: {{ size: 16 }} }},
  shapes: [
    {{ type: 'line', x0: -0.5, x1: 3.5, y0: {anchor_base_raw}, y1: {anchor_base_raw},
       line: {{ color: YELLOW, width: 2, dash: 'dash' }} }}
  ],
  annotations: [{{ x: 3.5, y: {anchor_base_raw}, text: 'Якорь 3000', showarrow: false, xanchor: 'right', yanchor: 'bottom', font: {{ color: YELLOW }} }}],
  margin: {{ t: 30, b: 50, l: 80, r: 30 }}
}}, {{ displayModeBar: false }});

// 3. Tornado
Plotly.newPlot('chart-tornado', [
  {{ type: 'bar', orientation: 'h',
    y: ['FX 0→20%', 'Inflation 0→20%', 'Delay 0→20%', 'Combo FX+Infl+Delay'],
    x: [-{fx_low}, -{infl_low}, -{delay_low}, -{combo_low}],
    base: [{fx_low}, {infl_low}, {delay_low}, {combo_low}],
    marker: {{ color: RED }}, name: 'Пессимистичный' }},
  {{ type: 'bar', orientation: 'h',
    y: ['FX 0→20%', 'Inflation 0→20%', 'Delay 0→20%', 'Combo FX+Infl+Delay'],
    x: [{fx_high_minus_base}, {infl_high_minus_base}, {delay_high_minus_base}, {combo_high_minus_base}],
    base: [{anchor_base_raw}, {anchor_base_raw}, {anchor_base_raw}, {anchor_base_raw}],
    marker: {{ color: GREEN }}, name: 'Оптимистичный' }}
], {{
  paper_bgcolor: PLOT_BG, plot_bgcolor: PLOT_BG, font: PLOT_FONT,
  barmode: 'overlay', showlegend: true,
  xaxis: {{ title: 'EBITDA, млн ₽', gridcolor: 'rgba(255,255,255,0.1)' }},
  yaxis: {{ tickfont: {{ size: 14 }} }},
  margin: {{ t: 30, b: 50, l: 180, r: 30 }}
}}, {{ displayModeBar: false }});

// 4. Stage-gate funnel
Plotly.newPlot('chart-funnel', [{{
  type: 'funnel',
  y: ['Development (12)', 'Greenlight (85%)', 'Production (92%)', 'Post (95%)', 'Release (97%)'],
  x: [12, 10.2, 9.38, 8.91, 8.64],
  textinfo: 'value+percent initial',
  marker: {{ color: [YELLOW, BLUE, ORANGE, GREEN, RED] }}
}}], {{
  paper_bgcolor: PLOT_BG, plot_bgcolor: PLOT_BG, font: PLOT_FONT,
  margin: {{ t: 30, b: 30, l: 200, r: 60 }}
}}, {{ displayModeBar: false }});

show(0);
</script>
</body>
</html>
"""


def build_html(data: dict, out_path: Path) -> None:
    mc = data["mc"]
    boot = data["boot"]
    gate = data["gate"]
    lhs = data["lhs"]
    m27_raw = data["m27"]
    scenarios_list = m27_raw.get("scenarios", []) if isinstance(m27_raw, dict) else m27_raw
    m27 = {s["scenario_id"]: s for s in scenarios_list}

    # Tornado ranges from matrix 27
    def extremes(ids: list[str]) -> tuple[float, float]:
        vals = [m27[i]["cumulative_ebitda"] for i in ids if i in m27]
        return (min(vals), max(vals)) if vals else (ANCHOR_BASE, ANCHOR_BASE)

    fx_lo, fx_hi = extremes(["FX0_I0_D0", "FX10_I0_D0", "FX20_I0_D0"])
    infl_lo, infl_hi = extremes(["FX0_I0_D0", "FX0_I10_D0", "FX0_I20_D0"])
    delay_lo, delay_hi = extremes(["FX0_I0_D0", "FX0_I0_D10", "FX0_I0_D20"])
    combo_lo, combo_hi = extremes(
        ["FX0_I0_D0", "FX10_I10_D10", "FX20_I20_D20"]
    )

    html = HTML_TEMPLATE.format(
        anchor_base_raw=ANCHOR_BASE,
        anchor_base_str=fmt(ANCHOR_BASE) + " млн",
        lhs_mean_raw=lhs["mean_ebitda"],
        lhs_mean_str=fmt(lhs["mean_ebitda"]),
        lhs_std_str=fmt(lhs["std_ebitda"]),
        lhs_var95_str=fmt(lhs["var_95_mln_rub"]),
        lhs_var99_str=fmt(lhs["var_99_mln_rub"]),
        lhs_breach_pct=pct(lhs["breach_probability"]),
        mc_mean_raw=mc["mean_ebitda"],
        mc_mean_str=fmt(mc["mean_ebitda"]),
        mc_std_str=fmt(mc["std_ebitda"]),
        mc_var95_str=fmt(mc["var_95_mln_rub"]),
        mc_breach_pct=pct(mc["breach_probability"]),
        boot_mean_raw=boot["mean_ebitda"],
        boot_mean_str=fmt(boot["mean_ebitda"]),
        gate_mean_raw=gate["mean_ebitda"],
        gate_mean_str=fmt(gate["mean_ebitda"]),
        fx_low=fx_lo,
        infl_low=infl_lo,
        delay_low=delay_lo,
        combo_low=combo_lo,
        fx_high_minus_base=fx_hi - ANCHOR_BASE,
        infl_high_minus_base=infl_hi - ANCHOR_BASE,
        delay_high_minus_base=delay_hi - ANCHOR_BASE,
        combo_high_minus_base=combo_hi - ANCHOR_BASE,
    )
    out_path.write_text(html, encoding="utf-8")


# ==========================================================================
def main() -> None:
    data = load_artifacts()
    pptx_out = ARTIFACTS / "B2_presentation.pptx"
    html_out = ARTIFACTS / "B2_presentation.html"
    build_pptx(data, pptx_out)
    build_html(data, html_out)
    print(f"[build_presentation] {pptx_out}")
    print(f"[build_presentation] {html_out}")


if __name__ == "__main__":
    main()
