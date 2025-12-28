import type { Shortcut, Modifiers } from "../types";

function modifiersMatch(a: Modifiers, b: Modifiers): boolean {
  return (
    (a.control || a.accel) === (b.control || b.accel) &&
    a.alt === b.alt &&
    a.shift === b.shift &&
    a.meta === b.meta
  );
}

function keysMatch(a: Shortcut, b: Shortcut): boolean {
  // Both need to have the same key or keycode
  if (a.key && b.key) {
    return a.key.toLowerCase() === b.key.toLowerCase();
  }
  if (a.keycode && b.keycode) {
    return a.keycode === b.keycode;
  }
  return false;
}

export function findConflict(
  shortcut: Shortcut,
  allShortcuts: Shortcut[],
  excludeIndex: number
): Shortcut | null {
  // Skip if no key assigned
  if (!shortcut.key && !shortcut.keycode) {
    return null;
  }

  for (let i = 0; i < allShortcuts.length; i++) {
    if (i === excludeIndex) continue;

    const other = allShortcuts[i];

    // Skip disabled shortcuts - they don't cause conflicts
    if (other.disabled) continue;

    // Skip if other has no key
    if (!other.key && !other.keycode) continue;

    // Check if same key combo
    if (keysMatch(shortcut, other) && modifiersMatch(shortcut.modifiers, other.modifiers)) {
      return other;
    }
  }

  return null;
}
