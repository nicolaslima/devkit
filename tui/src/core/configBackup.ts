import fs from "node:fs/promises";
import path from "node:path";
import { CODEX_BACKUP_KEEP } from "../constants";
import { pathExists } from "../adapters/fs";

function timestampNow(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}${ms}`;
}

async function listBackups(configPath: string): Promise<string[]> {
  const dir = path.dirname(configPath);
  const base = path.basename(configPath);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const backups = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(`${base}.bak-`))
    .map((entry) => path.join(dir, entry.name));
  backups.sort((a, b) => b.localeCompare(a));
  return backups;
}

export async function createCodexConfigBackup(configPath: string): Promise<string | null> {
  if (!(await pathExists(configPath))) {
    return null;
  }

  const backupPath = `${configPath}.bak-${timestampNow()}`;
  await fs.copyFile(configPath, backupPath);
  await pruneCodexConfigBackups(configPath, CODEX_BACKUP_KEEP);
  return backupPath;
}

export async function pruneCodexConfigBackups(configPath: string, keep = CODEX_BACKUP_KEEP): Promise<void> {
  const backups = await listBackups(configPath);
  if (backups.length <= keep) {
    return;
  }

  for (const backupPath of backups.slice(keep)) {
    await fs.rm(backupPath, { force: true });
  }
}
