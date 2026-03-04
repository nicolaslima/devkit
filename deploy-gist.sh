#!/usr/bin/env bash
set -euo pipefail

TARGET_OWNER="nicolaslima"
TARGET_DESC="devkit-catalog"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
GIST_ID_FILE="$PROJECT_ROOT/.gist-id"
DRY_RUN=false
OVERRIDE_GIST_ID=""

CATALOG_FILES=(
  "skills.toml"
  "tools.toml"
  "mcp.toml"
  "config-reference.toml"
)

usage() {
  cat <<USAGE
Uso:
  bash deploy-gist.sh [--dry-run] [--gist-id <id>] [--owner <owner>] [--description <desc>]

Variaveis obrigatorias:
  GH_PAT_TOKEN   Token pessoal para autenticar no GitHub CLI

Comportamento:
  - Cria o Gist secreto do catalogo se nao existir
  - Atualiza o mesmo Gist em execucoes seguintes
  - Publica somente os arquivos de catalogo da raiz
USAGE
}

log() {
  printf '[deploy-gist] %s\n' "$*" >&2
}

fail() {
  printf '[deploy-gist][erro] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio ausente: $1"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --gist-id)
      OVERRIDE_GIST_ID="${2:-}"
      [[ -n "$OVERRIDE_GIST_ID" ]] || fail "--gist-id exige valor"
      shift 2
      ;;
    --owner)
      TARGET_OWNER="${2:-}"
      [[ -n "$TARGET_OWNER" ]] || fail "--owner exige valor"
      shift 2
      ;;
    --description)
      TARGET_DESC="${2:-}"
      [[ -n "$TARGET_DESC" ]] || fail "--description exige valor"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "argumento invalido: $1"
      ;;
  esac
done

require_cmd gh
require_cmd python3

[[ -n "${GH_PAT_TOKEN:-}" ]] || fail "GH_PAT_TOKEN nao definido no ambiente"
[[ -d "$PROJECT_ROOT" ]] || fail "diretorio do projeto nao encontrado: $PROJECT_ROOT"

ensure_catalog_files() {
  local rel
  for rel in "${CATALOG_FILES[@]}"; do
    [[ -f "$PROJECT_ROOT/$rel" ]] || fail "arquivo de catalogo ausente: $rel"
  done
}

ensure_gh_auth() {
  if gh auth status >/dev/null 2>&1; then
    return 0
  fi
  log "autenticando no gh via GH_PAT_TOKEN"
  printf '%s\n' "$GH_PAT_TOKEN" | gh auth login --with-token >/dev/null
  gh auth status >/dev/null 2>&1 || fail "falha ao autenticar no GitHub CLI"
}

validate_gist_id() {
  local id="$1"
  gh api "/gists/$id" --jq '.id' >/dev/null 2>&1
}

gist_description_matches() {
  local id="$1"
  local desc
  desc="$(gh api "/gists/$id" --jq '.description' 2>/dev/null || true)"
  [[ "$desc" == "$TARGET_DESC" ]]
}

find_gist_by_description() {
  gh api "/users/$TARGET_OWNER/gists?per_page=100" \
    --jq ".[] | select(.description == \"$TARGET_DESC\") | .id" | head -n 1
}

resolve_gist_id() {
  local gist_id=""

  if [[ -n "$OVERRIDE_GIST_ID" ]]; then
    if validate_gist_id "$OVERRIDE_GIST_ID"; then
      echo "$OVERRIDE_GIST_ID"
      return 0
    fi
    fail "gist id informado por --gist-id nao e acessivel: $OVERRIDE_GIST_ID"
  fi

  if [[ -f "$GIST_ID_FILE" ]]; then
    gist_id="$(tr -d '[:space:]' < "$GIST_ID_FILE")"
    if [[ -n "$gist_id" ]] && validate_gist_id "$gist_id" && gist_description_matches "$gist_id"; then
      echo "$gist_id"
      return 0
    fi
    log "arquivo .gist-id existe, mas id nao corresponde ao gist '$TARGET_DESC'; ignorando"
  fi

  gist_id="$(find_gist_by_description || true)"
  if [[ -n "$gist_id" ]]; then
    printf '%s\n' "$gist_id" > "$GIST_ID_FILE"
    echo "$gist_id"
    return 0
  fi

  echo ""
}

fetch_remote_files() {
  local gist_id="$1"
  local out_file="$2"
  gh api "/gists/$gist_id" --jq '.files | keys[]' > "$out_file" || fail "falha ao obter arquivos remotos do gist: $gist_id"
}

build_payload() {
  local mode="$1"
  local remote_files_list="$2"
  local output_json="$3"

  local local_files_tmp
  local_files_tmp="$(mktemp "$PROJECT_ROOT/deploy-gist.sh.tmp.local.XXXXXX")"
  trap 'rm -f -- "${local_files_tmp:-}"' RETURN
  printf '%s\n' "${CATALOG_FILES[@]}" > "$local_files_tmp"

  python3 - "$mode" "$PROJECT_ROOT" "$TARGET_DESC" "$local_files_tmp" "$remote_files_list" "$output_json" <<'PY'
import json
import sys
from pathlib import Path

mode = sys.argv[1]
project_root = Path(sys.argv[2])
description = sys.argv[3]
local_files_path = Path(sys.argv[4])
remote_files_path = Path(sys.argv[5])
output_json = Path(sys.argv[6])

local_files = [line.strip() for line in local_files_path.read_text(encoding="utf-8").splitlines() if line.strip()]
remote_files = [line.strip() for line in remote_files_path.read_text(encoding="utf-8").splitlines() if line.strip()]

payload = {
    "description": description,
    "files": {},
}
if mode == "create":
    payload["public"] = False

local_names = set(local_files)

for rel in local_files:
    full = project_root / rel
    payload["files"][rel] = {"content": full.read_text(encoding="utf-8")}

if mode == "patch":
    for remote_name in remote_files:
        if remote_name and remote_name not in local_names:
            payload["files"][remote_name] = {"content": None}

output_json.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
PY
}

create_gist() {
  local payload_file="$1"
  local gist_id
  gist_id="$(gh api /gists -X POST --input "$payload_file" --jq '.id')" || fail "falha ao criar gist"
  [[ -n "$gist_id" ]] || fail "falha ao criar gist"
  printf '%s\n' "$gist_id" > "$GIST_ID_FILE"
  echo "$gist_id"
}

patch_gist() {
  local gist_id="$1"
  local payload_file="$2"
  gh api "/gists/$gist_id" -X PATCH --input "$payload_file" >/dev/null || fail "falha ao atualizar gist: $gist_id"
}

main() {
  ensure_catalog_files
  ensure_gh_auth

  local gist_id mode
  local remote_files_tmp payload_tmp
  remote_files_tmp="$(mktemp "$PROJECT_ROOT/deploy-gist.sh.tmp.remote.XXXXXX")"
  payload_tmp="$(mktemp "$PROJECT_ROOT/deploy-gist.sh.tmp.payload.XXXXXX")"
  trap 'rm -f -- "${remote_files_tmp:-}" "${payload_tmp:-}"' EXIT

  gist_id="$(resolve_gist_id)"
  if [[ -z "$gist_id" ]]; then
    mode="create"
    : > "$remote_files_tmp"
  else
    mode="patch"
    fetch_remote_files "$gist_id" "$remote_files_tmp"
  fi

  build_payload "$mode" "$remote_files_tmp" "$payload_tmp"

  if [[ "$DRY_RUN" == true ]]; then
    log "dry-run ativo"
    log "modo: $mode"
    if [[ -n "$gist_id" ]]; then
      log "gist alvo: $gist_id"
    else
      log "gist alvo: sera criado"
    fi
    log "owner: $TARGET_OWNER"
    log "descricao: $TARGET_DESC"
    log "arquivos:"
    for rel in "${CATALOG_FILES[@]}"; do
      log "  - $rel"
    done
    return 0
  fi

  if [[ "$mode" == "create" ]]; then
    log "criando gist secreto '$TARGET_DESC'"
    gist_id="$(create_gist "$payload_tmp")"
  else
    log "atualizando gist existente: $gist_id"
    patch_gist "$gist_id" "$payload_tmp"
  fi

  local gist_url
  gist_url="$(gh api "/gists/$gist_id" --jq '.html_url')"

  log "concluido"
  log "gist_id: $gist_id"
  log "gist_url: $gist_url"
}

main "$@"
