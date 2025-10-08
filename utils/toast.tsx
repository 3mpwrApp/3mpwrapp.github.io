import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useAppPalette } from "../theme/usePalette";

// Simple global toast event system (no external deps)
type ToastOptions = { duration?: number; type?: "info" | "success" | "warn" | "error" };
type Listener = (msg: string | null, opts?: ToastOptions) => void;

const listeners = new Set<Listener>();

export function showToast(message: string, opts?: ToastOptions) {
  // Notify all listeners; latest call wins
  for (const l of Array.from(listeners)) {
    try { l(message, opts); } catch {}
  }
}

export function hideToast() {
  for (const l of Array.from(listeners)) {
    try { l(null); } catch {}
  }
}

export function ToastViewport() {
  const palette = useAppPalette();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [opts, setOpts] = React.useState<ToastOptions | undefined>(undefined);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const handler: Listener = (m, o) => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      setMsg(m);
      setOpts(o);
      if (m) {
        const dur = Math.max(800, Math.min(6000, o?.duration ?? 1800));
        timerRef.current = setTimeout(() => { setMsg(null); }, dur);
      }
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!msg) return null;

  const bg = opts?.type === "success" ? palette.success
    : opts?.type === "warn" ? palette.warning
    : opts?.type === "error" ? palette.error
    : palette.surface;
  const fg = opts?.type ? palette.onPrimary : palette.text;

  return (
    <View
      // Visible only; screen readers already get a dedicated announce() call elsewhere
      accessible={false}
      // RN web/Android hint; iOS ignores this prop
      accessibilityLiveRegion={Platform.OS === 'android' ? 'polite' : undefined}
      style={[s.wrap, { backgroundColor: bg, borderColor: palette.muted }]}
      pointerEvents="none"
    >
      <Text style={[s.text, { color: fg }]}>{msg}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 12,
    bottom: 56,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    // Shadow for visibility (web/native)
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  text: { fontWeight: "700" },
});
