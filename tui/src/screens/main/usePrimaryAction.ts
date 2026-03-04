import { useCallback } from "react";
import { installOpenSpecAndConfigureCommand } from "../../modules/tools/commands";
import { runHomePrimaryActionCommand } from "../../modules/home/commands";
import { runPlanPrimaryActionCommand } from "../../modules/run-plan/commands";
import type { ModuleRuntimeContext } from "../../modules/runtime/types";
import type { AppTab, CodexChannel, CodexTarget } from "../../types";

interface PrimaryActionDeps extends ModuleRuntimeContext {
  activeTab: AppTab;
  homeActions: string[];
  runPlanLength: number;
  getCursor: (tab: AppTab) => number;
  codexTarget: CodexTarget | null;
  codexChannel: CodexChannel;
  setCodexTarget: (
    value: CodexTarget | null | ((prev: CodexTarget | null) => CodexTarget | null),
  ) => void;
  setCodexChannel: (value: CodexChannel | ((prev: CodexChannel) => CodexChannel)) => void;
}

interface PrimaryActionHandlers {
  refreshCatalog: () => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  refreshConfigDiff: () => Promise<void>;
  refreshTools: () => Promise<void>;
  refreshCodex: () => Promise<void>;
  installSelectedSkillsAction: () => Promise<void>;
  removeSelectedSkillsAction: () => Promise<void>;
  toggleCurrentSkillSelection: () => void;
  toggleCurrentToolSelection: () => void;
  toggleCurrentMcpAction: () => Promise<void>;
  applyCurrentDiffAction: () => Promise<void>;
  updateCodexAction: (target: CodexTarget | null, channel: CodexChannel) => Promise<void>;
}

interface UsePrimaryActionResult {
  runHomeAction: () => Promise<void>;
  activatePrimaryAction: () => Promise<void>;
}

export function usePrimaryAction(
  deps: PrimaryActionDeps,
  handlers: PrimaryActionHandlers,
): UsePrimaryActionResult {
  const runHomeAction = useCallback(async () => {
    await runHomePrimaryActionCommand({
      appendLog: deps.appendLog,
      clearLightConfirm: deps.clearLightConfirm,
      requestLightConfirm: deps.requestLightConfirm,
      runTask: deps.runTask,
      homeActions: deps.homeActions,
      currentIndex: deps.getCursor("home"),
      installSelectedSkillsAction: handlers.installSelectedSkillsAction,
      removeSelectedSkillsAction: handlers.removeSelectedSkillsAction,
      refreshCatalog: handlers.refreshCatalog,
      refreshMcp: handlers.refreshMcp,
      refreshConfigDiff: handlers.refreshConfigDiff,
      installOpenSpecAndConfigure: async () => {
        await installOpenSpecAndConfigureCommand({
          appendLog: deps.appendLog,
          clearLightConfirm: deps.clearLightConfirm,
          requestLightConfirm: deps.requestLightConfirm,
          runTask: deps.runTask,
          refreshTools: handlers.refreshTools,
          refreshMcp: handlers.refreshMcp,
        });
      },
    });
  }, [deps, handlers]);

  const activatePrimaryAction = useCallback(async () => {
    if (deps.activeTab === "home") {
      await runHomeAction();
      return;
    }

    if (deps.activeTab === "skills") {
      handlers.toggleCurrentSkillSelection();
      return;
    }

    if (deps.activeTab === "codex") {
      const row = deps.getCursor("codex");
      if (row === 0) {
        deps.setCodexTarget((previous) => (previous === "local" ? "codespace" : "local"));
        return;
      }
      if (row === 1) {
        deps.setCodexChannel((previous) => (previous === "stable" ? "alpha" : "stable"));
        return;
      }
      if (row === 2) {
        await handlers.updateCodexAction(deps.codexTarget, deps.codexChannel);
        return;
      }
      if (!deps.requestLightConfirm("codex-refresh-tags-version", "refresh codex tags/version")) {
        return;
      }
      await deps.runTask("refresh codex tags/version", handlers.refreshCodex);
      return;
    }

    if (deps.activeTab === "mcp") {
      await handlers.toggleCurrentMcpAction();
      return;
    }

    if (deps.activeTab === "configSync") {
      await handlers.applyCurrentDiffAction();
      return;
    }

    if (deps.activeTab === "tools") {
      handlers.toggleCurrentToolSelection();
      return;
    }

    if (deps.activeTab === "runPlan") {
      await runPlanPrimaryActionCommand({
        appendLog: deps.appendLog,
        clearLightConfirm: deps.clearLightConfirm,
        requestLightConfirm: deps.requestLightConfirm,
        runTask: deps.runTask,
        currentIndex: deps.getCursor("runPlan"),
        logsCount: deps.runPlanLength,
      });
    }
  }, [deps, handlers, runHomeAction]);

  return { runHomeAction, activatePrimaryAction };
}
