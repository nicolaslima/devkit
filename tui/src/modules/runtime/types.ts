export interface ModuleRuntimeContext {
  appendLog: (message: string) => void;
  clearLightConfirm: () => void;
  requestLightConfirm: (token: string, label: string) => boolean;
  runTask: (title: string, task: () => Promise<void>) => Promise<void>;
}
