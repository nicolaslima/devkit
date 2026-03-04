import { useCallback } from "react";
import { type DistTags, updateCodexCommand } from "../../modules/codex/commands";
import { applyCurrentConfigDiffCommand } from "../../modules/config-sync/commands";
import { toggleCurrentMcpCommand } from "../../modules/mcp/commands";
import type { ModuleRuntimeContext } from "../../modules/runtime/types";
import {
  installSelectedSkillsCommand,
  queueRemoveSelectedSkillsCommand,
} from "../../modules/skills/commands";
import { executeSelectedToolsCommand } from "../../modules/tools/commands";
import type {
  AppTab,
  CodexChannel,
  CodexTarget,
  ConfigDiffItem,
  McpServerInfo,
  SkillRecipe,
  ToolName,
  ToolStatus,
} from "../../types";
import type { ConfirmAction } from "./types";
import { useModuleRefreshers } from "./useModuleRefreshers";
import { usePrimaryAction } from "./usePrimaryAction";
import { useSelectionState } from "./useSelectionState";

interface UseMainActionsDeps extends ModuleRuntimeContext {
  homeActions: string[];
  runPlanLength: number;
  activeTab: AppTab;
  getCursor: (tab: AppTab) => number;
  skills: SkillRecipe[];
  selectedSkills: Set<string>;
  setSelectedSkills: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  skillsModuleError: string | null;
  codexTarget: CodexTarget | null;
  codexChannel: CodexChannel;
  setCodexTarget: (
    value: CodexTarget | null | ((prev: CodexTarget | null) => CodexTarget | null),
  ) => void;
  setCodexChannel: (value: CodexChannel | ((prev: CodexChannel) => CodexChannel)) => void;
  distTags: DistTags;
  setDistTags: (tags: DistTags) => void;
  setCodexVersion: (value: string) => void;
  mcpServers: McpServerInfo[];
  mcpModuleError: string | null;
  configDiff: ConfigDiffItem[];
  toolStatuses: ToolStatus[];
  selectedTools: Set<ToolName>;
  setSelectedTools: (value: Set<ToolName> | ((prev: Set<ToolName>) => Set<ToolName>)) => void;
  toolsModuleError: string | null;
  setConfirmAction: (value: ConfirmAction | null) => void;
  setConfirmFocusConfirm: (value: boolean) => void;
  setSkills: (value: SkillRecipe[] | ((prev: SkillRecipe[]) => SkillRecipe[])) => void;
  setSkillsModuleError: (value: string | null) => void;
  setMcpServers: (value: McpServerInfo[]) => void;
  setMcpModuleError: (value: string | null) => void;
  setReferenceConfigPath: (value: string) => void;
  setConfigDiff: (value: ConfigDiffItem[]) => void;
  setToolStatuses: (value: ToolStatus[]) => void;
  setToolsModuleError: (value: string | null) => void;
}

interface UseMainActionsState {
  refreshCatalog: () => Promise<void>;
  refreshSkills: () => Promise<void>;
  refreshCodex: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  refreshConfigDiff: () => Promise<void>;
  refreshTools: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getActiveTabLength: () => number;
  toggleCurrentSkillSelection: () => void;
  toggleCurrentToolSelection: () => void;
  installSelectedSkillsAction: () => Promise<void>;
  removeSelectedSkillsAction: () => Promise<void>;
  updateCodexAction: (target: CodexTarget | null, channel: CodexChannel) => Promise<void>;
  toggleCurrentMcpAction: () => Promise<void>;
  applyCurrentDiffAction: () => Promise<void>;
  executeSelectedToolAction: (
    mode: "install" | "update" | "configure" | "uninstall",
  ) => Promise<void>;
  runHomeAction: () => Promise<void>;
  activatePrimaryAction: () => Promise<void>;
}

export function useMainActions(deps: UseMainActionsDeps): UseMainActionsState {
  const runtime = {
    appendLog: deps.appendLog,
    clearLightConfirm: deps.clearLightConfirm,
    requestLightConfirm: deps.requestLightConfirm,
    runTask: deps.runTask,
  } satisfies ModuleRuntimeContext;

  const {
    refreshCatalog,
    refreshSkills,
    refreshCodex,
    refreshMcp,
    refreshConfigDiff,
    refreshTools,
    refreshAll,
  } = useModuleRefreshers({
    distTags: deps.distTags,
    setDistTags: deps.setDistTags,
    setCodexVersion: deps.setCodexVersion,
    setSkills: deps.setSkills,
    setSkillsModuleError: deps.setSkillsModuleError,
    setSelectedSkills: deps.setSelectedSkills,
    setMcpServers: deps.setMcpServers,
    setMcpModuleError: deps.setMcpModuleError,
    setReferenceConfigPath: deps.setReferenceConfigPath,
    setConfigDiff: deps.setConfigDiff,
    setToolStatuses: deps.setToolStatuses,
    setToolsModuleError: deps.setToolsModuleError,
    setSelectedTools: deps.setSelectedTools,
  });

  const { getActiveTabLength, toggleCurrentSkillSelection, toggleCurrentToolSelection } =
    useSelectionState({
      activeTab: deps.activeTab,
      homeActions: deps.homeActions,
      runPlanLength: deps.runPlanLength,
      getCursor: deps.getCursor,
      skills: deps.skills,
      mcpServers: deps.mcpServers,
      configDiff: deps.configDiff,
      toolStatuses: deps.toolStatuses,
      setSelectedSkills: deps.setSelectedSkills,
      setSelectedTools: deps.setSelectedTools,
    });

  const installSelectedSkillsAction = useCallback(async () => {
    await installSelectedSkillsCommand({
      ...runtime,
      skillsModuleError: deps.skillsModuleError,
      skills: deps.skills,
      selectedSkills: deps.selectedSkills,
      refreshSkills,
    });
  }, [deps.selectedSkills, deps.skills, deps.skillsModuleError, refreshSkills, runtime]);

  const removeSelectedSkillsAction = useCallback(async () => {
    queueRemoveSelectedSkillsCommand({
      ...runtime,
      skillsModuleError: deps.skillsModuleError,
      skills: deps.skills,
      selectedSkills: deps.selectedSkills,
      refreshSkills,
      setConfirmAction: deps.setConfirmAction,
      setConfirmFocusConfirm: deps.setConfirmFocusConfirm,
    });
  }, [
    deps.selectedSkills,
    deps.setConfirmAction,
    deps.setConfirmFocusConfirm,
    deps.skills,
    deps.skillsModuleError,
    refreshSkills,
    runtime,
  ]);

  const updateCodexAction = useCallback(
    async (target: CodexTarget | null, channel: CodexChannel) => {
      await updateCodexCommand(
        {
          ...runtime,
          distTags: deps.distTags,
          setDistTags: deps.setDistTags,
          setCodexVersion: deps.setCodexVersion,
        },
        target,
        channel,
      );
    },
    [deps.distTags, deps.setCodexVersion, deps.setDistTags, runtime],
  );

  const toggleCurrentMcpAction = useCallback(async () => {
    await toggleCurrentMcpCommand({
      ...runtime,
      mcpServers: deps.mcpServers,
      mcpModuleError: deps.mcpModuleError,
      currentIndex: deps.getCursor("mcp"),
      refreshMcp,
    });
  }, [deps.getCursor, deps.mcpModuleError, deps.mcpServers, refreshMcp, runtime]);

  const applyCurrentDiffAction = useCallback(async () => {
    await applyCurrentConfigDiffCommand({
      ...runtime,
      configDiff: deps.configDiff,
      currentIndex: deps.getCursor("configSync"),
      refreshConfigDiff,
      refreshMcp,
      setConfirmAction: deps.setConfirmAction,
      setConfirmFocusConfirm: deps.setConfirmFocusConfirm,
    });
  }, [
    deps.configDiff,
    deps.getCursor,
    deps.setConfirmAction,
    deps.setConfirmFocusConfirm,
    refreshConfigDiff,
    refreshMcp,
    runtime,
  ]);

  const executeSelectedToolAction = useCallback(
    async (mode: "install" | "update" | "configure" | "uninstall") => {
      await executeSelectedToolsCommand(
        {
          ...runtime,
          toolsModuleError: deps.toolsModuleError,
          toolStatuses: deps.toolStatuses,
          selectedTools: deps.selectedTools,
          refreshTools,
          refreshMcp,
          setConfirmAction: deps.setConfirmAction,
          setConfirmFocusConfirm: deps.setConfirmFocusConfirm,
        },
        mode,
      );
    },
    [
      deps.selectedTools,
      deps.setConfirmAction,
      deps.setConfirmFocusConfirm,
      deps.toolStatuses,
      deps.toolsModuleError,
      refreshMcp,
      refreshTools,
      runtime,
    ],
  );

  const { runHomeAction, activatePrimaryAction } = usePrimaryAction(
    {
      ...runtime,
      activeTab: deps.activeTab,
      homeActions: deps.homeActions,
      runPlanLength: deps.runPlanLength,
      getCursor: deps.getCursor,
      codexTarget: deps.codexTarget,
      codexChannel: deps.codexChannel,
      setCodexTarget: deps.setCodexTarget,
      setCodexChannel: deps.setCodexChannel,
    },
    {
      refreshCatalog,
      refreshAll,
      refreshMcp,
      refreshConfigDiff,
      refreshTools,
      refreshCodex,
      installSelectedSkillsAction,
      removeSelectedSkillsAction,
      toggleCurrentSkillSelection,
      toggleCurrentToolSelection,
      toggleCurrentMcpAction,
      applyCurrentDiffAction,
      updateCodexAction,
    },
  );

  return {
    refreshCatalog,
    refreshSkills,
    refreshCodex,
    refreshMcp,
    refreshConfigDiff,
    refreshTools,
    refreshAll,
    getActiveTabLength,
    toggleCurrentSkillSelection,
    toggleCurrentToolSelection,
    installSelectedSkillsAction,
    removeSelectedSkillsAction,
    updateCodexAction,
    toggleCurrentMcpAction,
    applyCurrentDiffAction,
    executeSelectedToolAction,
    runHomeAction,
    activatePrimaryAction,
  };
}
