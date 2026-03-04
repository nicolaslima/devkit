import { describe, expect, it, vi } from "vitest";
import { runHomePrimaryActionCommand } from "../../src/modules/home/commands";

const HOME_ACTIONS = [
  "Refresh catalog",
  "Install selected skills",
  "Remove selected local skills",
  "Refresh MCP list",
  "Refresh config diff",
  "Install OpenSpec + configure Codex",
];

describe("catalog refresh flow", () => {
  it("runs refresh catalog through runTask when confirmed", async () => {
    const refreshCatalog = vi.fn().mockResolvedValue(undefined);
    const runTask = vi.fn(async (_title: string, task: () => Promise<void>) => {
      await task();
    });

    await runHomePrimaryActionCommand({
      appendLog: vi.fn(),
      clearLightConfirm: vi.fn(),
      requestLightConfirm: vi.fn().mockReturnValue(true),
      runTask,
      homeActions: HOME_ACTIONS,
      currentIndex: 0,
      installSelectedSkillsAction: vi.fn(),
      removeSelectedSkillsAction: vi.fn(),
      refreshCatalog,
      refreshMcp: vi.fn(),
      refreshConfigDiff: vi.fn(),
      installOpenSpecAndConfigure: vi.fn(),
    });

    expect(runTask).toHaveBeenCalledWith("refresh catalog", refreshCatalog);
    expect(refreshCatalog).toHaveBeenCalledTimes(1);
  });

  it("does not run refresh catalog when confirmation is not granted", async () => {
    const runTask = vi.fn();

    await runHomePrimaryActionCommand({
      appendLog: vi.fn(),
      clearLightConfirm: vi.fn(),
      requestLightConfirm: vi.fn().mockReturnValue(false),
      runTask,
      homeActions: HOME_ACTIONS,
      currentIndex: 0,
      installSelectedSkillsAction: vi.fn(),
      removeSelectedSkillsAction: vi.fn(),
      refreshCatalog: vi.fn(),
      refreshMcp: vi.fn(),
      refreshConfigDiff: vi.fn(),
      installOpenSpecAndConfigure: vi.fn(),
    });

    expect(runTask).not.toHaveBeenCalled();
  });
});
