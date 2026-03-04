import { afterEach, describe, expect, it, vi } from "vitest";
import * as skillsActions from "../../src/actions/skills";
import {
  installCurrentSkillCommand,
  queueRemoveCurrentSkillCommand,
  refreshSkillsCommand,
} from "../../src/modules/skills/commands";
import type { SkillRecipe } from "../../src/types";

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

describe("skills commands", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preselects all non-installed skills only on first refresh", async () => {
    vi.spyOn(skillsActions, "loadSkillCatalogState").mockResolvedValue({
      enabled: true,
      items: catalog,
    });

    const setSkills = vi.fn();
    const setSkillsModuleError = vi.fn();
    const setSelectedSkills = vi.fn(
      (value: Set<string> | ((previous: Set<string>) => Set<string>)) => {
        expect(typeof value).toBe("function");
        if (typeof value !== "function") {
          return;
        }
        expect(value(new Set())).toEqual(new Set(["fresh-skill-a", "fresh-skill-b"]));
      },
    );

    await refreshSkillsCommand({
      setSkills,
      setSkillsModuleError,
      setSelectedSkills,
    });

    expect(setSkills).toHaveBeenCalledWith(catalog);
    expect(setSkillsModuleError).toHaveBeenCalledWith(null);
  });

  it("preserves previous selection on refresh and drops stale ids", async () => {
    vi.spyOn(skillsActions, "loadSkillCatalogState").mockResolvedValue({
      enabled: true,
      items: catalog,
    });

    const setSelectedSkills = vi.fn(
      (value: Set<string> | ((previous: Set<string>) => Set<string>)) => {
        expect(typeof value).toBe("function");
        if (typeof value !== "function") {
          return;
        }
        const previous = new Set(["installed-skill", "missing-skill"]);
        expect(value(previous)).toEqual(new Set(["installed-skill"]));
      },
    );

    await refreshSkillsCommand({
      setSkills: vi.fn(),
      setSkillsModuleError: vi.fn(),
      setSelectedSkills,
    });
  });

  it("installs current skill independent from batch preselection", async () => {
    const installSpy = vi.spyOn(skillsActions, "installSkills").mockResolvedValue({
      total: 1,
      failed: 0,
      token: "0/1",
      failedNames: [],
    });
    const refreshSkills = vi.fn().mockResolvedValue(undefined);

    await installCurrentSkillCommand({
      appendLog: vi.fn(),
      clearLightConfirm: vi.fn(),
      requestLightConfirm: vi.fn().mockReturnValue(true),
      runTask: async (_title, task) => task(),
      skills: catalog,
      skillsModuleError: null,
      currentIndex: 1,
      refreshSkills,
    });

    expect(installSpy).toHaveBeenCalledWith([catalog[1]], expect.any(Function));
    expect(refreshSkills).toHaveBeenCalledOnce();
  });

  it("queues remove confirmation for current skill and removes only that id", async () => {
    const removeSpy = vi.spyOn(skillsActions, "removeInstalledSkills").mockResolvedValue({
      total: 1,
      failed: 0,
      token: "0/1",
      failedNames: [],
    });

    type QueuedConfirm = {
      title: string;
      details: string[];
      run: () => Promise<void>;
    };
    const holder: { queued?: QueuedConfirm } = {};
    const refreshSkills = vi.fn().mockResolvedValue(undefined);

    queueRemoveCurrentSkillCommand({
      appendLog: vi.fn(),
      clearLightConfirm: vi.fn(),
      requestLightConfirm: vi.fn(),
      runTask: vi.fn(),
      setConfirmAction: (value) => {
        if (value) {
          holder.queued = value;
        }
      },
      setConfirmFocusConfirm: vi.fn(),
      skills: catalog,
      skillsModuleError: null,
      currentIndex: 2,
      refreshSkills,
    });

    const queued = holder.queued;
    expect(queued).toBeDefined();
    if (!queued) {
      throw new Error("expected queued confirmation action");
    }
    expect(queued.title).toContain("fresh-skill-b");
    expect(queued.details).toEqual(["fresh-skill-b"]);

    await queued.run();
    expect(removeSpy).toHaveBeenCalledWith(["fresh-skill-b"], expect.any(Function));
    expect(refreshSkills).toHaveBeenCalledOnce();
  });
});
