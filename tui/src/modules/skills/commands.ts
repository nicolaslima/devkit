import { installSkills, loadSkillCatalogState, removeInstalledSkills } from "../../actions/skills";
import type { SkillRecipe } from "../../types";
import type { ModuleRuntimeContext } from "../runtime/types";

interface SkillsSelectionDeps {
  skills: SkillRecipe[];
  selectedSkills: Set<string>;
}

interface SkillsStateDeps {
  setSkills: (value: SkillRecipe[]) => void;
  setSkillsModuleError: (value: string | null) => void;
  setSelectedSkills: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

interface SkillsConfirmDeps {
  setConfirmAction: (
    value: {
      title: string;
      details: string[];
      run: () => Promise<void>;
    } | null,
  ) => void;
  setConfirmFocusConfirm: (value: boolean) => void;
}

export interface SkillsCommands {
  refreshSkills: () => Promise<void>;
  installSelected: () => Promise<void>;
  removeSelected: () => Promise<void>;
}

export async function refreshSkillsCommand(deps: SkillsStateDeps): Promise<void> {
  const state = await loadSkillCatalogState();
  if (!state.enabled) {
    deps.setSkills([]);
    deps.setSkillsModuleError(state.error ?? "desabilitada com aviso");
    return;
  }

  const catalog = state.items;
  deps.setSkillsModuleError(null);
  deps.setSkills(catalog);
  deps.setSelectedSkills((previous) => {
    const knownIds = new Set(catalog.map((skill) => skill.id));
    const preserved = new Set([...previous].filter((skillId) => knownIds.has(skillId)));
    if (previous.size > 0) {
      return preserved;
    }
    return new Set(
      catalog.filter((skill) => skill.installedPaths.length === 0).map((skill) => skill.id),
    );
  });
}

export async function installSelectedSkillsCommand(
  deps: ModuleRuntimeContext &
    SkillsSelectionDeps & {
      skillsModuleError: string | null;
      refreshSkills: () => Promise<void>;
    },
): Promise<void> {
  if (deps.skillsModuleError) {
    deps.appendLog(deps.skillsModuleError);
    return;
  }

  const selected = deps.skills.filter((item) => deps.selectedSkills.has(item.id));
  if (selected.length === 0) {
    deps.appendLog("nenhuma skill selecionada");
    return;
  }

  if (!deps.requestLightConfirm("skills-install-selected", "install selected skills")) {
    return;
  }

  await deps.runTask("install selected skills", async () => {
    await installSkills(selected, deps.appendLog);
    await deps.refreshSkills();
  });
}

export async function installCurrentSkillCommand(
  deps: ModuleRuntimeContext & {
    skills: SkillRecipe[];
    skillsModuleError: string | null;
    currentIndex: number;
    refreshSkills: () => Promise<void>;
  },
): Promise<void> {
  if (deps.skillsModuleError) {
    deps.appendLog(deps.skillsModuleError);
    return;
  }

  const current = deps.skills[deps.currentIndex];
  if (!current) {
    deps.appendLog("nenhuma skill selecionada");
    return;
  }

  if (!deps.requestLightConfirm("skills-install-current", `install ${current.id}`)) {
    return;
  }

  await deps.runTask(`install ${current.id}`, async () => {
    await installSkills([current], deps.appendLog);
    await deps.refreshSkills();
  });
}

export function queueRemoveSelectedSkillsCommand(
  deps: ModuleRuntimeContext &
    SkillsSelectionDeps &
    SkillsConfirmDeps & {
      skillsModuleError: string | null;
      refreshSkills: () => Promise<void>;
    },
): void {
  if (deps.skillsModuleError) {
    deps.appendLog(deps.skillsModuleError);
    return;
  }

  const selected = deps.skills.filter((item) => deps.selectedSkills.has(item.id));
  if (selected.length === 0) {
    deps.appendLog("nenhuma skill selecionada");
    return;
  }

  deps.clearLightConfirm();
  deps.setConfirmAction({
    title: "remove selected local skills",
    details: selected.map((item) => item.id),
    run: async () => {
      await removeInstalledSkills(
        selected.map((item) => item.id),
        deps.appendLog,
      );
      await deps.refreshSkills();
    },
  });
  deps.setConfirmFocusConfirm(false);
}

export function queueRemoveCurrentSkillCommand(
  deps: ModuleRuntimeContext &
    SkillsConfirmDeps & {
      skills: SkillRecipe[];
      skillsModuleError: string | null;
      currentIndex: number;
      refreshSkills: () => Promise<void>;
    },
): void {
  if (deps.skillsModuleError) {
    deps.appendLog(deps.skillsModuleError);
    return;
  }

  const current = deps.skills[deps.currentIndex];
  if (!current) {
    deps.appendLog("nenhuma skill selecionada");
    return;
  }

  deps.clearLightConfirm();
  deps.setConfirmAction({
    title: `remove local skill ${current.id}`,
    details: [current.id],
    run: async () => {
      await removeInstalledSkills([current.id], deps.appendLog);
      await deps.refreshSkills();
    },
  });
  deps.setConfirmFocusConfirm(false);
}
