import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

import GapView from './GapView';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Global Error Boundary to catch unhandled React errors
 * Prevents white screen of death and provides user-friendly error UI
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // TODO: Log to Sentry in production if enabled
    // if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: { errorInfo } });
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// Fallback palette constants for when context is unavailable
// Colors updated for WCAG AA compliance (minimum 4.5:1 contrast ratio)
/* eslint-disable no-restricted-syntax */
const FALLBACK_PALETTE = {
  background: '#FFFFFF' as const,
  surface: '#F0F0F0' as const, // Slightly darker for better contrast (was #F5F5F5)
  text: '#000000' as const,
  onPrimary: '#FFFFFF' as const,
  primary: '#0051C3' as const, // Darker blue for AA compliance (was #007AFF, ratio 4.02)
  muted: '#757575' as const, // Much darker gray for AA compliance (was #CCCCCC, ratio 1.61)
};
/* eslint-enable no-restricted-syntax */

/**
 * Basic error fallback without context dependencies (for early app initialization errors)
 */
function ErrorFallbackBasic({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const styles = createStyles(FALLBACK_PALETTE as any);
  
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        accessibilityRole="alert"
        accessibilityLabel="Error occurred"
      >
        <Text style={styles.emoji} accessibilityLabel="Error icon">⚠️</Text>
        <Text style={styles.title} accessibilityRole="header">Something Went Wrong</Text>
        <Text style={styles.message}>
          The app encountered an unexpected error. Please restart the app.
        </Text>
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
            <Text style={styles.errorText}>{error.toString()}</Text>
          </View>
        )}
        <Pressable
          style={[styles.button, styles.primaryButton, { backgroundColor: FALLBACK_PALETTE.primary }]}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={[styles.buttonText, { color: FALLBACK_PALETTE.onPrimary }]}>Try Again</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/**
 * Error fallback UI component wrapper that handles missing context
 */
class ErrorFallbackSafe extends React.Component<
  { error: Error | null; onReset: () => void },
  { hasContextError: boolean }
> {
  constructor(props: { error: Error | null; onReset: () => void }) {
    super(props);
    this.state = { hasContextError: false };
  }

  componentDidCatch() {
    this.setState({ hasContextError: true });
  }

  render() {
    if (this.state.hasContextError) {
      return <ErrorFallbackBasic error={this.props.error} onReset={this.props.onReset} />;
    }
    return <ErrorFallbackWithContext error={this.props.error} onReset={this.props.onReset} />;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return <ErrorFallbackSafe error={error} onReset={onReset} />;
}

/**
 * Error fallback with full context support
 */
function ErrorFallbackWithContext({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const palette = useAppPalette();
  const router = useRouter();
  const styles = createStyles(palette);

  const handleGoHome = () => {
    onReset();
    router.replace('/(tabs)');
  };

  const handleReload = () => {
    onReset();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        accessibilityRole="alert"
        accessibilityLabel="Error occurred"
      >
        <Text style={styles.emoji} accessibilityLabel="Error icon">⚠️</Text>
        
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          Something Went Wrong
        </Text>
        
        <Text style={styles.message}>
          The app encountered an unexpected error. Don't worry — your data is safe.
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
            <Text style={styles.errorText}>{error.toString()}</Text>
            {error.stack && (
              <Text style={styles.stackText}>{error.stack}</Text>
            )}
          </View>
        )}

        <GapView style={styles.buttonContainer} gap={12}>
          <Pressable
            style={[styles.button, styles.primaryButton, { backgroundColor: palette.primary }]}
            onPress={handleReload}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Attempts to reload the current screen"
          >
            <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
              Try Again
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton, { borderColor: palette.primary }]}
            onPress={handleGoHome}
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
            accessibilityHint="Returns to the main home screen"
          >
            <Text style={[styles.buttonText, { color: palette.primary }]}>
              Go to Home
            </Text>
          </Pressable>
        </GapView>

        <Text style={styles.supportText}>
          If this problem persists, please contact support with the error details above.
        </Text>
      </ScrollView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: palette.text,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
      opacity: 0.8,
    },
    errorDetails: {
      width: '100%',
      backgroundColor: palette.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: palette.text,
      fontFamily: 'monospace',
      marginBottom: 8,
    },
    stackText: {
      fontSize: 10,
      color: palette.text,
      fontFamily: 'monospace',
      opacity: 0.7,
    },
    buttonContainer: {
      width: '100%',
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    primaryButton: {
      shadowColor: palette.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    supportText: {
      fontSize: 14,
      color: palette.text,
      textAlign: 'center',
      marginTop: 24,
      opacity: 0.6,
      lineHeight: 20,
    },
  });
}

export default ErrorBoundary;
