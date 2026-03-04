import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("architecture boundaries", () => {
  it("App.tsx remains orchestration-only and does not import domain actions", async () => {
    const appPath = path.resolve(process.cwd(), "src/app/App.tsx");
    const content = await readFile(appPath, "utf8");

    expect(content).toContain('import { MainScreen } from "../screens/MainScreen";');
    expect(content).not.toMatch(/\.\.\/actions\//);
    expect(content).not.toMatch(/\.\.\/adapters\//);
    expect(content).not.toMatch(/\.\.\/core\//);
  });
});
