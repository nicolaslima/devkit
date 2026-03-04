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
  {"name":"devkit-linux-amd64","browser_download_url":"https://example.test/devkit-linux-amd64"}
]}
JSON
  exit 0
fi

if [[ "$url" == "https://example.test/devkit-linux-amd64" ]]; then
  if [[ -z "$out_path" ]]; then
    echo "missing output path" >&2
    exit 1
  fi
  cat >"$out_path" <<'BIN'
#!/usr/bin/env bash
echo "devkit mock smoke"
BIN
  chmod +x "$out_path"
  exit 0
fi

echo "unexpected curl url: $url" >&2
exit 1
EOF
chmod +x "$MOCK_BIN/curl"

HOME_DIR="$TMP_DIR/home"
mkdir -p "$HOME_DIR"
PATH="$MOCK_BIN:$PATH" HOME="$HOME_DIR" DEVKIT_OS="linux" DEVKIT_ARCH="amd64" bash "$ROOT_DIR/install.sh"

output="$("$HOME_DIR/.local/bin/devkit")"
if [[ "$output" != "devkit mock smoke" ]]; then
  echo "unexpected installed binary output: $output" >&2
  exit 1
fi

echo "install-smoke: ok"
