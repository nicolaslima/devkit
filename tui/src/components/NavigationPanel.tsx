import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";
import type { AppTab } from "../types";

interface NavigationPanelProps {
  tabOrder: AppTab[];
  tabLabels: Record<AppTab, string>;
  activeTab: AppTab;
  moduleWarnings: Partial<Record<AppTab, string | null>>;
}

export function NavigationPanel({
  tabOrder,
  tabLabels,
  activeTab,
  moduleWarnings,
}: NavigationPanelProps) {
  return (
    <box
      width="22%"
      border
      borderColor={theme.fgMuted}
      title="Modules"
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      overflow="hidden"
    >
      {tabOrder.map((tab, index) => {
        const active = tab === activeTab;
        const warning = moduleWarnings[tab];
        return (
          <text
            key={`nav-${tab}`}
            fg={active ? theme.accentHover : warning ? theme.warning : theme.fgDefault}
            bg={active ? theme.accentSubtle : undefined}
            attributes={active ? TextAttributes.BOLD : TextAttributes.NONE}
          >
            {`${active ? ">" : " "} [${index + 1}] ${tabLabels[tab]}${warning ? " !" : ""}`}
          </text>
        );
      })}
    </box>
  );
}
