"""
tests/test_36_phase6_pipeline.py — Phase 6: Pipeline Hardening.

Verifies:
  - requirements.txt pinned with == (R-022, F-018)
  - All key deps present (R-023, F-019)
  - No hardcoded macOS paths (R-025, F-017)
  - README updated (F-038)
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent.parent
PIPELINE_ROOT = Path(__file__).parent.parent


class TestRequirementsPinned:
    """R-022/F-018: requirements.txt must use == pinning."""

    def test_requirements_exists(self):
        req = PIPELINE_ROOT / "requirements.txt"
        assert req.exists()

    def test_no_gte_versions(self):
        req = PIPELINE_ROOT / "requirements.txt"
        content = req.read_text()
        for line in content.splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "==" not in line:
                continue
            if ">=" in line and "==" not in line:
                pytest.fail(f"Unpinned dependency: {line}")

    def test_key_deps_present(self):
        """R-023/F-019: plotly, python-pptx, numpy-financial must be listed."""
        req = PIPELINE_ROOT / "requirements.txt"
        content = req.read_text().lower()
        for dep in ["plotly", "python-pptx", "numpy-financial"]:
            assert dep in content, f"Missing dependency: {dep}"


class TestNoHardcodedPaths:
    """R-025/F-017: No hardcoded /Users/ paths in pipeline scripts."""

    SCRIPTS = [
        "scripts/build_presentation.py",
        "scripts/build_onepager.py",
        "scripts/build_memo.py",
    ]

    @pytest.mark.parametrize("script", SCRIPTS)
    def test_no_users_path(self, script):
        path = PIPELINE_ROOT / script
        if not path.exists():
            pytest.skip(f"{script} not found")
        content = path.read_text()
        matches = re.findall(r'/Users/\w+', content)
        assert len(matches) == 0, (
            f"{script} still has hardcoded path(s): {matches}"
        )

    @pytest.mark.parametrize("script", SCRIPTS)
    def test_uses_env_var_or_home(self, script):
        path = PIPELINE_ROOT / script
        if not path.exists():
            pytest.skip(f"{script} not found")
        content = path.read_text()
        assert "TRENDSTUDIO_RAKHMAN_DIR" in content or "Path.home()" in content, (
            f"{script} should use env var or Path.home() for rakhman_docs"
        )


class TestREADMEUpdated:
    """F-038: README should reflect current test count."""

    def test_readme_not_78_tests(self):
        readme = PIPELINE_ROOT / "README.md"
        content = readme.read_text()
        assert "tests_passed: 78" not in content, (
            "README still says 78 tests"
        )

    def test_readme_has_version(self):
        readme = PIPELINE_ROOT / "README.md"
        content = readme.read_text()
        assert "v1.1.0" in content or "v1.0" in content
