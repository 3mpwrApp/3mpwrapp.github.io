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
      // newer RN returns subscription with remove; older might not
      // @ts-ignore
      sub?.remove?.();
    };
  }, []);

  return enabled;
}
