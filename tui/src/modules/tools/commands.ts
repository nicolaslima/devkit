export type ToolActionMode = "install" | "update" | "configure" | "uninstall";

import {
  configureToolsWithCodex,
  getToolStatusesState,
  installOrUpdateTools,
  resolveToolsCleanupPreview,
  uninstallTools,
} from "../../actions/tools";
import type { ToolName, ToolStatus } from "../../types";
import type { ModuleRuntimeContext } from "../runtime/types";

interface ToolsStateDeps {
  setToolStatuses: (value: ToolStatus[]) => void;
  setToolsModuleError: (value: string | null) => void;
  setSelectedTools: (value: Set<ToolName> | ((prev: Set<ToolName>) => Set<ToolName>)) => void;
}

interface ToolsExecutionDeps {
  toolsModuleError: string | null;
  toolStatuses: ToolStatus[];
  selectedTools: Set<ToolName>;
  refreshTools: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  setConfirmAction: (
    value: {
      title: string;
      details: string[];
      run: () => Promise<void>;
    } | null,
  ) => void;
  setConfirmFocusConfirm: (value: boolean) => void;
}

interface OpenSpecDeps {
  refreshTools: () => Promise<void>;
  refreshMcp: () => Promise<void>;
}

export interface ToolsCommands {
  refreshTools: () => Promise<void>;
  executeSelected: (mode: ToolActionMode) => Promise<void>;
  installOpenSpecAndConfigure: () => Promise<void>;
}

export async function refreshToolsCommand(deps: ToolsStateDeps): Promise<void> {
  const state = await getToolStatusesState();
  if (!state.enabled) {
    deps.setToolStatuses([]);
    deps.setToolsModuleError(state.error ?? "desabilitada com aviso");
    deps.setSelectedTools(new Set());
    return;
  }

  deps.setToolsModuleError(null);
  const statuses = state.items;
  deps.setToolStatuses(statuses);
  deps.setSelectedTools((previous) => {
    const next = new Set<ToolName>();
    for (const tool of previous) {
      if (statuses.some((status) => status.name === tool)) {
        next.add(tool);
      }
    }
    return next;
  });
}

export function selectedToolQueueFromState(
  toolStatuses: ToolStatus[],
  selectedTools: Set<ToolName>,
): ToolName[] {
  return toolStatuses
    .filter((status) => selectedTools.has(status.name))
    .map((status) => status.name);
}

export async function executeSelectedToolsCommand(
  deps: ModuleRuntimeContext & ToolsExecutionDeps,
  mode: ToolActionMode,
): Promise<void> {
  if (deps.toolsModuleError) {
    deps.appendLog(deps.toolsModuleError);
    return;
  }

  const queue = selectedToolQueueFromState(deps.toolStatuses, deps.selectedTools);
  if (queue.length === 0) {
    deps.appendLog("nenhuma tool selecionada");
    return;
  }

  if (mode === "uninstall") {
    const preview = await resolveToolsCleanupPreview(queue);
    const grouped = preview.groups.slice(0, 4).map((group) => `${group.label}: ${group.count}`);
    deps.clearLightConfirm();
    deps.setConfirmAction({
      title: "tools uninstall selected",
      details: [`Total a remover: ${preview.total}`, ...grouped, ...preview.warnings.slice(0, 2)],
      run: async () => {
        await uninstallTools(queue, deps.appendLog);
        await deps.refreshTools();
        await deps.refreshMcp();
      },
    });
    deps.setConfirmFocusConfirm(false);
    return;
  }

  const token = `tools-${mode}-${queue.join(",")}`;
  if (!deps.requestLightConfirm(token, `tools ${mode} selected`)) {
    return;
  }

  if (mode === "configure") {
    await deps.runTask("tools configure selected", async () => {
      await configureToolsWithCodex(queue, deps.appendLog);
      await deps.refreshMcp();
    });
    return;
  }

  await deps.runTask(`tools ${mode} selected`, async () => {
    await installOrUpdateTools(queue, deps.appendLog, mode);
    await deps.refreshTools();
  });
}

export async function installOpenSpecAndConfigureCommand(
  deps: ModuleRuntimeContext & OpenSpecDeps,
): Promise<void> {
  if (
    !deps.requestLightConfirm("home-openspec-install-configure", "openspec install + configure")
  ) {
    return;
  }

  await deps.runTask("openspec install + configure", async () => {
    await installOrUpdateTools(["openspec"], deps.appendLog, "install");
    await configureToolsWithCodex(["openspec"], deps.appendLog);
    await deps.refreshTools();
    await deps.refreshMcp();
  });
}
