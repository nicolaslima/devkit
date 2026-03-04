import type { CodexChannel, CodexTarget } from "../../types";
import type { ScreenRow } from "../runtime/view";

export function buildCodexWorkspaceRows(
  codexTarget: CodexTarget | null,
  codexChannel: CodexChannel,
  cursor: number,
): ScreenRow[] {
  const rows = [
    `Target: ${codexTarget ?? "<selecione>"}`,
    `Channel: ${codexChannel}`,
    codexTarget ? "Confirmar update" : "Selecione alvo antes de executar",
    "Refresh dist-tags/version",
  ];

  return rows.map((line, index) => ({
    key: `codex-${index}`,
    line,
    active: index === cursor,
  }));
}
