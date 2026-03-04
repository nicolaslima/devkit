import type { McpServerInfo } from "../../types";
import type { ScreenRow } from "../runtime/view";

export function buildMcpWorkspaceRows(
  mcpServers: McpServerInfo[],
  cursor: number,
  moduleError: string | null,
): ScreenRow[] {
  if (moduleError) {
    return [{ key: "mcp-disabled", line: `MCP: ${moduleError}`, active: true }];
  }

  if (mcpServers.length === 0) {
    return [
      { key: "mcp-empty", line: "No MCP blocks found in ~/.codex/config.toml", active: true },
    ];
  }

  return mcpServers.map((server, index) => ({
    key: server.name,
    line: `[${server.enabled ? "on " : "off"}] ${server.name}`,
    active: index === cursor,
  }));
}
