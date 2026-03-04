import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { loadToolsCatalogStrict } from "../../adapters/catalog";
import { expandHome, pathExists } from "../../adapters/fs";
import { CWD_SCOPE, HOME_SCOPE } from "../../constants";
import type { CleanupGroupSummary, CleanupPreview, ToolName } from "../../types";
import { uniqueToolQueue } from "./shared";

function isWithinScope(targetPath: string, basePath: string): boolean {
  const target = path.resolve(targetPath);
  const base = path.resolve(basePath);
  if (target === base) {
    return true;
  }
  const relative = path.relative(base, target);
  return relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function hasGlobPattern(input: string): boolean {
  return /[*?[\]{}]/.test(input);
}

function toPosix(input: string): string {
  return input.replaceAll(path.sep, "/");
}

function escapeRegExp(input: string): string {
  return input.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(globPattern: string): RegExp {
  const normalized = toPosix(globPattern);
  let output = "^";

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (!char) {
      continue;
    }

    if (char === "*" && next === "*") {
      output += ".*";
      index += 1;
      continue;
    }

    if (char === "*") {
      output += "[^/]*";
      continue;
    }

    if (char === "?") {
      output += ".";
      continue;
    }

    output += escapeRegExp(char);
  }

  output += "$";
  return new RegExp(output);
}

async function listAllEntries(baseDir: string): Promise<string[]> {
  const absoluteBase = path.resolve(baseDir);
  const output: string[] = [];

  let entries: Dirent[];
  try {
    entries = await fs.readdir(absoluteBase, { withFileTypes: true });
  } catch {
    return output;
  }

  for (const entry of entries) {
    const absolute = path.join(absoluteBase, entry.name);
    output.push(absolute);
    if (entry.isDirectory()) {
      const childEntries = await listAllEntries(absolute);
      output.push(...childEntries);
    }
  }

  return output;
}

async function scanGlobMatches(baseDir: string, relativePattern: string): Promise<string[]> {
  const matcher = globToRegExp(relativePattern);
  const entries = await listAllEntries(baseDir);
  const matches: string[] = [];

  for (const absolute of entries) {
    const rel = toPosix(path.relative(baseDir, absolute));
    if (matcher.test(rel)) {
      matches.push(path.resolve(absolute));
    }
  }

  return matches;
}

function toAbsolutePath(pattern: string, cwd: string, home: string): string {
  const expanded = expandHome(pattern);
  if (path.isAbsolute(expanded)) {
    return path.resolve(expanded);
  }

  if (pattern.startsWith("~/")) {
    return path.resolve(path.join(home, pattern.slice(2)));
  }

  return path.resolve(path.join(cwd, expanded));
}

function resolveGlobScope(
  pattern: string,
  cwd: string,
  home: string,
): { base: string; relativePattern: string } | null {
  const expanded = expandHome(pattern);

  if (pattern.startsWith("~/")) {
    return {
      base: home,
      relativePattern: pattern.slice(2),
    };
  }

  if (path.isAbsolute(expanded)) {
    const absolutePattern = path.resolve(expanded);

    if (!hasGlobPattern(absolutePattern)) {
      if (isWithinScope(absolutePattern, cwd)) {
        return {
          base: cwd,
          relativePattern: path.relative(cwd, absolutePattern),
        };
      }
      if (isWithinScope(absolutePattern, home)) {
        return {
          base: home,
          relativePattern: path.relative(home, absolutePattern),
        };
      }
      return null;
    }

    const marker = absolutePattern.search(/[*?[\]{}]/);
    const prefix = marker >= 0 ? absolutePattern.slice(0, marker) : absolutePattern;
    const slashIndex = prefix.lastIndexOf(path.sep);
    const rootPrefix = slashIndex > 0 ? prefix.slice(0, slashIndex) : path.sep;
    const relativePatternFromRoot = absolutePattern.slice(rootPrefix.length + 1);

    if (isWithinScope(rootPrefix, cwd)) {
      return {
        base: cwd,
        relativePattern:
          path.relative(cwd, rootPrefix).length > 0
            ? path.join(path.relative(cwd, rootPrefix), relativePatternFromRoot)
            : relativePatternFromRoot,
      };
    }
    if (isWithinScope(rootPrefix, home)) {
      return {
        base: home,
        relativePattern:
          path.relative(home, rootPrefix).length > 0
            ? path.join(path.relative(home, rootPrefix), relativePatternFromRoot)
            : relativePatternFromRoot,
      };
    }
    return null;
  }

  return {
    base: cwd,
    relativePattern: expanded,
  };
}

function buildGroupedSummary(matches: string[]): CleanupGroupSummary[] {
  const map = new Map<string, number>();
  for (const entry of matches) {
    const label = path.basename(path.dirname(entry)) || ".";
    map.set(label, (map.get(label) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.label.localeCompare(b.label);
    });
}

function mergeCleanupPreviews(previews: CleanupPreview[]): CleanupPreview {
  const mergedWarnings = new Set<string>();
  const mergedMatches = new Set<string>();

  for (const preview of previews) {
    for (const warning of preview.warnings) {
      mergedWarnings.add(warning);
    }
    for (const match of preview.matches) {
      mergedMatches.add(match);
    }
  }

  const matches = [...mergedMatches].sort((a, b) => a.localeCompare(b));
  return {
    total: matches.length,
    groups: buildGroupedSummary(matches),
    matches,
    warnings: [...mergedWarnings],
  };
}

export async function resolveToolCleanupPreview(tool: ToolName): Promise<CleanupPreview> {
  const catalog = await loadToolsCatalogStrict();
  const toolConfig = catalog.find((item) => item.name === tool);
  if (!toolConfig) {
    throw new Error("desabilitada com aviso");
  }

  const cwd = CWD_SCOPE;
  const home = HOME_SCOPE;
  const warnings: string[] = [];
  const matchesSet = new Set<string>();

  for (const entry of toolConfig.cleanup) {
    if (hasGlobPattern(entry)) {
      const scope = resolveGlobScope(entry, cwd, home);
      if (!scope) {
        warnings.push(`ignored: ${entry}`);
        continue;
      }

      let matchCountForPattern = 0;
      const matches = await scanGlobMatches(scope.base, scope.relativePattern);
      for (const absolute of matches) {
        if (!isWithinScope(absolute, cwd) && !isWithinScope(absolute, home)) {
          continue;
        }
        matchesSet.add(absolute);
        matchCountForPattern += 1;
      }

      if (matchCountForPattern === 0) {
        warnings.push(`warning: ${entry}`);
      }
      continue;
    }

    const absolute = toAbsolutePath(entry, cwd, home);
    if (!isWithinScope(absolute, cwd) && !isWithinScope(absolute, home)) {
      warnings.push(`ignored: ${entry}`);
      continue;
    }

    if (await pathExists(absolute)) {
      matchesSet.add(absolute);
    }
  }

  const matches = [...matchesSet].sort((a, b) => a.localeCompare(b));
  const groups = buildGroupedSummary(matches);

  return {
    total: matches.length,
    groups,
    matches,
    warnings,
  };
}

export async function resolveToolsCleanupPreview(tools: ToolName[]): Promise<CleanupPreview> {
  const queue = uniqueToolQueue(tools);
  const previews: CleanupPreview[] = [];

  for (const tool of queue) {
    previews.push(await resolveToolCleanupPreview(tool));
  }

  return mergeCleanupPreviews(previews);
}
