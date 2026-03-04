import path from "node:path";
import { AUDIT_LOG_PATH, MAX_AUDIT_BYTES, MAX_AUDIT_FILES, STATE_DIR } from "../constants";
import {
  appendTextFile,
  ensureDir,
  getFileSize,
  pathExists,
  renamePath,
} from "../adapters/fs";

function nowIso(): string {
  return new Date().toISOString();
}

export async function appendAudit(message: string): Promise<void> {
  await ensureDir(STATE_DIR);
  await rotateLogsIfNeeded();
  await appendTextFile(AUDIT_LOG_PATH, `${nowIso()} ${message}\n`);
}

async function rotateLogsIfNeeded(): Promise<void> {
  if (!(await pathExists(AUDIT_LOG_PATH))) {
    return;
  }

  const size = await getFileSize(AUDIT_LOG_PATH);
  if (size < MAX_AUDIT_BYTES) {
    return;
  }

  for (let index = MAX_AUDIT_FILES - 1; index >= 1; index -= 1) {
    const from = `${AUDIT_LOG_PATH}.${index}`;
    const to = `${AUDIT_LOG_PATH}.${index + 1}`;
    if (await pathExists(from)) {
      await renamePath(from, to);
    }
  }

  const archived = `${AUDIT_LOG_PATH}.1`;
  await renamePath(AUDIT_LOG_PATH, archived);

  const purgePath = `${AUDIT_LOG_PATH}.${MAX_AUDIT_FILES + 1}`;
  if (await pathExists(purgePath)) {
    const fs = await import("node:fs/promises");
    await fs.rm(purgePath, { force: true });
  }
}

export function getAuditPath(): string {
  return path.resolve(AUDIT_LOG_PATH);
}
