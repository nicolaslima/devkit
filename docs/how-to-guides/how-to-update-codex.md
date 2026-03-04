# Como atualizar o Codex (local ou Codespaces)

Este guia mostra como atualizar o Codex em exatamente um alvo por execucao.

## Regra principal

Escolha apenas um alvo:
- `local`, ou
- `codespace`

Nao existe atualizacao em lote para os dois alvos.

## Atualizar Codex localmente

1. Abra a aba **Codex** com `3`.
2. Na linha `Target`, escolha `local` com `←/→`.
3. Na linha `Channel`, escolha:
   - `stable`, ou
   - `alpha` (ultima tag alpha publicada).
4. Na linha `Confirmar update`, pressione `Enter`.
5. Pressione `Enter` novamente para confirmar.

Comandos executados:
- stable: `npm i -g @openai/codex`
- alpha: `npm i -g @openai/codex@<dist-tags.alpha>`

## Atualizar Codex em Codespaces

1. Abra a aba **Codex**.
2. Defina `Target` como `codespace`.
3. Mantenha canal conforme desejado (o alvo define o caminho de execucao).
4. Execute a atualizacao em `Confirmar update`.

Comando executado:

```bash
sudo bash -c "curl -fsSL https://raw.githubusercontent.com/jsburckhardt/devcontainer-features/main/src/codex/install.sh | bash"
```

## Atualizar versao atual e dist-tags

Na aba **Codex**:
- vá para `Refresh dist-tags/version`,
- pressione `Enter` e depois `Enter` novamente.

## Solucao de problemas

### `falha ao resolver versao alpha`

Indica falha na resolucao de dist-tag alpha.

Comportamento na V1:
- fluxo alpha e bloqueado,
- nao existe fallback manual para digitar versao alpha.

Use canal `stable` e tente novamente.

### `falha ao atualizar codex`

Verifique:
- acesso a rede,
- permissao global do npm,
- se voce esta em Codespaces quando alvo for `codespace`.
