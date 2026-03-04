# Referencia: launcher e manifest (legado)

Esta pagina documenta o bootstrap remoto antigo (via Gist com `launcher.sh` + `manifest.json`).
Ele continua no repositorio por compatibilidade, mas nao e o fluxo recomendado de distribuicao.

Fluxo recomendado atual:
- `install.sh` + GitHub Releases,
- execucao local do binario `devkit`.

## Quando usar (somente excecao)

Use launcher apenas se precisar depurar bootstrap remoto legado.
Para uso normal, nao utilize esta rota.

## Arquivos legados

- Launcher: `tui/launcher.sh`
- Manifest: `tui/manifest.json`
- Schema: `tui/runtime/manifest.schema.json`

## Contrato minimo do manifest

Chaves obrigatorias:
- `app`
- `version`
- `entry`
- `files`
- `min_bun`

## Dependencias do launcher legado

- `bun` instalado localmente.
- Variaveis de identificacao do gist:
  - `PERSONAL_SKILLS_GIST_ID` (ou `GIST_ID`)
  - `PERSONAL_SKILLS_GIST_OWNER` (ou `GIST_OWNER`)

## Runtime temporario legado

- `${TMPDIR:-/tmp}/devkit-runtime`

## Mensagem de erro curta

Falhas de fetch, manifest invalido ou ambiente incompleto podem resultar em:
- `desabilitada com aviso`

## Exemplo (legado)

```bash
gh gist view GIST_ID --raw --filename launcher.sh | \
  PERSONAL_SKILLS_GIST_ID=GIST_ID PERSONAL_SKILLS_GIST_OWNER=OWNER bash
```
