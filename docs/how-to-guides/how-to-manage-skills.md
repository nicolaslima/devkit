# Como gerenciar skills

Este guia mostra como listar, selecionar, instalar e remover skills definidas em `skills.toml`.

## Antes de comecar

- Execute a partir da raiz do projeto:

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills/tui
bun run start
```

- Garanta que `../skills.toml` esteja valido.

## Listar e selecionar skills

1. Pressione `2` para abrir a aba **Skills**.
2. Use `j/k` ou setas para mover.
3. Pressione `Space` (ou `Enter`) para alternar selecao batch.

Linhas selecionadas exibem `[x]`.

## Instalar skills selecionadas

1. Na aba **Skills**, pressione `i`.
2. Confirme a prompt leve pressionando `Enter` novamente.

Comportamento:
- Execucao em **best-effort**.
- Falhas por item nao interrompem a fila.
- Resumo final sempre no formato `N/T`.
- Nomes com falha aparecem apenas no resumo final.

## Remover skills locais selecionadas

1. Na aba **Skills**, selecione itens.
2. Pressione `r`.
3. No modal destrutivo, foco inicial em `Cancelar`.
4. Mova para `Confirmar` e pressione `Enter`.

Comportamento:
- Remocao verifica caminhos locais conhecidos de instalacao.
- Execucao em best-effort.
- Resumo final no formato `N/T`.

## Operar skill individual (sem depender do `[x]`)

Para agir somente na linha atual, sem usar o batch selecionado:

1. Mova o cursor para a skill desejada.
2. Use um dos atalhos:
   - `Shift+I`: instala apenas a skill atual;
   - `Shift+D`: remove apenas a skill atual (com confirmacao destrutiva).

Isso permite manter uma pre-selecao batch e ainda executar excecoes por item.

## Atualizar estado de skills

- Pressione `1` para **Home**.
- Execute `Refresh catalog`.

Isso recarrega catalogo e status de instalacao.
Nao existe refresh periodico automatico em background.

## Solucao de problemas

### Modulo Skills desabilitado com `desabilitada com aviso`

Causas provaveis:
- contrato invalido em `skills.toml`,
- arquivo de catalogo inacessivel.

Use [Referencia: contratos de catalogo](../reference/reference-catalog-contracts.md) para validar campos.

### Comando de instalacao falha por item sem detalhamento

Comportamento esperado na V1:
- motivo detalhado por item nao e expandido na lista final,
- apenas nomes com falha e token `N/T` sao garantidos.

Consulte a linha do tempo no log de auditoria:
- `~/.local/state/devkit/audit.log`
