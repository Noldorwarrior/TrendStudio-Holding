#!/usr/bin/env python3
"""assemble_html.py — собирает landing_v2.1.html из WAVE_<N>_ARTIFACT.jsx."""
import sys, os, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--up-to', type=int, required=True)
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
ART_DIR = REPO_ROOT / '.landing-autonomous'
HTML = REPO_ROOT / 'landing_v2.1.html'

TEMPLATE = '''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ТрендСтудио | LP-фонд кино</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
  <script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    html { scroll-behavior: smooth; }
    body { margin: 0; background: #0B0D10; color: #EAEAEA; font-family: 'Inter', system-ui, sans-serif; }
    *:focus-visible { outline: 2px solid #F4A261; outline-offset: 2px; border-radius: 4px; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    .card-hover { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease-out; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); border-color: #F4A261; }
    @keyframes bounce-y { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
    .bounce-y { animation: bounce-y 2s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
    .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
    @keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg,#F4A261,#E67E22); z-index:60; transition: width 0.1s linear; pointer-events:none; }
    .glass { backdrop-filter: blur(12px) saturate(140%); -webkit-backdrop-filter: blur(12px) saturate(140%); background: rgba(21,24,28,0.72); }
    .film-grain::after { content:''; position:absolute; inset:0; pointer-events:none; filter: url(#grain); opacity: 0.6; mix-blend-mode: overlay; }
    .easing-premium { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
    </filter>
  </svg>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    const { useState, useEffect, useMemo, useRef } = React;
    {ARTIFACT_CODE}
    ReactDOM.createRoot(document.getElementById('root')).render(<App_latest />);
  </script>
</body>
</html>
'''

parts = []
last_n = 0
for n in range(1, args.up_to + 1):
    art = ART_DIR / f'WAVE_{n}_ARTIFACT.jsx'
    if art.exists():
        parts.append(f'// ==== Wave {n} ====\n' + art.read_text(encoding='utf-8'))
        last_n = n

if last_n == 0:
    print('❌ No WAVE_*_ARTIFACT.jsx files found'); sys.exit(1)

full_code = '\n\n'.join(parts) + f'\nconst App_latest = App_W{last_n};\n'
HTML.write_text(TEMPLATE.replace('{ARTIFACT_CODE}', full_code), encoding='utf-8')
print(f'✅ Assembled waves 1..{last_n}, size: {HTML.stat().st_size:,} B')
