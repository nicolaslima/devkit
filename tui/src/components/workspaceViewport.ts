import type { ScreenRow } from "../screens/tabs/types";

export interface WorkspaceViewport {
  rows: ScreenRow[];
  start: number;
}

function resolveActiveIndex(rows: ScreenRow[]): number {
  const index = rows.findIndex((row) => row.active);
  return index >= 0 ? index : 0;
}

export function buildWorkspaceViewport(rows: ScreenRow[], maxRows: number): WorkspaceViewport {
  const visibleRows = Math.max(maxRows, 8);
  if (rows.length <= visibleRows) {
    return { rows, start: 0 };
  }

  const activeIndex = resolveActiveIndex(rows);
  const centeredStart = activeIndex - Math.floor(visibleRows / 2);
  const maxStart = rows.length - visibleRows;
  const start = Math.max(Math.min(centeredStart, maxStart), 0);
  const end = start + visibleRows;

  return {
    rows: rows.slice(start, end),
    start,
  };
}
