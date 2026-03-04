import { useCallback, useState } from "react";
import type { AppTab } from "../types";

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function useTabCursor(initial: Record<AppTab, number>) {
  const [cursorByTab, setCursorByTab] = useState<Record<AppTab, number>>(initial);

  const getCursor = useCallback((tab: AppTab) => cursorByTab[tab] ?? 0, [cursorByTab]);

  const setCursor = useCallback((tab: AppTab, value: number) => {
    setCursorByTab((previous) => ({
      ...previous,
      [tab]: value,
    }));
  }, []);

  const moveCursor = useCallback(
    (tab: AppTab, delta: number, length: number) => {
      const max = Math.max(length - 1, 0);
      const next = clamp(getCursor(tab) + delta, 0, max);
      setCursor(tab, next);
    },
    [getCursor, setCursor],
  );

  return {
    cursorByTab,
    getCursor,
    setCursor,
    moveCursor,
  };
}
