import path from "node:path";
import { loadSkillsCatalogState } from "../adapters/catalog";
import { pathExists, removePath } from "../adapters/fs";
import { runCommand } from "../adapters/shell";
import { SKILL_INSTALL_DIRS } from "../constants";
import type { BatchSummary, ModuleCatalogState, SkillCatalogItem, SkillRecipe } from "../types";

type Logger = (line: string) => void;

function summaryToken(failed: number, total: number): string {
  return `${failed}/${total}`;
}

export async function findInstalledSkillPaths(skillId: string): Promise<string[]> {
  const installed: string[] = [];
  for (const baseDir of SKILL_INSTALL_DIRS) {
    const candidate = path.join(baseDir, skillId);
    if (await pathExists(candidate)) {
      installed.push(candidate);
    }
  }
  return installed;
}

function toRecipe(row: SkillCatalogItem): SkillRecipe {
  return {
    id: row.name,
    label: row.name,
    command: row.install,
    source: "catalog",
    installedPaths: [],
  };
}

export async function loadSkillCatalogState(): Promise<ModuleCatalogState<SkillRecipe>> {
  const state = await loadSkillsCatalogState();
  if (!state.enabled) {
    return {
      enabled: false,
      items: [],
      error: state.error,
    };
  }

  const recipes = state.items.map(toRecipe);
  for (const recipe of recipes) {
    recipe.installedPaths = await findInstalledSkillPaths(recipe.id);
  }

  return {
    enabled: true,
    items: recipes,
  };
}

export async function loadSkillCatalog(): Promise<SkillRecipe[]> {
  const state = await loadSkillCatalogState();
  if (!state.enabled) {
    throw new Error(state.error ?? "desabilitada com aviso");
  }
  return state.items;
}

export async function installSkills(recipes: SkillRecipe[], log: Logger): Promise<BatchSummary> {
  const failedNames: string[] = [];

  for (const recipe of recipes) {
    const result = await runCommand(recipe.command, { timeoutMs: 300_000 });
    if (result.code !== 0) {
      failedNames.push(recipe.id);
      continue;
    }
    log(`skills install ok: ${recipe.id}`);
  }

  const failed = failedNames.length;
  const total = recipes.length;
  const token = summaryToken(failed, total);
  log(`skills install summary ${token}`);

  if (failedNames.length > 0) {
    log(`skills install failed: ${failedNames.join(", ")}`);
  }

  return {
    total,
    failed,
    token,
    failedNames,
  };
}

export async function removeInstalledSkills(skillIds: string[], log: Logger): Promise<BatchSummary> {
  const failedNames: string[] = [];

  for (const skillId of skillIds) {
    try {
      for (const baseDir of SKILL_INSTALL_DIRS) {
        const target = path.join(baseDir, skillId);
        if (await pathExists(target)) {
          await removePath(target);
        }
      }
      log(`skills remove ok: ${skillId}`);
    } catch {
      failedNames.push(skillId);
    }
  }

  const failed = failedNames.length;
  const total = skillIds.length;
  const token = summaryToken(failed, total);
  log(`skills remove summary ${token}`);

  if (failedNames.length > 0) {
    log(`skills remove failed: ${failedNames.join(", ")}`);
  }

  return {
    total,
    failed,
    token,
    failedNames,
  };
}
