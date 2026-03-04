# Tutorial 01: primeira execucao local

Este tutorial mostra uma execucao local completa do `devkit`.

Ao final, voce vai:
- iniciar a TUI localmente,
- atualizar todos os modulos,
- inspecionar as abas Skills, MCP e Tools,
- executar uma acao segura com confirmacao.

## Passo 1: ir para o projeto

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills
```

Voce deve ver arquivos como `skills.toml`, `tools.toml`, `mcp.toml` e `tui/`.

## Passo 2: instalar dependencias

```bash
cd tui
bun install
```

Aguarde o termino da instalacao.

## Passo 3: iniciar a TUI

```bash
bun run start
```

Voce deve ver:
- barra de status superior com o nome `devkit`,
- navegacao lateral com abas `[1] Home` ate `[7] Run Plan`,
- workspace central,
- inspector a direita,
- command bar com atalhos.

## Passo 4: navegar entre abas

Use:
- `1..7` para trocar de aba,
- `j/k` ou setas para mover cursor,
- `Tab` para alternar foco.

Vá para:
1. aba `Skills` (`2`)
2. aba `MCP` (`4`)
3. aba `Tools` (`6`)

Observe como o inspector muda por aba.

## Passo 5: executar uma acao segura com confirmacao leve

Volte para `Home` (`1`).
Mova o cursor para `Refresh catalog` e pressione `Enter` uma vez.

O log deve mostrar mensagem como:
- `Enter novamente para confirmar: refresh catalog`

Pressione `Enter` novamente.

A acao deve executar e registrar inicio/fim no log.

## Passo 6: abrir e fechar Ajuda

Pressione `?` para abrir a ajuda.
Pressione `Esc` para fechar.

## Passo 7: sair com seguranca

Pressione `q` para sair.

Voce concluiu sua primeira execucao local completa.

## Proximos passos

- Se quiser executar operacoes reais, continue em [Como gerenciar skills](../how-to-guides/how-to-manage-skills.md).
- Se quiser contratos de comando, veja [Referencia: comandos e scripts](../reference/reference-commands-and-scripts.md).
