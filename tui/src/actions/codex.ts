import { runCommand } from "../adapters/shell";
import { CODEX_CODESPACE_UPDATE_COMMAND } from "../constants";
import type { CodexChannel, CodexTarget } from "../types";

export interface DistTags {
  latest: string;
  alpha: string;
}

export async function resolveCodexDistTags(): Promise<DistTags> {
  const result = await runCommand("npm view @openai/codex dist-tags --json", {
    timeoutMs: 60_000,
  });

  if (result.code !== 0) {
    throw new Error("falha ao resolver versao alpha");
  }

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(result.stdout) as Record<string, string>;
  } catch {
    throw new Error("falha ao resolver versao alpha");
  }

  const latest = parsed.latest ?? "unknown";
  const alpha = parsed.alpha ?? "";

  return {
    latest,
    alpha,
  };
}

export async function updateCodex(
  target: CodexTarget,
  channel: CodexChannel,
  distTags: DistTags,
): Promise<string> {
  let command = "";

  if (target === "codespace") {
    command = CODEX_CODESPACE_UPDATE_COMMAND;
  } else if (channel === "alpha") {
    if (!distTags.alpha || distTags.alpha === "unknown") {
      throw new Error("falha ao resolver versao alpha");
    }
    command = `npm i -g @openai/codex@${distTags.alpha}`;
  } else {
    command = "npm i -g @openai/codex";
  }

  const result = await runCommand(command, { timeoutMs: 600_000 });
  if (result.code !== 0) {
    throw new Error("falha ao atualizar codex");
  }

  return command;
}

export async function getInstalledCodexVersion(): Promise<string> {
  const result = await runCommand("codex --version", { timeoutMs: 20_000 });
  if (result.code !== 0) {
    return "not installed";
  }
  return result.stdout || "unknown";
}
