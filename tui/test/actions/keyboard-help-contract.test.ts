import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("keyboard help contract", () => {
  it("keeps key bindings centralized in app/keymap", async () => {
    const keyboardPath = path.resolve(process.cwd(), "src/screens/main/useMainKeyboard.ts");
    const content = await readFile(keyboardPath, "utf8");

    expect(content).toContain('from "../../app/keymap"');
    expect(content).toContain("isHelpToggleKey");
    expect(content).toContain("resolveTabShortcut");
  });

  it("wires help modal in MainScreen and command bar hint", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).toContain('import { HelpModal } from "../components/HelpModal";');
    expect(content).toContain("const [helpOpen, setHelpOpen] = useState(false);");
    expect(content).toContain("useMainKeyboard({");
    expect(content).toContain("<HelpModal width={width} height={height} />");
  });
});
