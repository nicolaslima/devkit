# DevKit - Especificacao de Reestruturacao (Draft)

## 1. Contexto
Este documento substitui a linha anterior onde a TUI e o catalogo eram distribuídos juntos via Gist.

Novo objetivo:
- codigo da TUI em repo dedicado publico (`devkit`)
- catalogo remoto em Gist secreto (`devkit-catalog`)
- UX de execucao simples, sem precisar informar parametros manualmente no uso comum.

## 2. Artefatos provisionados
- Repo: `https://github.com/nicolaslima/devkit`
- Catalogo: `https://gist.github.com/nicolaslima/8c039f1a84d3d0898908c96a655f2d4b`

## 3. Requisitos ja fechados
- O nome do projeto passa a ser **DevKit**.
- Repo do codigo da TUI pode ser publico.
- Gist do catalogo deve ser secreto.
- Revisao da nova especificacao deve ocorrer por etapas.

## 4. Decisoes pendentes (essenciais)
- Nenhuma.

## 5. Direcao recomendada (proposta inicial)
- Distribuicao principal via **GitHub Releases** com `install.sh` (sem npm).
- Execucao padrao por comando local unico: `devkit`.
- `catalog_owner` e `catalog_gist_id` embutidos por padrao na TUI.
- Override opcional via arquivo local de config/env apenas para cenarios avancados.

## 6. Fluxo UX alvo (draft)
1. Instalar:
   - `curl -fsSL https://raw.githubusercontent.com/nicolaslima/devkit/main/install.sh | bash`
2. Executar:
   - `devkit`
3. Atualizar:
   - reinstalar via `install.sh` (v1).
4. Catalogo remoto:
   - lido do gist `devkit-catalog` por padrao.
   - sem parametros no uso comum.

## 7. Decisoes fechadas nesta etapa
- Atualizacao da v1 via reinstalacao com `install.sh`.
- Comando `devkit update` fica fora do escopo inicial (pode entrar em v2).
- Fallback da v1: modo degradado com cache local + aviso curto quando o catalogo remoto estiver indisponivel.
- Refresh do catalogo na v1: tentativa no startup + acao manual explicita de refresh na TUI.
- Artefato de distribuicao da v1: binario por plataforma (install.sh baixa executavel pronto).
- Canal de release da v1: somente **stable**.
- `install.sh` da v1 instala sempre a latest stable (sem pin de versao no fluxo principal).

## 8. Comportamento de fallback (v1)
- Se o fetch remoto falhar, o DevKit usa o ultimo snapshot local valido do catalogo.
- A TUI abre em modo degradado com mensagem curta de aviso.
- Em primeira execucao sem cache local e sem rede: mostrar erro curto e instruir a tentar novamente com conectividade.
- O modo degradado nao bloqueia navegacao basica da TUI; apenas limita operacoes que exigem dados remotos frescos.

## 9. Politica de refresh de catalogo (v1)
- Ao iniciar o DevKit, tentar refresh remoto do catalogo.
- Disponibilizar comando/acao manual de refresh na TUI.
- Nao executar refresh periodico automatico em background na v1.

## 10. Distribuicao de release (v1)
- Publicar binarios por plataforma via GitHub Releases.
- `install.sh` detecta SO/arquitetura e baixa o asset correto.
- Dependencia de Bun no ambiente do usuario final: **nao** (somente no processo de build/release).
- Canal de publicacao: somente stable na v1 (sem pre-release oficial).
- Matriz de plataformas v1: macOS e Linux, com builds amd64 e arm64.
- Instalacao local v1: `~/.local/bin/devkit` com sobrescrita automatica em reinstalacoes.

## 11. Versionamento inicial (v1)
- Tag semver do primeiro release: `v0.1.0`.
- Evolucao inicial sugerida: `v0.1.x` para ajustes de estabilidade, sem compromisso de API/UX "long-term stable" de `v1.0.0`.

> Status: **Em revisao interativa**
