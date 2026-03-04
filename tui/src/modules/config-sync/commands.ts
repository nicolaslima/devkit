import {
  applyConfigDiffItem,
  buildConfigDiff,
  resolveReferenceConfigPath,
} from "../../actions/configSync";
import { LOCAL_CODEX_CONFIG, REFERENCE_CONFIG_CANDIDATES } from "../../constants";
import type { ConfigDiffItem } from "../../types";
import type { ModuleRuntimeContext } from "../runtime/types";

interface ConfigSyncStateDeps {
  setReferenceConfigPath: (value: string) => void;
  setConfigDiff: (value: ConfigDiffItem[]) => void;
}

interface ConfigSyncApplyDeps {
  configDiff: ConfigDiffItem[];
  currentIndex: number;
  refreshConfigDiff: () => Promise<void>;
  refreshMcp: () => Promise<void>;
  setConfirmAction: (
    value: {
      title: string;
      details: string[];
      run: () => Promise<void>;
    } | null,
  ) => void;
  setConfirmFocusConfirm: (value: boolean) => void;
}

export interface ConfigSyncCommands {
  refreshConfigDiff: () => Promise<void>;
  applyCurrent: () => Promise<void>;
}

export async function refreshConfigDiffCommand(deps: ConfigSyncStateDeps): Promise<void> {
  const refPath = await resolveReferenceConfigPath(REFERENCE_CONFIG_CANDIDATES);
  deps.setReferenceConfigPath(refPath);
  const diff = await buildConfigDiff(refPath, LOCAL_CODEX_CONFIG);
  deps.setConfigDiff(diff);
}

export async function applyCurrentConfigDiffCommand(
  deps: ModuleRuntimeContext & ConfigSyncApplyDeps,
): Promise<void> {
  const item = deps.configDiff[deps.currentIndex];
  if (!item) {
    deps.appendLog("nenhum item de diff");
    return;
  }

  const doApply = async () => {
    await applyConfigDiffItem(LOCAL_CODEX_CONFIG, item);
    await deps.refreshConfigDiff();
    await deps.refreshMcp();
  };

  if (item.kind === "section-missing") {
    deps.clearLightConfirm();
    deps.setConfirmAction({
      title: `apply diff ${item.path}`,
      details: ["item section-missing", "acao pode alterar bloco inteiro"],
      run: doApply,
    });
    deps.setConfirmFocusConfirm(false);
    return;
  }

  if (!deps.requestLightConfirm(`config-apply-${item.id}`, `apply diff ${item.path}`)) {
    return;
  }

  await deps.runTask(`apply diff ${item.path}`, doApply);
}
