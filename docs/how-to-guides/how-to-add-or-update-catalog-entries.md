# Como adicionar ou atualizar entradas de catalogo

Este guia mostra como editar os arquivos de catalogo com seguranca.

## Arquivos de catalogo no escopo

Na raiz do projeto:
- `skills.toml`
- `tools.toml`
- `mcp.toml`
- `config-reference.toml`

## Adicionar nova skill

Edite `skills.toml`:

```toml
[[skill]]
name = "my-skill"
install = "npx skills add <source> --skill my-skill -g -y"
```

Regras:
- `name` nao pode ser vazio.
- `install` nao pode ser vazio.

## Adicionar nova tool

Edite `tools.toml`:

```toml
[[tool]]
name = "axon"
install = "python3 -m pip install -U axoniq"
update = "python3 -m pip install -U axoniq"
uninstall = "python3 -m pip uninstall -y axoniq"
cleanup = ["~/.axon", "~/.cache/axon", "./.axon", "**/.axon/**"]
```

Regras:
- `name` deve ser um entre: `openspec`, `reme`, `axon`.
- todos os comandos sao obrigatorios.
- `cleanup` e obrigatorio e pode incluir globs.

## Adicionar novo template MCP

Edite `mcp.toml`:

```toml
[[mcp]]
name = "my-mcp"
block = """
[mcp_servers.my-mcp]
command = "my-mcp"
args = ["serve"]
startup_timeout_sec = 35.0
"""
```

Regras:
- `name` nao pode ser vazio.
- `block` deve incluir `[mcp_servers.<name>]` com o mesmo `name`.

## Validar mudancas no app

1. Inicie a TUI.
2. Execute `Refresh catalog` na Home.
3. Confira a aba correspondente:
   - Skills para `skills.toml`,
   - Tools para `tools.toml`,
   - MCP para `mcp.toml`.

Se o contrato for invalido, apenas o modulo afetado sera desabilitado com `desabilitada com aviso`.

## Validacao via CLI

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills/tui
bun run typecheck
bun run test
```

## Boas praticas

- Mantenha comandos explicitos e deterministas.
- Mantenha uma mudanca logica por commit.
- Atualize as paginas de documentacao quando houver mudanca de comportamento ou contrato.
