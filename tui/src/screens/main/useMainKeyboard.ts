import { useKeyboard } from "@opentui/react";
import {
  CONFIRM_KEYS,
  GLOBAL_KEYMAP,
  isDirectionalKey,
  isHelpToggleKey,
  resolveTabShortcut,
} from "../../app/keymap";
import type { AppTab, CodexChannel, CodexTarget } from "../../types";
import { TAB_ORDER } from "./tabConfig";
import type { ConfirmAction } from "./types";

interface MainKeyboardDeps {
  renderer: { destroy: () => void };
  activeTab: AppTab;
  transitionBlockUntil: number;
  helpOpen: boolean;
  setHelpOpen: (value: boolean) => void;
  confirmAction: ConfirmAction | null;
  setConfirmAction: (value: ConfirmAction | null) => void;
  confirmFocusConfirm: boolean;
  setConfirmFocusConfirm: (value: boolean) => void;
  appendLog: (message: string) => void;
  clearLightConfirm: () => void;
  runTask: (title: string, task: () => Promise<void>) => Promise<void>;
  handleTabCycle: (delta: number) => void;
  switchTab: (tab: AppTab) => void;
  moveCurrentCursor: (delta: number) => void;
  toggleCurrentSkillSelection: () => void;
  installSelectedSkillsAction: () => Promise<void>;
  removeSelectedSkillsAction: () => Promise<void>;
  toggleCurrentToolSelection: () => void;
  executeSelectedToolAction: (mode: "install" | "update" | "configure" | "uninstall") => Promise<void>;
  toggleCurrentMcpAction: () => Promise<void>;
  applyCurrentDiffAction: () => Promise<void>;
  activatePrimaryAction: () => Promise<void>;
  getCursor: (tab: AppTab) => number;
  setCodexTarget: (value: CodexTarget | ((prev: CodexTarget | null) => CodexTarget)) => void;
  setCodexChannel: (value: CodexChannel | ((prev: CodexChannel) => CodexChannel)) => void;
}

export function useMainKeyboard({
  renderer,
  activeTab,
  transitionBlockUntil,
  helpOpen,
  setHelpOpen,
  confirmAction,
  setConfirmAction,
  confirmFocusConfirm,
  setConfirmFocusConfirm,
  appendLog,
  clearLightConfirm,
  runTask,
  handleTabCycle,
  switchTab,
  moveCurrentCursor,
  toggleCurrentSkillSelection,
  installSelectedSkillsAction,
  removeSelectedSkillsAction,
  toggleCurrentToolSelection,
  executeSelectedToolAction,
  toggleCurrentMcpAction,
  applyCurrentDiffAction,
  activatePrimaryAction,
  getCursor,
  setCodexTarget,
  setCodexChannel,
}: MainKeyboardDeps): void {
  useKeyboard((key) => {
    if (key.eventType === "release") {
      return;
    }

    const helpKeyPressed = isHelpToggleKey(key.name, key.shift);

    if (Date.now() < transitionBlockUntil) {
      key.preventDefault();
      return;
    }

    if (helpOpen) {
      if (key.name === "escape" || key.name === GLOBAL_KEYMAP.quit || helpKeyPressed) {
        key.preventDefault();
        setHelpOpen(false);
      }
      return;
    }

    if (confirmAction) {
      if (isDirectionalKey(key.name, "left") || key.name === GLOBAL_KEYMAP.tab) {
        setConfirmFocusConfirm(false);
        key.preventDefault();
        return;
      }
      if (isDirectionalKey(key.name, "right")) {
        setConfirmFocusConfirm(true);
        key.preventDefault();
        return;
      }
      if (key.name === "enter") {
        key.preventDefault();
        if (!confirmFocusConfirm) {
          setConfirmAction(null);
          clearLightConfirm();
          appendLog("acao destrutiva cancelada");
          return;
        }

        const next = confirmAction;
        setConfirmAction(null);
        void runTask(next.title, next.run);
        return;
      }
      if (key.name === "escape") {
        setConfirmAction(null);
        clearLightConfirm();
        appendLog("acao destrutiva cancelada");
        key.preventDefault();
      }
      return;
    }

    if (key.name === GLOBAL_KEYMAP.quit) {
      key.preventDefault();
      renderer.destroy();
      return;
    }

    if (helpKeyPressed) {
      key.preventDefault();
      clearLightConfirm();
      setHelpOpen(true);
      return;
    }

    if (key.name === GLOBAL_KEYMAP.tab && !key.shift) {
      key.preventDefault();
      clearLightConfirm();
      handleTabCycle(1);
      return;
    }
    if (key.name === GLOBAL_KEYMAP.tab && key.shift) {
      key.preventDefault();
      clearLightConfirm();
      handleTabCycle(-1);
      return;
    }

    const tabShortcut = resolveTabShortcut(key.name, TAB_ORDER);
    if (tabShortcut) {
      key.preventDefault();
      clearLightConfirm();
      switchTab(tabShortcut);
      return;
    }

    if (isDirectionalKey(key.name, "down")) {
      key.preventDefault();
      clearLightConfirm();
      moveCurrentCursor(1);
      return;
    }

    if (isDirectionalKey(key.name, "up")) {
      key.preventDefault();
      clearLightConfirm();
      moveCurrentCursor(-1);
      return;
    }

    if (key.name === "space" && activeTab === "skills") {
      key.preventDefault();
      clearLightConfirm();
      toggleCurrentSkillSelection();
      return;
    }

    if (key.name === "i" && activeTab === "skills") {
      key.preventDefault();
      void installSelectedSkillsAction();
      return;
    }

    if (key.name === "r" && activeTab === "skills") {
      key.preventDefault();
      void removeSelectedSkillsAction();
      return;
    }

    if (key.name === "space" && activeTab === "tools") {
      key.preventDefault();
      clearLightConfirm();
      toggleCurrentToolSelection();
      return;
    }

    if (key.name === "i" && activeTab === "tools") {
      key.preventDefault();
      void executeSelectedToolAction("install");
      return;
    }

    if (key.name === "u" && activeTab === "tools") {
      key.preventDefault();
      void executeSelectedToolAction("update");
      return;
    }

    if (key.name === "x" && activeTab === "tools") {
      key.preventDefault();
      void executeSelectedToolAction("uninstall");
      return;
    }

    if (key.name === "c" && activeTab === "tools") {
      key.preventDefault();
      void executeSelectedToolAction("configure");
      return;
    }

    if (key.name === "t" && activeTab === "mcp") {
      key.preventDefault();
      void toggleCurrentMcpAction();
      return;
    }

    if (key.name === "a" && activeTab === "configSync") {
      key.preventDefault();
      void applyCurrentDiffAction();
      return;
    }

    if (isDirectionalKey(key.name, "left")) {
      if (activeTab === "codex") {
        key.preventDefault();
        clearLightConfirm();
        if (getCursor("codex") === 0) {
          setCodexTarget("local");
          return;
        }
        if (getCursor("codex") === 1) {
          setCodexChannel("stable");
        }
      }
      return;
    }

    if (isDirectionalKey(key.name, "right")) {
      if (activeTab === "codex") {
        key.preventDefault();
        clearLightConfirm();
        if (getCursor("codex") === 0) {
          setCodexTarget("codespace");
          return;
        }
        if (getCursor("codex") === 1) {
          setCodexChannel("alpha");
        }
      }
      return;
    }

    if ((CONFIRM_KEYS as readonly string[]).includes(key.name)) {
      key.preventDefault();
      void activatePrimaryAction();
    }
  });
}
