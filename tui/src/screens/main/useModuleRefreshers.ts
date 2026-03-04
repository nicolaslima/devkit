import { useCallback } from "react";
import { refreshConfigDiffCommand } from "../../modules/config-sync/commands";
import { type DistTags, refreshCodexCommand } from "../../modules/codex/commands";
import { refreshMcpCommand } from "../../modules/mcp/commands";
import { refreshSkillsCommand } from "../../modules/skills/commands";
import { refreshToolsCommand } from "../../modules/tools/commands";
import type { ConfigDiffItem, McpServerInfo, SkillRecipe, ToolName, ToolStatus } from "../../types";

interface UseModuleRefreshersDeps {
  distTags: DistTags;
  setDistTags: (tags: DistTags) => void;
  setCodexVersion: (value: string) => void;
  setSkills: (value: SkillRecipe[] | ((prev: SkillRecipe[]) => SkillRecipe[])) => void;
  setSkillsModuleError: (value: string | null) => void;
  setSelectedSkills: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setMcpServers: (value: McpServerInfo[]) => void;
  setMcpModuleError: (value: string | null) => void;
  setReferenceConfigPath: (value: string) => void;
  setConfigDiff: (value: ConfigDiffItem[]) => void;
  setToolStatuses: (value: ToolStatus[]) => void;
  setToolsModuleError: (value: string | null) => void;
  setSelectedTools: (value: Set<ToolName> | ((prev: Set<ToolName>) => Set<ToolName>)) => void;
}

interface UseModuleRefreshersResult {
  refreshCatalog: () => Promise<void>;
  refreshSkills: () => Promise<void>;
  refreshCodex: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  refreshConfigDiff: () => Promise<void>;
  refreshTools: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useModuleRefreshers(deps: UseModuleRefreshersDeps): UseModuleRefreshersResult {
  const refreshSkills = useCallback(async () => {
    await refreshSkillsCommand({
      setSkills: deps.setSkills,
      setSkillsModuleError: deps.setSkillsModuleError,
      setSelectedSkills: deps.setSelectedSkills,
    });
  }, [deps.setSelectedSkills, deps.setSkills, deps.setSkillsModuleError]);

  const refreshCodex = useCallback(async () => {
    await refreshCodexCommand({
      distTags: deps.distTags,
      setDistTags: deps.setDistTags,
      setCodexVersion: deps.setCodexVersion,
    });
  }, [deps.distTags, deps.setCodexVersion, deps.setDistTags]);

  const refreshMcp = useCallback(async () => {
    await refreshMcpCommand({
      setMcpServers: deps.setMcpServers,
      setMcpModuleError: deps.setMcpModuleError,
    });
  }, [deps.setMcpModuleError, deps.setMcpServers]);

  const refreshConfigDiff = useCallback(async () => {
    await refreshConfigDiffCommand({
      setReferenceConfigPath: deps.setReferenceConfigPath,
      setConfigDiff: deps.setConfigDiff,
    });
  }, [deps.setConfigDiff, deps.setReferenceConfigPath]);

  const refreshTools = useCallback(async () => {
    await refreshToolsCommand({
      setToolStatuses: deps.setToolStatuses,
      setToolsModuleError: deps.setToolsModuleError,
      setSelectedTools: deps.setSelectedTools,
    });
  }, [deps.setSelectedTools, deps.setToolStatuses, deps.setToolsModuleError]);

  const refreshCatalog = useCallback(async () => {
    await Promise.allSettled([refreshSkills(), refreshMcp(), refreshConfigDiff(), refreshTools()]);
  }, [refreshConfigDiff, refreshMcp, refreshSkills, refreshTools]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      refreshCatalog(),
      refreshCodex(),
    ]);
  }, [refreshCatalog, refreshCodex]);

  return {
    refreshCatalog,
    refreshSkills,
    refreshCodex,
    refreshMcp,
    refreshConfigDiff,
    refreshTools,
    refreshAll,
  };
}
