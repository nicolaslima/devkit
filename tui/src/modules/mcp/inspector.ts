import type { McpServerInfo } from "../../types";
import { buildInspectorSections } from "../runtime/view";

export function buildMcpInspectorLines(
  mcpServers: McpServerInfo[],
  cursor: number,
  moduleError: string | null,
): string[] {
  if (moduleError) {
    return buildInspectorSections([
      { title: "Selection", lines: ["MCP module"] },
      { title: "Impact", lines: [moduleError] },
      { title: "Command", lines: ["Toggle disabled while module is unavailable"] },
    ]);
  }

  const server = mcpServers[cursor];
  if (!server) {
    return buildInspectorSections([
      { title: "Selection", lines: ["No MCP blocks found"] },
      { title: "Impact", lines: ["Nothing to toggle"] },
      { title: "Command", lines: ["Refresh MCP list"] },
    ]);
  }

  return buildInspectorSections([
    {
      title: "Selection",
      lines: [
        `Server ${server.name}`,
        `State ${server.enabled ? "enabled" : "disabled"}`,
        `Lines ${server.blockStartLine}-${server.blockEndLine}`,
      ],
    },
    {
      title: "Command",
      lines: [`t or Enter toggle ${server.enabled ? "OFF" : "ON"}`, `Header ${server.headerLine}`],
    },
    {
      title: "Impact",
      lines: ["Toggle uses block-level comment/uncomment only"],
    },
  ]);
}
