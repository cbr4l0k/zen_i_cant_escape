export interface Modifiers {
  control: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  accel: boolean;
}

export interface Shortcut {
  id: string | null;
  key: string | null;
  keycode: string | null;
  group: string;
  l10nId: string | null;
  modifiers: Modifiers;
  action: string | null;
  disabled: boolean;
  reserved: boolean;
  internal: boolean;
}

export interface ShortcutsFile {
  shortcuts: Shortcut[];
}

export interface GroupedShortcuts {
  [group: string]: Shortcut[];
}

export type AppMode = "list" | "edit";

export interface AppState {
  shortcuts: Shortcut[];
  selectedIndex: number;
  mode: AppMode;
  hasUnsavedChanges: boolean;
  conflictWith: Shortcut | null;
  statusMessage: string | null;
}
