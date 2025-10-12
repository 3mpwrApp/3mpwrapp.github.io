import type { Insets, PressableProps, ViewStyle } from "react-native";
import { Platform, Pressable } from "react-native";

import { touchTarget } from "../constants/a11y";
import { useReduceMotionEnabled, useScreenReaderEnabled } from "../hooks/useA11y";

// Enhanced props with better accessibility support
type Props = PressableProps & { 
  role?: PressableProps["accessibilityRole"]; 
  accessibilityRole?: PressableProps["accessibilityRole"];
  /** Enhanced hit slop - will use larger targets when screen reader is active */
  enhancedAccessibility?: boolean;
  /** Custom minimum touch target size */
  minTouchTarget?: "min" | "enhanced" | "large";
};

const DEFAULT_HITSLOP: Insets = { top: 10, bottom: 10, left: 10, right: 10 };
const ENHANCED_HITSLOP: Insets = { top: 16, bottom: 16, left: 16, right: 16 };

export default function A11yPressable({ 
  role, 
  accessibilityRole, 
  hitSlop, 
  enhancedAccessibility = true,
  minTouchTarget = "min",
  style,
  children,
  ...rest 
}: Props) {
  const resolvedRole = accessibilityRole ?? role ?? "button";
  const isScreenReaderActive = useScreenReaderEnabled();
  const isReduceMotionEnabled = useReduceMotionEnabled();
  
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
  
  return (
    <Pressable // a11y-scan: accessibilityRole and hitSlop resolved dynamically
      accessibilityRole={resolvedRole} 
      hitSlop={effectiveHitSlop}
      style={({ pressed }) => {
        const baseStyles: ViewStyle[] = [touchTargetStyle];
        
        if (typeof style === 'function') {
          const dynamicStyle = style({ pressed });
          if (dynamicStyle) {
            baseStyles.push(dynamicStyle as ViewStyle);
          }
        } else if (style) {
          baseStyles.push(style as ViewStyle);
        }
        
        if (pressed) {
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
        
        return baseStyles;
      }}
      // Enhanced accessibility state management
      accessibilityState={{
        busy: !!rest.disabled,
        ...rest.accessibilityState,
      }}
      // Improve focus handling for keyboard navigation
      {...(Platform.OS === 'web' && {
        onFocus: rest.onFocus,
        onBlur: rest.onBlur,
      })}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
