import { afterEach, describe, expect, it, vi } from "vitest";
import * as fsAdapter from "../../src/adapters/fs";
import { readCatalogRemoteFirst } from "../../src/adapters/catalogRemote";

describe("catalog remote cache", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses remote catalog and stores cache when fetch succeeds", async () => {
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(false);
    const ensureDirSpy = vi.spyOn(fsAdapter, "ensureDir").mockResolvedValue();
    const writeSpy = vi.spyOn(fsAdapter, "writeTextFile").mockResolvedValue();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '[[skill]]\nname = "remote"\ninstall = "echo remote"\n',
      }),
    );

    const content = await readCatalogRemoteFirst("skills.toml", []);

    expect(content).toContain('name = "remote"');
    expect(ensureDirSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  it("uses cache when remote fetch fails", async () => {
    vi.spyOn(fsAdapter, "pathExists").mockImplementation(async (target) => {
      return target.toString().endsWith("skills.toml");
    });
    vi.spyOn(fsAdapter, "readTextFile").mockResolvedValue(
      '[[skill]]\nname = "cached"\ninstall = "echo cached"\n',
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const content = await readCatalogRemoteFirst("skills.toml", []);

    expect(content).toContain('name = "cached"');
  });

  it("throws when remote fetch fails and no cache/local fallback exists", async () => {
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(false);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(readCatalogRemoteFirst("skills.toml", [])).rejects.toThrow();
  });
});
