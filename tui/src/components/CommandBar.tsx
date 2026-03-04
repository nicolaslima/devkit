import { theme } from "../theme";

interface CommandBarProps {
  hint: string;
}

export function CommandBar({ hint }: CommandBarProps) {
  return (
    <box border borderColor={theme.fgMuted} paddingX={1} paddingY={0}>
      <text fg={theme.fgMuted}>{hint}</text>
    </box>
  );
}
