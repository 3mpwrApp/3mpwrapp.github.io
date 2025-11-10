// Re-export campaigns screen from main campaigns route with error boundary
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Lazy load to prevent module evaluation crashes
const CampaignsScreen = React.lazy(() => import('../campaigns/index'));

class CampaignsTabErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
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
  return (
    <CampaignsTabErrorBoundary>
      <React.Suspense
        fallback={
          <View style={styles.loadingContainer}>
            <Text>Loading Campaigns...</Text>
          </View>
        }
      >
        <CampaignsScreen />
      </React.Suspense>
    </CampaignsTabErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#555',
  },
  errorDetail: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#8B0000',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  errorButton: {
    backgroundColor: '#003D34',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

