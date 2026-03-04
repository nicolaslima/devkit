# DevKit v1 Implementation Plan

> **Status historico:** este plano descreve a execucao inicial da v1.
> Para operacao atual, consulte `README.md`, `install.sh` e `docs/reference/`.
> Ultima release stable no momento desta nota: `v0.1.2`.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar a v1 do DevKit com distribuicao via GitHub Releases (stable), instalacao por `install.sh`, binario por plataforma (macOS/Linux amd64/arm64) e catalogo remoto em Gist com fallback por cache local.

**Architecture:** O codigo da TUI continua em `tui/` (minimizando churn) e passa a ler catalogo remoto por um novo adaptador de catalog-source (remote-first com cache). A distribuicao usa assets de release por plataforma e `install.sh` baixa a latest stable para `~/.local/bin/devkit` com overwrite automatico.

**Tech Stack:** Bun + TypeScript + OpenTUI + Vitest + Biome + GitHub Actions + GitHub Releases + Gist API.

---

### Task 1: Rebrand para DevKit (identidade e paths)

**Files:**
- Modify: `README.md`
- Modify: `tui/package.json`
- Modify: `tui/src/constants.ts`
- Modify: `tui/src/screens/main/tabConfig.ts` (labels/UI, se aplicavel)
- Test: `tui/test/actions/theme-tokens.test.ts` (ajustar expectativas de app name, se existir)

**Step 1: Escrever testes de contrato para identidade do app**

```ts
// Exemplo em novo teste
expect(APP_NAME).toBe("devkit");
expect(STATE_DIR).toContain("/devkit");
```

**Step 2: Rodar teste para falhar primeiro**

Run: `cd tui && bunx vitest run test/actions/theme-tokens.test.ts`
Expected: FAIL em nome/path antigos.

**Step 3: Implementar rename minimo**

- Trocar nome de app para `devkit`.
- Ajustar path de estado para `~/.local/state/devkit`.
- Atualizar textos principais de docs e UX visivel.

**Step 4: Re-rodar testes do task**

Run: `cd tui && bunx vitest run test/actions/theme-tokens.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add README.md tui/package.json tui/src/constants.ts tui/src/screens/main/tabConfig.ts tui/test/actions/theme-tokens.test.ts
git commit -m "feat: rebrand app identity to devkit"
```

### Task 2: Definir contrato de catalogo remoto (owner/gist embutidos)

**Files:**
- Modify: `tui/src/constants.ts`
- Create: `tui/src/platform/catalog/source.ts`
- Create: `tui/test/actions/catalog-source.test.ts`

**Step 1: Escrever teste para defaults de catalogo remoto**

```ts
expect(CATALOG_DEFAULT_OWNER).toBe("nicolaslima");
expect(CATALOG_DEFAULT_GIST_ID).toBe("8c039f1a84d3d0898908c96a655f2d4b");
```

**Step 2: Rodar teste e validar falha**

Run: `cd tui && bunx vitest run test/actions/catalog-source.test.ts`
Expected: FAIL por modulo/constantes ausentes.

**Step 3: Implementar modulo de source config**

- Prioridade de leitura: embutido -> env override -> arquivo local opcional.
- Sem exigir parametro para uso comum.

**Step 4: Rodar testes do task**

Run: `cd tui && bunx vitest run test/actions/catalog-source.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tui/src/constants.ts tui/src/platform/catalog/source.ts tui/test/actions/catalog-source.test.ts
git commit -m "feat: add default remote catalog source config"
```

### Task 3: Implementar fetch remoto + cache local + fallback degradado

**Files:**
- Modify: `tui/src/adapters/catalog.ts`
- Create: `tui/src/adapters/catalogRemote.ts`
- Modify: `tui/src/adapters/fs.ts` (helpers de cache, se necessario)
- Create: `tui/test/actions/catalog-remote-cache.test.ts`

**Step 1: Criar teste de comportamento remote-first com fallback cache**

```ts
// cenarios
// 1) remoto OK -> grava cache
// 2) remoto falha + cache existe -> usa cache
// 3) remoto falha + sem cache -> erro curto
```

**Step 2: Rodar teste para falhar**

Run: `cd tui && bunx vitest run test/actions/catalog-remote-cache.test.ts`
Expected: FAIL (adapters inexistentes).

**Step 3: Implementar adaptador remoto e cache**

- Buscar TOML do gist via endpoint raw.
- Cache local por arquivo em `~/.local/state/devkit/catalog/`.
- Reusar parse atual do `catalog.ts` para manter validações.
- Manter erro curto padrao: `desabilitada com aviso`.

**Step 4: Rodar testes do task**

Run: `cd tui && bunx vitest run test/actions/catalog-remote-cache.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tui/src/adapters/catalog.ts tui/src/adapters/catalogRemote.ts tui/src/adapters/fs.ts tui/test/actions/catalog-remote-cache.test.ts
git commit -m "feat: add remote catalog fetch with local cache fallback"
```

### Task 4: Integrar refresh no startup + refresh manual na TUI

**Files:**
- Modify: `tui/src/screens/main/useModuleRefreshers.ts`
- Modify: `tui/src/screens/MainScreen.tsx`
- Modify: `tui/src/modules/home/commands.ts`
- Modify: `tui/src/modules/home/workspace.ts`
- Create: `tui/test/actions/catalog-refresh-flow.test.ts`

**Step 1: Escrever testes para fluxo de refresh**

```ts
// startup chama refresh
// acao manual "Refresh catalog" dispara refresh
// falha exibe aviso curto sem bloquear UI
```

**Step 2: Rodar teste para falhar**

Run: `cd tui && bunx vitest run test/actions/catalog-refresh-flow.test.ts`
Expected: FAIL por comando/estado ausente.

**Step 3: Implementar acao manual + startup refresh**

- Adicionar acao explicita de refresh de catalogo no Home.
- Garantir tentativa de refresh no bootstrap da tela.
- Preservar modo degradado quando remoto falhar.

**Step 4: Rodar testes do task**

Run: `cd tui && bunx vitest run test/actions/catalog-refresh-flow.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tui/src/screens/main/useModuleRefreshers.ts tui/src/screens/MainScreen.tsx tui/src/modules/home/commands.ts tui/src/modules/home/workspace.ts tui/test/actions/catalog-refresh-flow.test.ts
git commit -m "feat: add startup and manual catalog refresh flow"
```

### Task 5: Empacotar binarios por plataforma para release

**Files:**
- Modify: `tui/package.json`
- Create: `scripts/build-release.sh`
- Create: `scripts/release-assets-manifest.txt`
- Create: `tui/test/actions/release-build-contract.test.ts`

**Step 1: Escrever teste de contrato de nomes de assets**

```ts
expect(assetNames).toEqual([
  "devkit-darwin-arm64",
  "devkit-darwin-amd64",
  "devkit-linux-arm64",
  "devkit-linux-amd64",
]);
```

**Step 2: Rodar teste e validar falha**

Run: `cd tui && bunx vitest run test/actions/release-build-contract.test.ts`
Expected: FAIL com manifesto/script inexistente.

**Step 3: Implementar build script**

- Usar `bun build --compile` para cada target.
- Gerar assets em `dist/release/`.
- Gerar checksum sha256 para cada asset.

**Step 4: Rodar testes e build local**

Run:
- `cd tui && bunx vitest run test/actions/release-build-contract.test.ts`
- `bash scripts/build-release.sh`

Expected: PASS + arquivos em `dist/release`.

**Step 5: Commit**

```bash
git add tui/package.json scripts/build-release.sh scripts/release-assets-manifest.txt tui/test/actions/release-build-contract.test.ts
git commit -m "feat: add multi-platform binary release build pipeline"
```

### Task 6: Criar install.sh (latest stable, ~/.local/bin, overwrite)

**Files:**
- Create: `install.sh`
- Create: `test/install/install-smoke.sh`
- Create: `test/install/install-unit.sh` (shell-level)

**Step 1: Escrever testes shell para install contract**

- Detecta OS/arch suportados.
- Baixa latest stable release.
- Instala em `~/.local/bin/devkit` com overwrite.

**Step 2: Rodar teste e validar falha**

Run: `bash test/install/install-unit.sh`
Expected: FAIL por script inexistente.

**Step 3: Implementar install.sh**

- Resolver release mais recente stable via GitHub API.
- Selecionar asset por plataforma.
- Garantir `chmod +x`.
- Log curto e defensivo.

**Step 4: Rodar testes do task**

Run:
- `bash test/install/install-unit.sh`
- `bash test/install/install-smoke.sh`

Expected: PASS.

**Step 5: Commit**

```bash
git add install.sh test/install/install-smoke.sh test/install/install-unit.sh
git commit -m "feat: add stable installer script for devkit binary"
```

### Task 7: Workflow de release stable no GitHub Actions

**Files:**
- Create: `.github/workflows/release.yml`
- Modify: `README.md`
- Modify: `docs/how-to-guides/how-to-contribute.md`

**Step 1: Escrever checklist/teste de contrato do workflow**

- Trigger por tag `v*`.
- Build dos 4 assets.
- Publica release stable.

**Step 2: Validar falha inicial (arquivo inexistente)**

Run: `test -f .github/workflows/release.yml`
Expected: FAIL.

**Step 3: Implementar workflow**

- Jobs por plataforma/target.
- Upload de assets no release da tag.
- Sem trilha de pre-release na v1.

**Step 4: Validar sintaxe e consistencia**

Run:
- `gh workflow view release.yml --yaml` (apos push, ou validar localmente via lint se disponivel)
- `rg -n "release.yml|install.sh|v0.1.0" README.md docs/how-to-guides/how-to-contribute.md`

Expected: referencias consistentes.

**Step 5: Commit**

```bash
git add .github/workflows/release.yml README.md docs/how-to-guides/how-to-contribute.md
git commit -m "feat: add stable release workflow and distribution docs"
```

### Task 8: Sanidade final e release v0.1.0

**Files:**
- Modify: `docs/specs/2026-03-04-devkit-restructure-spec.md` (status final)
- Modify: `docs/plans/2026-03-04-devkit-v1-implementation.md` (checklist final)

**Step 1: Rodar suite principal**

Run:
- `cd tui && bun run test`
- `cd tui && bun run typecheck`
- `cd tui && bun run check:code`

Expected: tudo PASS.

**Step 2: Validar installer em ambiente limpo**

Run:
- `bash install.sh`
- `~/.local/bin/devkit --help` (ou comando minimo suportado)

Expected: binario executa corretamente.

**Step 3: Tag e release**

```bash
git tag v0.1.0
git push origin main --tags
```

Expected: workflow publica release stable `v0.1.0`.

**Step 4: Validacao pos-release**

Run:
- `curl -fsSL https://raw.githubusercontent.com/nicolaslima/devkit/main/install.sh | bash`
- `devkit`

Expected: instalacao e execucao sem parametros.

**Step 5: Commit de fechamento de docs (se necessario)**

```bash
git add docs/specs/2026-03-04-devkit-restructure-spec.md docs/plans/2026-03-04-devkit-v1-implementation.md
git commit -m "docs: finalize devkit v1 restructuring spec and execution notes"
```
