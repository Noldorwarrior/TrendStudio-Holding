#!/usr/bin/env python3
"""assemble_html.py — собирает landing_v1.0.html из WAVE_<N>_ARTIFACT.jsx."""
import sys, os, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--up-to', type=int, required=True)
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
ART_DIR = REPO_ROOT / '.landing-autonomous'
HTML = REPO_ROOT / 'landing_v2.2.html'

TEMPLATE = '''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ТрендСтудио | Киноиндустриальный холдинг — партнёрство с фондами</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    body { margin: 0; background: #0B0D10; color: #EAEAEA; font-family: 'Inter', system-ui, sans-serif; }
    *:focus-visible { outline: 2px solid #F4A261; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  </style>
</head>
<body>
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
