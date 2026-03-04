# Documentacao do DevKit

Esta documentacao segue o framework Diataxis para que cada pagina atenda uma necessidade especifica.

- **Tutoriais**: aprender fazendo, em um fluxo guiado e seguro.
- **Guias praticos**: resolver tarefas reais durante o trabalho.
- **Referencia**: consultar fatos exatos, contratos e comandos.
- **Explicacao**: entender arquitetura e decisoes de design.

## Mapa da documentacao

| Necessidade | Comece aqui | Conteudo |
|---|---|---|
| Sou novo e quero aprender | [Tutoriais](./tutorials/README.md) | Primeira execucao local e primeira instalacao/uso via install.sh |
| Preciso concluir uma tarefa agora | [Guias praticos](./how-to-guides/README.md) | Skills, atualizacao de Codex, MCP, config sync, tools, contribuicao |
| Preciso de fatos tecnicos exatos | [Referencia](./reference/README.md) | Atalhos, contratos de arquivos, launcher/manifest, comandos |
| Quero entender o por que das decisoes | [Explicacao](./explanation/README.md) | Arquitetura, modelo de seguranca e trade-offs |

## Links rapidos

- [Tutorial: primeira execucao local](./tutorials/tutorial-01-first-local-run.md)
- [Guia: gerenciar skills](./how-to-guides/how-to-manage-skills.md)
- [Guia: gerenciar servidores MCP](./how-to-guides/how-to-manage-mcp-servers.md)
- [Referencia: contratos TOML de catalogo](./reference/reference-catalog-contracts.md)
- [Explicacao: visao geral de arquitetura](./explanation/explanation-architecture-overview.md)

## Arquivos fonte da verdade

- `skills.toml`
- `tools.toml`
- `mcp.toml`
- `config-reference.toml`

## Regra de manutencao

Se houver mudanca de comportamento em `tui/src/**` ou mudanca de contrato em `*.toml`, atualize primeiro a pagina de **Referencia** correspondente, depois os **Guias praticos**, e por fim os **Tutoriais** quando o fluxo de onboarding for impactado.
