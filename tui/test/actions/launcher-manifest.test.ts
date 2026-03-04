import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface ManifestContract {
  app: string;
  version: string;
  entry: string;
  min_bun: string;
  files: string[];
}

async function readManifest(): Promise<ManifestContract> {
  const manifestPath = path.join(process.cwd(), "manifest.json");
  const raw = await readFile(manifestPath, "utf8");
  return JSON.parse(raw) as ManifestContract;
}

async function listFilesRecursive(baseDir: string): Promise<string[]> {
  const output: string[] = [];
  const entries = await readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolute = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await listFilesRecursive(absolute)));
      continue;
    }
    output.push(path.relative(process.cwd(), absolute));
  }

  return output.sort((a, b) => a.localeCompare(b));
}

describe("launcher/manifest contract", () => {
  it("manifest has required V1 fields", async () => {
    const manifest = await readManifest();

    expect(manifest.app).toBe("devkit");
    expect(typeof manifest.version).toBe("string");
    expect(manifest.version.length).toBeGreaterThan(0);
    expect(typeof manifest.entry).toBe("string");
    expect(manifest.entry.length).toBeGreaterThan(0);
    expect(typeof manifest.min_bun).toBe("string");
    expect(manifest.min_bun.length).toBeGreaterThan(0);
    expect(Array.isArray(manifest.files)).toBe(true);
    expect(manifest.files.length).toBeGreaterThan(0);
  });

  it("manifest entry and listed files exist on disk", async () => {
    const manifest = await readManifest();

    for (const relativePath of manifest.files) {
      const target = path.join(process.cwd(), relativePath);
      await expect(readFile(target, "utf8")).resolves.toBeTypeOf("string");
    }

    await expect(readFile(path.join(process.cwd(), manifest.entry), "utf8")).resolves.toBeTypeOf("string");
  });

  it("manifest tracks all runtime source files under src", async () => {
    const manifest = await readManifest();
    const srcFiles = await listFilesRecursive(path.join(process.cwd(), "src"));

    for (const relativePath of srcFiles) {
      expect(manifest.files).toContain(relativePath);
    }
  });

  it("keeps a single launcher source file", async () => {
    await expect(readFile(path.join(process.cwd(), "launcher.sh"), "utf8")).resolves.toBeTypeOf("string");
    await expect(readFile(path.join(process.cwd(), "runtime", "launcher.sh"), "utf8")).rejects.toThrow();
  });
});
