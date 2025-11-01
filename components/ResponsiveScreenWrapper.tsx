/**
 * ResponsiveScreenWrapper - Ensures all screens are properly laid out
 * 
 * Features:
 * - Auto-adjusts to device dimensions
 * - Proper SafeAreaView integration
 * - ScrollView with keyboard handling
 * - Consistent padding and spacing
 * - Performance optimized with React.memo
 */

import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
    type ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRefreshWithUpdates } from '../hooks/useRefreshWithUpdates';
import { useAppPalette } from '../theme/usePalette';

interface ResponsiveScreenWrapperProps {
  children: React.ReactNode;
  /** Enable ScrollView (default: true) */
  scrollable?: boolean;
  /** Keyboard avoidance behavior (default: 'padding') */
  keyboardBehavior?: 'padding' | 'height' | 'position';
  /** Custom content container style */
  contentContainerStyle?: ViewStyle;
  /** Disable safe area (default: false) */
  noSafeArea?: boolean;
  /** Add padding to content (default: true) */
  padded?: boolean;
  /** Test ID for automation */
  testID?: string;
  /** Enable pull-to-refresh (default: true) */
  refreshable?: boolean;
  /** Custom refresh handler (default: checks for updates) */
  onRefresh?: () => Promise<void> | void;
  /** Disable automatic update checking on refresh (default: false) */
  disableUpdateCheck?: boolean;
}

const ResponsiveScreenWrapper = React.memo<ResponsiveScreenWrapperProps>(
  ({
    children,
    scrollable = true,
    keyboardBehavior = 'padding',
    contentContainerStyle,
    noSafeArea = false,
    padded = true,
    testID,
    refreshable = true,
    onRefresh,
    disableUpdateCheck = false,
  }) => {
    const palette = useAppPalette();

    // Setup pull-to-refresh with update checking
    const { refreshing, refresh } = useRefreshWithUpdates({
      onRefresh,
      checkForUpdates: refreshable && !disableUpdateCheck,
    });

    const containerStyle: ViewStyle = {
      flex: 1,
      backgroundColor: palette.background,
    };

    const contentStyle: ViewStyle = {
      ...(padded && { padding: 16 }),
      paddingBottom: 40, // Ensure content is fully scrollable
      ...contentContainerStyle,
    };

    const renderContent = () => {
      if (scrollable) {
        return (
          <ScrollView
            style={containerStyle}
            contentContainerStyle={contentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            testID={testID ? `${testID}-scrollview` : undefined}
            refreshControl={
              refreshable ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refresh}
                  tintColor={palette.primary}
                  colors={[palette.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        );
      }

      return (
        <View style={[containerStyle, contentStyle]} testID={testID}>
          {children}
        </View>
      );
    };

    const content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? keyboardBehavior : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    );

    if (noSafeArea) {
      return content;
    }

    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        {content}
      </SafeAreaView>
    );
  }
);

ResponsiveScreenWrapper.displayName = 'ResponsiveScreenWrapper';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});

export default ResponsiveScreenWrapper;
