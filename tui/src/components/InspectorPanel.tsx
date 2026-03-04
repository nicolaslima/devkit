import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";

interface InspectorPanelProps {
  title?: string;
  lines: string[];
  maxRows: number;
}

export function InspectorPanel({ title = "Inspector", lines, maxRows }: InspectorPanelProps) {
  const lineCountByValue = new Map<string, number>();
  const keyedLines = lines.slice(0, Math.max(maxRows, 8)).map((line) => {
    const occurrence = (lineCountByValue.get(line) ?? 0) + 1;
    lineCountByValue.set(line, occurrence);
    return { line, key: `${line}#${occurrence}` };
  });

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
      {keyedLines.map(({ line, key }) => {
        if (line.startsWith("## ")) {
          return (
            <text key={key} fg={theme.accentSecondary} attributes={TextAttributes.BOLD}>
              {line.slice(3)}
            </text>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <text key={key} fg={theme.fgDefault}>
              {line}
            </text>
          );
        }

        return (
          <text key={key} fg={theme.fgMuted}>
            {line}
          </text>
        );
      })}
    </box>
  );
}
