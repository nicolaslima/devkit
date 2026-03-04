import type { SkillRecipe } from "../../types";
import { buildInspectorSections } from "../runtime/view";

export function buildSkillsInspectorLines(
  skills: SkillRecipe[],
  cursor: number,
  moduleError: string | null,
): string[] {
  if (moduleError) {
    return buildInspectorSections([
      { title: "Selection", lines: ["Skills module"] },
      { title: "Impact", lines: [moduleError] },
      { title: "Command", lines: ["Catalog invalid or unavailable"] },
    ]);
  }

  const current = skills[cursor];
  if (!current) {
    return buildInspectorSections([
      { title: "Selection", lines: ["No skills loaded"] },
      { title: "Impact", lines: ["Install/remove disabled until catalog is loaded"] },
      { title: "Command", lines: ["Refresh catalog"] },
    ]);
  }

  return buildInspectorSections([
    {
      title: "Selection",
      lines: [`Skill ${current.id}`, `Label ${current.label}`, `Source ${current.source}`],
    },
    {
      title: "Command",
      lines: [current.command, "Space/Enter toggle selection", "i install selected", "r remove selected local"],
    },
    {
      title: "Impact",
      lines: [current.installedPaths.length > 0 ? "Already installed locally" : "Not installed locally"],
    },
  ]);
}
