import { Platform } from 'react-native';

// True when running on web (RNW or tests/jsdom)
export const isWeb = (Platform as any)?.OS ? Platform.OS === 'web' : true;

// Only apply the given props on native platforms
export function nativeOnly<T extends object>(props: T): T | {} {
  return isWeb ? {} : props;
}

// Guard accessibility live region prop for native only
export function a11yLiveRegion(value: 'none' | 'polite' | 'assertive') {
  return nativeOnly({ accessibilityLiveRegion: value });
}

// Guard max font size multiplier for native only
export function maxFontScale(n: number) {
  return nativeOnly({ maxFontSizeMultiplier: n });
}

// Guard placeholderTextColor/returnKeyType for TextInput
export function textInputNativeProps(props: { placeholderTextColor?: string; returnKeyType?: any }) {
  return nativeOnly(props);
}
