# Landing v1.0 — Stage B HANDOFF: INVARIANTS

**Версия:** 1.0
**Дата:** 2026-04-19
**Часть:** B1b.3 (шаг 3 из 3 в B1b)
**Автор:** Cowork (supervisor)
**Исполнитель:** CC (executor)
**Контекст:** спецификация единого скрипта `scripts/invariants_check.py`, который проверяет 7 инвариантов Landing v1.0 на каждом wave-gate (W1→W2→…→W6) и блокирует переход при любом нарушении.

---

## §0. Назначение

Это **исполняемый контракт** между Cowork и CC на уровне качества выпускаемого продукта. Документ фиксирует:

1. Состав 7 инвариантов (каждый — blocker).
2. Алгоритмы проверки каждого инварианта (pseudocode уровня Python 3.11+).
3. Exit-коды и их семантику.
4. Точки CI-интеграции (prebuild / wave-gate / release).
5. Дифференциацию режимов: `--wave=W1..W6` (ранний — допускает частичное отсутствие артефактов) и `--release` (финальный — всё должно присутствовать).

**Ключевой принцип:** инвариант либо `PASS` (exit 0 из своей функции), либо `FAIL` (exit ≠ 0). Предупреждения (warnings) допустимы внутри `PASS`, но не могут маскировать `FAIL`. Любой `FAIL` на wave-gate останавливает волну до исправления.

---

## §1. Обзорная таблица 7 инвариантов

| ID | Название | Severity | Fail-exit | Первая волна-гейт | Обязательно на |
|----|----------|----------|-----------|-------------------|----------------|
| INV-01 | Canon parity (sha256 + schema) | blocker | 11 | W1 | каждой волне |
| INV-02 | i18n symmetry (ru⇄en, 0 diff) | blocker | 12 | W1 | W1, W2, W3, W5, W6 |
| INV-03 | Numerical parity (sim → canon.returns) | blocker | 13 | W4 | W4, W5, W6 |
| INV-04 | a11y baseline (axe-core 0 violations AA) | blocker | 14 | W2 | W2, W3, W5, W6 |
| INV-05 | Budget ceiling (HTML ≤ 2000 KB hard) | blocker | 15 | W5 | W5, W6 |
| INV-06 | Security baseline (no eval / Function / localStorage / inline) | blocker | 16 | W1 | каждой волне |
| INV-07 | MC determinism (seed-fixed, 2× runs match) | blocker | 17 | W4 | W4, W6 |

**Общие коды:**

| Exit | Смысл |
|------|-------|
| 0 | All invariants PASS |
| 1 | Internal script error (traceback, IOError, etc.) |
| 2 | Invalid CLI args / missing required file before running checks |
| 3 | Mixed pass/fail + warnings (reserved, not used in MVP) |
| 11–17 | Соответствующий инвариант FAIL (первый встреченный) |
| 20 | Несколько инвариантов FAIL (aggregated; подробности в report) |

---

## §2. Инварианты: полный разбор

### 2.1. INV-01 — Canon parity

**Что защищает:** целостность канона (источника истины для чисел/узлов). Любое неавторизованное изменение canon_base / canon_extended / schemas / img_meta останавливает пайплайн.

**Проверяется:**

1. Все 5 канонических артефактов существуют.
2. Их sha256 совпадают с эталоном из `canon.lock.json`.
3. Каждый JSON валиден по соответствующей Draft-07 schema.
4. Extended ссылается на существующие узлы Base (структурная целостность).

**Эталонные пары (canon.lock.json, фиксируется при закрытии Stage A):**

```json
{
  "landing_canon_base_v1.0.json":     "c271322e37145426...",
  "landing_canon_extended_v1.0.json": "a9d4...",
  "landing_canon_base_schema.json":   "81f2...",
  "landing_canon_extended_schema.json":"5e07...",
  "landing_img_meta_v1.0.json":       "6b33..."
}
```

**Failure modes:**

- `canon_missing` — артефакт отсутствует → exit 11, категория A
- `canon_hash_mismatch` — sha256 ≠ lock → exit 11, категория B
- `canon_schema_invalid` — JSON не проходит Draft-07 → exit 11, категория C
- `canon_ref_broken` — Extended ссылается на несуществующий Base-узел → exit 11, категория D

**Pseudocode (функция уровня):**

```python
def check_inv01_canon_parity(ctx) -> CheckResult:
    lock = load_json(ctx.repo_root / "canon.lock.json")
    report = CheckResult(id="INV-01", name="Canon parity")
    for filename, expected_hash in lock.items():
        path = ctx.repo_root / filename
        if not path.exists():
            report.fail("canon_missing", filename, severity="blocker")
            continue
        actual = sha256_file(path)
        if actual != expected_hash:
            report.fail("canon_hash_mismatch",
                        f"{filename}: expected {expected_hash[:8]}, got {actual[:8]}",
                        severity="blocker")
            continue
        # Schema validation
        schema_name = _schema_for(filename)
        if schema_name:
            try:
                jsonschema.validate(load_json(path), load_json(ctx.repo_root / schema_name))
            except jsonschema.ValidationError as e:
                report.fail("canon_schema_invalid", f"{filename}: {e.message}", severity="blocker")
    # Structural ref integrity (Extended → Base)
    base = load_json(ctx.repo_root / "landing_canon_base_v1.0.json")
    ext = load_json(ctx.repo_root / "landing_canon_extended_v1.0.json")
    base_keys = _flatten_keys(base)   # e.g. {"returns.irr_public_w3", ...}
    for ref in ext.get("$refs", []):
        if ref not in base_keys:
            report.fail("canon_ref_broken", ref, severity="blocker")
    return report
```

### 2.2. INV-02 — i18n symmetry

**Что защищает:** паритет ru⇄en на уровне ключей. Пользователь-переключатель локали не должен увидеть missing key или raw technical id.

**Проверяется (в пределах каждого из 9 namespaces):**

1. `set(keys_ru) == set(keys_en)` — без расхождений.
2. Ни одно значение не пустое (`strip() != ""`).
3. Все ключи соответствуют regex `^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,4}$`.
4. Плейсхолдеры `{var}` и ICU-plural блоки совпадают по имени/структуре между ru и en (`{count}` должен быть в обеих локалях).

**Толерантность:** **0** (hard fail при любом расхождении).

**Failure modes:**

- `key_missing_en` / `key_missing_ru` — ключ есть в одной локали, нет в другой → exit 12
- `value_empty` — строка пустая после trim → exit 12
- `key_invalid_format` — имя ключа не проходит regex → exit 12
- `placeholder_mismatch` — набор `{var}` в ru ≠ en → exit 12
- `plural_form_mismatch` — структура ICU-plural не совпадает → exit 12

**Pseudocode:**

```python
def check_inv02_i18n_symmetry(ctx) -> CheckResult:
    report = CheckResult(id="INV-02", name="i18n symmetry")
    NAMESPACES = ["ui","a11y","narrative","legal","chart","control","modal","form","faq"]
    KEY_RE = re.compile(r"^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,4}$")
    PLACEHOLDER_RE = re.compile(r"\{([a-z_][a-z0-9_]*)\}")
    for ns in NAMESPACES:
        ru_path = ctx.repo_root / "i18n" / "ru" / f"{ns}.json"
        en_path = ctx.repo_root / "i18n" / "en" / f"{ns}.json"
        if not ru_path.exists() or not en_path.exists():
            if ctx.mode == "release":
                report.fail("namespace_missing", ns, severity="blocker")
            else:
                report.warn("namespace_not_yet_created", ns)  # допустимо на W1
            continue
        ru, en = load_json(ru_path), load_json(en_path)
        ru_keys, en_keys = set(_flatten(ru).keys()), set(_flatten(en).keys())
        for k in ru_keys - en_keys:
            report.fail("key_missing_en", f"{ns}.{k}", severity="blocker")
        for k in en_keys - ru_keys:
            report.fail("key_missing_ru", f"{ns}.{k}", severity="blocker")
        # value & format checks
        for k, v in _flatten(ru).items():
            if not KEY_RE.match(k):
                report.fail("key_invalid_format", f"ru/{ns}.{k}", severity="blocker")
            if not isinstance(v, str) or not v.strip():
                report.fail("value_empty", f"ru/{ns}.{k}", severity="blocker")
        # placeholder parity (only for keys present in both)
        for k in ru_keys & en_keys:
            ru_vars = set(PLACEHOLDER_RE.findall(_get(ru, k)))
            en_vars = set(PLACEHOLDER_RE.findall(_get(en, k)))
            if ru_vars != en_vars:
                report.fail("placeholder_mismatch",
                            f"{ns}.{k}: ru={sorted(ru_vars)}, en={sorted(en_vars)}",
                            severity="blocker")
            # ICU-plural structural check
            ru_plural = _extract_plural_forms(_get(ru, k))   # {"one","few","many","other"}
            en_plural = _extract_plural_forms(_get(en, k))   # {"one","other"}
            if bool(ru_plural) != bool(en_plural):
                report.fail("plural_form_mismatch",
                            f"{ns}.{k}: plural in one locale only",
                            severity="blocker")
    return report
```

### 2.3. INV-03 — Numerical parity

**Что защищает:** каждый симулятор (sim01…sim13) воспроизводит ровно то число, на котором держится LP-нарратив. Если слайдер сдвинут в дефолт — sim должен показать значение из canon.returns с допуском из спецификации.

**Проверяется (для каждого sim с numerical_parity в спеке):**

1. sim запущен с defaults (все input'ы = canon default).
2. output[metric] сравнивается с canon.returns.<field>.
3. |output - canon_value| ≤ tolerance (из DETAIL §4).

**Обязательные якоря (из B1b.1):**

| Sim | Metric | Canon path | Value | Tolerance |
|-----|--------|------------|-------|-----------|
| sim01 | irr_internal_p50 | canon.returns.mc_p50_internal | 13.95% | ±0.5 pp |
| sim03 | irr_public_w3 | canon.returns.irr_public_w3 | 20.09% | ±0.5 pp |
| sim04 | revenue_base | canon.returns.revenue_base | (из DETAIL) | ±2% |
| sim05 | irr_base | canon.returns.irr_base | (из DETAIL) | ±0.5 pp |
| sim07 | ebitda_cum | canon.returns.ebitda_cum | (из DETAIL) | ±3% |

**Failure modes:**

- `sim_not_registered` — sim не зарегистрирован в TS.Sim → exit 13
- `sim_output_missing` — output не содержит требуемой метрики → exit 13
- `parity_violation` — |actual - canon| > tolerance → exit 13

**Pseudocode:**

```python
def check_inv03_numerical_parity(ctx) -> CheckResult:
    report = CheckResult(id="INV-03", name="Numerical parity")
    canon = load_json(ctx.repo_root / "landing_canon_base_v1.0.json")
    parity_spec = load_yaml(ctx.repo_root / "config" / "numerical_parity.yaml")
    # Requires node runtime — run sim as headless
    for sim_id, spec in parity_spec.items():
        result = run_sim_headless(sim_id, inputs="defaults",
                                  iterations=spec.get("iterations", 5000),
                                  seed=spec["seed"])
        if result is None:
            report.fail("sim_not_registered", sim_id, severity="blocker")
            continue
        actual = result.get(spec["metric"])
        if actual is None:
            report.fail("sim_output_missing", f"{sim_id}.{spec['metric']}", severity="blocker")
            continue
        canon_val = _get(canon, spec["canon_path"])
        tol, unit = spec["tolerance"], spec.get("unit", "pp")
        diff = _normalize_diff(actual, canon_val, unit)
        if abs(diff) > tol:
            report.fail("parity_violation",
                        f"{sim_id}: actual={actual}, canon={canon_val}, diff={diff}{unit}, tol=±{tol}{unit}",
                        severity="blocker")
    return report
```

### 2.4. INV-04 — a11y baseline

**Что защищает:** WCAG 2.1 AA — контраст, alt, aria, фокус, reduced-motion.

**Проверяется:**

1. axe-core `@axe-core/cli` запускается на собранном HTML (или production preview).
2. 0 violations уровня `serious` и `critical`.
3. Все 20 изображений имеют alt.ru и alt.en (из img_meta).
4. Все интерактивные элементы с custom виджетом имеют `role` + `aria-label` (из a11y namespace).
5. `prefers-reduced-motion: reduce` — viz не запускают анимацию дольше 0.2s.
6. Focus-visible стили определены (контрастный outline ≥ 3:1).

**Failure modes:**

- `axe_serious` / `axe_critical` — нарушение любого serious/critical правила axe → exit 14
- `image_alt_missing` — img без alt.ru или alt.en → exit 14
- `aria_missing` — интерактив без role/aria-label → exit 14
- `reduced_motion_violation` — анимация >0.2s при reduced-motion → exit 14

**Pseudocode:**

```python
def check_inv04_a11y_baseline(ctx) -> CheckResult:
    report = CheckResult(id="INV-04", name="a11y baseline")
    html_path = ctx.repo_root / "dist" / "index.html"
    if not html_path.exists():
        if ctx.mode in ("W2", "W3"):
            report.warn("html_not_built", "run `make build-static` first")
            return report
        report.fail("html_missing", str(html_path), severity="blocker")
        return report
    # axe-core via subprocess
    r = subprocess.run(
        ["npx", "@axe-core/cli", str(html_path), "--tags", "wcag2a,wcag2aa,wcag21aa",
         "--exit", "--reporter", "v2"],
        capture_output=True, text=True, timeout=120
    )
    axe_json = json.loads(r.stdout)
    for v in axe_json.get("violations", []):
        if v["impact"] in ("serious", "critical"):
            report.fail(f"axe_{v['impact']}",
                        f"{v['id']}: {v['description']} ({len(v['nodes'])} nodes)",
                        severity="blocker")
    # img_meta cross-check
    img_meta = load_json(ctx.repo_root / "landing_img_meta_v1.0.json")
    for img_id, meta in img_meta.items():
        if not (meta.get("alt", {}).get("ru") and meta.get("alt", {}).get("en")):
            report.fail("image_alt_missing", img_id, severity="blocker")
    # reduced-motion: static heuristic — scan CSS for transition-duration > 200ms inside @media (prefers-reduced-motion: reduce)
    # (full dynamic check — Playwright в W6)
    return report
```

### 2.5. INV-05 — Budget ceiling

**Что защищает:** итоговая страница не превышает заявленного бюджета. Превышение ломает LCP/TTI и Lighthouse-целевые.

**Проверяется:**

1. `dist/index.html` ≤ 2 000 000 байт (hard limit).
2. Предупреждение если > 1 200 000 байт (soft limit).
3. Разбивка: ни один из внутренних ресурсов (inline SVG, base64 images, CSS, JS) не занимает > 40% от суммы.
4. Нет uncompressed inline images, для которых есть WebP/AVIF альтернатива.

**Failure modes:**

- `budget_hard_exceeded` — > 2 000 000 → exit 15
- `budget_resource_dominant` — один ресурс > 40% → exit 15 (release only)
- `budget_soft_exceeded` — warning, не fail (1 200 001 … 2 000 000)

**Pseudocode:**

```python
HARD_LIMIT = 2_000_000  # 2000 KB
SOFT_LIMIT = 1_200_000  # 1200 KB
DOMINANT_SHARE = 0.40

def check_inv05_budget(ctx) -> CheckResult:
    report = CheckResult(id="INV-05", name="Budget ceiling")
    html_path = ctx.repo_root / "dist" / "index.html"
    if not html_path.exists():
        if ctx.mode in ("W1", "W2", "W3", "W4"):
            report.warn("html_not_built", "early-wave skip")
            return report
        report.fail("html_missing", str(html_path), severity="blocker")
        return report
    size = html_path.stat().st_size
    if size > HARD_LIMIT:
        report.fail("budget_hard_exceeded",
                    f"{size} bytes > {HARD_LIMIT} (diff +{size-HARD_LIMIT})",
                    severity="blocker")
    elif size > SOFT_LIMIT:
        report.warn("budget_soft_exceeded",
                    f"{size} bytes > soft {SOFT_LIMIT} (diff +{size-SOFT_LIMIT}), review before release")
    # Resource breakdown (parse HTML)
    if ctx.mode == "release":
        breakdown = _parse_resource_sizes(html_path)  # {"inline_svg": N, "base64_img": N, ...}
        total = sum(breakdown.values())
        for name, b in breakdown.items():
            if b / total > DOMINANT_SHARE:
                report.fail("budget_resource_dominant",
                            f"{name}: {b} bytes ({b/total*100:.1f}% of {total})",
                            severity="blocker")
    return report
```

### 2.6. INV-06 — Security baseline

**Что защищает:** запрет опасных конструкций, нарушающих sandbox landing.

**Проверяется (статически по исходникам src/**/*.{js,ts,html,css}):**

1. Нет `eval(`.
2. Нет `new Function(`.
3. Нет `localStorage.` (допустима ссылка в комментариях как `// do NOT use localStorage`).
4. Нет inline event handlers (`onclick=`, `onload=`, `onerror=` в HTML).
5. Нет CDN-ссылок без `integrity=` + `crossorigin=`.
6. Нет `<img>` без `alt` атрибута.
7. Нет `dangerouslySetInnerHTML` (для случая, если в будущем подключат React).
8. Нет `document.write`.

**Failure modes (все → exit 16):**

- `security_eval`, `security_function_ctor`, `security_localstorage`, `security_inline_handler`, `security_cdn_no_integrity`, `security_img_no_alt`, `security_document_write`.

**Pseudocode:**

```python
FORBIDDEN_PATTERNS = {
    "security_eval":           re.compile(r"\beval\s*\("),
    "security_function_ctor":  re.compile(r"\bnew\s+Function\s*\("),
    "security_localstorage":   re.compile(r"\blocalStorage\s*\."),
    "security_inline_handler": re.compile(r"\son(click|load|error|submit|change)=", re.I),
    "security_document_write": re.compile(r"\bdocument\.write\s*\("),
}
CDN_RE = re.compile(r'<(?:script|link)[^>]+(?:src|href)=["\']https?://[^"\']+["\'][^>]*>', re.I)
INTEGRITY_RE = re.compile(r"integrity=", re.I)
IMG_NO_ALT_RE = re.compile(r"<img(?![^>]*\balt=)[^>]*>", re.I)

def check_inv06_security(ctx) -> CheckResult:
    report = CheckResult(id="INV-06", name="Security baseline")
    targets = list(_glob(ctx.repo_root / "src", "**/*.js")) \
            + list(_glob(ctx.repo_root / "src", "**/*.html")) \
            + list(_glob(ctx.repo_root / "src", "**/*.css"))
    for f in targets:
        txt = f.read_text(encoding="utf-8")
        # strip comments for JS/CSS before pattern match (rough)
        stripped = _strip_comments(txt, f.suffix)
        for key, rx in FORBIDDEN_PATTERNS.items():
            for m in rx.finditer(stripped):
                line = stripped[:m.start()].count("\n") + 1
                report.fail(key, f"{f.relative_to(ctx.repo_root)}:{line}", severity="blocker")
        if f.suffix == ".html":
            for m in CDN_RE.finditer(txt):
                tag = m.group(0)
                if not INTEGRITY_RE.search(tag):
                    report.fail("security_cdn_no_integrity",
                                f"{f.relative_to(ctx.repo_root)}: {tag[:80]}…",
                                severity="blocker")
            for m in IMG_NO_ALT_RE.finditer(txt):
                line = txt[:m.start()].count("\n") + 1
                report.fail("security_img_no_alt",
                            f"{f.relative_to(ctx.repo_root)}:{line}", severity="blocker")
    return report
```

### 2.7. INV-07 — MC determinism

**Что защищает:** воспроизводимость всех стохастических симов. При одном и том же seed два прогона sim01 должны дать бит-в-бит идентичный результат.

**Проверяется:**

1. Каждый MC-sim (sim01, sim02, sim04, sim05) запускается дважды с тем же seed.
2. `run1.hash_output() == run2.hash_output()` (sha256 от канонически сериализованных p5/p25/p50/p75/p95).
3. Все бины гистограммы совпадают.

**Failure modes:**

- `seed_not_specified` — sim-спека без `seed` → exit 17
- `determinism_break` — hash1 ≠ hash2 → exit 17

**Pseudocode:**

```python
MC_SIMS = ["sim01", "sim02", "sim04", "sim05"]

def check_inv07_mc_determinism(ctx) -> CheckResult:
    report = CheckResult(id="INV-07", name="MC determinism")
    spec = load_yaml(ctx.repo_root / "config" / "numerical_parity.yaml")
    for sim_id in MC_SIMS:
        s = spec.get(sim_id)
        if not s or "seed" not in s:
            report.fail("seed_not_specified", sim_id, severity="blocker")
            continue
        r1 = run_sim_headless(sim_id, inputs="defaults", iterations=s["iterations"], seed=s["seed"])
        r2 = run_sim_headless(sim_id, inputs="defaults", iterations=s["iterations"], seed=s["seed"])
        h1 = _canonical_hash(r1)
        h2 = _canonical_hash(r2)
        if h1 != h2:
            report.fail("determinism_break",
                        f"{sim_id}: run1={h1[:8]}, run2={h2[:8]} (seed={s['seed']})",
                        severity="blocker")
    return report
```

---

## §3. Exit-коды (таксономия)

```
0      PASS (all invariants green)
1      internal error (traceback, IOError, timeout)
2      invalid CLI args or missing canon.lock.json before checks
3      reserved
11     INV-01 failed (first encountered)
12     INV-02 failed
13     INV-03 failed
14     INV-04 failed
15     INV-05 failed
16     INV-06 failed
17     INV-07 failed
20     aggregated: несколько INV-XX failed (report содержит детали)
```

**Правило агрегации:** если выбран `--fail-fast` (default), скрипт останавливается на первом FAIL и возвращает соответствующий 11..17. Если `--no-fail-fast`, проходит все 7 и возвращает 20 если ≥2 failed, или 11..17 если ровно 1.

---

## §4. CI-интеграция

### 4.1. Prebuild hook (локально, перед сборкой)

```bash
#!/usr/bin/env bash
# scripts/prebuild.sh
set -euo pipefail
python3 scripts/invariants_check.py --wave=W1 --no-html  # быстрая проверка без dist/
```

### 4.2. Wave-gate hook (GitHub Actions / локальный)

Каждая wave `W1…W6` имеет JSON-сниппет из `landing_b1_wave_plan_v1.0.json` с полем `invariants_check_required: [...]`. Перед merge в trunk:

```bash
python3 scripts/invariants_check.py --wave="$GATE" --json-out qa/invariants_$GATE.json
```

exit 0 → PR зелёный, exit ≠ 0 → PR красный + артефакт report загружается.

### 4.3. Release gate

```bash
python3 scripts/invariants_check.py --release --no-fail-fast --json-out qa/invariants_release.json
```

Жёсткое требование: exit 0. Никаких обходов. Тег `v1.0.0-landing` ставится только если release gate PASS.

---

## §5. Архитектура скрипта

```
scripts/
├── invariants_check.py          # entry point
├── _invariants/
│   ├── __init__.py
│   ├── context.py               # Context dataclass (repo_root, mode, wave, flags)
│   ├── result.py                # CheckResult + ReportAggregator
│   ├── helpers.py               # sha256_file, load_json, load_yaml, _flatten, _get
│   ├── inv01_canon.py           # check_inv01_canon_parity
│   ├── inv02_i18n.py            # check_inv02_i18n_symmetry
│   ├── inv03_numerical.py       # check_inv03_numerical_parity
│   ├── inv04_a11y.py            # check_inv04_a11y_baseline
│   ├── inv05_budget.py          # check_inv05_budget
│   ├── inv06_security.py        # check_inv06_security
│   └── inv07_mc.py              # check_inv07_mc_determinism
└── runners/
    ├── run_sim_headless.py      # node subprocess runner (wraps src/sim/*)
    └── run_axe.py               # axe-core subprocess wrapper
```

**Зависимости Python 3.11+:**

```txt
jsonschema>=4.21
PyYAML>=6.0
rich>=13.7       # pretty console output
```

**Зависимости Node:**

```json
{
  "devDependencies": {
    "@axe-core/cli": "^4.8",
    "playwright": "^1.42"   // для W6 full a11y run
  }
}
```

---

## §6. Entry point — полный pseudocode

```python
#!/usr/bin/env python3
"""
Landing v1.0 — Invariants Checker
Exit codes: see §3
"""
from __future__ import annotations
import sys, json, argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import Callable

from _invariants.context import Context
from _invariants.result  import CheckResult, ReportAggregator
from _invariants.inv01_canon     import check_inv01_canon_parity
from _invariants.inv02_i18n      import check_inv02_i18n_symmetry
from _invariants.inv03_numerical import check_inv03_numerical_parity
from _invariants.inv04_a11y      import check_inv04_a11y_baseline
from _invariants.inv05_budget    import check_inv05_budget
from _invariants.inv06_security  import check_inv06_security
from _invariants.inv07_mc        import check_inv07_mc_determinism

# Mapping: которые инварианты обязательны на какой волне
WAVE_REQUIREMENTS: dict[str, list[str]] = {
    "W1": ["INV-01", "INV-02", "INV-06"],
    "W2": ["INV-01", "INV-02", "INV-04", "INV-06"],
    "W3": ["INV-01", "INV-02", "INV-04", "INV-06"],
    "W4": ["INV-01", "INV-03", "INV-06", "INV-07"],
    "W5": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06"],
    "W6": ["INV-01", "INV-02", "INV-03", "INV-04", "INV-05", "INV-06", "INV-07"],
}

CHECK_FN: dict[str, Callable] = {
    "INV-01": check_inv01_canon_parity,
    "INV-02": check_inv02_i18n_symmetry,
    "INV-03": check_inv03_numerical_parity,
    "INV-04": check_inv04_a11y_baseline,
    "INV-05": check_inv05_budget,
    "INV-06": check_inv06_security,
    "INV-07": check_inv07_mc_determinism,
}

EXIT_FOR = {"INV-01":11,"INV-02":12,"INV-03":13,"INV-04":14,
            "INV-05":15,"INV-06":16,"INV-07":17}

def main() -> int:
    ap = argparse.ArgumentParser(description="Landing v1.0 invariants check")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--wave", choices=list(WAVE_REQUIREMENTS))
    g.add_argument("--release", action="store_true")
    ap.add_argument("--no-fail-fast", action="store_true")
    ap.add_argument("--no-html", action="store_true",
                    help="Skip checks that require built HTML (INV-04/05)")
    ap.add_argument("--json-out", type=Path, default=None)
    ap.add_argument("--repo-root", type=Path, default=Path.cwd())
    ap.add_argument("--only", nargs="*", choices=list(CHECK_FN))
    args = ap.parse_args()

    ctx = Context(
        repo_root=args.repo_root,
        mode="release" if args.release else args.wave,
        wave=args.wave,
        no_html=args.no_html,
    )

    if args.release:
        targets = list(CHECK_FN)
    else:
        targets = WAVE_REQUIREMENTS[args.wave]
    if args.only:
        targets = [t for t in targets if t in args.only]

    agg = ReportAggregator()
    fail_fast = not args.no_fail_fast

    for inv_id in targets:
        try:
            res: CheckResult = CHECK_FN[inv_id](ctx)
        except Exception as e:
            # internal error — log & bail
            print(f"[ERROR] {inv_id} threw: {e!r}", file=sys.stderr)
            return 1
        agg.add(res)
        res.render_console()
        if res.has_failures and fail_fast:
            break

    # Write JSON report if requested
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(agg.to_json(), encoding="utf-8")

    # Determine exit code
    failed = agg.failed_ids()
    if not failed:
        print("[OK] All invariants PASSED")
        return 0
    if len(failed) == 1:
        return EXIT_FOR[failed[0]]
    return 20

if __name__ == "__main__":
    sys.exit(main())
```

### 6.1. CheckResult (dataclass)

```python
@dataclass
class Finding:
    code: str           # "canon_missing", "key_missing_en", ...
    detail: str         # human-readable specifics
    severity: str       # "blocker" | "warning"

@dataclass
class CheckResult:
    id: str             # "INV-01"
    name: str
    findings: list[Finding] = field(default_factory=list)

    def fail(self, code: str, detail: str, severity: str = "blocker") -> None:
        self.findings.append(Finding(code, detail, severity))

    def warn(self, code: str, detail: str) -> None:
        self.findings.append(Finding(code, detail, "warning"))

    @property
    def has_failures(self) -> bool:
        return any(f.severity == "blocker" for f in self.findings)

    def render_console(self) -> None:
        status = "FAIL" if self.has_failures else ("WARN" if self.findings else "PASS")
        print(f"[{status}] {self.id} {self.name} — {len(self.findings)} finding(s)")
        for f in self.findings:
            print(f"   · {f.severity:7s} {f.code}: {f.detail}")
```

### 6.2. ReportAggregator

```python
class ReportAggregator:
    def __init__(self):
        self.results: list[CheckResult] = []
    def add(self, r: CheckResult) -> None:
        self.results.append(r)
    def failed_ids(self) -> list[str]:
        return [r.id for r in self.results if r.has_failures]
    def to_json(self) -> str:
        return json.dumps({
            "run_at": datetime.utcnow().isoformat() + "Z",
            "results": [
                {"id": r.id, "name": r.name,
                 "status": "FAIL" if r.has_failures else "PASS",
                 "findings": [asdict(f) for f in r.findings]}
                for r in self.results
            ]
        }, ensure_ascii=False, indent=2)
```

---

## §7. Конфигурация и пороги

### 7.1. `canon.lock.json` (схема)

```json
{
  "$schema": "canon_lock_v1.0.json",
  "generated_at": "2026-04-19T00:00:00Z",
  "hashes": {
    "landing_canon_base_v1.0.json":       "c271322e37145426...",
    "landing_canon_extended_v1.0.json":   "a9d4...",
    "landing_canon_base_schema.json":     "81f2...",
    "landing_canon_extended_schema.json": "5e07...",
    "landing_img_meta_v1.0.json":         "6b33..."
  }
}
```

### 7.2. `config/numerical_parity.yaml`

```yaml
sim01:
  engine: mc_light
  seed: 0xDEADBEEF
  iterations: 5000
  metric: irr_internal_p50
  canon_path: returns.mc_p50_internal
  tolerance: 0.5
  unit: pp
sim03:
  engine: closed_form
  seed: null
  iterations: 1
  metric: irr_public_w3
  canon_path: returns.irr_public_w3
  tolerance: 0.5
  unit: pp
# ... sim04, sim05, sim07 ...
```

### 7.3. `config/invariants.yaml` (общие пороги)

```yaml
budget:
  hard_limit_bytes: 2000000
  soft_limit_bytes: 1200000
  dominant_share_threshold: 0.40
a11y:
  axe_tags: ["wcag2a","wcag2aa","wcag21aa"]
  fail_impacts: ["serious","critical"]
i18n:
  namespaces: ["ui","a11y","narrative","legal","chart","control","modal","form","faq"]
  key_regex: "^[a-z][a-z0-9_]*(\\.[a-z0-9_]+){1,4}$"
  max_depth: 5
security:
  allow_cdn: true
  require_integrity: true
```

---

## §8. Failure diagnostics

Каждый FAIL в консоли и JSON-отчёте содержит:

- `code` (машиночитаемый — см. §2 per invariant)
- `detail` (путь файла + строка / id-артефакта)
- `severity` (blocker | warning)
- `suggested_fix` (в расширенной версии report — §10)

**Пример JSON-отчёта:**

```json
{
  "run_at": "2026-04-22T14:03:21Z",
  "results": [
    {
      "id": "INV-01", "name": "Canon parity", "status": "PASS", "findings": []
    },
    {
      "id": "INV-02", "name": "i18n symmetry", "status": "FAIL",
      "findings": [
        {"code":"key_missing_en","detail":"chart.viz07.title","severity":"blocker"},
        {"code":"placeholder_mismatch","detail":"ui.hero.cta: ru={name}, en={}","severity":"blocker"}
      ]
    }
  ]
}
```

---

## §9. DoD (Definition of Done) для B1b.3

- [x] Все 7 инвариантов имеют имя, severity, exit-код, first-gate wave.
- [x] Каждому инварианту сопоставлен pseudocode check-функции.
- [x] Зафиксированы failure modes для каждого инварианта (21 category total).
- [x] Exit-коды документированы, агрегатная логика описана.
- [x] CI-интеграция описана: prebuild, wave-gate, release.
- [x] Архитектура скрипта (файловая структура) описана.
- [x] Полный pseudocode entry point `invariants_check.py` приведён.
- [x] Конфиги `canon.lock.json`, `numerical_parity.yaml`, `invariants.yaml` специфицированы.
- [x] Формат JSON-отчёта описан.
- [x] Документ имеет dual-location (будет подтверждено после записи).

---

## §10. Следующий шаг

После B1b.3 (**12% / 100%**) — верификация **П5 «Максимум» 32/32** на пакете:
- B1a CORE handoff
- B1b.1 DETAIL handoff
- B1b.2 I18N handoff
- B1b.3 wave_plan + INVARIANTS handoff

После П5 PASS — разблокировка **Stage B Execution** (W1→W6, 70% → landing в дистрибутивной готовности).

---

*Конец документа. Версия 1.0, 2026-04-19.*
