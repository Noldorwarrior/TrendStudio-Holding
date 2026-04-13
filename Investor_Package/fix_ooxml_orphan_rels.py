"""
FIX-06: Remove orphan sharedStrings.xml relationship from Public.xlsx.

The workbook.xml.rels contains a reference to sharedStrings.xml,
but the file doesn't exist in the archive. This can cause Excel
to report a "missing part" warning on opening.

Solution: Remove the orphan Relationship element from workbook.xml.rels.
"""
import zipfile
import shutil
import os
import re
import sys
import tempfile


def fix_orphan_rels(xlsx_path: str) -> bool:
    """Remove orphan sharedStrings relationship from xlsx file.

    Returns True if a fix was applied, False if no fix needed.
    """
    with zipfile.ZipFile(xlsx_path, 'r') as zin:
        namelist = zin.namelist()
        rels_path = 'xl/_rels/workbook.xml.rels'

        if rels_path not in namelist:
            print(f"  No {rels_path} found — skipping")
            return False

        rels_content = zin.read(rels_path).decode('utf-8')
        has_ss_file = 'xl/sharedStrings.xml' in namelist

        # Check for sharedStrings reference
        if 'sharedStrings' not in rels_content:
            print("  No sharedStrings reference — no fix needed")
            return False

        if has_ss_file:
            print("  sharedStrings.xml exists — reference is valid, no fix needed")
            return False

        # Remove the orphan Relationship element
        # Match: <Relationship Id="rIdNN" Type="...sharedStrings" Target="sharedStrings.xml"/>
        pattern = r'\s*<Relationship\s+[^>]*sharedStrings[^>]*/>'
        fixed_content = re.sub(pattern, '', rels_content)

        if fixed_content == rels_content:
            print("  WARNING: regex didn't match — trying alternative pattern")
            # Try multi-attribute order variants
            pattern2 = r'\s*<Relationship[^>]*Target="sharedStrings\.xml"[^>]*/>'
            fixed_content = re.sub(pattern2, '', rels_content)

        if fixed_content == rels_content:
            print("  ERROR: Could not remove orphan reference")
            return False

        # Rewrite the zip file without the orphan reference
        tmp_fd, tmp_path = tempfile.mkstemp(suffix='.xlsx')
        os.close(tmp_fd)

        try:
            with zipfile.ZipFile(tmp_path, 'w', zipfile.ZIP_DEFLATED) as zout:
                for item in namelist:
                    if item == rels_path:
                        zout.writestr(item, fixed_content)
                    else:
                        zout.writestr(item, zin.read(item))

            # Replace original
            shutil.move(tmp_path, xlsx_path)
            print(f"  Fixed: removed orphan sharedStrings reference")
            return True
        except Exception:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise

    return False


if __name__ == "__main__":
    targets = [
        "investor_model_v3_Public.xlsx",
    ]

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for fname in targets:
        path = os.path.join(base_dir, fname)
        if not os.path.exists(path):
            # Also check parent directory
            path = os.path.join(os.path.dirname(base_dir), fname)

        if os.path.exists(path):
            print(f"Processing: {fname}")
            fix_orphan_rels(path)
        else:
            print(f"NOT FOUND: {fname}")
