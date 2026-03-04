import {
  CATALOG_DEFAULT_GIST_ID,
  CATALOG_DEFAULT_OWNER,
  CATALOG_GIST_ID_ENV_KEYS,
  CATALOG_OWNER_ENV_KEYS,
  CATALOG_SOURCE_CANDIDATES,
} from "../../constants";
import { pathExists, readTextFile } from "../../adapters/fs";

export interface CatalogSource {
  owner: string;
  gistId: string;
  rawBaseUrl: string;
  skillsUrl: string;
  toolsUrl: string;
  mcpUrl: string;
  configReferenceUrl: string;
}

interface CatalogSourceOverride {
  owner?: string;
  gistId?: string;
}

function normalizeText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized;
}

function parseQuoted(value: string): string | undefined {
  const trimmed = value.trim();
  if (!(trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return undefined;
  }
  return normalizeText(trimmed.slice(1, -1).replace(/\\"/g, '"'));
}

function parseLiteralValue(raw: string): string | undefined {
  if (raw.includes("#")) {
    const [head] = raw.split("#", 1);
    if (!head) {
      return undefined;
    }
    return parseLiteralValue(head);
  }

  const parsedQuoted = parseQuoted(raw);
  if (parsedQuoted) {
    return parsedQuoted;
  }

  return normalizeText(raw);
}

function readEnv(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = normalizeText(process.env[key]);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function parseLocalSourceOverride(content: string): CatalogSourceOverride {
  const output: CatalogSourceOverride = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const assignMatch = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!assignMatch?.[1] || !assignMatch[2]) {
      continue;
    }

    const key = assignMatch[1];
    const value = parseLiteralValue(assignMatch[2]);
    if (!value) {
      continue;
    }

    if (key === "owner") {
      output.owner = value;
      continue;
    }

    if (key === "gist_id" || key === "gistId") {
      output.gistId = value;
    }
  }

  return output;
}

async function readLocalSourceOverride(): Promise<CatalogSourceOverride> {
  for (const candidate of CATALOG_SOURCE_CANDIDATES) {
    if (!(await pathExists(candidate))) {
      continue;
    }

    const content = await readTextFile(candidate);
    return parseLocalSourceOverride(content);
  }

  return {};
}

function buildCatalogSource(owner: string, gistId: string): CatalogSource {
  const rawBaseUrl = `https://gist.githubusercontent.com/${owner}/${gistId}/raw`;
  return {
    owner,
    gistId,
    rawBaseUrl,
    skillsUrl: `${rawBaseUrl}/skills.toml`,
    toolsUrl: `${rawBaseUrl}/tools.toml`,
    mcpUrl: `${rawBaseUrl}/mcp.toml`,
    configReferenceUrl: `${rawBaseUrl}/config-reference.toml`,
  };
}

export async function resolveCatalogSource(): Promise<CatalogSource> {
  let owner = CATALOG_DEFAULT_OWNER;
  let gistId = CATALOG_DEFAULT_GIST_ID;

  owner = readEnv(CATALOG_OWNER_ENV_KEYS) ?? owner;
  gistId = readEnv(CATALOG_GIST_ID_ENV_KEYS) ?? gistId;

  const localOverride = await readLocalSourceOverride();
  owner = localOverride.owner ?? owner;
  gistId = localOverride.gistId ?? gistId;

  return buildCatalogSource(owner, gistId);
}
