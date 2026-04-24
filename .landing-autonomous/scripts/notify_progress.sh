#!/usr/bin/env bash
# notify_progress.sh — обновляет PROGRESS.md
set -euo pipefail
WAVE="${1:-?}"
STATUS="${2:-done}"
BYTES="${3:-0}"

PROGRESS="${REPO_ROOT}/.landing-autonomous/PROGRESS.md"

if [[ ! -f "$PROGRESS" ]]; then
  cat > "$PROGRESS" <<HEAD
# Landing v1.0 Autonomous — Progress

**Started:** $(date +%Y-%m-%d_%H:%M:%S)

## Waves

HEAD
fi

echo "- [$(date +%H:%M:%S)] W${WAVE}: ${STATUS} (bytes=${BYTES})" >> "$PROGRESS"
echo "✅ PROGRESS.md updated"
