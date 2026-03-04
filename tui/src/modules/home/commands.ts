import type { ModuleRuntimeContext } from "../runtime/types";

interface HomeActionsDeps {
  homeActions: string[];
  currentIndex: number;
  installSelectedSkillsAction: () => Promise<void>;
  removeSelectedSkillsAction: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  refreshConfigDiff: () => Promise<void>;
  installOpenSpecAndConfigure: () => Promise<void>;
}

export interface HomeCommands {
  runPrimaryAction: () => Promise<void>;
}

export async function runHomePrimaryActionCommand(
  deps: ModuleRuntimeContext & HomeActionsDeps,
): Promise<void> {
  const current = deps.currentIndex;
  if (current < 0 || current >= deps.homeActions.length) {
    return;
  }

  if (current === 0) {
    if (!deps.requestLightConfirm("home-refresh-catalog", "refresh catalog")) {
      return;
    }
    await deps.runTask("refresh catalog", deps.refreshCatalog);
    return;
  }

  if (current === 1) {
    await deps.installSelectedSkillsAction();
    return;
  }

  if (current === 2) {
    await deps.removeSelectedSkillsAction();
    return;
  }

  if (current === 3) {
    if (!deps.requestLightConfirm("home-refresh-mcp", "refresh MCP")) {
      return;
    }
    await deps.runTask("refresh MCP", deps.refreshMcp);
    return;
  }

  if (current === 4) {
    if (!deps.requestLightConfirm("home-refresh-diff", "refresh config diff")) {
      return;
    }
    await deps.runTask("refresh config diff", deps.refreshConfigDiff);
    return;
  }

  if (current === 5) {
    await deps.installOpenSpecAndConfigure();
  }
}
