import type { ConfigDiffItem } from "../../types";
import { buildInspectorSections } from "../runtime/view";

export function buildConfigSyncInspectorLines(configDiff: ConfigDiffItem[], cursor: number): string[] {
  const item = configDiff[cursor];
  if (!item) {
    return buildInspectorSections([
      { title: "Selection", lines: ["Config aligned with reference"] },
      { title: "Impact", lines: ["No changes needed"] },
      { title: "Command", lines: ["Refresh config diff"] },
    ]);
  }

  return buildInspectorSections([
    {
      title: "Selection",
      lines: [`Item ${item.path}`, `Type ${item.kind}`, `Status ${item.status}`],
    },
    {
      title: "Command",
      lines: ["a or Enter apply this item only"],
    },
    {
      title: "Impact",
      lines: [`Ref ${item.referenceValue ?? "<none>"}`, `Local ${item.localValue ?? "<missing>"}`],
    },
  ]);
}
