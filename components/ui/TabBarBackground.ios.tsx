import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

// Simple shim that avoids depending on @react-navigation
export function useBottomTabOverflow() {
  return 0;
}
