# Referencia: caminhos e arquivos de runtime

Esta pagina lista caminhos de runtime estaveis usados pela aplicacao.

## Caminhos principais

| Finalidade | Caminho |
|---|---|
| Config local do Codex | `~/.codex/config.toml` |
| Log de auditoria | `~/.local/state/devkit/audit.log` |
| Cache de catalogo remoto | `~/.local/state/devkit/catalog/` |
| Descoberta de skills local A | `~/.codex/skills` |
| Descoberta de skills local B | `~/.agents/skills` |

## Politica de backup

Ao mutar `~/.codex/config.toml`:
- criar `config.toml.bak-YYYYMMDD-HHMMSSmmm`,
- manter os `3` backups mais recentes,
- podar arquivos de backup antigos.

Criacao de backup e usada por:
- toggles de MCP,
- aplicacao de item do config diff,
- insercao/remocao de bloco MCP.

## Politica de auditoria

| Campo | Valor |
|---|---|
| Arquivo de log | `~/.local/state/devkit/audit.log` |
| Rotacao por tamanho | 1 MB por arquivo |
| Arquivos mantidos | 5 arquivados + atual |

## Candidatos de caminho para catalogos

A aplicacao verifica arquivos candidatos em ordem:

### Skills
1. `<project-root>/skills.toml`
2. `<cwd>/skills.toml`

### Tools
1. `<project-root>/tools.toml`
2. `<cwd>/tools.toml`

### MCP
1. `<project-root>/mcp.toml`
2. `<cwd>/mcp.toml`

### Config de referencia
1. `<project-root>/config-reference.toml`
2. `<project-root>/config.toml`
3. `<cwd>/config-reference.toml`
4. `<cwd>/config.toml`

## Fronteiras de escopo da limpeza

Caminhos de cleanup de tools sao restritos a:
- escopo do `cwd`,
- escopo do `HOME`.

Caminhos fora desses dois escopos sao ignorados com aviso.
