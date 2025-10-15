// hooks/useReducedMotion.ts
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export default function useReducedMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setEnabled(v);
    });

    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => {
        if (mounted) setEnabled(v);
      },
    );

    return () => {
      mounted = false;
      // Handle RN subscription cleanup safely
      if (sub && 'remove' in sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    };
  }, []);

  return enabled;
}
