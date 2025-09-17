import { useColorScheme } from "react-native";
import { colors, type Palette } from "./colors";
import { useSettings } from "../store/settings";

const highContrastLight: Palette = {
  primary: "#004D40",
  background: "#FFFFFF",
  text: "#000000",
  muted: "#1A1A1A",
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
};

const highContrastDark: Palette = {
  primary: "#00E5FF",
  background: "#000000",
  text: "#FFFFFF",
  muted: "#F5F5F5",
  onPrimary: "#000000",
  surface: "#0A0A0A",
};

export function useAppPalette(): Palette {
  const scheme = useColorScheme();
  const { highContrast } = useSettings();
  if (highContrast) {
    return scheme === "dark" ? highContrastDark : highContrastLight;
  }
  return scheme === "dark" ? colors.dark : colors.light;
}
