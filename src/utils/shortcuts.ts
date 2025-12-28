import type { Shortcut, ShortcutsFile, GroupedShortcuts, Modifiers } from "../types";

export function getShortcutsPath(): string {
  const configPath = process.env.ZEN_CONFIG_PATH;
  if (!configPath) {
    throw new Error(
      "ZEN_CONFIG_PATH environment variable is not set.\n" +
      "Please set it to the path of your zen-keyboard-shortcuts.json file.\n" +
      "Example: export ZEN_CONFIG_PATH=\"~/.zen/profile/zen-keyboard-shortcuts.json\""
    );
  }
  return configPath;
}

export async function loadShortcuts(): Promise<Shortcut[]> {
  const path = getShortcutsPath();
  const file = Bun.file(path);

  if (!await file.exists()) {
    throw new Error(`Shortcuts file not found at: ${path}`);
  }

  const content = await file.text();
  const data: ShortcutsFile = JSON.parse(content);
  return data.shortcuts;
}

export async function saveShortcuts(shortcuts: Shortcut[]): Promise<void> {
  const path = getShortcutsPath();
  const data: ShortcutsFile = { shortcuts };
  const content = JSON.stringify(data);
  await Bun.write(path, content);
}

export function groupShortcuts(shortcuts: Shortcut[]): GroupedShortcuts {
  const groups: GroupedShortcuts = {};

  for (const shortcut of shortcuts) {
    const group = shortcut.group || "other";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(shortcut);
  }

  return groups;
}

export function formatModifiers(modifiers: Modifiers): string {
  const parts: string[] = [];
  if (modifiers.control || modifiers.accel) parts.push("Ctrl");
  if (modifiers.alt) parts.push("Alt");
  if (modifiers.shift) parts.push("Shift");
  if (modifiers.meta) parts.push("Meta");
  return parts.join("+");
}

export function formatKeyCombo(shortcut: Shortcut): string {
  const modStr = formatModifiers(shortcut.modifiers);
  const key = shortcut.key || shortcut.keycode || "";

  if (!key) return "(unassigned)";
  if (!modStr) return key;
  return `${modStr}+${key}`;
}

export function getDisplayName(shortcut: Shortcut): string {
  return shortcut.id || shortcut.l10nId || shortcut.action || "(unnamed)";
}
