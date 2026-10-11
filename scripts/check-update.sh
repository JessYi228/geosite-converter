#!/usr/bin/env bash
set -euo pipefail

revision=$(git ls-remote https://github.com/v2fly/domain-list-community.git refs/heads/master | cut -f1)
if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Failed to read upstream revision' >&2
  exit 1
fi
previous="${RUNNER_TEMP:?}/geosite-previous.json"
printf '{}\n' > "$previous"
# An absent rules branch is normal on the first run; network/auth failures are not.
remote_ref=$(git ls-remote origin refs/heads/rules)
if [[ -n "$remote_ref" ]]; then
  git fetch --depth=1 origin rules
  git show FETCH_HEAD:manifest.json > "$previous" || printf '{}\n' > "$previous"
fi
changed=true
if [[ "${EVENT_NAME:-}" == 'schedule' ]]; then
  changed=$(node --input-type=module - "$previous" "$revision" "${GITHUB_SHA:?}" <<'JS'
import { readFileSync } from 'node:fs';
const [path, revision, projectRevision] = process.argv.slice(2);
const old = JSON.parse(readFileSync(path, 'utf8'));
console.log(old.upstream?.revision === revision && old.projectRevision === projectRevision ? 'false' : 'true');
JS
  )
fi
printf 'revision=%s\nchanged=%s\n' "$revision" "$changed" >> "${GITHUB_OUTPUT:?}"
if [[ "$changed" == false ]]; then
  printf 'Upstream and converter unchanged; skipped checkout, tests, build and deployment.\n' >> "${GITHUB_STEP_SUMMARY:?}"
fi
