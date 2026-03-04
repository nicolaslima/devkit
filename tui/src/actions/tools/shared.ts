import type { ToolCatalogItem, ToolName } from "../../types";
import { runCommand } from "../../adapters/shell";

export type Logger = (line: string) => void;

export function summaryToken(failed: number, total: number): string {
  return `${failed}/${total}`;
}

export function uniqueToolQueue(tools: ToolName[]): ToolName[] {
  return [...new Set(tools)];
}

export function toToolCatalogMap(catalog: ToolCatalogItem[]): Map<ToolName, ToolCatalogItem> {
  return new Map<ToolName, ToolCatalogItem>(catalog.map((item) => [item.name, item]));
}

export async function runToolCommand(command: string): Promise<boolean> {
  const result = await runCommand(command, { timeoutMs: 600_000 });
  return result.code === 0;
}
