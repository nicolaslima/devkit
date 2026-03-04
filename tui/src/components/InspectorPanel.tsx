import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";

interface InspectorPanelProps {
  title?: string;
  lines: string[];
  maxRows: number;
}

export function InspectorPanel({ title = "Inspector", lines, maxRows }: InspectorPanelProps) {
  return (
    <box
      width="30%"
      border
      borderColor={theme.fgMuted}
      title={title}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      overflow="hidden"
    >
      {lines.slice(0, Math.max(maxRows, 8)).map((line, index) => {
        if (line.startsWith("## ")) {
          return (
            <text
              key={`${index}-${line}`}
              fg={theme.accentSecondary}
              attributes={TextAttributes.BOLD}
            >
              {line.slice(3)}
            </text>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <text key={`${index}-${line}`} fg={theme.fgDefault}>
              {line}
            </text>
          );
        }

        return (
          <text key={`${index}-${line}`} fg={theme.fgMuted}>
            {line}
          </text>
        );
      })}
    </box>
  );
}
