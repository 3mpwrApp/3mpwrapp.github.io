// hooks/useAnnounceScreen.ts
import { useEffect } from "react";
import { AccessibilityInfo } from "react-native";

export default function useAnnounceScreen(message: string) {
  useEffect(() => {
    if (message && typeof AccessibilityInfo.announceForAccessibility === "function") {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);
}
