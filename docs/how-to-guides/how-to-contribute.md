# Como contribuir

Este guia descreve o fluxo esperado de contribuicao para `DevKit`.

## Escopo e organizacao

A raiz do projeto contem contratos compartilhados e documentacao.
A implementacao da TUI fica em `tui/`.

## 1. Preparar workspace

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills
git status
```

Verifique mudancas nao relacionadas antes de comecar.

## 2. Instalar e validar toolchain da TUI

```bash
cd tui
bun install
bun run typecheck
bun run test
```

As duas verificacoes devem passar antes e depois da mudanca.

## 3. Respeitar fronteiras de arquitetura

Siga slices verticais e camadas:
- `src/modules/*` para logica de dominio,
- `src/platform/*` para adaptadores/contratos,
- `src/screens/*` e `src/components/*` para orquestracao/renderizacao da UI.

Prefira arquivos pequenos e hooks extraidos em vez de monolitos.

## 4. Manter contratos de catalogo alinhados

Ao mudar comportamento relacionado a skills/tools/MCP:
- valide contratos de `skills.toml`, `tools.toml`, `mcp.toml`,
- atualize paginas de Referencia correspondentes.

## 5. Executar quality gates

```bash
cd tui
bun run typecheck
bun run test
bun run check:code
```

Se `check:code` reportar baseline pre-existente, evite introduzir novos problemas.

Tambem rode os testes shell do instalador na raiz:

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills
bash test/install/install-unit.sh
bash test/install/install-smoke.sh
```

## 6. Atualizar docs por quadrante Diataxis

- Tutoriais para fluxo guiado de aprendizado,
- Guias praticos para tarefas operacionais,
- Referencia para contratos factuais,
- Explicacao para racional e trade-offs.

Nao misture tipos em uma mesma pagina.

## 7. Disciplina de commit

- Mantenha commits focados e revisaveis.
- Use mensagens de commit descritivas.
- Evite misturar refactor, docs e mudanca de comportamento no mesmo commit quando possivel.

## 8. Checklist sugerido de revisao

- [ ] Comportamento validado por testes
- [ ] Sem regressao de fronteira de arquitetura
- [ ] Consistencia de manifest/launcher preservada
- [ ] Documentacao relevante atualizada
- [ ] Links do README continuam validos

## 9. Publicar atualizacao no Gist compartilhado

Quando houver mudancas relevantes para distribuicao remota da TUI:

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills
bash deploy-gist.sh
```

Fluxo esperado:
- autenticar via `GH_PAT_TOKEN` no `gh`;
- criar/atualizar o Gist privado `personal-skills`;
- manter o mesmo id de Gist local em `.gist-id`.

## 10. Publicar release binaria

Para distribuir uma nova versao do `devkit` via `install.sh`:

1. Atualize codigo e valide quality gates.
2. Crie e envie uma tag semver:

```bash
git tag v0.1.0
git push origin v0.1.0
```

3. Acompanhe o workflow `Release` no GitHub Actions.
4. Valide se os assets `devkit-*` e `*.sha256` foram anexados na release.
