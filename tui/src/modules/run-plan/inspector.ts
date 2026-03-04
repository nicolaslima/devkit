import { buildInspectorSections } from "../runtime/view";

export function buildRunPlanInspectorLines(logs: string[]): string[] {
  return buildInspectorSections([
    { title: "Selection", lines: ["Run plan stream"] },
    { title: "Impact", lines: [`Events ${logs.length}`] },
    { title: "Command", lines: logs.slice(-18) },
  ]);
}
