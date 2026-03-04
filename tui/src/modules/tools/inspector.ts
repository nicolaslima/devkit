import type { ToolName, ToolStatus } from "../../types";
import { buildInspectorSections } from "../runtime/view";

export function buildToolsInspectorLines(
  toolStatuses: ToolStatus[],
  selectedTools: Set<ToolName>,
  cursor: number,
  moduleError: string | null,
): string[] {
  if (moduleError) {
    return buildInspectorSections([
      { title: "Selection", lines: ["Tools module"] },
      { title: "Impact", lines: [moduleError] },
      { title: "Command", lines: ["Install/update/uninstall disabled"] },
    ]);
  }

  const current = toolStatuses[cursor];
  if (!current) {
    return buildInspectorSections([
      { title: "Selection", lines: ["No tools loaded"] },
      { title: "Impact", lines: ["Nothing selected"] },
      { title: "Command", lines: ["Refresh catalog"] },
    ]);
  }

  return buildInspectorSections([
    {
      title: "Selection",
      lines: [
        `Tool ${current.name}`,
        `Status ${current.installed ? "installed" : "not-installed"}`,
        `Version ${current.version}`,
        `Selected tools ${selectedTools.size}`,
      ],
    },
    {
      title: "Command",
      lines: [
        "Space/Enter toggle selection",
        "i install selected",
        "u update selected",
        "x uninstall selected (destructive)",
        "c configure selected MCP",
      ],
    },
    {
      title: "Impact",
      lines: ["Batch execution uses best-effort with final N/T summary"],
    },
  ]);
}
