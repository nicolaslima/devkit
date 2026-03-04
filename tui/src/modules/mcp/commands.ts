import { listMcpServers, toggleMcpServer } from "../../actions/mcp";
import { loadMcpCatalogState } from "../../adapters/catalog";
import { LOCAL_CODEX_CONFIG } from "../../constants";
import type { McpServerInfo } from "../../types";
import type { ModuleRuntimeContext } from "../runtime/types";

interface McpStateDeps {
  setMcpServers: (value: McpServerInfo[]) => void;
  setMcpModuleError: (value: string | null) => void;
}

interface McpToggleDeps {
  mcpServers: McpServerInfo[];
  mcpModuleError: string | null;
  currentIndex: number;
  refreshMcp: () => Promise<void>;
}

export interface McpCommands {
  refreshMcp: () => Promise<void>;
  toggleCurrent: () => Promise<void>;
}

export async function refreshMcpCommand(deps: McpStateDeps): Promise<void> {
  const catalog = await loadMcpCatalogState();
  if (!catalog.enabled) {
    deps.setMcpServers([]);
    deps.setMcpModuleError(catalog.error ?? "desabilitada com aviso");
    return;
  }

  deps.setMcpModuleError(null);
  const servers = await listMcpServers(LOCAL_CODEX_CONFIG);
  deps.setMcpServers(servers);
}

export async function toggleCurrentMcpCommand(
  deps: ModuleRuntimeContext & McpToggleDeps,
): Promise<void> {
  if (deps.mcpModuleError) {
    deps.appendLog(deps.mcpModuleError);
    return;
  }

  const server = deps.mcpServers[deps.currentIndex];
  if (!server) {
    deps.appendLog("nenhum MCP detectado");
    return;
  }

  if (
    !deps.requestLightConfirm(
      `mcp-toggle-${server.name}-${server.enabled ? "off" : "on"}`,
      `toggle MCP ${server.name}`,
    )
  ) {
    return;
  }

  await deps.runTask(`mcp ${server.name} -> ${server.enabled ? "off" : "on"}`, async () => {
    await toggleMcpServer(LOCAL_CODEX_CONFIG, server.name, !server.enabled);
    await deps.refreshMcp();
  });
}
