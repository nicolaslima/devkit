import { useCallback } from "react";
import type {
  AppTab,
  ConfigDiffItem,
  McpServerInfo,
  SkillRecipe,
  ToolName,
  ToolStatus,
} from "../../types";

interface UseSelectionStateDeps {
  activeTab: AppTab;
  homeActions: string[];
  runPlanLength: number;
  getCursor: (tab: AppTab) => number;
  skills: SkillRecipe[];
  mcpServers: McpServerInfo[];
  configDiff: ConfigDiffItem[];
  toolStatuses: ToolStatus[];
  setSelectedSkills: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setSelectedTools: (value: Set<ToolName> | ((prev: Set<ToolName>) => Set<ToolName>)) => void;
}

interface UseSelectionStateResult {
  getActiveTabLength: () => number;
  toggleCurrentSkillSelection: () => void;
  toggleCurrentToolSelection: () => void;
}

function toggleInSet<T>(items: Set<T>, value: T): Set<T> {
  const next = new Set(items);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function useSelectionState(deps: UseSelectionStateDeps): UseSelectionStateResult {
  const getActiveTabLength = useCallback((): number => {
    if (deps.activeTab === "home") {
      return deps.homeActions.length;
    }
    if (deps.activeTab === "skills") {
      return Math.max(deps.skills.length, 1);
    }
    if (deps.activeTab === "codex") {
      return 4;
    }
    if (deps.activeTab === "mcp") {
      return Math.max(deps.mcpServers.length, 1);
    }
    if (deps.activeTab === "configSync") {
      return Math.max(deps.configDiff.length, 1);
    }
    if (deps.activeTab === "tools") {
      return Math.max(deps.toolStatuses.length, 1);
    }
    if (deps.activeTab === "runPlan") {
      return Math.max(deps.runPlanLength, 1);
    }
    return 1;
  }, [
    deps.activeTab,
    deps.configDiff.length,
    deps.homeActions.length,
    deps.mcpServers.length,
    deps.runPlanLength,
    deps.skills.length,
    deps.toolStatuses.length,
  ]);

  const toggleCurrentSkillSelection = useCallback(() => {
    const skill = deps.skills[deps.getCursor("skills")];
    if (!skill) {
      return;
    }
    deps.setSelectedSkills((previous) => toggleInSet(previous, skill.id));
  }, [deps.getCursor, deps.setSelectedSkills, deps.skills]);

  const toggleCurrentToolSelection = useCallback(() => {
    const tool = deps.toolStatuses[deps.getCursor("tools")];
    if (!tool) {
      return;
    }
    deps.setSelectedTools((previous) => toggleInSet(previous, tool.name));
  }, [deps.getCursor, deps.setSelectedTools, deps.toolStatuses]);

  return { getActiveTabLength, toggleCurrentSkillSelection, toggleCurrentToolSelection };
}
