export type AppTab = "home" | "skills" | "codex" | "mcp" | "configSync" | "tools" | "runPlan";

export type CodexTarget = "local" | "codespace";
export type CodexChannel = "stable" | "alpha";

export type ToolName = "openspec" | "reme" | "axon";

export interface SkillCatalogItem {
  name: string;
  install: string;
}

export interface ToolCatalogItem {
  name: ToolName;
  install: string;
  update: string;
  uninstall: string;
  cleanup: string[];
}

export interface McpTemplateItem {
  name: string;
  block: string;
}

export interface ModuleCatalogState<T> {
  enabled: boolean;
  error?: string;
  items: T[];
}

export interface SkillRecipe {
  id: string;
  label: string;
  command: string;
  source: string;
  installedPaths: string[];
}

export interface BatchSummary {
  total: number;
  failed: number;
  token: string;
  failedNames: string[];
  warnings?: string[];
}

export interface CleanupGroupSummary {
  label: string;
  count: number;
}

export interface CleanupPreview {
  total: number;
  groups: CleanupGroupSummary[];
  matches: string[];
  warnings: string[];
}

export interface McpServerInfo {
  name: string;
  enabled: boolean;
  blockStartLine: number;
  blockEndLine: number;
  headerLine: string;
}

export type ConfigDiffKind = "key-missing" | "key-different" | "section-missing" | "key-only-local";

export interface ConfigDiffItem {
  id: string;
  kind: ConfigDiffKind;
  path: string;
  status: "missing" | "different" | "only-local";
  referenceValue?: string;
  localValue?: string;
  recommendedLine?: string;
  section?: string;
  localLineIndex?: number;
  referenceBlock?: string[];
}

export interface ToolStatus {
  name: ToolName;
  installed: boolean;
  version: string;
}
