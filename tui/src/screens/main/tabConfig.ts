import path from "node:path";
import type { AppTab } from "../../types";

export const TAB_ORDER: AppTab[] = [
  "home",
  "skills",
  "codex",
  "mcp",
  "configSync",
  "tools",
  "runPlan",
];

export const TAB_LABELS: Record<AppTab, string> = {
  home: "Home",
  skills: "Skills",
  codex: "Codex",
  mcp: "MCP",
  configSync: "Config Sync",
  tools: "Tools",
  runPlan: "Run Plan",
};

export const PROFILE_LABEL = "default";
export const PROJECT_LABEL = path.basename(process.cwd()) || "project";
