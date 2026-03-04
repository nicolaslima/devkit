export interface LightConfirmResult {
  confirmed: boolean;
  nextToken: string | null;
}

export function resolveLightConfirm(
  currentToken: string | null,
  actionToken: string,
): LightConfirmResult {
  if (currentToken === actionToken) {
    return {
      confirmed: true,
      nextToken: null,
    };
  }

  return {
    confirmed: false,
    nextToken: actionToken,
  };
}

export function buildLightConfirmMessage(label: string): string {
  return `Enter novamente para confirmar: ${label}`;
}
