import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DOMAIN_MODULES = new Set([
  "home",
  "skills",
  "codex",
  "mcp",
  "config-sync",
  "tools",
  "run-plan",
]);

async function listFilesRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }

  return files;
}

const TOPOLOGY_BASELINE_FILES = [
  "src/modules/home/commands.ts",
  "src/modules/home/workspace.ts",
  "src/modules/home/inspector.ts",
  "src/modules/skills/commands.ts",
  "src/modules/skills/workspace.ts",
  "src/modules/skills/inspector.ts",
  "src/modules/codex/commands.ts",
  "src/modules/codex/workspace.ts",
  "src/modules/codex/inspector.ts",
  "src/modules/mcp/commands.ts",
  "src/modules/mcp/workspace.ts",
  "src/modules/mcp/inspector.ts",
  "src/modules/config-sync/commands.ts",
  "src/modules/config-sync/workspace.ts",
  "src/modules/config-sync/inspector.ts",
  "src/modules/tools/commands.ts",
  "src/modules/tools/workspace.ts",
  "src/modules/tools/inspector.ts",
  "src/modules/run-plan/commands.ts",
  "src/modules/run-plan/workspace.ts",
  "src/modules/run-plan/inspector.ts",
  "src/modules/runtime/types.ts",
  "src/modules/runtime/context.ts",
  "src/modules/runtime/view.ts",
  "src/platform/catalog/schema.ts",
  "src/app/keymap.ts",
];

describe("vertical slice contract", () => {
  it("keeps MainScreen decoupled from direct domain action modules", async () => {
    const mainScreenPath = path.resolve(process.cwd(), "src/screens/MainScreen.tsx");
    const content = await readFile(mainScreenPath, "utf8");

    expect(content).not.toMatch(/\.\.\/actions\/skills/);
    expect(content).not.toMatch(/\.\.\/actions\/mcp/);
    expect(content).not.toMatch(/\.\.\/actions\/tools/);
    expect(content).not.toMatch(/\.\.\/actions\/configSync/);
  });

  it("prevents cross-domain imports inside src/modules", async () => {
    const modulesRoot = path.resolve(process.cwd(), "src/modules");
    let files: string[] = [];

    try {
      files = await listFilesRecursive(modulesRoot);
    } catch {
      files = [];
    }

    for (const filePath of files) {
      const relPath = path.relative(modulesRoot, filePath);
      const sourceModule = relPath.split(path.sep)[0] ?? "";
      if (!DOMAIN_MODULES.has(sourceModule)) {
        continue;
      }

      const content = await readFile(filePath, "utf8");
      const matches = content.matchAll(/from\s+["']([^"']+)["']/g);

      for (const match of matches) {
        const importPath = match[1] ?? "";
        const targetMatch = importPath.match(/modules\/([^/"']+)/);
        const targetModule = targetMatch?.[1] ?? "";

        if (!targetModule || !DOMAIN_MODULES.has(targetModule)) {
          continue;
        }

        expect(
          targetModule,
          `Cross-domain import not allowed: ${sourceModule} -> ${targetModule} in ${relPath}`,
        ).toBe(sourceModule);
      }
    }
  });

  it("routes orchestration through module command slices", async () => {
    const actionsHookPath = path.resolve(process.cwd(), "src/screens/main/useMainActions.ts");
    const primaryActionPath = path.resolve(process.cwd(), "src/screens/main/usePrimaryAction.ts");
    const actionsContent = await readFile(actionsHookPath, "utf8");
    const primaryContent = await readFile(primaryActionPath, "utf8");

    expect(actionsContent).toContain('from "../../modules/skills/commands"');
    expect(actionsContent).toContain('from "../../modules/codex/commands"');
    expect(actionsContent).toContain('from "../../modules/mcp/commands"');
    expect(actionsContent).toContain('from "../../modules/config-sync/commands"');
    expect(actionsContent).toContain('from "../../modules/tools/commands"');
    expect(actionsContent).not.toContain('from "../../actions/skills"');
    expect(actionsContent).not.toContain('from "../../actions/codex"');
    expect(actionsContent).not.toContain('from "../../actions/mcp"');
    expect(actionsContent).not.toContain('from "../../actions/configSync"');
    expect(actionsContent).not.toContain('from "../../actions/tools"');

    expect(primaryContent).toContain('from "../../modules/home/commands"');
    expect(primaryContent).toContain('from "../../modules/run-plan/commands"');
    expect(primaryContent).toContain('from "../../modules/tools/commands"');
  });

  it("routes workspace and inspector composition through module slices", async () => {
    const viewModelPath = path.resolve(process.cwd(), "src/screens/main/useMainViewModel.ts");
    const content = await readFile(viewModelPath, "utf8");

    expect(content).toContain('from "../../modules/home/workspace"');
    expect(content).toContain('from "../../modules/home/inspector"');
    expect(content).toContain('from "../../modules/skills/workspace"');
    expect(content).toContain('from "../../modules/skills/inspector"');
    expect(content).toContain('from "../../modules/codex/workspace"');
    expect(content).toContain('from "../../modules/codex/inspector"');
    expect(content).toContain('from "../../modules/mcp/workspace"');
    expect(content).toContain('from "../../modules/mcp/inspector"');
    expect(content).toContain('from "../../modules/config-sync/workspace"');
    expect(content).toContain('from "../../modules/config-sync/inspector"');
    expect(content).toContain('from "../../modules/tools/workspace"');
    expect(content).toContain('from "../../modules/tools/inspector"');
    expect(content).toContain('from "../../modules/run-plan/workspace"');
    expect(content).toContain('from "../../modules/run-plan/inspector"');
    expect(content).not.toContain('from "../tabs/homeTab"');
    expect(content).not.toContain('from "../tabs/skillsTab"');
    expect(content).not.toContain('from "../tabs/codexTab"');
    expect(content).not.toContain('from "../tabs/mcpTab"');
    expect(content).not.toContain('from "../tabs/configSyncTab"');
    expect(content).not.toContain('from "../tabs/toolsTab"');
    expect(content).not.toContain('from "../tabs/runPlanTab"');
  });

  it("keeps the vertical-slice topology baseline files present", async () => {
    for (const relativePath of TOPOLOGY_BASELINE_FILES) {
      const absolutePath = path.resolve(process.cwd(), relativePath);
      const content = await readFile(absolutePath, "utf8");
      expect(content.length, `File should not be empty: ${relativePath}`).toBeGreaterThan(0);
      expect(content, `File should export at least one symbol: ${relativePath}`).toMatch(/export\s+/);
    }
  });
});
