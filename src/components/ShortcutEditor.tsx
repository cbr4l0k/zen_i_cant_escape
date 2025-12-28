import React from "react";
import { Box, Text } from "ink";
import type { Shortcut, Modifiers } from "../types";
import { getDisplayName } from "../utils/shortcuts";

type ModifierKey = "control" | "alt" | "shift" | "meta";

interface ShortcutEditorProps {
  shortcut: Shortcut;
  editField: "key" | ModifierKey;
  keyInput: string;
  conflictWith: Shortcut | null;
  onKeyChange: (key: string) => void;
  onModifierToggle: (modifier: ModifierKey) => void;
  onDisabledToggle: () => void;
}

const MODIFIER_KEYS: ModifierKey[] = ["control", "alt", "shift", "meta"];

export function ShortcutEditor({
  shortcut,
  editField,
  keyInput,
  conflictWith,
  onKeyChange,
  onModifierToggle,
  onDisabledToggle,
}: ShortcutEditorProps) {
  const name = getDisplayName(shortcut);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1}>
      <Text bold color="blue">
        Edit: {name}
      </Text>

      <Box marginTop={1}>
        <Text>Key: </Text>
        <Box borderStyle={editField === "key" ? "round" : undefined} borderColor="cyan">
          <Text color={editField === "key" ? "cyan" : "white"} bold={editField === "key"}>
            [{keyInput || " "}]
          </Text>
        </Box>
        <Text dimColor> (type to change)</Text>
      </Box>

      <Box marginTop={1}>
        <Text>Modifiers: </Text>
        {MODIFIER_KEYS.map((mod) => {
          const isActive = shortcut.modifiers[mod];
          const isSelected = editField === mod;
          return (
            <Box key={mod} marginRight={1}>
              <Text
                color={isSelected ? "cyan" : undefined}
                bold={isSelected}
                inverse={isSelected}
              >
                [{isActive ? "x" : " "}] {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text>Status: </Text>
        <Text color={shortcut.disabled ? "red" : "green"}>
          [{shortcut.disabled ? "x" : " "}] Disabled
        </Text>
        <Text dimColor> (d to toggle)</Text>
      </Box>

      {conflictWith && (
        <Box marginTop={1}>
          <Text color="red" bold>
            Conflict: Already used by {getDisplayName(conflictWith)}
          </Text>
        </Box>
      )}

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          Tab/Arrows: Navigate fields | Space: Toggle | Esc: Close editor
        </Text>
      </Box>
    </Box>
  );
}
