import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import type { Shortcut, AppMode, Modifiers } from "./types";
import { loadShortcuts, saveShortcuts, groupShortcuts } from "./utils/shortcuts";
import { findConflict } from "./utils/conflicts";
import { ShortcutList } from "./components/ShortcutList";
import { ShortcutEditor } from "./components/ShortcutEditor";
import { StatusBar } from "./components/StatusBar";

type ModifierKey = "control" | "alt" | "shift" | "meta";
type EditField = "key" | ModifierKey;

const EDIT_FIELDS: EditField[] = ["key", "control", "alt", "shift", "meta"];

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>("list");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editField, setEditField] = useState<EditField>("key");
  const [keyInput, setKeyInput] = useState("");
  const [conflictWith, setConflictWith] = useState<Shortcut | null>(null);

  // Calculate viewport height (leave room for editor and status bar)
  const viewportHeight = Math.max(5, (stdout?.rows || 24) - (mode === "edit" ? 16 : 6));

  // Load shortcuts on mount
  useEffect(() => {
    loadShortcuts()
      .then((data) => {
        // Sort by group for consistent indexing
        const groups = groupShortcuts(data);
        const sorted: Shortcut[] = [];
        for (const group of Object.keys(groups).sort()) {
          sorted.push(...groups[group]!);
        }
        setShortcuts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Check for conflicts when editing
  useEffect(() => {
    if (mode === "edit" && shortcuts.length > 0) {
      const current = shortcuts[selectedIndex]!;
      const conflict = findConflict(current, shortcuts, selectedIndex);
      setConflictWith(conflict);
    }
  }, [mode, shortcuts, selectedIndex]);

  // Clear status message after delay
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleSave = useCallback(async () => {
    try {
      await saveShortcuts(shortcuts);
      setHasUnsavedChanges(false);
      setStatusMessage("Saved successfully!");
    } catch (err) {
      setStatusMessage(`Save failed: ${(err as Error).message}`);
    }
  }, [shortcuts]);

  const updateShortcut = useCallback(
    (index: number, updates: Partial<Shortcut>) => {
      setShortcuts((prev) => {
        const newShortcuts = [...prev];
        const existing = newShortcuts[index];
        if (existing) {
          newShortcuts[index] = { ...existing, ...updates };
        }
        return newShortcuts;
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  const toggleModifier = useCallback(
    (modifier: ModifierKey) => {
      const current = shortcuts[selectedIndex];
      if (!current) return;
      const newModifiers: Modifiers = {
        ...current.modifiers,
        [modifier]: !current.modifiers[modifier],
      };
      updateShortcut(selectedIndex, { modifiers: newModifiers });
    },
    [shortcuts, selectedIndex, updateShortcut]
  );

  const toggleDisabled = useCallback(() => {
    const current = shortcuts[selectedIndex];
    if (!current) return;
    updateShortcut(selectedIndex, { disabled: !current.disabled });
  }, [shortcuts, selectedIndex, updateShortcut]);

  const setKey = useCallback(
    (key: string) => {
      setKeyInput(key);
      updateShortcut(selectedIndex, { key: key || null, keycode: null });
    },
    [selectedIndex, updateShortcut]
  );

  const setKeycode = useCallback(
    (keycode: string) => {
      setKeyInput(keycode);
      updateShortcut(selectedIndex, { key: null, keycode });
    },
    [selectedIndex, updateShortcut]
  );

  useInput((input, key) => {
    // Ctrl+S to save (works in any mode)
    if (input === "s" && key.ctrl) {
      handleSave();
      return;
    }

    if (mode === "list") {
      // List mode controls
      if (input === "q") {
        if (hasUnsavedChanges) {
          setStatusMessage("Unsaved changes! Press Ctrl+S to save or q again to quit");
          if (statusMessage?.includes("again")) {
            exit();
          }
        } else {
          exit();
        }
        return;
      }

      // Navigation with arrows or vim keys (j/k)
      if (key.upArrow || input === "k") {
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (key.downArrow || input === "j") {
        setSelectedIndex((i) => Math.min(shortcuts.length - 1, i + 1));
        return;
      }

      if (key.return) {
        const current = shortcuts[selectedIndex];
        if (!current) return;
        setKeyInput(current.key || current.keycode || "");
        setEditField("key");
        setMode("edit");
        return;
      }

      // Page up/down
      if (key.pageUp) {
        setSelectedIndex((i) => Math.max(0, i - viewportHeight));
        return;
      }

      if (key.pageDown) {
        setSelectedIndex((i) => Math.min(shortcuts.length - 1, i + viewportHeight));
        return;
      }
    } else if (mode === "edit") {
      // Edit mode controls - use 'b' for back (ESC key is broken!)
      if (input === "b" && editField !== "key") {
        setMode("list");
        return;
      }

      // Tab to navigate fields (arrows reserved for setting special keys)
      if (key.tab) {
        const currentIdx = EDIT_FIELDS.indexOf(editField);
        const nextIdx = (currentIdx + 1) % EDIT_FIELDS.length;
        setEditField(EDIT_FIELDS[nextIdx]!);
        return;
      }

      // Toggle disabled with 'd'
      if (input === "d") {
        toggleDisabled();
        return;
      }

      // Space toggles modifier if on a modifier field
      if (input === " " && editField !== "key") {
        toggleModifier(editField as ModifierKey);
        return;
      }

      // Type key character when on key field
      if (editField === "key") {
        if (key.backspace || key.delete) {
          setKey("");
          return;
        }

        // Handle special keys as keycodes
        if (key.upArrow) {
          setKeycode("VK_UP");
          return;
        }
        if (key.downArrow) {
          setKeycode("VK_DOWN");
          return;
        }
        if (key.leftArrow) {
          setKeycode("VK_LEFT");
          return;
        }
        if (key.rightArrow) {
          setKeycode("VK_RIGHT");
          return;
        }
        if (key.pageUp) {
          setKeycode("VK_PAGE_UP");
          return;
        }
        if (key.pageDown) {
          setKeycode("VK_PAGE_DOWN");
          return;
        }
        if (key.return) {
          setKeycode("VK_RETURN");
          return;
        }

        // Only accept single printable characters for key
        if (input && input.length === 1 && !key.ctrl && !key.meta) {
          setKey(input);
          return;
        }
      }
    }
  });

  if (loading) {
    return (
      <Box padding={1}>
        <Text>Loading shortcuts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>
          Error loading shortcuts:
        </Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  const currentShortcut = shortcuts[selectedIndex];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="magenta">
        Zen Keyboard Shortcuts Editor
      </Text>

      <Box marginTop={1} flexDirection="column" height={viewportHeight}>
        <ShortcutList
          shortcuts={shortcuts}
          selectedIndex={selectedIndex}
          viewportHeight={viewportHeight}
        />
      </Box>

      {mode === "edit" && currentShortcut && (
        <Box marginTop={1}>
          <ShortcutEditor
            shortcut={currentShortcut}
            editField={editField}
            keyInput={keyInput}
            conflictWith={conflictWith}
            onKeyChange={setKey}
            onModifierToggle={toggleModifier}
            onDisabledToggle={toggleDisabled}
          />
        </Box>
      )}

      <Box marginTop={1}>
        <StatusBar
          mode={mode}
          hasUnsavedChanges={hasUnsavedChanges}
          statusMessage={statusMessage}
          shortcutCount={shortcuts.length}
          selectedIndex={selectedIndex}
        />
      </Box>
    </Box>
  );
}
