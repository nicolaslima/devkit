import { describe, expect, it } from "vitest";
import { isConfirmKey } from "../../src/app/keymap";

describe("confirm key normalization", () => {
  it("accepts enter/return aliases", () => {
    expect(isConfirmKey("enter")).toBe(true);
    expect(isConfirmKey("return")).toBe(true);
    expect(isConfirmKey("kpenter")).toBe(true);
    expect(isConfirmKey("numpadenter")).toBe(true);
  });

  it("accepts raw newline sequences and Enter-like key codes", () => {
    expect(isConfirmKey("unknown", "\r")).toBe(true);
    expect(isConfirmKey("unknown", "\n")).toBe(true);
    expect(isConfirmKey("unknown", "", "NumpadEnter")).toBe(true);
  });

  it("does not accept unrelated keys", () => {
    expect(isConfirmKey("space")).toBe(false);
    expect(isConfirmKey("x", "x", "KeyX")).toBe(false);
  });
});
