import * as React from "react";
import { AccessibilityInfo, findNodeHandle, Platform } from "react-native";

import { logger } from "../utils/logger";

export const MAX_FONT_SCALE = 2.0;

// Maximum safe contrast ratio that exceeds WCAG AAA standards
export const MAX_CONTRAST_RATIO = 21.0;

// Enhanced announcement function with priority support
export function useAnnounceOnMount(message: string, delayMs: number = 300, priority: "polite" | "assertive" = "polite") {
  React.useEffect(() => {
    // In test / web (jsdom) environments AccessibilityInfo may not expose native methods.
    if (typeof AccessibilityInfo?.announceForAccessibility !== "function") return;
    const id = setTimeout(() => {
      AccessibilityInfo?.announceForAccessibility?.(message);
    }, delayMs);
    return () => clearTimeout(id);
  }, [message, delayMs, priority]);
}

// Enhanced focus management with better error handling
export function useFocusOnRefOnMount(
  ref: React.RefObject<unknown>,
  delayMs: number = 200,
) {
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        // Skip on web - findNodeHandle is not supported
        if (Platform.OS === 'web') return;
        // Guard: findNodeHandle isn't implemented in jsdom; skip if missing.
        if (typeof findNodeHandle !== "function") return;
        const current = (ref as any).current;
        if (!current) return;
        
        const handle = findNodeHandle(current);
        if (handle && typeof AccessibilityInfo?.setAccessibilityFocus === "function") {
          AccessibilityInfo?.setAccessibilityFocus?.(handle);
        }
      } catch (error) {
        if (__DEV__) {
          logger.warn("Failed to set accessibility focus:", error);
        }
      }
    }, delayMs);
    return () => clearTimeout(id);
  }, [ref, delayMs]);
}

// Enhanced value change announcements with better type safety
export function useAnnounceOnChange<T>(
  value: T,
  format: (v: T) => string,
  delayMs: number = 0,
  priority: "polite" | "assertive" = "polite",
) {
  const prev = React.useRef<T>(value);
  React.useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    if (prev.current !== value) {
      const msg = format(value);
      // In test environments, AccessibilityInfo may not be fully available
      if (typeof AccessibilityInfo?.announceForAccessibility === "function") {
        id = setTimeout(() => {
          try {
            AccessibilityInfo?.announceForAccessibility?.(msg);
          } catch (error) {
            if (__DEV__) {
              logger.warn("Failed to announce for accessibility:", error);
            }
          }
        }, delayMs);
      }
      prev.current = value;
    }
    return () => {
      if (id) clearTimeout(id);
    };
  }, [value, format, delayMs, priority]);
}

// Hook to detect if screen reader is active
export function useScreenReaderEnabled() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  React.useEffect(() => {
    let mounted = true;
    
    const checkScreenReader = async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (mounted) {
          setIsEnabled(enabled);
        }
      } catch (error) {
        if (__DEV__) {
          logger.warn("Failed to check screen reader status:", error);
        }
      }
    };
    
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setIsEnabled
    );
    
    return () => {
      mounted = false;
      // Handle RN subscription cleanup
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);
  
  return isEnabled;
}

// Hook to detect reduce motion preference
export function useReduceMotionEnabled() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  React.useEffect(() => {
    let mounted = true;
    
    const checkReduceMotion = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) {
          setIsEnabled(enabled);
        }
      } catch (error) {
        if (__DEV__) {
          logger.warn("Failed to check reduce motion status:", error);
        }
      }
    };
    
    checkReduceMotion();
    
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsEnabled
    );
    
    return () => {
      mounted = false;
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);
  
  return isEnabled;
}

// Hook to get current font scale and detect if large text is enabled
export function useAccessibilityFontScale() {
  const [fontScale, setFontScale] = React.useState(1.0);
  
  React.useEffect(() => {
    let mounted = true;
    
    const checkFontScale = async () => {
      try {
        // On iOS, check if bold text is enabled as an indicator of accessibility needs
        const isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled?.();
        if (mounted && isBoldTextEnabled) {
          setFontScale(1.2); // Slight increase for bold text users
        }
      } catch (error) {
        if (__DEV__) {
          logger.warn("Failed to check font scale:", error);
        }
      }
    };
    
    checkFontScale();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  return {
    fontScale: Math.min(fontScale, MAX_FONT_SCALE),
    isLargeText: fontScale > 1.0,
  };
}

// Hook for managing focus restoration (useful for modals and overlays)
export function useFocusRestore(shouldRestore: boolean = true) {
  const lastFocusedElement = React.useRef<any>(null);
  
  const storeFocus = React.useCallback(() => {
    if (!shouldRestore) return;
    
    try {
      // Store reference to currently focused element (platform-specific implementation)
      if (Platform.OS === "web") {
        lastFocusedElement.current = document.activeElement;
      }
    } catch (error) {
      if (__DEV__) {
        logger.warn("Failed to store focus:", error);
      }
    }
  }, [shouldRestore]);
  
  const restoreFocus = React.useCallback(() => {
    if (!shouldRestore || !lastFocusedElement.current) return;
    
    try {
      // Restore focus to previously focused element
      if (Platform.OS === "web" && lastFocusedElement.current?.focus) {
        lastFocusedElement.current.focus();
      }
    } catch (error) {
      if (__DEV__) {
        logger.warn("Failed to restore focus:", error);
      }
    } finally {
      lastFocusedElement.current = null;
    }
  }, [shouldRestore]);
  
  return { storeFocus, restoreFocus };
}

// Hook for managing live regions (for dynamic content updates)
export function useLiveRegion(content: string, politeness: "polite" | "assertive" = "polite") {
  React.useEffect(() => {
    if (!content) return;

    const delay = politeness === "assertive" ? 100 : 300;
    const id = setTimeout(() => {
      if (typeof AccessibilityInfo?.announceForAccessibility === "function") {
        AccessibilityInfo.announceForAccessibility(content);
      }
    }, delay);

    return () => clearTimeout(id);
  }, [content, politeness]);
}

// Enhanced hook for managing complex form interactions with screen reader feedback
export function useAccessibleFormInteraction(
  fieldName: string,
  validationMessage?: string,
  successMessage?: string
) {
  const [hasError, setHasError] = React.useState(false);
  const [hasSuccess, setHasSuccess] = React.useState(false);

  const announceError = React.useCallback(() => {
    if (validationMessage) {
      setHasError(true);
      AccessibilityInfo?.announceForAccessibility?.(
        `${fieldName}: ${validationMessage}`
      );
      // Reset error state after announcement
      setTimeout(() => setHasError(false), 1000);
    }
  }, [fieldName, validationMessage]);

  const announceSuccess = React.useCallback(() => {
    if (successMessage) {
      setHasSuccess(true);
      AccessibilityInfo?.announceForAccessibility?.(
        `${fieldName}: ${successMessage}`
      );
      // Reset success state after announcement
      setTimeout(() => setHasSuccess(false), 1000);
    }
  }, [fieldName, successMessage]);

  return {
    hasError,
    hasSuccess,
    announceError,
    announceSuccess,
  };
}

// Hook for managing loading states with accessibility announcements
export function useAccessibleLoading(
  isLoading: boolean,
  loadingMessage: string = "Loading...",
  completionMessage?: string
) {
  const prevLoadingRef = React.useRef(isLoading);

  React.useEffect(() => {
    if (isLoading && !prevLoadingRef.current) {
      // Started loading
      AccessibilityInfo?.announceForAccessibility?.(loadingMessage);
    } else if (!isLoading && prevLoadingRef.current && completionMessage) {
      // Finished loading
      AccessibilityInfo?.announceForAccessibility?.(completionMessage);
    }

    prevLoadingRef.current = isLoading;
  }, [isLoading, loadingMessage, completionMessage]);

  return {
    accessibilityLabel: isLoading ? loadingMessage : undefined,
    accessibilityState: { busy: isLoading },
  };
}

// Hook for managing tab navigation with screen reader feedback
export function useAccessibleTabs(
  tabs: string[],
  activeTabIndex: number,
  onTabChange: (index: number) => void
) {
  const announceTabChange = React.useCallback((index: number) => {
    const tabName = tabs[index];
    AccessibilityInfo?.announceForAccessibility?.(
      `Switched to ${tabName} tab, ${index + 1} of ${tabs.length}`
    );
    onTabChange(index);
  }, [tabs, onTabChange]);

  const getTabAccessibilityProps = React.useCallback((index: number) => ({
    accessibilityRole: "tab" as const,
    accessibilityState: {
      selected: index === activeTabIndex,
    },
    accessibilityLabel: `${tabs[index]}, tab ${index + 1} of ${tabs.length}`,
  }), [tabs, activeTabIndex]);

  return {
    announceTabChange,
    getTabAccessibilityProps,
    activeTabName: tabs[activeTabIndex],
  };
}

// Hook for managing expandable content with screen reader feedback
export function useAccessibleExpandable(
  isExpanded: boolean,
  label: string,
  onToggle: () => void
) {
  const announceToggle = React.useCallback(() => {
    const state = isExpanded ? "collapsed" : "expanded";
    AccessibilityInfo?.announceForAccessibility?.(
      `${label} ${state}`
    );
    onToggle();
  }, [isExpanded, label, onToggle]);

  return {
    accessibilityProps: {
      accessibilityRole: "button" as const,
      accessibilityState: { expanded: isExpanded },
      accessibilityLabel: `${label}, ${isExpanded ? "expanded" : "collapsed"}`,
    },
    announceToggle,
  };
}

