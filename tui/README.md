# devkit

Interface de terminal para gerenciar setup pessoal/de-time do Codex entre ambientes.

## Documentacao canonica

- Indice principal (Diataxis): [`../docs/README.md`](../docs/README.md)
- Especificacao: [`../docs/specs/2026-03-04-devkit-restructure-spec.md`](../docs/specs/2026-03-04-devkit-restructure-spec.md)
- Racional de arquitetura: [`../docs/explanation/explanation-architecture-overview.md`](../docs/explanation/explanation-architecture-overview.md)

## Desenvolvimento local

```bash
bun install
bun run dev
```

## Validacao

```bash
bun run typecheck
bun run test
bun run check:code
```

## Catalogos na raiz (fonte da verdade)

- `../skills.toml`
- `../tools.toml`
- `../mcp.toml`
- `../config-reference.toml`

## Runtime remoto

Arquivos esperados no gist:
- `launcher.sh`
- `manifest.json`
- todos os arquivos listados em `manifest.json`

Executar via `gh`:

```bash
gh gist view GIST_ID --raw --filename launcher.sh | \
  PERSONAL_SKILLS_GIST_ID=GIST_ID PERSONAL_SKILLS_GIST_OWNER=OWNER bash
```

Executar via `wget`:

```bash
wget -qO- https://gist.githubusercontent.com/OWNER/GIST_ID/raw/launcher.sh | \
  PERSONAL_SKILLS_GIST_ID=GIST_ID PERSONAL_SKILLS_GIST_OWNER=OWNER bash
```

## Log de auditoria

- `~/.local/state/devkit/audit.log`
- rotacao: 5 arquivos x 1 MB
