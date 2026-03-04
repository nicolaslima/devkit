import { TextAttributes } from "@opentui/core";
import { useRenderer, useTerminalDimensions } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import type { DistTags } from "../actions/codex";
import { CommandBar } from "../components/CommandBar";
import { ConfirmModal } from "../components/ConfirmModal";
import { HelpModal } from "../components/HelpModal";
import { InspectorPanel } from "../components/InspectorPanel";
import { NavigationPanel } from "../components/NavigationPanel";
import { TopStatusBar } from "../components/TopStatusBar";
import { WorkspacePanel } from "../components/WorkspacePanel";
import { APP_NAME, LOCAL_CODEX_CONFIG, REFERENCE_CONFIG_CANDIDATES } from "../constants";
import { appendAudit } from "../core/audit";
import { buildLightConfirmMessage, resolveLightConfirm } from "../core/lightConfirm";
import { useTabCursor } from "../hooks/useTabCursor";
import { theme } from "../theme";
import type {
  AppTab,
  CodexChannel,
  CodexTarget,
  ConfigDiffItem,
  McpServerInfo,
  SkillRecipe,
  ToolName,
  ToolStatus,
} from "../types";
import { buildCommandBarText } from "./main/commandHints";
import { humanError, nowTime } from "./main/errorFormat";
import { HOME_ACTIONS } from "./main/homeActions";
import { PROFILE_LABEL, PROJECT_LABEL, TAB_LABELS, TAB_ORDER } from "./main/tabConfig";
import type { ConfirmAction } from "./main/types";
import { useMainActions } from "./main/useMainActions";
import { useMainKeyboard } from "./main/useMainKeyboard";
import { useMainViewModel } from "./main/useMainViewModel";

export function MainScreen() {
  const renderer = useRenderer();
  const { width, height } = useTerminalDimensions();

  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [busy, setBusy] = useState(false);
  const [transitionBlockUntil, setTransitionBlockUntil] = useState(Date.now() + 60);

  const { getCursor, moveCursor } = useTabCursor({
    home: 0,
    skills: 0,
    codex: 0,
    mcp: 0,
    configSync: 0,
    tools: 0,
    runPlan: 0,
  });

  const [logs, setLogs] = useState<string[]>(["ready"]);

  const [skills, setSkills] = useState<SkillRecipe[]>([]);
  const [skillsModuleError, setSkillsModuleError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const [codexTarget, setCodexTarget] = useState<CodexTarget | null>(null);
  const [codexChannel, setCodexChannel] = useState<CodexChannel>("stable");
  const [distTags, setDistTags] = useState<DistTags>({ latest: "-", alpha: "-" });
  const [codexVersion, setCodexVersion] = useState("unknown");

  const [mcpServers, setMcpServers] = useState<McpServerInfo[]>([]);
  const [mcpModuleError, setMcpModuleError] = useState<string | null>(null);

  const [referenceConfigPath, setReferenceConfigPath] = useState<string>(
    REFERENCE_CONFIG_CANDIDATES[0] ?? "config.toml",
  );
  const [configDiff, setConfigDiff] = useState<ConfigDiffItem[]>([]);

  const [toolStatuses, setToolStatuses] = useState<ToolStatus[]>([]);
  const [toolsModuleError, setToolsModuleError] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<ToolName>>(new Set());

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmFocusConfirm, setConfirmFocusConfirm] = useState(false);
  const [lightConfirmToken, setLightConfirmToken] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const appendLog = useCallback((message: string) => {
    setLogs((previous) => {
      const next = [...previous, `${nowTime()} ${message}`];
      return next.slice(-220);
    });
  }, []);

  const runTask = useCallback(
    async (title: string, task: () => Promise<void>) => {
      if (busy) {
        appendLog(`busy: ${title}`);
        return;
      }

      setLightConfirmToken(null);
      setBusy(true);
      appendLog(`▶ ${title}`);
      await appendAudit(`[start] ${title}`).catch(() => undefined);

      try {
        await task();
        appendLog(`✔ ${title}`);
        await appendAudit(`[ok] ${title}`).catch(() => undefined);
      } catch (error) {
        const message = humanError(error);
        appendLog(`✖ ${title}: ${message}`);
        await appendAudit(`[error] ${title} :: ${message}`).catch(() => undefined);
      } finally {
        setBusy(false);
      }
    },
    [appendLog, busy],
  );

  const clearLightConfirm = useCallback(() => {
    setLightConfirmToken(null);
  }, []);

  const requestLightConfirm = useCallback(
    (token: string, label: string): boolean => {
      const result = resolveLightConfirm(lightConfirmToken, token);
      setLightConfirmToken(result.nextToken);
      if (!result.confirmed) {
        appendLog(buildLightConfirmMessage(label));
        return false;
      }
      return true;
    },
    [appendLog, lightConfirmToken],
  );

  const switchTab = useCallback((nextTab: AppTab) => {
    setActiveTab(nextTab);
    setTransitionBlockUntil(Date.now() + 140);
  }, []);

  const actions = useMainActions({
    homeActions: HOME_ACTIONS,
    runPlanLength: logs.length,
    activeTab,
    getCursor,
    appendLog,
    clearLightConfirm,
    requestLightConfirm,
    runTask,
    skills,
    selectedSkills,
    setSelectedSkills,
    skillsModuleError,
    codexTarget,
    codexChannel,
    setCodexTarget,
    setCodexChannel,
    distTags,
    setDistTags,
    setCodexVersion,
    mcpServers,
    mcpModuleError,
    configDiff,
    toolStatuses,
    selectedTools,
    setSelectedTools,
    toolsModuleError,
    setConfirmAction,
    setConfirmFocusConfirm,
    setSkills,
    setSkillsModuleError,
    setMcpServers,
    setMcpModuleError,
    setReferenceConfigPath,
    setConfigDiff,
    setToolStatuses,
    setToolsModuleError,
  });

  useEffect(() => {
    void runTask("bootstrap", actions.refreshCatalog);
  }, [actions.refreshCatalog, runTask]);

  const moveCurrentCursor = useCallback(
    (delta: number) => {
      moveCursor(activeTab, delta, actions.getActiveTabLength());
    },
    [activeTab, actions, moveCursor],
  );

  const handleTabCycle = useCallback(
    (delta: number) => {
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      const next = (currentIndex + delta + TAB_ORDER.length) % TAB_ORDER.length;
      switchTab(TAB_ORDER[next] ?? "home");
    },
    [activeTab, switchTab],
  );

  useMainKeyboard({
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
    toggleCurrentSkillSelection: actions.toggleCurrentSkillSelection,
    installSelectedSkillsAction: actions.installSelectedSkillsAction,
    removeSelectedSkillsAction: actions.removeSelectedSkillsAction,
    toggleCurrentToolSelection: actions.toggleCurrentToolSelection,
    executeSelectedToolAction: actions.executeSelectedToolAction,
    toggleCurrentMcpAction: actions.toggleCurrentMcpAction,
    applyCurrentDiffAction: actions.applyCurrentDiffAction,
    activatePrimaryAction: actions.activatePrimaryAction,
    getCursor,
    setCodexTarget,
    setCodexChannel,
  });

  const { workspaceRows, inspectorLines } = useMainViewModel({
    activeTab,
    homeActions: HOME_ACTIONS,
    getCursor,
    skills,
    selectedSkills,
    skillsModuleError,
    codexTarget,
    codexChannel,
    codexVersion,
    distTags,
    mcpServers,
    mcpModuleError,
    configDiff,
    referenceConfigPath,
    toolStatuses,
    selectedTools,
    toolsModuleError,
    logs,
    busy,
  });

  const moduleWarnings: Partial<Record<AppTab, string | null>> = {
    skills: skillsModuleError,
    mcp: mcpModuleError,
    tools: toolsModuleError,
  };

  if (width < 80 || height < 24) {
    return (
      <box
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        backgroundColor={theme.bgBase}
      >
        <box border borderColor={theme.warning} padding={1} width="80%">
          <text fg={theme.warning} attributes={TextAttributes.BOLD}>
            Terminal too small
          </text>
          <text fg={theme.fgDefault}>{`Current: ${width}x${height} | Minimum: 80x24`}</text>
        </box>
      </box>
    );
  }

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={theme.bgBase}>
      <TopStatusBar
        appName={APP_NAME}
        busy={busy}
        activeModule={TAB_LABELS[activeTab]}
        profileLabel={`${PROFILE_LABEL}/${PROJECT_LABEL}`}
        localConfigPath={LOCAL_CODEX_CONFIG}
      />

      <box flexDirection="row" flexGrow={1} paddingX={1} paddingBottom={1} columnGap={1}>
        <NavigationPanel
          tabOrder={TAB_ORDER}
          tabLabels={TAB_LABELS}
          activeTab={activeTab}
          moduleWarnings={moduleWarnings}
        />

        <WorkspacePanel
          title={`${TAB_LABELS[activeTab]} Workspace`}
          rows={workspaceRows}
          maxRows={height - 11}
        />

        <InspectorPanel
          title={`${TAB_LABELS[activeTab]} Inspector`}
          lines={inspectorLines}
          maxRows={height - 11}
        />
      </box>

      <CommandBar hint={buildCommandBarText(activeTab, lightConfirmToken !== null)} />

      {confirmAction ? (
        <ConfirmModal
          title={confirmAction.title}
          details={confirmAction.details}
          confirmFocused={confirmFocusConfirm}
          width={width}
          height={height}
        />
      ) : null}

      {helpOpen ? <HelpModal width={width} height={height} /> : null}
    </box>
  );
}
