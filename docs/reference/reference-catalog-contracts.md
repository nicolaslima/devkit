# Referencia: contratos de catalogo

Arquivos de catalogo sao TOML na raiz e constituem a fonte operacional da verdade.

## Arquivos

- `skills.toml`
- `tools.toml`
- `mcp.toml`
- `config-reference.toml` (baseline para diff de config)

## Ordem de resolucao

O runtime prioriza arquivos na raiz do projeto e depois fallback no diretorio atual.

## `skills.toml`

### Formato de tabela

```toml
[[skill]]
name = "find-skills"
install = "npx skills add https://github.com/vercel-labs/skills --skill find-skills -g -y"
```

### Campos obrigatorios

| Campo | Tipo | Restricoes |
|---|---|---|
| `name` | string | nao vazio |
| `install` | string | nao vazio |

## `tools.toml`

### Formato de tabela

```toml
[[tool]]
name = "axon"
install = "python3 -m pip install -U axoniq"
update = "python3 -m pip install -U axoniq"
uninstall = "python3 -m pip uninstall -y axoniq"
cleanup = ["~/.axon", "~/.cache/axon", "./.axon", "**/.axon/**"]
```

### Campos obrigatorios

| Campo | Tipo | Restricoes |
|---|---|---|
| `name` | enum | um entre `openspec`, `reme`, `axon` |
| `install` | string | nao vazio |
| `update` | string | nao vazio |
| `uninstall` | string | nao vazio |
| `cleanup` | array[string] | obrigatorio, cada item nao vazio |

## `mcp.toml`

### Formato de tabela

```toml
[[mcp]]
name = "axon"
block = """
[mcp_servers.axon]
command = "axon"
args = ["serve", "--watch"]
startup_timeout_sec = 35.0
"""
```

### Campos obrigatorios

| Campo | Tipo | Restricoes |
|---|---|---|
| `name` | string | nao vazio |
| `block` | string | nao vazio, deve conter `[mcp_servers.<name>]` |

## Validacao e modo de falha

Pipeline de validacao:
1. parsing TOML de array-table,
2. validacao de schema via `zod`,
3. ordenacao e exposicao para modulos de dominio.

Em falha de validacao:
- apenas o modulo afetado e desabilitado,
- erro exibido como mensagem curta generica: `desabilitada com aviso`.

## Nota sobre `config-reference.toml`

`config-reference.toml` nao passa pelo adapter de catalogo.
Ele e usado pela logica de diff de Config Sync como baseline desejada.
