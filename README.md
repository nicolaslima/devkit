# DevKit

`DevKit` e uma TUI para padronizar setup de skills, MCPs, tools e configuracoes do Codex entre ambientes.

O projeto foi desenhado com foco em:
- fluxo simples para uso diario,
- catalogo remoto versionado via Gist,
- distribuicao sem npm, usando GitHub Releases + `install.sh`.

## Inicio rapido (usuario final)

Instalar/atualizar para a ultima versao stable:

```bash
curl -fsSL https://raw.githubusercontent.com/nicolaslima/devkit/main/install.sh | bash
```

Executar:

```bash
devkit
```

## Inicio rapido (desenvolvimento local)

```bash
cd /Users/lima/Projects/dev-stuffs/scripts/personal-skills/tui
bun install
bun run start
```

## Estrutura do projeto

- `tui/`: codigo da aplicacao OpenTUI (TypeScript)
- `skills.toml`, `tools.toml`, `mcp.toml`, `config-reference.toml`: contratos de catalogo
- `scripts/build-release.sh`: build de assets de release por plataforma
- `scripts/release-assets-manifest.txt`: matriz de assets suportados
- `install.sh`: instalador da ultima versao stable
- `test/install/`: testes shell do instalador
- `docs/`: documentacao em Diataxis

## Runtime e estado local

- log de auditoria: `~/.local/state/devkit/audit.log`
- cache de catalogo remoto: `~/.local/state/devkit/catalog/`
- config local do Codex: `~/.codex/config.toml`

## Catalogo remoto

O runtime da TUI e `remote-first`:
- tenta buscar catalogos no Gist remoto,
- atualiza cache local quando remoto responde,
- em falha de rede usa cache local (modo degradado),
- sem cache valido, o modulo afetado fica `desabilitada com aviso`.

## Comandos de qualidade

No diretorio `tui/`:

```bash
bun run typecheck
bun run test
bun run check:code
```

No diretorio raiz:

```bash
bash test/install/install-unit.sh
bash test/install/install-smoke.sh
```

## Build de release

Build local para o target do host:

```bash
bash scripts/build-release.sh
```

Para tentar todos os targets do manifesto na mesma maquina:

```bash
DEVKIT_BUILD_ALL=1 bash scripts/build-release.sh
```

Observacao: build cross-target pode falhar localmente dependendo de dependencias nativas da plataforma.

## CI de release

Workflow: `.github/workflows/release.yml`

Trigger:
- push de tag semver (`vX.Y.Z`)
- disparo manual (`workflow_dispatch`)

Saida:
- publica os binarios `devkit-*` e checksums `.sha256` na release do GitHub.

## Documentacao

Indice principal:
- [`docs/README.md`](./docs/README.md)

Quadrantes Diataxis:
- Tutoriais: [`docs/tutorials/`](./docs/tutorials/README.md)
- How-to guides: [`docs/how-to-guides/`](./docs/how-to-guides/README.md)
- Referencia: [`docs/reference/`](./docs/reference/README.md)
- Explicacao: [`docs/explanation/`](./docs/explanation/README.md)
