#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="${DEVKIT_REPO_OWNER:-nicolaslima}"
REPO_NAME="${DEVKIT_REPO_NAME:-devkit}"
RELEASE_API_URL="${DEVKIT_RELEASE_API_URL:-https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest}"
INSTALL_HOME="${DEVKIT_INSTALL_HOME:-${HOME:-}}"

if [[ -z "$INSTALL_HOME" ]]; then
  echo "HOME is not set" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

os_raw="${DEVKIT_OS:-$(uname -s)}"
arch_raw="${DEVKIT_ARCH:-$(uname -m)}"
os="$(printf '%s' "$os_raw" | tr '[:upper:]' '[:lower:]')"
arch="$(printf '%s' "$arch_raw" | tr '[:upper:]' '[:lower:]')"

case "$os" in
  darwin|linux)
    ;;
  *)
    echo "unsupported os: $os" >&2
    exit 1
    ;;
esac

case "$arch" in
  x86_64|amd64)
    arch="amd64"
    ;;
  aarch64|arm64)
    arch="arm64"
    ;;
  *)
    echo "unsupported arch: $arch" >&2
    exit 1
    ;;
esac

asset_name="devkit-${os}-${arch}"

release_json="$(curl -fsSL "$RELEASE_API_URL")"
asset_url="$(
  RELEASE_JSON="$release_json" ASSET_NAME="$asset_name" python3 - <<'PY'
import json
import os
import sys

asset_name = os.environ["ASSET_NAME"]
payload = json.loads(os.environ["RELEASE_JSON"])

for asset in payload.get("assets", []):
    if asset.get("name") == asset_name and asset.get("browser_download_url"):
        print(asset["browser_download_url"])
        raise SystemExit(0)

raise SystemExit(1)
PY
)"

if [[ -z "$asset_url" ]]; then
  echo "release asset not found: $asset_name" >&2
  exit 1
fi

bin_dir="${INSTALL_HOME}/.local/bin"
target_path="${bin_dir}/devkit"
tmp_dir="$(mktemp -d)"
tmp_asset="${tmp_dir}/${asset_name}"
trap 'rm -rf "$tmp_dir"' EXIT

curl -fsSL "$asset_url" -o "$tmp_asset"
mkdir -p "$bin_dir"
install -m 0755 "$tmp_asset" "$target_path"

echo "installed devkit -> $target_path"
