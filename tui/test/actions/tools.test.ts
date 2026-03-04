import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdir, rm, writeFile } from "node:fs/promises";
import * as catalogAdapter from "../../src/adapters/catalog";
import * as shellAdapter from "../../src/adapters/shell";
import * as fsAdapter from "../../src/adapters/fs";
import * as mcpActions from "../../src/actions/mcp";
import {
  installOrUpdateTool,
  installOrUpdateTools,
  resolveToolCleanupPreview,
  resolveToolsCleanupPreview,
  uninstallTool,
  uninstallTools,
} from "../../src/actions/tools";
import { buildTmpName } from "../helpers/tmp";

const cleanupPaths: string[] = [];

async function createFile(target: string): Promise<void> {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, "x", "utf8");
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(cleanupPaths.splice(0).map((target) => rm(target, { recursive: true, force: true })));
});

describe("tools actions", () => {
  it("resolveToolCleanupPreview returns grouped summary sorted by count then label", async () => {
    const root = path.join(process.cwd(), buildTmpName("tool-clean"));
    cleanupPaths.push(root);

    await createFile(path.join(root, "a", "one"));
    await createFile(path.join(root, "a", "two"));
    await createFile(path.join(root, "b", "one"));
    await createFile(path.join(root, "c", "one"));

    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "axon",
        install: "i",
        update: "u",
        uninstall: "x",
        cleanup: [`${path.basename(root)}/*/*`, `${path.basename(root)}/none/**`, "/etc/**"],
      },
    ]);

    const preview = await resolveToolCleanupPreview("axon");

    expect(preview.total).toBe(4);
    expect(preview.groups).toEqual([
      { label: "a", count: 2 },
      { label: "b", count: 1 },
      { label: "c", count: 1 },
    ]);
    expect(preview.warnings).toContain(`warning: ${path.basename(root)}/none/**`);
    expect(preview.warnings).toContain("ignored: /etc/**");
  });

  it("resolveToolsCleanupPreview merges multiple selected tools", async () => {
    const root = path.join(process.cwd(), buildTmpName("tool-clean-merged"));
    cleanupPaths.push(root);

    await createFile(path.join(root, "one", "a"));
    await createFile(path.join(root, "two", "b"));

    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "axon",
        install: "i",
        update: "u",
        uninstall: "x",
        cleanup: [`${path.basename(root)}/one/*`],
      },
      {
        name: "reme",
        install: "i",
        update: "u",
        uninstall: "x",
        cleanup: [`${path.basename(root)}/two/*`],
      },
    ] as Awaited<ReturnType<typeof catalogAdapter.loadToolsCatalogStrict>>);

    const preview = await resolveToolsCleanupPreview(["axon", "reme"]);

    expect(preview.total).toBe(2);
    expect(preview.groups).toEqual([
      { label: "one", count: 1 },
      { label: "two", count: 1 },
    ]);
  });

  it("installOrUpdateTool returns compact token and failed names only", async () => {
    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "reme",
        install: "install-reme",
        update: "update-reme",
        uninstall: "uninstall-reme",
        cleanup: [],
      },
    ]);

    vi.spyOn(shellAdapter, "runCommand").mockResolvedValue({
      command: "install-reme",
      code: 1,
      stdout: "",
      stderr: "boom",
    });

    const logs: string[] = [];
    const result = await installOrUpdateTool("reme", (line) => logs.push(line), "install");

    expect(result).toEqual({
      total: 1,
      failed: 1,
      token: "1/1",
      failedNames: ["reme"],
    });
    expect(logs).toContain("tools install summary 1/1");
    expect(logs).toContain("tools install failed: reme");
  });

  it("installOrUpdateTools runs best-effort batch and reports N/T", async () => {
    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "axon",
        install: "install-axon",
        update: "update-axon",
        uninstall: "uninstall-axon",
        cleanup: [],
      },
      {
        name: "reme",
        install: "install-reme",
        update: "update-reme",
        uninstall: "uninstall-reme",
        cleanup: [],
      },
    ] as Awaited<ReturnType<typeof catalogAdapter.loadToolsCatalogStrict>>);

    vi.spyOn(shellAdapter, "runCommand")
      .mockResolvedValueOnce({ command: "install-axon", code: 0, stdout: "ok", stderr: "" })
      .mockResolvedValueOnce({ command: "install-reme", code: 1, stdout: "", stderr: "err" });

    const logs: string[] = [];
    const result = await installOrUpdateTools(["axon", "reme"], (line) => logs.push(line), "install");

    expect(result.token).toBe("1/2");
    expect(result.failedNames).toEqual(["reme"]);
    expect(logs).toContain("tools install summary 1/2");
    expect(logs).toContain("tools install failed: reme");
  });

  it("uninstallTool keeps warning list and continues cleanup best-effort", async () => {
    const root = path.join(process.cwd(), buildTmpName("tool-uninstall"));
    cleanupPaths.push(root);
    await createFile(path.join(root, "cache", "item"));

    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "openspec",
        install: "i",
        update: "u",
        uninstall: "uninstall-openspec",
        cleanup: [`${path.basename(root)}/cache/*`, `${path.basename(root)}/zero/**`],
      },
    ]);

    vi.spyOn(shellAdapter, "runCommand").mockResolvedValue({
      command: "uninstall-openspec",
      code: 0,
      stdout: "ok",
      stderr: "",
    });

    const removeSpy = vi.spyOn(fsAdapter, "removePath").mockResolvedValue(undefined);
    vi.spyOn(mcpActions, "removeMcpBlock").mockResolvedValue(true);

    const logs: string[] = [];
    const result = await uninstallTool("openspec", (line) => logs.push(line));

    expect(result.token).toBe("0/1");
    expect(result.failedNames).toEqual([]);
    expect(result.warnings?.some((entry) => entry.startsWith("warning: "))).toBe(true);
    expect(removeSpy).toHaveBeenCalled();
    expect(logs).toContain("tools uninstall summary 0/1");
  });

  it("uninstallTools runs best-effort batch and reports failed names only", async () => {
    const root = path.join(process.cwd(), buildTmpName("tool-uninstall-batch"));
    cleanupPaths.push(root);
    await createFile(path.join(root, "cache", "item"));

    vi.spyOn(catalogAdapter, "loadToolsCatalogStrict").mockResolvedValue([
      {
        name: "axon",
        install: "i",
        update: "u",
        uninstall: "uninstall-axon",
        cleanup: [`${path.basename(root)}/cache/*`],
      },
      {
        name: "reme",
        install: "i",
        update: "u",
        uninstall: "uninstall-reme",
        cleanup: [],
      },
    ] as Awaited<ReturnType<typeof catalogAdapter.loadToolsCatalogStrict>>);

    vi.spyOn(shellAdapter, "runCommand")
      .mockResolvedValueOnce({ command: "uninstall-axon", code: 0, stdout: "ok", stderr: "" })
      .mockResolvedValueOnce({ command: "uninstall-reme", code: 1, stdout: "", stderr: "err" });

    vi.spyOn(fsAdapter, "removePath").mockResolvedValue(undefined);
    vi.spyOn(mcpActions, "removeMcpBlock").mockResolvedValue(true);

    const logs: string[] = [];
    const result = await uninstallTools(["axon", "reme"], (line) => logs.push(line));

    expect(result.token).toBe("1/2");
    expect(result.failedNames).toEqual(["reme"]);
    expect(logs).toContain("tools uninstall summary 1/2");
    expect(logs).toContain("tools uninstall failed: reme");
  });
});
