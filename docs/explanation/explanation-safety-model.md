# Explicacao: modelo de seguranca e confirmacao

O modelo de seguranca foi desenhado para evitar mudancas destrutivas acidentais sem tornar o fluxo rotineiro lento.

## Duas camadas de confirmacao

## 1. Confirmacao leve (nao destrutiva)

Para acoes nao destrutivas, o app usa confirmacao por token com Enter duplo:
- a primeira tentativa arma um token,
- a segunda tentativa correspondente executa.

Exemplo de mensagem:
- `Enter novamente para confirmar: refresh catalog`

Isso evita modais excessivos em operacoes frequentes.

## 2. Confirmacao modal (destrutiva)

Para acoes destrutivas, o app abre modal com detalhes explicitos:
- itens selecionados,
- resumo de impacto de limpeza,
- avisos (quando existirem).

O foco inicial fica em **Cancelar**.
Isso exige uma acao intencional de mover para **Confirmar** antes da execucao.

## Seguranca em escrita de config do Codex

Antes de escrever em `~/.codex/config.toml`, o app cria backup com timestamp e mantem apenas os tres backups mais recentes.

Isso se aplica a:
- toggles de MCP,
- insercao/remocao de bloco MCP,
- aplicacao de item de config sync.

## Modelo de cleanup com escopo

Cleanup de tools aceita paths e globs, mas a execucao e limitada a:
- diretorio atual de trabalho,
- diretorio home do usuario.

Tudo fora desses limites e ignorado e exibido como aviso.

## Estrategia de exposicao de erro

Para falhas de modulo relacionadas a catalogo, a UI usa mensagem curta e generica:
- `desabilitada com aviso`

Racional:
- evitar sobrecarregar o fluxo interativo com detalhes internos de parser,
- manter status de modulo visivel, com isolamento de impacto.

## Resumo de trade-off

- O sistema prioriza **seguranca operacional e resiliencia** em vez de diagnostico verboso por etapa.
- Investigacao detalhada continua possivel via logs e arquivos-fonte.
- Uso cotidiano continua rapido no teclado, com baixa friccao.
