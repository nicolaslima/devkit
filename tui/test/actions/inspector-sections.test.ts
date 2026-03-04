import { describe, expect, it } from "vitest";
import { buildInspectorSections } from "../../src/screens/tabs/inspectorSections";

describe("inspector sections", () => {
  it("formats sections with stable heading and bullet prefixes", () => {
    const lines = buildInspectorSections([
      { title: "Selection", lines: ["Skill abc"] },
      { title: "Command", lines: ["i install selected"] },
    ]);

    expect(lines).toEqual([
      "## Selection",
      "- Skill abc",
      "",
      "## Command",
      "- i install selected",
    ]);
  });

  it("removes trailing blank lines and empty sections", () => {
    const lines = buildInspectorSections([
      { title: "Selection", lines: [] },
      { title: "Impact", lines: ["No changes needed"] },
    ]);

    expect(lines).toEqual(["## Impact", "- No changes needed"]);
  });
});
