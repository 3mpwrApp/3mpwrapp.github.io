import { useColorScheme } from "react-native";
import { useA11ySettings } from "../store/a11ySettings";
import { colors, type Palette } from "./colors";

export function usePalette(): Palette {
  const scheme = useColorScheme();
  const { state } = useA11ySettings();
  const base = scheme === "dark" ? colors.dark : colors.light;
  if (!state.highContrast) return base;
  // High contrast adjustments
  return {
    ...base,
    background: scheme === "dark" ? "#000000" : "#FFFFFF",
    text: scheme === "dark" ? "#FFFFFF" : "#000000",
    muted: scheme === "dark" ? "#FFFFFF" : "#000000",
    primary: base.primary,
    onPrimary: base.onPrimary,
    surface: base.surface,
  };
}

