#!/usr/bin/env bash
set -euo pipefail

APP_NAME="devkit"
RUNTIME_DIR="${TMPDIR:-/tmp}/${APP_NAME}-runtime"

GIST_ID="${PERSONAL_SKILLS_GIST_ID:-${GIST_ID:-}}"
GIST_OWNER="${PERSONAL_SKILLS_GIST_OWNER:-${GIST_OWNER:-}}"

usage() {
  cat <<USAGE
Usage:
  PERSONAL_SKILLS_GIST_ID=<gist_id> PERSONAL_SKILLS_GIST_OWNER=<owner> bash launcher.sh
  bash launcher.sh --gist-id <gist_id> --owner <owner>
USAGE
}

require_opt_value() {
  local opt_name="$1"
  local opt_value="${2:-}"
  if [[ -z "$opt_value" ]]; then
    echo "desabilitada com aviso" >&2
    echo "opcao sem valor: $opt_name" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gist-id)
      require_opt_value "$1" "${2:-}"
      GIST_ID="$2"
      shift 2
      ;;
    --owner)
      require_opt_value "$1" "${2:-}"
      GIST_OWNER="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "desabilitada com aviso" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$GIST_ID" || -z "$GIST_OWNER" ]]; then
  echo "desabilitada com aviso" >&2
  usage
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "desabilitada com aviso" >&2
  exit 1
fi

RAW_BASE="https://gist.githubusercontent.com/${GIST_OWNER}/${GIST_ID}/raw"
MANIFEST_URL="${RAW_BASE}/manifest.json"

rm -rf "$RUNTIME_DIR"
mkdir -p "$RUNTIME_DIR"

fetch() {
  local url="$1"
  local out="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$out"
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -qO "$out" "$url"
    return
  fi

  echo "desabilitada com aviso" >&2
  exit 1
}

encode_remote_name() {
  local logical_path="$1"
  python3 - "$logical_path" <<'PY'
import sys
import urllib.parse

print(urllib.parse.quote(sys.argv[1], safe="._-"))
PY
}

fetch "$MANIFEST_URL" "$RUNTIME_DIR/manifest.json"

if ! command -v python3 >/dev/null 2>&1; then
  echo "desabilitada com aviso" >&2
  exit 1
fi

MANIFEST_LINES=()
while IFS= read -r line; do
  MANIFEST_LINES+=("$line")
done < <(python3 - <<'PY' "$RUNTIME_DIR/manifest.json"
import json
import sys
from pathlib import Path

manifest = json.loads(Path(sys.argv[1]).read_text())
required = ["app", "version", "entry", "files", "min_bun"]
for key in required:
    if key not in manifest:
        raise SystemExit(1)

print(manifest["entry"])
for file_path in manifest["files"]:
    print(file_path)
PY
)

if [[ ${#MANIFEST_LINES[@]} -lt 2 ]]; then
  echo "desabilitada com aviso" >&2
  exit 1
fi

ENTRY="${MANIFEST_LINES[0]}"
FILES=("${MANIFEST_LINES[@]:1}")

for file_path in "${FILES[@]}"; do
  remote_name="$(encode_remote_name "tui/$file_path")"
  mkdir -p "$RUNTIME_DIR/$(dirname "$file_path")"
  fetch "${RAW_BASE}/${remote_name}" "$RUNTIME_DIR/$file_path"
done

if [[ ! -f "$RUNTIME_DIR/$ENTRY" ]]; then
  echo "desabilitada com aviso" >&2
  exit 1
fi

cd "$RUNTIME_DIR"
exec bun run "$ENTRY"
