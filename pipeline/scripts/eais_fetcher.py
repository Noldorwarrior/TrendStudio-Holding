#!/usr/bin/env python3
"""
scripts/eais_fetcher.py — загрузчик исторических данных российского кинопроката
(v1.3.7, Этап 2 D1 спринта Tier D-post).

Источники:
  primary:
    - mkrf_register_movies — opendata.mkrf.ru Реестр прокатных удостоверений
      (HTTP GET, кэшируется в inputs/eais_cache/)
    - fond_kino_statistics — ekinobilet.fond-kino.ru (locked, требует auth)
  reference:
    - seed-датасет в inputs/eais_seed/annual_box_office.csv

CLI:
  python scripts/eais_fetcher.py --target mkrf_register
  python scripts/eais_fetcher.py --target seed --summary
  python scripts/eais_fetcher.py --list-sources

Возвращаемое значение fetch_mkrf_register() — путь к кэшированному файлу.
load_annual_box_office() — List[AnnualBoxOfficeRow] для использования в F1.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
SEED_CSV = PIPELINE_ROOT / "inputs" / "eais_seed" / "annual_box_office.csv"
CACHE_DIR = PIPELINE_ROOT / "inputs" / "eais_cache"
SOURCES_YAML = PIPELINE_ROOT / "inputs" / "eais_sources.yaml"

USER_AGENT = "trendstudio-pipeline/1.3.7 (research; contact: rakhman@local)"
REQUEST_TIMEOUT = 15


@dataclass
class AnnualBoxOfficeRow:
    """Одна строка годового агрегата российского кинопроката."""
    year: int
    total_bo_mln_rub: float
    viewers_mln: float
    avg_ticket_rub: float
    russian_share_pct: float
    russian_bo_mln_rub: float
    n_releases: int
    source_id: str
    note: str

    @property
    def yoy_total_change(self) -> Optional[float]:
        """Заглушка; реальный YoY считается в load_annual_box_office()."""
        return None


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def fetch_mkrf_register(
    *,
    cache_dir: Path = CACHE_DIR,
    force_refresh: bool = False,
    head_only: bool = False,
) -> Path:
    """
    Загружает HTML-паспорт набора Реестр ПУ с opendata.mkrf.ru.

    NB: реальный ZIP с данными живёт за JS-редиректом и fighting-bot защитой.
    Для первой итерации D1 мы тянем HTML-паспорт (он содержит ссылки на версии
    и дату последнего обновления). Это даёт нам reproducible handshake с
    источником: если HTML-паспорт изменился, bundle hash тоже поменяется.

    Полный парсинг ZIP-файла реестра ПУ — Tier E+ (zip весит 30–50 МБ,
    требует unzip и парсинга JSONL).

    Args:
        cache_dir: директория для кэша.
        force_refresh: игнорировать кэш, тянуть заново.
        head_only: только HEAD-запрос для проверки доступности.

    Returns:
        Path к кэшированному HTML-паспорту.

    Raises:
        urllib.error.URLError — если сеть недоступна.
        RuntimeError — если ответ не HTTP 200.
    """
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / "mkrf_register_passport.html"
    meta_file = cache_dir / "mkrf_register_passport.meta.json"

    if cache_file.exists() and not force_refresh:
        return cache_file

    url = "https://opendata.mkrf.ru/opendata/7705851331-register_movies"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    if head_only:
        req.get_method = lambda: "HEAD"
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            if resp.status != 200:
                raise RuntimeError(f"HEAD {url} вернул {resp.status}")
            return cache_file  # файл не обновляется

    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        if resp.status != 200:
            raise RuntimeError(f"GET {url} вернул {resp.status}")
        data = resp.read()

    cache_file.write_bytes(data)
    sha = _sha256_file(cache_file)
    meta_file.write_text(
        json.dumps(
            {
                "url": url,
                "size_bytes": len(data),
                "sha256": sha,
                "user_agent": USER_AGENT,
                "source_id": "mkrf_register_movies_v11",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return cache_file


def load_annual_box_office(
    *, seed_path: Path = SEED_CSV
) -> List[AnnualBoxOfficeRow]:
    """
    Читает seed-датасет годовых агрегатов российского кинопроката 2019–2025.

    Возвращает упорядоченный по годам список. Используется F1 block
    bootstrap в Tier E.

    Raises:
        FileNotFoundError — если seed-файл отсутствует.
        ValueError — если seed нарушает ключевые инварианты.
    """
    if not seed_path.exists():
        raise FileNotFoundError(f"seed не найден: {seed_path}")

    rows: List[AnnualBoxOfficeRow] = []
    with seed_path.open("r", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            rows.append(
                AnnualBoxOfficeRow(
                    year=int(r["year"]),
                    total_bo_mln_rub=float(r["total_bo_mln_rub"]),
                    viewers_mln=float(r["viewers_mln"]),
                    avg_ticket_rub=float(r["avg_ticket_rub"]),
                    russian_share_pct=float(r["russian_share_pct"]),
                    russian_bo_mln_rub=float(r["russian_bo_mln_rub"]),
                    n_releases=int(r["n_releases"]),
                    source_id=r["source_id"].strip(),
                    note=r["note"].strip(),
                )
            )

    rows.sort(key=lambda x: x.year)

    if not rows:
        raise ValueError("seed пустой")
    years = [r.year for r in rows]
    gaps = [(b - a) for a, b in zip(years, years[1:])]
    if any(g != 1 for g in gaps):
        raise ValueError(f"seed не непрерывный: гэпы {gaps}")

    for r in rows:
        expected_russian = r.total_bo_mln_rub * r.russian_share_pct / 100.0
        if expected_russian == 0:
            continue
        delta = abs(r.russian_bo_mln_rub - expected_russian) / expected_russian
        if delta > 0.03:
            raise ValueError(
                f"{r.year}: russian_bo ({r.russian_bo_mln_rub}) ≠ "
                f"{expected_russian:.1f} (допуск 3%, фактически {delta:.1%})"
            )

    return rows


def compute_yoy_changes(rows: List[AnnualBoxOfficeRow]) -> List[float]:
    """Возвращает ряд YoY изменений total_bo_mln_rub (N-1 элементов)."""
    if len(rows) < 2:
        return []
    return [
        (b.total_bo_mln_rub - a.total_bo_mln_rub) / a.total_bo_mln_rub
        for a, b in zip(rows, rows[1:])
    ]


def print_summary() -> None:
    rows = load_annual_box_office()
    print(f">>> Seed annual_box_office 2019–{rows[-1].year}: {len(rows)} строк")
    print(f"    Years:  {', '.join(str(r.year) for r in rows)}")
    print(f"    Total:  {' → '.join(f'{r.total_bo_mln_rub:.0f}' for r in rows)} млн ₽")
    print(
        f"    RU share: "
        f"{' → '.join(f'{r.russian_share_pct:.1f}%' for r in rows)}"
    )
    yoy = compute_yoy_changes(rows)
    print(f"    YoY total: {', '.join(f'{x*100:+.1f}%' for x in yoy)}")
    worst = min(yoy) if yoy else 0.0
    best = max(yoy) if yoy else 0.0
    print(f"    Min YoY: {worst*100:+.1f}%   Max YoY: {best*100:+.1f}%")


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="EAIS fetcher v1.3.7")
    parser.add_argument(
        "--target",
        choices=("mkrf_register", "seed"),
        default="seed",
        help="что загружать",
    )
    parser.add_argument("--out", help="куда сохранить (только для mkrf_register)")
    parser.add_argument(
        "--force", action="store_true", help="игнорировать кэш, перезагрузить"
    )
    parser.add_argument("--summary", action="store_true", help="показать сводку")
    parser.add_argument("--list-sources", action="store_true", help="вывести источники")
    args = parser.parse_args(argv)

    if args.list_sources:
        import yaml

        with SOURCES_YAML.open("r", encoding="utf-8") as fh:
            doc = yaml.safe_load(fh)
        for s in doc["sources"]["primary"]:
            print(f"[primary] {s['source_id']}: {s['title']} [{s['status']}]")
        for s in doc["sources"]["reference"]:
            print(f"[ref]     {s['source_id']}: {s['title']}")
        return 0

    if args.target == "mkrf_register":
        out_dir = Path(args.out) if args.out else CACHE_DIR
        try:
            cache = fetch_mkrf_register(cache_dir=out_dir, force_refresh=args.force)
        except Exception as e:
            print(f"FAIL: {e}", file=sys.stderr)
            return 1
        print(f">>> Кэш: {cache}")
        print(f"    Размер: {cache.stat().st_size:,} байт")
        return 0

    if args.target == "seed":
        try:
            if args.summary:
                print_summary()
            else:
                rows = load_annual_box_office()
                print(f">>> Загружено {len(rows)} строк seed")
        except Exception as e:
            print(f"FAIL: {e}", file=sys.stderr)
            return 1
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
