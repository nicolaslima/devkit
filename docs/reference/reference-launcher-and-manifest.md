# Referencia: launcher e manifest

Esta pagina descreve o launcher remoto legado (execucao direta via gist da TUI).
Fluxo recomendado atual para distribuicao: `install.sh` + GitHub Releases.

## Arquivo launcher

- Caminho: `tui/launcher.sh`
- Entradas obrigatorias:
  - `PERSONAL_SKILLS_GIST_ID` (ou `GIST_ID`)
  - `PERSONAL_SKILLS_GIST_OWNER` (ou `GIST_OWNER`)
- Requisito de runtime: `bun` deve estar instalado.

## Fluxo do launcher

1. Resolver metadados do gist via flags/env.
2. Montar URL base raw do gist.
3. Baixar `manifest.json`.
4. Validar campos obrigatorios do manifest.
5. Para cada arquivo de `manifest.files`, resolver caminho remoto como `tui/<arquivo>` e aplicar URL-encode.
6. Baixar os arquivos e reconstruir a arvore local no runtime temporario.
7. Executar `bun run <manifest.entry>` no diretorio temporario de runtime.

Diretorio temporario de runtime:
- `${TMPDIR:-/tmp}/devkit-runtime`

## Contrato do manifest

Arquivo: `tui/manifest.json`

Observacao de deploy:
- No Gist, o manifest tambem e publicado com alias `manifest.json` na raiz para bootstrap remoto.
- Arquivos aninhados sao publicados com nome remoto URL-encoded por compatibilidade com a API de Gist.

Chaves obrigatorias:
- `app`
- `version`
- `entry`
- `files`
- `min_bun`

Fonte de schema:
- `tui/runtime/manifest.schema.json`

## Superficie de erro

O launcher retorna erros curtos e genericos em varios cenarios:
- `desabilitada com aviso`

Isso se aplica a ferramenta ausente, entrada malformada, manifest invalido ou falha de fetch.

## Padroes de execucao suportados

### Via GitHub CLI

```bash
gh gist view GIST_ID --raw --filename launcher.sh | \
  PERSONAL_SKILLS_GIST_ID=GIST_ID PERSONAL_SKILLS_GIST_OWNER=OWNER bash
```

### Via wget

```bash
wget -qO- https://gist.githubusercontent.com/OWNER/GIST_ID/raw/launcher.sh | \
  PERSONAL_SKILLS_GIST_ID=GIST_ID PERSONAL_SKILLS_GIST_OWNER=OWNER bash
```
