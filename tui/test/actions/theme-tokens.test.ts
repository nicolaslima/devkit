import { describe, expect, it } from "vitest";
import { theme } from "../../src/theme";

describe("theme tokens", () => {
  it("matches approved dark + orange palette", () => {
    expect(theme.bgBase).toBe("#141413");
    expect(theme.fgDefault).toBe("#faf9f5");
    expect(theme.fgMuted).toBe("#b0aea5");
    expect(theme.bgSoft).toBe("#e8e6dc");
    expect(theme.accent).toBe("#d97757");
    expect(theme.accentSecondary).toBe("#6a9bcc");
    expect(theme.accentTertiary).toBe("#788c5d");
  });
});
