import { pathExists, readTextFile, writeTextFile } from "../adapters/fs";
import { createCodexConfigBackup } from "../core/configBackup";
import type { ConfigDiffItem } from "../types";

interface KeyEntry {
  path: string;
  section: string;
  key: string;
  value: string;
  line: string;
  lineIndex: number;
}

interface SectionBlock {
  name: string;
  lines: string[];
}

const ACTIVE_SECTION = /^\s*\[([^\]]+)\]\s*$/;
const ANY_SECTION = /^\s*(?:[;#]\s*)?\[([^\]]+)\]\s*$/;
const KEY_ASSIGNMENT = /^\s*([A-Za-z0-9_.-]+)\s*=\s*(.+)$/;

function normalizeValue(input: string): string {
  return input.trim();
}

function parseKeyEntries(content: string): Map<string, KeyEntry> {
  const map = new Map<string, KeyEntry>();
  const lines = content.split(/\r?\n/);
  let section = "";

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const sectionMatch = line.match(ACTIVE_SECTION);
    if (sectionMatch?.[1]) {
      section = sectionMatch[1];
      continue;
    }

    if (/^\s*[#;]/.test(line) || line.trim().length === 0) {
      continue;
    }

    const keyMatch = line.match(KEY_ASSIGNMENT);
    if (!keyMatch?.[1] || !keyMatch[2]) {
      continue;
    }

    const key = keyMatch[1].trim();
    const value = normalizeValue(keyMatch[2]);
    const keyPath = section.length > 0 ? `${section}.${key}` : key;

    map.set(keyPath, {
      path: keyPath,
      section,
      key,
      value,
      line,
      lineIndex: i,
    });
  }

  return map;
}

function parseSectionBlocks(content: string): Map<string, SectionBlock> {
  const lines = content.split(/\r?\n/);
  const map = new Map<string, SectionBlock>();

  const starts: Array<{ name: string; index: number }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i]?.match(ANY_SECTION);
    if (match?.[1]) {
      starts.push({ name: match[1], index: i });
    }
  }

  for (let i = 0; i < starts.length; i += 1) {
    const current = starts[i];
    if (!current) {
      continue;
    }
    const next = starts[i + 1];
    const end = next ? next.index - 1 : lines.length - 1;
    map.set(current.name, {
      name: current.name,
      lines: lines.slice(current.index, end + 1),
    });
  }

  return map;
}

export async function resolveReferenceConfigPath(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  throw new Error("desabilitada com aviso");
}

export async function buildConfigDiff(
  referenceConfigPath: string,
  localConfigPath: string,
): Promise<ConfigDiffItem[]> {
  if (!(await pathExists(referenceConfigPath))) {
    throw new Error("desabilitada com aviso");
  }

  const reference = await readTextFile(referenceConfigPath);
  const local = (await pathExists(localConfigPath)) ? await readTextFile(localConfigPath) : "";

  const referenceKeys = parseKeyEntries(reference);
  const localKeys = parseKeyEntries(local);

  const referenceSections = parseSectionBlocks(reference);
  const localSections = parseSectionBlocks(local);

  const diffs: ConfigDiffItem[] = [];

  for (const [keyPath, refEntry] of referenceKeys.entries()) {
    const localEntry = localKeys.get(keyPath);

    if (!localEntry) {
      diffs.push({
        id: `key-missing:${keyPath}`,
        kind: "key-missing",
        path: keyPath,
        status: "missing",
        referenceValue: refEntry.value,
        recommendedLine: refEntry.line,
        section: refEntry.section,
      });
      continue;
    }

    if (localEntry.value !== refEntry.value) {
      diffs.push({
        id: `key-different:${keyPath}`,
        kind: "key-different",
        path: keyPath,
        status: "different",
        referenceValue: refEntry.value,
        localValue: localEntry.value,
        recommendedLine: refEntry.line,
        section: refEntry.section,
        localLineIndex: localEntry.lineIndex,
      });
    }
  }

  for (const [sectionName, block] of referenceSections.entries()) {
    if (!localSections.has(sectionName)) {
      diffs.push({
        id: `section-missing:${sectionName}`,
        kind: "section-missing",
        path: `[${sectionName}]`,
        status: "missing",
        referenceValue: block.lines.join("\n"),
        referenceBlock: block.lines,
        section: sectionName,
      });
    }
  }

  for (const [keyPath, localEntry] of localKeys.entries()) {
    if (!referenceKeys.has(keyPath)) {
      diffs.push({
        id: `key-only-local:${keyPath}`,
        kind: "key-only-local",
        path: keyPath,
        status: "only-local",
        localValue: localEntry.value,
        section: localEntry.section,
        localLineIndex: localEntry.lineIndex,
      });
    }
  }

  return diffs;
}

function findSectionInsertionIndex(lines: string[], section: string): number {
  if (!section) {
    const firstSection = lines.findIndex((line) => ACTIVE_SECTION.test(line));
    return firstSection >= 0 ? firstSection : lines.length;
  }

  const sectionPattern = new RegExp(
    `^\\s*\\[${section.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\]\\s*$`,
  );
  const start = lines.findIndex((line) => sectionPattern.test(line));
  if (start === -1) {
    return lines.length;
  }

  for (let i = start + 1; i < lines.length; i += 1) {
    if (ANY_SECTION.test(lines[i] ?? "")) {
      return i;
    }
  }
  return lines.length;
}

export async function applyConfigDiffItem(
  localConfigPath: string,
  item: ConfigDiffItem,
): Promise<void> {
  if (item.kind === "key-only-local") {
    return;
  }

  const content = (await pathExists(localConfigPath)) ? await readTextFile(localConfigPath) : "";
  const lines = content.length > 0 ? content.split(/\r?\n/) : [];

  if (item.kind === "section-missing") {
    const sectionBlock = item.referenceBlock ?? [];
    if (sectionBlock.length === 0) {
      return;
    }
    if (lines.length > 0 && lines[lines.length - 1]?.trim().length !== 0) {
      lines.push("");
    }
    lines.push(...sectionBlock);
    await createCodexConfigBackup(localConfigPath);
    await writeTextFile(localConfigPath, `${lines.join("\n")}\n`);
    return;
  }

  const replacement = item.recommendedLine;
  if (!replacement) {
    throw new Error("desabilitada com aviso");
  }

  if (
    typeof item.localLineIndex === "number" &&
    item.localLineIndex >= 0 &&
    item.localLineIndex < lines.length
  ) {
    lines[item.localLineIndex] = replacement;
    await createCodexConfigBackup(localConfigPath);
    await writeTextFile(localConfigPath, lines.join("\n"));
    return;
  }

  const insertionIndex = findSectionInsertionIndex(lines, item.section ?? "");
  lines.splice(insertionIndex, 0, replacement);
  await createCodexConfigBackup(localConfigPath);
  await writeTextFile(localConfigPath, lines.join("\n"));
}
