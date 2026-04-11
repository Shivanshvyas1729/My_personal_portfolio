#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Vercel Ignored Build Step Script
#
# Vercel calls this script before every build.
# Exit code 0 → SKIP the build (no deployment)
# Exit code 1 → PROCEED with the build (deploy)
#
# We skip builds when:
#   1. The commit message contains [skip ci]
#   2. The only file changed is src/data/blog.yaml (CMS-only commit)
# ─────────────────────────────────────────────────────────────────────────────

echo "🔍 Vercel Ignored Build Step: Evaluating commit..."

COMMIT_MSG=$(git log -1 --pretty=%B)
echo "📝 Commit message: $COMMIT_MSG"

# ── Rule 1: Skip if [skip ci] is in the commit message ──────────────────────
if echo "$COMMIT_MSG" | grep -q "\[skip ci\]"; then
  echo "⏭️  [skip ci] detected — Skipping build."
  exit 0
fi

# ── Rule 2: Skip if only blog.yaml was changed (CMS content commit) ──────────
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null)
echo "📂 Changed files: $CHANGED_FILES"

# If the only file changed was blog.yaml, skip
if [ -n "$CHANGED_FILES" ] && [ "$CHANGED_FILES" = "src/data/blog.yaml" ]; then
  echo "⏭️  Only blog.yaml changed (CMS commit) — Skipping build."
  exit 0
fi

# ── Default: Proceed with build ───────────────────────────────────────────────
echo "✅ Real code change detected — Proceeding with build."
exit 1
