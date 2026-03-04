import { loadToolsCatalogStrict } from "../../adapters/catalog";
import { removePath } from "../../adapters/fs";
import { LOCAL_CODEX_CONFIG } from "../../constants";
import { removeMcpBlock, toggleMcpServer } from "../mcp";
import type { BatchSummary, ToolName } from "../../types";
import { resolveToolCleanupPreview } from "./cleanup";
import { runToolCommand, summaryToken, toToolCatalogMap, uniqueToolQueue } from "./shared";
import type { Logger } from "./shared";

export async function installOrUpdateTools(
  tools: ToolName[],
  log: Logger,
  mode: "install" | "update" = "install",
): Promise<BatchSummary> {
  const queue = uniqueToolQueue(tools);
  const catalog = await loadToolsCatalogStrict();
  const byName = toToolCatalogMap(catalog);
  const failedNames: string[] = [];

  for (const tool of queue) {
    const toolConfig = byName.get(tool);
    if (!toolConfig) {
      failedNames.push(tool);
      continue;
    }

    const command = mode === "install" ? toolConfig.install : toolConfig.update;
    const ok = await runToolCommand(command);
    if (!ok) {
      failedNames.push(tool);
      continue;
    }

    log(`tools ${mode} ok: ${tool}`);
  }

  const token = summaryToken(failedNames.length, queue.length);
  log(`tools ${mode} summary ${token}`);
  if (failedNames.length > 0) {
    log(`tools ${mode} failed: ${failedNames.join(", ")}`);
  }

  return {
    total: queue.length,
    failed: failedNames.length,
    token,
    failedNames,
  };
}

export async function uninstallTools(tools: ToolName[], log: Logger): Promise<BatchSummary> {
  const queue = uniqueToolQueue(tools);
  const catalog = await loadToolsCatalogStrict();
  const byName = toToolCatalogMap(catalog);
  const failedNames: string[] = [];
  const allWarnings: string[] = [];

  for (const tool of queue) {
    const toolConfig = byName.get(tool);
    if (!toolConfig) {
      failedNames.push(tool);
      continue;
    }

    const preview = await resolveToolCleanupPreview(tool);
    allWarnings.push(...preview.warnings);
    let toolFailed = false;

    const uninstallOk = await runToolCommand(toolConfig.uninstall);
    if (!uninstallOk) {
      toolFailed = true;
    }

    for (const entry of preview.matches) {
      try {
        await removePath(entry);
      } catch {
        toolFailed = true;
      }
    }

    try {
      await removeMcpBlock(LOCAL_CODEX_CONFIG, tool);
    } catch {
      toolFailed = true;
    }

    if (toolFailed) {
      failedNames.push(tool);
      continue;
    }

    log(`tools uninstall ok: ${tool}`);
  }

  const dedupedWarnings = [...new Set(allWarnings)];
  const token = summaryToken(failedNames.length, queue.length);

  log(`tools uninstall summary ${token}`);
  if (dedupedWarnings.length > 0) {
    log(`tools cleanup warnings: ${dedupedWarnings.join(", ")}`);
  }
  if (failedNames.length > 0) {
    log(`tools uninstall failed: ${failedNames.join(", ")}`);
  }

  return {
    total: queue.length,
    failed: failedNames.length,
    token,
    failedNames,
    warnings: dedupedWarnings,
  };
}

export async function installOrUpdateTool(
  tool: ToolName,
  log: Logger,
  mode: "install" | "update" = "install",
): Promise<BatchSummary> {
  return installOrUpdateTools([tool], log, mode);
}

export async function uninstallTool(tool: ToolName, log: Logger): Promise<BatchSummary> {
  return uninstallTools([tool], log);
}

export async function configureToolWithCodex(tool: ToolName, log: Logger): Promise<void> {
  await toggleMcpServer(LOCAL_CODEX_CONFIG, tool, true);
  log(`tool ${tool}: codex configured`);
}

export async function configureToolsWithCodex(tools: ToolName[], log: Logger): Promise<BatchSummary> {
  const queue = uniqueToolQueue(tools);
  const failedNames: string[] = [];

  for (const tool of queue) {
    try {
      await configureToolWithCodex(tool, log);
    } catch {
      failedNames.push(tool);
    }
  }

  const token = summaryToken(failedNames.length, queue.length);
  log(`tools configure summary ${token}`);
  if (failedNames.length > 0) {
    log(`tools configure failed: ${failedNames.join(", ")}`);
  }

  return {
    total: queue.length,
    failed: failedNames.length,
    token,
    failedNames,
  };
}
