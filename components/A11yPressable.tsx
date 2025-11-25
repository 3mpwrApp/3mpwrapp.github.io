import { useRef, useState } from "react";
import type { Insets, PressableProps, View, ViewStyle } from "react-native";
import { Platform, Pressable, StyleSheet } from "react-native";

import { touchTarget } from "../constants/A11Y";
import { FOCUS_INDICATOR } from "../constants/FocusManagement";
import { useReduceMotionEnabled, useScreenReaderEnabled } from "../hooks/useA11y";
import useColorScheme from "../hooks/useColorScheme";

// Enhanced props with better accessibility support (WCAG 2.2 compliant)
type Props = PressableProps & { 
  role?: PressableProps["accessibilityRole"]; 
  accessibilityRole?: PressableProps["accessibilityRole"];
  /** Enhanced hit slop - will use larger targets when screen reader is active */
  enhancedAccessibility?: boolean;
  /** Custom minimum touch target size */
  minTouchTarget?: "min" | "enhanced" | "large";
  /** Show WCAG 2.2 compliant focus indicator (2.4.13) */
  showFocusIndicator?: boolean;
  /** Custom focus indicator style */
  focusIndicatorStyle?: ViewStyle;
};

const DEFAULT_HITSLOP: Insets = { top: 10, bottom: 10, left: 10, right: 10 };
const ENHANCED_HITSLOP: Insets = { top: 16, bottom: 16, left: 16, right: 16 };

export default function A11yPressable({ 
  role, 
  accessibilityRole, 
  hitSlop, 
  enhancedAccessibility = true,
  minTouchTarget = "min",
  showFocusIndicator = true,
  focusIndicatorStyle,
  style,
  children,
  ...rest 
}: Props) {
  const resolvedRole = accessibilityRole ?? role ?? "button";
  const isScreenReaderActive = useScreenReaderEnabled();
  const isReduceMotionEnabled = useReduceMotionEnabled();
  const colorScheme = useColorScheme();
  
  // WCAG 2.2: Track focus state for focus appearance (2.4.13)
  const [isFocused, setIsFocused] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'keyboard' | 'mouse' | 'touch'>('keyboard');
  const pressableRef = useRef<View>(null);
  
  // Use enhanced hit slop when screen reader is active or explicitly requested
  const effectiveHitSlop = hitSlop ?? (
    (enhancedAccessibility && isScreenReaderActive) 
      ? ENHANCED_HITSLOP 
      : DEFAULT_HITSLOP
  );
  
  // Apply touch target size based on preference and screen reader status
  const touchTargetStyle = enhancedAccessibility && isScreenReaderActive 
    ? touchTarget.enhanced 
    : touchTarget[minTouchTarget];
  
  // WCAG 2.4.13: Focus indicator style (3px minimum, 3:1 contrast)
  const defaultFocusStyle: ViewStyle = {
    borderWidth: FOCUS_INDICATOR.enhancedThickness,
    borderColor: colorScheme === 'dark' 
      ? FOCUS_INDICATOR.colors.dark.primary 
      : FOCUS_INDICATOR.colors.light.primary,
    borderStyle: 'solid',
    borderRadius: FOCUS_INDICATOR.borderRadius,
  };
  
  // Show focus indicator only for keyboard interaction (WCAG 2.4.7)
  const shouldShowFocus = showFocusIndicator && isFocused && interactionMode === 'keyboard';
  const activeFocusStyle = shouldShowFocus ? (focusIndicatorStyle || defaultFocusStyle) : {};
  
  // Track interaction mode for WCAG 2.4.7 compliance
  // Determines whether focus indicator should be visible based on input method
  const handlePressIn = (e: any) => {
    // Detect interaction type on web platform
    // - detail === 0: Keyboard activation (Enter/Space key)
    // - pointerType === 'mouse': Mouse click
    // - Otherwise: Touch interaction (default for mobile)
    if (Platform.OS === 'web') {
      const nativeEvent = e?.nativeEvent;
      // UIEvent.detail is 0 for keyboard events, >0 for click events
      // This is a standard web API: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
      if (nativeEvent?.detail === 0) {
        setInteractionMode('keyboard');
      } else if (nativeEvent?.pointerType === 'mouse') {
        setInteractionMode('mouse');
      } else {
        setInteractionMode('touch');
      }
    }
    rest.onPressIn?.(e);
  };
  
  return (
    <Pressable // a11y-scan: accessibilityRole and hitSlop resolved dynamically
      ref={pressableRef}
      accessibilityRole={resolvedRole} 
      hitSlop={effectiveHitSlop}
      onPressIn={handlePressIn}
      style={(state) => {
        const baseStyles: ViewStyle[] = [touchTargetStyle];
        
        if (typeof style === 'function') {
          const dynamicStyle = style(state);
          if (dynamicStyle) {
            baseStyles.push(dynamicStyle as ViewStyle);
          }
        } else if (style) {
          baseStyles.push(style as ViewStyle);
        }
        
        // WCAG 2.2: Add focus indicator (2.4.13)
        if (shouldShowFocus) {
          baseStyles.push(activeFocusStyle);
        }
        
        if (state.pressed) {
          const pressedStyle: ViewStyle = {
            opacity: isReduceMotionEnabled ? 0.9 : 0.7,
          };
          
          // Add platform-specific pressed effects when motion is allowed
          if (!isReduceMotionEnabled) {
            if (Platform.OS === 'ios') {
              pressedStyle.transform = [{ scale: 0.98 }];
            } else if (Platform.OS === 'android') {
              pressedStyle.elevation = 2;
            }
          }
          
          baseStyles.push(pressedStyle);
        }
        
        // Flatten the array to a single style object for web compatibility
        // When used with Link asChild, style arrays can cause CSS errors on web
        return StyleSheet.flatten(baseStyles);
      }}
      // Enhanced accessibility state management
      accessibilityState={{
        busy: !!rest.disabled,
        ...rest.accessibilityState,
      }}
      // WCAG 2.2: Focus handling for keyboard navigation (2.4.7, 2.4.13)
      {...(Platform.OS === 'web' && {
        onFocus: (e: any) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        },
        onBlur: (e: any) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        },
      })}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
