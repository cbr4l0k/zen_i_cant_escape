import React from "react";
import { Box, Text } from "ink";
import type { AppMode } from "../types";

interface StatusBarProps {
  mode: AppMode;
  hasUnsavedChanges: boolean;
  statusMessage: string | null;
  shortcutCount: number;
  selectedIndex: number;
}

export function StatusBar({
  mode,
  hasUnsavedChanges,
  statusMessage,
  shortcutCount,
  selectedIndex,
}: StatusBarProps) {
  const helpText =
    mode === "list"
      ? "↑↓/jk: Navigate | Enter: Edit | Ctrl+S: Save | q: Quit | "
      : "Tab: Fields | Space: Toggle | Type/Arrows: Set key | b: Back";

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray">
      {statusMessage && (
        <Box paddingX={1}>
          <Text color="yellow">{statusMessage}</Text>
        </Box>
      )}
      <Box paddingX={1} justifyContent="space-between">
        <Text dimColor>{helpText}</Text>
        <Box>
          {hasUnsavedChanges && (
            <Text color="yellow" bold>
              [UNSAVED]{" "}
            </Text>
          )}
          <Text dimColor>
            {selectedIndex + 1}/{shortcutCount}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
