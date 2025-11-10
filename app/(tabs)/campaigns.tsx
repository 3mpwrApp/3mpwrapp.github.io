// Re-export campaigns screen from main campaigns route with error boundary
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';

// Import with try-catch protection and lazy loading
let CampaignsScreenComponent: React.ComponentType<any> | null = null;
let importError: Error | null = null;

// Attempt dynamic import
try {
  const imported = require('../campaigns/index');
  if (imported && imported.default) {
    CampaignsScreenComponent = imported.default;
  } else {
    throw new Error('Invalid module export - default export not found');
  }
} catch (error) {
  console.error('[CampaignsTab] Failed to import campaigns screen:', error);
  importError = error as Error;
}

class CampaignsTabErrorBoundary extends React.Component<
  { children: React.ReactNode; palette: ReturnType<typeof useAppPalette> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; palette: ReturnType<typeof useAppPalette> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CampaignsTab] Fatal error:', error, errorInfo);
  }

  render() {
    const { palette } = this.props;
    const styles = createStyles(palette);

    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Campaigns Tab Error</Text>
          <Text style={styles.errorMessage}>
            Unable to load campaigns. Please restart the app.
          </Text>
          {this.state.error && (
            <Text style={styles.errorDetail}>{this.state.error.message}</Text>
          )}
          <Pressable
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function CampaignsTab() {
  const palette = useAppPalette();
  
  // If import failed, show error immediately
  if (!CampaignsScreenComponent) {
    return (
      <View style={[createStyles(palette).errorContainer, { padding: 20 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12, color: palette.text }}>
          Import Error
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: palette.textSecondary }}>
          Failed to load campaigns module. Please restart the app.
        </Text>
        {importError && (
          <Text style={{ fontSize: 12, color: palette.error, fontFamily: 'monospace', marginBottom: 16 }}>
            {importError.message}
          </Text>
        )}
        <Pressable
          style={{
            backgroundColor: palette.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
          onPress={() => {
            // Try to reload the module
            try {
              const imported = require('../campaigns/index');
              if (imported && imported.default) {
                CampaignsScreenComponent = imported.default;
                importError = null;
                // Force re-render
                // @ts-ignore
                window.location?.reload?.();
              }
            } catch (err) {
              console.error('[CampaignsTab] Retry failed:', err);
            }
          }}
        >
          <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '600' }}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <CampaignsTabErrorBoundary palette={palette}>
      <CampaignsScreenComponent />
    </CampaignsTabErrorBoundary>
  );
}

const createStyles = (palette: ReturnType<typeof useAppPalette>) => StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: palette.background,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: palette.text,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: palette.textSecondary,
  },
  errorDetail: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: palette.error,
    marginBottom: 20,
    padding: 12,
    backgroundColor: palette.card,
    borderRadius: 8,
  },
  errorButton: {
    backgroundColor: palette.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: palette.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
});


