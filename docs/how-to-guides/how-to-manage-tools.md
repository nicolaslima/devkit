# Como gerenciar tools (OpenSpec, ReMe, Axon)

Este guia cobre instalacao, atualizacao, configuracao e desinstalacao de tools definidas em `tools.toml`.

## Tools suportadas

- `openspec`
- `reme`
- `axon`

## Selecionar tools

1. Abra a aba **Tools** (`6`).
2. Mova com `j/k`.
3. Pressione `Space` para alternar cada tool.

## Instalar selecionadas

- Pressione `i`.
- Confirme pressionando `Enter` novamente.

## Atualizar selecionadas

- Pressione `u`.
- Confirme com segundo `Enter`.

## Configurar selecionadas com MCP no Codex

- Pressione `c`.
- Confirme com segundo `Enter`.

Comportamento:
- O modo de configuracao alterna/garante o bloco MCP correspondente no config do Codex.

## Desinstalar selecionadas (destrutivo)

1. Pressione `x`.
2. Revise o modal de preview de limpeza:
   - total de matches,
   - resumo agrupado por diretorio pai,
   - avisos para padroes sem match/ignorados.
3. Foco inicial em `Cancelar`.
4. Mova para `Confirmar` e pressione `Enter`.

## Regra de escopo da limpeza

Caminhos e globs de limpeza sao restritos a:
- diretorio atual do projeto (`cwd`), e
- diretorio home do usuario (`HOME`).

Matches fora desse escopo sao ignorados com aviso.

## Comportamento de resumo final

Para lotes de instalar/atualizar/configurar/desinstalar:
- execucao em best-effort,
- resumo final sempre no formato `N/T`,
- nomes com falha aparecem apenas no resumo final.

## Solucao de problemas

### Modulo Tools desabilitado com `desabilitada com aviso`

Verifique primeiro o contrato de `tools.toml`:
- campos obrigatorios: `name`, `install`, `update`, `uninstall`, `cleanup[]`.

Veja [Referencia: contratos de catalogo](../reference/reference-catalog-contracts.md).
