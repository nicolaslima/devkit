import type { AppTab } from "../types";

export const GLOBAL_KEYMAP = {
  quit: "q",
  help: "?",
  helpFallback: "/",
  tab: "tab",
  tabs: ["1", "2", "3", "4", "5", "6", "7"],
} as const;

export const DIRECTIONAL_KEYMAP = {
  up: ["up", "k"],
  down: ["down", "j"],
  left: ["left", "h"],
  right: ["right", "l"],
} as const;

export const CONFIRM_KEYS = ["enter", "return", "kpenter", "numpadenter"] as const;

export function isDirectionalKey(
  keyName: string,
  direction: keyof typeof DIRECTIONAL_KEYMAP,
): boolean {
  return (DIRECTIONAL_KEYMAP[direction] as readonly string[]).includes(keyName);
}

export function isHelpToggleKey(keyName: string, shiftPressed: boolean): boolean {
  return keyName === GLOBAL_KEYMAP.help || (keyName === GLOBAL_KEYMAP.helpFallback && shiftPressed);
}

export function resolveTabShortcut(keyName: string, tabs: readonly AppTab[]): AppTab | null {
  const index = (GLOBAL_KEYMAP.tabs as readonly string[]).indexOf(keyName);
  if (index < 0) {
    return null;
  }
  return tabs[index] ?? null;
}

export function isConfirmKey(keyName: string, sequence?: string, code?: string): boolean {
  if ((CONFIRM_KEYS as readonly string[]).includes(keyName)) {
    return true;
  }
  if (sequence === "\r" || sequence === "\n") {
    return true;
  }
  return typeof code === "string" && /enter/i.test(code);
}
