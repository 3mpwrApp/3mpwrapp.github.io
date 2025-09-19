import { useColorScheme } from "react-native";
import { useSettings } from "../store/settings";
import { colors, type Palette } from "./colors";

const highContrastLight: Palette = {
  primary: "#004D40",
  background: "#FFFFFF",
  text: "#000000",
  muted: "#1A1A1A",
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#F0F0F0",
  error: "#B00020",
  success: "#1B5E20",
  warning: "#E65100",
};

const highContrastDark: Palette = {
  primary: "#00E5FF",
  background: "#000000",
  text: "#FFFFFF",
  muted: "#F5F5F5",
  onPrimary: "#000000",
  surface: "#0A0A0A",
  card: "#1A1A1A",
  error: "#FF5252",
  success: "#00C853",
  warning: "#FFAB40",
};

export function useAppPalette(): Palette {
  const scheme = useColorScheme();
  const { highContrast } = useSettings();
  if (highContrast) {
    return scheme === "dark" ? highContrastDark : highContrastLight;
  }
  return scheme === "dark" ? colors.dark : colors.light;
}
