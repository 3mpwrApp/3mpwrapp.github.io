import { useColorScheme } from "react-native";

import { useSettings } from "../store/settings";

import { colors, type Palette } from "./colors";

const highContrastLight: Palette = {
  primary: "#000000", // Pure black for maximum contrast (was #004D40)
  background: "#FFFFFF",
  text: "#000000",
  textSecondary: "#1A1A1A", // Near black for secondary text
  muted: "#000000", // Pure black for maximum contrast (was #1A1A1A)
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#F0F0F0",
  border: "#000000", // Pure black for maximum contrast
  error: "#8B0000", // Very dark red for maximum contrast
  success: "#004D00", // Very dark green for maximum contrast
  warning: "#8B4513", // Dark brown for warning (better than orange for contrast)
  info: "#004D80", // Dark blue for info
};

const highContrastDark: Palette = {
  primary: "#FFFFFF", // Pure white for maximum contrast (was #00E5FF)
  background: "#000000",
  text: "#FFFFFF",
  textSecondary: "#E5E5E5", // Near white for secondary text
  muted: "#FFFFFF", // Pure white for maximum contrast (was #F5F5F5)
  onPrimary: "#000000",
  surface: "#0A0A0A",
  card: "#1A1A1A",
  border: "#FFFFFF", // Pure white for maximum contrast
  error: "#FF0000", // Bright red for dark theme
  success: "#00FF00", // Bright green for dark theme
  warning: "#FFFF00", // Bright yellow for dark theme
  info: "#00CFFF", // Bright cyan for info
};

export function useAppPalette(): Palette {
  const scheme = useColorScheme();
  const { highContrast } = useSettings();
  if (highContrast) {
    return scheme === "dark" ? highContrastDark : highContrastLight;
  }
  return scheme === "dark" ? colors.dark : colors.light;
}

export { Palette };
