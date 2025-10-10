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

// Optional safe-area hook: uses react-native-safe-area-context when available, else zeros (e.g., Jest)
function useOptionalInsets() {
  // In tests, avoid importing native modules altogether
  const isTest = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
    || (typeof jest !== 'undefined');
  if (isTest) {
    return { top: 0, left: 0, right: 0, bottom: 0 } as { top: number; left: number; right: number; bottom: number };
  }
  try {
    const mod = require('react-native-safe-area-context');
    if (mod && typeof mod.useSafeAreaInsets === 'function') {
      return mod.useSafeAreaInsets();
    }
  } catch {}
  return { top: 0, left: 0, right: 0, bottom: 0 } as { top: number; left: number; right: number; bottom: number };
}

export function ToastViewport() {
  const palette = useAppPalette();
  const insets = useOptionalInsets();
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
      style={[
        s.wrap,
        {
          backgroundColor: bg,
          borderColor: palette.muted,
          // Center horizontally with safe-area aware bottom offset
          left: 12 + insets.left,
          right: 12 + insets.right,
          bottom: Math.max(12, 24 + insets.bottom),
          // Silence RN Web deprecation: use style.pointerEvents
          pointerEvents: 'none' as any,
        },
      ]}
    >
      <Text style={[s.text, { color: fg }]}>{msg}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    // centered via left/right stretch, content centered
    alignSelf: 'stretch',
    // space around text
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    // center text/content
    alignItems: 'center',
    justifyContent: 'center',
    // Shadows: use boxShadow on web, native shadow props elsewhere
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 6px 12px rgba(0,0,0,0.15)' as any }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }),
  },
  text: { fontWeight: "700" },
});
