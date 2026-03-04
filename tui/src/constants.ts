import path from "node:path";

const home = process.env.HOME ?? "";
const cwd = process.cwd();
const projectRoot = path.basename(cwd) === "tui" ? path.resolve(cwd, "..") : cwd;

function uniqueCandidates(values: string[]): string[] {
  return [...new Set(values)];
}

export const APP_NAME = "devkit";
export const STATE_DIR = path.join(home, ".local", "state", APP_NAME);
export const AUDIT_LOG_PATH = path.join(STATE_DIR, "audit.log");
export const MAX_AUDIT_BYTES = 1024 * 1024;
export const MAX_AUDIT_FILES = 5;

export const LOCAL_CODEX_CONFIG = path.join(home, ".codex", "config.toml");
export const CODEX_BACKUP_KEEP = 3;

export const CATALOG_SKILLS_CANDIDATES = uniqueCandidates([
  path.resolve(projectRoot, "skills.toml"),
  path.resolve(cwd, "skills.toml"),
]);

export const CATALOG_TOOLS_CANDIDATES = uniqueCandidates([
  path.resolve(projectRoot, "tools.toml"),
  path.resolve(cwd, "tools.toml"),
]);

export const CATALOG_MCP_CANDIDATES = uniqueCandidates([
  path.resolve(projectRoot, "mcp.toml"),
  path.resolve(cwd, "mcp.toml"),
]);

export const REFERENCE_CONFIG_CANDIDATES = [
  path.resolve(projectRoot, "config-reference.toml"),
  path.resolve(projectRoot, "config.toml"),
  path.resolve(cwd, "config-reference.toml"),
  path.resolve(cwd, "config.toml"),
];

export const SKILL_INSTALL_DIRS = [
  path.join(home, ".codex", "skills"),
  path.join(home, ".agents", "skills"),
];

export const CWD_SCOPE = path.resolve(cwd);
export const HOME_SCOPE = path.resolve(home || cwd);

export const CODEX_CODESPACE_UPDATE_COMMAND =
  'sudo bash -c "curl -fsSL https://raw.githubusercontent.com/jsburckhardt/devcontainer-features/main/src/codex/install.sh | bash"';

export const SHORT_GENERIC_CATALOG_ERROR = "desabilitada com aviso";
