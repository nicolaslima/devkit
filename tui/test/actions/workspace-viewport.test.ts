import { describe, expect, it } from "vitest";
import { buildWorkspaceViewport } from "../../src/components/workspaceViewport";
import type { ScreenRow } from "../../src/screens/tabs/types";

function makeRows(total: number, activeIndex: number): ScreenRow[] {
  return Array.from({ length: total }).map((_, index) => ({
    key: `row-${index}`,
    line: `row-${index}`,
    active: index === activeIndex,
  }));
}

describe("workspace viewport", () => {
  it("keeps active row visible in long lists", () => {
    const rows = makeRows(30, 20);

    const viewport = buildWorkspaceViewport(rows, 8);

    expect(viewport.rows).toHaveLength(8);
    expect(viewport.rows.some((row) => row.active)).toBe(true);
    expect(viewport.rows[0]?.key).toBe("row-16");
  });

  it("returns all rows when list is smaller than viewport", () => {
    const rows = makeRows(5, 3);

    const viewport = buildWorkspaceViewport(rows, 8);

    expect(viewport.rows).toHaveLength(5);
    expect(viewport.start).toBe(0);
    expect(viewport.rows[3]?.active).toBe(true);
  });
});
