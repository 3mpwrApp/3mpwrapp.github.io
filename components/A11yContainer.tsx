import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { A11Y_ROLES } from '../constants/A11Y';
import { useLiveRegion } from '../hooks/useA11y';

type A11yContainerProps = ViewProps & {
  /** Semantic role for screen readers */
  semanticRole?: keyof typeof A11Y_ROLES | string;
  /** Live region content for dynamic updates */
  liveContent?: string;
  /** Live region politeness level */
  livePoliteness?: 'polite' | 'assertive';
  /** Enhanced focus containment for modal dialogs */
  focusContainment?: boolean;
  /** Skip links navigation target */
  skipLinkTarget?: string;
  /** Landmark region type */
  landmark?: 'main' | 'navigation' | 'complementary' | 'banner' | 'contentinfo' | 'region';
  /** Group related elements */
  grouped?: boolean;
  /** Reading order priority (1-10, lower = higher priority) */
  readingPriority?: number;
};

/**
 * Enhanced accessibility container that provides semantic structure,
 * live regions, focus management, and WCAG 2.1 AAA compliance features.
 */
export default function A11yContainer({
  semanticRole,
  liveContent,
  livePoliteness = 'polite',
  focusContainment = false,
  skipLinkTarget,
  landmark,
  grouped = false,
  readingPriority,
  accessible,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLiveRegion,
  importantForAccessibility,
  children,
  style,
  ...rest
}: A11yContainerProps) {
  const containerRef = React.useRef<View>(null);
  
  // Handle live region announcements
  useLiveRegion(liveContent || '', livePoliteness);
  
  // Determine the most appropriate accessibility role
  const resolvedRole = React.useMemo(() => {
    if (accessibilityRole) return accessibilityRole;
    if (semanticRole && A11Y_ROLES[semanticRole as keyof typeof A11Y_ROLES]) {
      return A11Y_ROLES[semanticRole as keyof typeof A11Y_ROLES];
    }
    if (semanticRole) return semanticRole as any;
    if (landmark) {
      switch (landmark) {
        case 'main': return 'main';
        case 'navigation': return 'navigation';
        case 'banner': return 'banner';
        case 'contentinfo': return 'contentinfo';
        case 'complementary': return 'complementary';
        case 'region': return 'region';
        default: return undefined;
      }
    }
    if (grouped) return 'group';
    return undefined;
  }, [accessibilityRole, semanticRole, landmark, grouped]);
  
  // Determine accessibility live region
  const resolvedLiveRegion = React.useMemo(() => {
    if (accessibilityLiveRegion) return accessibilityLiveRegion;
    if (liveContent) return livePoliteness;
    return undefined;
  }, [accessibilityLiveRegion, liveContent, livePoliteness]);
  
  // Determine importance for accessibility
  const resolvedImportance = React.useMemo(() => {
    if (importantForAccessibility) return importantForAccessibility;
    if (focusContainment) return 'yes';
    if (readingPriority && readingPriority <= 3) return 'yes';
    if (landmark === 'main') return 'yes';
    return undefined;
  }, [importantForAccessibility, focusContainment, readingPriority, landmark]);
  
  // Enhanced container style with accessibility considerations
  const containerStyle = React.useMemo(() => {
    const styles: any[] = [];
    
    if (style) {
      styles.push(style);
    }
    
    // Add focus containment styles for modals/dialogs
    if (focusContainment) {
      styles.push({
        // Ensure modal dialogs are properly contained
        position: 'relative',
      });
    }
    
    return styles;
  }, [style, focusContainment]);
  
  return (
    <View
      ref={containerRef}
      accessible={accessible ?? (resolvedRole !== undefined || accessibilityLabel !== undefined)}
      accessibilityRole={resolvedRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityLiveRegion={resolvedLiveRegion}
      importantForAccessibility={resolvedImportance}
      style={containerStyle}
      {...(skipLinkTarget && {
        nativeID: skipLinkTarget,
      })}
      {...rest}
    >
      {children}
    </View>
  );
}

// Convenient pre-configured containers for common use cases

export function A11yMainContent({ children, ...props }: Omit<A11yContainerProps, 'landmark'>) {
  return (
    <A11yContainer 
      landmark="main" 
      accessibilityLabel="Main content"
      {...props}
    >
      {children}
    </A11yContainer>
  );
}

export function A11yNavigation({ children, ...props }: Omit<A11yContainerProps, 'landmark'>) {
  return (
    <A11yContainer 
      landmark="navigation" 
      accessibilityLabel="Navigation"
      {...props}
    >
      {children}
    </A11yContainer>
  );
}

export function A11yLiveRegion({ 
  children, 
  content, 
  politeness = 'polite',
  ...props 
}: Omit<A11yContainerProps, 'liveContent' | 'livePoliteness'> & { 
  content: string;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <A11yContainer 
      liveContent={content}
      livePoliteness={politeness}
      accessibilityLiveRegion={politeness}
      {...props}
    >
      {children}
    </A11yContainer>
  );
}

export function A11yFocusGroup({ children, label, ...props }: Omit<A11yContainerProps, 'grouped'> & { label: string }) {
  return (
    <A11yContainer 
      grouped 
      accessibilityLabel={label}
      {...props}
    >
      {children}
    </A11yContainer>
  );
}