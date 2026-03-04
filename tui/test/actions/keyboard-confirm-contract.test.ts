import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("keyboard confirm contract", () => {
  it("uses CONFIRM_KEYS in destructive confirm modal handling", async () => {
    const keyboardPath = path.resolve(process.cwd(), "src/screens/main/useMainKeyboard.ts");
    const content = await readFile(keyboardPath, "utf8");

    expect(content).toContain("if (confirmAction) {");
    expect(content).toContain("isConfirmKey(key.name, key.sequence, key.code)");
    expect(content).not.toContain('if (key.name === "enter") {');
  });
});
