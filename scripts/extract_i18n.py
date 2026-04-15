#!/usr/bin/env python3
"""Extract i18n strings from deck_content.json into i18n/ru.json and i18n/en.json.
EN = [EN:{key}] stubs for Phase 1.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "Deck_v1.1.1" / "deck_content.json"
DATA = ROOT / "data_extract" / "deck_data_v1.2.0.json"
RU_OUT = ROOT / "i18n" / "ru.json"
EN_OUT = ROOT / "i18n" / "en.json"


def flatten_strings(obj, prefix="", result=None):
    if result is None:
        result = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_key = f"{prefix}.{k}" if prefix else k
            flatten_strings(v, new_key, result)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            new_key = f"{prefix}.{i}"
            flatten_strings(v, new_key, result)
    elif isinstance(obj, str) and len(obj) > 1:
        result[prefix] = obj
    return result


def main():
    with open(CONTENT) as f:
        content = json.load(f)

    ru = {}
    en = {}

    # Meta strings
    ru["meta.title"] = content["meta"]["title"]
    ru["meta.subtitle"] = content["meta"]["subtitle"]
    ru["meta.audience"] = content["meta"]["audience"]

    # Nav
    ru["nav.prev"] = "Назад"
    ru["nav.next"] = "Далее"
    ru["nav.indicator"] = "{current} / {total}"
    ru["nav.skip_to_content"] = "Перейти к содержимому"

    # Common
    ru["common.confidential"] = "Конфиденциально"
    ru["common.currency"] = "млн \u20bd"
    ru["common.source"] = "Источник"
    ru["common.note"] = "Примечание"
    ru["common.total"] = "Итого"
    ru["common.year"] = "Год"
    ru["common.scenario"] = "Сценарий"
    ru["common.base"] = "Базовый"
    ru["common.downside"] = "Негативный"
    ru["common.upside"] = "Позитивный"

    # Per-slide strings
    for slide in content["slides"]:
        n = slide["n"]
        prefix = f"s{n:02d}"

        if "title" in slide:
            ru[f"{prefix}.title"] = slide["title"]
        if "subtitle" in slide:
            ru[f"{prefix}.subtitle"] = slide["subtitle"]
        if "body" in slide:
            ru[f"{prefix}.body"] = slide["body"]
        if "footer" in slide:
            ru[f"{prefix}.footer"] = slide["footer"]
        if "note" in slide:
            ru[f"{prefix}.note"] = slide["note"]
        if "disclosure" in slide:
            ru[f"{prefix}.disclosure"] = slide["disclosure"]
        if "conclusion" in slide:
            ru[f"{prefix}.conclusion"] = slide["conclusion"]
        if "formula" in slide:
            ru[f"{prefix}.formula"] = slide["formula"]
        if "formula_box" in slide:
            ru[f"{prefix}.formula_box"] = slide["formula_box"]
        if "disclaimer" in slide:
            ru[f"{prefix}.disclaimer"] = slide["disclaimer"]

        # Badges
        if "badges" in slide:
            for i, b in enumerate(slide["badges"]):
                ru[f"{prefix}.badges.{i}"] = b

        # Stats
        if "stats" in slide:
            for i, s in enumerate(slide["stats"]):
                ru[f"{prefix}.stats.{i}.label"] = s["label"]

        # Points
        if "points" in slide:
            for i, p in enumerate(slide["points"]):
                ru[f"{prefix}.points.{i}"] = p

        # Theses
        if "theses" in slide:
            for i, t in enumerate(slide["theses"]):
                ru[f"{prefix}.theses.{i}.title"] = t["title"]
                ru[f"{prefix}.theses.{i}.short"] = t["short"]

        # Pipeline
        if "pipeline" in slide:
            for i, p in enumerate(slide["pipeline"]):
                ru[f"{prefix}.pipeline.{i}.name"] = p["name"]

        # KPI
        if "kpi" in slide:
            for i, k in enumerate(slide["kpi"]):
                ru[f"{prefix}.kpi.{i}.metric"] = k["metric"]

        # Exits
        if "exits" in slide:
            for i, e in enumerate(slide["exits"]):
                ru[f"{prefix}.exits.{i}.name"] = e["name"]

        # Risks
        if "risks" in slide:
            for i, r in enumerate(slide["risks"]):
                ru[f"{prefix}.risks.{i}.name"] = r["name"]
                ru[f"{prefix}.risks.{i}.mitig"] = r["mitig"]

        # Committees
        if "committees" in slide:
            for i, c in enumerate(slide["committees"]):
                ru[f"{prefix}.committees.{i}.name"] = c["name"]
                ru[f"{prefix}.committees.{i}.scope"] = c["scope"]

        # Tiers (waterfall)
        if "tiers" in slide:
            for i, t in enumerate(slide["tiers"]):
                ru[f"{prefix}.tiers.{i}.name"] = t["name"]
                ru[f"{prefix}.tiers.{i}.desc"] = t["desc"]

        # Terms
        if "terms" in slide:
            for i, t in enumerate(slide["terms"]):
                ru[f"{prefix}.terms.{i}.k"] = t["k"]
                ru[f"{prefix}.terms.{i}.v"] = t["v"]

        # Apps
        if "apps" in slide:
            for i, a in enumerate(slide["apps"]):
                ru[f"{prefix}.apps.{i}.name"] = a["name"]
                ru[f"{prefix}.apps.{i}.desc"] = a["desc"]

        # Contacts
        if "contacts" in slide:
            for i, c in enumerate(slide["contacts"]):
                ru[f"{prefix}.contacts.{i}.role"] = c["role"]

        # Next steps
        if "next_steps" in slide:
            for i, s in enumerate(slide["next_steps"]):
                ru[f"{prefix}.next_steps.{i}"] = s

        # KPI grid
        if "kpi_grid" in slide:
            for i, k in enumerate(slide["kpi_grid"]):
                ru[f"{prefix}.kpi_grid.{i}.kpi"] = k["kpi"]

        # Reporting
        if "reporting" in slide:
            for i, r in enumerate(slide["reporting"]):
                ru[f"{prefix}.reporting.{i}"] = r

        # Table rows (s18)
        if "table" in slide:
            for i, t in enumerate(slide["table"]):
                if isinstance(t, dict):
                    ru[f"{prefix}.table.{i}.aspect"] = t.get("aspect", "")
                    ru[f"{prefix}.table.{i}.det"] = t.get("det", "")
                    ru[f"{prefix}.table.{i}.stoch"] = t.get("stoch", "")

        # Funnel (s08)
        if "funnel" in slide:
            for i, f_item in enumerate(slide["funnel"]):
                ru[f"{prefix}.funnel.{i}.label"] = f_item["label"]

        # Variables (s16)
        if "variables" in slide:
            for i, v in enumerate(slide["variables"]):
                ru[f"{prefix}.variables.{i}.var"] = v["var"]
                ru[f"{prefix}.variables.{i}.dist"] = v["dist"]

        # Percentiles (s17)
        if "percentiles" in slide:
            for i, p in enumerate(slide["percentiles"]):
                ru[f"{prefix}.percentiles.{i}.p"] = p["p"]

    # Generate EN stubs
    for key in ru:
        en[key] = f"[EN:{key}]"

    # Write
    RU_OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(RU_OUT, "w", encoding="utf-8") as f:
        json.dump(ru, f, ensure_ascii=False, indent=2)
    with open(EN_OUT, "w", encoding="utf-8") as f:
        json.dump(en, f, ensure_ascii=False, indent=2)

    print(f"RU: {len(ru)} keys -> {RU_OUT}")
    print(f"EN: {len(en)} keys -> {EN_OUT}")


if __name__ == "__main__":
    main()
