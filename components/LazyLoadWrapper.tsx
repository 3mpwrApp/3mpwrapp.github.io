/**
 * LazyLoadWrapper - Accessible lazy loading component with proper loading states
 * 
 * Wraps lazy-loaded components with Suspense and provides:
 * - Screen reader announcements for loading/loaded states
 * - Visual loading indicator
 * - Error boundary fallback
 * - Proper accessibility labels
 */

import React, { Suspense, type ComponentType } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAnnounceOnMount } from "../hooks/useA11y";
import { useTranslation } from "../i18n";
import { useAppPalette } from "../theme/usePalette";

interface LazyLoadWrapperProps {
  /** The lazy-loaded component */
  component: React.LazyExoticComponent<ComponentType<any>>;
  /** Props to pass to the lazy-loaded component */
  componentProps?: Record<string, any>;
  /** Optional custom loading message */
  loadingMessage?: string;
  /** Optional custom error message */
  errorMessage?: string;
}

/**
 * Loading fallback component with accessibility support
 */
function LoadingFallback({ message }: { message?: string }) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const loadingText = message || t("common.loading", "Loading...");
  
  // Announce loading state to screen readers
  useAnnounceOnMount(loadingText);

  return (
    <View 
      style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel={loadingText}
      accessible={true}
    >
      <ActivityIndicator 
        size="large" 
        color={palette.primary}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      />
      <Text 
        style={[styles.text, { color: palette.text }]}
        accessibilityLiveRegion="polite"
      >
        {loadingText}
      </Text>
    </View>
  );
}

/**
 * Error fallback component
 */
function ErrorFallback({ message }: { message?: string }) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const errorText = message || t("common.error_loading", "Error loading content");

  return (
    <View 
      style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityRole="alert"
      accessibilityLabel={errorText}
      accessible={true}
    >
      <Text style={[styles.text, styles.errorText, { color: palette.error }]}>
        {errorText}
      </Text>
    </View>
  );
}

/**
 * Simple error boundary for lazy-loaded components
 */
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[LazyLoadWrapper] Error loading component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Wrapper component for lazy-loaded components with accessibility support
 */
export default function LazyLoadWrapper({
  component: LazyComponent,
  componentProps = {},
  loadingMessage,
  errorMessage,
}: LazyLoadWrapperProps) {
  return (
    <LazyLoadErrorBoundary fallback={<ErrorFallback message={errorMessage} />}>
      <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
        <LazyComponent {...componentProps} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
