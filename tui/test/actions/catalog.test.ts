import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadMcpCatalogState,
  loadSkillsCatalogState,
  loadToolsCatalogState,
} from "../../src/adapters/catalog";
import * as fsAdapter from "../../src/adapters/fs";

describe("catalog adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads valid states from project catalogs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline test fallback")));
    const skills = await loadSkillsCatalogState();
    const tools = await loadToolsCatalogState();
    const mcp = await loadMcpCatalogState();

    expect(skills.enabled).toBe(true);
    expect(skills.items.length).toBeGreaterThan(0);

    expect(tools.enabled).toBe(true);
    expect(tools.items.length).toBeGreaterThan(0);

    expect(mcp.enabled).toBe(true);
    expect(mcp.items.length).toBeGreaterThan(0);
  });

  it("returns disabled state with short generic error on invalid contract", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline test fallback")));
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(true);
    vi.spyOn(fsAdapter, "readTextFile").mockResolvedValue('[[skill]]\nname = "broken"\n');

    const state = await loadSkillsCatalogState();

    expect(state.enabled).toBe(false);
    expect(state.error).toBe("desabilitada com aviso");
  });

  it("disables only the affected module when zod contract validation fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline test fallback")));
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(true);
    vi.spyOn(fsAdapter, "readTextFile").mockImplementation(async (target) => {
      if (target.toString().endsWith("tools.toml")) {
        return [
          "[[tool]]",
          'name = "invalid-tool"',
          'install = "echo install"',
          'update = "echo update"',
          'uninstall = "echo uninstall"',
          'cleanup = ["./tmp/*"]',
        ].join("\n");
      }
      if (target.toString().endsWith("skills.toml")) {
        return '[[skill]]\nname = "ok-skill"\ninstall = "echo ok"\n';
      }
      return '[[mcp]]\nname = "axon"\nblock = "[mcp_servers.axon]\\ncommand = \\"axon\\""\n';
    });

    const skillsState = await loadSkillsCatalogState();
    const toolsState = await loadToolsCatalogState();

    expect(skillsState.enabled).toBe(true);
    expect(skillsState.items[0]?.name).toBe("ok-skill");
    expect(toolsState.enabled).toBe(false);
    expect(toolsState.error).toBe("desabilitada com aviso");
  });

  it("prefers project-root catalogs over cwd catalogs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline test fallback")));
    const cwd = process.cwd();
    const rootSkills = path.resolve(cwd, "..", "skills.toml");
    const localSkills = path.resolve(cwd, "skills.toml");

    const pathExistsSpy = vi.spyOn(fsAdapter, "pathExists").mockImplementation(async (target) => {
      return target === rootSkills || target === localSkills;
    });

    const readSpy = vi.spyOn(fsAdapter, "readTextFile").mockImplementation(async (target) => {
      if (target === rootSkills) {
        return '[[skill]]\nname = "root-skill"\ninstall = "echo root"\n';
      }
      return '[[skill]]\nname = "cwd-skill"\ninstall = "echo cwd"\n';
    });

    const state = await loadSkillsCatalogState();

    expect(state.enabled).toBe(true);
    expect(state.items[0]?.name).toBe("root-skill");
    expect(readSpy).toHaveBeenCalledWith(rootSkills);
    expect(pathExistsSpy).toHaveBeenCalledWith(rootSkills);
  });
});
