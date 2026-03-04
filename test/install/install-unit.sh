#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_DIR="$(mktemp -d)"
MOCK_BIN="$TMP_DIR/mock-bin"
trap 'rm -rf "$TMP_DIR"' EXIT
mkdir -p "$MOCK_BIN"

cat >"$MOCK_BIN/curl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

url=""
out_path=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -o)
      out_path="${2:-}"
      shift 2
      ;;
    -f|-s|-S|-L|-fsSL)
      shift
      ;;
    *)
      url="$1"
      shift
      ;;
  esac
done

if [[ "$url" == *"/releases/latest" ]]; then
  cat <<'JSON'
{"assets":[
  {"name":"devkit-darwin-arm64","browser_download_url":"https://example.test/devkit-darwin-arm64"},
  {"name":"devkit-linux-amd64","browser_download_url":"https://example.test/devkit-linux-amd64"}
]}
JSON
  exit 0
fi

if [[ "$url" == "https://example.test/devkit-darwin-arm64" || "$url" == "https://example.test/devkit-linux-amd64" ]]; then
  if [[ -z "$out_path" ]]; then
    echo "missing output path" >&2
    exit 1
  fi
  cat >"$out_path" <<'BIN'
#!/usr/bin/env bash
echo "devkit mock"
BIN
  chmod +x "$out_path"
  exit 0
fi

echo "unexpected curl url: $url" >&2
exit 1
EOF
chmod +x "$MOCK_BIN/curl"

HOME_ONE="$TMP_DIR/home-one"
mkdir -p "$HOME_ONE"
PATH="$MOCK_BIN:$PATH" HOME="$HOME_ONE" DEVKIT_OS="darwin" DEVKIT_ARCH="arm64" bash "$ROOT_DIR/install.sh"

TARGET_ONE="$HOME_ONE/.local/bin/devkit"
if [[ ! -x "$TARGET_ONE" ]]; then
  echo "expected installed binary at $TARGET_ONE" >&2
  exit 1
fi

if PATH="$MOCK_BIN:$PATH" HOME="$TMP_DIR/home-two" DEVKIT_OS="plan9" DEVKIT_ARCH="amd64" bash "$ROOT_DIR/install.sh"; then
  echo "install should fail for unsupported os" >&2
  exit 1
fi

echo "install-unit: ok"
