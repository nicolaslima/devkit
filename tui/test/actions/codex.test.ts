import { afterEach, describe, expect, it, vi } from "vitest";
import * as shellAdapter from "../../src/adapters/shell";
import { resolveCodexDistTags, updateCodex } from "../../src/actions/codex";

describe("codex actions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps stable local update to exact stable command", async () => {
    const spy = vi.spyOn(shellAdapter, "runCommand").mockResolvedValue({
      command: "npm i -g @openai/codex",
      code: 0,
      stdout: "ok",
      stderr: "",
    });

    const command = await updateCodex("local", "stable", { latest: "1.0.0", alpha: "1.0.1-alpha" });

    expect(command).toBe("npm i -g @openai/codex");
    expect(spy).toHaveBeenCalledWith("npm i -g @openai/codex", expect.any(Object));
  });

  it("maps codespace mode to direct codespace command", async () => {
    const spy = vi.spyOn(shellAdapter, "runCommand").mockResolvedValue({
      command: "x",
      code: 0,
      stdout: "ok",
      stderr: "",
    });

    const command = await updateCodex("codespace", "stable", { latest: "1.0.0", alpha: "1.0.1-alpha" });

    expect(command).toContain("devcontainer-features/main/src/codex/install.sh");
    expect(spy).toHaveBeenCalled();
  });

  it("blocks alpha execution when alpha tag is missing", async () => {
    await expect(updateCodex("local", "alpha", { latest: "1.0.0", alpha: "" })).rejects.toThrow(
      "falha ao resolver versao alpha",
    );
  });

  it("resolveCodexDistTags returns short generic error on failure", async () => {
    vi.spyOn(shellAdapter, "runCommand").mockResolvedValue({
      command: "npm view",
      code: 1,
      stdout: "",
      stderr: "fail",
    });

    await expect(resolveCodexDistTags()).rejects.toThrow("falha ao resolver versao alpha");
  });
});
