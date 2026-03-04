import type { SkillRecipe } from "../../types";
import type { ScreenRow } from "../runtime/view";

export function buildSkillsWorkspaceRows(
  skills: SkillRecipe[],
  selectedSkills: Set<string>,
  cursor: number,
  moduleError: string | null,
): ScreenRow[] {
  if (moduleError) {
    return [{ key: "skills-disabled", line: `Skills: ${moduleError}`, active: true }];
  }

  if (skills.length === 0) {
    return [{ key: "skills-empty", line: "No skills loaded", active: true }];
  }

  return skills.map((skill, index) => {
    const selected = selectedSkills.has(skill.id);
    const installed = skill.installedPaths.length > 0 ? "installed" : "not-installed";
    return {
      key: skill.id,
      line: `${selected ? "[x]" : "[ ]"} ${skill.id} (${installed})`,
      active: index === cursor,
    };
  });
}
