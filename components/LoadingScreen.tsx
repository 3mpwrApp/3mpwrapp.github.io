import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const spinnerColor = useThemeColor({}, 'text');

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading content'}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={spinnerColor} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
});
