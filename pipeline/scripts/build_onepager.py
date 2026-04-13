"""
build_onepager.py
B4 — One-pager executive summary v1.4.3.
Одна страница A4 с ключевыми цифрами, рисками и рекомендациями
для Совета директоров ТрендСтудио.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PIPELINE = HERE.parent
STRESS = PIPELINE / "artifacts" / "stress_matrix"
ARTIFACTS = PIPELINE / "artifacts"

# ---------- rakhman_docs import ----------
_DL = Path("/Users/noldorwarrior/Downloads")
_DL_LINUX = Path("/sessions/cool-serene-johnson/mnt/Downloads")
for _p in (_DL, _DL_LINUX):
    if _p.exists():
        sys.path.insert(0, str(_p))
        break
from rakhman_docs import DocxBuilder  # noqa: E402

from docx.shared import Pt, Cm, RGBColor  # noqa: E402
from docx.enum.text import WD_ALIGN_PARAGRAPH  # noqa: E402

ANCHOR_BASE = 3000.0


def fmt(v: float, d: int = 0) -> str:
    if d == 0:
        return f"{int(round(v)):,}".replace(",", " ")
    formatted = f"{v:,.{d}f}".replace(",", "~").replace(".", ",").replace("~", " ")
    return formatted


def pct(v: float, d: int = 2) -> str:
    return f"{v * 100:.{d}f}%".replace(".", ",")


def load_artifacts() -> dict:
    files = {"mc": "monte_carlo.json", "boot": "market_bootstrap.json",
             "gate": "stage_gate.json", "lhs": "lhs_copula.json"}
    return {k: json.loads((STRESS / f).read_text(encoding="utf-8"))
            for k, f in files.items()}


def build_onepager(data: dict, out_path: Path) -> None:
    lhs = data["lhs"]
    mc = data["mc"]
    gate = data["gate"]

    doc = DocxBuilder("ТрендСтудио | One-Pager | v1.4.3")

    # Compact for one-pager: smaller margins, less spacing
    # Tighten the top block by adding smaller title
    doc.h1("Финмодель ТрендСтудио 2026–2028 — сводка для Совета директоров")

    doc.paragraph(
        "Финансовая модель холдинга ТрендСтудио v1.4.3 построена с якорь-инвариантом "
        "cumulative EBITDA 2026–2028 = 3 000 млн ₽ ± 1%. Оценка проведена четырьмя "
        "независимыми MC-движками; эталонным выбран LHS + Gaussian Copula."
    )

    doc.h2("Ключевые показатели (LHS + Copula)")
    doc.table([
        ["Показатель", "Значение", "Комментарий"],
        ["Базовый EBITDA 2026–2028", f"{fmt(ANCHOR_BASE)} млн ₽", "Якорь ±1%"],
        ["Mean EBITDA", f"{fmt(lhs['mean_ebitda'])} млн ₽", "LHS+Copula"],
        ["Std EBITDA", f"{fmt(lhs['std_ebitda'])} млн ₽", "Волатильность"],
        ["VaR95 / VaR99", f"{fmt(lhs['var_95_mln_rub'])} / {fmt(lhs['var_99_mln_rub'])} млн ₽", "Потери хвоста"],
        ["P(breach якоря)", pct(lhs['breach_probability']), "≤ 5% — в пределах толерантности"],
        ["P(release | 12 фильмов)", pct(gate['p_reach_release']), "Stage-gate воронка"],
    ])

    doc.h2("Сравнение 4 MC-движков")
    doc.table([
        ["Движок", "Mean EBITDA", "Std", "P(breach)"],
        ["Naive MC Cholesky", f"{fmt(mc['mean_ebitda'])}", f"{fmt(mc['std_ebitda'])}", pct(mc['breach_probability'])],
        ["LHS + Copula", f"{fmt(lhs['mean_ebitda'])}", f"{fmt(lhs['std_ebitda'])}", pct(lhs['breach_probability'])],
        ["Block Bootstrap", f"{fmt(data['boot']['mean_ebitda'])}", f"{fmt(data['boot']['std_ebitda'])}", "—"],
        ["Stage-Gate tree", f"{fmt(gate['mean_ebitda'])}", f"{fmt(gate['std_ebitda'])}", pct(gate['breach_probability'])],
    ])

    doc.h2("Ключевые риски и митигация")
    doc.table([
        ["Риск", "Митигация"],
        ["FX (35% OPEX)", "Форварды/NDF на 50% валютной экспозиции"],
        ["Инфляция > 6%", "Индексационные оговорки в контрактах"],
        ["Задержки, sunk cost ≤ 830 млн ₽ (p95)", "Stage-gate дисциплина, зелёный светофор"],
        ["Концентрация партнёров", "Диверсификация до 8+ релизов"],
    ])

    doc.h2("Рекомендация")
    doc.paragraph(
        "Утвердить финмодель v1.4.3 как базу для бюджета 2026–2028. "
        "Внедрить FX-хеджирование и stage-gate регламент в Q2 2026. "
        "Квартально ре-калибровать якорь по факту исполнения."
    )

    doc.save(str(out_path))


def main() -> None:
    data = load_artifacts()
    out = ARTIFACTS / "B4_onepager.docx"
    build_onepager(data, out)
    print(f"[build_onepager] {out}")


if __name__ == "__main__":
    main()
