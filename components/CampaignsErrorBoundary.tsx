import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors } from '../theme/colors';
import { logger } from '../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class CampaignsErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[CampaignsErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <CampaignsErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function CampaignsErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? colors.dark : colors.light;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      padding: 20,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: palette.error,
    },
    icon: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
    },
    errorText: {
      fontSize: 13,
      color: palette.error,
      fontFamily: 'monospace',
      marginBottom: 20,
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    helpText: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.6,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Campaigns Tab Error</Text>
          <Text style={styles.message}>
            The campaigns tab encountered an unexpected error. This may be due to a network issue, corrupted data, or a temporary glitch.
          </Text>
          
          {error && (
            <Text style={styles.errorText} numberOfLines={5}>
              {error.toString()}
            </Text>
          )}

          <Pressable onPress={onReset} style={styles.button}>
            <Text style={styles.buttonText}>🔄 Try Again</Text>
          </Pressable>

          <Text style={styles.helpText}>
            If this issue persists, try:
            {'\n'}• Restarting the app
            {'\n'}• Checking your internet connection
            {'\n'}• Clearing app data and signing in again
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
