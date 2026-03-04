import path from "node:path";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

function parseManifest(content: string): Array<{ asset: string; target: string }> {
  const rows = content.split(/\r?\n/);
  const parsed: Array<{ asset: string; target: string }> = [];

  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [asset, target] = trimmed.split(/\s+/, 2);
    if (!asset || !target) {
      continue;
    }

    parsed.push({ asset, target });
  }

  return parsed;
}

describe("release build contract", () => {
  it("tracks expected release asset names for supported platforms", async () => {
    const manifestPath = path.join(process.cwd(), "..", "scripts", "release-assets-manifest.txt");
    const raw = await readFile(manifestPath, "utf8");
    const entries = parseManifest(raw);

    const assetNames = entries.map((entry) => entry.asset);
    expect(assetNames).toEqual([
      "devkit-darwin-arm64",
      "devkit-darwin-amd64",
      "devkit-linux-arm64",
      "devkit-linux-amd64",
    ]);
  });
});
