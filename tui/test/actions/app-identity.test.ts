import path from "node:path";
import { describe, expect, it } from "vitest";
import { APP_NAME, STATE_DIR } from "../../src/constants";

describe("app identity", () => {
  it("uses devkit as app name", () => {
    expect(APP_NAME).toBe("devkit");
  });

  it("stores app state under ~/.local/state/devkit", () => {
    const expectedSuffix = path.join(".local", "state", "devkit");
    expect(STATE_DIR.endsWith(expectedSuffix)).toBe(true);
  });
});
