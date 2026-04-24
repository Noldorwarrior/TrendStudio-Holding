#!/usr/bin/env python3
"""assemble_html.py — собирает landing_v1.0.html из WAVE_<N>_ARTIFACT.jsx.

v1.2.2 (orchestrator fix 2026-04-24):
  - Переход на importmap + data-type="module" + esm.sh.
    Стабильный паттерн для standalone React/JSX без сборки:
      * React/ReactDOM/lucide-react/recharts резолвятся через esm.sh
      * Babel Standalone в module-режиме понимает ES-импорты/экспорты
      * Никакого preprocessing артефактов не требуется — JSX сохраняет
        `import`/`export default` как есть.
  - Tailwind (runtime) + Google Fonts — отдельные CDN, не зависят от esm.sh.
"""
import sys, os, re, argparse
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--up-to', type=int, required=True)
args = ap.parse_args()

REPO_ROOT = Path(os.environ.get('REPO_ROOT', '.')).resolve()
ART_DIR = REPO_ROOT / '.landing-autonomous'
HTML = REPO_ROOT / 'landing_v1.0.html'

TEMPLATE = '''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ТрендСтудио | LP-фонд кино</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@18.3.1?deps=react@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1",
      "lucide-react": "https://esm.sh/lucide-react@0.452.0?deps=react@18.3.1",
      "recharts": "https://esm.sh/recharts@2.12.7?deps=react@18.3.1,react-dom@18.3.1"
    }
  }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    body { margin: 0; background: #0B0D10; color: #EAEAEA; font-family: 'Inter', system-ui, sans-serif; }
    *:focus-visible { outline: 2px solid #F4A261; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react" data-type="module">
    import React, { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect, Fragment } from 'react';
    import { createRoot } from 'react-dom/client';

    {ARTIFACT_CODE}

    createRoot(document.getElementById('root')).render(<App_latest />);
  </script>
</body>
</html>
'''


_RE_REACT_IMPORT = re.compile(
    r"^\s*import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['\"]react['\"]\s*;?\s*$",
    re.MULTILINE,
)
_RE_HOOKS_IMPORT = re.compile(
    r"^\s*import\s+\{[^}]*\}\s+from\s+['\"]react['\"]\s*;?\s*$",
    re.MULTILINE,
)
_RE_LUCIDE_IMPORT = re.compile(
    r"^\s*import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]\s*;?\s*$",
    re.MULTILINE,
)
_RE_RECHARTS_IMPORT = re.compile(
    r"^\s*import\s+\{([^}]+)\}\s+from\s+['\"]recharts['\"]\s*;?\s*$",
    re.MULTILINE,
)


def _collect_lucide(code, bucket):
    def repl(m):
        for name in m.group(1).split(','):
            name = name.strip()
            if name:
                bucket.add(name)
        return ''
    return _RE_LUCIDE_IMPORT.sub(repl, code)


def _collect_recharts(code, bucket):
    def repl(m):
        for name in m.group(1).split(','):
            name = name.strip()
            if name:
                bucket.add(name)
        return ''
    return _RE_RECHARTS_IMPORT.sub(repl, code)


parts = []
last_n = 0
lucide_names: set[str] = set()
recharts_names: set[str] = set()

# Only use the LATEST wave's artifact — each WAVE_N_ARTIFACT.jsx is self-contained
# (copy of previous wave's code + new sections), per WAVE_PROMPTS convention.
# Concatenating all waves would duplicate helper components (ScrollProgress etc.).
latest_art = None
for n in range(args.up_to, 0, -1):
    art = ART_DIR / f'WAVE_{n}_ARTIFACT.jsx'
    if art.exists():
        latest_art = (n, art)
        break

if latest_art is not None:
    n, art = latest_art
    code = art.read_text(encoding='utf-8')
    # Strip React/hooks imports — template provides them.
    code = _RE_REACT_IMPORT.sub('', code)
    code = _RE_HOOKS_IMPORT.sub('', code)
    # Collect + strip lucide-react / recharts named imports (dedup logic kept for safety).
    code = _collect_lucide(code, lucide_names)
    code = _collect_recharts(code, recharts_names)
    # `export default function App_WN` → `function App_WN`.
    code = code.replace('export default function App_W', 'function App_W')
    parts.append(f'// ==== Wave {n} (latest, self-contained) ====\n' + code)
    last_n = n

if last_n == 0:
    print('❌ No WAVE_*_ARTIFACT.jsx files found'); sys.exit(1)

# Emit consolidated third-party imports BEFORE wave artifacts.
third_party_imports = []
if lucide_names:
    names = ', '.join(sorted(lucide_names))
    third_party_imports.append(f"import {{ {names} }} from 'lucide-react';")
if recharts_names:
    names = ', '.join(sorted(recharts_names))
    third_party_imports.append(f"import {{ {names} }} from 'recharts';")

full_code = '\n'.join(third_party_imports) + '\n\n' + '\n\n'.join(parts) + f'\nconst App_latest = App_W{last_n};\n'
HTML.write_text(TEMPLATE.replace('{ARTIFACT_CODE}', full_code), encoding='utf-8')
print(f'✅ Assembled waves 1..{last_n}, size: {HTML.stat().st_size:,} B')
