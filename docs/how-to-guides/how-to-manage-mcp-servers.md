# Como gerenciar servidores MCP

Este guia mostra como alternar blocos de servidores MCP em `~/.codex/config.toml` usando a TUI.

## Abrir a aba MCP

1. Inicie a TUI.
2. Pressione `4` para **MCP**.
3. Mova com `j/k`.

## Alternar um servidor

- Pressione `t` (ou `Enter`) na linha selecionada.
- Confirme a acao pressionando `Enter` novamente.

Comportamento:
- O toggle e por bloco (`[mcp_servers.<name>]` e linhas ate a proxima secao).
- A operacao comenta/descomenta o bloco inteiro.
- O nome e comparado de forma exata (sem fuzzy match).

## Quando existe template MCP, mas o bloco nao existe

Se o template selecionado existe em `mcp.toml`, mas nao existe no config local:
1. o bloco e inserido como template comentado,
2. depois e alternado na mesma acao.

## Comportamento de seguranca

Antes de cada escrita em `~/.codex/config.toml`:
- e criado backup com timestamp,
- backups antigos sao podados mantendo os ultimos 3.

Veja [Referencia: caminhos e arquivos de runtime](../reference/reference-runtime-paths-and-files.md).

## Solucao de problemas

### Modulo MCP desabilitado com `desabilitada com aviso`

Causas provaveis:
- contrato invalido em `mcp.toml`,
- arquivo de catalogo inacessivel.

Valide em [Referencia: contratos de catalogo](../reference/reference-catalog-contracts.md).

### Nenhum bloco MCP exibido

Se nao houver blocos no config local, a aba mostra estado vazio.
Use um template conhecido de `mcp.toml` e execute o toggle uma vez para semear o bloco.
