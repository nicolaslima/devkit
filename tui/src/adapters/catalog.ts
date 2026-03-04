import {
  CATALOG_MCP_CANDIDATES,
  CATALOG_SKILLS_CANDIDATES,
  CATALOG_TOOLS_CANDIDATES,
  SHORT_GENERIC_CATALOG_ERROR,
} from "../constants";
import {
  parseMcpCatalogRows,
  parseSkillsCatalogRows,
  parseToolsCatalogRows,
} from "../platform/catalog/schema";
import type {
  McpTemplateItem,
  ModuleCatalogState,
  SkillCatalogItem,
  ToolCatalogItem,
} from "../types";
import { type CatalogRemoteFile, readCatalogRemoteFirst } from "./catalogRemote";

type TomlRow = Record<string, unknown>;

function parseQuoted(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
    return null;
  }

  return trimmed.slice(1, -1).replace(/\\"/g, '"');
}

function parseStringArrayInline(input: string): string[] | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }

  const body = trimmed.slice(1, -1).trim();
  if (body.length === 0) {
    return [];
  }

  const parts = body.split(",").map((item) => item.trim());
  const result: string[] = [];

  for (const part of parts) {
    const parsed = parseQuoted(part);
    if (!parsed) {
      return null;
    }
    result.push(parsed);
  }

  return result;
}

function parseArrayTable(content: string, table: string): TomlRow[] {
  const lines = content.split(/\r?\n/);
  const header = `[[${table}]]`;
  const rows: TomlRow[] = [];
  let current: TomlRow | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? "";
    const line = raw.trim();

    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    if (line === header) {
      if (current) {
        rows.push(current);
      }
      current = {};
      continue;
    }

    if (!current) {
      continue;
    }

    const assignMatch = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!assignMatch?.[1] || !assignMatch[2]) {
      throw new Error(SHORT_GENERIC_CATALOG_ERROR);
    }

    const key = assignMatch[1];
    const valueRaw = assignMatch[2].trim();

    if (valueRaw.startsWith('"""')) {
      if (valueRaw === '"""') {
        const blockLines: string[] = [];
        let closed = false;

        for (let inner = index + 1; inner < lines.length; inner += 1) {
          const blockLine = lines[inner] ?? "";
          if (blockLine.trim() === '"""') {
            index = inner;
            closed = true;
            break;
          }
          blockLines.push(blockLine);
        }

        if (!closed) {
          throw new Error(SHORT_GENERIC_CATALOG_ERROR);
        }

        current[key] = blockLines.join("\n").trim();
        continue;
      }

      if (valueRaw.endsWith('"""') && valueRaw.length >= 6) {
        current[key] = valueRaw.slice(3, -3).trim();
        continue;
      }

      throw new Error(SHORT_GENERIC_CATALOG_ERROR);
    }

    if (valueRaw.startsWith("[")) {
      const parsedArray = parseStringArrayInline(valueRaw);
      if (!parsedArray) {
        throw new Error(SHORT_GENERIC_CATALOG_ERROR);
      }
      current[key] = parsedArray;
      continue;
    }

    const parsedString = parseQuoted(valueRaw);
    if (parsedString === null) {
      throw new Error(SHORT_GENERIC_CATALOG_ERROR);
    }

    current[key] = parsedString;
  }

  if (current) {
    rows.push(current);
  }

  return rows;
}

async function readCatalog(
  logicalFile: CatalogRemoteFile,
  localCandidates: string[],
): Promise<string> {
  try {
    return await readCatalogRemoteFirst(logicalFile, localCandidates);
  } catch {
    throw new Error(SHORT_GENERIC_CATALOG_ERROR);
  }
}

async function loadCatalogState<T>(loader: () => Promise<T[]>): Promise<ModuleCatalogState<T>> {
  try {
    const items = await loader();
    return {
      enabled: true,
      items,
    };
  } catch {
    return {
      enabled: false,
      items: [],
      error: SHORT_GENERIC_CATALOG_ERROR,
    };
  }
}

export async function loadSkillsCatalogState(): Promise<ModuleCatalogState<SkillCatalogItem>> {
  return loadCatalogState(async () => {
    const content = await readCatalog("skills.toml", CATALOG_SKILLS_CANDIDATES);
    const parsed = parseArrayTable(content, "skill");
    return parseSkillsCatalogRows(parsed);
  });
}

export async function loadToolsCatalogState(): Promise<ModuleCatalogState<ToolCatalogItem>> {
  return loadCatalogState(async () => {
    const content = await readCatalog("tools.toml", CATALOG_TOOLS_CANDIDATES);
    const parsed = parseArrayTable(content, "tool");
    return parseToolsCatalogRows(parsed);
  });
}

export async function loadMcpCatalogState(): Promise<ModuleCatalogState<McpTemplateItem>> {
  return loadCatalogState(async () => {
    const content = await readCatalog("mcp.toml", CATALOG_MCP_CANDIDATES);
    const parsed = parseArrayTable(content, "mcp");
    return parseMcpCatalogRows(parsed);
  });
}

export async function loadSkillsCatalogStrict(): Promise<SkillCatalogItem[]> {
  const state = await loadSkillsCatalogState();
  if (!state.enabled) {
    throw new Error(SHORT_GENERIC_CATALOG_ERROR);
  }
  return state.items;
}

export async function loadToolsCatalogStrict(): Promise<ToolCatalogItem[]> {
  const state = await loadToolsCatalogState();
  if (!state.enabled) {
    throw new Error(SHORT_GENERIC_CATALOG_ERROR);
  }
  return state.items;
}

export async function loadMcpCatalogStrict(): Promise<McpTemplateItem[]> {
  const state = await loadMcpCatalogState();
  if (!state.enabled) {
    throw new Error(SHORT_GENERIC_CATALOG_ERROR);
  }
  return state.items;
}
