import type { TextProps, ViewProps } from 'react-native';
import { Text, View } from 'react-native';

import { useScreenReaderEnabled } from '../hooks/useA11y';

type A11yWrapperProps = ViewProps & {
  /** Semantic role for screen readers */
  semanticRole?: 'main' | 'section' | 'article' | 'navigation' | 'complementary' | 'banner' | 'contentinfo';
  /** Enhanced focus containment */
  focusContainment?: boolean;
  /** Skip links navigation target */
  skipLinkTarget?: string;
  /** Group related elements */
  grouped?: boolean;
};

type A11yTitleProps = TextProps & {
  /** Heading level (1-6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Enhanced focus management */
  focusable?: boolean;
};

type A11yTextProps = TextProps & {
  /** Enhanced text for screen readers */
  enhancedText?: string;
  /** Reading importance */
  importance?: 'high' | 'medium' | 'low';
};

/**
 * Enhanced accessibility wrapper that provides semantic structure
 * and WCAG 2.1 AAA compliance features.
 */
export function A11yWrapper({
  children,
  semanticRole = 'section',
  focusContainment = false,
  skipLinkTarget,
  grouped = false,
  style,
  ...rest
}: A11yWrapperProps) {
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const accessibilityProps = {
    accessibilityRole: semanticRole as any,
    ...(grouped && { accessibilityRole: 'group' as any }),
    ...(skipLinkTarget && { 
      accessibilityLabel: `Navigate to ${skipLinkTarget}`,
      accessibilityHint: 'Double tap to navigate'
    }),
    ...(focusContainment && isScreenReaderEnabled && {
      accessible: true,
      accessibilityViewIsModal: true
    })
  };

  return (
    <View
      style={style}
      {...accessibilityProps}
      {...rest}
    >
      {children}
    </View>
  );
}

/**
 * Accessible title component with proper heading semantics
 */
export function A11yTitle({
  children,
  level = 1,
  focusable = false,
  style,
  ...rest
}: A11yTitleProps) {
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const titleProps = {
    ...rest,
    ...(focusable && isScreenReaderEnabled && {
      accessibilityElementsHidden: false,
      importantForAccessibility: 'yes' as const
    })
  };

  return (
    <Text
      style={style}
      accessibilityRole="header"
      accessible
      accessibilityLabel={`Heading level ${level}: ${typeof children === 'string' ? children : 'content'}`}
      {...titleProps}
    >
      {children}
    </Text>
  );
}

/**
 * Accessible text component with enhanced screen reader support
 */
export function A11yText({
  children,
  enhancedText,
  importance = 'medium',
  style,
  ...rest
}: A11yTextProps) {
  const isScreenReaderEnabled = useScreenReaderEnabled();

  const accessibilityLabel = enhancedText || (typeof children === 'string' ? children : undefined);

  return (
    <Text
      style={style}
      accessible
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={
        importance === 'high' ? 'yes' : 
        importance === 'low' ? 'no-hide-descendants' : 
        'auto'
      }
      {...(isScreenReaderEnabled && {
        accessibilityLiveRegion: importance === 'high' ? 'polite' : 'none'
      })}
      {...rest}
    >
      {children}
    </Text>
  );
}

// Default export for convenience
export default A11yWrapper;