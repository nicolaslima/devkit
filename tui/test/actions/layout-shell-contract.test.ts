import path from "node:path";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("layout shell contract", () => {
  it("composes MainScreen with TopStatusBar and CommandBar", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).toContain('import { TopStatusBar } from "../components/TopStatusBar";');
    expect(content).toContain('import { CommandBar } from "../components/CommandBar";');
    expect(content).toContain("<TopStatusBar");
    expect(content).toContain("<CommandBar");
  });

  it("removes duplicated top tab strip in favor of module rail", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).not.toContain("const tabHeader = TAB_ORDER.map");
  });
});
