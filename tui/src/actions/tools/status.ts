import { loadToolsCatalogState, loadToolsCatalogStrict } from "../../adapters/catalog";
import { commandExists, runCommand } from "../../adapters/shell";
import type { ModuleCatalogState, ToolStatus } from "../../types";

async function resolveVersion(binary: string): Promise<string> {
  const installed = await commandExists(binary);
  if (!installed) {
    return "not installed";
  }

  const versionResult = await runCommand(`${binary} --version`, { timeoutMs: 20_000 });
  if (versionResult.code === 0) {
    return versionResult.stdout || "installed";
  }
  return "installed";
}

export async function getToolStatuses(): Promise<ToolStatus[]> {
  const catalog = await loadToolsCatalogStrict();
  const statuses: ToolStatus[] = [];

  for (const item of catalog) {
    const binary = item.name === "openspec" ? "openspec" : item.name;
    statuses.push({
      name: item.name,
      installed: await commandExists(binary),
      version: await resolveVersion(binary),
    });
  }

  return statuses;
}

export async function getToolStatusesState(): Promise<ModuleCatalogState<ToolStatus>> {
  const catalogState = await loadToolsCatalogState();
  if (!catalogState.enabled) {
    return {
      enabled: false,
      items: [],
      error: catalogState.error,
    };
  }

  const statuses: ToolStatus[] = [];
  for (const item of catalogState.items) {
    const binary = item.name === "openspec" ? "openspec" : item.name;
    statuses.push({
      name: item.name,
      installed: await commandExists(binary),
      version: await resolveVersion(binary),
    });
  }

  return {
    enabled: true,
    items: statuses,
  };
}
