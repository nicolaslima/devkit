# Referencia: atalhos de teclado e abas

Esta pagina define controles de teclado e semantica de abas.

## Atalhos globais

| Tecla | Comportamento |
|---|---|
| `1..7` | Salta diretamente para a aba na ordem fixa |
| `Tab` | Proximo ciclo de foco/contexto |
| `Shift+Tab` | Ciclo anterior |
| `j` / `↓` | Move cursor para baixo |
| `k` / `↑` | Move cursor para cima |
| `h` / `←` | Acao para esquerda no contexto |
| `l` / `→` | Acao para direita no contexto |
| `Enter` | Acao primaria |
| `q` | Sair do app |
| `?` ou `Shift+/` | Abrir ajuda |
| `Esc` | Fechar modal/ajuda |

## Ordem das abas

| Indice | Tecla da aba | ID interno | Label |
|---|---|---|---|
| 1 | `1` | `home` | Home |
| 2 | `2` | `skills` | Skills |
| 3 | `3` | `codex` | Codex |
| 4 | `4` | `mcp` | MCP |
| 5 | `5` | `configSync` | Config Sync |
| 6 | `6` | `tools` | Tools |
| 7 | `7` | `runPlan` | Run Plan |

## Atalhos locais por aba

| Aba | Atalho | Comportamento |
|---|---|---|
| Skills | `Space` | Alternar skill selecionada |
| Skills | `Enter` | Alternar skill selecionada |
| Skills | `i` | Instalar skills selecionadas |
| Skills | `r` | Remover skills locais selecionadas |
| Skills | `Shift+I` | Instalar skill da linha atual (independente do batch) |
| Skills | `Shift+D` | Remover skill da linha atual (independente do batch, destrutivo) |
| Codex | `←/→` | Alterar target/channel conforme linha |
| MCP | `t` | Alternar bloco MCP selecionado |
| Config Sync | `a` | Aplicar item de diff selecionado |
| Tools | `Space` | Alternar tool selecionada |
| Tools | `i` | Instalar tools selecionadas |
| Tools | `u` | Atualizar tools selecionadas |
| Tools | `x` | Desinstalar tools selecionadas (destrutivo) |
| Tools | `c` | Configurar tools selecionadas com MCP do Codex |

## Mapeamento de confirmacao

| Tipo de acao | Modelo de confirmacao |
|---|---|
| Nao destrutiva | confirmacao leve por token com Enter duplo |
| Destrutiva | modal com foco inicial em `Cancelar` |

## Politica de refresh

- Sem polling automatico em background.
- Refresh ocorre:
  - no bootstrap inicial (uma vez por execucao),
  - apos acoes que alteram estado,
  - quando o usuario aciona refresh manual.

## Restricoes de terminal

- Tamanho minimo suportado: `80x24`.
- Interacao por mouse desabilitada (`useMouse: false`).
