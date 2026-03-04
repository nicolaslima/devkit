import { afterEach, describe, expect, it, vi } from "vitest";
import { installSkills, removeInstalledSkills } from "../../src/actions/skills";
import * as fsAdapter from "../../src/adapters/fs";
import * as shellAdapter from "../../src/adapters/shell";
import type { SkillRecipe } from "../../src/types";

const recipes: SkillRecipe[] = [
  { id: "a", label: "a", source: "catalog", command: "cmd-a", installedPaths: [] },
  { id: "b", label: "b", source: "catalog", command: "cmd-b", installedPaths: [] },
  { id: "c", label: "c", source: "catalog", command: "cmd-c", installedPaths: [] },
];

describe("skills actions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("installSkills runs best-effort and returns compact N/T summary", async () => {
    vi.spyOn(shellAdapter, "runCommand")
      .mockResolvedValueOnce({ command: "cmd-a", code: 0, stdout: "ok", stderr: "" })
      .mockResolvedValueOnce({ command: "cmd-b", code: 1, stdout: "", stderr: "boom" })
      .mockResolvedValueOnce({ command: "cmd-c", code: 0, stdout: "ok", stderr: "" });

    const logs: string[] = [];
    const result = await installSkills(recipes, (line) => logs.push(line));

    expect(result).toEqual({
      total: 3,
      failed: 1,
      token: "1/3",
      failedNames: ["b"],
    });

    expect(logs).toContain("skills install summary 1/3");
    expect(logs).toContain("skills install failed: b");
    expect(logs.some((line) => line.includes("Falha ao instalar"))).toBe(false);
  });

  it("removeInstalledSkills runs best-effort and still reports 0/0", async () => {
    const existsSpy = vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(true);
    const removeSpy = vi.spyOn(fsAdapter, "removePath");
    removeSpy
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("nope"))
      .mockResolvedValue(undefined);

    const logs: string[] = [];
    const result = await removeInstalledSkills(["a"], (line) => logs.push(line));

    expect(existsSpy).toHaveBeenCalled();
    expect(result.failed).toBe(1);
    expect(result.total).toBe(1);
    expect(result.token).toBe("1/1");
    expect(result.failedNames).toEqual(["a"]);

    const empty = await removeInstalledSkills([], (line) => logs.push(line));
    expect(empty.token).toBe("0/0");
  });
});
