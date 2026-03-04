import { TextAttributes } from "@opentui/core";
import { theme } from "../theme";

interface ConfirmModalProps {
  title: string;
  details: string[];
  confirmFocused: boolean;
  width: number;
  height: number;
}

export function ConfirmModal({ title, details, confirmFocused, width, height }: ConfirmModalProps) {
  const detailCountByValue = new Map<string, number>();
  const detailRows = details.slice(0, 6).map((detail) => {
    const occurrence = (detailCountByValue.get(detail) ?? 0) + 1;
    detailCountByValue.set(detail, occurrence);
    return { detail, key: `${detail}#${occurrence}` };
  });

  return (
    <box
      position="absolute"
      top={Math.max(Math.floor(height / 2) - 5, 1)}
      left={Math.max(Math.floor(width / 2) - 36, 1)}
      width={72}
      border
      borderColor={theme.warning}
      backgroundColor={theme.bgOverlay}
      padding={1}
      zIndex={20}
      flexDirection="column"
    >
      <text fg={theme.warning} attributes={TextAttributes.BOLD}>
        Confirmacao necessaria (destrutiva)
      </text>
      <text fg={theme.fgDefault}>{title}</text>
      {detailRows.map(({ detail, key }) => (
        <text key={key} fg={theme.fgMuted}>
          {`- ${detail}`}
        </text>
      ))}
      <text fg={theme.fgDefault}>
        {`[${confirmFocused ? " " : "x"}] Cancelar   [${confirmFocused ? "x" : " "}] Confirmar`}
      </text>
      <text fg={theme.fgMuted}>{"←/→ alternar  Enter executar opcao  Esc cancelar"}</text>
    </box>
  );
}
