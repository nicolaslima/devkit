import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";

interface HelpModalProps {
  width: number;
  height: number;
}

const HELP_LINES = [
  "[1..7] abrir modulo",
  "[Tab/Shift+Tab] trocar modulo",
  "[↑↓/j/k] navegar",
  "[Enter] acao",
  "[Space] selecionar item (skills/tools)",
  "[i/r] skills batch install/remove",
  "[Shift+I/Shift+D] skill atual install/remove",
  "[i/u/x/c] tools install/update/uninstall/configure",
  "[t] toggle MCP",
  "[a] aplicar config diff",
  "[?] ajuda  [Esc] fechar modal  [q] sair",
];

export function HelpModal({ width, height }: HelpModalProps) {
  return (
    <box
      position="absolute"
      top={Math.max(Math.floor(height / 2) - 7, 1)}
      left={Math.max(Math.floor(width / 2) - 36, 1)}
      width={72}
      border
      borderColor={theme.accentSecondary}
      backgroundColor={theme.bgOverlay}
      padding={1}
      zIndex={30}
      flexDirection="column"
    >
      <text fg={theme.accentSecondary} attributes={TextAttributes.BOLD}>
        Keyboard Help
      </text>
      {HELP_LINES.map((line) => (
        <text key={line} fg={theme.fgDefault}>
          {line}
        </text>
      ))}
    </box>
  );
}
