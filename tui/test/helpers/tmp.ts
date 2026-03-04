export function buildTmpName(prefix = "tmp"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
