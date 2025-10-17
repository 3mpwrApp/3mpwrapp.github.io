import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingSpinner({
  size = 'large',
  color,
}: LoadingSpinnerProps) {
  const defaultColor = useThemeColor({}, 'text');
  const spinnerColor = color || defaultColor;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
