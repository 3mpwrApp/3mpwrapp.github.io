import * as React from "react";
import { AccessibilityInfo, findNodeHandle } from "react-native";

export const MAX_FONT_SCALE = 2.0;

export function useAnnounceOnMount(message: string, delayMs: number = 300) {
  React.useEffect(() => {
    // In test / web (jsdom) environments AccessibilityInfo may not expose native methods.
    if (typeof AccessibilityInfo?.announceForAccessibility !== "function") return;
    const id = setTimeout(() => {
      AccessibilityInfo?.announceForAccessibility?.(message);
    }, delayMs);
    return () => clearTimeout(id);
  }, [message, delayMs]);
}

export function useFocusOnRefOnMount(
  ref: React.RefObject<unknown>,
  delayMs: number = 200,
) {
  React.useEffect(() => {
    const id = setTimeout(() => {
      // Guard: findNodeHandle isn't implemented in jsdom; skip if missing.
      if (typeof findNodeHandle !== "function") return;
      const handle = findNodeHandle((ref as any).current);
      if (handle && typeof AccessibilityInfo?.setAccessibilityFocus === "function") {
        AccessibilityInfo?.setAccessibilityFocus?.(handle);
      }
    }, delayMs);
    return () => clearTimeout(id);
  }, [ref, delayMs]);
}

export function useAnnounceOnChange<T>(
  value: T,
  format: (v: T) => string,
  delayMs: number = 0,
) {
  const prev = React.useRef<T>(value);
  React.useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    if (prev.current !== value) {
      const msg = format(value);
      if (typeof AccessibilityInfo?.announceForAccessibility === "function") {
        id = setTimeout(() => {
          AccessibilityInfo?.announceForAccessibility?.(msg);
        }, delayMs);
      }
      prev.current = value;
    }
    return () => {
      if (id) clearTimeout(id);
    };
  }, [value, format, delayMs]);
}
