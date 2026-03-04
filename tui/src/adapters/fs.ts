import fs from "node:fs/promises";
import path from "node:path";

export function expandHome(inputPath: string): string {
  if (!inputPath.startsWith("~")) {
    return inputPath;
  }
  const home = process.env.HOME ?? "";
  if (inputPath === "~") {
    return home;
  }
  if (inputPath.startsWith("~/")) {
    return path.join(home, inputPath.slice(2));
  }
  return inputPath;
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextFile(targetPath: string): Promise<string> {
  return fs.readFile(targetPath, "utf8");
}

export async function writeTextFile(targetPath: string, content: string): Promise<void> {
  await fs.writeFile(targetPath, content, "utf8");
}

export async function ensureDir(targetPath: string): Promise<void> {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function appendTextFile(targetPath: string, content: string): Promise<void> {
  await fs.appendFile(targetPath, content, "utf8");
}

export async function removePath(targetPath: string): Promise<void> {
  if (!(await pathExists(targetPath))) {
    return;
  }
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function getFileSize(targetPath: string): Promise<number> {
  const stat = await fs.stat(targetPath);
  return stat.size;
}

export async function renamePath(fromPath: string, toPath: string): Promise<void> {
  await fs.rename(fromPath, toPath);
}
