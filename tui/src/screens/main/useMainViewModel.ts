import { useMemo } from "react";
import { APP_NAME } from "../../constants";
import { getAuditPath } from "../../core/audit";
import type { DistTags } from "../../modules/codex/commands";
import { buildCodexInspectorLines } from "../../modules/codex/inspector";
import { buildCodexWorkspaceRows } from "../../modules/codex/workspace";
import { buildConfigSyncInspectorLines } from "../../modules/config-sync/inspector";
import { buildConfigSyncWorkspaceRows } from "../../modules/config-sync/workspace";
import { buildHomeInspectorLines } from "../../modules/home/inspector";
import { buildHomeWorkspaceRows } from "../../modules/home/workspace";
import { buildMcpInspectorLines } from "../../modules/mcp/inspector";
import { buildMcpWorkspaceRows } from "../../modules/mcp/workspace";
import { buildRunPlanInspectorLines } from "../../modules/run-plan/inspector";
import { buildRunPlanWorkspaceRows } from "../../modules/run-plan/workspace";
import type { ScreenRow } from "../../modules/runtime/view";
import { buildSkillsInspectorLines } from "../../modules/skills/inspector";
import { buildSkillsWorkspaceRows } from "../../modules/skills/workspace";
import { buildToolsInspectorLines } from "../../modules/tools/inspector";
import { buildToolsWorkspaceRows } from "../../modules/tools/workspace";
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

interface UseMainViewModelInput {
  activeTab: AppTab;
  homeActions: string[];
  getCursor: (tab: AppTab) => number;
  skills: SkillRecipe[];
  selectedSkills: Set<string>;
  skillsModuleError: string | null;
  codexTarget: CodexTarget | null;
  codexChannel: CodexChannel;
  codexVersion: string;
  distTags: DistTags;
  mcpServers: McpServerInfo[];
  mcpModuleError: string | null;
  configDiff: ConfigDiffItem[];
  referenceConfigPath: string;
  toolStatuses: ToolStatus[];
  selectedTools: Set<ToolName>;
  toolsModuleError: string | null;
  logs: string[];
  busy: boolean;
}

interface MainViewModelState {
  workspaceRows: ScreenRow[];
  inspectorLines: string[];
}

export function useMainViewModel(input: UseMainViewModelInput): MainViewModelState {
  const selectedSkillCount = input.selectedSkills.size;
  const installedSkillCount = input.skills.filter((item) => item.installedPaths.length > 0).length;

  const workspaceRows = useMemo<ScreenRow[]>(() => {
    switch (input.activeTab) {
      case "home":
        return buildHomeWorkspaceRows(input.homeActions, input.getCursor("home"));
      case "skills":
        return buildSkillsWorkspaceRows(
          input.skills,
          input.selectedSkills,
          input.getCursor("skills"),
          input.skillsModuleError,
        );
      case "codex":
        return buildCodexWorkspaceRows(
          input.codexTarget,
          input.codexChannel,
          input.getCursor("codex"),
        );
      case "mcp":
        return buildMcpWorkspaceRows(
          input.mcpServers,
          input.getCursor("mcp"),
          input.mcpModuleError,
        );
      case "configSync":
        return buildConfigSyncWorkspaceRows(input.configDiff, input.getCursor("configSync"));
      case "tools":
        return buildToolsWorkspaceRows(
          input.toolStatuses,
          input.selectedTools,
          input.getCursor("tools"),
          input.toolsModuleError,
        );
      case "runPlan":
        return buildRunPlanWorkspaceRows(input.logs);
      default:
        return [];
    }
  }, [
    input.activeTab,
    input.codexChannel,
    input.codexTarget,
    input.configDiff,
    input.getCursor,
    input.homeActions,
    input.logs,
    input.mcpModuleError,
    input.mcpServers,
    input.selectedSkills,
    input.skills,
    input.skillsModuleError,
    input.selectedTools,
    input.toolStatuses,
    input.toolsModuleError,
  ]);

  const inspectorLines = useMemo<string[]>(() => {
    switch (input.activeTab) {
      case "home":
        return buildHomeInspectorLines({
          appName: APP_NAME,
          auditPath: getAuditPath(),
          busy: input.busy,
          selectedSkillCount,
          installedSkillCount,
          mcpCount: input.mcpServers.length,
          configDiffCount: input.configDiff.length,
          codexVersion: input.codexVersion,
          codexStable: input.distTags.latest,
          codexAlpha: input.distTags.alpha,
          referenceConfigPath: input.referenceConfigPath,
        });
      case "skills":
        return buildSkillsInspectorLines(
          input.skills,
          input.getCursor("skills"),
          input.skillsModuleError,
        );
      case "codex":
        return buildCodexInspectorLines({
          codexTarget: input.codexTarget,
          codexChannel: input.codexChannel,
          codexVersion: input.codexVersion,
          latest: input.distTags.latest,
          alpha: input.distTags.alpha,
        });
      case "mcp":
        return buildMcpInspectorLines(
          input.mcpServers,
          input.getCursor("mcp"),
          input.mcpModuleError,
        );
      case "configSync":
        return buildConfigSyncInspectorLines(input.configDiff, input.getCursor("configSync"));
      case "tools":
        return buildToolsInspectorLines(
          input.toolStatuses,
          input.selectedTools,
          input.getCursor("tools"),
          input.toolsModuleError,
        );
      case "runPlan":
        return buildRunPlanInspectorLines(input.logs);
      default:
        return [];
    }
  }, [
    input.activeTab,
    input.busy,
    input.codexChannel,
    input.codexTarget,
    input.codexVersion,
    input.configDiff,
    input.distTags.alpha,
    input.distTags.latest,
    input.getCursor,
    installedSkillCount,
    input.logs,
    input.mcpModuleError,
    input.mcpServers,
    input.referenceConfigPath,
    selectedSkillCount,
    input.selectedTools,
    input.skills,
    input.skillsModuleError,
    input.toolStatuses,
    input.toolsModuleError,
  ]);

  return { workspaceRows, inspectorLines };
}
