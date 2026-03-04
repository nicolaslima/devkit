import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("passes in GREEN phase", () => {
    expect(1 + 1).toBe(2);
  });
});
