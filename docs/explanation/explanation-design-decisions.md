# Explicacao: decisoes de design e trade-offs

Esta pagina resume decisoes centrais que moldaram o estado atual do projeto.

## Decisao 1: TUI-first em vez de scripts shell isolados

**Decisao:** usar OpenTUI com shell persistente de tres paineis.

**Por que:**
- operadores precisam visibilidade de selecao, impacto e estado de execucao em uma tela,
- interacao por teclado e mais rapida do que multiplos scripts ad-hoc.

**Trade-off:**
- complexidade de implementacao maior do que shell puro,
- usabilidade melhor no longo prazo para setup recorrente de ambiente.

## Decisao 2: catalogos TOML na raiz como inventario de comandos

**Decisao:** manter `skills.toml`, `tools.toml` e `mcp.toml` na raiz do repositorio/gist.

**Por que:**
- atualizacoes sem codigo ficam simples,
- inventario de comandos fica explicito e versionado,
- comportamento do app pode ser padronizado entre ambientes.

**Trade-off:**
- validacao estrita de contrato e obrigatoria para evitar mismatch em runtime.

## Decisao 3: vertical slices modulares

**Decisao:** estruturar comportamento por dominio (`skills`, `codex`, `mcp`, `config-sync`, `tools`, `run-plan`).

**Por que:**
- manutencao e ownership mais claros,
- evita handler central monolitico,
- permite refactor incremental sem mudar o fluxo do usuario.

**Trade-off:**
- mais arquivos e wrappers,
- navegacao mais facil e menor carga cognitiva.

## Decisao 4: erro generico por modulo na UI

**Decisao:** exibir `desabilitada com aviso` para falhas de contrato.

**Por que:**
- mantem interacao concisa,
- evita expor detalhes internos no caminho principal do usuario,
- preserva padrao previsivel de UX.

**Trade-off:**
- menos diagnostico imediato na UI,
- diagnostico profundo vai para logs e checagens no codigo.

## Decisao 5: distribuicao primaria por install.sh + GitHub Releases

**Decisao:** o caminho oficial de uso e `install.sh` para instalar/atualizar o binario `devkit`.
O launcher remoto fica apenas como legado de compatibilidade.

**Por que:**
- UX mais simples (um comando de instalacao + `devkit`),
- elimina dependencia de parametros manuais de gist no uso diario,
- reduz variabilidade de runtime ao usar assets versionados por release.

**Trade-off:**
- depende de release publicada para distribuir mudancas de runtime,
- bootstrap remoto legado passa a ser caminho secundario.

## Decisao 6: execucao em lote best-effort

**Decisao:** lotes de skills e tools continuam mesmo com falhas individuais.

**Por que:**
- maximiza progresso em ambientes heterogeneos,
- reduz repeticao manual de tentativas.

**Trade-off:**
- usuario revisa resumo final (`N/T`) em vez de semantica stop-on-first-failure.
