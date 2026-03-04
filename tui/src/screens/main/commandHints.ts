import type { AppTab } from "../../types";

function buildCommandHint(activeTab: AppTab): string {
  const common = "[Tab] trocar aba  [↑↓/j/k] navegar  [Enter] acao  [q] sair";
  switch (activeTab) {
    case "skills":
      return `${common}  [Space] selecionar  [i/r] batch  [Shift+I/Shift+D] skill atual`;
    case "tools":
      return `${common}  [Space] selecionar  [i/u/x/c] tools`;
    case "mcp":
      return `${common}  [t] toggle MCP`;
    case "configSync":
      return `${common}  [a] aplicar diff`;
    case "codex":
      return `${common}  [←/→] alternar alvo/canal`;
    default:
      return common;
  }
}

export function buildCommandBarText(activeTab: AppTab, lightConfirmActive: boolean): string {
  const base = buildCommandHint(activeTab);
  if (!lightConfirmActive) {
    return `${base}  [?] ajuda`;
  }
  return `Enter novamente para confirmar  |  ${base}`;
}
