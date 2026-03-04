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

## Distribuicao e uso recomendado

Para usuarios finais, o fluxo recomendado e instalar via `install.sh` e executar o binario local:

```bash
curl -fsSL https://raw.githubusercontent.com/nicolaslima/devkit/main/install.sh | bash
devkit
```

## Bootstrap remoto legado

O bootstrap remoto via `launcher.sh` + `manifest.json` segue disponivel apenas para compatibilidade.
Para uso normal, prefira sempre `install.sh` + release stable.

## Log de auditoria

- `~/.local/state/devkit/audit.log`
- rotacao: 5 arquivos x 1 MB
