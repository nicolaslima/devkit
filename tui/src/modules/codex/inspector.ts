import type { CodexChannel, CodexTarget } from "../../types";
import { buildInspectorSections } from "../runtime/view";

export interface CodexInspectorInput {
  codexTarget: CodexTarget | null;
  codexChannel: CodexChannel;
  codexVersion: string;
  latest: string;
  alpha: string;
}

export function buildCodexInspectorLines(input: CodexInspectorInput): string[] {
  const previewCommand = !input.codexTarget
    ? "<selecione alvo>"
    : input.codexTarget === "codespace"
      ? 'sudo bash -c "curl -fsSL https://raw.githubusercontent.com/jsburckhardt/devcontainer-features/main/src/codex/install.sh | bash"'
      : input.codexChannel === "stable"
        ? "npm i -g @openai/codex"
        : input.alpha && input.alpha !== "-"
          ? `npm i -g @openai/codex@${input.alpha}`
          : "<alpha indisponivel>";

  return buildInspectorSections([
    {
      title: "Selection",
      lines: [
        `Target ${input.codexTarget ?? "<selecione>"}`,
        `Channel ${input.codexChannel}`,
        `Current version ${input.codexVersion}`,
      ],
    },
    {
      title: "Command",
      lines: [previewCommand],
    },
    {
      title: "Impact",
      lines: [`Stable dist-tag ${input.latest}`, `Alpha dist-tag ${input.alpha}`],
    },
  ]);
}
