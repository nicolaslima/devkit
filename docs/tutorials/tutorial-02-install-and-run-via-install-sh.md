# Tutorial 02: instalacao e uso rapido via install.sh

Este tutorial mostra o fluxo recomendado para uso remoto do DevKit:
- instalar/atualizar com `install.sh`,
- executar a TUI pelo binario `devkit`,
- validar que o catalogo remoto foi carregado.

## Passo 1: instalar a ultima versao stable

```bash
curl -fsSL https://raw.githubusercontent.com/nicolaslima/devkit/main/install.sh | bash
```

O script instala em:
- `~/.local/bin/devkit`

## Passo 2: validar binario instalado

```bash
ls -l ~/.local/bin/devkit
```

Se necessario, adicione `~/.local/bin` no `PATH`.

## Passo 3: executar a TUI

```bash
devkit
```

Voce deve ver `devkit` na barra superior.

## Passo 4: validar leitura do catalogo remoto

No `Home` (`1`), execute `Refresh catalog`.

Se o remoto estiver indisponivel, a app usa cache local e segue em modo degradado.
Se nao houver cache e catalogo remoto valido, apenas o modulo afetado fica com:
- `desabilitada com aviso`

## Passo 5: sair do app

Pressione `q`.

## Solucao de problemas

- Falha no instalador:
  - confira conectividade com GitHub,
  - confira se `curl` e `python3` estao instalados.
- Erro de permissao no binario:
  - valide `~/.local/bin` e execute novamente o instalador.
- Catalogo nao carregado:
  - valide `skills.toml`, `tools.toml`, `mcp.toml` e `config-reference.toml` no gist `devkit-catalog`.

## Proximos passos

- [Guia: gerenciar skills](../how-to-guides/how-to-manage-skills.md)
- [Guia: gerenciar servidores MCP](../how-to-guides/how-to-manage-mcp-servers.md)
- [Referencia: comandos e scripts](../reference/reference-commands-and-scripts.md)
