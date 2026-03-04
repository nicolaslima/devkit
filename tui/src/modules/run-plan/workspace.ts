import type { ScreenRow } from "../runtime/view";

export function buildRunPlanWorkspaceRows(logs: string[]): ScreenRow[] {
  if (logs.length === 0) {
    return [{ key: "runplan-empty", line: "No logs", active: true }];
  }

  return logs.map((line, index) => ({
    key: `log-${index}`,
    line,
    active: index === logs.length - 1,
  }));
}
