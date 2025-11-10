// Re-export campaigns screen from main campaigns route with error boundary
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';

// Import with try-catch protection
let CampaignsScreenComponent: React.ComponentType<any>;
try {
  CampaignsScreenComponent = require('../campaigns/index').default;
} catch (error) {
  console.error('[CampaignsTab] Failed to import campaigns screen:', error);
  // Fallback component
  CampaignsScreenComponent = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Import Error</Text>
      <Text style={{ fontSize: 14, textAlign: 'center' }}>
        Failed to load campaigns module. Please restart the app.
      </Text>
    </View>
  );
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


