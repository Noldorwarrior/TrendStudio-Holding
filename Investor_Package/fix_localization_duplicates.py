"""
FIX-07: Remove 61 localization duplicates from investor model xlsx files.

Pattern: When original text is already in Russian, a translation step
duplicated it in parentheses: "ВЫРУЧКА (ВЫРУЧКА)" instead of "ВЫРУЧКА (REVENUE)".

This script detects and fixes the pattern: WORD (WORD) → WORD
where both WORDs are identical Cyrillic strings.
"""
import re
import openpyxl
import os
import sys


# Pattern: Cyrillic word followed by identical word in parens
DUPE_PATTERN = re.compile(r'(\b[А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*\b)\s*\(\1\)')


def fix_duplicates(xlsx_path: str) -> int:
    """Remove duplicate localization patterns from xlsx.

    Returns number of cells fixed.
    """
    wb = openpyxl.load_workbook(xlsx_path)
    fixed = 0

    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str):
                    original = cell.value
                    # Replace all duplicate patterns
                    new_val = DUPE_PATTERN.sub(r'\1', original)
                    if new_val != original:
                        cell.value = new_val
                        fixed += 1

    if fixed > 0:
        wb.save(xlsx_path)
        print(f"  Fixed {fixed} cells with duplicate localization")
    else:
        print(f"  No duplicates found")

    return fixed


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))

    targets = [
        os.path.join(base_dir, "investor_model_v3_Internal.xlsx"),
        os.path.join(base_dir, "investor_model_v3_Public.xlsx"),
    ]

    # Also check root directory
    parent = os.path.dirname(base_dir)
    targets.extend([
        os.path.join(parent, "investor_model_v3_Internal.xlsx"),
        os.path.join(parent, "investor_model_v3_Public.xlsx"),
    ])

    for path in targets:
        if os.path.exists(path):
            print(f"Processing: {os.path.basename(path)} ({os.path.dirname(path)})")
            fix_duplicates(path)
