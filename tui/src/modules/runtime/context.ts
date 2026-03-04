import type { ModuleRuntimeContext } from "./types";

export function toModuleRuntimeContext(context: ModuleRuntimeContext): ModuleRuntimeContext {
  return {
    appendLog: context.appendLog,
    clearLightConfirm: context.clearLightConfirm,
    requestLightConfirm: context.requestLightConfirm,
    runTask: context.runTask,
  };
}
