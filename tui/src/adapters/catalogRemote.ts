import path from "node:path";
import { CATALOG_CACHE_DIR } from "../constants";
import { ensureDir, pathExists, readTextFile, writeTextFile } from "./fs";
import { resolveCatalogSource } from "../platform/catalog/source";

export type CatalogRemoteFile = "skills.toml" | "tools.toml" | "mcp.toml";

function getCachePath(fileName: CatalogRemoteFile): string {
  return path.join(CATALOG_CACHE_DIR, fileName);
}

async function readFirstExisting(paths: string[]): Promise<string | undefined> {
  for (const candidate of paths) {
    if (await pathExists(candidate)) {
      return readTextFile(candidate);
    }
  }
  return undefined;
}

async function fetchRemoteCatalog(fileName: CatalogRemoteFile): Promise<string> {
  const source = await resolveCatalogSource();
  const response = await fetch(`${source.rawBaseUrl}/${fileName}`);

  if (!response.ok) {
    throw new Error(`catalog fetch failed: ${response.status}`);
  }

  const content = await response.text();
  if (!content.trim()) {
    throw new Error("catalog fetch failed: empty");
  }

  return content;
}

export async function readCatalogRemoteFirst(
  fileName: CatalogRemoteFile,
  localCandidates: string[],
): Promise<string> {
  const cachePath = getCachePath(fileName);

  try {
    const remoteContent = await fetchRemoteCatalog(fileName);
    await ensureDir(CATALOG_CACHE_DIR);
    await writeTextFile(cachePath, remoteContent);
    return remoteContent;
  } catch (remoteError) {
    if (await pathExists(cachePath)) {
      return readTextFile(cachePath);
    }

    const localContent = await readFirstExisting(localCandidates);
    if (localContent) {
      return localContent;
    }

    throw remoteError;
  }
}
