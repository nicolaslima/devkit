import {
  getInstalledCodexVersion,
  resolveCodexDistTags,
  updateCodex,
  type DistTags,
} from "../../actions/codex";
import type { CodexChannel, CodexTarget } from "../../types";
import type { ModuleRuntimeContext } from "../runtime/types";

interface CodexStateDeps {
  distTags: DistTags;
  setDistTags: (tags: DistTags) => void;
  setCodexVersion: (value: string) => void;
}

export interface CodexCommands {
  refreshCodex: () => Promise<void>;
  updateCodex: (target: CodexTarget | null, channel: CodexChannel) => Promise<void>;
}

export type { DistTags } from "../../actions/codex";

export async function refreshCodexCommand(deps: CodexStateDeps): Promise<void> {
  const [tags, version] = await Promise.all([resolveCodexDistTags(), getInstalledCodexVersion()]);
  deps.setDistTags(tags);
  deps.setCodexVersion(version);
}

export async function updateCodexCommand(
  deps: ModuleRuntimeContext & CodexStateDeps,
  target: CodexTarget | null,
  channel: CodexChannel,
): Promise<void> {
  if (!target) {
    deps.appendLog("selecione local ou codespace");
    return;
  }

  if (!deps.requestLightConfirm(`codex-update-${target}-${channel}`, `codex update ${target} ${channel}`)) {
    return;
  }

  await deps.runTask(`codex update ${target} ${channel}`, async () => {
    const currentTags = deps.distTags.latest === "-" ? await resolveCodexDistTags() : deps.distTags;
    deps.setDistTags(currentTags);
    const command = await updateCodex(target, channel, currentTags);
    deps.appendLog(`command: ${command}`);
    deps.setCodexVersion(await getInstalledCodexVersion());
  });
}
