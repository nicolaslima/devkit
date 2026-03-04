import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";

interface TopStatusBarProps {
  appName: string;
  busy: boolean;
  activeModule: string;
  profileLabel: string;
  localConfigPath: string;
}

export function TopStatusBar({
  appName,
  busy,
  activeModule,
  profileLabel,
  localConfigPath,
}: TopStatusBarProps) {
  return (
    <box border borderColor={theme.accent} paddingX={1} paddingY={0} flexDirection="column">
      <box width="100%" justifyContent="space-between">
        <text fg={theme.fgDefault} attributes={TextAttributes.BOLD}>
          {appName}
        </text>
        <text fg={busy ? theme.warning : theme.success}>{busy ? "running" : "idle"}</text>
      </box>
      <text fg={theme.fgMuted}>
        {`Module: ${activeModule}   Profile: ${profileLabel}   Config: ${localConfigPath}`}
      </text>
    </box>
  );
}
