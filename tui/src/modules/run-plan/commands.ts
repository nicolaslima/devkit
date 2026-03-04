import type { ModuleRuntimeContext } from "../runtime/types";

export interface RunPlanCommands {
  runCurrent: () => Promise<void>;
}

export async function runPlanPrimaryActionCommand(
  deps: ModuleRuntimeContext & {
    currentIndex: number;
    logsCount: number;
  },
): Promise<void> {
  void deps.currentIndex;
  if (deps.logsCount <= 0) {
    deps.appendLog("run plan vazio");
    return;
  }

  deps.appendLog("run plan: sem acao primaria nesta aba");
}
