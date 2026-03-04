import path from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import type { ConfigDiffItem } from "../../src/types";
import { applyConfigDiffItem, buildConfigDiff } from "../../src/actions/configSync";
import { buildTmpName } from "../helpers/tmp";

const createdFiles: string[] = [];

function tmpTomlPath(prefix: string): string {
  const filePath = path.join(tmpdir(), `${buildTmpName(prefix)}.toml`);
  createdFiles.push(filePath);
  return filePath;
}

async function writeToml(prefix: string, content: string): Promise<string> {
  const filePath = tmpTomlPath(prefix);
  await writeFile(filePath, content, "utf8");
  return filePath;
}

async function readToml(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

afterEach(async () => {
  await Promise.all(
    createdFiles.splice(0).map(async (filePath) => {
      await rm(filePath, { force: true });
      const dir = path.dirname(filePath);
      const base = path.basename(filePath);
      const entries = await readdir(dir);
      await Promise.all(
        entries
          .filter((entry) => entry.startsWith(`${base}.bak-`))
          .map((entry) => rm(path.join(dir, entry), { force: true })),
      );
    }),
  );
});

describe("configSync actions", () => {
  it("buildConfigDiff reports missing, different and only-local", async () => {
    const referencePath = await writeToml(
      "config-ref",
      [
        "[core]",
        'alpha = "1"',
        'beta = "2"',
      ].join("\n"),
    );
    const localPath = await writeToml(
      "config-local",
      [
        "[core]",
        'alpha = "9"',
        'gamma = "local-only"',
      ].join("\n"),
    );

    const diffs = await buildConfigDiff(referencePath, localPath);
    const kindsAndPaths = diffs.map((diff) => `${diff.kind}:${diff.path}`).sort();

    expect(kindsAndPaths).toEqual([
      "key-different:core.alpha",
      "key-missing:core.beta",
      "key-only-local:core.gamma",
    ]);
  });

  it("applyConfigDiffItem updates existing key line only", async () => {
    const referencePath = await writeToml(
      "config-ref",
      [
        "[core]",
        'alpha = "1"',
        'beta = "2"',
        "# keep this comment",
      ].join("\n"),
    );
    const localPath = await writeToml(
      "config-local",
      [
        "[core]",
        'alpha = "1"',
        'beta = "9"',
        "# keep this comment",
      ].join("\n"),
    );

    const diffs = await buildConfigDiff(referencePath, localPath);
    const diffItem = diffs.find(
      (item) => item.kind === "key-different" && item.path === "core.beta",
    );

    expect(diffItem).toBeDefined();
    const item = diffItem as ConfigDiffItem;

    const beforeLines = (await readToml(localPath)).split("\n");
    await applyConfigDiffItem(localPath, item);
    const afterLines = (await readToml(localPath)).split("\n");

    const changedLineIndexes = afterLines
      .map((line, index) => (line === beforeLines[index] ? -1 : index))
      .filter((index) => index !== -1);

    expect(changedLineIndexes).toEqual([item.localLineIndex]);
    expect(afterLines[item.localLineIndex ?? -1]).toBe('beta = "2"');
  });

  it("applyConfigDiffItem appends missing section block", async () => {
    const localPath = await writeToml("config-local", "");
    const sectionItem: ConfigDiffItem = {
      id: "section-missing:extra",
      kind: "section-missing",
      path: "[extra]",
      status: "missing",
      referenceValue: "[extra]\nenabled = true",
      referenceBlock: [
        "[extra]",
        "enabled = true",
      ],
      section: "extra",
    };

    await applyConfigDiffItem(localPath, sectionItem);
    const next = await readToml(localPath);

    expect(next).toBe("[extra]\nenabled = true\n");
  });

  it("creates backups and keeps latest 3 when applying multiple updates", async () => {
    const localPath = await writeToml(
      "config-local",
      [
        "[core]",
        'alpha = "0"',
      ].join("\n"),
    );

    for (let i = 0; i < 6; i += 1) {
      await applyConfigDiffItem(localPath, {
        id: `key-different:core.alpha:${i}`,
        kind: "key-different",
        path: "core.alpha",
        status: "different",
        recommendedLine: `alpha = "${i}"`,
        section: "core",
        localLineIndex: 1,
      });
    }

    const dir = path.dirname(localPath);
    const base = path.basename(localPath);
    const entries = await readdir(dir);
    const backups = entries.filter((entry) => entry.startsWith(`${base}.bak-`));

    expect(backups.length).toBeLessThanOrEqual(3);
  });
});
