#!/usr/bin/env bash
set -euo pipefail

# Preserve the build outside the checkout before switching branches.
: "${PUBLISH_DIR:?}"
if [[ -e "$PUBLISH_DIR" ]]; then
  echo "Publish staging directory already exists: $PUBLISH_DIR" >&2
  exit 1
fi
cp -a dist "$PUBLISH_DIR"
revision=$(node --input-type=module - "$PUBLISH_DIR/manifest.json" <<'JS'
import { readFileSync } from 'node:fs';
console.log(JSON.parse(readFileSync(process.argv[2], 'utf8')).upstream.revision);
JS
)
remote_ref=$(git ls-remote origin refs/heads/rules)
if [[ -n "$remote_ref" ]]; then
  git fetch --depth=1 origin rules
  git checkout -B rules FETCH_HEAD
else
  git checkout --orphan rules
fi
# Orphan branches have staged source files but no HEAD, so removal needs -f.
git rm -rf --ignore-unmatch .
cp -a "$PUBLISH_DIR/." .
# Explicit paths: never accidentally publish the untracked .upstream checkout.
git add index.html app.js rules.js style.css source.json manifest.json AI-SOURCES.md surge mihomo LICENSE NOTICE .nojekyll
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
if ! git diff --cached --quiet; then
  git commit -m "Update AI rules from $revision"
  git push origin HEAD:rules
fi
