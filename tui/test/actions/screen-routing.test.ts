import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REQUIRED_TAB_MODULES = [
  "homeTab.ts",
  "skillsTab.ts",
  "codexTab.ts",
  "mcpTab.ts",
  "configSyncTab.ts",
  "toolsTab.ts",
  "runPlanTab.ts",
];

describe("screen routing modules", () => {
  it("has dedicated tab modules for each top-level screen", async () => {
    const tabsDir = path.resolve(process.cwd(), "src/screens/tabs");

    for (const file of REQUIRED_TAB_MODULES) {
      await expect(access(path.join(tabsDir, file))).resolves.toBeUndefined();
    }
  });
});
