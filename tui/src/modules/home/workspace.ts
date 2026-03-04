import type { ScreenRow } from "../runtime/view";

export function buildHomeWorkspaceRows(homeActions: string[], cursor: number): ScreenRow[] {
  return homeActions.map((action, index) => ({
    key: `${index}`,
    line: action,
    active: index === cursor,
  }));
}
