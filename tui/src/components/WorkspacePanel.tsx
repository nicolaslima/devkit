import { TextAttributes } from "@opentui/core";
import type { ScreenRow } from "../screens/tabs/types";
import { theme } from "../theme";
import { buildWorkspaceViewport } from "./workspaceViewport";

interface WorkspacePanelProps {
  title: string;
  rows: ScreenRow[];
  maxRows: number;
}

export function WorkspacePanel({ title, rows, maxRows }: WorkspacePanelProps) {
  const viewport = buildWorkspaceViewport(rows, maxRows);

  return (
    <box
      width="48%"
      border
      borderColor={theme.accent}
      focusedBorderColor={theme.accentHover}
      title={title}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      overflow="hidden"
    >
      {viewport.rows.map((row) => (
        <text
          key={row.key}
          fg={row.active ? theme.accentHover : theme.fgDefault}
          bg={row.active ? theme.accentSubtle : undefined}
          attributes={row.active ? TextAttributes.BOLD : TextAttributes.NONE}
        >
          {`${row.active ? ">" : " "} ${row.line}`}
        </text>
      ))}
    </box>
  );
}
