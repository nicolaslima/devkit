import type { ToolName, ToolStatus } from "../../types";
import type { ScreenRow } from "../runtime/view";

export function buildToolsWorkspaceRows(
  toolStatuses: ToolStatus[],
  selectedTools: Set<ToolName>,
  cursor: number,
  moduleError: string | null,
): ScreenRow[] {
  if (moduleError) {
    return [{ key: "tools-disabled", line: `Tools: ${moduleError}`, active: true }];
  }

  if (toolStatuses.length === 0) {
    return [{ key: "tools-empty", line: "No tools loaded", active: true }];
  }

  return toolStatuses.map((status, index) => {
    const selected = selectedTools.has(status.name);
    const installed = status.installed ? "installed" : "not-installed";
    return {
      key: status.name,
      line: `${selected ? "[x]" : "[ ]"} ${status.name} (${installed})`,
      active: index === cursor,
    };
  });
}
