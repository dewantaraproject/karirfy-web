const HAPTICS_KEY = "kiprah_haptics_enabled";

export function isHapticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(HAPTICS_KEY) !== "false";
  } catch {
    return false;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HAPTICS_KEY, enabled ? "true" : "false");
  } catch {
    // ignore storage errors
  }
}

export async function triggerHaptic(
  _style: "light" | "medium" | "heavy" = "light",
): Promise<void> {
  // Web desktop workstation no-op
}

export async function triggerSelectionHaptic(): Promise<void> {
  // Web desktop workstation no-op
}

export async function triggerNotificationHaptic(
  _type: "success" | "warning" | "error" = "success",
): Promise<void> {
  // Web desktop workstation no-op
}
