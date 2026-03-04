import { describe, expect, it } from "vitest";
import { buildLightConfirmMessage, resolveLightConfirm } from "../../src/core/lightConfirm";

describe("light confirmation", () => {
  it("arms on first trigger and confirms on second Enter for same token", () => {
    const first = resolveLightConfirm(null, "skills-install-selected");
    expect(first).toEqual({
      confirmed: false,
      nextToken: "skills-install-selected",
    });

    const second = resolveLightConfirm(first.nextToken, "skills-install-selected");
    expect(second).toEqual({
      confirmed: true,
      nextToken: null,
    });
  });

  it("switches pending token when action changes", () => {
    const first = resolveLightConfirm("skills-install-selected", "mcp-toggle-axon-on");
    expect(first).toEqual({
      confirmed: false,
      nextToken: "mcp-toggle-axon-on",
    });
  });

  it("emits short message for UI prompt", () => {
    expect(buildLightConfirmMessage("refresh all")).toBe("Enter novamente para confirmar: refresh all");
  });
});
