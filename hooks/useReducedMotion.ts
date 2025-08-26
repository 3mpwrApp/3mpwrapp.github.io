// hooks/useReducedMotion.ts
import { AccessibilityInfo } from "react-native";
import { useEffect, useState } from "react";

export default function useReducedMotion() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
}
