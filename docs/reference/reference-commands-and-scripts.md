# Referencia: comandos e scripts

Esta pagina lista comandos padrao usados por contribuidores e operadores.

## Comandos no nivel do projeto

A partir de `tui/`:

| Comando | Finalidade |
|---|---|
| `bun install` | Instalar dependencias |
| `bun run dev` | Iniciar TUI em watch mode |
| `bun run start` | Iniciar TUI uma vez |
| `bun run typecheck` | Checagem de tipos TypeScript |
| `bun run test` | Suite Vitest |
| `bun run lint` | Lint com Biome |
| `bun run format` | Formatacao com Biome |
| `bun run check:code` | Check completo do Biome |
| `bun run check:code:write` | Check do Biome com escrita |
| `bun run build:release` | Build de asset de release para o target do host |

No nivel da raiz:

| Comando | Finalidade |
|---|---|
| `bash scripts/build-release.sh` | Build de release binaria para target do host |
| `DEVKIT_BUILD_ALL=1 bash scripts/build-release.sh` | Tenta build para todos os targets do manifesto |
| `bash test/install/install-unit.sh` | Testes unitarios shell do instalador |
| `bash test/install/install-smoke.sh` | Smoke test shell do instalador |
| `bash install.sh` | Instala/atualiza `devkit` na ultima stable release |

## Comandos externos principais invocados por funcionalidades

### Codex

| Modo | Comando |
|---|---|
| local stable | `npm i -g @openai/codex` |
| local alpha | `npm i -g @openai/codex@<dist-tags.alpha>` |
| codespace | `sudo bash -c "curl -fsSL https://raw.githubusercontent.com/jsburckhardt/devcontainer-features/main/src/codex/install.sh | bash"` |
| checar versao | `codex --version` |
| consultar dist-tags | `npm view @openai/codex dist-tags --json` |

### Tools

Comandos de tools sao lidos das entradas de `tools.toml`:
- install
- update
- uninstall

### Skills

Comandos de instalacao de skills sao lidos das entradas de `skills.toml`.

## Garantias de comportamento

- A maioria das operacoes em lote usa best-effort e gera resumo final `N/T`.
- Nomes com falha aparecem apenas no bloco de resumo final.
- Mensagem generica para problema de catalogo em nivel de modulo: `desabilitada com aviso`.

## Suites de teste relacionadas

Para contratos de comando e comportamento:
- `tui/test/actions/codex.test.ts`
- `tui/test/actions/tools.test.ts`
- `tui/test/actions/skills.test.ts`
- `tui/test/actions/launcher-manifest.test.ts`
