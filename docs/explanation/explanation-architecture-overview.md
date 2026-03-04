# Explicacao: visao geral de arquitetura

`devkit` usa uma arquitetura vertical-slice pragmatica para manter comportamento facil de localizar e manter.

## Arquitetura em alto nivel

```mermaid
graph TB
    User[Usuario no terminal] --> Install[install.sh]
    Install --> Binary[~/.local/bin/devkit]
    Binary --> UI[Telas e componentes OpenTUI]
    CatalogGist[devkit-catalog gist] --> UI

    UI --> MainScreen[Shell da MainScreen]
    MainScreen --> Orchestration[Hooks de orquestracao]

    Orchestration --> Modules[Modulos de dominio]
    Modules --> Skills[skills]
    Modules --> Codex[codex]
    Modules --> MCP[mcp]
    Modules --> ConfigSync[config-sync]
    Modules --> Tools[tools]
    Modules --> RunPlan[run-plan]

    Modules --> Actions[Camada de acoes]
    Actions --> Platform[Platform e adapters]
    Platform --> TOML[skills.toml tools.toml mcp.toml]
    Platform --> CodexConfig[~/.codex/config.toml]
    Platform --> Audit[~/.local/state/devkit/audit.log]
```

## Por que esta estrutura

A arquitetura separa **o que o usuario faz** (slices de dominio) de **como os efeitos colaterais acontecem** (actions/platform):

- `src/modules/*` agrupa comportamento de dominio orientado ao usuario.
- `src/actions/*` executa comandos e operacoes de filesystem.
- `src/adapters/*` isola shell e I/O de arquivos.
- `src/screens/*` trata renderizacao e orquestracao de interacao.

Isso reduz risco de reintroduzir um unico arquivo "god" para todo o comportamento.

## Modelo de execucao em runtime

```mermaid
sequenceDiagram
    participant U as Usuario
    participant T as TUI
    participant M as Comando de modulo
    participant A as Action
    participant F as Filesystem/Shell

    U->>T: Aciona atalho de teclado
    T->>M: Executa comando de dominio
    M->>T: Solicita confirmacao leve ou modal
    U->>T: Confirma acao
    T->>A: Executa action com efeito colateral
    A->>F: Le/escreve arquivos ou roda comando
    F-->>A: Resultado
    A-->>T: Sucesso/falha
    T-->>U: Linha de log + atualizacao do inspector
```

## Fronteiras principais

- Componentes de UI nao devem embutir regra de negocio de dominio.
- Modulos de dominio devem evitar imports cruzados entre dominios.
- Contratos de catalogo sao validados antes de habilitar acoes do modulo.
- Falha em um catalogo desabilita somente o modulo afetado.

## Fonte operacional da verdade

O comportamento de runtime e dirigido por catalogos na raiz:
- `skills.toml`
- `tools.toml`
- `mcp.toml`

Isso permite editar inventarios de comando sem alterar codigo.
