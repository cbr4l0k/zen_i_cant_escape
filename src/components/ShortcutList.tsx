import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { Shortcut } from "../types";
import { groupShortcuts } from "../utils/shortcuts";
import { ShortcutItem } from "./ShortcutItem";

interface ShortcutListProps {
  shortcuts: Shortcut[];
  selectedIndex: number;
  viewportHeight: number;
}

interface FlatItem {
  type: "header" | "shortcut";
  group?: string;
  shortcut?: Shortcut;
  shortcutIndex?: number;
}

export function ShortcutList({ shortcuts, selectedIndex, viewportHeight }: ShortcutListProps) {
  // Build flattened list with group headers
  const flatItems = useMemo(() => {
    const groups = groupShortcuts(shortcuts);
    const items: FlatItem[] = [];
    let shortcutIdx = 0;

    const sortedGroups = Object.keys(groups).sort();

    for (const group of sortedGroups) {
      items.push({ type: "header", group });
      for (const shortcut of groups[group]!) {
        items.push({
          type: "shortcut",
          shortcut,
          shortcutIndex: shortcutIdx,
        });
        shortcutIdx++;
      }
    }

    return items;
  }, [shortcuts]);

  // Find which flat item corresponds to selected shortcut
  const selectedFlatIndex = useMemo(() => {
    return flatItems.findIndex(
      (item) => item.type === "shortcut" && item.shortcutIndex === selectedIndex
    );
  }, [flatItems, selectedIndex]);

  // Calculate viewport window
  const halfViewport = Math.floor(viewportHeight / 2);
  let startIdx = Math.max(0, selectedFlatIndex - halfViewport);
  const endIdx = Math.min(flatItems.length, startIdx + viewportHeight);

  // Adjust if we're near the end
  if (endIdx === flatItems.length) {
    startIdx = Math.max(0, endIdx - viewportHeight);
  }

  const visibleItems = flatItems.slice(startIdx, endIdx);

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, idx) => {
        if (item.type === "header") {
          return (
            <Box key={`header-${item.group}`} marginTop={idx > 0 ? 1 : 0}>
              <Text bold color="green">
                {item.group}
              </Text>
            </Box>
          );
        }

        return (
          <ShortcutItem
            key={item.shortcut!.id || `shortcut-${item.shortcutIndex}`}
            shortcut={item.shortcut!}
            isSelected={item.shortcutIndex === selectedIndex}
          />
        );
      })}
    </Box>
  );
}
