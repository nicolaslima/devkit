import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("MainScreen modularity contract", () => {
  it("delegates static config and hint builders to dedicated modules", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).toContain('from "./main/tabConfig";');
    expect(content).toContain("TAB_ORDER");
    expect(content).toContain("TAB_LABELS");
    expect(content).toContain('import { buildCommandBarText } from "./main/commandHints";');
    expect(content).toContain('import { humanError, nowTime } from "./main/errorFormat";');
    expect(content).not.toContain("const TAB_ORDER: AppTab[] =");
    expect(content).not.toContain("function buildCommandHint(activeTab: AppTab): string");
  });

  it("delegates keyboard wiring to a dedicated hook", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).toContain('import { useMainKeyboard } from "./main/useMainKeyboard";');
    expect(content).toContain("useMainKeyboard({");
    expect(content).not.toContain("useKeyboard((key) => {");
  });

  it("delegates workspace and inspector builders to module slices", async () => {
    const viewModelPath = path.resolve(process.cwd(), "src/screens/main/useMainViewModel.ts");
    const content = await readFile(viewModelPath, "utf8");

    expect(content).toContain('from "../../modules/skills/workspace"');
    expect(content).toContain('from "../../modules/skills/inspector"');
    expect(content).toContain('from "../../modules/tools/workspace"');
    expect(content).toContain('from "../../modules/tools/inspector"');
    expect(content).toContain('from "../../modules/config-sync/workspace"');
    expect(content).toContain('from "../../modules/config-sync/inspector"');
    expect(content).toContain('from "../../modules/runtime/view"');
    expect(content).not.toContain('from "../tabs/homeTab"');
    expect(content).not.toContain('from "../tabs/skillsTab"');
    expect(content).not.toContain('from "../tabs/codexTab"');
    expect(content).not.toContain('from "../tabs/mcpTab"');
    expect(content).not.toContain('from "../tabs/configSyncTab"');
    expect(content).not.toContain('from "../tabs/toolsTab"');
    expect(content).not.toContain('from "../tabs/runPlanTab"');
    expect(content).not.toContain('from "../tabs/types"');
  });
});
