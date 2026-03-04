export function nowTime(): string {
  return new Date().toISOString().slice(11, 19);
}

export function humanError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
