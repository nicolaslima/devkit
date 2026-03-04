# Como sincronizar config do Codex com a referencia

Este guia mostra como revisar e aplicar diferencas de configuracao item a item.

## Objetivo

Comparar `~/.codex/config.toml` local com `config-reference.toml` e aplicar apenas mudancas selecionadas.

## Atualizar diff

1. Abra a aba **Config Sync** (`5`).
2. Se necessario, vá em **Home** e execute `Refresh config diff`.

A aba lista itens com status como:
- `missing`
- `different`
- `only-local`

## Aplicar um item

1. Selecione um item de diff.
2. Pressione `a` (ou `Enter`).
3. Confirme:
   - confirmacao leve para itens nao destrutivos,
   - modal destrutivo para insercao de secao quando aplicavel.

## Comportamento importante

- O app aplica apenas **um item por vez**.
- Nao existe sobrescrita automatica em lote por padrao.
- Itens `key-only-local` nao sao aplicados automaticamente.

## Comportamento de seguranca

Antes de mutacao do arquivo local:
- backup e criado com sufixo de timestamp,
- retencao de backup e limitada a 3 arquivos.

## Validar resultado

1. Atualize o diff novamente.
2. Confirme que o item saiu da lista pendente.

## Solucao de problemas

### Arquivo de referencia nao encontrado

Candidatos de referencia sao resolvidos nesta ordem:
1. `config-reference.toml` na raiz do projeto,
2. `config.toml` na raiz do projeto,
3. os mesmos nomes no diretorio atual.

### Aba Config Sync mostra itens only-local inesperados

Isso significa que o config local contem entradas fora da baseline de referencia.
Avalie caso a caso se devem ser mantidas.
