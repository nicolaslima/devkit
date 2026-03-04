import { afterEach, describe, expect, it, vi } from "vitest";
import * as skillsActions from "../../src/actions/skills";
import { refreshSkillsCommand } from "../../src/modules/skills/commands";
import type { SkillRecipe } from "../../src/types";

describe("skills commands", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preselects all non-installed skills on refresh", async () => {
    const catalog: SkillRecipe[] = [
      {
        id: "installed-skill",
        label: "installed-skill",
        source: "catalog",
        command: "echo installed",
        installedPaths: ["/tmp/installed-skill"],
      },
      {
        id: "fresh-skill-a",
        label: "fresh-skill-a",
        source: "catalog",
        command: "echo fresh-a",
        installedPaths: [],
      },
      {
        id: "fresh-skill-b",
        label: "fresh-skill-b",
        source: "catalog",
        command: "echo fresh-b",
        installedPaths: [],
      },
    ];

    vi.spyOn(skillsActions, "loadSkillCatalogState").mockResolvedValue({
      enabled: true,
      items: catalog,
    });

    const setSkills = vi.fn();
    const setSkillsModuleError = vi.fn();
    const setSelectedSkills = vi.fn();

    await refreshSkillsCommand({
      setSkills,
      setSkillsModuleError,
      setSelectedSkills,
    });

    expect(setSkills).toHaveBeenCalledWith(catalog);
    expect(setSkillsModuleError).toHaveBeenCalledWith(null);
    expect(setSelectedSkills).toHaveBeenCalledWith(new Set(["fresh-skill-a", "fresh-skill-b"]));
  });
});
