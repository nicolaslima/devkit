import { buildInspectorSections } from "../runtime/view";

export interface HomeInspectorInput {
  appName: string;
  auditPath: string;
  busy: boolean;
  selectedSkillCount: number;
  installedSkillCount: number;
  mcpCount: number;
  configDiffCount: number;
  codexVersion: string;
  codexStable: string;
  codexAlpha: string;
  referenceConfigPath: string;
}

export function buildHomeInspectorLines(input: HomeInspectorInput): string[] {
  return buildInspectorSections([
    {
      title: "Selection",
      lines: [`App ${input.appName}`, `Busy ${input.busy ? "yes" : "no"}`],
    },
    {
      title: "Impact",
      lines: [
        `Selected skills ${input.selectedSkillCount}`,
        `Installed skills ${input.installedSkillCount}`,
        `MCP detected ${input.mcpCount}`,
        `Config diff items ${input.configDiffCount}`,
      ],
    },
    {
      title: "Command",
      lines: [
        `Codex version ${input.codexVersion}`,
        `Codex tags stable=${input.codexStable}, alpha=${input.codexAlpha}`,
        `Audit ${input.auditPath}`,
        `Reference config ${input.referenceConfigPath}`,
      ],
    },
  ]);
}
