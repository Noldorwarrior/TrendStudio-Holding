"""
FIX-08: Synchronize Cover Letter dates and versions between Internal and Public.

Problems found:
- Internal 42_Cover_Letter: "11 апреля 2026 г."
- Public 42_Cover_Letter: "12 апреля 2026 г."
- Notes says "2026-04-11", ES says "2026-04-12"
- Version mismatch: v1.0 vs v1.0.1

Solution: Unify to latest date (13.04.2026) and version v1.0.1 across both files.
"""
import openpyxl
import os
import re

CANONICAL_DATE_RU = "13 апреля 2026 г."
CANONICAL_DATE_ISO = "2026-04-13"
CANONICAL_DATE_DOT = "13.04.2026"
CANONICAL_VERSION = "v1.0.1"


def fix_dates_and_versions(xlsx_path: str) -> int:
    """Synchronize dates and versions in xlsx file.

    Returns number of cells fixed.
    """
    wb = openpyxl.load_workbook(xlsx_path)
    fixed = 0

    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str):
                    original = cell.value

                    new_val = original
                    # Fix Russian date variants
                    new_val = new_val.replace("11 апреля 2026 г.", CANONICAL_DATE_RU)
                    new_val = new_val.replace("12 апреля 2026 г.", CANONICAL_DATE_RU)
                    # Fix ISO dates
                    new_val = new_val.replace("2026-04-11", CANONICAL_DATE_ISO)
                    new_val = new_val.replace("2026-04-12", CANONICAL_DATE_ISO)
                    # Fix dot dates (only the latest build date, not changelog)
                    if ws.title != "03_Change_Log":
                        new_val = new_val.replace("11.04.2026", CANONICAL_DATE_DOT)
                        new_val = new_val.replace("12.04.2026", CANONICAL_DATE_DOT)
                    # Fix version — upgrade v1.0 Public to v1.0.1 Public
                    new_val = re.sub(r'\bv1\.0\b(?!\.\d)', CANONICAL_VERSION, new_val)

                    if new_val != original:
                        cell.value = new_val
                        fixed += 1

    if fixed > 0:
        wb.save(xlsx_path)
        print(f"  Fixed {fixed} cells with date/version sync")
    else:
        print(f"  No date/version issues found")

    return fixed


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))

    targets = [
        os.path.join(base_dir, "investor_model_v3_Internal.xlsx"),
        os.path.join(base_dir, "investor_model_v3_Public.xlsx"),
    ]

    parent = os.path.dirname(base_dir)
    targets.extend([
        os.path.join(parent, "investor_model_v3_Internal.xlsx"),
        os.path.join(parent, "investor_model_v3_Public.xlsx"),
    ])

    for path in targets:
        if os.path.exists(path):
            print(f"Processing: {os.path.basename(path)} ({os.path.dirname(path)})")
            fix_dates_and_versions(path)
