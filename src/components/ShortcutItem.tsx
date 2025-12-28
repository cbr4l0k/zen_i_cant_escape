import React from "react";
import { Box, Text } from "ink";
import type { Shortcut } from "../types";
import { formatKeyCombo, getDisplayName } from "../utils/shortcuts";

interface ShortcutItemProps {
  shortcut: Shortcut;
  isSelected: boolean;
}

export function ShortcutItem({ shortcut, isSelected }: ShortcutItemProps) {
  const name = getDisplayName(shortcut);
  const keyCombo = formatKeyCombo(shortcut);
  const isDimmed = shortcut.disabled;

  return (
    <Box>
      <Text color={isSelected ? "cyan" : undefined} dimColor={isDimmed}>
        {isSelected ? "> " : "  "}
      </Text>
      <Box width={40}>
        <Text
          color={isSelected ? "cyan" : undefined}
          dimColor={isDimmed}
          strikethrough={isDimmed}
        >
          {name.length > 38 ? name.slice(0, 35) + "..." : name}
        </Text>
      </Box>
      <Text color={isSelected ? "yellow" : "gray"} dimColor={isDimmed}>
        {keyCombo}
      </Text>
    </Box>
  );
}
