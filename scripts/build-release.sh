#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_PATH="$ROOT_DIR/scripts/release-assets-manifest.txt"
ENTRY_PATH="$ROOT_DIR/tui/src/index.tsx"
OUTPUT_DIR="$ROOT_DIR/dist/release"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required to build release assets" >&2
  exit 1
fi

host_os="$(uname -s | tr '[:upper:]' '[:lower:]')"
host_arch_raw="$(uname -m | tr '[:upper:]' '[:lower:]')"
host_arch="$host_arch_raw"
if [[ "$host_arch_raw" == "x86_64" ]]; then
  host_arch="x64"
fi
if [[ "$host_arch_raw" == "amd64" ]]; then
  host_arch="x64"
fi
host_target="bun-${host_os}-${host_arch}"

if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo "manifest not found: $MANIFEST_PATH" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

while IFS= read -r row; do
  line="${row#"${row%%[![:space:]]*}"}"
  if [[ -z "$line" || "$line" == \#* ]]; then
    continue
  fi

  asset=""
  target=""
  read -r asset target _ <<<"$line"

  if [[ -z "$asset" || -z "$target" ]]; then
    echo "invalid manifest row: $row" >&2
    exit 1
  fi

  if [[ "${DEVKIT_BUILD_ALL:-0}" != "1" && "$target" != "$host_target" ]]; then
    echo "skipping $asset ($target) on host target $host_target"
    continue
  fi

  out_file="$OUTPUT_DIR/$asset"
  echo "building $asset ($target)"
  bun build "$ENTRY_PATH" --compile --target="$target" --outfile "$out_file"
  chmod +x "$out_file"

  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$out_file" >"$out_file.sha256"
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$out_file" >"$out_file.sha256"
  else
    echo "warning: no sha256 tool available (shasum/sha256sum)" >&2
  fi
done <"$MANIFEST_PATH"
