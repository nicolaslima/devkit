import type { ConfigDiffItem } from "../../types";
import type { ScreenRow } from "../runtime/view";

export function buildConfigSyncWorkspaceRows(
  configDiff: ConfigDiffItem[],
  cursor: number,
): ScreenRow[] {
  if (configDiff.length === 0) {
    return [{ key: "diff-empty", line: "No missing/different items", active: true }];
  }

  return configDiff.map((item, index) => ({
    key: item.id,
    line: `${item.status.padEnd(9)} ${item.path}`,
    active: index === cursor,
  }));
}
